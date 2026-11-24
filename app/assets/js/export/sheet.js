// Exportación de la ficha completa de un elemento (personaje, lugar, objeto...) a un archivo:
// texto, Word, página web, tabla (Excel o CSV) o JSON. Todos los formatos llevan lo mismo
// —los datos, el texto y los apartados de la ficha (export/elements.js)—; el JSON, además, las
// imágenes. Y todo lo que se exporta se puede volver a importar (import/elements.js).
import { store } from '../store.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import { blobToDataUrl, downloadBlob, slugify } from '../text.js';
import { formDialog, toast, errorText } from '../ui.js';
import { entityLabel, characterSegments, customType } from '../model.js';
import { IO_TYPES, buildElementsFile, columnsFor, elementBlocks, elementData } from './elements.js';
import { extractTraits } from '../traits.js';
import { toTxt, toDocx, toHtml } from './formats.js';

const ctOf = (e) => (e.type === 'custom' ? customType(e) : null);

/** La ficha como lista de bloques, para los formatos de lectura (TXT, DOCX, HTML). */
export function buildSheetBlocks(e) {
  return elementBlocks(e, columnsFor(e.type, ctOf(e)), { heading: 'h2', long: true });
}

/** La ficha como datos estructurados, con las imágenes incluidas. */
export async function buildSheetJson(e) {
  const out = { creabel: 'ficha', version: 2, exported_at: new Date().toISOString(), project: store.project.name, ...elementData(e) };
  out.images = [];
  for (const img of store.imagesOf(e.id)) {
    try {
      out.images.push({ name: img.name, mime: img.mime, main: e.data.profileImage === img.id, data: await blobToDataUrl(await api.imageBlob(img)) });
    } catch (err) {
      out.images.push({ name: img.name, mime: img.mime, main: e.data.profileImage === img.id, data: null });
    }
  }
  return out;
}

/** Pregunta el formato y descarga la ficha. */
export async function exportEntityDialog(e) {
  const choice = await formDialog({
    title: t('sheet.export'),
    intro: t('sheet.hint', { name: entityLabel(e) }),
    fields: [{
      name: 'format', label: t('export.format'), type: 'select', value: 'txt',
      options: [
        { value: 'txt', label: t('export.txt') },
        { value: 'docx', label: t('export.docx') },
        { value: 'html', label: t('export.html') },
        { value: 'json', label: t('sheet.json') },
        // Como tabla de una fila, con las mismas columnas que la lista de su apartado.
        ...(IO_TYPES.includes(e.type) ? [{ value: 'xlsx', label: t('export.xlsx') }, { value: 'csv', label: t('export.csv') }] : []),
      ],
    }],
    submitLabel: t('export.run'),
  });
  if (!choice) return;
  try {
    // Los rasgos se extraen al escribir en la ficha; si el texto se cambió por otra vía, se ponen al día.
    if (e.type === 'character') {
      const fresh = extractTraits(characterSegments(e), store.project.language);
      const stored = Array.isArray(e.data.traitsAuto) ? e.data.traitsAuto : [];
      if (fresh.join('|') !== stored.join('|')) await store.patchData(e.id, { traitsAuto: fresh });
    }
    await store.flush();
    const base = slugify(entityLabel(e));
    if (choice.format === 'json') {
      const data = await buildSheetJson(e);
      downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${base}.json`);
    } else if (choice.format === 'xlsx' || choice.format === 'csv') {
      downloadBlob(buildElementsFile(choice.format, e.type, [e], ctOf(e)), `${base}.${choice.format}`);
    } else {
      const blocks = buildSheetBlocks(e);
      const opts = { title: entityLabel(e), author: store.project.author, lang: store.project.language, font: 'serif', size: 12, indent: false };
      const blob = { txt: toTxt, docx: toDocx, html: toHtml }[choice.format](blocks, opts);
      downloadBlob(blob, `${base}.${choice.format}`);
    }
    toast(t('export.done'), 'success');
  } catch (err) {
    console.error(err);
    toast(errorText(err), 'error', 6000);
  }
}
