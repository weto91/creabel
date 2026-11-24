// Importación de elementos (personajes, lugares, objetos, grupos, fichas propias, notas,
// diccionario y tramas) desde los mismos archivos que se exportan: JSON, texto, Word, CSV o
// Excel. Entra todo lo que sale (export/elements.js): los datos, el texto y los apartados de
// cada ficha (rasgos, preguntas, eventos, escenas en las que aparece, relaciones) y, del JSON
// de una ficha, también sus imágenes.
//  - Lo que no existe se crea; lo que ya existe (mismo identificador o mismo nombre) se
//    actualiza solo en lo que traiga el archivo. No se borra ni se duplica nada.
//  - Antes de tocar nada se enseña un resumen y se pide confirmación.
import { h } from '../dom.js';
import { t, tn } from '../i18n.js';
import es from '../i18n/es.js';
import en from '../i18n/en.js';
import { store } from '../store.js';
import { htmlToText, textToHtml, sanitizeHtml, uid } from '../text.js';
import { modal, btn, toast, errorText } from '../ui.js';
import {
  displayName, entityCode, entityLabel, locationDescendants, validIds, ENTITY_TYPES, CHARACTER_SECTIONS, questionsFor, visibleTraits,
  allScenesOrdered, chapterNumbers, chapterLabel, sceneHas, sceneLocationIds, allRelations, RELATION_TYPES, STRAND_LEVELS, STRAND_KINDS,
} from '../model.js';
import { traitKey } from '../traits.js';
import { splitAliases } from '../mentions.js';
import { clean, plain, detectOrder, defaultOrder, parseDate, parseClock } from '../dateparse.js';
import { NOTE_COLORS, noteLinks, noteTags, linkName } from '../notes.js';
import { columnsFor } from '../export/elements.js';
import { openZip } from './unzip.js';
import { readDraft } from './draft.js';
import { parseCsv, decodeText, readXlsx, serialDate } from './timeline.js';
import { md5 } from '../md5.js';
import { FILE_TYPES } from '../local/engine.js';

