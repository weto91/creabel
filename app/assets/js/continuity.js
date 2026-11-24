// Continuidad: lo que se puede deducir de las fichas y las escenas para no contradecirse.
//  - Estados: en una escena se apunta que algo cambia («herida en el brazo», «la llave pasa a
//    Álex», «muere»). Van en scene.data.states: [{ id, entity, text, holder, gone }].
//  - Secretos: cosas que se saben o se ignoran. Cada uno es un elemento de tipo «secret» con
//    data.reveals: [{ id, who (id de personaje o «reader»), scene }]: quién se entera y dónde.
//  - Comprobaciones: imposibles que salen de cruzar fechas, lugares, edades y estados.
import { t, tn } from './i18n.js';
import { store } from './store.js';
import { parseLocal, formatDate, formatDateTime } from './text.js';
import {
  allScenesOrdered, chapterLabel, chapterNumbers, displayName, entityHref, validIds, sceneHas, sceneLocations,
  locationAncestors, parentPairs, eventsOf, eventTime, eventHosts,
} from './model.js';

export const STATE_TYPES = ['character', 'object', 'custom', 'location', 'group'];
export const READER = 'reader';

/** Cambios de estado apuntados en una escena (de elementos que siguen existiendo). */
export function sceneStates(scene) {
  return (Array.isArray(scene.data.states) ? scene.data.states : []).filter((s) => s && store.get(s.entity));
}

/** Personajes presentes en una escena: los marcados y quien la narra. */
export function scenePeople(scene) {
  const ids = new Set(validIds(scene.data.characters));
  if (scene.data.pov && store.get(scene.data.pov.characterId)) ids.add(scene.data.pov.characterId);
  return [...ids].map((id) => store.get(id));
}

/** «3. La partida · Travesía»: una escena con su capítulo. */
export function sceneRef(scene, numbers) {
  const chapter = store.get(scene.parent_id);
  return `${chapter ? chapterLabel(chapter, numbers || chapterNumbers()) + ' · ' : ''}${displayName(scene)}`;
}

/**
 * Recorrido de un elemento por el libro, en orden de lectura: las escenas en las que aparece,
 * cambia de estado o (si es un personaje) recibe algo.
 */
export function trackOf(entity) {
  const out = [];
  for (const scene of allScenesOrdered()) {
    const all = sceneStates(scene);
    const states = all.filter((s) => s.entity === entity.id);
    const holds = entity.type === 'character' ? all.filter((s) => s.holder === entity.id) : [];
    const appears = sceneHas(scene, entity);
    if (states.length || holds.length || appears) out.push({ scene, appears, states, holds });
  }
  return out;
}

// ---------- Secretos ----------

export function secretReveals(secret) {
  return (Array.isArray(secret.data.reveals) ? secret.data.reveals : [])
    .filter((r) => r && store.get(r.scene) && (r.who === READER || store.get(r.who)));
}

/** Nombre de quien se entera: «El lector» o el personaje. */
export const whoLabel = (who) => (who === READER ? t('secret.reader') : displayName(store.get(who)));

/** Revelaciones que ocurren en una escena: [{ secret, reveal }]. */
export function revealsIn(scene) {
  return store.list('secret').flatMap((secret) => secretReveals(secret).filter((r) => r.scene === scene.id).map((reveal) => ({ secret, reveal })));
}

// ---------- Comprobaciones ----------

const MINUTE = 60000;
const day = (time) => (time || '').slice(0, 10);

/**
 * Busca imposibles y cosas que conviene revisar. Devuelve una lista de
 * { key, level: 'error' | 'warn', text, links: [{ label, href }] }; `key` identifica el aviso
 * para poder ignorarlo.
 */
