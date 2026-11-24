// Dónde corre Creabel: en un navegador (la web antigua del NAS o el modo de prueba) o dentro de
// la aplicación de Windows o Android (Tauri). En la aplicación, Tauri pone su API en
// window.__TAURI__ (app.withGlobalTauri en src-tauri/tauri.conf.json).

const w = typeof window !== 'undefined' ? window : {};

/** La API nativa de Tauri, o null en un navegador. */
export const tauri = () => w.__TAURI__ || null;

/** Dentro de la aplicación (Windows o Android). */
export const isApp = !!(w.__TAURI__ || w.__TAURI_INTERNALS__);
export const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
/** La aplicación de escritorio (Windows). */
export const isDesktopApp = isApp && !isAndroid;
/**
 * La versión de Microsoft Store (paquete MSIX, ver src-tauri/src/tienda.rs): la actualiza la
 * tienda. La de GitHub busca y aplica las actualizaciones por sí misma.
 */
export const isStoreApp = isDesktopApp && w.__CREABEL_STORE__ === true;

/** Nombre interno de esta ventana de la aplicación: «main» es la principal. */
export const windowLabel = (() => {
  try {
    const t = w.__TAURI__;
    if (t && t.window && t.window.getCurrentWindow) return t.window.getCurrentWindow().label || 'main';
    const meta = w.__TAURI_INTERNALS__ && w.__TAURI_INTERNALS__.metadata;
    return (meta && meta.currentWindow && meta.currentWindow.label) || 'main';
  } catch (err) {
    return 'main';
  }
})();

/**
 * En Windows se puede abrir cualquier página en otra ventana. La principal es la que guarda
 * los datos (y sincroniza); las demás le piden lo que necesitan (ver windows.js).
 */
export const isSecondaryWindow = isDesktopApp && windowLabel !== 'main';

/**
 * Pantalla estrecha (móvil, tableta en vertical, ventana pequeña): barra inferior en vez del
 * menú lateral, y Ajustes como lista de apartados. El mismo límite que en app.css (820 px).
 */
export const NARROW_QUERY = '(max-width: 820px)';
export const isNarrow = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(NARROW_QUERY).matches;

/** Llama a una orden de un complemento de Tauri (por ejemplo 'plugin:app|version'). */
export async function invoke(command, args) {
  const t = tauri();
  if (!t || !t.core || !t.core.invoke) throw new Error('tauri-unavailable');
  return t.core.invoke(command, args);
}

/** Versión instalada de la aplicación («0.1.0»), o '' si no se puede saber. */
export async function appVersion() {
  const t = tauri();
  try {
    if (t && t.app && t.app.getVersion) return await t.app.getVersion();
    return await invoke('plugin:app|version');
  } catch (err) {
    return '';
  }
}

/** Abre una dirección web o de correo en el navegador o el programa del sistema. */
export async function openExternal(url) {
  const t = tauri();
  if (t && t.opener && t.opener.openUrl) return t.opener.openUrl(url);
  if (isApp) return invoke('plugin:opener|open_url', { url });
  window.open(url, '_blank', 'noopener');
  return undefined;
}

/**
 * En la aplicación, los enlaces a otras webs (los de «Acerca de», la guía…) se abren en el
 * navegador del sistema: dentro de la ventana de Creabel no hay barra para volver.
 */
export function routeExternalLinks() {
  if (!isApp) return;
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!/^(https?:|mailto:)/i.test(href)) return;
    e.preventDefault();
    openExternal(href).catch((err) => console.error(err));
  });
}
