// Páginas genéricas de lista y ficha para lugares, objetos, grupos, notas, tramas,
// mapas de relaciones y personajes secundarios. La lista de personajes también vive aquí.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { excerpt } from '../text.js';
import { createEditor } from '../editor.js';
import {
  btn, pageHeader, emptyState, statusDot, statusPicker, promptDialog, confirmDialog, pickDialog,
  menuButton, notFound, sortable, titleInput, toast, errorText, tabs, listSearch, chooseBtn,
} from '../ui.js';
import { relationsOverview, relationsAbout } from './allrelations.js';
import { noteSettingsPanel, notesPanel } from '../notes.js';
import { ioMenu, sheetImport } from '../elementio.js';
import { IO_TYPES } from '../export/elements.js';
import { exportRelationsDialog } from '../export/relations.js';
import {
  ENTITY_TYPES, displayName, entityHref, visibleTraits, characterSegments, STRAND_LEVELS, STRAND_KINDS, strandLevel, strandKind,
  locationDetail, customType, customSummary, searchText, RELATION_TYPES,
} from '../model.js';
import { relationsPanel } from '../sheetrelations.js';
import { exportEntityDialog } from '../export/sheet.js';
import { tasksPanel } from '../tasks.js';
import { referencesPanel } from '../refs.js';
import { imagesPanel, eventsPanel, appearsPanel, profileImage, autosaveDelay, aliasesField, traitsPanel, pickItem, roleField, questionsPanel, codeTag, titleWithCode, locationNestPanel, customFieldsPanel, lifeDatesPanel } from '../components.js';

const NO_STATUS = new Set(['note', 'group', 'mindmap', 'term']);
const NOTE_TARGETS = new Set(['character', 'location', 'object', 'group', 'custom', 'strand']);

function cardSub(e) {
  switch (e.type) {
    case 'character': return visibleTraits(e).slice(0, 4).join(' · ') || excerpt(e.body, 90);
    case 'location': return locationDetail(e);
    case 'custom': return customSummary(e) || excerpt(e.body, 90);
    case 'group': return tn('count.members', (e.data.members || []).filter((id) => store.get(id)).length);
    case 'mindmap': return tn('count.nodes', (e.data.nodes || []).length);
    default: return excerpt(e.body, 90);
  }
}

export function entityCard(e) {
  const cfg = ENTITY_TYPES[e.type];
  const img = cfg.images ? profileImage(e) : null;
  const sub = cardSub(e);
  return h('a.entity-card', { href: entityHref(e), dataset: { id: e.id } },
    img
      ? h('img.entity-thumb', { src: api.imageUrl(img), alt: '', loading: 'lazy', draggable: 'false' })
      : h('span.entity-thumb.placeholder', { style: e.data.color ? { background: e.data.color, color: '#fff' } : null },
        icon(e.type === 'custom' ? (customType(e) || {}).icon || 'grid' : cfg.icon, 26)),
    h('div.entity-card-body',
      h('div.entity-card-title', NO_STATUS.has(e.type) ? null : statusDot(e.status), h('span.entity-card-name', displayName(e)), codeTag(e)),
      cfg.role && e.data.role ? h('p.entity-card-role', e.data.role) : null,
      sub ? h('p.entity-card-sub', sub) : null));
}

export function cardGrid(items, canSort = true) {
  const grid = h('div.entity-grid', items.map(entityCard));
  if (canSort) sortable(grid, { axis: 'x', onSort: (ids) => store.reorder(ids) });
  return grid;
}

async function addEntity(type, pid, extra = {}, titleKey) {
  const name = await promptDialog({ title: t(titleKey || `${type}.add`), submitLabel: t('common.create') });
  if (!name) return;
  try {
    const e = await store.create(type, { name, ...extra });
    location.hash = entityHref(e);
  } catch (err) {
    toast(errorText(err), 'error');
  }
}

/**
 * Página de lista de un tipo de ficha. Con `bare`, la lista va sin cabecera de página (la
 * pone quien la incrusta, como «Relaciones» en su pestaña «Mis mapas») y sus botones pasan a
 * la fila del buscador.
 */
