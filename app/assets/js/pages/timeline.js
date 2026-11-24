// Línea temporal: escenas con fecha, eventos de personajes, lugares, objetos y grupos, y
// eventos generales (hechos del mundo que sirven de referencia). Cada escena muestra quién
// sale en ella y dónde ocurre; la línea puede seguir a un solo elemento y verse en orden
// cronológico o en el orden en que el lector encuentra las escenas.
import { h, clear, icon } from '../dom.js';
import { t, tn, tr } from '../i18n.js';
import { store } from '../store.js';
import { compileQuery, plain } from '../timesearch.js';
import { formatDate, formatDateTime, formatClock, formatNumber, parseLocal } from '../text.js';
import { btn, pageHeader, emptyState, toast, errorText, hoverPop, modal, formDialog } from '../ui.js';
import { createScene } from './chapters.js';
import { spanBetween } from '../timespan.js';
import { exportTimelineDialog } from '../export/timeline.js';
import { importTimeline } from '../import/timeline.js';
import {
  timelineItems, entityLabel, displayName, sceneHas, validIds, chaptersOrdered, chapterNumbers, chapterLabel, scenesOf,
  allScenesOrdered, entityHref, entityCode, sceneLocations, EVENT_TARGET_TYPES,
  eventTargets, eventTime, eventLinks, sceneEvents, eventLinkCandidates, sceneDuration,
} from '../model.js';
import { eventDialog, saveEvent, removeEvent, codeTag, eventScenesNote } from '../components.js';

const KINDS = ['scene', 'character', 'location', 'object', 'group', 'event'];
const KIND_ICONS = { scene: 'book', character: 'user', location: 'pin', object: 'box', group: 'group', strand: 'layers', event: 'calendar', custom: 'grid' };
const FOCUS_TYPES = ['character', 'location', 'object', 'group', 'custom', 'strand'];
const MAX_TAGS = 8;
const kindLabel = (kind, plural) => t(kind === 'scene' ? (plural ? 'scenes.plural' : 'scenes.singular') : kind === 'event' ? (plural ? 'timeline.generalPlural' : 'timeline.general') : `${kind}.${plural ? 'plural' : 'singular'}`);

/** Elementos marcados en una escena, en el orden en que se muestran: lugar, personajes, objetos y grupos. */
function sceneTags(scene) {
  const d = scene.data;
  const out = [];
  out.push(...sceneLocations(scene));
  const people = validIds(d.characters).map((id) => store.get(id));
  const pov = d.pov && d.pov.characterId && store.get(d.pov.characterId);
  if (pov && !people.includes(pov)) people.unshift(pov);
  out.push(...people);
  for (const field of ['objects', 'groups', 'custom']) out.push(...validIds(d[field]).map((id) => store.get(id)));
  return out;
}

const dayOf = (time) => (time.indexOf('T') > 0 ? time.slice(0, time.indexOf('T')) : time);

/** «4 años», «1 hora»: una cantidad con su unidad, en el formato de números elegido. */
const unitText = (unit, n) => tn('unit.' + unit, n, { n: formatNumber(n) });

/**
 * Texto de un salto de tiempo en su unidad más grande («Pasan 4 años»). Al pasar el ratón
 * (o enfocarlo, o tocarlo) aparece un recuadro con el mismo intervalo contado en cada
 * unidad menor: tantos meses y días, tantas semanas, tantos días y horas, tantos minutos…
 */
function spanLabel(span, key, cls) {
  const label = h('span', { class: 'timeline-span' + (cls ? ' ' + cls : ''), tabindex: '0' },
    tn(key, span.count, { span: unitText(span.unit, span.count) }));
  return hoverPop(label, () => h('div.span-counters',
    h('strong', t('timeline.counters')),
    h('ul', span.lines.map((line) => h('li', line.map(([unit, n]) => unitText(unit, n)).join(', '))))));
}

const clock = (time) => {
  const d = time.indexOf('T') > 0 ? parseLocal(time) : null;
  return d ? formatClock(d) : '';
};

/**
 * Dónde van las marcas «Aquí empieza el libro» y «Aquí termina el libro» entre las entradas
 * visibles. El libro empieza en su primera escena en orden de lectura y termina en la última
 * (que no tienen por qué ser la más antigua y la más reciente). Cada marca va en un hueco:
 * el hueco i es el que hay justo antes de la entrada i, y el último queda tras la final.
 * Si la escena no está a la vista (por un filtro), la marca va en el hueco que le toca por fecha.
 */
