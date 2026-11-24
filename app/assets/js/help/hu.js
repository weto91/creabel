// Az egyes oldalak részletes súgója (hu): ez jelenik meg a „?” megnyomásakor. Minden bejegyzésben
// van egy bevezető mondat, részek [cím, szöveg], tippek, és az alkalmazás útmutatójának az a
// fejezete, amely bővebben elmagyarázza. Az itt nem szereplő oldalak csak a rövid mondatukat
// mutatják (help.<oldal> az i18n/hu.js fájlban).
export default {
  home: {
    intro: 'Amit belépéskor érdemes látni: hol folytasd, hogy állsz, mennyi van még hátra, és mit kell átnézni.',
    parts: [
      ['Hol folytasd', 'Az utolsó jelenet, amelyen dolgoztál, és a következő megírandó, közvetlen eléréssel. Az „Írás folytatása” az előbbit nyitja meg. Új projektben itt találod az első lépéseket.'],
      ['Négy szám', 'A kézirat a kitűzött szószámhoz képest, a mai szószám a napi adaghoz képest, az egymást követő írós napok sorozata és a leadásig hátralévő napok, a szükséges és a jelenlegi tempóval.'],
      ['Tempó és állapot', 'Az elmúlt 30 nap egyes napjainak szószáma, és hogy hány adatlap, fejezet és jelenet van elkezdetlen, folyamatban lévő vagy kész állapotban.'],
      ['Átnézendő', 'A legutóbbi nyitott teendők és a figyelmeztetések: a Folytonosság lehetetlenségei és figyelmeztetései, a dátum nélküli és a cselekményszál nélküli jelenetek.'],
    ],
    tips: ['A célokat a „Könyv → Célok” részben állíthatod be. Nélkülük a számok csak a meglévő állapotot mutatják.', 'Ha a „Könyv” oldalon megadtál borítót vagy egymondatos bemutatást, ezek az első blokkban jelennek meg; kattints a borítóra, hogy nagyban lásd.', 'Számítógépen kattints jobb gombbal bármelyik hivatkozásra → „Megnyitás új ablakban”: például egy szereplő adatlapját az éppen írt jelenet mellett.', 'Mobilon, ha kilépsz egy jelenetből, hogy utánanézz valaminek, a fent látható ↩ gomb visszavisz oda.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'A történet alapjai: mit mesélsz el, milyen világban, és milyen szálakon halad előre.',
    parts: [
      ['Premissza', 'Az ötlet egy-két mondatban: ki mit akar, és mi akadályozza ebben.'],
      ['Fabula, háttér és jegyzetek', 'Az események időrendben, a kor és a hely, valamint az egész regényre vonatkozó feljegyzések. Kattints az egyes blokkokra a megírásukhoz.'],
      ['Cselekményszálak', 'Soronként egy elbeszélői szál, súlyuk szerint csoportosítva: fő cselekményszálak, mellékszálak és háttérszálak. A besorolást az egyes szálak adatlapján adhatod meg.'],
      ['Az egyes szálak útja', 'A sávban a könyv minden jelenetének egy vonás felel meg, olvasási sorrendben; a színesek az adott szálhoz tartoznak. Látszik, hol kezdődik, hol tűnik el, és eljut-e a végéig.'],
    ],
    tips: [
      'A jeleneteket a jelenet adatlapján, a „Cselekményszálak és tárgyak” blokkban rendelheted cselekményszálhoz.',
      'A „cselekményszál nélküli jelenetek” figyelmeztetés olyan jeleneteket jelez, amelyek talán semmit sem visznek előre.',
      'Az „Elolvasás egyben” folyamatosan, egyetlen dokumentumként mutatja a felépítést.',
      'A „Cselekményszál hozzáadása” melletti „Importálás / exportálás” Excel, CSV, Word, szöveges vagy JSON formátumba viszi ki a szálakat, és vissza is hozza őket.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'A projekt különálló feljegyzései: ötletek, szövegrészletek, emlékeztetők.',
    parts: [
      ['Címkék', 'Minden jegyzetnek több címkéje is lehet. Itt címkék szerint csoportosulnak, és a két címkével ellátott jegyzet mindkét blokkban megjelenik.'],
      ['Szín', 'Nyolc szín, hogy egy pillantással megkülönböztesd őket. A „Rendezés: Szín” így csoportosítja őket.'],
      ['Csatolások', 'Egy jegyzet csatolható szereplőkhöz, helyszínekhez, tárgyakhoz, csoportokhoz, saját adatlapokhoz, cselekményszálakhoz, fejezetekhez és jelenetekhez. Ilyenkor mindegyik adatlapján megjelenik.'],
      ['Rendezés és karbantartás', 'Az egyes blokkokon belül húzással rendezheted át őket. Egy címke ⋯ menüjével átnevezheted, vagy az összes jegyzetéről eltávolíthatod.'],
    ],
    tips: ['A háttéranyaghoz (linkek, alaprajzok, cikkek) jobb a Forrásanyag, az átnézendő dolgokhoz a Teendők.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'A regény háttéranyaga: linkek, cikkek, képek, térképek, alaprajzok és dokumentumok.',
    parts: [
      ['Források', 'Mindegyiknek van típusa, nem kötelező webcíme, szövege és csatolt fájljai (képek, SVG vagy PDF).'],
      ['Csatolások', 'Egy forrást jelenetekhez, fejezetekhez vagy adatlapokhoz csatolhatsz, és ott meg is jelenik: így kéznél van, amíg azt a jelenetet írod.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Azok adatlapjai, akik a történetet élik.',
    parts: [
      ['Fő- és mellékszereplők', 'A főszereplőknek részekre bontott interjújuk van (személyes adatok, külső, lélektan, konfliktus, fejlődés…), a mellékszereplőknek szabad leírásuk. Az adatlapon az egyik a másikká alakítható.'],
      ['Felismerés a szövegben', 'Ha a szereplőket írás előtt hozod létre, a jelenetek felismerik őket a nevükről és a más nevükről, és maguktól megjelölik őket.'],
      ['Dátumok és életkor', 'Ha az adatlapon megadod a születési dátumot, minden dátummal ellátott jelenet mutatja a szereplő életkorát.'],
      ['Kapcsolatok', 'Ha valamelyik szereplőnek van rajzolt kapcsolata a „Kapcsolatok” oldalon, itt megjelenik egy fül, amely az összeset egyesíti.'],
    ],
    tips: ['Az „Importálás / exportálás” Excel, CSV, Word, szöveges vagy JSON formátumba viszi ki a listát, és vissza is hozza. Minden adatlap teljes egészében kerül bele: alapadatok, szöveg, jellemzők, események, a jelenetek, amelyekben szerepel, és a kapcsolatok.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Egy főszereplő adatlapja: részekre bontott interjú, amely segít megismerni.',
    parts: [
      ['Részek', 'Minden részre válaszolhatsz kérdésről kérdésre vagy szabad szövegként. Az állapota (nincs elkezdve, folyamatban, kész) megmutatja, mi van még hátra.'],
      ['Jellemzők', 'Maguktól kinyerődnek abból, amit írsz (életkor, haj, szem…), hogy ne mondj ellent önmagadnak; a sajátjaidat is hozzáadhatod.'],
      ['Szerep, más nevek és dátumok', 'A szerepe a történetben, a további megnevezései (hogy a szöveg felismerje), valamint a születése és a halála.'],
      ['Kapcsolatok', 'Kapcsolatonként egy pár: mindkettőjük fényképe alatt az, ami ő a másik számára („Repülésirányító” / „Parancsnok”). Ha csak az egyiket írod be, mindkettőre érvényes („Kollégák”). Egyetlen lista, akár itt, akár a másik adatlapján jegyezted fel a kapcsolatot, akár egy térképre rajzoltad; ha módosítod vagy eltávolítod, mindenhol frissül.'],
      ['Képek, események és előfordulások', 'Referenciafotók, dátummal ellátott tények az idővonalhoz, és a jelenetek, amelyekben szerepel.'],
    ],
    tips: [
      'Ha a halála után is szerepel (a holtteste, egy emlék, egy kísértet), jelöld be a halál dátuma alatti jelölőnégyzetet, és a Folytonosság nem fog figyelmeztetni.',
      'A ⋯ menüvel exportálhatod az adatlapot, vagy adatokat importálhatsz bele.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'A regény színterei, a legnagyobbtól a legkisebbig.',
    parts: [
      ['Lista', 'Az összes helyszín adatlapja, húzással átrendezhetők.'],
      ['Fa', 'Melyik helyszín melyiken belül van: a terem a fedélzeten, a fedélzet a hajón. Ami egy helyszínen történik, az az azt tartalmazó helyszínekre is számít.'],
      ['Térképek', 'Feltöltesz egy alaprajzot vagy térképet (képet vagy SVG-t), és jelölőkkel elhelyezed rajta a helyszíneidet.'],
      ['Kapcsolatok', 'Akkor jelenik meg, ha valamelyik helyszínnek van rajzolt kapcsolata a „Kapcsolatok” oldalon.'],
    ],
    tips: ['A fában az egyes sorok ⋯ menüjével másik helyszínen belülre helyezheted az adott helyszínt, vagy belső helyszíneket adhatsz hozzá.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Egy helyszín adatlapja.',
    parts: [
      ['Hol van', 'Ország, régió és város, valamint az „Ezen belül”: a helyszín, amely tartalmazza. A „Tartalmazza” felsorolja a benne lévőket.'],
      ['Leírás és kérdések', 'A szabad szöveg és azok a saját kérdések, amelyeket az összes helyszínre meghatároztál.'],
      ['Előfordulások', 'Azok a jelenetek, amelyek itt vagy a benne lévő helyszínek valamelyikén játszódnak.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Az általad meghatározott típusok adatlapjai: hajók, technológiák, lények, szervezetek…',
    parts: [
      ['Típusok', 'A „Típus hozzáadása” létrehoz egy típust a nevével, ikonjával és mezőivel. Minden típus egy fül.'],
      ['Adatlapok', 'A típusuk mezőivel rendelkeznek, ezenkívül leírásuk, képeik és azonosítójuk is van.'],
      ['Mint bármely más elem', 'Megjelölhetők a jelenetekben („Cselekményszálak és tárgyak” blokk), megjelennek az idővonalon és a keresőben, és a Folytonosság is számol velük.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Hogyan kapcsolódnak egymáshoz a regény elemei: amit te rajzolsz, és ami magától adódik.',
    parts: [
      ['Saját térképeim', 'Több is lehet: a család, a legénység, a frakciók. Mindegyik egy-egy vászon.'],
      ['Elemek és nyilak', 'Egy térképre adatlapokat (vagy szabad szövegeket) teszel, és kettőt feliratos nyíllal kötsz össze: „anyja”, „ellensége”, „neki dolgozik”.'],
      ['Automatikus', 'Tíz ábra, amely magától születik abból, amit már feljegyeztél: kik szerepelnek együtt, kinél van az egyes tárgy, ki tudja az egyes titkokat, mit köt össze egy esemény, szereplők és helyszínek, szereplők és cselekményszálak, helyváltoztatások, csoportok, helyszínek helyszíneken belül és kapcsolatok (az adatlapokon és térképeken feljegyzett összes kapcsolat, valamint a belőlük következő testvérek és nagyszülők). Nem mentődnek: megnyitáskor újraszámolódnak.'],
      ['Minden együtt', 'Egy átfogó ábra a sajátjaiddal (folytonos vonal) és az automatikusakkal (szaggatott vonal, mindegyik a saját színével), jelölőnégyzetekkel, hogy kiválaszd, melyek látszódjanak.'],
      ['Egy ábra olvasása', 'Minél vastagabb a vonal, annál többször fordul elő a kapcsolat. Vidd az egeret egy elem fölé, vagy kattints rá a rögzítéséhez, és a feliratukkal együtt kiemelődnek a kapcsolatai. Alatta található a lista.'],
      ['Az adatlapokon', 'A Szereplők és a Helyszínek oldalon van egy „Kapcsolatok” fül, amely az összes térképed kapcsolatait egyesíti.'],
    ],
    tips: ['A „Kapcsolatok exportálása” Word, szöveges, Excel, CSV vagy JSON formátumba viszi ki őket.', 'Ha két szereplő között „anya”, „apa” vagy „fia” feliratú nyíl van, a Folytonosság ennek alapján a születési dátumukat is ellenőrzi.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'A regény szerkezete: részek, fejezetek, prológus és epilógus.',
    parts: [
      ['A lista', 'Minden fejezet a jeleneteivel, szószámával, olvasási idejével, állapotával, a legtöbbet szereplő szereplőkkel, és egy színes négyzettel minden cselekményszálhoz, amelyet érint. Fent a könyv összesítése.'],
      ['Olvasási idő', 'Hozzávetőleges, percenként nagyjából 250 szóval számolva. Az egyes fejezeteken belül a jelenetek olvasási ideje is látszik.'],
      ['A cselekményszálak', 'Vidd az egeret egy négyzet fölé (vagy érintőképernyőn tartsd rajta az ujjad), hogy lásd a szál nevét, típusát és leírását.'],
      ['Átrendezés', 'Húzd a sorokat, vagy használd az Alt+↑/↓ billentyűket vagy az egyes sorok ⋯ menüjét.'],
      ['Más nézetek', 'A „Tábla” kártyákként mutatja a jeleneteket, hogy fejezetek között mozgathasd őket; a „Vázlat” mindent egy fában.'],
    ],
    tips: ['A „Szerkezet” menüben részeket, prológust vagy epilógust adhatsz hozzá, Word-piszkozatot importálhatsz, és felismertetheted az említéseket az összes jelenetben.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Egy fejezet: a jelenetei és a jegyzetei.',
    parts: [
      ['Jelenetek', 'Itt hozhatod létre őket, húzással átrendezheted, és a ⋯ menüjükből másik fejezetbe helyezheted őket. Mindegyik címe alatt: mikor játszódik és meddig tart, ki az elbeszélő, és egy színes négyzet minden helyszínhez (vidd fölé az egeret, vagy tartsd rajta az ujjad, hogy lásd, melyik az).'],
      ['Cél és jegyzetek', 'Mire szolgál a fejezet a regényben, és amire írás közben emlékezni szeretnél.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Itt folyik az írás. Balra a szöveg, jobbra a jelenet adatlapja.',
    parts: [
      ['A szöveg', 'Magától mentődik. A sávon formázás, párbeszédjel és idézőjelek, keresés és csere, valamint teendő jelölése a kijelölt szövegen.'],
      ['Az adatlap', 'Összecsukható blokkokban: ki szerepel és ki az elbeszélő, hol és mikor, események, cselekményszálak és tárgyak, folytonosság, teendők, forrásanyag és változatok.'],
      ['Események', 'Az „Események” blokk a jelenethez kapcsolódó tényeket mutatja: amelyek benne történnek (átveszik a dátumát), és amelyeket benne mesélnek el (egy emlék: megtartják a sajátjukat). Összecsukva felsorolja őket; kinyitva mindegyiknél megadja a dátumot, a leírást, hogy kit érint, és hogy mely más jelenetekben szerepel.'],
      ['Automatikus felismerés', 'Amit a szövegben megnevezel (szereplők, helyszínek, tárgyak, csoportok), az magától megjelölődik, az „auto” szóval. Ha eltávolítod, nem kerül vissza.'],
      ['Változatok', 'A jelenet szövegének változatai. Átírás előtt létrehozhatsz egy újat, összehasonlíthatod őket, és visszatérhetsz egy korábbihoz.'],
      ['Eszközök', 'A sávon: osztott nézet (egy adatlap vagy egy másik jelenet mellette), stílusellenőrzés, felolvasás és zavarmentes mód.'],
      ['Folytonosság', 'Itt jegyezheted fel, minek változik meg az állapota („megsebesült a karján”, „a kulcs Alexhez kerül”), és melyik titok derül ki, kinek.'],
    ],
    tips: ['A Ctrl+S azonnal ment; a Ctrl+F keres; az Esc kilép a zavarmentes módból.', 'A jelenet dátuma elhelyezi az idővonalon, és lehetővé teszi az életkorok kiszámítását és a lehetetlenségek felismerését.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'A jelenetek kártyákként, hogy egy pillantással lásd a regényt, és átrendezhesd.',
    parts: [
      ['Oszlopok és kártyák', 'Minden fejezet egy oszlop (soronként négy), és minden jelenet egy kártya az összefoglalójával, az elbeszélővel, a helyszínnel és az időponttal.'],
      ['Összefoglaló', 'Kattints egy kártya szövegére, és írd le, miről szól a jelenet.'],
      ['Mozgatás', 'Húzz el egy kártyát, hogy áthelyezd máshová vagy másik fejezetbe. Érintőképernyőn használd a ⋯ menüjét.'],
      ['Cselekményszálak', 'A színes csíkok a jelenet cselekményszálai; a fenti jelmagyarázat megmondja, melyik melyik.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Minden, ami a regényt könyvként írja le.',
    parts: [
      ['A könyv adatai', 'Cím és nyelv (kötelező), valamint szerző, sorozat, sorszám, megjelenés dátuma, kiadó, borító és szinopszis (nem kötelező). A címoldalon és az e-könyv adatai között jelennek meg.'],
      ['Célok', 'Szószám-cél, napi adag, határidő és szószám fejezetenként. A kezdőlapon követheted őket.'],
      ['A könyv oldalai', 'Impresszum, ajánlás, mottó, köszönetnyilvánítás és „A szerzőről” a fényképével. Exportáláskor kerülnek bele.'],
      ['Projekt', 'Biztonsági mentés (egy .zip fájl az összes adattal, a képekkel és dokumentumokkal, valamint a könyvvel és az adatlapokkal Word formátumban), folytatás létrehozása (megtartja a világot, fejezetek nélkül indul) és a projekt törlése. A mentést a „Projektjeid” oldalon a „Mentés importálása” gombbal állíthatod vissza.'],
    ],
    tips: ['Szerző nélkül a könyv „Névtelen” szerzővel exportálódik.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Ami még átnézésre vár, egy helyen.',
    parts: [
      ['Honnan jönnek', 'Egy jelenet szövegén elhelyezett jelölésből, vagy önállóan, egy adatlaphoz vagy a projekthez kötve.'],
      ['Típusok és állapot', 'Minden teendőnek van típusa (átnézés, ellenőrzés, utánajárás…), és ha megoldottad, megjelölheted megoldottként.'],
      ['Ugrás a helyére', 'A szövegen megjelölt teendőből a jelenet pontos mondatához ugorhatsz.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Az események sorrendben: a dátummal ellátott jelenetek és a világ eseményei.',
    parts: [
      ['Mi jelenik meg', 'Egy jelenet akkor jelenik meg, ha az adatlapján dátumot adsz neki. Eseményt itt vagy egy elem adatlapján hozhatsz létre; lehet általános, vagy tartozhat egy vagy több elemhez.'],
      ['Események és jelenetek', 'Egy eseményt azokhoz a jelenetekhez csatolhatsz, amelyekben megtörténik (átveszi a dátumukat, és bennük jelenik meg), vagy amelyekben csak elmesélik (megtartja a sajátját). Ha egy csatolatlan esemény dátuma és időpontja egybeesik egy jelenetével, egy figyelmeztetés felajánlja, hogy csatold őket.'],
      ['Két sorrend', 'Az „Időrendi” dátum szerint rendez; az „Olvasási” úgy, mint a könyvben, hogy lásd, hol ugrik vissza az elbeszélés.'],
      ['A könyv eleje és vége', 'Két jelölés mutatja az első és az utolsó jelenetet, amelyet az olvasó olvas: ami előttük van, az a regény előtti múlt.'],
      ['Követés és szűrők', 'A „Követés” egyetlen elemre szűkíti az idővonalat; a jelölőnégyzetekkel bejegyzéstípusokat rejthetsz el.'],
      ['Kereső', 'Szöveg, dátum vagy azonosító szerint. Az „a & b” mindkettőt megköveteli; az „a | b” az egyiket. A mellette lévő „?” példákat mutat.'],
      ['Importálás és exportálás', 'CSV, JSON, Excel vagy Word formátumba és vissza: létrehozza a hiányzó eseményeket, és frissíti a meglévőket.'],
    ],
    tips: ['Két bejegyzés között látszik az eltelt idő; ha fölé viszed az egeret, részletezve is megjelenik.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Hogy ne mondj ellent önmagadnak: felismerhető lehetetlenségek, ki mit tud, és hogyan változnak az egyes elemek.',
    parts: [
      ['Ellenőrzések', 'Összeveti a jelenetek dátumait és helyszíneit, a jelen lévő szereplőket, a születéseket és haláleseteket, az állapotokat és a titkokat. Figyelmeztet például, ha valaki egyszerre két helyen van.'],
      ['Lehetetlen vagy átnézendő', 'Ami nem lehetséges, „Lehetetlen” jelölést kap; ami lehet szándékos, „Átnézendő” jelölést. Bármelyik figyelmeztetést figyelmen kívül hagyhatod.'],
      ['Ki mit tud', 'A regény titkai, soronként egy, és hogy melyik jelenetben tudja meg őket az egyes szereplők és az olvasó. Az első felfedésük szerint rendeződnek (dátum vagy olvasási sorrend szerint), a kereső pedig cím, tartalom, személy vagy jelenet szerint keres. Kattints egy sorra a részletekért.'],
      ['Nyomon követés', 'Egy elemet követve járja végig a könyvet: hol szerepel, és hogyan változik az állapota.'],
    ],
    tips: ['Az állapotokat és a felfedéseket az egyes jelenetek adatlapján, a „Folytonosság” blokkban jegyezheted fel.', 'Minél többet töltesz ki (dátumok, helyszínek, születések), annál többet talál.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'A kézirat és az írási módod mérőszámai.',
    parts: [
      ['Az írásom', 'Napi szószám, sorozatok, írási alkalmak és a befejezés előrejelzése.'],
      ['A könyv', 'A fejezetek és jelenetek hossza, a párbeszéd és az elbeszélés aránya, valamint az ismétlések.'],
      ['Stílus', '-mente végű határozószók, közeli ismétlések, töltelékszavak és hosszú mondatok fejezetenként; kiemeli, hol van belőlük a legtöbb. A regény nyelvének szabályait követi.'],
      ['Narratív diagram', 'Elemenként egy sor és jelenetenként egy oszlop: ki tűnik el túl hosszú időre, és mely cselekményszálak nem keresztezik egymást.'],
      ['Eloszlás és előfordulások', 'Az egyes elemek a fejezetek hány jelenetében szerepelnek, és egy szereplő jeleneteinek listája.'],
    ],
    tips: ['Az egyes oszlopok melletti „?” elmagyarázza, mit mér.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Keresés (és csere) az egész projektben.',
    parts: [
      ['Hol keres', 'Jelöld be a területeket: a jelenetek szövege, címek, szereplők, világ, felépítés és jegyzetek, forrásanyag és teendők.'],
      ['Beállítások', 'Kis- és nagybetű megkülönböztetése, és csak teljes szavak keresése.'],
      ['Csere', 'Lecseréli a szöveget mindenhol, ami be van jelölve, miután megmondta, hány helyen. Hasznos egy szereplő átnevezéséhez.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'A regény vagy a munkaanyag kivitele egy fájlba.',
    parts: [
      ['Mit exportálsz', 'A regényt vagy a dossziét (felépítés, szereplők, helyszínek és a többi adatlap).'],
      ['Az exportálás típusai', 'Beküldhető kézirat, nyomtatott könyv (oldalszám- és gerincbecsléssel), e-könyv (EPUB) vagy szabad formátum.'],
      ['Formátumok', 'Word, EPUB, weboldal vagy PDF, és szöveg.'],
      ['A könyv adatai és oldalai', 'A címoldal, az e-könyv adatai, a borító, valamint a kezdő és záró oldalak a „Könyv” oldalról származnak.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Amit törölsz, nem vész el azonnal: ide kerül.',
    parts: [
      ['Visszaállítás', 'Visszateszi az elemet a helyére azzal együtt, ami hozzá tartozott.'],
      ['Megőrzési idő', 'A Beállításokban megadott napok (1 és 60 között) elteltével véglegesen törlődik.'],
    ],
    guide: 'data#trash',
  },
};
