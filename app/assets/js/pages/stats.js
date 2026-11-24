// Estadísticas: «Mi escritura» (hábito, rachas, ritmo, sesiones) y «El libro»
// (equilibrio entre capítulos y escenas, diálogo y narración, repeticiones).
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { formatNumber, formatDate, formatClock } from '../text.js';
import { emptyState, btn, tip } from '../ui.js';
import { writingStats, ratios } from '../stats.js';
import { readingLabel } from '../model.js';

const pct = (x) => Math.round((x || 0) * 100) + ' %';

function duration(seconds) {
  const s = Math.round(seconds || 0);
  if (s < 60) return t('stats.seconds', { n: s });
  const minutes = Math.round(s / 60);
  if (minutes < 60) return t('stats.minutes', { n: minutes });
  return t('stats.hoursMinutes', { h: Math.floor(minutes / 60), m: minutes % 60 });
}

function stat(value, label, iconName, note) {
  return h('div.stat-card', h('span.stat-icon', icon(iconName, 20)),
    h('div', h('div.stat-value', value), h('div.stat-label', label), note ? h('div.stat-note', note) : null));
}

function panel(title, ...children) {
  return h('section.panel', h('div.panel-head', h('h3', title)), children);
}

function bars(rows, { max, format } = {}) {
  const top = max || Math.max(1, ...rows.map((r) => r.value));
  return h('div.bar-chart', rows.map((r) => h(r.href ? 'a' : 'div', { class: 'bar-row' + (r.flag ? ' flagged' : ''), href: r.href || null, title: r.title || null },
    h('span.bar-label', r.label),
    h('span.bar-track', h('span.bar-fill', { style: { width: (r.value / top) * 100 + '%' } })),
    h('span.bar-value', format ? format(r) : formatNumber(r.value)))));
}

// ---------- Mi escritura ----------

