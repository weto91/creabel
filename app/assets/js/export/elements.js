// Exportación de los elementos de un tipo (personajes, lugares, objetos, grupos, fichas propias,
// notas, diccionario y tramas) a JSON, texto, Word, CSV o Excel. Lo que se define aquí —las
// columnas, la forma del JSON y la de los documentos— es también lo que entiende la importación
// (import/elements.js): todo lo exportado se puede retocar fuera y volver a traer.
//
// Una ficha se exporta entera, en cualquier formato:
//  - sus datos (nombre, papel, alias, fechas, país, color, campos propios, etiquetas…);
//  - su texto (la descripción o, en un personaje principal, sus secciones);
//  - y sus apartados: rasgos, preguntas propias, eventos, escenas en las que aparece y relaciones.
// En una tabla (CSV, Excel) cada apartado es una columna con una línea por dato; en texto y
// Word, un bloque con su título; en JSON, una lista.
import { t } from '../i18n.js';
import { store } from '../store.js';
import { htmlToText, formatDate, formatDateTime, downloadBlob, slugify } from '../text.js';
import { formDialog, toast, errorText } from '../ui.js';
import {
  ENTITY_TYPES, CHARACTER_SECTIONS, RELATION_TYPES, STRAND_LEVELS, STRAND_KINDS, displayName, entityCode, entityLabel, locationParent, validIds,
  visibleTraits, questionsFor, eventsOf, eventTime, scenesReferencing, chapterLabel, chapterNumbers, relationsOf, customType, strandLevel, strandKind,
} from '../model.js';
import { noteLinks, noteTags, linkName } from '../notes.js';
import { splitAliases } from '../mentions.js';
import { toDocx } from './formats.js';
import { tableBlob } from './table.js';

/** Tipos de elemento que se pueden exportar e importar así. */
export const IO_TYPES = ['character', 'location', 'object', 'group', 'custom', 'note', 'term', 'strand'];
const NO_STATUS = new Set(['note', 'group', 'term']);
const isMain = (e) => e.type === 'character' && e.data.kind !== 'secondary';
const hasText = (html) => !!htmlToText(html || '');
const bodyKey = (type) => (type === 'note' ? 'note.text' : type === 'term' ? 'term.definition' : 'common.description');
const ARROWS = { out: '→', in: '←', both: '↔' };

/**
 * Columnas de un tipo: [{ key, label, i18n, block }]. `i18n` es la clave de traducción del
 * rótulo (la importación la usa para reconocer la columna en cualquiera de los dos idiomas);
 * los campos de una ficha propia no la tienen, porque su rótulo lo ha escrito el usuario.
 * `block` marca los apartados de varias líneas (rasgos, preguntas, eventos, apariciones,
 * relaciones): en un documento van como bloque con título, no como «Rótulo: valor».
 */
export function columnsFor(type, ct) {
  const cfg = ENTITY_TYPES[type] || {};
  const cols = [];
  const add = (key, i18n, block = false) => cols.push({ key, i18n, label: t(i18n), block });
  add('code', 'io.col.code');
  add('name', 'common.name');
  if (type === 'character') add('kind', 'io.col.kind');
  if (type === 'character' || type === 'object') add('role', 'role.label');
  if (type === 'location') { add('parent', 'location.inside'); add('nation', 'location.nation'); add('state', 'location.state'); add('city', 'location.city'); }
  if (type === 'group') { add('color', 'group.color'); add('members', 'group.members'); }
  if (type === 'strand') { add('level', 'strand.level'); add('strandKind', 'strand.kind'); }
  if (type === 'custom') for (const f of (ct && ct.fields) || []) cols.push({ key: 'f:' + f.id, label: f.label, block: false });
  if (type === 'note') { add('tags', 'note.tags'); add('color', 'note.color'); add('links', 'note.links'); }
  if (cfg.aliases) add('aliases', 'aliases.label');
  if (type === 'character') { add('birth', 'family.birth'); add('death', 'family.death'); }
  if (!NO_STATUS.has(type)) add('status', 'status.label');
  add('description', bodyKey(type));
  // Los apartados.
  if (type === 'character') add('traits', 'traits.title', true);
  if (cfg.questions) add('answers', 'questions.title', true);
  if (cfg.events) add('events', 'events.title', true);
  if (cfg.sceneField) add('appears', 'appears.title', true);
  if (RELATION_TYPES.includes(type)) add('relations', 'rel.title', true);
  return cols;
}

