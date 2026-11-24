// Navegación por hash: #/p/<proyecto>/<sección>/...
import { store } from './store.js';
import { mountShell } from './shell.js';
import { migrateEvents, ensureCodes } from './model.js';
import { clear, h } from './dom.js';
import { t, tr, importLocalized } from './i18n.js';
import { loadTraits } from './traits.js';
import { setNovelLanguage } from './dateparse.js';
import { loadStyleSheet } from './style.js';
import { attachWindowButton, updateWindowTitle } from './windows.js';
import { toast, errorText, emptyState, btn, helpToggle } from './ui.js';

let routes = [];
let cleanup = null;
let token = 0;

export function setRoutes(list) {
  routes = list.map(([pattern, page]) => ({ parts: pattern === '' ? [] : pattern.split('/'), page }));
}

function match(path) {
  const segs = path === '' ? [] : path.split('/').map(decodeURIComponent);
  for (const r of routes) {
    if (r.parts.length !== segs.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < segs.length; i++) {
      if (r.parts[i].startsWith(':')) params[r.parts[i].slice(1)] = segs[i];
      else if (r.parts[i] !== segs[i]) { ok = false; break; }
    }
    if (ok) return { page: r.page, params, segs };
  }
  return null;
}

export function go(hash) {
  if (location.hash === hash) refresh();
  else location.hash = hash;
}

/** Vuelve a pintar la página actual. Con keepScroll conserva la posición (refresco no pedido por el usuario). */
export function refresh(opts) {
  return navigate(opts && opts.keepScroll === true ? { keepScroll: true } : undefined);
}

export function startRouter() {
  window.addEventListener('hashchange', navigate);
  return navigate();
}

/**
 * Ayuda de la sección: si hay un texto «help.<sección>» (o «help.<sección>.item» para la
 * ficha de un elemento), se añade a la cabecera un botón «?» que lo muestra u oculta.
 * Así cada página tiene su explicación sin que cada una tenga que montarla.
 */
function attachHelp(el, segs, pid) {
  const section = pid ? (segs[2] || 'home') : (segs[0] || 'projects');
  const depth = pid ? segs.length - 3 : segs.length - 1;
  if (depth > 1) return; // subpáginas (motivo de un capítulo, una guía concreta…)
  const key = `${section}${depth === 1 ? '.item' : ''}`;
  const text = tr('help.' + key);
  const header = el.querySelector('.page-header');
  const actions = header ? header.querySelector('.page-actions') : null;
  if (!text || !actions || header.querySelector('.help-btn')) return;
  // La frase corta está en las traducciones; la explicación por apartados, en help/<idioma>.js,
  // que se carga al abrir el «?» por primera vez.
  const help = helpToggle(text, { more: async () => {
    // En el idioma de la interfaz o, si aún no está traducida a él, en el de su reserva.
    const detail = (await importLocalized((c) => import(`./help/${c}.js`))).content[key];
    if (!detail) return null;
    // `guide` es un capítulo de la guía de la aplicación («time») o uno de sus apartados («time#link»).
    const [chapter, section] = String(detail.guide || '').split('#');
    return { ...detail, guide: chapter && pid ? { href: `#/p/${pid}/guides/app/${chapter}${section ? '?s=' + section : ''}`, label: t('help.inGuide') } : null };
  } });
  actions.prepend(help.button);
  header.after(help.panel);
}

async function navigate(opts) {
  const mine = ++token;
  // `opts` solo es un objeto de opciones cuando lo pasa refresh(); como manejador de hashchange recibe el evento.
  const keep = opts && opts.keepScroll === true;
  const main = document.getElementById('main');
  const scroll = keep ? { x: window.scrollX, y: window.scrollY, main: main ? main.scrollTop : 0 } : null;
  if (cleanup) {
    const fn = cleanup;
    cleanup = null;
    try { await fn(); } catch (e) { console.error(e); }
  }
  await store.flush();
  if (mine !== token) return;

  const raw = location.hash.replace(/^#\/?/, '');
  const [pathname, qs] = raw.split('?');
  const path = pathname.replace(/\/+$/, '');
  const found = match(path);
  const query = Object.fromEntries(new URLSearchParams(qs || ''));

  if (!found) {
    location.replace('#/');
    return;
  }
  const pid = found.params.pid || null;
  try {
    if (pid) {
      if (!store.project || store.project.id !== pid) {
        await store.open(pid);
        await migrateEvents(); // proyectos de versiones anteriores: eventos guardados dentro de las fichas
      }
      // Lo que depende del idioma de la novela (puede cambiar en «Libro» o al sincronizar): la
      // hoja de rasgos, la de revisión del texto y los nombres de los meses del buscador. Cada
      // hoja se carga una sola vez por idioma.
      await Promise.all([loadTraits(store.project.language), loadStyleSheet(store.project.language)]);
      setNovelLanguage(store.project.language);
      ensureCodes(); // identificador visible (P-003) para lo que aún no lo tenga; no hace nada si ya está todo
    } else if (store.project) {
      store.close();
    }
  } catch (err) {
    if (mine !== token) return;
    toast(errorText(err), 'error');
    if (pid) location.replace('#/');
    return;
  }
  if (mine !== token) return;

  const section = pid ? (found.segs[2] || 'home') : (found.segs[0] || 'projects');
  const el = mountShell(section);
  clear(el);
  el.scrollTop = 0;
  window.scrollTo(0, 0);
  try {
    const out = await found.page({ el, pid, params: found.params, query, refresh });
    if (mine !== token) {
      if (typeof out === 'function') { try { await out(); } catch (e) { /* página ya abandonada */ } }
      return;
    }
    cleanup = typeof out === 'function' ? out : null;
    attachHelp(el, found.segs, pid);
    attachWindowButton(el); // en Windows: abrir esta página en otra ventana
    updateWindowTitle(el);
    if (scroll) {
      el.scrollTop = scroll.main;
      window.scrollTo(scroll.x, scroll.y);
    }
  } catch (err) {
    console.error(err);
    if (mine !== token) return;
    clear(el);
    el.append(emptyState(t('error.page') + ' ' + errorText(err), btn(t('common.retry'), { kind: 'primary', onClick: refresh }), 'info'));
    el.append(h('pre.error-detail', String((err && err.stack) || err)));
  }
}
