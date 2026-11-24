// Utilidades de texto, HTML, fechas y descargas.
import { getLang } from './i18n.js';
import { getPrefs } from './prefs.js';

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function uid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += ID_ALPHABET[b % 36];
  return out;
}

export function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- Saneado de HTML ----------

const ALLOWED = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'SPAN', 'MARK', 'UL', 'OL', 'LI', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE']);
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'HEAD', 'TITLE', 'SVG', 'MATH', 'IMG', 'VIDEO', 'AUDIO', 'CANVAS', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'NOSCRIPT', 'TEMPLATE']);

function cleanNode(node, keepTodos) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 3) continue;
    if (child.nodeType !== 1) { child.remove(); continue; }
    const tag = child.tagName.toUpperCase();
    if (DROP.has(tag)) { child.remove(); continue; }
    cleanNode(child, keepTodos);

    // Marca de pendiente (<span data-todo="id">): solo se conserva en el editor de escenas.
    const todo = keepTodos && tag === 'SPAN' ? child.getAttribute('data-todo') : null;
    const style = child.style || {};
    const align = style.textAlign;
    const bg = style.backgroundColor;
    const weight = style.fontWeight;
    const bold = weight === 'bold' || weight === 'bolder' || parseInt(weight, 10) >= 600;
    const italic = style.fontStyle === 'italic';
    const deco = (style.textDecorationLine || style.textDecoration || '');

    // Envoltorios de Google Docs (<b style="font-weight:normal">) y etiquetas no admitidas: se deshacen.
    const fakeBold = (tag === 'B' || tag === 'STRONG') && (weight === 'normal' || weight === '400');
    if (!ALLOWED.has(tag) || fakeBold) {
      child.replaceWith(...child.childNodes);
      continue;
    }

    for (const attr of [...child.attributes]) child.removeAttribute(attr.name);
    if (align && /^(left|right|center|justify)$/.test(align) && tag !== 'SPAN') child.style.textAlign = align;

    if (tag === 'SPAN') {
      // Estilos en línea (pegado desde Word, Docs...) convertidos a etiquetas semánticas.
      let inner = child;
      const wrap = (name) => {
        const w = document.createElement(name);
        w.append(...inner.childNodes);
        inner.append(w);
        inner = w;
      };
      if (bold) wrap('b');
      if (italic) wrap('i');
      if (deco.includes('underline')) wrap('u');
      if (deco.includes('line-through')) wrap('s');
      if (todo && /^[a-z0-9]{6,32}$/.test(todo)) {
        child.setAttribute('data-todo', todo);
        child.className = 'todo';
      }
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== 'white') {
        child.style.backgroundColor = bg;
      } else if (!child.attributes.length) {
        child.replaceWith(...child.childNodes);
      }
    }
  }
}

/**
 * Limpia HTML dejando solo el formato admitido. Las marcas de pendientes se eliminan
 * (conservando su texto) salvo con { keepTodos: true }: así nunca llegan a la lectura
 * ni a la exportación.
 */
export function sanitizeHtml(html, opts = {}) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
  cleanNode(doc.body, !!opts.keepTodos);
  return doc.body.innerHTML;
}

// ---------- HTML <-> texto ----------

const BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL']);

function parseFragment(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html || '';
  return tpl.content;
}

