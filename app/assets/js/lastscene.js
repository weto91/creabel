// La última escena que se estaba escribiendo en cada proyecto, con la posición del cursor: para
// volver a ella de un toque cuando se sale a consultar algo (en el móvil, el botón «↩» de la
// barra de arriba). Se guarda en este dispositivo; si el almacenamiento no está disponible, se
// recuerda solo mientras la aplicación está abierta.
const KEY = 'creabel.lastScene';
let memory = {};
try {
  memory = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
} catch (err) {
  memory = {};
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (err) { /* sin almacenamiento: solo en memoria */ }
}

/** Al salir de una escena: cuál era y dónde estaba el cursor. */
export function rememberScene(pid, id, caret) {
  if (!pid || !id) return;
  memory[pid] = { id, caret: caret == null ? null : caret };
  save();
}

/** La última escena de un proyecto: { id, caret } o null. */
export function lastSceneOf(pid) {
  return (pid && memory[pid]) || null;
}
