// Ficha de personaje principal: entrevista por secciones (preguntas o texto libre),
// vida anterior, conflicto, evolución, imágenes, eventos y apariciones.
import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';
import { store } from '../store.js';
import { uid, htmlToText, escapeHtml } from '../text.js';
import { createEditor } from '../editor.js';
import { btn, addBtn, pageHeader, statusDot, statusPicker, promptDialog, confirmDialog, menuButton, notFound, titleInput, tabs, toast, errorText } from '../ui.js';
import { CHARACTER_SECTIONS, characterStatus, displayName, questionsFor, characterSegments } from '../model.js';
import { imagesPanel, eventsPanel, appearsPanel, autosaveDelay, traitsPanel, aliasesField, roleField, titleWithCode, lifeDatesPanel } from '../components.js';
import { entityDetailPage } from './entities.js';
import { exportEntityDialog } from '../export/sheet.js';
import { tasksPanel } from '../tasks.js';
import { referencesPanel } from '../refs.js';
import { notesPanel } from '../notes.js';
import { relationsPanel } from '../sheetrelations.js';
import { sheetImport } from '../elementio.js';

/** Texto único con todo lo escrito de un personaje (para pasarlo a secundario). */
function composeBody(c) {
  let out = '';
  for (const s of CHARACTER_SECTIONS) {
    const sec = (c.data.sections || {})[s.key];
    if (!sec) continue;
    let html = sec.free || '';
    if (s.interview && sec.mode !== 'free') {
      html = questionsFor(s.key).map((q) => ((sec.answers || {})[q.k] ? `<p><b>${escapeHtml(q.text)}</b></p>${sec.answers[q.k]}` : '')).join('');
    }
    if (htmlToText(html)) out += `<p><b>${t('section.' + s.key)}</b></p>${html}`;
  }
  return out;
}

