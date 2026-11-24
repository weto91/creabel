// Importación de la línea temporal desde los mismos archivos que exporta: CSV, JSON, Excel
// (XLSX) y Word (DOCX). Sirve para retocar fechas en una hoja de cálculo y traerlas de
// vuelta, o para llevar los eventos de un proyecto a otro.
//
// Qué hace con cada entrada del archivo:
//  - Evento que no existe: se crea, asignado a los elementos del proyecto que se reconozcan
//    por su nombre.
//  - Evento que ya existe (mismo título): se actualizan su fecha, descripción y elementos.
//  - Escena: solo se le cambia la fecha, y solo si existe en el libro. Las escenas no se crean.
// Antes de tocar nada se enseña un resumen y se pide confirmación.
import { h } from '../dom.js';
import { t, tn } from '../i18n.js';
import es from '../i18n/es.js';
import en from '../i18n/en.js';
import { store } from '../store.js';
import { formatDateTime } from '../text.js';
import { clean, plain, defaultOrder, detectOrder, parseDate, parseClock } from '../dateparse.js';
import { modal, btn, toast, errorText } from '../ui.js';
import { displayName, entityLabel, chapterLabel, chapterNumbers, validIds, EVENT_TARGET_TYPES, eventTime, eventInherits, eventLinks } from '../model.js';
import { openZip } from './unzip.js';
import { readDraft } from './draft.js';

const pad = (n, len = 2) => String(n).padStart(len, '0');
/** Un mismo rótulo en los dos idiomas de la interfaz: el archivo puede venir de cualquiera. */
const labels = (keys, extra = []) => new Set([...keys.flatMap((k) => [es[k], en[k]]), ...extra].filter(Boolean).map(plain));

const SCENE_LABELS = labels(['scenes.singular'], ['escena', 'scene']);
const EVENT_LABELS = labels(['event.singular', 'timeline.general'], ['evento', 'event']);

// ---------- Fechas y horas ----------

// (La lectura de fechas y horas escritas a mano está en dateparse.js.)

/** Fecha «AAAA-MM-DD» a partir de sus partes, o null si no es válida. */
function build(y, m, d) {
  const [year, month, day] = [Number(y), Number(m), Number(d)];
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 0)) return null;
  return { date: `${pad(year, 4)}-${pad(month)}-${pad(day)}` };
}