function bookMarks(items, reading) {
  const first = reading[0];
  const last = reading[reading.length - 1];
  const out = { first, last, startSlot: -1, endSlot: -1, startShown: false, endShown: false };
  if (first && first.data.time) {
    let i = items.findIndex((x) => x.kind === 'scene' && x.entity === first);
    out.startShown = i >= 0;
    if (i < 0) i = items.findIndex((x) => x.time >= first.data.time);
    out.startSlot = i < 0 ? items.length : i;
  }
  if (last && last.data.time) {
    let i = items.findIndex((x) => x.kind === 'scene' && x.entity === last);
    out.endShown = i >= 0;
    if (i < 0) items.forEach((x, n) => { if (x.time <= last.data.time) i = n; });
    out.endSlot = i + 1;
  }
  // Si caen en el mismo hueco, primero la que ocurre antes.
  out.startFirst = !!first && !!last && (first.data.time || '') <= (last.data.time || '');
  return out;
}

export async function timelinePage({ el, refresh }) {
  const hidden = new Set();
  let focusId = '';
  let order = 'time'; // 'time' (cronológico) | 'book' (orden de lectura)
  const body = h('div');
  const bar = h('div.filter-row');
  // Buscador (timesearch.js): texto, fechas e identificadores, con «&» (y) y «|» (o).
  let query = '';
  let matcher = null; // null: sin búsqueda
  const searchInput = h('input.input.timeline-search', { type: 'search', placeholder: t('timeline.search'), 'aria-label': t('timeline.search') });
  const searchCount = h('span.muted.small');
  const searchHelp = hoverPop(
    h('button.help-tip', { type: 'button', 'aria-label': t('timeline.searchHelp') }, '?'),
    () => h('div.search-help', h('strong', t('timeline.searchHelp')), h('ul', (tr('timeline.searchHelp.items') || []).map((line) => h('li', line)))));
  /** Lo que se compara de una entrada: título, descripción, capítulo, hora, elementos e identificadores. */
  const entryText = (title, description, chapter, time, own, elements) => plain([
    title, description, chapter, clock(time || ''), entityCode(own),
    elements.map((e) => `${entityLabel(e)} ${entityCode(e)}`).join(' '),
  ].join(' '));

  // Un evento pertenece a quien se elija en su diálogo: a nadie (general), a uno o a varios.
  // Si se está siguiendo a un personaje, lugar, objeto o grupo, el evento nuevo nace asignado a él.
  const addEvent = async () => {
    const focus = store.get(focusId);
    const out = await eventDialog(null, focus && EVENT_TARGET_TYPES.includes(focus.type) ? [focus.id] : []);
    if (!out) return;
    try { await saveEvent(null, out); } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };
  const editEvent = async (ev) => {
    const out = await eventDialog(ev);
    if (!out) return;
    try { await saveEvent(ev, out); } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };
  const deleteEvent = async (ev) => {
    try { await removeEvent(ev); } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  const tagsOf = (scene, focus) => {
    const all = sceneTags(scene);
    if (!all.length) return null;
    return h('span.timeline-tags',
      all.slice(0, MAX_TAGS).map((e) => h('span', { class: 'timeline-tag k-' + e.type + (focus && e.id === focus.id ? ' is-focus' : '') }, icon(KIND_ICONS[e.type], 12), displayName(e))),
      all.length > MAX_TAGS ? h('span.timeline-tag.more', `+${all.length - MAX_TAGS}`) : null);
  };

  // ---------- Orden cronológico ----------

  /** Entradas que se ven ahora en orden cronológico, con los filtros por tipo y el «Seguir a» puestos. */
  const visibleItems = (focus) => {
    // Filtro por tipo: un evento de varios elementos se ve mientras quede a la vista alguno de sus tipos.
    let items = timelineItems().filter((i) => (i.kind === 'scene' ? !hidden.has('scene')
      : i.general ? !hidden.has('event') : i.types.some((type) => !hidden.has(type))));
    // Siguiendo a un elemento: los eventos en los que participa, los generales y las escenas en las que está marcado.
    if (focus) items = items.filter((i) => (i.kind === 'scene' ? sceneHas(i.entity, focus) : i.general || i.targets.some((e) => e.id === focus.id)));
    // Buscador: por texto (título, descripción, capítulo, elementos, identificadores) y por fecha.
    if (matcher) {
      items = items.filter((i) => matcher({
        time: i.time,
        // Una escena se encuentra también por los eventos que ocurren o se cuentan en ella.
        text: i.kind === 'scene' ? entryText(i.title, sceneEvents(i.entity).map((x) => `${displayName(x.ev)} ${entityCode(x.ev)}`).join(' '), i.sub, i.time, i.entity, sceneTags(i.entity))
          : entryText(i.title, i.description, '', i.time, i.event, i.targets),
      }));
    }
    return items;
  };

  /** Exporta lo que se ve (siempre en orden cronológico) a CSV, JSON, Excel o Word. */
  const exportTimeline = () => {
    const focus = focusId ? store.get(focusId) : null;
    let previous = null;
    const entries = visibleItems(focus).map((item) => {
      const span = previous ? spanBetween(previous.time, item.time) : null;
      previous = item;
      const isScene = item.kind === 'scene';
      return {
        time: item.time,
        kind: isScene ? 'scene' : 'event',
        type: isScene ? t('scenes.singular') : item.general ? t('timeline.general') : t('event.singular'),
        title: item.title,
        chapter: isScene ? item.sub : '',
        elements: (isScene ? sceneTags(item.entity) : item.targets).map((e) => ({ type: e.type, name: entityLabel(e) })),
        description: item.description || '',
        // Escenas enlazadas con el evento (por su identificador), para que el enlace vuelva al importar.
        scenes: isScene ? [] : eventLinks(item.event).map((l) => ({ code: entityCode(l.scene), title: displayName(l.scene), mode: l.mode })),
        span,
      };
    });
    return exportTimelineDialog(entries, { focus: focus ? displayName(focus) : '' });
  };

  /** Un evento dentro de la tarjeta de una escena: ocurre en ella (`told` = false) o se cuenta en ella. */
  const subRow = (ev, told, focus) => {
    const targets = eventTargets(ev);
    return h('div', { class: 'timeline-sub' + (told ? ' is-told' : '') },
      h('span.timeline-sub-icon', icon(told ? 'note' : 'calendar', 13)),
      h('span.timeline-sub-body',
        h('span.timeline-title', told ? h('span.muted', t('events.toldHere'), ' ') : null, h('strong', displayName(ev)), codeTag(ev),
          told && eventTime(ev) ? h('span.muted', ` · ${formatDateTime(eventTime(ev))}`) : null),
        ev.data.description && !told ? h('span.timeline-desc', ev.data.description) : null,
        targets.length ? h('span.timeline-tags', targets.map((e) => h('a', {
          class: 'timeline-tag k-' + e.type + (focus && e.id === focus.id ? ' is-focus' : ''), href: entityHref(e),
        }, icon(KIND_ICONS[e.type], 12), displayName(e)))) : null),
      h('span.timeline-actions',
        btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: () => editEvent(ev) })));
  };
  /** Lo que va dentro de una escena: los eventos que ocurren en ella (`hosted`) y los que se cuentan. */
  const insideOf = (scene, hosted, focus) => {
    const told = sceneEvents(scene).filter((x) => x.mode === 'told').map((x) => x.ev);
    if (!hosted.length && !told.length) return null;
    return h('div.timeline-inside', hosted.map((ev) => subRow(ev, false, focus)), told.map((ev) => subRow(ev, true, focus)));
  };

  /** Crea una escena para un evento suelto: toma su fecha y queda enlazada («ocurre aquí»). */
  const sceneFromEvent = async (ev) => {
    const numbers = chapterNumbers();
    const chapters = chaptersOrdered();
    if (!chapters.length) { toast(t('events.noChapters'), 'info'); return; }
    const out = await formDialog({
      title: t('events.toScene'), intro: t('events.toSceneHint'),
      fields: [
        { name: 'name', label: t('common.name'), value: displayName(ev), required: true },
        { name: 'chapter', label: t('chapters.singular'), type: 'select', value: chapters[chapters.length - 1].id, options: chapters.map((c) => ({ value: c.id, label: chapterLabel(c, numbers) })) },
      ],
      submitLabel: t('common.create'),
    });
    if (!out) return;
    try {
      const scene = await createScene(out.chapter, out.name);
      await store.patchData(scene.id, { time: ev.data.time || null });
      await store.patchData(ev.id, { scenes: [...(Array.isArray(ev.data.scenes) ? ev.data.scenes : []), { id: scene.id, mode: 'in' }] });
      toast(t('events.sceneCreated', { scene: displayName(scene) }), 'success');
    } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  /** Eventos sueltos que coinciden en fecha y hora con una escena: se propone enlazarlos, uno a uno. */
  const reviewCandidates = (candidates) => new Promise((resolve) => {
    let changed = false;
    const rows = candidates.map((c) => {
      const box = h('input', { type: 'checkbox' });
      box.checked = true;
      return { ...c, box, el: h('label.link-candidate', box,
        h('span.link-candidate-text',
          h('span', h('strong', displayName(c.ev)), ' ', codeTag(c.ev)),
          h('span.muted', icon('chevron-right', 12), ' ', displayName(c.scene), ' ', codeTag(c.scene), ` · ${formatDateTime(c.scene.data.time)}`))) };
    });
    const run = async () => {
      try {
        for (const r of rows.filter((x) => x.box.checked)) {
          await store.patchData(r.ev.id, { scenes: [{ id: r.scene.id, mode: 'in' }] });
          changed = true;
        }
        // Los que se dejan sin marcar no son el mismo hecho: no se vuelven a proponer.
        const skipped = rows.filter((x) => !x.box.checked).map((x) => x.ev.id);
        if (skipped.length) await store.patchProjectData({ eventLinkSkip: [...new Set([...(store.project.data.eventLinkSkip || []), ...skipped])] });
      } catch (err) { toast(errorText(err), 'error'); }
      changed = true;
      m.close();
    };
    const m = modal({
      title: t('events.suggestTitle'),
      body: h('div', h('p.modal-text', t('events.suggestHint')), h('div.link-candidates', rows.map((r) => r.el))),
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(t('events.suggestRun'), { kind: 'primary', icon: 'link', onClick: run })],
      onClose: () => resolve(changed),
    });
  });

  const drawByTime = (focus) => {
    const all = visibleItems(focus);
    // Un evento que ocurre en una escena a la vista no es una entrada aparte: va dentro de ella.
    const shownScenes = new Set(all.filter((i) => i.kind === 'scene').map((i) => i.entity.id));
    const inside = new Map(); // id de escena -> eventos que ocurren en ella
    const items = all.filter((i) => {
      if (i.kind === 'scene' || !i.event) return true;
      const hosts = i.hosts.filter((s) => shownScenes.has(s.id));
      for (const s of hosts) inside.set(s.id, [...(inside.get(s.id) || []), i.event]);
      return !hosts.length;
    });
    const scenes = store.list('scene').filter((s) => !focus || sceneHas(s, focus));
    const undated = scenes.filter((s) => !s.data.time).length;
    const reading = allScenesOrdered();
    searchCount.textContent = matcher ? tn('timeline.matches', all.length) : '';

    // Aviso: eventos sueltos que coinciden con una escena (suele ser el mismo hecho apuntado dos veces).
    const candidates = matcher || focus ? [] : eventLinkCandidates();
    if (candidates.length) {
      body.append(h('div.link-suggest', icon('link', 16),
        h('span', tn('events.suggest', candidates.length)),
        btn(t('events.suggestReview'), { small: true, kind: 'primary', onClick: async () => { if (await reviewCandidates(candidates)) draw(); } }),
        btn(t('events.suggestSkip'), { small: true, kind: 'ghost', onClick: async () => {
          try { await store.patchProjectData({ eventLinkSkip: [...new Set([...(store.project.data.eventLinkSkip || []), ...candidates.map((c) => c.ev.id)])] }); } catch (err) { toast(errorText(err), 'error'); }
          draw();
        } })));
    }

    if (!items.length) {
      body.append(matcher ? h('p.muted.empty-line', t('timeline.searchNone', { q: query.trim() }))
        : focus ? h('p.muted.empty-line', t('timeline.focusEmpty', { name: displayName(focus) }))
          : emptyState(t('timeline.empty'), btn(t('events.add'), { icon: 'plus', kind: 'primary', onClick: addEvent }), 'clock'));
    } else {
      const line = h('div.timeline');
      let lastDay = null;
      let previous = null;
      // Marcas de dónde empieza y dónde termina el libro. Al buscar no se ponen: la lista es
      // entonces una lista de resultados, no la línea entera.
      const marks = matcher ? null : bookMarks(items, reading);
      const mark = (which) => {
        const scene = which === 'start' ? marks.first : marks.last;
        const shown = which === 'start' ? marks.startShown : marks.endShown;
        // Si la escena no está a la vista (filtros o «Seguir a»), se dice cuál es y cuándo ocurre.
        return h('p', { class: 'timeline-mark is-' + which }, icon('bookmark', 14),
          h('span', t(which === 'start' ? 'timeline.bookStart' : 'timeline.bookEnd')),
          shown ? null : h('a.timeline-mark-scene', { href: entityHref(scene) }, `${displayName(scene)} · ${formatDateTime(scene.data.time)}`));
      };
      // A qué lado del «Pasan…» va una marca. Con la escena a la vista, pegada a ella: el inicio
      // justo antes y el final justo después. Si no se ve, junto a la entrada más cercana en el tiempo.
      const side = (which, slot) => {
        if (which === 'start' ? marks.startShown : marks.endShown) return which === 'start' ? 'after' : 'before';
        const prev = items[slot - 1];
        const next = items[slot];
        if (!prev || !next) return prev ? 'before' : 'after';
        const at = parseLocal((which === 'start' ? marks.first : marks.last).data.time);
        return at - parseLocal(prev.time) <= parseLocal(next.time) - at ? 'before' : 'after';
      };
      /** Marcas del hueco `slot`: las que van antes del «Pasan…» y las que van después. */
      const marksAt = (slot) => {
        const out = { before: [], after: [] };
        if (!marks) return out;
        const here = (marks.startFirst ? ['start', 'end'] : ['end', 'start'])
          .filter((which) => (which === 'start' ? marks.startSlot : marks.endSlot) === slot);
        for (const which of here) out[side(which, slot)].push(mark(which));
        return out;
      };
      items.forEach((item, index) => {
        const dayKey = dayOf(item.time);
        const here = marksAt(index);
        line.append(...here.before);
        // Entre cada entrada y la siguiente se indica el tiempo que pasa, en su unidad más grande.
        const span = previous ? spanBetween(previous.time, item.time) : null;
        previous = item;
        if (dayKey !== lastDay) {
          if (span) line.append(h('p.timeline-gap', spanLabel(span, 'timeline.passes')));
          line.append(...here.after);
          lastDay = dayKey;
          line.append(h('h3.timeline-day', formatDate(dayKey, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
        } else {
          if (span) line.append(h('p.timeline-gap.same-day', spanLabel(span, 'timeline.passes')));
          line.append(...here.after);
        }
        const isScene = item.kind === 'scene';
        // En las escenas se indica además su posición en el orden de lectura.
        // Las escenas son el libro: destacan sobre los eventos, con su capítulo encima del título.
        if (isScene) {
          line.append(h('a', { class: 'timeline-item k-scene', href: item.href },
            h('span.timeline-time', clock(item.time)),
            h('span.timeline-icon', icon(KIND_ICONS.scene, 17)),
            h('span.timeline-body',
              item.sub ? h('span.timeline-kicker', item.sub) : null,
              h('span.timeline-title', h('strong', item.title), codeTag(item.entity)),
              h('span.muted', t('timeline.sceneN', { n: reading.indexOf(item.entity) + 1, m: reading.length }),
                sceneDuration(item.entity) ? ` · ${t('tags.lasts', { span: sceneDuration(item.entity) })}` : ''),
              tagsOf(item.entity, focus))));
          // Debajo, pegados a la escena: los eventos que ocurren en ella y los que se cuentan.
          const within = insideOf(item.entity, inside.get(item.entity.id) || [], focus);
          if (within) line.append(within);
          return;
        }
        // Evento: general, de un elemento (con enlace a su ficha) o de varios (se listan debajo).
        // Se edita y se borra aquí mismo.
        const single = item.targets.length === 1 ? item.targets[0] : null;
        line.append(h('div', { class: 'timeline-item k-' + item.kind },
          h('span.timeline-time', clock(item.time)),
          h('span.timeline-icon', icon(KIND_ICONS[item.kind], 15)),
          h('span.timeline-body',
            h('span.timeline-title', h('strong', item.title), codeTag(item.event)),
            item.general ? h('span.muted', t('timeline.general'))
              : single ? h('span.muted', `${t(single.type + '.singular')} · `, h('a', { href: entityHref(single) }, entityLabel(single)))
                : h('span.muted', tn('timeline.sharedEvent', item.targets.length)),
            item.description ? h('span.timeline-desc', item.description) : null,
            item.targets.length > 1 ? h('span.timeline-tags', item.targets.map((e) => h('a', {
              class: 'timeline-tag k-' + e.type + (focus && e.id === focus.id ? ' is-focus' : ''), href: entityHref(e),
            }, icon(KIND_ICONS[e.type], 12), displayName(e)))) : null,
            // En qué escenas ocurre (si no están a la vista) y en cuáles se cuenta.
            eventScenesNote(item.event)),
          h('span.timeline-actions',
            eventLinks(item.event).length ? null : btn('', { icon: 'book', small: true, kind: 'ghost', title: t('events.toScene'), onClick: () => sceneFromEvent(item.event) }),
            btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: () => editEvent(item.event) }),
            btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.delete'), onClick: () => deleteEvent(item.event) }))));
      });
      // Marcas que quedan después de la última entrada.
      const tail = marksAt(items.length);
      line.append(...tail.before, ...tail.after);
      body.append(line);
    }
    if (undated && !hidden.has('scene') && !matcher) body.append(h('p.muted.empty-line', tn(focus ? 'timeline.undatedFocus' : 'timeline.undated', undated)));
    // Sin fecha en la primera o en la última escena del libro no hay dónde poner su marca: se avisa.
    if (!focus && !matcher && reading.length) {
      const first = reading[0];
      const last = reading[reading.length - 1];
      if (!first.data.time) body.append(h('p.muted.empty-line', t('timeline.bookStartUndated', { name: displayName(first) })));
      if (!last.data.time && last !== first) body.append(h('p.muted.empty-line', t('timeline.bookEndUndated', { name: displayName(last) })));
    }
  };

  // ---------- Orden de lectura ----------
  // Las escenas tal como las encuentra el lector, con su fecha: así se ven los saltos atrás
  // (analepsis), los saltos largos hacia delante y las escenas que aún no tienen fecha.

  const drawByBook = (focus) => {
    const numbers = chapterNumbers();
    const line = h('div.timeline.by-book');
    let previous = null; // fecha de la última escena con fecha
    let shown = 0;
    let back = 0;
    for (const c of chaptersOrdered()) {
      const scenes = scenesOf(c.id).filter((s) => (!focus || sceneHas(s, focus))
        && (!matcher || matcher({ time: s.data.time || '', text: entryText(displayName(s), '', chapterLabel(c, numbers), s.data.time, s, sceneTags(s)) })));
      if (!scenes.length) continue;
      line.append(h('h3.timeline-day', chapterLabel(c, numbers)));
      for (const s of scenes) {
        shown++;
        const time = s.data.time || '';
        let flag = null;
        const span = time && previous ? spanBetween(previous, time) : null;
        if (span && span.back) {
          flag = h('span.timeline-flag.back', icon('undo', 13), spanLabel(span, 'timeline.goesBack'));
          back++;
        } else if (span) {
          flag = h('span.timeline-flag', spanLabel(span, 'timeline.passes'));
        }
        if (time) previous = time;
        line.append(h('a', { class: 'timeline-item k-scene' + (time ? '' : ' is-undated') + (flag && flag.classList.contains('back') ? ' is-back' : ''), href: entityHref(s) },
          h('span.timeline-time.wide', time ? formatDate(dayOf(time), { day: 'numeric', month: 'short', year: 'numeric' }) : '—'),
          h('span.timeline-icon', icon('book', 15)),
          h('span.timeline-body',
            h('span.timeline-title', h('strong', displayName(s)), codeTag(s)),
            h('span.muted', time ? formatDateTime(time) + (sceneDuration(s) ? ` · ${t('tags.lasts', { span: sceneDuration(s) })}` : '') : t('timeline.noDate')),
            flag,
            tagsOf(s, focus))));
        const within = insideOf(s, sceneEvents(s).filter((x) => x.mode === 'in').map((x) => x.ev), focus);
        if (within) line.append(within);
      }
    }
    searchCount.textContent = matcher ? tn('timeline.matches', shown) : '';
    if (!shown) {
      body.append(h('p.muted.empty-line', matcher ? t('timeline.searchNone', { q: query.trim() })
        : focus ? t('timeline.focusNoScenes', { name: displayName(focus) }) : t('read.empty')));
      return;
    }
    body.append(h('p.timeline-summary', back ? tn('timeline.backCount', back) : t('timeline.linear')), line);
  };

  /** Repinta solo la lista (lo que hace el buscador al teclear, para no perder el foco). */
  const drawBody = () => {
    clear(body);
    const focus = focusId ? store.get(focusId) : null;
    if (order === 'book') drawByBook(focus);
    else drawByTime(focus);
  };
  const draw = () => {
    drawBody();
    drawBar();
  };

  // Buscador: filtra las entradas mientras se escribe. Va en su propia fila, fuera de la
  // barra que se redibuja.
  const setQuery = (value) => {
    query = value;
    matcher = compileQuery(value);
    drawBody();
  };
  searchInput.addEventListener('input', () => setQuery(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && query) {
      e.stopPropagation();
      searchInput.value = '';
      setQuery('');
    }
  });

  // «Seguir a»: reduce la línea a un personaje, lugar, objeto, grupo o trama.
  const groups = FOCUS_TYPES.map((type) => ({ type, list: store.list(type) })).filter((g) => g.list.length);
  const focusSel = h('select.input.inline-select', { 'aria-label': t('timeline.focus') },
    h('option', { value: '' }, t('timeline.focusAll')),
    groups.map((g) => h('optgroup', { label: t(g.type + '.plural') }, g.list.map((e) => h('option', { value: e.id }, displayName(e))))));
  focusSel.addEventListener('change', () => { focusId = focusSel.value; draw(); });

  const chips = KINDS.map((kind) => {
    const box = h('input', { type: 'checkbox' });
    box.checked = true;
    box.addEventListener('change', () => {
      if (box.checked) hidden.delete(kind);
      else hidden.add(kind);
      draw();
    });
    return h('label', { class: 'filter-chip k-' + kind }, box, icon(KIND_ICONS[kind], 14), h('span', kindLabel(kind, true)));
  });

  function drawBar() {
    clear(bar);
    const opt = (key) => h('button', { type: 'button', class: 'seg-opt' + (order === key ? ' active' : ''), 'aria-pressed': String(order === key), onclick: () => { order = key; draw(); } }, t('timeline.order.' + key));
    // Element.append convierte null y los arrays en texto: se aplanan y filtran antes.
    bar.append(...[
      h('span.seg', { role: 'group', 'aria-label': t('timeline.order') }, h('span.seg-label', t('timeline.order')), opt('time'), opt('book')),
      // En orden de lectura solo hay escenas: los filtros por tipo no aplican.
      ...(order === 'time' ? chips : []),
      groups.length ? h('label.timeline-focus', h('span.form-label', t('timeline.focus')), focusSel) : null,
    ].filter(Boolean));
  }

  // Importar: los mismos archivos que se exportan (CSV, JSON, Excel o Word). Antes de cambiar
  // nada se enseña un resumen de lo que entraría.
  const fileInput = h('input', { type: 'file', accept: '.csv,.json,.xlsx,.docx,text/csv,application/json', hidden: true });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (file && await importTimeline(file)) draw();
  });

  // (La explicación de cuándo aparece cada cosa está en la ayuda «?» de la sección: help.timeline.)
  clear(el);
  el.append(
    fileInput,
    pageHeader({ title: t('nav.timeline'), subtitle: t('timeline.hint'), actions: [
      btn(t('timeline.import'), { icon: 'upload', onClick: () => fileInput.click() }),
      btn(t('timeline.export'), { icon: 'download', onClick: exportTimeline }),
      btn(t('events.add'), { icon: 'plus', kind: 'primary', onClick: addEvent }),
    ] }),
    bar,
    h('div.timeline-search-row', icon('search', 16), searchInput, searchHelp, searchCount),
    body);
  draw();
}
