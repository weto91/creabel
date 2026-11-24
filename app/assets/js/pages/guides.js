// Guías de escritura: diez textos breves sobre cómo plantear y revisar una novela. No son
// un curso: cada una da criterios para mirar el propio manuscrito. El contenido está en
// assets/js/guides/<idioma>.js y se carga solo cuando se abre esta sección.
import { h, clear, icon } from '../dom.js';
import { t, getLang, importLocalized } from '../i18n.js';
import { btn, pageHeader, notFound, tabs } from '../ui.js';
import { figure } from '../guides/figures.js';

let cache = null; // { lang, guides }

// En el idioma de la interfaz o, si aún no está traducida a él, en el de su reserva.
async function loadGuides() {
  const lang = getLang();
  if (!cache || cache.lang !== lang) cache = { lang, guides: (await importLocalized((c) => import(`../guides/${c}.js`))).content };
  return cache.guides;
}

let appCache = null; // { lang, chapters }

/** La guía de la aplicación (cómo funciona Creabel), en el idioma de la interfaz. */
async function loadAppGuide() {
  const lang = getLang();
  if (!appCache || appCache.lang !== lang) appCache = { lang, chapters: (await importLocalized((c) => import(`../guides/app-${c}.js`))).content };
  return appCache.chapters;
}

const TAB_KEY = 'creabel.guidesTab';

/** Dos guías: la del escritor (criterios para escribir y revisar) y la de la aplicación (cómo se usa). */
export async function guidesPage({ el, pid, query }) {
  let saved = '';
  try { saved = localStorage.getItem(TAB_KEY) || ''; } catch (err) { saved = ''; }
  let tab = ['writer', 'app'].includes(query.tab) ? query.tab : saved === 'app' ? 'app' : 'writer';
  const tabsEl = h('div');
  const body = h('div');
  // En la guía de la aplicación, bajo cada capítulo van sus apartados, con enlace directo a cada uno.
  const list = (items, href) => h('div.guide-list', items.map((g, i) => {
    const card = h('a.guide-card', { href: href(g) },
      h('span.guide-number', String(i + 1).padStart(2, '0')),
      h('span.guide-card-text', h('strong', g.title), h('span.muted', g.summary)),
      icon('chevron-right', 16));
    const sections = (g.blocks || []).filter((b) => b.h && b.id);
    return sections.length ? h('div.guide-entry', card,
      h('div.guide-sections', sections.map((b) => h('a', { href: `${href(g)}?s=${b.id}` }, b.h)))) : card;
  }));
  const draw = async () => {
    clear(tabsEl).append(tabs([{ key: 'writer', label: t('guides.tab.writer') }, { key: 'app', label: t('guides.tab.app') }], tab, (key) => {
      tab = key;
      try { localStorage.setItem(TAB_KEY, key); } catch (err) { /* no es crítico */ }
      draw();
    }));
    const mine = tab;
    const items = tab === 'app' ? await loadAppGuide() : await loadGuides();
    if (tab !== mine) return;
    clear(body).append(
      h('p.muted.guide-intro', t(tab === 'app' ? 'guides.appHint' : 'guides.hint')),
      list(items, (g) => (tab === 'app' ? `#/p/${pid}/guides/app/${g.id}` : `#/p/${pid}/guides/${g.id}`)));
  };
  clear(el);
  el.append(pageHeader({ title: t('nav.guides'), subtitle: t('guides.subtitle') }), tabsEl, body);
  await draw();
}

