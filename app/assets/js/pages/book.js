// «Libro»: todo lo que describe la novela como libro, reunido en un sitio. Título, autor e
// idioma; objetivos de escritura; páginas preliminares y finales (créditos, dedicatoria, cita,
// agradecimientos, sobre el autor y su foto); datos de contacto para el manuscrito; y las
// operaciones sobre el proyecto entero (copia, secuela, borrado).
import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { createEditor } from '../editor.js';
import { btn, pageHeader, tabs, toast, errorText, confirmDialog, promptDialog } from '../ui.js';
import { PROJECT_LANGUAGES } from '../model.js';
import { downloadBackup, createSequel } from '../backup.js';
import { matterHtml } from '../export/build.js';

const TABS = ['details', 'goals', 'pages', 'project'];
const MATTER = ['copyright', 'dedication', 'epigraph', 'acknowledgments', 'about'];

export async function bookPage({ el, pid, query }) {
  const p = store.project;
  let tab = TABS.includes(query.tab) ? query.tab : 'details';
  const tabsEl = h('div');
  const body = h('div.narrow');
  const row = (label, control, hint) => h('label.form-row', h('span.form-label', label), control, hint ? h('span.form-hint', hint) : null);

  // ---------- Páginas preliminares y finales: se guardan solas poco después de cada cambio ----------

  const matter = { ...(p.data.matter || {}) };
  // Lo escrito con versiones anteriores era texto plano: se pasa a párrafos.
  for (const key of MATTER) matter[key] = matterHtml(matter[key]);
  let editors = [];
  let timer = null;
  const saveMatter = async () => {
    clearTimeout(timer);
    timer = null;
    try { await store.patchProjectData({ matter: { ...matter } }); } catch (err) { toast(errorText(err), 'error'); }
  };
  const saveMatterSoon = () => {
    clearTimeout(timer);
    timer = setTimeout(saveMatter, 1200);
  };
  const flushMatter = async () => {
    for (const e of editors) e.flush();
    if (timer) await saveMatter();
    if (synopsisTimer) await saveSynopsis();
  };
  const dropEditors = () => {
    for (const e of editors) { e.flush(); e.destroy(); }
    editors = [];
  };

  const matterField = (key, tall) => {
    const editor = createEditor({
      value: matter[key] || '', toolbar: 'basic', lang: p.language, placeholder: t(`matter.${key}.placeholder`),
      onChange: (html) => { matter[key] = html; saveMatterSoon(); },
      onSave: saveMatter,
    });
    editors.push(editor);
    return h('div', { class: 'matter-field' + (tall ? ' tall' : '') }, h('span.form-label', t('matter.' + key)), editor.el);
  };

  /** Foto del autor: se guarda como imagen del proyecto y sale encima de «Sobre el autor». */
  const photoBox = h('div.author-photo');
  const drawPhoto = () => {
    clear(photoBox);
    const img = matter.photo ? store.images.find((i) => i.id === matter.photo) : null;
    const input = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp', hidden: true });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const next = await store.uploadImage(null, file);
        if (img) await store.deleteImage(img.id);
        matter.photo = next.id;
        await saveMatter();
      } catch (err) { toast(errorText(err), 'error'); }
      drawPhoto();
    });
    photoBox.append(
      img ? h('img', { src: api.imageUrl(img), alt: t('matter.photo') }) : h('span.placeholder', icon('user', 30)),
      h('div.author-photo-text',
        h('p.muted', t('matter.photoHint')),
        h('div.btn-row',
          btn(t(img ? 'matter.photoChange' : 'matter.photoAdd'), { icon: 'upload', small: true, onClick: () => input.click() }),
          img ? btn(t('matter.photoRemove'), { icon: 'trash', small: true, kind: 'ghost', onClick: async () => {
            try {
              await store.deleteImage(img.id);
              matter.photo = '';
              await saveMatter();
            } catch (err) { toast(errorText(err), 'error'); }
            drawPhoto();
          } }) : null)),
      input);
  };

  // ---------- Portada y sinopsis ----------
  // La portada es una imagen del proyecto (data.cover); la frase de presentación y la sinopsis
  // se guardan en los datos del proyecto y se guardan solas, como las páginas preliminares.

  let synopsis = p.data.synopsis || '';
  let synopsisTimer = null;
  const saveSynopsis = async () => {
    clearTimeout(synopsisTimer);
    synopsisTimer = null;
    try { await store.patchProjectData({ synopsis }); } catch (err) { toast(errorText(err), 'error'); }
  };

  const coverBox = h('div.cover-box');
  const drawCoverBox = () => {
    clear(coverBox);
    const img = p.data.cover ? store.images.find((i) => i.id === p.data.cover) : null;
    const input = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', hidden: true });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const next = await store.uploadImage(null, file);
        if (img) await store.deleteImage(img.id);
        await store.patchProjectData({ cover: next.id });
      } catch (err) { toast(errorText(err), 'error'); }
      drawCoverBox();
    });
    coverBox.append(
      img ? h('img.cover-image', { src: api.imageUrl(img), alt: t('cover.title') }) : h('span.cover-image.placeholder', icon('image', 34), h('span', t('cover.none'))),
      h('div.cover-text',
        h('p.muted', t('cover.hint')),
        h('div.btn-row',
          btn(t(img ? 'cover.change' : 'cover.add'), { icon: 'upload', small: true, onClick: () => input.click() }),
          img ? btn(t('matter.photoRemove'), { icon: 'trash', small: true, kind: 'ghost', onClick: async () => {
            try {
              await store.deleteImage(img.id);
              await store.patchProjectData({ cover: '' });
            } catch (err) { toast(errorText(err), 'error'); }
            drawCoverBox();
          } }) : null)),
      input);
  };

  // ---------- Pestañas ----------

  const input = (type, value, attrs = {}) => {
    const i = h('input.input', { type, ...attrs });
    if (value != null) i.value = value;
    return i;
  };
  /** Rótulo de un dato del libro, con la marca de obligatorio u opcional. */
  const label = (key, required) => h('span.form-label', t(key), h('span', { class: 'field-mark' + (required ? ' required' : '') }, t(required ? 'book.required' : 'book.optional')));
  const field = (key, control, { required = false, hint } = {}) => h('label.form-row', label(key, required), control, hint ? h('span.form-hint', hint) : null);

  // «Datos»: todo lo que identifica al libro y acompaña a los archivos exportados (portadilla
  // y datos del ebook): título, autor, serie, fecha, idioma, editorial, portada y sinopsis.
  const drawDetails = () => {
    const d = p.data;
    const name = input('text', p.name, { maxlength: 250, required: true });
    const author = input('text', p.author, { maxlength: 250, placeholder: t('book.anonymous') });
    const series = input('text', d.series || '', { maxlength: 200 });
    const seriesIndex = input('number', d.seriesIndex || '', { min: 0, step: 'any', placeholder: '1' });
    const published = input('date', d.published || '');
    const publisher = input('text', d.publisher || '', { maxlength: 200 });
    const language = h('select.input', { required: true }, PROJECT_LANGUAGES.map(([value, text]) => h('option', { value }, text)));
    language.value = p.language;
    const logline = input('text', d.logline || '', { maxlength: 300, placeholder: t('synopsis.loglinePlaceholder') });
    const editor = createEditor({
      value: synopsis, toolbar: 'basic', lang: p.language, placeholder: t('synopsis.placeholder'),
      onChange: (html) => {
        synopsis = html;
        clearTimeout(synopsisTimer);
        synopsisTimer = setTimeout(saveSynopsis, 1200);
      },
      onSave: saveSynopsis,
    });
    editors.push(editor);

    body.append(h('form.form.panel', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        await store.updateProject({
          name: name.value.trim(), author: author.value.trim(), language: language.value,
          data_patch: {
            series: series.value.trim(), seriesIndex: series.value.trim() && seriesIndex.value !== '' ? Number(seriesIndex.value) : '',
            published: published.value || '', publisher: publisher.value.trim(), logline: logline.value.trim(), synopsis,
          },
        });
        clearTimeout(synopsisTimer);
        synopsisTimer = null;
        toast(t('common.saved'), 'success');
      } catch (err) {
        toast(errorText(err), 'error');
      }
    } },
      h('h3', t('project.details')),
      h('p.muted', t('book.detailsHint')),
      h('div.book-data',
        h('div.book-fields',
          field('project.name', name, { required: true }),
          field('project.author', author, { hint: t('book.authorHint') }),
          h('div.field-pair',
            field('book.series', series, { hint: t('book.seriesHint') }),
            field('book.seriesIndex', seriesIndex)),
          h('div.field-pair',
            field('book.published', published),
            field('project.language', language, { required: true })),
          field('book.publisher', publisher)),
        h('div.book-cover', h('span.form-label', t('cover.title'), h('span.field-mark', t('book.optional'))), coverBox)),
      h('h3', t('synopsis.title')),
      field('synopsis.logline', logline, { hint: t('synopsis.loglineHint') }),
      h('div.matter-field.tall', label('synopsis.text', false), editor.el, h('span.form-hint', t('book.synopsisHint'))),
      h('div.form-actions', btn(t('common.save'), { kind: 'primary', type: 'submit', icon: 'check' }))));
    drawCoverBox();
  };

  const drawGoals = () => {
    const goals = p.data.goals || {};
    const gWords = input('number', goals.words || '', { min: 0, step: 1000, placeholder: '80000' });
    const gDay = input('number', goals.perDay || '', { min: 0, step: 50, placeholder: '500' });
    const gDeadline = input('date', goals.deadline || '');
    const gChapter = input('number', goals.chapterWords || '', { min: 0, step: 500, placeholder: '3000' });
    body.append(h('form.form.panel', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        // Los objetivos van como una clave suelta de los datos: no pisa lo demás del proyecto.
        await store.patchProjectData({ goals: { words: Number(gWords.value) || 0, perDay: Number(gDay.value) || 0, deadline: gDeadline.value || '', chapterWords: Number(gChapter.value) || 0 } });
        toast(t('common.saved'), 'success');
      } catch (err) {
        toast(errorText(err), 'error');
      }
    } },
      h('h3', t('goals.title')),
      row(t('goals.total'), gWords, t('goals.totalHint')),
      row(t('goals.daily'), gDay),
      row(t('goals.deadline'), gDeadline),
      row(t('goals.chapter'), gChapter, t('goals.chapterHint')),
      h('div.form-actions', btn(t('common.save'), { kind: 'primary', type: 'submit', icon: 'check' }))));
  };

  const drawPages = () => {
    const contact = h('textarea.input', { rows: 4, maxlength: 2000, placeholder: t('matter.contact.placeholder') });
    contact.value = matter.contact || '';
    contact.addEventListener('change', () => { matter.contact = contact.value.trim(); saveMatter(); });
    body.append(
      h('section.panel',
        h('h3', t('matter.front')),
        h('p.muted', t('matter.hint')),
        matterField('copyright'), matterField('dedication'), matterField('epigraph')),
      h('section.panel',
        h('h3', t('matter.back')),
        matterField('acknowledgments', true), matterField('about', true), photoBox),
      h('section.panel',
        h('h3', t('matter.contactTitle')),
        h('p.muted', t('matter.contactHint')),
        row(t('matter.contact'), contact)));
    drawPhoto();
  };

  const drawProject = () => {
    body.append(h('section.panel',
      h('div.tool-row', h('div', h('strong', t('projects.backup')), h('p.muted', t('project.backupHint'))),
        btn(t('projects.backup'), { icon: 'download', onClick: async () => {
          try { await store.flush(); await downloadBackup(pid); } catch (err) { toast(errorText(err), 'error'); }
        } })),
      h('div.tool-row', h('div', h('strong', t('projects.sequel')), h('p.muted', t('project.sequelHint'))),
        btn(t('projects.sequel'), { icon: 'copy', onClick: async () => {
          const sequelName = await promptDialog({ title: t('projects.sequel'), label: t('projects.sequelName'), value: t('projects.sequelDefault', { name: p.name }), submitLabel: t('common.create') });
          if (!sequelName) return;
          try {
            await store.flush();
            toast(t('projects.creatingSequel'), 'info');
            const newId = await createSequel(pid, sequelName);
            location.hash = `#/p/${newId}`;
          } catch (err) { toast(errorText(err), 'error'); }
        } })),
      h('div.tool-row.danger-zone', h('div', h('strong', t('project.delete')), h('p.muted', t('project.deleteHint'))),
        btn(t('project.delete'), { icon: 'trash', kind: 'danger', onClick: async () => {
          if (!(await confirmDialog(t('projects.confirmDelete', { name: p.name }), { danger: true, confirmLabel: t('common.delete') }))) return;
          try {
            await store.flush();
            await api.post(`projects/${pid}/delete`);
            store.close();
            location.hash = '#/';
          } catch (err) { toast(errorText(err), 'error'); }
        } }))));
  };

  const draw = async () => {
    await flushMatter();
    dropEditors();
    clear(tabsEl).append(tabs(TABS.map((key) => ({ key, label: t('book.tab.' + key) })), tab, (key) => { tab = key; draw(); }));
    clear(body);
    if (tab === 'pages') drawPages();
    else if (tab === 'goals') drawGoals();
    else if (tab === 'project') drawProject();
    else drawDetails();
  };

  clear(el);
  el.append(pageHeader({ title: t('nav.book'), subtitle: t('book.hint') }), tabsEl, body);
  await draw();

  return async () => {
    await flushMatter();
    dropEditors();
  };
}
