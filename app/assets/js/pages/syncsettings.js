// Ajustes → Sincronización (solo en la aplicación). Ver local/syncer.js.
//
// Se sincronizan siempre TODOS los proyectos: conectarse a otro equipo quiere decir tener los
// mismos proyectos que él, y lo que se cambia en uno llega al otro solo. Tres pestañas:
//  - «Conectar con otro equipo»: dos recuadros al mismo nivel, el servidor WebDAV y otro equipo
//    con Creabel (escaneando su QR o escribiendo su dirección y código).
//  - «Compartir este equipo» (solo en el PC): la casilla para que los demás se conecten a este y
//    lo imprescindible para hacerlo (QR, dirección y código). El botón del cortafuegos sale solo
//    si de verdad está bloqueando; lo demás, plegado.
//  - «Conexiones establecidas»: cada conexión con su tipo, su estado, sus proyectos y los
//    botones Sincronizar, Probar y Desconectar.
// Las explicaciones van bajo un «?», para quien las quiera. En Android no hay «Compartir». La
// pestaña abierta va en la dirección (#/settings/sync?tab=…), así que se conserva al volver.
import { h, clear, icon } from '../dom.js';
import { t, tr } from '../i18n.js';
import { btn, toast, modal, confirmDialog, errorText, tabs, helpToggle } from '../ui.js';
import { formatTimestamp } from '../text.js';
import { isDesktopApp, isAndroid } from '../platform.js';
import { localEngine } from '../api.js';
import {
  syncConfig, saveSyncConfig, syncStatus, onSyncStatus, syncNow, localProjects,
  webdavFor, setHub, renewHubCode, pairingInfo, parsePairing, addPeer, savePeer, removePeer, scanCode, cleanCode, HUB_PORT,
  probePeer, probeHub, networkProfiles, firewallStatus, allowInFirewall, cameraPermission, requestCameraPermission, openAppSettings,
  localNetworkState, requestLocalNetwork, openAndroidSettings, isLocalHost,
} from '../local/syncer.js';

/** Texto de un error de sincronización. */
export function syncErrorText(err) {
  const code = err && err.code;
  if (code === 'sync_auth') return t('sync.error.auth');
  if (code === 'sync_local_network') return t('sync.error.localNetwork');
  if (code === 'sync_network') return t('sync.error.network') + (err.detail ? ' ' + t('sync.error.detail', { detail: err.detail }) : '');
  if (code === 'sync_unavailable') return t('sync.error.unavailable');
  if (code === 'hub') return t('sync.error.hub', { message: err.message || '' });
  return t('sync.error.other', { message: (err && err.message) || errorText(err) });
}

const stamp = (iso) => (iso ? formatTimestamp(iso.slice(0, 19).replace('T', ' ')) : '');
const hostOfUrl = (url) => { try { return new URL(url).hostname; } catch (err) { return ''; } };

/**
 * En Android 17: el permiso de red local, pedido al usarla. Si nunca se ha preguntado, sale
 * directamente el aviso de Android; si se dijo que no una vez, antes se explica para qué; si
 * está denegado para siempre, se ofrece abrir los ajustes. Devuelve si se puede usar la red.
 */
export async function needLocalNetwork() {
  let state = localNetworkState();
  if (state === 'granted') return true;
  if (state === 'prompt-with-rationale' && !(await confirmDialog(t('sync.lanWhy'), { title: t('sync.lanTitle'), confirmLabel: t('sync.cameraContinue') }))) return false;
  // También si estaba denegado: Android puede volver a preguntar (y, si no, responde enseguida).
  state = await requestLocalNetwork();
  if (state === 'granted') return true;
  if (await confirmDialog(t('sync.lanDenied'), { title: t('sync.lanTitle'), confirmLabel: t('sync.openSettings') })) openAndroidSettings();
  return false;
}

/** Qué pasa con una dirección de un equipo emparejado (resultado de probePeer). */
function probeText(r) {
  if (r.reason === 'permission') return t('sync.error.localNetwork');
  const found = r.found ? t('sync.probeFound') + ' · ' : '';
  if (r.ok) return found + (r.projects && r.projects.length ? t('sync.probeShares', { list: r.projects.join(', ') }) : t('sync.probeSharesNone'));
  if (r.reason === 'refused' || r.reason === 'timeout' || r.reason === 'unreachable' || r.reason === 'auth') return found + t('sync.probe.' + r.reason);
  return found + r.detail;
}

