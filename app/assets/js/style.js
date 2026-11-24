// Revisión de estilo: cosas que se pueden contar en un texto y que conviene mirar al corregir.
// No juzga: señala. Repeticiones cercanas, adverbios de modo (-mente, -ly…), muletillas, frases
// muy largas y párrafos seguidos que empiezan igual. Trabaja sobre párrafos de texto plano.
//
// Lo que depende del idioma de la novela (palabras vacías, muletillas, terminación de los
// adverbios, artículos y tratamientos) está en una hoja por idioma: style/<código>.js.
import es from './style/es.js';
import en from './style/en.js';

const SHEETS = { es, en };
const missing = new Set();
const prepared = new Map();

const WINDOW = 60; // palabras: una repetición «cercana» está dentro de esta distancia
const LONG = 40; // palabras: a partir de aquí una frase se considera larga

/** Sin tildes ni mayúsculas, y con el apóstrofo recto («qu’il» = «qu'il»), para comparar. */
export const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/’/g, "'").toLowerCase();
const base = (lang) => String(lang || 'es').toLowerCase().split('-')[0];

/** Carga (una vez) la hoja de revisión de un idioma, si existe. */
export async function loadStyleSheet(lang) {
  const code = base(lang);
  if (SHEETS[code] || missing.has(code)) return;
  try {
    SHEETS[code] = (await import(`./style/${code}.js`)).default;
  } catch (err) {
    missing.add(code); // ese idioma no tiene hoja: no se le aplican las reglas de otro
  }
}

/**
 * La hoja del idioma ya preparada para buscar: { code, stop (Set, sin tildes), fillers,
 * adverbs (o null), articles, titles }. Un idioma sin hoja da una vacía: mejor no avisar de nada
 * que avisar con las reglas de otro idioma.
 */
export function styleSheet(lang) {
  const code = base(lang);
  if (prepared.has(code)) return prepared.get(code);
  const sheet = SHEETS[code];
  if (!sheet && !missing.has(code)) return { code, stop: new Set(), fillers: [], adverbs: null, articles: [], titles: [] }; // aún sin cargar
  const s = sheet || {};
  const adverbs = s.adverbs ? { ...s.adverbs, suffix: fold(s.adverbs.suffix), exceptions: new Set((s.adverbs.exceptions || []).map(fold)) } : null;
  const ready = { code, stop: new Set((s.stop || []).map(fold)), fillers: s.fillers || [], adverbs, articles: s.articles || [], titles: s.titles || [] };
  prepared.set(code, ready);
  return ready;
}

/** ¿Es un adverbio de modo según la hoja? `word`, ya sin tildes ni mayúsculas. */
export function isAdverb(sheet, word) {
  const a = sheet.adverbs;
  return !!a && word.length >= a.minLength && word.endsWith(a.suffix) && !a.exceptions.has(word);
}

/**
 * Analiza una lista de párrafos (textos planos). Devuelve
 * { words, sentences, repeats, adverbs, fillers, long, starts, adverbSuffix }: cada hallazgo
 * lleva `hits`, una lista de { p (índice del párrafo), start, end } para poder señalarlo en el
 * texto. `adverbSuffix` es la terminación que se ha buscado («-mente») o null si en ese idioma
 * no se buscan adverbios.
 */
