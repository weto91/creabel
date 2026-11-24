// Arranque de Creabel: sesión, preferencias y tabla de rutas.
import { initApi, api } from './api.js';
import { isApp, isSecondaryWindow, tauri, appVersion, routeExternalLinks } from './platform.js';
import { initWindows, flushOtherWindows, sayGoodbye, initialRoute } from './windows.js';
import { startUpdateChecks } from './update.js';
import { startAutoSync } from './local/syncer.js';
import { setLang, loadLang } from './i18n.js';
import { initLocalPrefs, loadPrefs, getPrefs } from './prefs.js';
import { store } from './store.js';
import { session } from './session.js';
import { setRoutes, startRouter, refresh } from './router.js';
import { h } from './dom.js';
import { t } from './i18n.js';
import { btn, toast } from './ui.js';
import { authFlow, loginOverlay, fatalScreen } from './pages/auth.js';
import { projectsPage } from './pages/projects.js';
import { homePage } from './pages/home.js';
import { bookPage } from './pages/book.js';
import { trashPage, projectsTrashPage } from './pages/trash.js';
import { architecturePage, architectureItemPage, architectureReadPage } from './pages/architecture.js';
import { outlinePage } from './pages/outline.js';
import { importPage } from './pages/import.js';
import { guidesPage, guidePage, appGuidePage } from './pages/guides.js';
import { entityListPage, entityDetailPage, charactersPage } from './pages/entities.js';
import { characterPage } from './pages/character.js';
import { locationsPage } from './pages/locations.js';
import { planPage } from './pages/plans.js';
import { customPage } from './pages/custom.js';
import { boardPage } from './pages/board.js';
import { notesPage } from './pages/notes.js';
import { continuityPage } from './pages/continuity.js';
import { chaptersPage, chapterPage, chapterFieldPage } from './pages/chapters.js';
import { scenePage } from './pages/scene.js';
import { readPage } from './pages/read.js';
import { timelinePage } from './pages/timeline.js';
import { analysisPage } from './pages/analysis.js';
import { mapPage } from './pages/relationships.js';
import { relationsPage } from './pages/relations.js';
import { searchPage } from './pages/search.js';
import { exportPage } from './pages/export.js';
import { settingsPage } from './pages/settings.js';
import { libraryPage, referencePage } from './pages/library.js';
import { tasksPage } from './pages/tasks.js';
import { statsPage } from './pages/stats.js';

const ROUTES = [
  ['', projectsPage],
  ['settings', settingsPage],
  ['settings/:section', settingsPage],
  ['trash', projectsTrashPage],
  ['p/:pid', homePage],
  ['p/:pid/book', bookPage],
  ['p/:pid/project', bookPage], // dirección antigua de los ajustes del proyecto
  ['p/:pid/trash', trashPage],
  ['p/:pid/architecture', architecturePage],
  ['p/:pid/architecture/read', architectureReadPage],
  ['p/:pid/architecture/:key', architectureItemPage],
  ['p/:pid/strands/:id', entityDetailPage('strand')],
  ['p/:pid/characters', charactersPage],
  ['p/:pid/characters/:id', characterPage],
  ['p/:pid/locations', locationsPage],
  ['p/:pid/locations/:id', entityDetailPage('location')],
  ['p/:pid/plans/:id', planPage],
  ['p/:pid/custom', customPage],
  ['p/:pid/custom/:id', entityDetailPage('custom')],
  ['p/:pid/objects', entityListPage('object')],
  ['p/:pid/objects/:id', entityDetailPage('object')],
  ['p/:pid/groups', entityListPage('group')],
  ['p/:pid/groups/:id', entityDetailPage('group')],
  ['p/:pid/notes', notesPage],
  ['p/:pid/notes/:id', entityDetailPage('note')],
  ['p/:pid/dictionary', entityListPage('term')],
  ['p/:pid/dictionary/:id', entityDetailPage('term')],
  ['p/:pid/library', libraryPage],
  ['p/:pid/library/:id', referencePage],
  ['p/:pid/tasks', tasksPage],
  ['p/:pid/stats', statsPage],
  ['p/:pid/relationships', relationsPage],
  ['p/:pid/relationships/:id', mapPage],
  ['p/:pid/chapters', chaptersPage],
  ['p/:pid/chapters/:id', chapterPage],
  ['p/:pid/chapters/:id/:field', chapterFieldPage],
  ['p/:pid/scenes/:id', scenePage],
  ['p/:pid/read', readPage],
  ['p/:pid/timeline', timelinePage],
  ['p/:pid/analysis', analysisPage],
  ['p/:pid/search', searchPage],
  ['p/:pid/export', exportPage],
  ['p/:pid/outline', outlinePage],
  ['p/:pid/board', boardPage],
  ['p/:pid/continuity', continuityPage],
  ['p/:pid/import', importPage],
  ['p/:pid/guides', guidesPage],
  ['p/:pid/guides/:id', guidePage],
  ['p/:pid/guides/app/:id', appGuidePage],
];

