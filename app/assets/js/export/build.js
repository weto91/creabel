// Convierte el proyecto en una lista de bloques independiente del formato de salida.
// Tipos de bloque: title, h1, h2, h3, html, p, sep, break (salto de página).
import { store } from '../store.js';
import { api } from '../api.js';
import { t, tn } from '../i18n.js';
import { htmlToText, formatDateTime, textToHtml } from '../text.js';
import {
  ARCH_KEYS, archItem, CHARACTER_SECTIONS, chaptersOrdered, chapterNumbers, chapterKind, chapterLabel,
  scenesOf, displayName, locationLabel, entityLabel, questionsFor, timelineItems, visibleTraits, eventsOf, eventTime,
} from '../model.js';
import { sceneTagSummary } from '../components.js';
import { createGlossary } from '../glossary.js';

const hasText = (html) => !!htmlToText(html || '');

/** Texto de una página preliminar como HTML (las primeras versiones lo guardaban como texto plano). */
export function matterHtml(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  return /<\/?[a-z][^>]*>/i.test(v) ? v : textToHtml(v);
}

/**
 * Prepara una imagen para incrustarla en un libro: la reduce si es muy grande y la pasa a
 * JPEG, que admiten todos los formatos de salida. Devuelve { dataUrl, bytes, w, h }.
 */
export async function loadExportImage(img, maxSide = 1200) {
  const bitmap = await createImageBitmap(await api.imageBlob(img));
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // el JPEG no tiene transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.9), bytes: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height };
}

function chapterHeading(c, numbers, mode) {
  const kind = chapterKind(c);
  if (kind !== 'chapter') return c.name || t('chapters.' + kind);
  const n = numbers.get(c.id);
  if (mode === 'title') return displayName(c);
  if (mode === 'number') return t('chapters.chapterN', { n });
  return c.name ? `${t('chapters.chapterN', { n })}. ${c.name}` : t('chapters.chapterN', { n });
}

/** Secciones escritas de un personaje principal (entrevista, vida anterior, conflicto...). */
export function characterSectionBlocks(c, heading = 'h3') {
  const blocks = [];
  for (const def of CHARACTER_SECTIONS) {
    const sec = (c.data.sections || {})[def.key];
    if (!sec) continue;
    if (def.interview && sec.mode !== 'free') {
      const answered = questionsFor(def.key).filter((q) => hasText((sec.answers || {})[q.k]));
      if (!answered.length) continue;
      blocks.push({ t: heading, text: t('section.' + def.key) });
      for (const q of answered) blocks.push({ t: 'p', text: q.text, bold: true }, { t: 'html', html: sec.answers[q.k] });
    } else if (hasText(sec.free)) {
      blocks.push({ t: heading, text: t('section.' + def.key) }, { t: 'html', html: sec.free });
    }
  }
  return blocks;
}

