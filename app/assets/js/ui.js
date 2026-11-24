// Componentes de interfaz reutilizables: botones, diálogos, avisos, menús, listas ordenables...
import { h, icon, clear } from './dom.js';
import { t, tr } from './i18n.js';

export function errorText(err) {
  if (!err) return t('error.unknown');
  const translated = err.code ? tr('error.' + err.code) : undefined;
  return translated || err.message || t('error.unknown');
}

// ---------- Botones ----------

export function btn(label, opts = {}) {
  const { icon: ic, kind = 'default', onClick, title, small, type = 'button', href } = opts;
  // Un botón de añadir que no es el principal de la página lleva el «+» en el color de acento,
  // sea del tamaño que sea: así todos los «Añadir» secundarios se ven igual.
  const cls = 'btn btn-' + kind + (small ? ' btn-sm' : '') + (!label ? ' btn-icon' : '') + (label && ic === 'plus' && kind === 'default' ? ' btn-add' : '');
  const children = [ic ? icon(ic, small ? 15 : 17) : null, label ? h('span', label) : null];
  if (href) return h('a', { class: cls, href, title }, children);
  return h('button', { class: cls, type, title, 'aria-label': !label ? title : null, onclick: onClick }, children);
}

// ---------- Acciones de un bloque ----------
// Dentro de un panel o de un campo, las acciones se presentan siempre igual: a la derecha
// del título del bloque, como botones pequeños con borde, icono y una sola palabra. Y solo
// hay tres, con el mismo nombre en toda la aplicación:
//   «Añadir» (+)          crea algo nuevo en ese bloque;
//   «Enlazar» (eslabón)   trae algo que ya existe en el proyecto;
//   «Elegir» / «Cambiar»  escoge entre las fichas (qué personajes salen, quién narra…).
// `title` es la explicación completa, que sale al pasar el ratón («Añadir evento»).

function blockBtn(label, iconName, onClick, title) {
  const b = btn(label, { icon: iconName, small: true, onClick, title });
  b.classList.add('btn-block');
  if (title) b.setAttribute('aria-label', title);
  return b;
}
export const addBtn = (onClick, title) => blockBtn(t('common.add'), 'plus', onClick, title);
export const linkBtn = (onClick, title) => blockBtn(t('common.link'), 'link', onClick, title);
export const chooseBtn = (onClick, changing = false, title) => blockBtn(t(changing ? 'tags.change' : 'tags.choose'), changing ? 'edit' : 'plus', onClick, title);

// ---------- Avisos ----------

let toastHost = null;

export function toast(message, type = 'info', ms = 3800) {
  if (!toastHost) {
    toastHost = h('div.toast-host', { 'aria-live': 'polite' });
    document.body.append(toastHost);
  }
  const el = h('div', { class: 'toast toast-' + type }, message);
  toastHost.append(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 300);
  }, ms);
}

// ---------- Diálogos ----------

const modalStack = [];

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalStack.length) {
    e.preventDefault();
    e.stopPropagation();
    modalStack[modalStack.length - 1].close();
  }
}, true);

export function modal({ title, body, actions = [], wide = false, onClose } = {}) {
  let closed = false;
  const overlay = h('div.modal-overlay');
  // Lo que tenía el foco al abrir (normalmente el botón que abre el diálogo): al cerrar vuelve a él.
  const opener = document.activeElement;
  const ctl = {
    overlay,
    close(result) {
      if (closed) return;
      closed = true;
      overlay.remove();
      const i = modalStack.indexOf(ctl);
      if (i >= 0) modalStack.splice(i, 1);
      if (onClose) onClose(result);
      // Solo si nadie ha movido ya el foco a otro sitio (otro diálogo, una página nueva).
      setTimeout(() => {
        const lost = !document.activeElement || document.activeElement === document.body;
        if (lost && opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
      }, 0);
    },
  };
  // El tabulador no sale del diálogo: del último control pasa al primero y al revés.
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [contenteditable=true], [tabindex]:not([tabindex="-1"])')]
      .filter((n) => !n.hidden && n.getClientRects().length);
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const inside = overlay.contains(document.activeElement);
    if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
  });
  const box = h('div', { class: 'modal' + (wide ? ' modal-wide' : ''), role: 'dialog', 'aria-modal': 'true' },
    h('div.modal-header',
      h('h2', title || ''),
      h('button.modal-close', { type: 'button', 'aria-label': t('common.close'), onclick: () => ctl.close() }, icon('x', 18))),
    h('div.modal-body', body),
    actions.length ? h('div.modal-footer', actions) : null);
  ctl.box = box;
  overlay.append(box);
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) ctl.close();
  });
  document.body.append(overlay);
  modalStack.push(ctl);
  setTimeout(() => {
    const target = box.querySelector('.modal-body input:not([type=checkbox]):not([type=radio]):not([type=file]), .modal-body textarea, .modal-body select') || box.querySelector('.btn-primary, .btn-danger') || box.querySelector('.modal-close');
    if (target) target.focus();
    if (target && target.select && target.type !== 'checkbox') target.select();
  }, 30);
  return ctl;
}

