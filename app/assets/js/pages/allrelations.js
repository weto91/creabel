// Pestaña «Relaciones» de Personajes: todas las relaciones dibujadas en cualquiera de los mapas
// de «Relaciones», reunidas en un solo diagrama (los elementos en círculo, una línea por
// relación) y, debajo, la lista de cada elemento con las suyas. No se edita aquí: se edita en
// los mapas.
import { h, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { btn, emptyState } from '../ui.js';
import { allRelations, entityHref, ENTITY_TYPES } from '../model.js';
import { codeTag } from '../components.js';
import { exportRelationsDialog } from '../export/relations.js';

const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, ...children) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  el.append(...children.filter((c) => c != null));
  return el;
};
const TYPE_ORDER = ['character', 'group', 'location', 'object', 'custom'];
const short = (text, max = 24) => (text.length > max ? text.slice(0, max - 1) + '…' : text);
const typeOf = (node) => (node.entity ? node.entity.type : 'text');

/**
 * Las relaciones de los mapas en las que interviene algún elemento de un tipo (personajes,
 * lugares…), con todos los elementos que tocan. Sin relaciones, la pestaña no se enseña.
 */
export function relationsAbout(type) {
  const { nodes, edges } = allRelations();
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const is = (key) => { const n = byKey.get(key); return !!n && !!n.entity && n.entity.type === type; };
  const kept = edges.filter((e) => is(e.a) || is(e.b));
  const used = new Set(kept.flatMap((e) => [e.a, e.b]));
  return { nodes: nodes.filter((n) => used.has(n.key)), edges: kept };
}

export function relationsOverview(body, pid, type) {
  const { nodes, edges } = relationsAbout(type);
  const mapsHref = `#/p/${pid}/relationships?tab=maps`;
  if (!edges.length) {
    body.append(emptyState(t('relall.empty'), btn(t('nav.relationships'), { icon: 'share', kind: 'primary', href: mapsHref }), 'share'));
    return;
  }
  const rank = (n) => { const i = TYPE_ORDER.indexOf(typeOf(n)); return i < 0 ? TYPE_ORDER.length : i; };
  nodes.sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

  // ----- Diagrama -----
  const W = 940;
  const R = Math.max(150, Math.min(300, 40 + nodes.length * 14));
  const H = R * 2 + 130;
  const [cx, cy] = [W / 2, H / 2];
  const pos = new Map(nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return [n.key, { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), angle }];
  }));
  let pinned = null; // elemento elegido con un clic
  const root = svg('svg', { class: 'relall-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': t('relall.tab') },
    svg('defs', {}, svg('marker', { id: 'relall-arrow', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' },
      svg('path', { d: 'M0 0 10 5 0 10z', class: 'relall-head' }))));

  const edgeEls = edges.map((e) => {
    const a = pos.get(e.a);
    const b = pos.get(e.b);
    // La línea se curva hacia el centro y termina en el borde de cada círculo, no en su centro.
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const c = { x: cx + (mx - cx) * 0.35, y: cy + (my - cy) * 0.35 };
    const trim = (p) => { const d = Math.hypot(c.x - p.x, c.y - p.y) || 1; return { x: p.x + ((c.x - p.x) / d) * 12, y: p.y + ((c.y - p.y) / d) * 12 }; };
    const [p0, p1] = [trim(a), trim(b)];
    const mid = { x: 0.25 * p0.x + 0.5 * c.x + 0.25 * p1.x, y: 0.25 * p0.y + 0.5 * c.y + 0.25 * p1.y };
    const g = svg('g', { class: 'relall-edge' },
      svg('path', { d: `M${p0.x} ${p0.y} Q${c.x} ${c.y} ${p1.x} ${p1.y}`, 'marker-end': 'url(#relall-arrow)', 'marker-start': e.both ? 'url(#relall-arrow)' : null }),
      e.label ? svg('text', { x: mid.x, y: mid.y, 'text-anchor': 'middle', dy: '-4' }, document.createTextNode(short(e.label, 30))) : null);
    root.append(g);
    return { e, g };
  });

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
  const nodeEls = new Map();
  const listEls = new Map();
  for (const n of nodes) {
    const p = pos.get(n.key);
    const right = Math.cos(p.angle) >= -0.01;
    const g = svg('g', { class: `relall-node k-${typeOf(n)}`, tabindex: '0', role: 'button', 'aria-label': n.label },
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

  // ----- Lista: cada elemento con sus relaciones -----
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const name = (n) => (n.entity ? h('a', { href: entityHref(n.entity) }, n.label) : h('span', n.label));
  const list = h('div.relall-list', nodes.map((n) => {
    const mine = edges.filter((e) => e.a === n.key || e.b === n.key);
    const cfg = n.entity ? ENTITY_TYPES[n.entity.type] || {} : {};
    const block = h('section', { class: `relall-item k-${typeOf(n)}` },
      h('h3', icon(cfg.icon || 'note', 15), name(n), n.entity ? codeTag(n.entity) : null, h('span.muted', String(mine.length))),
      h('ul', mine.map((e) => {
        const out = e.a === n.key;
        const other = byKey.get(out ? e.b : e.a);
        return h('li',
          h('span.relall-arrow', e.both ? '↔' : out ? '→' : '←'),
          h('span.relall-label', e.label || t('mindmap.noLabel')),
          h('strong', name(other)),
          // De dónde sale: los mapas en los que está dibujada y las fichas en las que está apuntada.
          h('span.relall-maps', [...e.maps.map((m) => h('a', { href: entityHref(m) }, m.name || t('common.untitled'))),
            ...(e.sheets || []).map((s) => h('a', { href: entityHref(s) }, t('rel.sheetOf', { name: s.name || t('common.untitled') })))]
            .flatMap((link, i) => [i ? ', ' : '', link])));
      })));
    block.addEventListener('mouseenter', () => focus(n.key));
    block.addEventListener('mouseleave', () => focus(pinned));
    listEls.set(n.key, block);
    return block;
  }));

  body.append(
    h('div.filter-row', h('p.muted', t('relall.hint', { what: t(type + '.plural').toLowerCase() })), h('span.spacer'),
      btn(t('relexp.button'), { icon: 'download', small: true, onClick: () => exportRelationsDialog(null) }),
      btn(t('relall.edit'), { icon: 'share', small: true, href: mapsHref })),
    h('p.muted.small', `${tn('relall.count', edges.length)} · ${tn('relall.items', nodes.length)} · ${tn('relall.maps', new Set(edges.flatMap((e) => e.maps)).size)}`),
    h('div.relall-stage', root),
    list);
}
