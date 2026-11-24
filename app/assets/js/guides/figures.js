// Infografías de la guía de la aplicación: dibujos en SVG hechos con código (sin imágenes),
// que toman los colores del tema y los rótulos del idioma. Varias se mueven (con animaciones
// de CSS, que se detienen si el sistema pide reducir el movimiento).
import { svg, svgIcon } from '../dom.js';

const W = 720;
const txt = (x, y, text, cls = '', anchor = 'middle') => svg('text', { x, y, class: 'gf-text ' + cls, 'text-anchor': anchor }, text);
const box = (x, y, w, h, cls = '') => svg('rect', { x, y, width: w, height: h, rx: 6, class: 'gf-box ' + cls });
const line = (x1, y1, x2, y2, cls = '') => svg('line', { x1, y1, x2, y2, class: 'gf-line ' + cls });
const arrow = (x1, y1, x2, y2, cls = '') => svg('line', { x1, y1, x2, y2, class: 'gf-line gf-arrow ' + cls, 'marker-end': 'url(#gf-head)' });
const dot = (cx, cy, r, cls = '') => svg('circle', { cx, cy, r, class: 'gf-dot ' + cls });
const badge = (x, y, n) => svg('g', {}, svg('circle', { cx: x, cy: y, r: 11, class: 'gf-badge' }), txt(x, y + 4, String(n), 'gf-badge-text'));
/** Texto en varias líneas, centrado en x. */
const lines = (x, y, list, cls = '') => list.map((s, i) => txt(x, y + i * 15, s, cls));

