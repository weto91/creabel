// Actualizaciones de la aplicación de Windows. Al arrancar (y luego cada seis horas) se mira si
// hay una versión nueva publicada en GitHub (latest.json de la última versión del repositorio
// público); si la hay, sale un aviso discreto abajo a la derecha con «Novedades» y «Actualizar».
// Al actualizar se descarga el instalador, Tauri comprueba su firma y lo abre: la aplicación
// se cierra y vuelve a abrirse ya actualizada. La versión de Microsoft Store y la de Android se
// actualizan desde su tienda: en ellas no se busca nada.
import { h } from './dom.js';
import { t } from './i18n.js';
import { store } from './store.js';
import { btn, modal, toast, errorText } from './ui.js';
import { tauri, invoke, isDesktopApp, isStoreApp } from './platform.js';

/** Esta instalación se actualiza a sí misma (la de Windows descargada de GitHub). */
export const selfUpdates = isDesktopApp && !isStoreApp;

const EVERY = 6 * 3600 * 1000;
const FIRST = 8000; // al arrancar, se espera un poco para no competir con la carga del proyecto

/**
 * Pregunta si hay versión nueva. Devuelve { version, body, date, downloadAndInstall(onEvent) }
 * o null. Usa el complemento de Tauri desde window.__TAURI__.updater y, si no está ahí,
 * sus órdenes directamente.
 */
async function checkRaw() {
  const tr = tauri();
  if (tr && tr.updater && tr.updater.check) return tr.updater.check();
  const meta = await invoke('plugin:updater|check', {});
  if (!meta) return null;
  return {
    version: meta.version, currentVersion: meta.currentVersion, body: meta.body, date: meta.date,
    downloadAndInstall: (onEvent) => {
      const channel = new tr.core.Channel();
      if (onEvent) channel.onmessage = onEvent;
      return invoke('plugin:updater|download_and_install', { rid: meta.rid, onEvent: channel });
    },
  };
}

/** Busca una actualización. Con `quiet` los errores (sin conexión…) no se enseñan. */
export async function checkForUpdate({ quiet = true } = {}) {
  if (!selfUpdates) return null;
  try {
    return await checkRaw();
  } catch (err) {
    console.warn('Creabel: no se ha podido buscar actualizaciones', err);
    if (!quiet) toast(t('update.failed') + ' ' + errorText(err), 'error', 8000);
    return null;
  }
}

/** Descarga e instala la versión nueva. La aplicación se cierra al abrirse el instalador. */
export async function installUpdate(update) {
  try {
    await store.flush();
  } catch (err) {
    // Lo pendiente se intenta guardar; si falla, se avisa y no se actualiza.
    toast(errorText(err), 'error', 8000);
    return;
  }
  let total = 0;
  let done = 0;
  const note = h('span', t('update.downloading', { pct: 0 }));
  const bar = document.querySelector('.update-banner');
  if (bar) bar.replaceChildren(note);
  try {
    await update.downloadAndInstall((event) => {
      if (!event) return;
      if (event.event === 'Started') total = (event.data && event.data.contentLength) || 0;
      if (event.event === 'Progress') {
        done += (event.data && event.data.chunkLength) || 0;
        if (total) note.textContent = t('update.downloading', { pct: Math.min(100, Math.round((done / total) * 100)) });
      }
      if (event.event === 'Finished') note.textContent = t('update.installing');
    });
  } catch (err) {
    if (bar) bar.remove();
    toast(t('update.failed') + ' ' + errorText(err), 'error', 8000);
  }
}

/**
 * Las notas de la versión vienen de CHANGELOG.md, en Markdown sencillo: «### Título» y
 * «- elemento». Se pintan como títulos y listas; el resto, como párrafos.
 */
function notesNode(text) {
  const box = h('div.update-notes');
  let list = null;
  for (const raw of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { list = null; continue; }
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (item) {
      if (!list) { list = h('ul'); box.append(list); }
      list.append(h('li', item[1]));
      continue;
    }
    list = null;
    const head = /^#{1,6}\s+(.*)$/.exec(line);
    box.append(head ? h('h4', head[1]) : h('p', line));
  }
  if (!box.childNodes.length) box.append(h('p.muted', t('update.noNotes')));
  return box;
}

function showNotes(update) {
  const m = modal({
    title: t('update.notesTitle', { v: update.version }),
    body: notesNode(update.body),
    actions: [btn(t('common.close'), { onClick: () => m.close() }), btn(t('update.install'), { kind: 'primary', icon: 'download', onClick: () => { m.close(); installUpdate(update); } })],
  });
}

/** El aviso: una franja abajo a la derecha que no interrumpe y se puede cerrar. */
export function showUpdateBanner(update) {
  const old = document.querySelector('.update-banner');
  if (old) old.remove();
  const bar = h('div.update-banner', { role: 'status' },
    h('span.update-text', t('update.available', { v: update.version })),
    btn(t('update.notes'), { kind: 'ghost', small: true, onClick: () => showNotes(update) }),
    btn(t('update.install'), { kind: 'primary', small: true, icon: 'download', onClick: () => installUpdate(update) }),
    btn('', { kind: 'ghost', small: true, icon: 'x', title: t('common.close'), onClick: () => bar.remove() }));
  document.body.append(bar);
}

/** Comprobaciones automáticas (solo en la aplicación de Windows descargada de GitHub). */
export function startUpdateChecks() {
  if (!selfUpdates) return;
  const run = async () => {
    const update = await checkForUpdate();
    if (update) showUpdateBanner(update);
  };
  setTimeout(run, FIRST);
  setInterval(run, EVERY);
}