function drawWriting(el, pid) {
  const w = writingStats();
  const goals = w.goals;

  el.append(h('div.stat-grid',
    stat(formatNumber(w.today), t('stats.today'), 'feather', goals.perDay ? t('stats.ofGoal', { n: formatNumber(goals.perDay) }) : null),
    stat(tn('stats.days', w.streak), t('stats.streak'), 'target', w.streak && !w.today ? t('stats.streakAtRisk') : null),
    stat(tn('stats.days', w.longest), t('stats.longestStreak'), 'history'),
    stat(formatNumber(w.pace), t('stats.pace'), 'chart', t('stats.paceActive', { n: formatNumber(w.paceActive) })),
    stat(formatNumber(w.total), t('home.words'), 'book')));

  // ----- Objetivo y previsión -----
  const goalBox = panel(t('stats.forecast'));
  if (!goals.words) {
    goalBox.append(h('p.muted', t('stats.noGoal')), btn(t('goals.title'), { icon: 'edit', small: true, href: `#/p/${pid}/book` }));
  } else {
    const ratio = Math.min(1, w.total / goals.words);
    goalBox.append(
      h('div.goal-head', h('span', t('goals.total')), h('strong', `${formatNumber(w.total)} / ${formatNumber(goals.words)} (${pct(ratio)})`)),
      h('div.progress', h('div.progress-fill', { style: { width: ratio * 100 + '%' } })));
    if (w.total >= goals.words) {
      goalBox.append(h('p.forecast', t('stats.goalReached')));
    } else if (w.projection) {
      goalBox.append(h('p.forecast', t('stats.projection', { date: formatDate(w.projection.date), words: formatNumber(w.projection.remaining), pace: formatNumber(w.pace) })));
      if (goals.deadline) {
        const m = w.projection.margin;
        goalBox.append(h('p', { class: m >= 0 ? 'forecast-ok' : 'forecast-late' },
          m >= 0 ? tn('stats.ahead', m, { date: formatDate(goals.deadline) }) : tn('stats.behind', -m, { date: formatDate(goals.deadline) })));
      }
    } else {
      goalBox.append(h('p.muted', t('stats.noPace')));
    }
  }
  if (goals.perDay) goalBox.append(h('p.muted', tn('stats.goalDays', w.goalDays)));

  // ----- Calendario de actividad -----
  const level = (n) => (!n ? 0 : Math.min(4, 1 + Math.floor((n / w.calendarMax) * 3.999)));
  const calendar = panel(t('stats.calendar'),
    h('div.heatmap', { role: 'img', 'aria-label': t('stats.calendar') }, w.calendar.map((c) => h('span', {
      class: 'heat l' + level(c.words) + (c.future ? ' future' : '') + (c.day === w.day ? ' today' : ''),
      title: c.future ? '' : `${formatDate(c.day)}: ${tn('count.words', c.words)}`,
    }))),
    h('div.heat-legend',
      h('span', formatDate(w.calendar[0].day, { day: 'numeric', month: 'short' })),
      h('span.heat-scale', t('stats.less'), [0, 1, 2, 3, 4].map((l) => h('span', { class: 'heat l' + l })), t('stats.more')),
      h('span', t('home.todayLabel'))),
    h('p.muted', `${tn('stats.activeDays', w.activeDays)}${w.best.day ? ' · ' + t('stats.bestDay', { date: formatDate(w.best.day), n: formatNumber(w.best.words) }) : ''}`));

  // ----- Días de la semana -----
  const names = [...Array(7).keys()].map((i) => new Intl.DateTimeFormat(document.documentElement.lang || 'es', { weekday: 'long' }).format(new Date(2024, 0, 1 + i)));
  const weekdays = panel(t('stats.weekdays'), bars(w.weekdays.map((value, i) => ({ label: names[i], value }))), h('p.muted', t('stats.weekdaysHint')));

  // ----- Sesiones -----
  const s = w.sessions;
  const sessions = panel(t('stats.sessions'));
  if (!s.count) {
    sessions.append(h('p.muted', t('stats.noSessions')));
  } else {
    sessions.append(h('div.mini-stats',
      h('div', h('strong', formatNumber(s.count)), h('span', t('stats.sessionCount'))),
      h('div', h('strong', duration(s.seconds)), h('span', t('stats.totalTime'))),
      h('div', h('strong', duration(s.average)), h('span', t('stats.avgSession'))),
      h('div', h('strong', duration(s.longest)), h('span', t('stats.longestSession'))),
      h('div', h('strong', formatNumber(s.perHour)), h('span', t('stats.perHour'))),
      h('div', h('strong', duration(s.todaySeconds)), h('span', t('stats.timeToday')))));
    sessions.append(h('div.matrix-wrap', h('table.data-table',
      h('thead', h('tr', [t('stats.date'), t('stats.start'), t('stats.duration'), t('home.words')].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', s.list.slice(-10).reverse().map((x) => h('tr',
        h('td', formatDate(x.day, { day: 'numeric', month: 'short', year: 'numeric' })),
        h('td', formatClock(x.start)),
        h('td', duration(x.seconds)),
        h('td', (x.words > 0 ? '+' : '') + formatNumber(x.words))))))));
  }
  sessions.append(h('p.muted', t('stats.sessionsHint')));

  el.append(h('div.two-col', h('div.col', goalBox, calendar), h('div.col', weekdays, sessions)));
}

// ---------- El libro ----------

