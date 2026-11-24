// Bloques compartidos por varias páginas: galería de imágenes, eventos, apariciones
// en escenas y página de texto enriquecido con estado.
import { h, clear, icon } from './dom.js';
import { t, tn } from './i18n.js';
import { store } from './store.js';
import { api } from './api.js';
import { uid, formatDateTime, excerpt } from './text.js';
import { createEditor } from './editor.js';
import { getPrefs } from './prefs.js';
import { btn, addBtn, linkBtn, chooseBtn, hoverPop, toast, errorText, confirmDialog, formDialog, promptDialog, pickDialog, modal, statusPicker, pageHeader, statusDot } from './ui.js';
import {
  scenesReferencing, chapterLabel, chapterNumbers, displayName, entityHref, locationLabel, povLabel, ENTITY_TYPES, strandSummary,
  validIds, eventsOf, eventTargets, EVENT_TARGET_TYPES, entityCode, sceneLocations, locationDetail, customSummary, customType,
  locationParent, locationChildren, locationDescendants, ageAt, bookSpan,
  allScenesOrdered, eventLinks, eventHosts, eventTellers, eventTime, eventEnd, EVENT_MODES, sceneDuration, locationColor,
} from './model.js';
import { extractTraits, traitKey } from './traits.js';
import { ignoredChecks, setIgnored } from './continuity.js';

export function autosaveDelay() {
  return Math.max(0.5, Number(getPrefs().autosaveSeconds) || 2) * 1000;
}

/** Muestra una imagen en grande (en un diálogo). */
export function viewImage(img) {
  modal({ title: img.name || t('images.title'), wide: true, body: h('img.image-full', { src: api.imageUrl(img), alt: img.name || '' }) });
}

/** Galería de imágenes de un elemento, con subida, borrado e imagen principal. */
export function imagesPanel(entity, { onChange } = {}) {
  const wrap = h('section.panel');
  const draw = () => {
    clear(wrap);
    const imgs = store.imagesOf(entity.id);
    const input = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp', multiple: true, hidden: true });
    input.addEventListener('change', async () => {
      for (const file of input.files) {
        try {
          const img = await store.uploadImage(entity.id, file);
          if (!entity.data.profileImage) await store.patchData(entity.id, { profileImage: img.id });
        } catch (err) {
          toast(errorText(err), 'error');
        }
      }
      draw();
      if (onChange) onChange();
    });
    wrap.append(
      h('div.panel-head', h('h3', t('images.title')), addBtn(() => input.click(), t('images.addTitle'))),
      input);
    if (!imgs.length) {
      wrap.append(h('p.muted', t('images.empty')));
      return;
    }
    wrap.append(h('div.image-grid', imgs.map((img) => {
      const isProfile = entity.data.profileImage === img.id;
      return h('figure', { class: 'image-item' + (isProfile ? ' is-profile' : '') },
        h('img', { src: api.imageUrl(img), alt: img.name || '', loading: 'lazy', onclick: () => viewImage(img) }),
        h('figcaption',
          btn('', { icon: 'check', small: true, kind: isProfile ? 'primary' : 'ghost', title: t('images.setProfile'), onClick: async () => {
            await store.patchData(entity.id, { profileImage: img.id });
            draw();
            if (onChange) onChange();
          } }),
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.delete'), onClick: async () => {
            if (!(await confirmDialog(t('images.confirmDelete'), { danger: true, confirmLabel: t('common.delete') }))) return;
            try {
              await store.deleteImage(img.id);
              if (isProfile) await store.patchData(entity.id, { profileImage: null });
            } catch (err) { toast(errorText(err), 'error'); }
            draw();
            if (onChange) onChange();
          } })));
    })));
  };
  draw();
  return wrap;
}

