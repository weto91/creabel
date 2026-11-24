// Herramientas que acompañan al editor de una escena y se abren en un panel a su derecha:
//  - Vista partida: una ficha, una nota u otra escena para consultarla mientras se escribe.
//  - Estilo: los avisos de la revisión de estilo, que se señalan sobre el propio texto.
// Y la barra de lectura en voz alta, que va encima del editor.
import { h, clear, icon } from './dom.js';
import { t, tn } from './i18n.js';
import { store } from './store.js';
import { api } from './api.js';
import { sanitizeHtml, formatNumber } from './text.js';
import { btn, pickDialog, toast } from './ui.js';
import {
  displayName, entityHref, chapterLabel, chapterNumbers, chaptersOrdered, scenesOf, customType, ARCH_KEYS, archItem,
} from './model.js';
import { pickItem, profileImage, codeTag, sceneTagSummary } from './components.js';
import { buildSheetBlocks } from './export/sheet.js';
import { analyzeStyle, totalOf, paragraphsOf, rangeIn } from './style.js';
import { createReader, speechAvailable, voicesFor } from './speech.js';

const SPLIT_KEY = 'creabel.splitRef';
const SPLIT_TYPES = ['character', 'location', 'object', 'group', 'custom', 'strand', 'note'];

// ---------- Vista partida ----------

/** Bloques de exportación -> nodos, para leer una ficha sin salir de la escena. */
function blocksToNodes(blocks) {
  return blocks.map((b) => {
    switch (b.t) {
      case 'h2': return null; // el nombre ya va en la cabecera del panel
      case 'h3': return h('h4', b.text);
      case 'p': return h('p', { class: b.bold ? 'split-lead' : null }, b.text);
      case 'html': { const div = h('div.split-html'); div.innerHTML = sanitizeHtml(b.html); return div; }
      default: return null;
    }
  }).filter(Boolean);
}

/** Lo que se puede poner al lado: fichas, notas, arquitectura y las demás escenas. */
function splitItems(scene) {
  const numbers = chapterNumbers();
  const items = SPLIT_TYPES.flatMap((type) => store.list(type).map((e) => pickItem(e, {
    group: type === 'custom' ? (customType(e) || {}).name || t('custom.plural') : t(type + '.plural'),
  })));
  for (const key of ARCH_KEYS) {
    const item = archItem(key);
    if (item) items.push({ id: item.id, label: t('arch.' + key), icon: 'layers', group: t('nav.architecture') });
  }
  for (const c of chaptersOrdered()) {
    for (const s of scenesOf(c.id)) {
      if (s.id !== scene.id) items.push({ id: s.id, label: displayName(s), sub: sceneTagSummary(s), icon: 'book', group: chapterLabel(c, numbers) });
    }
  }
  return items;
}

async function renderSplit(body, e) {
  clear(body);
  if (e.type === 'scene') {
    const revs = store.list('revision', e.id);
    const active = revs.find((r) => r.id === e.data.activeRevision) || revs[revs.length - 1];
    const tags = sceneTagSummary(e);
    body.append(...[tags ? h('p.muted.small', tags) : null, e.data.summary ? h('p.split-lead', e.data.summary) : null].filter(Boolean));
    const text = h('div.split-html.split-text', h('p.muted', t('stats.computing')));
    body.append(text);
    try {
      const html = active ? await store.loadBody(active.id) : '';
      text.innerHTML = sanitizeHtml(html) || `<p class="muted">${t('split.noText')}</p>`;
    } catch (err) { text.textContent = t('split.noText'); }
    return;
  }
  const img = profileImage(e);
  if (img) body.append(h('img.split-image', { src: api.imageUrl(img), alt: '' }));
  if (e.type === 'architecture') {
    const div = h('div.split-html');
    div.innerHTML = sanitizeHtml(e.body) || `<p class="muted">${t('split.noText')}</p>`;
    body.append(div);
    return;
  }
  // Los campos de una ficha propia, antes del resto.
  if (e.type === 'custom') {
    const ct = customType(e);
    for (const f of (ct && ct.fields) || []) {
      const value = (e.data.values || {})[f.id];
      if (value) body.append(h('p', h('strong', f.label + ': '), value));
    }
  }
  body.append(...blocksToNodes(buildSheetBlocks(e)));
}

// ---------- Panel de herramientas ----------

/**
 * Crea el panel derecho de la escena y la barra de lectura. `editor` es el editor de la escena.
 * Devuelve { pane, speechBar, toggleSplit, toggleStyle, toggleSpeech, refreshStyle, close, mode }.
 * `onMode(modo)` avisa cuando el panel se abre o se cierra (modo: 'split' | 'style' | null).
 */
