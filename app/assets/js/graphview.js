// Dibujo de un grafo de relaciones: los elementos en círculo (agrupados por tipo), una línea
// por relación —más gruesa cuanto más pesa— y, debajo, la lista de cada elemento con las
// suyas. Al pasar el ratón por un elemento (o al pulsarlo, para fijarlo) se resaltan sus
// relaciones y se leen sus rótulos. Lo usan las relaciones automáticas y la vista general.
import { h, icon } from './dom.js';
import { t } from './i18n.js';
import { entityHref, ENTITY_TYPES, strandColor } from './model.js';
import { codeTag } from './components.js';

const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, ...children) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  el.append(...children.filter((c) => c != null));
  return el;
};
const TYPE_ORDER = ['character', 'group', 'location', 'object', 'custom', 'strand', 'secret', 'event', 'reader', 'text'];
const TYPE_ICONS = { secret: 'key', strand: 'layers', event: 'calendar', reader: 'eye', text: 'note' };
const short = (text, max = 24) => (text.length > max ? text.slice(0, max - 1) + '…' : text);
let serial = 0;

/**
 * Devuelve el elemento con el dibujo y la lista.
 * `kinds` (solo en la vista general) es { clave: { label, color, dashed } }: cada arista lleva
 * en `kind` la suya y se pinta de ese color.
 */