export function entityListPage(type, { bare = false } = {}) {
  return async ({ el, pid, refresh }) => {
    const cfg = ENTITY_TYPES[type];
    const items = store.list(type);
    // El diccionario se muestra por orden alfabético en lugar de por orden manual.
    if (cfg.alphabetical) items.sort((a, b) => displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' }));
    const add = () => addEntity(type, pid);
    // El buscador filtra las tarjetas; mientras se busca no se reordenan (faltarían fichas).
    const listEl = h('div');
    const search = listSearch({ text: searchText, onChange: () => drawList() });
    function drawList() {
      const shown = search.filter(items);
      search.setCount(shown.length, items.length);
      clear(listEl).append(shown.length ? cardGrid(shown, !cfg.alphabetical && !search.active()) : h('p.muted.empty-line', t('common.noMatches')));
    }
    // Importar y exportar la lista; en los mapas de relaciones, exportar las relaciones de todos.
    const actions = [
      IO_TYPES.includes(type) ? ioMenu(type, { list: () => store.list(type), onDone: refresh }) : null,
      type === 'mindmap' && items.length ? btn(t('relexp.button'), { icon: 'download', onClick: () => exportRelationsDialog(null) }) : null,
      btn(t(`${type}.add`), { icon: 'plus', kind: 'primary', onClick: add }),
    ].filter(Boolean);
    clear(el);
    if (!bare) el.append(pageHeader({ title: t(`${type}.plural`), subtitle: t(`${type}.hint`), actions }));
    if (!items.length) {
      el.append(emptyState(t(`${type}.empty`), btn(t(`${type}.add`), { icon: 'plus', kind: 'primary', onClick: add }), cfg.icon));
      return;
    }
    el.append(h('div.filter-row', search.el, ...(bare ? [h('span.spacer'), ...actions] : [])), listEl);
    drawList();
  };
}

export async function charactersPage({ el, pid, query, refresh }) {
  const all = store.list('character');
  const main = all.filter((c) => (c.data.kind || 'main') === 'main');
  const secondary = all.filter((c) => c.data.kind === 'secondary');
  const addMain = () => addEntity('character', pid, { data: { kind: 'main' } }, 'character.addMain');
  const addSecondary = () => addEntity('character', pid, { data: { kind: 'secondary' } }, 'character.addSecondary');
  // Dos vistas: las fichas y las relaciones de los personajes dibujadas en los mapas de
  // «Relaciones». La segunda (y con ella las pestañas) solo aparece cuando hay alguna relación.
  const hasRelations = relationsAbout('character').edges.length > 0;
  let view = hasRelations && query.view === 'relations' ? 'relations' : 'list';
  const tabsEl = h('div');
  const body = h('div');
  // El buscador filtra las dos listas a la vez (y busca también en la ficha entera de los principales).
  const listsEl = h('div');
  const search = listSearch({ text: searchText, onChange: () => drawLists() });
  function drawLists() {
    const mainShown = search.filter(main);
    const secondaryShown = search.filter(secondary);
    search.setCount(mainShown.length + secondaryShown.length, all.length);
    const grid = (shown, list, emptyKey) => (shown.length ? cardGrid(shown, !search.active())
      : h('p.muted.empty-line', t(list.length ? 'common.noMatches' : emptyKey)));
    clear(listsEl).append(
      h('div.section-head', h('div', h('h2', t('character.mainPlural')), h('p.muted', t('character.mainHint'))), btn(t('character.addMain'), { icon: 'plus', kind: 'primary', onClick: addMain })),
      grid(mainShown, main, 'character.mainEmpty'),
      h('div.section-head', h('div', h('h2', t('character.secondaryPlural')), h('p.muted', t('character.secondaryHint'))), btn(t('character.addSecondary'), { icon: 'plus', onClick: addSecondary })),
      grid(secondaryShown, secondary, 'character.secondaryEmpty'));
  }
  const draw = () => {
    clear(tabsEl);
    if (hasRelations) tabsEl.append(tabs([{ key: 'list', label: t('character.view.list') }, { key: 'relations', label: t('relall.tab') }], view, (key) => { view = key; draw(); }));
    clear(body);
    if (view === 'relations') { relationsOverview(body, pid, 'character'); return; }
    if (all.length) body.append(h('div.filter-row.above-sections', search.el));
    body.append(listsEl);
    drawLists();
  };

  clear(el);
  el.append(pageHeader({ title: t('character.plural'), subtitle: t('character.hint'), actions: [
    ioMenu('character', { list: () => store.list('character'), onDone: refresh }),
  ] }), tabsEl, body);
  draw();
}

/** Chips de miembros de un grupo, con selector. */
function membersPanel(group) {
  const wrap = h('section.panel');
  const draw = () => {
    clear(wrap);
    const members = (group.data.members || []).map((id) => store.get(id)).filter(Boolean);
    wrap.append(h('div.panel-head', h('h3', t('group.members')), chooseBtn(async () => {
      const ids = await pickDialog({
        title: t('group.members'),
        items: store.list('character').map((c) => pickItem(c)),
        selected: members.map((m) => m.id),
        emptyText: t('character.none'),
      });
      if (!ids) return;
      await store.patchData(group.id, { members: ids });
      draw();
    }, members.length > 0)));
    wrap.append(members.length
      ? h('div.chips', members.map((m) => h('a.chip', { href: entityHref(m) }, displayName(m))))
      : h('p.muted', t('group.noMembers')));
  };
  draw();
  return wrap;
}

export function entityDetailPage(type) {
  return async ({ el, pid, params, refresh }) => {
    const e = store.get(params.id);
    if (!e || e.type !== type) return notFound(el, pid);
    const cfg = ENTITY_TYPES[type];
    // Una ficha propia vuelve a la pestaña de su tipo.
    const ownType = type === 'custom' ? customType(e) : null;
    const listHref = `#/p/${pid}/${cfg.listRoute || cfg.route}${ownType ? '?type=' + ownType.id : ''}`;
    const listLabel = ownType ? ownType.name : t(cfg.listRoute ? 'nav.' + cfg.listRoute : `${type}.plural`);

    // Los personajes secundarios también tienen rasgos extraídos de su descripción.
    const traits = type === 'character' ? traitsPanel(e, () => characterSegments(e)) : null;
    let traitsTimer = null;

    const editor = createEditor({
      value: e.body, toolbar: 'basic', lang: store.project.language, placeholder: t('editor.placeholder'),
      onChange: (html) => {
        store.update(e.id, { body: html }, autosaveDelay());
        if (traits) {
          clearTimeout(traitsTimer);
          traitsTimer = setTimeout(() => traits.refresh(), 600);
        }
      },
      onSave: () => store.flush(),
    });

    const remove = async () => {
      if (!(await confirmDialog(t('common.confirmDelete', { name: displayName(e) }), { danger: true, confirmLabel: t('common.delete') }))) return;
      try {
        await store.remove(e.id);
        location.hash = listHref;
      } catch (err) { toast(errorText(err), 'error'); }
    };

    // Importar en esta ficha: lo que traiga el archivo (de cualquiera de los formatos que se exportan) se aplica a ella.
    const imp = IO_TYPES.includes(type) ? sheetImport(e, refresh) : null;
    const menu = menuButton(() => [
      { label: t('sheet.export'), icon: 'download', onClick: () => { editor.flush(); exportEntityDialog(e); } },
      imp ? { ...imp.item, onClick: () => { editor.flush(); imp.item.onClick(); } } : null,
      type === 'character' ? { label: t('character.toMain'), icon: 'user', onClick: async () => {
        editor.flush();
        const sections = { ...(e.data.sections || {}) };
        if (e.body && !(sections.personal && sections.personal.free)) {
          sections.personal = { ...(sections.personal || {}), mode: 'free', free: e.body };
        }
        await store.update(e.id, { data: { ...e.data, kind: 'main', sections } });
        refresh();
      } } : null,
      { label: t('common.delete'), icon: 'trash', danger: true, onClick: remove },
    ]);

    clear(el);
    el.append(pageHeader({
      back: { href: listHref, label: listLabel },
      titleNode: titleWithCode(e, titleInput(e.name, (name) => store.update(e.id, { name }))),
      actions: [NO_STATUS.has(type) ? null : statusPicker(e.status, (s) => store.update(e.id, { status: s })), menu],
    }));
    if (imp) el.append(imp.input);

    const mainCol = h('div.col');
    if (cfg.fields) {
      mainCol.append(h('section.panel', h('div.field-grid', cfg.fields.map((f) => {
        const input = h('input.input', { type: 'text', maxlength: 200 });
        input.value = e.data[f] || '';
        input.addEventListener('change', () => store.patchData(e.id, { [f]: input.value.trim() }));
        return h('label.form-row', h('span.form-label', t(`${type}.${f}`)), input);
      }))));
    }
    // Un lugar puede estar dentro de otro y contener otros; una ficha propia lleva los campos de su tipo.
    if (type === 'location') mainCol.append(locationNestPanel(e));
    if (type === 'custom') mainCol.append(...[customFieldsPanel(e)].filter(Boolean));
    if (type === 'strand') {
      // Importancia y tipo de la trama: dos listas opcionales.
      const choice = (field, values, current) => {
        const sel = h('select.input', h('option', { value: '' }, t(`strand.${field}.none`)), values.map((v) => h('option', { value: v }, t(`strand.${field}.${v}`))));
        sel.value = current;
        sel.addEventListener('change', () => store.patchData(e.id, { [field]: sel.value }));
        return h('label.form-row', h('span.form-label', t('strand.' + field)), sel);
      };
      mainCol.append(h('section.panel',
        h('div.panel-head', h('h3', t('strand.classify'))),
        h('p.muted.small', t('strand.classifyHint')),
        h('div.field-grid', choice('level', STRAND_LEVELS, strandLevel(e)), choice('kind', STRAND_KINDS, strandKind(e)))));
    }
    if (cfg.color) {
      const color = h('input.color-input', { type: 'color', 'aria-label': t('group.color') });
      color.value = e.data.color || '#2d5d7b';
      color.addEventListener('change', () => store.patchData(e.id, { color: color.value }));
      mainCol.append(h('section.panel', h('label.inline-field', h('span.form-label', t('group.color')), color)));
    }
    if (cfg.aliases) {
      mainCol.append(h('section.panel', cfg.role ? roleField(e) : null, aliasesField(e, type === 'term' ? 'aliases.termHint' : 'aliases.hint'),
        // Un personaje: nacimiento y muerte, con la edad que tiene durante el libro.
        type === 'character' ? lifeDatesPanel(e) : null));
    }
    const bodyTitle = type === 'note' ? 'note.text' : type === 'term' ? 'term.definition' : 'common.description';
    mainCol.append(h('section.panel', h('div.panel-head', h('h3', t(bodyTitle))), editor.el));
    if (cfg.questions) mainCol.append(questionsPanel(e));
    // En un personaje secundario los eventos van bajo la descripción: en la columna lateral
    // quedaban muy abajo, detrás de rasgos, relaciones e imágenes.
    const eventsInMain = cfg.events && type === 'character';
    if (eventsInMain) mainCol.append(eventsPanel(e));

    const sideCol = h('div.col');
    // Una nota: su grupo, su color y con qué está enlazada.
    if (type === 'note') sideCol.append(noteSettingsPanel(e));
    if (traits) sideCol.append(traits.el);
    if (cfg.members) sideCol.append(membersPanel(e));
    // Relaciones con otros elementos, apuntadas aquí mismo («Padre: Marcos», «Casa natal: el faro»).
    if (RELATION_TYPES.includes(type)) sideCol.append(relationsPanel(e));
    if (cfg.images) sideCol.append(imagesPanel(e));
    if (cfg.events && !eventsInMain) sideCol.append(eventsPanel(e));
    if (cfg.sceneField) sideCol.append(appearsPanel(e));
    // Pendientes y documentación ligados a esta ficha.
    sideCol.append(tasksPanel({ contextId: e.id, data: { entityId: e.id } }).el, referencesPanel(e).el);
    // Notas enlazadas con esta ficha (en lo que se puede enlazar con una nota).
    if (NOTE_TARGETS.has(type)) sideCol.append(notesPanel(e));

    el.append(sideCol.children.length ? h('div.two-col.detail', mainCol, sideCol) : h('div.narrow', mainCol));

    return async () => {
      clearTimeout(traitsTimer);
      editor.flush();
      if (traits) traits.refresh();
      editor.destroy();
    };
  };
}