const fractionClock = (fraction) => {
  const minutes = Math.round(fraction * 1440) % 1440;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

/** Fecha que Excel guarda como número: días desde el 30-12-1899, con la hora en los decimales. */
export function serialDate(n) {
  const whole = Math.floor(n);
  const d = new Date(Date.UTC(1899, 11, 30) + whole * 86400000);
  return {
    date: `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    clock: n !== whole ? fractionClock(n - whole) : '',
  };
}

/** Fecha de un JSON: «2024-03-05», «2024-03-05T17:30», «2024-03-05 17:30:00»… */
function isoTime(value) {
  const m = /^(\d{1,6})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/.exec(clean(value));
  const day = m && build(m[1], m[2], m[3]);
  if (!day) return '';
  return day.date + (m[4] !== undefined && Number(m[4]) < 24 && Number(m[5]) < 60 ? `T${pad(Number(m[4]))}:${m[5]}` : '');
}

// ---------- Lectura de cada formato ----------
// Todos devuelven filas { kind: 'scene' | 'event', time, title, description, chapter, names | belongs }.
// `names` es una lista de nombres y `belongs` los mismos nombres en un texto separado por comas;
// lo que el archivo no trae (una columna que falta) se deja en undefined y no se toca al importar.

function fromJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data && Array.isArray(data.entries) ? data.entries : null;
  if (!list) throw new Error('bad-format');
  return list.filter((e) => e && typeof e === 'object').map((e) => ({
    kind: e.kind === 'scene' || SCENE_LABELS.has(plain(e.type)) ? 'scene' : 'event',
    time: isoTime(e.time),
    title: clean(e.title),
    description: e.description === undefined ? undefined : String(e.description || '').trim(),
    chapter: clean(e.chapter),
    names: Array.isArray(e.elements) ? e.elements.map((x) => clean(x && typeof x === 'object' ? x.name : x)).filter(Boolean) : undefined,
    scenes: Array.isArray(e.scenes) ? e.scenes.map((x) => sceneRef(x && typeof x === 'object' ? x.code : x, x && x.mode === 'told')).filter(Boolean) : undefined,
  }));
}

/** «ES-012» -> { num: 12, mode }. El identificador vale en cualquier idioma: cuenta el número. */
function sceneRef(text, told) {
  const m = /[A-Za-z]{1,2}-0*(\d+)/.exec(String(text || ''));
  return m ? { num: Number(m[1]), mode: told ? 'told' : 'in' } : null;
}
/** «ES-003, ES-020 (se cuenta)»: con paréntesis, el evento solo se cuenta en esa escena. */
const sceneRefs = (text) => clean(text).split(/[,;]/).map((part) => sceneRef(part, part.includes('('))).filter(Boolean);

/** Columnas que se reconocen por su título, en cualquiera de los dos idiomas. */
const COLUMN_OF = (() => {
  const alias = {
    date: ['fecha', 'date', 'dia', 'day'],
    time: ['hora', 'time'],
    type: ['tipo', 'type'],
    title: ['titulo', 'title', 'evento', 'event', 'nombre', 'name', 'que ocurre', 'what happens'],
    belongs: ['pertenece a', 'belongs to', 'elementos', 'elements', 'aparecen', 'appear'],
    chapter: ['capitulo', 'chapter'],
    description: ['descripcion', 'description', 'notas', 'notes'],
    scenes: ['escenas', 'scenes'],
  };
  const map = new Map();
  for (const [key, names] of Object.entries(alias)) for (const name of labels(['timeline.col.' + key], names)) map.set(name, key);
  return map;
})();
const EXPORT_ORDER = { date: 0, time: 1, type: 2, title: 3, belongs: 4, chapter: 5, description: 6 };

/** Tabla (CSV o Excel) -> filas. Cada celda es { v: texto, n: si era un número de Excel }. */
function fromTable(matrix) {
  const lines = matrix.filter((row) => row.some((c) => clean(c.v)));
  if (!lines.length) return [];
  let cols = {};
  lines[0].forEach((c, i) => {
    const key = COLUMN_OF.get(plain(c.v));
    if (key && cols[key] === undefined) cols[key] = i;
  });
  let body = lines.slice(1);
  if (cols.date === undefined || cols.title === undefined) {
    // Sin cabecera reconocible: se admite si las columnas van en el orden de la exportación.
    if (lines[0].length < 4) throw new Error('bad-format');
    cols = EXPORT_ORDER;
    const isDate = (c) => !!c && ((c.n && isFinite(Number(c.v))) || !!parseDate(c.v, defaultOrder()));
    if (isDate(lines[0][0])) body = lines;
    else if (!body.length || !isDate(body[0][0])) throw new Error('bad-format');
  }
  const cell = (row, key) => (cols[key] === undefined ? undefined : row[cols[key]] || { v: '', n: false });
  const text = (row, key) => { const c = cell(row, key); return c ? clean(c.v) : ''; };
  const numeric = (c) => !!c && c.n && c.v !== '' && isFinite(Number(c.v));
  const order = detectOrder(body.map((row) => text(row, 'date')));

  return body.map((row) => {
    const dc = cell(row, 'date');
    const tc = cell(row, 'time');
    let date = '';
    let clock = '';
    if (numeric(dc)) ({ date, clock } = serialDate(Number(dc.v)));
    else if (dc) {
      const parsed = parseDate(dc.v, order);
      if (parsed) { date = parsed.date; clock = parseClock(parsed.rest); }
    }
    if (numeric(tc)) clock = fractionClock(Number(tc.v) % 1);
    else if (tc && clean(tc.v)) clock = parseClock(tc.v) || clock;
    const type = plain(text(row, 'type'));
    const chapter = text(row, 'chapter');
    const description = cell(row, 'description');
    const belongs = cell(row, 'belongs');
    const scenes = cell(row, 'scenes');
    return {
      scenes: scenes === undefined ? undefined : sceneRefs(scenes.v),
      kind: SCENE_LABELS.has(type) || (!type && chapter) ? 'scene' : 'event',
      time: date ? date + (clock ? 'T' + clock : '') : '',
      title: text(row, 'title'),
      description: description === undefined ? undefined : String(description.v || '').trim(),
      chapter,
      belongs: belongs === undefined ? undefined : clean(belongs.v),
    };
  });
}

/** CSV con «;», «,» o tabulador (el que más aparezca en la cabecera) y comillas dobles. */
export function parseCsv(text) {
  const first = text.split(/\r?\n/, 1)[0];
  const count = (ch) => first.split(ch).length - 1;
  const sep = [',', '\t'].reduce((best, ch) => (count(ch) > count(best) ? ch : best), ';');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch !== '"') cell += ch;
      else if (text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = false;
    } else if (ch === '"' && cell === '') {
      quoted = true;
    } else if (ch === sep) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((v) => ({ v, n: false })));
}

/** Un CSV guardado desde Excel puede no venir en UTF-8: si no cuadra, se lee como Windows-1252. */
export function decodeText(bytes) {
  const text = new TextDecoder('utf-8').decode(bytes);
  if (!text.includes(String.fromCharCode(0xFFFD))) return text;
  try { return new TextDecoder('windows-1252').decode(bytes); } catch (err) { return text; }
}

const xmlDoc = (text) => {
  const doc = new DOMParser().parseFromString(text || '', 'application/xml');
  if (!text || doc.getElementsByTagName('parsererror').length) throw new Error('bad-format');
  return doc;
};
const kids = (el, name) => (el ? [...el.children].filter((c) => c.localName === name) : []);
/** Texto de una celda o de una cadena compartida (puede venir partido en tramos con formato). */
const richText = (el) => (el ? [...el.children].map((c) => (c.localName === 't' ? c.textContent : c.localName === 'r' ? richText(c) : '')).join('') : '');

/** Primera hoja de un libro de Excel -> tabla de celdas. */
export async function readXlsx(zip) {
  const sheets = zip.names.filter((n) => /^xl\/worksheets\/[^/]+\.xml$/.test(n)).sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
  if (!sheets.length) throw new Error('bad-format');
  const sharedXml = await zip.text('xl/sharedStrings.xml');
  const shared = sharedXml ? kids(xmlDoc(sharedXml).documentElement, 'si').map(richText) : [];
  const sheet = xmlDoc(await zip.text(sheets[0]));
  const matrix = [];
  for (const row of kids(kids(sheet.documentElement, 'sheetData')[0], 'row')) {
    const cells = [];
    let next = 0;
    for (const c of kids(row, 'c')) {
      const ref = /^([A-Z]+)/.exec(c.getAttribute('r') || '');
      const col = ref ? [...ref[1]].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1 : next;
      next = col + 1;
      if (col > 255) continue;
      const type = c.getAttribute('t') || 'n';
      const value = kids(c, 'v')[0];
      const raw = value ? value.textContent : '';
      if (type === 'inlineStr') cells[col] = { v: richText(kids(c, 'is')[0]), n: false };
      else if (type === 's') cells[col] = { v: shared[Number(raw)] || '', n: false };
      else cells[col] = { v: raw, n: type === 'n' && raw !== '' };
    }
    matrix.push(Array.from(cells, (c) => c || { v: '', n: false }));
  }
  return matrix;
}

/**
 * Documento de Word con la forma del exportado: un título por día, y por cada entrada un
 * párrafo en negrita («17:30 — Qué ocurre»), otro con el tipo, el capítulo y los elementos
 * separados por « · », y debajo la descripción.
 */
function fromDocument(paras) {
  const order = detectOrder(paras.filter((p) => p.level).map((p) => p.text));
  const rows = [];
  let day = null; // null: aún en la portada; '': título que no es una fecha
  let current = null;
  for (const p of paras) {
    const text = clean(p.text);
    if (!text || p.skip) continue;
    if (p.level) {
      const parsed = parseDate(text, order);
      day = parsed ? parsed.date : '';
      current = null;
      continue;
    }
    if (day === null) continue;
    // «— Pasan 2 días —»: el tiempo entre dos entradas se calcula solo, no se importa.
    if (/^[—–-]\s.*\s[—–-]$/.test(text)) { current = null; continue; }
    if (/^<p[^>]*><b>.*<\/b><\/p>$/.test(p.html)) {
      const m = /^(\d{1,2}[:h]\d{2}(?:\s*[ap]\.?\s*m\.?)?)\s+[—–-]\s+(.+)$/i.exec(text);
      const clock = m ? parseClock(m[1]) : '';
      current = { kind: 'event', time: day ? day + (clock ? 'T' + clock : '') : '', title: m && clock ? clean(m[2]) : text, description: '', chapter: '', belongs: undefined, detail: false };
      rows.push(current);
      continue;
    }
    if (!current) continue;
    if (!current.detail) {
      current.detail = true;
      const parts = text.split(' · ').map(clean);
      const type = plain(parts[0]);
      if (SCENE_LABELS.has(type)) {
        current.kind = 'scene';
        current.chapter = parts[1] || '';
        current.belongs = parts.slice(2).join(', ');
        continue;
      }
      if (EVENT_LABELS.has(type)) {
        current.belongs = parts.slice(1).join(', ');
        continue;
      }
    }
    // «Escenas: ES-003, ES-020 (se cuenta)»: con qué escenas está enlazado el evento.
    const linked = /^(?:escenas|scenes)\s*:\s*(.+)$/i.exec(text);
    if (linked && current.kind === 'event' && sceneRefs(linked[1]).length) { current.scenes = sceneRefs(linked[1]); continue; }
    current.description += (current.description ? '\n' : '') + text;
  }
  return rows;
}

/** Lee un archivo de línea temporal en cualquiera de los cuatro formatos. Lanza un error si no lo es. */
export async function readTimelineFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) { // «PK»: un ZIP, es decir, Word o Excel
    const zip = openZip(buffer);
    if (zip.names.includes('word/document.xml')) return fromDocument(await readDraft(file));
    if (zip.names.includes('xl/workbook.xml')) return fromTable(await readXlsx(zip));
    throw new Error('bad-format');
  }
  const text = decodeText(bytes);
  const head = text.trimStart()[0];
  return head === '{' || head === '[' ? fromJson(text) : fromTable(parseCsv(text));
}

// ---------- Qué cambia ----------

/** Nombre (sin acentos) -> personaje, lugar, objeto o grupo del proyecto. */
function nameIndex() {
  const index = new Map();
  for (const type of EVENT_TARGET_TYPES) {
    for (const e of store.list(type)) {
      for (const label of [entityLabel(e), displayName(e)]) {
        const key = plain(label);
        if (key && !index.has(key)) index.set(key, e);
      }
    }
  }
  return index;
}

/** Elementos del proyecto que nombra una fila. `unknown`: los nombres que no existen aquí. */
function resolveNames(row, index) {
  const ids = [];
  const unknown = [];
  const add = (e) => { if (!ids.includes(e.id)) ids.push(e.id); };
  if (Array.isArray(row.names)) {
    for (const name of row.names) {
      const e = index.get(plain(name));
      if (e) add(e);
      else unknown.push(name);
    }
  } else if (row.belongs) {
    // Los nombres van separados por comas, pero un nombre puede llevar comas («Faro, Galicia»):
    // se prueba primero con el tramo más largo que coincida con un elemento.
    const parts = row.belongs.split(',').map(clean).filter(Boolean);
    for (let i = 0; i < parts.length;) {
      let hit = null;
      let j = parts.length;
      for (; j > i; j--) {
        hit = index.get(plain(parts.slice(i, j).join(', ')));
        if (hit) break;
      }
      if (hit) { add(hit); i = j; } else { unknown.push(parts[i]); i++; }
    }
  }
  return { ids, unknown, given: row.names !== undefined || row.belongs !== undefined };
}

const sameSet = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

/**
 * Compara las filas leídas con el proyecto y devuelve lo que habría que hacer:
 * { create, update, scenes, same, missingScenes, unknown, invalid }. No cambia nada.
 */
export function planTimelineImport(rows) {
  const plan = { total: rows.length, create: [], update: [], scenes: [], same: 0, missingScenes: [], unknown: [], invalid: 0 };
  const index = nameIndex();
  const numbers = chapterNumbers();
  const valid = rows.filter((row) => {
    if (row.title && row.time) return true;
    plan.invalid++;
    return false;
  });

  const byTitle = new Map();
  for (const ev of store.list('event')) {
    const key = plain(ev.name);
    byTitle.set(key, [...(byTitle.get(key) || []), ev]);
  }
  const sceneByNum = new Map(store.list('scene').filter((s) => s.data.num > 0).map((s) => [s.data.num, s]));
  const inFile = new Map();
  for (const row of valid) if (row.kind === 'event') inFile.set(plain(row.title), (inFile.get(plain(row.title)) || 0) + 1);
  const used = new Set();

  for (const row of valid) {
    const key = plain(row.title);
    if (row.kind === 'scene') {
      let found = store.list('scene').filter((s) => plain(displayName(s)) === key && !used.has(s.id));
      if (found.length > 1 && row.chapter) {
        const narrowed = found.filter((s) => { const c = store.get(s.parent_id); return c && plain(chapterLabel(c, numbers)) === plain(row.chapter); });
        if (narrowed.length) found = narrowed;
      }
      if (found.length !== 1) { plan.missingScenes.push(row.title); continue; }
      const scene = found[0];
      used.add(scene.id);
      if ((scene.data.time || '') === row.time) plan.same++;
      else plan.scenes.push({ scene, title: displayName(scene), time: row.time, from: scene.data.time || '' });
      continue;
    }

    const names = resolveNames(row, index);
    for (const name of names.unknown) if (!plan.unknown.some((x) => plain(x) === plain(name))) plan.unknown.push(name);
    const existing = byTitle.get(key) || [];
    const free = existing.filter((ev) => !used.has(ev.id));
    // El mismo evento: mismo título y fecha; o mismo título, si solo hay uno aquí y uno en el archivo
    // (entonces lo que ha cambiado es la fecha).
    let ev = free.find((x) => eventTime(x) === row.time || (x.data.time || '') === row.time);
    if (!ev && free.length === 1 && existing.length === 1 && inFile.get(key) === 1) ev = free[0];
    // Escenas enlazadas, por su identificador. Si alguna no existe aquí, el enlace no se toca.
    const links = Array.isArray(row.scenes) ? row.scenes.map((r) => ({ id: (sceneByNum.get(r.num) || {}).id, mode: r.mode })) : null;
    const linksOk = !!links && links.every((l) => l.id);
    if (!ev) {
      plan.create.push({ title: row.title, time: row.time, description: row.description || '', targets: names.ids, scenes: linksOk ? links : [] });
      continue;
    }
    used.add(ev.id);
    const changes = {};
    // La fecha de un evento que ocurre en una escena es la de la escena: no se cambia desde aquí.
    const inherits = linksOk ? links.some((l) => l.mode === 'in' && store.get(l.id).data.time) : eventInherits(ev);
    if (!inherits && (ev.data.time || '') !== row.time) changes.time = row.time;
    if (linksOk) {
      const now = eventLinks(ev).map((l) => `${l.scene.id}:${l.mode}`).sort().join();
      if (links.map((l) => `${l.id}:${l.mode}`).sort().join() !== now) changes.scenes = links;
    }
    if (row.description !== undefined && clean(row.description) !== clean(ev.data.description)) changes.description = row.description;
    // Si algún nombre no se reconoce, no se toca a quién pertenece: se perdería sin querer.
    if (names.given && !names.unknown.length && !sameSet(names.ids, validIds(ev.data.targets))) changes.targets = names.ids;
    if (Object.keys(changes).length) plan.update.push({ ev, title: displayName(ev), time: row.time, from: ev.data.time || '', changes });
    else plan.same++;
  }
  return plan;
}

/** Aplica un plan. `scenes`: si también se cambia la fecha de las escenas. Devuelve cuántos cambios hizo. */
export async function applyTimelineImport(plan, { scenes = true } = {}) {
  let done = 0;
  for (const item of plan.create) {
    await store.create('event', { name: item.title, data: { time: item.time, description: item.description, targets: item.targets, scenes: item.scenes || [] } });
    done++;
  }
  for (const item of plan.update) {
    await store.update(item.ev.id, { data: { ...item.ev.data, ...item.changes } });
    done++;
  }
  if (scenes) {
    for (const item of plan.scenes) {
      await store.update(item.scene.id, { data: { ...item.scene.data, time: item.time } });
      done++;
    }
  }
  return done;
}

// ---------- Diálogo ----------

const PREVIEW = 8;
const brief = (names, max = 6) => names.slice(0, max).join(', ') + (names.length > max ? '…' : '');

/**
 * Lee el archivo, enseña lo que cambiaría y, si se acepta, lo importa. Devuelve true si la
 * línea temporal ha cambiado.
 */
export async function importTimeline(file) {
  let plan;
  try {
    plan = planTimelineImport(await readTimelineFile(file));
  } catch (err) {
    console.error(err);
    toast(t('timeline.importBad', { name: file.name }), 'error', 7000);
    return false;
  }
  if (!plan.total) {
    toast(t('timeline.importEmpty'), 'info', 5000);
    return false;
  }

  return new Promise((resolve) => {
    let changed = false;
    const pending = plan.create.length + plan.update.length + plan.scenes.length;
    const withScenes = h('input', { type: 'checkbox' });
    withScenes.checked = true;

    const entry = (tag, item, cls) => h('li',
      h('span', { class: 'import-tag ' + cls }, t('timeline.importTag.' + tag)),
      h('span.import-what', h('strong', item.title),
        h('span.muted', item.from && item.from !== item.time ? `${formatDateTime(item.from)} → ${formatDateTime(item.time)}` : formatDateTime(item.time))));
    const entries = [
      ...plan.create.map((item) => entry('new', item, 'is-new')),
      ...plan.update.map((item) => entry('changed', item, 'is-changed')),
      ...plan.scenes.map((item) => entry('scene', item, 'is-scene')),
    ];

    const body = h('div.import-plan', [
      h('p.modal-text', tn('timeline.importIntro', plan.total, { name: file.name })),
      h('ul.import-summary', [
        plan.create.length ? h('li', tn('timeline.importNew', plan.create.length)) : null,
        plan.update.length ? h('li', tn('timeline.importChanged', plan.update.length)) : null,
        plan.scenes.length ? h('li', tn('timeline.importScenes', plan.scenes.length)) : null,
        plan.same ? h('li.muted', tn('timeline.importSame', plan.same)) : null,
        plan.missingScenes.length ? h('li.muted', tn('timeline.importNoScene', plan.missingScenes.length, { list: brief(plan.missingScenes) })) : null,
        plan.unknown.length ? h('li.muted', t('timeline.importUnknown', { list: brief(plan.unknown) })) : null,
        plan.invalid ? h('li.muted', tn('timeline.importInvalid', plan.invalid)) : null,
      ].filter(Boolean)),
      entries.length ? h('ul.import-preview', entries.slice(0, PREVIEW),
        entries.length > PREVIEW ? h('li.muted', tn('timeline.importMore', entries.length - PREVIEW)) : null) : null,
      plan.scenes.length ? h('label.form-check', withScenes, h('span', t('timeline.importScenesCheck'))) : null,
      pending ? h('p.muted.small', t('timeline.importNote')) : h('p.modal-text', t('timeline.importNothing')),
    ].filter(Boolean));

    const run = async () => {
      go.disabled = true;
      changed = true; // aunque se cierre el diálogo a medias, la página se repinta
      try {
        const done = await applyTimelineImport(plan, { scenes: withScenes.checked });
        toast(tn('timeline.importDone', done), 'success');
      } catch (err) {
        console.error(err);
        toast(errorText(err), 'error', 6000);
      }
      m.close();
    };
    const go = btn(t('timeline.importRun'), { kind: 'primary', icon: 'upload', onClick: run });
    const m = modal({
      title: t('timeline.importTitle'), body,
      actions: pending ? [btn(t('common.cancel'), { onClick: () => m.close() }), go] : [btn(t('common.close'), { kind: 'primary', onClick: () => m.close() })],
      onClose: () => resolve(changed),
    });
  });
}
