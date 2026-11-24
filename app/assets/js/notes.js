// Notas: además de su texto, una nota puede llevar un color, pertenecer a un grupo (para verlas
// ordenadas en su apartado) y estar enlazada con otros elementos del proyecto: personajes,
// lugares, objetos, grupos, fichas propias, tramas, capítulos y escenas.
//   note.data.color  color (hex) de la paleta de notas, o vacío
//   note.data.group  nombre del grupo, o vacío
//   note.data.links  ids de los elementos con los que está enlazada
import { h, clear, icon } from './dom.js';
import { t } from './i18n.js';
import { store } from './store.js';
import { excerpt } from './text.js';
import { addBtn, linkBtn, chooseBtn, pickDialog, promptDialog, toast, errorText } from './ui.js';
import {
  displayName, entityHref, allScenesOrdered, chaptersOrdered, chapterLabel, chapterNumbers, customType,
} from './model.js';
import { pickItem, miniCard } from './components.js';

/** Colores que puede llevar una nota (se ven bien en claro y en oscuro). */
export const NOTE_COLORS = [
  ['red', '#c0504d'], ['orange', '#d08a3c'], ['yellow', '#c2a52e'], ['green', '#5a9a5a'],
  ['teal', '#3d9a96'], ['blue', '#4a7fb8'], ['purple', '#8a67b0'], ['gray', '#7d8a93'],
];
const LINK_TYPES = ['character', 'location', 'object', 'group', 'custom', 'strand'];

export const noteColor = (note) => (NOTE_COLORS.some(([, hex]) => hex === note.data.color) ? note.data.color : '');
export const noteLinks = (note) => (Array.isArray(note.data.links) ? note.data.links : []).filter((id) => store.get(id));

/**
 * Etiquetas de una nota: puede llevar varias y así estar en varias agrupaciones a la vez.
 * (Las notas anteriores tenían un solo «grupo», en data.group: se lee como su única etiqueta.)
 */
export function noteTags(note) {
  const raw = Array.isArray(note.data.tags) ? note.data.tags : note.data.group ? [note.data.group] : [];
  const out = [];
  for (const tag of raw.map((x) => String(x || '').trim()).filter(Boolean)) {
    if (!out.some((x) => x.toLowerCase() === tag.toLowerCase())) out.push(tag);
  }
  return out;
}
export const hasTag = (note, tag) => noteTags(note).some((x) => x.toLowerCase() === String(tag).toLowerCase());

/** Notas enlazadas con un elemento. */
export function notesFor(id) {
  return store.list('note').filter((n) => noteLinks(n).includes(id));
}

/** Todas las etiquetas que se usan, por orden alfabético (cada una como se escribió la primera vez). */
export function allNoteTags() {
  const seen = new Map();
  for (const note of store.list('note')) for (const tag of noteTags(note)) if (!seen.has(tag.toLowerCase())) seen.set(tag.toLowerCase(), tag);
  return [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/** Nombre de aquello con lo que se enlaza una nota (una escena lleva delante su capítulo). */
export function linkName(e, numbers) {
  if (e.type === 'scene') {
    const chapter = store.get(e.parent_id);
    return `${chapter ? chapterLabel(chapter, numbers || chapterNumbers()) + ' › ' : ''}${displayName(e)}`;
  }
  return e.type === 'chapter' ? chapterLabel(e, numbers || chapterNumbers()) : displayName(e);
}

/** Opciones del selector «enlazar con»: fichas de cada tipo, capítulos y escenas. */
function linkItems() {
  const numbers = chapterNumbers();
  const items = LINK_TYPES.flatMap((type) => store.list(type).map((e) => pickItem(e, {
    group: type === 'custom' ? (customType(e) || {}).name || t('custom.plural') : t(type + '.plural'),
  })));
  for (const c of chaptersOrdered()) items.push({ id: c.id, label: chapterLabel(c, numbers), icon: 'book', group: t('nav.chapters') });
  for (const s of allScenesOrdered()) items.push({ id: s.id, label: linkName(s, numbers), icon: 'feather', group: t('scenes.plural') });
  return items;
}

/** Fila de un elemento enlazado: su ficha pequeña, o un enlace si es un capítulo o una escena. */
function linkedRow(e, onRemove) {
  if (LINK_TYPES.includes(e.type)) return miniCard(e, { onRemove });
  return h('div.mini-card', { dataset: { id: e.id } },
    h('span.mini-thumb.placeholder', icon(e.type === 'scene' ? 'feather' : 'book', 17)),
    h('a.mini-text', { href: entityHref(e) }, h('span.mini-name', linkName(e)), h('span.mini-sub', t(e.type === 'scene' ? 'scenes.singular' : 'chapters.singular'))),
    onRemove ? h('button.chip-x', { type: 'button', 'aria-label': t('common.remove'), title: t('common.remove'), onclick: onRemove }, icon('x', 13)) : null);
}

/** En la ficha de una nota: su grupo, su color y con qué está enlazada. */
export function noteSettingsPanel(note) {
  const wrap = h('section.panel.note-settings');
  const draw = (focusTags) => {
    clear(wrap);
    // Etiquetas: se escriben (Intro o coma para añadir) o se eligen de las que ya existen.
    const tags = noteTags(note);
    const listId = 'note-tags-' + note.id;
    const saveTags = (next) => store.patchData(note.id, { tags: next, group: '' });
    const tagInput = h('input.input', { type: 'text', maxlength: 40, list: listId, placeholder: t('note.tagsPlaceholder'), 'aria-label': t('note.tags') });
    const addTags = async () => {
      const names = tagInput.value.split(',').map((x) => x.trim()).filter(Boolean);
      if (!names.length) return;
      const next = [...tags];
      for (const name of names) if (!next.some((x) => x.toLowerCase() === name.toLowerCase())) next.push(name);
      await saveTags(next);
      draw(true);
    };
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTags(); }
    });
    tagInput.addEventListener('change', addTags);
    const current = noteColor(note);
    const swatch = (key, hex) => h('button', {
      type: 'button', class: 'note-swatch' + (hex === current ? ' active' : '') + (hex ? '' : ' none'), title: t('note.color.' + key), 'aria-label': t('note.color.' + key),
      'aria-pressed': String(hex === current), style: hex ? { background: hex } : null,
      onclick: async () => { await store.patchData(note.id, { color: hex }); draw(); },
    }, hex === current && hex ? icon('check', 13) : null);
    const links = noteLinks(note).map((id) => store.get(id));
    const choose = async () => {
      const picked = await pickDialog({ title: t('note.links'), items: linkItems(), selected: links.map((e) => e.id), emptyText: t('tags.noneAvailable') });
      if (!picked) return;
      await store.patchData(note.id, { links: picked });
      draw();
    };
    wrap.append(
      h('div.form-row', h('span.form-label', t('note.tags')),
        tags.length ? h('div.chips', tags.map((tag) => h('span.chip', h('span', tag),
          h('button.chip-x', { type: 'button', 'aria-label': t('common.remove'), onclick: async () => { await saveTags(tags.filter((x) => x !== tag)); draw(); } }, icon('x', 12))))) : null,
        tagInput,
        h('datalist', { id: listId }, allNoteTags().filter((tag) => !hasTag(note, tag)).map((tag) => h('option', { value: tag }))),
        h('span.form-hint', t('note.tagsHint'))),
      h('div.form-row', h('span.form-label', t('note.color')),
        h('div.note-swatches', { role: 'group', 'aria-label': t('note.color') }, swatch('none', ''), NOTE_COLORS.map(([key, hex]) => swatch(key, hex)))),
      h('div.tag-field',
        h('div.tag-head', h('span.form-label', t('note.links')), chooseBtn(choose)),
        links.length
          ? h('div.mini-cards', links.map((e) => linkedRow(e, async () => { await store.patchData(note.id, { links: noteLinks(note).filter((id) => id !== e.id) }); draw(); })))
          : h('p.muted.small', t('note.linksNone'))));
    if (focusTags) tagInput.focus(); // tras añadir una etiqueta, se sigue escribiendo la siguiente
  };
  draw();
  return wrap;
}

