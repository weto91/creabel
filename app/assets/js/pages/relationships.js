// Mapa de relaciones: lienzo donde se colocan personajes, lugares, objetos, grupos o
// textos libres y se conectan con flechas etiquetadas. Incluye buscador, panel con las
// relaciones del elemento seleccionado y dos colocaciones: libre (la del usuario, que se
// guarda) u optimizada (calculada para que las líneas se crucen lo menos posible).
import { h, svg, svgIcon, clear, icon } from '../dom.js';
import { api } from '../api.js';
import { profileImage, entitySubtitle, pickItem } from '../components.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { uid } from '../text.js';
import { btn, pageHeader, confirmDialog, formDialog, pickDialog, promptDialog, menuButton, notFound, titleInput, toast, errorText, helpToggle } from '../ui.js';
import { entityHref, displayName, ENTITY_TYPES } from '../model.js';
import { exportRelationsDialog } from '../export/relations.js';
import { autoLayout } from '../maplayout.js';

const FREE_W = 2400;
const FREE_H = 1600;
const NODE_H = 42;
const CARD_H = 54;
const NAME_MAX = 30;
const SUB_MAX = 36;
const REF_TYPES = ['character', 'location', 'object', 'group'];
const DEFAULT_COLOR = '#7d8a93';
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2;
const ZOOM_STEP = 1.2;
const ZOOM_KEY = 'creabel.mapZoom';