// ---------- Los datos de una ficha, estructurados ----------

/** Secciones de un personaje principal: [{ key, title, status, answers | text + html }]. */
function sectionsOf(e) {
  const out = [];
  for (const def of CHARACTER_SECTIONS) {
    const sec = (e.data.sections || {})[def.key] || {};
    const section = { key: def.key, title: t('section.' + def.key), status: sec.status || 0 };
    if (def.interview && sec.mode !== 'free') {
      section.answers = questionsFor(def.key).filter((q) => hasText((sec.answers || {})[q.k]))
        .map((q) => ({ question: q.text, answer: htmlToText(sec.answers[q.k]), answer_html: sec.answers[q.k] }));
    } else {
      section.text = htmlToText(sec.free || '');
      section.html = sec.free || '';
    }
    out.push(section);
  }
  return out;
}

/** Respuestas a las preguntas propias del tipo (las de los lugares): [{ question, answer }]. */
function answersOf(e) {
  const questions = (store.project.data.customQuestions || {})[e.type] || [];
  return questions.map((q) => ({ question: q.text, answer: String((e.data.answers || {})[q.id] || '').trim() })).filter((x) => x.answer);
}

function appearancesOf(e) {
  if (!(ENTITY_TYPES[e.type] || {}).sceneField) return [];
  const numbers = chapterNumbers();
  return scenesReferencing(e).map((s) => {
    const chapter = store.get(s.parent_id);
    return { chapter: chapter ? chapterLabel(chapter, numbers) : '', scene: displayName(s) };
  });
}

/**
 * Todo lo que tiene una ficha, como datos: es lo que va al JSON (de una ficha o de una lista) y
 * de donde salen los demás formatos. Las imágenes las añade quien exporta una sola ficha.
 */
export function elementData(e) {
  const cfg = ENTITY_TYPES[e.type] || {};
  const d = e.data || {};
  const out = { code: entityCode(e), type: e.type, name: e.name || '', label: entityLabel(e) };
  if (e.type === 'character') out.kind = isMain(e) ? 'main' : 'secondary';
  if (cfg.role) out.role = d.role || '';
  if (cfg.aliases) out.aliases = splitAliases(d.aliases);
  if (!NO_STATUS.has(e.type)) out.status = { value: e.status || 0, label: t('status.' + (e.status || 0)) };
  for (const f of cfg.fields || []) out[f] = d[f] || '';
  if (e.type === 'location') out.parent = locationParent(e) ? displayName(locationParent(e)) : '';
  if (e.type === 'character') { out.birth = d.birth || ''; out.death = d.death || ''; }
  if (cfg.color || e.type === 'note') out.color = d.color || '';
  if (cfg.members) out.members = validIds(d.members).map((id) => displayName(store.get(id)));
  if (e.type === 'strand') { out.level = strandLevel(e); out.strand_kind = strandKind(e); }
  if (e.type === 'custom' && customType(e)) {
    out.custom_type = customType(e).name;
    out.fields = {};
    for (const f of customType(e).fields || []) out.fields[f.label] = (d.values || {})[f.id] || '';
  }
  if (e.type === 'note') { out.tags = noteTags(e); out.links = noteLinks(e).map((id) => linkName(store.get(id))); }
  if (e.type === 'character') out.traits = visibleTraits(e);
  if (isMain(e)) out.sections = sectionsOf(e);
  else out.description = { text: htmlToText(e.body), html: e.body || '' };
  if (cfg.questions) out.questions = answersOf(e);
  if (cfg.events) out.events = eventsOf(e.id).map((ev) => ({ time: eventTime(ev), title: displayName(ev), description: ev.data.description || '' }));
  if (cfg.sceneField) out.appears_in = appearancesOf(e);
  if (RELATION_TYPES.includes(e.type)) out.relations = relationsOf(e.id).map((r) => ({ direction: r.dir, relation: r.label, with: r.other, source: r.map }));
  return out;
}

// ---------- Como texto ----------

const day = (value) => (value ? formatDate(value, { year: 'numeric', month: 'numeric', day: 'numeric' }) : '');
const oneLine = (text) => String(text || '').replace(/\s*\n\s*/g, ' ').trim();

/**
 * Líneas de un apartado, una por dato. `long`: fechas escritas («13 de mayo de 2059, 6:00»)
 * en lugar de la forma neutra («2059-05-13 06:00»); la importación entiende las dos.
 */
