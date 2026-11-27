// Guardar en el PC lo que se exporta (copias de seguridad, Word, EPUB, hojas de cálculo…).
// En la aplicación de Windows la descarga del navegador integrado no avisa de nada: el archivo
// aparece en Descargas y el usuario ni se entera. Aquí lo escribe la propia aplicación en la
// carpeta Descargas (sin pisar uno que ya exista: «nombre (1).zip») y avisa con su nombre y un
// botón que abre la carpeta con el archivo señalado.
import { h } from './dom.js';
import { t } from './i18n.js';
import { toast } from './ui.js';
import { tauri } from './platform.js';

/** «novela.creabel.zip» → «novela (2).creabel.zip». */
function numbered(filename, n) {
  const dot = filename.indexOf('.');
  return dot > 0 ? `${filename.slice(0, dot)} (${n})${filename.slice(dot)}` : `${filename} (${n})`;
}

/** El aviso de «guardado»: el nombre y, si se puede, el botón que lo enseña en su carpeta. */
export function announceSaved(name, reveal) {
  const node = h('span.toast-saved',
    h('span', t('files.saved', { name })),
    reveal ? h('button.toast-action', { type: 'button', onclick: () => reveal() }, t('files.reveal')) : null);
  toast(node, 'success', reveal ? 12000 : 6000);
}

/**
 * Escribe el archivo en Descargas y avisa. Lanza un error si no se puede (falta el permiso, el
 * disco está lleno…): quien llama recurre entonces a la descarga normal.
 */
export async function saveToDownloads(blob, filename) {
  const T = tauri();
  const fs = T && T.fs;
  if (!fs || !fs.writeFile || !fs.BaseDirectory) throw new Error('fs-unavailable');
  const baseDir = fs.BaseDirectory.Download;
  let name = filename;
  for (let n = 1; n < 500 && await fs.exists(name, { baseDir }); n++) name = numbered(filename, n);
  await fs.writeFile(name, new Uint8Array(await blob.arrayBuffer()), { baseDir });
  let full = '';
  try { full = await T.path.join(await T.path.downloadDir(), name); } catch (err) { full = ''; }
  const canReveal = full && T.opener && T.opener.revealItemInDir;
  announceSaved(name, canReveal ? () => T.opener.revealItemInDir(full).catch((err) => console.error(err)) : null);
  return name;
}
