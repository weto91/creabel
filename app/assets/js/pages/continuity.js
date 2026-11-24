// «Continuidad»: tres pestañas. «Comprobaciones» busca imposibles; «Quién sabe qué» lleva los
// secretos y quién se entera de cada uno; «Seguimiento» recorre el libro siguiendo a un
// elemento y sus cambios de estado. Los diálogos se usan también desde la ficha de la escena.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { uid, formatDateTime } from '../text.js';
import { btn, addBtn, pageHeader, emptyState, tabs, modal, formDialog, pickDialog, confirmDialog, menuButton, listSearch, toast, errorText } from '../ui.js';
import { allScenesOrdered, chaptersOrdered, chapterLabel, chapterNumbers, scenesOf, displayName, entityHref, customType } from '../model.js';
import { pickItem, miniCard } from '../components.js';
import {
  STATE_TYPES, READER, sceneStates, scenePeople, sceneRef, trackOf, secretReveals, whoLabel, runChecks, ignoredChecks, setIgnored,
} from '../continuity.js';

const TABS = ['checks', 'secrets', 'tracking'];

// ---------- Diálogos (también para la ficha de la escena) ----------

/** Selector de escena agrupado por capítulos. */
function sceneSelect(value) {
  const numbers = chapterNumbers();
  const sel = h('select.input', { required: true },
    h('option', { value: '' }, t('secret.chooseScene')),
    chaptersOrdered().filter((c) => scenesOf(c.id).length).map((c) => h('optgroup', { label: chapterLabel(c, numbers) },
      scenesOf(c.id).map((s) => h('option', { value: s.id }, displayName(s))))));
  sel.value = value || '';
  return sel;
}

function whoSelect(value) {
  const sel = h('select.input',
    h('option', { value: READER }, t('secret.reader')),
    store.list('character').map((c) => h('option', { value: c.id }, displayName(c))));
  sel.value = value || READER;
  return sel;
}

