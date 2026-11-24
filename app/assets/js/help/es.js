// Ayuda detallada de cada página (es): lo que se ve al pulsar «?». Cada entrada tiene una
// frase de entrada, apartados [título, texto], trucos y el capítulo de la guía de la aplicación
// donde se explica con más calma. Las páginas que no están aquí muestran solo su frase corta
// (help.<sección> en i18n/es.js).
export default {
  home: {
    intro: 'Lo que conviene ver al entrar: por dónde seguir, cómo vas, cuánto queda y qué hay que revisar.',
    parts: [
      ['Por dónde seguir', 'La última escena que tocaste y la siguiente que está por escribir, con acceso directo. «Seguir escribiendo» abre la primera. En un proyecto nuevo, aquí están los primeros pasos.'],
      ['Cuatro cifras', 'El manuscrito frente a su meta de palabras, lo escrito hoy frente a la cuota diaria, la racha de días seguidos y los días que quedan para la entrega, con el ritmo que necesitas y el que llevas.'],
      ['Ritmo y estado', 'Las palabras de cada uno de los últimos 30 días y cuántas fichas, capítulos y escenas están por hacer, en curso o terminados.'],
      ['Para revisar', 'Los pendientes abiertos más recientes y los avisos: imposibles y avisos de Continuidad, escenas sin fecha y escenas sin ninguna trama.'],
    ],
    tips: [
      'Las metas se fijan en «Libro → Objetivos». Sin ellas, las cifras muestran solo lo que hay.',
      'Si has puesto portada o una frase de presentación en «Libro», salen en el primer bloque; pulsa la portada para verla en grande.',
      'En el PC, clic derecho en cualquier enlace → «Abrir en una ventana nueva»: por ejemplo, la ficha de un personaje al lado de la escena que escribes.',
      'En el móvil, si sales de una escena para consultar algo, el botón ↩ de arriba te devuelve a ella.',
    ],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Los cimientos de la historia: qué cuentas, en qué mundo y por qué hilos avanza.',
    parts: [
      ['Premisa', 'La idea en una o dos frases: quién quiere qué y qué se lo impide.'],
      ['Fábula, ambientación y notas', 'Los hechos en orden cronológico, la época y el lugar, y los apuntes que afectan a toda la novela. Pulsa cada bloque para escribirlo.'],
      ['Tramas', 'Un hilo narrativo por fila, agrupadas por su peso: principales, subtramas y de fondo. La clasificación se pone en la ficha de cada trama.'],
      ['El recorrido de cada trama', 'La barra tiene una raya por escena del libro, en orden de lectura; las de color son las de esa trama. Se ve dónde empieza, dónde desaparece y si llega al final.'],
    ],
    tips: [
      'Las escenas se asignan a una trama en la ficha de la escena, bloque «Tramas y objetos».',
      'El aviso «escenas sin ninguna trama» señala escenas que quizá no hacen avanzar nada.',
      '«Leer todo» muestra la arquitectura de corrido, como un documento.',
      '«Importar / exportar», junto a «Añadir trama», saca las tramas a Excel, CSV, Word, texto o JSON y las vuelve a traer.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Apuntes sueltos del proyecto: ideas, fragmentos, recordatorios.',
    parts: [
      ['Etiquetas', 'Cada nota puede llevar varias. Aquí se agrupan por etiqueta, y una nota con dos etiquetas aparece en los dos bloques.'],
      ['Color', 'Ocho colores para distinguirlas de un vistazo. «Ordenar por: Color» las agrupa así.'],
      ['Enlaces', 'Una nota se puede enlazar con personajes, lugares, objetos, grupos, fichas propias, tramas, capítulos y escenas. Aparece entonces en la ficha de cada uno.'],
      ['Ordenar y mantener', 'Dentro de cada bloque se reordenan arrastrando. El menú ⋯ de una etiqueta la renombra o la quita en todas sus notas.'],
    ],
    tips: ['Para material de consulta (enlaces, planos, artículos) es mejor Documentación; para lo que hay que revisar, Pendientes.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'El material de consulta de la novela: enlaces, artículos, imágenes, mapas, planos y documentos.',
    parts: [
      ['Referencias', 'Cada una tiene un tipo, una dirección web opcional, un texto y archivos adjuntos (imágenes, SVG o PDF).'],
      ['Enlaces', 'Una referencia se enlaza con escenas, capítulos o fichas, y aparece en ellas: así la tienes a mano mientras escribes esa escena.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Las fichas de quienes viven la historia.',
    parts: [
      ['Principales y secundarios', 'Los principales tienen una entrevista por secciones (datos personales, físico, psicología, conflicto, evolución…); los secundarios, una descripción libre. Se puede convertir uno en otro desde su ficha.'],
      ['Detección en el texto', 'Si creas los personajes antes de escribir, las escenas los reconocen por su nombre y sus alias y los marcan solas.'],
      ['Fechas y edad', 'Con la fecha de nacimiento en la ficha, cada escena con fecha muestra la edad del personaje.'],
      ['Relaciones', 'Cuando algún personaje tiene una relación dibujada en «Relaciones», aparece aquí una pestaña que las reúne todas.'],
    ],
    tips: ['«Importar / exportar» saca la lista a Excel, CSV, Word, texto o JSON, y la vuelve a traer. Cada ficha va entera: datos, texto, rasgos, eventos, escenas en las que aparece y relaciones.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'La ficha de un personaje principal: una entrevista por secciones que te ayuda a conocerlo.',
    parts: [
      ['Secciones', 'Cada sección se puede contestar pregunta a pregunta o como texto libre. Su estado (por hacer, en curso, terminado) te dice qué queda.'],
      ['Rasgos', 'Se extraen solos de lo que escribes (edad, pelo, ojos…) para que no te contradigas; puedes añadir los tuyos.'],
      ['Papel, alias y fechas', 'El papel en la historia, las otras formas de llamarlo (para que el texto lo reconozca) y su nacimiento y muerte.'],
      ['Relaciones', 'Una pareja por relación: debajo de la foto de cada uno, lo que es para el otro («Director de vuelo» / «Comandante»). Si solo escribes uno, vale para los dos («Compañeros»). Es una sola lista, esté la relación apuntada aquí, en la ficha del otro o dibujada en un mapa; al cambiarla o quitarla se pone al día en todos esos sitios.'],
      ['Imágenes, eventos y apariciones', 'Fotos de referencia, hechos con fecha para la línea temporal y las escenas en las que sale.'],
    ],
    tips: [
      'Si sigue apareciendo después de morir (su cuerpo, un recuerdo, un espectro), marca la casilla bajo la fecha de muerte y Continuidad no avisará.',
      'El menú ⋯ exporta la ficha o importa datos en ella.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Los escenarios de la novela, del más grande al más pequeño.',
    parts: [
      ['Lista', 'Las fichas de todos los lugares, que se reordenan arrastrando.'],
      ['Árbol', 'Qué lugar está dentro de cuál: la sala en la cubierta, la cubierta en la nave. Lo que ocurre en un lugar cuenta también para los que lo contienen.'],
      ['Mapas', 'Subes un plano o un mapa (imagen o SVG) y colocas tus lugares encima con chinchetas.'],
      ['Relaciones', 'Aparece cuando algún lugar tiene una relación dibujada en «Relaciones».'],
    ],
    tips: ['En el árbol, el menú ⋯ de cada fila lo mueve dentro de otro lugar o le añade lugares dentro.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'La ficha de un lugar.',
    parts: [
      ['Dónde está', 'País, región y ciudad, y «Dentro de»: el lugar que lo contiene. «Contiene» lista los que tiene dentro.'],
      ['Descripción y preguntas', 'El texto libre y las preguntas propias que hayas definido para todos los lugares.'],
      ['Apariciones', 'Las escenas que ocurren aquí o en cualquiera de los lugares que contiene.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Fichas de los tipos que definas tú: naves, tecnologías, criaturas, organizaciones…',
    parts: [
      ['Tipos', '«Añadir tipo» crea uno con su nombre, su icono y sus campos. Cada tipo es una pestaña.'],
      ['Fichas', 'Tienen los campos de su tipo y, además, descripción, imágenes e identificador.'],
      ['Como un elemento más', 'Se marcan en las escenas (bloque «Tramas y objetos»), salen en la línea temporal y en el buscador, y entran en Continuidad.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Cómo se relacionan los elementos de la novela: lo que dibujas tú y lo que se deduce solo.',
    parts: [
      ['Mis mapas', 'Puedes tener varios: la familia, la tripulación, los bandos. Cada uno es un lienzo.'],
      ['Elementos y flechas', 'En un mapa añades fichas (o textos libres) y unes dos con una flecha etiquetada: «madre de», «enemigo de», «trabaja para».'],
      ['Automáticas', 'Diez dibujos que salen solos de lo ya apuntado: quién coincide en escena, quién tiene cada objeto, quién sabe cada secreto, qué une un evento, personajes y lugares, personajes y tramas, desplazamientos, grupos, lugares dentro de lugares y relaciones (todas las apuntadas en fichas y mapas, más los hermanos y abuelos que se deducen). No se guardan: se recalculan al abrir.'],
      ['Todo junto', 'Un dibujo general con las tuyas (línea continua) y las automáticas (discontinua, cada una de su color), con casillas para elegir cuáles se ven.'],
      ['Leer un dibujo', 'Cuanto más gruesa la línea, más veces se da la relación. Pasa el ratón por un elemento, o púlsalo para fijarlo, y se resaltan las suyas con su rótulo. Debajo está la lista.'],
      ['Verlas en las fichas', 'Personajes y Lugares tienen una pestaña «Relaciones» que reúne las de todos tus mapas.'],
    ],
    tips: ['«Exportar relaciones» las saca a Word, texto, Excel, CSV o JSON.', 'Una flecha «madre», «padre» o «hijo» entre dos personajes sirve además para que Continuidad compruebe sus fechas de nacimiento.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'La estructura de la novela: partes, capítulos, prólogo y epílogo.',
    parts: [
      ['La lista', 'Cada capítulo con sus escenas, sus palabras, su tiempo de lectura, su estado, los personajes con más presencia y un cuadro de color por cada trama que toca. Arriba, el total del libro.'],
      ['Tiempo de lectura', 'Aproximado, a unas 250 palabras por minuto. Dentro de cada capítulo sale también el de cada escena.'],
      ['Las tramas', 'Pasa el ratón por un cuadro (o mantén pulsado en una pantalla táctil) para ver el nombre de la trama, su tipo y su descripción.'],
      ['Reordenar', 'Arrastra las filas, usa Alt+↑/↓ o el menú ⋯ de cada una.'],
      ['Otras vistas', '«Tablero» muestra las escenas como tarjetas para moverlas entre capítulos; «Esquema», todo en un árbol.'],
    ],
    tips: ['«Estructura» añade partes, prólogo o epílogo, importa un borrador en Word y detecta menciones en todas las escenas.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Un capítulo: sus escenas y sus apuntes.',
    parts: [
      ['Escenas', 'Se crean, se reordenan arrastrando y se mueven a otro capítulo desde su menú ⋯. Bajo el título de cada una: cuándo ocurre y cuánto dura, quién narra y un cuadro de color por cada lugar (pasa el ratón, o mantén pulsado, para ver cuál es).'],
      ['Motivo y notas', 'Para qué sirve el capítulo en la novela y lo que quieras recordar al escribirlo.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Donde se escribe. A la izquierda, el texto; a la derecha, la ficha de la escena.',
    parts: [
      ['El texto', 'Se guarda solo. La barra da formato, raya de diálogo y comillas, buscar y reemplazar, y marcar un pendiente sobre lo seleccionado.'],
      ['La ficha', 'Por bloques plegables: quién sale y quién narra, dónde y cuándo, eventos, tramas y objetos, continuidad, pendientes, documentación y revisiones.'],
      ['Eventos', 'El bloque «Eventos» enseña los hechos que tienen que ver con la escena: los que ocurren en ella (toman su fecha) y los que en ella se cuentan (un recuerdo: conservan la suya). Plegado, dice cuáles son; abierto, da de cada uno la fecha, la descripción, a quién afecta y en qué otras escenas está.'],
      ['Detección automática', 'Lo que nombras en el texto (personajes, lugares, objetos, grupos) se marca solo, con la palabra «auto». Si lo quitas, no vuelve a añadirse.'],
      ['Revisiones', 'Versiones del texto de la escena. Puedes crear una nueva antes de reescribir, compararlas y volver a una anterior.'],
      ['Herramientas', 'En la barra: vista partida (una ficha u otra escena al lado), revisión de estilo, leer en voz alta y modo sin distracciones.'],
      ['Continuidad', 'Apunta aquí lo que cambia de estado («herida en el brazo», «la llave pasa a Álex») y qué secreto se revela, y a quién.'],
    ],
    tips: ['Ctrl+S guarda al momento; Ctrl+F busca; Esc sale del modo sin distracciones.', 'La fecha de la escena la coloca en la línea temporal y permite calcular edades y detectar imposibles.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Las escenas como tarjetas, para ver la novela de un vistazo y recolocarla.',
    parts: [
      ['Columnas y tarjetas', 'Cada capítulo es una columna (cuatro por fila) y cada escena una tarjeta con su resumen, quién narra, dónde y cuándo.'],
      ['Resumen', 'Pulsa el texto de una tarjeta para escribir de qué va la escena.'],
      ['Mover', 'Arrastra una tarjeta para cambiarla de sitio o de capítulo. En pantallas táctiles, usa su menú ⋯.'],
      ['Tramas', 'Las rayas de color son las tramas de la escena; la leyenda de arriba dice cuál es cada una.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Todo lo que describe la novela como libro.',
    parts: [
      ['Datos del libro', 'Título e idioma (obligatorios) y autor, serie, número, fecha de publicación, editorial, portada y sinopsis (opcionales). Salen en la portadilla y en los datos del ebook.'],
      ['Objetivos', 'Meta de palabras, cuota diaria, fecha límite y palabras por capítulo. Se siguen desde el inicio.'],
      ['Páginas del libro', 'Créditos, dedicatoria, cita, agradecimientos y «Sobre el autor» con su foto. Se añaden al exportar.'],
      ['Proyecto', 'Copia de seguridad (un .zip con todos los datos, las imágenes y documentos, y el libro y las fichas en Word), crear una secuela (conserva el mundo, empieza sin capítulos) y borrar el proyecto. La copia se restaura con «Importar copia» en «Tus proyectos».'],
    ],
    tips: ['Sin autor, el libro se exporta como «Anónimo».'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Lo que queda por revisar, en un solo sitio.',
    parts: [
      ['De dónde salen', 'De una marca sobre el texto de una escena, o sueltos, ligados a una ficha o al proyecto.'],
      ['Tipos y estado', 'Cada pendiente tiene un tipo (revisar, comprobar, documentarse…) y se marca como resuelto cuando lo está.'],
      ['Ir al sitio', 'Desde un pendiente marcado sobre el texto se salta a la frase exacta de la escena.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Los hechos en orden: las escenas con fecha y los eventos del mundo.',
    parts: [
      ['Qué aparece', 'Una escena sale cuando le pones fecha en su ficha. Un evento se crea aquí o en la ficha de un elemento, y puede ser general o de uno o varios elementos.'],
      ['Eventos y escenas', 'Un evento se enlaza con las escenas en las que ocurre (toma su fecha y sale dentro de ellas) o en las que solo se cuenta (conserva la suya). Si un evento suelto coincide en fecha y hora con una escena, un aviso propone enlazarlos.'],
      ['Dos órdenes', '«Cronológico» ordena por fecha; «De lectura», como en el libro, para ver dónde el relato salta atrás.'],
      ['Empieza y termina el libro', 'Dos marcas señalan la primera y la última escena que lee el lector: lo anterior es pasado previo a la novela.'],
      ['Seguir a y filtros', '«Seguir a» deja la línea en un solo elemento; las casillas ocultan tipos de entrada.'],
      ['Buscador', 'Por texto, fecha o identificador. «a & b» exige las dos cosas; «a | b», una de ellas. El «?» de su lado da ejemplos.'],
      ['Importar y exportar', 'A CSV, JSON, Excel o Word, y de vuelta: crea los eventos que falten y actualiza los que ya existen.'],
    ],
    tips: ['Entre dos entradas se indica el tiempo que pasa; al pasar el ratón sale desglosado.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Para no contradecirte: imposibles que se pueden detectar, quién sabe cada cosa y cómo cambia cada elemento.',
    parts: [
      ['Comprobaciones', 'Cruza fechas y lugares de las escenas, personajes presentes, nacimientos y muertes, estados y secretos. Avisa, por ejemplo, de alguien en dos sitios a la vez.'],
      ['Imposible o para revisar', 'Lo que no puede ser sale como «Imposible»; lo que puede ser intencionado, como «Para revisar». Cada aviso se puede ignorar.'],
      ['Quién sabe qué', 'Los secretos de la novela, uno por fila, y en qué escena se entera cada personaje y el lector. Se ordenan por su primera revelación (por fecha o por orden de lectura), y el buscador encuentra por título, contenido, persona o escena. Pulsa una fila para ver el detalle.'],
      ['Seguimiento', 'Recorre el libro siguiendo a un elemento: dónde aparece y cómo va cambiando de estado.'],
    ],
    tips: ['Los estados y las revelaciones se apuntan en la ficha de cada escena, bloque «Continuidad».', 'Cuanto más completes (fechas, lugares, nacimientos), más encuentra.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Medidas del manuscrito y de tu forma de escribirlo.',
    parts: [
      ['Mi escritura', 'Palabras por día, rachas, sesiones y previsión de final.'],
      ['El libro', 'Longitud de capítulos y escenas, proporción de diálogo y narración, y repeticiones.'],
      ['Estilo', 'Adverbios en -mente, repeticiones cercanas, muletillas y frases largas, por capítulo; resalta dónde hay más. Sigue las reglas del idioma de la novela.'],
      ['Gráfico narrativo', 'Una fila por elemento y una columna por escena: quién desaparece demasiado tiempo y qué tramas no se cruzan.'],
      ['Distribución y apariciones', 'En cuántas escenas de cada capítulo sale cada elemento, y la lista de escenas de un personaje.'],
    ],
    tips: ['El «?» junto a cada columna explica qué mide.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Busca (y reemplaza) en todo el proyecto.',
    parts: [
      ['Dónde busca', 'Marca los ámbitos: texto de las escenas, títulos, personajes, mundo, arquitectura y notas, documentación y pendientes.'],
      ['Opciones', 'Distinguir mayúsculas y buscar solo palabras completas.'],
      ['Reemplazar', 'Cambia el texto en todo lo marcado, tras decirte en cuántos sitios. Útil para renombrar un personaje.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Saca la novela o el material de trabajo a un archivo.',
    parts: [
      ['Qué exportar', 'La novela o el dossier (arquitectura, personajes, lugares y demás fichas).'],
      ['Tipos de exportación', 'Manuscrito para enviar, libro impreso (con estimación de páginas y lomo), libro electrónico (EPUB) o formato libre.'],
      ['Formatos', 'Word, EPUB, página web o PDF, y texto.'],
      ['Datos y páginas del libro', 'La portadilla, los datos del ebook, la portada y las páginas preliminares y finales salen de «Libro».'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Lo borrado no se pierde al momento: pasa aquí.',
    parts: [
      ['Restaurar', 'Devuelve un elemento a su sitio, con lo que colgaba de él.'],
      ['Caducidad', 'Pasados los días que fijes en Ajustes (entre 1 y 60), se borra definitivamente.'],
    ],
    guide: 'data#trash',
  },
};
