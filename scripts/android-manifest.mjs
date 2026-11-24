// Añade al AndroidManifest.xml que genera Tauri (`tauri android init`) los permisos que Creabel
// necesita y que la plantilla no trae:
//  - ACCESS_LOCAL_NETWORK: desde Android 17, las aplicaciones compiladas para esa versión (la
//    plantilla de Tauri usa targetSdk 37) no pueden usar la red local sin este permiso, que
//    además se pide en el momento de usarlo (ver src-tauri/android/MainActivity.kt). Sin él no
//    se puede conectar con el PC emparejado ni buscarlo en la red, ni con un NAS de casa.
// En versiones anteriores de Android el permiso no existe y no tiene efecto.
//
// Uso: node scripts/android-manifest.mjs <carpeta gen/android>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || 'src-tauri/gen/android';
const manifest = join(root, 'app/src/main/AndroidManifest.xml');
const gradle = join(root, 'app/build.gradle.kts');
const PERMISSIONS = ['android.permission.ACCESS_LOCAL_NETWORK'];

if (!existsSync(manifest)) {
  console.error(`::error::No se encuentra ${manifest}`);
  process.exit(1);
}
let xml = readFileSync(manifest, 'utf8');
const open = /<manifest\b[^>]*>/.exec(xml);
if (!open) {
  console.error(`::error::${manifest} no tiene la etiqueta <manifest>`);
  process.exit(1);
}
const missing = PERMISSIONS.filter((name) => !xml.includes(`"${name}"`));
if (missing.length) {
  const lines = missing.map((name) => `\n    <uses-permission android:name="${name}" />`).join('');
  const at = open.index + open[0].length;
  xml = xml.slice(0, at) + lines + xml.slice(at);
  writeFileSync(manifest, xml);
}
const declared = [...xml.matchAll(/<uses-permission\s+android:name="([^"]+)"/g)].map((m) => m[1]);
console.log('Permisos en el manifiesto:', declared.join(', '));
if (existsSync(gradle)) {
  const sdk = readFileSync(gradle, 'utf8').split('\n').filter((l) => /(compile|target|min)Sdk/.test(l)).map((l) => l.trim());
  console.log('Versiones de Android:', sdk.join(' · '));
}
