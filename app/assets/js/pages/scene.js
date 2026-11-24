// Escena: editor de texto, revisiones y etiquetas (punto de vista, personajes, lugar, fecha...).
// Los personajes, lugares, objetos y grupos que se mencionan en el texto se marcan solos
// mientras se escribe; el usuario puede quitar o añadir cualquiera.
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { api } from '../api.js';
import { htmlToText, formatDateTime, formatDate, today } from '../text.js';
import { createEditor } from '../editor.js';
import { getPrefs } from '../prefs.js';
import { btn, addBtn, linkBtn, chooseBtn, pageHeader, statusPicker, confirmDialog, formDialog, pickDialog, menuButton, modal, notFound, titleInput, toast, errorText, sortable } from '../ui.js';
import { taskDialog, createTask, tasksPanel, tasksFor, openTaskIds, pruneTodoMarks, setResolved, editTask, deleteTask, kindBadge, isOpen } from '../tasks.js';
import { referencesPanel, refsFor } from '../refs.js';
import { activity } from '../sessions.js';
import {
  allScenesOrdered, chapterLabel, displayName, entityHref, entityLabel, locationLabel, validIds, povLabel,
  POV_TYPES, POV_WITH_CHARACTER, sceneLocationIds, customType, ageAt,
  sceneEvents, eventTime, eventTargets, eventLinks, entityCode, EVENT_MODES, sceneDuration,
} from '../model.js';
import { autosaveDelay, pickItem, titleWithCode, miniCard, codeTag, eventDialog, saveEvent, dateHostScene, eventWhen } from '../components.js';
import { sceneStates, revealsIn, secretReveals, whoLabel } from '../continuity.js';
import { stateDialog, revealDialog } from './continuity.js';
import { createSceneTools } from '../scenetools.js';
import { notesPanel, notesFor } from '../notes.js';
import { buildDetector, computeAutoTags } from '../mentions.js';
import { rememberScene, lastSceneOf } from '../lastscene.js';
import { compareRevisions } from '../revcompare.js';

