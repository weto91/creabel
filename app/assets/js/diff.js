// Comparación de dos textos: primero por párrafos y, dentro de los párrafos que han
// cambiado, palabra por palabra. Sin dependencias.

/** Subsecuencia común más larga entre dos listas. Devuelve pares [i, j] de elementos iguales. */
function lcsPairs(a, b, same = (x, y) => x === y) {
  const n = a.length;
  const m = b.length;
  // Prefijo y sufijo comunes fuera de la tabla: en una revisión casi todo coincide.
  let start = 0;
  while (start < n && start < m && same(a[start], b[start])) start++;
  let endA = n;
  let endB = m;
  while (endA > start && endB > start && same(a[endA - 1], b[endB - 1])) { endA--; endB--; }

  const pairs = [];
  for (let i = 0; i < start; i++) pairs.push([i, i]);
  const rows = endA - start;
  const cols = endB - start;
  if (rows && cols) {
    if (rows * cols > 6000000) {
      // Demasiado grande para la tabla: se da el tramo central por sustituido entero.
    } else {
      const table = new Uint32Array((rows + 1) * (cols + 1));
      const w = cols + 1;
      for (let i = rows - 1; i >= 0; i--) {
        for (let j = cols - 1; j >= 0; j--) {
          table[i * w + j] = same(a[start + i], b[start + j])
            ? table[(i + 1) * w + j + 1] + 1
            : Math.max(table[(i + 1) * w + j], table[i * w + j + 1]);
        }
      }
      let i = 0;
      let j = 0;
      while (i < rows && j < cols) {
        if (same(a[start + i], b[start + j])) { pairs.push([start + i, start + j]); i++; j++; }
        else if (table[(i + 1) * w + j] >= table[i * w + j + 1]) i++;
        else j++;
      }
    }
  }
  for (let k = 0; k < n - endA; k++) pairs.push([endA + k, endB + k]);
  return pairs;
}

/** Palabras, espacios y signos como piezas separadas, para que «casa,» y «casa» compartan la palabra. */
const tokenize = (text) => text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|\s+|[^\s\p{L}\p{N}]/gu) || [];
const isWord = (token) => /[\p{L}\p{N}]/u.test(token);

/** Diferencia palabra por palabra: [{ t: 'eq' | 'del' | 'ins', text }] */
export function diffWords(a, b) {
  const ta = tokenize(a);
  const tb = tokenize(b);
  const pairs = lcsPairs(ta, tb);
  const ops = [];
  const push = (t, text) => {
    if (!text) return;
    const last = ops[ops.length - 1];
    if (last && last.t === t) last.text += text;
    else ops.push({ t, text });
  };
  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...pairs, [ta.length, tb.length]]) {
    push('del', ta.slice(i, pi).join(''));
    push('ins', tb.slice(j, pj).join(''));
    if (pi < ta.length) push('eq', ta[pi]);
    i = pi + 1;
    j = pj + 1;
  }
  return ops;
}

const wordsIn = (text) => tokenize(text).filter(isWord);

/** Parecido entre dos párrafos (0 a 1), por palabras compartidas. */
function similarity(a, b) {
  const wa = wordsIn(a);
  const wb = wordsIn(b);
  if (!wa.length || !wb.length) return 0;
  const set = new Set(wa);
  let shared = 0;
  for (const w of wb) if (set.has(w)) shared++;
  return (2 * shared) / (wa.length + wb.length);
}

/**
 * Compara dos textos (párrafos separados por saltos de línea).
 * Devuelve { rows, added, removed, changed } donde rows es una lista de
 * { type: 'eq' | 'mod' | 'del' | 'ins', a, b, ops } y los recuentos son de palabras
 * añadidas y quitadas y de párrafos con cambios.
 */
export function diffTexts(textA, textB) {
  const pa = textA.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const pb = textB.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const pairs = lcsPairs(pa, pb);
  const rows = [];
  let added = 0;
  let removed = 0;
  let changed = 0;

  const gap = (dels, inss) => {
    // Dentro de un tramo cambiado se emparejan en orden los párrafos que se parecen;
    // el resto son párrafos quitados o añadidos enteros.
    let j = 0;
    for (const d of dels) {
      let match = -1;
      for (let k = j; k < inss.length; k++) {
        if (similarity(d, inss[k]) >= 0.4) { match = k; break; }
      }
      if (match === -1) {
        rows.push({ type: 'del', a: d, b: '' });
        removed += wordsIn(d).length;
        changed++;
        continue;
      }
      for (; j < match; j++) {
        rows.push({ type: 'ins', a: '', b: inss[j] });
        added += wordsIn(inss[j]).length;
        changed++;
      }
      const ops = diffWords(d, inss[match]);
      for (const op of ops) {
        if (op.t === 'del') removed += wordsIn(op.text).length;
        else if (op.t === 'ins') added += wordsIn(op.text).length;
      }
      rows.push({ type: 'mod', a: d, b: inss[match], ops });
      changed++;
      j = match + 1;
    }
    for (; j < inss.length; j++) {
      rows.push({ type: 'ins', a: '', b: inss[j] });
      added += wordsIn(inss[j]).length;
      changed++;
    }
  };

  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...pairs, [pa.length, pb.length]]) {
    gap(pa.slice(i, pi), pb.slice(j, pj));
    if (pi < pa.length) rows.push({ type: 'eq', a: pa[pi], b: pb[pj] });
    i = pi + 1;
    j = pj + 1;
  }
  return { rows, added, removed, changed };
}
