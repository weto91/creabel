// «Relaciones»: dos pestañas. «Mis mapas» son los mapas que dibuja el usuario; «Automáticas»,
// las relaciones que se deducen de lo ya apuntado en escenas y fichas (autorelations.js): diez
// dibujos, uno por tipo de relación, y uno general que las junta con las dibujadas a mano.
import { h, clear } from '../dom.js';
import { t, tn } from '../i18n.js';
import { pageHeader, tabs } from '../ui.js';
import { entityListPage } from './entities.js';
import { AUTO_KINDS, buildAutoRelations, manualRelations, mergeRelations } from '../autorelations.js';
import { graphView } from '../graphview.js';

const TABS = ['maps', 'auto'];
const TAB_KEY = 'creabel.relationsTab';
const KIND_KEY = 'creabel.autoRelation';
const ALL = 'all';
// Un color por tipo de relación, para la vista general (las dibujadas a mano, en el color del texto).
const KIND_COLORS = ['#c0504d', '#8a67b0', '#d08a3c', '#7d8a93', '#5a9a5a', '#4a7fb8', '#3d9a96', '#c2a52e', '#6f8f3a', '#b0608f'];

function autoTab(body) {
  const graphs = { ...buildAutoRelations(), manual: manualRelations() };
  const kinds = { manual: { label: t('auto.manual'), color: 'var(--text)', dashed: false } };
  AUTO_KINDS.forEach((key, i) => { kinds[key] = { label: t(`auto.${key}.name`), color: KIND_COLORS[i % KIND_COLORS.length], dashed: true }; });

  let saved = '';
  try { saved = localStorage.getItem(KIND_KEY) || ''; } catch (err) { saved = ''; }
  let current = [...AUTO_KINDS, ALL].includes(saved) ? saved : AUTO_KINDS.find((k) => graphs[k].edges.length) || AUTO_KINDS[0];
  // En la vista general, qué relaciones se ven: al principio, las dibujadas a mano y las que tienen algo.
  const shown = new Set(['manual', ...AUTO_KINDS].filter((k) => graphs[k].edges.length));

  const menu = h('nav.autorel-menu', { 'aria-label': t('relations.tab.auto') });
  const stage = h('div.autorel-stage');

  const drawStage = () => {
    clear(stage);
    if (current === ALL) {
      const merged = mergeRelations(graphs, ['manual', ...AUTO_KINDS].filter((k) => shown.has(k)));
      stage.append(
        h('h2', t('auto.all.name')),
        h('p.muted', t('auto.all.desc')),
        // Leyenda con casillas: qué relaciones entran en el dibujo.
        h('div.autorel-legend', ['manual', ...AUTO_KINDS].map((key) => {
          const box = h('input', { type: 'checkbox' });
          box.checked = shown.has(key);
          box.disabled = !graphs[key].edges.length;
          box.addEventListener('change', () => { if (box.checked) shown.add(key); else shown.delete(key); drawStage(); });
          return h('label', { class: 'autorel-check' + (box.disabled ? ' is-empty' : '') }, box,
            h('span', { class: 'autorel-line' + (kinds[key].dashed ? ' is-dashed' : ''), style: { '--edge': kinds[key].color } }),
            h('span', kinds[key].label), h('span.muted', String(graphs[key].edges.length)));
        })),
        // (Element.append no aplana listas: se despliegan aquí.)
        ...(merged.edges.length
          ? [h('p.muted.small', `${tn('relall.count', merged.edges.length)} · ${tn('relall.items', merged.nodes.length)}`), graphView({ ...merged, kinds, label: t('auto.all.name') })]
          : [h('p.autorel-need', t('auto.all.need'))]));
      return;
    }
    const g = graphs[current];
    stage.append(
      h('h2', t(`auto.${current}.name`)),
      h('p.muted', t(`auto.${current}.desc`)),
      ...(g.edges.length
        ? [h('p.muted.small', `${tn('relall.count', g.edges.filter((e) => !e.soft).length)} · ${tn('relall.items', g.nodes.length)}`), graphView({ ...g, label: t(`auto.${current}.name`) })]
        : [h('p.autorel-need', t(`auto.${current}.need`))]));
  };

  const drawMenu = () => {
    const item = (key, label, count) => h('button', {
      type: 'button', class: 'autorel-item' + (key === current ? ' active' : '') + (!count ? ' is-empty' : ''), 'aria-pressed': String(key === current),
      onclick: () => {
        current = key;
        try { localStorage.setItem(KIND_KEY, key); } catch (err) { /* no es crítico */ }
        drawMenu();
        drawStage();
      },
    }, h('span', label), h('span.autorel-count', String(count)));
    clear(menu).append(
      ...AUTO_KINDS.map((key) => item(key, t(`auto.${key}.name`), graphs[key].edges.filter((e) => !e.soft).length)),
      h('span.autorel-sep'),
      item(ALL, t('auto.all.name'), ['manual', ...AUTO_KINDS].reduce((n, k) => n + graphs[k].edges.filter((e) => !e.soft).length, 0)));
  };

  body.append(h('p.muted.autorel-hint', t('auto.hint')), h('div.autorel-layout', menu, stage));
  drawMenu();
  drawStage();
}

export async function relationsPage({ el, pid, query, refresh }) {
  let saved = '';
  try { saved = localStorage.getItem(TAB_KEY) || ''; } catch (err) { saved = ''; }
  let tab = TABS.includes(query.tab) ? query.tab : TABS.includes(saved) ? saved : 'maps';
  const tabsEl = h('div');
  const body = h('div');

  const draw = async () => {
    clear(tabsEl).append(tabs(TABS.map((key) => ({ key, label: t('relations.tab.' + key) })), tab, (key) => {
      tab = key;
      try { localStorage.setItem(TAB_KEY, key); } catch (err) { /* no es crítico */ }
      draw();
    }));
    clear(body);
    if (tab === 'auto') autoTab(body);
    // La lista de mapas es la de siempre, sin su cabecera (ya la pone esta página).
    else await entityListPage('mindmap', { bare: true })({ el: body, pid, refresh });
  };

  clear(el);
  el.append(pageHeader({ title: t('mindmap.plural'), subtitle: t('relations.hint') }), tabsEl, body);
  await draw();
}