function frame(height, ...children) {
  return svg('svg', { viewBox: `0 0 ${W} ${height}`, class: 'gfig', role: 'img' },
    svg('defs', {}, svg('marker', { id: 'gf-head', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' },
      svg('path', { d: 'M0 0 10 5 0 10z', class: 'gf-head' }))),
    ...children);
}

const FIGURES = {
  /** La pantalla: menú por grupos, cabecera con la ayuda y zona de trabajo. */
  screen(l) {
    const groups = l.groups || [];
    return frame(300,
      box(20, 20, 680, 260, 'gf-soft'),
      box(20, 20, 170, 260, 'gf-side'),
      txt(40, 46, 'Creabel', 'gf-strong gf-on-side', 'start'),
      ...groups.flatMap((g, i) => [txt(40, 82 + i * 38, g, 'gf-small gf-on-side gf-caps', 'start'), box(40, 90 + i * 38, 120 - (i % 3) * 18, 6, 'gf-bar')]),
      txt(214, 56, l.title, 'gf-title', 'start'),
      box(560, 38, 26, 26), txt(573, 56, '?', 'gf-strong'),
      box(594, 38, 86, 26, 'gf-accent'),
      box(214, 84, 466, 70), box(214, 166, 226, 94), box(454, 166, 226, 94),
      line(232, 106, 500, 106, 'gf-faint'), line(232, 122, 440, 122, 'gf-faint'), line(232, 138, 470, 138, 'gf-faint'),
      badge(190, 150, 1), badge(573, 30, 2), badge(680, 30, 3), badge(214, 84, 4));
  },

  /** El camino de una novela: cinco pasos unidos por una línea que avanza. */
  path(l) {
    const steps = l.steps || [];
    const w = 120;
    const gap = (W - 40 - steps.length * w) / (steps.length - 1);
    return frame(170,
      svg('line', { x1: 40, y1: 60, x2: W - 40, y2: 60, class: 'gf-line gf-flow' }),
      ...steps.flatMap(([title, a, b], i) => {
        const x = 20 + i * (w + gap);
        return [box(x, 36, w, 48, i === 2 ? 'gf-accent' : ''), txt(x + w / 2, 65, title, 'gf-strong' + (i === 2 ? ' gf-on-accent' : '')),
          ...lines(x + w / 2, 108, [a, b].filter(Boolean), 'gf-small gf-muted')];
      }));
  },

  /** Detección automática: una palabra del texto y la ficha que aparece sola. */
  detect(l) {
    return frame(190,
      box(20, 20, 330, 150),
      line(40, 52, 320, 52, 'gf-faint'), line(40, 74, 150, 74, 'gf-faint'),
      svg('rect', { x: 158, y: 62, width: 62, height: 22, rx: 3, class: 'gf-mark gf-pulse' }), txt(189, 78, l.word, 'gf-strong'),
      line(228, 74, 320, 74, 'gf-faint'), line(40, 96, 290, 96, 'gf-faint'), line(40, 118, 320, 118, 'gf-faint'), line(40, 140, 220, 140, 'gf-faint'),
      arrow(362, 95, 408, 95, 'gf-flow'),
      box(420, 20, 280, 150, 'gf-soft'),
      txt(440, 48, l.panel, 'gf-small gf-caps gf-muted', 'start'),
      svg('g', { class: 'gf-appear' },
        box(440, 62, 240, 46), svg('rect', { x: 440, y: 62, width: 4, height: 46, class: 'gf-accent-fill' }),
        svg('circle', { cx: 468, cy: 85, r: 13, class: 'gf-avatar' }),
        txt(492, 82, l.word, 'gf-strong', 'start'), txt(492, 98, l.sub, 'gf-small gf-muted', 'start'),
        txt(664, 89, l.auto, 'gf-small gf-accent-text gf-caps', 'end')),
      box(440, 118, 240, 34, 'gf-dashed'), txt(560, 140, l.hint, 'gf-small gf-muted'));
  },

  /** Lugares dentro de lugares: lo que pasa dentro cuenta para todos los que lo contienen. */
  nest(l) {
    const [a, b, c] = l.places || [];
    return frame(210,
      box(20, 20, 420, 170), txt(36, 44, a, 'gf-strong', 'start'),
      box(48, 58, 364, 116, 'gf-soft'), txt(64, 82, b, 'gf-strong', 'start'),
      box(76, 96, 308, 62), txt(92, 120, c, 'gf-strong', 'start'),
      svg('rect', { x: 250, y: 108, width: 118, height: 38, rx: 4, class: 'gf-accent' }), txt(309, 132, l.scene, 'gf-small gf-on-accent'),
      arrow(450, 127, 492, 127),
      ...[c, b, a].flatMap((name, i) => [txt(506, 86 + i * 34, name, 'gf-small', 'start'), txt(700, 86 + i * 34, l.count, 'gf-small gf-accent-text', 'end'), line(506, 96 + i * 34, 700, 96 + i * 34, 'gf-faint')]));
  },

  /** La línea temporal: eventos, escenas y las marcas de dónde empieza y termina el libro. */
  timeline(l) {
    const y = 96;
    const ev = (x, label, scene) => svg('g', {},
      scene ? svg('rect', { x: x - 9, y: y - 9, width: 18, height: 18, rx: 3, class: 'gf-accent' }) : dot(x, y, 7),
      txt(x, y + 34, label, 'gf-small' + (scene ? ' gf-strong' : ' gf-muted')));
    const flag = (x, label) => svg('g', {}, line(x, 30, x, y + 14, 'gf-accent-line'), txt(x, 22, label, 'gf-small gf-accent-text gf-caps'));
    return frame(170,
      line(30, y, W - 30, y),
      ev(80, l.event), ev(190, l.event), flag(270, l.start), ev(320, l.scene, true), ev(410, l.scene, true), ev(500, l.scene, true), flag(550, l.end), ev(630, l.event),
      txt(135, y - 14, l.gap, 'gf-small gf-muted gf-italic'));
  },

  /** El tablero: una tarjeta que cambia de capítulo. */
  board(l) {
    const col = (x, title, cards) => [box(x, 20, 200, 180, 'gf-soft'), txt(x + 14, 44, title, 'gf-strong', 'start'),
      ...cards.map((cy) => svg('g', {}, box(x + 12, cy, 176, 36), svg('rect', { x: x + 12, y: cy, width: 4, height: 36, class: 'gf-accent-fill' }), line(x + 28, cy + 14, x + 150, cy + 14, 'gf-faint'), line(x + 28, cy + 24, x + 110, cy + 24, 'gf-faint')))];
    return frame(220,
      ...col(30, l.chapters[0], [56, 100]), ...col(260, l.chapters[1], [56]), ...col(490, l.chapters[2], [56, 100]),
      svg('g', { class: 'gf-move' }, box(42, 144, 176, 36, 'gf-accent'), txt(130, 166, l.card, 'gf-small gf-on-accent')));
  },

  /** Varios dispositivos y el servidor de casa. */
  sync(l) {
    const device = (x, w, label) => svg('g', {}, box(x, 50, w, 80), line(x + 12, 72, x + w - 12, 72, 'gf-faint'), line(x + 12, 88, x + w - 30, 88, 'gf-faint'), line(x + 12, 104, x + w - 18, 104, 'gf-faint'), txt(x + w / 2, 152, label, 'gf-small gf-muted'));
    return frame(180,
      device(40, 170, l.left),
      box(310, 40, 100, 100, 'gf-accent'), svgIcon('server', 342, 62, 36), txt(360, 124, l.server, 'gf-small gf-on-accent'),
      device(510, 170, l.right),
      svg('line', { x1: 216, y1: 80, x2: 304, y2: 80, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }),
      svg('line', { x1: 304, y1: 104, x2: 216, y2: 104, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }),
      svg('line', { x1: 416, y1: 80, x2: 504, y2: 80, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }),
      svg('line', { x1: 504, y1: 104, x2: 416, y2: 104, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }));
  },

  /** Todo pasa por la escena: a un lado lo que hay en el mundo, al otro lo que se apunta sobre él. */
  web(l) {
    const left = l.left || [];
    const right = l.right || [];
    const node = (x, y, label, anchor) => [box(x, y, 170, 36), txt(x + 85, y + 23, label, 'gf-small gf-strong'),
      svg('line', { x1: anchor === 'l' ? x + 170 : x, y1: y + 18, x2: anchor === 'l' ? 296 : 424, y2: 165, class: 'gf-line gf-flow' })];
    return frame(330,
      ...left.flatMap((label, i) => node(20, 20 + i * 62, label, 'l')),
      ...right.flatMap((label, i) => node(530, 20 + i * 62, label, 'r')),
      box(296, 132, 128, 66, 'gf-accent'), txt(360, 162, l.center, 'gf-title gf-on-accent'), txt(360, 182, l.centerSub, 'gf-small gf-on-accent'));
  },

  /** Lo que se rellena en la ficha de una escena y qué páginas lo aprovechan. */
  feeds(l) {
    const fields = l.fields || [];
    const out = l.out || [];
    return frame(250,
      box(20, 20, 220, 210), txt(36, 46, l.sheet, 'gf-strong', 'start'),
      ...fields.flatMap((f, i) => [box(36, 60 + i * 40, 188, 30, 'gf-soft'), txt(48, 80 + i * 40, f, 'gf-small', 'start')]),
      ...out.flatMap(([title, sub], i) => {
        const y = 20 + i * 54;
        return [svg('line', { x1: 240, y1: 125, x2: 432, y2: y + 23, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }),
          box(440, y, 260, 46), svg('rect', { x: 440, y, width: 4, height: 46, class: 'gf-accent-fill' }),
          txt(456, y + 20, title, 'gf-strong', 'start'), txt(456, y + 36, sub, 'gf-small gf-muted', 'start')];
      }));
  },

  /** Evento y escena: si ocurre en ella toma su fecha; si solo se cuenta, cada uno conserva la suya. */
  eventlink(l) {
    const card = (x, y, title, sub, scene) => [box(x, y, 250, 62), scene ? svg('rect', { x, y, width: 4, height: 62, class: 'gf-accent-fill' }) : dot(x + 22, y + 31, 7),
      txt(x + (scene ? 18 : 40), y + 27, title, 'gf-strong', 'start'), txt(x + (scene ? 18 : 40), y + 45, sub, 'gf-small gf-muted', 'start')];
    return frame(250,
      txt(20, 22, l.event, 'gf-small gf-caps gf-muted', 'start'), txt(700, 22, l.scene, 'gf-small gf-caps gf-muted', 'end'),
      ...card(20, 34, l.evA, l.evAsub), ...card(450, 34, l.scA, l.scAsub, true),
      svg('line', { x1: 444, y1: 65, x2: 278, y2: 65, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }),
      txt(360, 54, l.in, 'gf-small gf-accent-text'), txt(360, 86, l.inNote, 'gf-small gf-muted'),
      ...card(20, 156, l.evB, l.evBsub), ...card(450, 156, l.scB, l.scBsub, true),
      line(276, 187, 444, 187, 'gf-accent-line'),
      txt(360, 176, l.told, 'gf-small gf-accent-text'), txt(360, 208, l.toldNote, 'gf-small gf-muted'));
  },

  /** Una comprobación de continuidad: el mismo personaje en dos sitios sin tiempo para llegar. */
  checks(l) {
    const scene = (x, [title, when, place]) => [box(x, 24, 240, 96), svg('rect', { x, y: 24, width: 4, height: 96, class: 'gf-accent-fill' }),
      txt(x + 18, 48, title, 'gf-strong', 'start'), txt(x + 18, 68, when, 'gf-small gf-muted', 'start'), txt(x + 18, 86, place, 'gf-small', 'start'),
      svg('circle', { cx: x + 26, cy: 104, r: 8, class: 'gf-avatar' }), txt(x + 42, 108, l.who, 'gf-small gf-accent-text', 'start')];
    return frame(230,
      ...scene(20, l.a || []), ...scene(460, l.b || []),
      line(260, 72, 330, 72), line(390, 72, 460, 72),
      svg('rect', { x: 330, y: 52, width: 60, height: 40, rx: 4, class: 'gf-mark gf-pulse' }), txt(360, 79, '!', 'gf-title'),
      txt(360, 112, l.gap, 'gf-small gf-muted'),
      arrow(360, 124, 360, 152),
      box(90, 158, 540, 50, 'gf-soft'), svg('rect', { x: 90, y: 158, width: 4, height: 50, class: 'gf-warn' }),
      txt(108, 179, l.level, 'gf-small gf-caps gf-muted', 'start'), txt(108, 197, l.result, 'gf-small', 'start'));
  },

  /** Quién sabe qué: cada uno se entera en una escena distinta; hasta entonces, no lo sabe. */
  secret(l) {
    const rows = l.rows || [];
    const at = [0.14, 0.52, 0.82];
    const x0 = 170;
    const x1 = 700;
    return frame(60 + rows.length * 46 + 20,
      txt(20, 24, l.title, 'gf-strong', 'start'), txt(700, 24, l.axis, 'gf-small gf-muted', 'end'),
      ...rows.flatMap(([who, where], i) => {
        const y = 62 + i * 46;
        const x = x0 + (x1 - x0) * at[i % at.length];
        return [txt(20, y + 4, who, 'gf-small gf-strong', 'start'),
          line(x0, y, x, y, 'gf-faint'), line(x, y, x1, y, 'gf-solid'),
          dot(x, y, 7, 'gf-dot-accent'), txt(x, y + 22, where, 'gf-small gf-muted')];
      }),
      txt(x0, 44, l.before, 'gf-small gf-muted gf-italic', 'start'), txt(x1, 44, l.after, 'gf-small gf-accent-text', 'end'));
  },

  /** Seguimiento: un objeto que cambia de manos escena a escena. */
  track(l) {
    const steps = l.steps || [];
    const w = 155;
    return frame(170,
      txt(20, 24, l.object, 'gf-strong', 'start'),
      ...steps.flatMap(([scene, state, gone], i) => {
        const x = 20 + i * 175;
        return [box(x, 40, w, 76, gone ? 'gf-dashed' : ''), txt(x + 14, 64, scene, 'gf-small gf-caps gf-muted', 'start'),
          ...lines(x + 14, 86, String(state).split('|'), 'gf-small').map((n) => { n.setAttribute('text-anchor', 'start'); return n; }),
          i < steps.length - 1 ? svg('line', { x1: x + w + 2, y1: 78, x2: x + 173, y2: 78, class: 'gf-line gf-flow', 'marker-end': 'url(#gf-head)' }) : null];
      }).filter(Boolean),
      txt(360, 148, l.caption, 'gf-small gf-muted'));
  },

  /** El gráfico narrativo: una fila por elemento y una columna por escena. */
  matrix(l) {
    const rows = l.rows || [];
    const patterns = ['1110111011101101', '0011100000001110', '1000011100110001'];
    const cell = 33;
    return frame(44 + rows.length * 34 + 30,
      txt(160, 24, l.cols, 'gf-small gf-muted', 'start'),
      ...rows.flatMap((name, i) => {
        const y = 38 + i * 34;
        return [txt(20, y + 16, name, 'gf-small gf-strong', 'start'),
          ...[...patterns[i % patterns.length]].map((on, c) => svg('rect', { x: 160 + c * (cell + 1), y, width: cell, height: 24, rx: 2, class: 'gf-cell' + (on === '1' ? ' on' : '') }))];
      }),
      // La ausencia larga de la segunda fila (columnas 5 a 11), señalada.
      svg('rect', { x: 160 + 5 * (cell + 1) - 2, y: 38 + 34 - 3, width: 7 * (cell + 1) + 2, height: 30, rx: 3, class: 'gf-mark gf-pulse' }),
      txt(160 + 8.5 * (cell + 1), 38 + rows.length * 34 + 16, l.gap, 'gf-small gf-accent-text'));
  },

  /** Del manuscrito a los archivos. */
  output(l) {
    const formats = l.formats || [];
    return frame(190,
      box(30, 30, 150, 130, 'gf-accent'), svgIcon('book', 87, 58, 36), txt(105, 122, l.book, 'gf-strong gf-on-accent'),
      ...formats.flatMap(([name, use], i) => {
        const y = 30 + i * 34;
        return [arrow(190, 95, 290, y + 13), box(300, y, 110, 26), txt(355, y + 18, name, 'gf-strong'), txt(424, y + 18, use, 'gf-small gf-muted', 'start')];
      }));
  },
};

/** Devuelve el dibujo `name` con sus rótulos, o null si no existe. */
export function figure(name, labels = {}) {
  return FIGURES[name] ? FIGURES[name](labels) : null;
}