export function profileImage(entity) {
  const imgs = store.imagesOf(entity.id).filter((i) => /^image\//.test(i.mime || 'image/'));
  return imgs.find((i) => i.id === entity.data.profileImage) || imgs[0] || null;
}

/** «Dentro de» y «Contiene» en la ficha de un lugar: el que lo contiene y los que tiene dentro. */
export function locationNestPanel(loc) {
  const wrap = h('section.panel.nest-panel');
  const draw = () => {
    clear(wrap);
    const parent = locationParent(loc);
    const children = locationChildren(loc);
    const choose = async () => {
      // Un lugar no puede estar dentro de sí mismo ni de algo que él contiene.
      const banned = new Set([loc.id, ...locationDescendants(loc).map((l) => l.id)]);
      const picked = await pickDialog({
        title: t('location.inside'), single: true, selected: parent ? [parent.id] : [],
        items: store.list('location').filter((l) => !banned.has(l.id)).map((l) => pickItem(l)),
        emptyText: t('location.noOther'), noneLabel: t('location.topLevel'),
      });
      if (!picked) return;
      await store.patchData(loc.id, { parentId: picked[0] || null });
      draw();
    };
    const addChild = async () => {
      const name = await promptDialog({ title: t('location.addInside', { name: displayName(loc) }), submitLabel: t('common.create') });
      if (!name) return;
      try {
        const child = await store.create('location', { name, data: { parentId: loc.id } });
        window.location.hash = entityHref(child);
      } catch (err) { toast(errorText(err), 'error'); }
    };
    wrap.append(
      h('div.tag-field',
        h('div.tag-head', h('span.form-label', t('location.inside')), chooseBtn(choose, !!parent)),
        parent
          ? h('div.mini-cards', miniCard(parent, { onRemove: async () => { await store.patchData(loc.id, { parentId: null }); draw(); } }))
          : h('p.muted.small', t('location.topLevelNote'))),
      h('div.tag-field',
        h('div.tag-head', h('span.form-label', t('location.contains')), addBtn(addChild, t('location.addChild'))),
        children.length ? h('div.mini-cards', children.map((c) => miniCard(c))) : h('p.muted.small', t('location.noChildren'))));
  };
  draw();
  return wrap;
}

/**
 * Fechas de un personaje en su ficha: nacimiento y muerte, con la edad que tiene al empezar y
 * al terminar el libro. (Los parentescos y demás vínculos se dibujan en «Relaciones».)
 */
export function lifeDatesPanel(c) {
  const wrap = h('div.life-dates');
  const draw = () => {
    clear(wrap);
    // Edad al empezar y al terminar el libro (primera y última escena con fecha).
    const agesEl = h('p.family-ages');
    const drawAges = () => {
      const span = bookSpan();
      const ages = [];
      if (span && c.data.birth) {
        const a = ageAt(c, span.start);
        const b = ageAt(c, span.end);
        if (a != null) ages.push(a === b || b == null ? tn('family.ageBook', a) : t('family.ageRange', { from: a, to: b }));
      }
      if (c.data.birth && c.data.death && ageAt(c, c.data.death) != null) ages.push(tn('family.ageDeath', ageAt(c, c.data.death)));
      agesEl.textContent = ages.join(' · ');
    };
    // Al teclear una fecha el navegador avisa del cambio a cada cifra del año: se guarda y se
    // actualiza solo la línea de la edad, sin repintar el panel (se perdería el cursor a medio escribir).
    const date = (key) => {
      const input = h('input.input', { type: 'date' });
      input.value = c.data[key] || '';
      input.addEventListener('change', async () => {
        await store.patchData(c.id, { [key]: input.value || null }, 400);
        drawAges();
        afterDeath.hidden = !c.data.death;
      });
      return h('label.family-date', h('span.form-label', t('family.' + key)), input);
    };
    drawAges();
    // Un personaje puede seguir saliendo después de morir (su cuerpo, un recuerdo, un espectro):
    // con esta casilla, «Continuidad» deja de avisar de ello. Es lo mismo que ignorar allí su aviso.
    const key = 'afterDeath:' + c.id;
    const box = h('input', { type: 'checkbox' });
    box.checked = ignoredChecks().has(key);
    box.addEventListener('change', () => setIgnored(key, box.checked).catch((err) => toast(errorText(err), 'error')));
    const afterDeath = h('label.form-check.after-death', { hidden: !c.data.death }, box, h('span', t('check.afterDeathOk')));

    wrap.append(h('div.family-dates', date('birth'), date('death'), agesEl), afterDeath);
  };
  draw();
  return wrap;
}

/** Campos propios de una ficha de un tipo definido por el usuario. */
export function customFieldsPanel(e) {
  const ct = customType(e);
  if (!ct || !(ct.fields || []).length) return null;
  return h('section.panel', h('div.field-grid', ct.fields.map((f) => {
    const input = h('input.input', { type: 'text', maxlength: 300 });
    input.value = (e.data.values || {})[f.id] || '';
    input.addEventListener('change', () => store.patchData(e.id, { values: { ...(e.data.values || {}), [f.id]: input.value.trim() } }));
    return h('label.form-row', h('span.form-label', f.label), input);
  })));
}

/** Identificador visible de un elemento («P-003») como texto discreto, o null si no lleva. */
export function codeTag(e) {
  const code = entityCode(e);
  return code ? h('span.code', { title: t('code.title') }, code) : null;
}

/**
 * Título editable de una ficha con su identificador delante, como el número de un capítulo.
 * `input` es el campo del título (titleInput).
 */
export function titleWithCode(e, input) {
  const code = entityCode(e);
  return code ? h('div.title-with-prefix', h('span.title-prefix', { title: t('code.title') }, code), input) : input;
}

/** Línea de detalle de un elemento: dónde está un lugar, o de qué tipo es lo demás. */
export function entitySubtitle(e) {
  if (!e) return '';
  if (e.type === 'location') return locationDetail(e) || t('location.singular');
  // Con papel en la historia («Antagonista», «Arma del crimen»), ese es el detalle que se muestra.
  const role = e.data.role && String(e.data.role).trim();
  if (role && (e.type === 'character' || e.type === 'object')) return role;
  if (e.type === 'character') return t(e.data.kind === 'secondary' ? 'character.secondary' : 'character.main');
  if (e.type === 'strand') return strandSummary(e) || t('strand.singular');
  return t(e.type + '.singular');
}

/** Fila de un selector (pickDialog) para un elemento: imagen o icono, nombre y, en los lugares, dónde está. */
export function pickItem(e, extra = {}) {
  const img = profileImage(e);
  const cfg = ENTITY_TYPES[e.type] || {};
  return {
    id: e.id,
    label: displayName(e),
    sub: e.type === 'location' ? locationDetail(e)
      : e.type === 'custom' ? customSummary(e)
      : e.type === 'strand' ? strandSummary(e)
        : e.type === 'character' || e.type === 'object' ? (e.data.role || '') : '',
    image: img ? api.imageUrl(img) : null,
    icon: e.type === 'custom' ? (customType(e) || {}).icon || 'grid' : cfg.icon || null,
    code: entityCode(e),
    ...extra,
  };
}

/**
 * Ficha pequeña de un elemento ya elegido (en la escena: su lugar, sus personajes…): imagen o
 * icono, nombre con enlace a su ficha y, debajo, identificador y detalle. `auto` la marca como
 * detectada en el texto; `onRemove` añade el botón de quitarla.
 */
export function miniCard(e, { auto = false, onRemove, note = '' } = {}) {
  const item = pickItem(e);
  // `note`: un dato del momento, como la edad del personaje en la fecha de la escena.
  const sub = [item.sub || (e.type === 'character' ? t(e.data.kind === 'secondary' ? 'character.secondary' : 'character.main') : ''), note].filter(Boolean).join(' · ');
  return h('div', { class: `mini-card k-${e.type}` + (auto ? ' is-auto' : ''), title: auto ? t('tags.auto') : null, dataset: { id: e.id } },
    item.image
      ? h('img.mini-thumb', { src: item.image, alt: '', loading: 'lazy', draggable: 'false' })
      : h('span.mini-thumb.placeholder', { style: e.type === 'group' && e.data.color ? { background: e.data.color, color: '#fff' } : null }, icon(item.icon || 'note', 17)),
    h('a.mini-text', { href: entityHref(e), draggable: 'false' },
      h('span.mini-name', displayName(e)),
      item.code || sub ? h('span.mini-sub', item.code ? h('span.code', item.code) : null, item.code && sub ? ' · ' : null, sub || null) : null),
    auto ? h('span.auto-mark', t('tags.autoSample')) : null,
    onRemove ? h('button.chip-x', { type: 'button', 'aria-label': t('common.remove'), title: t('common.remove'), onclick: onRemove }, icon('x', 13)) : null);
}

/**
 * Diálogo para crear o editar un evento. `ev` es el evento que se edita (o null) y `preset`
 * los ids de los elementos a los que pertenecerá uno nuevo. «Pertenece a» admite ninguno
 * (evento general, de toda la historia), uno o varios personajes, lugares, objetos y grupos.
 * Devuelve { title, time, description, targets } o null si se cancela.
 */
export function eventDialog(ev, preset = [], presetScenes = []) {
  return new Promise((resolve) => {
    let done = false;
    let targets = validIds(ev ? ev.data.targets : preset);
    // Escenas enlazadas: [{ id, mode }] ('in': ocurre en ella y toma su fecha; 'told': se cuenta en ella).
    let links = ev ? eventLinks(ev).map((l) => ({ id: l.scene.id, mode: l.mode })) : presetScenes.filter((l) => store.get(l.id)).map((l) => ({ ...l }));
    const title = h('input.input', { type: 'text', maxlength: 250, required: true, autocomplete: 'off' });
    title.value = ev ? ev.name || '' : '';
    const time = h('input.input', { type: 'datetime-local', required: true });
    // Un evento importado puede traer solo el día: el campo pide también la hora.
    const stored = ev ? ev.data.time || '' : '';
    time.value = stored && !stored.includes('T') ? stored + 'T00:00' : stored;
    const description = h('textarea.input', { rows: 3, maxlength: 2000 });
    description.value = ev ? ev.data.description || '' : '';

    // Cuándo: su propia fecha o, si ocurre en una escena con fecha, la de esa escena.
    const numbers = chapterNumbers();
    const sceneName = (s) => `${store.get(s.parent_id) ? chapterLabel(store.get(s.parent_id), numbers) + ' · ' : ''}${displayName(s)}`;
    const hostScenes = () => links.filter((l) => l.mode === 'in').map((l) => store.get(l.id));
    const datedHost = () => hostScenes().filter((s) => s.data.time).sort((a, b) => (a.data.time < b.data.time ? -1 : 1))[0] || null;
    const inherited = h('p.event-inherited', { hidden: true });
    const whenHint = h('span.form-hint', { hidden: true }, t('events.timeToScene'));
    const drawWhen = () => {
      const host = datedHost();
      time.hidden = !!host;
      time.required = !host;
      inherited.hidden = !host;
      if (host) clear(inherited).append(icon('link', 14), h('span', t('events.timeFrom', { when: formatDateTime(host.data.time), scene: sceneName(host) })));
      whenHint.hidden = !!host || !hostScenes().length;
    };
    const where = h('div.event-scenes');
    const chooseScenes = async () => {
      const items = allScenesOrdered().map((s) => ({
        id: s.id, label: displayName(s), code: entityCode(s), icon: 'book',
        sub: s.data.time ? formatDateTime(s.data.time) : t('timeline.noDate'),
        group: store.get(s.parent_id) ? chapterLabel(store.get(s.parent_id), numbers) : '',
      }));
      const picked = await pickDialog({ title: t('events.linkScene'), items, selected: links.map((l) => l.id), emptyText: t('events.noScenesYet') });
      if (!picked) return;
      links = picked.map((id) => links.find((l) => l.id === id) || { id, mode: 'in' });
      drawScenes();
    };
    const drawScenes = () => {
      clear(where);
      where.append(...[
        links.length ? h('div.event-scene-list', links.map((l) => {
          const s = store.get(l.id);
          const mode = h('select.input', { 'aria-label': t('events.mode') }, EVENT_MODES.map((m) => h('option', { value: m }, t('events.mode.' + m))));
          mode.value = l.mode;
          mode.addEventListener('change', () => { l.mode = mode.value; drawWhen(); });
          return h('div.event-scene-row',
            h('span.event-scene-name', icon('book', 14), h('span', sceneName(s)), codeTag(s)),
            mode,
            btn('', { icon: 'x', small: true, kind: 'ghost', title: t('common.remove'), onClick: () => { links = links.filter((x) => x !== l); drawScenes(); } }));
        })) : null,
        h('div.btn-row', linkBtn(chooseScenes, t('events.linkScene'))),
      ].filter(Boolean));
      drawWhen();
    };
    drawScenes();

    const who = h('div.event-targets');
    const choose = async () => {
      const items = EVENT_TARGET_TYPES.flatMap((type) => store.list(type).map((e) => pickItem(e, { group: t(type + '.plural') })));
      const picked = await pickDialog({ title: t('events.belongs'), items, selected: targets, emptyText: t('tags.noneAvailable') });
      if (picked) { targets = picked; drawWho(); }
    };
    const drawWho = () => {
      clear(who);
      who.append(...[
        targets.length
          ? h('div.chips', targets.map((id) => {
            const e = store.get(id);
            return h('span', { class: 'chip k-' + e.type },
              icon((ENTITY_TYPES[e.type] || {}).icon || 'note', 12), h('span', displayName(e)),
              h('button.chip-x', { type: 'button', 'aria-label': t('common.remove'), onclick: () => { targets = targets.filter((x) => x !== id); drawWho(); } }, icon('x', 12)));
          }))
          : h('p.muted.small', t('events.generalNote')),
        h('div.btn-row',
          chooseBtn(choose, targets.length > 0, t('events.choose')),
          targets.length ? btn(t('events.makeGeneral'), { small: true, kind: 'ghost', onClick: () => { targets = []; drawWho(); } }) : null),
      ].filter(Boolean));
    };
    drawWho();

    const submit = () => {
      if (!form.reportValidity()) return;
      done = true;
      m.close();
      // Si la fecha viene de una escena, la propia se conserva (o se apunta la de la escena la
      // primera vez) para cuando se quite el enlace.
      const host = datedHost();
      resolve({ title: title.value.trim(), time: host ? stored || host.data.time : time.value, description: description.value.trim(), targets, scenes: links.map((l) => ({ id: l.id, mode: l.mode })) });
    };
    const form = h('form.form', { onsubmit: (e) => { e.preventDefault(); submit(); } },
      h('label.form-row', h('span.form-label', t('events.name')), title),
      h('label.form-row', h('span.form-label', t('events.when')), time, inherited, whenHint),
      h('label.form-row', h('span.form-label', t('common.description')), description),
      h('div.form-row', h('span.form-label', t('events.scenes')), h('span.form-hint', t('events.scenesHint')), where),
      h('div.form-row', h('span.form-label', t('events.belongs')), who),
      h('button', { type: 'submit', hidden: true }));
    const m = modal({
      title: t(ev ? 'events.edit' : 'events.add'), body: form, wide: true,
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(t('common.save'), { kind: 'primary', onClick: submit })],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

/** Guarda lo que devuelve eventDialog: crea el evento (ev = null) o lo modifica. */
export async function saveEvent(ev, out) {
  const data = { time: out.time, description: out.description, targets: out.targets };
  if (out.scenes) data.scenes = out.scenes;
  const saved = ev ? await store.update(ev.id, { name: out.title, data: { ...ev.data, ...data } }) : await store.create('event', { name: out.title, data });
  await dateHostScene(out.scenes, out.time);
  return saved;
}

/**
 * Si un evento con fecha ocurre en escenas que no la tienen, la primera toma la del evento
 * (así quien planifica por eventos no tiene que poner la fecha dos veces). Desde entonces
 * manda la escena: el evento la sigue si cambia.
 */
export async function dateHostScene(links, time) {
  if (!time || !Array.isArray(links)) return;
  const hosts = links.filter((l) => l.mode !== 'told').map((l) => store.get(l.id)).filter(Boolean);
  if (!hosts.length || hosts.some((s) => s.data.time)) return;
  await store.patchData(hosts[0].id, { time });
  toast(t('events.sceneDated', { scene: displayName(hosts[0]) }), 'info', 6000);
}

/** «Ocurre en…» y «Se cuenta en…»: las escenas de un evento, con enlace. null si no tiene. */
export function eventScenesNote(ev) {
  const line = (key, scenes) => (scenes.length ? h('span.event-where', icon(key === 'events.occursIn' ? 'book' : 'note', 12), h('span', t(key)), ' ',
    scenes.flatMap((s, i) => [i ? ', ' : '', h('a', { href: entityHref(s) }, displayName(s))])) : null);
  const parts = [line('events.occursIn', eventHosts(ev)), line('events.toldIn', eventTellers(ev))].filter(Boolean);
  return parts.length ? h('span.event-wheres', parts) : null;
}

/** «3 de diciembre de 2059 a las 21:30» o, si dura varias escenas, «… → 4 de diciembre…». */
export function eventWhen(ev) {
  const end = eventEnd(ev);
  return formatDateTime(eventTime(ev)) + (end ? ` → ${formatDateTime(end)}` : '');
}

/** Pregunta y manda un evento a la papelera. Devuelve si se ha borrado. */
export async function removeEvent(ev) {
  if (!(await confirmDialog(t('events.confirmDelete'), { danger: true, confirmLabel: t('common.delete') }))) return false;
  await store.remove(ev.id);
  return true;
}

/** Eventos (con fecha) de un elemento; alimentan la línea temporal. */
export function eventsPanel(entity) {
  const wrap = h('section.panel');
  const guard = async (fn) => {
    try { await fn(); } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };
  const draw = () => {
    clear(wrap);
    const events = eventsOf(entity.id);
    wrap.append(h('div.panel-head', h('h3', t('events.title')), addBtn(async () => {
      const out = await eventDialog(null, [entity.id]);
      if (out) await guard(() => saveEvent(null, out));
    }, t('events.add'))));
    if (!events.length) {
      wrap.append(h('p.muted', t('events.empty')));
      return;
    }
    wrap.append(h('ul.event-list', events.map((ev) => {
      // Un evento puede ser también de otros elementos: se indica con quién se comparte.
      const others = eventTargets(ev).filter((e) => e.id !== entity.id);
      return h('li.event-item',
        h('div.event-main',
          h('span.event-time', eventWhen(ev), ' ', codeTag(ev)),
          h('strong', displayName(ev)),
          ev.data.description ? h('p.muted', ev.data.description) : null,
          eventScenesNote(ev),
          others.length ? h('p.muted.small', t('events.also', { names: others.map((e) => displayName(e)).join(', ') })) : null),
        h('div.event-actions',
          btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: async () => {
            const out = await eventDialog(ev);
            if (out) await guard(() => saveEvent(ev, out));
          } }),
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.delete'), onClick: () => guard(() => removeEvent(ev)) })));
    })));
  };
  draw();
  return wrap;
}

/** Escenas en las que aparece un elemento. */
export function appearsPanel(entity) {
  const scenes = scenesReferencing(entity);
  const numbers = chapterNumbers();
  const wrap = h('section.panel', h('div.panel-head', h('h3', t('appears.title')), h('span.muted', tn('count.scenes', scenes.length))));
  if (!scenes.length) {
    wrap.append(h('p.muted', t('appears.empty')));
    return wrap;
  }
  wrap.append(h('ul.appears-list', scenes.map((s) => {
    const chapter = store.get(s.parent_id);
    return h('li', h('a', { href: entityHref(s) },
      statusDot(s.status),
      h('span.appears-scene', displayName(s)),
      h('span.muted', chapter ? chapterLabel(chapter, numbers) : '')));
  })));
  return wrap;
}

/**
 * Un lugar como cuadro de su color, para las filas donde el nombre entero no cabe (las escenas
 * de un capítulo, la tabla de apariciones). Al pasar el ratón, o al mantener pulsado en una
 * pantalla táctil, sale qué lugar es, dónde está, el principio de su descripción y en cuántas
 * escenas aparece.
 */
export function placeTag(loc) {
  return hoverPop(
    h('span.strand-tag', { style: { '--strand': locationColor(loc) }, role: 'img', 'aria-label': locationLabel(loc) }),
    () => {
      const detail = locationDetail(loc);
      const text = excerpt(loc.body, 180);
      return h('div.strand-pop',
        h('strong', displayName(loc), ' ', codeTag(loc)),
        detail ? h('span.muted', detail) : null,
        text ? h('p', text) : null,
        h('span.muted', tn('chapters.placeScenes', scenesReferencing(loc).length)));
    });
}

/** Los lugares de una escena, cada uno como un cuadro de color (o null si no tiene ninguno). */
export function placeTags(scene) {
  const places = sceneLocations(scene);
  return places.length ? h('span.place-tags', places.map(placeTag)) : null;
}

/** Resumen en una línea de las etiquetas de una escena. */
export function sceneTagSummary(scene) {
  const parts = [];
  const pov = povLabel(scene);
  if (pov) parts.push(pov);
  // Un lugar se da completo («Faro, Cangas»); varios, solo por su nombre.
  const places = sceneLocations(scene);
  if (places.length === 1) parts.push(locationLabel(places[0]));
  else if (places.length) parts.push(places.map((l) => displayName(l)).join(', '));
  // Con inicio y fin, la fecha lleva detrás cuánto dura la escena.
  if (scene.data.time) parts.push(formatDateTime(scene.data.time) + (sceneDuration(scene) ? ` (${sceneDuration(scene)})` : ''));
  return parts.join(' · ');
}

/**
 * Página con un único texto enriquecido y su estado (premisa, motivo del capítulo, notas...).
 * Devuelve la función de limpieza que debe devolver la página.
 */
export function richFieldPage(el, { title, hint, back, html, status, onHtml, onStatus, lang, extraActions = [] }) {
  const editor = createEditor({
    value: html || '', toolbar: 'full', lang, placeholder: t('editor.placeholder'),
    onChange: (value, stats) => onHtml(value, stats),
    onSave: () => store.flush(),
  });
  el.append(
    pageHeader({
      title, subtitle: hint, back,
      actions: [...extraActions, onStatus ? statusPicker(status || 0, onStatus) : null],
    }),
    h('div.editor-page', editor.el));
  return async () => {
    editor.flush();
    editor.destroy();
  };
}

/** Campo «Papel en la historia»: una línea que se muestra bajo el nombre en tarjetas, selectores y mapas. */
export function roleField(entity) {
  const input = h('input.input', { type: 'text', maxlength: 120, placeholder: t('role.placeholder.' + entity.type) });
  input.value = entity.data.role || '';
  input.addEventListener('change', () => store.patchData(entity.id, { role: input.value.trim() }));
  return h('label.form-row', h('span.form-label', t('role.label')), input, h('span.form-hint', t('role.hint')));
}

/**
 * Preguntas propias sobre un tipo de elemento (por ahora, los lugares). Las preguntas son
 * del proyecto y valen para todos los elementos del tipo; cada uno guarda sus respuestas.
 */
export function questionsPanel(entity) {
  const wrap = h('section.panel');
  const type = entity.type;
  const questions = () => ((store.project.data.customQuestions || {})[type] || []);
  const saveQuestions = (list) => store.patchProjectData({ customQuestions: { ...(store.project.data.customQuestions || {}), [type]: list } });
  const draw = () => {
    clear(wrap);
    wrap.append(h('div.panel-head', h('h3', t('questions.title')), addBtn(async () => {
      const text = await promptDialog({ title: t('character.addQuestion'), label: t('character.question'), submitLabel: t('common.create') });
      if (!text) return;
      try { await saveQuestions([...questions(), { id: uid(), text }]); } catch (err) { toast(errorText(err), 'error'); }
      draw();
    }, t('character.addQuestion'))));
    if (!questions().length) {
      wrap.append(h('p.muted', t('questions.empty.' + type)));
      return;
    }
    const answers = entity.data.answers || {};
    for (const q of questions()) {
      const area = h('textarea.input', { rows: 2, maxlength: 4000 });
      area.value = answers[q.id] || '';
      area.addEventListener('change', () => store.patchData(entity.id, { answers: { ...(entity.data.answers || {}), [q.id]: area.value.trim() } }));
      wrap.append(h('div.question-item',
        h('div.question-item-head', h('span.question-item-text', q.text),
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('character.deleteQuestion'), onClick: async () => {
            if (!(await confirmDialog(t('questions.confirmDelete'), { danger: true, confirmLabel: t('common.delete') }))) return;
            try { await saveQuestions(questions().filter((x) => x.id !== q.id)); } catch (err) { toast(errorText(err), 'error'); }
            draw();
          } })),
        area));
    }
  };
  draw();
  return wrap;
}

/** Campo «También aparece como»: otros nombres con los que se reconoce el elemento en el texto. */
export function aliasesField(entity, hintKey = 'aliases.hint') {
  const input = h('input.input', { type: 'text', maxlength: 300, placeholder: t('aliases.placeholder') });
  input.value = entity.data.aliases || '';
  input.addEventListener('change', () => store.patchData(entity.id, { aliases: input.value.trim() }));
  return h('label.form-row', h('span.form-label', t('aliases.label')), input, h('span.form-hint', t(hintKey)));
}

/**
 * Rasgos clave de un personaje. Los automáticos se extraen del texto (getSegments) cada vez
 * que se llama a refresh(); el usuario puede descartarlos o añadir los suyos.
 * Devuelve { el, refresh }.
 */
export function traitsPanel(entity, getSegments) {
  const wrap = h('section.panel.traits-panel');
  const list = (key) => (Array.isArray(entity.data[key]) ? entity.data[key] : []);

  const draw = () => {
    clear(wrap);
    const hidden = new Set(list('traitsHidden'));
    const auto = list('traitsAuto');
    const shown = auto.filter((x) => !hidden.has(traitKey(x)));
    const manual = list('traitsManual').filter((m) => !shown.some((a) => traitKey(a) === traitKey(m)));
    const discarded = auto.length - shown.length;

    wrap.append(h('div.panel-head',
      h('h3', t('traits.title')),
      addBtn(async () => {
        const text = await promptDialog({ title: t('traits.add'), label: t('traits.name'), submitLabel: t('common.create') });
        if (!text) return;
        const key = traitKey(text);
        // Si coincide con uno descartado, se recupera en lugar de duplicarlo.
        if (hidden.has(key)) await store.patchData(entity.id, { traitsHidden: list('traitsHidden').filter((k) => k !== key) });
        else if (![...auto, ...list('traitsManual')].some((x) => traitKey(x) === key)) {
          await store.patchData(entity.id, { traitsManual: [...list('traitsManual'), text] });
        }
        draw();
      }, t('traits.add'))));

    const chip = (text, isAuto) => h('span', { class: 'chip' + (isAuto ? ' chip-auto' : ''), title: isAuto ? t('traits.auto') : null },
      h('span', text),
      h('button.chip-x', { type: 'button', 'aria-label': t('common.remove'), onclick: async () => {
        if (isAuto) await store.patchData(entity.id, { traitsHidden: [...new Set([...list('traitsHidden'), traitKey(text)])] });
        else await store.patchData(entity.id, { traitsManual: list('traitsManual').filter((x) => x !== text) });
        draw();
      } }, icon('x', 12)));

    if (shown.length || manual.length) {
      wrap.append(h('div.chips', shown.map((x) => chip(x, true)), manual.map((x) => chip(x, false))));
    } else {
      wrap.append(h('p.muted.small', t('traits.empty')));
    }
    if (discarded > 0) {
      wrap.append(h('button.link-btn.small', { type: 'button', onclick: async () => {
        await store.patchData(entity.id, { traitsHidden: [] });
        draw();
      } }, tn('traits.showHidden', discarded)));
    }
  };

  const refresh = () => {
    if (!store.get(entity.id)) return;
    const auto = extractTraits(getSegments(), store.project.language);
    if (auto.join('|') !== list('traitsAuto').join('|')) {
      store.patchData(entity.id, { traitsAuto: auto }, autosaveDelay());
      draw();
    }
  };

  refresh();
  draw();
  return { el: wrap, refresh };
}

export function iconBadge(name) {
  return h('span.icon-badge', icon(name, 22));
}