export function analyzeStyle(paragraphs, lang) {
  const sheet = styleSheet(lang);
  const stop = sheet.stop;
  const out = { words: 0, sentences: 0, repeats: [], adverbs: [], fillers: [], long: [], starts: [], adverbSuffix: sheet.adverbs ? '-' + sheet.adverbs.suffix : null };
  const byWord = new Map(); // palabra -> apariciones [{ p, start, end, n (posición global) }]
  const adverbs = new Map();
  let n = 0;

  paragraphs.forEach((text, p) => {
    for (const m of text.matchAll(/[\p{L}\p{M}]+(?:['’·-][\p{L}\p{M}]+)*/gu)) {
      const word = fold(m[0]);
      n++;
      const hit = { p, start: m.index, end: m.index + m[0].length, n };
      if (isAdverb(sheet, word)) adverbs.set(word, [...(adverbs.get(word) || []), hit]);
      if (word.length >= 4 && !stop.has(word)) byWord.set(word, [...(byWord.get(word) || []), hit]);
    }
    // Frases largas.
    for (const m of text.matchAll(/[^.!?…]+[.!?…]*["»”)\]]*\s*/g)) {
      const sentence = m[0].trim();
      const count = (sentence.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length;
      if (!count) continue;
      out.sentences++;
      if (count > LONG) out.long.push({ label: sentence.length > 110 ? sentence.slice(0, 110) + '…' : sentence, count, hits: [{ p, start: m.index, end: m.index + m[0].trimEnd().length }] });
    }
  });
  out.words = n;

  // Repeticiones cercanas: la misma palabra a menos de WINDOW palabras de otra aparición.
  for (const [word, hits] of byWord) {
    const close = hits.filter((h, i) => (i > 0 && h.n - hits[i - 1].n <= WINDOW) || (i < hits.length - 1 && hits[i + 1].n - h.n <= WINDOW));
    // Se muestra como está escrita (con sus acentos), en minúsculas.
    if (close.length >= 2) out.repeats.push({ label: paragraphs[close[0].p].slice(close[0].start, close[0].end).toLowerCase(), count: close.length, hits: close });
  }
  out.repeats.sort((a, b) => b.count - a.count);
  out.adverbs = [...adverbs].map(([label, hits]) => ({ label, count: hits.length, hits })).sort((a, b) => b.count - a.count);

  // Muletillas.
  for (const phrase of sheet.fillers) {
    // (Sin «lookbehind», que algunos navegadores no admiten: el carácter anterior se captura aparte.)
    // El apóstrofo vale recto o tipográfico («tout d'un coup», «tout d’un coup»).
    const body = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+').replace(/['’]/g, "['’]");
    const pattern = new RegExp(`(^|[^\\p{L}\\p{M}])(${body})(?![\\p{L}\\p{M}])`, 'giu');
    const hits = [];
    paragraphs.forEach((text, p) => {
      for (const m of text.matchAll(pattern)) hits.push({ p, start: m.index + m[1].length, end: m.index + m[0].length });
    });
    if (hits.length >= 2) out.fillers.push({ label: phrase, count: hits.length, hits });
  }
  out.fillers.sort((a, b) => b.count - a.count);

  // Párrafos seguidos que empiezan con la misma palabra.
  let run = [];
  const flush = () => {
    if (run.length >= 2) out.starts.push({ label: run[0].word, count: run.length, hits: run.map((r) => ({ p: r.p, start: r.start, end: r.end })) });
    run = [];
  };
  paragraphs.forEach((text, p) => {
    const m = /[\p{L}\p{M}]+/u.exec(text);
    if (!m) return; // los párrafos vacíos no cortan la racha
    const word = fold(m[0]);
    if (run.length && run[0].key !== word) flush();
    run.push({ key: word, word: m[0], p, start: m.index, end: m.index + m[0].length });
  });
  flush();
  out.starts.sort((a, b) => b.count - a.count);
  return out;
}

/** Cuántos hallazgos de un tipo hay en total (suma de apariciones). */
export const totalOf = (list) => list.reduce((sum, x) => sum + x.count, 0);

/** Párrafos de un HTML: el texto de cada bloque (p, li, blockquote, títulos). */
export function paragraphsOf(root) {
  const blocks = [...root.querySelectorAll('p, li, blockquote, h1, h2, h3, h4')].filter((b) => !b.querySelector('p, li, blockquote'));
  return blocks.length ? blocks : [root];
}

/** Rango del documento que corresponde a un tramo [start, end) del texto de un bloque. */
export function rangeIn(block, start, end) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let pos = 0;
  let begun = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const len = node.data.length;
    if (!begun && start <= pos + len) { range.setStart(node, Math.max(0, start - pos)); begun = true; }
    if (begun && end <= pos + len) { range.setEnd(node, Math.max(0, end - pos)); return range; }
    pos += len;
  }
  return begun ? (range.setEndAfter(block.lastChild || block), range) : null;
}
