// Cálculo de estadísticas: del hábito de escritura (palabras por día, rachas, ritmo,
// sesiones) y del libro (longitudes, diálogo frente a narración, frases, reparto por
// personajes y punto de vista, palabras repetidas). Todo se calcula en el navegador
// a partir de lo que ya está guardado.
import { store } from './store.js';
import { htmlToText, countWords, today, dayOffset, parseLocal } from './text.js';
import { splitAliases } from './mentions.js';
import { styleSheet, isAdverb, fold } from './style.js';
import { allSessions } from './sessions.js';
import { chaptersOrdered, chapterNumbers, chapterLabel, scenesOf, displayName, sceneHas, povLabel } from './model.js';

const dayNumber = (day) => Math.round(parseLocal(day).getTime() / 86400000);
const daysBetween = (a, b) => dayNumber(b) - dayNumber(a);
const sum = (list) => list.reduce((a, b) => a + b, 0);
const mean = (list) => (list.length ? sum(list) / list.length : 0);
function median(list) {
  if (!list.length) return 0;
  const s = [...list].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// ---------- Mi escritura ----------

export function writingStats() {
  const day = today();
  const goals = store.project.data.goals || {};
  const total = store.totalWords();
  const written = new Map(store.wordlog.map((w) => [w.day, Math.max(0, w.total - w.start)]));
  const on = (d) => written.get(d) || 0;
  const activeDays = [...written.entries()].filter(([, n]) => n > 0).map(([d]) => d).sort();
  const firstDay = activeDays[0] || day;

  // Racha actual: días seguidos escribiendo hasta hoy (hoy no la rompe mientras no acabe).
  let streak = 0;
  let cursor = on(day) > 0 ? day : dayOffset(day, -1);
  while (on(cursor) > 0) {
    streak++;
    cursor = dayOffset(cursor, -1);
  }
  let longest = 0;
  let run = 0;
  let previous = null;
  for (const d of activeDays) {
    run = previous && daysBetween(previous, d) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    previous = d;
  }

  // Ritmo: media por día natural en los últimos 30 días (o desde que hay datos).
  const span = Math.max(1, Math.min(30, daysBetween(firstDay, day) + 1));
  let recent = 0;
  let recentActive = 0;
  for (let i = 0; i < span; i++) {
    const n = on(dayOffset(day, -i));
    recent += n;
    if (n > 0) recentActive++;
  }
  const pace = recent / span;

  let projection = null;
  if (goals.words && total < goals.words && pace > 0) {
    const days = Math.ceil((goals.words - total) / pace);
    projection = { days, date: dayOffset(day, days), remaining: goals.words - total };
    if (goals.deadline) projection.margin = daysBetween(projection.date, goals.deadline);
  }

  // Calendario de las últimas 26 semanas, empezando en lunes.
  const weeks = 26;
  const weekday = (parseLocal(day).getDay() + 6) % 7; // lunes = 0
  const start = dayOffset(day, -(weekday + (weeks - 1) * 7));
  const calendar = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = dayOffset(start, i);
    calendar.push({ day: d, words: on(d), future: d > day });
  }

  // Media por día de la semana, desde el primer día con datos (como mucho medio año).
  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  const back = Math.min(182, daysBetween(firstDay, day) + 1);
  for (let i = 0; i < back; i++) {
    const d = dayOffset(day, -i);
    const wd = (parseLocal(d).getDay() + 6) % 7;
    totals[wd] += on(d);
    counts[wd]++;
  }

  const best = activeDays.reduce((b, d) => (on(d) > b.words ? { day: d, words: on(d) } : b), { day: null, words: 0 });

  const sessions = allSessions();
  const seconds = sum(sessions.map((s) => s.seconds));
  const sessionWords = sum(sessions.map((s) => Math.max(0, s.words)));
  const todaySessions = sessions.filter((s) => s.day === day);

  return {
    day, total, goals,
    today: on(day),
    streak, longest,
    pace: Math.round(pace),
    paceActive: recentActive ? Math.round(recent / recentActive) : 0,
    activeDays: activeDays.length,
    recentActive, span,
    goalDays: goals.perDay ? [...written.values()].filter((n) => n >= goals.perDay).length : 0,
    projection, calendar,
    calendarMax: Math.max(1, goals.perDay || 0, ...calendar.map((c) => c.words)),
    weekdays: totals.map((n, i) => (counts[i] ? Math.round(n / counts[i]) : 0)),
    best,
    sessions: {
      list: sessions,
      count: sessions.length,
      seconds,
      average: sessions.length ? Math.round(seconds / sessions.length) : 0,
      longest: Math.max(0, ...sessions.map((s) => s.seconds)),
      perHour: seconds ? Math.round(sessionWords / (seconds / 3600)) : 0,
      todaySeconds: sum(todaySessions.map((s) => s.seconds)),
    },
  };
}

