// Adaptadores del motor local para el navegador:
//  - browserAdapter: el modo de prueba (?mock). Guarda en localStorage, que admite unos 5 MB:
//    solo sirve para probar la interfaz. Si no cabe, avisa (no pierde nada en silencio).
//  - memoryAdapter: sin guardar nada; para las pruebas automáticas (varios «dispositivos» en la
//    misma página).

const LEGACY_KEY = 'creabel.mock';
const KEY = 'creabel.local';

function storageFull() {
  const err = new Error('No queda espacio en el almacenamiento local');
  err.status = 507;
  err.code = 'storage_full';
  return err;
}

const toDataUrl = (bytes, mime = 'application/octet-stream') => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return `data:${mime};base64,${btoa(s)}`;
};
const mimeOf = (name) => ({ png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf' })[name.split('.').pop()] || 'application/octet-stream';

/** Archivos en memoria (y, si se pasa `save`, guardados con el resto). */
function memoryFiles(initial = {}, onChange = null) {
  const files = new Map(Object.entries(initial));
  return {
    map: files,
    has: async (name) => files.has(name),
    save: async (name, bytes) => { files.set(name, toDataUrl(bytes, mimeOf(name))); if (onChange) onChange(); },
    read: async (name) => {
      const url = files.get(name);
      if (!url) throw new Error('missing');
      return new Uint8Array(await (await fetch(url)).arrayBuffer());
    },
    remove: async (name) => { files.delete(name); if (onChange) onChange(); },
    url: (name) => files.get(name) || '',
    list: async () => [...files.keys()],
  };
}

export function browserAdapter({ autoAuth = false } = {}) {
  let state = { kv: {}, rows: {}, files: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.rows) state = saved;
  } catch (err) { /* estado ilegible: se empieza de cero */ }
  const write = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { throw storageFull(); }
  };
  const files = memoryFiles(state.files, () => { state.files = Object.fromEntries(files.map); });
  return {
    autoAuth,
    load: async () => ({ kv: state.kv, rows: Object.entries(state.rows).map(([key, json]) => ({ tbl: key.split(':')[0], json })) }),
    commit: async ({ upserts, deletes, kv }) => {
      for (const u of upserts) state.rows[u.tbl + ':' + u.id] = u.json;
      for (const d of deletes) delete state.rows[d.tbl + ':' + d.id];
      Object.assign(state.kv, kv);
      write();
    },
    files,
    legacy: async () => {
      try { return JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch (err) { return null; }
    },
  };
}

export function memoryAdapter() {
  const rows = new Map();
  const kvs = {};
  return {
    autoAuth: true,
    load: async () => ({ kv: { ...kvs }, rows: [...rows.entries()].map(([key, json]) => ({ tbl: key.split(':')[0], json })) }),
    commit: async ({ upserts, deletes, kv }) => {
      for (const u of upserts) rows.set(u.tbl + ':' + u.id, u.json);
      for (const d of deletes) rows.delete(d.tbl + ':' + d.id);
      Object.assign(kvs, kv);
    },
    files: memoryFiles(),
    _rows: rows,
  };
}
