// Marco de la aplicación: navegación y zona de contenido.
//  - En pantallas anchas, la barra lateral de siempre.
//  - En pantallas estrechas (móvil, tableta en vertical; ver isNarrow en platform.js), una barra
//    inferior al alcance del pulgar, cada botón con su texto. Fuera de un proyecto: Proyectos,
//    Papelera y Ajustes. Dentro, cinco: Inicio, Capítulos, dos que elige el usuario en Ajustes
//    (por defecto Personajes y Notas; cada uno puede ser un apartado o un grupo del menú, que
//    abre su lista desde abajo) y Menú, que abre desde la izquierda el mismo menú lateral del
//    PC (con Tus proyectos, Ajustes y el tema arriba, a mano). La barra superior dice dónde se
//    está y si lo escrito está guardado y, si se ha salido de una escena, lleva un botón para
//    volver a ella.
import { h, icon, clear } from './dom.js';
import { t } from './i18n.js';
import { store } from './store.js';
import { lastSceneOf } from './lastscene.js';
import { getPrefs, savePrefs, resolvedTheme } from './prefs.js';
import { api } from './api.js';
import { isApp } from './platform.js';
import { session } from './session.js';
import { toast, errorText } from './ui.js';
import { SETTINGS_SECTIONS, settingsSection } from './settings-sections.js';

// Menú del proyecto, por grupos. Cada grupo con nombre se puede plegar; lo plegado se
// recuerda en este navegador.
export const PROJECT_NAV = [
  { key: null, items: [['home', 'home']] },
  // Lo que se piensa antes y alrededor del texto: la historia y los apuntes.
  { key: 'plan', icon: 'layers', items: [['architecture', 'layers'], ['notes', 'note'], ['dictionary', 'dictionary'], ['library', 'paperclip']] },
  // Lo que hay en el mundo de la novela. El árbol y los mapas van dentro de Lugares; la familia, dentro de Personajes.
  { key: 'world', icon: 'users', items: [
    ['characters', 'users'], ['locations', 'pin'], ['objects', 'box'], ['groups', 'group'], ['custom', 'grid'], ['relationships', 'share'],
  ] },
  // El tablero de tarjetas y el esquema van dentro de Capítulos; la portada y la sinopsis, dentro de Libro.
  { key: 'manuscript', icon: 'book', items: [['chapters', 'book'], ['read', 'eye'], ['book', 'bookmark']] },
  { key: 'review', icon: 'flag', items: [['tasks', 'flag'], ['timeline', 'clock'], ['continuity', 'shield'], ['analysis', 'chart'], ['search', 'search']] },
  { key: 'tools', icon: 'download', items: [['export', 'download'], ['trash', 'trash'], ['guides', 'info']] },
];

/** Lo que se puede poner en los dos botones libres de la barra de abajo (ver Ajustes). */
export const NAV_SLOT_DEFAULTS = ['item:characters', 'item:notes'];
export const navSlotChoices = () => ({
  items: PROJECT_NAV.flatMap((g) => g.items).filter(([key]) => key !== 'home' && key !== 'chapters'),
  groups: PROJECT_NAV.filter((g) => g.key),
});

// Secciones que se muestran dentro de otra en el menú.
const ALIAS = {
  scenes: 'chapters', strands: 'architecture', project: 'book', outline: 'chapters', board: 'chapters', import: 'chapters',
  stats: 'analysis', plans: 'locations',
};

const NAV_KEY = 'creabel.navCollapsed';
function readCollapsed() {
  try { return new Set(JSON.parse(localStorage.getItem(NAV_KEY) || '[]')); } catch (e) { return new Set(); }
}
function writeCollapsed(set) {
  try { localStorage.setItem(NAV_KEY, JSON.stringify([...set])); } catch (e) { /* sin almacenamiento local, no se recuerda */ }
}

let root = null;
let sidebar = null;
let main = null;
let bottombar = null;
let topTitle = null;
let topBack = null;
let topSave = null;
let sideSave = null;
let sheet = null;
let lastErrorShown = 0;

function drawSave() {
  const state = store.project ? store.saveState() : 'saved';
  // El estado de guardado está al pie de la barra lateral y, en pantallas estrechas, arriba.
  for (const el of [sideSave, topSave].filter(Boolean)) {
    clear(el);
    el.className = 'save-state save-' + state;
    if (!store.project) continue;
    el.append(h('span.save-dot'), h('span', t('save.' + state)));
    if (state === 'error') {
      el.append(h('button.link-btn', { type: 'button', onclick: () => store.flush() }, t('common.retry')));
    }
  }
}

function navLink(href, iconName, label, active) {
  return h('a', { class: 'nav-item' + (active ? ' active' : ''), href, 'aria-current': active ? 'page' : null }, icon(iconName, 18), h('span', label));
}

