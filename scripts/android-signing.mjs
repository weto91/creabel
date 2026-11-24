// Firma de la versión de Android: añade al proyecto que genera Tauri (src-tauri/gen/android) la
// configuración que lee la clave de keystore.properties, como indica la guía de Tauri. Ese
// proyecto se genera de nuevo en cada compilación, así que el cambio se aplica cada vez.
// Uso: node scripts/android-signing.mjs src-tauri/gen/android/app/build.gradle.kts
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Uso: node scripts/android-signing.mjs <build.gradle.kts>');
  process.exit(2);
}
let text = readFileSync(file, 'utf8');
if (text.includes('signingConfigs.getByName("release")')) {
  console.log('La firma ya estaba configurada.');
  process.exit(0);
}
const signing = `    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            val keystoreProperties = Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(FileInputStream(keystorePropertiesFile))
            }
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["password"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["password"] as String
        }
    }
`;
const buildTypes = text.search(/^\s*buildTypes\s*\{/m);
if (buildTypes < 0) {
  console.error('::error::No se encuentra «buildTypes {» en ' + file);
  process.exit(1);
}
text = text.slice(0, buildTypes) + signing + text.slice(buildTypes);
const release = /getByName\("release"\)\s*\{/;
if (!release.test(text)) {
  console.error('::error::No se encuentra «getByName("release") {» en ' + file);
  process.exit(1);
}
text = text.replace(release, (m) => `${m}\n            signingConfig = signingConfigs.getByName("release")`);
// Las clases, importadas arriba: dentro de «android { }» el nombre «java» ya es otra cosa (con
// AGP 9, «java.util.Properties()» da «Unresolved reference 'util'»).
const imports = ['import java.util.Properties', 'import java.io.FileInputStream']
  .filter((line) => !text.split('\n').some((l) => l.trim() === line));
if (imports.length) text = imports.join('\n') + '\n' + text;
writeFileSync(file, text);
console.log('Firma de Android configurada.');