const subnet = (ip) => String(ip || '').split('.').slice(0, 3).join('.');

/**
 * Las líneas del resultado de «Probar»: una por dirección y, si no responde ninguna, lo que se
 * ha buscado y en qué red está este dispositivo (para ver si no están en la misma).
 */
function probeLines(probe, peer) {
  const port = Number(peer.port) || HUB_PORT;
  const lines = probe.results.map((r) => ({ ok: r.ok, text: `${r.host}:${port} · ${probeText(r)}` }));
  if (probe.results.some((r) => r.ok) || probe.results.some((r) => r.reason === 'permission')) return lines;
  if (probe.searched && !probe.results.some((r) => r.found)) lines.push({ ok: false, text: t('sync.notFound') });
  if (probe.localIp) {
    const same = (peer.hosts || []).some((x) => subnet(x) === subnet(probe.localIp));
    lines.push({ ok: false, text: same ? t('sync.thisDevice', { ip: probe.localIp }) : t('sync.otherNetwork', { ip: probe.localIp }) });
  }
  lines.push({ ok: false, text: t('sync.probeHelp') });
  return lines;
}

/**
 * El diálogo del cortafuegos de Windows. Si alguna red está como Pública, el usuario elige:
 * marcarla como Privada (lo normal en casa) o permitir también las redes públicas.
 * Devuelve las opciones para allowInFirewall o null si cancela.
 */