export function runChecks() {
  const issues = [];
  const numbers = chapterNumbers();
  const ordered = allScenesOrdered();
  const index = new Map(ordered.map((s, i) => [s.id, i]));
  const ref = (scene) => sceneRef(scene, numbers);
  const link = (e, label) => ({ label: label || displayName(e), href: entityHref(e) });
  const add = (level, kind, ids, text, links) => issues.push({ key: `${kind}:${ids.join(':')}`, level, kind, text, links });
  /** «Escena A», «Escena B», «Escena C» y 4 más: para los avisos que reúnen varias escenas. */
  const listOf = (scenes, max = 3) => scenes.slice(0, max).map((s) => `«${ref(s)}»`).join(', ')
    + (scenes.length > max ? ` ${tn('check.andMore', scenes.length - max)}` : '');
  const placesOf = (scene) => sceneLocations(scene);
  const placeNames = (scene) => placesOf(scene).map((l) => displayName(l)).join(', ');
  // Dos conjuntos de lugares son compatibles si comparten alguno o uno está dentro del otro.
  const compatible = (A, B) => A.some((a) => B.some((b) => a === b || locationAncestors(a).includes(b) || locationAncestors(b).includes(a)));
  const span = (scene) => {
    const start = parseLocal(scene.data.time);
    if (!start) return null;
    const end = parseLocal(scene.data.timeEnd);
    return { a: +start, b: end && +end > +start ? +end : +start };
  };

  const characters = store.list('character');
  const parents = parentPairs();
  for (const c of characters) {
    const mine = ordered.filter((s) => sceneHas(s, c));

    // En dos sitios a la vez, o de un sitio a otro sin tiempo material.
    const timed = mine.map((s) => ({ s, t: span(s), places: placesOf(s) })).filter((x) => x.t && x.places.length).sort((x, y) => x.t.a - y.t.a);
    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length && timed[j].t.a <= timed[i].t.b + 60 * MINUTE; j++) {
        const [x, y] = [timed[i], timed[j]];
        if (compatible(x.places, y.places)) continue;
        const params = { who: displayName(c), a: ref(x.s), b: ref(y.s), placeA: placeNames(x.s), placeB: placeNames(y.s) };
        if (y.t.a <= x.t.b) add('error', 'twoPlaces', [c.id, x.s.id, y.s.id], t('check.twoPlaces', { ...params, when: formatDateTime(y.s.data.time) }), [link(x.s), link(y.s), link(c)]);
        else add('warn', 'tooFast', [c.id, x.s.id, y.s.id], t('check.tooFast', { ...params, min: Math.round((y.t.a - x.t.b) / MINUTE) }), [link(x.s), link(y.s), link(c)]);
      }
    }

    // Antes de nacer o después de morir: un solo aviso por personaje, con todas sus escenas.
    // Estar en una escena después de morir no es por fuerza un error (su cuerpo, un recuerdo,
    // un espectro): es un aviso para revisar y, al ignorarlo, no vuelve a salir para ese
    // personaje aunque se escriban más escenas.
    const dated = mine.filter((s) => s.data.time);
    const early = c.data.birth ? dated.filter((s) => day(s.data.time) < c.data.birth) : [];
    if (early.length) {
      add('error', 'beforeBirth', [c.id], tn('check.beforeBirth', early.length, { who: displayName(c), birth: formatDate(c.data.birth), list: listOf(early) }), [...early.slice(0, 6).map((s) => link(s)), link(c)]);
    }
    // La fecha de un evento es la efectiva: la de la escena en la que ocurre, si está enlazado con una.
    const events = eventsOf(c.id).filter((ev) => eventTime(ev));
    const late = c.data.death ? dated.filter((s) => day(s.data.time) > c.data.death) : [];
    const lateEvents = c.data.death ? events.filter((ev) => day(eventTime(ev)) > c.data.death) : [];
    if (late.length || lateEvents.length) {
      const params = { who: displayName(c), death: formatDate(c.data.death) };
      const text = [
        late.length ? tn('check.afterDeath', late.length, { ...params, list: listOf(late) }) : '',
        lateEvents.length ? tn('check.eventsAfterDeath', lateEvents.length, { ...params, list: lateEvents.slice(0, 3).map((ev) => `«${displayName(ev)}»`).join(', ') }) : '',
        t('check.afterDeathHint'),
      ].filter(Boolean).join(' ');
      add('warn', 'afterDeath', [c.id], text, [...late.slice(0, 6).map((s) => link(s)), link(c)]);
    }
    for (const ev of events) {
      const when = day(eventTime(ev));
      if (c.data.birth && when < c.data.birth) add('warn', 'eventBeforeBirth', [c.id, ev.id], t('check.eventBeforeBirth', { who: displayName(c), event: displayName(ev), when: formatDate(when), birth: formatDate(c.data.birth) }), [link(c)]);
    }
    // Un evento suyo que ocurre en escenas en las que no está marcado. Si no está en ninguna de
    // las escenas del evento, es un aviso para revisar (amarillo). Si el evento ocurre en varias
    // y el personaje está en alguna, lo normal es que esté bien (participa solo en una parte):
    // sale como aviso leve (verde).
    for (const ev of eventsOf(c.id)) {
      const hosts = eventHosts(ev);
      const away = hosts.filter((s) => !sceneHas(s, c));
      if (!away.length) continue;
      const params = { who: displayName(c), event: displayName(ev), list: listOf(away) };
      const links = [...away.slice(0, 4).map((s) => link(s)), link(c)];
      if (away.length < hosts.length) add('soft', 'eventAbsent', [c.id, ev.id], tn('check.eventPartly', away.length, { ...params, total: hosts.length, here: hosts.length - away.length }), links);
      else add('warn', 'eventAbsent', [c.id, ev.id], tn('check.eventAbsent', away.length, params), links);
    }

    // Fechas de padres e hijos que no cuadran (los padres salen de los mapas de relaciones).
    for (const parent of parents.filter((p) => p.child === c).map((p) => p.parent)) {
      if (c.data.birth && parent.data.birth && parent.data.birth >= c.data.birth) add('error', 'parentYounger', [parent.id, c.id], t('check.parentYounger', { parent: displayName(parent), child: displayName(c) }), [link(parent), link(c)]);
      // Muerto más de un año antes de que naciera su hijo.
      if (c.data.birth && parent.data.death && Number(parent.data.death.split('-')[0]) < Number(c.data.birth.split('-')[0]) - 1) add('warn', 'parentDead', [parent.id, c.id], t('check.parentDead', { parent: displayName(parent), child: displayName(c) }), [link(parent), link(c)]);
    }
  }

  // Estados: algo que «deja de estar» y vuelve a aparecer; un objeto sin quien lo tenía.
  // «Después» es por fecha si las dos escenas la tienen y, si no, por orden de lectura.
  const after = (a, b) => (a.data.time && b.data.time ? b.data.time > a.data.time : index.get(b.id) > index.get(a.id));
  const tracked = new Map(); // elemento -> [{ scene, state }]
  for (const scene of ordered) for (const state of sceneStates(scene)) tracked.set(state.entity, [...(tracked.get(state.entity) || []), { scene, state }]);
  for (const [id, changes] of tracked) {
    const e = store.get(id);
    for (const { scene, state } of changes.filter((c) => c.state.gone)) {
      // Un aviso por cada «deja de estar», con todas las escenas posteriores en las que aparece.
      // (Si en una de ellas se vuelve a apuntar su estado, se da por explicado.)
      const later = ordered.filter((s) => s !== scene && sceneHas(s, e) && after(scene, s) && !changes.some((c) => c.scene === s));
      if (later.length) add('warn', 'afterGone', [id, scene.id], tn('check.afterGone', later.length, { what: displayName(e), state: state.text, a: ref(scene), list: listOf(later) }), [link(scene), ...later.slice(0, 5).map((s) => link(s)), link(e)]);
    }
    if (e.type === 'character') continue;
    // Quién lo tiene: en cada escena posterior donde sale el objeto, debería estar esa persona.
    let holder = null;
    let since = null;
    let without = []; // escenas en las que sale el objeto sin quien lo tenía
    const flush = () => {
      if (without.length) add('warn', 'holderAbsent', [id, since.id], tn('check.holderAbsent', without.length, { what: displayName(e), holder: displayName(holder), a: ref(since), list: listOf(without) }), [link(since), ...without.slice(0, 5).map((s) => link(s)), link(e)]);
      without = [];
    };
    for (const scene of ordered) {
      const here = changes.filter((c) => c.scene === scene);
      if (here.length) {
        flush();
        const last = here[here.length - 1].state;
        holder = store.get(last.holder) || null;
        since = scene;
        continue;
      }
      if (holder && sceneHas(scene, e) && !sceneHas(scene, holder)) without.push(scene);
    }
    flush();
  }

  // Secretos: alguien se entera en una escena en la que no está.
  for (const secret of store.list('secret')) {
    for (const r of secretReveals(secret)) {
      if (r.who === READER) continue;
      const scene = store.get(r.scene);
      const who = store.get(r.who);
      if (!sceneHas(scene, who)) add('warn', 'revealAbsent', [secret.id, r.who, scene.id], t('check.revealAbsent', { who: displayName(who), secret: displayName(secret), a: ref(scene) }), [link(scene), link(who)]);
    }
  }

  // Tres niveles: imposible (rojo), para revisar (amarillo) y para revisar, pero probablemente bien (verde).
  const order = { error: 0, warn: 1, soft: 2 };
  return issues.sort((x, y) => order[x.level] - order[y.level]);
}

/** Avisos que el usuario ha decidido ignorar (se guardan en el proyecto). */
export function ignoredChecks() {
  const list = store.project.data.continuityIgnored;
  return new Set(Array.isArray(list) ? list : []);
}

export function setIgnored(key, value) {
  const set = ignoredChecks();
  if (value) set.add(key);
  else set.delete(key);
  return store.patchProjectData({ continuityIgnored: [...set] });
}

export { tn };