/**
 * Qué hacer cuando llegan cambios hechos desde otro dispositivo. El almacén ya los ha
 * incorporado; aquí se decide si hay que repintar lo que está en pantalla:
 * - si el usuario está escribiendo, no se le interrumpe: se le avisa solo si el cambio afecta
 *   a lo que tiene abierto, con un botón para actualizar cuando quiera;
 * - si no, se repinta sin mover la página (en una ficha, solo si el cambio le afecta).
 */
function watchRemoteChanges() {
  let notice = null;
  const hideNotice = () => { if (notice) { notice.remove(); notice = null; } };
  const showNotice = () => {
    if (notice) return;
    notice = h('div.sync-notice', { role: 'status' },
      h('span', t('sync.changed')),
      btn(t('sync.update'), { small: true, kind: 'primary', onClick: () => { hideNotice(); refresh({ keepScroll: true }); } }));
    document.body.append(notice);
  };
  const editing = () => {
    const a = document.activeElement;
    return store.hasPending() || !!document.querySelector('.modal-overlay')
      || (a && a !== document.body && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)));
  };
  /** ¿Afecta el cambio a la ficha abierta? Las listas y los paneles se dan siempre por afectados. */
  const affectsPage = (ids) => {
    const m = location.hash.match(/^#\/p\/[^/]+\/[a-z-]+\/([a-z0-9]{6,32})(?:[/?]|$)/);
    if (!m) return true;
    return ids.some((id) => id === m[1] || (store.get(id) && store.get(id).parent_id === m[1]));
  };

  window.addEventListener('hashchange', hideNotice);
  store.on((evt) => {
    if (evt.type === 'remote') {
      if (!affectsPage(evt.ids)) return;
      if (editing()) showNotice();
      else refresh({ keepScroll: true });
    } else if (evt.type === 'conflict') {
      toast(t(evt.kept === 'both' ? 'sync.conflictCopy' : 'sync.conflictKept'), 'info', 12000);
      if (evt.kept === 'both') refresh({ keepScroll: true });
    }
  });
}

async function boot() {
  initLocalPrefs();
  setLang(await loadLang(getPrefs().lang));
  routeExternalLinks();
  await initApi();
  // Una ventana abierta con «Abrir en una ventana nueva» empieza en la página que se pidió.
  const route = initialRoute();
  if (route && !location.hash.replace(/^#\/?/, '')) history.replaceState(null, '', location.pathname + location.search + route);

  let status;
  try {
    status = await api.get('auth/status');
  } catch (err) {
    fatalScreen(err);
    return;
  }
  session.mode = status.mode;
  session.version = status.version || '';
  // En la aplicación, la versión es la del instalador («0.1.0»).
  if (isApp) session.version = (await appVersion()) || session.version;
  if (!status.authenticated) await authFlow(status);
  if (!session.mode) session.mode = 'password';

  await loadPrefs();
  setLang(await loadLang(getPrefs().lang));

  // Si la sesión caduca mientras se trabaja, se pide la contraseña sin salir de la página
  // y después se reintenta lo que hubiera quedado sin guardar.
  let asking = false;
  window.addEventListener('creabel:unauthorized', async () => {
    if (asking) return;
    asking = true;
    const ok = await loginOverlay();
    asking = false;
    if (ok) store.flush();
  });

  if (isApp) {
    // En la aplicación no se pregunta al cerrar la ventana: se guarda lo pendiente y se cierra.
    const t = tauri();
    const win = t && t.window && t.window.getCurrentWindow ? t.window.getCurrentWindow() : null;
    if (win && win.onCloseRequested) {
      win.onCloseRequested(async () => {
        // La principal espera a que las demás ventanas guarden lo suyo (a través de ella).
        try { await flushOtherWindows(); } catch (err) { console.error(err); }
        try { await store.flush(); } catch (err) { console.error(err); }
        sayGoodbye();
      });
    }
  } else {
    window.addEventListener('beforeunload', (e) => {
      if (store.hasPending()) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) store.flush();
    else store.sync(); // al volver a la pestaña, ponerse al día con lo hecho en otros dispositivos
  });
  window.addEventListener('focus', () => store.sync());
  watchRemoteChanges();

  setRoutes(ROUTES);
  await initWindows({ refresh }); // en Windows: abrir páginas en otras ventanas
  await startRouter();
  // Las actualizaciones y la sincronización, solo en la ventana principal.
  if (isSecondaryWindow) return;
  startUpdateChecks(); // solo hace algo en la aplicación de Windows
  if (isApp) {
    startAutoSync();
    // Si la sincronización trae un proyecto nuevo, la lista de proyectos se pone al día.
    window.addEventListener('creabel:synced', (e) => {
      if (e.detail && e.detail.arrived && /^#?\/?$/.test(location.hash)) refresh();
    });
  }
}

boot().catch((err) => {
  console.error(err);
  fatalScreen(err);
});