function drawBook(el, pid, b) {
  if (!b.total.words) {
    el.append(emptyState(t('stats.bookEmpty'), btn(t('nav.chapters'), { kind: 'primary', href: `#/p/${pid}/chapters` }), 'book'));
    return;
  }
  const written = b.chapters.filter((c) => c.words > 0);

  el.append(h('div.stat-grid',
    stat(formatNumber(b.total.words), t('home.words'), 'feather', readingLabel(b.total.words)),
    stat(formatNumber(b.chapterSummary.mean), t('stats.avgChapter'), 'book', t('stats.range', { min: formatNumber(b.chapterSummary.min), max: formatNumber(b.chapterSummary.max) })),
    stat(formatNumber(b.sceneSummary.mean), t('stats.avgScene'), 'layers', t('stats.range', { min: formatNumber(b.sceneSummary.min), max: formatNumber(b.sceneSummary.max) })),
    stat(pct(b.dialogueShare), h('span', t('stats.dialogue'), tip(t('stats.tip.dialogue'))), 'users', h('span', tn('stats.interventions', b.total.interventions), tip(t('stats.tip.interventions')))),
    stat(b.avgSentence.toFixed(1), t('stats.avgSentence'), 'note', t('stats.avgParagraphNote', { n: Math.round(b.avgParagraph) }))));

  // ----- Puntos de atención -----
  const insights = panel(t('stats.insights'));
  if (!b.insights.length) {
    insights.append(h('p.muted', t('stats.noInsights')));
  } else {
    insights.append(h('ul.insight-list', b.insights.map((i) => {
      const href = i.sceneId ? `#/p/${pid}/scenes/${i.sceneId}` : i.href ? `#/p/${pid}/chapters/${i.href}` : null;
      const text = t('stats.insight.' + i.key, { label: i.label || '', n: typeof i.n === 'number' ? formatNumber(i.n) : i.n, suffix: i.suffix || '' });
      return h('li', icon('info', 15), href ? h('a', { href }, text) : h('span', text));
    })));
  }
  el.append(insights);

  // ----- Longitud de capítulos -----
  const meanWords = b.chapterSummary.mean || 1;
  el.append(panel(t('analysis.lengths'),
    h('p.muted', t('stats.lengthsHint', { mean: formatNumber(b.chapterSummary.mean), median: formatNumber(b.chapterSummary.median) })),
    bars(b.chapters.map((c) => ({
      label: c.label, value: c.words, href: `#/p/${pid}/chapters/${c.id}`,
      flag: written.length >= 3 && c.words > 0 && (c.words > meanWords * 1.6 || c.words < meanWords * 0.5),
    })), { format: (r) => `${formatNumber(r.value)} · ${r.value ? (r.value >= meanWords ? '+' : '−') + Math.abs(Math.round((r.value / meanWords - 1) * 100)) + ' %' : '—'}` })));

  // ----- Ritmo: longitud de las escenas en orden -----
  const maxScene = Math.max(1, ...b.scenes.map((s) => s.words));
  el.append(panel(t('stats.pacing'),
    h('p.muted', t('stats.pacingHint')),
    h('div.pace-chart', b.scenes.map((s) => h('a', {
      class: 'pace-col' + (s.chapterIndex % 2 ? ' alt' : ''), href: `#/p/${pid}/scenes/${s.id}`,
      title: `${s.chapterLabel} › ${s.label}: ${tn('count.words', s.words)}`,
    }, h('span.pace-bar', { style: { height: Math.max(s.words ? 3 : 0, (s.words / maxScene) * 100) + '%' } })))),
    h('div.day-axis', h('span', b.chapters[0] ? b.chapters[0].label : ''), h('span', b.chapters.length ? b.chapters[b.chapters.length - 1].label : ''))));

  // ----- Diálogo y narración -----
  el.append(panel(t('stats.dialogueVsNarration'),
    h('p.muted', t('stats.dialogueHint')),
    h('div.bar-chart', b.chapters.map((c) => h('a.bar-row', { href: `#/p/${pid}/chapters/${c.id}` },
      h('span.bar-label', c.label),
      h('span.bar-track.split', { title: `${t('stats.dialogue')}: ${pct(ratios.share(c))}` },
        c.words ? h('span.bar-fill.dialogue', { style: { width: ratios.share(c) * 100 + '%' } }) : null,
        c.words ? h('span.bar-fill.narration', { style: { width: (1 - ratios.share(c)) * 100 + '%' } }) : null),
      h('span.bar-value', c.words ? `${pct(ratios.share(c))} · ${tn('stats.changes', c.changes)}` : '—')))),
    h('div.legend', h('span.legend-item', h('span.legend-swatch.dialogue'), t('stats.dialogue')), h('span.legend-item', h('span.legend-swatch.narration'), t('stats.narration')))));

  // ----- Tabla de detalle -----
  let level = 'chapters';
  const detail = h('section.panel');
  const drawDetail = () => {
    clear(detail);
    const rows = level === 'chapters' ? b.chapters : b.scenes;
    const mode = (key, label) => h('button', { type: 'button', class: 'seg-opt' + (level === key ? ' active' : ''), onclick: () => { level = key; drawDetail(); } }, label);
    detail.append(
      h('div.panel-head', h('h3', t('stats.detail')), h('span.seg', mode('chapters', t('nav.chapters')), mode('scenes', t('scenes.plural')))),
      h('div.matrix-wrap', h('table.data-table.numeric',
        // Cada columna lleva un «?» que explica qué mide.
        h('thead', h('tr', [
          [level === 'chapters' ? t('chapters.singular') : t('scenes.singular'), null],
          [t('home.words'), 'words'],
          level === 'chapters' ? [t('scenes.plural'), 'scenes'] : null,
          [t('stats.dialogue'), 'dialogue'], [t('stats.interventionsCol'), 'interventions'], [t('stats.changesCol'), 'changes'],
          [t('stats.avgSentence'), 'avgSentence'], [t('stats.longestSentence'), 'longestSentence'], [t('stats.avgParagraph'), 'avgParagraph'],
        ].filter(Boolean).map(([label, key]) => h('th', { scope: 'col' }, label, key ? tip(t('stats.tip.' + key)) : null)))),
        h('tbody', rows.map((r) => h('tr',
          h('td', h('a', { href: level === 'chapters' ? `#/p/${pid}/chapters/${r.id}` : `#/p/${pid}/scenes/${r.id}` }, level === 'chapters' ? r.label : `${r.chapterLabel} › ${r.label}`)),
          h('td', formatNumber(r.words)),
          level === 'chapters' ? h('td', formatNumber(r.scenes.length)) : null,
          h('td', r.words ? pct(ratios.share(r)) : '—'),
          h('td', formatNumber(r.interventions)),
          h('td', formatNumber(r.changes)),
          h('td', r.sentences ? ratios.perSentence(r).toFixed(1) : '—'),
          h('td', r.longestSentence ? formatNumber(r.longestSentence) : '—'),
          h('td', r.paragraphs ? Math.round(ratios.perParagraph(r)) : '—')))))));
  };
  drawDetail();
  el.append(detail);

  // ----- Punto de vista y personajes, por palabras -----
  const total = b.total.words;
  const shareOf = (r) => `${formatNumber(r.value)} · ${pct(r.value / total)}`;
  const povPanel = panel(t('stats.povWords'),
    b.pov.length ? bars(b.pov.map((p) => ({ label: p.label, value: p.words })), { max: total, format: shareOf }) : h('p.muted', t('stats.noPov')));
  const presence = b.presence.filter((p) => p.words > 0);
  const absent = b.presence.filter((p) => !p.words);
  const presencePanel = panel(t('stats.presence'),
    h('p.muted', t('stats.presenceHint')),
    presence.length ? bars(presence.slice(0, 15).map((p) => ({ label: p.label, value: p.words, href: `#/p/${pid}/characters/${p.id}`, title: tn('count.scenes', p.scenes) })), { max: total, format: shareOf }) : h('p.muted', t('analysis.noData')),
    absent.length ? h('p.muted', t('stats.absent', { names: absent.map((p) => p.label).join(', ') })) : null);
  el.append(h('div.two-col', h('div.col', povPanel), h('div.col', presencePanel)));

  // ----- Repeticiones -----
  const wordsPanel = panel(t('stats.topWords'),
    h('p.muted', t('stats.topWordsHint')),
    h('div.chips', b.topWords.map((x) => h('span.chip.word-chip', { title: t('stats.per1000', { n: x.per1000.toFixed(1) }) }, x.word, h('span.word-count', formatNumber(x.count))))));
  // Los adverbios solo se cuentan en los idiomas que los forman con una terminación fiable.
  const adverbPanel = b.adverbSuffix ? panel(t('stats.adverbs', { suffix: b.adverbSuffix }),
    h('p', h('strong.big-number', b.adverbsPer1000.toFixed(1)), ' ', t('stats.per1000Label'), h('span.muted', ` (${formatNumber(b.adverbCount)})`)),
    h('p.muted', t('stats.adverbsHint')),
    b.topAdverbs.length ? h('div.chips', b.topAdverbs.map((x) => h('span.chip.word-chip', x.word, h('span.word-count', formatNumber(x.count))))) : null) : null;
  el.append(adverbPanel ? h('div.two-col', h('div.col', wordsPanel), h('div.col', adverbPanel)) : wordsPanel);
}

// Estas dos vistas son pestañas de la sección «Análisis» (pages/analysis.js).
export { drawWriting, drawBook };

/** La antigua sección «Estadísticas» lleva ahora a su pestaña dentro de «Análisis». */
export async function statsPage({ pid, query }) {
  location.replace(`#/p/${pid}/analysis?tab=${query.tab === 'book' ? 'book' : 'writing'}`);
}