export function htmlToText(html) {
  if (!html) return '';
  if (html.indexOf('<') === -1 && html.indexOf('&') === -1) return html.trim();
  let out = '';
  const walk = (node) => {
    for (const c of node.childNodes) {
      if (c.nodeType === 3) out += c.data;
      else if (c.nodeType === 1) {
        if (c.tagName === 'BR') { out += '\n'; continue; }
        const block = BLOCK_TAGS.has(c.tagName);
        if (block && out && !out.endsWith('\n')) out += '\n';
        if (c.tagName === 'LI') out += '• ';
        walk(c);
        if (block && !out.endsWith('\n')) out += '\n';
      }
    }
  };
  walk(parseFragment(html));
  return out.replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function textToHtml(text) {
  return String(text || '').replace(/\r\n?/g, '\n').split('\n').map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('');
}

export function countWords(text) {
  if (!text) return 0;
  const m = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

export function countChars(text) {
  return text ? text.replace(/\n/g, '').length : 0;
}

export function textStats(html) {
  const text = htmlToText(html);
  return { words: countWords(text), chars: countChars(text) };
}

export function excerpt(html, max = 160) {
  const text = htmlToText(html).replace(/\s+/g, ' ');
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

// ---------- Buscar y reemplazar sobre DOM ----------

/** Devuelve los Range de cada aparición de `query` dentro de `root` (no cruza párrafos). */
export function findRanges(root, query, { caseSensitive = false, wholeWord = false } = {}) {
  if (!query) return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let text = '';
  let lastBlock = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const block = (n.parentElement && n.parentElement.closest('p,div,li,h1,h2,h3,blockquote')) || root;
    if (lastBlock && block !== lastBlock) text += '\n';
    lastBlock = block;
    nodes.push({ node: n, start: text.length });
    text += n.data;
  }
  const hay = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  if (hay.length !== text.length) return [];
  const isWord = (ch) => ch !== undefined && /[\p{L}\p{N}_]/u.test(ch);
  // El inicio de una coincidencia cae dentro de un nodo [0, len); el final, en (0, len].
  const locate = (offset, isEnd) => {
    for (const { node, start } of nodes) {
      const local = offset - start;
      const len = node.data.length;
      if (isEnd ? (local > 0 && local <= len) : (local >= 0 && local < len)) return [node, local];
    }
    return null;
  };
  const ranges = [];
  let idx = 0;
  while ((idx = hay.indexOf(needle, idx)) !== -1) {
    const end = idx + needle.length;
    if (!wholeWord || (!isWord(text[idx - 1]) && !isWord(text[end]))) {
      const a = locate(idx, false);
      const b = locate(end, true);
      if (a && b) {
        const range = document.createRange();
        range.setStart(a[0], a[1]);
        range.setEnd(b[0], b[1]);
        ranges.push(range);
      }
    }
    idx = end;
  }
  return ranges;
}

export function replaceInHtml(html, query, replacement, opts) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  const ranges = findRanges(div, query, opts);
  for (let i = ranges.length - 1; i >= 0; i--) {
    ranges[i].deleteContents();
    ranges[i].insertNode(document.createTextNode(replacement));
  }
  div.normalize();
  return { html: div.innerHTML, count: ranges.length };
}

// ---------- Números y fechas ----------

// El formato de fechas, horas y números se elige en Ajustes → Idioma y formatos.
// «auto» es el propio del idioma de la interfaz.

// Formatos de número: cada uno se obtiene con la configuración regional que lo usa.
const NUMBER_LOCALES = { '1.234,56': 'de-DE', '1,234.56': 'en-US', '1 234,56': 'fr-FR' };
const numberFormatters = new Map();

export function formatNumber(n) {
  const locale = NUMBER_LOCALES[getPrefs().numberFormat] || getLang();
  if (!numberFormatters.has(locale)) numberFormatters.set(locale, new Intl.NumberFormat(locale));
  return numberFormatters.get(locale).format(n || 0);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayOffset(day, delta) {
  const d = parseLocal(day);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Interpreta 'AAAA-MM-DD' o 'AAAA-MM-DDTHH:mm' como hora local (sin zonas horarias). */
export function parseLocal(str) {
  const m = /^(\d{1,6})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(str || '');
  if (!m) return null;
  const d = new Date(2000, Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0));
  d.setFullYear(Number(m[1]));
  return d;
}

/** Formatos de fecha numéricos que se pueden elegir (además de «auto»). */
export const DATE_FORMATS = ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd', 'yyyy/mm/dd', 'dd.mm.yyyy', 'dd-mm-yyyy'];
export const TIME_FORMATS = ['24', '12'];
export const NUMBER_FORMATS = Object.keys(NUMBER_LOCALES);

const datePattern = () => (DATE_FORMATS.includes(getPrefs().dateFormat) ? getPrefs().dateFormat : '');

/** Fecha con el patrón numérico elegido; `want` dice qué partes se piden (día, mes, año). */
function numericDate(d, pattern, want) {
  const sep = pattern.replace(/[a-z]/g, '')[0];
  const value = { d: pad(d.getDate()), m: pad(d.getMonth() + 1), y: String(d.getFullYear()) };
  return pattern.split(sep).map((part) => part[0]).filter((key) => want[key]).map((key) => value[key]).join(sep);
}

/**
 * Da formato a una fecha. `opts` son las opciones de Intl.DateTimeFormat que piden las
 * páginas (qué partes y con qué estilo). Con «auto» se usan tal cual, en el idioma de la
 * interfaz; con un patrón numérico elegido, la fecha sale con ese patrón (y el día de la
 * semana delante, si se pedía).
 */
function fmtDate(d, opts) {
  const pattern = datePattern();
  if (!pattern) return new Intl.DateTimeFormat(getLang(), opts).format(d);
  const whole = !!opts.dateStyle;
  const text = numericDate(d, pattern, { d: whole || 'day' in opts, m: whole || 'month' in opts, y: whole || 'year' in opts });
  return opts.weekday ? `${new Intl.DateTimeFormat(getLang(), { weekday: opts.weekday }).format(d)}, ${text}` : text;
}

/** Hora según el ajuste: 24 h («05:30»), 12 h («5:30 p. m.») o, con «auto», la del idioma. */
function fmtTime(d) {
  const mode = getPrefs().timeFormat;
  if (mode === '24') return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return new Intl.DateTimeFormat(getLang(), { hour: 'numeric', minute: '2-digit', ...(mode === '12' ? { hour12: true } : {}) }).format(d);
}

/** Fecha y hora juntas. Si todo está en «auto» se deja al idioma componer la frase entera. */
function fmtDateTime(d, dateStyle) {
  const auto = !datePattern() && !TIME_FORMATS.includes(getPrefs().timeFormat);
  if (auto) return new Intl.DateTimeFormat(getLang(), { dateStyle, timeStyle: 'short' }).format(d);
  return `${fmtDate(d, { dateStyle })}${datePattern() ? ' ' : ', '}${fmtTime(d)}`;
}

export function formatDate(str, opts) {
  const d = parseLocal(str);
  if (!d) return '';
  return fmtDate(d, opts || { dateStyle: 'long' });
}

export function formatDateTime(str) {
  const d = parseLocal(str);
  if (!d) return '';
  return /[T ]\d{2}:\d{2}/.test(str) ? fmtDateTime(d, 'long') : fmtDate(d, { dateStyle: 'long' });
}

export function formatTimestamp(utc) {
  if (!utc) return '';
  const d = new Date(utc.replace(' ', 'T') + 'Z');
  if (isNaN(d)) return '';
  return fmtDateTime(d, 'medium');
}

// Ejemplos para los selectores de Ajustes: cómo queda hoy, las 17:30 y un número con cada formato.
export const sampleDate = (pattern) => (DATE_FORMATS.includes(pattern)
  ? numericDate(new Date(), pattern, { d: true, m: true, y: true })
  : new Intl.DateTimeFormat(getLang(), { dateStyle: 'long' }).format(new Date()));
export const sampleTime = (mode) => (mode === '24' ? '17:30'
  : new Intl.DateTimeFormat(getLang(), { hour: 'numeric', minute: '2-digit', ...(mode === '12' ? { hour12: true } : {}) }).format(new Date(2000, 0, 1, 17, 30)));
export const sampleNumber = (format) => new Intl.NumberFormat(NUMBER_LOCALES[format] || getLang(), { minimumFractionDigits: 2 }).format(12345.67);

/**
 * Hora corta para columnas («05:30»). Acepta una fecha o un texto «HH:MM». Con «auto» es de
 * 24 horas, como hasta ahora; solo cambia si se elige el formato de 12 horas.
 */
export function formatClock(value) {
  let d = value;
  if (typeof value === 'string') {
    const m = /^(\d{1,2}):(\d{2})/.exec(value);
    if (!m) return value;
    d = new Date(2000, 0, 1, Number(m[1]), Number(m[2]));
  }
  if (!(d instanceof Date) || isNaN(d)) return '';
  return getPrefs().timeFormat === '12' ? fmtTime(d) : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- Archivos ----------

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Nombre de archivo a partir de un texto: en minúsculas, con guiones y sin tildes en las letras
 * latinas («Capítulo 1» → «capitulo-1»). Las letras de otros alfabetos (cirílico…) se conservan
 * tal cual: sin ellas, un título en ruso se quedaría sin nombre.
 */
export function slugify(text) {
  const s = String(text || '').toLowerCase().normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'creabel';
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}
