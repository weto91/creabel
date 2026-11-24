// Configuración extra de Tauri para una versión publicada: su número (el de la etiqueta), la
// clave pública con la que la aplicación comprobará las actualizaciones y la orden de firmar el
// instalador para el actualizador. Se mezcla con src-tauri/tauri.conf.json al compilar
// (tauri build --config <archivo>).
// Uso: node scripts/release-config.mjs 0.2.0 "<clave pública>" src-tauri/tauri.release.conf.json
import { writeFileSync } from 'node:fs';

const [version, pubkey, out] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version || '')) {
  console.error(`::error::Versión no válida: «${version}». La etiqueta debe ser como v1.2.3 (o v1.2.3-beta.1).`);
  process.exit(1);
}
const config = {
  version,
  bundle: { createUpdaterArtifacts: Boolean(pubkey) },
  plugins: { updater: { pubkey: pubkey || '' } },
};
writeFileSync(out, JSON.stringify(config, null, 2) + '\n');
console.log(`Versión ${version}${pubkey ? ', con firma para el actualizador' : ', sin firma para el actualizador'}.`);
