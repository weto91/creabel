// Mapas con chinchetas: un plano o mapa (una imagen) sobre el que se colocan los lugares.
// Cada plano es un elemento de tipo «plan»; su imagen es la primera que tenga adjunta y las
// chinchetas van en data.pins: [{ id, target (id del lugar), x, y }] con x e y de 0 a 1.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { uid } from '../text.js';
import { btn, chooseBtn, pageHeader, emptyState, menuButton, promptDialog, pickDialog, confirmDialog, notFound, titleInput, toast, errorText } from '../ui.js';
import { displayName, entityHref, locationParent, locationDescendants, scenesReferencing } from '../model.js';
import { pickItem, miniCard } from '../components.js';

const planImage = (plan) => store.imagesOf(plan.id).filter((i) => /^image\//.test(i.mime || 'image/'))[0] || null;
const pinsOf = (plan) => (Array.isArray(plan.data.pins) ? plan.data.pins : []).filter((p) => store.get(p.target));

/** Pestaña «Mapas» de Lugares: los planos del proyecto. */
export function plansTab(body, pid) {
  const plans = store.list('plan');
  const add = async () => {
    const name = await promptDialog({ title: t('plan.add'), submitLabel: t('common.create') });
    if (!name) return;
    try {
      const plan = await store.create('plan', { name, data: { pins: [] } });
      location.hash = entityHref(plan);
    } catch (err) { toast(errorText(err), 'error'); }
  };
  if (!plans.length) {
    body.append(emptyState(t('plan.empty'), btn(t('plan.add'), { icon: 'plus', kind: 'primary', onClick: add }), 'map'));
    return;
  }
  body.append(
    h('div.section-head', h('p.muted', t('plan.hint')), btn(t('plan.add'), { icon: 'plus', onClick: add })),
    h('div.entity-grid', plans.map((plan) => {
      const img = planImage(plan);
      return h('a.entity-card', { href: entityHref(plan) },
        img ? h('img.entity-thumb', { src: api.imageUrl(img), alt: '', loading: 'lazy' }) : h('span.entity-thumb.placeholder', icon('map', 26)),
        h('div.entity-card-body',
          h('div.entity-card-title', h('span.entity-card-name', displayName(plan))),
          h('p.entity-card-sub', tn('plan.pins', pinsOf(plan).length))));
    })));
}

export async function planPage({ el, pid, params }) {
  const plan = store.get(params.id);
  if (!plan || plan.type !== 'plan') return notFound(el, pid);
  let zoom = 100;
  let selected = null; // id de la chincheta elegida
  let placing = null; // lugar que se va a colocar con la siguiente pulsación
  const stage = h('div.plan-stage');
  const side = h('aside.plan-side');
  const backHref = `#/p/${pid}/locations?view=maps`;

  const savePins = (pins) => store.patchData(plan.id, { pins });

  const fileInput = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/svg+xml,.svg', hidden: true });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const old = planImage(plan);
      await store.uploadImage(plan.id, file);
      if (old) await store.deleteImage(old.id);
    } catch (err) { toast(errorText(err), 'error'); }
    draw();
  });

  const place = async (x, y) => {
    const target = placing;
    placing = null;
    const pins = pinsOf(plan);
    const existing = pins.find((p) => p.target === target.id);
    if (existing) { existing.x = x; existing.y = y; selected = existing.id; }
    else {
      const pin = { id: uid(), target: target.id, x, y };
      pins.push(pin);
      selected = pin.id;
    }
    await savePins(pins);
    draw();
  };

  /** Arrastrar una chincheta la mueve; soltarla guarda su sitio. */
  const dragPin = (node, pin, canvas) => {
    node.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      const start = { x: e.clientX, y: e.clientY };
      let moved = false;
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 4) return;
        moved = true;
        const r = canvas.getBoundingClientRect();
        pin.x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
        pin.y = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
        node.style.left = `${pin.x * 100}%`;
        node.style.top = `${pin.y * 100}%`;
      };
      const up = async () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        if (moved) {
          node.dataset.dragged = '1';
          await savePins(pinsOf(plan).map((p) => (p.id === pin.id ? { ...p, x: pin.x, y: pin.y } : p)));
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  };

  const drawStage = () => {
    clear(stage);
    const img = planImage(plan);
    if (!img) {
      stage.append(emptyState(t('plan.noImage'), btn(t('plan.upload'), { icon: 'upload', kind: 'primary', onClick: () => fileInput.click() }), 'image'));
      return;
    }
    const canvas = h('div', { class: 'plan-canvas' + (placing ? ' placing' : ''), style: { width: `${zoom}%` } },
      h('img.plan-image', { src: api.imageUrl(img), alt: displayName(plan), draggable: 'false' }));
    canvas.addEventListener('click', (e) => {
      if (!placing || e.target.closest('.plan-pin')) return;
      const r = canvas.getBoundingClientRect();
      place((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    for (const pin of pinsOf(plan)) {
      const target = store.get(pin.target);
      const node = h('button', {
        type: 'button', class: 'plan-pin' + (pin.id === selected ? ' selected' : ''), title: displayName(target),
        style: { left: `${pin.x * 100}%`, top: `${pin.y * 100}%` },
        onclick: () => {
          if (node.dataset.dragged) { delete node.dataset.dragged; return; }
          selected = pin.id === selected ? null : pin.id;
          draw();
        },
      }, icon('pin', 20), h('span.plan-pin-label', displayName(target)));
      dragPin(node, pin, canvas);
      canvas.append(node);
    }
    stage.append(canvas);
  };

  const drawSide = () => {
    clear(side);
    const pins = pinsOf(plan);
    const pinned = new Set(pins.map((p) => p.target));
    const current = pins.find((p) => p.id === selected);
    const about = store.get(plan.data.locationId);

    // A qué lugar corresponde el plano (opcional): sus sublugares salen los primeros de la lista.
    const chooseAbout = async () => {
      const picked = await pickDialog({
        title: t('plan.about'), single: true, selected: about ? [about.id] : [],
        items: store.list('location').map((l) => pickItem(l)), emptyText: t('tags.noneAvailable'), noneLabel: t('tags.leaveUnset'),
      });
      if (!picked) return;
      await store.patchData(plan.id, { locationId: picked[0] || null });
      draw();
    };
    side.append(h('div.tag-field',
      h('div.tag-head', h('span.form-label', t('plan.about')), chooseBtn(chooseAbout, !!about)),
      about ? h('div.mini-cards', miniCard(about)) : h('p.muted.small', t('plan.aboutNone'))));

    if (current) {
      const target = store.get(current.target);
      side.append(h('div.tag-field',
        h('span.form-label', t('plan.selected')),
        h('div.mini-cards', miniCard(target)),
        h('p.muted.small', tn('count.scenes', scenesReferencing(target).length)),
        h('div.btn-row', btn(t('plan.unpin'), { icon: 'trash', small: true, kind: 'ghost', onClick: async () => {
          selected = null;
          await savePins(pins.filter((p) => p.id !== current.id));
          draw();
        } }))));
    }

    // Lugares: los que faltan por colocar primero; pulsar uno y luego el plano lo coloca (o lo mueve).
    const inside = about ? new Set(locationDescendants(about).map((l) => l.id)) : null;
    const rank = (l) => (pinned.has(l.id) ? 2 : 0) + (inside && !inside.has(l.id) ? 1 : 0);
    const list = store.list('location').filter((l) => l !== about).sort((a, b) => rank(a) - rank(b));
    side.append(h('div.tag-field',
      h('span.form-label', t('plan.places')),
      placing ? h('p.plan-placing', icon('pin', 15), t('plan.placing', { name: displayName(placing) }), ' ',
        h('button.link-btn', { type: 'button', onclick: () => { placing = null; draw(); } }, t('common.cancel'))) : h('p.muted.small', t('plan.placesHint')),
      list.length ? h('div.plan-list', list.map((l) => h('button', {
        type: 'button', class: 'plan-list-item' + (pinned.has(l.id) ? ' is-pinned' : '') + (placing === l ? ' active' : ''),
        onclick: () => { placing = placing === l ? null : l; draw(); },
      }, icon(pinned.has(l.id) ? 'check' : 'pin', 14), h('span', displayName(l)),
      locationParent(l) ? h('span.muted', displayName(locationParent(l))) : null))) : h('p.muted.small', t('tags.noneAvailable'))));
  };

  const draw = () => { drawStage(); drawSide(); };

  const zoomBy = (delta) => { zoom = Math.min(400, Math.max(40, zoom + delta)); drawStage(); };

  clear(el);
  el.append(
    fileInput,
    pageHeader({
      back: { href: backHref, label: t('location.view.maps') },
      titleNode: titleInput(plan.name, (name) => store.update(plan.id, { name })),
      actions: [
        btn('', { icon: 'minus', title: t('plan.zoomOut'), onClick: () => zoomBy(-25) }),
        btn('', { icon: 'plus', title: t('plan.zoomIn'), onClick: () => zoomBy(25) }),
        btn(t('plan.changeImage'), { icon: 'upload', onClick: () => fileInput.click() }),
        menuButton(() => [
          { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
            if (!(await confirmDialog(t('common.confirmDelete', { name: displayName(plan) }), { danger: true, confirmLabel: t('common.delete') }))) return;
            try {
              await store.remove(plan.id);
              location.hash = backHref;
            } catch (err) { toast(errorText(err), 'error'); }
          } },
        ]),
      ],
    }),
    h('div.plan-layout', stage, side));
  draw();
}
