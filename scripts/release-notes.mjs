// Saca de CHANGELOG.md las notas de una versión (el apartado «## [x.y.z]» hasta el siguiente)
// y las escribe en un archivo. Si la versión no tiene apartado, o está vacío, falla: así no se
// publica nunca una versión sin su lista de cambios.
// Uso: node scripts/release-notes.mjs 0.2.0 notas.md
import { readFileSync, writeFileSync } from 'node:fs';

const [version, out] = process.argv.slice(2);
if (!version || !out) {
  console.error('Uso: node scripts/release-notes.mjs <versión> <archivo de salida>');
  process.exit(2);
}
const text = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8').replace(/\r\n?/g, '\n');
const lines = text.split('\n');
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const start = lines.findIndex((l) => new RegExp(`^## \\[${escaped}\\]`).test(l));
if (start < 0) {
  console.error(`::error::CHANGELOG.md no tiene el apartado «## [${version}]». Añádelo antes de publicar.`);
  process.exit(1);
}
let end = lines.findIndex((l, i) => i > start && /^## \[/.test(l));
if (end < 0) end = lines.length;
const notes = lines.slice(start + 1, end).join('\n').trim();
if (!notes) {
  console.error(`::error::El apartado «## [${version}]» de CHANGELOG.md está vacío.`);
  process.exit(1);
}
writeFileSync(out, notes + '\n');
console.log(`Notas de la versión ${version}:\n${notes}`);