/** El nombre que tendrá un archivo en Creabel (creabel_<md5>.<ext>), a partir de su data: URL. */
function contentName(dataUrl, mime) {
  const m = /^data:([^;,]*)((?:;[^;,]*)*),(.*)$/s.exec(dataUrl || '');
  if (!m) return '';
  const ext = FILE_TYPES[mime || m[1]];
  if (!ext) return '';
  try {
    const bytes = /;base64/i.test(m[2])
      ? Uint8Array.from(atob(m[3]), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(decodeURIComponent(m[3]));
    return `creabel_${md5(bytes)}.${ext}`;
  } catch (err) {
    return '';
  }
}

const LINK_TYPES = ['character', 'location', 'object', 'group', 'custom', 'strand'];
// Apartados de una ficha (columnas de varias líneas) y campo de la escena en el que se marca cada tipo.
const BLOCK_KEYS = ['traits', 'answers', 'events', 'appears', 'relations'];
const SCENE_FIELD = { character: 'characters', location: 'locations', object: 'objects', group: 'groups', custom: 'custom', strand: 'strands' };
const sameText = (a, b) => clean(a) === clean(b);
const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Rótulo (sin acentos) -> clave de columna, con los rótulos de los dos idiomas. */
function labelIndex(cols) {
  const index = new Map();
  for (const c of cols) {
    const labels = c.i18n ? [es[c.i18n], en[c.i18n], c.label] : [c.label];
    for (const label of labels) if (label) index.set(plain(label), c.key);
  }
  for (const alias of ['id', 'identificador', 'identifier']) index.set(alias, 'code');
  // Los archivos de notas anteriores traían una columna «Grupo»: ahora son etiquetas.
  if (cols.some((c) => c.key === 'tags')) for (const alias of ['grupo', 'group', 'tags', 'etiquetas']) index.set(alias, 'tags');
  // Las fichas exportadas antes titulaban así el apartado de relaciones.
  if (cols.some((c) => c.key === 'relations')) for (const label of [es['sheet.relations'], en['sheet.relations']]) if (label) index.set(plain(label), 'relations');
  for (const alias of ['nombre', 'name', 'titulo', 'title']) if (!index.has(alias)) index.set(alias, 'name');
  for (const alias of ['descripcion', 'description', 'texto', 'text']) if (!index.has(alias)) index.set(alias, 'description');
  return index;
}

/** Rótulos (sin acentos) de unas claves de traducción, en los dos idiomas. */
const labelSet = (keys) => new Set(keys.flatMap((k) => [es[k], en[k]]).filter(Boolean).map(plain));
const BODY_TITLES = labelSet(['common.description', 'note.text', 'term.definition']);
const TYPE_LABELS = labelSet(['character.singular', 'character.main', 'character.secondary', 'location.singular', 'object.singular', 'group.singular', 'note.singular', 'term.singular', 'custom.singular', 'strand.singular']);
const SECONDARY_LABELS = new Set([...labelSet(['character.secondary']), 'secondary', 'secundario', 'secundaria']);
/** «Terminado», «Done»… -> 0, 1 o 2 (undefined si no es un estado). */
const statusOf = (text) => [0, 1, 2].find((n) => [es['status.' + n], en['status.' + n]].some((l) => plain(l) === plain(text)));

// ---------- Fechas y líneas de los apartados ----------

/** «2059-05-13T06:00», «2059-05-13 06:00», «2059-05-13»… -> la fecha con la forma que usa la aplicación. */
function isoTime(value) {
  const m = /^(\d{1,6})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/.exec(clean(value));
  if (!m) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${String(Number(m[1])).padStart(4, '0')}-${pad(Number(m[2]))}-${pad(Number(m[3]))}${m[4] !== undefined ? `T${pad(Number(m[4]))}:${m[5]}` : ''}`;
}

const linesOf = (text) => String(text || '').replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);

/** «2059-05-13 06:00 — Título: descripción» (o con la fecha escrita) -> [{ time, title, description }]. */
function parseEventLines(text) {
  const split = (line) => { const undated = /^[—–-]\s+(.*)$/.exec(line); return undated ? [line, '', undated[1]] : /^(.*?)\s+[—–-]\s+(.*)$/.exec(line); };
  const lines = linesOf(text).map(split).filter(Boolean);
  const order = detectOrder(lines.map((m) => m[1] || '').filter(Boolean)) || defaultOrder();
  const out = [];
  for (const m of lines) {
    // Sin nada delante de la raya, es un evento sin fecha.
    let time = isoTime(m[1] || '');
    if (!time && m[1]) {
      const parsed = parseDate(m[1], order);
      if (parsed) { const clock = parseClock(parsed.rest); time = parsed.date + (clock ? 'T' + clock : ''); }
      if (!time) continue;
    }
    const cut = m[2].indexOf(': ');
    out.push({ time, title: cut < 0 ? m[2] : m[2].slice(0, cut), description: cut < 0 ? '' : m[2].slice(cut + 2) });
  }
  return out;
}

/** «3. La partida › Travesía» -> [{ chapter, scene }]. */
function parseAppearLines(text) {
  return linesOf(text).map((line) => {
    const parts = line.split(/\s+[›>]\s+/);
    return { chapter: parts.length > 1 ? parts.slice(0, -1).join(' › ') : '', scene: parts[parts.length - 1] };
  });
}

/**
 * «← Padre: Marcos», «→ madre de: Emma», «↔ Amigos: Yi» -> [{ direction, relation, with }].
 * Una línea sin «:» (las fichas exportadas antes: «→ madre de Emma  (mapa)») se deja en `raw`
 * y se parte después, al saber cómo se llaman las fichas del proyecto.
 */
function parseRelationLines(text) {
  const DIR = { '→': 'out', '->': 'out', '←': 'in', '<-': 'in', '↔': 'both', '<->': 'both' };
  return linesOf(text).map((line) => {
    const m = /^(↔|<->|→|->|←|<-)?\s*(.*)$/.exec(line);
    const rest = m[2].replace(/\s{2,}\([^()]*\)\s*$/, '').trim();
    const direction = DIR[m[1]] || 'in';
    const cut = rest.indexOf(': ');
    return cut > 0 ? { direction, relation: rest.slice(0, cut).trim(), with: rest.slice(cut + 2).trim() } : { direction, raw: rest };
  }).filter((r) => r.raw || (r.relation && r.with));
}

/** «Pregunta :: respuesta», una por línea -> [{ question, answer }]. */
function parseAnswerLines(text) {
  return linesOf(text).map((line) => { const cut = line.indexOf(' :: '); return cut > 0 ? { question: line.slice(0, cut).trim(), answer: line.slice(cut + 4).trim() } : null; }).filter(Boolean);
}

/**
 * Pasa a `extra` los apartados que una fila trae como texto (de una tabla o de un documento):
 * los quita de `values` (no son datos de la ficha) y devuelve la estructura.
 */
function extraFromValues(values, extra = {}) {
  const out = { ...extra };
  const take = (key) => { const text = values[key]; delete values[key]; return text; };
  for (const key of BLOCK_KEYS) {
    if (values[key] === undefined) continue;
    const text = take(key);
    // Rasgos separados por «;» o por líneas; si no, por comas (la de «1,79 m» no separa).
    if (key === 'traits' && !out.traits) out.traits = String(text).split(/[;\n]/.test(text) ? /[;\n]/ : /(?<!\d),|,(?!\d)/).map((x) => x.trim()).filter(Boolean);
    if (key === 'answers' && !out.answers) out.answers = parseAnswerLines(text);
    if (key === 'events' && !out.events) out.events = parseEventLines(text);
    if (key === 'appears' && !out.appears) out.appears = parseAppearLines(text);
    if (key === 'relations' && !out.relations) out.relations = parseRelationLines(text);
  }
  return out;
}

// ---------- Lectura ----------
// Cada fila leída es { values: { clave: texto }, html, extra }: los datos, la descripción con
// formato (si el archivo la trae) y los apartados (rasgos, secciones, preguntas, eventos…).

// Otros nombres con los que puede venir un dato en un JSON (ya sin acentos ni separadores).
const FIELD_ALIASES = {
  role: ['role', 'rol', 'papel', 'papelenlahistoria', 'roleinstory', 'roleinthestory', 'storyrole', 'funcion'],
  birth: ['birth', 'born', 'birthdate', 'birthday', 'dateofbirth', 'birthiso', 'nacimiento', 'fechanacimiento', 'fechadenacimiento', 'nace'],
  death: ['death', 'died', 'deathdate', 'dateofdeath', 'deathiso', 'muerte', 'fechamuerte', 'fechademuerte', 'fallecimiento', 'fechafallecimiento', 'fechadefallecimiento', 'muere'],
  parent: ['parent', 'inside', 'within', 'dentrode'],
  kind: ['kind', 'clase'],
  nation: ['nation', 'country', 'pais', 'nacion'],
  state: ['state', 'region', 'provincia', 'estado'],
  city: ['city', 'ciudad', 'localidad'],
  color: ['color', 'colour'],
  level: ['level', 'importancia', 'importance', 'nivel'],
  strandKind: ['strandkind', 'tipodetrama', 'plottype'],
};
const fieldKey = (name) => plain(name).replace(/[^a-z0-9]/g, '');
/** Valor de un dato como texto: admite texto, número o { text | label | value | date | iso }. */
function fieldValue(value) {
  if (value == null) return '';
  if (typeof value === 'object') {
    const inner = ['text', 'label', 'value', 'date', 'iso', 'name'].map((k) => value[k]).find((x) => typeof x === 'string' || typeof x === 'number');
    return inner === undefined ? '' : String(inner);
  }
  return String(value);
}
/**
 * Los datos sueltos de una ficha en JSON, por su clave de columna: { role, birth, death, … }.
 * Una ficha escrita a mano o por otro programa puede llamarlos de otra manera («Papel en la
 * historia», «fecha_nacimiento», «birth_date»), meterlos en un bloque («dates»: { … }) o darlos
 * como { text } o { label }: se buscan por cualquiera de sus nombres.
 */
function sheetFields(data, cols) {
  const names = new Map(); // nombre normalizado -> clave de columna
  for (const [key, list] of Object.entries(FIELD_ALIASES)) for (const alias of list) names.set(alias, key);
  for (const c of cols) for (const label of c.i18n ? [es[c.i18n], en[c.i18n]] : []) if (label && FIELD_ALIASES[c.key]) names.set(fieldKey(label), c.key);
  const out = {};
  const scan = (obj, depth) => {
    for (const [name, value] of Object.entries(obj)) {
      const key = names.get(fieldKey(name));
      if (key && out[key] === undefined && !Array.isArray(value)) { out[key] = fieldValue(value); continue; }
      // Un bloque que agrupa datos («dates», «datos», «personal»): se mira dentro, un nivel.
      if (!key && depth === 0 && value && typeof value === 'object' && !Array.isArray(value)) scan(value, 1);
    }
  };
  scan(data, 0);
  return out;
}

/** Un elemento de un JSON (la ficha suelta o uno de una lista, con la forma actual o la anterior) -> fila. */
function rowFromJson(it, cols) {
  const has = (key) => cols.some((c) => c.key === key);
  const values = { name: String(it.name || '') };
  if (it.code !== undefined) values.code = String(it.code || '');
  const joined = (value) => (Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : undefined);
  for (const key of ['aliases', 'members', 'tags', 'links']) if (joined(it[key]) !== undefined) values[key] = joined(it[key]);
  // El estado puede venir como { value, label }, como número o como texto.
  const status = it.status && typeof it.status === 'object' ? (it.status.label !== undefined ? it.status.label : es['status.' + it.status.value]) : it.status;
  if (status !== undefined && status !== null) values.status = typeof status === 'number' ? String(es['status.' + status] || '') : String(status);
  for (const [key, value] of Object.entries(sheetFields(it, cols))) values[key] = value;
  if (it.strand_kind !== undefined) values.strandKind = String(it.strand_kind || '');
  if (it.fields && typeof it.fields === 'object') for (const c of cols) if (c.key.startsWith('f:') && it.fields[c.label] !== undefined) values[c.key] = String(it.fields[c.label] || '');
  // La forma anterior de las listas: un texto por columna, con la clave de la columna.
  for (const c of cols) if (values[c.key] === undefined && !BLOCK_KEYS.includes(c.key) && c.key !== 'description' && (typeof it[c.key] === 'string' || typeof it[c.key] === 'number')) values[c.key] = String(it[c.key]);
  // Las fechas en forma neutra mandan sobre las escritas.
  if (it.birth_iso !== undefined) values.birth = String(it.birth_iso || '');
  if (it.death_iso !== undefined) values.death = String(it.death_iso || '');
  const row = { values };
  if (it.description !== undefined && it.description !== null) {
    const d = it.description;
    values.description = typeof d === 'string' ? d : String(d.text || htmlToText(d.html || ''));
    if (typeof d === 'object' && d.html) row.html = String(d.html);
  }
  if (typeof it.description_html === 'string' && it.description_html) row.html = it.description_html;
  for (const key of Object.keys(values)) if (!has(key)) delete values[key];
  // Los apartados: como listas (la forma del JSON) o, si alguien los ha escrito así, como texto.
  const list = (value) => (Array.isArray(value) ? value.filter((x) => x != null) : undefined);
  const text = (value) => (typeof value === 'string' ? value : undefined);
  row.extra = {
    traits: list(it.traits), sections: list(it.sections), answers: list(it.questions) || list(it.answers),
    events: list(it.events), appears: list(it.appears_in) || list(it.appears), relations: list(it.relations), images: list(it.images),
  };
  const asText = { traits: text(it.traits), answers: text(it.questions), events: text(it.events), appears: text(it.appears_in) || text(it.appears), relations: text(it.relations) };
  for (const key of BLOCK_KEYS) if (asText[key] !== undefined && has(key)) values[key] = asText[key];
  return row;
}

function fromJson(text, cols) {
  const data = JSON.parse(text);
  // Ficha completa de un solo elemento (el JSON de «Exportar ficha»).
  if (data && !Array.isArray(data) && (data.creabel === 'ficha' || (data.name !== undefined && !Array.isArray(data.items)))) return [rowFromJson(data, cols)];
  const items = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : null;
  if (!items) throw new Error('bad-format');
  return items.filter((it) => it && typeof it === 'object').map((it) => rowFromJson(it, cols));
}

function fromTable(matrix, cols) {
  const lines = matrix.filter((row) => row.some((c) => clean(c.v)));
  if (lines.length < 1) return [];
  const index = labelIndex(cols);
  const keys = lines[0].map((c) => index.get(plain(c.v)) || null);
  if (!keys.includes('name')) throw new Error('bad-format');
  return lines.slice(1).map((row) => {
    const values = {};
    keys.forEach((key, i) => {
      if (!key || values[key] !== undefined) return;
      const cell = row[i] || { v: '', n: false };
      // Una fecha que Excel ha convertido en número.
      const serial = (key === 'birth' || key === 'death') && cell.n && cell.v !== '' && isFinite(Number(cell.v));
      values[key] = serial ? serialDate(Number(cell.v)).date : String(cell.v == null ? '' : cell.v).trim();
    });
    return { values };
  });
}

// Texto y Word se leen igual: como una lista de líneas en la que unas son títulos. `h` es 1
// (empieza un elemento: su nombre), 2 (empieza un bloque: «Descripción», «Eventos», una
// sección de un personaje…) o 0 (una línea normal). `html` y `bold` solo los da Word.

/** Documento de Word: el título de nivel más alto es cada elemento; los demás títulos, sus bloques. */
function docOutline(paras, single) {
  const levels = paras.filter((p) => p.level && clean(p.text) && !p.skip).map((p) => p.level);
  // Sin títulos no hay elementos; al importar en una ficha concreta, todo es su texto.
  const top = levels.length ? Math.min(...levels) : 0;
  const head = levels.length ? [] : single ? [{ h: 1, text: '' }] : null;
  if (!head) return [];
  return head.concat(paras.filter((p) => !p.skip && clean(p.text))).map((p) => (p.h ? p : {
    h: p.level ? (p.level === top ? 1 : 2) : 0, text: clean(p.text), html: p.html || '', bold: /^<p[^>]*><b>.*<\/b><\/p>$/.test(p.html || ''),
  }));
}

/** Texto de una lista: «# Nombre» y «## Bloque». */
function listTextOutline(text) {
  return text.replace(/\r\n?/g, '\n').split('\n').map((line) => {
    const head = /^(#{1,2})\s+(.+)$/.exec(line);
    return head ? { h: head[1].length, text: clean(head[2]) } : { h: 0, text: line.trim() };
  });
}

/** Texto de «Exportar ficha»: el nombre en la primera línea y, en línea propia, el título de cada bloque. */
function sheetTextOutline(text, titles) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const first = lines.findIndex((l) => l.trim());
  if (first < 0) return [];
  // Un título, solo o con el estado de la sección detrás («Aspecto físico · Terminado»).
  const isTitle = (line) => {
    if (titles.has(plain(line))) return true;
    const [base, state] = line.split(/\s+·\s+/);
    return !!state && titles.has(plain(base)) && statusOf(state) !== undefined;
  };
  return [{ h: 1, text: clean(lines[first]) }, ...lines.slice(first + 1).map((line) => ({ h: isTitle(line) ? 2 : 0, text: line.trim() }))];
}

/** Títulos de bloque que puede tener la ficha de un tipo (sin acentos): los de sus apartados y secciones. */
function blockTitles(cols, type) {
  const blocks = new Map(); // título -> clave del apartado
  const index = labelIndex(cols);
  for (const [label, key] of index) if (BLOCK_KEYS.includes(key)) blocks.set(label, key);
  const sections = new Map(); // título -> clave de la sección (personajes principales)
  if (type === 'character') for (const def of CHARACTER_SECTIONS) for (const label of [es['section.' + def.key], en['section.' + def.key]]) if (label) sections.set(plain(label), def.key);
  return { blocks, sections, all: new Set([...BODY_TITLES, ...blocks.keys(), ...sections.keys()]) };
}

/** De la lista de líneas a las filas. */
function rowsFromOutline(items, cols, type) {
  const index = labelIndex(cols);
  const { blocks, sections } = blockTitles(cols, type);
  const projectQuestions = new Set((((store.project.data.customQuestions || {})[type]) || []).map((q) => plain(q.text)));
  const rows = [];
  let cur = null;
  let mode = 'fields'; // 'fields' | 'text' | 'block' | 'section'
  let block = null;
  let sec = null;
  let qa = null;
  for (const it of items) {
    if (it.h === 1) {
      cur = { values: { name: it.text }, text: [], html: '', hasHtml: false, textSeen: false, extra: {}, found: false };
      rows.push(cur);
      mode = 'fields';
      continue;
    }
    if (!cur) continue;
    if (it.h === 2) {
      const title = plain(it.text);
      qa = null;
      if (BODY_TITLES.has(title)) { mode = 'text'; cur.text = []; cur.html = ''; cur.found = true; continue; } // lo que sigue es la descripción
      if (blocks.has(title)) { mode = 'block'; block = blocks.get(title); cur.found = true; if (block === 'answers') cur.extra.answers = cur.extra.answers || []; continue; }
      // El título de una sección puede llevar su estado: «Aspecto físico · Terminado».
      const [base, state] = it.text.split(/\s+·\s+/);
      if (sections.has(title) || (state && sections.has(plain(base)) && statusOf(state) !== undefined)) {
        sec = { key: sections.get(title) || sections.get(plain(base)), answers: [], text: [], html: '' };
        if (!sections.has(title)) sec.status = statusOf(state);
        cur.extra.sections = [...(cur.extra.sections || []), sec];
        mode = 'section';
        cur.found = true;
        continue;
      }
      // Un título que no es de la ficha: forma parte del texto (o de la sección en la que está).
      const bold = `<p><b>${escapeHtml(it.text)}</b></p>`;
      if (mode === 'section') {
        if (qa) { qa.answer += (qa.answer ? '\n' : '') + it.text; qa.answer_html += bold; } else { sec.text.push(it.text); sec.html += bold; }
        continue;
      }
      mode = 'text';
      cur.text.push(it.text);
      cur.html += bold;
      cur.textSeen = true;
      continue;
    }
    if (mode === 'fields') {
      if (!it.text) continue;
      if (TYPE_LABELS.has(plain(it.text))) { // «Lugar», «Personaje secundario»…
        if (type === 'character' && cur.values.kind === undefined && plain(it.text) !== plain(es['character.singular']) && plain(it.text) !== plain(en['character.singular'])) cur.values.kind = it.text;
        continue;
      }
      const field = /^([^:]{1,60}):\s*(.*)$/.exec(it.text);
      const key = field ? index.get(plain(field[1])) : null;
      if (key && key !== 'name' && key !== 'description') { cur.values[key] = field[2].trim(); cur.found = true; continue; }
      mode = 'text';
    }
    if (mode === 'text') {
      cur.text.push(it.text);
      if (it.html !== undefined) { cur.html += it.html; cur.hasHtml = true; }
      if (it.text) cur.textSeen = true;
      continue;
    }
    if (mode === 'block') {
      if (block === 'answers') {
        // Preguntas propias: «Pregunta :: respuesta» en una línea, o la pregunta y debajo su respuesta.
        // En Word la pregunta va en negrita; en texto se reconoce porque el proyecto ya la tiene
        // o, si no, porque se alternan: pregunta, respuesta, pregunta…
        if (!it.text) continue;
        const cut = it.text.indexOf(' :: ');
        if (cut > 0) { cur.extra.answers.push({ question: it.text.slice(0, cut).trim(), answer: it.text.slice(cut + 4).trim() }); qa = null; continue; }
        const alternate = it.bold === undefined && qa && qa.answer && !projectQuestions.has(plain(qa.question));
        if (it.bold || !qa || alternate || projectQuestions.has(plain(it.text))) { qa = { question: it.text, answer: '' }; cur.extra.answers.push(qa); } else qa.answer += (qa.answer ? '\n' : '') + it.text;
        continue;
      }
      if (it.text) cur.values[block] = (cur.values[block] ? cur.values[block] + '\n' : '') + it.text;
      continue;
    }
    if (mode === 'section') {
      // Sección de un personaje principal: una pregunta de la entrevista (reconocida por su
      // texto) abre una respuesta; sin preguntas, es texto libre.
      const known = !!it.text && questionsFor(sec.key).some((q) => plain(q.text) === plain(it.text));
      if (known) { qa = { question: it.text, answer: '', answer_html: '' }; sec.answers.push(qa); continue; }
      if (qa) { qa.answer += (qa.answer || !it.text ? '\n' : '') + it.text; if (it.html !== undefined) qa.answer_html += it.html; } else { sec.text.push(it.text); if (it.html !== undefined) sec.html += it.html; }
    }
  }
  return rows.map((r) => {
    const row = { values: r.values, extra: r.extra, found: r.found };
    if (r.textSeen || r.text.some((l) => l)) {
      row.values.description = r.text.join('\n').trim();
      if (r.hasHtml) row.html = r.html;
    }
    if (r.extra.sections) {
      r.extra.sections = r.extra.sections.map((s) => (s.answers.length
        ? { key: s.key, status: s.status, answers: s.answers.map((a) => ({ question: a.question, answer: a.answer.trim(), answer_html: a.answer_html || undefined })) }
        : { key: s.key, status: s.status, text: s.text.join('\n').trim(), html: s.html || undefined }));
    }
    return row;
  });
}

/**
 * Lee un archivo de elementos en cualquiera de los cinco formatos. `single`: se va a importar
 * en una ficha concreta (se admite entonces el texto de una ficha sin datos reconocibles).
 */
export async function readElementsFile(file, type, ct, single = false) {
  const cols = columnsFor(type, ct);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    const zip = openZip(buffer);
    if (zip.names.includes('word/document.xml')) return rowsFromOutline(docOutline(await readDraft(file), single), cols, type);
    if (zip.names.includes('xl/workbook.xml')) return fromTable(await readXlsx(zip), cols);
    throw new Error('bad-format');
  }
  const text = decodeText(bytes).replace(/^﻿/, '');
  const head = text.trimStart()[0];
  if (head === '{' || head === '[') return fromJson(text, cols);
  if (/^\s*#\s+\S/m.test(text.split('\n').slice(0, 3).join('\n'))) return rowsFromOutline(listTextOutline(text), cols, type);
  // Una tabla CSV; si no lo es, el texto de una ficha completa.
  try { return fromTable(parseCsv(text), cols); } catch (err) {
    const rows = rowsFromOutline(sheetTextOutline(text, blockTitles(cols, type).all), cols, type);
    // Sin ningún dato reconocible puede ser un texto cualquiera: solo se admite al importar en una ficha concreta.
    if (rows.some((r) => !r.found) && !single) throw new Error('bad-format');
    return rows;
  }
}

// ---------- Qué cambia ----------

/**
 * Los apartados que trae una ficha, comparados con el proyecto: qué rasgos, respuestas,
 * eventos, apariciones, relaciones e imágenes faltan. `e` es la ficha de destino (null si aún
 * no existe: entonces falta todo). Lo que no se reconoce (una escena, alguien con quien se
 * relaciona) va a `unknown(nombre)`.
 */
function planExtras(e, extra, type, unknown, shared) {
  const cfg = ENTITY_TYPES[type] || {};
  const out = { fields: [], traits: [], sections: null, answers: [], events: [], scenes: [], relations: [], images: [] };

  // Rasgos: se añaden los que la ficha no tiene ya (a mano o extraídos del texto).
  if (type === 'character' && extra.traits) {
    const have = new Set(e ? visibleTraits(e).map(traitKey) : []);
    for (const text of extra.traits.map((x) => clean(String(x)))) {
      if (text && !have.has(traitKey(text))) { have.add(traitKey(text)); out.traits.push(text); }
    }
    if (out.traits.length) out.fields.push('traits');
  }

  // Secciones de un personaje principal: texto libre o respuestas a las preguntas de la entrevista.
  if (type === 'character' && extra.sections && extra.sections.length) {
    const sections = { ...((e && e.data.sections) || {}) };
    let changed = false;
    for (const s of extra.sections) {
      const def = CHARACTER_SECTIONS.find((x) => x.key === s.key);
      if (!def) continue;
      const now = sections[def.key] || {};
      const next = { ...now };
      if (typeof s.status === 'number' && s.status !== (now.status || 0)) next.status = s.status;
      if (Array.isArray(s.answers) && (s.answers.length || !(s.html || s.text))) {
        const answers = { ...(now.answers || {}) };
        for (const a of s.answers) {
          const q = questionsFor(def.key).find((x) => plain(x.text) === plain(a.question));
          const html = a.answer_html ? sanitizeHtml(String(a.answer_html)) : textToHtml(String(a.answer || '').trim());
          if (q && htmlToText(html) && !sameText(htmlToText(html), htmlToText(answers[q.k] || ''))) answers[q.k] = html;
        }
        if (JSON.stringify(answers) !== JSON.stringify(now.answers || {})) { next.answers = answers; if (def.interview) next.mode = 'questions'; }
      } else if (s.html || s.text) {
        const html = s.html ? sanitizeHtml(String(s.html)) : textToHtml(String(s.text).trim());
        if (!sameText(htmlToText(html), htmlToText(now.free || '')) || (def.interview && now.mode !== 'free')) { next.mode = 'free'; next.free = html; }
      }
      if (JSON.stringify(next) !== JSON.stringify(now)) { sections[def.key] = next; changed = true; }
    }
    if (changed) { out.sections = sections; out.fields.push('sections'); }
  }

  // Respuestas a las preguntas propias del tipo (las de los lugares).
  if (cfg.questions && extra.answers) {
    const questions = (store.project.data.customQuestions || {})[type] || [];
    for (const a of extra.answers) {
      const question = clean(a && a.question);
      const answer = String((a && a.answer) || '').trim();
      if (!question || !answer) continue;
      const q = questions.find((x) => plain(x.text) === plain(question));
      if (!e || !q || !sameText((e.data.answers || {})[q.id] || '', answer)) out.answers.push({ question, answer });
    }
    if (out.answers.length) out.fields.push('answers');
  }

  // Eventos: si ya existe uno con el mismo título, se le añade esta ficha; si no, se crea.
  if (extra.events && cfg.events) {
    const seen = new Set();
    for (const ev of extra.events) {
      const title = clean(ev && ev.title);
      const time = isoTime(ev && ev.time);
      const key = plain(title) + '|' + time;
      if (!title || seen.has(key)) continue;
      seen.add(key);
      const same = store.list('event').filter((x) => plain(x.name) === plain(title));
      const existing = same.find((x) => (x.data.time || '') === time) || (same.length === 1 ? same[0] : null);
      if (existing) { if (!e || !validIds(existing.data.targets).includes(e.id)) out.events.push({ existing }); continue; }
      // Un evento nuevo que comparten varias fichas del archivo se crea una sola vez.
      if (!shared.events.has(key)) shared.events.set(key, { title, time, description: String((ev && ev.description) || '').trim(), entity: null });
      out.events.push({ slot: shared.events.get(key) });
    }
    if (out.events.length) out.fields.push('events');
  }

  // «Aparece en»: se marca la ficha en las escenas que se reconozcan por su nombre (y su capítulo).
  if (extra.appears && SCENE_FIELD[type]) {
    const numbers = chapterNumbers();
    const scenes = allScenesOrdered();
    for (const a of extra.appears) {
      const name = clean(a && (a.scene || a.name));
      if (!name) continue;
      let found = scenes.filter((s) => plain(displayName(s)) === plain(name));
      if (found.length > 1 && a.chapter) {
        const want = plain(a.chapter).replace(/^\d+\.?\s*/, '');
        const narrowed = found.filter((s) => { const c = store.get(s.parent_id); return c && (plain(chapterLabel(c, numbers)) === plain(a.chapter) || plain(displayName(c)) === want); });
        if (narrowed.length) found = narrowed;
      }
      if (!found.length) { unknown(name); continue; }
      const scene = found[0];
      if ((!e || !sceneHas(scene, e)) && !out.scenes.includes(scene)) out.scenes.push(scene);
    }
    if (out.scenes.length) out.fields.push('appears');
  }

  // Relaciones: se apuntan en la ficha que corresponda. En el archivo, «with» es el otro y
  // «relation» el rótulo; con dirección «out» esta ficha es eso para el otro (va en la ficha del
  // otro); con «both» es recíproca; en cualquier otro caso, el otro es eso para esta.
  if (extra.relations && RELATION_TYPES.includes(type)) {
    const index = new Map();
    for (const ty of RELATION_TYPES) {
      for (const x of store.list(ty)) for (const label of [displayName(x), entityLabel(x), ...splitAliases(x.data.aliases)]) if (label && !index.has(plain(label))) index.set(plain(label), x);
    }
    const existing = e ? allRelations().edges.filter((r) => r.a === e.id || r.b === e.id) : [];
    const seen = new Set();
    for (const r of extra.relations) {
      let label = clean(r && (r.relation || r.label));
      let name = clean(r && (r.with || r.other || r.name));
      if (r && r.raw && !name) {
        // «madre de Emma Lindermann»: el nombre es el final más largo que coincide con una ficha.
        const words = clean(r.raw).split(' ');
        for (let i = 1; i < words.length && !name; i++) if (index.has(plain(words.slice(i).join(' ')))) { label = words.slice(0, i).join(' '); name = words.slice(i).join(' '); }
        if (!name) { if (!words.some((w, i) => i && shared.incoming.has(plain(words.slice(i).join(' '))))) unknown(clean(r.raw)); continue; }
      }
      if (!label || !name) continue;
      // En un documento el nombre puede llevar detrás de dónde sale la relación: «Marcos (ficha)».
      const names = [name];
      for (let at = name.lastIndexOf(' ('); at > 0; at = name.lastIndexOf(' (', at - 1)) names.push(name.slice(0, at).trim());
      const other = names.map((x) => index.get(plain(x))).find(Boolean);
      if (!other || (e && other.id === e.id)) { if (!other && !names.some((x) => shared.incoming.has(plain(x)))) unknown(name); continue; }
      const dir = plain(r.direction || '');
      const both = dir === 'both';
      // true: se apunta en esta ficha (el otro es «label» para esta). Las fichas exportadas antes decían «to» por «out».
      const self = dir !== 'out' && dir !== 'to';
      const key = `${other.id}|${plain(label)}|${both ? 'b' : self ? 's' : 'o'}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Ya apuntada (en una ficha o en un mapa), con el mismo rótulo y el mismo sentido.
      const [from, to] = self ? [other.id, e ? e.id : null] : [e ? e.id : null, other.id];
      const dup = existing.some((x) => plain(x.label) === plain(label) && (both || x.both
        ? [x.a, x.b].includes(other.id) : x.a === from && x.b === to));
      if (dup) continue;
      // La misma relación, contada desde la ficha del otro en el mismo archivo, se apunta una vez.
      if (e) {
        const pair = both ? `${[e.id, other.id].sort().join('|')}|b|${plain(label)}` : `${from}|${to}|${plain(label)}`;
        if (shared.relations.has(pair)) continue;
        shared.relations.add(pair);
      }
      out.relations.push({ other, label, both, self });
    }
    if (out.relations.length) out.fields.push('relations');
  }

  // Imágenes (solo las trae el JSON de una ficha): las que la ficha no tiene ya. Se reconocen
  // por su contenido: cada archivo se llama creabel_<md5>.<ext> (y, en copias antiguas, por el
  // nombre con que se subió).
  if (extra.images && cfg.images) {
    const have = new Set(e ? store.imagesOf(e.id).map((img) => plain(img.name)) : []);
    for (const img of extra.images) {
      if (!img || typeof img.data !== 'string' || !img.data.startsWith('data:')) continue;
      const byContent = plain(contentName(img.data, img.mime));
      if (have.has(plain(img.name)) || (byContent && have.has(byContent))) continue;
      have.add(plain(img.name));
      if (byContent) have.add(byContent);
      out.images.push({ name: String(img.name || 'imagen'), mime: String(img.mime || ''), main: !!img.main, data: img.data });
    }
    if (out.images.length) out.fields.push('images');
  }
  return out;
}

