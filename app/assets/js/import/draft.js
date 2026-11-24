// Importación de un borrador escrito fuera de Creabel (DOCX u ODT): extrae los párrafos con
// su formato básico y los reparte en capítulos y escenas.
import { openZip } from './unzip.js';
import { escapeHtml, countWords, countChars } from '../text.js';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const ODT_TEXT = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0';
const ODT_STYLE = 'urn:oasis:names:tc:opendocument:xmlns:style:1.0';
const ODT_FO = 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0';

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('bad-xml');
  return doc;
}

/** Junta tramos de texto con formato en HTML: [{ text, b, i, u, s }] -> '<b>…</b>…' */
function runsToHtml(runs) {
  let out = '';
  for (const r of runs) {
    if (!r.text) continue;
    let html = escapeHtml(r.text).replace(/\n/g, '<br>');
    if (r.s) html = `<s>${html}</s>`;
    if (r.u) html = `<u>${html}</u>`;
    if (r.i) html = `<i>${html}</i>`;
    if (r.b) html = `<b>${html}</b>`;
    out += html;
  }
  // Tramos contiguos con el mismo formato: se funden las etiquetas repetidas.
  for (let pass = 0; pass < 4; pass++) {
    const merged = out.replace(/<\/(b|i|u|s)><\1>/g, '');
    if (merged === out) break;
    out = merged;
  }
  return out;
}

function paragraph(runs, extra) {
  const text = runs.map((r) => r.text).join('').replace(/\s+/g, ' ').trim();
  const align = extra.align === 'center' || extra.align === 'right' ? ` style="text-align:${extra.align}"` : '';
  return { text, html: text ? `<p${align}>${runsToHtml(runs)}</p>` : '', level: extra.level || 0, pageBreak: !!extra.pageBreak, skip: !!extra.skip };
}

// ---------- DOCX ----------

const wAttr = (el, name) => (el ? el.getAttributeNS(W, name) || el.getAttribute('w:' + name) : null);
const wChild = (el, name) => {
  if (!el) return null;
  for (const c of el.children) if (c.localName === name) return c;
  return null;
};
const wOn = (el) => !!el && !/^(0|false|none)$/i.test(wAttr(el, 'val') || '');

/** Nivel de título (1…) a partir del nombre de un estilo: «heading 2», «Título 2», «Titre 2»… */
function headingLevel(name) {
  const m = /^(?:heading|t[ií]tulo|titre|titolo|überschrift|ueberschrift|encabezado|cap[çc]alera|kop)\s*(\d)$/i.exec((name || '').trim());
  return m ? Number(m[1]) : 0;
}

function docxStyles(doc) {
  const styles = new Map();
  if (!doc) return styles;
  for (const st of doc.getElementsByTagNameNS(W, 'style')) {
    const id = wAttr(st, 'styleId');
    const name = wAttr(wChild(st, 'name'), 'val') || '';
    const outline = wChild(wChild(st, 'pPr'), 'outlineLvl');
    let level = headingLevel(name) || headingLevel(id);
    if (!level && outline && Number(wAttr(outline, 'val')) < 6) level = Number(wAttr(outline, 'val')) + 1;
    styles.set(id, { level, title: /^(title|t[ií]tulo|subtitle|subt[ií]tulo|titre|sous-titre)$/i.test(name.trim()), based: wAttr(wChild(st, 'basedOn'), 'val') });
  }
  // Un estilo basado en un título hereda su nivel.
  for (const st of styles.values()) {
    let base = st;
    for (let hop = 0; hop < 6 && !st.level && base && base.based; hop++) {
      base = styles.get(base.based);
      if (base && base.level) st.level = base.level;
    }
  }
  return styles;
}

