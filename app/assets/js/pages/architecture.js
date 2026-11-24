// Arquitectura de la novela: premisa, fábula, ambientación, notas globales y tramas.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { excerpt, htmlToText, sanitizeHtml } from '../text.js';
import { btn, pageHeader, statusDot, promptDialog, notFound, sortable, listSearch, toast, errorText } from '../ui.js';
import {
  ARCH_KEYS, archItem, ensureArchitecture, displayName, searchText, strandLevel, strandKind, strandSummary, strandColor, STRAND_LEVELS,
  allScenesOrdered, chaptersOrdered, chapterNumbers, chapterLabel, scenesOf, validIds,
} from '../model.js';
import { richFieldPage, autosaveDelay } from '../components.js';
import { ioMenu } from '../elementio.js';

const ARCH_ICONS = { premise: 'target', fabula: 'book', setting: 'pin', globalnotes: 'note' };

export async function architecturePage({ el, pid, refresh }) {
  await ensureArchitecture();

  const addStrand = async () => {
    const name = await promptDialog({ title: t('strand.add'), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const e = await store.create('strand', { name });
      location.hash = `#/p/${pid}/strands/${e.id}`;
    } catch (err) { toast(errorText(err), 'error'); }
  };

  clear(el);
  el.append(pageHeader({ title: t('nav.architecture'), subtitle: t('arch.hint'), actions: [btn(t('arch.readAll'), { icon: 'eye', href: `#/p/${pid}/architecture/read` })] }));

  // ----- Premisa, fábula, ambientación y notas generales: cuatro columnas al mismo nivel
  // (la de notas, algo más estrecha) -----
  el.append(h('div.arch-pillars', ARCH_KEYS.map((key) => {
    const item = archItem(key);
    const text = item ? excerpt(item.body, 220) : '';
    const words = item ? item.words || 0 : 0;
    return h('a', { class: 'arch-pillar' + (key === 'globalnotes' ? ' minor' : ''), href: `#/p/${pid}/architecture/${key}` },
      h('span.arch-kicker', icon(ARCH_ICONS[key], 14), t('arch.' + key), statusDot(item ? item.status : 0)),
      h('p', { class: text ? '' : 'muted' }, text || t(`arch.${key}.hint`)),
      h('span.arch-meta', words ? tn('count.words', words) : t('arch.empty')));
  })));

  // ----- Tramas: por peso, con su recorrido por el libro -----
  // Cada fila enseña en qué escenas está la trama (una raya por escena, en orden de lectura):
  // así se ve cuánto pesa, dónde empieza, dónde se pierde y qué tramas no llegan al final.
  const strands = store.list('strand');
  const scenes = allScenesOrdered();
  const firstOfChapter = new Set(chaptersOrdered().map((c) => (scenesOf(c.id)[0] || {}).id).filter(Boolean));
  const numbers = chapterNumbers();
  const inStrand = (scene, s) => validIds(scene.data.strands).includes(s.id);
  const orphan = scenes.filter((scene) => !validIds(scene.data.strands).length).length;

  const row = (s) => {
    const on = scenes.map((scene) => inStrand(scene, s));
    const total = on.filter(Boolean).length;
    const kind = strandKind(s) ? t('strand.kindShort.' + strandKind(s)) : '';
    const text = excerpt(s.body, 140);
    return h('a.arch-strand', { href: `#/p/${pid}/strands/${s.id}`, dataset: { id: s.id }, draggable: 'false' },
      h('span.arch-strand-mark', { style: { background: strandColor(s) } }),
      h('span.arch-strand-main',
        h('span.arch-strand-name', { title: displayName(s) }, displayName(s)),
        h('span.arch-strand-sub', [kind, text || t('strand.noDescription')].filter(Boolean).join(' · '))),
      scenes.length ? h('span.arch-track', { title: t('arch.trackTitle') }, scenes.map((scene, i) => h('span', {
        class: 'arch-cell' + (on[i] ? ' on' : '') + (firstOfChapter.has(scene.id) ? ' first' : ''),
        style: on[i] ? { background: strandColor(s) } : null,
        title: `${chapterLabel(store.get(scene.parent_id), numbers)} · ${displayName(scene)}`,
      }))) : null,
      h('span.arch-strand-count', total ? tn('count.scenes', total) : t('arch.noScenes')),
      statusDot(s.status));
  };
  // El buscador filtra las tramas por nombre, descripción, importancia o tipo; mientras se
  // busca no se reordena (faltarían filas).
  const listEl = h('div');
  const search = listSearch({ text: (s) => `${searchText(s)} ${strandSummary(s)}`, onChange: () => drawStrands() });
  const group = (key, list) => {
    if (!list.length) return null;
    const rows = h('div.arch-strand-list', list.map(row));
    if (list.length > 1 && !search.active()) sortable(rows, { axis: 'y', onSort: (ids) => store.reorder(ids) });
    return h('section.arch-strand-group', h('h3', t(key), h('span.muted', String(list.length))), rows);
  };
  function drawStrands() {
    const shown = search.filter(strands);
    search.setCount(shown.length, strands.length);
    clear(listEl);
    if (!shown.length) {
      listEl.append(h('p.muted.empty-line', t('common.noMatches')));
      return;
    }
    listEl.append(...[
      ...STRAND_LEVELS.map((level) => group('arch.level.' + level, shown.filter((s) => strandLevel(s) === level))),
      group('arch.unclassified', shown.filter((s) => !strandLevel(s))),
    ].filter(Boolean));
  }

  el.append(h('div.section-head',
    h('div', h('h2', t('strand.plural')),
      h('p.muted', strands.length
        ? [tn('arch.strandCount', strands.length), scenes.length ? ` · ${tn('count.scenes', scenes.length)}` : '',
          orphan ? h('span.arch-orphan', ` · ${tn('arch.orphan', orphan)}`) : ''] : t('strand.hint'))),
    h('div.page-actions',
      ioMenu('strand', { list: () => store.list('strand'), onDone: refresh }),
      btn(t('strand.add'), { icon: 'plus', kind: 'primary', onClick: addStrand }))));
  if (!strands.length) {
    el.append(h('p.muted.empty-line', t('strand.empty')));
    return;
  }
  el.append(h('div.filter-row', search.el), listEl);
  drawStrands();
}

/** Vista de lectura: toda la arquitectura seguida, con índice y acceso a editar cada apartado. */
export async function architectureReadPage({ el, pid }) {
  await ensureArchitecture();
  const sections = ARCH_KEYS.map((key) => {
    const item = archItem(key);
    return { title: t('arch.' + key), html: item ? item.body : '', href: `#/p/${pid}/architecture/${key}` };
  });
  const strands = store.list('strand');
  const article = h('article.read', { lang: store.project.language });
  const toc = h('nav.read-toc', { 'aria-label': t('read.contents') }, h('h3', t('read.contents')));
  const tocLink = (label, target, sub) => h('a', { class: sub ? 'sub' : '', href: '#', onclick: (e) => { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, label);
  const block = (tag, title, html, href, badge) => h('section.read-chapter',
    h(tag, h('span', title), badge ? h('span.badge', badge) : null, h('a.read-edit', { href }, icon('edit', 14), t('common.edit'))),
    htmlToText(html) ? h('div.read-scene', { html: sanitizeHtml(html) }) : h('p.muted', t('read.noText')));

  for (const s of sections) {
    const node = block('h2', s.title, s.html, s.href);
    article.append(node);
    toc.append(tocLink(s.title, node));
  }
  if (strands.length) {
    const head = h('h2.read-part', t('strand.plural'));
    article.append(head);
    toc.append(tocLink(t('strand.plural'), head));
    for (const s of strands) {
      const node = block('h3', displayName(s), s.body, `#/p/${pid}/strands/${s.id}`, strandSummary(s));
      article.append(node);
      toc.append(tocLink(displayName(s), node, true));
    }
  }
  clear(el);
  el.append(
    pageHeader({ title: t('nav.architecture'), subtitle: t('arch.readHint'), back: { href: `#/p/${pid}/architecture`, label: t('nav.architecture') } }),
    h('div.read-layout', toc, article));
}

export async function architectureItemPage({ el, pid, params }) {
  await ensureArchitecture();
  const item = archItem(params.key);
  if (!item) return notFound(el, pid);
  clear(el);
  return richFieldPage(el, {
    title: t('arch.' + params.key),
    hint: t(`arch.${params.key}.hint`),
    back: { href: `#/p/${pid}/architecture`, label: t('nav.architecture') },
    html: item.body,
    status: item.status,
    lang: store.project.language,
    onHtml: (html, stats) => store.update(item.id, { body: html, words: stats.words, chars: stats.chars }, autosaveDelay()),
    onStatus: (s) => store.update(item.id, { status: s }),
  });
}
