// Sincronización de la aplicación: la configuración (con qué destinos), la sincronización
// automática y el emparejamiento de dispositivos por QR. Se sincronizan siempre todos los
// proyectos: estar conectados quiere decir tener los mismos proyectos (ver runSync).
//
// Destinos posibles (cada usuario elige los suyos):
//  - un servidor WebDAV (su NAS, Nextcloud, un servicio en la nube…), por http o https, y con
//    certificados no válidos solo si lo marca expresamente;
//  - un equipo emparejado: el PC enseña un código QR y el móvil (u otro equipo) lo escanea o lo
//    escribe; a partir de ahí se sincronizan cuando están en la misma red (o por una VPN);
//  - en el propio PC, la carpeta que comparte con los dispositivos emparejados.
import { isApp, isDesktopApp, isAndroid, tauri, invoke } from '../platform.js';
import { localEngine } from '../api.js';
import { store } from '../store.js';
import { syncProject, remoteProjects, remoteProjectIds } from './sync.js';
import { webdavTransport, folderTransport } from './transports.js';
import { newId } from './engine.js';
import { md5 } from '../md5.js';

const CONFIG = 'syncConfig';
const EVERY = 3 * 60 * 1000;
const AFTER_CHANGE = 30 * 1000;
export const HUB_PORT = 47823;

const listeners = new Set();
const status = { running: false, at: '', results: {}, errors: {} };

const defaults = () => ({
  name: isAndroid ? 'Android' : 'Windows',
  webdav: { enabled: false, url: '', user: '', password: '', root: 'creabel', insecure: false },
  peers: [],
  hub: { enabled: false, port: HUB_PORT, token: '' },
});

export const syncAvailable = () => isApp && !!localEngine();

export function syncConfig() {
  const eng = localEngine();
  const saved = (eng && eng.kvGet(CONFIG)) || {};
  const d = defaults();
  return { ...d, ...saved, webdav: { ...d.webdav, ...(saved.webdav || {}) }, hub: { ...d.hub, ...(saved.hub || {}) }, peers: saved.peers || [] };
}

export async function saveSyncConfig(patch) {
  const next = { ...syncConfig(), ...patch };
  await localEngine().kvSet(CONFIG, next);
  emit();
  return next;
}

