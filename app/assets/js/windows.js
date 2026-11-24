// Varias ventanas en Windows: cualquier página de Creabel se puede abrir en otra ventana (clic
// derecho en un enlace → «Abrir en una ventana nueva», Ctrl+clic, clic con la rueda o el botón
// de la cabecera) para tener a la vista una ficha, la línea temporal o unas notas mientras se
// escribe en otra.
//
// Solo la ventana principal («main») tiene el motor de datos (local/engine.js): es la que guarda
// en el disco y la que sincroniza. Las demás le mandan cada llamada de la API por un evento de
// Tauri y esperan la respuesta, igual que una pestaña del navegador hablaba con el servidor de
// la web. Después de cada cambio, la principal avisa a todas («creabel:changed») y cada una se
// pone al día con store.sync(), como con los cambios que llegan de otro dispositivo.
//
// Al cerrar la principal, antes se pide a las demás que guarden lo pendiente; después Rust las
// cierra (src-tauri/src/windows.rs).
import { tauri, invoke, isDesktopApp, isSecondaryWindow, windowLabel } from './platform.js';
import { localEngine, onLocalWrite } from './api.js';
import { store } from './store.js';
import { loadPrefs, getPrefs } from './prefs.js';
import { t, loadLang, setLang, getLang } from './i18n.js';
import { h, icon } from './dom.js';
import { btn, toast, errorText } from './ui.js';

const REQUEST = 'creabel:api';
const REPLY = 'creabel:api-reply';
const CHANGED = 'creabel:changed';
const HELLO = 'creabel:hello';
const BYE = 'creabel:bye';
const FLUSH = 'creabel:flush';
const FLUSHED = 'creabel:flushed';
const TIMEOUT = 30000;

const events = () => (tauri() && tauri().event) || null;

// ---------- Archivos dentro de un evento (los eventos solo llevan JSON) ----------

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64(b64) {
  const s = atob(b64 || '');
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

/** Un FormData (subir una imagen) se manda como lista de pares, con los archivos en base64. */
async function encodeBody(body) {
  if (typeof FormData === 'undefined' || !(body instanceof FormData)) return body == null ? null : body;
  const form = [];
  for (const [key, value] of body.entries()) {
    if (value instanceof Blob) {
      form.push([key, { file: { name: value.name || '', type: value.type || '', b64: toBase64(new Uint8Array(await value.arrayBuffer())) } }]);
    } else {
      form.push([key, String(value)]);
    }
  }
  return { __form: form };
}

function decodeBody(body) {
  if (!body || !Array.isArray(body.__form)) return body;
  const fd = new FormData();
  for (const [key, value] of body.__form) {
    if (value && value.file) fd.append(key, new File([fromBase64(value.file.b64)], value.file.name, { type: value.file.type }));
    else fd.append(key, value);
  }
  return fd;
}

// ---------- Ventana secundaria: la API, a través de la principal ----------

/** Lo que usa api.js en una ventana secundaria en vez del motor. */
export function remoteEngine() {
  const pending = new Map();
  let next = 0;
  const ready = events().listen(REPLY, (e) => {
    const p = e.payload || {};
    if (p.to !== windowLabel) return;
    const job = pending.get(p.id);
    if (!job) return;
    pending.delete(p.id);
    clearTimeout(job.timer);
    if (p.ok) job.resolve(p.data);
    else job.reject(Object.assign(new Error((p.error && p.error.message) || 'error'), p.error || {}));
  });
  const request = async (payload) => {
    await ready;
    const id = `${windowLabel}:${++next}`;
    return new Promise((resolve, reject) => {
      const fail = () => {
        pending.delete(id);
        reject(Object.assign(new Error('main window'), { code: 'main_window', status: 0 }));
      };
      const timer = setTimeout(fail, TIMEOUT);
      pending.set(id, { resolve, reject, timer });
      events().emitTo('main', REQUEST, { ...payload, id, from: windowLabel }).catch(() => { clearTimeout(timer); fail(); });
    });
  };
  return {
    async call(method, route, body, query) {
      return request({ method, route, body: await encodeBody(body), query: query || {} });
    },
    async imageBlob(img) {
      const out = await request({ method: 'BLOB', route: '', body: { id: img.id }, query: {} });
      return new Blob([fromBase64(out.b64)], { type: out.type || '' });
    },
  };
}

// ---------- Ventana principal: responde a las demás ----------

const others = new Set(); // ventanas secundarias abiertas
let changes = new Map(); // quién ha cambiado algo -> ¿han cambiado los ajustes?
let changeTimer = null;

/** Tras un cambio, avisa a las ventanas (agrupando los que llegan seguidos). */
function announce(route, from) {
  if (!others.size) return;
  changes.set(from, changes.get(from) || route === 'settings');
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => {
    const batch = changes;
    changes = new Map();
    for (const [writer, prefs] of batch) events().emit(CHANGED, { from: writer, prefs }).catch(() => {});
  }, 150);
}

