// Relaciones automáticas: las que se deducen de lo que ya está apuntado en las escenas y en
// las fichas, sin que nadie las dibuje. No se guardan: se calculan al abrir «Relaciones».
// Hay diez, cada una con su dibujo, y una vista general que las reúne con las dibujadas a mano.
//
// Cada función devuelve { nodes, edges }:
//   nodo:    { key, entity | null, label, type }
//   arista:  { a, b, weight, label, notes[], directed, soft }
// `weight` es cuántas veces se da la relación (escenas compartidas, viajes…) y decide el
// grosor de la línea; `notes` es el detalle (en qué escenas, qué eventos); `deduced` marca, en
// «Parentescos», una relación que nadie ha apuntado y se deduce de otras (va en discontinua).
import { t, tn } from './i18n.js';
import { store } from './store.js';
import {
  allScenesOrdered, displayName, validIds, sceneLocations, locationParent, locationAncestors, eventTargets, parentPairs,
  allRelations, chapterNumbers,
} from './model.js';
import { scenePeople, sceneStates, secretReveals, sceneRef, READER } from './continuity.js';

export const AUTO_KINDS = ['together', 'holders', 'secrets', 'events', 'places', 'strands', 'travel', 'groups', 'nest', 'kin'];

/** Recoge nodos y aristas; las aristas repetidas entre los mismos dos nodos se suman. */
function collector() {
  const nodes = new Map();
  const edges = new Map();
  const node = (e) => {
    if (!nodes.has(e.id)) nodes.set(e.id, { key: e.id, entity: e, label: displayName(e), type: e.type });
    return e.id;
  };
  const text = (key, label, type) => {
    if (!nodes.has(key)) nodes.set(key, { key, entity: null, label, type });
    return key;
  };
  const link = (a, b, { directed = false, note = '', soft = false, tag = '' } = {}) => {
    if (a === b) return null;
    const [x, y] = directed ? [a, b] : [a, b].sort();
    const id = `${x}${directed ? '>' : '|'}${y}${tag ? '#' + tag : ''}`;
    let edge = edges.get(id);
    if (!edge) {
      edge = { a: x, b: y, weight: 0, notes: [], directed, soft, tag, label: '' };
      edges.set(id, edge);
    }
    edge.weight++;
    if (note && !edge.notes.includes(note)) edge.notes.push(note);
    return edge;
  };
  /** Cierra el grafo: pone el rótulo de cada arista y descarta los nodos sueltos. */
  const done = (labelOf) => {
    const list = [...edges.values()];
    for (const edge of list) edge.label = labelOf(edge);
    const used = new Set(list.flatMap((e) => [e.a, e.b]));
    return { nodes: [...nodes.values()].filter((n) => used.has(n.key)), edges: list };
  };
  return { node, text, link, done };
}

/** «A, B, C y 4 más»: una lista corta de notas. */
const brief = (notes, max = 3) => notes.slice(0, max).join(', ') + (notes.length > max ? ` ${tn('auto.more', notes.length - max)}` : '');
const pairs = (list, fn) => { for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) fn(list[i], list[j]); };
// Rótulos que ya dicen «hermanos» o «abuelo/nieto» (sin tildes, en los idiomas de la
// aplicación): con uno de ellos entre dos personajes no hace falta deducirlo.
const SIBLING_LABEL = new RegExp([
  'herman|melliz|gemel|irma|germa|fratel|sorell|frere|soeur|sœur|jumea?u', // es, gl, pt, ca, it, fr
  'brother|sister|sibling|twin|bruder|schwester|geschwister|zwilling|broer|zus|tweeling', // en, de, nl
  'brat|siostr|sestr|blizn|dvojc|dvojcek|testver|fiver|nover|ocs|iker|kardes|abla|agabey|ikiz', // pl, cs, sl, sr, hu, tr
  'брат|сестр|близн|браћ', // ru, uk, sr
].join('|'), 'u');
const GRAND_LABEL = new RegExp([
  'abuel|niet|avo|avoa|neto|neta|avi|besavi|nonn|nipot|grand|petit', // es, gl, pt, ca, it, fr
  'grosvat|grossvat|grosmut|grossmut|grootva|grootmo|oma|opa|enkel|kleinzo|kleindo', // en, de, nl
  'dziad|babci|babk|wnu|dede|deda|babic|vnuk|vnuc|nagyap|nagyany|nagyszul|unok|dede|babaanne|anneanne|torun', // pl, cs, sl, sr, hu, tr
  'дед|дід|бабуш|бабус|баба|внук|внуч|онук|онуч', // ru, uk, sr
].join('|'), 'u');