/** Aplica a la ficha `e` (ya creada o actualizada) lo calculado por planExtras. */
async function applyExtras(e, ex) {
  if (ex.traits.length) await store.patchData(e.id, { traitsManual: [...(Array.isArray(e.data.traitsManual) ? e.data.traitsManual : []), ...ex.traits] });
  if (ex.sections) await store.patchData(e.id, { sections: ex.sections, kind: 'main' });
  if (ex.answers.length) {
    // Una pregunta que el proyecto no tiene todavía se crea (son comunes a todas las fichas del tipo).
    const all = { ...(store.project.data.customQuestions || {}) };
    const questions = [...(all[e.type] || [])];
    const answers = { ...(e.data.answers || {}) };
    for (const a of ex.answers) {
      let q = questions.find((x) => plain(x.text) === plain(a.question));
      if (!q) { q = { id: uid(), text: a.question }; questions.push(q); }
      answers[q.id] = a.answer;
    }
    if (questions.length !== (all[e.type] || []).length) await store.patchProjectData({ customQuestions: { ...all, [e.type]: questions } });
    await store.patchData(e.id, { answers });
  }
  for (const ev of ex.events) {
    const event = ev.existing || ev.slot.entity;
    if (!event) ev.slot.entity = await store.create('event', { name: ev.slot.title, data: { time: ev.slot.time, description: ev.slot.description, targets: [e.id] } });
    else if (!validIds(event.data.targets).includes(e.id)) await store.patchData(event.id, { targets: [...validIds(event.data.targets), e.id] });
  }
  const field = SCENE_FIELD[e.type];
  for (const scene of ex.scenes) {
    if (e.type === 'location') {
      const ids = [...sceneLocationIds(scene), e.id];
      await store.patchData(scene.id, { locations: ids, locationId: ids[0] });
    } else await store.patchData(scene.id, { [field]: [...validIds(scene.data[field]), e.id] });
  }
  for (const r of ex.relations) {
    const [owner, target] = r.self ? [e, r.other] : [r.other, e];
    const list = (Array.isArray(owner.data.relations) ? owner.data.relations : []).filter((x) => x && store.get(x.to));
    await store.patchData(owner.id, { relations: [...list, { id: uid(), to: target.id, label: r.label, ...(r.both ? { both: true } : {}) }] });
  }
  for (const img of ex.images) {
    const blob = await (await fetch(img.data)).blob();
    const saved = await store.uploadImage(e.id, new File([blob], img.name, { type: img.mime || blob.type }));
    if (img.main && saved && saved.id) await store.patchData(e.id, { profileImage: saved.id });
  }
}

