// Documentación: referencias (enlaces, artículos, planos, mapas, imágenes, fragmentos...)
// que se vinculan a escenas o a fichas sin mezclarse con las notas de escritura.
// Una referencia es un elemento de tipo 'reference': name = título, body = extracto y notas,
// data = { kind, url, source, links: [ids de escenas o elementos] }. Sus archivos (imágenes
// y PDF) se guardan con el mismo sistema que las imágenes de las fichas.
import { h, clear, icon } from './dom.js';
import { t, tn } from './i18n.js';
import { store } from './store.js';
import { api } from './api.js';
import { btn, addBtn, linkBtn, confirmDialog, modal, pickDialog, promptDialog, toast, errorText } from './ui.js';
import { allScenesOrdered, chapterLabel, chapterNumbers, chaptersOrdered, displayName, entityHref, entityLabel } from './model.js';

export const REFERENCE_KINDS = ['link', 'article', 'image', 'map', 'plan', 'document', 'excerpt'];
const KIND_ICONS = { link: 'link', article: 'note', image: 'image', map: 'pin', plan: 'layers', document: 'folder', excerpt: 'feather' };
const LINK_TYPES = ['character', 'location', 'object', 'group', 'term'];

export const refKind = (ref) => (REFERENCE_KINDS.includes(ref.data.kind) ? ref.data.kind : 'link');
export const refIcon = (ref) => KIND_ICONS[refKind(ref)];
export const isImage = (file) => /^image\//.test(file.mime || '');

/** Solo se enlazan direcciones web normales: nunca javascript:, data: ni similares. */
export function safeUrl(url) {
  const value = String(url || '').trim();
  return /^https?:\/\//i.test(value) ? value : '';
}

export function refHost(ref) {
  const url = safeUrl(ref.data.url);
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

export function refLinks(ref) {
  return (Array.isArray(ref.data.links) ? ref.data.links : []).filter((id) => store.get(id));
}

/** Referencias vinculadas a una escena o a un elemento. */
export function refsFor(id) {
  return store.list('reference').filter((r) => refLinks(r).includes(id));
}

/** Nombre legible de aquello a lo que se vincula una referencia. */
export function linkLabel(e, numbers) {
  if (e.type === 'scene') {
    const chapter = store.get(e.parent_id);
    return `${chapter ? chapterLabel(chapter, numbers) + ' › ' : ''}${displayName(e)}`;
  }
  if (e.type === 'chapter') return chapterLabel(e, numbers);
  return entityLabel(e);
}

/** Opciones del selector «vincular a»: escenas, capítulos y elementos, agrupados. */
export function linkTargets() {
  const numbers = chapterNumbers();
  const items = [];
  for (const s of allScenesOrdered()) items.push({ id: s.id, label: linkLabel(s, numbers), group: t('scenes.plural') });
  for (const c of chaptersOrdered()) items.push({ id: c.id, label: chapterLabel(c, numbers), group: t('nav.chapters') });
  for (const type of LINK_TYPES) {
    for (const e of store.list(type)) items.push({ id: e.id, label: entityLabel(e), group: t(type + '.plural') });
  }
  return items;
}

async function setLinked(ref, targetId, linked) {
  const links = refLinks(ref).filter((id) => id !== targetId);
  if (linked) links.push(targetId);
  await store.patchData(ref.id, { links });
}

/**
 * Panel «Documentación» de una escena o una ficha: lista las referencias vinculadas y
 * permite vincular otras o crear una nueva ya vinculada. Devuelve { el, draw }.
 */
export function referencesPanel(target, opts = {}) {
  const wrap = h('section.panel.refs-panel');
  // Tras vincular o desvincular se avisa a quien muestre un resumen de las referencias.
  const changed = () => {
    draw();
    if (opts.onChange) opts.onChange();
  };
  const draw = () => {
    clear(wrap);
    const refs = refsFor(target.id);
    const link = async () => {
      const all = store.list('reference');
      const picked = await pickDialog({
        title: t('reference.linkTitle'),
        items: all.map((r) => ({ id: r.id, label: displayName(r), sub: t('reference.kind.' + refKind(r)) })),
        selected: refs.map((r) => r.id),
        emptyText: t('reference.noneYet'),
      });
      if (!picked) return;
      for (const r of all) {
        const was = refLinks(r).includes(target.id);
        const now = picked.includes(r.id);
        if (was !== now) await setLinked(r, target.id, now);
      }
      changed();
    };
    const create = async () => {
      const name = await promptDialog({ title: t('reference.add'), label: t('reference.titleLabel'), submitLabel: t('common.create') });
      if (!name) return;
      try {
        const ref = await store.create('reference', { name, data: { kind: 'link', links: [target.id] } });
        location.hash = entityHref(ref);
      } catch (err) { toast(errorText(err), 'error'); }
    };
    wrap.append(h('div.panel-head',
      h('h3', t('reference.plural'), refs.length ? h('span.count-badge', String(refs.length)) : null),
      h('div.btn-row',
        store.list('reference').length ? linkBtn(link, t('reference.linkTitle')) : null,
        addBtn(create, t('reference.add')))));
    if (!refs.length) {
      wrap.append(h('p.muted.small', t('reference.noneLinked')));
      return;
    }
    wrap.append(h('ul.ref-list', refs.map((r) => {
      const url = safeUrl(r.data.url);
      return h('li.ref-row',
        h('a.ref-main', { href: entityHref(r) }, icon(refIcon(r), 15), h('span.ref-name', displayName(r))),
        url ? h('a.btn.btn-ghost.btn-sm.btn-icon', { href: url, target: '_blank', rel: 'noopener noreferrer', title: t('reference.open') }, icon('external', 15)) : null,
        btn('', { icon: 'x', small: true, kind: 'ghost', title: t('reference.unlink'), onClick: async () => { await setLinked(r, target.id, false); changed(); } }));
    })));
  };
  draw();
  return { el: wrap, draw };
}

/** Abre una imagen o un dibujo en grande. Los SVG, que no tienen tamaño propio, ocupan todo el ancho. */
function viewFile(file) {
  const m = modal({ title: file.name || '', wide: true, body: h('img', { class: 'image-full' + (isSvg(file) ? ' is-svg' : ''), src: api.imageUrl(file), alt: file.name || '' }) });
  if (isSvg(file)) m.box.classList.add('modal-xl');
}

const isSvg = (file) => (file.mime || file.type) === 'image/svg+xml' || /\.svg$/i.test(file.name || '');

/**
 * Un SVG es un documento que puede llevar código (scripts, manejadores de eventos, HTML
 * incrustado). Antes de subirlo se le quita todo eso: queda solo el dibujo.
 */
async function cleanSvg(file) {
  const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) {
    throw new Error(t('reference.badSvg'));
  }
  const banned = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video', 'handler', 'listener']);
  for (const el of [...doc.getElementsByTagName('*')]) {
    if (banned.has(el.localName.toLowerCase())) { el.remove(); continue; }
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const link = name === 'href' || name.endsWith(':href');
      if (name.startsWith('on') || (link && /^\s*(javascript:|data:text\/html)/i.test(attr.value))) el.removeAttribute(attr.name);
    }
  }
  return new File([new XMLSerializer().serializeToString(doc)], file.name, { type: 'image/svg+xml' });
}

