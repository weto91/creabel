// Salidas: TXT, HTML (también usado para imprimir a PDF), DOCX y EPUB.
import { zip } from './zip.js';
import { sanitizeHtml, htmlToText, escapeHtml } from '../text.js';
import { t } from '../i18n.js';

const FONTS = {
  serif: { css: "'Times New Roman', Times, serif", docx: 'Times New Roman' },
  georgia: { css: "Georgia, 'Times New Roman', serif", docx: 'Georgia' },
  sans: { css: 'Arial, Helvetica, sans-serif', docx: 'Arial' },
  mono: { css: "'Courier New', Courier, monospace", docx: 'Courier New' },
};

export const EXPORT_FONTS = Object.keys(FONTS);

const fontOf = (o) => FONTS[o.font] || FONTS.serif;

/** Escapa texto para XML y elimina caracteres de control no permitidos. */
function x(text) {
  return String(text == null ? '' : text)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** `safe`: el HTML ya viene saneado (lleva las marcas del diccionario, que el saneado quitaría). */
function fragment(html, safe) {
  const tpl = document.createElement('template');
  tpl.innerHTML = safe ? html : sanitizeHtml(html);
  return tpl.content;
}

// Las marcas del diccionario son <sup class="gl"><a id="glref-N" href="#gl-N">N</a></sup>.
const GLOSS_MARK = /<sup class="gl">.*?<\/sup>/g;
const docxName = (id) => id.replace(/-/g, '_');
let bookmarkId = 0;

// ---------- TXT ----------

export function toTxt(blocks) {
  const out = [];
  for (const b of blocks) {
    switch (b.t) {
      case 'title':
        out.push(b.text.toUpperCase(), b.author || '', b.subtitle || '', '');
        break;
      case 'h1': out.push('', '', b.text.toUpperCase(), ''); break;
      case 'h2': out.push('', '', b.text, ''); break;
      case 'h3': out.push('', b.text, ''); break;
      case 'html':
        // En texto plano la marca del diccionario se escribe como [N].
        out.push(htmlToText(b.safe ? b.html.replace(GLOSS_MARK, (m) => ` [${m.replace(/<[^>]+>/g, '')}]`) : b.html));
        break;
      case 'gloss': out.push(`[${b.n}] ${b.term}: ${b.text}`); break;
      case 'matter': out.push('', htmlToText(b.html), ''); break;
      case 'p': out.push(b.text); break;
      case 'sep': out.push('', b.text || '', ''); break;
      default: break;
    }
  }
  const text = out.join('\n').replace(/\n{4,}/g, '\n\n\n').trim() + '\n';
  return new Blob(['﻿' + text.replace(/\n/g, '\r\n')], { type: 'text/plain;charset=utf-8' });
}

// ---------- HTML ----------

const lines = (text) => String(text || '').replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
const cssString = (text) => String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ');

/**
 * Reglas de página. o.layout (opcional) describe el formato del documento:
 * { pageW, pageH, top, bottom, inner, outer (mm), mirror, lineHeight, justify,
 *   pageNumbers, header (texto al que sigue el número de página), chapterDrop }
 */
function pageCss(o) {
  const L = o.layout || {};
  const small = `font-family: ${fontOf(o).css}; font-size: ${Math.max(8, (o.size || 12) - 2)}pt;`;
  let css = '@page { margin: 2.5cm; }';
  if (L.pageW) {
    css = `@page { size: ${L.pageW}mm ${L.pageH}mm; margin: ${L.top}mm ${L.outer}mm ${L.bottom}mm ${L.inner}mm; }`;
    // Márgenes simétricos: el interior (el del lomo) cambia de lado en las páginas pares.
    if (L.mirror) css += `\n  @page :left { margin-left: ${L.outer}mm; margin-right: ${L.inner}mm; }\n  @page :right { margin-left: ${L.inner}mm; margin-right: ${L.outer}mm; }`;
  }
  if (L.pageNumbers) css += `\n  @page { @bottom-center { content: counter(page); ${small} } }\n  @page :first { @bottom-center { content: none; } }`;
  if (L.header) css += `\n  @page { @top-right { content: "${cssString(L.header)}" counter(page); font-family: ${fontOf(o).css}; font-size: ${o.size || 12}pt; } }\n  @page :first { @top-right { content: none; } }`;
  return css;
}

function documentCss(o) {
  const font = fontOf(o).css;
  const L = o.layout || {};
  return `
  ${pageCss(o)}
  body { font-family: ${font}; font-size: ${o.size || 12}pt; line-height: ${L.lineHeight || 1.5}; color: #111; background: #fff; ${L.justify ? 'text-align: justify; hyphens: auto;' : ''} }
  ${L.chapterDrop ? 'h2 { margin-top: 20vh !important; }' : ''}
  .pb.recto { break-before: right; page-break-before: right; }
  .matter p { text-indent: 0; margin: 0 0 0.4em; }
  .matter-dedication { text-align: center; padding-top: 28vh; }
  .matter-epigraph { text-align: right; padding-top: 28vh; margin-left: 25%; }
  .figure { text-indent: 0; text-align: center; margin: 0 0 1.4em; }
  .figure img { width: 38mm; height: auto; }
  .matter-copyright { text-align: left; font-size: 0.8em; padding-top: 55vh; }
  .titlepage.ms { padding-top: 0; }
  .ms-top { display: flex; justify-content: space-between; gap: 2em; text-align: left; line-height: 1.25; margin-bottom: 28vh; }
  .titlepage .ms-top p { font-size: 1em; margin: 0; }
  .titlepage.ms h1 { font-size: 1.5em; }
  @media screen { body { max-width: 42em; margin: 2em auto; padding: 0 1.2em; } }
  p { margin: 0; ${o.indent ? 'text-indent: 1.5em;' : 'margin-bottom: 0.8em;'} }
  h1, h2, h3 { font-family: ${font}; text-align: center; line-height: 1.25; page-break-after: avoid; }
  h1 { font-size: 1.9em; margin: 30vh 0 1em; }
  h2 { font-size: 1.45em; margin: 3em 0 1.6em; }
  h3 { font-size: 1.1em; margin: 1.6em 0 0.8em; }
  h1 + .content > p:first-child, h2 + .content > p:first-child, h3 + .content > p:first-child, .sep + .content > p:first-child { text-indent: 0; }
  .pb { break-before: page; page-break-before: always; height: 0; }
  .sep { text-align: center; text-indent: 0; margin: 1.4em 0; }
  .titlepage { text-align: center; padding-top: 28vh; }
  .titlepage h1 { margin: 0 0 0.6em; font-size: 2.4em; }
  .titlepage p { text-indent: 0; font-size: 1.2em; }
  .lead { text-indent: 0; font-weight: bold; margin-top: 0.8em; }
  .plain { text-indent: 0; margin-bottom: 0.4em; }
  blockquote { margin: 1em 2em; }
  ul, ol { margin: 0.6em 0 0.6em 1.5em; padding: 0; }
  li { text-indent: 0; }
  sup.gl { font-size: 0.65em; line-height: 0; }
  sup.gl a, .gloss a { color: inherit; text-decoration: none; }
  .gloss { text-indent: 0; margin: 0 0 0.7em; }`;
}

function blocksToHtml(blocks) {
  let out = '';
  let first = true;
  for (const b of blocks) {
    if (b.t === 'break') {
      if (!first) out += `<div class="pb${b.recto ? ' recto' : ''}"></div>`;
      continue;
    }
    first = false;
    switch (b.t) {
      case 'title': {
        // Portada de manuscrito: datos de contacto arriba a la izquierda y recuento a la derecha.
        const ms = b.contact || b.count;
        const top = ms ? `<div class="ms-top"><div>${lines(b.contact).map((l) => `<p>${escapeHtml(l)}</p>`).join('')}</div><div><p>${escapeHtml(b.count || '')}</p></div></div>` : '';
        out += `<section class="titlepage${ms ? ' ms' : ''}">${top}<h1>${escapeHtml(b.text)}</h1>${b.author ? `<p>${escapeHtml(b.author)}</p>` : ''}${b.subtitle ? `<p>${escapeHtml(b.subtitle)}</p>` : ''}</section>`;
        break;
      }
      case 'matter':
        out += `<div class="matter matter-${b.kind}">${sanitizeHtml(b.html)}</div>`;
        break;
      case 'image': out += `<p class="figure${b.cover ? ' cover' : ''}"><img src="${b.dataUrl}" alt=""${b.cover ? ' style="width:70%;max-width:none"' : ''}></p>`; break;
      case 'h1': case 'h2': case 'h3':
        out += `<${b.t}>${escapeHtml(b.text)}</${b.t}>`;
        break;
      case 'html': out += `<div class="content">${b.safe ? b.html : sanitizeHtml(b.html)}</div>`; break;
      case 'gloss':
        out += `<p class="gloss" id="gl-${b.n}"><a href="#glref-${b.n}">${b.n}</a>. <b>${escapeHtml(b.term)}</b>${b.text ? '. ' + escapeHtml(b.text) : ''}</p>`;
        break;
      case 'p': out += `<p class="${b.bold ? 'lead' : 'plain'}">${escapeHtml(b.text)}</p>`; break;
      case 'sep': out += `<p class="sep">${escapeHtml(b.text) || '&nbsp;'}</p>`; break;
      default: break;
    }
  }
  return out;
}

export function toHtmlString(blocks, o) {
  return `<!doctype html>\n<html lang="${escapeHtml(o.lang || 'es')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(o.title)}</title><style>${documentCss(o)}</style></head><body>${blocksToHtml(blocks)}</body></html>`;
}

export function toHtml(blocks, o) {
  return new Blob([toHtmlString(blocks, o)], { type: 'text/html;charset=utf-8' });
}

/** Abre el diálogo de impresión del navegador (desde ahí se guarda como PDF). */
export function printDocument(blocks, o) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.append(frame);
  const cleanup = () => setTimeout(() => frame.remove(), 1500);
  frame.addEventListener('load', () => {
    const win = frame.contentWindow;
    win.addEventListener('afterprint', cleanup);
    setTimeout(() => {
      win.focus();
      win.print();
    }, 150);
  });
  frame.srcdoc = toHtmlString(blocks, o);
}