/** Número de pendientes abiertos, a la vista desde cualquier sección. */
function tasksBadge(link) {
  const open = store.list('task').filter((x) => x.status !== 2).length;
  if (open) link.append(h('span.count-badge', String(open)));
  return link;
}

async function toggleTheme(section) {
  const dark = resolvedTheme() === 'dark';
  try { await savePrefs({ theme: dark ? 'light' : 'dark' }); } catch (err) { toast(errorText(err), 'error'); }
  drawSidebar(section);
}

async function logout() {
  await store.flush();
  try { await api.post('auth/logout'); } catch (err) { /* se recarga igualmente */ }
  location.hash = '#/';
  location.reload();
}

// ---------- Menú lateral (en pantallas estrechas, se abre con «Menú») ----------

function openMenu() {
  closeSheet();
  root.classList.add('menu-open');
  document.addEventListener('keydown', onMenuKey);
  const current = sidebar.querySelector('.nav-item.active') || sidebar.querySelector('.sidebar-quick-item');
  if (current) current.focus({ preventScroll: false });
}
function closeMenu() {
  if (!root) return;
  root.classList.remove('menu-open');
  document.removeEventListener('keydown', onMenuKey);
}
function onMenuKey(e) { if (e.key === 'Escape') closeMenu(); }

function drawSidebar(section, fromToggle) {
  const scroll = sidebar.scrollTop;
  clear(sidebar);
  const active = ALIAS[section] || section;
  const p = store.project;
  const dark = resolvedTheme() === 'dark';

  sidebar.append(h('a.brand', { href: '#/' }, h('img', { src: 'assets/img/favicon.svg', alt: '', width: 28, height: 28 }), h('span', 'Creabel')));

  // En pantallas estrechas (abierto con «Menú»), arriba y con su nombre: lo de la aplicación.
  const quick = (iconName, label, attrs) => (attrs.href
    ? h('a.sidebar-quick-item', attrs, icon(iconName, 19), h('span', label))
    : h('button.sidebar-quick-item', { type: 'button', ...attrs }, icon(iconName, 19), h('span', label)));
  sidebar.append(h('div.sidebar-quick',
    quick('folder', t('nav.yourProjects'), { href: '#/' }),
    quick('settings', t('nav.settings'), { href: '#/settings' }),
    quick(dark ? 'sun' : 'moon', t(dark ? 'nav.lightTheme' : 'nav.darkTheme'), { onclick: () => toggleTheme(section) })));

  const nav = h('nav.nav', { 'aria-label': t('nav.main') });
  if (p) {
    sidebar.append(h('a.project-chip', { href: `#/p/${p.id}/book`, title: t('nav.book') },
      h('span.project-chip-name', p.name), p.author ? h('span.project-chip-author', p.author) : null));
    const collapsed = readCollapsed();
    // Al navegar a una sección de un grupo plegado, el grupo se abre para que se vea dónde se está.
    const home = PROJECT_NAV.find((g) => g.key && g.items.some(([key]) => key === active));
    if (!fromToggle && home && collapsed.has(home.key)) {
      collapsed.delete(home.key);
      writeCollapsed(collapsed);
    }
    for (const group of PROJECT_NAV) {
      if (group.key) {
        const closed = collapsed.has(group.key);
        nav.append(h('button.nav-group', {
          type: 'button', 'aria-expanded': String(!closed),
          onclick: () => {
            const now = readCollapsed();
            if (now.has(group.key)) now.delete(group.key);
            else now.add(group.key);
            writeCollapsed(now);
            drawSidebar(section, true);
          },
        }, h('span', t('nav.group.' + group.key)), icon(closed ? 'chevron-right' : 'chevron-down', 13)));
        if (closed) continue;
      }
      for (const [key, ic] of group.items) {
        const link = navLink(key === 'home' ? `#/p/${p.id}` : `#/p/${p.id}/${key}`, ic, t('nav.' + key), active === key);
        nav.append(key === 'tasks' ? tasksBadge(link) : link);
      }
    }
  } else {
    nav.append(navLink('#/', 'folder', t('nav.projects'), active === 'projects'));
    nav.append(navLink('#/trash', 'trash', t('nav.trash'), active === 'trash'));
    if (active === 'settings') {
      // Dentro de Ajustes, el menú pasa a mostrar sus apartados.
      const current = settingsSection(location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[1]);
      nav.append(h('div.nav-sep'), h('div.nav-label', t('nav.settings')));
      for (const [key, ic] of SETTINGS_SECTIONS) nav.append(navLink(`#/settings/${key}`, ic, t('settings.section.' + key), current === key));
    } else {
      nav.append(navLink('#/settings', 'settings', t('nav.settings'), false));
    }
  }
  sidebar.append(nav);

  sideSave = h('div.save-state');
  const foot = h('div.sidebar-foot',
    p ? sideSave : null,
    h('div.sidebar-foot-row',
      p ? h('a.foot-btn', { href: '#/', title: t('nav.projects') }, icon('folder', 17)) : null,
      p ? h('a.foot-btn', { href: '#/settings', title: t('nav.settings') }, icon('settings', 17)) : null,
      h('button.foot-btn', {
        type: 'button', title: t(dark ? 'nav.lightTheme' : 'nav.darkTheme'),
        onclick: () => toggleTheme(section),
      }, icon(dark ? 'sun' : 'moon', 17)),
      session.mode === 'password' ? h('button.foot-btn', { type: 'button', title: t('nav.logout'), onclick: logout }, icon('logout', 17)) : null));
  sidebar.append(foot);
  // El aviso de «modo de prueba» solo en el navegador: en la aplicación los datos son de verdad.
  if (api.isMock() && !isApp) sidebar.append(h('div.mock-badge', t('nav.mock')));
  sidebar.scrollTop = scroll;

  drawTop(active);
  drawBottom(section);
  drawSave();
}

