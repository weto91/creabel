// Copias de seguridad (exportar / restaurar un proyecto completo) y creación de secuelas.
// Todo se hace desde el navegador usando la API genérica, así el servidor no necesita
// conocer la forma interna de los datos.
//
// La copia es un .zip:
//   LEEME.txt               qué hay dentro y cómo se restaura
//   datos-creabel.json      todo lo que se restaura: el proyecto y sus propiedades, todas las
//                           fichas, capítulos, escenas con todas sus revisiones, eventos, notas,
//                           tareas, mapas, el registro de palabras… y la lista de archivos
//   archivos/creabel_<md5>… las imágenes, planos y documentos adjuntos, tal cual y con el mismo
//                           nombre que en el servidor (un archivo repetido va una sola vez)
//   libro/                  el texto del libro en Word y en texto, para leerlo sin Creabel
//   fichas/                 las fichas completas de cada tipo, en Word
//   dossier.docx            todo el material de trabajo en un documento
// Para restaurar solo hacen falta el JSON y la carpeta de archivos; lo demás es para leer.
// Se siguen admitiendo las copias anteriores (un .json con las imágenes dentro).
import { api } from './api.js';
import { store } from './store.js';
import { t, tn } from './i18n.js';
import { uid, dataUrlToBlob, downloadBlob, slugify, today, formatTimestamp } from './text.js';
import { toast, errorText } from './ui.js';
import { getPrefs, savePrefs } from './prefs.js';
import { zipCompressed } from './export/zip.js';
import { openZip } from './import/unzip.js';
import { md5 } from './md5.js';

const FORMAT = 'creabel-backup';
const VERSION = 2;
const ENTITY_FIELDS = ['id', 'type', 'parent_id', 'position', 'name', 'status', 'data', 'body', 'words', 'chars', 'created_at', 'updated_at'];
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf' };
// Tipos que cuentan como «fichas» en el resumen de una copia.
const SHEET_TYPES = new Set(['character', 'location', 'object', 'group', 'custom', 'note', 'term', 'strand', 'event', 'secret', 'mindmap', 'plan', 'reference', 'task']);
// Fecha en UTC con la forma que usa el servidor («2026-11-21 10:30:00»); '' si no es una fecha.
const stampOf = (date) => (Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 19).replace('T', ' '));

/**
 * Todo el proyecto, listo para guardar: { format, version, exported_at, project, entities,
 * images: [{ id, entity_id, name, mime, position, blob }], wordlog, missing: [archivos ilegibles] }.
 * Lo que está en la papelera no se incluye.
 */
export async function buildBackup(pid, { withImages = true } = {}) {
  const data = await api.get('projects/' + pid);
  // El texto de las revisiones no viene con los elementos: se pide aparte.
  const bodies = await api.get(`projects/${pid}/bodies`, { type: 'revision' });
  const byId = new Map(bodies.map((b) => [b.id, b.body || '']));
  const entities = data.entities.map((e) => {
    const out = {};
    for (const key of ENTITY_FIELDS) if (e[key] !== undefined) out[key] = e[key];
    if (e.type === 'revision') out.body = byId.get(e.id) || '';
    return out;
  });
  const live = new Set(entities.map((e) => e.id));
  const images = [];
  const missing = [];
  if (withImages) {
    for (const img of data.images || []) {
      // De una ficha que está en la papelera: se queda con ella.
      if (img.entity_id && !live.has(img.entity_id)) continue;
      try {
        images.push({ id: img.id, entity_id: img.entity_id || null, name: img.name || '', mime: img.mime || '', position: img.position || 0, blob: await api.imageBlob(img) });
      } catch (err) {
        // Un archivo ilegible no debe impedir la copia del resto: se anota.
        missing.push(img.name || img.id);
      }
    }
  }
  const { seq, meta_seq: metaSeq, ...project } = data.project;
  return { format: FORMAT, version: VERSION, exported_at: new Date().toISOString(), project, entities, images, wordlog: data.wordlog || [], missing };
}

// ---------- La copia en .zip ----------

