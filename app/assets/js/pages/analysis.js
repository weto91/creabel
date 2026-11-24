// Análisis de la novela: longitud de capítulos, distribución de personajes, lugares,
// objetos, tramas, grupos y punto de vista por capítulo, y apariciones de un personaje.
import { h, clear } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { formatNumber, formatDateTime } from '../text.js';
import { pageHeader, emptyState, tabs, btn, statusDot, pickDialog, tip } from '../ui.js';
import { analyzeStyle, totalOf, paragraphsOf } from '../style.js';
import { pickItem, placeTags } from '../components.js';
import { bookStats } from '../stats.js';
import { drawWriting, drawBook } from './stats.js';
import {
  chaptersOrdered, chapterNumbers, chapterLabel, chapterKind, chapterWords, scenesOf, sceneHas,
  entityLabel, entityHref, displayName, locationLabel, povLabel, POV_WITH_CHARACTER, sceneLocations, locationDetail, sceneDuration,
} from '../model.js';

// Pestañas de la sección. «Mi escritura» y «El libro» eran la antigua sección «Estadísticas»
// (pages/stats.js); «Distribución» reúne los cuadros por capítulo de cada tipo de elemento.
const TABS = ['writing', 'book', 'style', 'chart', 'distribution', 'appearances'];
const TAB_LABEL = { writing: 'stats.tabWriting', book: 'stats.tabBook', style: 'style.tab', chart: 'analysis.chart', distribution: 'analysis.distribution', appearances: 'analysis.appearances' };
const DISTRIBUTIONS = ['characters', 'locations', 'objects', 'strands', 'groups', 'pov'];
const CHART_KEY = 'creabel.chart';
const CHART_TYPES = ['character', 'strand', 'location', 'object', 'group', 'custom'];
const CHART_ALL_KEY = 'creabel.chartAll'; // proyectos en los que el gráfico muestra todo
const MATRIX_TYPES = { characters: 'character', locations: 'location', objects: 'object', strands: 'strand', groups: 'group' };

