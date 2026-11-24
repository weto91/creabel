// Exportación de la novela o del dossier del proyecto. La novela puede salir con formato
// libre, como manuscrito para editoriales y concursos, como interior de libro impreso (con
// estimación de páginas y ancho de lomo) o como libro electrónico.
import { h, clear } from '../dom.js';
import { t } from '../i18n.js';
import { store } from '../store.js';
import { downloadBlob, slugify, formatNumber, htmlToText } from '../text.js';
import { btn, pageHeader, toast, errorText } from '../ui.js';
import { buildNovel, buildDossier } from '../export/build.js';
import { toTxt, toHtml, toDocx, toEpub, printDocument, EXPORT_FONTS } from '../export/formats.js';
import { downloadBackup } from '../backup.js';
import { chaptersOrdered } from '../model.js';

const DEFAULTS = {
  what: 'novel', preset: 'custom', format: 'docx', titlePage: true, chapterTitle: 'both', separator: '* * *', sceneTitles: false, glossary: true,
  font: 'serif', size: 12, indent: true, useMatter: true,
  ms: { font: 'mono', format: 'docx', page: 'a4' },
  print: { trim: '6x9', font: 'georgia', size: 11, line: 1.35, recto: false, paper: 'cream', format: 'pdf', realPages: '' },
  sections: { architecture: true, characters: true, locations: true, objects: true, groups: true, notes: true, dictionary: true, outline: true, timeline: true },
};
const SEPARATORS = ['* * *', '#', '—', ''];
const DOSSIER_SECTIONS = ['architecture', 'characters', 'locations', 'objects', 'groups', 'notes', 'dictionary', 'outline', 'timeline'];
const PRESETS = ['custom', 'manuscript', 'print', 'ebook'];
const MATTER = ['copyright', 'dedication', 'epigraph', 'acknowledgments', 'about'];
// Tamaños de página (mm): los de corte más habituales en impresión bajo demanda.
const TRIMS = { '5x8': [127, 203.2], '5.5x8.5': [139.7, 215.9], a5: [148, 210], '6x9': [152.4, 228.6], pocket: [110, 178] };
const MS_PAGES = { a4: [210, 297], letter: [215.9, 279.4] };
// Grosor por página (mm) según el papel: sirve para calcular el lomo de la cubierta.
const PAPERS = { white: 0.0572, cream: 0.0635 };
const CHAR_WIDTH = { serif: 0.45, georgia: 0.49, sans: 0.5, mono: 0.6 };

/** Páginas aproximadas del interior impreso y márgenes que le corresponden. */
function printLayout(pr) {
  const [pageW, pageH] = TRIMS[pr.trim] || TRIMS['6x9'];
  const size = Number(pr.size) || 11;
  const line = Number(pr.line) || 1.35;
  const scenes = store.list('scene');
  const chars = scenes.reduce((sum, s) => sum + (s.chars || 0), 0);
  const chapters = chaptersOrdered().length;
  const parts = store.list('part').length;
  const matter = store.project.data.matter || {};
  const front = 1 + MATTER.filter((k) => matter[k] && String(matter[k]).trim()).length;
  const layoutFor = (inner) => ({ pageW, pageH, top: 17, bottom: 19, outer: 13, inner, mirror: true, lineHeight: line, justify: true, pageNumbers: true, chapterDrop: true });
  const pagesWith = (inner) => {
    const L = layoutFor(inner);
    const perLine = ((pageW - L.inner - L.outer) * 2.8346) / (size * (CHAR_WIDTH[pr.font] || 0.47));
    const perPage = Math.max(1, Math.floor(((pageH - L.top - L.bottom) * 2.8346) / (size * line)));
    // Un 12 % de líneas de más por los finales de párrafo, y media página larga por arranque de capítulo.
    const text = ((chars / perLine) * 1.12) / perPage;
    const total = Math.ceil(text + chapters * (pr.recto ? 1.1 : 0.6) + parts * 2 + front);
    return total + (total % 2);
  };
  // El margen interior crece con el grosor del libro, para que el texto no se pierda en el lomo.
  const innerFor = (pages) => (pages <= 150 ? 13 : pages <= 300 ? 16 : pages <= 500 ? 19 : 22);
  let pages = pagesWith(16);
  const inner = innerFor(pages);
  pages = pagesWith(inner);
  return { layout: layoutFor(inner), pages, chars };
}