/** La novela: portada, partes, capítulos y escenas. */
export async function buildNovel(opts) {
  const texts = await store.sceneTexts();
  const p = store.project;
  const blocks = [];
  // opts.manuscript ({ contact, count }) da la portada de manuscrito; opts.matter, las páginas
  // preliminares y finales ({ copyright, dedication, epigraph, acknowledgments, about }).
  const ms = opts.manuscript || null;
  const matter = opts.matter || {};
  const filled = (key) => {
    const html = matterHtml(matter[key]);
    return hasText(html) ? html : '';
  };
  // La portada (imagen del proyecto) abre el libro cuando se pide: en el ebook, siempre.
  const coverImage = opts.cover && p.data.cover ? store.images.find((i) => i.id === p.data.cover) : null;
  if (coverImage) {
    try { blocks.push({ t: 'image', cover: true, ...(await loadExportImage(coverImage, 1600)) }, { t: 'break' }); } catch (err) { /* sin portada, el libro sale igual */ }
  }
  // Portadilla: título, autor («Anónimo» si no se ha puesto) y, si el libro es de una serie, cuál y qué número.
  const d = p.data || {};
  const seriesLine = d.series ? (d.seriesIndex !== '' && d.seriesIndex != null ? t('book.seriesLine', { series: d.series, n: d.seriesIndex }) : d.series) : '';
  if (opts.titlePage || ms) {
    blocks.push({
      t: 'title', text: p.name, author: p.author || t('book.anonymous'), ...(seriesLine && !ms ? { subtitle: seriesLine } : {}),
      ...(ms ? { contact: ms.contact || '', count: ms.count || '' } : {}),
    });
  }
  for (const kind of ['copyright', 'dedication', 'epigraph']) {
    if (filled(kind)) blocks.push({ t: 'break' }, { t: 'matter', kind, html: filled(kind) });
  }
  const numbers = chapterNumbers();
  // Diccionario: número en la primera aparición de cada término y definiciones al final.
  const glossary = opts.glossary !== false ? createGlossary() : null;
  let lastPart = null;
  for (const c of chaptersOrdered()) {
    const part = chapterKind(c) === 'chapter' ? store.get(c.parent_id) : null;
    if (part && part.id !== lastPart) {
      lastPart = part.id;
      blocks.push({ t: 'break', recto: !!opts.recto }, { t: 'h1', text: displayName(part) });
    }
    // `recto`: en un libro impreso, cada capítulo puede empezar en página derecha.
    blocks.push({ t: 'break', recto: !!opts.recto }, { t: 'h2', text: chapterHeading(c, numbers, opts.chapterTitle) });
    let printed = 0;
    for (const s of scenesOf(c.id)) {
      const html = texts.get(s.id) || '';
      if (!hasText(html)) continue;
      if (printed > 0) blocks.push({ t: 'sep', text: opts.separator || '' });
      if (opts.sceneTitles && s.name) blocks.push({ t: 'h3', text: s.name });
      // `safe` indica que el HTML ya está saneado y lleva las marcas del diccionario.
      blocks.push(glossary ? { t: 'html', html: glossary.annotate(html), safe: true } : { t: 'html', html });
      printed++;
    }
  }
  if (glossary && glossary.entries().length) {
    blocks.push({ t: 'break' }, { t: 'h2', text: t('term.plural') });
    for (const entry of glossary.entries()) blocks.push({ t: 'gloss', n: entry.n, term: entry.term, text: entry.text });
  }
  if (opts.theEnd) blocks.push({ t: 'sep', text: t('export.theEnd') });
  if (filled('acknowledgments')) blocks.push({ t: 'break' }, { t: 'h2', text: t('matter.acknowledgments') }, { t: 'html', html: filled('acknowledgments') });
  // «Sobre el autor» puede llevar su foto encima del texto.
  const photo = opts.matter && matter.photo ? store.images.find((i) => i.id === matter.photo) : null;
  let picture = null;
  if (photo) {
    try { picture = await loadExportImage(photo); } catch (err) { picture = null; } // sin foto, el libro sale igual
  }
  if (filled('about') || picture) {
    blocks.push({ t: 'break' }, { t: 'h2', text: t('matter.about') });
    if (picture) blocks.push({ t: 'image', ...picture });
    if (filled('about')) blocks.push({ t: 'html', html: filled('about') });
  }
  return blocks;
}

