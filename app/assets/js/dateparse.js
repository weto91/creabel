// Lectura de fechas y horas escritas por una persona (o por una hoja de cálculo): con números
// en cualquier orden habitual («05/03/2024», «2024-03-05») o con el nombre del mes («5 de marzo
// de 2024», «March 5, 2024»). Lo usan la importación de la línea temporal y su buscador.
import { getLang } from './i18n.js';
import { getPrefs } from './prefs.js';

const pad = (n, len = 2) => String(n).padStart(len, '0');
/** Texto en una línea, sin espacios de más. */
export const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
/** Para comparar: sin mayúsculas ni acentos. */
export const plain = (s) => clean(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const YMD = /(?:^|\D)(\d{3,6})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/;
const ABY = /(?:^|\D)(\d{1,2})[-/.](\d{1,2})[-/.](\d{1,6})(?!\d)/;

/**
 * Nombres de los meses -> número de mes. LONG_MONTHS: solo los completos. Se leen siempre en
 * español y en inglés, y además en el idioma de la interfaz y en el de la novela (los da Intl,
 * también en la forma que llevan dentro de una fecha: «марта», «grudnia»). Antes de usarlos,
 * dateLanguages().
 */
export const MONTHS = new Map([['sep', 9], ['sept', 9]]);
export const LONG_MONTHS = new Set();
/** Días de la semana (acompañan a una fecha sin cambiarla). */
export const WEEKDAYS = new Set();
const loadedLanguages = new Set();
let novelLanguage = '';

function addLanguage(lang) {
  if (!lang || loadedLanguages.has(lang)) return;
  loadedLanguages.add(lang);
  const key = (name) => plain(name || '').replace(/\./g, '');
  try {
    for (const style of ['long', 'short']) {
      const alone = new Intl.DateTimeFormat(lang, { month: style });
      const inDate = new Intl.DateTimeFormat(lang, { day: 'numeric', month: style });
      for (let m = 0; m < 12; m++) {
        const date = new Date(2000, m, 15);
        const part = inDate.formatToParts(date).find((p) => p.type === 'month');
        for (const name of new Set([key(alone.format(date)), key(part && part.value)])) {
          if (!name || /\d/.test(name)) continue;
          if (!MONTHS.has(name)) MONTHS.set(name, m + 1); // los ya conocidos no cambian de mes
          if (style === 'long' && MONTHS.get(name) === m + 1) LONG_MONTHS.add(name);
        }
      }
      const weekday = new Intl.DateTimeFormat(lang, { weekday: style });
      for (let d = 1; d <= 7; d++) WEEKDAYS.add(key(weekday.format(new Date(2000, 4, d))));
    }
  } catch (err) { /* el navegador no conoce ese idioma */ }
}

/** El idioma de la novela abierta, para leer también sus meses. */
export function setNovelLanguage(code) {
  novelLanguage = String(code || '');
}

/** Prepara los nombres de meses y días de los idiomas que tocan. */
export function dateLanguages() {
  const codes = ['es', 'en', getLang(), novelLanguage];
  // El serbio se escribe en los dos alfabetos.
  if (codes.some((c) => /^sr\b/i.test(c))) codes.push('sr-Latn', 'sr-Cyrl');
  for (const code of codes) addLanguage(code);
}
dateLanguages();

function build(y, m, d, rest) {
  const [year, month, day] = [Number(y), Number(m), Number(d)];
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 0)) return null;
  return { date: `${pad(year, 4)}-${pad(month)}-${pad(day)}`, rest: rest || '' };
}

/** Orden de día y mes que se espera en una fecha numérica, según los ajustes. */
export function defaultOrder() {
  const pattern = String(getPrefs().dateFormat || '');
  if (pattern.startsWith('yyyy')) return 'ymd';
  if (pattern.startsWith('mm')) return 'mdy';
  if (pattern.startsWith('dd')) return 'dmy';
  const parts = new Intl.DateTimeFormat(getLang()).formatToParts(new Date(2000, 0, 2)).map((p) => p.type);
  return parts.indexOf('month') < parts.indexOf('day') ? 'mdy' : 'dmy';
}

/**
 * «05/03/2024» puede ser 5 de marzo o 3 de mayo. Si alguna fecha de la lista lo aclara (un
 * 25 solo puede ser el día), todas se leen igual; si no, manda el formato de los ajustes.
 */
export function detectOrder(values) {
  const base = defaultOrder();
  for (const value of values) {
    const s = clean(value);
    if (YMD.test(s)) continue;
    const m = ABY.exec(s);
    if (!m) continue;
    const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (base === 'ymd' && c <= 31 && b <= 12) continue;
    if (a > 12 && b <= 12) return 'dmy';
    if (b > 12 && a <= 12) return 'mdy';
  }
  return base;
}

/** Lee una fecha escrita con números o con el nombre del mes. Devuelve { date, rest } o null. */
export function parseDate(value, order) {
  const s = clean(value);
  let m = YMD.exec(s);
  if (m) return build(m[1], m[2], m[3], s.slice(m.index + m[0].length));
  m = ABY.exec(s);
  if (m) {
    const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const rest = s.slice(m.index + m[0].length);
    // Año de una o dos cifras escrito delante (formato año-mes-día en los ajustes).
    if (order === 'ymd' && c <= 31 && b <= 12) return build(a, b, c, rest);
    const monthFirst = order === 'mdy' ? a <= 12 : b > 12;
    return monthFirst ? build(c, a, b, rest) : build(c, b, a, rest);
  }
  // «lunes, 5 de marzo de 2024», «Monday, March 5, 2024»: el día es el primer número y el año el segundo.
  dateLanguages();
  const month = plain(s).split(/[^\p{L}]+/u).map((word) => MONTHS.get(word)).find(Boolean);
  const nums = [...s.matchAll(/\d+/g)];
  if (month && nums.length >= 2) {
    const rest = s.slice(nums[1].index + nums[1][0].length);
    // Con el año delante («2059. december 3.», en húngaro): año, mes y día.
    if (nums[0][0].length >= 3 || Number(nums[0][0]) > 31) return build(nums[0][0], month, nums[1][0], rest);
    return build(nums[1][0], month, nums[0][0], rest);
  }
  return null;
}

/** «17:30», «5:30 p. m.», «5:30 PM» -> «17:30». Devuelve '' si no hay hora. */
export function parseClock(value) {
  const m = /(?:^|\D)(\d{1,2})[:h](\d{2})(?::\d{2})?(?:\s*([ap])\.?\s*m)?/i.exec(clean(value));
  if (!m) return '';
  let hours = Number(m[1]);
  const half = (m[3] || '').toLowerCase();
  if (half === 'p' && hours < 12) hours += 12;
  if (half === 'a' && hours === 12) hours = 0;
  return hours < 24 && Number(m[2]) < 60 ? `${pad(hours)}:${m[2]}` : '';
}
