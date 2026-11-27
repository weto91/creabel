// Desactiva la «reducción de código» (R8/ProGuard) en la versión de Android. La plantilla de
// Tauri la activa en las compilaciones de versión y no en las de depuración: R8 quita y renombra
// clases de Kotlin/Java, y lo que funciona en depuración puede fallar en la versión publicada (la
// aplicación se cerraba sola al llegar la primera imagen al lector de QR, dentro de ML Kit). Sin
// ella, el código de Android es el mismo en las dos y el APK solo crece un poco: casi todo su
// tamaño es la biblioteca de Rust, que R8 no toca.
//
// La plantilla lo escribe así en el bloque «release» (complemento de Android 9):
//     optimization {
//        enable = true
//     }
// y las anteriores, con «isMinifyEnabled = true». Se cambian las dos formas.
// El proyecto se genera de nuevo en cada compilación, así que el cambio se aplica cada vez.
// Uso: node scripts/android-minify.mjs src-tauri/gen/android/app/build.gradle.kts
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Uso: node scripts/android-minify.mjs <build.gradle.kts>');
  process.exit(2);
}
const before = readFileSync(file, 'utf8');
const changed = [];
const text = before
  .replace(/(\boptimization\s*\{\s*enable\s*=\s*)true/g, (m, head) => { changed.push('optimization { enable = true }'); return head + 'false'; })
  .replace(/(\bis(?:Minify|ShrinkResources)Enabled\s*=\s*)true/g, (m, head) => { changed.push(m.replace(/\s+/g, ' ')); return head + 'false'; });

// El bloque de la versión, para comprobar cómo queda (y enseñarlo si la plantilla ha cambiado).
const at = text.search(/getByName\("release"\)/);
const release = at >= 0 ? text.slice(at, at + 500) : '';
const off = /\boptimization\s*\{\s*enable\s*=\s*false/.test(release) || /\bisMinifyEnabled\s*=\s*false/.test(release);

if (changed.length) {
  writeFileSync(file, text);
  console.log('Reducción de código desactivada: ' + changed.join(', '));
} else if (off) {
  console.log('La reducción de código ya estaba desactivada.');
} else {
  // No se ha encontrado cómo la activa esta plantilla: la compilación se detiene, para no
  // publicar otra vez una versión con R8 sin darse cuenta.
  console.error('::error::No se encuentra cómo activa la plantilla la reducción de código en ' + file + ': revisa scripts/android-minify.mjs');
  console.error(release || text.slice(0, 2000));
  process.exit(1);
}
