// Documentación: lista filtrable de referencias y ficha de cada una.
import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { excerpt } from '../text.js';
import { createEditor } from '../editor.js';
import { btn, chooseBtn, pageHeader, emptyState, promptDialog, confirmDialog, pickDialog, menuButton, notFound, titleInput, listSearch, toast, errorText } from '../ui.js';
import { chapterNumbers, displayName, entityHref, searchText } from '../model.js';
import { autosaveDelay } from '../components.js';
import { REFERENCE_KINDS, refKind, refIcon, refLinks, refSummary, safeUrl, isImage, linkLabel, linkTargets, filesPanel } from '../refs.js';

export async function libraryPage({ el, pid }) {
  let kind = '';
  const body = h('div');

  const add = async () => {
    const name = await promptDialog({ title: t('reference.add'), label: t('reference.titleLabel'), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const ref = await store.create('reference', { name, data: { kind: kind || 'link', links: [] } });
      location.hash = entityHref(ref);
    } catch (err) { toast(errorText(err), 'error'); }
  };

  const card = (ref) => {
    const image = store.imagesOf(ref.id).find(isImage);
    const text = excerpt(ref.body, 110);
    return h('a.entity-card.ref-card', { href: entityHref(ref) },
      image
        ? h('img.entity-thumb', { src: api.imageUrl(image), alt: '', loading: 'lazy' })
        : h('span.entity-thumb.placeholder', icon(refIcon(ref), 26)),
      h('div.entity-card-body',
        h('div.entity-card-title', h('span', displayName(ref))),
        h('p.entity-card-sub', refSummary(ref)),
        text ? h('p.entity-card-sub', text) : null));
  };

  const draw = () => {
    clear(body);
    const all = store.list('reference');
    if (!all.length) {
      body.append(emptyState(t('reference.empty'), btn(t('reference.add'), { icon: 'plus', kind: 'primary', onClick: add }), 'paperclip'));
      return;
    }
    const ofKind = all.filter((r) => !kind || refKind(r) === kind);
    const shown = search.filter(ofKind)
      .sort((a, b) => displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' }));
    search.setCount(shown.length, ofKind.length);
    body.append(shown.length ? h('div.entity-grid', shown.map(card)) : h('p.muted.empty-line', t('common.noMatches')));
  };

  const kindSel = h('select.input.inline-select', { 'aria-label': t('reference.kindLabel') },
    h('option', { value: '' }, t('reference.anyKind')),
    REFERENCE_KINDS.map((k) => h('option', { value: k }, t('reference.kind.' + k))));
  kindSel.addEventListener('change', () => { kind = kindSel.value; draw(); });
  // Busca en el título, las notas, la dirección, la fuente, el tipo y los elementos vinculados.
  const search = listSearch({ text: (r) => `${searchText(r)} ${t('reference.kind.' + refKind(r))}`, onChange: () => draw() });

  clear(el);
  el.append(
    pageHeader({ title: t('reference.plural'), subtitle: t('reference.hint'), actions: [btn(t('reference.add'), { icon: 'plus', kind: 'primary', onClick: add })] }),
    h('div.filter-row', search.el, kindSel),
    body);
  draw();
}

export async function referencePage({ el, pid, params }) {
  const ref = store.get(params.id);
  if (!ref || ref.type !== 'reference') return notFound(el, pid);

  const editor = createEditor({
    value: ref.body, toolbar: 'basic', lang: store.project.language, placeholder: t('reference.notesPlaceholder'),
    onChange: (html) => store.update(ref.id, { body: html }, autosaveDelay()),
    onSave: () => store.flush(),
  });

  // ----- Datos -----
  const kindSel = h('select.input', REFERENCE_KINDS.map((k) => h('option', { value: k }, t('reference.kind.' + k))));
  kindSel.value = refKind(ref);
  kindSel.addEventListener('change', () => store.patchData(ref.id, { kind: kindSel.value }));

  const urlInput = h('input.input', { type: 'url', maxlength: 1000, placeholder: 'https://…' });
  urlInput.value = ref.data.url || '';
  const openWrap = h('div.open-wrap');
  const drawOpen = () => {
    clear(openWrap);
    const url = safeUrl(ref.data.url);
    if (url) openWrap.append(h('a.btn.btn-sm', { href: url, target: '_blank', rel: 'noopener noreferrer' }, icon('external', 15), h('span', t('reference.open'))));
  };
  urlInput.addEventListener('change', async () => {
    await store.patchData(ref.id, { url: urlInput.value.trim() });
    drawOpen();
  });
  drawOpen();

  const sourceInput = h('input.input', { type: 'text', maxlength: 300, placeholder: t('reference.sourcePlaceholder') });
  sourceInput.value = ref.data.source || '';
  sourceInput.addEventListener('change', () => store.patchData(ref.id, { source: sourceInput.value.trim() }));

  // ----- Vínculos -----
  const linksPanel = h('section.panel');
  const drawLinks = () => {
    clear(linksPanel);
    const numbers = chapterNumbers();
    const linked = refLinks(ref).map((id) => store.get(id));
    linksPanel.append(h('div.panel-head', h('h3', t('reference.linkedTo')), chooseBtn(async () => {
      const picked = await pickDialog({ title: t('reference.linkedTo'), items: linkTargets(), selected: refLinks(ref), emptyText: t('reference.nothingToLink') });
      if (!picked) return;
      await store.patchData(ref.id, { links: picked });
      drawLinks();
    }, linked.length > 0)));
    linksPanel.append(linked.length
      ? h('div.chips', linked.map((e) => h('span.chip',
        h('a', { href: entityHref(e) }, linkLabel(e, numbers)),
        h('button.chip-x', { type: 'button', 'aria-label': t('reference.unlink'), onclick: async () => {
          await store.patchData(ref.id, { links: refLinks(ref).filter((id) => id !== e.id) });
          drawLinks();
        } }, icon('x', 12)))))
      : h('p.muted.small', t('reference.notLinked')));
  };
  drawLinks();

  clear(el);
  el.append(
    pageHeader({
      back: { href: `#/p/${pid}/library`, label: t('reference.plural') },
      titleNode: titleInput(ref.name, (name) => store.update(ref.id, { name })),
      actions: [menuButton(() => [
        { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
          if (!(await confirmDialog(t('common.confirmDelete', { name: displayName(ref) }), { danger: true, confirmLabel: t('common.delete') }))) return;
          try {
            await store.remove(ref.id);
            location.hash = `#/p/${pid}/library`;
          } catch (err) { toast(errorText(err), 'error'); }
        } },
      ])],
    }),
    h('div.two-col.detail',
      h('div.col',
        h('section.panel',
          h('label.form-row', h('span.form-label', t('reference.kindLabel')), kindSel),
          h('label.form-row', h('span.form-label', t('reference.url')), urlInput),
          openWrap,
          h('label.form-row', h('span.form-label', t('reference.source')), sourceInput)),
        h('section.panel', h('div.panel-head', h('h3', t('reference.notes'))), editor.el)),
      h('div.col', linksPanel, filesPanel(ref))));

  return async () => {
    editor.flush();
    editor.destroy();
  };
}
