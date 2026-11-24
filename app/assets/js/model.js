// Reglas del dominio: estructura de la novela, tipos de elementos y consultas derivadas.
import { store } from './store.js';
import { t, tn, tr, getLang } from './i18n.js';
import { htmlToText, formatNumber } from './text.js';
import { spanBetween } from './timespan.js';
import { traitKey } from './traits.js';

/** Preguntas de la entrevista de una sección: las de serie más las personalizadas del proyecto. */
export function questionsFor(key) {
  const builtin = (tr('questions.' + key) || []).map((text, i) => ({ k: 'q' + i, text }));
  const custom = ((store.project.data.customQuestions || {})[key] || []).map((q) => ({ k: 'c_' + q.id, text: q.text, custom: true, id: q.id }));
  return [...builtin, ...custom];
}

export const ARCH_KEYS = ['premise', 'fabula', 'setting', 'globalnotes'];

export const CHARACTER_SECTIONS = [
  { key: 'personal', interview: true },
  { key: 'physical', interview: true },
  { key: 'behavior', interview: true },
  { key: 'psychology', interview: true },
  { key: 'ideas', interview: true },
  { key: 'sociology', interview: true },
  { key: 'lifebefore', interview: false },
  { key: 'conflict', interview: false },
  { key: 'evolution', interview: false },
];

export const POV_TYPES = ['first_major', 'first_minor', 'second', 'third_limited', 'third_omniscient', 'third_objective'];
export const POV_WITH_CHARACTER = new Set(['first_major', 'first_minor', 'third_limited']);

/** Tipos gestionados por las páginas genéricas de lista y ficha. */
export const ENTITY_TYPES = {
  character: { route: 'characters', icon: 'user', images: true, events: true, sceneField: 'characters', aliases: true, role: true },
  location: { route: 'locations', icon: 'pin', fields: ['nation', 'state', 'city'], images: true, events: true, sceneField: 'locations', aliases: true, questions: true },
  object: { route: 'objects', icon: 'box', images: true, events: true, sceneField: 'objects', aliases: true, role: true },
  group: { route: 'groups', icon: 'group', color: true, members: true, images: true, events: true, sceneField: 'groups', aliases: true },
  note: { route: 'notes', icon: 'note', images: true },
  term: { route: 'dictionary', icon: 'dictionary', aliases: true, alphabetical: true },
  reference: { route: 'library', icon: 'paperclip' },
  strand: { route: 'strands', listRoute: 'architecture', icon: 'layers', sceneField: 'strands' },
  mindmap: { route: 'relationships', icon: 'share' },
  // Fichas de los tipos que define el usuario (naves, tecnologías…): todas en una página.
  custom: { route: 'custom', icon: 'grid', images: true, sceneField: 'custom' },
  // Planos con chinchetas; se listan dentro de Lugares.
  plan: { route: 'plans', listRoute: 'locations', icon: 'map' },
};

// ---------- Fichas propias ----------
// Los tipos los define el usuario y se guardan en los datos del proyecto
// (data.customTypes: [{ id, name, icon, fields: [{ id, label }] }]). Cada ficha es un elemento
// de tipo «custom» con data.kind (su tipo) y data.values ({ idDeCampo: texto }).

export const CUSTOM_ICONS = ['grid', 'box', 'key', 'globe', 'server', 'feather', 'flag', 'layers', 'map', 'target', 'lock', 'book', 'users', 'activity'];

export function customTypes() {
  const list = store.project && store.project.data ? store.project.data.customTypes : null;
  return Array.isArray(list) ? list : [];
}

/** El tipo de una ficha propia, o null si se ha borrado. */
export function customType(e) {
  return customTypes().find((ct) => ct.id === (e && e.data.kind)) || null;
}

/** Línea de detalle de una ficha propia: su tipo y el primer campo que tenga relleno. */
export function customSummary(e) {
  const ct = customType(e);
  if (!ct) return '';
  const first = (ct.fields || []).map((f) => (e.data.values || {})[f.id]).find((v) => v && String(v).trim());
  return [ct.name, first].filter(Boolean).join(' · ');
}

/** Clasificación de las tramas: cuánto pesan en la novela y de qué tipo son. Ambas son opcionales. */
export const STRAND_LEVELS = ['main', 'secondary', 'background'];
export const STRAND_KINDS = ['external', 'internal', 'relationship', 'mystery', 'theme'];
export const strandLevel = (e) => (STRAND_LEVELS.includes(e.data.level) ? e.data.level : '');
export const strandKind = (e) => (STRAND_KINDS.includes(e.data.kind) ? e.data.kind : '');
/** «Trama principal · Arco de personaje», o cadena vacía si no está clasificada. */
export function strandSummary(e) {
  return [strandLevel(e) && t('strand.level.' + strandLevel(e)), strandKind(e) && t('strand.kindShort.' + strandKind(e))].filter(Boolean).join(' · ');
}

// Cada trama tiene un color para reconocerla de un vistazo (tablero, capítulos, arquitectura):
// se reparten por su orden en la lista; doce antes de repetirse.
const STRAND_COLORS = ['#c0504d', '#4a7fb8', '#5a9a5a', '#d08a3c', '#8a67b0', '#3d9a96', '#c2a52e', '#b0608f', '#7d8a93', '#8c6d46', '#6f8f3a', '#4f6fa8'];
export function strandColor(strand) {
  const id = strand && strand.id ? strand.id : strand;
  return STRAND_COLORS[Math.max(0, store.list('strand').findIndex((s) => s.id === id)) % STRAND_COLORS.length];
}