/**
 * Compara las filas con los elementos del proyecto. Devuelve
 * { total, create: [{ name, fresh, fields, extra }], update: [{ e, patch, fields, extra }], same, invalid, unknown: [nombres] }.
 */
export function planElementsImport(type, rows, ct, { target = null, bound = null } = {}) {
  // `bound` (fila -> elemento) fija a qué elemento corresponde cada fila: lo usa la segunda
  // pasada de applyElementsImport, cuando los elementos nuevos ya están creados.
  const plan = { total: rows.length, create: [], update: [], same: 0, invalid: 0, unknown: [], skipped: 0, rows, ct, target, bound: new Map() };
  // Lo que el propio archivo va a crear no es «desconocido»: se enlaza en la segunda pasada.
  const incoming = new Set(rows.map((r) => plain(clean(r.values.name))).filter(Boolean));
  const mine = store.list(type).filter((e) => type !== 'custom' || e.data.kind === (ct && ct.id));
  const byCode = new Map(mine.filter((e) => entityCode(e)).map((e) => [plain(entityCode(e)), e]));
  const byName = new Map(mine.map((e) => [plain(e.name), e]));
  const nameIndex = (types) => new Map(types.flatMap((ty) => store.list(ty).map((e) => [plain(displayName(e)), e])));
  const characters = nameIndex(['character']);
  const places = nameIndex(['location']);
  const linkable = nameIndex(LINK_TYPES);
  // Una nota también se enlaza con capítulos y escenas, que se exportan con su nombre completo.
  for (const e of [...store.list('chapter'), ...store.list('scene')]) linkable.set(plain(linkName(e)), e);
  const unknown = (name) => { if (!incoming.has(plain(name)) && !plan.unknown.some((x) => plain(x) === plain(name))) plan.unknown.push(name); };
  const resolve = (text, index) => {
    const ids = [];
    let missing = false;
    for (const name of String(text || '').split(',').map(clean).filter(Boolean)) {
      const e = index.get(plain(name));
      if (e) { if (!ids.includes(e.id)) ids.push(e.id); } else { unknown(name); missing = true; }
    }
    return { ids, missing };
  };
  /** «Trama principal», «main»… -> el valor que se guarda (o undefined si no se reconoce). */
  const choiceOf = (text, values, prefixes) => {
    if (!clean(text)) return '';
    const is = (v) => [v, ...prefixes.flatMap((p) => [es[p + v], en[p + v]])].some((l) => l && plain(l) === plain(text));
    return is('none') ? '' : values.find(is);
  };
  const order = detectOrder(rows.flatMap((r) => [r.values.birth, r.values.death]).filter(Boolean));
  const dateOf = (text) => {
    if (!clean(text)) return null;
    // «2015-03-02», también con hora detrás («2015-03-02T00:00:00.000Z»): cuenta el día.
    const iso = /^(\d{1,6}-\d{2}-\d{2})(?:[T ].*)?$/.exec(clean(text));
    if (iso) return iso[1];
    const parsed = parseDate(text, order);
    return parsed ? parsed.date : undefined; // undefined: no se entiende, no se toca
  };
  const used = new Set();
  const shared = { events: new Map(), relations: new Set(), incoming };

  for (const row of rows) {
    const v = row.values;
    // Los apartados que vengan como texto (de una tabla o de un documento) pasan a ser listas.
    const extraIn = row.extra = extraFromValues(v, row.extra || {});
    // Con `target` todo se aplica a esa ficha, se llame como se llame en el archivo.
    let name = clean(v.name) || (target ? target.name || '' : '');
    if (!name) { plan.invalid++; continue; }
    // En una tabla, el texto de un personaje principal trae sus secciones con «## Título».
    if (type === 'character' && typeof v.description === 'string' && /^##\s+\S/m.test(v.description) && !(extraIn.sections && extraIn.sections.length)) {
      const [parsed] = rowsFromOutline([{ h: 1, text: name }, { h: 2, text: es['common.description'] }, ...listTextOutline(v.description).map((x) => (x.h === 1 ? { h: 0, text: '# ' + x.text } : x))], [], type);
      if (parsed.extra.sections) {
        extraIn.sections = parsed.extra.sections;
        if (parsed.values.description) v.description = parsed.values.description; else delete v.description;
      }
    }
    let e = target || (bound ? bound.get(row) : (v.code && byCode.get(plain(v.code))) || byName.get(plain(name))) || null;
    if (e && used.has(e.id)) e = null; // dos filas no pueden ser el mismo elemento
    if (e) { used.add(e.id); plan.bound.set(row, e); }
    // La ficha completa lleva de título el nombre con su detalle («Sala, Nave, País»): no es un nombre nuevo.
    if (target && [displayName(target), entityLabel(target)].some((label) => plain(label) === plain(name))) name = target.name || '';
    const d = e ? e.data : {};
    const patch = {};
    const data = {};
    const fields = [];
    const set = (key, value, where = data) => { where[key] = value; fields.push(key); };
    if (e && name !== (e.name || '')) { patch.name = name; fields.push('name'); }

    for (const key of Object.keys(v)) {
      const text = v[key];
      switch (key) {
        case 'code': case 'name': break;
        case 'kind': {
          const kind = SECONDARY_LABELS.has(plain(text)) ? 'secondary' : clean(text) ? 'main' : null;
          if (kind && kind !== (e ? d.kind || 'main' : null)) set('kind', kind);
          break;
        }
        case 'level': {
          const value = choiceOf(text, STRAND_LEVELS, ['strand.level.', 'arch.level.']);
          if (value !== undefined && value !== (d.level || '')) set('level', value);
          break;
        }
        case 'strandKind': {
          // En una trama, su tipo se guarda en data.kind.
          const value = choiceOf(text, STRAND_KINDS, ['strand.kind.', 'strand.kindShort.']);
          if (value !== undefined && value !== (d.kind || '')) set('kind', value);
          break;
        }
        case 'parent': {
          if (!clean(text)) { if (e && d.parentId) set('parentId', null); break; }
          const parent = places.get(plain(text));
          if (!parent) { unknown(clean(text)); break; }
          // Un lugar no puede quedar dentro de sí mismo ni de algo que él contiene.
          if (e && (parent === e || locationDescendants(e).includes(parent))) break;
          if (parent.id !== (d.parentId || null)) set('parentId', parent.id);
          break;
        }
        case 'members': {
          const { ids, missing } = resolve(text, characters);
          if (!missing && ids.join() !== validIds(d.members).join()) set('members', ids);
          break;
        }
        case 'links': {
          const { ids, missing } = resolve(text, linkable);
          // Si falta alguno de los enlazados, los enlaces se dejan como están.
          if (!missing && (!e || ids.join() !== noteLinks(e).join())) { if (ids.length || e) set('links', ids); }
          break;
        }
        case 'tags': {
          const tags = [];
          for (const tag of String(text || '').split(',').map(clean).filter(Boolean)) if (!tags.some((x) => x.toLowerCase() === tag.toLowerCase())) tags.push(tag);
          if (tags.join('|').toLowerCase() !== (e ? noteTags(e) : []).join('|').toLowerCase()) { set('tags', tags); data.group = ''; }
          break;
        }
        case 'color': {
          const value = clean(text).toLowerCase();
          const hex = /^#[0-9a-f]{6}$/.test(value) ? value : (NOTE_COLORS.find(([k]) => [es['note.color.' + k], en['note.color.' + k]].some((l) => plain(l) === plain(text))) || [])[1];
          if (hex !== undefined ? hex !== (d.color || '') : !value && d.color) set('color', hex || '');
          break;
        }
        case 'birth': case 'death': {
          const value = dateOf(text);
          if (value !== undefined && (value || null) !== (d[key] || null)) set(key, value);
          break;
        }
        case 'status': {
          const n = statusOf(text);
          if (n !== undefined && n !== (e ? e.status || 0 : 0)) { patch.status = n; fields.push('status'); }
          break;
        }
        case 'description': {
          // Un personaje principal se escribe por secciones: su descripción no se sustituye desde un archivo.
          if (e && e.type === 'character' && e.data.kind !== 'secondary') break;
          const html = row.html !== undefined ? sanitizeHtml(row.html) : textToHtml(String(text || '').trim());
          if (!sameText(htmlToText(html), htmlToText(e ? e.body || '' : ''))) { patch.body = clean(text) || row.html ? html : ''; fields.push('description'); }
          break;
        }
        default:
          if (key.startsWith('f:')) {
            const id = key.slice(2);
            if (!sameText(text, (d.values || {})[id] || '')) { data.values = { ...(d.values || {}), ...(data.values || {}), [id]: clean(text) }; fields.push(key); }
          } else if (!sameText(text, d[key] == null ? '' : d[key])) set(key, clean(text));
      }
    }

    const extra = planExtras(e, extraIn, type, unknown, shared);
    fields.push(...extra.fields);

    if (!e) {
      // Un personaje nuevo: principal si lo dice el archivo o trae secciones; si solo trae una
      // descripción, secundario (para que se vea). Un principal guarda su descripción en la primera sección.
      const main = type === 'character' && (data.kind ? data.kind === 'main' : !!extra.sections || !patch.body);
      const fresh = { name, status: patch.status || 0, body: main ? '' : patch.body || '', data: { ...(type === 'custom' ? { kind: ct.id, values: {} } : {}), ...data } };
      if (type === 'character') fresh.data.kind = main ? 'main' : 'secondary';
      if (main && patch.body && !extra.sections) fresh.data.sections = { personal: { mode: 'free', free: patch.body } };
      plan.create.push({ name, fresh, fields: extra.fields, extra, row });
    } else if (fields.length) {
      // `data` son solo las claves que cambian: se mezclan al aplicar, con los datos de ese momento.
      plan.update.push({ e, name, fields, extra, patch, data });
    } else plan.same++;
  }
  return plan;
}

