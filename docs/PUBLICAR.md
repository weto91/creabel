# Compilar y publicar Creabel

Todo se compila en GitHub Actions: no hace falta instalar Node, Rust ni Android Studio.

- **creabel-dev** (privado): aquí se trabaja. Cada subida a `main` compila una versión de prueba.
- **creabel** (público): recibe el código y los instaladores de cada versión publicada, con su
  lista de cambios. La aplicación de Windows mira aquí si hay versión nueva.

## Una sola vez

### 1. El repositorio público

En GitHub, **New repository** → nombre `creabel` → **Public** → sin README, sin .gitignore y sin
licencia (todo eso llega desde creabel-dev al publicar la primera versión).

### 2. El permiso para publicar en él (`PUBLIC_REPO_TOKEN`)

1. GitHub → tu foto → **Settings** → **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. Nombre: `creabel-publicar`. Caducidad: la que prefieras (al caducar, se crea otro y se
   cambia el secreto).
3. **Repository access** → **Only select repositories** → `weto91/creabel` (solo el público).
4. **Permissions** → **Repository permissions** → **Contents**: *Read and write*.
5. **Generate token** y copia el valor (solo se ve una vez).
6. En **creabel-dev** → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret** → nombre `PUBLIC_REPO_TOKEN`, valor el token.

### 3. Las claves de firma