/** Color de un lugar para sus marcas (los cuadros de las escenas de un capítulo): fijo según su puesto en la lista. */
export function locationColor(loc) {
  const id = loc && loc.id ? loc.id : loc;
  return STRAND_COLORS[Math.max(0, store.list('location').findIndex((l) => l.id === id)) % STRAND_COLORS.length];
}

/** Nombre corto de una trama, para una marca: lo que va antes de los dos puntos, o el principio. */
export function strandShort(strand) {
  const name = displayName(strand);
  const head = name.split(/\s*[:—–]\s+|:\s*/)[0].trim() || name;
  return head.length > 26 ? head.slice(0, 25).trimEnd() + '…' : head;
}

// El idioma en que está escrita la novela (corrector, voces de lectura, rasgos…). No lleva
// variantes regionales: el español es el mismo idioma en España y en Latinoamérica.
export const PROJECT_LANGUAGES = [
  ['es', 'Español'], ['en', 'English'], ['ca', 'Català'], ['gl', 'Galego'], ['eu', 'Euskara'],
  ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português'], ['nl', 'Nederlands'],
  ['pl', 'Polski'], ['cs', 'Čeština'], ['sl', 'Slovenščina'], ['sr', 'Srpski'], ['hu', 'Magyar'],
  ['tr', 'Türkçe'], ['ru', 'Русский'], ['uk', 'Українська'],
];

/** El idioma de novela que corresponde a un idioma de la interfaz (es-419 → es, pt-BR → pt…). */
export function projectLangFor(uiLang) {
  const code = String(uiLang || 'es').split('-')[0];
  return PROJECT_LANGUAGES.some(([c]) => c === code) ? code : 'es';
}

export function displayName(e) {
  return (e && e.name && e.name.trim()) || t('common.untitled');
}

export function archItem(key) {
  return store.list('architecture').find((e) => e.data.key === key) || null;
}

/** Crea las fichas de arquitectura que falten (premisa, fábula, ambientación, notas). */
export async function ensureArchitecture() {
  for (let i = 0; i < ARCH_KEYS.length; i++) {
    if (!archItem(ARCH_KEYS[i])) {
      await store.create('architecture', { name: ARCH_KEYS[i], position: i, data: { key: ARCH_KEYS[i] } });
    }
  }
}

export function chapterKind(c) {
  return c.data.kind || 'chapter';
}

/** Capítulos en orden de lectura: prólogo, partes con sus capítulos, capítulos sueltos, epílogo. */
export function chaptersOrdered() {
  const all = store.list('chapter');
  const parts = store.list('part');
  const normal = all.filter((c) => chapterKind(c) === 'chapter');
  const out = all.filter((c) => chapterKind(c) === 'prologue');
  for (const p of parts) out.push(...normal.filter((c) => c.parent_id === p.id));
  out.push(...normal.filter((c) => !c.parent_id || !store.get(c.parent_id)));
  out.push(...all.filter((c) => chapterKind(c) === 'epilogue'));
  return out;
}

/** Map idCapítulo -> número (solo capítulos normales). */
export function chapterNumbers() {
  const map = new Map();
  let n = 0;
  for (const c of chaptersOrdered()) if (chapterKind(c) === 'chapter') map.set(c.id, ++n);
  return map;
}

export function chapterLabel(c, numbers) {
  const kind = chapterKind(c);
  if (kind === 'prologue') return c.name || t('chapters.prologue');
  if (kind === 'epilogue') return c.name || t('chapters.epilogue');
  const n = (numbers || chapterNumbers()).get(c.id);
  return `${n}. ${displayName(c)}`;
}

export function scenesOf(chapterId) {
  return store.list('scene', chapterId);
}

export function allScenesOrdered() {
  return chaptersOrdered().flatMap((c) => scenesOf(c.id));
}

export function chapterWords(c) {
  return scenesOf(c.id).reduce((sum, s) => sum + (s.words || 0), 0);
}

/** Estado de un capítulo, derivado del de sus escenas. */
export function chapterStatus(c) {
  const scenes = scenesOf(c.id);
  if (!scenes.length) return 0;
  if (scenes.every((s) => s.status === 2)) return 2;
  if (scenes.every((s) => s.status === 0)) return 0;
  return 1;
}

// ---------- Lugares dentro de lugares ----------
// Un lugar puede estar dentro de otro (data.parentId): la sala, en la cubierta; la cubierta,
// en la nave. Lo que ocurre en un lugar ocurre también en los que lo contienen.

/** El lugar que contiene a este, si lo hay y sigue existiendo. */
export function locationParent(loc) {
  const parent = loc && loc.data.parentId ? store.get(loc.data.parentId) : null;
  return parent && parent.type === 'location' && parent.id !== loc.id ? parent : null;
}

/** Los lugares que contienen a este, del más cercano al más lejano. */
export function locationAncestors(loc) {
  const out = [];
  const seen = new Set([loc.id]);
  for (let cur = locationParent(loc); cur && !seen.has(cur.id); cur = locationParent(cur)) {
    out.push(cur);
    seen.add(cur.id);
  }
  return out;
}

/** Los lugares que están directamente dentro de este. */
export function locationChildren(loc) {
  return store.list('location').filter((l) => locationParent(l) === loc);
}

/** Todo lo que hay dentro de un lugar, a cualquier profundidad. */
export function locationDescendants(loc) {
  return store.list('location').filter((l) => l !== loc && locationAncestors(l).includes(loc));
}

/** Dónde está un lugar: los lugares que lo contienen y la ciudad, región y país (suyos o heredados). */
export function locationDetail(loc) {
  if (!loc) return '';
  const chain = [loc, ...locationAncestors(loc)];
  const filled = (l) => [l.data.city, l.data.state, l.data.nation].filter((x) => x && String(x).trim());
  const place = chain.map(filled).find((parts) => parts.length) || [];
  return [...chain.slice(1).map((l) => displayName(l)), ...place].join(', ');
}

