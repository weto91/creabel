// Importar un borrador escrito en otro programa (DOCX u ODT): se elige cómo dividirlo en
// capítulos y escenas, se revisa el resultado y se añade al final de la novela.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { uid, formatNumber } from '../text.js';
import { btn, pageHeader, toast, errorText } from '../ui.js';
import { chapterKind } from '../model.js';
import { getPrefs } from '../prefs.js';
import { readDraft, draftSignals, splitDraft } from '../import/draft.js';
import { detectAllScenes } from '../mentions.js';

export async function importPage({ el, pid }) {
  let files = []; // [{ name, paras }]
  let mode = 'auto';
  let blankScenes = false;
  let chapters = []; // resultado de la división, con `on` (se importa) y `title` editables
  let busy = false;
  const body = h('div.narrow.import');

  const input = h('input', { type: 'file', accept: '.docx,.odt', multiple: true, hidden: true });
  input.addEventListener('change', async () => {
    const picked = [...input.files];
    input.value = '';
    if (!picked.length) return;
    const read = [];
    for (const file of picked.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
      try {
        read.push({ name: file.name, paras: await readDraft(file) });
      } catch (err) {
        console.error(err);
        toast(t('import.badFile', { name: file.name }), 'error', 6000);
      }
    }
    if (!read.length) return;
    files = read;
    mode = 'auto';
    split();
    draw();
  });

  const many = () => files.length > 1;
  const signals = () => draftSignals(files[0].paras);

  /** Reparte los archivos leídos en capítulos según las opciones elegidas. */
  function split() {
    if (many()) {
      // Un archivo por capítulo: el título es su primer título de sección o el nombre del archivo.
      chapters = files.map((f) => {
        const first = f.paras.find((p) => p.text && !p.skip);
        const titled = first && first.level ? first : null;
        const parts = splitDraft(titled ? f.paras.filter((p) => p !== titled) : f.paras, { mode: 'none', blankScenes });
        const scenes = parts.flatMap((c) => c.scenes);
        return {
          title: titled ? titled.text : f.name.replace(/\.(docx|odt)$/i, '').replace(/^[\d\s._-]+(?=\S)/, ''),
          kind: 'chapter', part: null, lead: false, scenes, words: scenes.reduce((sum, s) => sum + s.words, 0),
        };
      }).filter((c) => c.scenes.length);
    } else {
      chapters = splitDraft(files[0].paras, { mode: mode === 'auto' ? signals().auto : mode, blankScenes });
    }
    // El texto suelto anterior al primer capítulo suele ser la portada: no se marca si es corto.
    for (const c of chapters) c.on = !(c.lead && c.words < 80);
  }

  const run = async () => {
    const chosen = chapters.filter((c) => c.on);
    if (!chosen.length || busy) return;
    busy = true;
    draw();
    try {
      await store.flush();
      const existing = store.list('chapter');
      const hasKind = (kind) => existing.some((c) => chapterKind(c) === kind);
      let position = existing.reduce((max, c) => Math.max(max, c.position), -1) + 1;
      let partPosition = store.list('part').reduce((max, p) => Math.max(max, p.position), -1) + 1;
      const partIds = new Map();
      const used = new Set();
      const entities = [];
      const entity = (fields) => entities.push({ parent_id: null, position: 0, name: '', status: 0, data: {}, body: '', words: 0, chars: 0, ...fields });

      for (const c of chosen) {
        let parent = null;
        if (c.part) {
          if (!partIds.has(c.part)) {
            partIds.set(c.part, uid());
            entity({ id: partIds.get(c.part), type: 'part', name: c.part.slice(0, 250), position: partPosition++ });
          }
          parent = partIds.get(c.part);
        }
        // Solo puede haber un prólogo y un epílogo: si ya existen, entra como capítulo normal.
        let kind = c.kind;
        if (kind !== 'chapter' && (hasKind(kind) || used.has(kind))) kind = 'chapter';
        used.add(kind);
        const chapterId = uid();
        const name = (c.title || (kind !== c.kind ? t('chapters.' + c.kind) : '')).slice(0, 250);
        entity({ id: chapterId, type: 'chapter', parent_id: kind === 'chapter' ? parent : null, position: position++, name, data: { kind } });
        c.scenes.forEach((s, i) => {
          const sceneId = uid();
          const revId = uid();
          entity({ id: sceneId, type: 'scene', parent_id: chapterId, position: i, name: (s.title || t('import.sceneN', { n: i + 1 })).slice(0, 250), data: { activeRevision: revId }, words: s.words, chars: s.chars });
          entity({ id: revId, type: 'revision', parent_id: sceneId, position: 1, body: s.html, words: s.words, chars: s.chars });
        });
      }

      // En bloques moderados, para no superar el límite de subida del servidor.
      let chunk = [];
      let size = 0;
      const send = async () => {
        if (!chunk.length) return;
        await api.post(`projects/${pid}/bulk`, { entities: chunk });
        chunk = [];
        size = 0;
      };
      for (const e of entities) {
        const weight = e.body.length + 400;
        if (chunk.length && size + weight > 600000) await send();
        chunk.push(e);
        size += weight;
      }
      await send();

      await store.open(pid);
      store.logWordsSoon();
      // Con la detección automática activada, las escenas importadas quedan ya etiquetadas.
      if (getPrefs().autoTags !== false) {
        try { await detectAllScenes(); } catch (err) { /* la importación ya está hecha; las etiquetas se pueden detectar después */ }
      }
      toast(tn('import.done', chosen.length), 'success', 5000);
      location.hash = `#/p/${pid}/chapters`;
    } catch (err) {
      console.error(err);
      busy = false;
      toast(errorText(err), 'error', 6000);
      draw();
    }
  };

  function draw() {
    clear(body);
    body.append(h('section.panel',
      h('h3', t('import.file')),
      h('p.muted', t('import.fileShort')),
      h('div.btn-row', btn(t(files.length ? 'import.chooseOther' : 'import.choose'), { icon: 'upload', kind: files.length ? 'default' : 'primary', onClick: () => input.click() })),
      files.length ? h('ul.import-files', files.map((f) => h('li', icon('note', 15), h('span', f.name),
        h('span.muted', tn('count.words', f.paras.reduce((sum, p) => sum + (p.text ? p.text.split(/\s+/).length : 0), 0)))))) : null,
      input));
    if (!files.length) return;

    // ----- Opciones de división -----
    const options = h('section.panel', h('h3', t('import.split')));
    if (many()) {
      options.append(h('p.muted', t('import.perFile')));
    } else {
      const s = signals();
      const sel = h('select.input',
        h('option', { value: 'auto' }, t('import.mode.auto')),
        s.levels.map(([level, n]) => h('option', { value: 'h' + level }, t('import.mode.heading', { level, n }))),
        s.pattern ? h('option', { value: 'pattern' }, t('import.mode.pattern', { n: s.pattern })) : null,
        s.pageBreaks ? h('option', { value: 'pagebreak' }, t('import.mode.pagebreak', { n: s.pageBreaks })) : null,
        h('option', { value: 'none' }, t('import.mode.none')));
      sel.value = mode;
      sel.addEventListener('change', () => { mode = sel.value; split(); draw(); });
      const how = s.auto === 'none' ? t('import.auto.none') : s.auto === 'pattern' ? t('import.auto.pattern') : s.auto === 'pagebreak' ? t('import.auto.pagebreak') : t('import.auto.heading', { level: s.auto.slice(1) });
      options.append(h('label.form-row', h('span.form-label', t('import.chaptersBy')), sel, mode === 'auto' ? h('span.form-hint', how) : null));
    }
    const blank = h('input', { type: 'checkbox' });
    blank.checked = blankScenes;
    blank.addEventListener('change', () => { blankScenes = blank.checked; split(); draw(); });
    options.append(h('label.form-check', blank, h('span', t('import.blankScenes'))));
    body.append(options);

    // ----- Vista previa -----
    const chosen = chapters.filter((c) => c.on);
    const sceneCount = chosen.reduce((sum, c) => sum + c.scenes.length, 0);
    const words = chosen.reduce((sum, c) => sum + c.words, 0);
    const preview = h('section.panel', h('div.panel-head', h('h3', t('import.preview')),
      h('span.muted', `${tn('count.chapters', chosen.length)} · ${tn('count.scenes', sceneCount)} · ${tn('count.words', words)}`)));
    if (!chapters.length) preview.append(h('p.muted', t('import.empty')));
    let lastPart = null;
    for (const c of chapters) {
      if (c.part && c.part !== lastPart) {
        lastPart = c.part;
        preview.append(h('div.import-part', icon('folder', 15), h('span', c.part)));
      }
      const box = h('input', { type: 'checkbox', 'aria-label': t('import.include') });
      box.checked = c.on;
      box.addEventListener('change', () => { c.on = box.checked; draw(); });
      const title = h('input.input', { type: 'text', maxlength: 250, placeholder: c.lead ? t('import.leadText') : t('chapters.titlePlaceholder') });
      title.value = c.title;
      title.addEventListener('change', () => { c.title = title.value.trim(); });
      preview.append(h('div', { class: 'import-chapter' + (c.on ? '' : ' off') },
        h('div.import-chapter-head', box,
          c.kind !== 'chapter' ? h('span.badge', t('chapters.' + c.kind)) : c.lead ? h('span.badge', t('import.leadText')) : null,
          title,
          h('span.row-meta', `${tn('count.scenes', c.scenes.length)} · ${formatNumber(c.words)}`)),
        h('ol.import-scenes', c.scenes.map((s) => h('li',
          s.title ? h('strong', s.title + ' ') : null,
          h('span.muted', s.start + (s.start.length >= 100 ? '…' : '')),
          h('span.import-scene-words', formatNumber(s.words)))))));
    }
    body.append(preview,
      h('div.form-actions',
        btn(busy ? t('import.working') : tn('import.run', chosen.length), { icon: 'check', kind: 'primary', onClick: run })));
    if (!chosen.length || busy) body.querySelector('.form-actions .btn-primary').disabled = true;
  }

  // (Los detalles —formatos, cómo se separan las escenas, dónde se añade— están en la ayuda «?»: help.import.)
  clear(el);
  el.append(pageHeader({ title: t('import.title'), subtitle: t('import.hint'), back: { href: `#/p/${pid}/chapters`, label: t('nav.chapters') } }), body);
  draw();
}
