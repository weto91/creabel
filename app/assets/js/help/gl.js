// Axuda detallada de cada páxina (gl): o que se ve ao premer «?». Cada entrada ten unha
// frase de entrada, apartados [título, texto], trucos e o capítulo da guía da aplicación
// onde se explica con máis calma. As páxinas que non están aquí amosan só a súa frase curta
// (help.<sección> en i18n/gl.js).
export default {
  home: {
    intro: 'O que convén ver ao entrar: por onde seguir, como vas, canto queda e que hai que revisar.',
    parts: [
      ['Por onde seguir', 'A última escena que tocaches e a seguinte que está por escribir, con acceso directo. «Seguir escribindo» abre a primeira. Nun proxecto novo, aquí están os primeiros pasos.'],
      ['Catro cifras', 'O manuscrito fronte á súa meta de palabras, o escrito hoxe fronte á cota diaria, a racha de días seguidos e os días que quedan para a entrega, co ritmo que necesitas e o que levas.'],
      ['Ritmo e estado', 'As palabras de cada un dos últimos 30 días e cantas fichas, capítulos e escenas están por facer, en curso ou rematados.'],
      ['Para revisar', 'Os pendentes abertos máis recentes e os avisos: imposibles e avisos de Continuidade, escenas sen data e escenas sen ningunha trama.'],
    ],
    tips: ['As metas fíxanse en «Libro → Obxectivos». Sen elas, as cifras amosan só o que hai.', 'Se puxeches portada ou unha frase de presentación en «Libro», saen no primeiro bloque; preme a portada para vela en grande.', 'No PC, clic dereito en calquera ligazón → «Abrir nunha xanela nova»: por exemplo, a ficha dun personaxe ao lado da escena que escribes.', 'No móbil, se saes dunha escena para consultar algo, o botón ↩ de arriba devólvete a ela.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Os alicerces da historia: que contas, en que mundo e por que fíos avanza.',
    parts: [
      ['Premisa', 'A idea nunha ou dúas frases: quen quere que e que llo impide.'],
      ['Fábula, ambientación e notas', 'Os feitos en orde cronolóxica, a época e o lugar, e os apuntamentos que afectan a toda a novela. Preme cada bloque para escribilo.'],
      ['Tramas', 'Un fío narrativo por fila, agrupadas polo seu peso: principais, subtramas e de fondo. A clasificación ponse na ficha de cada trama.'],
      ['O percorrido de cada trama', 'A barra ten unha raia por escena do libro, en orde de lectura; as de cor son as desa trama. Vese onde comeza, onde desaparece e se chega ao final.'],
    ],
    tips: [
      'As escenas asígnanse a unha trama na ficha da escena, bloque «Tramas e obxectos».',
      'O aviso «escenas sen ningunha trama» sinala escenas que quizais non fan avanzar nada.',
      '«Ler todo» amosa a arquitectura de corrido, como un documento.',
      '«Importar / exportar», xunto a «Engadir trama», saca as tramas a Excel, CSV, Word, texto ou JSON e tráeas de volta.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Apuntamentos soltos do proxecto: ideas, fragmentos, lembretes.',
    parts: [
      ['Etiquetas', 'Cada nota pode levar varias. Aquí agrúpanse por etiqueta, e unha nota con dúas etiquetas aparece nos dous bloques.'],
      ['Cor', 'Oito cores para distinguilas dunha ollada. «Ordenar por: Cor» agrúpaas así.'],
      ['Ligazóns', 'Unha nota pódese ligar con personaxes, lugares, obxectos, grupos, fichas propias, tramas, capítulos e escenas. Entón aparece na ficha de cada un.'],
      ['Ordenar e manter', 'Dentro de cada bloque reordénanse arrastrando. O menú ⋯ dunha etiqueta cámbialle o nome ou quítaa de todas as súas notas.'],
    ],
    tips: ['Para material de consulta (ligazóns, planos, artigos) é mellor Documentación; para o que hai que revisar, Pendentes.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'O material de consulta da novela: ligazóns, artigos, imaxes, mapas, planos e documentos.',
    parts: [
      ['Referencias', 'Cada unha ten un tipo, un enderezo web opcional, un texto e ficheiros anexos (imaxes, SVG ou PDF).'],
      ['Ligazóns', 'Unha referencia lígase con escenas, capítulos ou fichas, e aparece nelas: así tela á man mentres escribes esa escena.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'As fichas de quen vive a historia.',
    parts: [
      ['Principais e secundarios', 'Os principais teñen unha entrevista por seccións (datos persoais, físico, psicoloxía, conflito, evolución…); os secundarios, unha descrición libre. Pódese converter un no outro desde a súa ficha.'],
      ['Detección no texto', 'Se creas os personaxes antes de escribir, as escenas recoñécenos polo seu nome e os seus alcumes e márcanos soas.'],
      ['Datas e idade', 'Coa data de nacemento na ficha, cada escena con data amosa a idade do personaxe.'],
      ['Relacións', 'Cando algún personaxe ten unha relación debuxada en «Relacións», aparece aquí unha lapela que as reúne todas.'],
    ],
    tips: ['«Importar / exportar» saca a lista a Excel, CSV, Word, texto ou JSON, e tráea de volta. Cada ficha vai enteira: datos, texto, trazos, eventos, escenas nas que aparece e relacións.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'A ficha dun personaxe principal: unha entrevista por seccións que che axuda a coñecelo.',
    parts: [
      ['Seccións', 'Cada sección pódese contestar pregunta a pregunta ou como texto libre. O seu estado (por facer, en curso, rematado) dicche que queda.'],
      ['Trazos', 'Extráense sós do que escribes (idade, pelo, ollos…) para que non te contradigas; podes engadir os teus.'],
      ['Papel, alcumes e datas', 'O papel na historia, as outras formas de chamalo (para que o texto o recoñeza) e o seu nacemento e a súa morte.'],
      ['Relacións', 'Unha parella por relación: debaixo da foto de cada un, o que é para o outro («Director de voo» / «Comandante»). Se só escribes un, vale para os dous («Compañeiros»). É unha soa lista, estea a relación anotada aquí, na ficha do outro ou debuxada nun mapa; ao cambiala ou quitala ponse ao día en todos eses sitios.'],
      ['Imaxes, eventos e aparicións', 'Fotos de referencia, feitos con data para a liña temporal e as escenas nas que sae.'],
    ],
    tips: [
      'Se segue aparecendo despois de morrer (o seu corpo, un recordo, un espectro), marca a caixa baixo a data de morte e Continuidade non avisará.',
      'O menú ⋯ exporta a ficha ou importa datos nela.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Os escenarios da novela, do máis grande ao máis pequeno.',
    parts: [
      ['Lista', 'As fichas de todos os lugares, que se reordenan arrastrando.'],
      ['Árbore', 'Que lugar está dentro de cal: a sala na cuberta, a cuberta na nave. O que ocorre nun lugar conta tamén para os que o conteñen.'],
      ['Mapas', 'Sobes un plano ou un mapa (imaxe ou SVG) e colocas os teus lugares enriba con chinchetas.'],
      ['Relacións', 'Aparece cando algún lugar ten unha relación debuxada en «Relacións».'],
    ],
    tips: ['Na árbore, o menú ⋯ de cada fila móveo dentro doutro lugar ou engádelle lugares dentro.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'A ficha dun lugar.',
    parts: [
      ['Onde está', 'País, rexión e cidade, e «Dentro de»: o lugar que o contén. «Contén» lista os que ten dentro.'],
      ['Descrición e preguntas', 'O texto libre e as preguntas propias que definiches para todos os lugares.'],
      ['Aparicións', 'As escenas que ocorren aquí ou en calquera dos lugares que contén.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Fichas dos tipos que definas ti: naves, tecnoloxías, criaturas, organizacións…',
    parts: [
      ['Tipos', '«Engadir tipo» crea un co seu nome, a súa icona e os seus campos. Cada tipo é unha lapela.'],
      ['Fichas', 'Teñen os campos do seu tipo e, ademais, descrición, imaxes e identificador.'],
      ['Como un elemento máis', 'Márcanse nas escenas (bloque «Tramas e obxectos»), saen na liña temporal e no buscador, e entran en Continuidade.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Como se relacionan os elementos da novela: o que debuxas ti e o que se deduce só.',
    parts: [
      ['Os meus mapas', 'Podes ter varios: a familia, a tripulación, os bandos. Cada un é un lenzo.'],
      ['Elementos e frechas', 'Nun mapa engades fichas (ou textos libres) e unes dous cunha frecha etiquetada: «nai de», «inimigo de», «traballa para».'],
      ['Automáticas', 'Dez debuxos que saen sós do xa anotado: quen coincide en escena, quen ten cada obxecto, quen sabe cada segredo, que une un evento, personaxes e lugares, personaxes e tramas, desprazamentos, grupos, lugares dentro de lugares e relacións (todas as anotadas en fichas e mapas, máis os irmáns e os avós que se deducen). Non se gardan: recalcúlanse ao abrir.'],
      ['Todo xunto', 'Un debuxo xeral coas túas (liña continua) e as automáticas (descontinua, cada unha da súa cor), con caixas para escoller cales se ven.'],
      ['Ler un debuxo', 'Canto máis grosa é a liña, máis veces se dá a relación. Pasa o rato por un elemento, ou prémeo para fixalo, e resáltanse as súas co seu rótulo. Debaixo está a lista.'],
      ['Velas nas fichas', 'Personaxes e Lugares teñen unha lapela «Relacións» que reúne as de todos os teus mapas.'],
    ],
    tips: ['«Exportar relacións» sácaas a Word, texto, Excel, CSV ou JSON.', 'Unha frecha «nai», «pai» ou «fillo» entre dous personaxes serve ademais para que Continuidade comprobe as súas datas de nacemento.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'A estrutura da novela: partes, capítulos, prólogo e epílogo.',
    parts: [
      ['A lista', 'Cada capítulo coas súas escenas, as súas palabras, o seu tempo de lectura, o seu estado, os personaxes con máis presenza e un cadro de cor por cada trama que toca. Arriba, o total do libro.'],
      ['Tempo de lectura', 'Aproximado, a unhas 250 palabras por minuto. Dentro de cada capítulo sae tamén o de cada escena.'],
      ['As tramas', 'Pasa o rato por un cadro (ou mantén premido nunha pantalla táctil) para ver o nome da trama, o seu tipo e a súa descrición.'],
      ['Reordenar', 'Arrastra as filas, usa Alt+↑/↓ ou o menú ⋯ de cada unha.'],
      ['Outras vistas', '«Taboleiro» amosa as escenas como tarxetas para movelas entre capítulos; «Esquema», todo nunha árbore.'],
    ],
    tips: ['«Estrutura» engade partes, prólogo ou epílogo, importa un borrador en Word e detecta mencións en todas as escenas.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Un capítulo: as súas escenas e os seus apuntamentos.',
    parts: [
      ['Escenas', 'Créanse, reordénanse arrastrando e móvense a outro capítulo desde o seu menú ⋯. Baixo o título de cada unha: cando ocorre e canto dura, quen narra e un cadro de cor por cada lugar (pasa o rato, ou mantén premido, para ver cal é).'],
      ['Motivo e notas', 'Para que serve o capítulo na novela e o que queiras lembrar ao escribilo.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Onde se escribe. Á esquerda, o texto; á dereita, a ficha da escena.',
    parts: [
      ['O texto', 'Gárdase só. A barra dá formato, raia de diálogo e comiñas, buscar e substituír, e marcar un pendente sobre o seleccionado.'],
      ['A ficha', 'Por bloques pregables: quen sae e quen narra, onde e cando, eventos, tramas e obxectos, continuidade, pendentes, documentación e revisións.'],
      ['Eventos', 'O bloque «Eventos» amosa os feitos que teñen que ver coa escena: os que ocorren nela (toman a súa data) e os que nela se contan (un recordo: conservan a súa). Pregado, di cales son; aberto, dá de cada un a data, a descrición, a quen afecta e en que outras escenas está.'],
      ['Detección automática', 'O que nomeas no texto (personaxes, lugares, obxectos, grupos) márcase só, coa palabra «auto». Se o quitas, non volve engadirse.'],
      ['Revisións', 'Versións do texto da escena. Podes crear unha nova antes de reescribir, comparalas e volver a unha anterior.'],
      ['Ferramentas', 'Na barra: vista partida (unha ficha ou outra escena ao lado), revisión de estilo, ler en voz alta e modo sen distraccións.'],
      ['Continuidade', 'Anota aquí o que cambia de estado («ferida no brazo», «a chave pasa a Álex») e que segredo se revela, e a quen.'],
    ],
    tips: ['Ctrl+S garda ao momento; Ctrl+F busca; Esc sae do modo sen distraccións.', 'A data da escena colócaa na liña temporal e permite calcular idades e detectar imposibles.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'As escenas como tarxetas, para ver a novela dunha ollada e recolocala.',
    parts: [
      ['Columnas e tarxetas', 'Cada capítulo é unha columna (catro por fila) e cada escena unha tarxeta co seu resumo, quen narra, onde e cando.'],
      ['Resumo', 'Preme o texto dunha tarxeta para escribir de que vai a escena.'],
      ['Mover', 'Arrastra unha tarxeta para cambiala de sitio ou de capítulo. En pantallas táctiles, usa o seu menú ⋯.'],
      ['Tramas', 'As raias de cor son as tramas da escena; a lenda de arriba di cal é cada unha.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Todo o que describe a novela como libro.',
    parts: [
      ['Datos do libro', 'Título e idioma (obrigatorios) e autor, serie, número, data de publicación, editorial, portada e sinopse (opcionais). Saen na anteportada e nos datos do libro electrónico.'],
      ['Obxectivos', 'Meta de palabras, cota diaria, data límite e palabras por capítulo. Séguense desde o inicio.'],
      ['Páxinas do libro', 'Créditos, dedicatoria, cita, agradecementos e «Sobre o autor» coa súa foto. Engádense ao exportar.'],
      ['Proxecto', 'Copia de seguranza (un .zip con todos os datos, as imaxes e os documentos, e o libro e as fichas en Word), crear unha secuela (conserva o mundo, comeza sen capítulos) e borrar o proxecto. A copia restáurase con «Importar copia» en «Os teus proxectos».'],
    ],
    tips: ['Sen autor, o libro expórtase como «Anónimo».'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'O que queda por revisar, nun só sitio.',
    parts: [
      ['De onde saen', 'Dunha marca sobre o texto dunha escena, ou soltos, ligados a unha ficha ou ao proxecto.'],
      ['Tipos e estado', 'Cada pendente ten un tipo (revisar, comprobar, documentarse…) e márcase como resolto cando o está.'],
      ['Ir ao sitio', 'Desde un pendente marcado sobre o texto sáltase á frase exacta da escena.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Os feitos en orde: as escenas con data e os eventos do mundo.',
    parts: [
      ['Que aparece', 'Unha escena sae cando lle pos data na súa ficha. Un evento créase aquí ou na ficha dun elemento, e pode ser xeral ou dun ou de varios elementos.'],
      ['Eventos e escenas', 'Un evento lígase coas escenas nas que ocorre (toma a súa data e sae dentro delas) ou nas que só se conta (conserva a súa). Se un evento solto coincide en data e hora cunha escena, un aviso propón ligalos.'],
      ['Dúas ordes', '«Cronolóxica» ordena por data; «De lectura», como no libro, para ver onde o relato salta atrás.'],
      ['Comeza e remata o libro', 'Dúas marcas sinalan a primeira e a última escena que le o lector: o anterior é pasado previo á novela.'],
      ['Seguir a e filtros', '«Seguir a» deixa a liña nun só elemento; as caixas ocultan tipos de entrada.'],
      ['Buscador', 'Por texto, data ou identificador. «a & b» esixe as dúas cousas; «a | b», unha delas. O «?» do seu lado dá exemplos.'],
      ['Importar e exportar', 'A CSV, JSON, Excel ou Word, e de volta: crea os eventos que falten e actualiza os que xa existen.'],
    ],
    tips: ['Entre dúas entradas indícase o tempo que pasa; ao pasar o rato sae desagregado.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Para non contradicirte: imposibles que se poden detectar, quen sabe cada cousa e como cambia cada elemento.',
    parts: [
      ['Comprobacións', 'Cruza datas e lugares das escenas, personaxes presentes, nacementos e mortes, estados e segredos. Avisa, por exemplo, de alguén en dous sitios á vez.'],
      ['Imposible ou para revisar', 'O que non pode ser sae como «Imposible»; o que pode ser intencionado, como «Para revisar». Cada aviso pódese ignorar.'],
      ['Quen sabe que', 'Os segredos da novela, un por fila, e en que escena se decata cada personaxe e o lector. Ordénanse pola súa primeira revelación (por data ou por orde de lectura), e o buscador atopa por título, contido, persoa ou escena. Preme unha fila para ver o detalle.'],
      ['Seguimento', 'Percorre o libro seguindo un elemento: onde aparece e como vai cambiando de estado.'],
    ],
    tips: ['Os estados e as revelacións anótanse na ficha de cada escena, bloque «Continuidade».', 'Canto máis completes (datas, lugares, nacementos), máis atopa.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Medidas do manuscrito e da túa forma de escribilo.',
    parts: [
      ['A miña escritura', 'Palabras por día, rachas, sesións e previsión de remate.'],
      ['O libro', 'Lonxitude de capítulos e escenas, proporción de diálogo e narración, e repeticións.'],
      ['Estilo', 'Adverbios en -mente, repeticións próximas, palabras comodín e frases longas, por capítulo; resalta onde hai máis. Segue as regras do idioma da novela.'],
      ['Gráfico narrativo', 'Unha fila por elemento e unha columna por escena: quen desaparece demasiado tempo e que tramas non se cruzan.'],
      ['Distribución e aparicións', 'En cantas escenas de cada capítulo sae cada elemento, e a lista de escenas dun personaxe.'],
    ],
    tips: ['O «?» xunto a cada columna explica que mide.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Busca (e substitúe) en todo o proxecto.',
    parts: [
      ['Onde busca', 'Marca os ámbitos: texto das escenas, títulos, personaxes, mundo, arquitectura e notas, documentación e pendentes.'],
      ['Opcións', 'Distinguir maiúsculas e buscar só palabras completas.'],
      ['Substituír', 'Cambia o texto en todo o marcado, despois de dicirche en cantos sitios. Útil para cambiar o nome dun personaxe.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Saca a novela ou o material de traballo a un ficheiro.',
    parts: [
      ['Que exportar', 'A novela ou o dossier (arquitectura, personaxes, lugares e demais fichas).'],
      ['Tipos de exportación', 'Manuscrito para enviar, libro impreso (con estimación de páxinas e lombo), libro electrónico (EPUB) ou formato libre.'],
      ['Formatos', 'Word, EPUB, páxina web ou PDF, e texto.'],
      ['Datos e páxinas do libro', 'A anteportada, os datos do libro electrónico, a portada e as páxinas preliminares e finais saen de «Libro».'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'O borrado non se perde ao momento: pasa aquí.',
    parts: [
      ['Restaurar', 'Devolve un elemento ao seu sitio, co que colgaba del.'],
      ['Caducidade', 'Pasados os días que fixes en Axustes (entre 1 e 60), bórrase definitivamente.'],
    ],
    guide: 'data#trash',
  },
};