// ---------- Pantallas estrechas: barra superior, barra inferior y paneles ----------

const sectionTitle = (active) => {
  if (active === 'projects') return t('nav.projects');
  if (active === 'settings') return t('nav.settings');
  if (active === 'trash') return t('nav.trash');
  return t('nav.' + active) !== 'nav.' + active ? t('nav.' + active) : 'Creabel';
};

function drawTop(active) {
  if (!topTitle) return;
  const p = store.project;
  clear(topTitle);
  // Dentro de un proyecto, su nombre (y debajo, el apartado); fuera, el apartado.
  if (p) topTitle.append(h('span.topbar-name', p.name), h('span.topbar-sub', sectionTitle(active)));
  else topTitle.append(h('span.topbar-name', sectionTitle(active)));

  // Si se ha salido de una escena para consultar algo, un botón con su nombre vuelve a ella
  // (con el cursor donde estaba). No sale estando en esa misma escena.
  clear(topBack);
  const spot = p ? lastSceneOf(p.id) : null;
  const scene = spot ? store.get(spot.id) : null;
  const here = new RegExp(`^#/p/${p ? p.id : ''}/scenes/${spot ? spot.id : ''}(?:[/?]|$)`).test(location.hash);
  topBack.hidden = !scene || scene.type !== 'scene' || !!scene.deleted_at || here;
  if (!topBack.hidden) {
    const name = (scene.name && scene.name.trim()) || t('common.untitled');
    topBack.append(h('a.topbar-back', { href: `#/p/${p.id}/scenes/${scene.id}?resume=1`, title: t('nav.backToScene', { name }), 'aria-label': t('nav.backToScene', { name }) },
      icon('back-to', 17), h('span', name)));
  }
}

function barItem({ href, onClick, iconName, label, active }) {
  const cls = 'bottombar-item' + (active ? ' active' : '');
  const inner = [icon(iconName, 21), h('span.bottombar-label', label)];
  return href
    ? h('a', { class: cls, href, 'aria-current': active ? 'page' : null }, ...inner)
    : h('button', { type: 'button', class: cls, 'aria-haspopup': 'dialog', onclick: onClick }, ...inner);
}

/** Un botón libre de la barra: { kind: 'item'|'group', key, icon, label }. */
function resolveSlot(value, fallback) {
  const parse = (v) => {
    const [kind, key] = String(v || '').split(':');
    if (kind === 'item') {
      const item = navSlotChoices().items.find(([k]) => k === key);
      return item ? { kind, key, icon: item[1], label: t('nav.' + key) } : null;
    }
    if (kind === 'group') {
      const group = navSlotChoices().groups.find((g) => g.key === key);
      return group ? { kind, key, icon: group.icon, label: t('nav.group.' + key), group } : null;
    }
    return null;
  };
  return parse(value) || parse(fallback);
}

