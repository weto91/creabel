# Cambios

Todas las versiones de Creabel, de la más reciente a la más antigua. Cada versión publicada toma
de aquí sus notas: el apartado con su número (`## [0.1.0]`), hasta el siguiente.

## [0.1.0]

### Añadido
- Primera versión como aplicación para Windows y Android, con toda la interfaz de Creabel:
  capítulos y escenas, fichas, línea temporal, continuidad, análisis, guías y exportación.
- Los proyectos se guardan en el propio dispositivo: una base de datos SQLite y una carpeta con
  los archivos (con nombre creabel_<md5>), sin límite de tamaño. Lo que hubiera en la versión
  preliminar se pasa solo la primera vez.
- Sincronización entre dispositivos, también sin conexión (los cambios se juntan al volver):
  - con un servidor WebDAV (NAS, Nextcloud…), por http o https, con la opción de aceptar
    certificados autofirmados;
  - emparejando el móvil con el PC por código QR (o escribiendo la dirección y el código);
  - eligiendo qué proyectos se sincronizan, y trayendo a un dispositivo los de los demás.
- En Windows, un botón deja a Creabel recibir conexiones en el cortafuegos (y, si la wifi está
  como Pública, permite marcarla como Privada); la pantalla dice el tipo de cada red.
- «Probar» dice qué pasa con cada dirección de un equipo emparejado (Creabel cerrada, el
  cortafuegos, otra red…) y qué proyectos comparte.
- Si el router le da al PC otra dirección, el móvil lo encuentra solo en la red y guarda la
  nueva: ya no hace falta volver a emparejar.
- En Android, al escanear el QR la aplicación pide el permiso de la cámara con el aviso del
  sistema (y, si se denegó para siempre, ofrece abrir los ajustes).
- En Android 17, la aplicación pide el permiso de red local al emparejar o sincronizar con el
  PC o con un NAS de casa: sin él, Android bloqueaba esas conexiones sin avisar.
- En el móvil (y en pantallas estrechas), una barra inferior con texto en cada botón: fuera de
  un proyecto, Proyectos, Papelera y Ajustes; dentro, Inicio, Capítulos, dos a elegir en
  Ajustes → Barra del móvil (un apartado o un grupo del menú; al principio, Personajes y Notas)
  y Menú, que abre el mismo menú lateral del PC con Tus proyectos, Ajustes y el tema a mano.
  Arriba, dónde estás y si está guardado.
- Ajustes, en el móvil, es una lista de todos sus apartados.
- Sincronización más sencilla: al conectarse a otro equipo (o a un servidor WebDAV) se tienen
  los mismos proyectos, todos, en los dos sentidos; no hay que elegirlos ni traerlos. Tres
  pestañas: «Conectar con otro equipo» (servidor WebDAV u otro equipo con Creabel),
  «Compartir este equipo» (solo en el PC) y «Conexiones establecidas», cada una con su estado,
  sus proyectos y su botón para sincronizarla. Las explicaciones, bajo un «?».
- En el PC, el aviso del cortafuegos de Windows solo sale si de verdad está bloqueando a
  Creabel.
- Si el servidor pierde los datos (se vacía su carpeta o se cambia de servidor), cada
  dispositivo vuelve a enviar sus proyectos.
- Si dos dispositivos escriben la misma escena sin conexión, se guardan las dos versiones.
- En Windows, aviso cuando hay una versión nueva y actualización con un clic.
- Creabel para Windows también en Microsoft Store: firmada por Microsoft, se instala sin avisos
  de Windows y se actualiza desde la tienda. Trae su permiso del cortafuegos para «Compartir
  este equipo» en las redes privadas.
- Los enlaces a otras webs se abren en el navegador del sistema.
- En Android, la aplicación respeta la barra de estado y la de navegación, y el teclado ya no
  tapa lo que se escribe.
- 19 idiomas, con la ayuda y las guías traducidas: español de España y de Latinoamérica,
  catalán, gallego, inglés, alemán, francés, italiano, neerlandés, portugués de Brasil y de
  Portugal, polaco, checo, esloveno, serbio (latino), húngaro, turco, ruso y ucraniano. La
  primera vez se elige solo el del sistema. Las traducciones están hechas con IA y conviene que
  las revise alguien nativo.
- La novela se analiza con las reglas de su idioma (el que se elige en «Libro»): la revisión de
  estilo y las palabras más repetidas usan sus palabras gramaticales y sus muletillas, y los
  adverbios se cuentan por su terminación donde la hay (-mente, -ment, -ly); también la
  extracción de rasgos de los personajes, los nombres de los meses en el buscador de la línea
  temporal, las líneas «Capítulo 1» / «Prólogo» al importar un borrador, el reconocimiento de
  parentescos (padre, madre, hijo…) y las comillas del diálogo („…“, »…«).
- Las copias «en conflicto» de la sincronización se nombran en el idioma de la aplicación.
- Los nombres de archivo de las copias y exportaciones conservan las letras de cualquier
  alfabeto (antes, un título en cirílico se quedaba en «creabel»).
- La sección «Ideas y pasiones» de los personajes se llama ahora «Creencias y valores».
- En Windows, cualquier página se abre en otra ventana: clic derecho en un enlace → «Abrir en
  una ventana nueva», Ctrl+clic (o clic con la rueda) o el botón de la cabecera. Se edita en
  todas y los cambios pasan de una a otra; cada ventana lleva en su título la página que tiene.
  Al cerrar la principal se cierran las demás, después de guardar.
- En el móvil, si se sale de una escena para consultar algo, la barra de arriba lleva un botón
  con su nombre (↩) que vuelve a ella con el cursor donde estaba.

### Corregido
- En el inicio del proyecto, la portada y la frase de presentación van en un bloque propio; la
  portada se ve entera (antes se recortaba) y, al pulsarla (sale una lupa al pasar el ratón),
  se ve en grande.
- Cada imagen o documento se llama como su archivo, creabel_<md5>.<extensión>, también dentro
  de la aplicación (antes conservaba el nombre con que se subió). Los ya subidos cambian de
  nombre una vez, y el cambio llega a los demás dispositivos al sincronizar. Al importar fichas,
  una imagen que ya está no se repite aunque venga con otro nombre.