const dirs = () => ({ files: t('backup.dir.files'), book: t('backup.dir.book'), sheets: t('backup.dir.sheets') });
const dataFile = () => t('backup.dir.data');

/**
 * Nombre de un archivo dentro del zip: archivos/creabel_<MD5>.<ext>, el mismo que tiene en el
 * servidor. El nombre original y la ficha a la que pertenece van en el JSON de la copia.
 */
function storedPath(img, bytes) {
  const ext = EXTENSIONS[img.mime] || ((/\.([a-z0-9]{2,5})$/i.exec(img.name) || [])[1] || 'bin').toLowerCase();
  return `${dirs().files}/creabel_${md5(bytes)}.${ext}`;
}
/**
 * Copias para leer sin Creabel: el libro (Word y texto), las fichas de cada tipo y el dossier.
 * Se hacen con el proyecto abierto; si no lo está (desde «Tus proyectos»), se abre un momento.
 * Lo que falle se anota en `report.failed` y la copia sigue.
 */
async function readableFiles(pid, report) {
  if (store.project && store.project.id !== pid) return [];
  const opened = !store.project;
  const files = [];
  const d = dirs();
  const add = async (name, blob) => files.push({ name, data: new Uint8Array(await blob.arrayBuffer()), deflate: true });
  const attempt = async (label, fn) => {
    try { await fn(); } catch (err) { console.error(err); report.failed.push(label); }
  };
  try {
    if (opened) await store.open(pid); else await store.flush();
    const [{ buildNovel, buildDossier }, { toDocx, toTxt }, { buildElementsFile, IO_TYPES }] = await Promise.all([
      import('./export/build.js'), import('./export/formats.js'), import('./export/elements.js'),
    ]);
    const p = store.project;
    const base = { title: p.name, author: p.author || t('book.anonymous'), lang: p.language, font: 'serif', size: 12, indent: true };
    if (store.list('scene').length) {
      await attempt(t('backup.readme.bookLabel'), async () => {
        const blocks = await buildNovel({ titlePage: true, chapterTitle: 'both', separator: '* * *', sceneTitles: true, glossary: false });
        await add(`${d.book}/${slugify(p.name)}.docx`, toDocx(blocks, base));
        await add(`${d.book}/${slugify(p.name)}.txt`, toTxt(blocks));
        report.book = true;
      });
    }
    for (const type of IO_TYPES) {
      const groups = type === 'custom'
        ? (p.data.customTypes || []).map((ct) => ({ ct, list: store.list('custom').filter((e) => e.data.kind === ct.id), title: ct.name }))
        : [{ ct: null, list: store.list(type), title: t(type + '.plural') }];
      for (const g of groups) {
        if (!g.list.length) continue;
        await attempt(g.title, async () => {
          await add(`${d.sheets}/${slugify(g.title)}.docx`, buildElementsFile('docx', type, g.list, g.ct));
          report.sheets++;
        });
      }
    }
    await attempt(t('export.dossier'), async () => {
      const sections = { architecture: true, characters: true, locations: true, objects: true, groups: true, notes: true, dictionary: true, outline: true, timeline: true };
      await add(`${slugify(t('export.dossier'))}.docx`, toDocx(await buildDossier(sections), { ...base, title: `${p.name} — ${t('export.dossier')}` }));
      report.dossier = true;
    });
  } catch (err) {
    console.error(err);
    report.failed.push(t('backup.readme.readable'));
  } finally {
    // Se cierra si se abrió para esto y nadie ha entrado en él mientras tanto.
    if (opened && store.project && store.project.id === pid && !/^#\/p\//.test(location.hash)) store.close();
  }
  return files;
}

function readmeText(backup, paths, report) {
  const p = backup.project;
  const count = (type) => backup.entities.filter((e) => e.type === type).length;
  const d = dirs();
  const lines = [
    t('backup.readme.title', { name: p.name }),
    t('backup.readme.made', { date: formatTimestamp(stampOf(new Date(backup.exported_at))) }),
    '',
    t('backup.readme.restore'),
    '',
    t('backup.readme.contents'),
    `- ${dataFile()}: ${t('backup.readme.data', {
      chapters: tn('count.chapters', count('chapter')), scenes: tn('count.scenes', count('scene')),
      revisions: tn('backup.revisions', count('revision')), sheets: tn('backup.sheets', backup.entities.filter((e) => SHEET_TYPES.has(e.type)).length),
    })}`,
    paths.length ? `- ${d.files}/: ${tn('backup.readme.files', new Set(paths).size)}` : null,
    report.book ? `- ${d.book}/: ${t('backup.readme.book')}` : null,
    report.sheets ? `- ${d.sheets}/: ${t('backup.readme.sheets')}` : null,
    report.dossier ? `- ${slugify(t('export.dossier'))}.docx: ${t('backup.readme.dossier')}` : null,
    '',
    t('backup.readme.notIncluded'),
    backup.missing.length ? ['', t('backup.readme.missing', { list: backup.missing.join(', ') })] : null,
    report.failed.length ? ['', t('backup.readme.failed', { list: report.failed.join(', ') })] : null,
  ].flat().filter((x) => x !== null);
  return String.fromCharCode(0xFEFF) + lines.join('\r\n') + '\r\n';
}

/** Construye la copia completa en .zip. Devuelve { blob, filename, files, missing, failed }. */
export async function buildBackupZip(pid) {
  const backup = await buildBackup(pid);
  const report = { failed: [], book: false, sheets: 0, dossier: false };
  // Cada archivo con su nombre por contenido. El mismo archivo subido dos veces va una sola vez
  // en el zip: las dos imágenes del JSON apuntan a él.
  const paths = [];
  const attached = [];
  for (const img of backup.images) {
    const bytes = new Uint8Array(await img.blob.arrayBuffer());
    const path = storedPath(img, bytes);
    paths.push(path);
    // Las fotos ya vienen comprimidas; los PDF y SVG suelen ganar algo.
    if (!attached.some((f) => f.name === path)) attached.push({ name: path, data: bytes, deflate: /pdf|svg/.test(img.mime) });
  }
  const stored = {
    format: FORMAT, version: VERSION, app: 'Creabel', exported_at: backup.exported_at,
    project: backup.project, entities: backup.entities,
    images: backup.images.map((img, i) => ({ id: img.id, entity_id: img.entity_id, name: img.name, mime: img.mime, position: img.position, file: paths[i] })),
    wordlog: backup.wordlog, missing: backup.missing,
  };
  const files = [{ name: dataFile(), data: JSON.stringify(stored, null, 1), deflate: true }, ...attached];
  files.push(...await readableFiles(pid, report));
  files.unshift({ name: t('backup.dir.readme'), data: readmeText(backup, paths, report), deflate: true });
  return {
    blob: await zipCompressed(files),
    filename: `${slugify(backup.project.name)}-${today()}.creabel.zip`,
    files: attached.length, missing: backup.missing, failed: report.failed,
  };
}

export async function downloadBackup(pid) {
  const out = await buildBackupZip(pid);
  downloadBlob(out.blob, out.filename);
  await markBackup(pid);
  if (out.missing.length) toast(t('backup.missingToast', { list: out.missing.join(', ') }), 'error', 10000);
  return out;
}

// ---------- Recordatorio de copias ----------
// La fecha de la última copia de cada proyecto se guarda en las preferencias (como texto JSON).

const stamp = () => stampOf(new Date());

function backupDates() {
  try {
    const map = JSON.parse(getPrefs().lastBackups || '{}');
    return map && typeof map === 'object' ? map : {};
  } catch (e) {
    return {};
  }
}

async function markBackup(pid) {
  try {
    await savePrefs({ lastBackups: JSON.stringify({ ...backupDates(), [pid]: stamp() }) });
  } catch (e) {
    // La copia ya se ha descargado; si no se puede anotar la fecha, solo se repetirá el aviso.
  }
}

/**
 * Proyectos que llevan demasiados días sin copia de seguridad y han cambiado desde la última:
 * [{ project, days, never }]. `projects` es la lista que devuelve el servidor (fechas en UTC).
 */
export function backupsDue(projects) {
  const prefs = getPrefs();
  if (prefs.backupReminder === false) return [];
  const limit = Math.max(1, Math.min(60, Number(prefs.backupReminderDays) || 5));
  const dates = backupDates();
  const now = Date.now();
  const due = [];
  for (const p of projects) {
    const last = dates[p.id] || '';
    // Sin contenido no hay nada que perder; sin cambios desde la última copia, tampoco.
    if (!(p.words || p.chapters) || (last && p.updated_at <= last)) continue;
    const from = Date.parse((last || p.created_at).replace(' ', 'T') + 'Z');
    const days = Math.floor((now - from) / 86400000);
    if (Number.isFinite(days) && days >= limit) due.push({ project: p, days, never: !last });
  }
  return due;
}

// ---------- Leer una copia ----------

function badBackup() {
  const err = new Error(t('backup.badFile'));
  err.code = 'bad_backup';
  return err;
}

export function parseBackup(text) {
  let backup;
  try {
    backup = JSON.parse(String(text).trim());
  } catch (e) {
    backup = null;
  }
  if (!backup || backup.format !== FORMAT || !backup.project || !Array.isArray(backup.entities)) throw badBackup();
  if (!Array.isArray(backup.images)) backup.images = [];
  return backup;
}

/**
 * Lee una copia: el .zip (también si se ha descomprimido y vuelto a comprimir con una carpeta
 * delante) o el .json de las copias anteriores. Cada archivo del zip queda con `load()`, que lo
 * saca del zip al restaurarlo.
 */
export async function readBackupFile(file) {
  const buffer = await file.arrayBuffer();
  const head = new Uint8Array(buffer, 0, Math.min(2, buffer.byteLength));
  if (head[0] !== 0x50 || head[1] !== 0x4b) return parseBackup(new TextDecoder('utf-8').decode(buffer));
  let zipped;
  try { zipped = openZip(buffer); } catch (err) { throw badBackup(); }
  const depth = (name) => name.split('/').length;
  const candidates = zipped.names.filter((n) => /\.json$/i.test(n)).sort((a, b) => depth(a) - depth(b) || a.length - b.length);
  for (const name of candidates) {
    let backup;
    try { backup = parseBackup(await zipped.text(name)); } catch (err) { continue; }
    const prefix = name.includes('/') ? name.slice(0, name.lastIndexOf('/') + 1) : '';
    for (const img of backup.images) {
      if (!img.file) continue;
      const path = prefix + img.file;
      if (!zipped.names.includes(path)) continue;
      img.load = async () => new Blob([await zipped.bytes(path)], { type: img.mime || '' });
    }
    return backup;
  }
  throw badBackup();
}

/** Lo que trae una copia, para enseñarlo antes de restaurarla. */
export function backupSummary(backup) {
  const count = (type) => backup.entities.filter((e) => e.type === type).length;
  const images = backup.images || [];
  return {
    name: backup.project.name || '', exported: backup.exported_at ? stampOf(new Date(backup.exported_at)) : '',
    chapters: count('chapter'), scenes: count('scene'), revisions: count('revision'),
    sheets: backup.entities.filter((e) => SHEET_TYPES.has(e.type)).length,
    files: images.length,
    // Archivos que la copia nombra pero no trae (el .json suelto de una copia en .zip).
    unavailable: images.filter((img) => !img.blob && !img.load && !img.dataUrl).length,
  };
}

// ---------- Restaurar ----------

/**
 * Crea un proyecto nuevo a partir de una copia. Todos los identificadores se regeneran, de modo
 * que la misma copia puede restaurarse varias veces sin tocar lo que ya hay. Devuelve el id del
 * proyecto. `overrides.report`, si se da, recibe { files, failed: [nombres], reason } (el
 * motivo del primer archivo que no se pudo subir).
 */
export async function importBackup(backup, overrides = {}) {
  const report = overrides.report || { files: 0, failed: [] };
  const idMap = new Map();
  for (const e of backup.entities) idMap.set(e.id, uid());
  for (const img of backup.images || []) idMap.set(img.id, uid());

  // Sustituye cualquier id antiguo (en valores o en claves) dentro de los datos JSON.
  const remap = (v) => {
    if (typeof v === 'string') return idMap.get(v) || v;
    if (Array.isArray(v)) return v.map(remap);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [idMap.get(k) || k, remap(x)]));
    }
    return v;
  };

  const pid = uid();
  const src = backup.project;
  await api.post('projects', {
    id: pid,
    name: overrides.name || src.name || 'Proyecto',
    author: src.author || '',
    language: src.language || 'es',
    data: remap(src.data || {}),
  });

  const entities = backup.entities.map((e) => ({
    id: idMap.get(e.id),
    type: e.type,
    parent_id: e.parent_id ? idMap.get(e.parent_id) || null : null,
    position: e.position || 0,
    name: e.name || '',
    status: e.status || 0,
    data: remap(e.data || {}),
    body: e.body || '',
    words: e.words || 0,
    chars: e.chars || 0,
    // Las fechas de creación y de último cambio se conservan (las copias anteriores no las traían).
    ...(e.created_at ? { created_at: e.created_at } : {}),
    ...(e.updated_at ? { updated_at: e.updated_at } : {}),
  }));

  // En bloques de tamaño moderado para no superar el límite de subida del servidor.
  let chunk = [];
  let size = 0;
  const send = async () => {
    if (!chunk.length) return;
    await api.post(`projects/${pid}/bulk`, { entities: chunk, keep_dates: true });
    chunk = [];
    size = 0;
  };
  for (const e of entities) {
    const weight = e.body.length + JSON.stringify(e.data).length + 300;
    if (chunk.length && size + weight > 600000) await send();
    chunk.push(e);
    size += weight;
  }
  await send();

  if (!overrides.skipWordlog && Array.isArray(backup.wordlog) && backup.wordlog.length) {
    await api.post(`projects/${pid}/wordlog`, { entries: backup.wordlog });
  }

  // Los archivos, en su orden (así conservan su posición).
  const images = [...(backup.images || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  for (const img of images) {
    // De una ficha que no viene en la copia: no tiene dónde ir.
    if (img.entity_id && !idMap.has(img.entity_id)) continue;
    try {
      const blob = img.blob || (img.load ? await img.load() : null) || (img.dataUrl ? await dataUrlToBlob(img.dataUrl) : null);
      if (!blob) throw new Error('missing');
      const fd = new FormData();
      fd.append('file', blob.type || !img.mime ? blob : new Blob([blob], { type: img.mime }), img.name || 'archivo');
      fd.append('id', idMap.get(img.id));
      if (img.entity_id) fd.append('entity_id', idMap.get(img.entity_id));
      await api.post(`projects/${pid}/images`, fd);
      report.files++;
    } catch (e) {
      // Se continúa con el resto de archivos; se anota el motivo para explicarlo al terminar.
      report.failed.push(img.name || img.id);
      if (!report.reason) report.reason = e && e.message === 'missing' ? t('backup.fileNotInBackup') : errorText(e);
    }
  }
  return pid;
}

/**
 * Secuela: proyecto nuevo que conserva el mundo (personajes, lugares, objetos, grupos,
 * notas, relaciones y ambientación) pero empieza sin capítulos ni escenas.
 */
export async function createSequel(pid, name) {
  const backup = await buildBackup(pid);
  // Se queda el mundo (también las fichas propias y los mapas); se va lo que es de este libro.
  const dropped = new Set(['part', 'chapter', 'scene', 'revision', 'strand', 'task', 'session', 'secret']);
  backup.entities = backup.entities.filter((e) => !dropped.has(e.type));
  for (const e of backup.entities) {
    if (e.type === 'architecture' && (e.data.key === 'premise' || e.data.key === 'fabula')) {
      e.body = '';
      e.status = 0;
    }
  }
  const data = { ...(backup.project.data || {}) };
  delete data.goals;
  // La portada, la sinopsis y los avisos ignorados son de la novela anterior.
  for (const key of ['cover', 'synopsis', 'logline', 'continuityIgnored']) delete data[key];
  backup.project.data = data;
  return importBackup(backup, { name, skipWordlog: true });
}
