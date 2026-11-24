// Destinos de sincronización. Todos ofrecen lo mismo, con rutas relativas a su raíz:
//   list(dir)        → [{ name, dir }]  ([] si la carpeta no existe)
//   get(path)        → Uint8Array, o null si no existe
//   put(path, bytes) → crea las carpetas que falten
//   del(path)
//   check()          → comprueba que se puede leer y escribir (para «Probar conexión»)
import { tauri } from '../platform.js';

const dec = new TextDecoder();

function httpError(status, what) {
  const err = new Error(`${what}: ${status}`);
  err.code = status === 401 || status === 403 ? 'sync_auth' : 'sync_http';
  err.status = status;
  return err;
}

const b64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
};

/**
 * WebDAV (también el PC emparejado, que habla lo mismo). `fetchImpl` es el fetch de Tauri (sin
 * las restricciones del navegador) o uno simulado en las pruebas. `insecure` acepta
 * certificados no válidos: solo si el usuario lo ha elegido.
 */
export function webdavTransport({ url, user = '', password = '', token = '', root = '', insecure = false, fetchImpl }) {
  const doFetch = fetchImpl || (tauri() && tauri().http && tauri().http.fetch);
  if (!doFetch) throw Object.assign(new Error('Sin cliente HTTP'), { code: 'sync_unavailable' });
  const segments = String(root || '').split('/').map((s) => s.trim()).filter(Boolean);
  const server = String(url || '').trim().replace(/\/+$/, '');
  const base = server + '/' + segments.map(encodeURIComponent).join('/') + (segments.length ? '/' : '');
  const auth = token ? { Authorization: 'Bearer ' + token } : user ? { Authorization: 'Basic ' + b64(user + ':' + password) } : {};
  const made = new Set();

  const enc = (path) => path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
  async function request(method, path, { body, headers = {}, dir = false, absolute = '' } = {}) {
    const target = absolute || base + enc(path) + (dir && path ? '/' : '');
    try {
      return await doFetch(target, {
        method, body, headers: { ...auth, ...headers },
        connectTimeout: 15000,
        ...(insecure ? { danger: { acceptInvalidCerts: true, acceptInvalidHostnames: false } } : {}),
      });
    } catch (err) {
      // La causa real (sin respuesta, rechazada por el equipo, no permitida…), para enseñarla.
      const detail = String((err && (err.message || err)) || '').trim();
      const e = new Error(detail || 'sin respuesta');
      e.code = 'sync_network';
      e.detail = `${target.split('/').slice(0, 3).join('/')}: ${detail || 'sin respuesta'}`;
      throw e;
    }
  }

  async function mkdirs(path) {
    const parts = path.split('/').filter(Boolean);
    const all = [''];
    for (let i = 1; i <= parts.length; i++) all.push(parts.slice(0, i).join('/'));
    for (const dir of all) {
      if (made.has(dir)) continue;
      if (dir === '') {
        // La carpeta propia, nivel a nivel («Mis novelas/creabel»); la dirección del servidor ya existe.
        for (let i = 1; i <= segments.length; i++) {
          const res = await request('MKCOL', '', { absolute: server + '/' + segments.slice(0, i).map(encodeURIComponent).join('/') + '/' });
          if (!(res.status === 201 || res.status === 405 || res.status === 301 || res.status === 200)) throw httpError(res.status, 'MKCOL ' + segments.slice(0, i).join('/'));
        }
        made.add(dir);
        continue;
      }
      const res = await request('MKCOL', dir, { dir: true });
      // 201 creada; 405 o 301 ya existía.
      if (!(res.status === 201 || res.status === 405 || res.status === 301 || res.status === 200)) throw httpError(res.status, 'MKCOL ' + dir);
      made.add(dir);
    }
  }

  return {
    async list(dir) {
      const res = await request('PROPFIND', dir, {
        dir: true, headers: { Depth: '1', 'Content-Type': 'application/xml; charset=utf-8' },
        body: '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:resourcetype/></d:prop></d:propfind>',
      });
      if (res.status === 404) return [];
      if (res.status !== 207 && res.status !== 200) throw httpError(res.status, 'PROPFIND ' + dir);
      const xml = new DOMParser().parseFromString(await res.text(), 'application/xml');
      const out = [];
      const own = decodeURIComponent(new URL(base + enc(dir) + '/', 'http://x/').pathname).replace(/\/+$/, '');
      for (const r of xml.getElementsByTagNameNS('DAV:', 'response')) {
        const href = (r.getElementsByTagNameNS('DAV:', 'href')[0] || {}).textContent || '';
        let path;
        try { path = decodeURIComponent(new URL(href, base).pathname).replace(/\/+$/, ''); } catch (err) { continue; }
        if (!path || path === own) continue;
        const name = path.split('/').pop();
        const isDir = r.getElementsByTagNameNS('DAV:', 'collection').length > 0;
        if (name) out.push({ name, dir: isDir });
      }
      return out;
    },
    async get(path) {
      const res = await request('GET', path);
      if (res.status === 404) return null;
      if (!res.ok) throw httpError(res.status, 'GET ' + path);
      return new Uint8Array(await res.arrayBuffer());
    },
    async put(path, bytes) {
      const parent = path.split('/').slice(0, -1).join('/');
      await mkdirs(parent);
      const res = await request('PUT', path, { body: bytes, headers: { 'Content-Type': 'application/octet-stream' } });
      if (!(res.status >= 200 && res.status < 300)) throw httpError(res.status, 'PUT ' + path);
    },
    async del(path) {
      const res = await request('DELETE', path);
      if (!(res.ok || res.status === 404)) throw httpError(res.status, 'DELETE ' + path);
    },
    async check() {
      await mkdirs('proyectos');
      const probe = `proyectos/.prueba-${Date.now()}.txt`;
      await this.put(probe, new TextEncoder().encode('creabel'));
      const back = await this.get(probe);
      await this.del(probe);
      if (!back || dec.decode(back) !== 'creabel') throw Object.assign(new Error('No se ha podido leer lo escrito'), { code: 'sync_http' });
      return true;
    },
  };
}