export function graphView({ nodes, edges, kinds = null, label }) {
  const id = 'graph-arrow-' + (++serial);
  const rank = (n) => { const i = TYPE_ORDER.indexOf(n.type); return i < 0 ? TYPE_ORDER.length : i; };
  nodes = [...nodes].sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  const maxWeight = Math.max(1, ...edges.map((e) => e.weight || 1));
  const width = (e) => (maxWeight > 1 ? 1.3 + 4.2 * (((e.weight || 1) - 1) / (maxWeight - 1)) : 1.5);
  const kindColor = (e) => (kinds && kinds[e.kind] ? kinds[e.kind].color : null);
  // El color de un nodo es el de su tipo; una trama lleva el suyo propio.
  const ownColor = (n) => (n.type === 'strand' && n.entity ? strandColor(n.entity) : null);
  const nodeStyle = (n) => (ownColor(n) ? `--kind: ${ownColor(n)}` : null); // para el SVG (atributo)
  const itemStyle = (n) => (ownColor(n) ? { '--kind': ownColor(n) } : null); // para la lista (h)

  // ----- Diagrama -----
  // El lienzo crece con el número de elementos: con pocos, el dibujo se ve grande.
  const R = Math.max(105, Math.min(310, 40 + nodes.length * 14));
  const W = R * 2 + 440;
  const H = R * 2 + 110;
  const [cx, cy] = [W / 2, H / 2];
  const pos = new Map(nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return [n.key, { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), angle }];
  }));
  let pinned = null; // elemento elegido con un clic
  const root = svg('svg', { class: 'relall-svg graph-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label || t('relall.tab') },
    svg('defs', {}, svg('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' },
      svg('path', { d: 'M0 0 10 5 0 10z', class: 'relall-head' }))));

  // Varias relaciones entre los mismos dos elementos (en la vista general) se separan un poco.
  const seen = new Map();
  const edgeEls = edges.filter((e) => pos.has(e.a) && pos.has(e.b)).map((e) => {
    const a = pos.get(e.a);
    const b = pos.get(e.b);
    const pair = [e.a, e.b].sort().join('|');
    const nth = seen.get(pair) || 0;
    seen.set(pair, nth + 1);
    // La línea se curva hacia el centro y termina en el borde de cada círculo, no en su centro.
    const bend = Math.max(0.05, 0.35 - nth * 0.09);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const c = { x: cx + (mx - cx) * bend, y: cy + (my - cy) * bend };
    const trim = (p) => { const d = Math.hypot(c.x - p.x, c.y - p.y) || 1; return { x: p.x + ((c.x - p.x) / d) * 12, y: p.y + ((c.y - p.y) / d) * 12 }; };
    const [p0, p1] = [trim(a), trim(b)];
    const mid = { x: 0.25 * p0.x + 0.5 * c.x + 0.25 * p1.x, y: 0.25 * p0.y + 0.5 * c.y + 0.25 * p1.y };
    const color = kindColor(e);
    // Discontinua: una relación automática en la vista general, o una deducida (nadie la ha apuntado).
    const g = svg('g', { class: 'relall-edge' + (e.soft ? ' is-soft' : '') + (e.deduced || (kinds && kinds[e.kind] && kinds[e.kind].dashed) ? ' is-dashed' : ''), style: color ? `--edge: ${color}` : null },
      svg('path', {
        d: `M${p0.x} ${p0.y} Q${c.x} ${c.y} ${p1.x} ${p1.y}`, style: `stroke-width: ${width(e).toFixed(2)}px`,
        'marker-end': e.directed || e.both ? `url(#${id})` : null, 'marker-start': e.both ? `url(#${id})` : null,
      }),
      e.label ? svg('text', { x: mid.x, y: mid.y, 'text-anchor': 'middle', dy: '-4' }, document.createTextNode(short(e.label, 34))) : null);
    root.append(g);
    return { e, g };
  });

  const nodeEls = new Map();
  const listEls = new Map();
  const focus = (key) => {
    root.classList.toggle('has-focus', !!key);
    const near = new Set([key]);
    for (const { e, g } of edgeEls) {
      const on = !!key && (e.a === key || e.b === key);
      g.classList.toggle('on', on);
      if (on) { near.add(e.a); near.add(e.b); }
    }
    for (const [k, el] of nodeEls) el.classList.toggle('on', !!key && near.has(k));
    for (const [k, el] of listEls) el.classList.toggle('on', k === key);
  };
  for (const n of nodes) {
    const p = pos.get(n.key);
    const right = Math.cos(p.angle) >= -0.01;
    const g = svg('g', { class: `relall-node k-${n.type}`, style: nodeStyle(n), tabindex: '0', role: 'button', 'aria-label': n.label },
      svg('circle', { cx: p.x, cy: p.y, r: '9' }),
      svg('text', { x: p.x + (right ? 15 : -15), y: p.y, dy: '0.35em', 'text-anchor': right ? 'start' : 'end' }, document.createTextNode(short(n.label))));
    g.addEventListener('mouseenter', () => focus(n.key));
    g.addEventListener('mouseleave', () => focus(pinned));
    g.addEventListener('focus', () => focus(n.key));
    g.addEventListener('blur', () => focus(pinned));
    const pin = () => { pinned = pinned === n.key ? null : n.key; focus(pinned); };
    g.addEventListener('click', pin);
    g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pin(); } });
    nodeEls.set(n.key, g);
    root.append(g);
  }

  // ----- Lista: cada elemento con sus relaciones, de la que más pesa a la que menos -----
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const name = (n) => (n.entity ? h('a', { href: entityHref(n.entity) }, n.label) : h('span', n.label));
  const list = h('div.relall-list', nodes.map((n) => {
    const mine = edges.filter((e) => e.a === n.key || e.b === n.key).sort((a, b) => (b.weight || 1) - (a.weight || 1));
    const cfg = n.entity ? ENTITY_TYPES[n.entity.type] || {} : {};
    const block = h('section', { class: `relall-item k-${n.type}`, style: itemStyle(n) },
      h('h3', icon(TYPE_ICONS[n.type] || cfg.icon || 'note', 15), name(n), n.entity ? codeTag(n.entity) : null, h('span.muted', String(mine.length))),
      h('ul', mine.map((e) => {
        const out = e.a === n.key;
        const other = byKey.get(out ? e.b : e.a);
        const color = kindColor(e);
        return h('li', { class: e.soft || e.deduced ? 'is-soft' : '', title: e.notes && e.notes.length ? e.notes.join(' · ') : null },
          h('span.relall-arrow', e.both || !e.directed ? '↔' : out ? '→' : '←'),
          h('strong', name(other)),
          h('span.relall-label', e.label),
          color ? h('span.graph-kind', { style: { '--edge': color } }, kinds[e.kind].label) : null);
      })));
    block.addEventListener('mouseenter', () => focus(n.key));
    block.addEventListener('mouseleave', () => focus(pinned));
    listEls.set(n.key, block);
    return block;
  }));

  return h('div.graph-view', h('div.relall-stage', root), list);
}