async function readDocx(zip) {
  const xml = await zip.text('word/document.xml');
  if (!xml) throw new Error('not-docx');
  const stylesXml = await zip.text('word/styles.xml');
  const styles = docxStyles(stylesXml ? parseXml(stylesXml) : null);
  const doc = parseXml(xml);
  const out = [];
  let breakNext = false;

  for (const p of doc.getElementsByTagNameNS(W, 'p')) {
    const pPr = wChild(p, 'pPr');
    const style = styles.get(wAttr(wChild(pPr, 'pStyle'), 'val')) || {};
    let level = style.level || 0;
    const outline = wChild(pPr, 'outlineLvl');
    if (outline && Number(wAttr(outline, 'val')) < 6) level = Number(wAttr(outline, 'val')) + 1;
    let pageBreak = breakNext || wOn(wChild(pPr, 'pageBreakBefore'));
    breakNext = false;
    const runs = [];
    const walk = (node) => {
      for (const c of node.children) {
        const name = c.localName;
        if (name === 'pPr' || name === 'del' || name === 'moveFrom') continue; // formato y texto eliminado (control de cambios)
        if (name !== 'r') { walk(c); continue; }
        const rPr = wChild(c, 'rPr');
        const fmt = { b: wOn(wChild(rPr, 'b')), i: wOn(wChild(rPr, 'i')), u: wOn(wChild(rPr, 'u')), s: wOn(wChild(rPr, 'strike')) };
        for (const part of c.children) {
          switch (part.localName) {
            case 't': runs.push({ text: part.textContent, ...fmt }); break;
            case 'tab': runs.push({ text: ' ', ...fmt }); break;
            case 'noBreakHyphen': runs.push({ text: '-', ...fmt }); break;
            case 'br':
              // Un salto de página al principio del párrafo le afecta a él; después, al siguiente.
              if (wAttr(part, 'type') === 'page') { if (runs.some((r) => r.text.trim())) breakNext = true; else pageBreak = true; }
              else runs.push({ text: '\n', ...fmt });
              break;
            default: break;
          }
        }
      }
    };
    walk(p);
    out.push(paragraph(runs, { level, pageBreak, align: wAttr(wChild(pPr, 'jc'), 'val'), skip: style.title }));
  }
  return out;
}

// ---------- ODT ----------

function odtStyles(docs) {
  const styles = new Map();
  for (const doc of docs) {
    if (!doc) continue;
    for (const st of doc.getElementsByTagNameNS(ODT_STYLE, 'style')) {
      const name = st.getAttributeNS(ODT_STYLE, 'name');
      const text = st.getElementsByTagNameNS(ODT_STYLE, 'text-properties')[0];
      const para = st.getElementsByTagNameNS(ODT_STYLE, 'paragraph-properties')[0];
      const fo = (el, key) => (el ? el.getAttributeNS(ODT_FO, key) : null);
      const line = (el, key) => (el ? el.getAttributeNS(ODT_STYLE, key) : null);
      const display = st.getAttributeNS(ODT_STYLE, 'display-name') || name;
      styles.set(name, {
        parent: st.getAttributeNS(ODT_STYLE, 'parent-style-name'),
        b: /^(bold|[6-9]00)$/.test(fo(text, 'font-weight') || '') || undefined,
        i: fo(text, 'font-style') === 'italic' || undefined,
        u: (line(text, 'text-underline-style') || 'none') !== 'none' || undefined,
        s: (line(text, 'text-line-through-style') || 'none') !== 'none' || undefined,
        pageBreak: fo(para, 'break-before') === 'page' || undefined,
        align: { center: 'center', end: 'right', right: 'right' }[fo(para, 'text-align')] || undefined,
        title: /^(title|subtitle|t[ií]tulo|subt[ií]tulo)$/i.test(display.trim()) || undefined,
      });
    }
  }
  return (name) => {
    // Propiedades del estilo con las heredadas de sus estilos padre.
    const result = {};
    let st = styles.get(name);
    for (let hop = 0; hop < 8 && st; hop++) {
      for (const key of ['b', 'i', 'u', 's', 'pageBreak', 'align', 'title']) if (result[key] === undefined && st[key] !== undefined) result[key] = st[key];
      st = styles.get(st.parent);
    }
    return result;
  };
}