export async function characterPage(ctx) {
  const { el, pid, params, refresh } = ctx;
  const c = store.get(params.id);
  if (!c || c.type !== 'character') return notFound(el, pid);
  if (c.data.kind === 'secondary') return entityDetailPage('character')(ctx);

  let tab = CHARACTER_SECTIONS[0].key;
  let editor = null;
  const questionIndex = {};

  const dropEditor = () => {
    if (!editor) return;
    editor.flush();
    editor.destroy();
    editor = null;
  };

  const section = (key) => (c.data.sections || {})[key] || {};
  const setSection = (key, patch, delay = 0) => {
    const sections = { ...(c.data.sections || {}) };
    sections[key] = { ...(sections[key] || {}), ...patch };
    const data = { ...c.data, sections };
    return store.update(c.id, { data, status: characterStatus(data) }, delay);
  };

  // Rasgos clave: se vuelven a extraer del texto poco después de cada cambio.
  const traits = traitsPanel(c, () => characterSegments(c));
  let traitsTimer = null;

  const newEditor = (value, onChange) => {
    editor = createEditor({
      value, toolbar: 'basic', lang: store.project.language, placeholder: t('editor.placeholder'),
      onChange: (html, stats) => {
        onChange(html, stats);
        clearTimeout(traitsTimer);
        traitsTimer = setTimeout(() => traits.refresh(), 600);
      },
      onSave: () => store.flush(),
    });
    return editor.el;
  };

  const navEl = h('nav.section-nav', { 'aria-label': t('character.sections') });
  const contentEl = h('div.section-content');

  const drawNav = () => {
    clear(navEl);
    const item = (key, label, dot) => h('button', {
      type: 'button', class: 'section-nav-item' + (tab === key ? ' active' : ''),
      onclick: () => { if (tab !== key) { tab = key; draw(); } },
    }, dot, h('span', label));
    for (const s of CHARACTER_SECTIONS) navEl.append(item(s.key, t('section.' + s.key), statusDot(section(s.key).status)));
    navEl.append(h('div.nav-sep'),
      item('relations', t('rel.title'), icon('share', 15)),
      item('images', t('images.title'), icon('image', 15)),
      item('events', t('events.title'), icon('clock', 15)),
      item('appears', t('appears.title'), icon('book', 15)),
      item('tasks', t('tasks.title'), icon('flag', 15)),
      item('refs', t('reference.plural'), icon('paperclip', 15)));
  };

  const drawInterview = (key, sec) => {
    const mode = sec.mode === 'free' ? 'free' : 'questions';
    contentEl.append(tabs(
      [{ key: 'questions', label: t('character.modeQuestions') }, { key: 'free', label: t('character.modeFree') }],
      mode,
      async (m) => { dropEditor(); await setSection(key, { mode: m }); draw(); }));

    if (mode === 'free') {
      contentEl.append(newEditor(sec.free || '', (html) => setSection(key, { free: html }, autosaveDelay())));
      return;
    }

    const questions = questionsFor(key);
    const answers = sec.answers || {};
    let idx = Math.min(questionIndex[key] || 0, Math.max(0, questions.length - 1));
    questionIndex[key] = idx;
    const q = questions[idx];
    const move = (to) => { questionIndex[key] = to; draw(); };

    const select = h('select.input.question-select', { 'aria-label': t('character.question') },
      questions.map((item, i) => h('option', { value: i }, `${htmlToText(answers[item.k] || '') ? '✓' : '○'} ${i + 1}. ${item.text}`)));
    select.value = String(idx);
    select.addEventListener('change', () => move(Number(select.value)));

    const addQuestion = async () => {
      const text = await promptDialog({ title: t('character.addQuestion'), label: t('character.question'), submitLabel: t('common.create') });
      if (!text) return;
      dropEditor();
      const all = { ...(store.project.data.customQuestions || {}) };
      all[key] = [...(all[key] || []), { id: uid(), text }];
      try {
        await store.patchProjectData({ customQuestions: all });
        questionIndex[key] = questionsFor(key).length - 1;
      } catch (err) { toast(errorText(err), 'error'); }
      draw();
    };
    const removeQuestion = async () => {
      if (!(await confirmDialog(t('character.confirmDeleteQuestion'), { danger: true, confirmLabel: t('common.delete') }))) return;
      dropEditor();
      const all = { ...(store.project.data.customQuestions || {}) };
      all[key] = (all[key] || []).filter((x) => x.id !== q.id);
      try {
        await store.patchProjectData({ customQuestions: all });
      } catch (err) { toast(errorText(err), 'error'); }
      questionIndex[key] = Math.max(0, idx - 1);
      draw();
    };

    contentEl.append(h('div.question-bar',
      btn('', { icon: 'chevron-left', small: true, title: t('editor.previous'), onClick: () => move((idx - 1 + questions.length) % questions.length) }),
      select,
      btn('', { icon: 'chevron-right', small: true, title: t('editor.next'), onClick: () => move((idx + 1) % questions.length) }),
      addBtn(addQuestion, t('character.addQuestion')),
      q && q.custom ? btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('character.deleteQuestion'), onClick: removeQuestion }) : null));
    if (!q) return;
    contentEl.append(
      h('p.question-text', q.text),
      newEditor(answers[q.k] || '', (html) => setSection(key, { answers: { ...(section(key).answers || {}), [q.k]: html } }, autosaveDelay())));
  };

  const draw = () => {
    dropEditor();
    drawNav();
    clear(contentEl);
    if (tab === 'relations') { contentEl.append(relationsPanel(c)); return; }
    if (tab === 'images') { contentEl.append(imagesPanel(c)); return; }
    if (tab === 'events') { contentEl.append(eventsPanel(c)); return; }
    if (tab === 'appears') { contentEl.append(appearsPanel(c)); return; }
    if (tab === 'tasks') { contentEl.append(tasksPanel({ contextId: c.id, data: { entityId: c.id } }).el); return; }
    if (tab === 'refs') { contentEl.append(referencesPanel(c).el, notesPanel(c)); return; }
    const def = CHARACTER_SECTIONS.find((s) => s.key === tab);
    const sec = section(tab);
    contentEl.append(h('div.section-content-head',
      h('div', h('h2', t('section.' + tab)), h('p.muted', t(`section.${tab}.hint`))),
      statusPicker(sec.status || 0, async (s) => { await setSection(tab, { status: s }); drawNav(); })));
    if (def.interview) drawInterview(tab, sec);
    else contentEl.append(newEditor(sec.free || '', (html) => setSection(tab, { free: html }, autosaveDelay())));
  };

  // Importar en esta ficha (papel, alias, fechas…; las secciones de un principal no se sustituyen).
  const imp = sheetImport(c, refresh);
  const menu = menuButton(() => [
    { label: t('sheet.export'), icon: 'download', onClick: () => { if (editor) editor.flush(); exportEntityDialog(c); } },
    { ...imp.item, onClick: () => { if (editor) editor.flush(); imp.item.onClick(); } },
    { label: t('character.toSecondary'), icon: 'users', onClick: async () => {
      if (!(await confirmDialog(t('character.confirmToSecondary')))) return;
      dropEditor();
      await store.update(c.id, { body: c.body || composeBody(c), data: { ...c.data, kind: 'secondary' } });
      refresh();
    } },
    { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
      if (!(await confirmDialog(t('common.confirmDelete', { name: displayName(c) }), { danger: true, confirmLabel: t('common.delete') }))) return;
      dropEditor();
      try {
        await store.remove(c.id);
        location.hash = `#/p/${pid}/characters`;
      } catch (err) { toast(errorText(err), 'error'); }
    } },
  ]);

  clear(el);
  el.append(
    imp.input,
    pageHeader({
      back: { href: `#/p/${pid}/characters`, label: t('character.plural') },
      titleNode: titleWithCode(c, titleInput(c.name, (name) => store.update(c.id, { name }))),
      actions: [h('span.badge', t('character.main')), menu],
    }),
    h('div.char-top', traits.el, h('section.panel', roleField(c), aliasesField(c), lifeDatesPanel(c))),
    h('div.char-layout', navEl, contentEl));
  draw();

  return async () => {
    clearTimeout(traitsTimer);
    dropEditor();
    traits.refresh();
  };
}
