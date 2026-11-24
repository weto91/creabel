// Pendientes: tareas de revisión ligadas a su contexto (un fragmento de una escena, una
// escena, un personaje, un lugar...). Se anotan mientras se escribe y se resuelven después.
// Un pendiente es un elemento de tipo 'task': name = texto, status 0 abierto / 2 resuelto,
// data = { kind, sceneId, entityId, quote, resolvedAt }.
import { h, clear } from './dom.js';
import { t, tn } from './i18n.js';
import { store } from './store.js';
import { today, formatDate } from './text.js';
import { addBtn, formDialog, confirmDialog, menuButton, toast, errorText } from './ui.js';
import { chapterLabel, displayName, entityHref, entityLabel } from './model.js';

export const TASK_KINDS = ['inconsistency', 'verify', 'review', 'idea'];

export const isOpen = (task) => task.status !== 2;

export function allTasks() {
  return store.list('task');
}

/** Pendientes ligados a una escena o a un elemento. */
export function tasksFor(id) {
  return allTasks().filter((x) => x.data.sceneId === id || x.data.entityId === id);
}

export function openTaskIds() {
  return new Set(allTasks().filter(isOpen).map((x) => x.id));
}

/** A qué se refiere un pendiente: { label, href, type } o null si es general. */
export function taskContext(task) {
  const scene = store.get(task.data.sceneId);
  if (scene && scene.type === 'scene') {
    const chapter = store.get(scene.parent_id);
    return {
      label: `${chapter ? chapterLabel(chapter) + ' › ' : ''}${displayName(scene)}`,
      href: `${entityHref(scene)}?task=${task.id}`,
      type: 'scene',
    };
  }
  const entity = store.get(task.data.entityId);
  if (entity) return { label: `${t(entity.type + '.singular')}: ${entityLabel(entity)}`, href: entityHref(entity), type: entity.type };
  return null;
}

/** Diálogo para crear o editar. Devuelve { name, kind } o null. */
export function taskDialog(task, defaults = {}) {
  const quote = (defaults.quote || '').trim();
  return formDialog({
    title: t(task ? 'tasks.edit' : 'tasks.add'),
    intro: quote ? t('tasks.about', { quote: quote.length > 120 ? quote.slice(0, 120) + '…' : quote }) : null,
    fields: [
      { name: 'name', label: t('tasks.what'), type: 'textarea', rows: 3, maxlength: 250, required: true, value: task ? task.name : '', placeholder: t('tasks.placeholder') },
      {
        name: 'kind', label: t('tasks.kind'), type: 'select', value: task ? task.data.kind || 'review' : defaults.kind || 'review',
        options: TASK_KINDS.map((k) => ({ value: k, label: t('tasks.kind.' + k) })),
      },
    ],
    submitLabel: task ? t('common.save') : t('common.create'),
  });
}

export function createTask(fields, data) {
  return store.create('task', { name: fields.name, data: { kind: fields.kind, ...data } });
}

export function setResolved(task, done) {
  return store.update(task.id, { status: done ? 2 : 0, data: { ...task.data, resolvedAt: done ? today() : null } });
}

export async function editTask(task) {
  const out = await taskDialog(task, { quote: task.data.quote });
  if (!out) return false;
  await store.update(task.id, { name: out.name, data: { ...task.data, kind: out.kind } });
  return true;
}

export async function deleteTask(task) {
  if (!(await confirmDialog(t('tasks.confirmDelete'), { danger: true, confirmLabel: t('common.delete') }))) return false;
  try {
    await store.remove(task.id);
    return true;
  } catch (err) {
    toast(errorText(err), 'error');
    return false;
  }
}

export function kindBadge(task) {
  const kind = TASK_KINDS.includes(task.data.kind) ? task.data.kind : 'review';
  return h('span', { class: 'badge task-kind k-' + kind }, t('tasks.kind.' + kind));
}

/**
 * Fila de un pendiente. opts: { showContext, onChange(), onFocus(task), onRemoved(task) }
 * onFocus, si se pasa, hace que al pulsar el texto se salte a la marca en el editor.
 */