export async function analysisPage({ el, pid, query }) {
  const chapters = chaptersOrdered();
  const numbers = chapterNumbers();
  let tab = TABS.includes(query.tab) ? query.tab : 'writing';
  let distribution = 'characters';
  let book = null; // estadísticas del libro: se calculan una vez por visita
  let styleData = null; // revisión de estilo por capítulo: también una vez por visita
  let characterId = null;
  const tabsEl = h('div');
  const body = h('div.analysis-body');

  const shortLabel = (c) => {
    const kind = chapterKind(c);
    return kind === 'chapter' ? String(numbers.get(c.id)) : t(`chapters.${kind}Short`);
  };

  const matrix = (rows) => {
    if (!rows.length) {
      body.append(h('p.muted.empty-line', t('analysis.noData')));
      return;
    }
    const table = h('table.matrix',
      h('thead', h('tr', h('th'), chapters.map((c) => h('th', { title: chapterLabel(c, numbers), scope: 'col' }, shortLabel(c))), h('th', { scope: 'col' }, t('analysis.total')))),
      h('tbody', rows.map((r) => {
        const counts = chapters.map((c) => scenesOf(c.id).filter(r.test).length);
        const sum = counts.reduce((a, b) => a + b, 0);
        return h('tr',
          // El nombre, y en gris su detalle (dónde está un lugar); si no cabe se corta y el
          // texto entero sale al pasar el ratón, para que las columnas de capítulos queden a la vista.
          h('th', { scope: 'row', title: r.title || r.label },
            r.href ? h('a', { href: r.href }, r.label) : r.label,
            r.sub ? h('span.matrix-sub', r.sub) : null),
          counts.map((n, i) => h('td', { class: n ? 'on' : '', title: n ? `${chapterLabel(chapters[i], numbers)}: ${tn('count.scenes', n)}` : null, style: n ? { '--level': String(Math.min(1, 0.35 + n * 0.2)) } : null }, n ? String(n) : '')),
          h('td.sum', String(sum)));
      })));
    body.append(h('p.muted', t('analysis.matrixHint')), h('div.matrix-wrap', table));
  };

  const drawPov = () => {
    const keys = new Map();
    for (const c of chapters) {
      for (const s of scenesOf(c.id)) {
        const pov = s.data.pov;
        if (!pov || !pov.type) continue;
        const who = POV_WITH_CHARACTER.has(pov.type) && store.get(pov.characterId) ? pov.characterId : '';
        const key = pov.type + '|' + who;
        if (!keys.has(key)) keys.set(key, { label: povLabel(s), test: (x) => x.data.pov && x.data.pov.type === pov.type && ((POV_WITH_CHARACTER.has(pov.type) && store.get(x.data.pov.characterId) ? x.data.pov.characterId : '') === who) });
      }
    }
    matrix([...keys.values()]);
  };

  const drawAppearances = () => {
    const characters = store.list('character');
    if (!characters.length) {
      body.append(h('p.muted.empty-line', t('character.none')));
      return;
    }
    if (!characterId || !store.get(characterId)) characterId = characters[0].id;
    const sel = h('select.input.inline-select', { 'aria-label': t('character.singular') }, characters.map((c) => h('option', { value: c.id }, displayName(c))));
    sel.value = characterId;
    sel.addEventListener('change', () => { characterId = sel.value; draw(); });
    const who = store.get(characterId);
    const rows = [];
    for (const c of chapters) for (const s of scenesOf(c.id)) if (sceneHas(s, who)) rows.push({ c, s });
    body.append(h('div.filter-row', h('span.form-label', t('character.singular')), sel, h('span.muted', tn('count.scenes', rows.length))));
    if (!rows.length) {
      body.append(h('p.muted.empty-line', t('appears.empty')));
      return;
    }
    // Los lugares van como cuadros de color (el nombre sale al pasar el ratón): así el resto de
    // columnas tiene sitio para caber en una sola línea.
    body.append(h('div.matrix-wrap', h('table.data-table.appear-table',
      h('thead', h('tr', [t('chapters.singular'), t('scenes.singular'), t('location.plural'), t('tags.time'), t('tags.durationCol'), t('pov.label')].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', rows.map(({ c, s }) => h('tr',
        h('td', chapterLabel(c, numbers)),
        h('td', h('a', { href: entityHref(s) }, statusDot(s.status), ' ', displayName(s))),
        h('td.appear-places', placeTags(s) || '—'),
        h('td', s.data.time ? formatDateTime(s.data.time) : '—'),
        h('td', sceneDuration(s) || '—'),
        h('td', povLabel(s) || '—')))))));
  };

  // ---------- Gráfico narrativo ----------
  // Una fila por elemento y una casilla por escena, en orden de lectura: se ve de un vistazo
  // quién desaparece demasiado tiempo y qué tramas no llegan a cruzarse.

  // El gráfico sigue una selección propia (los elementos que se elijan, sin límite) o todo
  // lo que hay en el proyecto; «todo» incluye también lo que se cree después.
  const readFlags = () => {
    try { return JSON.parse(localStorage.getItem(CHART_ALL_KEY) || '{}') || {}; } catch (err) { return {}; }
  };
  let chartAll = !!readFlags()[pid];
  const setChartAll = (value) => {
    chartAll = value;
    try {
      const flags = readFlags();
      if (value) flags[pid] = true;
      else delete flags[pid];
      localStorage.setItem(CHART_ALL_KEY, JSON.stringify(flags));
    } catch (err) { /* sin almacenamiento local, vale solo para esta visita */ }
  };
  const chartEverything = () => CHART_TYPES.flatMap((type) => store.list(type));
  const chartSelection = () => {
    let saved = [];
    try { saved = (JSON.parse(localStorage.getItem(CHART_KEY) || '{}') || {})[pid] || []; } catch (err) { saved = []; }
    const valid = saved.map((id) => store.get(id)).filter((e) => e && CHART_TYPES.includes(e.type));
    if (valid.length) return valid;
    // Por defecto: los personajes principales y las tramas.
    return [
      ...store.list('character').filter((c) => c.data.kind !== 'secondary').slice(0, 6),
      ...store.list('strand').slice(0, 6),
    ];
  };
  const saveChartSelection = (ids) => {
    try {
      const all = JSON.parse(localStorage.getItem(CHART_KEY) || '{}') || {};
      all[pid] = ids;
      localStorage.setItem(CHART_KEY, JSON.stringify(all));
    } catch (err) { /* sin almacenamiento local, la selección vale solo para esta visita */ }
  };

  const drawChart = () => {
    // Las filas van agrupadas por tipo, en el orden de siempre: personajes, tramas, lugares…
    const rows = (chartAll ? chartEverything() : chartSelection())
      .slice().sort((a, b) => CHART_TYPES.indexOf(a.type) - CHART_TYPES.indexOf(b.type));
    const cells = chapters.flatMap((c) => scenesOf(c.id).map((s, i) => ({ c, s, first: i === 0 })));
    const choose = async () => {
      const items = CHART_TYPES.flatMap((type) => store.list(type).map((e) => pickItem(e, { group: t(type + '.plural') })));
      const picked = await pickDialog({ title: t('analysis.chartChoose'), items, selected: rows.map((e) => e.id), emptyText: t('tags.noneAvailable') });
      if (!picked) return;
      saveChartSelection(picked);
      setChartAll(false);
      draw();
    };
    const mode = (all, label) => h('button', {
      type: 'button', class: 'seg-opt' + (chartAll === all ? ' active' : ''), 'aria-pressed': String(chartAll === all),
      onclick: () => { setChartAll(all); draw(); },
    }, label);
    body.append(h('div.filter-row',
      h('span.seg', { role: 'group', 'aria-label': t('analysis.chartShow') }, h('span.seg-label', t('analysis.chartShow')),
        mode(false, t('analysis.chartMine')), mode(true, t('analysis.chartAll'))),
      btn(`${t('analysis.chartChoose')} (${rows.length})`, { icon: 'edit', small: true, onClick: choose })),
    h('p.muted.nchart-hint', t('analysis.chartHint')));
    if (!rows.length || !cells.length) {
      body.append(h('p.muted.empty-line', t(cells.length ? 'analysis.chartEmpty' : 'analysis.noData')));
      return;
    }
    const chart = h('div.nchart',
      h('div.nchart-row.nchart-head', h('span.nchart-label'),
        h('span.nchart-track', chapters.filter((c) => scenesOf(c.id).length).map((c) => h('span.nchart-chapter', { title: chapterLabel(c, numbers), style: { flexGrow: scenesOf(c.id).length } }, shortLabel(c)))),
        h('span.nchart-info')));
    // Con más de un tipo, cada grupo lleva su rótulo.
    const mixed = new Set(rows.map((e) => e.type)).size > 1;
    let lastType = null;
    for (const e of rows) {
      if (mixed && e.type !== lastType) {
        lastType = e.type;
        chart.append(h('div', { class: 'nchart-group k-' + e.type }, `${t(e.type + '.plural')} (${rows.filter((x) => x.type === e.type).length})`));
      }
      const on = cells.map((cell) => sceneHas(cell.s, e));
      const firstOn = on.indexOf(true);
      const lastOn = on.lastIndexOf(true);
      // Ausencia más larga entre dos apariciones.
      let gap = 0;
      let run = 0;
      for (let i = firstOn; i <= lastOn && firstOn >= 0; i++) {
        if (on[i]) { gap = Math.max(gap, run); run = 0; } else run++;
      }
      const total = on.filter(Boolean).length;
      chart.append(h('div', { class: 'nchart-row k-' + e.type },
        h('a.nchart-label', { href: entityHref(e), title: entityLabel(e) }, displayName(e)),
        h('span.nchart-track', cells.map((cell, i) => h('a', {
          class: 'nchart-cell' + (on[i] ? ' on' : i > firstOn && i < lastOn ? ' between' : '') + (cell.first ? ' first' : ''),
          href: entityHref(cell.s), title: `${chapterLabel(cell.c, numbers)} · ${displayName(cell.s)}`,
        }))),
        h('span.nchart-info', total ? `${tn('count.scenes', total)}${gap ? ' · ' + tn('analysis.chartGap', gap) : ''}` : t('analysis.chartNever'))));
    }
    body.append(h('div.matrix-wrap.nchart-wrap', chart));
  };

  // ---------- Estilo ----------
  // La revisión de estilo de cada escena (style.js), sumada por capítulo: dónde hay más
  // adverbios, repeticiones, muletillas y frases largas. El detalle, palabra por palabra, se
  // ve en el editor de cada escena.

  const computeStyle = (texts) => {
    const rows = [];
    const merged = { repeats: new Map(), adverbs: new Map(), fillers: new Map() };
    for (const c of chapters) {
      const paragraphs = [];
      for (const s of scenesOf(c.id)) {
        const doc = new DOMParser().parseFromString(texts.get(s.id) || '', 'text/html');
        paragraphs.push(...paragraphsOf(doc.body).map((b) => b.textContent));
      }
      const found = analyzeStyle(paragraphs, store.project.language);
      if (!found.words) continue;
      for (const key of Object.keys(merged)) for (const item of found[key]) merged[key].set(item.label, (merged[key].get(item.label) || 0) + item.count);
      rows.push({ c, found });
    }
    const top = (map) => [...map].sort((a, b) => b[1] - a[1]).slice(0, 15);
    // La terminación de los adverbios en el idioma de la novela (null: allí no se cuentan).
    const adverbSuffix = analyzeStyle([], store.project.language).adverbSuffix;
    return { rows, repeats: top(merged.repeats), adverbs: top(merged.adverbs), fillers: top(merged.fillers), adverbSuffix };
  };

  const drawStyle = () => {
    if (!styleData.rows.length) {
      body.append(h('p.muted.empty-line', t('analysis.noData')));
      return;
    }
    const per = (n, words) => formatNumber(Math.round((n / words) * 1000));
    const suffix = styleData.adverbSuffix;
    const head = (key) => h('th', { scope: 'col' }, t('style.col.' + key, { suffix }), key === 'chapter' ? null : tip(t(`style.col.${key}.tip`, { suffix })));
    const columns = ['chapter', 'words', 'sentence', 'adverbs', 'repeats', 'fillers', 'long'].filter((k) => k !== 'adverbs' || suffix);
    // La media del libro marca qué capítulos se salen: se resaltan los que la superan en la mitad.
    const sum = (fn) => styleData.rows.reduce((a, r) => a + fn(r.found), 0);
    const words = sum((f) => f.words);
    const mean = { adverbs: sum((f) => totalOf(f.adverbs)) / words, repeats: sum((f) => totalOf(f.repeats)) / words, fillers: sum((f) => totalOf(f.fillers)) / words };
    const cell = (key, found) => {
      const rate = totalOf(found[key]) / found.words;
      return h('td', { class: rate > mean[key] * 1.5 && totalOf(found[key]) > 3 ? 'is-high' : '' }, per(totalOf(found[key]), found.words));
    };
    const list = (key, items) => h('section.panel',
      h('h3', t('style.top.' + key)),
      items.length ? h('ol.style-top', items.map(([label, n]) => h('li', h('span', label), h('span.muted', `×${formatNumber(n)}`)))) : h('p.muted', t('style.topNone')));
    body.append(
      h('p.muted.tree-hint', t('style.bookHint')),
      h('div.matrix-wrap', h('table.data-table.numeric',
        h('thead', h('tr', columns.map(head))),
        h('tbody', styleData.rows.map(({ c, found }) => h('tr',
          h('td', h('a', { href: entityHref(c) }, chapterLabel(c, numbers))),
          h('td', formatNumber(found.words)),
          h('td', formatNumber(Math.round(found.words / Math.max(1, found.sentences)))),
          suffix ? cell('adverbs', found) : null, cell('repeats', found), cell('fillers', found),
          h('td', formatNumber(found.long.length))))))),
      h('div.style-tops', list('repeats', styleData.repeats), list('fillers', styleData.fillers), suffix ? list('adverbs', styleData.adverbs) : null));
  };

  const drawDistribution = () => {
    const opt = (key) => h('button', { type: 'button', class: 'seg-opt' + (distribution === key ? ' active' : ''), 'aria-pressed': String(distribution === key), onclick: () => { distribution = key; draw(); } }, t('analysis.' + key));
    body.append(h('div.filter-row', h('span.seg', { role: 'group', 'aria-label': t('analysis.distribution') }, DISTRIBUTIONS.map(opt))));
    if (distribution === 'pov') drawPov();
    else {
      matrix(store.list(MATRIX_TYPES[distribution]).map((e) => ({
        label: displayName(e), title: entityLabel(e), href: entityHref(e), test: (s) => sceneHas(s, e),
        sub: e.type === 'location' ? locationDetail(e) : '',
      })));
    }
  };

  const draw = async () => {
    clear(tabsEl).append(tabs(TABS.map((key) => ({ key, label: t(TAB_LABEL[key]) })), tab, (key) => { tab = key; draw(); }));
    clear(body);
    if (tab === 'writing') { drawWriting(body, pid); return; }
    if (!chapters.length) {
      body.append(emptyState(t('analysis.empty'), btn(t('nav.chapters'), { kind: 'primary', href: `#/p/${pid}/chapters` }), 'chart'));
      return;
    }
    if (tab === 'book') {
      if (!book) {
        // Necesita el texto de todas las escenas.
        const mine = tab;
        body.append(h('p.muted.empty-line', t('stats.computing')));
        book = bookStats(await store.sceneTexts());
        if (tab !== mine) return;
        clear(body);
      }
      drawBook(body, pid, book);
    } else if (tab === 'style') {
      if (!styleData) {
        const mine = tab;
        body.append(h('p.muted.empty-line', t('stats.computing')));
        styleData = computeStyle(await store.sceneTexts());
        if (tab !== mine) return;
        clear(body);
      }
      drawStyle();
    } else if (tab === 'chart') drawChart();
    else if (tab === 'distribution') drawDistribution();
    else drawAppearances();
  };

  clear(el);
  el.append(pageHeader({ title: t('nav.analysis'), subtitle: t('analysis.hint') }), tabsEl, body);
  await draw();
}