1. En **creabel-dev** → **Actions** → **Generar claves (una sola vez)** → **Run workflow**.
2. Al terminar, abre la ejecución y descarga el artefacto **claves-creabel**.
3. Sigue su `LEEME.txt`: un secreto por archivo (`TAURI_SIGNING_PRIVATE_KEY`,
   `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, `UPDATER_PUBKEY`, `ANDROID_KEY_BASE64`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).
4. Guarda la carpeta en un sitio seguro (un gestor de contraseñas) y **borra el artefacto** en la
   página de la ejecución.

> Si se pierden estas claves, las instalaciones existentes ya no aceptarán actualizaciones (y en
> Google Play habría que pedir el cambio de la clave de subida). No vuelvas a lanzar este flujo
> salvo que quieras sustituirlas.

Desde que están las tres de Android (`ANDROID_KEY_*`), también las compilaciones de prueba dan un
APK firmado con ellas (ver «Versiones de prueba»).

### 4. La licencia

En **creabel-dev** en GitHub → **Add file** → **Create new file** → nombre `LICENSE` → botón
**Choose a license template** → **GNU General Public License v3.0** → **Review and submit** →
**Commit changes**. Después, en GitHub Desktop, **Fetch origin** y **Pull**.

### 5. El enlace de donaciones

Sustituir `[ENLACE DE DONACIONES]` en `README.md` y en `LICENSE-ADDITIONAL-TERMS.md` (y en el
«Acerca de» de la aplicación) cuando esté elegido.

## Cada versión

1. **Lista de cambios.** Añade arriba de `CHANGELOG.md` el apartado de la versión nueva:

   ```markdown
   ## [0.2.0]

   ### Añadido
   - …

   ### Corregido
   - …
   ```

   Sin ese apartado, la publicación se detiene antes de compilar.
2. **Commit y push** en GitHub Desktop.
3. **Etiqueta.** En GitHub Desktop, pestaña **History** → botón derecho sobre ese commit →
   **Create Tag…** → `v0.2.0` → **Create Tag**, y después **Push origin** (sube también la
   etiqueta).
4. En **Actions** se ve **Publicar versión**: comprueba, compila Windows y Android, copia el
   código al repositorio público (un commit por versión) y crea allí la versión con la lista de
   cambios, lo que instala la gente (`Creabel_X.Y.Z_x64-setup.exe` y
   `Creabel_X.Y.Z_android.apk`) y `latest.json` (no es para la gente, pero tiene que estar: es lo
   que consulta el actualizador).

   Lo de las tiendas no se publica: queda en la ejecución, en **Artifacts** — `microsoft-store`
   (el `.msix`) y `google-play` (el `.aab`). Los artefactos se borran a los 90 días: si hace falta
   uno más tarde, se publica una versión nueva (las tiendas, además, solo aceptan versiones con un
   número mayor que la última que tienen).
5. Las aplicaciones de Windows instaladas lo verán en su siguiente comprobación (al arrancar y
   cada seis horas) y ofrecerán actualizar.

Una etiqueta con guion (`v0.3.0-beta.1`) se publica como **versión previa**: sale en la página
de versiones, pero el actualizador no la ofrece.

## Versiones de prueba

Cada subida a `main` lanza **Compilar (prueba)**. En la ejecución, **Artifacts**:

- `creabel-windows`: el instalador. Esta versión no se actualiza sola (no va firmada para el
  actualizador).
- `creabel-tienda`: el paquete para Microsoft Store (`.msix`) y, en `paquete\`, lo mismo sin
  empaquetar para probarlo en el PC (ver «Microsoft Store» → «Probar el paquete»).
- `creabel-android`: un APK para teléfonos y tabletas ARM de 64 bits (casi todos). Para
  instalarlo hay que permitir «Instalar aplicaciones desconocidas». Si están las claves de
  Android, va firmado como el que se publica y cada prueba se instala encima de la anterior; si
  no, es uno de depuración.

En el resumen de la ejecución (arriba de la página, al terminar) sale con qué certificado va
firmado el APK, su huella SHA-256 y si está preparado para los teléfonos con páginas de memoria
de 16 KB (Google Play lo exige). La huella tiene que ser siempre la misma.

### Pasar del APK de depuración al firmado (una sola vez)

Android no deja instalar una aplicación encima de otra firmada con otra clave, y al desinstalar
se borra lo que hay en el teléfono. Así que, la primera vez:

1. En el móvil, sincroniza con el PC (o haz una copia de seguridad de cada proyecto que solo esté
   en el móvil).
2. Desinstala Creabel.
3. Instala el APK firmado, vuelve a emparejar con el PC y sincroniza: vuelven los proyectos.

Desde entonces, los APK firmados se instalan encima sin perder nada.

## Microsoft Store

La versión de la tienda es el mismo programa en un paquete MSIX (`scripts/msix.ps1`, con el
manifiesto `src-tauri/msix/AppxManifest.xml`). Microsoft lo firma al publicarlo, así que Windows
no avisa al instalarlo. Diferencias con la de GitHub:

- no busca actualizaciones: las trae la tienda (en «Acerca de» lo dice);
- trae su regla del cortafuegos para «Compartir este equipo» (puerto 47823, redes privadas);
- Windows la ejecuta dentro de su paquete: lo que crea en la carpeta de datos va a una copia
  privada de la tienda, pero lo que ya existía de la versión de GitHub lo modifica en su sitio.
  Por eso **no hay que tener las dos instaladas en el mismo PC** (cada una vería solo parte de los
  datos de la otra). Para pasar de una a otra: sincroniza, desinstala la que tenías marcando
  «borrar los datos de la aplicación», instala la otra, empareja y sincroniza.

### Una sola vez

1. Cuenta de desarrollador (gratis para particulares) en
   <https://developer.microsoft.com/store/register>.
2. Partner Center → **Apps and games** → **New product** → **MSIX or PWA app** → reservar
   «Creabel».
3. Los datos de **Product management** → **Product identity** ya están en el manifiesto:
   `weto91.Creabel`, `CN=5A2ACAC1-C803-4335-BE16-A8A6BA2942F0` y `weto91`. No se cambian.

### Probar el paquete en el PC (antes de subirlo)

El paquete sin firmar no se instala con doble clic, pero se puede registrar sin empaquetar. Mejor
en un usuario de Windows donde no esté la versión de GitHub (ver arriba), o pasando de una a otra
como se explica ahí:

1. Windows → **Configuración** → **Sistema** → **Para programadores** → **Modo de
   desarrollador**: activado.
2. Descarga el artefacto `creabel-tienda` de una compilación de prueba y descomprímelo en una
   carpeta que no vayas a borrar mientras la pruebas (la aplicación se ejecuta desde ahí).
3. En PowerShell, dentro de esa carpeta: `Add-AppxPackage -Register .\paquete\AppxManifest.xml`
4. Creabel sale en el menú Inicio. En **Ajustes → Acerca de** tiene que decir «Las
   actualizaciones llegan desde Microsoft Store».
5. Para quitarla: desinstalar como cualquier aplicación.

### Cada versión

1. Al publicar una versión (sin guion), en la ejecución de **Publicar versión** queda el artefacto
   `microsoft-store` con `Creabel_X.Y.Z.0_x64.msix`. Descárgalo y descomprímelo.
2. Partner Center → Creabel → **Start submission** (o **Update** en las siguientes). Los textos,
   las respuestas del cuestionario de edades y las notas para la revisión están en
   [`TIENDA.md`](TIENDA.md):
   - **Pricing and availability**: gratis, todos los mercados.
   - **Properties**: categoría *Productivity*; política de privacidad
     `https://github.com/weto91/creabel/blob/main/PRIVACIDAD.md`.
   - **Age ratings**: el cuestionario (sin contenido sensible, sin compras, sin chat).
   - **Packages**: sube el `.msix`.
   - **Store listings**: al menos un idioma (descripción y una captura como mínimo); los demás
     idiomas del paquete se pueden quitar o rellenar.
   - **Submission options**: explicar `runFullTrust`, por ejemplo: «Creabel es una aplicación de
     escritorio (Tauri) que guarda los proyectos en el disco y se sincroniza en la red local.»
3. **Submit to the Store**. Microsoft lo revisa (de horas a unos días) y lo publica.

## La web antigua

La versión web de `Z:\creabel` (PHP y MariaDB en el NAS) queda congelada: sigue funcionando, pero
lo nuevo se hace solo aquí. La interfaz de `app/` salió de ella el 2026-11-22.
