// Inicio del proyecto: lo que conviene ver al entrar. Cuatro franjas alineadas (ninguna
// columna queda más larga que otra):
//   1. Por dónde seguir: la última escena que se tocó y la siguiente por escribir.
//   2. Cuatro cifras: el manuscrito frente a su meta, lo de hoy, la racha y la entrega.
//   3. El ritmo de los últimos 30 días y el estado de cada parte del proyecto.
//   4. Lo que queda por revisar: los pendientes abiertos y los avisos.
// En un proyecto recién creado, la primera franja son los primeros pasos.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { formatNumber, today, dayOffset, formatDate, parseLocal, htmlToText } from '../text.js';
import { btn, pageHeader, statusDot } from '../ui.js';
import {
  chaptersOrdered, chapterStatus, chapterLabel, chapterNumbers, allScenesOrdered, displayName, entityHref, validIds,
  ARCH_KEYS, archItem,
} from '../model.js';
import { codeTag, sceneTagSummary, viewImage } from '../components.js';
import { writingStats } from '../stats.js';
import { allTasks, isOpen, taskContext, kindBadge } from '../tasks.js';
import { runChecks, ignoredChecks } from '../continuity.js';

function progressBar(ratio) {
  const pct = Math.max(0, Math.min(1, ratio || 0)) * 100;
  return h('div.progress', { role: 'progressbar', 'aria-valuenow': Math.round(pct), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div.progress-fill', { style: { width: pct + '%' } }));
}

function statusSummary(label, items, href) {
  const counts = [0, 0, 0];
  for (const s of items) counts[s] = (counts[s] || 0) + 1;
  const total = items.length;
  return h('a.summary-row', { href },
    h('span.summary-label', label),
    h('span.summary-bar', total
      ? [2, 1, 0].map((s) => (counts[s] ? h('span', { class: 'seg s' + s, style: { flexGrow: counts[s] }, title: `${t('status.' + s)}: ${counts[s]}` }) : null))
      : h('span.seg.empty')),
    h('span.summary-count', total ? `${counts[2]}/${total}` : '—'));
}

/** «hoy», «ayer», «hace 5 días»: cuánto hace de una marca de tiempo del servidor (UTC). */
function ago(utc) {
  const d = utc ? new Date(utc.replace(' ', 'T') + 'Z') : null;
  if (!d || isNaN(d)) return '';
  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const days = Math.round((parseLocal(today()) - parseLocal(local)) / 86400000);
  return days <= 0 ? t('home.ago.today') : days === 1 ? t('home.ago.yesterday') : tn('home.ago.days', days);
}

/** Una cifra del inicio: rótulo, valor grande, una línea de detalle y, si procede, una barra. */
function tile({ label, iconName, value, detail, ratio, tone, href }) {
  return h(href ? 'a' : 'div', { class: 'home-tile' + (tone ? ' is-' + tone : ''), href: href || null },
    h('span.home-tile-head', h('span.home-tile-label', label), icon(iconName, 16)),
    h('span.home-tile-value', value),
    h('span.home-tile-detail', detail || ''),
    ratio == null ? null : progressBar(ratio));
}

export async function homePage({ el, pid }) {
  const p = store.project;
  const goals = p.data.goals || {};
  const scenes = allScenesOrdered();
  const chapters = chaptersOrdered();
  const numbers = chapterNumbers();
  const w = writingStats();
  const words = w.total;
  const day = w.day;
  const sceneRef = (s) => { const c = store.get(s.parent_id); return c ? chapterLabel(c, numbers) : ''; };

  // ----- 1. Por dónde seguir -----
  // Lo último que se tocó: la escena (o su texto) modificada más recientemente.
  const stamp = (s) => [s.updated_at, ...store.list('revision', s.id).map((r) => r.updated_at)].filter(Boolean).sort().pop() || '';
  const byRecent = [...scenes].sort((a, b) => (stamp(a) < stamp(b) ? 1 : -1));
  const last = byRecent.find((s) => (s.words || 0) > 0) || byRecent[0] || null;
  // Lo siguiente: la primera escena, en orden de lectura, que está sin empezar; si no hay, la primera sin terminar.
  const pending = scenes.filter((s) => s !== last && s.status !== 2);
  const next = pending.find((s) => !(s.words || 0)) || pending[0] || null;

  const sceneCard = (kicker, s, meta) => h('a.home-step', { href: entityHref(s) },
    h('span.home-kicker', kicker),
    h('span.home-step-title', statusDot(s.status), h('strong', displayName(s)), codeTag(s)),
    h('span.home-step-where', sceneRef(s)),
    h('span.home-step-meta', meta),
    h('span.home-step-go', icon('chevron-right', 16)));

  // ----- 0. La novela: portada y frase de presentación (si las hay), en su propio bloque -----
  // La portada se ve entera; al pasar el ratón sale la lupa y al pulsarla se amplía.
  const cover = p.data.cover ? store.images.find((i) => i.id === p.data.cover && !i.deleted) : null;
  const pitch = String(p.data.logline || '').trim() || htmlToText(p.data.synopsis || '').trim();
  const bookBox = cover || pitch
    ? h('section.home-book',
      cover ? h('button.home-cover', { type: 'button', title: t('cover.zoom'), 'aria-label': t('cover.zoom'), onclick: () => viewImage({ ...cover, name: t('cover.title') }) },
        h('img', { src: api.imageUrl(cover), alt: t('cover.title') }),
        h('span.home-cover-zoom', icon('search', 22))) : null,
      h('div.home-book-text',
        pitch ? h('p.home-logline', pitch.length > 420 ? pitch.slice(0, 420).replace(/\s+\S*$/, '') + '…' : pitch) : h('p.home-book-title', p.name)))
    : null;

  let nextBox;
  if (scenes.length) {
    nextBox = h('section.home-next',
      h('div.home-next-body',
        h('div.home-next-cols',
          sceneCard(t('home.lastTitle'), last, [ago(stamp(last)), tn('count.words', last.words || 0)].filter(Boolean).join(' · ')),
          next
            ? sceneCard(t('home.nextTitle'), next, (next.data.summary && String(next.data.summary).trim()) || sceneTagSummary(next) || t('status.' + (next.status || 0)))
            : h('div.home-step.is-empty', h('span.home-kicker', t('home.nextTitle')), h('span.home-step-meta', t('home.nextNone'))))));
  } else {
    // Proyecto recién creado: los tres primeros pasos, con lo que ya está hecho marcado.
    const premise = archItem('premise');
    const steps = [
      [!!(premise && htmlToText(premise.body)), t('home.start.premise'), `#/p/${pid}/architecture`],
      [store.list('character').length > 0, t('home.start.characters'), `#/p/${pid}/characters`],
      [chapters.length > 0, t('home.start.chapters'), `#/p/${pid}/chapters`],
    ];
    nextBox = h('section.home-next',
      h('div.home-next-body',
        h('span.home-kicker', t('home.start.title')),
        h('div.home-next-cols.three', steps.map(([done, label, href], i) => h('a', { class: 'home-step' + (done ? ' is-done' : ''), href },
          h('span.home-step-title', h('span.home-step-num', done ? icon('check', 14) : String(i + 1)), h('strong', label)),
          h('span.home-step-go', icon('chevron-right', 16)))))));
  }

  // ----- 2. Cuatro cifras -----
  const pct = goals.words ? Math.min(100, Math.round((words / goals.words) * 100)) : 0;
  const end = goals.deadline ? parseLocal(goals.deadline) : null;
  const daysLeft = end ? Math.round((end - parseLocal(day)) / 86400000) : null;
  const remaining = goals.words ? Math.max(0, goals.words - words) : 0;
  const needed = daysLeft > 0 && remaining > 0 ? Math.ceil(remaining / daysLeft) : 0;

  let deadlineTile;
  if (goals.words && remaining === 0) {
    deadlineTile = { label: t('home.tile.deadline'), iconName: 'target', value: t('home.reached'), detail: t('stats.goalReached'), tone: 'ok' };
  } else if (daysLeft != null) {
    deadlineTile = {
      label: t('home.tile.deadline'), iconName: 'target',
      value: daysLeft >= 0 ? tn('stats.days', daysLeft, { n: formatNumber(daysLeft) }) : t('home.overdue'),
      detail: daysLeft < 0 ? formatDate(goals.deadline) : needed ? t('home.needPace', { need: formatNumber(needed), pace: formatNumber(w.pace) }) : formatDate(goals.deadline),
      tone: daysLeft < 0 || (needed && w.pace < needed) ? 'warn' : needed ? 'ok' : '',
    };
  } else if (w.projection) {
    deadlineTile = { label: t('home.tile.forecast'), iconName: 'target', value: formatDate(w.projection.date, { month: 'short', year: 'numeric' }), detail: t('home.forecastAt', { pace: formatNumber(w.pace) }) };
  } else {
    deadlineTile = { label: t('home.tile.deadline'), iconName: 'target', value: '—', detail: t(goals.words ? 'home.noPace' : 'home.setGoals'), href: `#/p/${pid}/book?tab=goals` };
  }

  const tiles = h('div.home-tiles',
    tile({
      label: t('home.tile.words'), iconName: 'feather', value: formatNumber(words),
      detail: goals.words ? t('home.ofGoal', { goal: formatNumber(goals.words), pct }) : `${tn('count.chapters', chapters.length)} · ${tn('count.scenes', scenes.length)}`,
      ratio: goals.words ? words / goals.words : null,
    }),
    tile({
      label: t('home.tile.today'), iconName: 'edit', value: formatNumber(w.today),
      detail: goals.perDay ? t('home.ofDaily', { n: formatNumber(goals.perDay) }) : t('home.wordsToday'),
      ratio: goals.perDay ? w.today / goals.perDay : null,
      tone: goals.perDay && w.today >= goals.perDay ? 'ok' : '',
    }),
    tile({
      label: t('home.tile.streak'), iconName: 'activity', value: tn('stats.days', w.streak, { n: formatNumber(w.streak) }),
      detail: w.streak && !w.today ? t('stats.streakAtRisk') : t('home.longest', { n: formatNumber(w.longest) }),
      tone: w.streak && !w.today ? 'warn' : '',
    }),
    tile(deadlineTile));

  // ----- 3. Ritmo y estado -----
  const days = [];
  for (let i = 29; i >= 0; i--) days.push(dayOffset(day, -i));
  const values = days.map((d) => store.wordsOn(d));
  const max = Math.max(1, goals.perDay || 0, ...values);
  const rhythm = h('section.panel.home-half',
    h('div.panel-head', h('h3', t('home.last30')),
      btn(t('stats.tabWriting'), { icon: 'activity', small: true, href: `#/p/${pid}/analysis?tab=writing` })),
    h('p.home-figure', h('strong', formatNumber(values.reduce((a, b) => a + b, 0))), ' ', t('home.wordsIn30'),
      h('span.muted', ` · ${t('home.perDay', { n: formatNumber(w.pace) })}`)),
    h('div.day-chart.home-chart', { role: 'img', 'aria-label': t('home.last30') }, days.map((d, i) => h('div.day-col', { title: `${formatDate(d)}: ${tn('count.words', values[i])}` },
      h('div', { class: 'day-bar' + (goals.perDay && values[i] >= goals.perDay ? ' reached' : ''), style: { height: Math.max(values[i] ? 3 : 0, (values[i] / max) * 100) + '%' } })))),
    h('div.day-axis', h('span', formatDate(days[0], { day: 'numeric', month: 'short' })), h('span', t('home.todayLabel'))));

  const arch = ARCH_KEYS.map((k) => archItem(k)).filter(Boolean).map((e) => e.status);
  const overview = h('section.panel.home-half',
    h('div.panel-head', h('h3', t('home.progress')), h('span.legend', [0, 1, 2].map((s) => h('span.legend-item', statusDot(s), t('status.' + s))))),
    h('div.home-rows',
      statusSummary(t('nav.architecture'), [...arch, ...store.list('strand').map((e) => e.status)], `#/p/${pid}/architecture`),
      statusSummary(t('nav.characters'), store.list('character').map((e) => e.status), `#/p/${pid}/characters`),
      statusSummary(t('nav.locations'), store.list('location').map((e) => e.status), `#/p/${pid}/locations`),
      statusSummary(t('nav.objects'), store.list('object').map((e) => e.status), `#/p/${pid}/objects`),
      statusSummary(t('nav.chapters'), chapters.map(chapterStatus), `#/p/${pid}/chapters`),
      statusSummary(t('home.scenes'), scenes.map((s) => s.status), `#/p/${pid}/chapters`)));

  // ----- 4. Lo que queda por revisar -----
  const open = allTasks().filter(isOpen).sort((a, b) => ((a.created_at || '') < (b.created_at || '') ? 1 : -1));
  const tasksBox = h('section.panel.home-half',
    h('div.panel-head', h('h3', t('tasks.title'), open.length ? h('span.count-badge', String(open.length)) : null),
      btn(t('home.seeAll'), { icon: 'chevron-right', small: true, href: `#/p/${pid}/tasks` })),
    open.length
      ? h('div.home-rows', open.slice(0, 4).map((task) => {
        const context = taskContext(task);
        return h('a.home-row', { href: context ? context.href : `#/p/${pid}/tasks` },
          kindBadge(task),
          h('span.home-row-text', h('span.home-row-main', task.name), context ? h('span.home-row-sub', context.label) : null));
      }), open.length > 4 ? h('span.home-more', tn('home.more', open.length - 4)) : null)
      : h('p.home-ok', icon('check', 16), t('home.tasksNone')));

  const ignored = ignoredChecks();
  const issues = runChecks().filter((i) => !ignored.has(i.key));
  const errors = issues.filter((i) => i.level === 'error').length;
  const undated = scenes.filter((s) => !s.data.time).length;
  const noStrand = store.list('strand').length ? scenes.filter((s) => !validIds(s.data.strands).length).length : 0;
  const notes = [
    errors ? ['error', tn('home.rev.errors', errors), `#/p/${pid}/continuity`] : null,
    issues.length - errors ? ['warn', tn('home.rev.warnings', issues.length - errors), `#/p/${pid}/continuity`] : null,
    undated ? ['info', tn('home.rev.undated', undated), `#/p/${pid}/timeline`] : null,
    noStrand ? ['info', tn('home.rev.noStrand', noStrand), `#/p/${pid}/architecture`] : null,
  ].filter(Boolean);
  const reviewBox = h('section.panel.home-half',
    h('div.panel-head', h('h3', t('home.review')),
      btn(t('nav.continuity'), { icon: 'chevron-right', small: true, href: `#/p/${pid}/continuity` })),
    notes.length
      ? h('div.home-rows', notes.map(([tone, text, href]) => h('a.home-row', { href },
        h('span', { class: 'home-mark is-' + tone }),
        h('span.home-row-text', h('span.home-row-main', text)),
        icon('chevron-right', 14))))
      : h('p.home-ok', icon('check', 16), t('home.reviewOk')));

  clear(el);
  el.append(
    pageHeader({
      title: p.name,
      subtitle: p.author ? t('home.by', { author: p.author }) : t('home.subtitle'),
      actions: [
        btn(t('nav.book'), { icon: 'bookmark', href: `#/p/${pid}/book` }),
        btn(t(last ? 'home.continue' : 'home.write'), { icon: 'feather', kind: 'primary', href: last ? entityHref(last) : `#/p/${pid}/chapters` }),
      ],
    }),
    h('div.home', bookBox, nextBox, tiles, rhythm, overview, tasksBox, reviewBox));
}