/** Crea o edita un secreto con la lista de quién se entera y en qué escena. Devuelve si se ha guardado. */
export function secretDialog(secret) {
  return new Promise((resolve) => {
    let saved = false;
    const name = h('input.input', { type: 'text', maxlength: 250, required: true, placeholder: t('secret.namePlaceholder') });
    name.value = secret ? secret.name || '' : '';
    const description = h('textarea.input', { rows: 3, maxlength: 2000, placeholder: t('secret.descriptionPlaceholder') });
    description.value = secret ? secret.data.description || '' : '';
    let rows = secret ? secretReveals(secret).map((r) => ({ ...r })) : [];
    const list = h('div.reveal-list');
    const drawRows = () => {
      clear(list);
      if (!rows.length) list.append(h('p.muted.small', t('secret.noReveals')));
      rows.forEach((r, i) => {
        const who = whoSelect(r.who);
        who.addEventListener('change', () => { r.who = who.value; });
        const scene = sceneSelect(r.scene);
        scene.addEventListener('change', () => { r.scene = scene.value; });
        list.append(h('div.reveal-row', who, scene, btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.remove'), onClick: () => { rows.splice(i, 1); drawRows(); } })));
      });
    };
    drawRows();
    const submit = async () => {
      if (!form.reportValidity()) return;
      const data = { description: description.value.trim(), reveals: rows.filter((r) => r.scene).map((r) => ({ id: r.id || uid(), who: r.who, scene: r.scene })) };
      try {
        if (secret) await store.update(secret.id, { name: name.value.trim(), data: { ...secret.data, ...data } });
        else await store.create('secret', { name: name.value.trim(), data });
        saved = true;
        m.close();
      } catch (err) { toast(errorText(err), 'error'); }
    };
    const form = h('form.form', { onsubmit: (e) => { e.preventDefault(); submit(); } },
      h('label.form-row', h('span.form-label', t('secret.name')), name),
      h('label.form-row', h('span.form-label', t('common.description')), description),
      h('div.form-row', h('span.form-label', t('secret.reveals')), h('span.form-hint', t('secret.revealsHint')), list,
        h('div.btn-row', addBtn(() => { rows.push({ id: uid(), who: READER, scene: '' }); drawRows(); }, t('secret.addReveal')))),
      h('button', { type: 'submit', hidden: true }));
    const m = modal({
      title: t(secret ? 'secret.edit' : 'secret.add'), body: form, wide: true,
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(t('common.save'), { kind: 'primary', onClick: submit })],
      onClose: () => resolve(saved),
    });
  });
}

/** Desde una escena: apunta que aquí se revela un secreto (uno que ya existe o uno nuevo) y a quién. */
export function revealDialog(scene) {
  return new Promise((resolve) => {
    let saved = false;
    const secrets = store.list('secret');
    const which = h('select.input', h('option', { value: '' }, t('secret.newOne')), secrets.map((s) => h('option', { value: s.id }, displayName(s))));
    const name = h('input.input', { type: 'text', maxlength: 250, placeholder: t('secret.namePlaceholder') });
    const nameRow = h('label.form-row', h('span.form-label', t('secret.name')), name);
    which.addEventListener('change', () => { nameRow.hidden = !!which.value; });
    // A quién: el lector y los personajes de la escena (los demás, desde «Continuidad»).
    const people = scenePeople(scene);
    const boxes = [[READER, t('secret.reader')], ...people.map((c) => [c.id, displayName(c)])].map(([id, label]) => {
      const box = h('input', { type: 'checkbox', value: id });
      box.checked = id === READER;
      return h('label.form-check', box, h('span', label));
    });
    const submit = async () => {
      const who = boxes.map((b) => b.querySelector('input')).filter((b) => b.checked).map((b) => b.value);
      if (!who.length || (!which.value && !name.value.trim())) { name.focus(); return; }
      const reveals = who.map((id) => ({ id: uid(), who: id, scene: scene.id }));
      try {
        const secret = store.get(which.value);
        if (secret) {
          // Sin repetir a quien ya se enteraba en esta misma escena.
          const kept = secretReveals(secret).filter((r) => !(r.scene === scene.id && who.includes(r.who)));
          await store.patchData(secret.id, { reveals: [...kept, ...reveals] });
        } else await store.create('secret', { name: name.value.trim(), data: { description: '', reveals } });
        saved = true;
        m.close();
      } catch (err) { toast(errorText(err), 'error'); }
    };
    const form = h('form.form', { onsubmit: (e) => { e.preventDefault(); submit(); } },
      secrets.length ? h('label.form-row', h('span.form-label', t('secret.which')), which) : null,
      nameRow,
      h('div.form-row', h('span.form-label', t('secret.toWhom')), boxes),
      h('button', { type: 'submit', hidden: true }));
    const m = modal({
      title: t('secret.revealHere'), body: form,
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(t('common.save'), { kind: 'primary', onClick: submit })],
      onClose: () => resolve(saved),
    });
  });
}

/** Desde una escena: apunta (o cambia) el estado de un elemento en este punto. Devuelve si se ha guardado. */
export async function stateDialog(scene, state) {
  let entity = state ? store.get(state.entity) : null;
  if (!entity) {
    // Primero lo marcado en la escena; después, el resto.
    const marked = new Set([...scenePeople(scene).map((c) => c.id), ...['objects', 'custom', 'groups', 'locations'].flatMap((k) => (Array.isArray(scene.data[k]) ? scene.data[k] : []))]);
    const items = STATE_TYPES.flatMap((type) => store.list(type).map((e) => pickItem(e, {
      group: marked.has(e.id) ? t('state.inScene') : type === 'custom' ? (customType(e) || {}).name || t('custom.plural') : t(type + '.plural'),
      order: marked.has(e.id) ? 0 : 1,
    }))).sort((a, b) => a.order - b.order);
    const picked = await pickDialog({ title: t('state.whose'), items, single: true, emptyText: t('tags.noneAvailable') });
    if (!picked || !picked[0]) return false;
    entity = store.get(picked[0]);
  }
  const ownable = entity.type === 'object' || entity.type === 'custom';
  const fields = [{ name: 'text', label: t('state.text', { name: displayName(entity) }), type: 'textarea', rows: 3, required: true, value: state ? state.text : '', placeholder: t('state.placeholder.' + (ownable ? 'object' : 'other')) }];
  if (ownable) {
    fields.push({ name: 'holder', label: t('state.holder'), type: 'select', value: state ? state.holder || '' : '', options: [{ value: '', label: t('state.noHolder') }, ...store.list('character').map((c) => ({ value: c.id, label: displayName(c) }))] });
  }
  fields.push({ name: 'gone', label: t('state.gone.' + (entity.type === 'character' ? 'character' : 'other')), type: 'checkbox', value: state ? !!state.gone : false });
  const out = await formDialog({ title: t(state ? 'state.edit' : 'state.add'), fields });
  if (!out) return false;
  const next = { id: state ? state.id : uid(), entity: entity.id, text: out.text, holder: out.holder || null, gone: !!out.gone };
  const all = sceneStates(scene);
  await store.patchData(scene.id, { states: state ? all.map((s) => (s.id === state.id ? next : s)) : [...all, next] });
  return true;
}

