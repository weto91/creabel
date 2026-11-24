// Motor de datos local de Creabel: hace de «servidor» dentro del propio dispositivo. Responde a
// las mismas rutas que api/index.php de la web (api.js no nota la diferencia) y guarda los
// datos con un adaptador: SQLite y archivos en disco en la aplicación (adapter-tauri.js), o el
// almacenamiento del navegador en el modo de prueba (adapter-browser.js).
//
// Para poder sincronizar entre dispositivos, cada dato lleva la marca de tiempo de su último
// cambio (un reloj híbrido: hora + contador + dispositivo, que se puede comparar como texto):
//  - en cada fila, una marca por campo (_v.name, _v.position…) y una por cada clave de `data`
//    (_v.data.role…). Al juntar dos copias gana, campo a campo, el cambio más reciente;
//  - el texto (body) lleva además de qué versión partía (_bm.from): si dos dispositivos
//    escribieron sobre la misma versión sin verse, no se elige uno y se tira el otro: se queda
//    el más reciente y el otro se guarda como revisión (o nota) «en conflicto»;
//  - lo borrado definitivamente deja una lápida (tombs) para que no reaparezca;
//  - _lr es la hora local del último cambio de la fila (propio o recibido): lo que se envía a
//    cada destino de sincronización es lo cambiado desde el último envío.
import { md5 } from '../md5.js';
import { t as translate } from '../i18n.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
export const newId = (n = 16) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => ALPHABET[b % 36]).join('');
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

export const FILE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf' };

// Campos que se sincronizan (además de `data` por claves, el texto y la papelera).
const FIELDS = {
  entity: ['type', 'parent_id', 'position', 'name', 'status', 'words', 'chars'],
  image: ['entity_id', 'name', 'position', 'filename', 'mime', 'size'],
  project: ['name', 'author', 'language'],
  wordlog: ['start', 'total'],
};
// Lo que es solo de este dispositivo y no viaja.
const LOCAL_ONLY = ['seq', 'body_seq', 'meta_seq', '_lr', 'url'];

function fail(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  throw err;
}

/**
 * Crea el motor. `adapter` guarda y lee (ver adapter-*.js); `device` es el identificador de
 * este dispositivo (si no se da, el guardado o uno nuevo). Devuelve { ready, handle, sync… }.
 */