export const syncStatus = () => ({ ...status, results: { ...status.results }, errors: { ...status.errors } });
export function onSyncStatus(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { for (const fn of listeners) { try { fn(syncStatus()); } catch (err) { console.error(err); } } }

// ---------- Android: permiso de red local ----------
// Desde Android 17, sin este permiso Android bloquea sin avisar las conexiones con la red de
// casa (el PC emparejado, un NAS): se quedan sin respuesta. Lo pide la actividad nativa
// (src-tauri/android/MainActivity.kt) a través de window.CreabelAndroid.

const androidBridge = () => (typeof window !== 'undefined' && window.CreabelAndroid) || null;

/**
 * 'granted' (o no hace falta: Windows, Android 16 o anterior), 'prompt' (aún no se ha
 * preguntado), 'prompt-with-rationale' (se dijo que no una vez) o 'denied' (para siempre).
 */
export function localNetworkState() {
  const b = androidBridge();
  if (!isAndroid || !b || typeof b.localNetworkState !== 'function') return 'granted';
  try { return String(b.localNetworkState() || 'granted'); } catch (err) { return 'granted'; }
}

/** Enseña el aviso de Android y espera la respuesta. Devuelve el estado nuevo. */
export function requestLocalNetwork() {
  const b = androidBridge();
  if (!b || typeof b.requestLocalNetwork !== 'function') return Promise.resolve('granted');
  return new Promise((resolve) => {
    let done = false;
    let ticks = 0;
    const finish = (state) => {
      if (done) return;
      done = true;
      window.removeEventListener('creabel:local-network', onEvent);
      clearInterval(timer);
      resolve(state);
    };
    const onEvent = (e) => finish(String((e && e.detail) || localNetworkState()));
    window.addEventListener('creabel:local-network', onEvent);
    // Por si la respuesta no llegara a la página: se mira cada segundo (dos minutos como mucho).
    const timer = setInterval(() => {
      ticks += 1;
      const s = localNetworkState();
      if (s === 'granted' || ticks > 120) finish(s);
    }, 1000);
    try { b.requestLocalNetwork(); } catch (err) { finish(localNetworkState()); }
  });
}

/** Abre los ajustes de Creabel en Android (para dar a mano un permiso denegado para siempre). */
export function openAndroidSettings() {
  const b = androidBridge();
  if (b && typeof b.openAppSettings === 'function') b.openAppSettings();
}

/** ¿Es una dirección de la red de casa? (IPv4 privada o de enlace local, o un nombre .local) */
export function isLocalHost(host) {
  const h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (h.endsWith('.local')) return true;
  const o = h.split('.').map(Number);
  if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  return o[0] === 10 || (o[0] === 192 && o[1] === 168) || (o[0] === 172 && o[1] >= 16 && o[1] <= 31) || (o[0] === 169 && o[1] === 254);
}

const hostOf = (url) => { try { return new URL(url).hostname; } catch (err) { return ''; } };

/** ¿Este destino va por la red de casa? (un equipo emparejado o un WebDAV con dirección local) */
export function usesLocalNetwork(cfg = syncConfig()) {
  return cfg.peers.length > 0 || (cfg.webdav.enabled && isLocalHost(hostOf(cfg.webdav.url)));
}

/** Si falla la red en Android sin el permiso de red local, el error lo dice. */
function explainNetwork(err) {
  if (err && err.code === 'sync_network' && localNetworkState() !== 'granted') err.code = 'sync_local_network';
  return err;
}

// ---------- Destinos ----------

const httpFetch = () => {
  const T = tauri();
  return T && T.http && T.http.fetch ? T.http.fetch : null;
};

/**
 * La huella del código de emparejamiento con la que el móvil pregunta por el PC en la red (ver
 * hub.rs): el código no viaja por difusión.
 */
const hubKey = (token) => md5('creabel:' + String(token || ''));

/** Busca en la red el PC de este emparejamiento. Devuelve sus direcciones (o [] si no contesta). */
async function discover(peer) {
  try {
    const found = await invoke('discover_peer', { key: hubKey(peer.token), port: Number(peer.port) || HUB_PORT, hints: peer.hosts || [] });
    return Array.isArray(found) ? found.map(String) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Si el PC ha cambiado de dirección (el router le ha dado otra), la busca en la red y la guarda.
 * Cambia peer.hosts. Devuelve { found, moved } o null si no lo encuentra.
 */
async function relocate(peer) {
  const found = await discover(peer);
  if (!found.length) return null;
  const old = peer.hosts || [];
  const hosts = [...found, ...old.filter((h) => !found.includes(h))].slice(0, 6);
  const moved = found.some((ip) => !old.includes(ip));
  peer.hosts = hosts;
  if (moved) {
    const cfg = syncConfig();
    if (cfg.peers.some((p) => p.id === peer.id)) await saveSyncConfig({ peers: cfg.peers.map((p) => (p.id === peer.id ? { ...p, hosts } : p)) });
  }
  return { found, moved };
}

/** La dirección de este dispositivo en su red ('' si no se sabe). */
export async function localIp() {
  try { return String((await invoke('local_ip')) || ''); } catch (err) { return ''; }
}

/**
 * Un equipo emparejado: prueba sus direcciones por orden y se queda con la que responda. Si no
 * responde ninguna, lo busca en la red (una vez) y lo vuelve a intentar con la dirección nueva.
 */
function peerTransport(peer) {
  let current = 0;
  let relocated = false;
  const make = (host) => webdavTransport({ url: `http://${host}:${peer.port || HUB_PORT}`, token: peer.token, root: '', fetchImpl: httpFetch() });
  const attempt = async (method, args) => {
    const hosts = peer.hosts || [];
    const details = [];
    for (let n = 0; n < hosts.length; n++) {
      const i = (current + n) % hosts.length;
      try {
        const out = await make(hosts[i])[method](...args);
        current = i;
        return out;
      } catch (err) {
        if (err.code !== 'sync_network') throw err;
        details.push(err.detail || err.message);
      }
    }
    throw Object.assign(new Error('Sin respuesta'), { code: 'sync_network', detail: details.join(' · ') || 'sin direcciones' });
  };
  const tries = (method) => async (...args) => {
    try {
      return await attempt(method, args);
    } catch (err) {
      if (err.code !== 'sync_network' || relocated) throw err;
      relocated = true;
      if (!(await relocate(peer))) throw err;
      current = 0;
      return attempt(method, args);
    }
  };
  return { list: tries('list'), get: tries('get'), put: tries('put'), del: tries('del'), check: tries('check') };
}

/**
 * Los destinos configurados: [{ key, label, make() }]. El destino se prepara con make() dentro
 * del control de errores de quien lo use: si uno falla, los demás siguen.
 */
export function syncTargets(cfg = syncConfig()) {
  const out = [];
  if (cfg.webdav.enabled && cfg.webdav.url) {
    out.push({ key: 'webdav', label: cfg.webdav.url, make: () => webdavTransport({ ...cfg.webdav, fetchImpl: httpFetch() }) });
  }
  for (const peer of cfg.peers) out.push({ key: 'peer:' + peer.id, label: peer.name || peer.hosts.join(', '), make: () => peerTransport(peer) });
  if (isDesktopApp && cfg.hub.enabled) out.push({ key: 'hub', label: 'hub', make: () => folderTransport('hub') });
  return out;
}

export const webdavFor = (settings) => webdavTransport({ ...settings, fetchImpl: httpFetch() });

/**
 * Por qué no se puede abrir una conexión con un equipo (lo dice la parte nativa, net.rs):
 * 'refused' (está en la red, pero nada escucha), 'timeout' (no contesta: cortafuegos u otra red),
 * 'unreachable' (esa dirección no está en esta red) u 'other'. null si conecta o no se sabe.
 */
async function tcpReason(host, port) {
  let r;
  try { r = await invoke('tcp_probe', { host, port }); } catch (err) { return null; }
  if (!r || r.ok) return null;
  const kind = String(r.kind || '');
  if (kind === 'ConnectionRefused') return { reason: 'refused', message: r.message };
  if (kind === 'TimedOut' || kind === 'WouldBlock') return { reason: 'timeout', message: r.message };
  if (/Unreachable|AddrNotAvailable|NetworkDown/.test(kind)) return { reason: 'unreachable', message: r.message };
  return { reason: 'other', message: r.message || kind };
}

/**
 * Diagnóstico de un equipo emparejado: prueba cada una de sus direcciones por separado y, si no
 * responde ninguna, lo busca en la red (y guarda la dirección nueva si la tiene).
 * Devuelve { results: [{ host, ok, projects, reason, code, detail, found }], localIp, searched }.
 * found: la dirección se ha encontrado preguntando a la red. searched: se ha buscado en la red.
 */
export async function probePeer(peer) {
  const port = Number(peer.port) || HUB_PORT;
  const probeHost = async (host) => {
    const tcp = await tcpReason(host, port);
    if (tcp) return { host, ok: false, reason: tcp.reason, code: 'sync_network', detail: tcp.message };
    try {
      const shared = await remoteProjects(webdavTransport({ url: `http://${host}:${port}`, token: peer.token, root: '', fetchImpl: httpFetch() }));
      return { host, ok: true, projects: shared.filter((p) => !p.deleted).map((p) => p.name || p.id), reason: '', detail: '' };
    } catch (err) {
      return { host, ok: false, reason: err.code === 'sync_auth' ? 'auth' : 'other', code: err.code || '', detail: String(err.detail || err.message || err) };
    }
  };
  // Sin el permiso de red local (Android 17), Android no deja ni intentarlo.
  if (localNetworkState() !== 'granted') {
    return { results: (peer.hosts || []).map((host) => ({ host, ok: false, reason: 'permission', code: 'sync_local_network', detail: '' })), localIp: '', searched: false };
  }
  const results = [];
  for (const host of peer.hosts || []) results.push(await probeHost(host));
  let searched = false;
  if (!results.some((r) => r.ok)) {
    searched = true;
    const r = await relocate(peer);
    if (r) {
      for (const host of r.found) {
        const res = { ...(await probeHost(host)), found: true };
        const i = results.findIndex((x) => x.host === host);
        if (i >= 0) results.splice(i, 1);
        results.unshift(res);
      }
    }
  }
  return { results, localIp: await localIp(), searched };
}

/**
 * En Windows: las redes a las que está conectado el equipo y su tipo:
 * [{ name, alias, category: 'public' | 'private' | 'domain' | '' }]. Vacío si no se sabe.
 */
export async function networkProfiles() {
  if (!isDesktopApp) return [];
  try {
    const raw = await invoke('network_profiles');
    const data = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(data) ? data : [data];
    const kind = (c) => {
      const v = String(c == null ? '' : c);
      if (v === 'Public' || v === '0') return 'public';
      if (v === 'Private' || v === '1') return 'private';
      if (v === 'DomainAuthenticated' || v === '2') return 'domain';
      return '';
    };
    return list.filter(Boolean).map((n) => ({ name: String(n.name || n.Name || ''), alias: String(n.alias || n.InterfaceAlias || ''), category: kind(n.category != null ? n.category : n.NetworkCategory) }));
  } catch (err) {
    console.warn('Creabel: redes de Windows', err);
    return [];
  }
}

/**
 * En Windows: ¿bloquea el cortafuegos a Creabel en alguna de las redes conectadas?
 * { checked: si se ha podido saber, blocked: [{ name, alias, category: 'public'|'private'|'domain' }] }.
 */
export async function firewallStatus() {
  if (!isDesktopApp) return { checked: false, blocked: [] };
  try {
    const data = JSON.parse((await invoke('firewall_status')) || '{}');
    const kind = (c) => ({ Public: 'public', Private: 'private', DomainAuthenticated: 'domain' }[String(c)] || '');
    const list = Array.isArray(data.blocked) ? data.blocked : data.blocked ? [data.blocked] : [];
    return { checked: !!data.checked, blocked: list.map((n) => ({ name: String(n.name || ''), alias: String(n.alias || ''), category: kind(n.category) })) };
  } catch (err) {
    console.warn('Creabel: cortafuegos', err);
    return { checked: false, blocked: [] };
  }
}

/**
 * En Windows: deja a Creabel recibir conexiones de los otros dispositivos (Windows pide permiso
 * de administrador una vez). `publicToo`: también en redes públicas. `makePrivate`: redes
 * (InterfaceAlias) que marcar como privadas. Devuelve 'ok', 'cancelled' o 'failed'.
 */
export async function allowInFirewall({ publicToo = false, makePrivate = [] } = {}) {
  return String(await invoke('firewall_allow', { public: !!publicToo, privateAliases: makePrivate }));
}

/**
 * En el PC: comprueba que la carpeta compartida responde, desde el propio equipo, y dice qué
 * proyectos ofrece a los demás dispositivos (nombres).
 */
export async function probeHub() {
  const cfg = syncConfig();
  const shared = await remoteProjects(webdavTransport({ url: `http://127.0.0.1:${Number(cfg.hub.port) || HUB_PORT}`, token: cfg.hub.token, root: '', fetchImpl: httpFetch() }));
  return shared.filter((p) => !p.deleted).map((p) => p.name || p.id);
}

// ---------- Sincronizar ----------

let running = null; // la sincronización en marcha
let waiting = null; // la siguiente (las peticiones que llegan mientras tanto se juntan en una)

/**
 * Sincroniza ahora con todos los destinos (o solo con `target`, la clave de una conexión).
 * Devuelve una promesa que se cumple cuando ha terminado (si ya había una en marcha, cuando
 * termine la siguiente, que es completa e incluye lo pedido).
 */
export function syncNow({ target = null } = {}) {
  if (!syncAvailable()) return Promise.resolve(status);
  if (!running) {
    running = runSync({ target }).finally(() => { running = null; });
    return running;
  }
  if (!waiting) waiting = running.then(() => { waiting = null; return syncNow(); });
  return waiting;
}

/**
 * Se sincroniza TODO: estar conectados quiere decir tener los mismos proyectos. Con cada destino,
 * los proyectos de este dispositivo (también los de la papelera), los que hay en el destino
 * (así llegan solos los nuevos de los demás) y los borrados definitivamente aquí que sigan allí
 * (para que el borrado llegue a los demás y no vuelvan a aparecer).
 */
async function runSync({ target: only = null } = {}) {
  const eng = localEngine();
  const cfg = syncConfig();
  const all = syncTargets(cfg);
  const targets = only ? all.filter((x) => x.key === only) : all;
  status.noTargets = !all.length;
  if (!targets.length) { emit(); return status; }
  status.running = only || true;
  emit();
  let merged = 0;
  const known = new Set(eng.projects().map((p) => p.id));
  for (const target of targets) {
    try {
      const results = [];
      const transport = target.make();
      const remote = await remoteProjectIds(transport);
      const buried = new Set(eng.buriedProjects());
      const pids = [...new Set([
        ...eng.projects().map((p) => p.id),
        ...remote,
        ...[...buried].filter((pid) => remote.includes(pid)),
      ])];
      for (const pid of pids) {
        const r = await syncProject(eng, transport, target.key, pid);
        merged += r.merged;
        results.push(r);
      }
      status.results[target.key] = { at: new Date().toISOString(), results };
      delete status.errors[target.key];
    } catch (err) {
      console.warn('Creabel: sincronización con', target.key, err);
      explainNetwork(err);
      status.errors[target.key] = { at: new Date().toISOString(), code: err.code || '', message: String(err.message || err), detail: err.detail || '' };
    }
  }
  status.running = false;
  status.at = new Date().toISOString();
  emit();
  if (merged) {
    // Lo abierto se pone al día; si ha llegado un proyecto nuevo, la lista también.
    if (store.project) store.sync();
    const arrived = eng.projects().some((p) => !known.has(p.id));
    window.dispatchEvent(new CustomEvent('creabel:synced', { detail: { merged, arrived } }));
  }
  return status;
}

/** Los proyectos de este dispositivo (sin los de la papelera): [{ id, name }]. */
export const localProjects = () => {
  const eng = localEngine();
  return eng ? eng.projects().filter((p) => !p.deleted) : [];
};

// ---------- Emparejar (QR) ----------

const prettyCode = (token) => token.toUpperCase().match(/.{1,4}/g).join('-');
export const cleanCode = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** En el PC: abre (o cierra) la carpeta compartida con los dispositivos emparejados. */
export async function setHub(enabled) {
  const cfg = syncConfig();
  const hub = { ...cfg.hub, enabled };
  if (enabled && !hub.token) hub.token = newId(20);
  await saveSyncConfig({ hub });
  if (enabled) {
    await invoke('hub_start', { port: Number(hub.port) || HUB_PORT, token: hub.token, key: hubKey(hub.token) });
    // Se rellena ya la carpeta compartida con los proyectos: si no, el otro dispositivo no
    // encontraría nada hasta la siguiente sincronización automática.
    syncNow();
  } else {
    await invoke('hub_stop');
  }
  return hub;
}

/** Cambia el código: los dispositivos ya emparejados tendrán que volver a emparejarse. */
export async function renewHubCode() {
  const cfg = syncConfig();
  const hub = { ...cfg.hub, token: newId(20) };
  await saveSyncConfig({ hub });
  if (hub.enabled) await invoke('hub_start', { port: Number(hub.port) || HUB_PORT, token: hub.token, key: hubKey(hub.token) });
  return hub;
}

/**
 * Lo que enseña el PC para emparejar: { text (para el QR), addresses: [{ ip, name }], port, code, svg }.
 * Las direcciones vienen sin los adaptadores virtuales (máquinas virtuales, WSL…) y con las de la
 * red de casa primero.
 */
export async function pairingInfo() {
  const cfg = syncConfig();
  const eng = localEngine();
  let addresses = [];
  try { addresses = await invoke('hub_addresses'); } catch (err) { addresses = []; }
  addresses = (addresses || []).map((a) => (typeof a === 'string' ? { ip: a, name: '' } : { ip: String(a.ip), name: String(a.name || '') }));
  const port = Number(cfg.hub.port) || HUB_PORT;
  const text = `creabel://emparejar?v=1&d=${eng.device}&n=${encodeURIComponent(cfg.name)}&h=${addresses.map((a) => a.ip).join(',')}&p=${port}&k=${cfg.hub.token}`;
  let svg = '';
  try { svg = await invoke('qr_svg', { text }); } catch (err) { svg = ''; }
  return { text, addresses, port, code: prettyCode(cfg.hub.token), svg };
}

/** Lee un código de emparejamiento (el texto del QR). */
export function parsePairing(text) {
  const m = /^creabel:\/\/emparejar\?(.*)$/.exec(String(text || '').trim());
  if (!m) return null;
  const q = new URLSearchParams(m[1]);
  const hosts = (q.get('h') || '').split(',').map((h) => h.trim()).filter(Boolean);
  if (!hosts.length || !q.get('k')) return null;
  return { id: q.get('d') || newId(8), name: q.get('n') || hosts[0], hosts, port: Number(q.get('p')) || HUB_PORT, token: cleanCode(q.get('k')) };
}

/**
 * Comprueba un equipo y lo guarda entre los emparejados. Quien lo llama sincroniza después
 * (syncNow) para traer ya todos sus proyectos.
 */
export async function addPeer(peer) {
  await peerTransport(peer).check();
  const cfg = syncConfig();
  const peers = [...cfg.peers.filter((p) => p.id !== peer.id), peer];
  await saveSyncConfig({ peers });
  return peer;
}

/** Guarda un equipo sin comprobarlo (para cuando ahora no está al alcance). */
export async function savePeer(peer) {
  const cfg = syncConfig();
  await saveSyncConfig({ peers: [...cfg.peers.filter((p) => p.id !== peer.id), peer] });
  return peer;
}

export async function removePeer(id) {
  const cfg = syncConfig();
  await saveSyncConfig({ peers: cfg.peers.filter((p) => p.id !== id) });
}

// En Android la cámara necesita permiso, y el escáner no lo pide por su cuenta: falla si no lo
// tiene. Estados: 'granted', 'denied', 'prompt' (aún no se ha preguntado), 'prompt-with-rationale'
// (se dijo que no una vez: conviene explicar para qué antes de volver a preguntar) o 'unknown'.
const cameraState = (r) => String((r && typeof r === 'object' ? r.camera : r) || 'prompt');

export async function cameraPermission() {
  try { return cameraState(await invoke('plugin:barcode-scanner|check_permissions')); } catch (err) { return 'unknown'; }
}

/** Pide el permiso de la cámara (Android enseña su aviso). Devuelve el estado resultante. */
export async function requestCameraPermission() {
  try { return cameraState(await invoke('plugin:barcode-scanner|request_permissions')); } catch (err) { return 'denied'; }
}

/** Abre los ajustes de Creabel en Android (para dar el permiso a mano si se denegó para siempre). */
export const openAppSettings = () => invoke('plugin:barcode-scanner|open_app_settings');

/** En Android: escanea el QR con la cámara. Devuelve el texto leído o null (también si se cancela). */
export async function scanCode() {
  const T = tauri();
  const scanner = T && T.barcodeScanner;
  let result;
  try {
    result = scanner && scanner.scan
      ? await scanner.scan({ formats: [scanner.Format ? scanner.Format.QRCode : 'QR_CODE'], windowed: false })
      : await invoke('plugin:barcode-scanner|scan', { formats: ['QR_CODE'], windowed: false });
  } catch (err) {
    if (/cancel/i.test(String((err && err.message) || err))) return null;
    throw err;
  }
  return result && result.content ? result.content : null;
}

// ---------- Arranque ----------

let started = false;
let changeTimer = null;

export function startAutoSync() {
  if (started || !syncAvailable()) return;
  started = true;
  const eng = localEngine();
  const cfg = syncConfig();
  // En el PC, la carpeta compartida vuelve a abrirse al arrancar si estaba activada.
  if (isDesktopApp && cfg.hub.enabled && cfg.hub.token) {
    invoke('hub_start', { port: Number(cfg.hub.port) || HUB_PORT, token: cfg.hub.token, key: hubKey(cfg.hub.token) }).catch((err) => {
      status.errors.hub = { at: new Date().toISOString(), code: 'hub', message: String(err.message || err) };
      emit();
    });
  }
  setTimeout(() => syncNow(), 4000);
  setInterval(() => syncNow(), EVERY);
  eng.on((evt) => {
    if (evt.type !== 'local') return;
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => syncNow(), AFTER_CHANGE);
  });
  // Al dejar la aplicación en segundo plano (o cerrarla en el móvil), se envía lo pendiente.
  document.addEventListener('visibilitychange', () => { if (document.hidden) syncNow(); });
  window.addEventListener('online', () => syncNow());
}
