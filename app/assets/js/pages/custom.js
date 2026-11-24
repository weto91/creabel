// «Fichas propias»: tipos de ficha que define el usuario (naves, tecnologías, criaturas…),
// todos en una sola página, con una pestaña por tipo. Cada tipo tiene su nombre, su icono y
// sus campos; sus fichas se comportan como un elemento más (se marcan en las escenas, tienen
// identificador, imágenes, pendientes y documentación).
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { uid } from '../text.js';
import { btn, addBtn, pageHeader, emptyState, tabs, menuButton, modal, promptDialog, confirmDialog, listSearch, toast, errorText } from '../ui.js';
import { customTypes, entityHref, CUSTOM_ICONS, searchText } from '../model.js';
import { cardGrid } from './entities.js';
import { ioMenu } from '../elementio.js';

const TYPE_KEY = 'creabel.customType';

/** Diálogo para crear o editar un tipo. Devuelve { name, icon, fields } o null. */
function typeDialog(type) {
  return new Promise((resolve) => {
    let done = false;
    let iconName = (type && type.icon) || CUSTOM_ICONS[0];
    let fields = type ? (type.fields || []).map((f) => ({ ...f })) : [];
    const name = h('input.input', { type: 'text', maxlength: 60, required: true, placeholder: t('custom.typeNamePlaceholder') });
    name.value = type ? type.name : '';

    const icons = h('div.icon-choice', { role: 'group', 'aria-label': t('custom.typeIcon') });
    const drawIcons = () => {
      clear(icons);
      icons.append(...CUSTOM_ICONS.map((key) => h('button', {
        type: 'button', class: 'icon-choice-item' + (key === iconName ? ' active' : ''), 'aria-pressed': String(key === iconName),
        onclick: () => { iconName = key; drawIcons(); },
      }, icon(key, 18))));
    };
    drawIcons();

    const list = h('div.field-list');
    const drawFields = (focusLast) => {
      clear(list);
      fields.forEach((f, i) => {
        const input = h('input.input', { type: 'text', maxlength: 60, placeholder: t('custom.fieldPlaceholder') });
        input.value = f.label;
        input.addEventListener('input', () => { f.label = input.value; });
        list.append(h('div.field-list-row', input,
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.remove'), onClick: () => { fields.splice(i, 1); drawFields(); } })));
        if (focusLast && i === fields.length - 1) setTimeout(() => input.focus(), 0);
      });
      if (!fields.length) list.append(h('p.muted.small', t('custom.noFields')));
    };
    drawFields();

    const submit = () => {
      if (!form.reportValidity()) return;
      done = true;
      m.close();
      resolve({ name: name.value.trim(), icon: iconName, fields: fields.map((f) => ({ id: f.id, label: f.label.trim() })).filter((f) => f.label) });
    };
    const form = h('form.form', { onsubmit: (e) => { e.preventDefault(); submit(); } },
      h('label.form-row', h('span.form-label', t('custom.typeName')), name, h('span.form-hint', t('custom.typeNameHint'))),
      h('div.form-row', h('span.form-label', t('custom.typeIcon')), icons),
      h('div.form-row', h('span.form-label', t('custom.fields')), h('span.form-hint', t('custom.fieldsHint')), list,
        h('div.btn-row', addBtn(() => { fields.push({ id: uid(), label: '' }); drawFields(true); }, t('custom.addField')))),
      h('button', { type: 'submit', hidden: true }));
    const m = modal({
      title: t(type ? 'custom.editType' : 'custom.addType'), body: form,
      actions: [btn(t('common.cancel'), { onClick: () => m.close() }), btn(t('common.save'), { kind: 'primary', onClick: submit })],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

export async function customPage({ el, pid, query }) {
  let saved = '';
  try { saved = localStorage.getItem(TYPE_KEY) || ''; } catch (err) { saved = ''; }
  let active = query.type || saved;
  const tabsEl = h('div');
  const body = h('div');
  const listEl = h('div');
  let drawList = () => {};
  const search = listSearch({ text: searchText, onChange: () => drawList() });

  const saveTypes =(types) => store.patchProjectData({ customTypes: types });

  const addType = async () => {
    const out = await typeDialog(null);
    if (!out) return;
    const type = { id: uid(), ...out };
    try {
      await saveTypes([...customTypes(), type]);
      active = type.id;
    } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  const editType = async (type) => {
    const out = await typeDialog(type);
    if (!out) return;
    try { await saveTypes(customTypes().map((ct) => (ct.id === type.id ? { ...ct, ...out } : ct))); } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  const deleteType = async (type, sheets) => {
    const text = sheets.length ? tn('custom.confirmDeleteType', sheets.length, { name: type.name }) : t('custom.confirmDeleteEmpty', { name: type.name });
    if (!(await confirmDialog(text, { danger: true, confirmLabel: t('common.delete') }))) return;
    try {
      for (const e of sheets) await store.remove(e.id);
      await saveTypes(customTypes().filter((ct) => ct.id !== type.id));
    } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  const addSheet = async (type) => {
    const name = await promptDialog({ title: t('custom.addSheet', { type: type.name }), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const e = await store.create('custom', { name, data: { kind: type.id, values: {} } });
      location.hash = entityHref(e);
    } catch (err) { toast(errorText(err), 'error'); }
  };

  const draw = () => {
    const types = customTypes();
    const all = store.list('custom');
    const known = new Set(types.map((ct) => ct.id));
    const orphans = all.filter((e) => !known.has(e.data.kind));
    clear(tabsEl);
    clear(body);
    // «Añadir tipo» es la acción principal mientras no hay ningún tipo; en cuanto existe uno,
    // lo principal es añadir fichas a ese tipo y este botón pasa a secundario.
    const main = !types.length;
    typeBtn.classList.toggle('btn-primary', main);
    typeBtn.classList.toggle('btn-default', !main);
    typeBtn.classList.toggle('btn-add', !main);
    if (!types.length && !orphans.length) {
      body.append(emptyState(t('custom.empty'), btn(t('custom.addType'), { icon: 'plus', kind: 'primary', onClick: addType }), 'grid'));
      return;
    }
    if (active !== '-' && !known.has(active)) active = types.length ? types[0].id : '-';
    if (active === '-' && !orphans.length) active = types[0].id;
    try { localStorage.setItem(TYPE_KEY, active); } catch (err) { /* no es crítico */ }
    const count = (id) => all.filter((e) => e.data.kind === id).length;
    tabsEl.append(tabs([
      ...types.map((ct) => ({ key: ct.id, label: `${ct.name} (${count(ct.id)})` })),
      ...(orphans.length ? [{ key: '-', label: `${t('custom.noType')} (${orphans.length})` }] : []),
    ], active, (key) => { active = key; draw(); }));

    if (active === '-') {
      body.append(h('p.muted', t('custom.noTypeHint')), cardGrid(orphans, false));
      return;
    }
    const type = types.find((ct) => ct.id === active);
    const sheets = all.filter((e) => e.data.kind === type.id);
    body.append(h('div.section-head',
      h('div',
        h('h2.custom-type-title', icon(type.icon || 'grid', 20), type.name),
        h('p.muted', (type.fields || []).length ? t('custom.fieldsOf', { list: type.fields.map((f) => f.label).join(', ') }) : t('custom.noFieldsYet'))),
      h('div.btn-row',
        ioMenu('custom', { list: () => sheets, ct: type, onDone: draw }),
        btn(t('custom.addSheet', { type: type.name }), { icon: 'plus', kind: 'primary', onClick: () => addSheet(type) }),
        menuButton(() => [
          { label: t('custom.editType'), icon: 'edit', onClick: () => editType(type) },
          { label: t('custom.deleteType'), icon: 'trash', danger: true, onClick: () => deleteType(type, sheets) },
        ]))));
    if (!sheets.length) {
      body.append(h('p.muted.empty-line', t('custom.noSheets', { type: type.name })));
      return;
    }
    // El buscador filtra las fichas del tipo abierto.
    search.reset();
    drawList = () => {
      const shown = search.filter(sheets);
      search.setCount(shown.length, sheets.length);
      clear(listEl).append(shown.length ? cardGrid(shown, !search.active()) : h('p.muted.empty-line', t('common.noMatches')));
    };
    body.append(h('div.filter-row', search.el), listEl);
    drawList();
  };

  const typeBtn = btn(t('custom.addType'), { icon: 'plus', onClick: addType });
  clear(el);
  el.append(
    pageHeader({ title: t('nav.custom'), subtitle: t('custom.hint'), actions: [typeBtn] }),
    tabsEl, body);
  draw();
}