export function createEngine({ adapter, device: fixedDevice = '' }) {
  let device = fixedDevice || 'pendiente';
  let localMark = ''; // la marca del último cambio hecho aquí (no recibido)
  const db = { kv: {}, projects: [], entities: [], images: [], wordlog: [], tombs: [] };
  const byId = { project: new Map(), entity: new Map(), image: new Map(), wordlog: new Map() };
  const tombIds = new Map(); // 'tbl:id' -> lápida
  const dirty = new Map(); // 'tbl:id' -> { tbl, id, row | null }
  const kvDirty = new Set();
  let clock = '';
  let queue = Promise.resolve();
  const listeners = new Set();

  // ---------- Reloj ----------
  const fmt = (ms, c) => String(ms).padStart(15, '0') + '.' + String(c).padStart(5, '0');
  const parse = (t) => (t ? [Number(t.slice(0, 15)) || 0, Number(t.slice(16, 21)) || 0] : [0, 0]);
  function tick() {
    const [lm, lc] = parse(clock);
    const ms = Date.now();
    clock = ms > lm ? fmt(ms, 0) : fmt(lm, lc + 1);
    kvSet('clock', clock);
    return clock + '-' + device;
  }
  function observe(t) {
    if (!t) return;
    const stamp = t.slice(0, 21);
    if (stamp > clock) { clock = stamp; kvSet('clock', clock); }
  }
  const stampDate = (t) => {
    const ms = parse(t)[0];
    return ms ? new Date(ms).toISOString().slice(0, 16).replace('T', ' ') : '';
  };

  // ---------- Almacén en memoria ----------
  const tables = { project: db.projects, entity: db.entities, image: db.images, wordlog: db.wordlog };
  const keyOf = (tbl, id) => tbl + ':' + id;
  function kvSet(k, v) { db.kv[k] = v; kvDirty.add(k); }
  function touch(tbl, row) { dirty.set(keyOf(tbl, row.id), { tbl, id: row.id, pid: row.project_id || (tbl === 'project' ? row.id : ''), row }); }
  function add(tbl, row) { tables[tbl].push(row); byId[tbl].set(row.id, row); touch(tbl, row); }
  function drop(tbl, id) {
    const list = tables[tbl];
    const at = list.findIndex((r) => r.id === id);
    if (at >= 0) list.splice(at, 1);
    byId[tbl].delete(id);
    dirty.set(keyOf(tbl, id), { tbl, id, row: null });
  }
  function bury(tbl, id, pid) {
    const tomb = { id: keyOf(tbl, id), tbl, rid: id, project_id: pid, t: tick(), _lr: '' };
    tomb._lr = tomb.t;
    tombIds.set(tomb.id, tomb);
    db.tombs.push(tomb);
    dirty.set(keyOf('tomb', tomb.id), { tbl: 'tomb', id: tomb.id, pid, row: tomb });
    return tomb;
  }

  async function commit() {
    if (!dirty.size && !kvDirty.size) return;
    const upserts = [];
    const deletes = [];
    for (const d of dirty.values()) {
      if (d.row) upserts.push({ tbl: d.tbl, id: d.id, pid: d.pid, json: JSON.stringify(d.row) });
      else deletes.push({ tbl: d.tbl, id: d.id });
    }
    const kv = {};
    for (const k of kvDirty) kv[k] = db.kv[k];
    dirty.clear();
    kvDirty.clear();
    await adapter.commit({ upserts, deletes, kv });
  }

  // ---------- Marcas de cambio ----------
  function stampAll(row, tbl, t) {
    row._v = row._v || {};
    for (const f of FIELDS[tbl]) row._v[f] = t;
    if (tbl !== 'wordlog') row._v.trash = t;
    if (row.data && typeof row.data === 'object') {
      row._v.data = row._v.data || {};
      for (const k of Object.keys(row.data)) row._v.data[k] = t;
    }
    row._c = row._c || t;
    row._lr = t;
  }
  function stampData(row, keys, t) {
    row._v = row._v || {};
    row._v.data = row._v.data || {};
    for (const k of keys) row._v.data[k] = t;
  }
  function stampBody(row, t) {
    const cur = row._bm || null;
    row._bm = { t, dev: device, from: cur ? (cur.dev === device ? cur.from || null : { t: cur.t, dev: cur.dev }) : null };
  }

  // ---------- Ayudas como las del servidor ----------
  function project(id, withDeleted = false) {
    const p = byId.project.get(id);
    if (!p || (!withDeleted && p.deleted_at)) fail(404, 'project_not_found', 'El proyecto no existe');
    return p;
  }
  function entity(id, withDeleted = false) {
    const e = byId.entity.get(id);
    if (!e || (!withDeleted && e.deleted_at)) fail(404, 'not_found', 'El elemento no existe');
    return e;
  }
  function nextSeq(pid) {
    const p = project(pid, true);
    p.seq = (p.seq || 0) + 1;
    p.updated_at = now();
    touch('project', p);
    return p.seq;
  }
  const trashDays = () => Math.max(1, Math.min(60, Number((db.kv.prefs || {}).trashDays) || 30));

  function insertEntity(pid, e, seq, keepDates = false) {
    const t = now();
    const stamp = (v) => (keepDates && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v || '') ? v : t);
    const id = e.id || newId();
    if (byId.entity.has(id) || tombIds.has(keyOf('entity', id))) fail(409, 'exists', 'Ya existe un elemento con ese identificador');
    const row = {
      id, project_id: pid, type: e.type, parent_id: e.parent_id || null, position: e.position || 0,
      name: e.name || '', status: e.status || 0, data: e.data || {}, body: e.body || '', words: e.words || 0, chars: e.chars || 0,
      created_at: stamp(e.created_at), updated_at: stamp(e.updated_at), seq, body_seq: seq, deleted_at: null, trash_root: null,
    };
    const v = tick();
    stampAll(row, 'entity', v);
    if (row.body) row._bm = { t: v, dev: device, from: null };
    add('entity', row);
    return row;
  }
  function mergedData(current, body) {
    if ('data' in body) return body.data || {};
    if (!body.data_patch && !body.data_remove) return null;
    const data = { ...(current || {}), ...(body.data_patch || {}) };
    for (const key of body.data_remove || []) delete data[key];
    return data;
  }
  const treeIds = (rootId, liveOnly) => {
    const ids = [rootId];
    for (let i = 0; i < ids.length; i++) {
      for (const e of db.entities) if (e.parent_id === ids[i] && !ids.includes(e.id) && !(liveOnly && e.deleted_at)) ids.push(e.id);
    }
    return ids;
  };

  /** Borra definitivamente (con lápida) unas filas, y los archivos que ya nadie use. */
  function purgeEntities(ids) {
    for (const id of ids) {
      const e = byId.entity.get(id);
      if (!e) continue;
      for (const img of db.images.filter((i) => i.entity_id === id)) purgeImage(img);
      drop('entity', id);
      bury('entity', id, e.project_id);
    }
  }
  const orphanFiles = new Set();
  function purgeImage(img) {
    drop('image', img.id);
    bury('image', img.id, img.project_id);
    if (img.filename) orphanFiles.add(img.filename);
  }
  function purgeProject(pid, withTomb = true) {
    for (const e of db.entities.filter((x) => x.project_id === pid)) drop('entity', e.id);
    for (const img of db.images.filter((x) => x.project_id === pid)) { drop('image', img.id); if (img.filename) orphanFiles.add(img.filename); }
    for (const w of db.wordlog.filter((x) => x.project_id === pid)) drop('wordlog', w.id);
    for (const tomb of db.tombs.filter((x) => x.project_id === pid && x.tbl !== 'project')) {
      tombIds.delete(tomb.id);
      dirty.set(keyOf('tomb', tomb.id), { tbl: 'tomb', id: tomb.id, row: null });
    }
    db.tombs = db.tombs.filter((x) => !(x.project_id === pid && x.tbl !== 'project'));
    drop('project', pid);
    if (withTomb) bury('project', pid, pid);
  }
  async function cleanFiles() {
    for (const name of orphanFiles) {
      if (!db.images.some((i) => i.filename === name)) {
        try { await adapter.files.remove(name); } catch (err) { /* se intentará otra vez más adelante */ }
      }
    }
    orphanFiles.clear();
  }
  function purgeExpired() {
    const cutoff = new Date(Date.now() - trashDays() * 86400000).toISOString().slice(0, 19).replace('T', ' ');
    for (const p of db.projects.filter((x) => x.deleted_at && x.deleted_at < cutoff)) purgeProject(p.id);
    purgeEntities(db.entities.filter((e) => e.deleted_at && e.deleted_at < cutoff).map((e) => e.id));
    for (const img of db.images.filter((i) => i.deleted_at && i.deleted_at < cutoff)) purgeImage(img);
  }

  // ---------- Salidas (lo mismo que devuelve el servidor) ----------
  const strip = (r) => {
    const out = { ...r };
    for (const k of ['_v', '_bm', '_lr', '_c']) delete out[k];
    return out;
  };
  const outEntity = (e) => ({ ...strip(e.type === 'revision' ? { ...e, body: '' } : e), seq: e.seq || 0, body_seq: e.body_seq || 0, ...(e.deleted_at ? { deleted: true } : {}) });
  const outImage = (i) => ({ ...strip(i), url: i.filename ? adapter.files.url(i.filename) : i.url || '', seq: i.seq || 0, ...(i.deleted_at ? { deleted: true } : {}) });
  const outProject = (p) => ({ ...strip(p), seq: p.seq || 0, meta_seq: p.meta_seq || 0 });
  const withTotals = (p) => ({
    ...outProject(p),
    words: db.entities.filter((e) => e.project_id === p.id && e.type === 'scene' && !e.deleted_at).reduce((s, e) => s + (e.words || 0), 0),
    chapters: db.entities.filter((e) => e.project_id === p.id && e.type === 'chapter' && !e.deleted_at).length,
  });

  // ---------- Rutas ----------
  async function dispatch(method, route, body, query) {
    let m;
    const is = (verb, pattern) => verb === method && (m = route.match(new RegExp('^' + pattern + '$')));
    const ID = '([a-z0-9]{6,32})';
    const auth = db.kv.auth || null;

    if (is('GET', 'auth/status')) return { configured: !!auth, authenticated: !!auth, mode: auth ? auth.mode : null, version: 'local' };
    if (is('POST', 'auth/setup')) {
      if (auth) fail(409, 'already_configured', 'Ya configurada');
      kvSet('auth', { mode: 'none' });
      return { authenticated: true };
    }
    if (is('POST', 'auth/login') || is('POST', 'auth/logout')) return { authenticated: true };
    if (!auth) fail(401, 'unauthorized', 'Sesión no iniciada');
    if (is('POST', 'auth/password')) return { mode: 'none' };

    if (is('GET', 'network')) return { local_only: true, ranges: [], software: 'local', php: '—', remote: '127.0.0.1', forwarded: [], proxy: false };
    if (is('GET', 'settings')) return db.kv.prefs || {};
    if (is('POST', 'settings')) {
      kvSet('prefs', { ...(db.kv.prefs || {}), ...body });
      return db.kv.prefs;
    }

    // ---------- Proyectos ----------
    if (is('GET', 'projects')) {
      purgeExpired();
      return db.projects.filter((p) => !p.deleted_at).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).map(withTotals);
    }
    if (is('GET', 'trash/projects')) {
      purgeExpired();
      return { projects: db.projects.filter((p) => p.deleted_at).sort((a, b) => (a.deleted_at < b.deleted_at ? 1 : -1)).map(withTotals), days: trashDays() };
    }
    if (is('POST', 'projects')) {
      if (!body.name || !String(body.name).trim()) fail(400, 'invalid', 'El nombre es obligatorio');
      const t = now();
      const id = body.id || newId();
      if (byId.project.has(id)) fail(409, 'exists', 'Ya existe ese proyecto');
      const p = { id, name: String(body.name).trim(), author: body.author || '', language: body.language || 'es', data: body.data || {}, created_at: t, updated_at: t, seq: 0, meta_seq: 0, deleted_at: null };
      stampAll(p, 'project', tick());
      add('project', p);
      return outProject(p);
    }
    if (is('GET', `projects/${ID}`)) {
      purgeExpired();
      const p = project(m[1]);
      return {
        project: outProject(p),
        entities: db.entities.filter((e) => e.project_id === p.id && !e.deleted_at).sort((a, b) => a.position - b.position).map(outEntity),
        images: db.images.filter((i) => i.project_id === p.id && !i.deleted_at).map(outImage),
        wordlog: db.wordlog.filter((w) => w.project_id === p.id).map((w) => ({ day: w.day, start: w.start, total: w.total })),
      };
    }
    if (is('POST', `projects/${ID}`)) {
      const p = project(m[1]);
      const t = tick();
      for (const k of ['name', 'author', 'language']) if (k in body && body[k] !== p[k]) { p[k] = body[k]; p._v[k] = t; }
      const data = mergedData(p.data, body);
      if (data) {
        const keys = new Set([...Object.keys(p.data || {}), ...Object.keys(data)]);
        stampData(p, [...keys].filter((k) => JSON.stringify((p.data || {})[k]) !== JSON.stringify(data[k])), t);
        p.data = data;
      }
      p._lr = t;
      p.meta_seq = nextSeq(p.id);
      return outProject(p);
    }
    if (is('POST', `projects/${ID}/delete`)) {
      const p = project(m[1]);
      p.deleted_at = now();
      p._v.trash = p._lr = tick();
      touch('project', p);
      return { deleted: true };
    }
    if (is('POST', `projects/${ID}/restore`)) {
      const p = project(m[1], true);
      p.deleted_at = null;
      p._v.trash = p._lr = tick();
      touch('project', p);
      return { restored: true };
    }
    if (is('POST', `projects/${ID}/purge`)) {
      if (!project(m[1], true).deleted_at) fail(409, 'not_in_trash', 'El proyecto no está en la papelera');
      purgeProject(m[1]);
      return { purged: true };
    }
    if (is('GET', `projects/${ID}/changes`)) {
      const p = project(m[1]);
      const since = Math.max(0, Number(query.since) || 0);
      const seq = p.seq || 0;
      const out = { seq, entities: [], images: [], project: null };
      if (seq > since) {
        out.entities = db.entities.filter((e) => e.project_id === p.id && (e.seq || 0) > since).map(outEntity);
        out.images = db.images.filter((i) => i.project_id === p.id && (i.seq || 0) > since).map(outImage);
        // Lo borrado definitivamente desde otro dispositivo: se quita también de la página abierta.
        for (const tomb of db.tombs) {
          if (tomb.project_id === p.id && (tomb.seq || 0) > since && (tomb.tbl === 'entity' || tomb.tbl === 'image')) {
            (tomb.tbl === 'entity' ? out.entities : out.images).push({ id: tomb.rid, deleted: true, seq: tomb.seq });
          }
        }
        if ((p.meta_seq || 0) > since) out.project = outProject(p);
      }
      return out;
    }
    if (is('GET', `projects/${ID}/trash`)) {
      project(m[1]);
      purgeExpired();
      const entities = db.entities.filter((e) => e.project_id === m[1] && e.deleted_at && e.trash_root === e.id)
        .sort((a, b) => (a.deleted_at < b.deleted_at ? 1 : -1))
        .map((e) => {
          const parent = byId.entity.get(e.parent_id);
          return {
            id: e.id, type: e.type, name: e.name, parent_id: e.parent_id, parent_name: parent ? parent.name : null, parent_type: parent ? parent.type : null,
            deleted_at: e.deleted_at, words: e.words || 0, children: db.entities.filter((c) => c.trash_root === e.id).length - 1, data: e.data || {},
          };
        });
      const images = db.images.filter((i) => {
        if (i.project_id !== m[1] || !i.deleted_at) return false;
        const owner = byId.entity.get(i.entity_id);
        return !i.entity_id || !owner || !owner.deleted_at;
      }).map(outImage);
      return { entities, images, days: trashDays() };
    }
    if (is('POST', `projects/${ID}/trash/empty`)) {
      project(m[1]);
      purgeEntities(db.entities.filter((e) => e.project_id === m[1] && e.deleted_at).map((e) => e.id));
      for (const img of db.images.filter((i) => i.project_id === m[1] && i.deleted_at)) purgeImage(img);
      return { emptied: true };
    }

    // ---------- Elementos ----------
    if (is('POST', `projects/${ID}/entities`)) {
      project(m[1]);
      return outEntity(insertEntity(m[1], body, nextSeq(m[1])));
    }
    if (is('POST', `projects/${ID}/bulk`)) {
      project(m[1]);
      const seq = nextSeq(m[1]);
      for (const e of body.entities || []) insertEntity(m[1], e, seq, !!body.keep_dates);
      return { inserted: (body.entities || []).length, seq };
    }
    if (is('POST', `projects/${ID}/reorder`)) {
      const seq = nextSeq(m[1]);
      const t = tick();
      (body.ids || []).forEach((id, index) => {
        const e = byId.entity.get(id);
        if (e && e.project_id === m[1] && e.position !== index) { e.position = index; e._v.position = t; e._lr = t; e.seq = seq; touch('entity', e); }
      });
      return { reordered: (body.ids || []).length, seq };
    }
    if (is('GET', `projects/${ID}/bodies`)) {
      const type = query.type || 'revision';
      return db.entities.filter((e) => e.project_id === m[1] && e.type === type && !e.deleted_at).map((e) => ({ id: e.id, body: e.body, body_seq: e.body_seq || 0 }));
    }
    if (is('POST', `projects/${ID}/bodies`)) {
      const ids = new Set(body.ids || []);
      return db.entities.filter((e) => e.project_id === m[1] && !e.deleted_at && ids.has(e.id)).map((e) => ({ id: e.id, body: e.body, body_seq: e.body_seq || 0 }));
    }
    if (is('POST', `projects/${ID}/wordlog`)) {
      project(m[1]);
      const t = tick();
      for (const entry of body.entries || [body]) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.day || '')) continue;
        const id = m[1] + '-' + entry.day;
        const row = byId.wordlog.get(id);
        if (row) {
          if (row.total !== (entry.total || 0)) { row.total = entry.total || 0; row._v.total = t; row._lr = t; touch('wordlog', row); }
        } else {
          const w = { id, project_id: m[1], day: entry.day, start: entry.start || 0, total: entry.total || 0 };
          stampAll(w, 'wordlog', t);
          add('wordlog', w);
        }
      }
      return { saved: true };
    }
    if (is('GET', `entities/${ID}`)) {
      const e = entity(m[1], !!query.trash);
      return { ...strip(e), seq: e.seq || 0, body_seq: e.body_seq || 0 };
    }
    if (is('POST', `entities/${ID}`)) {
      const e = entity(m[1]);
      const bodyChanged = 'body' in body && body.body !== e.body;
      if (bodyChanged && 'base_body' in body && Number(body.base_body) !== (e.body_seq || 0)) fail(409, 'conflict', 'Este texto se ha modificado desde otro dispositivo');
      const t = tick();
      for (const k of ['name', 'status', 'position', 'words', 'chars', 'parent_id']) {
        if (k in body && body[k] !== e[k]) { e[k] = body[k]; e._v[k] = t; }
      }
      if (bodyChanged) { e.body = body.body; stampBody(e, t); }
      const data = mergedData(e.data, body);
      if (data) {
        const keys = new Set([...Object.keys(e.data || {}), ...Object.keys(data)]);
        stampData(e, [...keys].filter((k) => JSON.stringify((e.data || {})[k]) !== JSON.stringify(data[k])), t);
        e.data = data;
      }
      e.updated_at = now();
      e._lr = t;
      e.seq = nextSeq(e.project_id);
      if (bodyChanged) e.body_seq = e.seq;
      touch('entity', e);
      return { id: e.id, updated: true, seq: e.seq, body_seq: e.body_seq || 0 };
    }
    if (is('POST', `entities/${ID}/delete`)) {
      const root = entity(m[1]);
      const ids = treeIds(root.id, true);
      const seq = nextSeq(root.project_id);
      const at = now();
      const t = tick();
      for (const id of ids) {
        const e = byId.entity.get(id);
        if (e && !e.deleted_at) { Object.assign(e, { deleted_at: at, trash_root: root.id, seq }); e._v.trash = t; e._lr = t; touch('entity', e); }
      }
      return { deleted: ids, seq };
    }
    if (is('POST', `entities/${ID}/restore`)) {
      const row = entity(m[1], true);
      if (!row.deleted_at) return { restored: [] };
      const root = entity(row.trash_root || row.id, true);
      const t = tick();
      if (root.parent_id) {
        const parent = byId.entity.get(root.parent_id);
        if (parent && parent.deleted_at) fail(409, 'parent_in_trash', 'Restaura antes el elemento que lo contiene');
        if (!parent) { root.parent_id = null; root._v.parent_id = t; }
      }
      const seq = nextSeq(root.project_id);
      const ids = [];
      for (const e of db.entities) {
        if (e.project_id === root.project_id && e.trash_root === root.id) {
          Object.assign(e, { deleted_at: null, trash_root: null, seq });
          e._v.trash = t;
          e._lr = t;
          touch('entity', e);
          ids.push(e.id);
        }
      }
      return { restored: ids, seq };
    }
    if (is('POST', `entities/${ID}/purge`)) {
      if (!entity(m[1], true).deleted_at) fail(409, 'not_in_trash', 'El elemento no está en la papelera');
      purgeEntities(treeIds(m[1], false));
      return { purged: true };
    }

    // ---------- Imágenes y documentos ----------
    if (is('POST', `projects/${ID}/images`)) {
      project(m[1]);
      const file = body.get('file');
      const ext = file && FILE_TYPES[file.type];
      if (!ext) fail(400, 'image_type', 'Formato no admitido (usa JPG, PNG, GIF, WebP, SVG o PDF)');
      const bytes = new Uint8Array(await file.arrayBuffer());
      // Nombre por contenido, como en el servidor: el mismo archivo se guarda una sola vez.
      const filename = `creabel_${md5(bytes)}.${ext}`;
      if (!(await adapter.files.has(filename))) await adapter.files.save(filename, bytes);
      const id = body.get('id') || newId();
      if (byId.image.has(id)) fail(409, 'exists', 'Ya existe ese archivo');
      // El recurso se llama como su archivo (creabel_<md5>.<ext>), no como se llamaba al subirlo.
      const img = {
        id, project_id: m[1], entity_id: body.get('entity_id') || null, name: filename, mime: file.type, size: bytes.length,
        position: db.images.filter((i) => i.project_id === m[1]).length, filename, created_at: now(), seq: nextSeq(m[1]), deleted_at: null,
      };
      stampAll(img, 'image', tick());
      add('image', img);
      return outImage(img);
    }
    const image = (id) => byId.image.get(id) || fail(404, 'not_found', 'La imagen no existe');
    if (is('POST', `images/${ID}/delete`) || is('POST', `images/${ID}/restore`)) {
      const img = image(m[1]);
      img.deleted_at = route.endsWith('/delete') ? now() : null;
      img._v.trash = img._lr = tick();
      img.seq = nextSeq(img.project_id);
      touch('image', img);
      return route.endsWith('/delete') ? { deleted: true } : { restored: true };
    }
    if (is('POST', `images/${ID}/purge`)) {
      const img = image(m[1]);
      if (!img.deleted_at) fail(409, 'not_in_trash', 'El archivo no está en la papelera');
      purgeImage(img);
      return { purged: true };
    }
    fail(404, 'route_not_found', 'Ruta no encontrada: ' + method + ' ' + route);
    return undefined;
  }

  // Las peticiones se atienden de una en una (también las de la sincronización).
  function serial(fn) {
    const run = queue.then(fn, fn);
    queue = run.catch(() => {});
    return run;
  }

  async function handle(method, route, body, query) {
    return serial(async () => {
      await ready;
      const input = typeof FormData !== 'undefined' && body instanceof FormData ? body : clone(body || {});
      let out;
      try {
        out = await dispatch(method, route, input, query || {});
      } catch (err) {
        // Lo que se hubiera cambiado a medias se guarda igual: el estado en memoria manda.
        await commit();
        throw err;
      }
      if (method === 'POST' && route !== 'settings') localMark = clock + '-' + device;
      await commit();
      if (orphanFiles.size) await cleanFiles();
      if (method === 'POST' && route !== 'settings') emit({ type: 'local', route });
      return clone(out);
    });
  }

  // ---------- Sincronización: lo que necesita sync.js ----------

  const strippedForSync = (row) => {
    const out = { ...row };
    for (const k of LOCAL_ONLY) delete out[k];
    return out;
  };

  /** Lo cambiado en un proyecto desde la marca local `since` ('' = todo). */
  function collect(pid, since = '') {
    const after = (r) => (r._lr || '') > since;
    const p = byId.project.get(pid);
    const pack = {
      project: p && after(p) ? strippedForSync(p) : null,
      entities: db.entities.filter((e) => e.project_id === pid && after(e)).map(strippedForSync),
      images: db.images.filter((i) => i.project_id === pid && after(i)).map(strippedForSync),
      wordlog: db.wordlog.filter((w) => w.project_id === pid && after(w)).map(strippedForSync),
      tombs: db.tombs.filter((x) => x.project_id === pid && after(x)).map(strippedForSync),
    };
    const mark = clock + '-' + device;
    const files = [...new Set(pack.images.map((i) => i.filename).filter(Boolean))];
    const count = (pack.project ? 1 : 0) + pack.entities.length + pack.images.length + pack.wordlog.length + pack.tombs.length;
    return { pack, files, count, mark };
  }

  /** Une lo recibido de otro dispositivo. Devuelve { changed, files: [archivos que faltan] }. */
  function merge(pid, pack) {
    let changed = 0;
    const touched = new Set();
    const seqFor = () => (byId.project.has(pid) ? nextSeq(pid) : 0);
    const note = (tbl, row) => { row._lr = tick(); touch(tbl, row); touched.add(row); changed++; };
    for (const tomb of pack.tombs || []) {
      observe(tomb.t);
      if (tombIds.has(tomb.id)) continue;
      const kept = { ...tomb, _lr: tick() };
      tombIds.set(kept.id, kept);
      db.tombs.push(kept);
      if (tomb.tbl === 'project') { purgeProject(tomb.rid, false); }
      else if (byId[tomb.tbl] && byId[tomb.tbl].has(tomb.rid)) {
        const row = byId[tomb.tbl].get(tomb.rid);
        drop(tomb.tbl, tomb.rid);
        if (tomb.tbl === 'image' && row.filename) orphanFiles.add(row.filename);
      }
      kept.seq = seqFor();
      dirty.set(keyOf('tomb', kept.id), { tbl: 'tomb', id: kept.id, pid: kept.project_id, row: kept });
      changed++;
    }
    if (tombIds.has(keyOf('project', pid))) return { changed, files: [] };
    if (pack.project) {
      const R = pack.project;
      let L = byId.project.get(pid);
      if (!L) {
        L = { ...clone(R), seq: 0, meta_seq: 0, updated_at: now() };
        for (const s of Object.values(L._v || {})) if (typeof s === 'string') observe(s);
        add('project', L);
        note('project', L);
        L.meta_seq = nextSeq(pid);
      } else if (mergeFields(L, R, 'project')) {
        note('project', L);
        L.meta_seq = nextSeq(pid);
      }
    }
    // Aún no ha llegado el proyecto: no se junta nada (se reintentará con este mismo paquete).
    if (!byId.project.has(pid)) return { changed, files: [], missingProject: true };
    for (const tbl of ['entity', 'image', 'wordlog']) {
      const list = pack[tbl === 'entity' ? 'entities' : tbl === 'image' ? 'images' : 'wordlog'] || [];
      for (const R of list) {
        if (tombIds.has(keyOf(tbl, R.id))) continue;
        let L = byId[tbl].get(R.id);
        if (!L) {
          L = { ...clone(R), project_id: pid };
          for (const s of Object.values(L._v || {})) if (typeof s === 'string') observe(s);
          if (L._bm) observe(L._bm.t);
          add(tbl, L);
          note(tbl, L);
          L.seq = seqFor();
          if (tbl === 'entity') L.body_seq = L.seq;
          continue;
        }
        const before = tbl === 'entity' ? L.body : null;
        if (mergeFields(L, R, tbl)) {
          note(tbl, L);
          L.seq = seqFor();
          if (tbl === 'entity' && L.body !== before) L.body_seq = L.seq;
        }
      }
    }
    const files = [...new Set(db.images.filter((i) => i.project_id === pid && touched.has(i) && i.filename).map((i) => i.filename))];
    return { changed, files };
  }

  /** Junta campo a campo una fila recibida (R) con la propia (L). Devuelve si cambió algo. */
  function mergeFields(L, R, tbl) {
    let changed = false;
    L._v = L._v || {};
    const rv = R._v || {};
    for (const f of FIELDS[tbl]) {
      if ((rv[f] || '') > (L._v[f] || '')) { L[f] = R[f]; L._v[f] = rv[f]; observe(rv[f]); changed = true; }
    }
    if (tbl !== 'wordlog' && (rv.trash || '') > (L._v.trash || '')) {
      L.deleted_at = R.deleted_at || null;
      if (tbl === 'entity') L.trash_root = R.trash_root || null;
      L._v.trash = rv.trash;
      observe(rv.trash);
      changed = true;
    }
    if (rv.data) {
      L._v.data = L._v.data || {};
      L.data = L.data || {};
      for (const [k, t] of Object.entries(rv.data)) {
        if ((t || '') > (L._v.data[k] || '')) {
          if (R.data && k in R.data) L.data[k] = clone(R.data[k]);
          else delete L.data[k];
          L._v.data[k] = t;
          observe(t);
          changed = true;
        }
      }
    }
    if (tbl === 'entity' && mergeBody(L, R)) changed = true;
    return changed;
  }

  // ¿La versión a se escribió sobre la b (o sobre una posterior de la misma cadena)?
  const descends = (a, b) => (a.dev === b.dev ? a.t > b.t : !!(a.from && (a.from.t === b.t || (a.from.dev === b.dev && a.from.t >= b.t))));

  function mergeBody(L, R) {
    const rb = R._bm;
    const lb = L._bm;
    if (!rb) return false;
    observe(rb.t);
    if (!lb) {
      if (L.body && L.body !== R.body) conflictCopy(L, L.body, { t: L._c || '', dev: '' });
      L.body = R.body; L._bm = clone(rb);
      return true;
    }
    if (rb.t === lb.t) return false;
    if (descends(rb, lb)) { L.body = R.body; L._bm = clone(rb); return true; }
    if (descends(lb, rb)) return false;
    // Escritos a la vez sin verse: se queda el más reciente y el otro se guarda aparte.
    if (L.body === R.body) { if (rb.t > lb.t) L._bm = clone(rb); return rb.t > lb.t; }
    if (rb.t > lb.t) {
      conflictCopy(L, L.body, lb);
      L.body = R.body; L._bm = clone(rb);
      return true;
    }
    conflictCopy(L, R.body, rb);
    return false;
  }

  /**
   * Guarda un texto que ha perdido en un conflicto: como otra revisión de la misma escena o, si
   * es el texto de una ficha, como una nota enlazada con ella. El identificador sale del texto
   * perdedor, así que todos los dispositivos crean la misma copia (y no se duplica).
   */
  function conflictCopy(L, text, version) {
    if (!text) return;
    const id = 'cf' + md5(L.id + '|' + (version.t || 'x')).slice(0, 22);
    if (byId.entity.has(id) || tombIds.has(keyOf('entity', id))) return;
    const t = version.t || tick();
    const when = stampDate(t);
    const isRevision = L.type === 'revision';
    const row = {
      id, project_id: L.project_id, type: isRevision ? 'revision' : 'note', parent_id: isRevision ? L.parent_id : null,
      position: isRevision ? 100000 : 0,
      // En el idioma de la interfaz de quien la crea (la copia viaja a los demás tal cual).
      name: isRevision ? `${translate('sync.conflictRevision')}${when ? ' · ' + when : ''}` : `${translate('sync.conflictNote', { name: L.name || '' })}${when ? ' (' + when + ')' : ''}`,
      status: 0, data: isRevision ? { conflictOf: L.id } : { links: [L.id], tags: [translate('sync.conflictTag')] }, body: text,
      words: isRevision ? L.words || 0 : 0, chars: isRevision ? L.chars || 0 : 0,
      created_at: now(), updated_at: now(), deleted_at: null, trash_root: null,
    };
    stampAll(row, 'entity', t);
    row._bm = { t, dev: version.dev || '', from: null };
    row._lr = tick();
    add('entity', row);
    row.seq = byId.project.has(L.project_id) ? nextSeq(L.project_id) : 0;
    row.body_seq = row.seq;
  }

  /** Une un paquete recibido y lo guarda. */
  async function syncMerge(pid, pack) {
    return serial(async () => {
      await ready;
      const result = merge(pid, pack);
      await commit();
      if (orphanFiles.size) await cleanFiles();
      if (result.changed) emit({ type: 'remote', pid });
      return result;
    });
  }

  async function syncCollect(pid, since) {
    return serial(async () => { await ready; return collect(pid, since); });
  }

  /** Resumen de un proyecto para info.json (lo que ven otros dispositivos antes de descargarlo). */
  function projectInfo(pid) {
    const p = byId.project.get(pid);
    if (!p) return null;
    const t = withTotals(p);
    return { id: p.id, name: p.name, author: p.author, words: t.words, chapters: t.chapters, updated: clock + '-' + device, deleted: !!p.deleted_at };
  }

  function emit(evt) { for (const fn of listeners) { try { fn(evt); } catch (err) { console.error(err); } } }

  // ---------- Carga ----------
  const ready = (async () => {
    const loaded = await adapter.load();
    Object.assign(db.kv, loaded.kv || {});
    clock = db.kv.clock || '';
    device = fixedDevice || db.kv.device || newId(8);
    if (db.kv.device !== device) kvSet('device', device);
    for (const { tbl, json } of loaded.rows || []) {
      let row;
      try { row = JSON.parse(json); } catch (err) { continue; }
      if (tbl === 'tomb') { tombIds.set(row.id, row); db.tombs.push(row); continue; }
      if (!tables[tbl]) continue;
      tables[tbl].push(row);
      byId[tbl].set(row.id, row);
    }
    db.entities.sort((a, b) => (a.position || 0) - (b.position || 0));
    // Datos de la versión preliminar (o del modo de prueba anterior), si los hay y esto está vacío.
    let imported = false;
    if (!db.projects.length && !db.kv.legacyImported && adapter.legacy) {
      const old = await adapter.legacy();
      if (old && Array.isArray(old.projects)) { await importLegacy(old); imported = true; }
    }
    if (!db.kv.auth && adapter.autoAuth) kvSet('auth', { mode: 'none' });
    renameResources();
    await commit();
    if (imported && adapter.legacyDone) adapter.legacyDone();
  })();

  /**
   * Cada recurso (imagen o documento) se llama como su archivo: creabel_<md5>.<ext>. Los que
   * se subieron antes con su nombre original lo cambian una vez (y el cambio viaja a los demás
   * dispositivos al sincronizar).
   */
  function renameResources() {
    for (const img of db.images) {
      if (!img.filename || img.name === img.filename || !byId.project.has(img.project_id)) continue;
      img.name = img.filename;
      img._v = img._v || {};
      img._v.name = img._lr = tick();
      img.seq = nextSeq(img.project_id);
      touch('image', img);
    }
  }

  /** Pasa los datos del formato anterior (todo en un objeto, imágenes como data: URL). */
  async function importLegacy(old) {
    const t = tick();
    if (old.prefs) kvSet('prefs', old.prefs);
    if (old.auth) kvSet('auth', { mode: 'none' });
    for (const p of old.projects || []) {
      const row = { ...p };
      stampAll(row, 'project', t);
      add('project', row);
    }
    for (const e of old.entities || []) {
      const row = { ...e };
      stampAll(row, 'entity', t);
      if (row.body) row._bm = { t, dev: device, from: null };
      add('entity', row);
    }
    for (const w of old.wordlog || []) {
      const row = { ...w, id: w.project_id + '-' + w.day };
      stampAll(row, 'wordlog', t);
      add('wordlog', row);
    }
    for (const img of old.images || []) {
      const row = { ...img };
      if (typeof img.url === 'string' && img.url.startsWith('data:')) {
        try {
          const bytes = new Uint8Array(await (await fetch(img.url)).arrayBuffer());
          const ext = FILE_TYPES[img.mime] || 'bin';
          row.filename = `creabel_${md5(bytes)}.${ext}`;
          if (!(await adapter.files.has(row.filename))) await adapter.files.save(row.filename, bytes);
          row.size = bytes.length;
        } catch (err) { console.error(err); }
      }
      delete row.url;
      stampAll(row, 'image', t);
      add('image', row);
    }
    kvSet('legacyImported', now());
  }

  return {
    ready,
    get device() { return device; },
    /** Marca del último cambio hecho en este dispositivo (para no reenviar lo recibido). */
    localMark: () => localMark,
    /** Marca actual del reloj (todo lo cambiado hasta ahora es ≤ que ella). */
    mark: () => clock + '-' + device,
    handle,
    syncCollect,
    syncMerge,
    projectInfo,
    /** Proyectos de este dispositivo: [{ id, name, deleted }]. */
    projects: () => db.projects.map((p) => ({ id: p.id, name: p.name, deleted: !!p.deleted_at })),
    /** Identificadores de los proyectos borrados definitivamente aquí (o recibidos así). */
    buriedProjects: () => db.tombs.filter((x) => x.tbl === 'project').map((x) => x.rid),
    kvGet: (k) => clone(db.kv[k]),
    kvSet: async (k, v) => serial(async () => { kvSet(k, v); await commit(); }),
    files: adapter.files,
    imageBlob: async (img) => {
      const row = byId.image.get(img.id);
      if (!row || !row.filename) throw new Error('missing');
      const bytes = await adapter.files.read(row.filename);
      return new Blob([bytes], { type: row.mime || '' });
    },
    on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    // Solo para pruebas: el estado en memoria.
    _db: db,
  };
}