export async function scenePage({ el, pid, params, refresh, query }) {
  const scene = store.get(params.id);
  if (!scene || scene.type !== 'scene') return notFound(el, pid);
  const chapter = store.get(scene.parent_id);

  let revisions = store.list('revision', scene.id);
  if (!revisions.length) {
    revisions = [await store.create('revision', { parent_id: scene.id, position: 1 })];
  }
  const active = revisions.find((r) => r.id === scene.data.activeRevision) || revisions[revisions.length - 1];
  if (scene.data.activeRevision !== active.id) await store.patchData(scene.id, { activeRevision: active.id });

  // El texto de la revisión se pide ahora: no viene con la carga general del proyecto.
  // (loadBody anota además sobre qué versión del texto se va a escribir, por si otro dispositivo lo cambia.)
  // Las marcas de pendientes ya resueltos o borrados se retiran al abrir la escena.
  active.body = pruneTodoMarks(await store.loadBody(active.id), openTaskIds());

  const setData = (patch) => store.patchData(scene.id, patch);
  const side = h('aside.scene-side');

  // ---------- Detección automática de menciones ----------

  const autoOn = getPrefs().autoTags !== false;
  const detect = autoOn ? buildDetector() : null;
  let lastFound = null;
  let detectTimer = null;

  const autoSet = () => new Set(Array.isArray(scene.data.autoTags) ? scene.data.autoTags : []);
  const ignoredSet = () => new Set(Array.isArray(scene.data.ignoredTags) ? scene.data.ignoredTags : []);
  const isDetected = (id) => !!lastFound && lastFound.counts.has(id);

  /** Analiza el texto y actualiza las etiquetas. Devuelve true si ha cambiado algo. */
  const runDetect = async (html) => {
    if (!detect || !store.get(scene.id)) return false;
    lastFound = detect(htmlToText(html));
    const patch = computeAutoTags(scene, lastFound);
    if (!patch) return false;
    await setData(patch);
    return true;
  };

  // ---------- Aviso al modificar una revisión que ya estaba escrita ----------
  // Si la revisión tiene texto y su último cambio es de otro día (o la escena está marcada
  // como terminada), al primer cambio aparece una franja sobre el editor que ofrece pasar lo
  // escrito en esta visita a una revisión nueva, dejando esta como estaba al abrirla.

  const opened = { body: active.body, words: active.words || 0, chars: active.chars || 0 }; // la revisión tal como estaba al entrar
  const NOTICE_KEY = 'creabel.revNotice';
  const dismissedToday = () => {
    try { return (JSON.parse(localStorage.getItem(NOTICE_KEY) || '{}') || {})[active.id] === today(); } catch (err) { return false; }
  };
  const lastChange = (() => {
    const d = new Date(String(active.updated_at || '').replace(' ', 'T') + 'Z');
    return isNaN(d) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const finished = scene.status === 2;
  const noticeDue = getPrefs().revisionNotice !== false && !!htmlToText(opened.body)
    && (finished || (lastChange && lastChange < today())) && !dismissedToday();
  const notice = h('div', { class: 'rev-notice' + (finished ? ' finished' : ''), hidden: true, role: 'status' });
  let noticeShown = false;

  const showNotice = () => {
    if (!noticeDue || noticeShown) return;
    noticeShown = true;
    notice.append(
      icon('history', 16),
      h('span.rev-notice-text', finished && !(lastChange && lastChange < today())
        ? t('revisions.noticeFinished', { name: revLabel(active) })
        : t('revisions.notice', { name: revLabel(active), date: formatDate(lastChange, { day: 'numeric', month: 'short', year: 'numeric' }) })),
      btn(t('revisions.noticeMove'), { icon: 'copy', small: true, kind: 'primary', title: t('revisions.noticeMoveHint'), onClick: moveToNewRevision }),
      btn(t('revisions.noticeStay'), { small: true, kind: 'ghost', onClick: () => {
        notice.hidden = true;
        // No vuelve a avisar hoy para esta revisión.
        try {
          localStorage.setItem(NOTICE_KEY, JSON.stringify({ [active.id]: today() }));
        } catch (err) { /* sin almacenamiento local, avisará de nuevo en la próxima visita */ }
      } }));
    notice.hidden = false;
  };

  /** Lo escrito en esta visita pasa a una revisión nueva; la que se abrió vuelve a su texto de entonces. */
  async function moveToNewRevision() {
    editor.flush();
    const html = editor.getHTML();
    try {
      // Primero se guarda el texto nuevo; solo después se restaura la revisión anterior.
      const rev = await store.create('revision', {
        parent_id: scene.id, position: revisions[revisions.length - 1].position + 1,
        body: html, words: scene.words || 0, chars: scene.chars || 0,
      });
      await store.update(active.id, { body: opened.body, words: opened.words, chars: opened.chars });
      toast(t('revisions.noticeMoved'), 'success', 5000);
      await switchRevision(rev.id);
    } catch (err) { toast(errorText(err), 'error'); }
  }

  const delay = autosaveDelay();
  const editor = createEditor({
    value: active.body, toolbar: 'full', lang: store.project.language, placeholder: t('scenes.placeholder'),
    onChange: (html, stats) => {
      showNotice();
      store.update(active.id, { body: html, words: stats.words, chars: stats.chars }, delay);
      store.update(scene.id, { words: stats.words, chars: stats.chars }, delay);
      store.logWordsSoon();
      activity();
      if (detect) {
        clearTimeout(detectTimer);
        detectTimer = setTimeout(async () => {
          if (await runDetect(html)) renderSide();
        }, 700);
      }
    },
    onSave: () => store.flush(),
    onTodo: () => addTask(),
    onMarkClick: (id) => showTask(id),
  });

  // ---------- Pendientes y documentación de la escena ----------

  /** Crea un pendiente sobre el texto seleccionado (o sobre la escena, si no hay selección). */
  async function addTask() {
    const captured = editor.captureSelection();
    const out = await taskDialog(null, { quote: captured ? captured.text : '' });
    if (!out) return;
    try {
      const task = await createTask(out, { sceneId: scene.id, quote: captured ? captured.text.slice(0, 200) : '' });
      if (captured) captured.apply(task.id);
      tasks.draw(); renderSide();
    } catch (err) { toast(errorText(err), 'error'); }
  }

  /** Al pulsar una marca del texto: muestra el pendiente y permite resolverlo, editarlo o borrarlo. */
  function showTask(id) {
    const task = store.get(id);
    if (!task || !isOpen(task)) {
      editor.removeMark(id);
      return;
    }
    const m = modal({
      title: t('task.singular'),
      body: h('div.task-detail', kindBadge(task), h('p.task-detail-text', task.name), task.data.quote ? h('blockquote.task-quote', task.data.quote) : null),
      actions: [
        btn(t('common.delete'), { kind: 'ghost', icon: 'trash', onClick: async () => {
          if (!(await deleteTask(task))) return;
          editor.removeMark(id);
          m.close();
          tasks.draw(); renderSide();
        } }),
        btn(t('common.edit'), { icon: 'edit', onClick: async () => {
          m.close();
          if (await editTask(task)) tasks.draw(); renderSide();
        } }),
        btn(t('tasks.resolve'), { kind: 'primary', icon: 'check', onClick: async () => {
          await setResolved(task, true);
          editor.removeMark(id);
          m.close();
          tasks.draw(); renderSide();
        } }),
      ],
    });
  }

  const tasks = tasksPanel({
    contextId: scene.id,
    onAdd: addTask,
    onFocus: (task) => { if (!editor.focusMark(task.id)) toast(t('tasks.noMark'), 'info'); },
    onResolved: (task, done) => { if (done) editor.removeMark(task.id); },
    onRemoved: (task) => editor.removeMark(task.id),
    onChange: () => renderSide(),
  });
  const references = referencesPanel(scene, { onChange: () => renderSide() });

  // ---------- Revisiones ----------

  const switchRevision = async (id) => {
    editor.flush();
    await store.flush();
    const rev = store.get(id);
    await store.update(scene.id, { data: { ...scene.data, activeRevision: id }, words: rev ? rev.words : 0, chars: rev ? rev.chars : 0 });
    store.logWordsSoon();
    refresh();
  };

  const newRevision = async () => {
    const out = await formDialog({
      title: t('revisions.new'),
      intro: t('revisions.newHint'),
      fields: [{ name: 'from', label: t('revisions.start'), type: 'select', value: 'copy', options: [{ value: 'copy', label: t('revisions.fromCurrent') }, { value: 'empty', label: t('revisions.empty') }] }],
      submitLabel: t('common.create'),
    });
    if (!out) return;
    editor.flush();
    const copy = out.from === 'copy';
    try {
      const rev = await store.create('revision', {
        parent_id: scene.id, position: revisions[revisions.length - 1].position + 1,
        body: copy ? editor.getHTML() : '', words: copy ? active.words : 0, chars: copy ? active.chars : 0,
      });
      await switchRevision(rev.id);
    } catch (err) { toast(errorText(err), 'error'); }
  };

  const deleteRevision = async () => {
    if (revisions.length < 2) return;
    if (!(await confirmDialog(t('revisions.confirmDelete'), { danger: true, confirmLabel: t('common.delete') }))) return;
    editor.flush();
    const remaining = revisions.filter((r) => r.id !== active.id);
    try {
      await store.remove(active.id);
      await switchRevision(remaining[remaining.length - 1].id);
    } catch (err) { toast(errorText(err), 'error'); }
  };

  // ---------- Etiquetas ----------

  /**
   * Guarda una lista de etiquetas elegida por el usuario. Lo que el usuario añade pasa a ser
   * suyo (deja de ser automático); lo que quita y sigue mencionado en el texto se recuerda
   * para que la detección no vuelva a ponerlo.
   */
  const saveList = async (key, nextIds) => {
    const prev = validIds(scene.data[key]);
    const auto = autoSet();
    const ignored = ignoredSet();
    for (const id of nextIds) {
      if (!prev.includes(id)) { auto.delete(id); ignored.delete(id); }
    }
    for (const id of prev) {
      if (!nextIds.includes(id)) {
        auto.delete(id);
        if (isDetected(id)) ignored.add(id);
      }
    }
    await setData({ [key]: nextIds, autoTags: [...auto], ignoredTags: [...ignored] });
    renderSide();
  };

  /**
   * Campo de varios elementos (personajes, lugares, objetos…). `opts.ids` y `opts.save` permiten
   * que un campo lea y guarde su lista a su manera (los lugares); `opts.hint` añade una nota.
   */
  const tagField = (label, type, key, opts = {}) => {
    const ids = opts.ids || validIds(scene.data[key]);
    const save = opts.save || ((next) => saveList(key, next));
    const auto = autoSet();
    const pick = async () => {
      const items = store.list(type).map((e) => pickItem(e, {
        group: type === 'character' ? t(e.data.kind === 'secondary' ? 'character.secondaryPlural' : 'character.mainPlural')
          : type === 'custom' ? (customType(e) || {}).name || t('custom.noType') : null,
      }));
      // Personajes agrupados: primero los principales. Fichas propias: por tipo.
      if (type === 'character') items.sort((a, b) => (a.group === b.group ? 0 : a.group === t('character.mainPlural') ? -1 : 1));
      if (type === 'custom') items.sort((a, b) => String(a.group).localeCompare(String(b.group)));
      const picked = await pickDialog({ title: label, items, selected: ids, emptyText: t('tags.noneAvailable') });
      // Lo que ya estaba conserva su orden; lo nuevo se añade al final.
      if (picked) await save([...ids.filter((id) => picked.includes(id)), ...picked.filter((id) => !ids.includes(id))]);
    };
    // Cada elemento elegido se ve como una ficha pequeña: imagen, nombre, identificador y detalle.
    // Con más de uno, las fichas se reordenan arrastrándolas (o con Alt+flechas).
    // En los personajes con fecha de nacimiento se indica la edad que tienen en la fecha de la escena.
    const age = (e) => {
      const years = type === 'character' ? ageAt(e, scene.data.time) : null;
      return years == null ? '' : tn('family.years', years);
    };
    const cards = h('div.mini-cards', ids.map((id) => miniCard(store.get(id), {
      auto: auto.has(id),
      note: age(store.get(id)),
      onRemove: () => save(ids.filter((x) => x !== id)),
    })));
    if (ids.length > 1) sortable(cards, { onSort: (order) => save(order) });
    return h('div.tag-field',
      h('div.tag-head', h('span.form-label', label), chooseBtn(pick, false, `${t('tags.choose')}: ${label}`)),
      ids.length ? cards : h('p.muted.small', t('tags.none')),
      opts.hint && ids.length > 1 ? h('span.form-hint', opts.hint) : null);
  };

  /**
   * Campo de un solo elemento (el lugar, el personaje que narra): su ficha, o «Sin definir», y
   * un botón que abre el selector con las fichas de todos los que se pueden elegir.
   */
  const oneField = (label, current, { type, auto = false, onChange }) => {
    const choose = async () => {
      const items = store.list(type).map((e) => pickItem(e, {
        group: type === 'character' ? t(e.data.kind === 'secondary' ? 'character.secondaryPlural' : 'character.mainPlural') : null,
      }));
      if (type === 'character') items.sort((a, b) => (a.group === b.group ? 0 : a.group === t('character.mainPlural') ? -1 : 1));
      const picked = await pickDialog({
        title: label, items, single: true, selected: current ? [current.id] : [],
        emptyText: t('tags.noneAvailable'), noneLabel: t('tags.leaveUnset'),
      });
      if (picked) await onChange(picked[0] || null);
    };
    return h('div.tag-field',
      h('div.tag-head', h('span.form-label', label), chooseBtn(choose, !!current, `${t(current ? 'tags.change' : 'tags.choose')}: ${label}`)),
      current
        ? h('div.mini-cards', miniCard(current, { auto, onRemove: () => onChange(null) }))
        : h('p.muted.small', t('side.undefined')));
  };

  const povField = () => {
    const pov = scene.data.pov || {};
    const typeSel = h('select.input', { 'aria-label': t('pov.label') },
      h('option', { value: '' }, t('tags.unset')),
      POV_TYPES.map((p) => h('option', { value: p }, t('pov.' + p))));
    typeSel.value = pov.type || '';
    typeSel.addEventListener('change', async () => {
      await setData({ pov: typeSel.value ? { type: typeSel.value, characterId: pov.characterId || null } : null });
      renderSide();
    });
    const wrap = h('div.tag-field', h('span.form-label', t('pov.label')), typeSel);
    if (!POV_WITH_CHARACTER.has(pov.type)) return wrap;
    // El personaje que narra, con su ficha.
    return h('div.tag-stack', wrap, oneField(t('pov.character'), store.get(pov.characterId) || null, {
      type: 'character',
      onChange: async (id) => {
        await setData({ pov: { type: pov.type, characterId: id } });
        renderSide();
      },
    }));
  };

  // Lugares: uno o varios (una escena de tránsito pasa por más de uno), en el orden en que se
  // recorren. Se guardan en data.locations; data.locationId sigue llevando el primero.
  const locationField = () => {
    const save = async (nextIds) => {
      const prev = sceneLocationIds(scene);
      const auto = autoSet();
      const ignored = ignoredSet();
      for (const id of nextIds) {
        if (!prev.includes(id)) { auto.delete(id); ignored.delete(id); }
      }
      for (const id of prev) {
        if (!nextIds.includes(id)) {
          auto.delete(id);
          if (isDetected(id)) ignored.add(id);
        }
      }
      // Dejarlo vacío a propósito: que la detección no lo rellene con los lugares mencionados.
      if (!nextIds.length) for (const l of store.list('location')) if (isDetected(l.id)) ignored.add(l.id);
      await setData({ locations: nextIds, locationId: nextIds[0] || null, autoTags: [...auto], ignoredTags: [...ignored] });
      renderSide();
    };
    return tagField(t('location.plural'), 'location', 'locations', { ids: sceneLocationIds(scene), save, hint: t('tags.locationsOrder') });
  };

  const timeField = () => {
    const input = h('input.input', { type: 'datetime-local', 'aria-label': t('tags.time') });
    input.value = scene.data.time || '';
    // Al teclear una fecha el navegador avisa del cambio a cada cifra del año. Se guarda cada vez,
    // pero el panel no se repinta mientras se escribe (se perdería el cursor): solo al salir del
    // campo, y solo si el foco no ha pasado a otro control del panel (para no quitárselo).
    const before = scene.data.time || '';
    // Cuándo termina (opcional): con ello «Continuidad» detecta escenas que se solapan.
    const end = h('input.input', { type: 'datetime-local', 'aria-label': t('tags.timeEnd') });
    end.value = scene.data.timeEnd || '';
    // Con inicio y fin se dice cuánto dura la escena; se actualiza al teclear, sin repintar el panel.
    const duration = h('p.scene-duration', { hidden: true });
    const showDuration = () => {
      const text = sceneDuration({ data: { time: input.value, timeEnd: end.value } });
      const wrong = !text && !!input.value && !!end.value && end.value <= input.value;
      duration.hidden = !text && !wrong;
      duration.classList.toggle('is-wrong', wrong);
      clear(duration).append(icon(wrong ? 'info' : 'clock', 14), h('span', wrong ? t('tags.endBeforeStart') : t('tags.duration', { span: text })));
    };
    showDuration();
    input.addEventListener('change', () => { setData({ time: input.value || null }); showDuration(); });
    input.addEventListener('blur', () => setTimeout(() => {
      if ((scene.data.time || '') !== before && !side.contains(document.activeElement)) renderSide();
    }, 0));
    end.addEventListener('change', () => { setData({ timeEnd: end.value || null }); showDuration(); });
    return h('div.tag-field',
      h('span.form-label', t('tags.time')), input, h('span.form-hint', t('tags.timeHint')),
      h('span.form-label', t('tags.timeEnd')), end, duration, h('span.form-hint', t('tags.timeEndHint')));
  };

  // Eventos de la escena: hechos que OCURREN aquí (toman la fecha de la escena y, en la línea
  // temporal, salen dentro de ella) o que aquí SE CUENTAN (un recuerdo: conservan su fecha).
  const eventsField = () => {
    const list = sceneEvents(scene);
    const linksOf = (ev) => (Array.isArray(ev.data.scenes) ? ev.data.scenes : []).filter((l) => l && store.get(l.id));
    const guard = async (fn) => {
      try { await fn(); } catch (err) { toast(errorText(err), 'error'); }
      renderSide();
    };
    const link = async () => {
      const linked = new Set(list.map((x) => x.ev.id));
      const items = store.list('event').filter((ev) => !linked.has(ev.id))
        .sort((a, b) => (eventTime(a) < eventTime(b) ? -1 : 1))
        .map((ev) => ({
          id: ev.id, label: displayName(ev), code: entityCode(ev), icon: 'calendar',
          sub: [eventTime(ev) ? formatDateTime(eventTime(ev)) : '', eventTargets(ev).map((e) => displayName(e)).join(', ')].filter(Boolean).join(' · '),
        }));
      const picked = await pickDialog({ title: t('events.linkHere'), items, selected: [], emptyText: t('events.noneToLink') });
      if (!picked || !picked.length) return;
      await guard(async () => {
        for (const id of picked) await store.patchData(id, { scenes: [...linksOf(store.get(id)), { id: scene.id, mode: 'in' }] });
        // Una escena sin fecha toma la del primer evento que la tenga.
        const dated = picked.map((id) => store.get(id)).find((ev) => ev.data.time);
        if (!scene.data.time && dated) await dateHostScene([{ id: scene.id, mode: 'in' }], dated.data.time);
      });
    };
    const create = async () => {
      const out = await eventDialog(null, [], [{ id: scene.id, mode: 'in' }]);
      if (out) await guard(() => saveEvent(null, out));
    };
    const row = ({ ev, mode }) => {
      const sel = h('select.input.event-mode', { 'aria-label': t('events.mode') }, EVENT_MODES.map((m) => h('option', { value: m }, t('events.mode.' + m))));
      sel.value = mode;
      sel.addEventListener('change', () => guard(() => store.patchData(ev.id, { scenes: linksOf(ev).map((l) => (l.id === scene.id ? { ...l, mode: sel.value } : l)) })));
      // La tarjeta informa del hecho: qué es, cuándo ocurre, a quién afecta y en qué otras
      // escenas está, para saber de un vistazo qué tiene que ver la escena con él.
      const targets = eventTargets(ev);
      const others = eventLinks(ev).filter((l) => l.scene !== scene);
      return h('div', { class: 'event-card' + (mode === 'told' ? ' is-told' : '') },
        h('div.event-card-head',
          h('span.event-card-title', icon(mode === 'told' ? 'note' : 'calendar', 14), h('strong', displayName(ev)), codeTag(ev)),
          btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: async () => {
            const out = await eventDialog(ev);
            if (out) await guard(() => saveEvent(ev, out));
          } }),
          btn('', { icon: 'x', small: true, kind: 'ghost', title: t('events.unlink'), onClick: () => guard(() => store.patchData(ev.id, { scenes: linksOf(ev).filter((l) => l.id !== scene.id) })) })),
        eventTime(ev) ? h('span.event-card-when', eventWhen(ev)) : null,
        ev.data.description ? h('p.event-card-text', ev.data.description) : null,
        targets.length ? h('div.chips', targets.map((e) => h('a', { class: 'chip k-' + e.type, href: entityHref(e) }, displayName(e)))) : null,
        others.length ? h('span.event-card-also', t('events.alsoIn'), ' ',
          others.flatMap((l, i) => [i ? ', ' : '', h('a', { href: entityHref(l.scene) }, displayName(l.scene)), l.mode === 'told' ? ` (${t('events.toldMark')})` : ''])) : null,
        sel);
    };
    return [
      h('div.tag-head.end',
        store.list('event').length > list.length ? linkBtn(link, t('events.linkHere')) : null,
        addBtn(create, t('events.add'))),
      list.length ? h('div.event-cards', list.map(row)) : h('p.muted.small', t('events.noneInScene')),
      h('span.form-hint', t('events.sceneHint')),
    ];
  };

  // ---------- Continuidad: cambios de estado y secretos que se revelan en esta escena ----------
  const continuityBox = () => {
    const states = sceneStates(scene);
    const reveals = revealsIn(scene);
    const removeState = (state) => store.patchData(scene.id, { states: sceneStates(scene).filter((s) => s.id !== state.id) });
    return [
      h('div.tag-field',
        h('div.tag-head', h('span.form-label', t('state.title')),
          addBtn(async () => { if (await stateDialog(scene)) renderSide(); }, t('state.add'))),
        states.length ? h('div.state-list', states.map((s) => h('div.state-item',
          h('p',
            h('a', { href: entityHref(store.get(s.entity)) }, displayName(store.get(s.entity))), ': ',
            s.gone ? h('span.track-gone', t('state.goneMark')) : null, s.text,
            store.get(s.holder) ? h('span.muted', ` · ${t('state.heldBy', { name: displayName(store.get(s.holder)) })}`) : null),
          btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('common.edit'), onClick: async () => { if (await stateDialog(scene, s)) renderSide(); } }),
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.remove'), onClick: async () => { await removeState(s); renderSide(); } }))))
          : h('p.muted.small', t('state.none'))),
      h('div.tag-field',
        h('div.tag-head', h('span.form-label', t('secret.revealed')),
          addBtn(async () => { if (await revealDialog(scene)) renderSide(); }, t('secret.revealHere'))),
        reveals.length ? h('div.state-list', reveals.map(({ secret, reveal }) => h('div.state-item',
          h('p', h('strong', whoLabel(reveal.who)), ': ', displayName(secret)),
          btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('common.remove'), onClick: async () => {
            await store.patchData(secret.id, { reveals: secretReveals(secret).filter((r) => r.id !== reveal.id) });
            renderSide();
          } }))))
          : h('p.muted.small', t('secret.noneHere'))),
      h('a.side-more', { href: `#/p/${pid}/continuity` }, t('continuity.open')),
    ];
  };

  // Una revisión puede llevar nombre propio («Primer borrador»); si no, se numera.
  const revLabel = (r) => (r.name && r.name.trim()) || t('revisions.n', { n: revisions.indexOf(r) + 1 });

  const renameRevision = async () => {
    const out = await formDialog({
      title: t('revisions.rename'),
      fields: [{ name: 'name', label: t('common.name'), value: active.name || '', placeholder: t('revisions.namePlaceholder') }],
    });
    if (!out) return;
    await store.update(active.id, { name: out.name });
    renderSide();
  };

  const revisionBox = () => {
    const sel = h('select.input', { 'aria-label': t('revisions.title') },
      revisions.map((r) => h('option', { value: r.id }, `${revLabel(r)} · ${tn('count.words', r.id === active.id ? scene.words || 0 : r.words || 0)}`)));
    sel.value = active.id;
    sel.addEventListener('change', () => switchRevision(sel.value));
    return h('div.tag-field',
      h('div.tag-head', h('span.form-label', t('revisions.title')), addBtn(newRevision, t('revisions.new'))),
      sel,
      h('div.btn-row',
        revisions.length > 1 ? btn(t('revisions.compare'), { icon: 'history', small: true, onClick: () => {
          editor.flush();
          compareRevisions({ revisions, labelOf: revLabel, activeId: active.id, currentHtml: editor.getHTML(), onActivate: switchRevision });
        } }) : null,
        btn('', { icon: 'edit', small: true, kind: 'ghost', title: t('revisions.rename'), onClick: renameRevision }),
        revisions.length > 1 ? btn('', { icon: 'trash', small: true, kind: 'ghost', title: t('revisions.delete'), onClick: deleteRevision }) : null));
  };

  // Bloques de la ficha que están desplegados; se recuerda entre escenas y entre visitas.
  const SIDE_KEY = 'creabel.sceneSide';
  const openGroups = new Set();
  try {
    for (const key of JSON.parse(localStorage.getItem(SIDE_KEY) || '[]')) openGroups.add(key);
  } catch (err) { /* sin almacenamiento local: todos los bloques empiezan plegados */ }
  function toggleGroup(key) {
    if (openGroups.has(key)) openGroups.delete(key);
    else openGroups.add(key);
    try { localStorage.setItem(SIDE_KEY, JSON.stringify([...openGroups])); } catch (err) { /* no es crítico */ }
    renderSide();
  }

  function renderSide() {
    const scroll = side.scrollTop;
    clear(side);
    // La ficha se organiza en bloques plegables. Plegado, cada bloque resume en una línea lo
    // que contiene, de modo que la escena se lee de un vistazo y solo se abre lo que se va a tocar.
    const d = scene.data;
    const names = (ids, max = 3) => {
      const list = validIds(ids).map((id) => entityLabel(store.get(id)));
      return list.length > max ? `${list.slice(0, max).join(', ')} +${list.length - max}` : list.join(', ');
    };
    const join = (...parts) => parts.filter(Boolean).join(' · ');
    const places = sceneLocationIds(scene).map((id) => store.get(id));
    const where = places.length === 1 ? locationLabel(places[0]) : places.map((l) => displayName(l)).join(' → ');
    const openTasks = tasksFor(scene.id).filter(isOpen).length;
    const linked = refsFor(scene.id);
    const events = sceneEvents(scene);

    const group = (key, iconName, title, summary, body, count) => {
      const open = openGroups.has(key);
      // Plegado y vacío, el bloque se queda solo en su título: sin línea de resumen.
      return h('section', { class: 'side-group' + (open ? ' open' : '') + (!open && !summary ? ' bare' : '') },
        h('button.side-group-head', { type: 'button', 'aria-expanded': String(open), onclick: () => toggleGroup(key) },
          h('span.side-group-icon', icon(iconName, 17)),
          h('span.side-group-text',
            h('span.side-group-title', title, count ? h('span.count-badge', String(count)) : null),
            open || !summary ? null : h('span.side-group-summary', summary)),
          icon(open ? 'chevron-down' : 'chevron-right', 15)),
        open ? h('div.side-group-body', body) : null);
    };

    side.append(
      h('div.side-top',
        h('h3', t('side.title')),
        statusPicker(scene.status, (s) => store.update(scene.id, { status: s }))),
      group('who', 'users', t('side.who'), join(names(d.characters), povLabel(scene), names(d.groups)), [
        tagField(t('character.plural'), 'character', 'characters'),
        povField(),
        tagField(t('group.plural'), 'group', 'groups'),
        detect ? h('p.muted.small.auto-legend', h('span.auto-mark', t('tags.autoSample')), ' ', t('tags.autoLegend')) : null,
      ]),
      group('where', 'pin', t('side.where'), join(where, d.time ? formatDateTime(d.time) : '', sceneDuration(scene) ? t('tags.lasts', { span: sceneDuration(scene) }) : ''), [
        locationField(),
        timeField(),
      ]),
      // Eventos enlazados con la escena: plegado, el bloque dice cuáles son (los que ocurren en
      // ella y, aparte, los que solo se cuentan), para que se vea sin abrir nada.
      group('events', 'calendar', t('events.title'), join(
        events.filter((x) => x.mode === 'in').map((x) => displayName(x.ev)).join(', '),
        events.some((x) => x.mode === 'told') ? `${t('events.toldShort')}: ${events.filter((x) => x.mode === 'told').map((x) => displayName(x.ev)).join(', ')}` : ''),
      eventsField(), events.length),
      group('plot', 'layers', t('side.plot'), join(names(d.strands), names(d.objects), names(d.custom)), [
        tagField(t('strand.plural'), 'strand', 'strands'),
        tagField(t('object.plural'), 'object', 'objects'),
        // Fichas propias (naves, tecnologías…), si el proyecto tiene alguna.
        store.list('custom').length ? tagField(t('custom.plural'), 'custom', 'custom') : null,
      ]),
      group('continuity', 'shield', t('nav.continuity'),
        join(sceneStates(scene).length ? tn('state.count', sceneStates(scene).length) : '', revealsIn(scene).length ? tn('secret.revealCount', revealsIn(scene).length) : ''),
        continuityBox()),
      group('tasks', 'flag', t('tasks.title'), openTasks ? tn('tasks.openCount', openTasks) : '', tasks.el, openTasks),
      // Documentación y notas enlazadas con la escena, en el mismo bloque.
      group('refs', 'paperclip', t('side.refsNotes'), [...linked, ...notesFor(scene.id)].map((r) => displayName(r)).join(', '),
        [references.el, notesPanel(scene, { onChange: () => renderSide() })], linked.length + notesFor(scene.id).length),
      group('versions', 'history', t('side.versions'), active.name && active.name.trim() ? `${active.name.trim()} (${revisions.indexOf(active) + 1}/${revisions.length})` : t('side.revisionOf', { n: revisions.indexOf(active) + 1, m: revisions.length }), revisionBox()));
    side.scrollTop = scroll;
  }

  // Primera pasada al abrir: recoge lo que se haya creado desde la última vez que se editó.
  await runDetect(active.body);
  renderSide();

  // ---------- Cabecera y navegación ----------

  const ordered = allScenesOrdered();
  const index = ordered.findIndex((s) => s.id === scene.id);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
  // Herramientas del editor que se abren a su derecha (vista partida, estilo) y la lectura en
  // voz alta. Mientras el panel está abierto ocupa el sitio de la ficha de la escena.
  const tools = createSceneTools({
    scene, editor, lang: store.project.language,
    onMode: (mode) => {
      layout.classList.toggle('pane-open', !!mode);
      splitBtn.classList.toggle('active', mode === 'split');
      styleBtn.classList.toggle('active', mode === 'style');
    },
  });
  const splitBtn = editor.addTool('columns', t('split.title'), () => tools.toggleSplit());
  const styleBtn = editor.addTool('spell', t('style.title'), () => tools.toggleStyle());
  editor.addTool('volume', t('speech.title'), () => tools.toggleSpeech());
  const layout = h('div.scene-layout', h('div.scene-main', notice, tools.speechBar, editor.el), side, tools.pane);

  clear(el);
  el.append(
    pageHeader({
      back: chapter ? { href: `#/p/${pid}/chapters/${chapter.id}`, label: chapterLabel(chapter) } : { href: `#/p/${pid}/chapters`, label: t('nav.chapters') },
      titleNode: titleWithCode(scene, titleInput(scene.name, (name) => store.update(scene.id, { name }), t('scenes.titlePlaceholder'))),
      actions: [
        prev ? btn('', { icon: 'chevron-left', title: t('scenes.previous'), href: `#/p/${pid}/scenes/${prev.id}` }) : null,
        next ? btn('', { icon: 'chevron-right', title: t('scenes.next'), href: `#/p/${pid}/scenes/${next.id}` }) : null,
        btn(t('scenes.tags'), { icon: 'settings', onClick: () => layout.classList.toggle('side-hidden') }),
        menuButton(() => [
          { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
            if (!(await confirmDialog(t('scenes.confirmDelete', { name: displayName(scene) }), { danger: true, confirmLabel: t('common.delete') }))) return;
            try {
              clearTimeout(detectTimer);
              editor.destroy();
              await store.remove(scene.id);
              store.logWordsSoon();
              location.hash = chapter ? `#/p/${pid}/chapters/${chapter.id}` : `#/p/${pid}/chapters`;
            } catch (err) { toast(errorText(err), 'error'); }
          } },
        ]),
      ],
    }),
    layout);

  // Si se llega desde el panel de pendientes, se salta a la marca correspondiente.
  if (query && query.task) setTimeout(() => editor.focusMark(query.task), 300);
  // Si se vuelve con el botón «↩» de la barra de arriba, el cursor, donde estaba.
  else if (query && query.resume) {
    const spot = lastSceneOf(pid);
    if (spot && spot.id === scene.id && spot.caret != null) setTimeout(() => editor.setCaret(spot.caret), 150);
  }

  return async () => {
    clearTimeout(detectTimer);
    tools.close();
    // La escena que se deja, para poder volver a ella de un toque.
    rememberScene(pid, scene.id, editor.getCaret());
    editor.flush();
    // Deja las etiquetas al día con el último texto antes de salir.
    try { await runDetect(editor.getHTML()); } catch (err) { /* salir de la página no debe fallar por esto */ }
    editor.destroy();
  };
}
