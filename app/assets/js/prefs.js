// Preferencias de la aplicación (idioma, tema, tipografía del editor...).
// Se guardan en el servidor y se copian en localStorage para aplicarlas al instante al cargar.
import { api } from './api.js';
import { applyPalette } from './palettes.js';
import { matchLang } from './i18n.js';

export const DEFAULT_PREFS = {
  lang: 'es',
  theme: 'system',
  dateFormat: 'auto', // 'auto' (según el idioma) o un patrón numérico: 'dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'…
  timeFormat: 'auto', // 'auto' | '24' | '12'
  numberFormat: 'auto', // 'auto' | '1.234,56' | '1,234.56' | '1 234,56'
  editorFont: 'serif',
  editorSize: 18,
  editorLineHeight: 1.7,
  editorWidth: 760,
  indent: true,
  paragraphSpacing: false,
  smartTypography: true,
  spellcheck: true,
  autoTags: true,
  autosaveSeconds: 2,
  revisionNotice: true, // avisar al modificar una revisión escrita otro día o de una escena terminada
  palette: 'slate', // id de una paleta de serie o 'custom'
  customPalette: '', // paleta personalizada, como texto JSON { light, dark }
  trashDays: 30, // días que lo borrado permanece en la papelera (1 a 60)
  backupReminder: true, // avisar cuando un proyecto lleva días sin copia de seguridad
  backupReminderDays: 5,
  lastBackups: '', // fecha de la última copia de cada proyecto, como texto JSON { idProyecto: fecha }
  // Los dos botones que se eligen en la barra de abajo de las pantallas estrechas (ver shell.js):
  // 'item:<apartado>' va directo a él; 'group:<grupo>' abre la lista de ese grupo del menú.
  navSlot1: 'item:characters',
  navSlot2: 'item:notes',
};

export const FONT_STACKS = {
  serif: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'Times New Roman', serif",
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "'Courier New', Courier, 'Liberation Mono', monospace",
};

const LOCAL_KEY = 'creabel.ui';
let prefs = { ...DEFAULT_PREFS };

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {};
  } catch (e) {
    return {};
  }
}

export function getPrefs() {
  return prefs;
}

/** Antes de iniciar sesión solo se conocen las preferencias guardadas en este navegador. */
export function initLocalPrefs() {
  const local = readLocal();
  // La primera vez, el idioma del sistema (o el más parecido de los que tiene Creabel).
  prefs = { ...DEFAULT_PREFS, lang: matchLang(navigator.language || 'es'), ...local };
  applyPrefs();
}

export async function loadPrefs() {
  try {
    const remote = await api.get('settings');
    if (remote && typeof remote === 'object' && !Array.isArray(remote)) {
      prefs = { ...prefs, ...remote };
    }
  } catch (e) {
    // Si falla se sigue con las preferencias locales.
  }
  applyPrefs();
}

export async function savePrefs(patch) {
  prefs = { ...prefs, ...patch };
  applyPrefs();
  await api.post('settings', patch);
}

/** Aplica un cambio sin guardarlo todavía (vista previa mientras se elige un color). */
export function previewPrefs(patch) {
  prefs = { ...prefs, ...patch };
  applyPrefs();
}

export function resolvedTheme() {
  if (prefs.theme === 'dark' || prefs.theme === 'light') return prefs.theme;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyPrefs() {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme();
  // Con hora de 12 horas («5:30 p. m.») las columnas de hora necesitan más ancho.
  root.toggleAttribute('data-time12', prefs.timeFormat === '12');
  applyPalette(prefs.palette, prefs.customPalette, resolvedTheme());
  const s = root.style;
  s.setProperty('--editor-font', FONT_STACKS[prefs.editorFont] || FONT_STACKS.serif);
  s.setProperty('--editor-size', (Number(prefs.editorSize) || 18) + 'px');
  s.setProperty('--editor-lh', String(Number(prefs.editorLineHeight) || 1.7));
  s.setProperty('--editor-width', (Number(prefs.editorWidth) || 760) + 'px');
  s.setProperty('--editor-indent', prefs.indent ? '1.6em' : '0');
  s.setProperty('--editor-pgap', prefs.paragraphSpacing ? '0.8em' : '0');
  try {
    // La paleta también se copia: así la pantalla de acceso ya sale con los colores elegidos.
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ theme: prefs.theme, lang: prefs.lang, palette: prefs.palette, customPalette: prefs.customPalette }));
  } catch (e) {
    // Almacenamiento local no disponible: no es crítico.
  }
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (prefs.theme === 'system') applyPrefs();
});