/** Tarjeta de una nota: color, nombre, comienzo del texto, etiquetas y con qué está enlazada. `except`: etiqueta que no hace falta repetir. */
export function noteCard(note, { except = '' } = {}) {
  const color = noteColor(note);
  const tags = noteTags(note).filter((tag) => tag.toLowerCase() !== except.toLowerCase());
  const links = noteLinks(note).map((id) => store.get(id));
  const names = links.slice(0, 3).map((e) => displayName(e)).join(', ') + (links.length > 3 ? ` +${links.length - 3}` : '');
  return h('a.note-card', { href: entityHref(note), dataset: { id: note.id }, style: color ? { borderTopColor: color } : null, draggable: 'false' },
    h('div.note-card-title', displayName(note)),
    note.body ? h('p.note-card-text', excerpt(note.body, 150)) : null,
    tags.length ? h('p.note-card-meta.note-card-tags', tags.map((tag) => h('span', '#' + tag))) : null,
    links.length ? h('p.note-card-meta', icon('link', 12), names) : null);
}

/**
 * En la ficha de cualquier elemento (o de una escena): las notas enlazadas con él, con botones
 * para escribir una nueva ya enlazada o enlazar una que existe. `onChange` avisa de los cambios.
 */
export function notesPanel(target, { onChange } = {}) {
  const wrap = h('section.panel.notes-panel');
  const changed = () => { draw(); if (onChange) onChange(); };
  const draw = () => {
    clear(wrap);
    const notes = notesFor(target.id);
    const add = async () => {
      const name = await promptDialog({ title: t('note.add'), submitLabel: t('common.create') });
      if (!name) return;
      try {
        const note = await store.create('note', { name, data: { links: [target.id] } });
        location.hash = entityHref(note);
      } catch (err) { toast(errorText(err), 'error'); }
    };
    const link = async () => {
      const all = store.list('note');
      const picked = await pickDialog({
        title: t('note.linkExisting'), selected: notes.map((n) => n.id), emptyText: t('note.empty'),
        items: all.map((n) => ({ id: n.id, label: displayName(n), sub: noteTags(n).map((tag) => '#' + tag).join(' '), icon: 'note' })),
      });
      if (!picked) return;
      for (const n of all) {
        const has = noteLinks(n).includes(target.id);
        const want = picked.includes(n.id);
        if (has !== want) await store.patchData(n.id, { links: want ? [...noteLinks(n), target.id] : noteLinks(n).filter((id) => id !== target.id) });
      }
      changed();
    };
    wrap.append(
      h('div.panel-head', h('h3', t('note.plural')),
        h('div.btn-row',
          store.list('note').length ? linkBtn(link, t('note.linkExisting')) : null,
          addBtn(add, t('note.add')))),
      notes.length
        ? h('div.note-rows', notes.map((n) => h('a.note-row', { href: entityHref(n), style: noteColor(n) ? { borderLeftColor: noteColor(n) } : null },
          h('strong', displayName(n)), n.body ? h('span.muted', excerpt(n.body, 90)) : null)))
        : h('p.muted', t('note.noneLinked')));
  };
  draw();
  return wrap;
}
