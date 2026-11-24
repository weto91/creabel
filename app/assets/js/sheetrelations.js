// Apartado «Relaciones» de una ficha: con quién o con qué se relaciona este elemento y qué es
// cada uno para el otro. Cada relación se ve como una pareja de fichas unidas (las mismas
// tarjetas que en las listas: foto, nombre e identificador): bajo el nombre de cada uno, lo
// que es («Director de vuelo» / «Comandante»); si es lo mismo para los dos («Compañeros»),
// va una sola vez, en la unión entre ambas.
//
// Es una sola lista, esté la relación donde esté: apuntada en esta ficha, en la del otro o
// dibujada en un mapa (model.relationPairs las reúne). Al cambiarla o quitarla desde aquí se
// pone al día en todos esos sitios: queda una anotación en esta ficha
// (data.relations: [{ id, to, label, mine, both }]) y las flechas de los mapas que unen a los
// dos toman el mismo rótulo. Cuentan igual en la pestaña «Relaciones», en las relaciones
// automáticas y en las comprobaciones de Continuidad (padres e hijos).
import { h, clear, icon } from './dom.js';
import { t, tr } from './i18n.js';
import { api } from './api.js';
import { store } from './store.js';
import { uid } from './text.js';
import { btn, addBtn, modal, pickDialog, confirmDialog, toast, errorText } from './ui.js';
import { displayName, entityHref, relationPairs, sheetRelations, RELATION_TYPES, ENTITY_TYPES, customType } from './model.js';
import { pickItem, profileImage, codeTag } from './components.js';

const typeIcon = (e) => (!e ? 'note' : e.type === 'custom' ? (customType(e) || {}).icon || 'grid' : (ENTITY_TYPES[e.type] || {}).icon || 'note');
const rawRelations = (e) => (Array.isArray(e.data.relations) ? e.data.relations : []).filter((r) => r && store.get(r.to));

/** La foto del elemento (o el icono de su tipo). */
function thumb(e) {
  const img = e ? profileImage(e) : null;
  return img ? h('img.pick-thumb', { src: api.imageUrl(img), alt: '', loading: 'lazy' }) : h('span.pick-thumb.placeholder', icon(typeIcon(e), 16));
}

/** Rótulos ya usados en las fichas del proyecto (para proponerlos al escribir). */
function usedLabels() {
  const out = new Set();
  for (const type of RELATION_TYPES) for (const e of store.list(type)) for (const r of sheetRelations(e)) for (const label of [r.label, r.mine]) if (label) out.add(label);
  return [...out];
}

/** Elige el otro elemento entre los que aún no tienen relación con este. Devuelve su ficha o null. */
async function pickOther(entity) {
  const taken = new Set(relationPairs(entity).filter((p) => p.other).map((p) => p.other.id));
  const items = RELATION_TYPES.flatMap((type) => store.list(type)
    .filter((e) => e.id !== entity.id && !taken.has(e.id))
    .map((e) => pickItem(e, { group: type === 'custom' ? (customType(e) || {}).name || t('custom.plural') : t(type + '.plural') })));
  const picked = await pickDialog({ title: t('rel.pick'), items, single: true, selected: [], emptyText: t('rel.nobody') });
  return picked && picked[0] ? store.get(picked[0]) : null;
}

/**
 * Pregunta qué es cada uno para el otro: un campo debajo de cada foto. Con uno solo relleno
 * la relación es recíproca. Propone parentescos y tratos habituales y los rótulos ya usados,
 * pero se puede escribir cualquier cosa. Devuelve { mine, theirs } o null.
 */
