// Editor de texto enriquecido (contenteditable) con barra de herramientas, contador,
// buscar y reemplazar, tipografía automática y modo sin distracciones.
import { h, icon } from './dom.js';
import { t, tn } from './i18n.js';
import { sanitizeHtml, htmlToText, textToHtml, countWords, countChars, findRanges } from './text.js';
import { getPrefs } from './prefs.js';

const HIGHLIGHT_COLOR = '#ffe58a';
const SMART_RULES = [['--', '—'], ['...', '…'], ['<<', '«'], ['>>', '»']];
const canHighlight = typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && !!CSS.highlights;

/**
 * opts: { value, onChange(html, {words, chars}), onSave(), placeholder, toolbar: 'basic' | 'full', lang }
 * Devuelve { el, getHTML, setHTML, focus, flush, destroy }.
 */
export function createEditor(opts = {}) {
  const { value = '', onChange, onSave, placeholder = '', toolbar = 'basic', lang, onTodo, onMarkClick } = opts;
  const prefs = getPrefs();
  const full = toolbar === 'full';

  const area = h('div.editor-area', {
    contenteditable: 'true', spellcheck: prefs.spellcheck ? 'true' : 'false', lang: lang || null,
    'data-placeholder': placeholder, role: 'textbox', 'aria-multiline': 'true', 'aria-label': placeholder || t('editor.text'),
  });
  const statsEl = h('span.editor-stats');
  const bar = h('div.editor-toolbar', { role: 'toolbar' });
  const findBar = h('div.editor-find', { hidden: true });
  // El recuento va en un pie propio: así la barra de herramientas no cambia de alto ni se descoloca.
  const root = h('div', { class: 'editor' + (full ? ' editor-full' : '') }, bar, findBar, h('div.editor-scroll', area), h('div.editor-status', statsEl));

  let timer = null;
  let lastHtml = null;
  const stateTools = [];

  // ---------- Contenido ----------

  const isEmpty = () => area.textContent.trim() === '';
  const getHTML = () => (isEmpty() ? '' : area.innerHTML);
  const stats = () => {
    const text = htmlToText(area.innerHTML);
    return { words: countWords(text), chars: countChars(text) };
  };
  const drawStats = (s) => {
    statsEl.textContent = `${tn('editor.words', s.words)} · ${tn('editor.chars', s.chars)}`;
  };
  const setHTML = (html) => {
    area.innerHTML = sanitizeHtml(html, { keepTodos: !!onTodo }) || '<p><br></p>';
    lastHtml = getHTML();
    area.classList.toggle('is-empty', isEmpty());
    drawStats(stats());
  };

  const emit = () => {
    clearTimeout(timer);
    timer = null;
    const html = getHTML();
    if (html === lastHtml) return;
    lastHtml = html;
    const s = stats();
    drawStats(s);
    if (onChange) onChange(html, s);
  };
  const emitSoon = () => {
    area.classList.toggle('is-empty', isEmpty());
    clearTimeout(timer);
    timer = setTimeout(emit, 300);
  };

  // ---------- Barra de herramientas ----------

  const exec = (cmd, val = null) => {
    area.focus();
    document.execCommand(cmd, false, val);
    emitSoon();
    updateActive();
  };
  const tool = (content, title, fn, stateCmd) => {
    const b = h('button.tool', { type: 'button', title, 'aria-label': title, onmousedown: (e) => e.preventDefault(), onclick: fn }, content);
    bar.append(b);
    if (stateCmd) stateTools.push([b, stateCmd]);
    return b;
  };
  const sep = () => bar.append(h('span.tool-sep'));
  const queryState = (cmd) => {
    try { return document.queryCommandState(cmd); } catch (e) { return false; }
  };
  const selectionInside = () => {
    const sel = window.getSelection();
    return sel && sel.rangeCount && area.contains(sel.anchorNode);
  };
  const updateActive = () => {
    if (!selectionInside()) return;
    for (const [b, cmd] of stateTools) b.classList.toggle('active', queryState(cmd));
  };

  const toggleHighlight = () => {
    area.focus();
    let current = '';
    try { current = String(document.queryCommandValue('backColor') || ''); } catch (e) { current = ''; }
    const isOn = /255,\s*229,\s*138/.test(current) || current.toLowerCase() === HIGHLIGHT_COLOR;
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('hiliteColor', false, isOn ? 'transparent' : HIGHLIGHT_COLOR);
    document.execCommand('styleWithCSS', false, false);
    emitSoon();
  };

  tool(icon('undo', 16), t('editor.undo'), () => exec('undo'));
  tool(icon('redo', 16), t('editor.redo'), () => exec('redo'));
  sep();
  tool(h('b', 'B'), t('editor.bold'), () => exec('bold'), 'bold');
  tool(h('i', 'I'), t('editor.italic'), () => exec('italic'), 'italic');
  tool(h('u', 'U'), t('editor.underline'), () => exec('underline'), 'underline');
  tool(h('s', 'S'), t('editor.strike'), () => exec('strikeThrough'), 'strikeThrough');
  tool(icon('highlighter', 16), t('editor.highlight'), toggleHighlight);
  sep();
  tool(icon('align-left', 16), t('editor.alignLeft'), () => exec('justifyLeft'), 'justifyLeft');
  tool(icon('align-center', 16), t('editor.alignCenter'), () => exec('justifyCenter'), 'justifyCenter');
  tool(icon('align-right', 16), t('editor.alignRight'), () => exec('justifyRight'), 'justifyRight');
  tool(icon('align-justify', 16), t('editor.alignJustify'), () => exec('justifyFull'), 'justifyFull');
  sep();
  tool(icon('list', 16), t('editor.bullets'), () => exec('insertUnorderedList'), 'insertUnorderedList');
  tool(icon('list-ol', 16), t('editor.numbers'), () => exec('insertOrderedList'), 'insertOrderedList');
  tool(icon('eraser', 16), t('editor.clearFormat'), () => exec('removeFormat'));
  sep();
  // Puntuación de diálogo: la raya, y comillas que envuelven la selección (o dejan el cursor dentro).
  const insertText = (text) => {
    area.focus();
    document.execCommand('insertText', false, text);
    emitSoon();
  };
  const wrapQuotes = (open, close) => {
    area.focus();
    const sel = window.getSelection();
    const selected = selectionInside() && !sel.isCollapsed ? String(sel) : '';
    if (selected && !selected.includes('\n')) {
      document.execCommand('insertText', false, open + selected + close);
    } else {
      document.execCommand('insertText', false, open + close);
      try { window.getSelection().modify('move', 'backward', 'character'); } catch (e) { /* el cursor queda tras las comillas */ }
    }
    emitSoon();
  };
  tool(h('span.tool-glyph', '—'), t('editor.dash'), () => insertText('—'));
  tool(h('span.tool-glyph', '«»'), t('editor.quotesAngle'), () => wrapQuotes('«', '»'));
  tool(h('span.tool-glyph', '“”'), t('editor.quotesCurly'), () => wrapQuotes('“', '”'));
  sep();
  tool(icon('search', 16), t('editor.findReplace'), () => toggleFind(findBar.hidden));
  if (onTodo) tool(icon('flag', 16), t('tasks.mark'), () => onTodo());
  if (full) tool(icon('maximize', 16), t('editor.focusMode'), () => setFullscreen(!root.classList.contains('is-fullscreen')));

  // ---------- Modo sin distracciones ----------

  const setFullscreen = (on) => {
    root.classList.toggle('is-fullscreen', on);
    document.documentElement.classList.toggle('editor-fs', on);
    area.focus();
    if (on) centerCaret();
  };

  // En el modo sin distracciones la línea que se escribe se mantiene a media altura de la
  // pantalla (como en una máquina de escribir): el texto sube, la vista no baja.
  const centerCaret = () => {
    if (!root.classList.contains('is-fullscreen') || !selectionInside()) return;
    const sel = window.getSelection();
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    let rect = range.getClientRects()[0];
    if (!rect) {
      // En una línea vacía el cursor no tiene caja: se usa la del párrafo.
      const node = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      rect = node && node.getBoundingClientRect ? node.getBoundingClientRect() : null;
    }
    if (!rect) return;
    const target = root.clientHeight * 0.42;
    if (Math.abs(rect.top - target) > 24) root.scrollTop += rect.top - target;
  };

  // ---------- Buscar y reemplazar ----------

  let ranges = [];
  let cur = -1;
  const findInput = h('input.input', { type: 'search', placeholder: t('editor.find'), 'aria-label': t('editor.find') });
  const replInput = h('input.input', { type: 'text', placeholder: t('editor.replaceWith'), 'aria-label': t('editor.replaceWith') });
  const caseBox = h('input', { type: 'checkbox' });
  const countEl = h('span.find-count');

  const clearPaint = () => {
    if (!canHighlight) return;
    CSS.highlights.delete('creabel-find');
    CSS.highlights.delete('creabel-find-current');
  };
  const paint = () => {
    countEl.textContent = ranges.length ? `${cur + 1}/${ranges.length}` : (findInput.value ? '0/0' : '');
    clearPaint();
    if (!canHighlight || !ranges.length) return;
    CSS.highlights.set('creabel-find', new Highlight(...ranges));
    if (cur >= 0) CSS.highlights.set('creabel-find-current', new Highlight(ranges[cur]));
  };
  const reveal = () => {
    if (cur < 0) return;
    const r = ranges[cur];
    const parent = r.startContainer.parentElement;
    if (parent) parent.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (!canHighlight) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r.cloneRange());
    }
  };
  const doFind = (keepIndex) => {
    ranges = findRanges(area, findInput.value, { caseSensitive: caseBox.checked });
    cur = ranges.length ? Math.min(Math.max(keepIndex ? cur : 0, 0), ranges.length - 1) : -1;
    paint();
    reveal();
  };
  const step = (delta) => {
    if (!ranges.length) return;
    cur = (cur + delta + ranges.length) % ranges.length;
    paint();
    reveal();
  };
  const replaceRange = (r) => {
    r.deleteContents();
    if (replInput.value) r.insertNode(document.createTextNode(replInput.value));
  };
  const replaceOne = () => {
    if (cur < 0) return;
    replaceRange(ranges[cur]);
    area.normalize();
    emitSoon();
    doFind(true);
  };
  const replaceAll = () => {
    if (!ranges.length) return;
    for (let i = ranges.length - 1; i >= 0; i--) replaceRange(ranges[i]);
    area.normalize();
    emitSoon();
    doFind(false);
  };
  const toggleFind = (show, focusReplace) => {
    findBar.hidden = !show;
    if (!show) {
      ranges = [];
      cur = -1;
      clearPaint();
      area.focus();
      return;
    }
    const selected = selectionInside() ? String(window.getSelection()) : '';
    if (selected && !selected.includes('\n')) findInput.value = selected;
    (focusReplace ? replInput : findInput).focus();
    findInput.select();
    doFind(false);
  };

  const findBtn = (label, title, fn) => h('button.btn.btn-sm', { type: 'button', title, onclick: fn }, label);
  findInput.addEventListener('input', () => doFind(false));
  caseBox.addEventListener('change', () => doFind(false));
  findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); }
  });
  replInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); replaceOne(); }
  });
  findBar.append(
    h('div.find-row', findInput, countEl,
      findBtn(icon('chevron-left', 14), t('editor.previous'), () => step(-1)),
      findBtn(icon('chevron-right', 14), t('editor.next'), () => step(1)),
      h('label.form-check.find-case', caseBox, h('span', t('editor.matchCase')))),
    h('div.find-row', replInput,
      findBtn(t('editor.replace'), t('editor.replace'), replaceOne),
      findBtn(t('editor.replaceAll'), t('editor.replaceAll'), replaceAll),
      findBtn(icon('x', 14), t('common.close'), () => toggleFind(false))));

  // ---------- Marcas de pendientes ----------
  // Una marca es <span class="todo" data-todo="idDelPendiente"> alrededor de un fragmento.

  const blockOf = (node) => {
    let n = node.nodeType === 3 ? node.parentNode : node;
    while (n && n !== area && !/^(P|LI|DIV|H1|H2|H3|BLOCKQUOTE)$/.test(n.tagName)) n = n.parentNode;
    return n && n !== area ? n : null;
  };
  const marksOf = (id) => [...area.querySelectorAll('span[data-todo]')].filter((s) => s.getAttribute('data-todo') === id);

  /**
   * Recoge el fragmento seleccionado (o la palabra bajo el cursor) para marcarlo después.
   * Devuelve { text, apply(id) } o null si no hay texto que marcar.
   */
  const captureSelection = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !area.contains(sel.anchorNode)) return null;
    if (sel.isCollapsed) {
      try {
        sel.modify('move', 'backward', 'word');
        sel.modify('extend', 'forward', 'word');
      } catch (e) { /* navegador sin Selection.modify: no se marca texto */ }
    }
    const range = sel.getRangeAt(0).cloneRange();
    if (range.collapsed || !range.toString().trim()) return null;
    // Una marca no cruza párrafos: si la selección lo hace, se queda en el primero.
    const block = blockOf(range.startContainer);
    if (block && !block.contains(range.endContainer)) range.setEnd(block, block.childNodes.length);
    // Sin los espacios finales (al seleccionar una palabra el navegador suele incluir el siguiente).
    while (range.endContainer.nodeType === 3 && range.endOffset > 0 && /\s/.test(range.endContainer.data[range.endOffset - 1])
      && !(range.endContainer === range.startContainer && range.endOffset - 1 <= range.startOffset)) {
      range.setEnd(range.endContainer, range.endOffset - 1);
    }
    return {
      text: range.toString().trim(),
      apply(id) {
        const span = document.createElement('span');
        span.className = 'todo';
        span.setAttribute('data-todo', id);
        span.append(range.extractContents());
        range.insertNode(span);
        area.normalize();
        emit();
      },
    };
  };

  const removeMark = (id) => {
    const marks = marksOf(id);
    for (const span of marks) span.replaceWith(...span.childNodes);
    if (marks.length) {
      area.normalize();
      emit();
    }
  };

  const focusMark = (id) => {
    const span = marksOf(id)[0];
    if (!span) return false;
    span.scrollIntoView({ block: 'center', behavior: 'smooth' });
    span.classList.add('todo-flash');
    setTimeout(() => span.classList.remove('todo-flash'), 1800);
    return true;
  };

  area.addEventListener('click', (e) => {
    const span = e.target.closest ? e.target.closest('span[data-todo]') : null;
    if (span && onMarkClick) onMarkClick(span.getAttribute('data-todo'));
  });

  // ---------- Eventos de edición ----------

  const placeCaret = (node, offset) => {
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStart(node, offset);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  };

  const smartReplace = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !sel.isCollapsed) return;
    const node = sel.anchorNode;
    const off = sel.anchorOffset;
    if (!node || node.nodeType !== 3) return;
    const before = node.data.slice(0, off);
    for (const [pattern, replacement] of SMART_RULES) {
      if (before.endsWith(pattern)) {
        node.replaceData(off - pattern.length, pattern.length, replacement);
        sel.collapse(node, off - pattern.length + replacement.length);
        break;
      }
    }
  };

  area.addEventListener('input', (e) => {
    // El contenido siempre debe estar dentro de párrafos.
    if (!area.firstChild) {
      area.innerHTML = '<p><br></p>';
      placeCaret(area.firstChild, 0);
    } else if ([...area.childNodes].some((n) => n.nodeType === 3 && n.data.trim())) {
      document.execCommand('formatBlock', false, 'p');
    }
    if (getPrefs().smartTypography && e.inputType === 'insertText') smartReplace();
    emitSoon();
    centerCaret();
  });
  area.addEventListener('keyup', (e) => { if (/^(Arrow|Page|Home|End)/.test(e.key)) centerCaret(); });
  area.addEventListener('click', centerCaret);

  area.addEventListener('paste', (e) => {
    e.preventDefault();
    const data = e.clipboardData;
    if (!data) return;
    const html = data.getData('text/html');
    const text = data.getData('text/plain');
    if (html) {
      const clean = sanitizeHtml(html);
      if (clean) document.execCommand('insertHTML', false, clean);
    } else if (text) {
      if (/\n/.test(text.trim())) document.execCommand('insertHTML', false, textToHtml(text.trim()));
      else document.execCommand('insertText', false, text);
    }
    emitSoon();
  });

  area.addEventListener('blur', () => { if (timer) emit(); });

  root.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && key === 'f') { e.preventDefault(); toggleFind(true); }
    else if (mod && key === 'h') { e.preventDefault(); toggleFind(true, true); }
    else if (mod && key === 's') { e.preventDefault(); emit(); if (onSave) onSave(); }
    else if (e.key === 'Escape') {
      if (!findBar.hidden) { e.stopPropagation(); toggleFind(false); }
      else if (root.classList.contains('is-fullscreen')) { e.stopPropagation(); setFullscreen(false); }
    }
  });

  // Dónde está el cursor, contado en letras desde el principio del texto: para volver a ese
  // punto al regresar a la escena (el botón «↩» de la barra de arriba en el móvil).
  let lastCaret = null;
  const offsetOf = (node, offset) => {
    const r = document.createRange();
    r.selectNodeContents(area);
    r.setEnd(node, offset);
    return r.toString().length;
  };
  const onSelection = () => {
    updateActive();
    const sel = window.getSelection();
    if (sel && sel.rangeCount && area.contains(sel.focusNode)) {
      try { lastCaret = offsetOf(sel.focusNode, sel.focusOffset); } catch (e) { /* posición no válida */ }
    }
  };
  document.addEventListener('selectionchange', onSelection);

  /** Pone el cursor en esa posición (en letras desde el principio) y la deja a la vista. */
  const setCaret = (pos) => {
    const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
    let left = Math.max(0, Number(pos) || 0);
    let last = null;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      last = node;
      if (left <= node.data.length) break;
      left -= node.data.length;
    }
    area.focus({ preventScroll: true });
    if (!last) return;
    placeCaret(last, Math.min(left, last.data.length));
    const el = last.parentElement;
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
    centerCaret();
  };

  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* no admitido: se corrige en 'input' */ }
  setHTML(value);

  return {
    el: root,
    /** La zona de texto, para quien necesite leerla o señalar partes (estilo, lectura en voz alta). */
    area,
    /** Añade un botón a la barra de herramientas (antes del de pantalla completa). Devuelve el botón. */
    addTool(iconName, title, fn) {
      const last = bar.lastElementChild;
      const b = tool(icon(iconName, 16), title, fn);
      if (full && last) bar.insertBefore(b, last);
      return b;
    },
    getHTML,
    setHTML,
    focus: () => area.focus(),
    /** La última posición del cursor dentro del texto (o null si no se ha puesto nunca). */
    getCaret: () => lastCaret,
    setCaret,
    flush: () => { if (timer) emit(); },
    captureSelection,
    removeMark,
    focusMark,
    destroy() {
      clearTimeout(timer);
      timer = null;
      clearPaint();
      document.removeEventListener('selectionchange', onSelection);
      if (root.classList.contains('is-fullscreen')) setFullscreen(false);
    },
  };
}