/** El dossier: todo el material de trabajo (arquitectura, personajes, lugares...). */
export async function buildDossier(sections) {
  const p = store.project;
  const blocks = [{ t: 'title', text: p.name, author: p.author, subtitle: t('export.dossier') }];
  const chapter = (title) => blocks.push({ t: 'break' }, { t: 'h1', text: title });
  const described = (list, label) => {
    for (const e of list) {
      blocks.push({ t: 'h2', text: label(e) });
      if (e.data.role) blocks.push({ t: 'p', text: `${t('role.label')}: ${e.data.role}` });
      if (hasText(e.body)) blocks.push({ t: 'html', html: e.body });
      // Preguntas propias del proyecto para este tipo de elemento, con sus respuestas.
      for (const q of (p.data.customQuestions || {})[e.type] || []) {
        const answer = (e.data.answers || {})[q.id];
        if (answer) blocks.push({ t: 'p', text: q.text, bold: true }, { t: 'p', text: answer });
      }
      for (const ev of eventsOf(e.id)) {
        blocks.push({ t: 'p', text: `${formatDateTime(eventTime(ev))} — ${displayName(ev)}${ev.data.description ? ': ' + ev.data.description : ''}` });
      }
    }
  };

  if (sections.architecture) {
    chapter(t('nav.architecture'));
    for (const key of ARCH_KEYS) {
      const item = archItem(key);
      if (!item || !hasText(item.body)) continue;
      blocks.push({ t: 'h2', text: t('arch.' + key) }, { t: 'html', html: item.body });
    }
    const strands = store.list('strand');
    if (strands.length) {
      blocks.push({ t: 'h2', text: t('strand.plural') });
      for (const s of strands) {
        blocks.push({ t: 'h3', text: displayName(s) });
        if (hasText(s.body)) blocks.push({ t: 'html', html: s.body });
      }
    }
  }

  if (sections.characters) {
    const all = store.list('character');
    if (all.length) chapter(t('character.plural'));
    for (const c of all) {
      blocks.push({ t: 'h2', text: displayName(c) });
      if (c.data.role) blocks.push({ t: 'p', text: `${t('role.label')}: ${c.data.role}` });
      const traits = visibleTraits(c);
      if (traits.length) blocks.push({ t: 'p', text: `${t('traits.title')}: ${traits.join(', ')}` });
      if (c.data.kind === 'secondary') {
        if (hasText(c.body)) blocks.push({ t: 'html', html: c.body });
        continue;
      }
      blocks.push(...characterSectionBlocks(c, 'h3'));
    }
  }

  if (sections.locations && store.list('location').length) {
    chapter(t('location.plural'));
    described(store.list('location'), locationLabel);
  }
  if (sections.objects && store.list('object').length) {
    chapter(t('object.plural'));
    described(store.list('object'), displayName);
  }
  if (sections.groups && store.list('group').length) {
    chapter(t('group.plural'));
    for (const g of store.list('group')) {
      blocks.push({ t: 'h2', text: displayName(g) });
      const members = (g.data.members || []).map((id) => store.get(id)).filter(Boolean).map(displayName);
      if (members.length) blocks.push({ t: 'p', text: `${t('group.members')}: ${members.join(', ')}` });
      if (hasText(g.body)) blocks.push({ t: 'html', html: g.body });
    }
  }
  if (sections.notes && store.list('note').length) {
    chapter(t('note.plural'));
    described(store.list('note'), displayName);
  }

  if (sections.dictionary && store.list('term').length) {
    chapter(t('term.plural'));
    const terms = store.list('term').sort((a, b) => displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' }));
    for (const term of terms) {
      blocks.push({ t: 'p', text: displayName(term), bold: true });
      if (hasText(term.body)) blocks.push({ t: 'html', html: term.body });
    }
  }

  if (sections.outline && chaptersOrdered().length) {
    chapter(t('export.outline'));
    const numbers = chapterNumbers();
    for (const c of chaptersOrdered()) {
      blocks.push({ t: 'h2', text: chapterLabel(c, numbers) });
      if (hasText(c.data.reason)) blocks.push({ t: 'p', text: t('chapters.reason'), bold: true }, { t: 'html', html: c.data.reason });
      if (hasText(c.data.notes)) blocks.push({ t: 'p', text: t('chapters.notes'), bold: true }, { t: 'html', html: c.data.notes });
      for (const s of scenesOf(c.id)) {
        const tags = sceneTagSummary(s);
        blocks.push({ t: 'p', text: `• ${displayName(s)} (${tn('count.words', s.words || 0)})${tags ? ' — ' + tags : ''}` });
      }
    }
  }

  if (sections.timeline) {
    const items = timelineItems();
    if (items.length) {
      chapter(t('nav.timeline'));
      for (const item of items) {
        blocks.push({ t: 'p', text: `${formatDateTime(item.time)} — ${item.title} (${item.kind === 'scene' ? item.sub : item.general ? t('timeline.general') : item.targets.map((e) => entityLabel(e)).join(', ')})` });
      }
    }
  }
  return blocks;
}