// ---------- El libro ----------

// Las palabras vacías y los adverbios de cada idioma están en su hoja (style/<idioma>.js).

const DASH = /^(?:[—–]\s*|-(?=[\p{L}¿¡]))/u;
// Comillas de diálogo: «…», “…”, "…", „…“ o „…” (alemán, checo, polaco, húngaro…) y »…«.
const QUOTE = /«([^»]*)»|“([^”]*)”|"([^"]*)"|„([^“”]*)[“”]|»([^«]*)«/g;

/** Palabras que forman los nombres de personajes, lugares, objetos y grupos: no cuentan como repeticiones. */
function nameTokens() {
  const out = new Set();
  for (const type of ['character', 'location', 'object', 'group']) {
    for (const e of store.list(type)) {
      for (const text of [e.name || '', ...splitAliases(e.data.aliases)]) {
        for (const token of text.toLowerCase().match(/\p{L}+/gu) || []) out.add(token);
      }
    }
  }
  return out;
}

/**
 * Analiza el texto de una escena. El diálogo se reconoce por la raya inicial de párrafo
 * (con sus incisos del narrador entre rayas) y por las comillas.
 */
function analyseText(text, lang, shared) {
  const m = { words: 0, dialogueWords: 0, interventions: 0, changes: 0, sentences: 0, longestSentence: 0, paragraphs: 0 };
  let last = null;
  const segment = (type, part) => {
    const w = countWords(part);
    if (!w) return;
    m.words += w;
    if (type === 'D') m.dialogueWords += w;
    if (last && last !== type) m.changes++;
    last = type;
  };

  for (const line of text.split('\n')) {
    const p = line.trim();
    if (!countWords(p)) continue;
    m.paragraphs++;
    const dash = DASH.exec(p);
    if (dash) {
      // «—Hola —dijo Ana—. ¿Qué tal?»: habla, inciso del narrador, habla.
      m.interventions++;
      p.slice(dash[0].length).split(/[—–]/).forEach((part, i) => segment(i % 2 === 0 ? 'D' : 'N', part));
    } else {
      let pos = 0;
      let q;
      QUOTE.lastIndex = 0;
      while ((q = QUOTE.exec(p))) {
        segment('N', p.slice(pos, q.index));
        const inner = q[1] || q[2] || q[3] || q[4] || q[5] || '';
        // Una sola palabra entre comillas suele ser un término, no una intervención.
        if (countWords(inner) >= 2) {
          m.interventions++;
          segment('D', inner);
        } else {
          segment('N', inner);
        }
        pos = q.index + q[0].length;
      }
      segment('N', p.slice(pos));
    }
    for (const sentence of p.replace(/[—–]/g, ' ').split(/(?<=[.!?…])\s+/)) {
      const w = countWords(sentence);
      if (!w) continue;
      m.sentences++;
      if (w > m.longestSentence) m.longestSentence = w;
    }
  }

  for (const token of text.toLowerCase().match(/\p{L}+(?:·\p{L}+)*/gu) || []) {
    const plain = fold(token);
    if (isAdverb(shared.sheet, plain)) {
      shared.adverbCount++;
      shared.adverbs.set(token, (shared.adverbs.get(token) || 0) + 1);
    }
    if (token.length < 3 || shared.sheet.stop.has(plain) || shared.names.has(token)) continue;
    shared.freq.set(token, (shared.freq.get(token) || 0) + 1);
  }
  return m;
}

const share = (m) => (m.words ? m.dialogueWords / m.words : 0);
const perSentence = (m) => (m.sentences ? m.words / m.sentences : 0);
const perParagraph = (m) => (m.paragraphs ? m.words / m.paragraphs : 0);

