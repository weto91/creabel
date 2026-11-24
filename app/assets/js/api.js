// Cliente de la API. Todas las llamadas pasan por aquí.
// En la aplicación (Windows y Android) quien responde es el motor local (local/engine.js), que
// guarda en SQLite y en el disco del dispositivo. En un navegador, con ?mock en la URL, el mismo
// motor guarda en el almacenamiento del navegador (solo para probar la interfaz). Sin ninguna de
// las dos cosas, se habla con el servidor PHP de la web.
//
// En Windows puede haber varias ventanas abiertas: solo la principal tiene el motor; las demás
// le mandan cada llamada y esperan su respuesta (windows.js), como si fuera un servidor.
import { isApp, isSecondaryWindow } from './platform.js';

const BASE = 'api/index.php';
let local = null;
let remote = null; // en una ventana secundaria: { call(method, route, body, query), imageBlob(img) }
let afterWrite = null; // en la principal: aviso a las demás ventanas de que algo ha cambiado

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message || code);
    this.code = code;
    this.status = status || 0;
  }
}

export async function initApi() {
  if (isSecondaryWindow) {
    remote = (await import('./windows.js')).remoteEngine();
    return;
  }
  if (!isApp && !new URLSearchParams(location.search).has('mock')) return;
  const { createEngine } = await import('./local/engine.js');
  // La página de pruebas del navegador imita Tauri, pero guarda como el modo de prueba.
  const real = isApp && !window.__CREABEL_TEST__;
  const adapter = real
    ? (await import('./local/adapter-tauri.js')).tauriAdapter()
    : (await import('./local/adapter-browser.js')).browserAdapter({ autoAuth: isApp });
  local = createEngine({ adapter });
  await local.ready;
}

/** El motor local (en la aplicación o el modo de prueba), o null si se usa el servidor. */
export const localEngine = () => local;

/** En la ventana principal: a quién avisar después de cada cambio (lo pone windows.js). */
export function onLocalWrite(fn) {
  afterWrite = fn;
}

async function call(method, route, body, query) {
  if (remote) {
    try {
      return await remote.call(method, route, body, query || {});
    } catch (err) {
      if (err && err.code) throw new ApiError(err.code, err.message, err.status);
      throw err;
    }
  }
  if (local) {
    try {
      const out = await local.handle(method, route, body, query || {});
      if (method === 'POST' && afterWrite) afterWrite(route);
      return out;
    } catch (err) {
      if (err && err.code) throw new ApiError(err.code, err.message, err.status);
      throw err;
    }
  }
  const qs = new URLSearchParams({ r: route, ...(query || {}) });
  const opts = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
  if (method === 'POST') {
    opts.headers['X-Creabel'] = '1';
    if (body instanceof FormData) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body == null ? {} : body);
    }
  }
  let res;
  try {
    res = await fetch(`${BASE}?${qs}`, opts);
  } catch (err) {
    throw new ApiError('network', 'No se puede contactar con el servidor', 0);
  }
  let json = null;
  try {
    json = await res.json();
  } catch (err) {
    json = null;
  }
  if (!json || !json.ok) {
    const e = (json && json.error) || {};
    if (res.status === 401 && e.code === 'unauthorized') {
      window.dispatchEvent(new CustomEvent('creabel:unauthorized'));
    }
    throw new ApiError(e.code || 'http_' + res.status, e.message || `Error ${res.status}`, res.status);
  }
  return json.data;
}

export const api = {
  get: (route, query) => call('GET', route, null, query),
  post: (route, body) => call('POST', route, body),
  isMock: () => !!(local || remote),
  imageUrl(img) {
    if (!img) return '';
    return img.url || `${BASE}?r=${encodeURIComponent('images/' + img.id)}`;
  },
  async imageBlob(img) {
    if (remote) return remote.imageBlob(img);
    if (local) return local.imageBlob(img);
    const res = await fetch(this.imageUrl(img), { credentials: 'same-origin' });
    if (!res.ok) throw new ApiError('image', 'No se puede leer la imagen', res.status);
    return res.blob();
  },
};
