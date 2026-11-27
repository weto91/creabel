**Español** · [English](README.en.md)

<p align="center"><img src="docs/readme/es/creabel.png" alt="Creabel, el taller de tu novela: Windows y Android, 19 idiomas, sin cuentas ni anuncios, también sin conexión, gratis y de código abierto"></p>

Creabel reúne en un solo sitio todo lo que sostiene una novela: capítulos y escenas, personajes,
lugares y demás fichas, línea temporal, continuidad, análisis del texto, guías de escritura y
exportación a Word, EPUB, PDF y texto. Los proyectos se guardan en tu propio dispositivo.

## Descargar

- **Windows**: en **Microsoft Store** (busca «Creabel»), que la instala sin avisos de Windows y
  la actualiza sola. O con el instalador `Creabel_X.Y.Z_x64-setup.exe` de
  [Versiones](https://github.com/weto91/creabel/releases), que avisa cuando hay una versión nueva
  y se actualiza con un clic. Usa una de las dos en cada PC, no las dos a la vez.
- **Android**: en [Google Play](https://play.google.com/store/apps/details?id=io.github.weto91.creabel),
  que la actualiza sola. O con `Creabel_X.Y.Z_android.apk`, de
  [Versiones](https://github.com/weto91/creabel/releases). Las dos van firmadas igual: se puede
  pasar de una a otra sin desinstalar.

## Así es Creabel

*Las capturas son de un proyecto de ejemplo: la novela y sus personajes son inventados.*

### El inicio de cada proyecto

Portada, la frase que resume la novela, por dónde ibas, lo siguiente por escribir y cómo va el
libro: palabras, objetivo del día, racha y fecha de entrega.

![Inicio del proyecto: portada, sinopsis, la última escena tocada, la siguiente por escribir, progreso del manuscrito, racha y entrega](docs/readme/es/inicio.png)

### Escribir

Un editor tranquilo, pensado para muchas horas. Al lado, la ficha de la escena: quién sale, dónde
y cuándo pasa, qué tramas avanza, sus pendientes y sus revisiones.

![Editor de una escena con su texto y, al lado, la ficha de la escena](docs/readme/es/escena.png)

### Apuntas una vez, Creabel lo cruza todo

![Lo que se apunta en una escena alimenta la línea temporal, la continuidad, las relaciones, el gráfico narrativo, las fichas y el análisis](docs/readme/es/apuntas-una-vez.png)

### Personajes con entrevista

Cada personaje se construye respondiendo preguntas por secciones (datos personales, aspecto,
psicología, creencias…). Creabel saca de lo que escribes sus rasgos clave y sabe en qué escenas
aparece.

![Ficha de personaje: rasgos clave, papel en la historia, nacimiento y la entrevista por secciones](docs/readme/es/personaje.png)

### La novela de un vistazo

El tablero tiene una columna por capítulo y una tarjeta por escena, con el color de cada trama.
Las tarjetas se arrastran para cambiar el orden. Aquí, con el tema oscuro.

![Tablero con los capítulos en columnas y las escenas como tarjetas, en tema oscuro](docs/readme/es/tablero.png)

### Cuándo pasa cada cosa

La línea temporal ordena escenas y eventos por fecha (también los de antes de que empiece el
libro) y dice cuánto tiempo pasa entre uno y otro.

![Línea temporal con eventos y escenas ordenados por fecha](docs/readme/es/linea-temporal.png)

### Relaciones que se dibujan solas

Quién coincide con quién, qué personaje recorre qué lugares, quién avanza cada trama… Creabel lo
deduce de lo que ya has apuntado. También puedes dibujar tus propios mapas.

![Gráfico de todas las relaciones entre personajes, lugares, tramas y objetos](docs/readme/es/relaciones.png)

### Tu ritmo y tu estilo

Palabras al día, rachas, previsión de cuándo terminarás, actividad de los últimos meses, y una
revisión de estilo (repeticiones, muletillas, frases largas, diálogo) con las reglas del idioma de
tu novela.

![Análisis de la escritura: palabras de hoy, racha, objetivo y previsión, actividad y media por día](docs/readme/es/analisis.png)

### En el móvil

La misma novela en el teléfono o la tableta, con una barra abajo para moverse con el pulgar y un
botón para volver a la escena en la que estabas.

<p align="center"><img src="docs/readme/es/movil.png" width="720" alt="Creabel en dos teléfonos Android: el inicio del proyecto y el editor de una escena"></p>

### Todo el camino

![Las cuatro fases: planifica, escribe, revisa y publica, con lo que ofrece Creabel en cada una](docs/readme/es/de-la-idea-al-libro.png)

## Tus datos

![El PC y el móvil se emparejan con un código QR y pueden usar también un servidor WebDAV propio; sin cuentas, también sin conexión y sin perder nada](docs/readme/es/tus-dispositivos.png)

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
