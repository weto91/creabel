// Proyecto de ejemplo para las capturas del README («La cartógrafa de mareas»), en español o en
// inglés. Todo el texto es inventado. Lo usa _prueba-capturas.html (no se sube: .gitignore).
// seed(engine, lang) crea el proyecto con identificadores fijos y devuelve sus ids.

const P = 'cartografa01';
const id = (s) => (s + 'x000000000000').slice(0, 12);
const ID = {
  ch1: id('cap1'), ch2: id('cap2'), ch3: id('cap3'), ch4: id('cap4'), ch5: id('cap5'),
  sc1: id('esc1'), sc2: id('esc2'), sc3: id('esc3'), sc4: id('esc4'), sc5: id('esc5'), sc6: id('esc6'), sc7: id('esc7'), sc8: id('esc8'), sc9: id('esc9'),
  ines: id('ines'), tomas: id('tomas'), lucia: id('lucia'), damian: id('damian'), remedios: id('remedios'),
  isla: id('isla'), faro: id('faro'), taberna: id('taberna'), muelle: id('muelle'), lisboa: id('lisboa'),
  cuaderno: id('cuaderno'), lente: id('lente'), cofradia: id('cofradia'),
  tr1: id('trama1'), tr2: id('trama2'), tr3: id('trama3'),
  ev1: id('evento1'), ev2: id('evento2'), ev3: id('evento3'), ev4: id('evento4'), ev5: id('evento5'),
  premise: id('premisa'), fabula: id('fabula'), setting: id('ambiente'), globalnotes: id('notasgen'),
  note1: id('nota1'), term1: id('termino1'), term2: id('termino2'), cover: id('portada'),
};

