// «Notas»: las notas del proyecto, ordenadas por etiqueta o por color (o todas seguidas). Una
// nota con varias etiquetas sale en el bloque de cada una. Dentro de cada bloque se reordenan
// arrastrando; las etiquetas y el color se eligen en la ficha de la nota.
import { h, clear } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { btn, addBtn, pageHeader, emptyState, menuButton, promptDialog, confirmDialog, sortable, listSearch, toast, errorText } from '../ui.js';
import { entityHref, searchText } from '../model.js';
import { NOTE_COLORS, noteColor, noteTags, hasTag, allNoteTags, noteCard } from '../notes.js';
import { ioMenu } from '../elementio.js';

const MODES = ['tag', 'color', 'none'];
const MODE_KEY = 'creabel.notesBy';

export async function notesPage({ el, pid }) {
  let saved = '';
  try { saved = localStorage.getItem(MODE_KEY) || ''; } catch (err) { saved = ''; }
  let mode = MODES.includes(saved) ? saved : 'tag';
  const body = h('div');

  const add = async (data = {}) => {
    const name = await promptDialog({ title: t('note.add'), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const note = await store.create('note', { name, data });
      location.hash = entityHref(note);
    } catch (err) { toast(errorText(err), 'error'); }
  };

  /** Cambia una etiqueta en todas las notas que la llevan (o la quita, si `next` está vacío). */
  const retag = async (tag, next, notes) => {
    try {
      for (const n of notes) {
        const tags = noteTags(n).filter((x) => x.toLowerCase() !== tag.toLowerCase());
        if (next && !tags.some((x) => x.toLowerCase() === next.toLowerCase())) tags.push(next);
        await store.patchData(n.id, { tags, group: '' });
      }
    } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };
  const renameTag = async (tag, notes) => {
    const name = await promptDialog({ title: t('note.renameTag'), label: t('note.tag'), value: tag });
    if (name && name !== tag) await retag(tag, name, notes);
  };
  const removeTag = async (tag, notes) => {
    if (await confirmDialog(tn('note.confirmRemoveTag', notes.length, { name: tag }), { confirmLabel: t('note.removeTag') })) await retag(tag, '', notes);
  };

  /** Un bloque: su título (con el número de notas y, si procede, acciones) y sus tarjetas. */
  const block = (title, notes, { swatch, actions, except } = {}) => {
    const grid = h('div.note-grid', notes.map((n) => noteCard(n, { except })));
    if (notes.length > 1 && !search.active()) sortable(grid, { axis: 'x', onSort: (ids) => store.reorder(ids) });
    return h('section.note-block',
      title ? h('header.note-block-head',
        swatch !== undefined ? h('span', { class: 'note-dot' + (swatch ? '' : ' none'), style: swatch ? { background: swatch } : null }) : null,
        h('h2', title), h('span.muted', String(notes.length)), h('span.spacer'), actions || null) : null,
      grid);
  };

  // El buscador mira el título, el texto, las etiquetas y los elementos enlazados; al escribir
  // solo se repintan los bloques.
  const listEl = h('div');
  const search = listSearch({ text: searchText, onChange: () => drawBlocks() });

  function draw() {
    clear(body);
    search.reset();
    const notes = store.list('note');
    if (!notes.length) {
      body.append(emptyState(t('note.empty'), btn(t('note.add'), { icon: 'plus', kind: 'primary', onClick: () => add() }), 'note'));
      return;
    }
    const opt = (key) => h('button', {
      type: 'button', class: 'seg-opt' + (mode === key ? ' active' : ''), 'aria-pressed': String(mode === key),
      onclick: () => { mode = key; try { localStorage.setItem(MODE_KEY, key); } catch (err) { /* no es crítico */ } draw(); },
    }, t('note.by.' + key));
    body.append(h('div.filter-row', search.el, h('span.seg', { role: 'group', 'aria-label': t('note.by') }, h('span.seg-label', t('note.by')), MODES.map(opt)),
      h('span.muted', tn('note.count', notes.length))), listEl);
    drawBlocks();
  }

  function drawBlocks() {
    const all = store.list('note');
    const notes = search.filter(all);
    search.setCount(notes.length, all.length);
    clear(listEl);
    if (!notes.length) {
      listEl.append(h('p.muted.empty-line', t('common.noMatches')));
      return;
    }
    if (mode === 'color') {
      for (const [key, hex] of NOTE_COLORS) {
        const list = notes.filter((n) => noteColor(n) === hex);
        if (list.length) listEl.append(block(t('note.color.' + key), list, { swatch: hex }));
      }
      const plain = notes.filter((n) => !noteColor(n));
      if (plain.length) listEl.append(block(t('note.color.none'), plain, { swatch: '' }));
      return;
    }
    if (mode === 'none') {
      listEl.append(block('', notes));
      return;
    }
    const tags = allNoteTags();
    for (const tag of tags) {
      const list = notes.filter((n) => hasTag(n, tag));
      if (!list.length) continue;
      listEl.append(block('#' + tag, list, { except: tag, actions: search.active() ? null : [
        addBtn(() => add({ tags: [tag] }), t('note.addIn', { tag })),
        menuButton(() => [
          { label: t('note.renameTag'), icon: 'edit', onClick: () => renameTag(tag, list) },
          { label: t('note.removeTag'), icon: 'x', onClick: () => removeTag(tag, list) },
        ], { small: true }),
      ] }));
    }
    const loose = notes.filter((n) => !noteTags(n).length);
    if (loose.length) listEl.append(block(tags.length ? t('note.noTags') : '', loose));
  }

  clear(el);
  el.append(
    pageHeader({ title: t('note.plural'), subtitle: t('note.hint'), actions: [
      ioMenu('note', { list: () => store.list('note'), onDone: draw }),
      btn(t('note.add'), { icon: 'plus', kind: 'primary', onClick: () => add() }),
    ] }),
    body);
  draw();
}
