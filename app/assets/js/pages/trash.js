// Papelera. Todo lo que se borra pasa aquí y se conserva los días fijados en Ajustes; desde
// aquí se restaura o se elimina definitivamente. Hay dos: la de cada proyecto (elementos,
// imágenes y archivos) y la general (proyectos enteros).
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { api } from '../api.js';
import { store } from '../store.js';
import { formatTimestamp } from '../text.js';
import { btn, pageHeader, emptyState, confirmDialog, toast, errorText } from '../ui.js';
import { ENTITY_TYPES, chapterKind } from '../model.js';

const TYPE_LABEL = { chapter: 'chapters.singular', scene: 'scenes.singular', part: 'chapters.part', revision: 'revisions.title', task: 'task.singular', event: 'event.singular' };
const TYPE_ICON = { chapter: 'book', scene: 'feather', part: 'folder', revision: 'history', task: 'flag', event: 'calendar' };

const typeLabel = (type) => t(TYPE_LABEL[type] || (ENTITY_TYPES[type] ? type + '.singular' : 'trash.item'));
const typeIcon = (type) => TYPE_ICON[type] || (ENTITY_TYPES[type] || {}).icon || 'note';

/** Días que le quedan en la papelera a algo borrado en `deletedAt` (fecha UTC del servidor). */
function daysLeft(deletedAt, days) {
  const at = Date.parse(String(deletedAt).replace(' ', 'T') + 'Z');
  if (!Number.isFinite(at)) return days;
  return Math.max(0, days - Math.floor((Date.now() - at) / 86400000));
}

function row({ thumb, title, sub, deletedAt, days, onRestore, onPurge }) {
  const left = daysLeft(deletedAt, days);
  return h('div.trash-row',
    thumb,
    h('div.trash-main',
      h('strong', title),
      sub ? h('span.muted', sub) : null),
    h('div.trash-when',
      h('span', formatTimestamp(deletedAt)),
      h('span', { class: 'muted' + (left <= 2 ? ' soon' : '') }, left > 0 ? tn('trash.left', left) : t('trash.leftToday'))),
    h('div.trash-actions',
      btn(t('trash.restore'), { icon: 'undo', small: true, onClick: onRestore }),
      btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('trash.purge'), onClick: onPurge })));
}

const settingsLink = () => h('a', { href: '#/settings/data' }, t('trash.changeDays'));

/** Papelera de un proyecto. */
export async function trashPage({ el, pid, refresh }) {
  const data = await api.get(`projects/${pid}/trash`);
  const total = data.entities.length + data.images.length;

  const guard = async (fn, done) => {
    try {
      await fn();
      if (done) toast(done, 'success');
    } catch (err) { toast(errorText(err), 'error', 6000); }
    refresh();
  };

  const restoreEntity = (e) => guard(async () => {
    await store.flush();
    await api.post(`entities/${e.id}/restore`);
    await store.open(pid);
    // Solo cabe un prólogo y un epílogo: si ya hay otro, el restaurado vuelve como capítulo normal.
    const back = store.get(e.id);
    if (back && back.type === 'chapter' && chapterKind(back) !== 'chapter'
      && store.list('chapter').some((c) => c.id !== back.id && chapterKind(c) === chapterKind(back))) {
      await store.patchData(back.id, { kind: 'chapter' });
    }
    store.logWordsSoon();
  }, t('trash.restored'));

  const purge = async (message, route) => {
    if (!(await confirmDialog(message, { danger: true, confirmLabel: t('trash.purge') }))) return;
    await guard(() => api.post(route));
  };

  const name = (e) => {
    if (e.name && e.name.trim()) return e.name;
    if (e.type === 'revision') return t('trash.revisionOf', { name: e.parent_name || t('common.untitled') });
    if (e.type === 'chapter' && e.data && e.data.kind && e.data.kind !== 'chapter') return t('chapters.' + e.data.kind);
    return t('common.untitled');
  };
  const sub = (e) => [
    typeLabel(e.type),
    e.parent_name && e.type !== 'revision' ? e.parent_name : null,
    e.children ? tn('trash.children', e.children) : null,
    e.words ? tn('count.words', e.words) : null,
  ].filter(Boolean).join(' · ');

  clear(el);
  el.append(pageHeader({
    title: t('nav.trash'),
    subtitle: tn('trash.hint', data.days),
    actions: total ? [btn(t('trash.empty'), { icon: 'trash', kind: 'danger', onClick: async () => {
      if (!(await confirmDialog(tn('trash.confirmEmpty', total), { danger: true, confirmLabel: t('trash.empty') }))) return;
      await guard(() => api.post(`projects/${pid}/trash/empty`));
    } })] : [],
  }));
  el.append(h('p.muted.trash-note', settingsLink()));

  if (!total) {
    el.append(emptyState(t('trash.none'), null, 'trash'));
    return;
  }
  const list = h('div.trash-list');
  for (const e of data.entities) {
    list.append(row({
      thumb: h('span.trash-thumb', icon(typeIcon(e.type), 18)),
      title: name(e), sub: sub(e), deletedAt: e.deleted_at, days: data.days,
      onRestore: () => restoreEntity(e),
      onPurge: () => purge(t('trash.confirmPurge', { name: name(e) }), `entities/${e.id}/purge`),
    }));
  }
  for (const img of data.images) {
    const isImage = /^image\//.test(img.mime || '');
    list.append(row({
      thumb: isImage ? h('img.trash-thumb', { src: api.imageUrl(img), alt: '', loading: 'lazy' }) : h('span.trash-thumb', icon('paperclip', 18)),
      title: img.name || t(isImage ? 'trash.image' : 'trash.file'),
      sub: t(isImage ? 'trash.image' : 'trash.file'),
      deletedAt: img.deleted_at, days: data.days,
      onRestore: () => guard(async () => { await api.post(`images/${img.id}/restore`); await store.open(pid); }, t('trash.restored')),
      onPurge: () => purge(t('trash.confirmPurge', { name: img.name || t('trash.file') }), `images/${img.id}/purge`),
    }));
  }
  el.append(list);
}

/** Papelera general: proyectos borrados. */
export async function projectsTrashPage({ el, refresh }) {
  const data = await api.get('trash/projects');
  const guard = async (fn, done) => {
    try {
      await fn();
      if (done) toast(done, 'success');
    } catch (err) { toast(errorText(err), 'error', 6000); }
    refresh();
  };

  clear(el);
  el.append(
    pageHeader({ title: t('nav.trash'), subtitle: tn('trash.projectsHint', data.days), back: { href: '#/', label: t('nav.projects') } }),
    h('p.muted.trash-note', settingsLink()));
  if (!data.projects.length) {
    el.append(emptyState(t('trash.noProjects'), null, 'trash'));
    return;
  }
  el.append(h('div.trash-list', data.projects.map((p) => row({
    thumb: h('span.trash-thumb', icon('book', 18)),
    title: p.name,
    sub: [p.author, tn('count.words', p.words || 0), tn('count.chapters', p.chapters || 0)].filter(Boolean).join(' · '),
    deletedAt: p.deleted_at, days: data.days,
    onRestore: () => guard(() => api.post(`projects/${p.id}/restore`), t('trash.restored')),
    onPurge: async () => {
      if (!(await confirmDialog(t('trash.confirmPurgeProject', { name: p.name }), { danger: true, confirmLabel: t('trash.purge') }))) return;
      await guard(() => api.post(`projects/${p.id}/purge`));
    },
  }))));
}