// ---------- Página ----------

export async function continuityPage({ el, pid, query }) {
  let tab = TABS.includes(query.tab) ? query.tab : 'checks';
  let showIgnored = false;
  let knownBy = '';
  let secretOrder = 'time'; // 'time' (por fecha de la escena) | 'book' (por orden de lectura)
  const openSecrets = new Set();
  let trackId = query.id || '';
  const tabsEl = h('div');
  const body = h('div');
  const numbers = chapterNumbers();

  // ----- Comprobaciones -----
  const drawChecks = () => {
    const ignored = ignoredChecks();
    const all = runChecks();
    const live = all.filter((i) => !ignored.has(i.key));
    const hidden = all.filter((i) => ignored.has(i.key));
    const row = (issue, isIgnored) => h('div', { class: 'check-row is-' + issue.level + (isIgnored ? ' is-ignored' : '') },
      h('span.check-level', { title: issue.level === 'soft' ? t('check.softTitle') : null }, t('check.level.' + issue.level)),
      h('div.check-main',
        h('p', issue.text),
        // Debajo, accesos directos a las escenas y fichas de las que habla el aviso.
        h('div.check-links', h('span.check-links-label', t('check.open')), issue.links.map((l) => h('a', { href: l.href }, l.label)))),
      btn(t(isIgnored ? 'check.restore' : 'check.ignore'), { small: true, kind: 'ghost', onClick: async () => {
        try { await setIgnored(issue.key, !isIgnored); } catch (err) { toast(errorText(err), 'error'); }
        draw();
      } }));
    const errors = live.filter((i) => i.level === 'error').length;
    body.append(...[
      h('p.muted.tree-hint', t('check.hint')),
      live.length
        ? h('p.check-summary', errors ? h('strong.is-error', tn('check.errors', errors)) : null, errors && live.length > errors ? ' · ' : null,
          live.length > errors ? h('span', tn('check.warnings', live.length - errors)) : null)
        : h('p.check-ok', icon('check', 18), t('check.ok')),
      live.length ? h('div.check-list', live.map((i) => row(i, false))) : null,
      hidden.length ? h('p.muted.small', tn('check.ignoredCount', hidden.length), ' ',
        h('button.link-btn', { type: 'button', onclick: () => { showIgnored = !showIgnored; draw(); } }, t(showIgnored ? 'check.hideIgnored' : 'check.showIgnored'))) : null,
      hidden.length && showIgnored ? h('div.check-list', hidden.map((i) => row(i, true))) : null,
    ].filter(Boolean));
  };

  // ----- Quién sabe qué -----
  // Una fila por secreto (qué es, quién lo sabe y cuándo se revela por primera vez); al pulsarla
  // se abre con la descripción y la lista completa. Se ordenan por la primera revelación: por
  // fecha de la escena («Cronológico», las que no tienen fecha van detrás) o por orden de lectura.
  const sceneOrder = new Map(allScenesOrdered().map((s, i) => [s.id, i]));
  const timeOf = (r) => (store.get(r.scene).data.time || '');
  const dateOf = (r) => (timeOf(r) ? formatDateTime(timeOf(r)) : '');
  const byBook = (a, b) => sceneOrder.get(a.scene) - sceneOrder.get(b.scene);
  const byTime = (a, b) => (timeOf(a) && timeOf(b) ? timeOf(a).localeCompare(timeOf(b)) : timeOf(a) ? -1 : timeOf(b) ? 1 : 0) || byBook(a, b);
  const revealsOf = (s) => secretReveals(s).sort(secretOrder === 'time' ? byTime : byBook);
  const secretsEl = h('div');
  const secretSearch = listSearch({
    placeholder: t('secret.search'),
    // Título, contenido, quién se entera y en qué escena (con su capítulo y su fecha).
    text: (s) => [s.name, s.data.description, ...secretReveals(s).flatMap((r) => [whoLabel(r.who), sceneRef(store.get(r.scene), numbers), dateOf(r), timeOf(r)])].join(' '),
    onChange: () => drawSecretList(),
  });
  secretSearch.el.classList.add('wide');

  function drawSecretList() {
    const all = store.list('secret').filter((s) => !knownBy || secretReveals(s).some((r) => r.who === knownBy));
    const shown = secretSearch.filter(all).map((s) => ({ s, reveals: revealsOf(s) }));
    secretSearch.setCount(shown.length, all.length);
    // Los que nadie descubre todavía van al final, por nombre.
    shown.sort((a, b) => (a.reveals.length && b.reveals.length ? (secretOrder === 'time' ? byTime : byBook)(a.reveals[0], b.reveals[0])
      : a.reveals.length ? -1 : b.reveals.length ? 1 : 0) || displayName(a.s).localeCompare(displayName(b.s)));
    clear(secretsEl);
    if (!shown.length) {
      secretsEl.append(h('p.muted.empty-line', t(all.length ? 'common.noMatches' : 'secret.noneKnown')));
      return;
    }
    secretsEl.append(h('div.secret-rows', shown.map(({ s, reveals }) => {
      const open = openSecrets.has(s.id);
      const first = reveals[0];
      const names = [...new Set(reveals.map((r) => whoLabel(r.who)))];
      const toggle = () => { if (open) openSecrets.delete(s.id); else openSecrets.add(s.id); drawSecretList(); };
      return h('div', { class: 'secret-row' + (open ? ' open' : '') },
        h('div.secret-row-line',
          h('button.secret-row-head', { type: 'button', 'aria-expanded': String(open), onclick: toggle },
            icon(open ? 'chevron-down' : 'chevron-right', 14),
            h('span.secret-row-name', { title: displayName(s) }, displayName(s)),
            h('span.secret-row-who', { title: names.join(', ') }, names.length ? (names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ')) : t('secret.nobodyShort')),
            h('span.secret-row-when', first ? [sceneRef(store.get(first.scene), numbers), dateOf(first) ? ` · ${dateOf(first)}` : ''] : '')),
          menuButton(() => [
            { label: t('common.edit'), icon: 'edit', onClick: async () => { if (await secretDialog(s)) draw(); } },
            { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
              if (!(await confirmDialog(t('common.confirmDelete', { name: displayName(s) }), { danger: true, confirmLabel: t('common.delete') }))) return;
              try { await store.remove(s.id); } catch (err) { toast(errorText(err), 'error'); }
              draw();
            } },
          ], { small: true })),
        open ? h('div.secret-row-body',
          s.data.description ? h('p', s.data.description) : null,
          reveals.length ? h('ol.secret-reveals', reveals.map((r) => h('li', { class: r.who === knownBy ? 'is-focus' : '' },
            h('strong', whoLabel(r.who)), ' ', h('a', { href: entityHref(store.get(r.scene)) }, sceneRef(store.get(r.scene), numbers)),
            dateOf(r) ? h('span.muted', ` · ${dateOf(r)}`) : null)))
            : h('p.muted.small', t('secret.nobody'))) : null);
    })));
  }

  const drawSecrets = () => {
    const secrets = store.list('secret');
    const add = async () => { if (await secretDialog(null)) draw(); };
    if (!secrets.length) {
      body.append(emptyState(t('secret.empty'), btn(t('secret.add'), { icon: 'plus', kind: 'primary', onClick: add }), 'key'));
      return;
    }
    secretSearch.reset();
    const who = h('select.input.inline-select', { 'aria-label': t('secret.knownBy'), title: t('secret.knownBy') },
      h('option', { value: '' }, t('secret.everyone')),
      h('option', { value: READER }, t('secret.knowsReader')),
      store.list('character').map((c) => h('option', { value: c.id }, t('secret.knows', { name: displayName(c) }))));
    who.value = knownBy;
    who.addEventListener('change', () => { knownBy = who.value; drawSecretList(); });
    const opt = (key) => h('button', {
      type: 'button', class: 'seg-opt' + (secretOrder === key ? ' active' : ''), 'aria-pressed': String(secretOrder === key),
      onclick: () => { secretOrder = key; draw(); },
    }, t('timeline.order.' + key));
    body.append(
      h('div.filter-row', secretSearch.el, who,
        h('span.seg', { role: 'group', 'aria-label': t('timeline.order') }, h('span.seg-label', t('timeline.order')), ['time', 'book'].map(opt)),
        h('span.muted', tn('secret.count', secrets.length)),
        h('span.spacer'), btn(t('secret.add'), { icon: 'plus', kind: 'primary', onClick: add })),
      secretsEl);
    drawSecretList();
  };

  // ----- Seguimiento -----
  const drawTracking = () => {
    const groups = STATE_TYPES.map((type) => ({ type, list: store.list(type) })).filter((g) => g.list.length);
    if (!groups.length) {
      body.append(h('p.muted.empty-line', t('tags.noneAvailable')));
      return;
    }
    if (!store.get(trackId)) trackId = groups[0].list[0].id;
    const sel = h('select.input.inline-select', { 'aria-label': t('track.follow') },
      groups.map((g) => h('optgroup', { label: t(g.type + '.plural') }, g.list.map((e) => h('option', { value: e.id }, displayName(e))))));
    sel.value = trackId;
    sel.addEventListener('change', () => { trackId = sel.value; draw(); });
    const entity = store.get(trackId);
    const track = trackOf(entity);
    const changes = track.flatMap((step) => step.states.map((state) => ({ step, state })));
    const last = changes[changes.length - 1];
    body.append(
      h('div.filter-row', h('span.form-label', t('track.follow')), sel, h('span.muted', tn('count.scenes', track.length))),
      h('div.track-now',
        h('div.mini-cards', miniCard(entity)),
        h('p', last ? [h('strong', t('track.last')), ' ', last.state.text,
          store.get(last.state.holder) ? ` · ${t('state.heldBy', { name: displayName(store.get(last.state.holder)) })}` : ''] : h('span.muted', t('track.noStates')))),
      track.length ? h('div.track-list', track.map((step) => h('div', { class: 'track-row' + (step.states.length || step.holds.length ? ' has-state' : '') },
        h('a.track-scene', { href: entityHref(step.scene) }, sceneRef(step.scene, numbers)),
        h('span.track-date', step.scene.data.time ? formatDateTime(step.scene.data.time) : ''),
        h('div.track-states',
          step.states.map((s) => h('p', s.gone ? h('span.track-gone', t('state.goneMark')) : null, s.text,
            store.get(s.holder) ? h('span.muted', ` · ${t('state.heldBy', { name: displayName(store.get(s.holder)) })}`) : null)),
          step.holds.map((s) => h('p', h('span.muted', t('track.receives')), ' ', h('a', { href: entityHref(store.get(s.entity)) }, displayName(store.get(s.entity))))),
          !step.states.length && !step.holds.length ? h('p.muted', t(step.appears ? 'track.appears' : 'track.mentioned')) : null,
          !step.appears ? h('p.muted.small', t('track.notTagged')) : null))))
        : h('p.muted.empty-line', t('track.empty')),
      h('p.muted.small', t('track.hint')));
  };

  function draw() {
    clear(tabsEl).append(tabs(TABS.map((key) => ({ key, label: t('continuity.tab.' + key) })), tab, (key) => { tab = key; draw(); }));
    clear(body);
    if (tab === 'secrets') drawSecrets();
    else if (tab === 'tracking') drawTracking();
    else drawChecks();
  }

  clear(el);
  el.append(pageHeader({ title: t('nav.continuity'), subtitle: t('continuity.hint') }), tabsEl, body);
  draw();
}
