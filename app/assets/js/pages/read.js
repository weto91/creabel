// Modo lectura: la novela (o un capítulo) tal como quedará, sin herramientas de edición.
// Los términos del diccionario llevan un número en su primera aparición y la definición al final.
import { h, clear } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { pageHeader, emptyState, btn } from '../ui.js';
import { chaptersOrdered, chapterNumbers, chapterLabel, chapterKind, scenesOf, displayName, readingLabel } from '../model.js';
import { createGlossary } from '../glossary.js';

export async function readPage({ el, pid, query }) {
  const texts = await store.sceneTexts();
  const numbers = chapterNumbers();
  const all = chaptersOrdered();
  const only = query.chapter ? all.filter((c) => c.id === query.chapter) : all;
  const single = query.chapter && only.length === 1;
  const glossary = createGlossary();

  clear(el);
  el.append(pageHeader({
    title: single ? chapterLabel(only[0], numbers) : store.project.name,
    subtitle: single ? store.project.name : (store.project.author || t('read.hint')),
    back: single ? { href: `#/p/${pid}/chapters/${only[0].id}`, label: t('nav.chapters') } : null,
    actions: single ? [btn(t('read.whole'), { icon: 'eye', href: `#/p/${pid}/read` })] : [],
  }));

  if (!only.length) {
    el.append(emptyState(t('read.empty'), btn(t('nav.chapters'), { kind: 'primary', href: `#/p/${pid}/chapters` }), 'book'));
    return;
  }

  const article = h('article.read', { lang: store.project.language });
  const toc = h('nav.read-toc', { 'aria-label': t('read.contents') }, h('h3', t('read.contents')));
  const tocLink = (label, target) => h('a', { href: '#', onclick: (e) => { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, label);
  let lastPart;

  for (const c of only) {
    const part = chapterKind(c) === 'chapter' ? store.get(c.parent_id) : null;
    if (!single && part && part.id !== lastPart) {
      lastPart = part.id;
      article.append(h('h2.read-part', displayName(part)));
      toc.append(h('span.read-toc-part', displayName(part)));
    }
    const section = h('section.read-chapter', h('h2', chapterLabel(c, numbers)));
    let printed = 0;
    for (const s of scenesOf(c.id)) {
      const html = texts.get(s.id) || '';
      if (!html.trim()) continue;
      if (printed > 0) section.append(h('p.read-sep', '* * *'));
      // annotate() devuelve el HTML saneado con las marcas del diccionario.
      section.append(h('div.read-scene', { html: glossary.annotate(html) }));
      printed++;
    }
    if (!printed) section.append(h('p.muted', t('read.noText')));
    article.append(section);
    toc.append(tocLink(chapterLabel(c, numbers), section));
  }

  const entries = glossary.entries();
  if (entries.length) {
    const section = h('section.read-chapter.read-glossary', h('h2', t('term.plural')),
      entries.map((e) => h('p.gloss', { id: 'gl-' + e.n },
        h('a', { href: '#glref-' + e.n }, String(e.n)), '. ', h('b', e.term), e.text ? '. ' + e.text : '')));
    article.append(section);
    toc.append(tocLink(t('term.plural'), section));
  }

  // Los enlaces del diccionario se resuelven con desplazamiento: un cambio de «#» real
  // se interpretaría como navegación de la aplicación.
  article.addEventListener('click', (e) => {
    const link = e.target.closest ? e.target.closest('a[href^="#gl"]') : null;
    if (!link) return;
    e.preventDefault();
    const target = article.querySelector('[id="' + link.getAttribute('href').slice(1) + '"]');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('gl-flash');
    setTimeout(() => target.classList.remove('gl-flash'), 1600);
  });

  const words = only.reduce((sum, c) => sum + scenesOf(c.id).reduce((a, s) => a + (s.words || 0), 0), 0);
  // Estimación habitual de lectura: unas 250 palabras por minuto (readingLabel, en model.js).
  el.append(h('p.totals', { title: words ? t('read.timeHint') : null }, [tn('count.words', words), readingLabel(words)].filter(Boolean).join(' · ')));
  el.append(h('div', { class: 'read-layout' + (single ? ' single' : '') }, single ? null : toc, article));
}
