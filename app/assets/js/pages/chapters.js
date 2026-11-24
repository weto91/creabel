// Capítulos: estructura de la novela (prólogo, partes, capítulos, epílogo) y ficha de capítulo.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { excerpt, formatNumber, formatDateTime } from '../text.js';
import {
  btn, pageHeader, emptyState, statusDot, promptDialog, confirmDialog, formDialog, menuButton,
  notFound, sortable, moveSortable, titleInput, toast, errorText, hoverPop,
} from '../ui.js';
import {
  chapterKind, chaptersOrdered, chapterNumbers, chapterLabel, chapterWords, chapterStatus, scenesOf, displayName, validIds,
  strandColor, strandSummary, sceneDuration, povLabel, readingLabel,
} from '../model.js';

/** Tiempo de lectura bajo las palabras de una fila (capítulo o escena). Nada si no hay texto. */
const readLine = (words) => (words > 0 ? h('span.row-read', { title: t('read.timeHint') }, readingLabel(words)) : null);
import { richFieldPage, autosaveDelay, codeTag, placeTags } from '../components.js';
import { detectAllScenes } from '../mentions.js';

async function createChapter(pid, kind, name, partId) {
  try {
    const c = await store.create('chapter', { name, parent_id: kind === 'chapter' ? partId || null : null, data: { kind } });
    location.hash = `#/p/${pid}/chapters/${c.id}`;
  } catch (err) {
    toast(errorText(err), 'error');
  }
}

/** Personajes con más presencia en un capítulo (hasta cuatro) y las tramas que toca. */
export function chapterCast(c) {
  const count = new Map();
  const strands = new Map(); // trama -> en cuántas escenas del capítulo está
  for (const s of scenesOf(c.id)) {
    const ids = new Set(validIds(s.data.characters));
    if (s.data.pov && store.get(s.data.pov.characterId)) ids.add(s.data.pov.characterId);
    for (const id of ids) count.set(id, (count.get(id) || 0) + 1);
    for (const id of validIds(s.data.strands)) strands.set(id, (strands.get(id) || 0) + 1);
  }
  return {
    people: [...count].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => displayName(store.get(id))),
    // Las tramas, en el orden en que están en Arquitectura.
    strands: store.list('strand').filter((s) => strands.has(s.id)).map((strand) => ({ strand, scenes: strands.get(strand.id) })),
  };
}

/** Crea una escena con su primera revisión y devuelve la escena. */
export async function createScene(chapterId, name) {
  const scene = await store.create('scene', { parent_id: chapterId, name });
  const rev = await store.create('revision', { parent_id: scene.id, position: 1 });
  await store.patchData(scene.id, { activeRevision: rev.id });
  return scene;
}