export function createSceneTools({ scene, editor, lang, onMode }) {
  const pane = h('aside.scene-pane', { hidden: true });
  let mode = null;
  const canHighlight = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';
  const clearMarks = (name) => { if (canHighlight) CSS.highlights.delete(name); };

  const setMode = (next) => {
    mode = next;
    pane.hidden = !next;
    if (next !== 'style') clearMarks('style-hit');
    if (onMode) onMode(next);
  };
  const head = (title, ...actions) => h('header.scene-pane-head', h('h3', title), ...actions,
    h('button.modal-close', { type: 'button', 'aria-label': t('common.close'), title: t('common.close'), onclick: () => setMode(null) }, icon('x', 17)));

  // ----- Vista partida -----
  let refId = '';
  try { refId = localStorage.getItem(SPLIT_KEY) || ''; } catch (err) { refId = ''; }
  const choose = async () => {
    const picked = await pickDialog({ title: t('split.choose'), items: splitItems(scene), single: true, selected: refId ? [refId] : [], emptyText: t('tags.noneAvailable') });
    if (!picked || !picked[0]) return false;
    refId = picked[0];
    try { localStorage.setItem(SPLIT_KEY, refId); } catch (err) { /* no es crítico */ }
    return true;
  };
  const drawSplit = () => {
    clear(pane);
    const e = store.get(refId);
    const body = h('div.scene-pane-body');
    pane.append(
      head(e ? displayName(e) : t('split.title'), btn(t('tags.change'), { icon: 'edit', small: true, kind: 'ghost', onClick: async () => { if (await choose()) drawSplit(); } })),
      e ? h('p.scene-pane-sub', codeTag(e), h('a', { href: entityHref(e) }, t('split.open'))) : null,
      body);
    if (e) renderSplit(body, e);
    else body.append(h('p.muted', t('split.empty')));
  };
  const toggleSplit = async () => {
    if (mode === 'split') { setMode(null); return; }
    if (!store.get(refId) || refId === scene.id) { if (!(await choose())) return; }
    setMode('split');
    drawSplit();
  };

  // ----- Estilo -----
  let found = null;
  let pick = { key: '', at: 0 }; // hallazgo elegido y cuál de sus apariciones se está viendo
  const SECTIONS = ['repeats', 'adverbs', 'fillers', 'long', 'starts'];
  const blocksNow = () => paragraphsOf(editor.area);

  const show = (key, item) => {
    const blocks = blocksNow();
    const ranges = item.hits.map((hit) => (blocks[hit.p] ? rangeIn(blocks[hit.p], hit.start, hit.end) : null)).filter(Boolean);
    if (!ranges.length) return;
    // Pulsar otra vez el mismo aviso salta a su siguiente aparición.
    pick = { key, at: pick.key === key ? (pick.at + 1) % ranges.length : 0 };
    if (canHighlight) CSS.highlights.set('style-hit', new Highlight(...ranges));
    const rect = ranges[pick.at].getBoundingClientRect();
    const node = ranges[pick.at].startContainer.parentElement;
    if (node && (rect.top < 80 || rect.bottom > window.innerHeight - 80)) node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    drawStyle();
  };

  function drawStyle() {
    clear(pane);
    const body = h('div.scene-pane-body');
    pane.append(head(t('style.title'), btn('', { icon: 'history', small: true, kind: 'ghost', title: t('style.refresh'), onClick: refreshStyle })), body);
    if (!found || !found.words) {
      body.append(h('p.muted', t('style.empty')));
      return;
    }
    const per = (n) => formatNumber(Math.round((n / found.words) * 1000));
    // En los idiomas en los que no se cuentan los adverbios, el resumen no los menciona.
    body.append(h('p.muted.small', t(found.adverbSuffix ? 'style.summary' : 'style.summaryNoAdverbs', {
      words: formatNumber(found.words), avg: formatNumber(Math.round(found.words / Math.max(1, found.sentences))), adverbs: per(totalOf(found.adverbs)), suffix: found.adverbSuffix || '',
    })));
    let any = false;
    for (const section of SECTIONS) {
      const list = found[section];
      if (!list.length) continue;
      any = true;
      body.append(h('section.style-section',
        h('h4', t('style.' + section, { suffix: found.adverbSuffix || '' }), h('span.count-badge', String(section === 'long' ? list.length : totalOf(list)))),
        h('p.muted.small', t(`style.${section}.hint`)),
        h('div.style-list', list.slice(0, 14).map((item, i) => {
          const key = `${section}:${i}`;
          return h('button', { type: 'button', class: 'style-item' + (pick.key === key ? ' active' : ''), onclick: () => show(key, item) },
            h('span.style-label', item.label),
            h('span.style-count', section === 'long' ? tn('count.words', item.count) : `×${item.count}`));
        })),
        list.length > 14 ? h('p.muted.small', tn('timeline.importMore', list.length - 14)) : null));
    }
    if (!any) body.append(h('p.check-ok', icon('check', 18), t('style.clean')));
    else body.append(h('p.muted.small', t(canHighlight ? 'style.howTo' : 'style.noMarks')));
  }

  function refreshStyle() {
    found = analyzeStyle(blocksNow().map((b) => b.textContent), lang);
    pick = { key: '', at: 0 };
    clearMarks('style-hit');
    if (mode === 'style') drawStyle();
  }
  const toggleStyle = () => {
    if (mode === 'style') { setMode(null); return; }
    setMode('style');
    refreshStyle();
  };

  // ----- Leer en voz alta -----
  const speechBar = h('div.speech-bar', { hidden: true });
  let reader = null;
  const stopSpeech = () => { if (reader) reader.stop(); speechBar.hidden = true; clearMarks('speech-now'); };
  const caretParagraph = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !editor.area.contains(sel.anchorNode)) return 0;
    const i = blocksNow().findIndex((b) => b.contains(sel.anchorNode));
    return i < 0 ? 0 : i;
  };
  const drawSpeech = () => {
    clear(speechBar);
    const playing = reader.state === 'playing';
    const voices = voicesFor(lang);
    const rate = h('select.input.inline-select', { 'aria-label': t('speech.rate') }, [0.8, 1, 1.2, 1.5].map((r) => h('option', { value: String(r) }, `${String(r).replace('.', ',')}×`)));
    rate.value = String(reader.rate || 1);
    rate.addEventListener('change', () => { reader.rate = Number(rate.value); reader.set({ rate: reader.rate }); });
    const voice = voices.length > 1 ? h('select.input.inline-select', { 'aria-label': t('speech.voice') }, voices.map((v) => h('option', { value: v.name }, v.name))) : null;
    if (voice) {
      voice.value = reader.voice || voices[0].name;
      voice.addEventListener('change', () => { reader.voice = voice.value; reader.set({ voice: voice.value }); });
    }
    speechBar.append(...[
      icon('volume', 17),
      btn('', { icon: playing ? 'pause' : 'play', small: true, title: t(playing ? 'speech.pause' : 'speech.play'), onClick: () => {
        if (reader.state === 'playing') reader.pause();
        else if (reader.state === 'paused') reader.resume();
        else reader.play(caretParagraph());
      } }),
      btn('', { icon: 'stop', small: true, kind: 'ghost', title: t('speech.stop'), onClick: stopSpeech }),
      h('span.speech-text', reader.state === 'idle' ? t('speech.ready') : t('speech.reading', { n: reader.index + 1, m: reader.total })),
      rate, voice,
    ].filter(Boolean));
  };
  const toggleSpeech = () => {
    if (!speechAvailable()) { toast(t('speech.unavailable'), 'info', 6000); return; }
    if (!speechBar.hidden) { stopSpeech(); return; }
    if (!reader) {
      reader = createReader({
        lang,
        getParagraphs: () => blocksNow().map((b) => b.textContent),
        onState: () => { if (!speechBar.hidden) drawSpeech(); },
        onParagraph: (i) => {
          const block = i >= 0 ? blocksNow()[i] : null;
          if (!block) { clearMarks('speech-now'); return; }
          if (canHighlight) { const r = document.createRange(); r.selectNodeContents(block); CSS.highlights.set('speech-now', new Highlight(r)); }
          const rect = block.getBoundingClientRect();
          if (rect.top < 90 || rect.bottom > window.innerHeight - 60) block.scrollIntoView({ block: 'center', behavior: 'smooth' });
          drawSpeech();
        },
      });
      // Las voces pueden tardar en estar disponibles.
      if (speechAvailable()) window.speechSynthesis.addEventListener('voiceschanged', () => { if (!speechBar.hidden) drawSpeech(); });
    }
    speechBar.hidden = false;
    drawSpeech();
    reader.play(caretParagraph());
  };

  return {
    pane, speechBar, toggleSplit, toggleStyle, toggleSpeech, refreshStyle,
    get mode() { return mode; },
    close() { stopSpeech(); clearMarks('style-hit'); },
  };
}
