// Panel central de pendientes: todo lo anotado durante la escritura, agrupado por su
// contexto, para resolverlo en la fase de revisión.
import { h, clear } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { btn, pageHeader, emptyState, listSearch, toast, errorText } from '../ui.js';
import { allScenesOrdered, chapterLabel, chapterNumbers, entityLabel } from '../model.js';
import { TASK_KINDS, allTasks, isOpen, taskRow, taskDialog, createTask, taskContext } from '../tasks.js';

export async function tasksPage({ el }) {
  let state = 'open'; // 'open' | 'done' | 'all'
  let kind = '';
  const body = h('div');
  const summary = h('p.totals');

  const add = async () => {
    const out = await taskDialog(null);
    if (!out) return;
    try {
      await createTask(out, {});
      draw();
    } catch (err) { toast(errorText(err), 'error'); }
  };

  const draw = () => {
    const tasks = allTasks();
    const open = tasks.filter(isOpen).length;
    summary.textContent = tasks.length ? `${tn('tasks.openCount', open)} · ${tn('tasks.doneCount', tasks.length - open)}` : '';
    clear(body);
    if (!tasks.length) {
      body.append(emptyState(t('tasks.empty'), btn(t('tasks.add'), { icon: 'plus', kind: 'primary', onClick: add }), 'flag'));
      return;
    }
    const filtered = tasks.filter((x) => (state === 'all' || (state === 'open') === isOpen(x)) && (!kind || (x.data.kind || 'review') === kind));
    search.reset();
    const shown = search.filter(filtered);
    search.setCount(shown.length, filtered.length);
    if (!shown.length) {
      body.append(h('p.muted.empty-line', t(filtered.length ? 'common.noMatches' : state === 'open' ? 'tasks.noneOpen' : 'tasks.noneFiltered')));
      return;
    }

    // Grupos: capítulos en orden de lectura, después los elementos y al final los generales.
    const numbers = chapterNumbers();
    const sceneOrder = new Map(allScenesOrdered().map((s, i) => [s.id, i]));
    const groups = new Map();
    const push = (key, title, order, task) => {
      if (!groups.has(key)) groups.set(key, { title, order, tasks: [] });
      groups.get(key).tasks.push(task);
    };
    for (const task of shown) {
      const scene = store.get(task.data.sceneId);
      const entity = store.get(task.data.entityId);
      if (scene && scene.type === 'scene') {
        const chapter = store.get(scene.parent_id);
        push('c:' + (chapter ? chapter.id : ''), chapter ? chapterLabel(chapter, numbers) : t('scenes.plural'), sceneOrder.get(scene.id) || 0, task);
      } else if (entity) {
        push('e:' + entity.type, t(entity.type + '.plural'), 100000 + ['character', 'location', 'object', 'group'].indexOf(entity.type), task);
      } else {
        push('general', t('tasks.general'), 999999, task);
      }
    }
    const ordered = [...groups.values()].sort((a, b) => a.order - b.order);
    for (const group of ordered) {
      group.tasks.sort((a, b) => (sceneOrder.get(a.data.sceneId) || 0) - (sceneOrder.get(b.data.sceneId) || 0)
        || entityLabel(store.get(a.data.entityId)).localeCompare(entityLabel(store.get(b.data.entityId))));
      body.append(
        h('div.section-head.compact', h('h2', group.title), h('span.muted', tn('tasks.count', group.tasks.length))),
        h('div.task-list.boxed', group.tasks.map((task) => taskRow(task, { showContext: true, onChange: draw }))));
    }
  };

  const stateSel = h('select.input.inline-select', { 'aria-label': t('tasks.filterState') },
    [['open', t('tasks.stateOpen')], ['done', t('tasks.stateDone')], ['all', t('tasks.stateAll')]].map(([value, label]) => h('option', { value }, label)));
  stateSel.addEventListener('change', () => { state = stateSel.value; draw(); });
  const kindSel = h('select.input.inline-select', { 'aria-label': t('tasks.kind') },
    h('option', { value: '' }, t('tasks.anyKind')),
    TASK_KINDS.map((k) => h('option', { value: k }, t('tasks.kind.' + k))));
  kindSel.addEventListener('change', () => { kind = kindSel.value; draw(); });
  // Busca en el texto del pendiente, el fragmento al que se refiere, su tipo y dónde está (capítulo, escena o ficha).
  const search = listSearch({
    text: (x) => `${x.name} ${x.data.quote || ''} ${t('tasks.kind.' + (TASK_KINDS.includes(x.data.kind) ? x.data.kind : 'review'))} ${(taskContext(x) || { label: t('tasks.general') }).label}`,
    onChange: () => draw(),
  });

  clear(el);
  el.append(
    pageHeader({ title: t('nav.tasks'), subtitle: t('tasks.hint'), actions: [btn(t('tasks.add'), { icon: 'plus', kind: 'primary', onClick: add })] }),
    h('div.filter-row', search.el, stateSel, kindSel, summary),
    h('div.narrow.wide', body));
  draw();
}
