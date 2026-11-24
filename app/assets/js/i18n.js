// Traducciones de la interfaz. Para añadir un idioma: crear i18n/<código>.js (y, si se quiere,
// help/, guides/ y traits/) y registrarlo en LANGS.
//
// El español y el inglés van siempre cargados: son los idiomas de reserva. Los demás se cargan
// solo cuando se eligen (loadLang), para no hacer más pesada la aplicación. Si a un idioma le
// falta un texto, se busca en su cadena de reserva: el español de Latinoamérica, el catalán y el
// gallego tiran del español; los demás, del inglés y después del español.
import es from './i18n/es.js';
import en from './i18n/en.js';

const dicts = { es, en };
let lang = 'es';

/** Idiomas de la interfaz, cada uno con su nombre en ese idioma. */
export const LANGS = [
  { code: 'es', label: 'Español (España)' },
  { code: 'es-419', label: 'Español (Latinoamérica)' },
  { code: 'ca', label: 'Català' },
  { code: 'gl', label: 'Galego' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'pl', label: 'Polski' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sl', label: 'Slovenščina' },
  { code: 'sr-Latn', label: 'Srpski' },
  { code: 'hu', label: 'Magyar' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
];

const SPANISH_FAMILY = ['es-419', 'ca', 'gl'];

/** Dónde se busca un texto: el idioma, su reserva y, al final, el español. */
export function langChain(code = lang) {
  const chain = [code, ...(SPANISH_FAMILY.includes(code) ? ['es'] : code === 'es' ? [] : ['en']), 'es'];
  return [...new Set(chain)];
}

const known = (code) => LANGS.some((l) => l.code === code);

/** El idioma de la interfaz más parecido a uno dado (de un navegador o de un sistema). */
export function matchLang(code) {
  const c = String(code || '');
  if (known(c)) return c;
  const lower = c.toLowerCase();
  if (lower.startsWith('es-') && lower !== 'es-es') return 'es-419';
  if (lower.startsWith('pt')) return lower === 'pt-br' ? 'pt-BR' : 'pt-PT';
  if (lower.startsWith('sr')) return 'sr-Latn';
  const base = lower.slice(0, 2);
  return known(base) ? base : 'es';
}

/** Carga (una vez) las traducciones de un idioma. Devuelve el código que se puede usar. */
export async function loadLang(code) {
  const c = known(code) ? code : matchLang(code);
  if (!dicts[c]) {
    try {
      dicts[c] = (await import(`./i18n/${c}.js`)).default;
    } catch (err) {
      console.warn('Creabel: no se han podido cargar las traducciones de', c, err);
      return 'es';
    }
  }
  return c;
}

export function setLang(code) {
  lang = dicts[code] ? code : 'es';
  document.documentElement.lang = lang;
}

export function getLang() {
  return lang;
}

/** Valor sin procesar (texto o lista) de una clave, en el idioma o en su reserva. */
export function tr(key) {
  for (const code of langChain()) {
    const dict = dicts[code];
    if (dict && dict[key] !== undefined) return dict[key];
  }
  return undefined;
}

/** Texto traducido; sustituye {nombre} por params.nombre. */
export function t(key, params) {
  let s = tr(key);
  if (s === undefined) return key;
  if (params && typeof s === 'string') {
    s = s.replace(/\{(\w+)\}/g, (match, name) => (params[name] !== undefined ? params[name] : match));
  }
  return s;
}

/**
 * Texto con plural: clave.one, clave.other y, en los idiomas que los tienen, clave.two,
 * clave.few y clave.many (las categorías de Intl.PluralRules). Sustituye {n} con el número
 * formateado.
 */
export function tn(key, n, params) {
  const formatted = new Intl.NumberFormat(lang).format(n);
  let category = n === 1 ? 'one' : 'other';
  try { category = new Intl.PluralRules(lang).select(n); } catch (err) { /* sin reglas de plural */ }
  const candidates = [`${key}.${category}`, key + (n === 1 ? '.one' : '.other'), `${key}.other`];
  const chosen = candidates.find((k) => tr(k) !== undefined) || `${key}.other`;
  return t(chosen, { n: formatted, ...(params || {}) });
}

/**
 * Carga un contenido que existe por idioma (la ayuda, las guías): el del idioma de la
 * interfaz o, si no lo hay, el de su reserva. `load(código)` hace el import.
 * Devuelve { lang, content }.
 */
export async function importLocalized(load) {
  let lastError = null;
  for (const code of langChain()) {
    try {
      return { lang: code, content: (await load(code)).default };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('no localized content');
}
