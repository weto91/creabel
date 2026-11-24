// Colocación optimizada de un mapa de relaciones: reparte los elementos en una cuadrícula
// buscando que las líneas se crucen lo menos posible, que no pasen por encima de otros
// elementos y que los relacionados queden cerca. Es determinista: el mismo mapa da siempre
// la misma colocación.

// La celda deja sitio a la ficha más ancha (310 px) y a la etiqueta de la flecha entre dos fichas.
const CELL_W = 380;
const CELL_H = 140;
const MARGIN_X = 190;
const MARGIN_Y = 110;

/** Generador pseudoaleatorio con semilla (mulberry32), para que el resultado sea repetible. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const orient = (ax, ay, bx, by, cx, cy) => Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));

/**
 * nodes: [{ id }], edges: [{ from, to }].
 * Devuelve { pos: Map(id -> { x, y }), width, height } en píxeles del lienzo.
 */
export function autoLayout(nodes, edges) {
  const n = nodes.length;
  const pos = new Map();
  if (!n) return { pos, width: 1200, height: 700 };

  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const pairs = [];
  const seen = new Set();
  for (const e of edges) {
    const a = index.get(e.from);
    const b = index.get(e.to);
    if (a === undefined || b === undefined || a === b) continue;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push([a, b]);
  }

  const cols = Math.max(2, Math.ceil(Math.sqrt(n) * 1.35));
  const rows = Math.ceil(n / cols) + (n > 2 ? 1 : 0);
  const cells = cols * rows;

  // Colocación inicial: recorrido en anchura desde los elementos con más relaciones,
  // de modo que los relacionados empiecen ya cerca.
  const neighbours = Array.from({ length: n }, () => []);
  for (const [a, b] of pairs) { neighbours[a].push(b); neighbours[b].push(a); }
  const byDegree = [...Array(n).keys()].sort((a, b) => neighbours[b].length - neighbours[a].length || a - b);
  const order = [];
  const placed = new Array(n).fill(false);
  for (const start of byDegree) {
    if (placed[start]) continue;
    const queue = [start];
    placed[start] = true;
    while (queue.length) {
      const node = queue.shift();
      order.push(node);
      for (const next of neighbours[node]) {
        if (!placed[next]) { placed[next] = true; queue.push(next); }
      }
    }
  }
  const cellOf = new Int32Array(n);
  const nodeAt = new Int32Array(cells).fill(-1);
  order.forEach((node, k) => { cellOf[node] = k; nodeAt[k] = node; });

  const col = (c) => c % cols;
  const row = (c) => Math.floor(c / cols);

  const cost = () => {
    let crossings = 0;
    let over = 0;
    let length = 0;
    const seg = pairs.map(([a, b]) => [col(cellOf[a]), row(cellOf[a]), col(cellOf[b]), row(cellOf[b])]);
    for (let i = 0; i < seg.length; i++) {
      const [x1, y1, x2, y2] = seg[i];
      const dx = x2 - x1;
      const dy = y2 - y1;
      // Las celdas son más anchas que altas: un paso horizontal cuenta más.
      length += Math.abs(dx) * 1.5 + Math.abs(dy);
      // Línea que pasa por encima de otro elemento.
      const steps = gcd(dx, dy);
      for (let k = 1; k < steps; k++) {
        if (nodeAt[(y1 + (dy / steps) * k) * cols + x1 + (dx / steps) * k] !== -1) over++;
      }
      for (let j = i + 1; j < seg.length; j++) {
        if (pairs[i][0] === pairs[j][0] || pairs[i][0] === pairs[j][1] || pairs[i][1] === pairs[j][0] || pairs[i][1] === pairs[j][1]) continue;
        const [x3, y3, x4, y4] = seg[j];
        if (orient(x1, y1, x2, y2, x3, y3) * orient(x1, y1, x2, y2, x4, y4) < 0
          && orient(x3, y3, x4, y4, x1, y1) * orient(x3, y3, x4, y4, x2, y2) < 0) crossings++;
      }
    }
    return crossings * 10 + over * 8 + length * 0.35;
  };

  if (pairs.length) {
    // Recocido simulado: se intercambian dos celdas y se conserva el cambio si mejora
    // (o, al principio, aunque empeore un poco, para no quedarse en una solución mediocre).
    const random = seeded(hash(nodes.map((x) => x.id).join(',') + '|' + pairs.map((p) => p.join('-')).join(',')));
    const swap = (a, b) => {
      const na = nodeAt[a];
      const nb = nodeAt[b];
      nodeAt[a] = nb;
      nodeAt[b] = na;
      if (na !== -1) cellOf[na] = b;
      if (nb !== -1) cellOf[nb] = a;
    };
    const iterations = Math.max(600, Math.min(8000, Math.floor(2000000 / (pairs.length * pairs.length + 20))));
    let current = cost();
    let best = current;
    let bestCells = cellOf.slice();
    for (let it = 0; it < iterations; it++) {
      const a = Math.floor(random() * cells);
      const b = Math.floor(random() * cells);
      if (a === b || (nodeAt[a] === -1 && nodeAt[b] === -1)) continue;
      swap(a, b);
      const next = cost();
      const temperature = Math.max(0.01, 3 * (1 - it / iterations));
      if (next <= current || random() < Math.exp((current - next) / temperature)) {
        current = next;
        if (next < best) { best = next; bestCells = cellOf.slice(); }
      } else {
        swap(a, b);
      }
    }
    for (let i = 0; i < n; i++) cellOf[i] = bestCells[i];
  }

  // Se eliminan las filas y columnas que hayan quedado vacías.
  const usedCols = [...new Set([...cellOf].map(col))].sort((a, b) => a - b);
  const usedRows = [...new Set([...cellOf].map(row))].sort((a, b) => a - b);
  nodes.forEach((node, i) => {
    pos.set(node.id, {
      x: MARGIN_X + usedCols.indexOf(col(cellOf[i])) * CELL_W,
      y: MARGIN_Y + usedRows.indexOf(row(cellOf[i])) * CELL_H,
    });
  });
  return {
    pos,
    width: Math.max(1200, MARGIN_X * 2 + (usedCols.length - 1) * CELL_W),
    height: Math.max(700, MARGIN_Y * 2 + (usedRows.length - 1) * CELL_H),
  };
}