export function locationLabel(loc) {
  if (!loc) return '';
  return [loc.name && loc.name.trim(), locationDetail(loc)].filter(Boolean).join(', ') || t('common.untitled');
}

export function entityLabel(e) {
  if (!e) return '';
  return e.type === 'location' ? locationLabel(e) : displayName(e);
}

// Claves de los datos de una ficha que no son texto para el usuario (valores internos).
const SEARCH_SKIP = new Set(['id', 'key', 'kind', 'mode', 'level', 'color', 'num', 'from', 'to', 'x', 'y', 'traitsHidden']);

/**
 * Todo el texto de una ficha en el que tiene sentido buscar: nombre, identificador,
 * descripción y lo que guardan sus datos (alias, rol, campos, etiquetas…). Lo que apunta a
 * otra ficha (un miembro, un enlace, el lugar que la contiene) cuenta por su nombre.
 */
export function searchText(e) {
  if (!e) return '';
  const out = [e.name || '', entityCode(e), htmlToText(e.body || '')];
  // Las relaciones de la ficha cuentan por el nombre del otro: buscar «Marcos» encuentra a su hijo.
  for (const r of sheetRelations(e)) out.push(r.other.name || '');
  const walk = (value, depth) => {
    if (value == null || depth > 5) return;
    if (typeof value === 'string') {
      if (/^#[0-9a-f]{3,8}$/i.test(value)) return;
      const other = /^[a-z0-9]{8,32}$/.test(value) ? store.get(value) : null;
      if (other) { if (other.id !== e.id) out.push(other.name || ''); return; }
      out.push(value.indexOf('<') === -1 ? value : htmlToText(value));
    } else if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
    } else if (typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) if (!SEARCH_SKIP.has(key)) walk(item, depth + 1);
    }
  };
  walk(e.data, 0);
  return out.join(' ');
}

export function entityHref(e) {
  const pid = store.project.id;
  switch (e.type) {
    case 'architecture': return `#/p/${pid}/architecture/${e.data.key}`;
    case 'chapter': return `#/p/${pid}/chapters/${e.id}`;
    case 'scene': return `#/p/${pid}/scenes/${e.id}`;
    case 'part': return `#/p/${pid}/chapters`;
    case 'task': return `#/p/${pid}/tasks`;
    case 'event': return `#/p/${pid}/timeline`;
    case 'secret': return `#/p/${pid}/continuity?tab=secrets`;
    default: {
      const cfg = ENTITY_TYPES[e.type];
      return cfg ? `#/p/${pid}/${cfg.route}/${e.id}` : `#/p/${pid}`;
    }
  }
}

/** Ids válidos (existentes) de una lista guardada en una escena. */
export function validIds(ids) {
  return (Array.isArray(ids) ? ids : []).filter((id) => store.get(id));
}

/**
 * Lugares de una escena, en el orden en que se pusieron (una escena de tránsito recorre varios).
 * Se guardan en data.locations; las escenas anteriores a eso tenían uno solo, en data.locationId,
 * que se sigue rellenando con el primero.
 */
export function sceneLocationIds(scene) {
  const d = scene.data;
  return validIds(Array.isArray(d.locations) ? d.locations : d.locationId ? [d.locationId] : []);
}

// ---------- Tiempo de lectura ----------

/** Palabras por minuto de una lectura normal: la estimación habitual. */
export const READING_WPM = 250;

/** Tiempo de lectura aproximado de un texto: «menos de 1 min», «9 min», «1 h 41 min». '' sin palabras. */
export function readingTime(words) {
  const n = Number(words) || 0;
  if (n <= 0) return '';
  const minutes = Math.round(n / READING_WPM);
  if (minutes < 1) return t('read.underMinute');
  if (minutes < 60) return t('stats.minutes', { n: formatNumber(minutes) });
  return t('stats.hoursMinutes', { h: formatNumber(Math.floor(minutes / 60)), m: minutes % 60 });
}

/** «9 min de lectura» (o '' sin palabras). */
export function readingLabel(words) {
  const time = readingTime(words);
  return time ? t('read.time', { time }) : '';
}

/**
 * Cuánto dura una escena que tiene inicio y fin: «2 horas, 30 minutos». Cadena vacía si le
 * falta alguna de las dos fechas o si el fin no es posterior al inicio.
 */
export function sceneDuration(scene) {
  const d = scene ? scene.data : null;
  const span = d && d.time && d.timeEnd ? spanBetween(d.time, d.timeEnd) : null;
  if (!span || span.back) return '';
  return span.lines[0].map(([unit, n]) => tn('unit.' + unit, n, { n: formatNumber(n) })).join(', ');
}

export function sceneLocations(scene) {
  return sceneLocationIds(scene).map((id) => store.get(id));
}

export function sceneHas(scene, entity) {
  const d = scene.data;
  switch (entity.type) {
    case 'character': return validIds(d.characters).includes(entity.id) || (d.pov && d.pov.characterId === entity.id);
    // Un lugar «tiene» también las escenas que ocurren en lo que hay dentro de él.
    case 'location': return sceneLocationIds(scene).some((id) => id === entity.id || locationAncestors(store.get(id)).includes(entity));
    case 'custom': return validIds(d.custom).includes(entity.id);
    case 'object': return validIds(d.objects).includes(entity.id);
    case 'strand': return validIds(d.strands).includes(entity.id);
    case 'group': return validIds(d.groups).includes(entity.id);
    default: return false;
  }
}

export function scenesReferencing(entity) {
  return allScenesOrdered().filter((s) => sceneHas(s, entity));
}

