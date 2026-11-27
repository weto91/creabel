// Ajustes de la aplicación: idioma, tema, editor y acceso.
import { h, clear, icon } from '../dom.js';
import { t, tn, LANGS, setLang, loadLang } from '../i18n.js';
import { api } from '../api.js';
import { session } from '../session.js';
import { getPrefs, savePrefs, previewPrefs, resolvedTheme } from '../prefs.js';
import { PALETTES, PALETTE_IDS, PALETTE_KEYS, DEFAULT_PALETTE, parseCustom, serializeCustom, contrast } from '../palettes.js';
import { btn, pageHeader, toast, errorText, formDialog, confirmDialog } from '../ui.js';
import { SETTINGS_SECTIONS, settingsSection } from '../settings-sections.js';
import { DATE_FORMATS, NUMBER_FORMATS, sampleDate, sampleTime, sampleNumber } from '../text.js';
import { isDesktopApp, isStoreApp, isNarrow } from '../platform.js';
import { checkForUpdate, showUpdateBanner, selfUpdates } from '../update.js';
import { syncSection } from './syncsettings.js';
import { navSlotChoices, NAV_SLOT_DEFAULTS, redrawNav } from '../shell.js';

/**
 * En Android, si la aplicación se cerró sola la última vez por un error, qué falló (lo apunta
 * MainActivity.kt en los datos de la aplicación; no sale del dispositivo). Se puede copiar para
 * avisar del fallo, o borrar. Devuelve null si no hay nada apuntado.
 */
function crashPanel() {
  const bridge = typeof window !== 'undefined' ? window.CreabelAndroid : null;
  let text = '';
  try { text = bridge && bridge.lastCrash ? String(bridge.lastCrash() || '') : ''; } catch (err) { text = ''; }
  if (!text.trim()) return null;
  const pre = h('pre.crash-text', text);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Sin acceso al portapapeles: se selecciona el texto y se copia a la antigua.
      const range = document.createRange();
      range.selectNodeContents(pre);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
    }
    toast(t('crash.copied'), 'success');
  };
  const box = h('section.panel',
    h('h3', t('crash.title')),
    h('p.muted', t('crash.hint')),
    pre,
    h('div.btn-row',
      btn(t('crash.copy'), { icon: 'copy', onClick: copy }),
      btn(t('common.delete'), { kind: 'ghost', onClick: () => {
        try { bridge.clearLastCrash(); } catch (err) { /* se borrará la próxima vez */ }
        box.remove();
      } })));
  return box;
}

/**
 * En pantallas estrechas, #/settings es una lista de todos los apartados (como los ajustes de
 * Android), con el cambio de tema a mano arriba; cada apartado se abre en su página.
 */
function settingsIndex(el, refresh) {
  const dark = resolvedTheme() === 'dark';
  const row = (attrs, iconName, title, hint, chevron) => h(attrs.href ? 'a' : 'button', { class: 'settings-row', ...(attrs.href ? {} : { type: 'button' }), ...attrs },
    h('span.settings-row-icon', icon(iconName, 20)),
    h('span.settings-row-text', h('strong', title), hint ? h('span', hint) : null),
    chevron ? icon('chevron-right', 16) : null);
  clear(el);
  el.append(
    pageHeader({ title: t('nav.settings') }),
    h('div.narrow',
      h('div.settings-list',
        row({ onclick: async () => {
          try { await savePrefs({ theme: dark ? 'light' : 'dark' }); } catch (err) { toast(errorText(err), 'error'); }
          refresh();
        } }, dark ? 'sun' : 'moon', t(dark ? 'nav.lightTheme' : 'nav.darkTheme'), t('settings.themeQuickHint'), false)),
      h('nav.settings-list', { 'aria-label': t('nav.settings') },
        SETTINGS_SECTIONS.map(([key, ic]) => row({ href: `#/settings/${key}` }, ic, t('settings.section.' + key), t(`settings.section.${key}.hint`), true)))));
}