function drawBottom(section) {
  if (!bottombar) return;
  clear(bottombar);
  const active = ALIAS[section] || section;
  const p = store.project;
  if (!p) {
    bottombar.append(
      barItem({ href: '#/', iconName: 'folder', label: t('nav.projects'), active: active === 'projects' }),
      barItem({ href: '#/trash', iconName: 'trash', label: t('nav.trash'), active: active === 'trash' }),
      barItem({ href: '#/settings', iconName: 'settings', label: t('nav.settings'), active: active === 'settings' }));
    return;
  }
  const prefs = getPrefs();
  const slots = [resolveSlot(prefs.navSlot1, NAV_SLOT_DEFAULTS[0]), resolveSlot(prefs.navSlot2, NAV_SLOT_DEFAULTS[1])];
  const slotActive = (s) => (s.kind === 'item' ? active === s.key : s.group.items.some(([k]) => k === active));
  const anyActive = active === 'home' || active === 'chapters' || slots.some(slotActive);
  bottombar.append(
    barItem({ href: `#/p/${p.id}`, iconName: 'home', label: t('nav.home'), active: active === 'home' }),
    barItem({ href: `#/p/${p.id}/chapters`, iconName: 'book', label: t('nav.chapters'), active: active === 'chapters' }),
    ...slots.map((s) => (s.kind === 'item'
      ? barItem({ href: `#/p/${p.id}/${s.key}`, iconName: s.icon, label: s.label, active: slotActive(s) })
      : barItem({ iconName: s.icon, label: s.label, active: slotActive(s), onClick: () => openSheet(s.label, groupSheet(p, s.group, active)) }))),
    barItem({ iconName: 'menu', label: t('nav.menu'), active: !anyActive, onClick: openMenu }));
}

function sheetLink(href, iconName, label, active) {
  return h('a', { class: 'sheet-item' + (active ? ' active' : ''), href, 'aria-current': active ? 'page' : null }, icon(iconName, 20), h('span', label));
}

function groupSheet(p, group, active) {
  return [h('div.sheet-group', group.items.map(([key, ic]) => {
    const link = sheetLink(`#/p/${p.id}/${key}`, ic, t('nav.' + key), active === key);
    return key === 'tasks' ? tasksBadge(link) : link;
  }))];
}

function onSheetKey(e) { if (e.key === 'Escape') closeSheet(); }

export function closeSheet() {
  if (!sheet) return;
  sheet.remove();
  sheet = null;
  document.removeEventListener('keydown', onSheetKey);
}

/** Panel que sube desde abajo, con un título y una lista de enlaces. */
function openSheet(title, content) {
  closeSheet();
  closeMenu();
  const panel = h('div.sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div.sheet-head', h('strong.sheet-title', title),
      h('button.sheet-close', { type: 'button', 'aria-label': t('common.close'), onclick: closeSheet }, icon('x', 20))),
    h('div.sheet-body', content));
  sheet = h('div.sheet-overlay', { onclick: (e) => { if (e.target === sheet) closeSheet(); } }, panel);
  // Al tocar un enlace se va a esa página y el panel se cierra.
  panel.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a[href]')) closeSheet(); });
  document.addEventListener('keydown', onSheetKey);
  document.body.append(sheet);
  const first = panel.querySelector('.sheet-item.active') || panel.querySelector('.sheet-item');
  if (first) first.focus({ preventScroll: true });
}

// Mientras se escribe (con el teclado del móvil abierto), la barra inferior se aparta para no
// quitar sitio al texto.
const isTyping = (el) => !!el && (el.isContentEditable
  || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
  || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'color', 'button', 'submit', 'file'].includes(el.type)));

/** Vuelve a pintar la barra de abajo (al cambiar sus botones en Ajustes). */
export function redrawNav() {
  if (root) drawSidebar(root.dataset.section || 'home');
}

/** Monta (una sola vez) el marco y devuelve el contenedor donde pinta la página. */
export function mountShell(section) {
  if (!root) {
    sidebar = h('aside.sidebar');
    main = h('main.main', { id: 'main', tabindex: '-1' });
    topTitle = h('div.topbar-title');
    topBack = h('div.topbar-back-wrap', { hidden: true });
    topSave = h('div.save-state');
    const topbar = h('div.topbar', topTitle, topBack, topSave);
    bottombar = h('nav.bottombar', { 'aria-label': t('nav.main') });
    const scrim = h('div.scrim', { onclick: closeMenu });
    root = h('div.shell', sidebar, scrim, h('div.main-col', topbar, main, bottombar));
    // Al tocar un apartado del menú lateral, se va a él y el menú se cierra.
    sidebar.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a[href]')) closeMenu(); });
    const app = document.getElementById('app');
    clear(app);
    app.append(root);
    document.addEventListener('focusin', (e) => root.classList.toggle('typing', isTyping(e.target)));
    document.addEventListener('focusout', () => setTimeout(() => root.classList.toggle('typing', isTyping(document.activeElement)), 0));
    store.on((evt) => {
      if (evt.type === 'save' || evt.type === 'update' || evt.type === 'save-error') drawSave();
      if (evt.type === 'project') drawSidebar(root.dataset.section || 'home');
      if (evt.type === 'save-error' && Date.now() - lastErrorShown > 8000) {
        lastErrorShown = Date.now();
        toast(t('save.errorToast') + ' ' + errorText(evt.error), 'error', 6000);
      }
    });
  }
  root.dataset.section = section;
  closeSheet();
  closeMenu();
  drawSidebar(section);
  return main;
}
