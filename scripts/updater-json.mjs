// Escribe latest.json, el archivo que consulta la aplicación de Windows para saber si hay una
// versión nueva: número, notas, fecha, y la dirección y la firma del instalador.
// Uso: node scripts/updater-json.mjs <versión> <notas.md> <instalador .exe> <firma .sig> <url base> <salida>
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [version, notesFile, installer, sigFile, baseUrl, out] = process.argv.slice(2);
if (!out) {
  console.error('Uso: node scripts/updater-json.mjs <versión> <notas> <instalador> <firma> <url base> <salida>');
  process.exit(2);
}
const latest = {
  version,
  notes: readFileSync(notesFile, 'utf8').trim(),
  pub_date: new Date().toISOString(),
  platforms: {
    'windows-x86_64': {
      signature: readFileSync(sigFile, 'utf8').trim(),
      url: `${baseUrl.replace(/\/$/, '')}/${encodeURIComponent(basename(installer))}`,
    },
  },
};
writeFileSync(out, JSON.stringify(latest, null, 2) + '\n');
console.log(`latest.json para ${version}: ${latest.platforms['windows-x86_64'].url}`);