// ---------- DOCX ----------

const BLOCK = new Set(['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL']);

/** HTML -> lista de párrafos { runs: [{ text, b, i, u, s, hl } | { br }], align, style, quote } */
function htmlToParas(html, safe) {
  const paras = [];
  let runs = [];
  const push = (ctx) => {
    while (runs.length && runs[runs.length - 1].br) runs.pop();
    paras.push({ runs, ...ctx });
    runs = [];
  };
  const walk = (node, fmt, ctx) => {
    for (const c of node.childNodes) {
      if (c.nodeType === 3) {
        if (c.data) runs.push({ text: c.data, ...fmt });
        continue;
      }
      if (c.nodeType !== 1) continue;
      const tag = c.tagName;
      if (tag === 'BR') { runs.push({ br: true }); continue; }
      if (BLOCK.has(tag)) {
        if (runs.length) push(ctx);
        const next = { ...ctx };
        if (c.style && c.style.textAlign) next.align = c.style.textAlign;
        if (tag === 'H1' || tag === 'H2' || tag === 'H3') next.style = 'Heading3';
        if (tag === 'BLOCKQUOTE') next.quote = true;
        if (tag === 'UL' || tag === 'OL') {
          walk(c, fmt, next);
          continue;
        }
        if (tag === 'LI') {
          const parent = c.parentElement;
          const ordered = parent && parent.tagName === 'OL';
          const index = parent ? [...parent.children].filter((n) => n.tagName === 'LI').indexOf(c) + 1 : 1;
          runs.push({ text: ordered ? `${index}. ` : '• ' });
          next.list = true;
        }
        walk(c, fmt, next);
        // Un bloque que contiene otros bloques ya los ha emitido; solo se emite si queda texto
        // o si es un párrafo vacío (línea en blanco intencionada).
        const hasBlockChild = [...c.children].some((n) => BLOCK.has(n.tagName));
        if (runs.length || !hasBlockChild) push(next);
      } else {
        const f = { ...fmt };
        if (tag === 'B' || tag === 'STRONG') f.b = true;
        if (tag === 'I' || tag === 'EM') f.i = true;
        if (tag === 'U') f.u = true;
        if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') f.s = true;
        if (tag === 'MARK' || (tag === 'SPAN' && c.style && c.style.backgroundColor)) f.hl = true;
        if (tag === 'SUP') f.sup = true;
        if (tag === 'A') {
          // Marca del diccionario: enlace interno a la definición y ancla para volver.
          const href = c.getAttribute('href') || '';
          if (href.startsWith('#')) f.anchor = docxName(href.slice(1));
          if (c.id) f.bookmark = docxName(c.id);
        }
        walk(c, f, ctx);
      }
    }
  };
  walk(fragment(html, safe), {}, {});
  if (runs.length) push({});
  return paras;
}