export function povLabel(scene) {
  const pov = scene.data.pov;
  if (!pov || !pov.type) return '';
  const who = POV_WITH_CHARACTER.has(pov.type) && store.get(pov.characterId);
  return t('pov.' + pov.type) + (who ? ` (${displayName(who)})` : '');
}

/** Estado global de un personaje principal a partir del de sus secciones. */
export function characterStatus(data) {
  const sections = data.sections || {};
  const states = CHARACTER_SECTIONS.map((s) => (sections[s.key] && sections[s.key].status) || 0);
  if (states.every((s) => s === 2)) return 2;
  if (states.every((s) => s === 0)) return 0;
  return 1;
}

/**
 * Textos de un personaje de los que se extraen rasgos. Cada respuesta de la entrevista
 * lleva su pregunta como contexto.
 */
export function characterSegments(c) {
  if (c.data.kind === 'secondary') return [{ text: htmlToText(c.body) }];
  const out = [];
  for (const def of CHARACTER_SECTIONS) {
    const sec = (c.data.sections || {})[def.key];
    if (!sec) continue;
    if (def.interview && sec.mode !== 'free') {
      for (const q of questionsFor(def.key)) {
        const html = (sec.answers || {})[q.k];
        if (html) out.push({ text: htmlToText(html), context: q.text });
      }
    } else if (sec.free) {
      out.push({ text: htmlToText(sec.free) });
    }
  }
  return out;
}

/** Rasgos visibles de un personaje: los extraídos que no se han descartado más los añadidos a mano. */
export function visibleTraits(e) {
  const d = e.data;
  const hidden = new Set(Array.isArray(d.traitsHidden) ? d.traitsHidden : []);
  const auto = (Array.isArray(d.traitsAuto) ? d.traitsAuto : []).filter((x) => !hidden.has(traitKey(x)));
  const manual = Array.isArray(d.traitsManual) ? d.traitsManual : [];
  return [...auto, ...manual.filter((m) => !auto.some((a) => traitKey(a) === traitKey(m)))];
}

/**
 * Relaciones de un elemento en todos los mapas de relaciones del proyecto:
 * [{ map, other, label, dir: 'out' | 'in' | 'both' }]
 */
export function relationsOf(entityId) {
  const out = [];
  for (const map of store.list('mindmap')) {
    const nodes = Array.isArray(map.data.nodes) ? map.data.nodes : [];
    const mine = nodes.filter((n) => n.ref === entityId).map((n) => n.id);
    if (!mine.length) continue;
    const labelOf = (n) => {
      if (!n) return null;
      if (!n.ref) return n.label || null;
      return store.get(n.ref) ? entityLabel(store.get(n.ref)) : null;
    };
    for (const e of Array.isArray(map.data.edges) ? map.data.edges : []) {
      const outgoing = mine.includes(e.from);
      if (!outgoing && !mine.includes(e.to)) continue;
      const other = labelOf(nodes.find((n) => n.id === (outgoing ? e.to : e.from)));
      if (!other) continue;
      out.push({ map: displayName(map), other, label: e.label || '', dir: e.both ? 'both' : outgoing ? 'out' : 'in' });
    }
  }
  // Las apuntadas en las fichas: las de esta («Padre: Marcos» = Marcos —padre→ este) y las de
  // otras fichas que apuntan a esta.
  const me = store.get(entityId);
  if (me && RELATION_TYPES.includes(me.type)) {
    // `label` es lo que el otro es para el dueño de la ficha; `mine`, lo que el dueño es para el otro.
    for (const r of sheetRelations(me)) {
      if (r.label) out.push({ map: t('rel.sheet'), other: entityLabel(r.other), label: r.label, dir: r.both ? 'both' : 'in' });
      if (r.mine) out.push({ map: t('rel.sheet'), other: entityLabel(r.other), label: r.mine, dir: 'out' });
    }
    for (const type of RELATION_TYPES) {
      for (const owner of store.list(type)) {
        if (owner === me) continue;
        for (const r of sheetRelations(owner)) {
          if (r.other !== me) continue;
          const map = t('rel.sheetOf', { name: displayName(owner) });
          if (r.label) out.push({ map, other: entityLabel(owner), label: r.label, dir: r.both ? 'both' : 'out' });
          if (r.mine) out.push({ map, other: entityLabel(owner), label: r.mine, dir: 'in' });
        }
      }
    }
  }
  return out;
}

/** Eventos de línea temporal de todos los elementos, más las escenas con fecha. */
export function timelineItems() {
  const items = [];
  const numbers = chapterNumbers();
  for (const scene of store.list('scene')) {
    if (!scene.data.time) continue;
    const chapter = store.get(scene.parent_id);
    items.push({
      time: scene.data.time, kind: 'scene', title: displayName(scene),
      sub: chapter ? chapterLabel(chapter, numbers) : '', href: entityHref(scene), entity: scene,
    });
  }
  // Eventos. `kind` da el color: el tipo de sus elementos si todos son del mismo, o «event»
  // (neutro) si es general o mezcla tipos. `types` sirve para filtrar y `targets` para mostrarlos.
  // `hosts` son las escenas en las que ocurre (de ellas toma la fecha) y `tellers` las que lo cuentan.
  for (const ev of store.list('event')) {
    const time = eventTime(ev);
    if (!time) continue;
    const targets = eventTargets(ev);
    // Un evento cuyos elementos están todos borrados no se muestra (vuelve si se restauran).
    if (Array.isArray(ev.data.targets) && ev.data.targets.length && !targets.length) continue;
    const types = [...new Set(targets.map((e) => e.type))];
    const single = targets.length === 1 ? targets[0] : null;
    items.push({
      time, kind: types.length === 1 ? types[0] : 'event', title: displayName(ev),
      sub: single ? entityLabel(single) : '', description: ev.data.description || '',
      href: single ? entityHref(single) : `#/p/${store.project.id}/timeline`,
      entity: single, event: ev, targets, types, general: !targets.length,
      hosts: eventHosts(ev).filter((s) => s.data.time), tellers: eventTellers(ev),
    });
  }
  return items.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
}