/** texts: Map idEscena -> HTML (store.sceneTexts()). */
export function bookStats(texts) {
  const lang = store.project.language;
  const sheet = styleSheet(lang);
  const numbers = chapterNumbers();
  const shared = { freq: new Map(), adverbs: new Map(), adverbCount: 0, sheet, names: nameTokens() };
  const keys = ['words', 'dialogueWords', 'interventions', 'changes', 'sentences', 'paragraphs'];
  const chapters = [];
  const scenes = [];

  for (const c of chaptersOrdered()) {
    const chapter = { id: c.id, label: chapterLabel(c, numbers), scenes: [], words: 0, dialogueWords: 0, interventions: 0, changes: 0, sentences: 0, paragraphs: 0, longestSentence: 0 };
    for (const s of scenesOf(c.id)) {
      const m = analyseText(htmlToText(texts.get(s.id) || ''), lang, shared);
      const row = { id: s.id, label: displayName(s), chapterId: c.id, chapterLabel: chapter.label, chapterIndex: chapters.length, ...m };
      chapter.scenes.push(row);
      scenes.push(row);
      for (const k of keys) chapter[k] += m[k];
      if (m.longestSentence > chapter.longestSentence) chapter.longestSentence = m.longestSentence;
    }
    chapters.push(chapter);
  }

  const total = { words: 0, dialogueWords: 0, interventions: 0, changes: 0, sentences: 0, paragraphs: 0 };
  for (const c of chapters) for (const k of keys) total[k] += c[k];

  const chapterWords = chapters.map((c) => c.words);
  const sceneWords = scenes.map((s) => s.words);
  const summary = (list) => ({ mean: Math.round(mean(list)), median: Math.round(median(list)), min: list.length ? Math.min(...list) : 0, max: list.length ? Math.max(...list) : 0 });

  // Reparto por punto de vista y por personaje, medido en palabras.
  const pov = new Map();
  const presence = [];
  for (const row of scenes) {
    const scene = store.get(row.id);
    const label = povLabel(scene);
    if (label) pov.set(label, (pov.get(label) || 0) + row.words);
  }
  for (const character of store.list('character')) {
    let words = 0;
    let count = 0;
    for (const row of scenes) {
      if (sceneHas(store.get(row.id), character)) { words += row.words; count++; }
    }
    presence.push({ id: character.id, label: displayName(character), words, scenes: count });
  }
  presence.sort((a, b) => b.words - a.words);

  const per1000 = (n) => (total.words ? (n / total.words) * 1000 : 0);
  const topWords = [...shared.freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([word, count]) => ({ word, count, per1000: per1000(count) }));
  const topAdverbs = [...shared.adverbs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word, count]) => ({ word, count }));

  // Puntos de atención: desequilibrios que saltan a la vista en los números.
  const insights = [];
  const written = chapters.filter((c) => c.words > 0);
  const chapterMean = mean(written.map((c) => c.words));
  const sceneMedian = median(scenes.filter((s) => s.words > 0).map((s) => s.words));
  if (written.length >= 3) {
    for (const c of written) {
      if (c.words > chapterMean * 1.6) insights.push({ key: 'longChapter', label: c.label, n: Math.round((c.words / chapterMean - 1) * 100), href: c.id });
      else if (c.words < chapterMean * 0.5) insights.push({ key: 'shortChapter', label: c.label, n: Math.round((1 - c.words / chapterMean) * 100), href: c.id });
    }
  }
  for (const c of written) {
    if (c.words < 300) continue;
    if (share(c) > 0.7) insights.push({ key: 'muchDialogue', label: c.label, n: Math.round(share(c) * 100), href: c.id });
    else if (share(total) > 0.1 && share(c) < 0.03) insights.push({ key: 'noDialogue', label: c.label, href: c.id });
    if (perSentence(c) > 30) insights.push({ key: 'longSentences', label: c.label, n: Math.round(perSentence(c)), href: c.id });
  }
  if (scenes.length >= 4 && sceneMedian > 0) {
    for (const s of scenes) {
      if (s.words > sceneMedian * 3) insights.push({ key: 'longScene', label: `${s.chapterLabel} › ${s.label}`, n: s.words, sceneId: s.id });
    }
  }
  for (const c of chapters) {
    if (!c.scenes.length || !c.words) insights.push({ key: 'emptyChapter', label: c.label, href: c.id });
  }
  if (sheet.adverbs && total.words > 2000 && per1000(shared.adverbCount) > sheet.adverbs.per1000) {
    insights.push({ key: 'manyAdverbs', n: per1000(shared.adverbCount).toFixed(1), suffix: '-' + sheet.adverbs.suffix });
  }

  return {
    lang, chapters, scenes, total,
    chapterSummary: summary(chapterWords.filter((n) => n > 0)),
    sceneSummary: summary(sceneWords.filter((n) => n > 0)),
    dialogueShare: share(total),
    avgSentence: perSentence(total),
    avgParagraph: perParagraph(total),
    pov: [...pov.entries()].map(([label, words]) => ({ label, words })).sort((a, b) => b.words - a.words),
    presence,
    topWords, topAdverbs,
    // La terminación de los adverbios que se buscan («-mente»), o null si en ese idioma no se cuentan.
    adverbSuffix: sheet.adverbs ? '-' + sheet.adverbs.suffix : null,
    adverbsPer1000: per1000(shared.adverbCount),
    adverbCount: shared.adverbCount,
    insights,
  };
}

export const ratios = { share, perSentence, perParagraph };