function blockLines(data, key, long = false) {
  switch (key) {
    // Separados por comas; por «;» si algún rasgo lleva ya una coma («alta, para su edad»).
    case 'traits': return (data.traits || []).length ? [data.traits.join(data.traits.some((x) => /(?<!\d),|,(?!\d)/.test(x)) ? '; ' : ', ')] : [];
    case 'answers': return (data.questions || []).map((x) => `${x.question} :: ${oneLine(x.answer)}`);
    // Un evento sin fecha empieza por la raya.
    case 'events': return (data.events || []).map((ev) => `${ev.time ? (long ? formatDateTime(ev.time) : ev.time.replace('T', ' ')) + ' ' : ''}— ${ev.title}${ev.description ? ': ' + oneLine(ev.description) : ''}`);
    case 'appears': return (data.appears_in || []).map((a) => `${a.chapter ? a.chapter + ' › ' : ''}${a.scene}`);
    case 'relations': return (data.relations || []).map((r) => `${ARROWS[r.direction] || '←'} ${r.relation || t('mindmap.noLabel')}: ${r.with}${long && r.source ? `  (${r.source})` : ''}`);
    default: return [];
  }
}

/** Título de una sección de personaje, con su estado si no es el inicial: «Aspecto físico · Terminado». */
const sectionHead = (s) => s.title + (s.status ? ` · ${t('status.' + s.status)}` : '');
const sectionFilled = (s) => (s.answers ? s.answers.length : s.text) || s.status;

/** Texto de la descripción: el de la ficha o, en un personaje principal, el de todas sus secciones. */
function descriptionText(e, data) {
  if (!isMain(e)) return htmlToText(e.body || '');
  // Cada sección con su título («## Aspecto físico»), como en el archivo de texto: así una
  // tabla también devuelve cada cosa a su sección al importarla.
  return data.sections.filter(sectionFilled).flatMap((s) => [`## ${sectionHead(s)}`, ...(s.answers ? s.answers.flatMap((a) => [a.question, a.answer]) : [s.text])]).filter(Boolean).join('\n');
}

/** Valor (texto) de una columna para un elemento. `data` es elementData(e), si ya se tiene. */
export function valueOf(e, key, data = elementData(e)) {
  const d = e.data || {};
  switch (key) {
    case 'code': return entityCode(e);
    case 'name': return e.name || '';
    case 'kind': return t(isMain(e) ? 'character.main' : 'character.secondary');
    case 'parent': return data.parent || '';
    case 'members': return (data.members || []).join(', ');
    case 'links': return (data.links || []).join(', ');
    case 'tags': return (data.tags || []).join(', ');
    case 'level': return data.level ? t('strand.level.' + data.level) : '';
    case 'strandKind': return data.strand_kind ? t('strand.kind.' + data.strand_kind) : '';
    case 'birth': case 'death': return day(d[key]);
    case 'status': return t('status.' + (e.status || 0));
    case 'description': return descriptionText(e, data);
    case 'traits': case 'answers': case 'events': case 'appears': case 'relations': return blockLines(data, key).join('\n');
    default:
      if (key.startsWith('f:')) return String((d.values || {})[key.slice(2)] || '');
      return String(d[key] == null ? '' : d[key]);
  }
}

/**
 * Una ficha como bloques de documento (para texto, Word y página web): el nombre, sus datos en
 * líneas «Rótulo: valor», su texto y, con su título, cada apartado.
 */
export function elementBlocks(e, cols, { heading = 'h2', long = true } = {}) {
  const data = elementData(e);
  const sub = heading === 'h2' ? 'h3' : 'h4';
  const blocks = [{ t: heading, text: displayName(e) }];
  for (const c of cols) {
    if (c.block || c.key === 'name' || c.key === 'description') continue;
    const v = valueOf(e, c.key, data);
    if (v) blocks.push({ t: 'p', text: `${c.label}: ${v}` });
  }
  if (isMain(e)) {
    for (const s of data.sections) {
      if (!sectionFilled(s)) continue;
      blocks.push({ t: sub, text: sectionHead(s) });
      if (s.answers) for (const a of s.answers) blocks.push({ t: 'p', text: a.question, bold: true }, { t: 'html', html: a.answer_html });
      else blocks.push({ t: 'html', html: s.html });
    }
  } else if (hasText(e.body)) blocks.push({ t: sub, text: t(bodyKey(e.type)) }, { t: 'html', html: e.body });
  for (const c of cols.filter((x) => x.block)) {
    if (c.key === 'answers') {
      if (!data.questions.length) continue;
      blocks.push({ t: sub, text: c.label });
      for (const x of data.questions) blocks.push({ t: 'p', text: x.question, bold: true }, ...x.answer.split('\n').map((l) => l.trim()).filter(Boolean).map((text) => ({ t: 'p', text })));
      continue;
    }
    const lines = blockLines(data, c.key, long);
    if (!lines.length) continue;
    blocks.push({ t: sub, text: c.label });
    for (const line of lines) blocks.push({ t: 'p', text: line });
  }
  return blocks;
}