// ---------- Fechas y edades ----------
// En la ficha de un personaje: nacimiento y muerte (data.birth, data.death, «AAAA-MM-DD»).

/** Años cumplidos por un personaje en una fecha, o null si falta su nacimiento o la fecha. */
export function ageAt(character, time) {
  const born = /^(\d{1,6})-(\d{2})-(\d{2})/.exec((character && character.data.birth) || '');
  const at = /^(\d{1,6})-(\d{2})-(\d{2})/.exec(time || '');
  if (!born || !at) return null;
  const years = Number(at[1]) - Number(born[1]) - (`${at[2]}-${at[3]}` < `${born[2]}-${born[3]}` ? 1 : 0);
  return years >= 0 ? years : null;
}

/** Primera y última fecha del libro: las de la primera y la última escena con fecha, en orden de lectura. */
export function bookSpan() {
  const dated = allScenesOrdered().filter((s) => s.data.time);
  return dated.length ? { start: dated[0].data.time, end: dated[dated.length - 1].data.time } : null;
}

// ---------- Relaciones de todos los mapas ----------
// Los parentescos y demás vínculos entre elementos se dibujan en «Relaciones» (mapas). Aquí se
// reúnen las flechas de todos los mapas para verlas juntas y para las comprobaciones de fechas.

/** Tipos de ficha en los que se pueden apuntar relaciones (y con los que se pueden tener). */
export const RELATION_TYPES = ['character', 'location', 'object', 'group', 'custom'];

/**
 * Relaciones apuntadas en la ficha de un elemento (data.relations: [{ id, to, label, mine,
 * both }]), con el otro elemento ya resuelto: [{ id, other, label, mine, both }]. `label` dice
 * lo que el OTRO es para este («Director de vuelo») y `mine` lo que este es para el otro
 * («Comandante»). Con `both` la relación es recíproca: `label` vale para los dos
 * («Compañeros»). Las que apuntan a algo borrado no salen.
 */
export function sheetRelations(e) {
  return (Array.isArray(e.data.relations) ? e.data.relations : [])
    .map((r) => ({
      id: r && r.id, other: r && store.get(r.to), label: String((r && r.label) || '').trim(),
      mine: r && !r.both ? String(r.mine || '').trim() : '', both: !!(r && r.both),
    }))
    .filter((r) => r.other && r.other.id !== e.id && RELATION_TYPES.includes(r.other.type));
}

/**
 * Las relaciones de un elemento reunidas por el otro, estén donde estén (en su ficha, en la
 * del otro o dibujadas en un mapa): una entrada por cada elemento con el que se relaciona.
 * [{ key, other (ficha, o null si es un texto suelto de un mapa), name, mine: [lo que este es
 * para el otro], theirs: [lo que el otro es para este], both: [lo que son los dos], records:
 * [{ owner }] (fichas que la guardan), edges: [{ map, id }] (flechas de mapas) }].
 */
export function relationPairs(entity) {
  const pairs = new Map();
  const pair = (key, other, name) => {
    if (!pairs.has(key)) pairs.set(key, { key, other, name, mine: [], theirs: [], both: [], records: [], edges: [] });
    return pairs.get(key);
  };
  const push = (list, label) => {
    const text = String(label || '').trim();
    if (text && !list.some((x) => x.toLowerCase() === text.toLowerCase())) list.push(text);
  };
  for (const r of sheetRelations(entity)) {
    const p = pair(r.other.id, r.other, displayName(r.other));
    if (r.both) push(p.both, r.label); else { push(p.theirs, r.label); push(p.mine, r.mine); }
    p.records.push({ owner: entity });
  }
  for (const type of RELATION_TYPES) {
    for (const owner of store.list(type)) {
      if (owner === entity) continue;
      for (const r of sheetRelations(owner)) {
        if (r.other !== entity) continue;
        const p = pair(owner.id, owner, displayName(owner));
        if (r.both) push(p.both, r.label); else { push(p.mine, r.label); push(p.theirs, r.mine); }
        p.records.push({ owner });
      }
    }
  }
  for (const map of store.list('mindmap')) {
    const nodes = Array.isArray(map.data.nodes) ? map.data.nodes : [];
    const mine = new Set(nodes.filter((n) => n.ref === entity.id).map((n) => n.id));
    if (!mine.size) continue;
    for (const e of Array.isArray(map.data.edges) ? map.data.edges : []) {
      const outgoing = mine.has(e.from);
      if (!outgoing && !mine.has(e.to)) continue;
      const node = nodes.find((n) => n.id === (outgoing ? e.to : e.from));
      if (!node || mine.has(node.id)) continue;
      const other = node.ref ? store.get(node.ref) : null;
      const name = other ? displayName(other) : String(node.label || '').trim();
      if ((node.ref && !other) || !name) continue; // elemento borrado o nodo vacío
      const p = pair(other ? other.id : 'text:' + name.toLowerCase(), other, name);
      push(e.both ? p.both : outgoing ? p.mine : p.theirs, e.label);
      p.edges.push({ map, id: e.id });
    }
  }
  return [...pairs.values()];
}

