# Creabel

**El taller de tu novela**, para Windows y Android: capítulos y escenas, personajes, lugares y
demás fichas, línea temporal, continuidad, análisis del texto, guías de escritura y exportación a
Word, EPUB, PDF y texto. Los proyectos se guardan en tu propio dispositivo.

*A writing studio for novelists, for Windows and Android, in 19 languages.*

## Descargar

- **Windows**: en **Microsoft Store** (busca «Creabel»), que la instala sin avisos y la
  actualiza sola. O con el instalador `Creabel_X.Y.Z_x64-setup.exe` de
  [Versiones](https://github.com/weto91/creabel/releases), que avisa cuando hay una versión nueva
  y se actualiza con un clic. Usa una de las dos en cada PC, no las dos a la vez.
- **Android**: `Creabel_X.Y.Z_android.apk`, en [Versiones](https://github.com/weto91/creabel/releases)
  (también estará en Google Play).

Los proyectos se pueden sincronizar entre tus dispositivos, también sin conexión: emparejando el
móvil con el PC por código QR o con tu propio servidor WebDAV (un NAS, Nextcloud…).

Creabel no recoge ningún dato: ver la [política de privacidad](PRIVACIDAD.md).

## Apoyar el proyecto

Creabel es gratuita y sin anuncios. Si te ayuda con tu novela, puedes apoyar su desarrollo:
https://paypal.me/weto1991.

## Licencia

[GNU GPL v3](LICENSE) con [términos adicionales](LICENSE-ADDITIONAL-TERMS.md): quien copie o
modifique Creabel debe publicar su código con la misma licencia, conservar visible la atribución
(Álvaro Rubio Adán, [github.com/weto91](https://github.com/weto91) y el enlace de donaciones) y
usar otro nombre para su versión.

## Agradecimientos

Creabel se inspira en [bibisco](https://github.com/andreafeccomandi/bibisco), de Andrea
Feccomandi: de él vienen ideas sobre cómo organizar una novela y algunos ejemplos de preguntas
para las fichas. bibisco es software libre con la misma licencia (GNU GPL v3).

## Cómo está hecho

- `app/`: la interfaz (HTML, CSS y JavaScript sin dependencias ni compilación).
- `src-tauri/`: la aplicación nativa ([Tauri 2](https://v2.tauri.app)): ventana, actualizaciones
  y permisos.
- `scripts/` y `.github/workflows/`: compilación y publicación automáticas con GitHub Actions.
- `CHANGELOG.md`: los cambios de cada versión.

Compilar en un equipo propio necesita Node.js, Rust y, para Android, Android Studio con el NDK:

```bash
npm install
npx tauri icon src-tauri/app-icon.svg
npx tauri dev
```

© Álvaro Rubio Adán — [github.com/weto91](https://github.com/weto91)
