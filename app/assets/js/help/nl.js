// Uitgebreide hulp bij elke pagina (nl): wat je ziet als je op “?” drukt. Elk item heeft een
// inleidende zin, onderdelen [titel, tekst], tips en het hoofdstuk van de gids bij de app
// waar het rustiger wordt uitgelegd. Pagina’s die hier niet staan, tonen alleen hun korte zin
// (help.<onderdeel> in i18n/nl.js).
export default {
  home: {
    intro: 'Wat je bij binnenkomst wilt zien: waar je verdergaat, hoe je ervoor staat, hoeveel er nog te doen is en wat er moet worden nagekeken.',
    parts: [
      ['Waar je verdergaat', 'De laatste scène waaraan je werkte en de volgende die nog geschreven moet worden, met een directe link. “Verder schrijven” opent de eerste. In een nieuw project staan hier de eerste stappen.'],
      ['Vier cijfers', 'Het manuscript tegenover het woorddoel, wat je vandaag schreef tegenover het dagdoel, de reeks opeenvolgende dagen en de dagen tot de deadline, met het tempo dat je nodig hebt en het tempo dat je haalt.'],
      ['Tempo en stand', 'De woorden van elk van de laatste 30 dagen en hoeveel kaarten, hoofdstukken en scènes nog te doen, bezig of klaar zijn.'],
      ['Na te kijken', 'De recentste open taken en de meldingen: onmogelijkheden en waarschuwingen uit Continuïteit, scènes zonder datum en scènes zonder verhaallijn.'],
    ],
    tips: ['De doelen stel je in bij “Boek → Doelen”. Zonder doelen tonen de cijfers alleen wat er is.', 'Als je in “Boek” een omslag of een logline hebt ingevuld, staan die in het eerste blok; klik op het omslag om het groot te zien.', 'Op de pc: klik met de rechtermuisknop op een willekeurige link → “Openen in een nieuw venster”, bijvoorbeeld de kaart van een personage naast de scène die je schrijft.', 'Op de telefoon brengt de knop ↩ bovenaan je terug naar een scène die je hebt verlaten om iets op te zoeken.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Het fundament van het verhaal: wat je vertelt, in welke wereld en langs welke verhaaldraden het vooruitgaat.',
    parts: [
      ['Premisse', 'Het idee in een of twee zinnen: wie wil wat en wat staat dat in de weg.'],
      ['Fabel, setting en notities', 'De gebeurtenissen in chronologische volgorde, de tijd en de plaats, en de aantekeningen die voor de hele roman gelden. Druk op een blok om het te schrijven.'],
      ['Verhaallijnen', 'Eén verhaaldraad per rij, gegroepeerd naar gewicht: hoofdverhaallijnen, nevenverhaallijnen en achtergrond. De indeling stel je in op de kaart van elke verhaallijn.'],
      ['Het verloop van elke verhaallijn', 'De balk heeft een streepje per scène van het boek, in leesvolgorde; de gekleurde horen bij die verhaallijn. Zo zie je waar ze begint, waar ze verdwijnt en of ze het eind haalt.'],
    ],
    tips: [
      'Scènes wijs je toe aan een verhaallijn op de kaart van de scène, blok “Verhaallijnen en voorwerpen”.',
      'De melding “scènes zonder verhaallijn” wijst op scènes die misschien niets vooruithelpen.',
      '“Alles lezen” toont de opzet achter elkaar, als één document.',
      '“Importeren / exporteren”, naast “Verhaallijn toevoegen”, zet de verhaallijnen in Excel, CSV, Word, tekst of JSON en haalt ze weer terug.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Losse aantekeningen bij het project: ideeën, fragmenten, geheugensteuntjes.',
    parts: [
      ['Labels', 'Elke notitie kan er meerdere hebben. Hier worden ze per label gegroepeerd, en een notitie met twee labels staat in beide blokken.'],
      ['Kleur', 'Acht kleuren om ze in één oogopslag te onderscheiden. “Sorteren op: Kleur” groepeert ze zo.'],
      ['Koppelingen', 'Een notitie kun je koppelen aan personages, locaties, voorwerpen, groepen, eigen kaarten, verhaallijnen, hoofdstukken en scènes. Ze verschijnt dan op de kaart van elk daarvan.'],
      ['Ordenen en bijhouden', 'Binnen elk blok herschik je ze door te slepen. Met het menu ⋯ van een label wijzig je de naam ervan of haal je het bij al zijn notities weg.'],
    ],
    tips: ['Voor naslagmateriaal (links, plattegronden, artikelen) is Documentatie beter; voor wat er moet worden nagekeken, Taken.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Het naslagmateriaal van de roman: links, artikelen, afbeeldingen, landkaarten, plattegronden en documenten.',
    parts: [
      ['Referenties', 'Elke referentie heeft een soort, een optioneel webadres, een tekst en bijgevoegde bestanden (afbeeldingen, SVG of PDF).'],
      ['Koppelingen', 'Een referentie koppel je aan scènes, hoofdstukken of kaarten, en ze verschijnt daar: zo heb je haar bij de hand terwijl je die scène schrijft.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'De kaarten van de mensen die het verhaal beleven.',
    parts: [
      ['Hoofd- en bijpersonages', 'Hoofdpersonages hebben een interview in onderdelen (persoonlijke gegevens, uiterlijk, psychologie, conflict, ontwikkeling…); bijpersonages een vrije beschrijving. Je kunt het ene in het andere omzetten via de kaart.'],
      ['Herkenning in de tekst', 'Als je de personages aanmaakt voordat je gaat schrijven, herkennen de scènes ze aan hun naam en hun andere namen en geven ze ze vanzelf aan.'],
      ['Datums en leeftijd', 'Met de geboortedatum op de kaart toont elke scène met een datum de leeftijd van het personage.'],
      ['Relaties', 'Zodra een personage een getekende relatie heeft in “Relaties”, verschijnt hier een tabblad dat ze allemaal bundelt.'],
    ],
    tips: ['“Importeren / exporteren” zet de lijst in Excel, CSV, Word, tekst of JSON, en haalt hem weer terug. Elke kaart gaat volledig mee: gegevens, tekst, kenmerken, gebeurtenissen, scènes waarin het personage voorkomt en relaties.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'De kaart van een hoofdpersonage: een interview in onderdelen dat je helpt het te leren kennen.',
    parts: [
      ['Onderdelen', 'Elk onderdeel kun je vraag voor vraag beantwoorden of als vrije tekst. De status (te doen, bezig, klaar) laat zien wat er nog openstaat.'],
      ['Kenmerken', 'Ze worden vanzelf uit je tekst gehaald (leeftijd, haar, ogen…), zodat je jezelf niet tegenspreekt; je kunt er zelf ook toevoegen.'],
      ['Rol, andere namen en datums', 'De rol in het verhaal, de andere manieren waarop het genoemd wordt (zodat de tekst het herkent) en de geboorte en het overlijden.'],
      ['Relaties', 'Een paar per relatie: onder de foto van elk van beide wat het voor de ander is (“Vluchtleider” / “Commandant”). Vul je er maar één in, dan geldt die voor allebei (“Collega’s”). Het is één lijst, of de relatie nu hier staat, op de kaart van de ander of in een diagram is getekend; als je haar wijzigt of weghaalt, wordt dat op al die plekken bijgewerkt.'],
      ['Afbeeldingen, gebeurtenissen en optredens', 'Referentiefoto’s, feiten met een datum voor de tijdlijn en de scènes waarin het personage voorkomt.'],
    ],
    tips: [
      'Komt het na zijn dood nog voor (het lichaam, een herinnering, een geest), vink dan het vakje onder de sterfdatum aan en Continuïteit geeft geen melding.',
      'Met het menu ⋯ exporteer je de kaart of importeer je er gegevens in.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'De plekken van de roman, van de grootste tot de kleinste.',
    parts: [
      ['Lijst', 'De kaarten van alle locaties, die je herschikt door ze te slepen.'],
      ['Boom', 'Welke locatie in welke ligt: de zaal op het dek, het dek in het schip. Wat op een locatie gebeurt, telt ook voor de locaties waar ze in ligt.'],
      ['Plattegronden', 'Je uploadt een plattegrond of een landkaart (afbeelding of SVG) en zet je locaties erop met punaises.'],
      ['Relaties', 'Verschijnt zodra een locatie een getekende relatie heeft in “Relaties”.'],
    ],
    tips: ['In de boom verplaatst het menu ⋯ van elke rij de locatie naar een andere locatie of voegt het er locaties in toe.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'De kaart van een locatie.',
    parts: [
      ['Waar het ligt', 'Land, regio en stad, en “Ligt in”: de locatie waar ze in ligt. “Bevat” toont de locaties die erin liggen.'],
      ['Beschrijving en vragen', 'De vrije tekst en de eigen vragen die je voor alle locaties hebt bedacht.'],
      ['Optredens', 'De scènes die zich hier afspelen, of in een van de locaties die erin liggen.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Kaarten van soorten die je zelf bedenkt: schepen, technologieën, wezens, organisaties…',
    parts: [
      ['Soorten', '“Soort toevoegen” maakt er een aan met naam, pictogram en velden. Elke soort is een tabblad.'],
      ['Kaarten', 'Ze hebben de velden van hun soort en daarnaast een beschrijving, afbeeldingen en een identificatiecode.'],
      ['Als elk ander element', 'Je geeft ze aan in de scènes (blok “Verhaallijnen en voorwerpen”), ze verschijnen op de tijdlijn en in het zoekveld, en ze tellen mee in Continuïteit.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Hoe de elementen van de roman met elkaar samenhangen: wat je zelf tekent en wat er vanzelf uit volgt.',
    parts: [
      ['Mijn diagrammen', 'Je kunt er meerdere hebben: de familie, de bemanning, de kampen. Elk diagram is een canvas.'],
      ['Elementen en pijlen', 'In een diagram voeg je kaarten (of losse teksten) toe en verbind je er twee met een pijl met een label: “moeder van”, “vijand van”, “werkt voor”.'],
      ['Automatisch', 'Tien tekeningen die vanzelf volgen uit wat al genoteerd is: wie samen in een scène zit, wie elk voorwerp heeft, wie elk geheim kent, wat een gebeurtenis verbindt, personages en locaties, personages en verhaallijnen, verplaatsingen, groepen, locaties binnen locaties en relaties (alle relaties op kaarten en in diagrammen, plus de broers en zussen en grootouders die eruit volgen). Ze worden niet opgeslagen: ze worden bij het openen opnieuw berekend.'],
      ['Alles samen', 'Eén overzichtstekening met die van jou (doorgetrokken lijn) en de automatische (stippellijn, elk in een eigen kleur), met vakjes om te kiezen welke je ziet.'],
      ['Een tekening lezen', 'Hoe dikker de lijn, hoe vaker de relatie voorkomt. Ga met de muis over een element, of druk erop om het vast te zetten, en zijn relaties lichten op met hun label. Daaronder staat de lijst.'],
      ['Ze op de kaarten zien', 'Personages en Locaties hebben een tabblad “Relaties” dat de relaties uit al je diagrammen bundelt.'],
    ],
    tips: ['“Relaties exporteren” zet ze in Word, tekst, Excel, CSV of JSON.', 'Een pijl “moeder”, “vader” of “zoon” tussen twee personages zorgt er bovendien voor dat Continuïteit hun geboortedatums controleert.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'De structuur van de roman: delen, hoofdstukken, proloog en epiloog.',
    parts: [
      ['De lijst', 'Elk hoofdstuk met zijn scènes, woorden, leestijd, status, de personages die het vaakst voorkomen en een gekleurd vakje voor elke verhaallijn die het raakt. Bovenaan het totaal van het boek.'],
      ['Leestijd', 'Bij benadering, bij zo’n 250 woorden per minuut. Binnen elk hoofdstuk staat ook die van elke scène.'],
      ['De verhaallijnen', 'Ga met de muis over een vakje (of houd het ingedrukt op een aanraakscherm) om de naam, de soort en de beschrijving van de verhaallijn te zien.'],
      ['Herschikken', 'Sleep de rijen, of gebruik Alt+↑/↓ of het menu ⋯ van elke rij.'],
      ['Andere weergaven', '“Prikbord” toont de scènes als kaartjes om ze tussen hoofdstukken te verplaatsen; “Schema” toont alles in een boomstructuur.'],
    ],
    tips: ['“Structuur” voegt delen, een proloog of een epiloog toe, importeert een concept uit Word en herkent vermeldingen in alle scènes.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Een hoofdstuk: zijn scènes en zijn aantekeningen.',
    parts: [
      ['Scènes', 'Je maakt ze aan, herschikt ze door te slepen en verplaatst ze naar een ander hoofdstuk via hun menu ⋯. Onder de titel van elke scène: wanneer ze zich afspeelt en hoelang ze duurt, wie vertelt en een gekleurd vakje voor elke locatie (ga er met de muis over, of houd het ingedrukt, om te zien welke het is).'],
      ['Waarom dit hoofdstuk en notities', 'Waarvoor het hoofdstuk dient in de roman en wat je wilt onthouden bij het schrijven.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Hier schrijf je. Links de tekst; rechts de kaart van de scène.',
    parts: [
      ['De tekst', 'Wordt vanzelf opgeslagen. De balk biedt opmaak, dialoogstreepje en aanhalingstekens, zoeken en vervangen, en een taak markeren bij de selectie.'],
      ['De kaart', 'In inklapbare blokken: wie erin voorkomt en wie vertelt, waar en wanneer, gebeurtenissen, verhaallijnen en voorwerpen, continuïteit, taken, documentatie en revisies.'],
      ['Gebeurtenissen', 'Het blok “Gebeurtenissen” toont de feiten die met de scène te maken hebben: die erin gebeuren (ze nemen haar datum over) en die erin worden verteld (een herinnering: ze houden hun eigen datum). Ingeklapt zie je welke het zijn; uitgeklapt zie je van elk de datum, de beschrijving, wie erbij betrokken is en in welke andere scènes het voorkomt.'],
      ['Automatische herkenning', 'Wat je in de tekst noemt (personages, locaties, voorwerpen, groepen), wordt vanzelf aangegeven, met het woord “auto”. Als je het weghaalt, wordt het niet opnieuw toegevoegd.'],
      ['Revisies', 'Versies van de tekst van de scène. Je kunt een nieuwe maken voordat je herschrijft, ze vergelijken en teruggaan naar een eerdere.'],
      ['Hulpmiddelen', 'In de balk: gesplitste weergave (een kaart of een andere scène ernaast), stijlcontrole, voorlezen en de afleidingsvrije modus.'],
      ['Continuïteit', 'Noteer hier wat er verandert (“gewond aan de arm”, “de sleutel gaat naar Álex”) en welk geheim er wordt onthuld, en aan wie.'],
    ],
    tips: ['Ctrl+S slaat meteen op; Ctrl+F zoekt; Esc sluit de afleidingsvrije modus.', 'De datum van de scène plaatst haar op de tijdlijn en maakt het mogelijk leeftijden te berekenen en onmogelijkheden op te sporen.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'De scènes als kaartjes, om de roman in één oogopslag te zien en opnieuw te ordenen.',
    parts: [
      ['Kolommen en kaartjes', 'Elk hoofdstuk is een kolom (vier per rij) en elke scène een kaartje met haar samenvatting, wie vertelt, waar en wanneer.'],
      ['Samenvatting', 'Druk op de tekst van een kaartje om te schrijven waar de scène over gaat.'],
      ['Verplaatsen', 'Sleep een kaartje om het naar een andere plek of een ander hoofdstuk te brengen. Gebruik op aanraakschermen het menu ⋯ ervan.'],
      ['Verhaallijnen', 'De gekleurde streepjes zijn de verhaallijnen van de scène; de legenda bovenaan vertelt welke elk is.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Alles wat de roman als boek beschrijft.',
    parts: [
      ['Boekgegevens', 'Titel en taal (verplicht) en auteur, reeks, nummer, publicatiedatum, uitgeverij, omslag en synopsis (optioneel). Ze verschijnen op de titelpagina en in de gegevens van het e-book.'],
      ['Doelen', 'Woorddoel, dagdoel, deadline en woorden per hoofdstuk. Je volgt ze vanaf de startpagina.'],
      ['Pagina’s van het boek', 'Colofon, opdracht, motto, dankwoord en “Over de auteur” met de auteursfoto. Ze worden bij het exporteren toegevoegd.'],
      ['Project', 'Back-up (een .zip met alle gegevens, de afbeeldingen en documenten, en het boek en de kaarten in Word), een vervolg maken (met behoud van de wereld, zonder hoofdstukken) en het project verwijderen. De back-up zet je terug met “Back-up importeren” in “Je projecten”.'],
    ],
    tips: ['Zonder auteur wordt het boek geëxporteerd als “Anoniem”.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Wat er nog moet worden nagekeken, op één plek.',
    parts: [
      ['Waar ze vandaan komen', 'Van een markering in de tekst van een scène, of los, gekoppeld aan een kaart of aan het project.'],
      ['Soorten en status', 'Elke taak heeft een soort (nakijken, controleren, uitzoeken…) en je markeert haar als opgelost wanneer ze dat is.'],
      ['Naar de plek gaan', 'Vanuit een taak die in de tekst is gemarkeerd, spring je naar de precieze zin in de scène.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'De gebeurtenissen op volgorde: de scènes met een datum en de gebeurtenissen uit de wereld.',
    parts: [
      ['Wat erop staat', 'Een scène verschijnt zodra je haar op haar kaart een datum geeft. Een gebeurtenis maak je hier aan of op de kaart van een element, en ze kan algemeen zijn of bij een of meer elementen horen.'],
      ['Gebeurtenissen en scènes', 'Een gebeurtenis koppel je aan de scènes waarin ze gebeurt (ze neemt hun datum over en staat erin) of waarin ze alleen wordt verteld (ze houdt haar eigen datum). Valt een losse gebeurtenis in datum en tijd samen met een scène, dan stelt een melding voor ze te koppelen.'],
      ['Twee volgordes', '“Chronologisch” sorteert op datum; “Leesvolgorde” zoals in het boek, zodat je ziet waar het verhaal terugspringt.'],
      ['Begin en eind van het boek', 'Twee markeringen geven de eerste en de laatste scène aan die de lezer leest: wat daarvoor ligt, is voorgeschiedenis van de roman.'],
      ['Volgen en filters', '“Volgen” beperkt de tijdlijn tot één element; met de vakjes verberg je soorten items.'],
      ['Zoekveld', 'Op tekst, datum of identificatiecode. “a & b” vraagt allebei; “a | b” een van beide. Het “?” ernaast geeft voorbeelden.'],
      ['Importeren en exporteren', 'Naar CSV, JSON, Excel of Word, en weer terug: het maakt de ontbrekende gebeurtenissen aan en werkt de bestaande bij.'],
    ],
    tips: ['Tussen twee items staat hoeveel tijd er verstrijkt; als je er met de muis overheen gaat, zie je de details.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Om jezelf niet tegen te spreken: onmogelijkheden die kunnen worden opgespoord, wie wat weet en hoe elk element verandert.',
    parts: [
      ['Controles', 'Legt datums en locaties van de scènes, aanwezige personages, geboorten en overlijdens, veranderingen en geheimen naast elkaar. Meldt bijvoorbeeld iemand die op twee plekken tegelijk is.'],
      ['Onmogelijk of na te kijken', 'Wat niet kan, verschijnt als “Onmogelijk”; wat opzettelijk kan zijn, als “Na te kijken”. Elke melding kun je negeren.'],
      ['Wie weet wat', 'De geheimen van de roman, één per rij, en in welke scène elk personage en de lezer ze te weten komen. Ze worden gesorteerd op hun eerste onthulling (op datum of in leesvolgorde), en het zoekveld vindt ze op titel, inhoud, persoon of scène. Druk op een rij om de details te zien.'],
      ['Verloop', 'Loopt het boek door terwijl het één element volgt: waar het voorkomt en hoe het verandert.'],
    ],
    tips: ['Veranderingen en onthullingen noteer je op de kaart van elke scène, blok “Continuïteit”.', 'Hoe meer je invult (datums, locaties, geboorten), hoe meer er wordt gevonden.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Metingen van het manuscript en van de manier waarop je het schrijft.',
    parts: [
      ['Mijn schrijven', 'Woorden per dag, reeksen, sessies en een prognose van het einde.'],
      ['Het boek', 'Lengte van hoofdstukken en scènes, verhouding tussen dialoog en vertelling, en herhalingen.'],
      ['Stijl', 'Bijwoorden op -mente, herhalingen dicht bij elkaar, stopwoorden en lange zinnen, per hoofdstuk; laat zien waar het meeste staat. Volgt de regels van de taal van de roman.'],
      ['Verhaalgrafiek', 'Een rij per element en een kolom per scène: wie te lang uit beeld verdwijnt en welke verhaallijnen elkaar niet kruisen.'],
      ['Verdeling en optredens', 'In hoeveel scènes van elk hoofdstuk elk element voorkomt, en de lijst met scènes van een personage.'],
    ],
    tips: ['Het “?” bij elke kolom legt uit wat die meet.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Zoeken (en vervangen) in het hele project.',
    parts: [
      ['Waar het zoekt', 'Vink de onderdelen aan: tekst van de scènes, titels, personages, wereld, opzet en notities, documentatie en taken.'],
      ['Opties', 'Hoofdlettergevoelig zoeken en alleen op hele woorden zoeken.'],
      ['Vervangen', 'Wijzigt de tekst in alles wat is aangevinkt, nadat je hebt gezien op hoeveel plekken. Handig om een personage een andere naam te geven.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Zet de roman of het werkmateriaal in een bestand.',
    parts: [
      ['Wat exporteren', 'De roman of het dossier (opzet, personages, locaties en de andere kaarten).'],
      ['Soorten export', 'Manuscript om in te sturen, gedrukt boek (met een schatting van pagina’s en rugdikte), e-book (EPUB) of vrije opmaak.'],
      ['Bestandsindelingen', 'Word, EPUB, webpagina of PDF, en tekst.'],
      ['Gegevens en pagina’s van het boek', 'De titelpagina, de gegevens van het e-book, de omslag en het voor- en nawerk komen uit “Boek”.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Wat je verwijdert, is niet meteen weg: het komt hier terecht.',
    parts: [
      ['Terugzetten', 'Zet een element terug op zijn plek, met alles wat eronder hing.'],
      ['Bewaartermijn', 'Na het aantal dagen dat je in Instellingen kiest (tussen 1 en 60), wordt het definitief verwijderd.'],
    ],
    guide: 'data#trash',
  },
};