/**
 * Todas las relaciones de todos los mapas: { nodes, edges }. Cada nodo es { key, entity | null,
 * label }; cada relación, { a, b, label, both, maps: [mapa…] } con `a` y `b` claves de nodo
 * (la flecha va de `a` a `b`). La misma relación dibujada en dos mapas sale una sola vez.
 */
export function allRelations(maps) {
  // Sin lista de mapas se reúnen todos y, además, las relaciones apuntadas en las fichas.
  const withSheets = !maps;
  const nodes = new Map();
  const edges = new Map();
  for (const map of maps || store.list('mindmap')) {
    const byId = new Map();
    for (const n of Array.isArray(map.data.nodes) ? map.data.nodes : []) {
      const entity = n.ref ? store.get(n.ref) : null;
      if (n.ref && !entity) continue; // elemento borrado
      const label = entity ? displayName(entity) : String(n.label || '').trim();
      if (!label) continue;
      const key = entity ? entity.id : 'text:' + label.toLowerCase();
      if (!nodes.has(key)) nodes.set(key, { key, entity, label });
      byId.set(n.id, key);
    }
    for (const e of Array.isArray(map.data.edges) ? map.data.edges : []) {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b || a === b) continue;
      const label = String(e.label || '').trim();
      // Una relación recíproca es la misma en los dos sentidos.
      const [x, y] = e.both && a > b ? [b, a] : [a, b];
      const id = `${x}|${y}|${label.toLowerCase()}|${e.both ? 1 : 0}`;
      if (!edges.has(id)) edges.set(id, { a: x, b: y, label, both: !!e.both, maps: [], sheets: [] });
      if (!edges.get(id).maps.includes(map)) edges.get(id).maps.push(map);
    }
  }
  // Las de las fichas. En la ficha de Álex, «Padre: Marcos» dice lo que Marcos es para Álex:
  // es la misma flecha que «Marcos —padre→ Álex» en un mapa. `sheets` guarda en qué ficha está.
  if (withSheets) {
    for (const type of RELATION_TYPES) {
      for (const owner of store.list(type)) {
        for (const r of sheetRelations(owner)) {
          for (const e of [r.other, owner]) if (!nodes.has(e.id)) nodes.set(e.id, { key: e.id, entity: e, label: displayName(e) });
          // Una relación recíproca («Amigos», «Compañeros») es la misma en los dos sentidos.
          const add = (x, y, label, both) => {
            const id = `${x}|${y}|${label.toLowerCase()}|${both ? 1 : 0}`;
            if (!edges.has(id)) edges.set(id, { a: x, b: y, label, both, maps: [], sheets: [] });
            if (!edges.get(id).sheets.includes(owner)) edges.get(id).sheets.push(owner);
          };
          if (r.both) add(...(r.other.id > owner.id ? [owner.id, r.other.id] : [r.other.id, owner.id]), r.label, true);
          else if (r.label) add(r.other.id, owner.id, r.label, false);
          // Lo que el dueño de la ficha es para el otro: la flecha contraria.
          if (r.mine) add(owner.id, r.other.id, r.mine, false);
        }
      }
    }
  }
  const used = new Set([...edges.values()].flatMap((e) => [e.a, e.b]));
  return { nodes: [...nodes.values()].filter((n) => used.has(n.key)), edges: [...edges.values()] };
}

// Palabras con las que una flecha dice «es padre o madre de» o «es hijo o hija de», por idioma
// (sin tildes ni mayúsculas, como se comparan). Se usan las del español, las del inglés y las
// del idioma de la novela y de la interfaz: juntas todas, alguna chocaría con otra lengua
// («sin» es «hijo» en esloveno y «sin» en español).
const KIN_WORDS = {
  es: ['padre madre progenitor progenitora papa mama', 'hijo hija'],
  en: ['father mother dad mum mom parent', 'son daughter child'],
  pt: ['pai mae', 'filho filha'],
  gl: ['pai nai', 'fillo filla'],
  ca: ['pare mare', 'fill filla'],
  it: ['padre madre papa mamma genitore', 'figlio figlia'],
  fr: ['pere mere papa maman parent', 'fils fille enfant'],
  de: ['vater mutter papa mama elternteil', 'sohn tochter kind'],
  nl: ['vader moeder papa mama ouder', 'zoon dochter kind'],
  pl: ['ojciec matka tata mama rodzic', 'syn corka dziecko'],
  cs: ['otec matka tata mama rodic', 'syn dcera dite'],
  sl: ['oce mati ati mama stars', 'sin hci otrok'],
  sr: ['otac majka tata mama roditelj отац мајка', 'sin cerka kci dete син ћерка кћи'],
  hu: ['apa anya apuka anyuka szulo', 'fia fiu lanya lany gyerek gyermek'],
  tr: ['baba anne ebeveyn', 'ogul oglu kız kızı cocuk'],
  ru: ['отец мать папа мама родитель', 'сын дочь ребенок'],
  uk: ['батько мати тато мама', 'син донька дочка дитина'],
};
const kinCache = new Map();
/** { parent, child }: las palabras de parentesco de los idiomas que tocan. */
function kinWords() {
  const codes = [...new Set(['es', 'en', store.project && store.project.language, getLang()]
    .map((c) => String(c || '').toLowerCase().split('-')[0]).filter((c) => KIN_WORDS[c]))];
  const key = codes.join('|');
  if (!kinCache.has(key)) {
    const set = (i) => new Set(codes.flatMap((c) => KIN_WORDS[c][i].split(' ')));
    kinCache.set(key, { parent: set(0), child: set(1) });
  }
  return kinCache.get(key);
}
// Lo que delante de una de esas palabras la convierte en otra relación: «grand-père»,
// «petite-fille», «beau-père» (abuelo, nieta, suegro o padrastro).
const KIN_PREFIXES = new Set(['grand', 'petit', 'petite', 'arriere', 'beau', 'belle']);

