// Tablero de tarjetas: cada capítulo es una columna y cada escena una tarjeta con su resumen.
// Las tarjetas se arrastran dentro de un capítulo o de uno a otro; el color del borde es el de
// la primera trama de la escena.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { btn, pageHeader, emptyState, statusDot, menuButton, promptDialog, formDialog, toast, errorText } from '../ui.js';
import { chaptersOrdered, chapterNumbers, chapterLabel, chapterWords, scenesOf, displayName, validIds, entityHref, strandColor } from '../model.js';
import { sceneTagSummary, codeTag } from '../components.js';
import { createScene } from './chapters.js';


export async function boardPage({ el, pid }) {
  const body = h('div');
  let dragged = null; // id de la escena que se arrastra

  const strands = store.list('strand');

  /** Guarda el orden de una columna tal como está en pantalla (y el capítulo de la tarjeta movida). */
  const saveColumn = async (list, movedId) => {
    const chapterId = list.dataset.chapter;
    const ids = [...list.children].map((n) => n.dataset.id).filter(Boolean);
    try {
      const moved = movedId ? store.get(movedId) : null;
      if (moved && moved.parent_id !== chapterId) await store.update(movedId, { parent_id: chapterId });
      await store.reorder(ids);
    } catch (err) { toast(errorText(err), 'error'); }
    draw();
  };

  const card = (s, chapters, numbers) => {
    const strandIds = validIds(s.data.strands);
    const tags = sceneTagSummary(s);
    const summary = h('p', { class: 'board-summary' + (s.data.summary ? '' : ' no-summary') }, s.data.summary || t('board.noSummary'));
    // El resumen se edita en la propia tarjeta.
    const edit = () => {
      const area = h('textarea.input.board-edit', { rows: 4, maxlength: 600, placeholder: t('board.summaryPlaceholder') });
      area.value = s.data.summary || '';
      const done = async () => {
        const text = area.value.trim();
        if (text !== (s.data.summary || '')) await store.patchData(s.id, { summary: text });
        draw();
      };
      area.addEventListener('blur', done);
      area.addEventListener('keydown', (e) => { if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) area.blur(); });
      summary.replaceWith(area);
      area.focus();
    };
    summary.addEventListener('click', edit);

    const node = h('article.board-card', { draggable: 'true', dataset: { id: s.id }, style: strandIds.length ? { borderLeftColor: strandColor(strandIds[0]) } : null },
      h('div.board-card-head',
        statusDot(s.status),
        h('a.board-card-title', { href: entityHref(s), draggable: 'false' }, displayName(s)),
        menuButton(() => [
          { label: t('board.editSummary'), icon: 'edit', onClick: edit },
          chapters.length > 1 ? { label: t('scenes.move'), icon: 'folder', onClick: async () => {
            const out = await formDialog({
              title: t('scenes.move'),
              fields: [{ name: 'chapter', label: t('scenes.moveTo'), type: 'select', value: s.parent_id, options: chapters.map((x) => ({ value: x.id, label: chapterLabel(x, numbers) })) }],
            });
            if (!out || out.chapter === s.parent_id) return;
            const target = scenesOf(out.chapter);
            await store.update(s.id, { parent_id: out.chapter, position: target.length ? target[target.length - 1].position + 1 : 0 });
            draw();
          } } : null,
        ].filter(Boolean), { small: true })),
      summary,
      h('div.board-card-foot',
        codeTag(s),
        tags ? h('span.board-tags', tags) : null,
        h('span.board-words', tn('count.words', s.words || 0))),
      // Las tramas de la escena, como marcas de color (el nombre sale al pasar el ratón y en la leyenda).
      strandIds.length ? h('div.board-strands', strandIds.map((id) => h('span.board-strand', { title: displayName(store.get(id)), style: { background: strandColor(id) } }))) : null);

    node.addEventListener('dragstart', (e) => {
      dragged = s.id;
      node.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', s.id); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* algunos navegadores lo restringen */ }
    });
    node.addEventListener('dragend', () => { dragged = null; node.classList.remove('dragging'); });
    return node;
  };

  const column = (c, chapters, numbers) => {
    const list = h('div.board-list', { dataset: { chapter: c.id } }, scenesOf(c.id).map((s) => card(s, chapters, numbers)));
    // Al arrastrar por encima, la tarjeta se va colocando donde caería.
    list.addEventListener('dragover', (e) => {
      if (!dragged) return;
      e.preventDefault();
      const moving = body.querySelector(`.board-card[data-id="${dragged}"]`);
      if (!moving) return;
      const after = [...list.querySelectorAll('.board-card:not(.dragging)')].find((n) => {
        const r = n.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      });
      if (after) list.insertBefore(moving, after);
      else list.append(moving);
    });
    list.addEventListener('drop', (e) => {
      if (!dragged) return;
      e.preventDefault();
      saveColumn(list, dragged);
    });
    const add = async () => {
      const name = await promptDialog({ title: t('scenes.add'), submitLabel: t('common.create') });
      if (!name) return;
      try { await createScene(c.id, name); } catch (err) { toast(errorText(err), 'error'); }
      draw();
    };
    return h('section.board-column',
      h('header.board-column-head',
        h('a', { href: entityHref(c) }, chapterLabel(c, numbers)),
        h('span.muted', tn('count.words', chapterWords(c)))),
      list,
      h('button.board-add', { type: 'button', onclick: add }, icon('plus', 14), t('scenes.add')));
  };

  function draw() {
    // Al repintar se conserva hasta dónde se había bajado, en el tablero y en cada columna.
    const scroll = body.querySelector('.board') ? body.querySelector('.board').scrollTop : 0;
    const listScroll = new Map([...body.querySelectorAll('.board-list')].map((l) => [l.dataset.chapter, l.scrollTop]));
    clear(body);
    const chapters = chaptersOrdered();
    if (!chapters.length) {
      body.append(emptyState(t('analysis.empty'), btn(t('nav.chapters'), { kind: 'primary', href: `#/p/${pid}/chapters` }), 'grid'));
      return;
    }
    const numbers = chapterNumbers();
    const used = strands.filter((st) => store.list('scene').some((s) => validIds(s.data.strands).includes(st.id)));
    const board = h('div.board', chapters.map((c) => column(c, chapters, numbers)));
    body.append(
      used.length ? h('p.board-legend', used.map((st) => h('span', { title: displayName(st) }, h('span.board-strand', { style: { background: strandColor(st.id) } }), h('span.board-legend-name', displayName(st))))) : null,
      board);
    evenHeights();
    board.scrollTop = scroll;
    for (const l of board.querySelectorAll('.board-list')) l.scrollTop = listScroll.get(l.dataset.chapter) || 0;
  }

  /** Todas las columnas con el mismo alto: el de la más llena (que ya tiene su tope en la hoja de estilos). */
  function evenHeights() {
    const board = body.querySelector('.board');
    if (!board) return;
    board.style.removeProperty('--board-col');
    const tallest = Math.max(0, ...[...board.children].map((c) => c.getBoundingClientRect().height));
    if (tallest) board.style.setProperty('--board-col', `${Math.ceil(tallest)}px`);
  }
  window.addEventListener('resize', evenHeights);

  clear(el);
  el.append(
    pageHeader({
      title: t('board.title'), subtitle: t('board.hint'),
      back: { href: `#/p/${pid}/chapters`, label: t('nav.chapters') },
      actions: [btn(t('outline.title'), { icon: 'list', href: `#/p/${pid}/outline` })],
    }),
    body);
  draw();
  return () => window.removeEventListener('resize', evenHeights);
}