/** Imagen en línea: `img` = { rid, n, cx, cy } con el tamaño en EMU (360 000 por centímetro). */
function drawingXml(img) {
  const size = `cx="${img.cx}" cy="${img.cy}"`;
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent ${size}/><wp:docPr id="${img.n}" name="Imagen ${img.n}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${img.n}" name="image${img.n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${img.rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext ${size}/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

function runXml(r) {
  if (r.br) return '<w:r><w:br/></w:r>';
  if (r.img) return drawingXml(r.img);
  let props = '';
  if (r.b) props += '<w:b/>';
  if (r.i) props += '<w:i/>';
  if (r.s) props += '<w:strike/>';
  if (r.hl) props += '<w:highlight w:val="yellow"/>';
  if (r.u) props += '<w:u w:val="single"/>';
  if (r.sup) props += '<w:vertAlign w:val="superscript"/>';
  let xml = `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${x(r.text)}</w:t></w:r>`;
  if (r.anchor) xml = `<w:hyperlink w:anchor="${x(r.anchor)}" w:history="1">${xml}</w:hyperlink>`;
  if (r.bookmark) {
    const id = ++bookmarkId;
    xml = `<w:bookmarkStart w:id="${id}" w:name="${x(r.bookmark)}"/>${xml}<w:bookmarkEnd w:id="${id}"/>`;
  }
  return xml;
}

function paraXml(p, o) {
  const jc = { left: 'left', center: 'center', right: 'right', justify: 'both' }[p.align];
  let props = '';
  if (p.style) props += `<w:pStyle w:val="${p.style}"/>`;
  if (p.pageBreak) props += '<w:pageBreakBefore/>';
  if (p.spaceBefore || p.spaceAfter) props += `<w:spacing${p.spaceBefore ? ` w:before="${p.spaceBefore}"` : ''}${p.spaceAfter ? ` w:after="${p.spaceAfter}"` : ''}/>`;
  if (p.quote) props += '<w:ind w:left="720" w:right="720"/>';
  else if (p.list) props += '<w:ind w:left="360"/>';
  else if (o.indent && !p.style && !p.noIndent && p.align !== 'center' && p.align !== 'right') props += '<w:ind w:firstLine="425"/>';
  if (jc) props += `<w:jc w:val="${jc}"/>`;
  return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ''}${p.runs.map(runXml).join('')}</w:p>`;
}

export function toDocx(blocks, o) {
  const font = fontOf(o).docx;
  const half = Math.round((o.size || 12) * 2);
  const paras = [];
  const images = []; // { name, rid, data }
  bookmarkId = 0;
  let pageBreak = false;
  let afterHeading = false;
  const add = (p) => {
    if (pageBreak && paras.length) p.pageBreak = true;
    pageBreak = false;
    paras.push(p);
  };
  for (const b of blocks) {
    switch (b.t) {
      case 'break': pageBreak = true; break;
      case 'title':
        // Portada de manuscrito: contacto a la izquierda, recuento a la derecha y el título más abajo.
        for (const line of lines(b.contact)) add({ runs: [{ text: line }], noIndent: true, align: 'left' });
        if (b.count) add({ runs: [{ text: b.count }], noIndent: true, align: 'right' });
        add({ style: 'Title', runs: [{ text: b.text }] });
        if (b.author) add({ style: 'Subtitle', runs: [{ text: b.author }] });
        if (b.subtitle) add({ style: 'Subtitle', runs: [{ text: b.subtitle }] });
        break;
      case 'matter': {
        // La alineación por defecto depende de la página; la que se haya dado al párrafo manda.
        const align = { dedication: 'center', epigraph: 'right', copyright: 'left' }[b.kind] || 'left';
        htmlToParas(b.html).forEach((p, i) => add({
          ...p, noIndent: true, align: p.align || align,
          spaceBefore: i === 0 ? (b.kind === 'copyright' ? 7200 : 3600) : 0, spaceAfter: 80,
        }));
        break;
      }
      case 'image': {
        // 3,8 cm de ancho, con el alto proporcional; la portada, 12 cm.
        const cx = b.cover ? 4320000 : 1368000;
        const n = images.length + 1;
        images.push({ name: `media/image${n}.jpeg`, rid: `rIdImg${n}`, data: b.bytes });
        add({ runs: [{ img: { rid: `rIdImg${n}`, n, cx, cy: Math.round((cx * b.h) / b.w) } }], align: 'center', noIndent: true, spaceAfter: 240 });
        break;
      }
      case 'h1': add({ style: 'Heading1', runs: [{ text: b.text }] }); afterHeading = true; break;
      case 'h2': add({ style: 'Heading2', runs: [{ text: b.text }] }); afterHeading = true; break;
      case 'h3': add({ style: 'Heading3', runs: [{ text: b.text }] }); afterHeading = true; break;
      case 'p': add({ runs: [{ text: b.text, b: !!b.bold }], noIndent: true, spaceAfter: 80 }); break;
      case 'sep':
        add({ runs: [{ text: b.text || '' }], align: 'center', noIndent: true });
        afterHeading = true;
        break;
      case 'gloss':
        add({
          noIndent: true, spaceAfter: 120,
          runs: [
            { text: String(b.n), anchor: `glref_${b.n}`, bookmark: `gl_${b.n}` },
            { text: '. ' },
            { text: b.term, b: true },
            { text: b.text ? '. ' + b.text : '' },
          ],
        });
        break;
      case 'html': {
        const list = htmlToParas(b.html, b.safe);
        list.forEach((p, i) => {
          // El primer párrafo tras un título o separador no lleva sangría (convención editorial).
          if (i === 0 && afterHeading) p.noIndent = true;
          if (!o.indent && !p.style) p.spaceAfter = 160;
          add(p);
        });
        afterHeading = false;
        break;
      }
      default: break;
    }
  }

  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  const R = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  // Formato de página: tamaño, márgenes (el izquierdo es el interior), interlineado y,
  // si se piden, cabecera con número de página (manuscrito) o pie con el número (libro).
  const L = o.layout || {};
  const tw = (mm) => Math.round(mm * 56.693);
  const pgSz = L.pageW ? `<w:pgSz w:w="${tw(L.pageW)}" w:h="${tw(L.pageH)}"/>` : '<w:pgSz w:w="11906" w:h="16838"/>';
  const pgMar = L.pageW
    ? `<w:pgMar w:top="${tw(L.top)}" w:right="${tw(L.outer)}" w:bottom="${tw(L.bottom)}" w:left="${tw(L.inner)}" w:header="${Math.min(708, tw(L.top / 2))}" w:footer="${Math.min(708, tw(L.bottom / 2))}" w:gutter="0"/>`
    : '<w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/>';
  const pageField = '<w:fldSimple w:instr=" PAGE "><w:r><w:t>1</w:t></w:r></w:fldSimple>';
  const extra = []; // partes adicionales: { name, type (de relación), content (tipo MIME), data }
  let refs = '';
  if (L.header) {
    extra.push({ name: 'header1.xml', rel: 'header', content: 'header', data: `${HEAD}<w:hdr ${W}><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t xml:space="preserve">${x(L.header)}</w:t></w:r>${pageField}</w:p></w:hdr>` });
    refs += `<w:headerReference w:type="default" r:id="rId${extra.length + 1}"/>`;
  }
  if (L.pageNumbers) {
    extra.push({ name: 'footer1.xml', rel: 'footer', content: 'footer', data: `${HEAD}<w:ftr ${W}><w:p><w:pPr><w:jc w:val="center"/></w:pPr>${pageField}</w:p></w:ftr>` });
    refs += `<w:footerReference w:type="default" r:id="rId${extra.length + 1}"/>`;
  }
  if (L.mirror) extra.push({ name: 'settings.xml', rel: 'settings', content: 'settings', data: `${HEAD}<w:settings ${W}><w:mirrorMargins/></w:settings>` });
  // <w:titlePg/> deja la primera página (la portada) sin cabecera ni pie.
  const documentXml = `${HEAD}<w:document ${W} ${R}><w:body>${paras.map((p) => paraXml(p, o)).join('')}<w:sectPr>${refs}${pgSz}${pgMar}${refs ? '<w:titlePg/>' : ''}</w:sectPr></w:body></w:document>`;

  const heading = (id, name, size, level, before, after) => `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="${before}" w:after="${after}"/><w:jc w:val="center"/><w:outlineLvl w:val="${level}"/></w:pPr><w:rPr><w:b/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${x(font)}" w:hAnsi="${x(font)}" w:eastAsia="${x(font)}" w:cs="${x(font)}"/><w:sz w:val="${half}"/><w:szCs w:val="${half}"/><w:lang w:val="${x(o.lang || 'es')}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="${Math.round((L.lineHeight || 1.5) * 240)}" w:lineRule="auto"/>${L.justify ? '<w:jc w:val="both"/>' : ''}</w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="3600" w:after="360"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>
${heading('Heading1', 'heading 1', 44, 0, 2400, 480)}
${heading('Heading2', 'heading 2', 34, 1, L.chapterDrop ? 2880 : 960, 480)}
${heading('Heading3', 'heading 3', 26, 2, 360, 200)}
</w:styles>`;

  const files = [
    { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' + extra.map((p) => `<Override PartName="/word/${p.name}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${p.content}+xml"/>`).join('') + '</Types>' },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { name: 'word/document.xml', data: documentXml },
    { name: 'word/styles.xml', data: stylesXml },
    { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' + extra.map((p, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${p.rel}" Target="${p.name}"/>`).join('') + images.map((img) => `<Relationship Id="${img.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${img.name}"/>`).join('') + '</Relationships>' },
    ...extra.map((p) => ({ name: 'word/' + p.name, data: p.data })),
    ...images.map((img) => ({ name: 'word/' + img.name, data: img.data })),
  ];
  return zip(files, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

// ---------- EPUB 3 ----------

function xhtmlFragment(html, safe) {
  const serializer = new XMLSerializer();
  let out = '';
  for (const node of fragment(html, safe).childNodes) out += serializer.serializeToString(node);
  return out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function uuid() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function toEpub(blocks, o) {
  const lang = o.lang || 'es';
  // Cada salto de página empieza un archivo nuevo dentro del libro.
  const sections = [];
  let cur = null;
  for (const b of blocks) {
    if (b.t === 'break' || !cur) {
      cur = { title: '', blocks: [] };
      sections.push(cur);
      if (b.t === 'break') continue;
    }
    cur.blocks.push(b);
    if (!cur.title && (b.t === 'h1' || b.t === 'h2' || b.t === 'title')) cur.title = b.text;
  }
  const parts = sections.filter((s) => s.blocks.length);

  const page = (title, body) => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${x(lang)}" lang="${x(lang)}"><head><meta charset="utf-8"/><title>${x(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>${body}</body></html>`;

  // Cada imagen va en un archivo propio dentro del libro.
  const pictures = new Map();
  for (const b of blocks) if (b.t === 'image') pictures.set(b, `img${pictures.size + 1}.jpeg`);

  const render = (list) => list.map((b) => {
    switch (b.t) {
      case 'title': return `<div class="titlepage"><h1>${x(b.text)}</h1>${b.author ? `<p class="author">${x(b.author)}</p>` : ''}${b.subtitle ? `<p class="author series">${x(b.subtitle)}</p>` : ''}</div>`;
      case 'h1': return `<h1 class="part">${x(b.text)}</h1>`;
      case 'h2': return `<h2>${x(b.text)}</h2>`;
      case 'h3': return `<h3>${x(b.text)}</h3>`;
      case 'html': return `<div class="content">${xhtmlFragment(b.html, b.safe)}</div>`;
      case 'gloss': return `<p class="gloss" id="gl-${b.n}"><a href="#glref-${b.n}">${b.n}</a>. <b>${x(b.term)}</b>${b.text ? '. ' + x(b.text) : ''}</p>`;
      case 'matter': return `<div class="matter matter-${b.kind}">${xhtmlFragment(b.html)}</div>`;
      case 'image': return `<p class="figure${b.cover ? ' cover' : ''}"><img src="${pictures.get(b)}" alt=""/></p>`;
      case 'p': return `<p class="${b.bold ? 'lead' : 'plain'}">${x(b.text)}</p>`;
      case 'sep': return `<p class="sep">${x(b.text) || '&#160;'}</p>`;
      default: return '';
    }
  }).join('');
  // La portada, si la hay: los lectores de libros la usan como miniatura.
  const coverName = [...pictures.entries()].filter(([b]) => b.cover).map(([, name]) => name)[0] || '';

  const css = `body { font-family: serif; line-height: 1.5; margin: 0 5%; }
p { margin: 0; ${o.indent ? 'text-indent: 1.4em;' : 'margin-bottom: 0.8em;'} }
h1, h2, h3 { text-align: center; line-height: 1.25; }
h1.part { margin-top: 30%; }
h2 { margin: 2.5em 0 1.5em; }
h2 + .content > p:first-child, h3 + .content > p:first-child, .sep + .content > p:first-child { text-indent: 0; }
.sep { text-align: center; text-indent: 0; margin: 1.3em 0; }
.titlepage { text-align: center; margin-top: 30%; }
.titlepage .author, .plain, .lead { text-indent: 0; }
.lead { font-weight: bold; }
.matter p { text-indent: 0; margin: 0 0 0.4em; }
.matter-dedication { text-align: center; margin-top: 30%; }
.matter-epigraph { text-align: right; margin-top: 30%; margin-left: 20%; }
.figure { text-indent: 0; text-align: center; margin: 0 0 1.2em; }
.figure img { width: 40%; max-width: 12em; }
.figure.cover { margin: 0; }
.figure.cover img { width: 100%; max-width: 100%; }
.matter-copyright { font-size: 0.85em; margin-top: 40%; }
sup.gl { font-size: 0.65em; line-height: 0; }
sup.gl a, .gloss a { text-decoration: none; }
.gloss { text-indent: 0; margin: 0 0 0.7em; }`;

  // Cada parte del libro es un archivo distinto: los enlaces entre una marca del diccionario
  // y su definición (y la vuelta) deben apuntar al archivo donde está el destino.
  const bodies = parts.map((s) => render(s.blocks));
  const fileOf = new Map();
  bodies.forEach((body, i) => {
    for (const m of body.matchAll(/\bid="(gl(?:ref)?-\d+)"/g)) fileOf.set(m[1], `s${i + 1}.xhtml`);
  });
  const linked = bodies.map((body, i) => body.replace(/href="#(gl(?:ref)?-\d+)"/g, (all, id) => {
    const file = fileOf.get(id);
    return file && file !== `s${i + 1}.xhtml` ? `href="${file}#${id}"` : all;
  }));

  const id = uuid();
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const tocEntries = parts.map((s, i) => ({ href: `s${i + 1}.xhtml`, title: s.title || o.title }));
  const tocLabel = t('read.contents');

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${x(lang)}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">urn:uuid:${id}</dc:identifier>
<dc:title>${x(o.title)}</dc:title>
<dc:language>${x(lang)}</dc:language>
${o.author ? `<dc:creator>${x(o.author)}</dc:creator>` : ''}
${o.publisher ? `<dc:publisher>${x(o.publisher)}</dc:publisher>` : ''}
${o.published ? `<dc:date>${x(o.published)}</dc:date>` : ''}
${o.description ? `<dc:description>${x(o.description)}</dc:description>` : ''}
${o.series ? `<meta property="belongs-to-collection" id="series">${x(o.series)}</meta>
<meta refines="#series" property="collection-type">series</meta>${o.seriesIndex != null ? `
<meta refines="#series" property="group-position">${x(o.seriesIndex)}</meta>` : ''}
<meta name="calibre:series" content="${x(o.series)}"/>${o.seriesIndex != null ? `
<meta name="calibre:series_index" content="${x(o.seriesIndex)}"/>` : ''}` : ''}
<meta property="dcterms:modified">${modified}</meta>
${coverName ? `<meta name="cover" content="img${coverName.replace(/\D/g, '')}"/>` : ''}
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="css" href="style.css" media-type="text/css"/>
${parts.map((s, i) => `<item id="s${i + 1}" href="s${i + 1}.xhtml" media-type="application/xhtml+xml"/>`).join('\n')}
${[...pictures.values()].map((name, i) => `<item id="img${i + 1}" href="${name}" media-type="image/jpeg"${name === coverName ? ' properties="cover-image"' : ''}/>`).join('\n')}
</manifest>
<spine toc="ncx">
${parts.map((s, i) => `<itemref idref="s${i + 1}"/>`).join('\n')}
</spine>
</package>`;

  const nav = page(tocLabel, `<nav epub:type="toc" id="toc"><h1>${x(tocLabel)}</h1><ol>${tocEntries.map((e) => `<li><a href="${e.href}">${x(e.title)}</a></li>`).join('')}</ol></nav>`);

  const ncx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:uuid:${id}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${x(o.title)}</text></docTitle><navMap>${tocEntries.map((e, i) => `<navPoint id="n${i + 1}" playOrder="${i + 1}"><navLabel><text>${x(e.title)}</text></navLabel><content src="${e.href}"/></navPoint>`).join('')}</navMap></ncx>`;

  const files = [
    { name: 'mimetype', data: 'application/epub+zip' },
    { name: 'META-INF/container.xml', data: '<?xml version="1.0" encoding="utf-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>' },
    { name: 'OEBPS/content.opf', data: opf },
    { name: 'OEBPS/nav.xhtml', data: nav },
    { name: 'OEBPS/toc.ncx', data: ncx },
    { name: 'OEBPS/style.css', data: css },
    ...parts.map((s, i) => ({ name: `OEBPS/s${i + 1}.xhtml`, data: page(s.title || o.title, linked[i]) })),
    ...[...pictures].map(([b, name]) => ({ name: 'OEBPS/' + name, data: b.bytes })),
  ];
  return zip(files, 'application/epub+zip');
}