export async function settingsPage({ el, params, query, refresh }) {
  const prefs = getPrefs();
  if (!params.section && isNarrow()) {
    settingsIndex(el, refresh);
    return;
  }
  // Cada apartado es una página propia (#/settings/<apartado>) con su entrada en el menú lateral
  // (o, en pantallas estrechas, en la lista de #/settings, a la que se vuelve con la flecha).
  const section = settingsSection(params.section);

  // Cómo ve el servidor esta conexión, para poder comprobar la restricción a la red local.
  // Solo se consulta en el apartado que lo muestra.
  let net = null;
  let storageOpen = false;
  if (section === 'info') {
    try {
      net = await api.get('network');
    } catch (err) {
      net = null;
    }
    // Si el servidor web entrega storage/ directamente, esa carpeta queda fuera de la restricción.
    try {
      const res = await fetch('storage/acceso.txt', { cache: 'no-store' });
      storageOpen = res.ok && (await res.text()).includes('creabel');
    } catch (err) {
      storageOpen = false;
    }
  }
  const networkPanel = () => {
    if (!net) return h('section.panel', h('p.muted', t('settings.infoUnavailable')));
    const chain = Array.isArray(net.forwarded) ? net.forwarded : [];
    const seen = t('settings.seenAs', { ip: chain.length ? chain.join(', ') : net.remote })
      + (chain.length ? t('settings.viaProxy', { proxy: net.remote }) : '');
    return h('section.panel',
      h('h3', t('settings.network')),
      h('p', t(net.local_only ? 'settings.localOn' : 'settings.localOff')),
      net.local_only && Array.isArray(net.ranges) && net.ranges.length
        ? h('p', t('settings.extraRanges', { ranges: net.ranges.join(', ') })) : null,
      h('p.muted', seen),
      net.software ? h('p.muted', t('settings.serverSoftware', { s: net.software, php: net.php || '—' })) : null,
      net.local_only && net.proxy && !chain.length ? h('p.notice', t('settings.proxyBlind')) : null,
      storageOpen ? h('p.notice', t('settings.storageOpen')) : null,
      net.local_only ? h('p.muted', t('settings.localTest')) : null);
  };

  const save = async (patch, redraw) => {
    try {
      // Un idioma nuevo se carga antes de aplicarlo (solo se baja el que se elige).
      if (patch.lang) patch = { ...patch, lang: await loadLang(patch.lang) };
      await savePrefs(patch);
      if (patch.lang) setLang(patch.lang);
      if (redraw) refresh();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const row = (label, control, hint) => h('label.form-row', h('span.form-label', label), control, hint ? h('span.form-hint', hint) : null);
  const select = (key, options, redraw) => {
    const sel = h('select.input', options.map(([value, label]) => h('option', { value }, label)));
    sel.value = String(prefs[key]);
    sel.addEventListener('change', () => save({ [key]: sel.value }, redraw));
    return sel;
  };
  const range = (key, min, max, step, format) => {
    const out = h('span.range-value', format(prefs[key]));
    const input = h('input.range', { type: 'range', min, max, step });
    input.value = prefs[key];
    input.addEventListener('input', () => { out.textContent = format(Number(input.value)); });
    input.addEventListener('change', () => save({ [key]: Number(input.value) }));
    return h('span.range-row', input, out);
  };
  const check = (key, label) => {
    const box = h('input', { type: 'checkbox' });
    box.checked = !!prefs[key];
    box.addEventListener('change', () => save({ [key]: box.checked }));
    return h('label.form-check', box, h('span', label));
  };

  const changeAccess = async () => {
    const usesPassword = session.mode === 'password';
    const out = await formDialog({
      title: t('settings.changePassword'),
      fields: [
        usesPassword ? { name: 'current', label: t('auth.currentPassword'), type: 'password', required: true, autocomplete: 'current-password' } : null,
        { name: 'password', label: t('auth.newPassword'), type: 'password', required: true, autocomplete: 'new-password' },
        { name: 'repeat', label: t('auth.repeatPassword'), type: 'password', required: true, autocomplete: 'new-password' },
      ].filter(Boolean),
    });
    if (!out) return;
    if (out.password !== out.repeat) return toast(t('auth.mismatch'), 'error');
    try {
      await api.post('auth/password', { current: out.current || '', password: out.password, mode: 'password' });
      session.mode = 'password';
      toast(t('settings.passwordChanged'), 'success');
      refresh();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const removePassword = async () => {
    if (!(await confirmDialog(t('settings.confirmNoPassword'), { danger: true, confirmLabel: t('settings.removePassword') }))) return;
    const out = await formDialog({ title: t('settings.removePassword'), fields: [{ name: 'current', label: t('auth.currentPassword'), type: 'password', required: true, autocomplete: 'current-password' }] });
    if (!out) return;
    try {
      await api.post('auth/password', { current: out.current, mode: 'none' });
      session.mode = 'none';
      toast(t('common.saved'), 'success');
      refresh();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  // ---------- Paleta de colores ----------
  // Cada paleta tiene juego claro y oscuro. La tarjeta muestra sus colores; la personalizada
  // abre debajo un editor con los seis colores base de cada juego.

  const paletteBox = h('div');
  const swatches = (set) => h('span.palette-strip', PALETTE_KEYS.map((key) => h('span.palette-swatch', { title: t('palette.color.' + key), style: { background: set[key] } })));
  let saveTimer = null;

  const drawPalettes = () => {
    clear(paletteBox);
    // getPrefs() y no `prefs`: cada guardado sustituye el objeto de preferencias.
    const chosen = getPrefs().palette;
    const current = PALETTE_IDS.includes(chosen) || chosen === 'custom' ? chosen : DEFAULT_PALETTE;
    const custom = parseCustom(getPrefs().customPalette, current === 'custom' ? DEFAULT_PALETTE : current);
    const card = (id, sets) => h('button', {
      type: 'button', class: 'palette-card' + (current === id ? ' active' : ''), 'aria-pressed': String(current === id),
      onclick: async () => {
        if (current === id) return;
        // La primera vez, la personalizada parte de la paleta que estaba en uso.
        const patch = { palette: id };
        if (id === 'custom' && !getPrefs().customPalette) patch.customPalette = serializeCustom(custom);
        await save(patch);
        drawPalettes();
      },
    },
      h('span.palette-name', t('palette.' + id), current === id ? h('span.badge', t('palette.inUse')) : null),
      h('span.palette-row', h('span.palette-mode', t('palette.light')), swatches(sets.light)),
      h('span.palette-row', h('span.palette-mode', t('palette.dark')), swatches(sets.dark)));

    paletteBox.append(h('div.palette-grid', PALETTE_IDS.map((id) => card(id, PALETTES[id])), card('custom', custom)));
    if (current !== 'custom') return;

    // Editor de la paleta personalizada: los cambios se ven al momento y se guardan al soltar.
    const state = { light: { ...custom.light }, dark: { ...custom.dark } };
    const warning = h('p.notice', { hidden: true });
    const checkContrast = () => {
      const low = ['light', 'dark'].filter((mode) => contrast(state[mode].text, state[mode].surface) < 4.5 || contrast(state[mode].text, state[mode].paper) < 4.5);
      warning.hidden = !low.length;
      warning.textContent = low.length ? t('palette.lowContrast', { modes: low.map((m) => t('palette.' + m).toLowerCase()).join(', ') }) : '';
    };
    const push = (persist) => {
      const value = serializeCustom(state);
      previewPrefs({ customPalette: value });
      checkContrast();
      clearTimeout(saveTimer);
      if (persist) saveTimer = setTimeout(() => save({ customPalette: value }), 400);
    };
    const column = (mode) => h('div.palette-column',
      h('h4', t('palette.' + mode)),
      PALETTE_KEYS.map((key) => {
        const input = h('input.color-input', { type: 'color' });
        input.value = state[mode][key];
        input.addEventListener('input', () => { state[mode][key] = input.value; push(false); });
        input.addEventListener('change', () => { state[mode][key] = input.value; push(true); drawCards(); });
        return h('label.palette-field', input, h('span', t('palette.color.' + key)));
      }));
    // Tras cada cambio se repintan solo las tarjetas, para no perder el selector de color abierto.
    const drawCards = () => {
      const grid = paletteBox.querySelector('.palette-grid');
      const fresh = h('div.palette-grid', PALETTE_IDS.map((id) => card(id, PALETTES[id])), card('custom', state));
      grid.replaceWith(fresh);
    };
    const from = h('select.input.inline-select', PALETTE_IDS.map((id) => h('option', { value: id }, t('palette.' + id))));
    paletteBox.append(h('div.palette-editor',
      h('p.muted', t('palette.customHint')),
      h('div.palette-columns', column('light'), column('dark')),
      warning,
      h('div.btn-row', h('span.form-label', t('palette.copyFrom')), from,
        btn(t('palette.copy'), { icon: 'copy', small: true, onClick: async () => {
          const src = PALETTES[from.value];
          await save({ customPalette: serializeCustom(src) });
          drawPalettes();
        } }))));
    checkContrast();
  };
  const sections = {
    language: () => {
      // En español los patrones se escriben con «aaaa»; cada opción lleva un ejemplo con la fecha de hoy.
      // Las letras del patrón, en el idioma de la interfaz (dd/mm/aaaa, TT.MM.JJJJ…).
      const patternLabel = (f) => f.replace('yyyy', t('settings.yearLetters')).replace('mm', t('settings.monthLetters')).replace('dd', t('settings.dayLetters'));
      return [
        h('section.panel',
          row(t('settings.language'), select('lang', LANGS.map((l) => [l.code, l.label]), true), t('settings.languageHint'))),
        h('section.panel',
          h('h3', t('settings.formats')),
          row(t('settings.dateFormat'), select('dateFormat', [
            ['auto', t('settings.formatAuto', { sample: sampleDate('auto') })],
            ...DATE_FORMATS.map((f) => [f, `${patternLabel(f)} (${sampleDate(f)})`]),
          ], true)),
          row(t('settings.timeFormat'), select('timeFormat', [
            ['auto', t('settings.formatAuto', { sample: sampleTime('auto') })],
            ['24', t('settings.time24', { sample: sampleTime('24') })],
            ['12', t('settings.time12', { sample: sampleTime('12') })],
          ], true)),
          row(t('settings.numberFormat'), select('numberFormat', [
            ['auto', t('settings.formatAuto', { sample: sampleNumber('auto') })],
            ...NUMBER_FORMATS.map((f) => [f, sampleNumber(f)]),
          ], true)),
          h('p.form-hint', t('settings.formatsNote'))),
      ];
    },

    appearance: () => {
      drawPalettes();
      return [
        h('section.panel',
          row(t('settings.theme'), select('theme', [['system', t('settings.themeSystem')], ['light', t('settings.themeLight')], ['dark', t('settings.themeDark')]], true))),
        h('section.panel',
          h('h3', t('settings.palette')),
          h('p.muted', t('settings.paletteHint')),
          paletteBox),
      ];
    },

    // Los dos botones libres de la barra de abajo (pantallas estrechas): un apartado o un grupo.
    mobilebar: () => {
      const { items, groups } = navSlotChoices();
      const preview = h('div.bottombar.bottombar-preview');
      const drawPreview = () => {
        clear(preview);
        const p = getPrefs();
        const slot = (value, fallback) => {
          const [kind, key] = String(value || fallback).split(':');
          if (kind === 'group') { const g = groups.find((x) => x.key === key); if (g) return [g.icon, t('nav.group.' + key)]; }
          const it = items.find(([k]) => k === key) || items.find(([k]) => k === fallback.split(':')[1]);
          return [it[1], t('nav.' + it[0])];
        };
        const cell = ([ic, label], fixed) => h('span', { class: 'bottombar-item' + (fixed ? '' : ' active') }, icon(ic, 21), h('span.bottombar-label', label));
        preview.append(
          cell(['home', t('nav.home')], true), cell(['book', t('nav.chapters')], true),
          cell(slot(p.navSlot1, NAV_SLOT_DEFAULTS[0])), cell(slot(p.navSlot2, NAV_SLOT_DEFAULTS[1])),
          cell(['menu', t('nav.menu')], true));
      };
      const choose = (prefKey, fallback, n) => {
        const sel = h('select.input',
          h('optgroup', { label: t('settings.navItems') }, items.map(([key]) => h('option', { value: 'item:' + key }, t('nav.' + key)))),
          h('optgroup', { label: t('settings.navGroups') }, groups.map((g) => h('option', { value: 'group:' + g.key }, t('nav.group.' + g.key)))));
        sel.value = getPrefs()[prefKey] || fallback;
        if (!sel.value) sel.value = fallback;
        sel.addEventListener('change', async () => { await save({ [prefKey]: sel.value }); drawPreview(); redrawNav(); });
        return row(t('settings.navSlot', { n }), sel);
      };
      drawPreview();
      return [h('section.panel',
        h('p.muted', t('settings.navFixed')),
        choose('navSlot1', NAV_SLOT_DEFAULTS[0], 3),
        choose('navSlot2', NAV_SLOT_DEFAULTS[1], 4),
        h('p.form-label', t('settings.navPreview')),
        preview)];
    },

    editor: () => [h('section.panel',
      row(t('settings.font'), select('editorFont', [['serif', t('settings.fontSerif')], ['sans', t('settings.fontSans')], ['mono', t('settings.fontMono')]])),
      row(t('settings.fontSize'), range('editorSize', 14, 26, 1, (v) => v + ' px')),
      row(t('settings.lineHeight'), range('editorLineHeight', 1.3, 2.2, 0.1, (v) => Number(v).toFixed(1))),
      row(t('settings.textWidth'), range('editorWidth', 560, 1100, 20, (v) => v + ' px')),
      row(t('settings.autosave'), range('autosaveSeconds', 1, 30, 1, (v) => t('settings.seconds', { n: v }))),
      check('indent', t('settings.indent')),
      check('paragraphSpacing', t('settings.paragraphSpacing')),
      check('smartTypography', t('settings.smartTypography')),
      check('spellcheck', t('settings.spellcheck')),
      check('autoTags', t('settings.autoTags')),
      check('revisionNotice', t('settings.revisionNotice')),
      h('div.editor-preview', h('div.editor-area', { html: `<p>${t('settings.preview1')}</p><p>${t('settings.preview2')}</p>` })))],

    data: () => [
      h('section.panel',
        h('h3', t('settings.trash')),
        h('p.muted', t('settings.trashHint')),
        row(t('settings.trashDays'), range('trashDays', 1, 60, 1, (v) => tn('stats.days', Number(v))))),
      h('section.panel',
        h('h3', t('settings.backups')),
        h('p.muted', t('settings.backupsHint')),
        check('backupReminder', t('settings.backupReminder')),
        row(t('settings.backupReminderDays'), range('backupReminderDays', 1, 60, 1, (v) => tn('stats.days', Number(v))))),
    ],

    security: () => [h('section.panel',
      h('h3', t('settings.access')),
      h('p.muted', t(session.mode === 'password' ? 'settings.accessPassword' : 'settings.accessNone')),
      h('div.btn-row',
        btn(t(session.mode === 'password' ? 'settings.changePassword' : 'settings.setPassword'), { icon: 'lock', onClick: changeAccess }),
        session.mode === 'password' ? btn(t('settings.removePassword'), { kind: 'ghost', onClick: removePassword }) : null))],

    info: () => [networkPanel()],

    sync: () => syncSection({ refresh, query }),

    about: () => [h('section.panel',
      h('p', t('settings.aboutText')),
      h('p', t('settings.madeBy'), ' ', h('strong', 'Álvaro Rubio Adán'), ' · ',
        h('a', { href: 'https://github.com/weto91', target: '_blank', rel: 'noopener noreferrer' }, 'github.com/weto91')),
      h('p.muted', t('settings.version', { v: session.version || '—' })),
      // En la aplicación de Windows: buscar una versión nueva a mano (también se mira sola al
      // arrancar). La de Microsoft Store la actualiza la tienda.
      selfUpdates ? h('div.btn-row', btn(t('update.check'), { icon: 'download', onClick: async () => {
        const update = await checkForUpdate({ quiet: false });
        if (update) showUpdateBanner(update);
        else toast(t('update.none'), 'success');
      } })) : isStoreApp ? h('p.muted', t('update.fromStore')) : null), crashPanel()].filter(Boolean),
  };

  clear(el);
  el.append(
    pageHeader({
      title: t('settings.section.' + section), subtitle: t(`settings.section.${section}.hint`),
      back: isNarrow() ? { href: '#/settings', label: t('nav.settings') } : null,
    }),
    h('div.narrow', sections[section]()));
}
