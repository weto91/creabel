// Botón «Importar / exportar» de los apartados de elementos (personajes, lugares, objetos,
// grupos, fichas propias, notas, diccionario): un menú con las dos acciones.
import { h } from './dom.js';
import { t } from './i18n.js';
import { store } from './store.js';
import { menuButton } from './ui.js';
import { customType } from './model.js';
import { exportElementsDialog } from './export/elements.js';
import { importElements } from './import/elements.js';

/**
 * `list()` devuelve los elementos que se exportan (los del apartado, en su orden); `ct` es el
 * tipo de ficha propia, si procede; `onDone()` se llama cuando una importación cambia algo.
 * Devuelve el nodo que se pone en la cabecera de la página.
 */
/**
 * Importar en una ficha concreta: devuelve { input, item }. `input` (oculto) se añade a la
 * página e `item` al menú ⋯ de la ficha. Lo que traiga el archivo se aplica a ese elemento.
 */
export function sheetImport(e, onDone) {
  const input = h('input', { type: 'file', accept: '.json,.csv,.xlsx,.docx,.txt,text/csv,text/plain,application/json', hidden: true });
  input.addEventListener('change', async () => {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    await store.flush();
    if (await importElements(file, e.type, e.type === 'custom' ? customType(e) : null, { target: e }) && onDone) onDone();
  });
  return { input, item: { label: t('io.importSheet'), icon: 'upload', onClick: () => input.click() } };
}

export function ioMenu(type, { list, ct, onDone }) {
  const input = h('input', { type: 'file', accept: '.json,.csv,.xlsx,.docx,.txt,text/csv,text/plain,application/json', hidden: true });
  input.addEventListener('change', async () => {
    const file = input.files[0];
    input.value = '';
    if (file && await importElements(file, type, ct) && onDone) onDone();
  });
  return h('span.io-menu', input, menuButton(() => [
    { label: t('io.export'), icon: 'download', onClick: () => exportElementsDialog(type, list(), ct) },
    { label: t('io.import'), icon: 'upload', onClick: () => input.click() },
  ], { label: t('io.title'), icon: 'download', kind: 'default', title: t('io.hint') }));
}