/**
 * Carpeta de los datos de la aplicación (en el PC, la que comparte con el móvil emparejado).
 * `root` es relativa a la carpeta de datos de la aplicación.
 */
export function folderTransport(root) {
  const T = tauri();
  const fs = T && T.fs;
  if (!fs) throw Object.assign(new Error('Sin acceso a los archivos'), { code: 'sync_unavailable' });
  const baseDir = fs.BaseDirectory.AppLocalData;
  const full = (path) => [root, ...path.split('/').filter(Boolean)].join('/');
  return {
    async list(dir) {
      try {
        return (await fs.readDir(full(dir), { baseDir })).map((e) => ({ name: e.name, dir: !!e.isDirectory }));
      } catch (err) {
        return [];
      }
    },
    async get(path) {
      try { return await fs.readFile(full(path), { baseDir }); } catch (err) { return null; }
    },
    async put(path, bytes) {
      const parent = full(path).split('/').slice(0, -1).join('/');
      await fs.mkdir(parent, { baseDir, recursive: true });
      await fs.writeFile(full(path), bytes, { baseDir });
    },
    async del(path) {
      try { await fs.remove(full(path), { baseDir, recursive: true }); } catch (err) { /* ya no estaba */ }
    },
    async check() { await fs.mkdir(full('proyectos'), { baseDir, recursive: true }); return true; },
  };
}

/** Destino en memoria, para las pruebas (un «servidor» compartido entre motores de prueba). */
export function memoryTransport(store = new Map()) {
  const norm = (p) => p.split('/').filter(Boolean).join('/');
  return {
    store,
    async list(dir) {
      const prefix = norm(dir) ? norm(dir) + '/' : '';
      const names = new Map();
      for (const key of store.keys()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length).split('/');
        names.set(rest[0], rest.length > 1);
      }
      return [...names].map(([name, dir]) => ({ name, dir }));
    },
    async get(path) { const v = store.get(norm(path)); return v ? new Uint8Array(v) : null; },
    async put(path, bytes) { store.set(norm(path), new Uint8Array(bytes)); },
    async del(path) { for (const key of [...store.keys()]) if (key === norm(path) || key.startsWith(norm(path) + '/')) store.delete(key); },
    async check() { return true; },
  };
}