const typeTitle = (type, ct) => (type === 'custom' && ct ? ct.name : t(type + '.plural'));

/** Construye el archivo de una lista de elementos. Devuelve un Blob. */
export function buildElementsFile(format, type, list, ct) {
  const cols = columnsFor(type, ct);
  const title = typeTitle(type, ct);
  if (format === 'csv' || format === 'xlsx') {
    const widths = cols.map((c) => (c.key === 'description' ? 70 : c.block ? 50 : c.key === 'name' ? 30 : c.key === 'code' ? 10 : 24));
    return tableBlob(format, title, cols.map((c) => c.label), list.map((e) => { const data = elementData(e); return cols.map((c) => valueOf(e, c.key, data)); }), widths);
  }
  if (format === 'json') {
    const data = { creabel: 'elementos', version: 2, type, custom_type: ct ? ct.name : undefined, project: store.project.name, exported_at: new Date().toISOString(), items: list.map((e) => elementData(e)) };
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }
  if (format === 'txt') {
    // «# Nombre», sus datos, su texto y, con «## Título», cada sección y cada apartado.
    const out = [];
    for (const e of list) {
      const data = elementData(e);
      out.push(`# ${displayName(e)}`);
      for (const c of cols) {
        if (c.block || c.key === 'name' || c.key === 'description') continue;
        const v = valueOf(e, c.key, data);
        if (v) out.push(`${c.label}: ${v}`);
      }
      if (isMain(e)) {
        for (const s of data.sections) {
          if (!sectionFilled(s)) continue;
          out.push('', `## ${sectionHead(s)}`);
          if (s.answers) for (const a of s.answers) out.push(a.question, a.answer, '');
          else out.push(s.text);
        }
      } else if (hasText(e.body)) out.push('', htmlToText(e.body));
      for (const c of cols.filter((x) => x.block)) {
        const lines = blockLines(data, c.key);
        if (lines.length) out.push('', `## ${c.label}`, ...lines);
      }
      out.push('', '');
    }
    return new Blob([String.fromCharCode(0xFEFF) + out.join('\r\n').trim() + '\r\n'], { type: 'text/plain;charset=utf-8' });
  }
  const p = store.project;
  const blocks = [{ t: 'title', text: p.name, author: p.author, subtitle: title }, { t: 'break' }];
  for (const e of list) blocks.push(...elementBlocks(e, cols, { heading: 'h2', long: false }));
  return toDocx(blocks, { title: `${p.name} — ${title}`, author: p.author, lang: p.language, font: 'serif', size: 11, indent: false });
}

/** Pregunta el formato y descarga los elementos de la lista. */
export async function exportElementsDialog(type, list, ct) {
  if (!list.length) { toast(t('io.nothing'), 'info'); return; }
  const title = typeTitle(type, ct);
  const choice = await formDialog({
    title: t('io.exportTitle', { what: title }),
    intro: t('io.exportHint', { n: list.length }),
    fields: [{
      name: 'format', label: t('export.format'), type: 'select', value: 'xlsx',
      options: ['xlsx', 'csv', 'docx', 'txt', 'json'].map((f) => ({ value: f, label: t('export.' + f) })),
    }],
    submitLabel: t('export.run'),
  });
  if (!choice) return;
  try {
    await store.flush();
    downloadBlob(buildElementsFile(choice.format, type, list, ct), `${slugify(store.project.name)}-${slugify(title)}.${choice.format}`);
    toast(t('export.done'), 'success');
  } catch (err) {
    console.error(err);
    toast(errorText(err), 'error', 6000);
  }
}

// (STRAND_LEVELS y STRAND_KINDS se usan en la importación para reconocer los rótulos.)
export { STRAND_LEVELS, STRAND_KINDS };