export async function applyElementsImport(type, plan) {
  let done = 0;
  for (const item of plan.create) {
    const created = await store.create(type, item.fresh);
    if (item.row) plan.bound.set(item.row, created);
    if (item.extra) await applyExtras(created, item.extra);
    done++;
  }
  const change = async (item) => {
    const patch = { ...item.patch, ...(Object.keys(item.data || {}).length ? { data: { ...item.e.data, ...item.data } } : {}) };
    if (Object.keys(patch).length) await store.update(item.e.id, patch);
    if (item.extra) await applyExtras(item.e, item.extra);
  };
  for (const item of plan.update) { await change(item); done++; }
  // Segunda pasada: lo que apuntaba a elementos que venían en el mismo archivo y aún no
  // existían (un lugar dentro de otro, relaciones entre los personajes importados…).
  if (plan.create.length && plan.rows) {
    const again = planElementsImport(type, plan.rows, plan.ct, { target: plan.target, bound: plan.bound });
    for (const item of again.update) await change(item);
  }
  return done;
}

// ---------- Diálogo ----------

const PREVIEW = 8;
const brief = (names, max = 6) => names.slice(0, max).join(', ') + (names.length > max ? '…' : '');

/**
 * Lee el archivo, enseña lo que cambiaría y, si se acepta, lo importa. Devuelve true si ha
 * cambiado algo. Con `target` (una ficha) lo leído se aplica solo a ella: si el archivo trae
 * varios elementos se toma el suyo (por identificador o por nombre).
 */