export function confirmDialog(message, { title, confirmLabel, danger = false } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    const m = modal({
      title: title || t('common.confirm'),
      body: h('p.modal-text', message),
      actions: [
        btn(t('common.cancel'), { onClick: () => m.close() }),
        btn(confirmLabel || t('common.accept'), { kind: danger ? 'danger' : 'primary', onClick: () => { answered = true; m.close(); resolve(true); } }),
      ],
      onClose: () => { if (!answered) resolve(false); },
    });
  });
}

/**
 * Formulario en un diálogo. fields: [{ name, label, type, value, options, required, placeholder, hint }]
 * type: text | textarea | select | checkbox | number | date | datetime-local | color | password
 * Devuelve los valores o null si se cancela.
 */
export function formDialog({ title, fields, submitLabel, wide, intro }) {
  return new Promise((resolve) => {
    let done = false;
    const inputs = {};
    const form = h('form.form', { novalidate: false });
    if (intro) form.append(h('p.modal-text', intro));
    for (const f of fields) {
      let input;
      if (f.type === 'textarea') {
        input = h('textarea.input', { rows: f.rows || 4, placeholder: f.placeholder, maxlength: f.maxlength });
      } else if (f.type === 'select') {
        input = h('select.input', (f.options || []).map((o) => h('option', { value: o.value }, o.label)));
      } else if (f.type === 'checkbox') {
        input = h('input', { type: 'checkbox' });
      } else {
        const isText = !f.type || f.type === 'text';
        input = h('input.input', { type: f.type || 'text', placeholder: f.placeholder, maxlength: isText ? 250 : null, min: f.min, max: f.max, step: f.step, autocomplete: f.autocomplete || 'off' });
      }
      if (f.type === 'checkbox') input.checked = !!f.value;
      else if (f.value != null) input.value = f.value;
      if (f.required) input.required = true;
      inputs[f.name] = input;
      if (f.type === 'checkbox') {
        form.append(h('label.form-check', input, h('span', f.label)));
        // La explicación de una casilla, debajo; si es un aviso (warnWhenChecked), solo con la casilla marcada.
        if (f.hint) {
          const hint = h(f.warnWhenChecked ? 'p.notice.small' : 'span.form-hint', f.hint);
          if (f.warnWhenChecked) {
            const sync = () => { hint.hidden = !input.checked; };
            input.addEventListener('change', sync);
            sync();
          }
          form.append(hint);
        }
      } else {
        form.append(h('label.form-row', h('span.form-label', f.label), input, f.hint ? h('span.form-hint', f.hint) : null));
      }
    }
    const submit = () => {
      if (!form.reportValidity()) return;
      const out = {};
      for (const f of fields) {
        const i = inputs[f.name];
        if (f.type === 'checkbox') out[f.name] = i.checked;
        else if (f.type === 'number') out[f.name] = i.value === '' ? null : Number(i.value);
        else if (f.type === 'password') out[f.name] = i.value;
        else out[f.name] = i.value.trim();
      }
      done = true;
      m.close();
      resolve(out);
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });
    // Permite enviar con Intro desde los campos de una línea.
    form.append(h('button', { type: 'submit', hidden: true }));
    const m = modal({
      title, body: form, wide,
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(submitLabel || t('common.save'), { kind: 'primary', onClick: submit })],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

export async function promptDialog({ title, label, value = '', placeholder, submitLabel }) {
  const out = await formDialog({ title, submitLabel, fields: [{ name: 'value', label: label || t('common.name'), value, placeholder, required: true }] });
  return out ? out.value : null;
}

/**
 * Selección en un diálogo, con una ficha por fila. items: [{ id, label, sub, group, image, icon, code }].
 * Devuelve los ids elegidos o null si se cancela. Con `single` se elige uno solo: al pulsar una
 * fila se acepta sin más, y `noneLabel` añade un botón para dejarlo sin ninguno (devuelve []).
 */
export function pickDialog({ title, items, selected = [], emptyText, single = false, noneLabel }) {
  return new Promise((resolve) => {
    let done = false;
    const sel = new Set(selected);
    const list = h('div.pick-list');
    const filter = h('input.input', { type: 'search', placeholder: t('common.filter') });
    const finish = (ids) => { done = true; m.close(); resolve(ids); };
    const draw = () => {
      clear(list);
      // El filtro no distingue mayúsculas ni acentos: «lucia» encuentra a «Lucía».
      const q = fold(filter.value.trim());
      const shown = items.filter((i) => !q || fold(`${i.label} ${i.sub || ''} ${i.code || ''}`).includes(q));
      if (!shown.length) list.append(h('p.muted', items.length ? t('common.noMatches') : (emptyText || t('common.nothing'))));
      let lastGroup = null;
      for (const it of shown) {
        if (it.group && it.group !== lastGroup) {
          list.append(h('div.pick-group', it.group));
          lastGroup = it.group;
        }
        // Cada fila es una ficha: imagen o icono (si se pasan), nombre, detalle debajo e identificador.
        const thumb = it.image
          ? h('img.pick-thumb', { src: it.image, alt: '', loading: 'lazy' })
          : it.icon ? h('span.pick-thumb.placeholder', icon(it.icon, 18)) : null;
        const text = h('span.pick-text', h('span.pick-label', it.label), it.sub ? h('span.pick-sub', it.sub) : null);
        const code = it.code ? h('span.code', it.code) : null;
        if (single) {
          const on = sel.has(it.id);
          list.append(h('button', { type: 'button', class: 'pick-item' + (on ? ' selected' : ''), 'aria-pressed': String(on), onclick: () => finish([it.id]) },
            thumb, text, code, on ? icon('check', 16) : null));
          continue;
        }
        const input = h('input', { type: 'checkbox' });
        input.checked = sel.has(it.id);
        input.addEventListener('change', () => {
          if (input.checked) sel.add(it.id);
          else sel.delete(it.id);
        });
        list.append(h('label.pick-item', input, thumb, text, code));
      }
    };
    filter.addEventListener('input', draw);
    draw();
    const m = modal({
      title,
      body: h('div.pick', items.length > 8 ? filter : null, list),
      actions: single
        ? [sel.size && noneLabel ? btn(noneLabel, { onClick: () => finish([]) }) : null, btn(t('common.cancel'), { onClick: () => m.close() })]
        : [
          btn(t('common.cancel'), { onClick: () => m.close() }),
          btn(t('common.accept'), { kind: 'primary', onClick: () => finish(items.filter((i) => sel.has(i.id)).map((i) => i.id)) }),
        ],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

// ---------- Estado (por hacer / en curso / terminado) ----------

export function statusDot(status) {
  return h('span', { class: 'status-dot s' + (status || 0), title: t('status.' + (status || 0)) });
}

export function statusPicker(value, onChange) {
  let current = value || 0;
  const wrap = h('div.status-picker', { role: 'radiogroup', 'aria-label': t('status.label') });
  const draw = () => {
    clear(wrap);
    for (const s of [0, 1, 2]) {
      wrap.append(h('button', {
        type: 'button', role: 'radio', 'aria-checked': String(s === current),
        class: 'status-opt' + (s === current ? ' active' : ''),
        onclick: () => { if (s === current) return; current = s; draw(); onChange(s); },
      }, statusDot(s), h('span', t('status.' + s))));
    }
  };
  draw();
  return wrap;
}

// ---------- Menú desplegable ----------

/** items: función que devuelve [{ label, icon, danger, onClick }] (los valores nulos se ignoran). */
export function menuButton(items, opts = {}) {
  const wrap = h('div.menu-wrap');
  const button = btn(opts.label || '', { icon: opts.icon || 'more', kind: opts.kind || 'ghost', small: opts.small, title: opts.title || t('common.more') });
  let pop = null;
  const onDoc = (e) => { if (!wrap.contains(e.target)) close(); };
  const close = () => {
    if (!pop) return;
    pop.remove();
    pop = null;
    document.removeEventListener('mousedown', onDoc, true);
  };
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pop) { close(); return; }
    pop = h('div.menu-pop', { role: 'menu' }, items().filter(Boolean).map((it) => h('button', {
      type: 'button', role: 'menuitem', class: 'menu-item' + (it.danger ? ' danger' : ''),
      // El foco vuelve al botón del menú antes de actuar: si la opción abre un diálogo, al cerrarlo regresará aquí.
      onclick: (ev) => { ev.preventDefault(); ev.stopPropagation(); close(); button.focus({ preventScroll: true }); it.onClick(); },
    }, it.icon ? icon(it.icon, 15) : null, h('span', it.label))));
    wrap.append(pop);
    document.addEventListener('mousedown', onDoc, true);
  });
  wrap.append(button);
  return wrap;
}

// ---------- Estructura de página ----------

export function pageHeader({ title, subtitle, back, actions = [], titleNode }) {
  return h('header.page-header',
    back ? h('a.back-link', { href: back.href }, icon('chevron-left', 15), h('span', back.label)) : null,
    h('div.page-header-row',
      h('div.page-header-titles', titleNode || h('h1', title), subtitle ? h('p.page-subtitle', subtitle) : null),
      h('div.page-actions', actions)));
}

/**
 * Ayuda plegada: un botón «?» que muestra u oculta un texto explicativo, para no tenerlo
 * siempre a la vista. Devuelve { button, panel, setText }: el botón va en la cabecera o en
 * una barra, y el panel donde deba aparecer el texto.
 */
export function helpToggle(text, { more } = {}) {
  const body = h('span', text);
  const panel = h('div.page-help', { hidden: true }, icon('info', 15), h('div.page-help-body', h('p.page-help-intro', body)));
  let loaded = false;
  const button = h('button.btn.btn-ghost.btn-icon.help-btn', {
    type: 'button', title: t('common.help'), 'aria-label': t('common.help'), 'aria-expanded': 'false',
    onclick: async () => {
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      button.classList.toggle('active', !panel.hidden);
      // La explicación detallada (por apartados) se carga la primera vez que se abre.
      if (!panel.hidden && more && !loaded) {
        loaded = true;
        try {
          const detail = await more();
          if (detail) renderHelp(panel.querySelector('.page-help-body'), body, detail);
        } catch (err) { console.error(err); }
      }
    },
  }, icon('help', 17));
  return { button, panel, setText: (value) => { body.textContent = value; } };
}

/**
 * Pinta la ayuda detallada de una página: { intro, parts: [[título, texto]…], tips: […], guide }.
 * `intro` sustituye a la frase corta; `parts` son los apartados; `tips`, trucos; `guide`, el
 * enlace a su capítulo de la guía de la aplicación ({ href, label }).
 */
function renderHelp(box, introEl, detail) {
  if (detail.intro) introEl.textContent = detail.intro;
  box.append(...[
    detail.parts && detail.parts.length ? h('dl.page-help-parts', detail.parts.map(([title, text]) => h('div', h('dt', title), h('dd', text)))) : null,
    detail.tips && detail.tips.length ? h('ul.page-help-tips', detail.tips.map((tip) => h('li', tip))) : null,
    detail.guide ? h('a.page-help-guide', { href: detail.guide.href }, detail.guide.label, icon('chevron-right', 14)) : null,
  ].filter(Boolean));
}

/**
 * «?» pequeño junto a un título (una columna, un dato): al pasar el ratón, enfocarlo con el
 * teclado o tocarlo muestra una explicación breve en un recuadro flotante.
 */
export function tip(text) {
  const button = h('button.help-tip', { type: 'button', 'aria-label': text, onclick: (e) => { e.preventDefault(); e.stopPropagation(); } }, '?');
  return hoverPop(button, () => text);
}

/**
 * Recuadro flotante que aparece junto a `el` al pasar el ratón, enfocarlo con el teclado o
 * tocarlo. `content` es una función que devuelve su contenido (texto o nodo); se llama cada
 * vez que se abre. Devuelve el propio `el`.
 */
export function hoverPop(el, content) {
  let pop = null;
  const hide = () => {
    if (!pop) return;
    pop.remove();
    pop = null;
    window.removeEventListener('scroll', hide, true);
    window.removeEventListener('hashchange', hide);
  };
  const show = () => {
    if (pop) return;
    pop = h('div.help-tip-pop', { role: 'tooltip' }, content());
    document.body.append(pop);
    // Centrado bajo el elemento, sin salirse de la ventana; si no cabe debajo, encima.
    const r = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.left + r.width / 2 - pop.offsetWidth / 2));
    const below = r.bottom + 6;
    const top = below + pop.offsetHeight > window.innerHeight - 8 ? Math.max(8, r.top - pop.offsetHeight - 6) : below;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    window.addEventListener('scroll', hide, true);
    window.addEventListener('hashchange', hide);
  };
  el.addEventListener('mouseenter', show);
  el.addEventListener('mouseleave', hide);
  el.addEventListener('focus', show);
  el.addEventListener('blur', hide);
  el.addEventListener('click', show);
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

  // Pantallas táctiles: mantener pulsado lo abre (sin seguir el enlace en el que pueda estar);
  // se cierra al tocar en otro sitio.
  let holdTimer = null;
  let held = false;
  const outside = (e) => {
    if (el.contains(e.target)) return;
    hide();
    document.removeEventListener('touchstart', outside, true);
  };
  el.addEventListener('touchstart', () => {
    held = false;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      held = true;
      show();
      document.addEventListener('touchstart', outside, true);
    }, 450);
  }, { passive: true });
  const cancelHold = () => clearTimeout(holdTimer);
  el.addEventListener('touchmove', cancelHold, { passive: true });
  el.addEventListener('touchcancel', cancelHold);
  el.addEventListener('touchend', (e) => {
    cancelHold();
    if (held && e.cancelable) e.preventDefault(); // la pulsación larga no cuenta como un toque
  });
  // Tras mantener pulsado no se sigue el enlace ni sale el menú del navegador.
  el.addEventListener('click', (e) => { if (held) { e.preventDefault(); e.stopPropagation(); held = false; } }, true);
  el.addEventListener('contextmenu', (e) => { if (held || holdTimer) e.preventDefault(); });
  return el;
}

export function emptyState(text, action, iconName) {
  return h('div.empty', iconName ? icon(iconName, 34) : null, h('p', text), action || null);
}

export function notFound(el, pid) {
  clear(el);
  el.append(emptyState(t('common.notFound'), btn(t('common.goBack'), { href: pid ? `#/p/${pid}` : '#/', kind: 'primary' }), 'info'));
}

/** Campo de título editable con aspecto de encabezado. */
export function titleInput(value, onChange, placeholder) {
  const input = h('input.title-input', { type: 'text', maxlength: 250, placeholder: placeholder || t('common.untitled'), 'aria-label': t('common.name') });
  input.value = value || '';
  input.addEventListener('change', () => onChange(input.value.trim()));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
  return input;
}

/** Texto sin mayúsculas ni acentos, para comparar: «Lucía» → «lucia». */
export const fold = (s) => String(s == null ? '' : s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * Buscador de una lista. No distingue mayúsculas ni acentos y, si se escriben varias
 * palabras, deben estar todas. `text(item)` devuelve el texto en el que se busca (se calcula
 * una vez por elemento; `reset()` lo olvida si los elementos cambian). `onChange` se llama al
 * escribir: quien lo usa repinta solo la lista, nunca el propio buscador, para no cortar la
 * escritura. Devuelve { el, input, active(), match(item), filter(list), setCount(n, total), reset() }.
 */
export function listSearch({ text, onChange, placeholder }) {
  const label = placeholder || t('common.search');
  const input = h('input.input', { type: 'search', placeholder: label, 'aria-label': label });
  const count = h('span.list-search-count');
  const el = h('div.list-search', h('span.list-search-box', icon('search', 15), input), count);
  const cache = new Map();
  let terms = [];
  input.addEventListener('input', () => {
    terms = fold(input.value).split(/\s+/).filter(Boolean);
    onChange();
  });
  const textOf = (item) => {
    if (!cache.has(item.id)) cache.set(item.id, fold(text(item)));
    return cache.get(item.id);
  };
  const match = (item) => {
    if (!terms.length) return true;
    const s = textOf(item);
    return terms.every((x) => s.includes(x));
  };
  return {
    el, input, match,
    active: () => terms.length > 0,
    filter: (list) => (terms.length ? list.filter(match) : list),
    setCount: (shown, total) => { count.textContent = terms.length ? t('common.shownOf', { n: shown, m: total }) : ''; },
    reset: () => cache.clear(),
  };
}

export function tabs(items, active, onSelect) {
  return h('div.tabs', { role: 'tablist' }, items.map((it) => h('button', {
    type: 'button', role: 'tab', 'aria-selected': String(it.key === active),
    class: 'tab' + (it.key === active ? ' active' : ''), onclick: () => onSelect(it.key),
  }, it.label)));
}

// ---------- Listas ordenables (arrastrar y soltar) ----------

/**
 * Mueve una posición (−1 hacia arriba, +1 hacia abajo) el elemento ordenable que contiene a
 * `el`. Es lo que hacen las opciones «Subir» y «Bajar» de los menús. Devuelve si se ha movido.
 */
export function moveSortable(el, delta) {
  const item = el && el.closest ? el.closest('[data-id]') : null;
  const container = item ? item.parentNode : null;
  return !!(container && container._sortStep && container._sortStep(item, delta));
}

/**
 * Permite reordenar los hijos directos de `container` que tengan data-id.
 * axis: 'y' para listas, 'x' para rejillas. onSort recibe los ids en el nuevo orden.
 */
export function sortable(container, { axis = 'y', onSort }) {
  let dragEl = null;
  let before = '';
  const items = () => [...container.children].filter((n) => n.dataset && n.dataset.id);
  const order = () => items().map((n) => n.dataset.id).join(',');
  const itemOf = (target) => {
    const item = target && target.closest ? target.closest('[data-id]') : null;
    return item && item.parentNode === container ? item : null;
  };
  for (const item of items()) item.draggable = true;

  // ----- Sin arrastrar: una posición arriba o abajo (menú «Subir / Bajar» y Alt+flechas) -----

  /** Tras reordenar, la página puede repintarse: se devuelve el foco a la fila movida. */
  const refocus = (id, item) => {
    let tries = 0;
    const timer = setInterval(() => {
      const now = document.querySelector(`[data-id="${id}"]`);
      const done = now && (now !== item || item.isConnected);
      if (done || ++tries > 20) clearInterval(timer);
      if (!done) return;
      const target = now.matches('a, button') ? now : now.querySelector('a, button');
      if (target && document.activeElement !== target) target.focus({ preventScroll: true });
    }, 50);
  };
  const step = (item, delta) => {
    const list = items();
    const i = list.indexOf(item);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return false;
    const hadFocus = item.contains(document.activeElement);
    container.insertBefore(item, delta < 0 ? list[j] : list[j].nextSibling);
    onSort(items().map((n) => n.dataset.id));
    if (hadFocus) refocus(item.dataset.id, item);
    return true;
  };
  container._sortStep = step;

  container.addEventListener('keydown', (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const delta = e.key === 'ArrowUp' || (axis === 'x' && e.key === 'ArrowLeft') ? -1
      : e.key === 'ArrowDown' || (axis === 'x' && e.key === 'ArrowRight') ? 1 : 0;
    const item = delta ? itemOf(e.target) : null;
    if (!item) return;
    e.preventDefault();
    step(item, delta);
  });

  // ----- Pantalla táctil: mantener pulsado y arrastrar -----
  // (El arrastre con ratón usa los eventos de arrastrar y soltar del navegador, más abajo.)

  let touch = null; // { item, x, y, timer, active, before }
  const dropTouch = () => {
    if (!touch) return null;
    const was = touch;
    clearTimeout(was.timer);
    if (was.active) {
      was.item.classList.remove('dragging');
      container.classList.remove('sorting');
    }
    touch = null;
    return was;
  };
  container.addEventListener('touchstart', (e) => {
    dropTouch();
    const item = e.touches.length === 1 ? itemOf(e.target) : null;
    // Los botones y menús de la fila siguen funcionando con un toque normal.
    if (!item || (e.target.closest && e.target.closest('button, input, select, textarea, .menu-wrap'))) return;
    const point = e.touches[0];
    touch = { item, x: point.clientX, y: point.clientY, active: false, before: order() };
    touch.timer = setTimeout(() => {
      if (!touch) return;
      touch.active = true;
      item.classList.add('dragging');
      container.classList.add('sorting');
    }, 380);
  }, { passive: true });
  container.addEventListener('touchmove', (e) => {
    if (!touch) return;
    const point = e.touches[0];
    if (!touch.active) {
      // El dedo se ha movido antes de tiempo: es un desplazamiento de la página, no un arrastre.
      if (Math.abs(point.clientX - touch.x) + Math.abs(point.clientY - touch.y) > 10) dropTouch();
      return;
    }
    if (e.cancelable) e.preventDefault();
    const under = document.elementFromPoint(point.clientX, point.clientY);
    const over = itemOf(under);
    if (!over || over === touch.item) return;
    const r = over.getBoundingClientRect();
    const after = axis === 'x' ? point.clientX > r.left + r.width / 2 : point.clientY > r.top + r.height / 2;
    container.insertBefore(touch.item, after ? over.nextSibling : over);
  }, { passive: false });
  const endTouch = () => {
    const was = dropTouch();
    if (!was || !was.active) return;
    // El toque con que termina el arrastre no debe abrir el enlace de la fila.
    const stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
    container.addEventListener('click', stop, true);
    setTimeout(() => container.removeEventListener('click', stop, true), 350);
    if (order() !== was.before) onSort(items().map((n) => n.dataset.id));
  };
  container.addEventListener('touchend', endTouch);
  container.addEventListener('touchcancel', endTouch);
  // Mantener pulsado un enlace abre el menú del navegador: no mientras se está arrastrando.
  container.addEventListener('contextmenu', (e) => { if (touch && touch.active) e.preventDefault(); });

  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest ? e.target.closest('[data-id]') : null;
    if (!item || item.parentNode !== container) return;
    dragEl = item;
    before = items().map((n) => n.dataset.id).join(',');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', item.dataset.id); } catch (err) { /* algunos navegadores lo restringen */ }
    requestAnimationFrame(() => item.classList.add('dragging'));
  });
  container.addEventListener('dragover', (e) => {
    if (!dragEl) return;
    e.preventDefault();
    const over = e.target.closest ? e.target.closest('[data-id]') : null;
    if (!over || over === dragEl || over.parentNode !== container) return;
    const r = over.getBoundingClientRect();
    const after = axis === 'x' ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
    container.insertBefore(dragEl, after ? over.nextSibling : over);
  });
  container.addEventListener('drop', (e) => { if (dragEl) e.preventDefault(); });
  container.addEventListener('dragend', () => {
    if (!dragEl) return;
    dragEl.classList.remove('dragging');
    dragEl = null;
    const ids = items().map((n) => n.dataset.id);
    if (ids.join(',') !== before) onSort(ids);
  });
}