function pairDialog(entity, other, value = { mine: '', theirs: '' }, editing = false) {
  return new Promise((resolve) => {
    let done = false;
    const listId = 'rel-labels-' + uid();
    const common = tr('rel.common') || [];
    const options = [...new Set([...usedLabels(), ...common])];
    const field = (e, text) => {
      const input = h('input.input', { type: 'text', maxlength: 80, autocomplete: 'off', list: listId, placeholder: t('rel.placeholder'), 'aria-label': t('rel.is', { name: displayName(e) }) });
      input.value = text;
      return input;
    };
    const mine = field(entity, value.mine);
    const theirs = field(other, value.theirs);
    let last = mine;
    const note = h('p.rel-both-note.small');
    const sync = () => {
      const [a, b] = [mine.value.trim(), theirs.value.trim()];
      const one = !a || !b ? a || b : '';
      note.textContent = one ? t('rel.bothNote', { label: one }) : '';
      note.hidden = !one;
      for (const input of [mine, theirs]) input.setCustomValidity(a || b ? '' : t('rel.need'));
    };
    for (const input of [mine, theirs]) {
      input.addEventListener('input', sync);
      input.addEventListener('focus', () => { last = input; });
    }
    const submit = () => {
      sync();
      if (!form.reportValidity()) return;
      done = true;
      m.close();
      resolve({ mine: mine.value.trim(), theirs: theirs.value.trim() });
    };
    const side = (e, input) => h('label.rel-edit-side', h('span.rel-edit-who', thumb(e), h('span', t('rel.is', { name: displayName(e) }))), input);
    const form = h('form.form', { onsubmit: (e) => { e.preventDefault(); submit(); } },
      h('p.muted.small.rel-edit-hint', t('rel.pairHint')),
      h('div.rel-edit', side(entity, mine), side(other, theirs)),
      note,
      h('datalist', { id: listId }, options.map((o) => h('option', { value: o }))),
      // Los más habituales, a un clic: van al campo en el que se esté escribiendo.
      h('div.rel-quick', common.slice(0, 12).map((o) => h('button.chip', { type: 'button', onclick: () => { last.value = o; last.focus(); sync(); } }, o))),
      h('button', { type: 'submit', hidden: true }));
    const m = modal({
      title: t(editing ? 'rel.edit' : 'rel.add'), body: form,
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(t('common.save'), { kind: 'primary', onClick: submit })],
      onClose: () => { if (!done) resolve(null); },
    });
    sync();
    setTimeout(() => mine.focus(), 0);
  });
}

/** Las flechas de un mapa que unen a `entity` con `other`: se cambian con `change(flecha, sale)` (null = quitarla). */
async function patchMapEdges(map, entity, other, change) {
  const nodes = Array.isArray(map.data.nodes) ? map.data.nodes : [];
  const idsOf = (e) => new Set(nodes.filter((n) => n.ref === e.id).map((n) => n.id));
  const [mine, theirs] = [idsOf(entity), idsOf(other)];
  const edges = [];
  for (const e of Array.isArray(map.data.edges) ? map.data.edges : []) {
    const out = mine.has(e.from) && theirs.has(e.to);
    const next = out || (theirs.has(e.from) && mine.has(e.to)) ? change(e, out) : e;
    if (next) edges.push(next);
  }
  await store.patchData(map.id, { edges });
}

/**
 * Deja la relación entre `entity` y `other` como se ha escrito, esté donde estuviera: una sola
 * anotación en la ficha de `entity` (ninguna en la del otro) y, en los mapas que los unen, el
 * mismo rótulo en sus flechas. Con `mine` y `theirs` vacíos, la quita de todas partes.
 */
async function writePair(entity, other, pair, mine, theirs) {
  const one = !mine || !theirs ? mine || theirs : '';
  const record = !mine && !theirs ? null : one ? { id: uid(), to: other.id, label: one, both: true } : { id: uid(), to: other.id, label: theirs, mine };
  // En esta ficha, en el sitio en el que estaba (o al final si es nueva).
  const own = rawRelations(entity);
  const at = own.findIndex((r) => r.to === other.id);
  const rest = own.filter((r) => r.to !== other.id);
  if (record) rest.splice(at < 0 ? rest.length : Math.min(at, rest.length), 0, record);
  await store.patchData(entity.id, { relations: rest });
  if (rawRelations(other).some((r) => r.to === entity.id)) await store.patchData(other.id, { relations: rawRelations(other).filter((r) => r.to !== entity.id) });
  for (const map of new Set(((pair && pair.edges) || []).map((x) => x.map))) {
    await patchMapEdges(map, entity, other, (e, out) => (!record ? null : one ? { ...e, label: one, both: true } : { ...e, label: out ? mine : theirs, both: false }));
  }
}