async function readOdt(zip) {
  const xml = await zip.text('content.xml');
  if (!xml) throw new Error('not-odt');
  const stylesXml = await zip.text('styles.xml');
  const doc = parseXml(xml);
  const styleOf = odtStyles([doc, stylesXml ? parseXml(stylesXml) : null]);
  const body = doc.getElementsByTagNameNS('urn:oasis:names:tc:opendocument:xmlns:office:1.0', 'text')[0];
  if (!body) throw new Error('not-odt');
  const out = [];
  const SKIP = new Set(['tracked-changes', 'table-of-content', 'alphabetical-index', 'note', 'annotation', 'sequence-decls']);

  const inline = (node, fmt, runs) => {
    for (const c of node.childNodes) {
      if (c.nodeType === 3) { runs.push({ text: c.data, ...fmt }); continue; }
      if (c.nodeType !== 1 || SKIP.has(c.localName)) continue;
      switch (c.localName) {
        case 's': runs.push({ text: ' '.repeat(Number(c.getAttributeNS(ODT_TEXT, 'c')) || 1), ...fmt }); break;
        case 'tab': runs.push({ text: ' ', ...fmt }); break;
        case 'line-break': runs.push({ text: '\n', ...fmt }); break;
        case 'span': {
          const st = styleOf(c.getAttributeNS(ODT_TEXT, 'style-name'));
          inline(c, { b: fmt.b || !!st.b, i: fmt.i || !!st.i, u: fmt.u || !!st.u, s: fmt.s || !!st.s }, runs);
          break;
        }
        default: inline(c, fmt, runs);
      }
    }
  };
  const walk = (node) => {
    for (const c of node.children) {
      if (SKIP.has(c.localName)) continue;
      if (c.namespaceURI === ODT_TEXT && (c.localName === 'p' || c.localName === 'h')) {
        const st = styleOf(c.getAttributeNS(ODT_TEXT, 'style-name'));
        const runs = [];
        inline(c, { b: !!st.b && c.localName !== 'h', i: !!st.i, u: !!st.u, s: !!st.s }, runs);
        out.push(paragraph(runs, {
          level: c.localName === 'h' ? Number(c.getAttributeNS(ODT_TEXT, 'outline-level')) || 1 : 0,
          pageBreak: st.pageBreak, align: st.align, skip: st.title,
        }));
      } else {
        walk(c);
      }
    }
  };
  walk(body);
  return out;
}

/** Lee un archivo .docx u .odt y devuelve sus párrafos: [{ text, html, level, pageBreak, skip }] */
export async function readDraft(file) {
  const zip = openZip(await file.arrayBuffer());
  if (zip.names.includes('word/document.xml')) return readDocx(zip);
  if (zip.names.includes('content.xml')) return readOdt(zip);
  throw new Error('unknown-format');
}

// ---------- Reparto en capítulos y escenas ----------

// «Capítulo» en los idiomas de la aplicación (y algunos parecidos).
const CHAPTER_WORDS = 'cap[ií]tulo|cap\\.|chapter|chapitre|kapitel|capitolo|cap[ií]tol|hoofdstuk|rozdzia[łl]|kapitola'
  + '|poglavje|poglavlje|fejezet|b[öo]l[üu]m|глава|розділ|поглавље';