export async function chaptersPage({ el, pid, refresh }) {
  const all = store.list('chapter');
  const parts = store.list('part');
  const numbers = chapterNumbers();
  const prologue = all.find((c) => chapterKind(c) === 'prologue');
  const epilogue = all.find((c) => chapterKind(c) === 'epilogue');
  const normal = all.filter((c) => chapterKind(c) === 'chapter');
  const partOptions = () => [{ value: '', label: t('chapters.noPart') }, ...parts.map((p) => ({ value: p.id, label: displayName(p) }))];

  const addChapter = async () => {
    const fields = [{ name: 'name', label: t('chapters.title'), required: true }];
    if (parts.length) fields.push({ name: 'part', label: t('chapters.part'), type: 'select', options: partOptions(), value: parts[parts.length - 1].id });
    const out = await formDialog({ title: t('chapters.add'), fields, submitLabel: t('common.create') });
    if (out) await createChapter(pid, 'chapter', out.name, out.part || null);
  };
  const addPart = async () => {
    const name = await promptDialog({ title: t('chapters.addPart'), submitLabel: t('common.create') });
    if (!name) return;
    try { await store.create('part', { name }); refresh(); } catch (err) { toast(errorText(err), 'error'); }
  };

  // Objetivo de palabras por capítulo (ajustes del proyecto): cada fila muestra cuánto lleva.
  const chapterGoal = Number((store.project.data.goals || {}).chapterWords) || 0;

  const row = (c) => {
    const kind = chapterKind(c);
    const sceneCount = scenesOf(c.id).length;
    const words = chapterWords(c);
    const cast = chapterCast(c);
    const node = h('div.list-row', { dataset: kind === 'chapter' ? { id: c.id } : null },
      h('a.row-main', { href: `#/p/${pid}/chapters/${c.id}`, draggable: 'false' },
        statusDot(chapterStatus(c)),
        h('span.row-title', chapterLabel(c, numbers),
          cast.people.length ? h('span.row-sub.row-cast', h('span', icon('users', 13), cast.people.join(', '))) : null,
          // Las tramas del capítulo, como cuadros de color: al pasar el ratón (o manteniendo
          // pulsado en una pantalla táctil) sale el nombre, su clasificación y su descripción.
          cast.strands.length ? h('span.strand-tags', cast.strands.map(({ strand, scenes }) => hoverPop(
            h('span.strand-tag', { style: { '--strand': strandColor(strand) }, 'aria-label': displayName(strand), role: 'img' }),
            () => h('div.strand-pop',
              h('strong', displayName(strand)),
              strandSummary(strand) ? h('span.muted', strandSummary(strand)) : null,
              h('p', excerpt(strand.body, 320) || t('strand.noDescription')),
              h('span.muted', tn('chapters.strandScenes', scenes)))))) : null),
        h('span.row-meta',
          h('span', `${tn('count.scenes', sceneCount)} · ${chapterGoal ? `${formatNumber(words)} / ${tn('count.words', chapterGoal)}` : tn('count.words', words)}`),
          readLine(words),
          chapterGoal ? h('span', { class: 'mini-progress' + (words >= chapterGoal ? ' reached' : '') }, h('span', { style: { width: Math.min(100, (words / chapterGoal) * 100) + '%' } })) : null)),
      menuButton(() => [
        // Reordenar sin arrastrar (también con Alt+↑/↓ sobre la fila).
        kind === 'chapter' ? { label: t('common.moveUp'), icon: 'chevron-up', onClick: () => moveSortable(node, -1) } : null,
        kind === 'chapter' ? { label: t('common.moveDown'), icon: 'chevron-down', onClick: () => moveSortable(node, 1) } : null,
        kind === 'chapter' && parts.length ? { label: t('chapters.moveToPart'), icon: 'folder', onClick: async () => {
          const out = await formDialog({ title: t('chapters.moveToPart'), fields: [{ name: 'part', label: t('chapters.part'), type: 'select', options: partOptions(), value: c.parent_id || '' }] });
          if (!out) return;
          const target = out.part || null;
          const siblings = normal.filter((x) => (x.parent_id || null) === target && x.id !== c.id);
          await store.update(c.id, { parent_id: target, position: siblings.length ? siblings[siblings.length - 1].position + 1 : 0 });
          refresh();
        } } : null,
        { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
          if (!(await confirmDialog(t('chapters.confirmDelete', { name: chapterLabel(c, numbers) }), { danger: true, confirmLabel: t('common.delete') }))) return;
          try { await store.remove(c.id); refresh(); } catch (err) { toast(errorText(err), 'error'); }
        } },
      ], { small: true }));
    return node;
  };

  const chapterList = (items) => {
    const list = h('div.list', items.map(row));
    sortable(list, { axis: 'y', onSort: async (ids) => { await store.reorder(ids); refresh(); } });
    return list;
  };

  clear(el);
  el.append(pageHeader({
    title: t('nav.chapters'), subtitle: t('chapters.hint'),
    actions: [
      btn(t('board.title'), { icon: 'grid', href: `#/p/${pid}/board` }),
      btn(t('outline.title'), { icon: 'list', href: `#/p/${pid}/outline` }),
      menuButton(() => [
        { label: t('chapters.addPart'), icon: 'folder', onClick: addPart },
        { label: t('import.title'), icon: 'upload', onClick: () => { location.hash = `#/p/${pid}/import`; } },
        store.list('scene').length ? { label: t('chapters.detectAll'), icon: 'search', onClick: async () => {
          try {
            const n = await detectAllScenes();
            toast(n ? tn('chapters.detected', n) : t('chapters.detectedNone'), 'success');
            refresh();
          } catch (err) { toast(errorText(err), 'error'); }
        } } : null,
        !prologue ? { label: t('chapters.addPrologue'), icon: 'plus', onClick: () => createChapter(pid, 'prologue', '', null) } : null,
        !epilogue ? { label: t('chapters.addEpilogue'), icon: 'plus', onClick: () => createChapter(pid, 'epilogue', '', null) } : null,
      ], { label: t('chapters.structure'), icon: 'layers', kind: 'default' }),
      btn(t('chapters.add'), { icon: 'plus', kind: 'primary', onClick: addChapter }),
    ],
  }));

  if (!all.length && !parts.length) {
    el.append(emptyState(t('chapters.empty'), h('div.btn-row',
      btn(t('chapters.add'), { icon: 'plus', kind: 'primary', onClick: addChapter }),
      btn(t('import.title'), { icon: 'upload', href: `#/p/${pid}/import` })), 'book'));
    return;
  }

  const total = store.totalWords();
  el.append(h('p.totals', { title: total ? t('read.timeHint') : null },
    [tn('count.chapters', normal.length), tn('count.scenes', store.list('scene').length), tn('count.words', total), readingLabel(total)].filter(Boolean).join(' · ')));
  if (prologue) el.append(h('div.list', row(prologue)));

  for (const part of parts) {
    const items = normal.filter((c) => c.parent_id === part.id);
    el.append(h('div.part-head',
      h('h2', icon('folder', 17), h('span', displayName(part))),
      h('span.muted', { title: t('read.timeHint') }, (() => {
        const words = items.reduce((sum, c) => sum + chapterWords(c), 0);
        return [tn('count.words', words), readingLabel(words)].filter(Boolean).join(' · ');
      })()),
      menuButton(() => [
        { label: t('common.rename'), icon: 'edit', onClick: async () => {
          const name = await promptDialog({ title: t('common.rename'), value: part.name });
          if (name) { await store.update(part.id, { name }); refresh(); }
        } },
        { label: t('chapters.deletePart'), icon: 'trash', danger: true, onClick: async () => {
          if (!(await confirmDialog(t('chapters.confirmDeletePart', { name: displayName(part) }), { danger: true, confirmLabel: t('common.delete') }))) return;
          // Los capítulos no se borran: pasan a «sin parte».
          for (const c of items) await store.update(c.id, { parent_id: null });
          await store.remove(part.id);
          refresh();
        } },
      ], { small: true })));
    el.append(items.length ? chapterList(items) : h('p.muted.empty-line', t('chapters.partEmpty')));
  }

  const loose = normal.filter((c) => !c.parent_id || !store.get(c.parent_id));
  if (loose.length) {
    if (parts.length) el.append(h('div.part-head', h('h2', h('span', t('chapters.noPart')))));
    el.append(chapterList(loose));
  }
  if (epilogue) el.append(h('div.list', row(epilogue)));
}