export function taskRow(task, opts = {}) {
  const box = h('input', { type: 'checkbox', 'aria-label': t('tasks.resolve'), title: t(isOpen(task) ? 'tasks.resolve' : 'tasks.reopen') });
  box.checked = !isOpen(task);
  box.addEventListener('change', async () => {
    await setResolved(task, box.checked);
    if (opts.onResolved) opts.onResolved(task, box.checked);
    if (opts.onChange) opts.onChange();
  });
  const context = opts.showContext ? taskContext(task) : null;
  const text = opts.onFocus
    ? h('button.task-text.link-like', { type: 'button', onclick: () => opts.onFocus(task) }, task.name)
    : h('span.task-text', task.name);
  return h('div', { class: 'task-row' + (isOpen(task) ? '' : ' done') },
    box,
    h('div.task-body',
      text,
      h('div.task-meta',
        kindBadge(task),
        context ? h('a.task-context', { href: context.href }, context.label) : (opts.showContext ? h('span.muted', t('tasks.general')) : null),
        !isOpen(task) && task.data.resolvedAt ? h('span.muted', t('tasks.resolvedOn', { date: formatDate(task.data.resolvedAt) })) : null),
      task.data.quote ? h('blockquote.task-quote', task.data.quote) : null),
    menuButton(() => [
      { label: t('common.edit'), icon: 'edit', onClick: async () => { if ((await editTask(task)) && opts.onChange) opts.onChange(); } },
      { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
        if (!(await deleteTask(task))) return;
        if (opts.onRemoved) opts.onRemoved(task);
        if (opts.onChange) opts.onChange();
      } },
    ], { small: true }));
}

/**
 * Panel de pendientes de un contexto (una escena o un elemento).
 * opts: { contextId, data (campos del pendiente nuevo), onAdd (sustituye la creación por defecto),
 *         onFocus, onResolved, onRemoved, onChange }
 * Devuelve { el, draw }.
 */
export function tasksPanel(opts) {
  const wrap = h('section.panel.tasks-panel');
  let showDone = false;
  const draw = () => {
    clear(wrap);
    const tasks = tasksFor(opts.contextId);
    const open = tasks.filter(isOpen);
    const done = tasks.filter((x) => !isOpen(x));
    const refresh = () => { draw(); if (opts.onChange) opts.onChange(); };
    wrap.append(h('div.panel-head',
      h('h3', t('tasks.title'), open.length ? h('span.count-badge', String(open.length)) : null),
      addBtn(async () => {
        if (opts.onAdd) { await opts.onAdd(); draw(); return; }
        const out = await taskDialog(null);
        if (!out) return;
        try { await createTask(out, opts.data || {}); } catch (err) { toast(errorText(err), 'error'); }
        refresh();
      }, t('tasks.add'))));
    const rowOpts = { onChange: refresh, onFocus: opts.onFocus, onResolved: opts.onResolved, onRemoved: opts.onRemoved };
    if (!open.length) wrap.append(h('p.muted.small', t(done.length ? 'tasks.allDone' : 'tasks.noneHere')));
    else wrap.append(h('div.task-list', open.map((x) => taskRow(x, rowOpts))));
    if (done.length) {
      wrap.append(h('button.link-btn.small', { type: 'button', onclick: () => { showDone = !showDone; draw(); } },
        tn(showDone ? 'tasks.hideDone' : 'tasks.showDone', done.length)));
      if (showDone) wrap.append(h('div.task-list', done.map((x) => taskRow(x, rowOpts))));
    }
  };
  draw();
  return { el: wrap, draw };
}

/** Quita del HTML las marcas de pendientes que ya no están abiertos (resueltos o borrados). */
export function pruneTodoMarks(html, keep) {
  if (!html || html.indexOf('data-todo') === -1) return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  let changed = false;
  for (const span of [...div.querySelectorAll('span[data-todo]')]) {
    if (!keep.has(span.getAttribute('data-todo'))) {
      span.replaceWith(...span.childNodes);
      changed = true;
    }
  }
  if (!changed) return html;
  div.normalize();
  return div.innerHTML;
}