async function serve() {
  const engine = localEngine();
  if (!engine) return;
  await events().listen(REQUEST, async (e) => {
    const p = e.payload || {};
    if (!p.from || p.from === windowLabel) return;
    others.add(p.from);
    let reply;
    try {
      let data;
      if (p.method === 'BLOB') {
        const blob = await engine.imageBlob({ id: p.body && p.body.id });
        data = { type: blob.type, b64: toBase64(new Uint8Array(await blob.arrayBuffer())) };
      } else {
        data = await engine.handle(p.method, p.route, decodeBody(p.body), p.query || {});
        if (p.method === 'POST') announce(p.route, p.from);
      }
      reply = { ok: true, data };
    } catch (err) {
      reply = { ok: false, error: { code: (err && err.code) || 'error', message: (err && err.message) || String(err), status: (err && err.status) || 0 } };
    }
    events().emitTo(p.from, REPLY, { ...reply, id: p.id, to: p.from }).catch((err) => console.error(err));
  });
  await events().listen(HELLO, (e) => { if (e.payload && e.payload.from) others.add(e.payload.from); });
  await events().listen(BYE, (e) => { if (e.payload && e.payload.from) others.delete(e.payload.from); });
  onLocalWrite((route) => announce(route, windowLabel));
}

/**
 * Antes de cerrar la principal: las demás guardan lo pendiente (a través de ella). Espera a
 * que respondan todas o, como mucho, unos segundos.
 */
export async function flushOtherWindows() {
  if (!isDesktopApp || isSecondaryWindow || !others.size || !events()) return;
  const waiting = new Set(others);
  let unlisten = null;
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 4000);
    const done = (label) => {
      waiting.delete(label);
      if (!waiting.size) { clearTimeout(timer); resolve(); }
    };
    events().listen(FLUSHED, (e) => done(e.payload && e.payload.from)).then((fn) => {
      unlisten = fn;
      for (const label of [...waiting]) events().emitTo(label, FLUSH, {}).catch(() => done(label));
    }).catch(() => { clearTimeout(timer); resolve(); });
  });
  if (unlisten) unlisten();
}

// ---------- En todas las ventanas ----------

/** Abre una página de Creabel («#/p/…») en una ventana nueva. */
export async function openWindow(hash) {
  try {
    await store.flush();
    await invoke('open_window', { route: String(hash || location.hash || '#/') });
  } catch (err) {
    toast(t('window.failed') + ' ' + errorText(err), 'error');
  }
}

const internalLink = (target) => {
  const a = target && target.closest ? target.closest('a[href^="#/"]') : null;
  return a && !a.isContentEditable ? a : null;
};

