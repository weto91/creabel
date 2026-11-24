// Esquema: la novela como un árbol de partes, capítulos y escenas que se puede recorrer,
// crear, renombrar, mover y plegar sin soltar el teclado, o arrastrando con el ratón.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { btn, pageHeader, statusDot, confirmDialog, toast, errorText } from '../ui.js';
import { chapterKind, chapterNumbers, chapterStatus, chapterWords, scenesOf, displayName, entityHref } from '../model.js';
import { createScene } from './chapters.js';

const KEY = 'creabel.outline';
const ICONS = { part: 'folder', chapter: 'book', scene: 'feather' };

export async function outlinePage({ el, pid }) {
  let collapsed = new Set();
  try { collapsed = new Set((JSON.parse(localStorage.getItem(KEY) || '{}') || {})[pid] || []); } catch (err) { collapsed = new Set(); }
  const saveCollapsed = () => {
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
      all[pid] = [...collapsed].filter((id) => store.get(id));
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch (err) { /* sin almacenamiento local: el plegado no se recuerda */ }
  };

  let focusId = null;
  let editingId = null;
  let drag = null; // { id, type }
  const tree = h('div.outline', { role: 'tree', tabindex: '0', 'aria-label': t('outline.title') });
  const totals = h('p.totals');

  // ---------- Estructura ----------

  const partOf = (c) => (chapterKind(c) === 'chapter' && c.parent_id && store.get(c.parent_id) ? c.parent_id : null);
  const chaptersIn = (partId) => store.list('chapter').filter((c) => chapterKind(c) === 'chapter' && partOf(c) === partId);
  const special = (kind) => store.list('chapter').find((c) => chapterKind(c) === kind);

  /** Hermanos de un elemento, en orden. */
  const siblings = (e) => {
    if (e.type === 'scene') return scenesOf(e.parent_id);
    if (e.type === 'part') return store.list('part');
    return chapterKind(e) === 'chapter' ? chaptersIn(partOf(e)) : [e];
  };

  /** Filas visibles: [{ e, type, depth, hasChildren }] */
  const rows = () => {
    const out = [];
    const chapter = (c, depth) => {
      const scenes = scenesOf(c.id);
      out.push({ e: c, type: 'chapter', depth, hasChildren: scenes.length > 0 });
      if (!collapsed.has(c.id)) for (const s of scenes) out.push({ e: s, type: 'scene', depth: depth + 1, hasChildren: false });
    };
    const prologue = special('prologue');
    if (prologue) chapter(prologue, 0);
    for (const p of store.list('part')) {
      const list = chaptersIn(p.id);
      out.push({ e: p, type: 'part', depth: 0, hasChildren: list.length > 0 });
      if (!collapsed.has(p.id)) for (const c of list) chapter(c, 1);
    }
    for (const c of chaptersIn(null)) chapter(c, 0);
    const epilogue = special('epilogue');
    if (epilogue) chapter(epilogue, 0);
    return out;
  };

  const movable = (e) => e.type !== 'chapter' || chapterKind(e) === 'chapter';

  // ---------- Operaciones ----------

  const guard = async (fn) => {
    try { await fn(); } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  /** Coloca `id` justo después de `afterId` entre sus hermanos (o al final). */
  const placeAfter = async (list, id, afterId) => {
    const ids = list.map((x) => x.id).filter((x) => x !== id);
    const at = afterId ? ids.indexOf(afterId) : -1;
    ids.splice(at >= 0 ? at + 1 : ids.length, 0, id);
    await store.reorder(ids);
  };

  const addScene = (chapterId, afterId) => guard(async () => {
    const scene = await createScene(chapterId, '');
    await placeAfter(scenesOf(chapterId), scene.id, afterId);
    collapsed.delete(chapterId);
    focusId = scene.id;
    editingId = scene.id;
  });
  const addChapter = (partId, afterId) => guard(async () => {
    const c = await store.create('chapter', { name: '', parent_id: partId || null, data: { kind: 'chapter' } });
    await placeAfter(chaptersIn(partId || null), c.id, afterId);
    if (partId) collapsed.delete(partId);
    focusId = c.id;
    editingId = c.id;
  });
  const addPart = (afterId) => guard(async () => {
    const p = await store.create('part', { name: '' });
    await placeAfter(store.list('part'), p.id, afterId);
    focusId = p.id;
    editingId = p.id;
  });

  /** Intro: un hermano del mismo tipo justo debajo. */
  const addSibling = (e) => {
    if (e.type === 'scene') return addScene(e.parent_id, e.id);
    if (e.type === 'part') return addPart(e.id);
    return chapterKind(e) === 'chapter' ? addChapter(partOf(e), e.id) : addChapter(null, null);
  };
  /** Mayús+Intro: un hijo (capítulo dentro de la parte, escena dentro del capítulo). */
  const addChild = (e) => {
    if (e.type === 'part') return addChapter(e.id, null);
    if (e.type === 'chapter') return addScene(e.id, null);
    return addScene(e.parent_id, e.id);
  };

  const remove = async (e) => {
    const message = e.type === 'chapter' ? t('chapters.confirmDelete', { name: displayName(e) })
      : e.type === 'scene' ? t('scenes.confirmDelete', { name: displayName(e) })
        : t('chapters.confirmDeletePart', { name: displayName(e) });
    if (!(await confirmDialog(message, { danger: true, confirmLabel: t('common.delete') }))) { tree.focus(); return; }
    const list = rows();
    const index = list.findIndex((r) => r.e.id === e.id);
    await guard(async () => {
      // Al borrar una parte sus capítulos no se pierden: pasan a «sin parte».
      if (e.type === 'part') for (const c of chaptersIn(e.id)) await store.update(c.id, { parent_id: null });
      await store.remove(e.id);
      store.logWordsSoon();
      const next = list[index + 1] || list[index - 1];
      focusId = next && store.get(next.e.id) ? next.e.id : null;
    });
    tree.focus();
  };

  /** Alt+flechas: sube o baja entre sus hermanos; una escena en el borde pasa al capítulo vecino. */
  const move = (e, delta) => guard(async () => {
    if (!movable(e)) return;
    const list = siblings(e).map((x) => x.id);
    const i = list.indexOf(e.id);
    const j = i + delta;
    if (j >= 0 && j < list.length) {
      [list[i], list[j]] = [list[j], list[i]];
      await store.reorder(list);
      return;
    }
    if (e.type !== 'scene') return;
    const chapters = rows().filter((r) => r.type === 'chapter').map((r) => r.e);
    const target = chapters[chapters.findIndex((c) => c.id === e.parent_id) + delta];
    if (!target) return;
    const ids = scenesOf(target.id).map((s) => s.id);
    if (delta < 0) ids.push(e.id);
    else ids.unshift(e.id);
    await store.update(e.id, { parent_id: target.id });
    await store.reorder(ids);
    collapsed.delete(target.id);
  });

  const toggle = (id, open) => {
    const isOpen = !collapsed.has(id);
    if (open === isOpen) return;
    if (isOpen) collapsed.add(id);
    else collapsed.delete(id);
    saveCollapsed();
    draw();
  };

  const rename = async (e, name) => {
    editingId = null;
    if (name !== (e.name || '')) await guard(() => store.update(e.id, { name }));
    else draw();
    tree.focus();
  };

  // ---------- Arrastrar y soltar ----------

  /** Dónde caería lo arrastrado sobre una fila: 'before' | 'after' | 'into' | null. */
  const dropMode = (row, ev) => {
    if (!drag || drag.id === row.e.id) return null;
    const half = () => {
      const r = ev.currentTarget.getBoundingClientRect();
      return ev.clientY > r.top + r.height / 2 ? 'after' : 'before';
    };
    if (drag.type === 'scene') return row.type === 'scene' ? half() : row.type === 'chapter' ? 'into' : null;
    if (drag.type === 'chapter') return row.type === 'chapter' && chapterKind(row.e) === 'chapter' ? half() : row.type === 'part' ? 'into' : null;
    return row.type === 'part' ? half() : null;
  };

  const drop = (row, mode) => guard(async () => {
    const e = store.get(drag.id);
    if (!e || !mode) return;
    let parent;
    let list;
    if (e.type === 'scene') {
      parent = mode === 'into' ? row.e.id : row.e.parent_id;
      list = scenesOf(parent);
    } else if (e.type === 'chapter') {
      parent = mode === 'into' ? row.e.id : partOf(row.e);
      list = chaptersIn(parent);
    } else {
      parent = null;
      list = store.list('part');
    }
    const ids = list.map((x) => x.id).filter((x) => x !== e.id);
    const at = mode === 'into' ? ids.length : ids.indexOf(row.e.id) + (mode === 'after' ? 1 : 0);
    ids.splice(at, 0, e.id);
    if (e.type !== 'part' && (e.parent_id || null) !== (parent || null)) await store.update(e.id, { parent_id: parent || null });
    await store.reorder(ids);
    if (mode === 'into') collapsed.delete(row.e.id);
    focusId = e.id;
  });

  // ---------- Dibujo ----------

  const draw = () => {
    const list = rows();
    const numbers = chapterNumbers();
    if (!list.some((r) => r.e.id === focusId)) focusId = list.length ? list[0].e.id : null;
    clear(tree);
    clear(totals).append(`${tn('count.chapters', store.list('chapter').length)} · ${tn('count.scenes', store.list('scene').length)} · ${tn('count.words', store.totalWords())}`);
    if (!list.length) {
      tree.append(h('p.muted.outline-empty', t('outline.empty')));
      return;
    }
    for (const row of list) {
      const { e, type, depth } = row;
      const kind = type === 'chapter' ? chapterKind(e) : null;
      const open = !collapsed.has(e.id);
      const prefix = type === 'chapter' ? (kind === 'chapter' ? `${numbers.get(e.id)}.` : t('chapters.' + kind)) : '';
      const words = type === 'scene' ? e.words || 0 : type === 'chapter' ? chapterWords(e) : chaptersIn(e.id).reduce((sum, c) => sum + chapterWords(c), 0);

      let title;
      if (editingId === e.id) {
        title = h('input.input.outline-input', { type: 'text', maxlength: 250, placeholder: t(type === 'scene' ? 'scenes.titlePlaceholder' : type === 'part' ? 'chapters.part' : 'chapters.titlePlaceholder') });
        title.value = e.name || '';
        let done = false;
        const commit = (save) => { if (done) return; done = true; rename(e, save ? title.value.trim() : e.name || ''); };
        title.addEventListener('keydown', (ev) => {
          ev.stopPropagation();
          if (ev.key === 'Enter') { ev.preventDefault(); commit(true); }
          else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); }
        });
        title.addEventListener('blur', () => commit(true));
        setTimeout(() => { title.focus(); title.select(); }, 0);
      } else {
        title = h('span', { class: 'outline-title' + (e.name && e.name.trim() ? '' : ' untitled') },
          prefix ? h('span.outline-prefix', prefix) : null,
          kind && kind !== 'chapter' && !(e.name && e.name.trim()) ? null : displayName(e));
      }

      const node = h('div', {
        class: `outline-row is-${type}` + (focusId === e.id ? ' focused' : ''),
        role: 'treeitem', 'aria-level': depth + 1, 'aria-selected': String(focusId === e.id), 'aria-expanded': row.hasChildren ? String(open) : null,
        dataset: { id: e.id }, style: { paddingLeft: 8 + depth * 24 + 'px' },
        draggable: movable(e) && editingId !== e.id ? 'true' : null,
        onclick: () => { if (focusId !== e.id) { focusId = e.id; draw(); } tree.focus(); },
        ondblclick: () => { editingId = e.id; draw(); },
        ondragstart: (ev) => {
          drag = { id: e.id, type };
          ev.dataTransfer.effectAllowed = 'move';
          try { ev.dataTransfer.setData('text/plain', e.id); } catch (err) { /* algunos navegadores lo restringen */ }
        },
        ondragover: (ev) => {
          const mode = dropMode(row, ev);
          if (!mode) return;
          ev.preventDefault();
          for (const cls of ['drop-before', 'drop-after', 'drop-into']) node.classList.toggle(cls, cls === 'drop-' + mode);
        },
        ondragleave: () => node.classList.remove('drop-before', 'drop-after', 'drop-into'),
        ondrop: (ev) => {
          const mode = dropMode(row, ev);
          if (!mode) return;
          ev.preventDefault();
          drop(row, mode);
        },
        ondragend: () => { drag = null; },
      },
        row.hasChildren
          ? h('button.outline-caret', { type: 'button', tabindex: '-1', 'aria-label': t(open ? 'outline.collapse' : 'outline.expand'), onclick: (ev) => { ev.stopPropagation(); focusId = e.id; toggle(e.id, !open); } }, icon(open ? 'chevron-down' : 'chevron-right', 14))
          : h('span.outline-caret'),
        h('span.outline-icon', icon(ICONS[type], 15)),
        type === 'part' ? null : statusDot(type === 'chapter' ? chapterStatus(e) : e.status),
        title,
        h('span.outline-meta', type === 'chapter' && row.hasChildren && !open ? `${tn('count.scenes', scenesOf(e.id).length)} · ` : '', tn('count.words', words)),
        type === 'part' ? h('span.outline-open') : h('a.outline-open', { href: entityHref(e), tabindex: '-1', title: t('outline.open'), onclick: (ev) => ev.stopPropagation() }, icon('chevron-right', 15)));
      tree.append(node);
    }
    const current = tree.querySelector('.outline-row.focused');
    if (current && editingId === null) current.scrollIntoView({ block: 'nearest' });
  };

  // ---------- Teclado ----------

  tree.addEventListener('keydown', (ev) => {
    if (editingId) return;
    const list = rows();
    const index = list.findIndex((r) => r.e.id === focusId);
    const row = list[index];
    if (!row) return;
    const e = row.e;
    const go = (i) => { if (list[i]) { focusId = list[i].e.id; draw(); } };
    const handled = () => { ev.preventDefault(); ev.stopPropagation(); };

    if (ev.altKey && (ev.key === 'ArrowUp' || ev.key === 'ArrowDown')) { handled(); move(e, ev.key === 'ArrowUp' ? -1 : 1); return; }
    if (ev.ctrlKey || ev.metaKey) {
      if (ev.key === 'Enter' && row.type !== 'part') { handled(); location.hash = entityHref(e); }
      return;
    }
    switch (ev.key) {
      case 'ArrowDown': handled(); go(index + 1); break;
      case 'ArrowUp': handled(); go(index - 1); break;
      case 'Home': handled(); go(0); break;
      case 'End': handled(); go(list.length - 1); break;
      case 'ArrowRight':
        handled();
        if (row.hasChildren && collapsed.has(e.id)) toggle(e.id, true);
        else if (row.hasChildren) go(index + 1);
        break;
      case 'ArrowLeft':
        handled();
        if (row.hasChildren && !collapsed.has(e.id)) toggle(e.id, false);
        else {
          // Sube al elemento que lo contiene.
          for (let i = index - 1; i >= 0; i--) if (list[i].depth < row.depth) { go(i); break; }
        }
        break;
      case 'Enter': handled(); if (ev.shiftKey) addChild(e); else addSibling(e); break;
      case 'F2': handled(); editingId = e.id; draw(); break;
      case 'Delete': handled(); remove(e); break;
      default: break;
    }
  });

  const enter = t('kbd.enter');
  const keys = [
    ['↑ ↓', 'outline.key.move'], ['← →', 'outline.key.fold'], [enter, 'outline.key.sibling'], [`${t('kbd.shift')}+${enter}`, 'outline.key.child'],
    ['F2', 'outline.key.rename'], ['Alt+↑ ↓', 'outline.key.reorder'], [`Ctrl+${enter}`, 'outline.key.open'], [t('kbd.delete'), 'outline.key.delete'],
  ];

  clear(el);
  el.append(
    pageHeader({
      title: t('outline.title'), subtitle: t('outline.hint'),
      back: { href: `#/p/${pid}/chapters`, label: t('nav.chapters') },
      actions: [
        btn(t('chapters.addPart'), { icon: 'folder', onClick: () => addPart(null) }),
        btn(t('chapters.add'), { icon: 'plus', kind: 'primary', onClick: () => addChapter(null, null) }),
      ],
    }),
    totals, tree,
    h('p.outline-keys', keys.map(([key, label]) => h('span', h('kbd', key), ' ', t(label)))));
  draw();
  tree.focus({ preventScroll: true });
}