const BUILDERS = {
  /** 1. Personajes que coinciden en una escena. */
  together(scenes, ref) {
    const g = collector();
    for (const scene of scenes) pairs(scenePeople(scene), (a, b) => g.link(g.node(a), g.node(b), { note: ref(scene) }));
    return g.done((e) => tn('auto.together', e.weight));
  },

  /** 2. Por qué manos pasa cada objeto (o ficha propia), en orden. */
  holders(scenes, ref) {
    const g = collector();
    const turn = new Map(); // objeto -> cuántas veces ha cambiado de manos
    for (const scene of scenes) {
      for (const state of sceneStates(scene)) {
        const thing = store.get(state.entity);
        const holder = store.get(state.holder);
        if (!thing || !holder) continue;
        turn.set(thing.id, (turn.get(thing.id) || 0) + 1);
        g.link(g.node(thing), g.node(holder), { directed: true, note: t('auto.turn', { n: turn.get(thing.id), scene: ref(scene) }) });
      }
    }
    return g.done((e) => brief(e.notes, 2));
  },

  /** 3. Quién conoce cada secreto (y en qué escena se entera). */
  secrets(scenes, ref) {
    const g = collector();
    for (const secret of store.list('secret')) {
      for (const r of secretReveals(secret)) {
        const who = r.who === READER ? g.text('reader', t('secret.reader'), 'reader') : g.node(store.get(r.who));
        g.link(g.node(secret), who, { note: ref(store.get(r.scene)) });
      }
    }
    return g.done((e) => t('auto.learns', { scene: brief(e.notes, 2) }));
  },

  /** 4. Elementos que comparten un evento. */
  events() {
    const g = collector();
    for (const ev of store.list('event')) pairs(eventTargets(ev), (a, b) => g.link(g.node(a), g.node(b), { note: displayName(ev) }));
    return g.done((e) => brief(e.notes));
  },

  /** 5. En qué lugares aparece cada personaje. */
  places(scenes, ref) {
    const g = collector();
    for (const scene of scenes) for (const c of scenePeople(scene)) for (const l of sceneLocations(scene)) g.link(g.node(c), g.node(l), { note: ref(scene) });
    return g.done((e) => tn('count.scenes', e.weight));
  },

  /** 6. Qué personajes sostienen cada trama. */
  strands(scenes, ref) {
    const g = collector();
    for (const scene of scenes) {
      const strands = validIds(scene.data.strands).map((id) => store.get(id));
      for (const c of scenePeople(scene)) for (const s of strands) g.link(g.node(c), g.node(s), { note: ref(scene) });
    }
    return g.done((e) => tn('count.scenes', e.weight));
  },

  /**
   * 7. Desplazamientos: de qué lugar a qué lugar se va, siguiendo a cada personaje de una escena
   * a la siguiente (y dentro de una escena de tránsito, que recorre varios). Pasar de un lugar
   * a otro que lo contiene, o al revés, no cuenta como viaje.
   */
  travel(scenes) {
    const g = collector();
    const nested = (a, b) => locationAncestors(a).includes(b) || locationAncestors(b).includes(a);
    for (const c of store.list('character')) {
      let previous = null;
      for (const scene of scenes) {
        if (!scenePeople(scene).includes(c)) continue;
        const route = sceneLocations(scene);
        if (!route.length) continue;
        const steps = previous ? [previous, ...route] : route;
        for (let i = 1; i < steps.length; i++) {
          if (steps[i - 1] !== steps[i] && !nested(steps[i - 1], steps[i])) g.link(g.node(steps[i - 1]), g.node(steps[i]), { directed: true, note: displayName(c) });
        }
        previous = route[route.length - 1];
      }
    }
    return g.done((e) => `${tn('auto.trips', e.weight)} · ${brief(e.notes)}`);
  },

  /** 8. Cada grupo con sus miembros. */
  groups() {
    const g = collector();
    for (const group of store.list('group')) for (const id of validIds(group.data.members)) g.link(g.node(store.get(id)), g.node(group), { directed: true });
    return g.done(() => t('auto.member'));
  },

  /** 9. Qué lugar está dentro de cuál. */
  nest() {
    const g = collector();
    for (const loc of store.list('location')) {
      const parent = locationParent(loc);
      if (parent) g.link(g.node(loc), g.node(parent), { directed: true });
    }
    return g.done(() => t('auto.inside'));
  },

  /**
   * 10. Relaciones: todas las apuntadas a mano, sea cual sea su rótulo («Padre», «Mejor
   * amiga», «Jefe», «Vive en»…), vengan de la ficha de un elemento o de una flecha de un mapa.
   * Y además las que se deducen de ellas y nadie ha apuntado: hermanos (comparten madre o
   * padre) y abuelos (el padre de un padre), que salen marcadas como deducidas.
   */
  kin() {
    const g = collector();
    const { nodes, edges } = allRelations();
    const byKey = new Map(nodes.map((n) => [n.key, n]));
    const noted = new Map(); // par de fichas -> rótulos ya apuntados entre ellas (sin acentos)
    const pairKey = (a, b) => [a.id, b.id].sort().join('|');
    const plainLabel = (text) => String(text || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    const keyOf = (n) => (n.entity ? g.node(n.entity) : g.text(n.key, n.label, 'text'));
    for (const e of edges) {
      const a = byKey.get(e.a);
      const b = byKey.get(e.b);
      if (!a || !b) continue;
      const edge = g.link(keyOf(a), keyOf(b), { directed: !e.both, tag: 'given:' + (e.label || t('mindmap.noLabel')) });
      if (!edge) continue;
      edge.both = !!e.both;
      edge.notes.push(...e.maps.map((m) => displayName(m)), ...(e.sheets || []).map((s) => t('rel.sheetOf', { name: displayName(s) })));
      if (a.entity && b.entity) noted.set(pairKey(a.entity, b.entity), [...(noted.get(pairKey(a.entity, b.entity)) || []), plainLabel(e.label)]);
    }
    const parents = parentPairs();
    const childrenOf = new Map();
    for (const p of parents) childrenOf.set(p.parent, [...(childrenOf.get(p.parent) || []), p.child]);
    // No se deduce lo que ya está apuntado: si entre los dos hay un «hermana» o un «abuelo»
    // escrito a mano, la deducción sobraría. Otras relaciones entre ellos (amigos, rivales) no lo impiden.
    const deduce = (a, b, opts, already) => {
      if (a === b || (noted.get(pairKey(a, b)) || []).some((label) => already.test(label))) return;
      const edge = g.link(g.node(a), g.node(b), opts);
      if (edge) edge.deduced = true;
    };
    for (const children of childrenOf.values()) pairs([...new Set(children)], (a, b) => deduce(a, b, { tag: 'sibling' }, SIBLING_LABEL));
    for (const up of parents) for (const down of parents) if (up.child === down.parent) deduce(up.parent, down.child, { directed: true, tag: 'grand' }, GRAND_LABEL);
    return g.done((e) => (e.tag.startsWith('given:') ? e.tag.slice(6) : `${t('auto.kin.' + e.tag)} · ${t('auto.deduced')}`));
  },
};

/** Las diez relaciones automáticas, cada una con su grafo: { together: { nodes, edges }, … }. */
export function buildAutoRelations() {
  const scenes = allScenesOrdered();
  const numbers = chapterNumbers();
  const ref = (scene) => sceneRef(scene, numbers);
  const out = {};
  for (const kind of AUTO_KINDS) out[kind] = BUILDERS[kind](scenes, ref);
  return out;
}

/** Las relaciones dibujadas a mano en los mapas, con la misma forma que las automáticas. */
export function manualRelations() {
  const { nodes, edges } = allRelations();
  return {
    nodes: nodes.map((n) => ({ key: n.key, entity: n.entity, label: n.label, type: n.entity ? n.entity.type : 'text' })),
    edges: edges.map((e) => ({ a: e.a, b: e.b, weight: 1, notes: [...e.maps.map((m) => displayName(m)), ...(e.sheets || []).map((s) => t('rel.sheetOf', { name: displayName(s) }))], directed: !e.both, both: !!e.both, label: e.label || t('mindmap.noLabel') })),
  };
}

/**
 * Vista general: junta los grafos elegidos (`kinds`, que puede incluir 'manual') en uno solo.
 * Cada arista lleva en `kind` de qué relación viene, para pintarla de su color.
 */
export function mergeRelations(graphs, kinds) {
  const nodes = new Map();
  const edges = [];
  for (const kind of kinds) {
    const g = graphs[kind];
    if (!g) continue;
    for (const n of g.nodes) if (!nodes.has(n.key)) nodes.set(n.key, n);
    for (const e of g.edges) {
      // Las relaciones apuntadas ya están entre «las tuyas»: de este dibujo solo se suman las deducidas.
      if (kind === 'kin' && !e.deduced && kinds.includes('manual')) continue;
      edges.push({ ...e, kind });
    }
  }
  const used = new Set(edges.flatMap((e) => [e.a, e.b]));
  return { nodes: [...nodes.values()].filter((n) => used.has(n.key)), edges };
}