export async function exportPage({ el, pid }) {
  const saved = store.project.data.export || {};
  const o = {
    ...DEFAULTS, ...saved,
    ms: { ...DEFAULTS.ms, ...(saved.ms || {}) },
    print: { ...DEFAULTS.print, ...(saved.print || {}) },
    sections: { ...DEFAULTS.sections, ...(saved.sections || {}) },
  };
  if (!PRESETS.includes(o.preset)) o.preset = 'custom';
  // Las páginas preliminares y finales, la foto y los datos de contacto se editan en «Libro».
  const matter = store.project.data.matter || {};
  const hasMatter = MATTER.some((key) => matter[key] && String(matter[key]).trim()) || !!matter.photo;
  const bookLink = (key) => h('a', { href: `#/p/${pid}/book?tab=pages` }, t(key));
  const body = h('div.narrow');

  const select = (target, key, options) => {
    const sel = h('select.input', options.map(([value, label]) => h('option', { value }, label)));
    sel.value = String(target[key]);
    sel.addEventListener('change', () => { target[key] = sel.value; draw(); });
    return sel;
  };
  const check = (label, get, set, redraw) => {
    const box = h('input', { type: 'checkbox' });
    box.checked = !!get();
    box.addEventListener('change', () => { set(box.checked); if (redraw) draw(); });
    return h('label.form-check', box, h('span', label));
  };
  const number = (target, key, attrs) => {
    const input = h('input.input', { type: 'number', ...attrs });
    input.value = target[key];
    input.addEventListener('change', () => {
      const v = Number(input.value);
      target[key] = input.value === '' ? '' : Math.max(attrs.min, Math.min(attrs.max, Number.isFinite(v) ? v : attrs.min));
      draw();
    });
    return input;
  };
  const row = (label, control, hint) => h('label.form-row', h('span.form-label', label), control, hint ? h('span.form-hint', hint) : null);

  const novel = () => o.what === 'novel';
  const preset = () => (novel() ? o.preset : 'custom');

  /** Opciones de construcción y de formato según el tipo de exportación. */
  const plan = () => {
    const p = store.project;
    // Datos del libro (los de «Libro → Datos»): van a la portadilla y, en el ebook, a sus metadatos.
    const d = p.data || {};
    const base = {
      title: p.name, author: p.author || t('book.anonymous'), lang: p.language,
      series: d.series || '', seriesIndex: d.series && d.seriesIndex !== '' && d.seriesIndex != null ? Number(d.seriesIndex) : null,
      published: d.published || '', publisher: d.publisher || '', description: htmlToText(d.synopsis || '') || d.logline || '',
    };
    const withMatter = o.useMatter ? matter : null;
    switch (preset()) {
      case 'manuscript': {
        const [pageW, pageH] = MS_PAGES[o.ms.page] || MS_PAGES.a4;
        const words = store.totalWords();
        const rounded = words >= 10000 ? Math.round(words / 1000) * 1000 : Math.round(words / 100) * 100;
        const surname = (p.author || '').trim().split(/\s+/).pop() || '';
        return {
          format: o.ms.format,
          build: { titlePage: true, chapterTitle: o.chapterTitle, separator: '#', sceneTitles: false, glossary: false, theEnd: true,
            manuscript: { contact: matter.contact || '', count: t('export.msCount', { n: formatNumber(rounded) }) } },
          // Formato estándar: 12 puntos, doble espacio, márgenes de 2,5 cm, sin justificar y con
          // apellido, título y número de página en la cabecera.
          opts: { ...base, font: o.ms.font, size: 12, indent: true,
            layout: { pageW, pageH, top: 25.4, bottom: 25.4, inner: 25.4, outer: 25.4, lineHeight: 2, chapterDrop: true, header: `${surname ? surname + ' / ' : ''}${p.name.toUpperCase()} / ` } },
        };
      }
      case 'print': {
        const { layout } = printLayout(o.print);
        return {
          format: o.print.format,
          build: { titlePage: true, chapterTitle: o.chapterTitle, separator: o.separator, sceneTitles: o.sceneTitles, glossary: o.glossary, matter: withMatter, recto: !!o.print.recto },
          opts: { ...base, font: o.print.font, size: Number(o.print.size) || 11, indent: true, layout },
        };
      }
      case 'ebook':
        return {
          format: 'epub',
          // El libro electrónico lleva la portada del proyecto, si la hay.
          build: { titlePage: true, chapterTitle: o.chapterTitle, separator: o.separator, sceneTitles: o.sceneTitles, glossary: o.glossary, matter: withMatter, cover: true },
          opts: { ...base, font: o.font, size: 12, indent: !!o.indent },
        };
      default:
        return {
          format: o.format,
          build: { ...o, matter: withMatter, cover: !!o.useMatter },
          opts: { ...base, font: o.font, size: Number(o.size) || 12, indent: !!o.indent },
        };
    }
  };

  const run = async () => {
    try {
      if (!novel() && o.format === 'epub') o.format = 'docx';
      await store.patchProjectData({ export: o });
      const p = store.project;
      const job = plan();
      const blocks = novel() ? await buildNovel(job.build) : await buildDossier(o.sections);
      const opts = novel() ? job.opts : { ...job.opts, title: `${p.name} — ${t('export.dossier')}` };
      const suffix = !novel() ? '-dossier' : preset() === 'manuscript' ? '-manuscrito' : preset() === 'print' ? '-interior' : '';
      if (job.format === 'pdf') {
        printDocument(blocks, opts);
        toast(t(preset() === 'print' ? 'export.pdfPrintHint' : 'export.pdfHint'), 'info', 9000);
        return;
      }
      const blob = { docx: toDocx, epub: toEpub, html: toHtml, txt: toTxt }[job.format](blocks, opts);
      downloadBlob(blob, `${slugify(p.name)}${suffix}.${job.format}`);
      toast(t('export.done'), 'success');
    } catch (err) {
      console.error(err);
      toast(errorText(err), 'error', 6000);
    }
  };

  const chapterOptions = () => [
    row(t('export.chapterTitle'), select(o, 'chapterTitle', [['both', t('export.chapterBoth')], ['title', t('export.chapterOnlyTitle')], ['number', t('export.chapterOnlyNumber')]])),
  ];
  const sceneOptions = () => [
    row(t('export.separator'), select(o, 'separator', SEPARATORS.map((s) => [s, s || t('export.blankLine')]))),
    check(t('export.sceneTitles'), () => o.sceneTitles, (v) => { o.sceneTitles = v; }),
    store.list('term').length ? check(t('export.glossary'), () => o.glossary !== false, (v) => { o.glossary = v; }) : null,
  ];
  const fontOptions = (target) => EXPORT_FONTS.map((f) => [f, t('export.font.' + f)]);

  const draw = () => {
    clear(body);
    const kind = preset();
    const panels = [];

    // ----- Qué y cómo -----
    const content = h('section.panel',
      h('h3', t('export.content')),
      row(t('export.what'), select(o, 'what', [['novel', t('export.novel')], ['dossier', t('export.dossier')]]), t(novel() ? 'export.novelHint' : 'export.dossierHint')));
    if (novel()) {
      content.append(row(t('export.preset'), select(o, 'preset', PRESETS.map((k) => [k, t('export.preset.' + k)])), t(`export.preset.${kind}.hint`)));
    } else {
      content.append(h('div.check-grid', DOSSIER_SECTIONS.map((key) => check(t('export.section.' + key), () => o.sections[key], (v) => { o.sections[key] = v; }))));
    }
    panels.push(content);

    if (kind === 'custom') {
      const formats = [['docx', t('export.docx')], ['pdf', t('export.pdf')], ['html', t('export.html')], ['txt', t('export.txt')]];
      if (novel()) formats.splice(1, 0, ['epub', t('export.epub')]);
      if (!novel() && o.format === 'epub') o.format = 'docx';
      content.append(row(t('export.format'), select(o, 'format', formats)));
      if (novel()) {
        content.append(...chapterOptions(), ...sceneOptions().filter(Boolean),
          check(t('export.titlePage'), () => o.titlePage, (v) => { o.titlePage = v; }));
      }
      panels.push(h('section.panel',
        h('h3', t('export.typography')),
        o.format === 'txt' ? h('p.muted', t('export.txtNoStyle')) : [
          row(t('settings.font'), select(o, 'font', fontOptions())),
          row(t('export.size'), number(o, 'size', { min: 8, max: 24, step: 1 })),
          check(t('settings.indent'), () => o.indent, (v) => { o.indent = v; }),
        ]));
    }

    if (kind === 'manuscript') {
      content.append(
        row(t('export.format'), select(o.ms, 'format', [['docx', t('export.docx')], ['pdf', t('export.pdf')]])),
        ...chapterOptions());
      panels.push(h('section.panel',
        h('h3', t('export.msTitle')),
        h('p.muted', t('export.msHint')),
        row(t('settings.font'), select(o.ms, 'font', [['mono', t('export.font.mono')], ['serif', t('export.font.serif')]])),
        row(t('export.pageSize'), select(o.ms, 'page', [['a4', 'A4 (210 × 297 mm)'], ['letter', t('export.letter')]])),
        h('p.form-hint', t(matter.contact ? 'export.contactSet' : 'export.contactMissing'), ' ', bookLink('export.editInBook'))));
    }

    if (kind === 'print') {
      const pr = o.print;
      const { pages, layout } = printLayout(pr);
      const real = Number(pr.realPages) > 0 ? Number(pr.realPages) : 0;
      const spine = (n) => (n * PAPERS[pr.paper] || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      content.append(
        row(t('export.format'), select(pr, 'format', [['pdf', t('export.pdf')], ['docx', t('export.docx')]])),
        ...chapterOptions(), ...sceneOptions().filter(Boolean));
      panels.push(h('section.panel',
        h('h3', t('export.printTitle')),
        h('div.field-grid',
          row(t('export.trim'), select(pr, 'trim', Object.keys(TRIMS).map((k) => [k, t('export.trim.' + k)]))),
          row(t('settings.font'), select(pr, 'font', fontOptions())),
          row(t('export.size'), number(pr, 'size', { min: 8, max: 16, step: 0.5 })),
          row(t('export.lineHeight'), number(pr, 'line', { min: 1, max: 2, step: 0.05 })),
          row(t('export.paper'), select(pr, 'paper', [['cream', t('export.paper.cream')], ['white', t('export.paper.white')]])),
          row(t('export.realPages'), number(pr, 'realPages', { min: 0, max: 5000, step: 1, placeholder: String(pages) }), t('export.realPagesHint'))),
        check(t('export.recto'), () => pr.recto, (v) => { pr.recto = v; }, true),
        h('div.print-estimate',
          h('div', h('span.print-figure', real ? formatNumber(real) : '≈ ' + formatNumber(pages)), h('span.muted', t(real ? 'export.pagesReal' : 'export.pagesEstimated'))),
          h('div', h('span.print-figure', `${real ? '' : '≈ '}${spine(real || pages)} mm`), h('span.muted', t('export.spine'))),
          h('div', h('span.print-figure', `${layout.inner} / ${layout.outer} mm`), h('span.muted', t('export.margins')))),
        h('p.form-hint', t('export.printHint'))));
    }

    if (kind === 'ebook') {
      content.append(...chapterOptions(), ...sceneOptions().filter(Boolean), check(t('settings.indent'), () => o.indent, (v) => { o.indent = v; }));
    }

    // ----- Páginas preliminares y finales (libro impreso, ebook y formato libre) -----
    if (novel() && kind !== 'manuscript') {
      panels.push(h('section.panel',
        h('h3', t('matter.title')),
        check(t('matter.use'), () => o.useMatter, (v) => { o.useMatter = v; }),
        h('p.form-hint', t(hasMatter ? 'export.matterSet' : 'export.matterMissing'), ' ', bookLink('export.editInBook'))));
    }

    const format = plan().format;
    body.append(...panels,
      h('div.form-actions', btn(t(format === 'pdf' ? 'export.print' : 'export.run'), { icon: 'download', kind: 'primary', onClick: run })),
      h('section.panel',
        h('h3', t('projects.backup')),
        h('div.tool-row', h('p.muted', t('project.backupHint')), btn(t('projects.backup'), { icon: 'download', onClick: async () => {
          try { await store.flush(); await downloadBackup(pid); } catch (err) { toast(errorText(err), 'error'); }
        } }))));
  };

  clear(el);
  el.append(pageHeader({ title: t('nav.export'), subtitle: t('export.hint') }), body);
  draw();
}
