// Buscador de la línea temporal. Una búsqueda son términos unidos por «&» (deben cumplirse
// todos) y «|» (basta con uno); primero se resuelven los «&»: «a & b | c» es «(a y b) o c».
// Cada término se busca en el texto de la entrada (título, descripción, capítulo, elementos,
// identificadores) y, si es una fecha o parte de una, también en su fecha:
//   3/12/2059 · 3 de diciembre de 2059 · 12/2059 · diciembre de 2059 · 3/12 · 2059 · diciembre
import { plain, defaultOrder, parseDate, dateLanguages, MONTHS, LONG_MONTHS, WEEKDAYS } from './dateparse.js';

/**
 * Palabras que acompañan a una fecha escrita con letras sin cambiarla («3 de diciembre», «3
 * d’abril», «am 3. Dezember», «3 декабря 2059 г.»). Solo cuentan junto al nombre de un mes.
 */
const FILLER = new Set([
  'de', 'del', 'el', 'la', 'dia', 'of', 'the', 'on', 'day', 'in',
  'd', 'do', 'da', 'le', 'du', 'en', 'il', 'am', 'im', 'der', 'den', 'op', 'r', 'roku', 'leta', 'godine',
  'г', 'года', 'году', 'в', 'р', 'року', 'у',
]);

/**
 * Si el término es una fecha o parte de una, devuelve { y, m, d } con lo que diga (solo el año,
 * mes y año, día y mes…); si no, null.
 */
export function parseDatePattern(term) {
  const s = plain(term).replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  const order = defaultOrder();
  // Tres números: una fecha completa.
  if (/^\d{1,6}[-/.]\d{1,2}[-/.]\d{1,6}$/.test(s)) {
    const parsed = parseDate(s, order);
    if (!parsed) return null;
    const [y, m, d] = parsed.date.split('-').map(Number);
    return { y, m, d };
  }
  // Dos números: mes y año («12/2059», «2059-12») o día y mes en el orden de los ajustes («3/12»).
  const two = /^(\d{1,6})[-/.](\d{1,6})$/.exec(s);
  if (two) {
    const [a, b] = [Number(two[1]), Number(two[2])];
    if (two[1].length >= 3 || a > 31) return b >= 1 && b <= 12 ? { y: a, m: b } : null;
    if (two[2].length >= 3 || b > 31) return a >= 1 && a <= 12 ? { m: a, y: b } : null;
    const monthFirst = order === 'dmy' ? b > 12 : a <= 12;
    const [month, day] = monthFirst ? [a, b] : [b, a];
    return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? { m: month, d: day } : null;
  }
  // Un número de tres cifras o más: un año.
  if (/^\d{3,6}$/.test(s)) return { y: Number(s) };
  // Con el nombre del mes: «3 de diciembre de 2059», «diciembre 2059», «3 dic», «diciembre».
  dateLanguages();
  let month = 0;
  let short = false;
  const nums = [];
  for (const token of s.split(/[^\p{L}\d]+/u).filter(Boolean)) {
    if (/^\d+$/.test(token)) nums.push(token);
    else if (MONTHS.has(token)) {
      if (month) return null;
      month = MONTHS.get(token);
      short = !LONG_MONTHS.has(token);
    } else if (!FILLER.has(token) && !WEEKDAYS.has(token)) return null;
  }
  // Una abreviatura sola («mar», «may») es más probable que sea parte de un nombre que un mes.
  if (!month || nums.length > 2 || (short && !nums.length)) return null;
  const out = { m: month };
  for (const n of nums) {
    const value = Number(n);
    if (n.length >= 3 || value > 31) {
      if (out.y !== undefined) return null;
      out.y = value;
    } else if (out.d === undefined) out.d = value;
    else if (out.y === undefined) out.y = value;
    else return null;
  }
  return out;
}

/** ¿La fecha «AAAA-MM-DD…» cumple lo que pide el patrón? */
function dateMatches(pattern, time) {
  const m = /^(\d{1,6})-(\d{2})-(\d{2})/.exec(time || '');
  if (!m) return false;
  return (pattern.y === undefined || pattern.y === Number(m[1]))
    && (pattern.m === undefined || pattern.m === Number(m[2]))
    && (pattern.d === undefined || pattern.d === Number(m[3]));
}

function termMatcher(term) {
  const whole = parseDatePattern(term);
  const words = plain(term).split(' ').filter(Boolean).map((word) => ({ word, date: parseDatePattern(word) }));
  return (entry) => (whole && dateMatches(whole, entry.time))
    || words.every(({ word, date }) => entry.text.includes(word) || (date && dateMatches(date, entry.time)));
}

/**
 * Prepara una búsqueda. Devuelve una función que dice si una entrada { text, time } la cumple
 * (`text` ya sin mayúsculas ni acentos: pásalo por `plain`), o null si la búsqueda está vacía.
 */
export function compileQuery(query) {
  const groups = String(query || '').split('|')
    .map((group) => group.split('&').map((term) => term.trim()).filter(Boolean).map(termMatcher))
    .filter((terms) => terms.length);
  if (!groups.length) return null;
  return (entry) => groups.some((terms) => terms.every((matches) => matches(entry)));
}

export { plain };