function firewallDialog(publicNets) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (choice) => { done = true; m.close(); resolve(choice); };
    const names = publicNets.map((n) => n.name || n.alias).join(', ');
    const actions = [btn(t('common.cancel'), { onClick: () => m.close() })];
    if (publicNets.length) {
      actions.push(btn(t('sync.firewallPublicToo'), { onClick: () => finish({ publicToo: true }) }));
      actions.push(btn(t('sync.firewallMakePrivate'), { kind: 'primary', onClick: () => finish({ makePrivate: publicNets.map((n) => n.alias).filter(Boolean) }) }));
    } else {
      actions.push(btn(t('sync.firewallAllow'), { kind: 'primary', onClick: () => finish({}) }));
    }
    const m = modal({
      title: t('sync.firewallTitle'),
      body: [h('p.modal-text', t('sync.firewallIntro')), publicNets.length ? h('p.notice.small', t('sync.firewallPublic', { name: names })) : null],
      actions,
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

/** Un recuadro con su título (y un icono) y, a la derecha, el «?» con su explicación. */
function box(iconName, title, help, ...content) {
  const toggle = helpToggle(help);
  return h('section.panel.sync-box',
    h('div.sync-box-head', h('h3', icon(iconName, 19), h('span', title)), toggle.button),
    toggle.panel,
    ...content.filter(Boolean));
}

export function syncSection({ query = {} }) {
  const eng = localEngine();
  if (!eng) return [h('section.panel', h('p.muted', t('sync.unavailable')))];
  const guard = async (fn) => { try { await fn(); } catch (err) { toast(syncErrorText(err), 'error', 8000); } };
  const input = (value, attrs = {}) => { const el = h('input.input', { type: 'text', ...attrs }); el.value = value == null ? '' : value; return el; };
  const row = (label, control) => h('label.form-row', h('span.form-label', label), control);

  // ---------- Pestañas ----------
  const TABS = isDesktopApp ? ['connect', 'share', 'connections'] : ['connect', 'connections'];
  const first = () => {
    const cfg = syncConfig();
    if (cfg.peers.length || (cfg.webdav.enabled && cfg.webdav.url)) return 'connections';
    return isDesktopApp && cfg.hub.enabled ? 'share' : 'connect';
  };
  let tab = TABS.includes(query.tab) ? query.tab : first();
  const tabsBox = h('div.sync-tabs');
  const body = h('div.sync-body');
  const drawTabs = () => {
    clear(tabsBox);
    tabsBox.append(tabs(TABS.map((key) => ({ key, label: t('sync.tab.' + key) })), tab, show));
  };
  const drawBody = () => {
    clear(body);
    const parts = tab === 'share' ? shareTab() : tab === 'connections' ? connectionsTab() : connectTab();
    body.append(...parts.filter(Boolean));
  };
  function show(key) {
    tab = key;
    // En la dirección, sin volver a pintar la página: si se refresca, se queda en esta pestaña.
    try { history.replaceState(null, '', '#/settings/sync?tab=' + key); } catch (err) { /* sin historial */ }
    drawTabs();
    drawBody();
  }

  // ---------- Conectar con otro equipo ----------

  // «Probar» un equipo emparejado, en un diálogo.
  const probeDialog = async (peer, intro) => {
    await needLocalNetwork();
    const list = h('ul.sync-probe', h('li.muted', t('sync.probing')));
    const m = modal({
      title: t('sync.probeTitle', { name: peer.name }),
      body: [intro ? h('p.modal-text', intro) : null, list],
      actions: [btn(t('common.close'), { kind: 'primary', onClick: () => m.close() })],
    });
    const result = await probePeer(peer);
    clear(list);
    for (const line of probeLines(result, peer)) list.append(h('li', { class: line.ok ? 'is-ok' : 'is-error' }, line.text));
    if (tab === 'connections') drawBody();
    return result;
  };

  // Recién conectado: se sincroniza ya, se dice qué proyectos han quedado al día y se pasa a
  // «Conexiones establecidas».
  const afterConnect = async (key, name) => {
    show('connections');
    toast(t('sync.connectedFetching', { name }), 'info', 4000);
    const s = await syncNow({ target: key });
    const err = s.errors && s.errors[key];
    if (err) { toast(syncErrorText(err), 'error', 10000); return; }
    const names = localProjects().map((p) => p.name);
    toast(names.length ? t('sync.connectedDone', { list: names.join(', ') }) : t('sync.connectedEmpty'), 'success', 9000);
  };

  const pair = async (peer) => {
    // Android 17: sin el permiso de red local no se puede llegar al equipo.
    await needLocalNetwork();
    toast(t('sync.pairing', { name: peer.name }), 'info', 3000);
    try {
      await addPeer(peer);
    } catch (err) {
      if (err.code === 'sync_auth') { toast(t('sync.probe.auth'), 'error', 10000); return; }
      if (err.code !== 'sync_network' && err.code !== 'sync_local_network') { toast(syncErrorText(err), 'error', 10000); return; }
      // No responde ahora: se guarda igualmente (Creabel lo seguirá buscando en cada
      // sincronización, también si cambia de dirección) y se dice qué pasa con cada dirección.
      await savePeer(peer);
      show('connections');
      await probeDialog(peer, t('sync.pairSavedOffline', { name: peer.name }));
      return;
    }
    await afterConnect('peer:' + peer.id, peer.name);
  };
  const scan = () => guard(async () => {
    // Primero el permiso de la cámara: Android pregunta con su aviso; si se dijo que no una vez,
    // antes se explica para qué; si se denegó para siempre, se ofrece abrir los ajustes.
    let state = await cameraPermission();
    if (state === 'prompt-with-rationale' && !(await confirmDialog(t('sync.cameraWhy'), { title: t('sync.cameraTitle'), confirmLabel: t('sync.cameraContinue') }))) return;
    if (state !== 'granted' && state !== 'unknown') state = await requestCameraPermission();
    if (state !== 'granted' && state !== 'unknown') {
      if (await confirmDialog(t('sync.cameraDenied'), { title: t('sync.cameraTitle'), confirmLabel: t('sync.openSettings') })) await openAppSettings();
      return;
    }
    const text = await scanCode();
    if (!text) return;
    const peer = parsePairing(text);
    if (!peer) { toast(t('sync.badCode'), 'error'); return; }
    await pair(peer);
  });

  function connectTab() {
    const w = syncConfig().webdav;
    // Servidor WebDAV
    const url = input(w.url, { type: 'url', placeholder: 'https://servidor.ejemplo:5006/webdav', autocomplete: 'off', spellcheck: 'false' });
    const user = input(w.user, { autocomplete: 'off', spellcheck: 'false' });
    const password = input(w.password, { type: 'password', autocomplete: 'new-password' });
    const root = input(w.root || 'creabel', { spellcheck: 'false' });
    const insecure = h('input', { type: 'checkbox' });
    insecure.checked = !!w.insecure;
    const warn = h('p.notice.small', t('sync.insecureWarn'));
    const showWarn = () => { warn.hidden = !insecure.checked; };
    insecure.addEventListener('change', showWarn);
    showWarn();
    const connectWebdav = () => guard(async () => {
      const settings = { enabled: true, url: url.value.trim(), user: user.value.trim(), password: password.value, root: root.value.trim().replace(/^\/+|\/+$/g, ''), insecure: insecure.checked };
      if (!settings.url) { toast(t('sync.urlMissing'), 'error'); url.focus(); return; }
      if (isLocalHost(hostOfUrl(settings.url))) await needLocalNetwork();
      try {
        await webdavFor(settings).check();
      } catch (err) {
        if (!(await confirmDialog(t('sync.webdavFailed', { error: syncErrorText(err) }), { confirmLabel: t('sync.saveAnyway') }))) return;
        await saveSyncConfig({ webdav: settings });
        show('connections');
        return;
      }
      await saveSyncConfig({ webdav: settings });
      await afterConnect('webdav', t('sync.target.webdav'));
    });

    // Otro equipo con Creabel
    const address = input('', { placeholder: '192.168.1.20:' + HUB_PORT, autocomplete: 'off', spellcheck: 'false' });
    const code = input('', { placeholder: 'XXXX-XXXX-XXXX-XXXX-XXXX', autocomplete: 'off', spellcheck: 'false' });
    const name = input(t('sync.peerDefault'), { maxlength: 60 });
    const connectTyped = () => guard(async () => {
      const m = /^\s*([^:\s]+)(?::(\d+))?\s*$/.exec(address.value);
      if (!m || cleanCode(code.value).length < 12) { toast(t('sync.badCode'), 'error'); return; }
      await pair({ id: 'm' + cleanCode(code.value).slice(0, 7), name: name.value.trim() || m[1], hosts: [m[1]], port: Number(m[2]) || HUB_PORT, token: cleanCode(code.value) });
    });

    return [
      box('server', t('sync.webdav'), t('sync.help.webdav'),
        row(t('sync.url'), url),
        row(t('sync.user'), user),
        row(t('sync.password'), password),
        row(t('sync.root'), root),
        h('label.form-check', insecure, h('span', t('sync.insecure'))),
        warn,
        h('div.btn-row', btn(t('sync.connect'), { kind: 'primary', onClick: connectWebdav }))),
      box('monitor', t('sync.peerBox'), t(isAndroid ? 'sync.help.peerAndroid' : 'sync.help.peer'),
        isAndroid ? h('div.btn-row', btn(t('sync.add.scan'), { icon: 'qr', kind: 'primary', onClick: scan })) : null,
        isAndroid ? h('p.sync-or', t('sync.orType')) : null,
        row(t('sync.address'), address),
        row(t('sync.code'), code),
        row(t('sync.peerName'), name),
        h('div.btn-row', btn(t('sync.connect'), { kind: isAndroid ? 'default' : 'primary', onClick: connectTyped }))),
    ];
  }

  // ---------- Conexiones establecidas ----------

  // El estado de una conexión: sincronizando, al día (y cuándo) o el error.
  const stateOf = (key, s) => {
    if (s.running === true || s.running === key) return h('p.sync-state', icon('sync', 15), t('sync.running'));
    const err = s.errors[key];
    if (err) return h('p.sync-state.is-error', syncErrorText(err));
    const ok = s.results[key];
    return h('p.sync-state' + (ok ? '.is-ok' : ''), ok ? t('sync.conn.ok', { when: stamp(ok.at) }) : t('sync.never'));
  };

  function connectionsTab() {
    const cfg = syncConfig();
    const s = syncStatus();
    const names = localProjects().map((p) => p.name);
    const lan = isAndroid ? localNetworkState() : 'granted';
    const card = ({ key, iconName, type, title, sub, actions }) => {
      const err = s.errors[key];
      return h('div.sync-card',
        h('div.sync-card-head', h('span.sync-conn-icon', icon(iconName, 22)),
          h('div', h('span.sync-card-type', type), h('strong', title), sub ? h('p.muted.small', sub) : null)),
        stateOf(key, s),
        !err && s.results[key] ? h('p.small', names.length ? t('sync.conn.projects', { list: names.join(', ') }) : t('sync.conn.noProjects')) : null,
        h('div.btn-row',
          err && err.code === 'sync_local_network'
            ? btn(t('sync.lanGrant'), { small: true, kind: 'primary', onClick: () => guard(async () => { if (await needLocalNetwork()) await syncNow({ target: key }); }) })
            : btn(t('sync.syncOne'), { icon: 'sync', small: true, kind: 'primary', onClick: () => guard(async () => { await syncNow({ target: key }); }) }),
          ...actions));
    };
    const cards = [];
    for (const p of cfg.peers) {
      cards.push(card({
        key: 'peer:' + p.id, iconName: 'monitor', type: t('sync.conn.peer'), title: p.name, sub: p.hosts.join(', '),
        actions: [
          btn(t('sync.probe'), { small: true, onClick: () => guard(() => probeDialog(p)) }),
          btn(t('sync.disconnect'), { small: true, kind: 'ghost', onClick: async () => {
            if (!(await confirmDialog(t('sync.disconnectConfirm', { name: p.name }), { danger: true, confirmLabel: t('sync.disconnect') }))) return;
            await guard(async () => { await removePeer(p.id); drawBody(); });
          } }),
        ],
      }));
    }
    const w = cfg.webdav;
    if (w.url && w.enabled) {
      cards.push(card({
        key: 'webdav', iconName: 'server', type: t('sync.target.webdav'), title: hostOfUrl(w.url) || w.url, sub: [w.url, w.user].filter(Boolean).join(' · '),
        actions: [
          btn(t('common.edit'), { small: true, onClick: () => show('connect') }),
          btn(t('sync.disconnect'), { small: true, kind: 'ghost', onClick: async () => {
            if (!(await confirmDialog(t('sync.disconnectConfirm', { name: t('sync.target.webdav') }), { danger: true, confirmLabel: t('sync.disconnect') }))) return;
            await guard(async () => {
              await saveSyncConfig({ webdav: { ...syncConfig().webdav, enabled: false, url: '', user: '', password: '' } });
              drawBody();
            });
          } }),
        ],
      }));
    }
    return [box('link', t('sync.tab.connections'), t('sync.help.connections'),
      lan !== 'granted' && cfg.peers.length ? h('div.notice.small', t('sync.error.localNetwork'), ' ',
        btn(t('sync.lanGrant'), { small: true, kind: 'primary', onClick: () => guard(async () => { if (await needLocalNetwork()) { drawBody(); await syncNow(); } }) })) : null,
      cards.length
        ? h('div.sync-cards', cards)
        : h('div', h('p.muted', t('sync.noConnections')), h('div.btn-row', btn(t('sync.tab.connect'), { icon: 'plus', kind: 'primary', onClick: () => show('connect') }))))];
  }

  // ---------- Compartir este equipo (solo en el PC) ----------
  const pairBox = h('div.sync-pair');
  const hubState = h('div');
  const firewallBox = h('div');
  const drawHubState = (s = syncStatus()) => {
    clear(hubState);
    // Solo si algo va mal: si va bien, no hace falta decir nada.
    if (syncConfig().hub.enabled && s.errors.hub) hubState.append(stateOf('hub', s));
  };
  const allowFirewall = (publicNets) => guard(async () => {
    const choice = await firewallDialog(publicNets);
    if (!choice) return;
    toast(t('sync.firewallWorking'), 'info', 5000);
    const result = await allowInFirewall(choice);
    if (result === 'ok') { toast(t('sync.firewallOk'), 'success', 10000); await drawHub(); }
    else toast(t(result === 'cancelled' ? 'sync.firewallCancelled' : 'sync.firewallFailed'), 'error', 12000);
  });
  // El botón del cortafuegos, a la vista solo si de verdad está bloqueando a Creabel.
  const drawFirewall = async () => {
    clear(firewallBox);
    if (!syncConfig().hub.enabled) return;
    const fw = await firewallStatus();
    if (!fw.blocked.length) return;
    const publicNets = fw.blocked.filter((n) => n.category === 'public');
    firewallBox.append(h('div.notice.small.sync-firewall',
      h('p', t('sync.firewallBlocked', { list: fw.blocked.map((n) => `${n.name || n.alias} (${t('sync.net.' + (n.category || 'unknown'))})`).join(', ') })),
      h('div.btn-row', btn(t('sync.firewallButton'), { icon: 'shield', kind: 'primary', onClick: () => allowFirewall(publicNets) }))));
  };
  const drawHub = async () => {
    clear(pairBox);
    const cfg = syncConfig();
    drawFirewall().catch((err) => console.warn(err));
    if (!cfg.hub.enabled) return;
    const [info, nets] = await Promise.all([pairingInfo(), networkProfiles()]);
    if (!syncConfig().hub.enabled) return;
    const publicNets = nets.filter((n) => n.category === 'public');
    const where = (a) => `${a.ip}:${info.port}` + (a.name ? ` (${a.name})` : '');
    const main = info.addresses[0];
    const name = input(cfg.name, { maxlength: 60 });
    name.addEventListener('change', () => guard(async () => {
      await saveSyncConfig({ name: name.value.trim() || syncConfig().name });
      await drawHub(); // el QR lleva el nombre
    }));
    clear(pairBox);
    pairBox.append(
      // Lo imprescindible para conectarse: el código QR, la dirección y el código.
      h('div.sync-qr', info.svg ? h('div.sync-qr-img', { html: info.svg }) : h('p.muted', t('sync.qrUnavailable')),
        h('div.sync-qr-data',
          h('p', h('span.muted', t('sync.address') + ' '), h('strong', main ? `${main.ip}:${info.port}` : t('sync.noAddress'))),
          h('p', h('span.muted', t('sync.code') + ' '), h('strong.sync-code', info.code)))),
      // Lo demás, plegado.
      h('details.sync-help', h('summary', t('sync.helpTitle')),
        h('ul', tr('sync.helpSteps').map((x) => h('li', x))),
        nets.length ? h('p.small', h('span.muted', t('sync.networks') + ' '), nets.map((n) => `${n.name || n.alias}${n.alias && n.alias !== n.name ? ` (${n.alias})` : ''}: ${t('sync.net.' + (n.category || 'unknown'))}`).join(' · ')) : null,
        info.addresses.length > 1 ? h('p.small.muted', t('sync.otherAddresses', { list: info.addresses.slice(1).map(where).join(', ') })) : null,
        h('div.btn-row',
          btn(t('sync.firewallButton'), { icon: 'shield', small: true, onClick: () => allowFirewall(publicNets) }),
          btn(t('sync.probeHub'), { small: true, onClick: () => guard(async () => {
            const shared = await probeHub();
            if (shared.length) toast(t('sync.probeHubList', { list: shared.join(', ') }), 'success', 10000);
            else toast(t('sync.probeHubEmpty'), 'info', 10000);
          }) }))),
      h('details.sync-help', h('summary', t('sync.moreOptions')),
        h('label.form-row', h('span.form-label', t('sync.deviceName')), name, h('span.form-hint', t('sync.deviceNameHint'))),
        h('div.btn-row', btn(t('sync.renewCode'), { small: true, onClick: async () => {
          if (!(await confirmDialog(t('sync.renewConfirm'), { confirmLabel: t('sync.renewCode') }))) return;
          await guard(async () => { await renewHubCode(); await drawHub(); });
        } }))));
  };

  function shareTab() {
    const cfg = syncConfig();
    const toggle = h('input', { type: 'checkbox' });
    toggle.checked = !!cfg.hub.enabled;
    toggle.addEventListener('change', () => guard(async () => {
      const on = toggle.checked;
      try { await setHub(on); } catch (err) { toggle.checked = false; await saveSyncConfig({ hub: { ...syncConfig().hub, enabled: false } }); throw Object.assign(err, { code: err.code || 'hub' }); }
      drawHubState();
      await drawHub();
    }));
    drawHub().catch((err) => toast(syncErrorText(err), 'error'));
    drawHubState();
    return [box('share', t('sync.shareTitle'), t('sync.help.share'),
      h('label.form-check.sync-share-toggle', toggle, h('span', t('sync.hubOn'))),
      hubState,
      firewallBox,
      pairBox)];
  }

  // ---------- Al día ----------
  // Lo que se ve se repinta al empezar y al terminar cada sincronización (no con cada cambio de
  // configuración, para no deshacer lo que se está escribiendo en un formulario).
  let mounted = false;
  let wasRunning = false;
  const off = onSyncStatus((s) => {
    if (mounted && !body.isConnected) { off(); return; }
    if (!!s.running !== wasRunning) {
      wasRunning = !!s.running;
      if (tab === 'connections') drawBody();
      else if (tab === 'share') drawHubState(s);
    }
  });
  setTimeout(() => { mounted = true; }, 0);

  drawTabs();
  drawBody();
  return [tabsBox, body];
}