/** Un capítulo de la guía de la aplicación: texto, pasos e infografías. */
export async function appGuidePage({ el, pid, params, query }) {
  const chapters = await loadAppGuide();
  const index = chapters.findIndex((c) => c.id === params.id);
  if (index < 0) return notFound(el, pid);
  const c = chapters[index];
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const guideHref = (id, section) => `#/p/${pid}/guides/app/${id}${section ? '?s=' + section : ''}`;

  /**
   * Texto con enlaces y negritas. «[[time|la línea temporal]]» enlaza con un capítulo de la
   * guía, «[[time#events|…]]» con uno de sus apartados y «[[>timeline|…]]» abre esa página de
   * la aplicación; «**así**» va en negrita.
   */
  const rich = (text) => {
    const out = [];
    const re = /\[\[([^\]|]+)\|([^\]]+)\]\]|\*\*([^*]+)\*\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      if (m[3]) out.push(h('strong', m[3]));
      else if (m[1][0] === '>') out.push(h('a.guide-go', { href: `#/p/${pid}/${m[1].slice(1)}` }, m[2]));
      else out.push(h('a.guide-ref', { href: guideHref(...m[1].split('#')) }, m[2]));
      last = re.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  };

  const sections = c.blocks.filter((b) => b.h && b.id);
  const anchors = new Map(); // id del apartado -> su título en la página
  const scrollTo = (id) => { const node = anchors.get(id); if (node) node.scrollIntoView({ block: 'start' }); };
  const block = (b) => {
    if (b.h) {
      // Título de apartado: con su ancla y, si procede, un botón que abre la página de la que habla.
      const node = h('h2', { id: b.id ? 'g-' + b.id : null }, h('span', b.h),
        b.go ? h('a.guide-open', { href: `#/p/${pid}/${b.go}` }, t('guides.openPage'), icon('chevron-right', 13)) : null);
      if (b.id) anchors.set(b.id, node);
      return node;
    }
    if (b.p) return h('p', rich(b.p));
    if (b.steps) return h('ol.guide-steps', b.steps.map((s) => h('li', rich(s))));
    if (b.list) return h('ul', b.list.map((s) => h('li', rich(s))));
    if (b.defs) return h('dl.guide-defs', b.defs.map(([term, text]) => h('div', h('dt', rich(term)), h('dd', rich(text)))));
    if (b.table) return h('div.guide-table-wrap', h('table.guide-table',
      h('thead', h('tr', b.table.head.map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', b.table.rows.map((row) => h('tr', row.map((x, i) => h(i ? 'td' : 'th', i ? {} : { scope: 'row' }, rich(x))))))));
    if (b.tip) return h('p.guide-tip', icon('info', 16), h('span', rich(b.tip)));
    if (b.keys) return h('dl.guide-keys', b.keys.map(([key, what]) => h('div', h('dt', h('kbd', key)), h('dd', what))));
    if (b.see) {
      // «Sigue leyendo»: otros capítulos (o apartados) relacionados, con su título.
      return h('nav.guide-see', { 'aria-label': t('guides.seeAlso') }, h('strong', t('guides.seeAlso')),
        h('div.guide-see-links', b.see.map((ref) => {
          const [id, section] = ref.split('#');
          const target = chapters.find((x) => x.id === id);
          if (!target) return null;
          const part = section ? target.blocks.find((x) => x.h && x.id === section) : null;
          return h('a', { href: guideHref(id, section) }, icon('chevron-right', 13), h('span', part ? `${target.title} · ${part.h}` : target.title));
        })));
    }
    if (b.fig) {
      const drawing = figure(b.fig, b.labels);
      if (!drawing) return null;
      if (b.caption) drawing.setAttribute('aria-label', b.caption);
      return h('figure.guide-figure', drawing,
        b.legend ? h('ol.guide-legend', b.legend.map((s) => h('li', rich(s)))) : null,
        b.caption ? h('figcaption', b.caption) : null);
    }
    return null;
  };
  const back = `#/p/${pid}/guides?tab=app`;
  const article = h('article.guide.guide-app', c.blocks.map(block));
  clear(el);
  el.append(
    pageHeader({ title: c.title, subtitle: c.summary, back: { href: back, label: t('guides.tab.app') } }),
    // Índice del capítulo: salta a cada apartado sin salir de la página.
    sections.length > 2 ? h('nav.guide-toc', { 'aria-label': t('guides.inChapter') }, h('strong', t('guides.inChapter')),
      h('div.guide-toc-links', sections.map((b) => h('button', { type: 'button', onclick: () => scrollTo(b.id) }, b.h)))) : h('span'),
    article,
    h('div.pager',
      prev ? h('a.pager-link', { href: guideHref(prev.id) }, icon('chevron-left', 15), h('span', prev.title)) : h('span'),
      next ? h('a.pager-link', { href: guideHref(next.id) }, h('span', next.title), icon('chevron-right', 15)) : h('span')));
  // Si se llega a un apartado concreto («?s=…»), la página se coloca en él.
  if (query && query.s && anchors.has(query.s)) setTimeout(() => anchors.get(query.s).scrollIntoView({ block: 'start' }), 0);
  return undefined;
}

export async function guidePage({ el, pid, params }) {
  const guides = await loadGuides();
  const index = guides.findIndex((g) => g.id === params.id);
  if (index < 0) return notFound(el, pid);
  const g = guides[index];
  const prev = guides[index - 1];
  const next = guides[index + 1];
  clear(el);
  el.append(
    pageHeader({ title: g.title, subtitle: g.summary, back: { href: `#/p/${pid}/guides?tab=writer`, label: t('guides.tab.writer') } }),
    h('article.guide',
      g.sections.map((s) => h('section',
        h('h2', s.title),
        (s.paragraphs || []).map((p) => h('p', p)),
        s.points && s.points.length ? h('ul', s.points.map((p) => h('li', p))) : null)),
      g.questions && g.questions.length ? h('section.guide-questions',
        h('h2', t('guides.questions')),
        h('ol', g.questions.map((q) => h('li', q)))) : null),
    h('div.pager',
      prev ? h('a.pager-link', { href: `#/p/${pid}/guides/${prev.id}` }, icon('chevron-left', 15), h('span', prev.title)) : h('span'),
      next ? h('a.pager-link', { href: `#/p/${pid}/guides/${next.id}` }, h('span', next.title), icon('chevron-right', 15)) : h('span')));
  return undefined;
}

/** Tarjeta para el panel de inicio del proyecto. */
export function guidesTeaser(pid) {
  return h('section.panel',
    h('div.panel-head', h('h3', t('guides.title')), btn(t('guides.open'), { icon: 'chevron-right', small: true, href: `#/p/${pid}/guides` })),
    h('p.muted', t('guides.teaser')));
}