/** El zoom es una preferencia de vista: se recuerda por mapa en el navegador, no en el proyecto. */
function readZoom(id) {
  try {
    const z = Number((JSON.parse(localStorage.getItem(ZOOM_KEY) || '{}') || {})[id]);
    return z >= ZOOM_MIN && z <= ZOOM_MAX ? z : 1;
  } catch { return 1; }
}
function writeZoom(id, zoom) {
  try {
    const all = JSON.parse(localStorage.getItem(ZOOM_KEY) || '{}') || {};
    if (zoom === 1) delete all[id];
    else all[id] = zoom;
    localStorage.setItem(ZOOM_KEY, JSON.stringify(all));
  } catch { /* sin almacenamiento local, el zoom simplemente no se recuerda */ }
}
const strip = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export async function mapPage({ el, pid, params }) {
  const map = store.get(params.id);
  if (!map || map.type !== 'mindmap') return notFound(el, pid);

  // Se descartan los nodos cuyo elemento ya no existe y las flechas que quedan sueltas.
  let nodes = JSON.parse(JSON.stringify(map.data.nodes || [])).filter((n) => !n.ref || store.get(n.ref));
  let edges = JSON.parse(JSON.stringify(map.data.edges || [])).filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to));
  let layout = map.data.layout === 'auto' ? 'auto' : 'free';
  let selected = null; // { kind: 'node' | 'edge', id }
  let connecting = false;
  let connectFrom = null;
  let query = '';
  let matchIndex = -1;
  let W = FREE_W;
  let H = FREE_H;
  let autoCache = null; // { key, pos, width, height }
  let zoom = readZoom(map.id);
  let full = false; // mapa a pantalla completa, ocultando el resto de la aplicación

  const save = () => store.patchData(map.id, { nodes, edges, layout }, 700);
  // Un elemento del proyecto se dibuja como una ficha: imagen (o icono del tipo), nombre y una
  // línea de detalle. Un texto libre es un recuadro sencillo.
  const cut = (s, max) => (s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s);
  const nodeEntity = (n) => (n.ref ? store.get(n.ref) : null);
  const nodeLabel = (n) => (n.ref ? displayName(nodeEntity(n)) : n.label || '');
  const nodeSub = (n) => entitySubtitle(nodeEntity(n));
  const nodeType = (n) => (n.ref ? nodeEntity(n).type : 'text');
  const nodeBox = (n) => {
    if (!n.ref) return { w: Math.max(96, Math.min(280, nodeLabel(n).length * 7.6 + 30)), h: NODE_H };
    const text = Math.max(cut(nodeLabel(n), NAME_MAX).length * 7.8, cut(nodeSub(n), SUB_MAX).length * 6.4);
    return { w: Math.round(Math.max(150, Math.min(310, 58 + text + 16))), h: CARD_H };
  };
  const byId = (id) => nodes.find((n) => n.id === id);
  const edgesOf = (id) => edges.filter((e) => e.from === id || e.to === id);

  /** Colocación optimizada; solo se recalcula cuando cambian los elementos o las flechas. */
  const auto = () => {
    const key = nodes.map((n) => n.id).join(',') + '|' + edges.map((e) => e.from + '>' + e.to).join(',');
    if (!autoCache || autoCache.key !== key) autoCache = { key, ...autoLayout(nodes, edges) };
    return autoCache;
  };
  /** Posición de un nodo según la colocación activa. */
  const at = (n) => (layout === 'auto' ? auto().pos.get(n.id) || n : n);

  const canvas = svg('svg', { class: 'map-svg' });
  const wrap = h('div.map-wrap', { tabindex: '0', 'aria-label': t('mindmap.canvas') }, canvas);
  // Controles de vista (zoom y pantalla completa), fijos en una esquina del lienzo.
  const tools = h('div.map-tools');
  const stage = h('div.map-stage');
  const hint = h('p.map-hint');
  const help = helpToggle('');
  const toolbar = h('div.map-toolbar');
  const panel = h('aside.map-panel');
  const searchInput = h('input.input.map-search', { type: 'search', placeholder: t('mindmap.search'), 'aria-label': t('mindmap.search') });
  const searchCount = h('span.muted.small');

  const matches = () => {
    const q = strip(query.trim());
    return q ? nodes.filter((n) => strip(`${nodeLabel(n)} ${nodeSub(n)}`).includes(q)) : [];
  };

  // Las coordenadas de los nodos son las del lienzo sin escalar; en pantalla se multiplican por el zoom.
  const centerOn = (n) => {
    const p = at(n);
    wrap.scrollTo({ left: p.x * zoom - wrap.clientWidth / 2, top: p.y * zoom - wrap.clientHeight / 2, behavior: 'smooth' });
  };
  const centerAll = () => {
    if (!nodes.length) {
      wrap.scrollLeft = (W * zoom) / 2 - wrap.clientWidth / 2;
      wrap.scrollTop = (H * zoom) / 2 - wrap.clientHeight / 2;
      return;
    }
    const cx = nodes.reduce((s, n) => s + at(n).x, 0) / nodes.length;
    const cy = nodes.reduce((s, n) => s + at(n).y, 0) / nodes.length;
    wrap.scrollLeft = cx * zoom - wrap.clientWidth / 2;
    wrap.scrollTop = cy * zoom - wrap.clientHeight / 2;
  };

  /** Cambia el zoom dejando quieto el punto (ax, ay) de la zona visible; por defecto, su centro. */
  const setZoom = (next, ax = wrap.clientWidth / 2, ay = wrap.clientHeight / 2) => {
    next = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next)) * 100) / 100;
    if (next === zoom) return;
    const px = (wrap.scrollLeft + ax) / zoom;
    const py = (wrap.scrollTop + ay) / zoom;
    zoom = next;
    writeZoom(map.id, zoom);
    draw();
    wrap.scrollLeft = px * zoom - ax;
    wrap.scrollTop = py * zoom - ay;
  };

  /** Ajusta el zoom para que quepan todos los elementos y los centra. */
  const fit = () => {
    if (!nodes.length) { setZoom(1); centerAll(); return; }
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const n of nodes) {
      const p = at(n);
      const box = nodeBox(n);
      x1 = Math.min(x1, p.x - box.w / 2); x2 = Math.max(x2, p.x + box.w / 2);
      y1 = Math.min(y1, p.y - box.h / 2); y2 = Math.max(y2, p.y + box.h / 2);
    }
    const margin = 70;
    const next = Math.min(1, (wrap.clientWidth - margin) / (x2 - x1 || 1), (wrap.clientHeight - margin) / (y2 - y1 || 1));
    zoom = Math.round(Math.max(ZOOM_MIN, next) * 100) / 100;
    writeZoom(map.id, zoom);
    draw();
    wrap.scrollLeft = ((x1 + x2) / 2) * zoom - wrap.clientWidth / 2;
    wrap.scrollTop = ((y1 + y2) / 2) * zoom - wrap.clientHeight / 2;
  };

  const setFull = (on) => {
    if (full === on) return;
    // Se conserva el punto central al cambiar de tamaño.
    const px = (wrap.scrollLeft + wrap.clientWidth / 2) / zoom;
    const py = (wrap.scrollTop + wrap.clientHeight / 2) / zoom;
    full = on;
    stage.classList.toggle('is-full', full);
    document.documentElement.classList.toggle('map-full', full);
    draw();
    wrap.scrollLeft = px * zoom - wrap.clientWidth / 2;
    wrap.scrollTop = py * zoom - wrap.clientHeight / 2;
    wrap.focus({ preventScroll: true });
  };

  /** Punto del borde del rectángulo centrado en `to` en dirección a `from`. */
  const clip = (from, to, box) => {
    const dx = from.x - to.x;
    const dy = from.y - to.y;
    if (!dx && !dy) return { x: to.x, y: to.y };
    const sx = dx ? (box.w / 2 + 5) / Math.abs(dx) : Infinity;
    const sy = dy ? (box.h / 2 + 5) / Math.abs(dy) : Infinity;
    const s = Math.min(sx, sy, 1);
    return { x: to.x + dx * s, y: to.y + dy * s };
  };

  const select = (sel) => {
    selected = sel;
    draw();
  };

  const editEdge = async (edge) => {
    const out = await formDialog({
      title: t('mindmap.relation'),
      fields: [
        { name: 'label', label: t('mindmap.relationLabel'), value: edge.label || '', placeholder: t('mindmap.relationPlaceholder') },
        { name: 'both', label: t('mindmap.both'), type: 'checkbox', value: !!edge.both },
        { name: 'color', label: t('group.color'), type: 'color', value: edge.color || DEFAULT_COLOR },
      ],
    });
    if (!out) return false;
    edge.label = out.label;
    edge.both = out.both;
    edge.color = out.color;
    return true;
  };

  const removeEdge = (id) => {
    edges = edges.filter((e) => e.id !== id);
    if (selected && selected.kind === 'edge' && selected.id === id) selected = null;
    save();
    draw();
  };
  const removeNode = (id) => {
    nodes = nodes.filter((n) => n.id !== id);
    edges = edges.filter((e) => e.from !== id && e.to !== id);
    selected = null;
    save();
    draw();
  };
  const removeSelected = () => {
    if (!selected) return;
    if (selected.kind === 'node') removeNode(selected.id);
    else removeEdge(selected.id);
  };

  const onNodeClick = async (n) => {
    if (!connecting) return select({ kind: 'node', id: n.id });
    if (!connectFrom) {
      connectFrom = n.id;
      return draw();
    }
    if (connectFrom === n.id) {
      connectFrom = null;
      return draw();
    }
    const edge = { id: uid(), from: connectFrom, to: n.id, label: '', color: DEFAULT_COLOR, both: false };
    connectFrom = null;
    connecting = false;
    if (await editEdge(edge)) {
      edges.push(edge);
      save();
    }
    draw();
  };

  // Elementos SVG de cada ficha y cada flecha, para poder actualizar solo algunos.
  const nodeEls = new Map();
  const edgeEls = new Map();
  let edgeGroup = null; // la define draw(): construye el dibujo de una flecha

  /** Lleva una ficha a su posición actual y rehace sus flechas, sin tocar el resto del mapa. */
  const moveLive = (n) => {
    const g = nodeEls.get(n.id);
    if (!g || !edgeGroup) return draw();
    const box = nodeBox(n);
    g.setAttribute('transform', `translate(${n.x - box.w / 2}, ${n.y - box.h / 2})`);
    for (const e of edgesOf(n.id)) {
      const old = edgeEls.get(e.id);
      const fresh = edgeGroup(e);
      if (old && fresh) { old.replaceWith(fresh); edgeEls.set(e.id, fresh); }
    }
  };

  const startDrag = (e, n) => {
    if (e.button !== 0) return;
    e.preventDefault();
    wrap.focus({ preventScroll: true });
    // En la colocación optimizada los elementos no se mueven a mano: un clic solo selecciona.
    const movable = layout === 'free' && !connecting;
    const rect = canvas.getBoundingClientRect();
    const offX = (e.clientX - rect.left) / zoom - n.x;
    const offY = (e.clientY - rect.top) / zoom - n.y;
    let moved = false;
    let frame = 0;
    const move = (ev) => {
      if (!movable) return;
      const r = canvas.getBoundingClientRect();
      const x = Math.max(60, (ev.clientX - r.left) / zoom - offX);
      const y = Math.max(30, (ev.clientY - r.top) / zoom - offY);
      if (Math.abs(x - n.x) + Math.abs(y - n.y) > 2) moved = true;
      if (!moved) return;
      n.x = Math.round(x);
      n.y = Math.round(y);
      // Mientras se arrastra solo se mueven la ficha y sus flechas, una vez por fotograma.
      // El mapa entero se repinta al soltar (o si la ficha se sale del lienzo y hay que ampliarlo).
      if (n.x + 220 > W || n.y + 160 > H) { cancelAnimationFrame(frame); frame = 0; draw(); return; }
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; moveLive(n); });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      cancelAnimationFrame(frame);
      if (moved) { draw(); save(); }
      else onNodeClick(n);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /** Arrastrar el fondo desplaza el mapa; un clic sin arrastre quita la selección. */
  const startPan = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    wrap.focus({ preventScroll: true });
    const x0 = e.clientX;
    const y0 = e.clientY;
    const left = wrap.scrollLeft;
    const top = wrap.scrollTop;
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 4) return;
      moved = true;
      wrap.classList.add('panning');
      wrap.scrollLeft = left - (ev.clientX - x0);
      wrap.scrollTop = top - (ev.clientY - y0);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      wrap.classList.remove('panning');
      if (!moved && selected) select(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // ---------- Panel lateral: relaciones del elemento seleccionado o resultados de búsqueda ----------

  const drawPanel = () => {
    clear(panel);
    const node = selected && selected.kind === 'node' ? byId(selected.id) : null;
    const edge = selected && selected.kind === 'edge' ? edges.find((e) => e.id === selected.id) : null;

    if (node) {
      const entity = node.ref ? store.get(node.ref) : null;
      const list = edgesOf(node.id);
      panel.append(
        h('div.panel-head', h('h3', nodeLabel(node)), h('span.badge', t(entity ? entity.type + '.singular' : 'mindmap.text'))),
        h('p.muted.small', tn('mindmap.relationCount', list.length)));
      if (list.length) {
        panel.append(h('ul.rel-list', list.map((e) => {
          const other = byId(e.from === node.id ? e.to : e.from);
          const arrow = e.both ? '↔' : e.from === node.id ? '→' : '←';
          return h('li.rel-row',
            h('button.rel-main', { type: 'button', title: t('mindmap.goTo'), onclick: () => { selected = { kind: 'node', id: other.id }; draw(); centerOn(other); } },
              h('span.rel-arrow', { style: { color: e.color || DEFAULT_COLOR } }, arrow),
              h('span.rel-text', h('span.rel-label', e.label || t('mindmap.noLabel')), h('strong', nodeLabel(other)))),
            btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: async () => { if (await editEdge(e)) { save(); draw(); } } }),
            btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.delete'), onClick: () => removeEdge(e.id) }));
        })));
      }
      panel.append(h('div.btn-row',
        entity ? btn(t('mindmap.openSheet'), { icon: 'link', small: true, href: entityHref(entity) }) : btn(t('common.edit'), { icon: 'edit', small: true, onClick: async () => {
          const label = await promptDialog({ title: t('mindmap.text'), label: t('mindmap.text'), value: node.label });
          if (label) { node.label = label; save(); draw(); }
        } }),
        btn(t('mindmap.removeFromMap'), { icon: 'trash', small: true, kind: 'ghost', onClick: () => removeNode(node.id) })));
      return;
    }

    if (edge) {
      const a = byId(edge.from);
      const b = byId(edge.to);
      panel.append(
        h('div.panel-head', h('h3', t('mindmap.relation'))),
        h('p.rel-summary', h('strong', nodeLabel(a)), ` ${edge.both ? '↔' : '→'} `, h('strong', nodeLabel(b))),
        h('p.muted', edge.label || t('mindmap.noLabel')),
        h('div.btn-row',
          btn(t('common.edit'), { icon: 'edit', small: true, onClick: async () => { if (await editEdge(edge)) { save(); draw(); } } }),
          btn(t('common.delete'), { icon: 'trash', small: true, kind: 'ghost', onClick: () => removeEdge(edge.id) })));
      return;
    }

    const found = matches();
    if (query.trim()) {
      panel.append(h('div.panel-head', h('h3', t('mindmap.results'))));
      panel.append(found.length
        ? h('ul.rel-list', found.map((n) => h('li.rel-row', h('button.rel-main', { type: 'button', onclick: () => { selected = { kind: 'node', id: n.id }; draw(); centerOn(n); } },
          h('span', { class: 'legend-swatch t-' + nodeType(n) }), h('span.rel-text', h('strong', nodeLabel(n)), h('span.rel-label', tn('mindmap.relationCount', edgesOf(n.id).length)))))))
        : h('p.muted', t('mindmap.noMatches')));
      return;
    }
    panel.append(h('div.panel-head', h('h3', t('mindmap.relations'))), h('p.muted', t('mindmap.selectHint')));
  };

  // ---------- Lienzo ----------

  const draw = () => {
    if (layout === 'auto') {
      W = auto().width;
      H = auto().height;
    } else {
      W = Math.max(FREE_W, ...nodes.map((n) => n.x + 400));
      H = Math.max(FREE_H, ...nodes.map((n) => n.y + 300));
    }
    // Con el zoom alejado el lienzo se amplía para cubrir siempre toda la zona visible.
    W = Math.max(W, Math.ceil(wrap.clientWidth / zoom));
    H = Math.max(H, Math.ceil(wrap.clientHeight / zoom));
    canvas.setAttribute('width', Math.round(W * zoom));
    canvas.setAttribute('height', Math.round(H * zoom));
    canvas.setAttribute('viewBox', `0 0 ${W} ${H}`);
    clear(canvas);
    canvas.append(svg('rect', { class: 'map-bg', x: 0, y: 0, width: W, height: H, onpointerdown: startPan }));

    // Qué se resalta: el elemento seleccionado con sus relaciones o, si no, lo que coincide con la búsqueda.
    let focus = null;
    let hot = null;
    if (selected && selected.kind === 'node') {
      hot = new Set(edgesOf(selected.id).map((e) => e.id));
      focus = new Set([selected.id]);
      for (const e of edgesOf(selected.id)) { focus.add(e.from); focus.add(e.to); }
    } else if (selected && selected.kind === 'edge') {
      const e = edges.find((x) => x.id === selected.id);
      if (e) { hot = new Set([e.id]); focus = new Set([e.from, e.to]); }
    }
    const found = query.trim() ? new Set(matches().map((n) => n.id)) : null;

    // Dibuja una flecha. Queda disponible fuera de aquí para rehacer solo las de una ficha
    // mientras se la arrastra, sin volver a pintar el mapa entero.
    edgeGroup = (e) => {
      const a = byId(e.from);
      const b = byId(e.to);
      if (!a || !b) return null;
      let p1 = clip(at(b), at(a), nodeBox(a));
      let p2 = clip(at(a), at(b), nodeBox(b));
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const ux = (p2.x - p1.x) / len;
      const uy = (p2.y - p1.y) / len;
      // Si existe la flecha inversa se separan para que no se solapen.
      if (edges.some((o) => o.from === e.to && o.to === e.from)) {
        p1 = { x: p1.x - uy * 9, y: p1.y + ux * 9 };
        p2 = { x: p2.x - uy * 9, y: p2.y + ux * 9 };
      }
      const color = e.color || DEFAULT_COLOR;
      const isSel = selected && selected.kind === 'edge' && selected.id === e.id;
      const head = 11;
      const end = { x: p2.x - ux * head, y: p2.y - uy * head };
      const start = e.both ? { x: p1.x + ux * head, y: p1.y + uy * head } : p1;
      const arrow = (tip, base, dir) => svg('polygon', {
        points: `${tip.x},${tip.y} ${base.x - uy * 5.5 * dir},${base.y + ux * 5.5 * dir} ${base.x + uy * 5.5 * dir},${base.y - ux * 5.5 * dir}`, fill: color,
      });
      const dim = (hot && !hot.has(e.id)) || (!hot && found && !(found.has(e.from) && found.has(e.to)));
      const g = svg('g', {
        class: 'map-edge' + (isSel ? ' selected' : '') + (dim ? ' dim' : ''),
        onpointerdown: (ev) => { ev.stopPropagation(); select({ kind: 'edge', id: e.id }); },
        ondblclick: async () => { if (await editEdge(e)) { save(); draw(); } },
      },
        svg('line', { class: 'map-edge-hit', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }),
        svg('line', { x1: start.x, y1: start.y, x2: end.x, y2: end.y, stroke: color, 'stroke-width': isSel || (hot && hot.has(e.id)) ? 3 : 2 }),
        arrow(p2, end, 1),
        e.both ? arrow(p1, start, 1) : null);
      if (e.label) {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const tw = e.label.length * 6.6 + 14;
        g.append(
          svg('rect', { class: 'map-edge-label-bg', x: mx - tw / 2, y: my - 11, width: tw, height: 22, rx: 6 }),
          svg('text', { class: 'map-edge-label', x: mx, y: my + 4, 'text-anchor': 'middle' }, e.label));
      }
      return g;
    };
    edgeEls.clear();
    nodeEls.clear();
    for (const e of edges) {
      const g = edgeGroup(e);
      if (g) { edgeEls.set(e.id, g); canvas.append(g); }
    }

    for (const n of nodes) {
      const box = nodeBox(n);
      const p = at(n);
      const isSel = (selected && selected.kind === 'node' && selected.id === n.id) || connectFrom === n.id;
      const dim = focus ? !focus.has(n.id) : found ? !found.has(n.id) : false;
      const g = svg('g', {
        class: `map-node t-${nodeType(n)}` + (isSel ? ' selected' : '') + (dim ? ' dim' : '') + (found && found.has(n.id) ? ' found' : '') + (layout === 'auto' ? ' fixed' : ''),
        transform: `translate(${p.x - box.w / 2}, ${p.y - box.h / 2})`,
        onpointerdown: (ev) => { ev.stopPropagation(); startDrag(ev, n); },
      }, svg('rect', { class: 'map-node-box', width: box.w, height: box.h, rx: 5 }));
      const entity = nodeEntity(n);
      if (entity) {
        const image = profileImage(entity);
        const clipId = 'map-clip-' + n.id;
        g.append(
          svg('clipPath', { id: clipId }, svg('rect', { x: 7, y: 7, width: 40, height: 40, rx: 4 })),
          svg('rect', { class: 'map-node-thumb', x: 7, y: 7, width: 40, height: 40, rx: 4 }),
          image
            ? svg('image', { href: api.imageUrl(image), x: 7, y: 7, width: 40, height: 40, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${clipId})` })
            : svgIcon((ENTITY_TYPES[entity.type] || {}).icon || 'note', 17, 17, 20),
          svg('text', { class: 'map-node-name', x: 56, y: 24 }, cut(nodeLabel(n), NAME_MAX)),
          svg('text', { class: 'map-node-sub', x: 56, y: 41 }, cut(nodeSub(n), SUB_MAX)));
      } else {
        g.append(svg('text', { class: 'map-node-name', x: box.w / 2, y: box.h / 2 + 5, 'text-anchor': 'middle' }, nodeLabel(n)));
      }
      nodeEls.set(n.id, g);
      canvas.append(g);
    }

    // A la vista solo lo que pide una acción (conectar, o empezar un mapa vacío); la
    // explicación general de cada colocación queda plegada tras el botón «?».
    hint.textContent = connecting
      ? t(connectFrom ? 'mindmap.pickTarget' : 'mindmap.pickSource')
      : !nodes.length ? t('mindmap.hintEmpty') : '';
    hint.hidden = !hint.textContent;
    help.setText(t(layout === 'auto' ? 'mindmap.hintAuto' : 'mindmap.hintIdle'));
    const found2 = matches();
    searchCount.textContent = query.trim() ? tn('mindmap.matches', found2.length) : '';
    drawToolbar();
    drawPanel();
  };

  /** Posición libre cerca del centro de la zona visible. */
  const freeSpot = (i) => {
    const cx = (wrap.scrollLeft + wrap.clientWidth / 2) / zoom;
    const cy = (wrap.scrollTop + wrap.clientHeight / 2) / zoom;
    const angle = (nodes.length + i) * 0.9;
    const radius = 60 + (nodes.length + i) * 22;
    return {
      x: Math.round(Math.max(100, cx + Math.cos(angle) * radius)),
      y: Math.round(Math.max(60, cy + Math.sin(angle) * radius * 0.6)),
    };
  };

  const addElements = async () => {
    const used = new Set(nodes.filter((n) => n.ref).map((n) => n.ref));
    const items = [];
    for (const type of REF_TYPES) {
      for (const e of store.list(type)) {
        if (!used.has(e.id)) items.push(pickItem(e, { group: t(type + '.plural') }));
      }
    }
    const picked = await pickDialog({ title: t('mindmap.addElements'), items, emptyText: t('mindmap.noElements') });
    if (!picked || !picked.length) return;
    picked.forEach((id, i) => nodes.push({ id: uid(), ref: id, ...freeSpot(i) }));
    save();
    draw();
  };

  const addText = async () => {
    const label = await promptDialog({ title: t('mindmap.addText'), label: t('mindmap.text'), submitLabel: t('common.create') });
    if (!label) return;
    nodes.push({ id: uid(), ref: null, label, ...freeSpot(0) });
    save();
    draw();
  };

  const setLayout = (next) => {
    if (layout === next) return;
    layout = next;
    save();
    draw();
    centerAll();
  };

  /** Copia la colocación optimizada a la libre, para seguir ajustándola a mano. */
  const applyAuto = async () => {
    if (!(await confirmDialog(t('mindmap.confirmApply'), { confirmLabel: t('mindmap.applyLayout') }))) return;
    const pos = auto().pos;
    for (const n of nodes) {
      const p = pos.get(n.id);
      if (p) { n.x = p.x; n.y = p.y; }
    }
    layout = 'free';
    save();
    draw();
    centerAll();
  };

  const drawToolbar = () => {
    clear(toolbar);
    const mode = (key, label) => h('button', {
      type: 'button', class: 'seg-opt' + (layout === key ? ' active' : ''), 'aria-pressed': String(layout === key), onclick: () => setLayout(key),
    }, label);
    // Element.append convierte null en el texto «null»: se filtra antes.
    toolbar.append(...[
      btn(t('mindmap.addElements'), { icon: 'plus', kind: 'primary', small: true, onClick: addElements }),
      btn(t('mindmap.addText'), { icon: 'note', small: true, onClick: addText }),
      btn(t(connecting ? 'mindmap.cancelConnect' : 'mindmap.connect'), {
        icon: 'link', small: true, kind: connecting ? 'primary' : 'default',
        onClick: () => { connecting = !connecting; connectFrom = null; selected = null; draw(); },
      }),
      h('span.seg', { role: 'group', 'aria-label': t('mindmap.layout') },
        h('span.seg-label', t('mindmap.layout')), mode('free', t('mindmap.layoutFree')), mode('auto', t('mindmap.layoutAuto'))),
      layout === 'auto' && nodes.length ? btn(t('mindmap.applyLayout'), { icon: 'check', small: true, onClick: applyAuto }) : null,
    ].filter(Boolean));

    clear(tools);
    const tool = (name, label, onClick, disabled) => h('button.map-tool', { type: 'button', title: label, 'aria-label': label, disabled: disabled || null, onclick: onClick }, icon(name, 16));
    tools.append(
      tool('minus', t('mindmap.zoomOut'), () => setZoom(zoom / ZOOM_STEP), zoom <= ZOOM_MIN),
      h('button.map-tool.map-zoom-value', { type: 'button', title: t('mindmap.zoomReset'), onclick: () => setZoom(1) }, Math.round(zoom * 100) + ' %'),
      tool('plus', t('mindmap.zoomIn'), () => setZoom(zoom * ZOOM_STEP), zoom >= ZOOM_MAX),
      h('button.map-tool.map-tool-text', { type: 'button', title: t('mindmap.fitHint'), onclick: fit }, t('mindmap.fit')),
      tool(full ? 'minimize' : 'maximize', t(full ? 'mindmap.exitFull' : 'mindmap.full'), () => setFull(!full)));
  };

  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    matchIndex = -1;
    if (query.trim()) selected = null;
    draw();
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // Intro recorre las coincidencias una a una.
      e.preventDefault();
      const found = matches();
      if (!found.length) return;
      matchIndex = (matchIndex + 1) % found.length;
      selected = { kind: 'node', id: found[matchIndex].id };
      draw();
      centerOn(found[matchIndex]);
      searchInput.focus();
    } else if (e.key === 'Escape' && query) {
      e.stopPropagation();
      searchInput.value = '';
      query = '';
      draw();
    }
  });

  wrap.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeSelected(); }
    // preventDefault evita que este mismo Esc cierre además la pantalla completa.
    if (e.key === 'Escape' && connecting) { e.preventDefault(); connecting = false; connectFrom = null; draw(); }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Con una ficha seleccionada (por ejemplo desde el buscador), las flechas del teclado la
    // mueven: 10 píxeles, o 50 con Mayús. Sin selección desplazan el mapa, como siempre.
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (arrows[e.key] && selected && selected.kind === 'node' && layout === 'free' && !connecting) {
      const n = byId(selected.id);
      if (n) {
        e.preventDefault();
        const step = e.shiftKey ? 50 : 10;
        n.x = Math.max(60, n.x + arrows[e.key][0] * step);
        n.y = Math.max(30, n.y + arrows[e.key][1] * step);
        save();
        draw();
        return;
      }
    }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(zoom * ZOOM_STEP); }
    if (e.key === '-') { e.preventDefault(); setZoom(zoom / ZOOM_STEP); }
    if (e.key === '0') { e.preventDefault(); setZoom(1); }
  });
  // Ctrl (o Cmd) + rueda acerca o aleja alrededor del puntero; la rueda sola desplaza como siempre.
  wrap.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = wrap.getBoundingClientRect();
    setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });
  // Esc sale de la pantalla completa (si no hay un diálogo abierto ni una conexión a medias).
  const onKey = (e) => {
    if (e.key !== 'Escape' || !full || connecting || e.defaultPrevented || document.querySelector('.modal-overlay')) return;
    if (e.target === searchInput && query) return;
    setFull(false);
  };
  document.addEventListener('keydown', onKey);
  const onResize = () => { if (full) draw(); };
  window.addEventListener('resize', onResize);

  clear(el);
  el.append(
    pageHeader({
      back: { href: `#/p/${pid}/relationships`, label: t('mindmap.plural') },
      titleNode: titleInput(map.name, (name) => store.update(map.id, { name })),
      actions: [menuButton(() => [
        { label: t('relexp.buttonMap'), icon: 'download', onClick: async () => { await store.flush(); exportRelationsDialog(store.get(map.id)); } },
        { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
          if (!(await confirmDialog(t('common.confirmDelete', { name: displayName(map) }), { danger: true, confirmLabel: t('common.delete') }))) return;
          try {
            await store.remove(map.id);
            location.hash = `#/p/${pid}/relationships`;
          } catch (err) { toast(errorText(err), 'error'); }
        } },
      ])],
    }),
    stage);
  // Todo lo que se necesita para trabajar con el mapa va dentro de `stage`, que es lo que
  // pasa a ocupar la ventana entera en pantalla completa.
  stage.append(
    // El buscador va fuera de la barra que se redibuja, para no perder el foco al escribir.
    h('div.map-bar', toolbar, h('div.map-search-box', searchCount, searchInput, help.button)),
    help.panel,
    hint,
    h('div.map-layout', h('div.map-canvas-box', wrap, tools), panel),
    h('div.map-legend', REF_TYPES.map((type) => h('span', { class: 'legend-item' }, h('span', { class: 'legend-swatch t-' + type }), t(type + '.plural'))),
      h('span.legend-item', h('span.legend-swatch.t-text'), t('mindmap.text'))));
  draw();
  // Empieza mostrando la zona donde están los nodos (o el centro si el mapa está vacío).
  requestAnimationFrame(centerAll);

  return () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    document.documentElement.classList.remove('map-full');
  };
}