/** El panel de la ficha. `onChange` avisa cuando se añade, cambia o quita una relación. */
export function relationsPanel(entity, { onChange } = {}) {
  const wrap = h('section.panel.rel-panel');
  const run = async (work) => {
    try { await work(); } catch (err) { toast(errorText(err), 'error'); }
    draw();
    if (onChange) onChange();
  };
  const add = async () => {
    const other = await pickOther(entity);
    if (!other) return;
    const value = await pairDialog(entity, other);
    if (value) await run(() => writePair(entity, other, null, value.mine, value.theirs));
  };
  const edit = async (p) => {
    // Lo que hay ahora: lo de cada uno y, si además hay algo recíproco, en los dos.
    const join = (list) => [...list, ...(p.mine.length || p.theirs.length ? p.both : [])].join(', ');
    const now = p.mine.length || p.theirs.length ? { mine: join(p.mine), theirs: join(p.theirs) } : { mine: p.both.join(', '), theirs: '' };
    const value = await pairDialog(entity, p.other, now, true);
    if (!value || (value.mine === now.mine && value.theirs === now.theirs)) return;
    await run(() => writePair(entity, p.other, p, value.mine, value.theirs));
  };
  const remove = async (p) => {
    const maps = [...new Set(p.edges.map((x) => displayName(x.map)))];
    const message = t('rel.removeConfirm', { a: displayName(entity), b: p.name }) + (maps.length ? ' ' + t('rel.removeMaps', { maps: maps.map((x) => `«${x}»`).join(', ') }) : '');
    if (!(await confirmDialog(message, { danger: true, confirmLabel: t('common.remove') }))) return;
    await run(() => writePair(entity, p.other, p, '', ''));
  };

  // Una ficha de la pareja, como las tarjetas de las listas: foto, nombre, identificador y,
  // en el sitio del papel, lo que es para el otro.
  const ficha = (e, name, roles, link) => {
    const img = e ? profileImage(e) : null;
    return h(link ? 'a.rel-ficha' : 'div.rel-ficha', link ? { href: entityHref(e) } : {},
      img ? h('img.entity-thumb', { src: api.imageUrl(img), alt: '', loading: 'lazy' })
        : h('span.entity-thumb.placeholder', { style: e && e.data.color ? { background: e.data.color, color: '#fff' } : null }, icon(typeIcon(e), 20)),
      h('div.entity-card-body',
        h('div.entity-card-title', h('span.entity-card-name', { title: name }, name), e ? codeTag(e) : null),
        roles.length ? h('p.rel-role', roles.join(' · ')) : null));
  };

  function draw() {
    clear(wrap);
    const pairs = relationPairs(entity);
    wrap.append(h('div.panel-head', h('h3', t('rel.title'), pairs.length ? h('span.count-badge', String(pairs.length)) : null), addBtn(add, t('rel.add'))));
    if (!pairs.length) {
      wrap.append(h('p.muted.small', t('rel.empty')));
      return;
    }
    wrap.append(h('div.rel-pairs', pairs.map((p) => {
      const empty = !p.mine.length && !p.theirs.length && !p.both.length;
      // Un texto suelto de un mapa no tiene ficha: se cambia en el mapa.
      const tools = p.other
        ? [btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: () => edit(p) }),
          btn('', { icon: 'x', small: true, kind: 'ghost', title: t('common.remove'), onClick: () => remove(p) })]
        : [btn('', { icon: 'share', small: true, kind: 'ghost', title: t('rel.inMap', { name: displayName(p.edges[0].map) }), href: entityHref(p.edges[0].map) })];
      // Entre las dos fichas, la unión: en ella va lo que son los dos, si la relación es
      // recíproca, y los botones para cambiarla o quitarla.
      const tie = h('div', { class: 'rel-tie' + (p.both.length ? ' is-mutual' : '') },
        h('span.rel-tie-mark', p.both.length ? '↔' : null),
        p.both.length ? h('span.rel-role', { title: t('rel.bothTitle') }, p.both.join(' · ')) : empty ? h('span.muted.small', t('mindmap.noLabel')) : null,
        h('div.rel-tools', tools));
      return h('div.rel-pair', ficha(entity, displayName(entity), p.mine, false), tie, ficha(p.other, p.name, p.theirs, !!p.other));
    })));
  }
  draw();
  return wrap;
}