const PROLOGUE = 'pr[oó]logo|prologue|prefacio|pr[oò]leg|prolog|proloog|prol[oó]gus|[öo]ns[öo]z|пролог';
const EPILOGUE = 'ep[ií]logo|[ée]pilogue|ep[ií]leg|epilog|epiloog|epil[oó]gus|sons[öo]z|эпилог|епілог|епилог';
// Fin de palabra que vale también para letras no latinas (\b solo entiende las inglesas).
const END = '(?=$|[\\s.:—–-])';
// «Capítulo 3», «Kapitel III», «Глава первая: título».
const CHAPTER_LINE = new RegExp(`^(?:${CHAPTER_WORDS})\\s+(\\d+|[ivxlcdm]+|\\p{L}+)${END}[\\s.:—–-]*(.*)$`, 'iu');
// Con el número delante: «1. fejezet», «2. poglavje», «3. Bölüm».
const CHAPTER_LINE_AFTER = new RegExp(`^(\\d+|[ivxlcdm]+)\\.?\\s+(?:${CHAPTER_WORDS})${END}[\\s.:—–-]*(.*)$`, 'iu');
const SPECIAL_LINE = new RegExp(`^(?:(${PROLOGUE})|(${EPILOGUE}))${END}[\\s.:—–-]*(.*)$`, 'iu');
const SEPARATOR = /^(?:[*#·•⁂~—–-]\s*){1,7}$/;

const isChapterLine = (p) => p.text.length <= 90
  && (CHAPTER_LINE.test(p.text) || CHAPTER_LINE_AFTER.test(p.text) || SPECIAL_LINE.test(p.text));

/** Qué formas de dividir tiene sentido ofrecer para estos párrafos. */
export function draftSignals(paras) {
  const levels = new Map();
  let pattern = 0;
  let pageBreaks = 0;
  for (const p of paras) {
    if (!p.text) continue;
    if (p.level) levels.set(p.level, (levels.get(p.level) || 0) + 1);
    if (isChapterLine(p)) pattern++;
    if (p.pageBreak) pageBreaks++;
  }
  const sorted = [...levels].sort((a, b) => a[0] - b[0]);
  // Nivel de los capítulos: el más usado, salvo que uno superior se repita y tenga al menos
  // la mitad de usos (un único título de nivel 1 suele ser el título del libro o una parte).
  let level = 0;
  if (sorted.length) {
    const top = Math.max(...sorted.map(([, n]) => n));
    level = (sorted.find(([, n]) => n >= 2 && n >= top / 2) || sorted.find(([, n]) => n === top))[0];
  }
  const auto = level ? 'h' + level : pattern >= 2 ? 'pattern' : pageBreaks >= 2 ? 'pagebreak' : 'none';
  return { levels: sorted, pattern, pageBreaks, auto };
}

/** Título de capítulo limpio y tipo (capítulo, prólogo o epílogo) a partir de su línea. */
function chapterTitle(text) {
  let m = SPECIAL_LINE.exec(text);
  if (m) return { kind: m[2] ? 'epilogue' : 'prologue', title: m[3].trim() };
  m = CHAPTER_LINE.exec(text) || CHAPTER_LINE_AFTER.exec(text);
  if (m) return { kind: 'chapter', title: m[2].trim() };
  return { kind: 'chapter', title: text };
}

/**
 * Reparte los párrafos. mode: 'h1'…'h6' (títulos de ese nivel), 'pattern' (líneas «Capítulo 1»),
 * 'pagebreak' (saltos de página) o 'none' (un solo capítulo). blankScenes: las líneas en blanco
 * separan escenas. Devuelve [{ title, kind, part, lead, scenes: [{ title, html, words, chars, start }] }].
 */
export function splitDraft(paras, { mode = 'none', blankScenes = false } = {}) {
  const level = /^h\d$/.test(mode) ? Number(mode.slice(1)) : 0;
  const chapters = [];
  let chapter = null;
  let scene = null;
  let part = null;
  let pendingBreak = false;

  const openChapter = (info) => {
    chapter = { title: '', kind: 'chapter', part, lead: false, scenes: [], ...info };
    chapters.push(chapter);
    scene = null;
    pendingBreak = false;
  };
  const openScene = (title = '') => {
    scene = { title, html: '', text: '' };
    chapter.scenes.push(scene);
    pendingBreak = false;
  };

  for (const p of paras) {
    if (p.skip) continue;
    const startsChapter = p.text && (
      (level && p.level === level)
      || (mode === 'pattern' && isChapterLine(p))
      || (mode === 'pagebreak' && p.pageBreak && chapters.length > 0));

    if (level && p.level && p.level < level && p.text) {
      // Un título de nivel superior al de los capítulos es una parte.
      part = p.text;
      chapter = null;
      scene = null;
      continue;
    }
    if (startsChapter) {
      if (mode === 'pagebreak') openChapter({});
      else { openChapter(chapterTitle(p.text)); continue; }
    }
    if (!chapter) {
      if (!p.text) continue;
      // Texto anterior al primer capítulo (portada, dedicatoria…): se ofrece aparte.
      openChapter({ lead: mode !== 'none' && mode !== 'pagebreak' });
    }
    if (!p.text) {
      if (blankScenes && scene && scene.html) pendingBreak = true;
      continue;
    }
    if (SEPARATOR.test(p.text)) {
      if (scene && scene.html) pendingBreak = true;
      continue;
    }
    if (level && p.level > level) {
      // Un título de nivel inferior dentro del capítulo da nombre a una escena.
      openScene(p.text);
      continue;
    }
    if (!scene || pendingBreak) openScene();
    scene.html += p.html;
    scene.text += p.text + '\n';
  }

  for (const c of chapters) {
    c.scenes = c.scenes.filter((s) => s.text.trim());
    for (const s of c.scenes) {
      s.words = countWords(s.text);
      s.chars = countChars(s.text);
      s.start = s.text.slice(0, 110).replace(/\s+/g, ' ').trim();
      delete s.text;
    }
    c.words = c.scenes.reduce((sum, s) => sum + s.words, 0);
  }
  return chapters.filter((c) => c.scenes.length);
}
