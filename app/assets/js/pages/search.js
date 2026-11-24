// Búsqueda en todo el proyecto, con casillas para acotar dónde se busca, y reemplazo
// en el texto de las escenas.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { htmlToText, replaceInHtml, textStats, escapeHtml } from '../text.js';
import { btn, pageHeader, confirmDialog, toast, errorText } from '../ui.js';
import { allScenesOrdered, chapterNumbers, chapterLabel, displayName, entityHref, entityLabel } from '../model.js';

const SKIP_KEYS = new Set(['kind', 'key', 'mode', 'type', 'color', 'time', 'deadline', 'activeRevision', 'profileImage', 'nodes', 'traitsHidden', 'resolvedAt']);
const TYPE_ORDER = ['scene', 'chapter', 'part', 'architecture', 'strand', 'character', 'location', 'object', 'group', 'custom', 'plan', 'note', 'term', 'reference', 'task', 'mindmap', 'event', 'secret'];

// Ámbitos de búsqueda y a cuál pertenece cada tipo de elemento. Una escena reparte su
// contenido entre dos: el título va a «structure» y el texto a «text».
const SCOPES = ['text', 'structure', 'characters', 'world', 'notes', 'library', 'tasks'];
const SCOPE_OF = {
  chapter: 'structure', part: 'structure',
  character: 'characters',
  location: 'world', object: 'world', group: 'world', mindmap: 'world', event: 'world', custom: 'world', plan: 'world',
  architecture: 'notes', strand: 'notes', note: 'notes', term: 'notes',
  reference: 'library',
  task: 'tasks',
};
const SCOPE_KEY = 'creabel.searchScope';

function loadScope() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCOPE_KEY) || 'null');
    if (Array.isArray(saved)) return new Set(saved.filter((s) => SCOPES.includes(s)));
  } catch (e) { /* sin almacenamiento local: se busca en todo */ }
  return new Set(SCOPES);
}

/** Recoge todos los textos escritos por el usuario dentro de un objeto de datos. */
function collectStrings(value, out, key) {
  if (typeof value === 'string') {
    if (SKIP_KEYS.has(key) || !value.trim() || /^[a-z0-9]{16}$/.test(value)) return;
    out.push(value.includes('<') ? htmlToText(value) : value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out, key);
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (!SKIP_KEYS.has(k)) collectStrings(v, out, k);
    }
  }
}

function findAll(text, query, { caseSensitive, wholeWord }) {
  const hay = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const isWord = (ch) => ch !== undefined && /[\p{L}\p{N}_]/u.test(ch);
  const hits = [];
  let i = 0;
  while ((i = hay.indexOf(needle, i)) !== -1) {
    const end = i + needle.length;
    if (!wholeWord || (!isWord(text[i - 1]) && !isWord(text[end]))) hits.push(i);
    i = end;
  }
  return hits;
}

/** Reemplaza en un texto sin formato. Devuelve [textoNuevo, cuántos]. */
function replacePlain(text, query, replacement, o) {
  const hits = findAll(text, query, o);
  let out = text;
  for (let i = hits.length - 1; i >= 0; i--) out = out.slice(0, hits[i]) + replacement + out.slice(hits[i] + query.length);
  return [out, hits.length];
}

/**
 * Reemplaza dentro de un valor de datos recorriéndolo igual que collectStrings: los mismos
 * textos que entran en la búsqueda son los que se pueden cambiar (y ninguno más: ni
 * identificadores, ni colores, ni fechas). Devuelve [valorNuevo, cuántos].
 */
function replaceInData(value, key, query, replacement, o) {
  if (typeof value === 'string') {
    if (SKIP_KEYS.has(key) || !value.trim() || /^[a-z0-9]{16}$/.test(value)) return [value, 0];
    if (value.includes('<')) {
      const out = replaceInHtml(value, query, replacement, o);
      return [out.count ? out.html : value, out.count];
    }
    return replacePlain(value, query, replacement, o);
  }
  if (Array.isArray(value)) {
    let count = 0;
    const out = value.map((v) => {
      const [next, n] = replaceInData(v, key, query, replacement, o);
      count += n;
      return next;
    });
    return [count ? out : value, count];
  }
  if (value && typeof value === 'object') {
    let count = 0;
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const [next, n] = SKIP_KEYS.has(k) ? [v, 0] : replaceInData(v, k, query, replacement, o);
      out[k] = next;
      count += n;
    }
    return [count ? out : value, count];
  }
  return [value, 0];
}

