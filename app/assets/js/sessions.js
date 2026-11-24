// Sesiones de escritura: mide el tiempo de escritura activa en las escenas.
// Cada cambio en el editor cuenta como actividad; el tiempo entre dos cambios se suma a la
// sesión si no pasan más de dos minutos. Una pausa más larga (o un cambio de día) cierra
// la sesión y la siguiente pulsación abre otra.
// Una sesión es un elemento de tipo 'session': data = { day, start, seconds, words }.
import { store } from './store.js';
import { today } from './text.js';

const IDLE_MS = 2 * 60 * 1000;
// Las sesiones de menos de 20 segundos no se guardan: suelen ser una corrección suelta.
const MIN_MS = 20 * 1000;

let current = null;

function clock() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

async function persist() {
  const s = current;
  if (!s || s.activeMs < MIN_MS) return;
  const data = { day: s.day, start: s.start, seconds: Math.round(s.activeMs / 1000), words: store.totalWords() - s.startWords };
  if (!s.entity) {
    if (s.creating) return;
    s.creating = true;
    try {
      s.entity = await store.create('session', { data });
    } catch (e) {
      // Si no se puede guardar ahora, se reintenta con la siguiente actividad.
    }
    s.creating = false;
    return;
  }
  if (store.get(s.entity.id)) store.update(s.entity.id, { data }, 5000);
}

/** Se llama con cada cambio en el texto de una escena. */
export function activity() {
  if (!store.project) return;
  const now = Date.now();
  const day = today();
  if (!current || current.pid !== store.project.id || current.day !== day || now - current.lastTs > IDLE_MS) {
    current = { pid: store.project.id, day, start: clock(), lastTs: now, activeMs: 0, startWords: store.totalWords(), entity: null, creating: false };
    return;
  }
  current.activeMs += now - current.lastTs;
  current.lastTs = now;
  persist();
}

export function allSessions() {
  return store.list('session')
    .map((e) => ({ day: e.data.day || '', start: e.data.start || '', seconds: Number(e.data.seconds) || 0, words: Number(e.data.words) || 0 }))
    .filter((s) => s.day && s.seconds > 0)
    .sort((a, b) => (a.day + a.start < b.day + b.start ? -1 : 1));
}