/** Clic derecho en un enlace de la aplicación: «Abrir en una ventana nueva». */
function installLinkMenu() {
  let menu = null;
  const close = () => {
    if (!menu) return;
    menu.remove();
    menu = null;
  };
  document.addEventListener('contextmenu', (e) => {
    close();
    const a = internalLink(e.target);
    if (!a || e.defaultPrevented) return; // fuera de un enlace, el menú del sistema (corrector…)
    e.preventDefault();
    const href = a.getAttribute('href');
    const item = h('button.menu-item', { type: 'button', role: 'menuitem', onclick: () => { close(); openWindow(href); } },
      icon('new-window', 15), h('span', t('window.open')));
    menu = h('div.menu-pop.ctx-menu', { role: 'menu' }, item);
    document.body.append(menu);
    const x = Math.min(e.clientX, window.innerWidth - menu.offsetWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 8);
    menu.style.left = Math.max(8, x) + 'px';
    menu.style.top = Math.max(8, y) + 'px';
    item.focus({ preventScroll: true });
  });
  document.addEventListener('mousedown', (e) => { if (menu && !menu.contains(e.target)) close(); }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('blur', close);
  window.addEventListener('resize', close);
  window.addEventListener('hashchange', close);
  document.addEventListener('scroll', close, true);

  // Ctrl+clic y clic con la rueda en un enlace: directamente en una ventana nueva.
  document.addEventListener('click', (e) => {
    if (e.button !== 0 || !(e.ctrlKey || e.metaKey)) return;
    const a = internalLink(e.target);
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    openWindow(a.getAttribute('href'));
  }, true);
  document.addEventListener('mousedown', (e) => { if (e.button === 1 && internalLink(e.target)) e.preventDefault(); });
  document.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return;
    const a = internalLink(e.target);
    if (!a) return;
    e.preventDefault();
    openWindow(a.getAttribute('href'));
  });
}

/** En la cabecera de cada página, un botón que la abre en otra ventana. */
export function attachWindowButton(el) {
  if (!isDesktopApp) return;
  const actions = el.querySelector('.page-header .page-actions');
  if (!actions || actions.querySelector('.window-btn')) return;
  const b = btn('', { icon: 'new-window', kind: 'ghost', title: t('window.openThis'), onClick: () => openWindow(location.hash) });
  b.classList.add('window-btn');
  actions.prepend(b);
}

/** El título de la ventana dice qué página tiene (para distinguirlas en la barra de tareas). */
export function updateWindowTitle(el) {
  if (!isDesktopApp) return;
  const tw = tauri() && tauri().window;
  const win = tw && tw.getCurrentWindow ? tw.getCurrentWindow() : null;
  if (!win || !win.setTitle) return;
  const titles = el && el.querySelector('.page-header-titles');
  const input = titles && titles.querySelector('input');
  const heading = titles && titles.querySelector('h1');
  const page = ((input && input.value) || (heading && heading.textContent) || '').trim();
  const project = store.project ? (store.project.name || '').trim() : '';
  const parts = [page, project && project !== page ? project : '', 'Creabel'].filter(Boolean);
  win.setTitle(parts.join(' — ')).catch(() => {});
}

/**
 * Pone en marcha lo de las ventanas. `refresh` vuelve a pintar la página (cuando otra ventana
 * cambia el idioma o el tema).
 */
export async function initWindows({ refresh }) {
  if (!isDesktopApp || !events()) return;
  installLinkMenu();
  if (!isSecondaryWindow) await serve();

  let syncTimer = null;
  await events().listen(CHANGED, async (e) => {
    const p = e.payload || {};
    if (p.from === windowLabel) return;
    if (p.prefs) {
      // Otra ventana ha cambiado los ajustes (tema, idioma…): aquí también.
      await loadPrefs();
      const lang = await loadLang(getPrefs().lang);
      if (lang !== getLang()) { setLang(lang); refresh(); }
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => store.sync(), 120);
  });

  if (isSecondaryWindow) {
    await events().listen(FLUSH, async () => {
      try { await store.flush(); } catch (err) { console.error(err); }
      events().emitTo('main', FLUSHED, { from: windowLabel }).catch(() => {});
    });
    events().emitTo('main', HELLO, { from: windowLabel }).catch(() => {});
  }
}

/** Al cerrar una ventana secundaria: la principal deja de contar con ella. */
export function sayGoodbye() {
  if (isSecondaryWindow && events()) events().emitTo('main', BYE, { from: windowLabel }).catch(() => {});
}

/** Ruta con la que se abrió esta ventana (la pone Rust al crearla). */
export function initialRoute() {
  return isSecondaryWindow && typeof window.__CREABEL_ROUTE__ === 'string' ? window.__CREABEL_ROUTE__ : '';
}
