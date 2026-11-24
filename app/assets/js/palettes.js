// Paletas de color. Cada paleta tiene dos juegos, claro y oscuro, definidos con seis colores
// base; el resto (bordes, texto atenuado, variantes del acento, barra lateral) se deriva de
// ellos. «Tinta y pizarra» es la paleta de la hoja de estilos: no necesita derivarse.

export const PALETTE_KEYS = ['bg', 'surface', 'paper', 'text', 'accent', 'side'];

export const PALETTES = {
  slate: {
    light: { bg: '#e6e9eb', surface: '#f3f5f6', paper: '#f8f8f6', text: '#1f2a30', accent: '#2d5d7b', side: '#22303a' },
    dark: { bg: '#15191c', surface: '#1c2125', paper: '#1f2428', text: '#d5dade', accent: '#7fb0cf', side: '#0f1316' },
  },
  // La primera paleta que tuvo Creabel: papel cálido y acento terracota, con la barra clara.
  classic: {
    light: { bg: '#f6f2ec', surface: '#fffdf9', paper: '#fffdf9', text: '#2b2622', accent: '#b5532b', side: '#fffdf9' },
    dark: { bg: '#1b1917', surface: '#242220', paper: '#242220', text: '#ebe5dc', accent: '#e08a5b', side: '#242220' },
  },
  forest: {
    light: { bg: '#e6eae2', surface: '#f2f5ee', paper: '#f8f8f2', text: '#222b24', accent: '#3d6a4b', side: '#25332a' },
    dark: { bg: '#131714', surface: '#1a201c', paper: '#1d231f', text: '#d2dad3', accent: '#84b792', side: '#0d110e' },
  },
  plum: {
    light: { bg: '#eae7ee', surface: '#f5f3f8', paper: '#faf9f7', text: '#29252f', accent: '#6a4985', side: '#2d2737' },
    dark: { bg: '#17151b', surface: '#1f1c24', paper: '#221f27', text: '#d9d5df', accent: '#b699d5', side: '#100e14' },
  },
};

export const PALETTE_IDS = Object.keys(PALETTES);
export const DEFAULT_PALETTE = 'slate';

// Variables que controla una paleta (las demás siguen saliendo de la hoja de estilos).
export const PALETTE_VARS = [
  '--bg', '--surface', '--surface-2', '--paper', '--border', '--border-strong', '--text', '--muted',
  '--accent', '--accent-hover', '--accent-soft', '--on-accent',
  '--side-bg', '--side-text', '--side-strong', '--side-muted', '--side-hover', '--side-active', '--side-border', '--side-accent',
];

// ---------- Cálculo con colores ----------

const HEX = /^#[0-9a-f]{6}$/i;
export const isColor = (c) => typeof c === 'string' && HEX.test(c);
const rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const hex = (v) => '#' + v.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
/** Mezcla de a hacia b (t de 0 a 1). */
const mix = (a, b, t) => {
  const ca = rgb(a);
  const cb = rgb(b);
  return hex(ca.map((v, i) => v + (cb[i] - v) * t));
};
/** Luminancia relativa (0 negro, 1 blanco). */
export function luminance(c) {
  const [r, g, b] = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** Contraste entre dos colores (de 1 a 21); para texto cómodo conviene 4,5 o más. */
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Todas las variables de una paleta a partir de sus seis colores base. */
export function deriveVars(base) {
  // Se trata como oscuro el juego cuyo fondo es más oscuro que su texto, esté en el lado que esté.
  const dark = luminance(base.bg) < luminance(base.text);
  const sideDark = luminance(base.side) < 0.35;
  const ink = sideDark ? '#ffffff' : '#000000';
  const alpha = (a) => `rgba(${sideDark ? '255, 255, 255' : '0, 0, 0'}, ${a})`;
  return {
    '--bg': base.bg,
    '--surface': base.surface,
    '--paper': base.paper,
    '--text': base.text,
    '--accent': base.accent,
    '--surface-2': mix(base.surface, base.text, dark ? 0.055 : 0.1),
    '--border': mix(base.surface, base.text, dark ? 0.1 : 0.18),
    '--border-strong': mix(base.surface, base.text, dark ? 0.21 : 0.31),
    '--muted': mix(base.text, base.surface, dark ? 0.4 : 0.3),
    '--accent-hover': mix(base.accent, dark ? '#ffffff' : '#000000', 0.2),
    '--accent-soft': mix(base.surface, base.accent, dark ? 0.14 : 0.16),
    // Sobre el acento (botón principal) va el color que mejor se lea: casi negro o blanco.
    '--on-accent': contrast(base.accent, '#10151a') > contrast(base.accent, '#ffffff') ? '#10151a' : '#ffffff',
    '--side-bg': base.side,
    '--side-text': mix(base.side, ink, sideDark ? 0.78 : 0.74),
    '--side-strong': mix(base.side, ink, sideDark ? 0.94 : 0.9),
    '--side-muted': mix(base.side, ink, sideDark ? 0.47 : 0.5),
    '--side-hover': alpha(sideDark ? 0.06 : 0.05),
    '--side-active': alpha(sideDark ? 0.11 : 0.09),
    '--side-border': alpha(sideDark ? 0.1 : 0.13),
    // En una barra oscura el acento se aclara si hace falta para que se lea.
    '--side-accent': contrast(base.accent, base.side) >= 4.5 ? base.accent : mix(base.accent, ink, sideDark ? 0.45 : 0.35),
  };
}

// ---------- Paleta personalizada ----------
// Se guarda como texto JSON (las preferencias del servidor solo admiten valores simples).

const cleanSet = (set, fallback) => {
  const out = {};
  for (const key of PALETTE_KEYS) out[key] = set && isColor(set[key]) ? set[key].toLowerCase() : fallback[key];
  return out;
};

/** Lee la paleta personalizada; lo que falte o no sea válido se toma de `from` (una paleta de serie). */
export function parseCustom(value, from = DEFAULT_PALETTE) {
  let data = null;
  try { data = typeof value === 'string' && value ? JSON.parse(value) : value; } catch (e) { data = null; }
  const base = PALETTES[from] || PALETTES[DEFAULT_PALETTE];
  return { light: cleanSet(data && data.light, base.light), dark: cleanSet(data && data.dark, base.dark) };
}

export const serializeCustom = (custom) => JSON.stringify({ light: cleanSet(custom.light, PALETTES[DEFAULT_PALETTE].light), dark: cleanSet(custom.dark, PALETTES[DEFAULT_PALETTE].dark) });

/** Colores base de la paleta elegida para un tema ('light' | 'dark'). */
export function paletteBase(id, customValue, theme) {
  if (id === 'custom') return parseCustom(customValue)[theme];
  return (PALETTES[id] || PALETTES[DEFAULT_PALETTE])[theme];
}

/** Aplica la paleta al documento. La de serie no necesita nada: se retiran los valores anteriores. */
export function applyPalette(id, customValue, theme) {
  const style = document.documentElement.style;
  const builtin = id !== 'custom' && (!PALETTES[id] || id === DEFAULT_PALETTE);
  const vars = builtin ? null : deriveVars(paletteBase(id, customValue, theme));
  for (const name of PALETTE_VARS) {
    if (vars) style.setProperty(name, vars[name]);
    else style.removeProperty(name);
  }
}