export async function importElements(file, type, ct, { target = null } = {}) {
  let plan;
  try {
    let rows = await readElementsFile(file, type, ct, !!target);
    if (target && rows.length > 1) {
      const mine = rows.find((r) => r.values.code && plain(r.values.code) === plain(entityCode(target)))
        || rows.find((r) => plain(r.values.name) === plain(target.name));
      if (!mine) { toast(t('io.importNotThis', { name: displayName(target) }), 'error', 8000); return false; }
      rows = [mine];
    }
    plan = planElementsImport(type, rows, ct, { target });
  } catch (err) {
    console.error(err);
    toast(t('io.importBad', { name: file.name }), 'error', 8000);
    return false;
  }
  if (!plan.total) { toast(t('io.importEmpty'), 'info', 5000); return false; }
  const cols = columnsFor(type, ct);
  // Rótulos de lo que cambia: las columnas y los apartados de la ficha.
  const EXTRA_LABELS = { sections: 'io.sections', images: 'images.title', kind: type === 'strand' ? 'strand.kind' : 'io.col.kind', parentId: 'location.inside' };
  const labelOf = (key) => (cols.find((c) => c.key === key) || {}).label || (EXTRA_LABELS[key] ? t(EXTRA_LABELS[key]) : key);
  // Cuánto de cada apartado: «Eventos (11)», «Aparece en (18)».
  const extraCount = (x, key) => (x.extra ? { traits: x.extra.traits.length, answers: x.extra.answers.length, events: x.extra.events.length, appears: x.extra.scenes.length, relations: x.extra.relations.length, images: x.extra.images.length }[key] : 0);
  const changes = (x) => [...new Set(x.fields)].map((key) => labelOf(key) + (extraCount(x, key) ? ` (${extraCount(x, key)})` : '')).join(', ');

  return new Promise((resolve) => {
    let changed = false;
    const pending = plan.create.length + plan.update.length;
    const entries = [
      ...plan.create.map((x) => h('li', h('span.import-tag.is-new', t('timeline.importTag.new')), h('span.import-what', h('strong', x.name), x.fields.length ? h('span.muted', changes(x)) : null))),
      ...plan.update.map((x) => h('li', h('span.import-tag', t('timeline.importTag.changed')),
        h('span.import-what', h('strong', x.name), h('span.muted', changes(x))))),
    ];
    const body = h('div.import-plan', [
      h('p.modal-text', tn('io.importIntro', plan.total, { name: file.name })),
      h('ul.import-summary', [
        plan.create.length ? h('li', tn('io.importNew', plan.create.length)) : null,
        plan.update.length ? h('li', tn('io.importChanged', plan.update.length)) : null,
        plan.same ? h('li.muted', tn('io.importSame', plan.same)) : null,
        plan.unknown.length ? h('li.muted', t('io.importUnknown', { list: brief(plan.unknown) })) : null,
        plan.invalid ? h('li.muted', tn('io.importInvalid', plan.invalid)) : null,
      ].filter(Boolean)),
      entries.length ? h('ul.import-preview', entries.slice(0, PREVIEW),
        entries.length > PREVIEW ? h('li.muted', tn('timeline.importMore', entries.length - PREVIEW)) : null) : null,
      pending ? h('p.muted.small', t('io.importNote')) : h('p.modal-text', t('io.importNothing')),
    ].filter(Boolean));
    const run = async () => {
      go.disabled = true;
      changed = true;
      try {
        toast(tn('timeline.importDone', await applyElementsImport(type, plan)), 'success');
      } catch (err) {
        console.error(err);
        toast(errorText(err), 'error', 6000);
      }
      m.close();
    };
    const go = btn(t('timeline.importRun'), { kind: 'primary', icon: 'upload', onClick: run });
    const m = modal({
      title: t('io.importTitle'), body,
      actions: pending ? [btn(t('common.cancel'), { onClick: () => m.close() }), go] : [btn(t('common.close'), { kind: 'primary', onClick: () => m.close() })],
      onClose: () => resolve(changed),
    });
  });
}