const html = (paras) => paras.map((p) => `<p>${p}</p>`).join('');
const words = (paras) => paras.join(' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const chars = (paras) => paras.join('').replace(/<[^>]+>/g, '').length;

const T = {
  es: {
    name: 'La cartógrafa de mareas',
    author: 'Marta Ibarra',
    logline: 'Cuando el faro de Punta Gris se apaga la misma noche en que desaparece su farero, su nieta Inés, cartógrafa en Lisboa, vuelve a la isla que juró no pisar y descubre que los mapas de su abuelo no dibujan la costa, sino lo que el mar se lleva.',
    synopsis: ['Inés Arriaga lleva dieciséis años sin volver a Punta Gris, la isla donde la crio su abuelo Tomás, el último farero del archipiélago. Una llamada de madrugada la obliga a regresar: el faro se ha apagado y Tomás ha desaparecido con su cuaderno de mareas.', 'Con la ayuda de Lucía, su amiga de la infancia y patrona del barco correo, Inés sigue el rastro de sesenta años de mapas que no cuadran, hasta una bajamar que el mar no repite desde 1961.'],
    chapters: ['La luz que falta', 'Punta Gris', 'El cuaderno de mareas', 'Bajamar', 'Pleamar'],
    scenes: {
      sc1: ['Una llamada a las cuatro', 'Damián avisa a Inés de que el faro se ha apagado y Tomás ha desaparecido.', [
        'El teléfono sonó a las cuatro y diez, cuando Lisboa todavía era una ciudad de farolas y gatos. Inés tardó en encontrarlo entre los planos que cubrían la mesa: la costa de Sines a medio dibujar, tres tazas frías y un compás abierto como un pájaro dormido.',
        '—¿Inés Arriaga? —La voz sonaba lejos, con el viento metido dentro—. Soy Damián Olea, del puerto de Punta Gris.',
        'No había oído ese nombre en dieciséis años, pero lo reconoció enseguida, igual que se reconoce un olor de la infancia.',
        '—Es tu abuelo —dijo Damián—. El faro se apagó anoche. Y Tomás no está.',
        '—¿Cómo que no está?',
        '—Que no está, Inés. Ni en el faro, ni en el pueblo, ni en el barco. Se ha llevado el cuaderno de las mareas y nada más.',
        'Inés miró por la ventana. Al otro lado del río, la luz del Bugio giraba con su paciencia de siempre. Pensó que un faro apagado era como un reloj parado: no dejaba de existir, pero dejaba de decir la verdad.',
        '—Cogeré el barco de la mañana —dijo, y colgó antes de arrepentirse.',
      ]],
      sc2: ['El barco correo', 'Inés vuelve a la isla en la Gaviota, con Lucía, dieciséis años después.', [
        'La Gaviota olía a gasóleo y a sal, igual que cuando eran niñas. Lucía Brandão manejaba el timón con una mano y con la otra sostenía un café que no llegaba a beber.',
        '—Dieciséis años —dijo sin mirarla—. Podrías haber escrito una postal.',
        '—Te escribí tres.',
        '—Ninguna llegó.',
        '—Ninguna la mandé.',
        'Lucía se rió por fin, una risa corta, de las que se escapan. Delante, la isla empezaba a salir de la bruma: primero el lomo de piedra, luego las casas blancas del puerto y, arriba del todo, el faro, quieto y ciego como un centinela dormido.',
        '—Damián dice que tu abuelo llevaba semanas raro —dijo Lucía—. Que bajaba al muelle de madrugada a medir el agua con una cuerda llena de nudos. Que hablaba de una marea que no estaba en ninguna tabla.',
        'Inés sintió frío, y no era el viento. Ella también había visto esa marea, una vez, a los nueve años, dibujada a lápiz en la última página del cuaderno de su abuelo.',
      ]],
      sc3: ['La taberna de Remedios', 'El pueblo da a Tomás por ahogado; Remedios le susurra a Inés que busque en la lente.', [
        'En la taberna de Remedios el tiempo se medía en cafés. Inés pidió uno y lo dejó enfriar mientras los pescadores fingían no mirarla.',
        '—Tienes la cara de tu madre —dijo Remedios, secándose las manos en el delantal—. Y la misma manía de llegar tarde a todo.',
        '—¿Cuándo lo viste por última vez?',
        '—El jueves. Vino a por tabaco, aunque hace veinte años que no fuma. Pagó con un billete de los antiguos, de escudos, y me dijo que lo guardara, que pronto volvería a valer.',
        'Damián Olea entró sacudiéndose la lluvia del chaquetón. Era más bajo de lo que Inés recordaba, o ella había crecido más de lo que pensaba.',
        '—La Guardia Costera ha peinado la costa —dijo—. Nada. Si se cayó al mar con la marea de anoche, puede aparecer en Sagres o no aparecer nunca.',
        '—Mi abuelo no se cae al mar —contestó Inés—. Mi abuelo lo mide.',
        'Nadie se rió. Remedios le puso la mano en el hombro y, en voz baja, para que solo ella lo oyera, le dijo que buscara en la lente.',
      ]],
      sc4: ['El faro apagado', 'Inés sube al faro: la lente mira hacia tierra y señala un camino bajo el mar.', [
        'La puerta del faro no estaba cerrada con llave. Nunca lo había estado. Inés subió los ciento doce escalones contándolos en voz alta, como hacía de pequeña, y al llegar arriba se quedó sin aire y sin palabras.',
        'La lente de Fresnel, aquella colmena de cristal que su abuelo limpiaba cada mañana con un paño de lino, estaba girada hacia el interior de la isla. Alguien la había desatornillado de su eje y la había vuelto a montar mirando a tierra, como si lo importante ya no estuviera en el mar.',
        'Sobre la mesa de guardia había una taza con un dedo de café, un lápiz mordido y una tabla de mareas de 1961 con una fecha rodeada en rojo: el diecisiete de octubre. Faltaban cuatro días.',
        'Inés acercó la cara al cristal. A través de los prismas, el pueblo se descomponía en franjas de colores, y entre ellas, nítido como una herida, aparecía un camino que ella no había visto nunca: bajaba desde el cementerio hasta el agua y seguía, recto, por debajo del mar.',
      ]],
      sc5: ['Mapas que no cuadran', 'El cuaderno: sesenta años de mapas en los que la costa se mueve.', [
        'Encontró el cuaderno donde Tomás escondía las cosas importantes: dentro del cajón de las cosas sin importancia, entre gomas elásticas y facturas de la luz.',
        'Eran mapas de la isla, cientos, uno por cada bajamar desde 1961. Al principio se parecían todos. Luego, página a página, la costa empezaba a moverse: una cala desaparecía, una roca cambiaba de sitio, una lengua de arena crecía hacia el oeste como si buscara algo.',
        'Inés los extendió en el suelo del faro y los ordenó por fechas. Con la mirada de cartógrafa, la de su oficio, vio lo que su abuelo había tardado sesenta años en ver: la isla no se estaba erosionando. Se estaba dibujando a sí misma.',
        'En la última página, con la letra temblorosa de los últimos meses, Tomás había escrito una sola frase: «El mar devuelve lo que se lleva, pero solo a quien sabe leer la orilla».',
      ]],
      sc6: ['Lo que el mar se lleva', 'Inés y Lucía, de noche en el muelle, deciden cruzar juntas.', [
        'Lucía la encontró en el muelle viejo pasada la medianoche, sentada en el borde, con las piernas colgando sobre el agua negra.',
        '—Remedios me ha contado lo de la lente —dijo, y se sentó a su lado—. ¿Vas a decirme qué buscas?',
        '—Un camino que solo aparece cuando la marea baja más que nunca.',
        '—Eso no existe.',
        '—Mi abuelo lleva sesenta años dibujándolo.',
        'Se quedaron calladas. El agua golpeaba los pilotes con un ruido de reloj. Al fondo, el faro seguía apagado, y sin su luz las estrellas parecían más cerca y más indiferentes.',
        '—Cuando te fuiste —dijo Lucía al cabo de un rato—, dejaste de mirar el mar. Yo no he dejado de mirarlo ni un día. Si hay un camino ahí abajo, lo veremos juntas.',
        'Inés le cogió la mano. Estaba fría y áspera de cuerdas, y era la misma mano que la había sacado del agua a los nueve años.',
      ]],
      sc7: ['La marea más baja del siglo', 'El mar se retira y aparece la calzada de piedra.', [
        'El diecisiete de octubre, a las cinco y doce de la madrugada, el mar se retiró de Punta Gris como quien recoge un mantel.',
        '[Escribir: el pueblo baja a la orilla en silencio. Damián intenta impedir que Inés y Lucía crucen.]',
        'Las barcas quedaron tumbadas sobre el fango, y donde antes había agua apareció una calzada de piedra, ancha y antigua, que salía del cementerio y se perdía hacia el horizonte.',
      ]],
      sc8: ['Bajo la lente', 'Inés descubre por qué Tomás giró la lente hacia tierra.', []],
      sc9: ['Lo que vuelve', 'Final: el mar devuelve a Tomás… o algo que se le parece.', []],
    },
    characters: {
      ines: ['Inés Arriaga', 'Protagonista', ['Brújula'], {
        personal: { q0: 'Inés Arriaga Moura. En la isla la llamaban «Brújula», porque de niña nunca se perdía.', q1: '34 años. Nació el 2 de marzo de 1990 en Punta Gris, en la casa del farero.', q2: 'En Lisboa, en un ático de Alfama, con un gato que no es suyo y demasiados mapas.', q3: 'Cartógrafa en el Instituto Hidrográfico. Dibuja costas que no ha pisado.', q5: 'Huérfana desde los siete años. La crio su abuelo Tomás en el faro.' },
        physical: { q0: 'Alta y delgada, con hombros de nadadora que ya no nada.', q1: 'Ojos grises, de mirar entornado, como quien calcula distancias.', q4: 'Jerséis de lana gruesa, botas de agua y un lápiz siempre detrás de la oreja.' },
        psychology: { q0: 'Encontrar un lugar del que no tenga ganas de marcharse.', q1: 'Volver a la isla y descubrir que nunca se fue del todo.', q4: 'Se marchó a los dieciocho sin despedirse de su abuelo.', q5: 'Sabe nadar mejor que nadie, pero no se ha metido en el mar desde que casi se ahoga a los nueve años.' },
      }],
      tomas: ['Tomás Arriaga', 'Farero', ['el Farero'], {
        personal: { q0: 'Tomás Arriaga Sousa. Para todos, «el Farero».', q1: '81 años. Nació en 1943 en Viana do Castelo.', q3: 'Farero de Punta Gris desde 1961, el último del archipiélago.' },
        psychology: { q0: 'Entender, antes de morir, la marea que dibuja en su cuaderno.', q5: 'Sabe qué hay al final del camino que aparece bajo el mar.' },
      }],
      lucia: ['Lucía Brandão', 'Patrona del barco correo', [], {
        personal: { q3: 'Patrona de la Gaviota, el barco correo que une la isla con el continente.', q2: 'En Punta Gris, en la casa de sus padres, junto al muelle.' },
        psychology: { q0: 'Que Punta Gris no se quede vacía.', q4: 'Que Inés se marchara sin decir adiós.' },
      }],
      damian: ['Damián Olea', 'Capitán del puerto', [], 'Capitán del puerto de Punta Gris. Conoce a Tomás desde hace cuarenta años y nunca se han caído bien.'],
      remedios: ['Remedios Cuesta', 'Tabernera', [], 'Dueña de la taberna del puerto. Sabe más de lo que cuenta, y cuenta más de lo que debería.'],
    },
    locations: {
      isla: ['Isla de Punta Gris', 'Isla pequeña y pedregosa frente a la costa del Alentejo. Un pueblo de pescadores, un cementerio frente al mar y un faro.'],
      faro: ['Faro de Punta Gris', 'Torre blanca de ciento doce escalones, con una lente de Fresnel de primer orden.'],
      taberna: ['Taberna de Remedios', 'Seis mesas, una barra de mármol y la única televisión del pueblo.'],
      muelle: ['Muelle viejo', 'Pilotes de madera negra donde atraca la Gaviota.'],
      lisboa: ['Estudio de Inés (Lisboa)', 'Ático en Alfama lleno de planos, con vistas al Tajo.'],
    },
    objects: {
      cuaderno: ['Cuaderno de mareas', 'Cientos de mapas de la isla, uno por cada bajamar desde 1961.'],
      lente: ['Lente de Fresnel', 'La lente del faro. Alguien la ha girado para que mire hacia tierra.'],
    },
    cofradia: ['Cofradía de pescadores', 'Los pescadores de Punta Gris. Dan a Tomás por ahogado.'],
    strands: [['La desaparición de Tomás', 'main', 'mystery'], ['Inés vuelve a casa', 'secondary', 'internal'], ['Inés y Lucía', 'secondary', 'relationship']],
    events: {
      ev1: ['Tomás llega al faro de Punta Gris', '1961-05-02', 'Con dieciocho años, como ayudante del último farero.'],
      ev2: ['Inés se marcha de la isla', '2008-09-20', 'Sin despedirse de su abuelo.'],
      ev3: ['El faro se apaga', '2024-10-11T23:50', 'Nadie lo ve apagarse: a medianoche ya no hay luz.'],
      ev4: ['Tomás desaparece con el cuaderno', '2024-10-12T02:00', ''],
      ev5: ['La bajamar más baja desde 1961', '2024-10-17T05:12', 'La fecha rodeada en rojo en la tabla de mareas.'],
    },
    relations: { ines_tomas: ['Abuelo', 'Nieta'], ines_lucia: 'Amigas de la infancia', tomas_damian: 'Viejos rivales', tomas_remedios: 'Confidentes', lucia_damian: ['Capitán del puerto', 'Patrona del correo'] },
    arch: {
      premise: ['¿Qué ocurre cuando el lugar del que huiste es el único que sabe quién eres?', 'Una novela sobre volver, sobre la memoria de los lugares y sobre lo que el mar devuelve.'],
      fabula: ['1961: Tomás llega al faro. 2008: Inés se marcha. 2024: el faro se apaga, Tomás desaparece e Inés vuelve; cuatro días después, la bajamar descubre el camino.'],
      setting: ['Punta Gris, una isla imaginaria frente al Alentejo, en octubre: temporal, bruma y un pueblo que se queda sin gente.'],
      globalnotes: ['Tono: realismo con una grieta fantástica. Nunca explicar del todo el camino.'],
    },
    note: ['La isla como mapa vivo', 'Cada mapa del cuaderno debería poder leerse como una carta de Tomás a Inés.'],
    terms: [['Bajamar', 'Nivel más bajo que alcanza la marea al retirarse.'], ['Escudo', 'Moneda de Portugal hasta 2002.']],
  },
  en: {
    name: 'The Tide Cartographer',
    author: 'Marta Ibarra',
    logline: 'When the Punta Gris lighthouse goes dark on the same night its keeper vanishes, his granddaughter Inés, a mapmaker in Lisbon, returns to the island she swore never to set foot on again and discovers that her grandfather’s maps don’t chart the coast, but what the sea takes away.',
    synopsis: ['Inés Arriaga hasn’t been back to Punta Gris for sixteen years, the island where she was raised by her grandfather Tomás, the last lighthouse keeper in the archipelago. A call before dawn forces her to return: the lighthouse has gone dark and Tomás has disappeared with his tide notebook.', 'With the help of Lucía, her childhood friend and skipper of the mail boat, Inés follows sixty years of maps that don’t add up, all the way to a low tide the sea hasn’t repeated since 1961.'],
    chapters: ['The Missing Light', 'Punta Gris', 'The Tide Notebook', 'Low Water', 'High Water'],
    scenes: {
      sc1: ['A Call at Four', 'Damián tells Inés the lighthouse has gone dark and Tomás has vanished.', [
        'The phone rang at ten past four, when Lisbon was still a city of streetlamps and cats. It took Inés a while to find it among the charts covering the table: the coast of Sines half drawn, three cold cups and a pair of compasses open like a sleeping bird.',
        '“Inés Arriaga?” The voice sounded far away, with the wind inside it. “This is Damián Olea, from the harbour at Punta Gris.”',
        'She hadn’t heard that name in sixteen years, but she knew it at once, the way you know a smell from your childhood.',
        '“It’s your grandfather,” Damián said. “The lighthouse went dark last night. And Tomás is gone.”',
        '“What do you mean, gone?”',
        '“Gone, Inés. Not in the lighthouse, not in the village, not on the boat. He took the tide notebook and nothing else.”',
        'Inés looked out of the window. Across the river, the Bugio light was turning with its usual patience. She thought that a dark lighthouse was like a stopped clock: it didn’t stop existing, but it stopped telling the truth.',
        '“I’ll take the morning boat,” she said, and hung up before she could change her mind.',
      ]],
      sc2: ['The Mail Boat', 'Inés returns to the island on the Gaviota, with Lucía, sixteen years later.', [
        'The Gaviota smelled of diesel and salt, just as it had when they were girls. Lucía Brandão steered with one hand and held a coffee she never got round to drinking with the other.',
        '“Sixteen years,” she said without looking at her. “You could have sent a postcard.”',
        '“I wrote you three.”',
        '“None of them arrived.”',
        '“I never sent them.”',
        'Lucía laughed at last, a short laugh, the kind that slips out. Ahead, the island was rising out of the mist: first the stone ridge, then the white houses of the harbour and, at the very top, the lighthouse, still and blind like a sleeping sentry.',
        '“Damián says your grandfather had been acting strange for weeks,” Lucía said. “Going down to the quay before dawn to measure the water with a knotted rope. Talking about a tide that wasn’t in any table.”',
        'Inés felt cold, and it wasn’t the wind. She had seen that tide too, once, when she was nine, pencilled on the last page of her grandfather’s notebook.',
      ]],
      sc3: ['Remedios’s Tavern', 'The village gives Tomás up for drowned; Remedios whispers to Inés to look in the lens.', [
        'In Remedios’s tavern time was measured in coffees. Inés ordered one and let it go cold while the fishermen pretended not to look at her.',
        '“You’ve got your mother’s face,” Remedios said, drying her hands on her apron. “And the same habit of being late for everything.”',
        '“When did you last see him?”',
        '“Thursday. He came in for tobacco, though he hasn’t smoked in twenty years. He paid with one of the old notes, escudos, and told me to keep it, that it would be worth something again soon.”',
        'Damián Olea came in shaking the rain off his jacket. He was shorter than Inés remembered, or she had grown more than she thought.',
        '“The coastguard has combed the coast,” he said. “Nothing. If he fell in with last night’s tide, he may turn up in Sagres or never turn up at all.”',
        '“My grandfather doesn’t fall into the sea,” Inés replied. “My grandfather measures it.”',
        'Nobody laughed. Remedios put a hand on her shoulder and, quietly, so that only she could hear, told her to look in the lens.',
      ]],
      sc4: ['The Dark Lighthouse', 'Inés climbs the lighthouse: the lens faces inland and reveals a path under the sea.', [
        'The lighthouse door wasn’t locked. It never had been. Inés climbed the hundred and twelve steps counting them aloud, as she used to as a child, and at the top she ran out of breath and out of words.',
        'The Fresnel lens, that glass beehive her grandfather polished every morning with a linen cloth, had been turned towards the island. Someone had unscrewed it from its axis and mounted it again facing inland, as if what mattered was no longer out at sea.',
        'On the watch desk there was a cup with a finger of coffee, a chewed pencil and a 1961 tide table with a date circled in red: the seventeenth of October. Four days to go.',
        'Inés brought her face to the glass. Through the prisms, the village broke into bands of colour, and between them, sharp as a wound, there was a path she had never seen: it ran down from the cemetery to the water and carried on, straight, beneath the sea.',
      ]],
      sc5: ['Maps That Don’t Add Up', 'The notebook: sixty years of maps in which the coast moves.', [
        'She found the notebook where Tomás hid important things: in the drawer of unimportant things, between rubber bands and electricity bills.',
        'They were maps of the island, hundreds of them, one for every low tide since 1961. At first they all looked alike. Then, page by page, the coast began to move: a cove disappeared, a rock changed place, a tongue of sand grew westwards as if it were looking for something.',
        'Inés spread them out on the lighthouse floor and put them in order. With a cartographer’s eye, the eye of her trade, she saw what her grandfather had taken sixty years to see: the island wasn’t eroding. It was drawing itself.',
        'On the last page, in the shaky handwriting of the last few months, Tomás had written a single sentence: “The sea gives back what it takes, but only to those who can read the shore.”',
      ]],
      sc6: ['What the Sea Takes', 'Inés and Lucía, at night on the quay, decide to cross together.', [
        'Lucía found her on the old quay after midnight, sitting on the edge, her legs dangling over the black water.',
        '“Remedios told me about the lens,” she said, and sat down beside her. “Are you going to tell me what you’re looking for?”',
        '“A path that only appears when the tide goes lower than ever.”',
        '“That doesn’t exist.”',
        '“My grandfather has been drawing it for sixty years.”',
        'They fell silent. The water knocked against the piles like a clock. Beyond, the lighthouse was still dark, and without its light the stars seemed closer and more indifferent.',
        '“When you left,” Lucía said after a while, “you stopped looking at the sea. I haven’t stopped looking at it for a single day. If there’s a path down there, we’ll see it together.”',
        'Inés took her hand. It was cold and rough from the ropes, and it was the same hand that had pulled her out of the water when she was nine.',
      ]],
      sc7: ['The Lowest Tide of the Century', 'The sea draws back and the stone causeway appears.', [
        'On the seventeenth of October, at twelve minutes past five in the morning, the sea withdrew from Punta Gris like someone clearing a tablecloth.',
        '[To write: the village walks down to the shore in silence. Damián tries to stop Inés and Lucía from crossing.]',
        'The boats lay on their sides in the mud, and where there had been water there now was a stone causeway, wide and ancient, leading out of the cemetery and vanishing towards the horizon.',
      ]],
      sc8: ['Under the Lens', 'Inés finds out why Tomás turned the lens inland.', []],
      sc9: ['What Comes Back', 'Ending: the sea gives Tomás back… or something like him.', []],
    },
    characters: {
      ines: ['Inés Arriaga', 'Protagonist', ['Compass'], {
        personal: { q0: 'Inés Arriaga Moura. On the island they called her “Compass”, because as a child she never got lost.', q1: '34. Born on 2 March 1990 in Punta Gris, in the lighthouse keeper’s house.', q2: 'In Lisbon, in an attic in Alfama, with a cat that isn’t hers and too many maps.', q3: 'Cartographer at the Hydrographic Institute. She draws coasts she has never walked.', q5: 'Orphaned at seven. Raised by her grandfather Tomás in the lighthouse.' },
        physical: { q0: 'Tall and slim, with the shoulders of a swimmer who no longer swims.', q1: 'Grey eyes, a narrowed gaze, like someone gauging distances.', q4: 'Thick wool jumpers, wellingtons and a pencil always behind her ear.' },
        psychology: { q0: 'To find a place she doesn’t want to leave.', q1: 'Going back to the island and finding out she never really left.', q4: 'She left at eighteen without saying goodbye to her grandfather.', q5: 'She swims better than anyone, but she hasn’t been in the sea since she nearly drowned at nine.' },
      }],
      tomas: ['Tomás Arriaga', 'Lighthouse keeper', ['the Keeper'], {
        personal: { q0: 'Tomás Arriaga Sousa. To everyone, “the Keeper”.', q1: '81. Born in 1943 in Viana do Castelo.', q3: 'Keeper of the Punta Gris light since 1961, the last in the archipelago.' },
        psychology: { q0: 'To understand, before he dies, the tide he draws in his notebook.', q5: 'He knows what lies at the end of the path that appears under the sea.' },
      }],
      lucia: ['Lucía Brandão', 'Mail boat skipper', [], {
        personal: { q3: 'Skipper of the Gaviota, the mail boat linking the island with the mainland.', q2: 'In Punta Gris, in her parents’ house by the quay.' },
        psychology: { q0: 'That Punta Gris doesn’t end up empty.', q4: 'That Inés left without saying goodbye.' },
      }],
      damian: ['Damián Olea', 'Harbour master', [], 'Harbour master of Punta Gris. He has known Tomás for forty years and they have never got on.'],
      remedios: ['Remedios Cuesta', 'Tavern keeper', [], 'Owner of the harbour tavern. She knows more than she lets on, and lets on more than she should.'],
    },
    locations: {
      isla: ['Punta Gris Island', 'A small, rocky island off the Alentejo coast. A fishing village, a cemetery facing the sea and a lighthouse.'],
      faro: ['Punta Gris Lighthouse', 'A white tower of a hundred and twelve steps, with a first-order Fresnel lens.'],
      taberna: ['Remedios’s Tavern', 'Six tables, a marble counter and the only television in the village.'],
      muelle: ['Old Quay', 'Black wooden piles where the Gaviota moors.'],
      lisboa: ['Inés’s studio (Lisbon)', 'An attic in Alfama full of charts, overlooking the Tagus.'],
    },
    objects: {
      cuaderno: ['Tide notebook', 'Hundreds of maps of the island, one for every low tide since 1961.'],
      lente: ['Fresnel lens', 'The lighthouse lens. Someone has turned it to face inland.'],
    },
    cofradia: ['Fishermen’s guild', 'The fishermen of Punta Gris. They have given Tomás up for drowned.'],
    strands: [['Tomás’s disappearance', 'main', 'mystery'], ['Inés comes home', 'secondary', 'internal'], ['Inés and Lucía', 'secondary', 'relationship']],
    events: {
      ev1: ['Tomás arrives at the Punta Gris lighthouse', '1961-05-02', 'Aged eighteen, as assistant to the last keeper.'],
      ev2: ['Inés leaves the island', '2008-09-20', 'Without saying goodbye to her grandfather.'],
      ev3: ['The lighthouse goes dark', '2024-10-11T23:50', 'Nobody sees it go out: by midnight there is no light.'],
      ev4: ['Tomás disappears with the notebook', '2024-10-12T02:00', ''],
      ev5: ['The lowest tide since 1961', '2024-10-17T05:12', 'The date circled in red on the tide table.'],
    },
    relations: { ines_tomas: ['Grandfather', 'Granddaughter'], ines_lucia: 'Childhood friends', tomas_damian: 'Old rivals', tomas_remedios: 'Confidants', lucia_damian: ['Harbour master', 'Mail boat skipper'] },
    arch: {
      premise: ['What happens when the place you ran away from is the only one that knows who you are?', 'A novel about coming back, about the memory of places and about what the sea gives back.'],
      fabula: ['1961: Tomás arrives at the lighthouse. 2008: Inés leaves. 2024: the lighthouse goes dark, Tomás disappears and Inés returns; four days later, the low tide uncovers the path.'],
      setting: ['Punta Gris, an imaginary island off the Alentejo, in October: storms, mist and a village running out of people.'],
      globalnotes: ['Tone: realism with a fantastic crack in it. Never fully explain the path.'],
    },
    note: ['The island as a living map', 'Every map in the notebook should read like a letter from Tomás to Inés.'],
    terms: [['Low water', 'The lowest level the tide reaches as it ebbs.'], ['Escudo', 'Portugal’s currency until 2002.']],
  },
};

// Portada del libro (SVG): mar de noche, el faro y su haz.
function coverSvg(t) {
  const [l1, ...rest] = t.name.split(' ');
  const title = t.name.length > 18 ? [t.name.split(' ').slice(0, 2).join(' '), t.name.split(' ').slice(2).join(' ')] : [l1, rest.join(' ')];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1f2d"/><stop offset="0.62" stop-color="#2d5d7b"/><stop offset="1" stop-color="#6f97ae"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3a4f"/><stop offset="1" stop-color="#0b1822"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6e7b8" stop-opacity="0.55"/><stop offset="1" stop-color="#f6e7b8" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="600" height="900" fill="url(#sky)"/>
  <circle cx="470" cy="150" r="2" fill="#fff" opacity=".8"/><circle cx="120" cy="90" r="1.6" fill="#fff" opacity=".7"/><circle cx="340" cy="60" r="1.4" fill="#fff" opacity=".6"/><circle cx="530" cy="300" r="1.5" fill="#fff" opacity=".6"/><circle cx="60" cy="260" r="1.3" fill="#fff" opacity=".5"/>
  <polygon points="392,420 600,330 600,470" fill="url(#beam)"/>
  <path d="M0 610 C 120 590, 200 600, 300 585 C 380 572, 470 600, 600 590 L600 900 L0 900 Z" fill="url(#sea)"/>
  <path d="M250 600 L300 470 L330 470 L345 600 Z" fill="#132a39"/>
  <rect x="372" y="430" width="34" height="150" fill="#e9edf0"/><rect x="372" y="470" width="34" height="14" fill="#b4473f"/><rect x="372" y="520" width="34" height="14" fill="#b4473f"/>
  <rect x="368" y="414" width="42" height="18" fill="#22303a"/><rect x="376" y="400" width="26" height="16" fill="#f6e7b8"/><path d="M372 400 L389 386 L406 400 Z" fill="#22303a"/>
  <path d="M330 600 L372 580 L406 580 L470 605 Z" fill="#132a39"/>
  <g stroke="#9fc0d3" stroke-opacity=".35" stroke-width="1.4" fill="none"><path d="M40 660 h120"/><path d="M220 700 h170"/><path d="M420 650 h130"/><path d="M90 760 h200"/></g>
  <text x="300" y="170" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="#f3f5f6">${title[0]}</text>
  <text x="300" y="232" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-style="italic" fill="#f3f5f6">${title[1]}</text>
  <line x1="250" y1="268" x2="350" y2="268" stroke="#d3e1ea" stroke-opacity=".7"/>
  <text x="300" y="840" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="6" fill="#d3e1ea">${t.author.toUpperCase()}</text>
</svg>`;
}

/** Crea el proyecto de ejemplo (si no existe ya) y devuelve { pid, ids }. */
export async function seed(engine, lang = 'es') {
  const t = T[lang] || T.es;
  const call = (method, route, body) => engine.handle(method, route, body || {}, {});
  const auth = await call('GET', 'auth/status');
  if (!auth.configured) await call('POST', 'auth/setup', { mode: 'none' });
  await call('POST', 'settings', { lang, revisionNotice: false, ...(window.__CAPTURA__ ? { theme: window.__CAPTURA__.theme } : {}) });
  const existing = await call('GET', 'projects');
  if (existing.some((p) => p.id === P)) return { pid: P, ids: ID };

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const deadline = new Date(today.getTime() + 240 * 864e5);
  await call('POST', 'projects', {
    id: P, name: t.name, author: t.author, language: lang,
    data: { logline: t.logline, synopsis: html(t.synopsis), goals: { words: 60000, perDay: 500, deadline: iso(deadline) } },
  });

  // Portada
  const form = new FormData();
  form.append('file', new File([coverSvg(t)], 'portada.svg', { type: 'image/svg+xml' }));
  form.append('id', ID.cover);
  await call('POST', `projects/${P}/images`, form);
  await call('POST', `projects/${P}`, { data_patch: { cover: ID.cover } });

  const entities = [];
  const add = (e) => { entities.push({ position: entities.filter((x) => x.type === e.type && x.parent_id === (e.parent_id || null)).length, parent_id: null, status: 0, data: {}, body: '', ...e }); };

  // Arquitectura
  ['premise', 'fabula', 'setting', 'globalnotes'].forEach((key, i) => add({ id: ID[key], type: 'architecture', name: key, position: i, status: key === 'globalnotes' ? 1 : 2, data: { key }, body: html(t.arch[key]) }));

  // Tramas
  const strandIds = [ID.tr1, ID.tr2, ID.tr3];
  t.strands.forEach(([name, level, kind], i) => add({ id: strandIds[i], type: 'strand', name, status: i === 0 ? 2 : 1, data: { level, kind } }));

  // Personajes
  const rel = t.relations;
  const charData = {
    ines: { kind: 'main', birth: '1990-03-02', relations: [{ id: 'rel1ines', to: ID.tomas, label: rel.ines_tomas[0], mine: rel.ines_tomas[1] }, { id: 'rel2ines', to: ID.lucia, label: rel.ines_lucia, both: true }] },
    tomas: { kind: 'main', birth: '1943-01-19', relations: [{ id: 'rel3toma', to: ID.damian, label: rel.tomas_damian, both: true }, { id: 'rel4toma', to: ID.remedios, label: rel.tomas_remedios, both: true }] },
    lucia: { kind: 'main', birth: '1989-07-08', relations: [{ id: 'rel5luci', to: ID.damian, label: rel.lucia_damian[0], mine: rel.lucia_damian[1] }] },
    damian: { kind: 'secondary', birth: '1951-11-03' },
    remedios: { kind: 'secondary', birth: '1958-04-27' },
  };
  for (const key of ['ines', 'tomas', 'lucia', 'damian', 'remedios']) {
    const [name, role, aliases, content] = t.characters[key];
    const data = { ...charData[key], role, aliases };
    let body = '';
    if (typeof content === 'string') body = html([content]);
    else data.sections = Object.fromEntries(Object.entries(content).map(([sec, answers]) => [sec, { mode: 'questions', answers: Object.fromEntries(Object.entries(answers).map(([q, a]) => [q, html([a])])) }]));
    add({ id: ID[key], type: 'character', name, status: typeof content === 'string' ? 1 : 2, data, body });
  }

  // Lugares, objetos y grupo
  for (const key of ['isla', 'faro', 'taberna', 'muelle', 'lisboa']) {
    const [name, desc] = t.locations[key];
    add({ id: ID[key], type: 'location', name, status: key === 'muelle' ? 1 : 2, body: html([desc]), data: ['faro', 'taberna', 'muelle'].includes(key) ? { parentId: ID.isla } : {} });
  }
  for (const key of ['cuaderno', 'lente']) add({ id: ID[key], type: 'object', name: t.objects[key][0], status: key === 'lente' ? 1 : 2, body: html([t.objects[key][1]]), data: { role: '' } });
  add({ id: ID.cofradia, type: 'group', name: t.cofradia[0], status: 1, body: html([t.cofradia[1]]), data: { color: '#4a7fb8', members: [ID.damian, ID.remedios, ID.lucia] } });

  // Capítulos y escenas
  const chIds = [ID.ch1, ID.ch2, ID.ch3, ID.ch4, ID.ch5];
  t.chapters.forEach((name, i) => add({ id: chIds[i], type: 'chapter', name, data: { kind: 'chapter' } }));
  const sceneMeta = {
    sc1: { ch: ID.ch1, status: 2, time: '2024-10-12T04:10', end: '2024-10-12T04:25', chars: ['ines', 'damian'], locs: ['lisboa'], objs: [], strands: [ID.tr1, ID.tr2] },
    sc2: { ch: ID.ch1, status: 2, time: '2024-10-13T07:30', end: '2024-10-13T09:15', chars: ['ines', 'lucia'], locs: ['muelle'], objs: ['cuaderno'], strands: [ID.tr2, ID.tr3] },
    sc3: { ch: ID.ch2, status: 2, time: '2024-10-13T13:00', end: '2024-10-13T14:00', chars: ['ines', 'remedios', 'damian'], locs: ['taberna'], objs: ['lente'], strands: [ID.tr1] },
    sc4: { ch: ID.ch2, status: 2, time: '2024-10-13T19:40', end: '2024-10-13T20:30', chars: ['ines'], locs: ['faro'], objs: ['lente'], strands: [ID.tr1] },
    sc5: { ch: ID.ch3, status: 1, time: '2024-10-14T09:00', end: '2024-10-14T12:00', chars: ['ines'], locs: ['faro'], objs: ['cuaderno'], strands: [ID.tr1, ID.tr2] },
    sc6: { ch: ID.ch3, status: 1, time: '2024-10-14T23:15', end: '2024-10-15T00:30', chars: ['ines', 'lucia'], locs: ['muelle'], objs: [], strands: [ID.tr3] },
    sc7: { ch: ID.ch4, status: 1, time: '2024-10-17T05:12', end: '', chars: ['ines', 'lucia', 'damian'], locs: ['muelle', 'isla'], objs: [], strands: [ID.tr1, ID.tr3] },
    sc8: { ch: ID.ch4, status: 0, time: '', end: '', chars: ['ines'], locs: ['faro'], objs: ['lente'], strands: [ID.tr1] },
    sc9: { ch: ID.ch5, status: 0, time: '', end: '', chars: ['ines', 'tomas'], locs: ['isla'], objs: [], strands: [ID.tr1, ID.tr2] },
  };
  for (const [key, meta] of Object.entries(sceneMeta)) {
    const [name, summary, paras] = t.scenes[key];
    // El texto de una escena va en su revisión (la escena guarda el recuento).
    const rev = id('rev' + key);
    add({ id: rev, type: 'revision', parent_id: ID[key], position: 1, body: html(paras), words: words(paras), chars: chars(paras) });
    add({
      id: ID[key], type: 'scene', parent_id: meta.ch, name, status: meta.status, words: words(paras), chars: chars(paras),
      data: {
        activeRevision: rev,
        summary, characters: meta.chars.map((c) => ID[c]), locations: meta.locs.map((l) => ID[l]), locationId: meta.locs[0] ? ID[meta.locs[0]] : null,
        objects: meta.objs.map((o) => ID[o]), strands: meta.strands, pov: { type: 'third_limited', characterId: ID.ines },
        ...(meta.time ? { time: meta.time } : {}), ...(meta.end ? { timeEnd: meta.end } : {}),
      },
    });
  }

  // Línea temporal
  const evTargets = { ev1: [ID.tomas, ID.faro], ev2: [ID.ines, ID.lucia], ev3: [ID.faro], ev4: [ID.tomas, ID.cuaderno], ev5: [ID.isla] };
  const evScenes = { ev5: [{ id: ID.sc7, mode: 'in' }] };
  for (const key of ['ev1', 'ev2', 'ev3', 'ev4', 'ev5']) {
    const [name, time, description] = t.events[key];
    add({ id: ID[key], type: 'event', name, data: { time, description, targets: evTargets[key], scenes: evScenes[key] || [] } });
  }

  // Nota y diccionario
  add({ id: ID.note1, type: 'note', name: t.note[0], body: html([t.note[1]]), data: { links: [ID.cuaderno, ID.tomas] } });
  t.terms.forEach(([name, def], i) => add({ id: [ID.term1, ID.term2][i], type: 'term', name, body: html([def]) }));

  await call('POST', `projects/${P}/bulk`, { entities });

  // Historial de escritura: las últimas diez semanas, con una racha de doce días hasta hoy.
  const entries = [];
  let total = 1200;
  for (let back = 69; back >= 0; back--) {
    const d = new Date(today.getTime() - back * 864e5);
    const weekday = d.getDay();
    const rest = back > 12 && (weekday === 0 || (back * 7) % 11 === 3);
    const written = back === 0 ? 640 : rest ? 0 : 280 + ((back * 137) % 820) + (weekday === 6 ? 300 : 0);
    if (!written) continue;
    entries.push({ day: iso(d), start: total, total: total + written });
    total += written;
  }
  await call('POST', `projects/${P}/wordlog`, { entries });
  return { pid: P, ids: ID };
}