function snippet(text, pos, len) {
  const start = Math.max(0, pos - 70);
  const end = Math.min(text.length, pos + len + 90);
  const clean = (s) => escapeHtml(s.replace(/\s+/g, ' '));
  return (start > 0 ? '…' : '') + clean(text.slice(start, pos)) + '<mark>' + clean(text.slice(pos, pos + len)) + '</mark>' + clean(text.slice(pos + len, end)) + (end < text.length ? '…' : '');
}

export async function searchPage({ el, query }) {
  const input = h('input.input.search-input', { type: 'search', placeholder: t('search.placeholder'), 'aria-label': t('search.placeholder') });
  input.value = query.q || '';
  const replaceInput = h('input.input', { type: 'text', placeholder: t('editor.replaceWith'), 'aria-label': t('editor.replaceWith') });
  const caseBox = h('input', { type: 'checkbox' });
  const wordBox = h('input', { type: 'checkbox' });
  const results = h('div.search-results');
  const scope = loadScope();
  let texts = null;

  const opts = () => ({ caseSensitive: caseBox.checked, wholeWord: wordBox.checked });
  const sceneTexts = async () => {
    if (!texts) texts = await store.sceneTexts();
    return texts;
  };

  const resultLabel = (e, numbers) => {
    switch (e.type) {
      case 'scene': {
        const chapter = store.get(e.parent_id);
        return `${chapter ? chapterLabel(chapter, numbers) + ' › ' : ''}${displayName(e)}`;
      }
      case 'chapter': return chapterLabel(e, numbers);
      case 'architecture': return t('arch.' + e.data.key);
      case 'part': return `${t('chapters.part')}: ${displayName(e)}`;
      default: return `${t(e.type + '.singular')}: ${entityLabel(e)}`;
    }
  };

  /** Textos de un elemento que entran en la búsqueda según las casillas marcadas. */
  const searchable = async (e) => {
    const parts = [];
    if (e.type === 'scene') {
      if (scope.has('structure') && e.name) parts.push(e.name);
      if (scope.has('text')) parts.push(htmlToText((await sceneTexts()).get(e.id) || ''));
      return parts;
    }
    if (!scope.has(SCOPE_OF[e.type] || 'notes')) return parts;
    if (e.type !== 'architecture' && e.name) parts.push(e.name);
    if (e.body) parts.push(htmlToText(e.body));
    collectStrings(e.data, parts);
    return parts;
  };

  // Cada búsqueda lleva un número: si mientras se calcula se lanza otra (por ejemplo al
  // marcar varias casillas seguidas), la antigua se descarta en lugar de pintar duplicados.
  let runId = 0;
  const run = async () => {
    const mine = ++runId;
    const q = input.value.trim();
    if (q.length < 2) {
      clear(results).append(h('p.muted.empty-line', t('search.hint')));
      return;
    }
    if (!scope.size) {
      clear(results).append(h('p.muted.empty-line', t('search.noScope')));
      return;
    }
    const numbers = chapterNumbers();
    const sceneOrder = new Map(allScenesOrdered().map((s, i) => [s.id, i]));
    const found = [];
    for (const e of store.entities.values()) {
      if (e.type === 'revision' || e.type === 'session') continue;
      const text = (await searchable(e)).filter(Boolean).join('\n');
      if (!text) continue;
      const hits = findAll(text, q, opts());
      if (hits.length) found.push({ e, text, hits });
    }
    found.sort((a, b) => {
      const ta = TYPE_ORDER.indexOf(a.e.type);
      const tb = TYPE_ORDER.indexOf(b.e.type);
      if (ta !== tb) return ta - tb;
      if (a.e.type === 'scene') return (sceneOrder.get(a.e.id) || 0) - (sceneOrder.get(b.e.id) || 0);
      return a.e.position - b.e.position;
    });
    if (mine !== runId) return;
    clear(results);
    const total = found.reduce((sum, f) => sum + f.hits.length, 0);
    results.append(h('p.totals', found.length ? t('search.summary', { n: total, m: found.length }) : t('search.none')));
    for (const f of found) {
      results.append(h('a.search-result', { href: entityHref(f.e) },
        h('div.search-result-head', h('strong', resultLabel(f.e, numbers)), h('span.badge', tn('search.matches', f.hits.length))),
        f.hits.slice(0, 3).map((pos) => h('p.search-snippet', { html: snippet(f.text, pos, q.length) }))));
    }
  };

  /**
   * Cambios que haría el reemplazo, sin aplicarlos todavía: [{ id, patch, count }]. Actúa
   * sobre los mismos ámbitos marcados para la búsqueda: el texto de las escenas (su revisión
   * en uso), los títulos, y el nombre, la descripción y los campos de fichas, notas,
   * documentación, pendientes, eventos y mapas.
   */
  const planReplace = async (q, replacement) => {
    const o = opts();
    const changes = [];
    const all = scope.has('text') ? await sceneTexts() : null;
    for (const e of store.entities.values()) {
      if (e.type === 'revision' || e.type === 'session') continue;
      if (e.type === 'scene') {
        if (scope.has('structure') && e.name) {
          const [name, n] = replacePlain(e.name, q, replacement, o);
          if (n) changes.push({ id: e.id, patch: { name }, count: n });
        }
        const html = all ? all.get(e.id) || '' : '';
        const out = html ? replaceInHtml(html, q, replacement, o) : { count: 0 };
        if (out.count) {
          const revs = store.list('revision', e.id);
          const active = revs.find((r) => r.id === e.data.activeRevision) || revs[revs.length - 1];
          if (active) {
            const stats = textStats(out.html);
            changes.push({ id: active.id, patch: { body: out.html, words: stats.words, chars: stats.chars }, count: out.count });
            changes.push({ id: e.id, patch: { words: stats.words, chars: stats.chars }, count: 0 });
          }
        }
        continue;
      }
      if (!scope.has(SCOPE_OF[e.type] || 'notes')) continue;
      const patch = {};
      let count = 0;
      if (e.type !== 'architecture' && e.name) {
        const [name, n] = replacePlain(e.name, q, replacement, o);
        if (n) { patch.name = name; count += n; }
      }
      if (e.body) {
        const out = replaceInHtml(e.body, q, replacement, o);
        if (out.count) {
          patch.body = out.html;
          count += out.count;
          // Los apartados de arquitectura llevan recuento de palabras.
          if (e.type === 'architecture' || e.words) Object.assign(patch, textStats(out.html));
        }
      }
      const [data, n] = replaceInData(e.data, undefined, q, replacement, o);
      if (n) { patch.data = data; count += n; }
      if (count) changes.push({ id: e.id, patch, count });
    }
    return changes;
  };

  const replaceAll = async () => {
    const q = input.value.trim();
    if (q.length < 2) return;
    if (!scope.size) {
      toast(t('search.noScope'), 'info');
      return;
    }
    const changes = await planReplace(q, replaceInput.value);
    const total = changes.reduce((sum, c) => sum + c.count, 0);
    if (!total) {
      toast(t('search.nothingToReplace'), 'info');
      return;
    }
    const where = new Set(changes.filter((c) => c.count).map((c) => c.id)).size;
    if (!(await confirmDialog(t('search.confirmReplace', { n: total, m: where, a: q, b: replaceInput.value }), { confirmLabel: t('editor.replaceAll'), danger: true }))) return;
    try {
      for (const c of changes) store.update(c.id, c.patch);
      await store.flush();
      store.logWordsSoon();
      texts = null;
      toast(tn('search.replaced', total), 'success');
      await run();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  // Casillas de ámbito: dónde se busca. La elección se recuerda.
  const scopeRow = h('div.filter-row.scope-row', h('span.form-label', t('search.scope')), SCOPES.map((key) => {
    const box = h('input', { type: 'checkbox' });
    box.checked = scope.has(key);
    box.addEventListener('change', () => {
      if (box.checked) scope.add(key);
      else scope.delete(key);
      try { localStorage.setItem(SCOPE_KEY, JSON.stringify([...scope])); } catch (e) { /* no es crítico */ }
      if (input.value.trim().length >= 2) run();
    });
    return h('label.filter-chip', box, h('span', t('search.scope.' + key)));
  }));

  const form = h('form.search-form', { onsubmit: (e) => { e.preventDefault(); run(); } },
    h('div.search-row', input, btn(t('nav.search'), { icon: 'search', kind: 'primary', type: 'submit' })),
    scopeRow,
    h('div.filter-row',
      h('label.form-check', caseBox, h('span', t('editor.matchCase'))),
      h('label.form-check', wordBox, h('span', t('search.wholeWord')))),
    h('details.search-replace',
      h('summary', t('search.replaceTitle')),
      h('p.muted', t('search.replaceHint')),
      h('div.search-row', replaceInput, btn(t('editor.replaceAll'), { icon: 'edit', onClick: replaceAll }))));

  clear(el);
  el.append(pageHeader({ title: t('nav.search'), subtitle: t('search.subtitle') }), h('div.narrow.wide', form, results));
  results.append(h('p.muted.empty-line', t('search.hint')));
  input.focus();
  if (input.value) run();
}