/** Archivos de una referencia: imágenes y dibujos SVG (con miniatura) y documentos PDF. */
export function filesPanel(entity) {
  const wrap = h('section.panel');
  const draw = () => {
    clear(wrap);
    const files = store.imagesOf(entity.id);
    const input = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,.svg,application/pdf', multiple: true, hidden: true });
    input.addEventListener('change', async () => {
      for (const file of input.files) {
        try {
          await store.uploadImage(entity.id, isSvg(file) ? await cleanSvg(file) : file);
        } catch (err) {
          toast(`${file.name}: ${errorText(err)}`, 'error', 6000);
        }
      }
      draw();
    });
    const remove = async (file) => {
      if (!(await confirmDialog(t('reference.confirmDeleteFile'), { danger: true, confirmLabel: t('common.delete') }))) return;
      try { await store.deleteImage(file.id); } catch (err) { toast(errorText(err), 'error'); }
      draw();
    };
    wrap.append(
      h('div.panel-head', h('h3', t('reference.files')), addBtn(() => input.click(), t('reference.addFile'))),
      input);
    if (!files.length) {
      wrap.append(h('p.muted.small', t('reference.noFiles')));
      return;
    }
    const images = files.filter(isImage);
    const docs = files.filter((f) => !isImage(f));
    if (images.length) {
      wrap.append(h('div.image-grid', images.map((file) => h('figure.image-item',
        h('img', { class: isSvg(file) ? 'is-svg' : null, src: api.imageUrl(file), alt: file.name || '', loading: 'lazy', onclick: () => viewFile(file) }),
        h('figcaption', h('span.file-name', file.name || ''),
          // Un plano o un mapa se lee mejor a pantalla completa, con el zoom del navegador.
          h('a.btn.btn-ghost.btn-sm.btn-icon', { href: api.imageUrl(file), target: '_blank', rel: 'noopener', title: t('reference.openFile') }, icon('external', 15)),
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.delete'), onClick: () => remove(file) }))))));
    }
    if (docs.length) {
      wrap.append(h('ul.ref-list', docs.map((file) => h('li.ref-row',
        h('a.ref-main', { href: api.imageUrl(file), target: '_blank', rel: 'noopener' }, icon('note', 15), h('span.ref-name', file.name || 'PDF')),
        btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.delete'), onClick: () => remove(file) })))));
    }
  };
  draw();
  return wrap;
}

/** Texto corto para tarjetas y listas: tipo, sitio web y número de vínculos. */
export function refSummary(ref) {
  const parts = [t('reference.kind.' + refKind(ref))];
  const host = refHost(ref);
  if (host) parts.push(host);
  const links = refLinks(ref).length;
  if (links) parts.push(tn('reference.linkCount', links));
  return parts.join(' · ');
}