export async function chapterPage({ el, pid, params, refresh }) {
  const c = store.get(params.id);
  if (!c || c.type !== 'chapter') return notFound(el, pid);
  const numbers = chapterNumbers();
  const ordered = chaptersOrdered();
  const index = ordered.findIndex((x) => x.id === c.id);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
  const scenes = scenesOf(c.id);
  const kind = chapterKind(c);
  const prefix = kind === 'chapter' ? t('chapters.chapterN', { n: numbers.get(c.id) }) : t('chapters.' + kind);

  const addScene = async () => {
    const name = await promptDialog({ title: t('scenes.add'), label: t('scenes.title'), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const scene = await createScene(c.id, name);
      location.hash = `#/p/${pid}/scenes/${scene.id}`;
    } catch (err) { toast(errorText(err), 'error'); }
  };

  const fieldCard = (field) => {
    const html = c.data[field] || '';
    return h('a.info-card', { href: `#/p/${pid}/chapters/${c.id}/${field}` },
      h('div.info-card-head', h('span.icon-badge', icon(field === 'reason' ? 'target' : 'note', 20)), h('h3', t('chapters.' + field)), statusDot(c.data[field + 'Status'] || 0)),
      h('p', { class: html ? '' : 'muted' }, excerpt(html, 170) || t(`chapters.${field}.hint`)));
  };

  const sceneRow = (s) => {
    // Bajo el título, siempre a la vista: cuándo ocurre y cuánto dura, quién narra y un cuadro
    // de color por cada lugar (los nombres largos de los lugares tapaban antes la fecha).
    const when = s.data.time ? formatDateTime(s.data.time) + (sceneDuration(s) ? ` · ${t('tags.lasts', { span: sceneDuration(s) })}` : '') : '';
    const pov = povLabel(s);
    const places = placeTags(s);
    // Cada grupo marcado en la escena se señala con su color.
    const groups = validIds(s.data.groups).map((id) => store.get(id));
    const node = h('div.list-row', { dataset: { id: s.id } },
      h('a.row-main', { href: `#/p/${pid}/scenes/${s.id}`, draggable: 'false' },
        statusDot(s.status),
        h('span.row-title',
          h('span.row-name', displayName(s), groups.map((g) => h('span.group-dot', { title: displayName(g), style: { background: g.data.color || '#7d8a93' } })), codeTag(s)),
          when || pov || places ? h('span.row-sub.scene-info',
            when ? h('span.scene-when', icon('clock', 12), h('span', when)) : null,
            pov ? h('span.scene-pov', pov) : null,
            places) : null),
        h('span.row-meta', h('span', tn('count.words', s.words || 0)), readLine(s.words || 0))),
      menuButton(() => [
        { label: t('common.moveUp'), icon: 'chevron-up', onClick: () => moveSortable(node, -1) },
        { label: t('common.moveDown'), icon: 'chevron-down', onClick: () => moveSortable(node, 1) },
        ordered.length > 1 ? { label: t('scenes.move'), icon: 'folder', onClick: async () => {
          const out = await formDialog({
            title: t('scenes.move'),
            fields: [{ name: 'chapter', label: t('scenes.moveTo'), type: 'select', value: c.id, options: ordered.map((x) => ({ value: x.id, label: chapterLabel(x, numbers) })) }],
          });
          if (!out || out.chapter === c.id) return;
          const target = scenesOf(out.chapter);
          await store.update(s.id, { parent_id: out.chapter, position: target.length ? target[target.length - 1].position + 1 : 0 });
          refresh();
        } } : null,
        { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
          if (!(await confirmDialog(t('scenes.confirmDelete', { name: displayName(s) }), { danger: true, confirmLabel: t('common.delete') }))) return;
          try { await store.remove(s.id); store.logWordsSoon(); refresh(); } catch (err) { toast(errorText(err), 'error'); }
        } },
      ], { small: true }));
    return node;
  };

  clear(el);
  el.append(pageHeader({
    back: { href: `#/p/${pid}/chapters`, label: t('nav.chapters') },
    titleNode: h('div.title-with-prefix', h('span.title-prefix', prefix), titleInput(c.name, async (name) => { await store.update(c.id, { name }); }, t('chapters.titlePlaceholder'))),
    subtitle: [tn('count.scenes', scenes.length), tn('count.words', chapterWords(c)), readingLabel(chapterWords(c)), t('status.' + chapterStatus(c))].filter(Boolean).join(' · '),
    actions: [
      btn(t('read.chapter'), { icon: 'eye', href: `#/p/${pid}/read?chapter=${c.id}` }),
      menuButton(() => [
        { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
          if (!(await confirmDialog(t('chapters.confirmDelete', { name: chapterLabel(c, numbers) }), { danger: true, confirmLabel: t('common.delete') }))) return;
          try { await store.remove(c.id); store.logWordsSoon(); location.hash = `#/p/${pid}/chapters`; } catch (err) { toast(errorText(err), 'error'); }
        } },
      ]),
    ],
  }));

  el.append(h('div.card-grid.two', fieldCard('reason'), fieldCard('notes')));

  el.append(h('div.section-head', h('div', h('h2', t('scenes.plural')), h('p.muted', t('scenes.hint'))), btn(t('scenes.add'), { icon: 'plus', kind: 'primary', onClick: addScene })));
  if (scenes.length) {
    const list = h('div.list', scenes.map(sceneRow));
    sortable(list, { axis: 'y', onSort: (ids) => store.reorder(ids) });
    el.append(list);
  } else {
    el.append(emptyState(t('scenes.empty'), btn(t('scenes.add'), { icon: 'plus', kind: 'primary', onClick: addScene }), 'feather'));
  }

  el.append(h('div.pager',
    prev ? h('a.pager-link', { href: `#/p/${pid}/chapters/${prev.id}` }, icon('chevron-left', 15), h('span', chapterLabel(prev, numbers))) : h('span'),
    next ? h('a.pager-link', { href: `#/p/${pid}/chapters/${next.id}` }, h('span', chapterLabel(next, numbers)), icon('chevron-right', 15)) : h('span')));
}

/** Editor del motivo o de las notas de un capítulo. */
export async function chapterFieldPage({ el, pid, params }) {
  const c = store.get(params.id);
  const field = params.field;
  if (!c || c.type !== 'chapter' || (field !== 'reason' && field !== 'notes')) return notFound(el, pid);
  clear(el);
  return richFieldPage(el, {
    title: `${t('chapters.' + field)} — ${chapterLabel(c)}`,
    hint: t(`chapters.${field}.hint`),
    back: { href: `#/p/${pid}/chapters/${c.id}`, label: chapterLabel(c) },
    html: c.data[field] || '',
    status: c.data[field + 'Status'] || 0,
    lang: store.project.language,
    onHtml: (html) => store.patchData(c.id, { [field]: html }, autosaveDelay()),
    onStatus: (s) => store.patchData(c.id, { [field + 'Status']: s }),
  });
}
