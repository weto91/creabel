// Ajuda detallada de cada pàgina (ca): el que es veu en prémer «?». Cada entrada té una
// frase d’entrada, apartats [títol, text], trucs i el capítol de la guia de l’aplicació
// on s’explica amb més calma. Les pàgines que no són aquí només mostren la seva frase curta
// (help.<secció> a i18n/ca.js).
export default {
  home: {
    intro: 'El que convé veure en entrar: per on continuar, com vas, quant queda i què cal revisar.',
    parts: [
      ['Per on continuar', 'L’última escena que vas tocar i la següent que queda per escriure, amb accés directe. «Continua escrivint» obre la primera. En un projecte nou, aquí hi ha els primers passos.'],
      ['Quatre xifres', 'El manuscrit respecte al seu objectiu de paraules, el que has escrit avui respecte a la quota diària, la ratxa de dies seguits i els dies que queden per al lliurament, amb el ritme que necessites i el que portes.'],
      ['Ritme i estat', 'Les paraules de cadascun dels darrers 30 dies i quantes fitxes, capítols i escenes estan per fer, en curs o acabats.'],
      ['Per revisar', 'Els pendents oberts més recents i els avisos: impossibles i avisos de Continuïtat, escenes sense data i escenes sense cap trama.'],
    ],
    tips: ['Els objectius es fixen a «Llibre → Objectius». Sense objectius, les xifres només mostren el que hi ha.', 'Si has posat una portada o una frase de presentació a «Llibre», surten al primer bloc; clica la portada per veure-la en gran.', 'Al PC, clic dret en qualsevol enllaç → «Obre en una finestra nova»: per exemple, la fitxa d’un personatge al costat de l’escena que escrius.', 'Al mòbil, si surts d’una escena per consultar alguna cosa, el botó ↩ de dalt et torna a ella.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Els fonaments de la història: què expliques, en quin món i per quins fils avança.',
    parts: [
      ['Premissa', 'La idea en una o dues frases: qui vol què i què li ho impedeix.'],
      ['Faula, ambientació i notes', 'Els fets en ordre cronològic, l’època i el lloc, i els apunts que afecten tota la novel·la. Prem cada bloc per escriure’l.'],
      ['Trames', 'Un fil narratiu per fila, agrupades pel seu pes: principals, subtrames i de fons. La classificació es posa a la fitxa de cada trama.'],
      ['El recorregut de cada trama', 'La barra té una ratlla per cada escena del llibre, en ordre de lectura; les de color són les d’aquesta trama. S’hi veu on comença, on desapareix i si arriba al final.'],
    ],
    tips: [
      'Les escenes s’assignen a una trama a la fitxa de l’escena, bloc «Trames i objectes».',
      'L’avís «escenes sense cap trama» assenyala escenes que potser no fan avançar res.',
      '«Llegeix-ho tot» mostra l’arquitectura d’una tirada, com un document.',
      '«Importa / exporta», al costat d’«Afegeix una trama», treu les trames a Excel, CSV, Word, text o JSON i les torna a portar.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Apunts solts del projecte: idees, fragments, recordatoris.',
    parts: [
      ['Etiquetes', 'Cada nota en pot portar diverses. Aquí s’agrupen per etiqueta, i una nota amb dues etiquetes apareix als dos blocs.'],
      ['Color', 'Vuit colors per distingir-les d’una ullada. «Ordena per: Color» les agrupa així.'],
      ['Enllaços', 'Una nota es pot enllaçar amb personatges, llocs, objectes, grups, fitxes pròpies, trames, capítols i escenes. Llavors apareix a la fitxa de cadascun.'],
      ['Ordenar i mantenir', 'Dins de cada bloc es reordenen arrossegant-les. El menú ⋯ d’una etiqueta li canvia el nom o la treu de totes les seves notes.'],
    ],
    tips: ['Per al material de consulta (enllaços, plànols, articles) és millor Documentació; per al que cal revisar, Pendents.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'El material de consulta de la novel·la: enllaços, articles, imatges, mapes, plànols i documents.',
    parts: [
      ['Referències', 'Cadascuna té un tipus, una adreça web opcional, un text i fitxers adjunts (imatges, SVG o PDF).'],
      ['Enllaços', 'Una referència s’enllaça amb escenes, capítols o fitxes, i hi apareix: així la tens a mà mentre escrius aquella escena.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Les fitxes dels qui viuen la història.',
    parts: [
      ['Principals i secundaris', 'Els principals tenen una entrevista per seccions (dades personals, aspecte físic, psicologia, conflicte, evolució…); els secundaris, una descripció lliure. Es pot convertir l’un en l’altre des de la seva fitxa.'],
      ['Detecció al text', 'Si crees els personatges abans d’escriure, les escenes els reconeixen pel nom i pels àlies i els marquen soles.'],
      ['Dates i edat', 'Amb la data de naixement a la fitxa, cada escena amb data mostra l’edat del personatge.'],
      ['Relacions', 'Quan algun personatge té una relació dibuixada a «Relacions», aquí apareix una pestanya que les reuneix totes.'],
    ],
    tips: ['«Importa / exporta» treu la llista a Excel, CSV, Word, text o JSON, i la torna a portar. Cada fitxa hi va sencera: dades, text, trets, esdeveniments, escenes on apareix i relacions.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'La fitxa d’un personatge principal: una entrevista per seccions que t’ajuda a conèixer-lo.',
    parts: [
      ['Seccions', 'Cada secció es pot respondre pregunta a pregunta o com a text lliure. El seu estat (per fer, en curs, acabat) et diu què queda.'],
      ['Trets', 'S’extreuen sols del que escrius (edat, cabells, ulls…) perquè no et contradiguis; en pots afegir de teus.'],
      ['Paper, àlies i dates', 'El paper a la història, les altres maneres d’anomenar-lo (perquè el text el reconegui) i el seu naixement i la seva mort.'],
      ['Relacions', 'Una parella per relació: sota la foto de cadascun, el que és per a l’altre («Director de vol» / «Comandant»). Si només n’escrius un, val per als dos («Companys»). És una sola llista, tant si la relació està anotada aquí com a la fitxa de l’altre o dibuixada en un mapa; quan la canvies o la treus, s’actualitza a tots aquests llocs.'],
      ['Imatges, esdeveniments i aparicions', 'Fotos de referència, fets amb data per a la línia temporal i les escenes on surt.'],
    ],
    tips: [
      'Si continua apareixent després de morir (el seu cos, un record, un espectre), marca la casella sota la data de mort i Continuïtat no avisarà.',
      'El menú ⋯ exporta la fitxa o hi importa dades.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Els escenaris de la novel·la, del més gran al més petit.',
    parts: [
      ['Llista', 'Les fitxes de tots els llocs, que es reordenen arrossegant-les.'],
      ['Arbre', 'Quin lloc és dins de quin: la sala a la coberta, la coberta a la nau. El que passa en un lloc també compta per als que el contenen.'],
      ['Mapes', 'Puges un plànol o un mapa (imatge o SVG) i hi col·loques els teus llocs a sobre amb xinxetes.'],
      ['Relacions', 'Apareix quan algun lloc té una relació dibuixada a «Relacions».'],
    ],
    tips: ['A l’arbre, el menú ⋯ de cada fila el mou dins d’un altre lloc o hi afegeix llocs a dins.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'La fitxa d’un lloc.',
    parts: [
      ['On és', 'País, regió i ciutat, i «Dins de»: el lloc que el conté. «Conté» llista els que té a dins.'],
      ['Descripció i preguntes', 'El text lliure i les preguntes pròpies que hagis definit per a tots els llocs.'],
      ['Aparicions', 'Les escenes que passen aquí o en qualsevol dels llocs que conté.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Fitxes dels tipus que defineixis tu: naus, tecnologies, criatures, organitzacions…',
    parts: [
      ['Tipus', '«Afegeix un tipus» en crea un amb el seu nom, la seva icona i els seus camps. Cada tipus és una pestanya.'],
      ['Fitxes', 'Tenen els camps del seu tipus i, a més, descripció, imatges i identificador.'],
      ['Com un element més', 'Es marquen a les escenes (bloc «Trames i objectes»), surten a la línia temporal i al cercador, i entren a Continuïtat.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Com es relacionen els elements de la novel·la: el que dibuixes tu i el que es dedueix sol.',
    parts: [
      ['Els meus mapes', 'En pots tenir diversos: la família, la tripulació, els bàndols. Cadascun és un llenç.'],
      ['Elements i fletxes', 'En un mapa hi afegeixes fitxes (o textos lliures) i n’uneixes dues amb una fletxa etiquetada: «mare de», «enemic de», «treballa per a».'],
      ['Automàtiques', 'Deu dibuixos que surten sols del que ja has anotat: qui coincideix en escena, qui té cada objecte, qui sap cada secret, què uneix un esdeveniment, personatges i llocs, personatges i trames, desplaçaments, grups, llocs dins de llocs i relacions (totes les anotades a fitxes i mapes, més els germans i els avis que se’n dedueixen). No es desen: es tornen a calcular quan obres la pàgina.'],
      ['Tot junt', 'Un dibuix general amb les teves (línia contínua) i les automàtiques (discontínua, cadascuna del seu color), amb caselles per triar quines es veuen.'],
      ['Llegir un dibuix', 'Com més gruixuda és la línia, més vegades es dona la relació. Passa el ratolí per sobre d’un element, o prem-lo per fixar-lo, i se’n ressalten les relacions amb el seu rètol. A sota hi ha la llista.'],
      ['Veure-les a les fitxes', 'Personatges i Llocs tenen una pestanya «Relacions» que reuneix les de tots els teus mapes.'],
    ],
    tips: ['«Exporta les relacions» les treu a Word, text, Excel, CSV o JSON.', 'Una fletxa «mare», «pare» o «fill» entre dos personatges també serveix perquè Continuïtat en comprovi les dates de naixement.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'L’estructura de la novel·la: parts, capítols, pròleg i epíleg.',
    parts: [
      ['La llista', 'Cada capítol amb les seves escenes, les seves paraules, el seu temps de lectura, el seu estat, els personatges amb més presència i un quadre de color per cada trama que toca. A dalt, el total del llibre.'],
      ['Temps de lectura', 'Aproximat, a unes 250 paraules per minut. Dins de cada capítol també surt el de cada escena.'],
      ['Les trames', 'Passa el ratolí per sobre d’un quadre (o mantén-lo premut en una pantalla tàctil) per veure el nom de la trama, el seu tipus i la seva descripció.'],
      ['Reordenar', 'Arrossega les files, fes servir Alt+↑/↓ o el menú ⋯ de cadascuna.'],
      ['Altres vistes', '«Tauler» mostra les escenes com a targetes per moure-les entre capítols; «Esquema», tot en un arbre.'],
    ],
    tips: ['«Estructura» afegeix parts, pròleg o epíleg, importa un esborrany en Word i detecta mencions a totes les escenes.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Un capítol: les seves escenes i els seus apunts.',
    parts: [
      ['Escenes', 'Es creen, es reordenen arrossegant-les i es mouen a un altre capítol des del seu menú ⋯. Sota el títol de cadascuna: quan passa i quant dura, qui narra i un quadre de color per cada lloc (passa el ratolí per sobre, o mantén-lo premut, per veure quin és).'],
      ['Motiu i notes', 'Per a què serveix el capítol a la novel·la i el que vulguis recordar en escriure’l.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'On s’escriu. A l’esquerra, el text; a la dreta, la fitxa de l’escena.',
    parts: [
      ['El text', 'Es desa sol. La barra dona format, guió de diàleg i cometes, cerca i substitueix, i marca un pendent sobre el que has seleccionat.'],
      ['La fitxa', 'Per blocs plegables: qui hi surt i qui narra, on i quan, esdeveniments, trames i objectes, continuïtat, pendents, documentació i revisions.'],
      ['Esdeveniments', 'El bloc «Esdeveniments» mostra els fets que tenen a veure amb l’escena: els que hi passen (en prenen la data) i els que s’hi expliquen (un record: conserven la seva). Plegat, diu quins són; obert, en dona de cadascun la data, la descripció, a qui afecta i en quines altres escenes és.'],
      ['Detecció automàtica', 'El que anomenes al text (personatges, llocs, objectes, grups) es marca sol, amb la paraula «auto». Si ho treus, no es torna a afegir.'],
      ['Revisions', 'Versions del text de l’escena. En pots crear una de nova abans de reescriure, comparar-les i tornar a una d’anterior.'],
      ['Eines', 'A la barra: vista dividida (una fitxa o una altra escena al costat), revisió d’estil, lectura en veu alta i mode sense distraccions.'],
      ['Continuïtat', 'Anota-hi el que canvia d’estat («ferida al braç», «la clau passa a l’Àlex») i quin secret es revela, i a qui.'],
    ],
    tips: ['Ctrl+S desa a l’instant; Ctrl+F cerca; Esc surt del mode sense distraccions.', 'La data de l’escena la situa a la línia temporal i permet calcular edats i detectar impossibles.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Les escenes com a targetes, per veure la novel·la d’una ullada i recol·locar-la.',
    parts: [
      ['Columnes i targetes', 'Cada capítol és una columna (quatre per fila) i cada escena, una targeta amb el seu resum, qui narra, on i quan.'],
      ['Resum', 'Prem el text d’una targeta per escriure de què va l’escena.'],
      ['Moure', 'Arrossega una targeta per canviar-la de lloc o de capítol. A les pantalles tàctils, fes servir el seu menú ⋯.'],
      ['Trames', 'Les ratlles de color són les trames de l’escena; la llegenda de dalt diu quina és cadascuna.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Tot el que descriu la novel·la com a llibre.',
    parts: [
      ['Dades del llibre', 'Títol i llengua (obligatoris) i autor, sèrie, número, data de publicació, editorial, portada i sinopsi (opcionals). Surten a la portadella i a les dades del llibre electrònic.'],
      ['Objectius', 'Objectiu de paraules, quota diària, data límit i paraules per capítol. Se’n fa el seguiment des de l’inici.'],
      ['Pàgines del llibre', 'Crèdits, dedicatòria, cita, agraïments i «Sobre l’autor» amb la seva foto. S’afegeixen en exportar.'],
      ['Projecte', 'Còpia de seguretat (un .zip amb totes les dades, les imatges i els documents, i el llibre i les fitxes en Word), crear una seqüela (conserva el món, comença sense capítols) i esborrar el projecte. La còpia es restaura amb «Importa una còpia» a «Els teus projectes».'],
    ],
    tips: ['Sense autor, el llibre s’exporta com a «Anònim».'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'El que queda per revisar, en un sol lloc.',
    parts: [
      ['D’on surten', 'D’una marca sobre el text d’una escena, o solts, lligats a una fitxa o al projecte.'],
      ['Tipus i estat', 'Cada pendent té un tipus (revisar, comprovar, documentar-se…) i es marca com a resolt quan ho està.'],
      ['Anar al lloc', 'Des d’un pendent marcat sobre el text se salta a la frase exacta de l’escena.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Els fets en ordre: les escenes amb data i els esdeveniments del món.',
    parts: [
      ['Què hi apareix', 'Una escena hi surt quan li poses data a la seva fitxa. Un esdeveniment es crea aquí o a la fitxa d’un element, i pot ser general o d’un element o de diversos.'],
      ['Esdeveniments i escenes', 'Un esdeveniment s’enllaça amb les escenes on passa (en pren la data i surt a dins) o amb les escenes on només s’explica (conserva la seva). Si un esdeveniment solt coincideix en data i hora amb una escena, un avís proposa enllaçar-los.'],
      ['Dos ordres', '«Cronològic» ordena per data; «De lectura», com al llibre, per veure on el relat salta enrere.'],
      ['On comença i on acaba el llibre', 'Dues marques assenyalen la primera i l’última escena que llegeix el lector: el que hi ha abans és passat anterior a la novel·la.'],
      ['Segueix i filtres', '«Segueix» deixa la línia en un sol element; les caselles amaguen tipus d’entrada.'],
      ['Cercador', 'Per text, data o identificador. «a & b» exigeix totes dues coses; «a | b», una de les dues. El «?» del costat dona exemples.'],
      ['Importar i exportar', 'A CSV, JSON, Excel o Word, i de tornada: crea els esdeveniments que faltin i actualitza els que ja existeixen.'],
    ],
    tips: ['Entre dues entrades s’indica el temps que passa; si hi passes el ratolí per sobre, surt desglossat.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Per no contradir-te: impossibles que es poden detectar, qui sap cada cosa i com canvia cada element.',
    parts: [
      ['Comprovacions', 'Creua dates i llocs de les escenes, personatges presents, naixements i morts, estats i secrets. Avisa, per exemple, si algú és en dos llocs alhora.'],
      ['Impossible o per revisar', 'El que no pot ser surt com a «Impossible»; el que pot ser intencionat, com a «Per revisar». Cada avís es pot ignorar.'],
      ['Qui sap què', 'Els secrets de la novel·la, un per fila, i en quina escena se n’assabenta cada personatge i el lector. S’ordenen per la seva primera revelació (per data o per ordre de lectura), i el cercador en troba per títol, contingut, persona o escena. Prem una fila per veure’n el detall.'],
      ['Seguiment', 'Recorre el llibre seguint un element: on apareix i com va canviant d’estat.'],
    ],
    tips: ['Els estats i les revelacions s’anoten a la fitxa de cada escena, bloc «Continuïtat».', 'Com més completis (dates, llocs, naixements), més en trobarà.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Mesures del manuscrit i de la teva manera d’escriure’l.',
    parts: [
      ['La meva escriptura', 'Paraules per dia, ratxes, sessions i previsió de final.'],
      ['El llibre', 'Llargada de capítols i escenes, proporció de diàleg i narració, i repeticions.'],
      ['Estil', 'Adverbis en -ment, repeticions properes, falques i frases llargues, per capítol; ressalta on n’hi ha més. Segueix les regles de la llengua de la novel·la.'],
      ['Gràfic narratiu', 'Una fila per element i una columna per escena: qui desapareix massa temps i quines trames no es creuen.'],
      ['Distribució i aparicions', 'En quantes escenes de cada capítol surt cada element, i la llista d’escenes d’un personatge.'],
    ],
    tips: ['El «?» al costat de cada columna explica què mesura.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Cerca (i substitueix) a tot el projecte.',
    parts: [
      ['On cerca', 'Marca els àmbits: text de les escenes, títols, personatges, món, arquitectura i notes, documentació i pendents.'],
      ['Opcions', 'Distingir majúscules i cercar només paraules senceres.'],
      ['Substituir', 'Canvia el text en tot el que està marcat, després de dir-te en quants llocs. Útil per canviar el nom d’un personatge.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Treu la novel·la o el material de treball a un fitxer.',
    parts: [
      ['Què vols exportar', 'La novel·la o el dossier (arquitectura, personatges, llocs i la resta de fitxes).'],
      ['Tipus d’exportació', 'Manuscrit per enviar, llibre imprès (amb estimació de pàgines i llom), llibre electrònic (EPUB) o format lliure.'],
      ['Formats', 'Word, EPUB, pàgina web o PDF, i text.'],
      ['Dades i pàgines del llibre', 'La portadella, les dades del llibre electrònic, la portada i les pàgines preliminars i finals surten de «Llibre».'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'El que esborres no es perd a l’instant: va a parar aquí.',
    parts: [
      ['Restaurar', 'Torna un element al seu lloc, amb el que en penjava.'],
      ['Caducitat', 'Passats els dies que fixis a Configuració (entre 1 i 60), s’esborra definitivament.'],
    ],
    guide: 'data#trash',
  },
};
