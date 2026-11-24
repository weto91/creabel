// «Lugares»: la lista de fichas, el árbol (qué lugar está dentro de cuál) y los mapas con
// chinchetas. Todo en una página con pestañas, para no añadir entradas al menú.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { btn, pageHeader, emptyState, tabs, menuButton, promptDialog, pickDialog, listSearch, toast, errorText } from '../ui.js';
import { displayName, entityHref, locationParent, locationChildren, locationDescendants, locationAncestors, scenesReferencing, searchText } from '../model.js';
import { profileImage, pickItem, codeTag } from '../components.js';
import { cardGrid } from './entities.js';
import { plansTab } from './plans.js';
import { relationsOverview, relationsAbout } from './allrelations.js';
import { ioMenu } from '../elementio.js';

const VIEWS = ['list', 'tree', 'maps'];
const VIEW_KEY = 'creabel.locationsView';

export async function locationsPage({ el, pid, query }) {
  let saved = '';
  try { saved = localStorage.getItem(VIEW_KEY) || ''; } catch (err) { saved = ''; }
  // «Relaciones» solo se enseña cuando algún lugar tiene una relación en los mapas.
  const views = relationsAbout('location').edges.length ? [...VIEWS, 'relations'] : VIEWS;
  let view = views.includes(query.view) ? query.view : views.includes(saved) ? saved : 'list';
  const tabsEl = h('div');
  const body = h('div');

  const add = async (parent) => {
    const name = await promptDialog({ title: parent ? t('location.addInside', { name: displayName(parent) }) : t('location.add'), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const loc = await store.create('location', { name, data: parent ? { parentId: parent.id } : {} });
      location.hash = entityHref(loc);
    } catch (err) { toast(errorText(err), 'error'); }
  };

  // ---------- Árbol ----------

  const moveInside = async (loc) => {
    const parent = locationParent(loc);
    const banned = new Set([loc.id, ...locationDescendants(loc).map((l) => l.id)]);
    const picked = await pickDialog({
      title: t('location.moveInsideOf', { name: displayName(loc) }), single: true, selected: parent ? [parent.id] : [],
      items: store.list('location').filter((l) => !banned.has(l.id)).map((l) => pickItem(l)),
      emptyText: t('location.noOther'), noneLabel: t('location.topLevel'),
    });
    if (!picked) return;
    await store.patchData(loc.id, { parentId: picked[0] || null });
    draw();
  };

  // `keep`: al buscar, los lugares que se enseñan (los que coinciden y los que los contienen).
  const treeRow = (loc, depth, keep) => {
    const img = profileImage(loc);
    const scenes = scenesReferencing(loc).length;
    const kids = locationChildren(loc).filter((k) => !keep || keep.has(k.id));
    const own = [loc.data.city, loc.data.state, loc.data.nation].filter((x) => x && String(x).trim()).join(', ');
    return [
      h('div.tree-row', { style: { paddingLeft: `${10 + depth * 28}px` } },
        depth ? h('span.tree-branch') : null,
        img ? h('img.tree-thumb', { src: api.imageUrl(img), alt: '', loading: 'lazy' }) : h('span.tree-thumb.placeholder', icon('pin', 15)),
        h('a.tree-name', { href: entityHref(loc) }, displayName(loc)),
        codeTag(loc),
        own ? h('span.tree-sub', own) : null,
        h('span.tree-meta', scenes ? tn('count.scenes', scenes) : ''),
        menuButton(() => [
          { label: t('location.addChild'), icon: 'plus', onClick: () => add(loc) },
          { label: t('location.moveInside'), icon: 'folder', onClick: () => moveInside(loc) },
          locationParent(loc) ? { label: t('location.toTop'), icon: 'chevron-up', onClick: async () => { await store.patchData(loc.id, { parentId: null }); draw(); } } : null,
        ].filter(Boolean), { small: true })),
      ...kids.flatMap((k) => treeRow(k, depth + 1, keep)),
    ];
  };

  const drawTree = (items, keep) => {
    const roots = items.filter((l) => !locationParent(l) && (!keep || keep.has(l.id)));
    listEl.append(
      h('p.muted.tree-hint', t('location.treeHint')),
      h('div.tree', roots.flatMap((l) => treeRow(l, 0, keep))));
  };

  // El buscador sirve a la lista y al árbol; en el árbol se conserva el camino hasta cada resultado.
  const listEl = h('div');
  const search = listSearch({ text: searchText, onChange: () => drawList() });
  function drawList() {
    const items = store.list('location');
    const shown = search.filter(items);
    search.setCount(shown.length, items.length);
    clear(listEl);
    if (!shown.length) listEl.append(h('p.muted.empty-line', t('common.noMatches')));
    else if (view === 'tree') drawTree(items, search.active() ? new Set(shown.flatMap((l) => [l.id, ...locationAncestors(l).map((a) => a.id)])) : null);
    else listEl.append(cardGrid(shown, !search.active()));
  }

  const draw = () => {
    const items = store.list('location');
    clear(tabsEl).append(tabs(views.map((key) => ({ key, label: key === 'relations' ? t('relall.tab') : t('location.view.' + key) })), view, (key) => {
      view = key;
      try { localStorage.setItem(VIEW_KEY, key); } catch (err) { /* no es crítico */ }
      draw();
    }));
    clear(body);
    if (view === 'maps') { plansTab(body, pid); return; }
    if (view === 'relations') { relationsOverview(body, pid, 'location'); return; }
    if (!items.length) {
      body.append(emptyState(t('location.empty'), btn(t('location.add'), { icon: 'plus', kind: 'primary', onClick: () => add() }), 'pin'));
      return;
    }
    search.reset();
    body.append(h('div.filter-row', search.el), listEl);
    drawList();
  };

  clear(el);
  el.append(
    pageHeader({ title: t('location.plural'), subtitle: t('location.hint'), actions: [
      ioMenu('location', { list: () => store.list('location'), onDone: draw }),
      btn(t('location.add'), { icon: 'plus', kind: 'primary', onClick: () => add() }),
    ] }),
    tabsEl, body);
  draw();
}
