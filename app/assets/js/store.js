// Almacén en memoria del proyecto abierto. Las páginas leen de aquí y todas las
// modificaciones pasan por aquí: se aplican al instante en memoria y se envían al servidor.
//
// Varios dispositivos pueden tener abierto el mismo proyecto:
// - los datos de cada elemento se envían por claves (solo lo que ha cambiado), de modo que
//   dos dispositivos que tocan campos distintos no se pisan;
// - cada pocos segundos se pide al servidor lo cambiado desde la última vez y se incorpora;
// - si dos dispositivos escriben a la vez el mismo texto, el servidor rechaza el segundo
//   guardado y aquí se resuelve sin perder nada (en las escenas, como una revisión aparte).
import { api } from './api.js';
import { uid, today, formatTimestamp } from './text.js';
import { t } from './i18n.js';

const listeners = new Set();
const pending = new Map(); // id -> { patch, timer }
const inflight = new Map(); // id -> Promise
// Lo último que se sabe que tiene el servidor de cada elemento:
// id -> { data (JSON), seq (número de cambio), bodySeq (número de cambio de su texto) }
const synced = new Map();
let saving = 0;
let lastError = null;
let wordTimer = null;
let syncTimer = null;
let syncing = false;

const SYNC_MS = 15000;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function objectify(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}

const snapshot = (e) => ({ data: JSON.stringify(e.data || {}), seq: e.seq || 0, bodySeq: e.body_seq || 0 });

/** Claves de `after` que difieren de `before` y claves que han desaparecido. */
function diffData(before, after) {
  const patch = {};
  const remove = [];
  for (const key of Object.keys(after)) if (!same(after[key], before[key])) patch[key] = after[key];
  for (const key of Object.keys(before)) if (!(key in after)) remove.push(key);
  return { patch, remove };
}