/**
 * Padres e hijos según los mapas de relaciones: una flecha entre dos personajes con «madre»,
 * «padre», «hijo»… en su texto. Devuelve [{ parent, child }]. Sirve para comprobar fechas.
 */
export function parentPairs() {
  const { nodes, edges } = allRelations();
  const byKey = new Map(nodes.map((n) => [n.key, n.entity]));
  const kin = kinWords();
  const out = [];
  for (const e of edges) {
    const a = byKey.get(e.a);
    const b = byKey.get(e.b);
    if (e.both || !a || !b || a.type !== 'character' || b.type !== 'character') continue;
    const words = e.label.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC').toLowerCase().split(/[^\p{L}]+/u);
    const has = (set) => words.some((w, i) => set.has(w) && !KIN_PREFIXES.has(words[i - 1]));
    // «A —madre→ B» se lee «A es madre de B»; «A —hijo→ B», «A es hijo de B».
    if (has(kin.parent)) out.push({ parent: a, child: b });
    else if (has(kin.child)) out.push({ parent: b, child: a });
  }
  return out;
}

// ---------- Identificador visible ----------
// Personajes, lugares, objetos, grupos, eventos y escenas llevan un identificador corto
// («P-003»): una letra por tipo y un número que se da al crear el elemento, no cambia al
// renombrarlo ni al reordenarlo y no se reutiliza al borrarlo. El número se guarda en
// data.num; el siguiente libre de cada tipo, en los datos del proyecto (data.codeNext).

export const CODED_TYPES = ['character', 'location', 'object', 'group', 'custom', 'event', 'scene'];

/** «P-003», o '' si el elemento no lleva identificador. */
export function entityCode(e) {
  if (!e || !CODED_TYPES.includes(e.type) || !(e.data && e.data.num > 0)) return '';
  return `${t('code.' + e.type)}-${String(e.data.num).padStart(3, '0')}`;
}

const codeCounters = () => ({ ...(((store.project || {}).data || {}).codeNext || {}) });
let saveCountersTimer = null;

/** Apunta en el proyecto el siguiente número libre (se guarda poco después, de una vez). */
function rememberCounters(counters) {
  const project = store.project;
  project.data = { ...(project.data || {}), codeNext: counters };
  clearTimeout(saveCountersTimer);
  saveCountersTimer = setTimeout(() => {
    if (store.project !== project) return;
    store.patchProjectData({ codeNext: project.data.codeNext }).catch((err) => console.error(err));
  }, 1500);
}

// Al crear un elemento de estos tipos se le da su número.
store.beforeCreate = (entity) => {
  if (!CODED_TYPES.includes(entity.type) || (entity.data && entity.data.num > 0)) return;
  const counters = codeCounters();
  let max = 0;
  for (const e of store.list(entity.type)) if (e.data.num > max) max = e.data.num;
  const num = Math.max(Number(counters[entity.type]) || 1, max + 1);
  entity.data = { ...(entity.data || {}), num };
  rememberCounters({ ...counters, [entity.type]: num + 1 });
};

/**
 * Da número a los elementos que no lo tienen (proyectos anteriores, copias importadas) y
 * resuelve los repetidos (dos dispositivos creando a la vez). La primera vez se numeran en el
 * orden en que se ven: las escenas en orden de lectura, los eventos por fecha y el resto como
 * están en su lista. En pantalla se ven al momento; se van guardando por detrás.
 */
export function ensureCodes() {
  const project = store.project;
  if (!project) return;
  const counters = codeCounters();
  const pending = [];
  let dirty = false;
  for (const type of CODED_TYPES) {
    let list = store.list(type);
    if (type === 'scene') list = [...new Set([...allScenesOrdered(), ...list])];
    if (type === 'event') list = [...list].sort((a, b) => ((a.data.time || '') < (b.data.time || '') ? -1 : 1));
    const seen = new Set();
    const missing = [];
    let max = 0;
    for (const e of list) {
      const n = e.data.num;
      if (Number.isInteger(n) && n > 0 && !seen.has(n)) {
        seen.add(n);
        if (n > max) max = n;
      } else missing.push(e);
    }
    const start = Math.max(Number(counters[type]) || 1, max + 1);
    let next = start;
    for (const e of missing) pending.push([e.id, next++]);
    if (next !== (Number(counters[type]) || 1)) {
      counters[type] = next;
      dirty = true;
    }
  }
  // El número queda puesto ya (store.update cambia el elemento al momento); los guardados van
  // de uno en uno para no saturar el servidor en proyectos grandes.
  const saves = pending.map(([id, num]) => {
    const e = store.get(id);
    e.data = { ...e.data, num };
    return id;
  });
  if (dirty) rememberCounters(counters);
  (async () => {
    for (const id of saves) {
      if (store.project !== project) return;
      const e = store.get(id);
      if (e) await store.patchData(id, { num: e.data.num });
    }
  })().catch((err) => console.error(err));
}

// ---------- Eventos ----------
// Un evento es un elemento propio (tipo «event») con fecha, descripción y la lista de
// elementos a los que pertenece (data.targets). Sin ninguno, es un evento general: un hecho
// del mundo que vale para toda la historia.

/** Tipos de elemento a los que puede pertenecer un evento. */
export const EVENT_TARGET_TYPES = ['character', 'location', 'object', 'group'];

/** Elementos a los que pertenece un evento (los que siguen existiendo). */
export function eventTargets(ev) {
  return validIds(ev.data.targets).map((id) => store.get(id));
}

