// Comparación de dos revisiones de una escena: vista combinada (lo quitado tachado, lo
// añadido resaltado) o lado a lado, con recuento de cambios y salto entre diferencias.
import { h, clear, icon } from './dom.js';
import { t, tn } from './i18n.js';
import { api } from './api.js';
import { htmlToText } from './text.js';
import { btn, modal, toast, errorText } from './ui.js';
import { diffTexts } from './diff.js';

/**
 * revisions: lista ordenada; labelOf(rev) da su nombre; activeId es la revisión en uso y
 * currentHtml su texto tal como está en el editor. onActivate(id) la cambia.
 */
export function compareRevisions({ revisions, labelOf, activeId, currentHtml, onActivate }) {
  const texts = new Map([[activeId, htmlToText(currentHtml || '')]]);
  const activeIndex = revisions.findIndex((r) => r.id === activeId);
  let a = (revisions[activeIndex - 1] || revisions.find((r) => r.id !== activeId)).id;
  let b = activeId;
  let view = 'merged';
  let onlyChanges = false;
  let cursor = -1;
  let run = 0;

  const textOf = async (id) => {
    if (!texts.has(id)) texts.set(id, htmlToText((await api.get('entities/' + id)).body || ''));
    return texts.get(id);
  };

  const picker = (get, set) => {
    const sel = h('select.input', revisions.map((r) => h('option', { value: r.id }, labelOf(r) + (r.id === activeId ? ` (${t('revisions.active')})` : ''))));
    sel.value = get();
    sel.addEventListener('change', () => { set(sel.value); draw(); });
    return sel;
  };
  const selA = picker(() => a, (v) => { a = v; });
  const selB = picker(() => b, (v) => { b = v; });

  const stats = h('p.diff-stats');
  const content = h('div.diff-body');
  const controls = h('div.diff-view');
  const footer = h('div.diff-footer');

  const inline = (ops, side) => ops.map((op) => {
    if (op.t === 'eq') return op.text;
    if (op.t === 'del') return side === 'b' ? null : h('del', op.text);
    return side === 'a' ? null : h('ins', op.text);
  });

  const step = (delta) => {
    const marks = [...content.querySelectorAll('.diff-changed')];
    if (!marks.length) return;
    cursor = (cursor + delta + marks.length) % marks.length;
    for (const m of marks) m.classList.remove('diff-current');
    marks[cursor].classList.add('diff-current');
    marks[cursor].scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const drawControls = () => {
    clear(controls);
    const opt = (key) => h('button', { type: 'button', class: 'seg-opt' + (view === key ? ' active' : ''), 'aria-pressed': String(view === key), onclick: () => { view = key; draw(); } }, t('revisions.view.' + key));
    const only = h('input', { type: 'checkbox' });
    only.checked = onlyChanges;
    only.addEventListener('change', () => { onlyChanges = only.checked; draw(); });
    controls.append(
      h('span.seg', { role: 'group' }, opt('merged'), opt('side')),
      h('label.form-check', only, h('span', t('revisions.onlyChanges'))),
      h('span.diff-nav',
        btn('', { icon: 'chevron-left', small: true, title: t('revisions.prevChange'), onClick: () => step(-1) }),
        btn('', { icon: 'chevron-right', small: true, title: t('revisions.nextChange'), onClick: () => step(1) })));
  };

  const draw = async () => {
    const mine = ++run;
    drawControls();
    clear(footer);
    cursor = -1;
    if (a === b) {
      clear(content).append(h('p.muted', t('revisions.sameRevision')));
      stats.textContent = '';
      return;
    }
    clear(content).append(h('p.muted', t('common.loading')));
    let result;
    try {
      result = diffTexts(await textOf(a), await textOf(b));
    } catch (err) {
      if (mine === run) clear(content).append(h('p.muted', errorText(err)));
      return;
    }
    if (mine !== run) return;

    clear(stats).append(
      h('span.diff-plus', tn('revisions.added', result.added)), ' · ',
      h('span.diff-minus', tn('revisions.removed', result.removed)), ' · ',
      tn('revisions.changedParagraphs', result.changed));

    clear(content);
    if (!result.changed) {
      content.append(h('p.muted', t('revisions.identical')));
    } else {
      const side = view === 'side';
      const box = h('div', { class: side ? 'diff-side' : 'diff-merged' });
      if (side) box.append(h('div.diff-col-head', labelOf(revisions.find((r) => r.id === a))), h('div.diff-col-head', labelOf(revisions.find((r) => r.id === b))));
      let skipped = 0;
      const flush = () => {
        if (!skipped) return;
        box.append(h('p', { class: 'diff-skip' + (side ? ' wide' : '') }, tn('revisions.unchanged', skipped)));
        skipped = 0;
      };
      for (const row of result.rows) {
        if (row.type === 'eq') {
          if (onlyChanges) { skipped++; continue; }
          if (side) box.append(h('p', row.a), h('p', row.b));
          else box.append(h('p', row.a));
          continue;
        }
        flush();
        if (side) {
          box.append(
            h('p', { class: row.type === 'ins' ? 'diff-empty' : 'diff-changed diff-' + row.type }, row.type === 'mod' ? inline(row.ops, 'a') : row.a),
            h('p', { class: row.type === 'del' ? 'diff-empty' : 'diff-' + row.type }, row.type === 'mod' ? inline(row.ops, 'b') : row.b));
        } else {
          box.append(h('p', { class: 'diff-changed diff-' + row.type }, row.type === 'mod' ? inline(row.ops) : row.type === 'del' ? h('del', row.a) : h('ins', row.b)));
        }
      }
      flush();
      content.append(box);
    }

    // Cualquiera de las dos revisiones puede pasar a ser la que se usa.
    for (const id of [a, b]) {
      if (id === activeId) continue;
      const rev = revisions.find((r) => r.id === id);
      footer.append(btn(t('revisions.use', { name: labelOf(rev) }), { icon: 'check', onClick: async () => {
        try { m.close(); await onActivate(id); } catch (err) { toast(errorText(err), 'error'); }
      } }));
    }
  };

  const m = modal({
    title: t('revisions.compare'),
    wide: true,
    body: h('div.diff',
      h('div.diff-head',
        h('label.form-row', h('span.form-label', t('revisions.before')), selA),
        h('span.diff-arrow', icon('chevron-right', 18)),
        h('label.form-row', h('span.form-label', t('revisions.after')), selB)),
      controls, stats, content, footer),
  });
  m.box.classList.add('modal-xl');
  draw();
}