export const store = {
  project: null,
  entities: new Map(),
  images: [],
  wordlog: [],
  openTotal: 0,
  seq: 0, // último número de cambio del proyecto que se conoce

  on(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  emit(evt) {
    for (const fn of [...listeners]) {
      try { fn(evt); } catch (e) { console.error(e); }
    }
  },

  /** 'saved' | 'dirty' | 'saving' | 'error' */
  saveState() {
    if (lastError) return 'error';
    if (saving > 0) return 'saving';
    if (pending.size) return 'dirty';
    return 'saved';
  },

  hasPending() {
    return pending.size > 0 || inflight.size > 0;
  },

  async open(pid) {
    await this.flush();
    const data = await api.get('projects/' + pid);
    this.project = data.project;
    this.project.data = objectify(this.project.data);
    this.entities = new Map();
    synced.clear();
    for (const e of data.entities) {
      e.data = objectify(e.data);
      this.entities.set(e.id, e);
      synced.set(e.id, snapshot(e));
    }
    this.images = data.images || [];
    this.wordlog = data.wordlog || [];
    this.openTotal = this.totalWords();
    this.seq = this.project.seq || 0;
    clearInterval(syncTimer);
    syncTimer = setInterval(() => this.sync(), SYNC_MS);
    this.emit({ type: 'open' });
  },

  close() {
    clearInterval(syncTimer);
    syncTimer = null;
    this.project = null;
    this.entities = new Map();
    this.images = [];
    this.wordlog = [];
    synced.clear();
    this.seq = 0;
  },

  get(id) {
    return id ? this.entities.get(id) || null : null;
  },

  /** Elementos de un tipo, ordenados. Con parentId (incluido null) filtra por padre. */
  list(type, parentId) {
    const out = [];
    for (const e of this.entities.values()) {
      if (e.type !== type) continue;
      if (parentId !== undefined && (e.parent_id || null) !== (parentId || null)) continue;
      out.push(e);
    }
    return out.sort((a, b) => a.position - b.position || (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0));
  },

  totalWords() {
    let total = 0;
    for (const e of this.entities.values()) if (e.type === 'scene') total += e.words || 0;
    return total;
  },

  async create(type, fields = {}) {
    const parent = fields.parent_id || null;
    const siblings = this.list(type, parent);
    const position = fields.position != null ? fields.position : (siblings.length ? siblings[siblings.length - 1].position + 1 : 0);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const entity = {
      id: uid(), project_id: this.project.id, type, parent_id: parent, name: '', status: 0,
      data: {}, body: '', words: 0, chars: 0, created_at: now, updated_at: now,
      ...fields, position,
    };
    // El modelo puede completar el elemento antes de crearlo (su identificador visible).
    if (this.beforeCreate) this.beforeCreate(entity);
    this.entities.set(entity.id, entity);
    try {
      const row = await api.post(`projects/${this.project.id}/entities`, entity);
      synced.set(entity.id, { data: JSON.stringify(entity.data || {}), seq: (row && row.seq) || 0, bodySeq: (row && row.body_seq) || 0 });
    } catch (err) {
      this.entities.delete(entity.id);
      throw err;
    }
    this.emit({ type: 'create', id: entity.id });
    return entity;
  },

  /**
   * Modifica un elemento. Con delay > 0 el guardado se agrupa (autoguardado mientras se escribe).
   * `data` se sustituye entero: usa patchData para cambiar solo algunas claves.
   */
  update(id, patch, delay = 0) {
    const e = this.entities.get(id);
    if (!e) return Promise.resolve();
    Object.assign(e, patch);
    let p = pending.get(id);
    if (!p) {
      p = { patch: {}, timer: null };
      pending.set(id, p);
    }
    Object.assign(p.patch, patch);
    clearTimeout(p.timer);
    this.emit({ type: 'update', id });
    if (delay > 0) {
      p.timer = setTimeout(() => this._flushOne(id), delay);
      return Promise.resolve();
    }
    return this._flushOne(id);
  },

  patchData(id, partial, delay = 0) {
    const e = this.entities.get(id);
    if (!e) return Promise.resolve();
    return this.update(id, { data: { ...e.data, ...partial } }, delay);
  },

  /** Lo que se envía al servidor para un cambio pendiente: los datos van por claves. */
  _payload(id, patch) {
    const payload = { ...patch };
    const base = synced.get(id);
    if ('data' in payload && base) {
      const { patch: keys, remove } = diffData(JSON.parse(base.data), payload.data || {});
      delete payload.data;
      if (Object.keys(keys).length) payload.data_patch = keys;
      if (remove.length) payload.data_remove = remove;
    }
    // Con el texto va el número de cambio sobre el que se escribió: si ya no es el mismo, hay conflicto.
    if ('body' in payload && base) payload.base_body = base.bodySeq;
    return payload;
  },

  /** Tras guardar: el servidor ya tiene estos datos y este número de cambio. */
  _saved(id, payload, res) {
    const base = synced.get(id);
    if (!base) return;
    const data = { ...JSON.parse(base.data), ...(payload.data_patch || {}) };
    for (const key of payload.data_remove || []) delete data[key];
    base.data = JSON.stringify(data);
    if (res && res.seq) base.seq = Math.max(base.seq, res.seq);
    if (res && res.body_seq && 'body' in payload) base.bodySeq = res.body_seq;
    // La fecha de modificación local sigue a la del servidor (la usa el aviso de «revisión de otro día»).
    const e = this.entities.get(id);
    if (e) e.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  },

  async _flushOne(id) {
    const p = pending.get(id);
    if (!p) return inflight.get(id);
    pending.delete(id);
    clearTimeout(p.timer);
    const previous = inflight.get(id) || Promise.resolve();
    const run = previous.catch(() => {}).then(async () => {
      const payload = this._payload(id, p.patch);
      if (!Object.keys(payload).length) return;
      try {
        this._saved(id, payload, await api.post('entities/' + id, payload));
      } catch (err) {
        if (err && err.code === 'conflict') await this._resolveConflict(id, p.patch);
        else throw err;
      }
    });
    inflight.set(id, run);
    saving++;
    this.emit({ type: 'save' });
    try {
      await run;
      lastError = null;
    } catch (err) {
      lastError = err;
      // Se conserva el cambio para reintentarlo en el siguiente guardado.
      if (this.entities.has(id)) {
        const again = pending.get(id) || { patch: {}, timer: null };
        again.patch = { ...p.patch, ...again.patch };
        pending.set(id, again);
      }
      this.emit({ type: 'save-error', error: err });
    } finally {
      saving--;
      if (inflight.get(id) === run) inflight.delete(id);
      this.emit({ type: 'save' });
    }
  },

  /**
   * El texto que se iba a guardar se escribió sobre una versión que otro dispositivo ya había
   * cambiado. En una escena no se pierde ninguno de los dos: el de este dispositivo se guarda
   * como una revisión aparte y la escena queda con el del otro. En los demás textos (fichas,
   * notas) prevalece el de este dispositivo, que es el que el usuario tiene delante.
   */
  async _resolveConflict(id, patch) {
    const e = this.entities.get(id);
    if (!e) return;
    const server = await api.get('entities/' + id);
    const base = synced.get(id) || snapshot(server);
    synced.set(id, base);
    base.bodySeq = server.body_seq || 0;
    const { body, words, chars, ...rest } = patch;

    if (e.type !== 'revision') {
      const payload = this._payload(id, patch); // lleva ya el número de cambio actual: no volverá a chocar
      this._saved(id, payload, await api.post('entities/' + id, payload));
      this.emit({ type: 'conflict', id, kept: 'local' });
      return;
    }

    const siblings = this.list('revision', e.parent_id);
    const copy = await this.create('revision', {
      parent_id: e.parent_id,
      position: (siblings.length ? siblings[siblings.length - 1].position : 0) + 1,
      name: t('revisions.conflictName', { date: formatTimestamp(new Date().toISOString().slice(0, 19).replace('T', ' ')) }),
      body: body || '', words: words != null ? words : e.words, chars: chars != null ? chars : e.chars,
    });
    // La revisión vuelve a tener el texto del servidor; la escena, su recuento.
    Object.assign(e, { body: server.body || '', words: server.words || 0, chars: server.chars || 0 });
    const scene = this.entities.get(e.parent_id);
    if (scene) Object.assign(scene, { words: e.words, chars: e.chars });
    const scenePending = scene ? pending.get(scene.id) : null;
    if (scenePending) { delete scenePending.patch.words; delete scenePending.patch.chars; }
    if (Object.keys(rest).length) {
      const payload = this._payload(id, rest);
      if (Object.keys(payload).length) this._saved(id, payload, await api.post('entities/' + id, payload));
    }
    this.emit({ type: 'conflict', id, kept: 'both', copy: copy.id });
  },

  /** Envía todo lo pendiente y espera a que termine. Devuelve false si algo no se pudo guardar. */
  async flush() {
    const ids = [...pending.keys()];
    await Promise.all(ids.map((id) => this._flushOne(id)));
    await Promise.all([...inflight.values()].map((p) => p.catch(() => {})));
    if (wordTimer) await this.logWords();
    return !lastError;
  },

  /** Manda a la papelera un elemento y todo lo que cuelga de él. */
  async remove(id) {
    const ids = [id];
    for (let i = 0; i < ids.length; i++) {
      for (const e of this.entities.values()) if (e.parent_id === ids[i]) ids.push(e.id);
    }
    for (const x of ids) {
      const p = pending.get(x);
      if (p) { clearTimeout(p.timer); pending.delete(x); }
      this.entities.delete(x);
      synced.delete(x);
    }
    this.images = this.images.filter((img) => !ids.includes(img.entity_id));
    this.emit({ type: 'remove', id });
    await api.post(`entities/${id}/delete`);
  },

  async reorder(ids) {
    ids.forEach((id, index) => {
      const e = this.entities.get(id);
      if (e) e.position = index;
    });
    this.emit({ type: 'reorder' });
    const res = await api.post(`projects/${this.project.id}/reorder`, { ids });
    if (res && res.seq) {
      for (const id of ids) {
        const base = synced.get(id);
        if (base) base.seq = Math.max(base.seq, res.seq);
      }
    }
  },

  /** Cambia datos del proyecto. `data_patch` fija solo algunas claves de `data`. */
  async updateProject(patch) {
    const updated = await api.post('projects/' + this.project.id, patch);
    Object.assign(this.project, updated, { data: objectify(updated.data) });
    this.emit({ type: 'project' });
  },

  patchProjectData(partial) {
    return this.updateProject({ data_patch: partial });
  },

  // ---------- Cambios hechos desde otros dispositivos ----------

  /** Pide al servidor lo cambiado desde la última vez y lo incorpora. */
  async sync() {
    if (!this.project || syncing || (typeof document !== 'undefined' && document.hidden)) return;
    syncing = true;
    const pid = this.project.id;
    try {
      const res = await api.get(`projects/${pid}/changes`, { since: this.seq });
      if (!this.project || this.project.id !== pid) return;
      const changed = this._applyRemote(res);
      this.seq = Math.max(this.seq, res.seq || 0);
      if (changed.length) this.emit({ type: 'remote', ids: changed });
    } catch (err) {
      // Sin conexión o sesión caducada: se reintenta en la siguiente pasada.
    } finally {
      syncing = false;
    }
  },

  /** Incorpora los cambios recibidos. Devuelve los ids de lo que ha cambiado de verdad. */
  _applyRemote(res) {
    const changed = [];
    for (const r of res.entities || []) {
      const base = synced.get(r.id);
      if (base && base.seq >= r.seq) continue; // es un cambio propio, ya aplicado
      const local = this.entities.get(r.id);
      if (r.deleted) {
        if (!local) continue;
        const p = pending.get(r.id);
        if (p) { clearTimeout(p.timer); pending.delete(r.id); }
        this.entities.delete(r.id);
        synced.delete(r.id);
        changed.push(r.id);
        continue;
      }
      r.data = objectify(r.data);
      if (!local) {
        this.entities.set(r.id, r);
        synced.set(r.id, snapshot(r));
        changed.push(r.id);
        continue;
      }
      const p = pending.get(r.id);
      const mine = p ? p.patch : {};
      // Datos: lo que llega, más las claves cambiadas aquí que aún no se han enviado.
      const { patch: keys, remove } = diffData(base ? JSON.parse(base.data) : {}, local.data || {});
      const data = { ...r.data, ...keys };
      for (const key of remove) delete data[key];
      for (const field of ['parent_id', 'position', 'name', 'status', 'words', 'chars', 'updated_at']) {
        if (!(field in mine)) local[field] = r[field];
      }
      // El texto de las revisiones no viaja aquí (se pide al abrir la escena) y su número de
      // cambio solo se actualiza al leerlo: así, escribir sobre un texto viejo da conflicto.
      const isRevision = r.type === 'revision';
      const bodyMoved = !base || (r.body_seq || 0) !== base.bodySeq;
      if (!isRevision && !('body' in mine)) local.body = r.body;
      local.data = data;
      if (p && 'data' in p.patch) p.patch.data = data;
      synced.set(r.id, {
        data: JSON.stringify(r.data), seq: r.seq || 0,
        bodySeq: isRevision || 'body' in mine ? (base ? base.bodySeq : 0) : r.body_seq || 0,
      });
      if (isRevision && bodyMoved) local.bodyStale = true;
      changed.push(r.id);
    }
    for (const img of res.images || []) {
      const at = this.images.findIndex((x) => x.id === img.id);
      if (img.deleted) {
        if (at >= 0) { this.images.splice(at, 1); changed.push(img.id); }
      } else if (at >= 0) {
        this.images[at] = img;
      } else {
        this.images.push(img);
        changed.push(img.id);
      }
    }
    if (res.project && (res.project.meta_seq || 0) > (this.project.meta_seq || 0)) {
      Object.assign(this.project, res.project, { data: objectify(res.project.data) });
      this.emit({ type: 'project' });
      changed.push(this.project.id);
    }
    return changed;
  },

  /** Lee del servidor el texto de un elemento (el de las revisiones no viene con el proyecto). */
  async loadBody(id) {
    const full = await api.get('entities/' + id);
    const base = synced.get(id);
    if (base) base.bodySeq = full.body_seq || 0;
    const e = this.entities.get(id);
    if (e) delete e.bodyStale;
    return full.body || '';
  },

  // ---------- Imágenes ----------

  imagesOf(entityId) {
    return this.images.filter((img) => img.entity_id === entityId);
  },

  async uploadImage(entityId, file) {
    const fd = new FormData();
    fd.append('file', file);
    // Sin elemento, la imagen pertenece al proyecto (por ejemplo, la foto del autor).
    if (entityId) fd.append('entity_id', entityId);
    const img = await api.post(`projects/${this.project.id}/images`, fd);
    this.images.push(img);
    return img;
  },

  /** Manda una imagen o un archivo a la papelera. */
  async deleteImage(id) {
    this.images = this.images.filter((img) => img.id !== id);
    await api.post(`images/${id}/delete`);
  },

  // ---------- Textos de escenas ----------

  /** Map idEscena -> HTML de su revisión activa. Solo se pide al servidor el texto de esas revisiones. */
  async sceneTexts() {
    await this.flush();
    const activeOf = new Map(); // idEscena -> idRevisión en uso
    for (const scene of this.list('scene')) {
      const revs = this.list('revision', scene.id);
      const active = revs.find((r) => r.id === scene.data.activeRevision) || revs[revs.length - 1];
      if (active) activeOf.set(scene.id, active.id);
    }
    const byId = new Map();
    if (activeOf.size) {
      const bodies = await api.post(`projects/${this.project.id}/bodies`, { ids: [...activeOf.values()] });
      for (const b of bodies) {
        byId.set(b.id, b.body || '');
        // Se acaba de leer el texto: cualquier cambio posterior se hace sobre esta versión.
        const base = synced.get(b.id);
        if (base && b.body_seq != null) base.bodySeq = b.body_seq;
      }
    }
    const out = new Map();
    for (const scene of this.list('scene')) out.set(scene.id, byId.get(activeOf.get(scene.id)) || '');
    return out;
  },

  // ---------- Histórico de palabras ----------

  logWordsSoon() {
    clearTimeout(wordTimer);
    wordTimer = setTimeout(() => this.logWords(), 4000);
  },

  async logWords() {
    clearTimeout(wordTimer);
    wordTimer = null;
    if (!this.project) return;
    const day = today();
    const total = this.totalWords();
    let entry = this.wordlog.find((w) => w.day === day);
    if (!entry) {
      const previous = this.wordlog.filter((w) => w.day < day).sort((a, b) => (a.day < b.day ? 1 : -1))[0];
      entry = { day, start: previous ? previous.total : this.openTotal, total };
      this.wordlog.push(entry);
    } else if (entry.total === total) {
      return;
    } else {
      entry.total = total;
    }
    try {
      await api.post(`projects/${this.project.id}/wordlog`, { day, total, start: entry.start });
    } catch (e) {
      // El histórico es secundario: un fallo aquí no debe interrumpir la escritura.
    }
  },

  /** Palabras escritas (netas) en un día 'AAAA-MM-DD'. */
  wordsOn(day) {
    const entry = this.wordlog.find((w) => w.day === day);
    return entry ? Math.max(0, entry.total - entry.start) : 0;
  },
};