/** Eventos de un elemento, por fecha. */
export function eventsOf(entityId) {
  return store.list('event')
    .filter((ev) => Array.isArray(ev.data.targets) && ev.data.targets.includes(entityId))
    .sort((a, b) => (eventTime(a) < eventTime(b) ? -1 : 1));
}

// Un evento es un hecho; una escena es dónde se cuenta. Se enlazan en data.scenes del evento:
// [{ id (de la escena), mode }], con dos modos:
//  - 'in'   el hecho OCURRE en la escena: el evento toma su fecha (no se copia: se calcula) y,
//           en la línea temporal, sale dentro de la escena en vez de como entrada aparte;
//  - 'told' el hecho SE CUENTA en la escena (un recuerdo, un relato): conserva su propia fecha.
// Un evento puede ocurrir en varias escenas (una batalla): empieza con la primera y termina con
// la última. La fecha propia (data.time) no se pierde: vuelve a valer si se quita el enlace o
// se borra la escena.
export const EVENT_MODES = ['in', 'told'];

/** Enlaces de un evento con escenas que siguen existiendo: [{ scene, mode }]. */
export function eventLinks(ev) {
  return (Array.isArray(ev.data.scenes) ? ev.data.scenes : [])
    .map((l) => ({ scene: l && store.get(l.id), mode: l && l.mode === 'told' ? 'told' : 'in' }))
    .filter((l) => l.scene && l.scene.type === 'scene');
}

/** Escenas en las que ocurre el evento, por fecha (las que no la tienen, al final). */
export function eventHosts(ev) {
  return eventLinks(ev).filter((l) => l.mode === 'in').map((l) => l.scene)
    .sort((a, b) => (a.data.time && b.data.time ? (a.data.time < b.data.time ? -1 : a.data.time > b.data.time ? 1 : 0) : a.data.time ? -1 : b.data.time ? 1 : 0));
}

/** Escenas en las que el evento solo se cuenta. */
export function eventTellers(ev) {
  return eventLinks(ev).filter((l) => l.mode === 'told').map((l) => l.scene);
}

/** ¿Toma el evento su fecha de una escena? (Ocurre en alguna que tiene fecha.) */
export function eventInherits(ev) {
  return eventHosts(ev).some((s) => s.data.time);
}

/** Fecha efectiva de un evento: la de la primera escena en la que ocurre o, si no, la suya. */
export function eventTime(ev) {
  const host = eventHosts(ev).find((s) => s.data.time);
  return host ? host.data.time : ev.data.time || '';
}

/** Cuándo termina un evento que ocurre en escenas: el final de la última (o '' si no se sabe o no dura). */
export function eventEnd(ev) {
  const hosts = eventHosts(ev).filter((s) => s.data.time);
  if (!hosts.length) return '';
  const end = hosts.map((s) => (s.data.timeEnd && s.data.timeEnd > s.data.time ? s.data.timeEnd : s.data.time)).sort().pop();
  return end > hosts[0].data.time ? end : '';
}

/** Eventos enlazados con una escena: [{ ev, mode }], primero los que ocurren en ella. */
export function sceneEvents(scene) {
  const out = [];
  for (const ev of store.list('event')) {
    const link = eventLinks(ev).find((l) => l.scene === scene);
    if (link) out.push({ ev, mode: link.mode });
  }
  return out.sort((a, b) => (a.mode === b.mode ? (eventTime(a.ev) < eventTime(b.ev) ? -1 : 1) : a.mode === 'in' ? -1 : 1));
}

/**
 * Eventos sin escena que coinciden en el tiempo con una: misma fecha y hora, o dentro de lo
 * que dura la escena. Son candidatos a enlazarse («ocurre aquí»): [{ ev, scene }]. No se
 * proponen los que el usuario ha descartado (project.data.eventLinkSkip).
 */
export function eventLinkCandidates() {
  const skip = new Set(Array.isArray(store.project.data.eventLinkSkip) ? store.project.data.eventLinkSkip : []);
  const scenes = allScenesOrdered().filter((s) => s.data.time);
  const norm = (time) => (time.indexOf('T') > 0 ? time : time + 'T00:00');
  const out = [];
  for (const ev of store.list('event')) {
    if (!ev.data.time || skip.has(ev.id) || eventLinks(ev).length) continue;
    const at = norm(ev.data.time);
    const scene = scenes.find((s) => s.data.time === ev.data.time || norm(s.data.time) === at
      || (s.data.time.indexOf('T') > 0 && ev.data.time.indexOf('T') > 0 && s.data.timeEnd && s.data.time <= ev.data.time && ev.data.time <= s.data.timeEnd));
    if (scene) out.push({ ev, scene });
  }
  return out;
}

/**
 * Los proyectos anteriores guardaban los eventos dentro de cada ficha (data.events) y los
 * generales dentro del proyecto. Al abrir uno así se convierten en elementos propios; se
 * hace una sola vez, porque después ya no queda nada que convertir.
 */
export async function migrateEvents() {
  const general = Array.isArray(store.project.data.events) ? store.project.data.events : [];
  const owners = EVENT_TARGET_TYPES.flatMap((type) => store.list(type)).filter((e) => Array.isArray(e.data.events));
  if (!general.length && !owners.length) return;
  const make = (ev, targets) => store.create('event', {
    name: String(ev.title || ''), data: { time: ev.time, description: String(ev.description || ''), targets },
  });
  for (const e of owners) {
    for (const ev of e.data.events) if (ev && ev.time) await make(ev, [e.id]);
    const { events, ...rest } = e.data;
    await store.update(e.id, { data: rest });
  }
  for (const ev of general) if (ev && ev.time) await make(ev, []);
  if ('events' in store.project.data) await store.updateProject({ data_remove: ['events'] });
}
