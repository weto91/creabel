// Magyar jellemzőlap: a kulcsszavak, amelyek alapján a szövegből jellemzők nyerhetők ki.
// Szabadon bővíthető: elég szavakat adni a listákhoz.
const adjectives = {
  color: ['kék', 'zöld', 'barna', 'gesztenyebarna', 'mogyoróbarna', 'fekete', 'hollófekete', 'koromfekete', 'szőke', 'aranyszőke',
    'búzaszőke', 'platinaszőke', 'vörös', 'rőt', 'vöröses', 'rézvörös', 'piros', 'szürke', 'szürkés', 'fehér', 'ősz', 'őszes', 'deres',
    'ezüstös', 'aranyló', 'sötét', 'világos', 'sápadt', 'fakó', 'mézszínű', 'borostyánszínű', 'ibolyakék', 'acélkék', 'égszínkék',
    'olajbarna', 'napbarnított', 'barnás', 'rózsás', 'pirospozsgás', 'kreol'],
  hair: ['egyenes', 'sima', 'göndör', 'hullámos', 'bodros', 'kócos', 'borzas', 'fonott', 'copfos', 'borotvált', 'nyírt', 'selymes',
    'zsíros', 'ritkás', 'ritka', 'vékony', 'finom', 'sűrű', 'dús', 'vastag', 'összefogott', 'kibontott', 'laza', 'gubancos',
    'zilált', 'fésületlen', 'tüskés', 'csapzott', 'lágy', 'rakoncátlan'],
  length: ['hosszú', 'rövid', 'félhosszú', 'hosszúkás'],
  size: ['nagy', 'kicsi', 'kis', 'kicsiny', 'apró', 'pici', 'hatalmas', 'óriási', 'széles', 'keskeny', 'vékony', 'vastag', 'kerek'],
  eyes: ['mandulavágású', 'ferde', 'beesett', 'kidülledő', 'dülledt', 'csillogó', 'ragyogó', 'élénk', 'fénytelen', 'bágyadt', 'szomorú',
    'átható', 'szúrós', 'álmodozó', 'ábrándos', 'fáradt', 'nyugtalan', 'hideg', 'meleg', 'vizenyős'],
  skin: ['puha', 'sima', 'durva', 'érdes', 'ráncos', 'feszes', 'cserzett', 'napcserzett', 'szeplős', 'bársonyos', 'hamvas',
    'pattanásos', 'finom', 'barázdált', 'szőrtelen', 'selymes'],
  nose: ['horgas', 'pisze', 'fitos', 'egyenes', 'kampós', 'hegyes', 'ferde', 'görbe', 'kiálló', 'tömpe', 'lapos'],
  lips: ['telt', 'húsos', 'vékony', 'keskeny', 'cserepes', 'duzzadt'],
  face: ['hosszúkás', 'ovális', 'szögletes', 'éles', 'csontos', 'beesett', 'sovány', 'kerek', 'gyerekes', 'kisfiús', 'cserzett',
    'szeplős', 'ráncos', 'nyúzott', 'markáns', 'borostás'],
  hands: ['erős', 'finom', 'kérges', 'bütykös', 'csontos', 'inas', 'izmos', 'vékony', 'karcsú', 'durva', 'ápolt', 'puha', 'erőteljes'],
  shoulders: ['csapott', 'görnyedt', 'hajlott', 'egyenes', 'erős'],
  voice: ['mély', 'magas', 'rekedt', 'rekedtes', 'lágy', 'édes', 'éles', 'visító', 'csengő', 'dallamos', 'orrhangú', 'érces', 'fátyolos',
    'határozott', 'megtört', 'nyugodt', 'bársonyos', 'erőteljes', 'gyenge', 'halk', 'harsány', 'recsegő', 'öblös', 'karcos', 'búgó'],
  density: ['bozontos', 'dús', 'sűrű', 'ritkás', 'ritka', 'vastag', 'gondozott', 'nyírt', 'ápolt', 'ápolatlan', 'elhanyagolt', 'finom',
    'vékony', 'rendezett', 'tömött'],
  smile: ['őszinte', 'félénk', 'szégyenlős', 'ferde', 'féloldalas', 'széles', 'szomorú', 'gúnyos', 'meleg', 'kényszeredett',
    'erőltetett', 'huncut', 'kaján', 'bájos', 'sugárzó', 'ragyogó', 'kedves'],
};

export default {
  // A magyarban a jelző a főnév előtt áll, és nem egyezik vele („kék szem”, „hosszú hajú”).
  // A főnév utáni melléknevek csak állítmányként számítanak („A haja hosszú és fekete volt.”).
  // Jelen időben nincs létige, ezért itt „létigének” számít minden szó, amely a főnév után
  // állítmányt vezet be: a „volt”, „van” stb., néhány fokozó szó és maguk a melléknevek is.
  // Így a „Hosszú haja, kék szeme” felsorolásban a „kék” nem kerül a hajhoz. (Az első elem a
  // „volt”: ezt teszi a rendszer a kérdésre adott rövid válaszok elé, pl. „haja volt barna”.)
  prenominal: true,
  copulas: ['volt', 'van', 'voltak', 'vannak', 'lett', 'lettek', 'tűnt', 'látszott', 'maradt', 'is', 'nagyon', 'egészen', 'kissé',
    'kicsit', 'elég', 'eléggé', 'meglehetősen', 'feltűnően', 'rendkívül', 'szinte', 'enyhén', 'inkább', 'még', 'már', 'mindig',
    ...Object.values(adjectives).flat()],

  // A főneveket a leírásokban gyakori alakjukkal együtt kell felsorolni: alapalak, birtokos
  // („haja”), többes szám („szemei”) és a melléknévi -ú/-ű alak („kék szemű”, „hosszú hajú”).
  // Néhány alapalak szándékosan hiányzik, mert ékezet nélkül más szóval esik egybe:
  // bőr/bor, kar/kár, váll/vall, hát/hat.
  features: [
    { nouns: ['szem', 'szeme', 'szemei', 'szemek', 'szemű', 'tekintet', 'tekintete', 'tekintetű'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['haj', 'haja', 'hajú', 'hajzat', 'hajzata', 'fürtök', 'fürtjei', 'tincsek', 'tincsei', 'sörény', 'sörénye'], groups: ['color', 'hair', 'length'] },
    { nouns: ['bőre', 'bőrű', 'arcbőr', 'arcbőre', 'arcszín', 'arcszíne', 'arcszínű', 'bőrszín', 'bőrszíne', 'bőrszínű'], groups: ['color', 'skin'] },
    { nouns: ['szakáll', 'szakálla', 'szakállú', 'szakállas', 'borosta', 'borostája'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['bajusz', 'bajsza', 'bajusza', 'bajszú', 'bajuszos'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['orr', 'orra', 'orrú'], groups: ['size', 'nose'] },
    { nouns: ['sasorr', 'sasorra', 'sasorrú'], groups: ['size'], presence: true },
    { nouns: ['ajak', 'ajka', 'ajkak', 'ajkai', 'ajkú', 'száj', 'szája', 'szájú'], groups: ['size', 'lips', 'color'] },
    { nouns: ['arc', 'arca', 'arcú', 'vonások', 'vonásai', 'vonású', 'arcvonások', 'arcvonásai', 'ábrázat', 'ábrázata'], groups: ['face', 'size'] },
    { nouns: ['kéz', 'keze', 'kezek', 'kezei', 'kezű', 'ujjak', 'ujjai', 'ujjú'], groups: ['size', 'hands', 'length'] },
    { nouns: ['hang', 'hangja', 'hangú'], groups: ['voice'] },
    { nouns: ['szemöldök', 'szemöldöke', 'szemöldökei', 'szemöldökű'], groups: ['color', 'density', 'size'] },
    { nouns: ['válla', 'vállai', 'vállak', 'vállú', 'háta', 'hátú'], groups: ['size', 'shoulders'] },
    { nouns: ['láb', 'lába', 'lábai', 'lábak', 'lábú', 'karja', 'karjai', 'karok', 'karú'], groups: ['length', 'size', 'hands'] },
    { nouns: ['mosoly', 'mosolya', 'mosolyú'], groups: ['smile', 'size'] },
    { nouns: ['szemüveg', 'szemüvege', 'szemüveges', 'pápaszem', 'pápaszemes'], groups: ['size'], presence: true },
    { nouns: ['szeplő', 'szeplők', 'szeplői'], groups: [], presence: true },
    { nouns: ['sebhely', 'sebhelye', 'sebhelyek', 'sebhelyes', 'heg', 'hege', 'hegek', 'forradás', 'forradása'], groups: ['size'], presence: true },
    { nouns: ['tetoválás', 'tetoválása', 'tetoválások', 'tetoválásai', 'tetovált'], groups: ['size'], presence: true },
    { nouns: ['anyajegy', 'anyajegye', 'anyajegyek', 'anyajegyei', 'szemölcs', 'szemölcse'], groups: [], presence: true },
    { nouns: ['ráncok', 'ráncai'], groups: [], presence: true },
    { nouns: ['bicegés', 'bicegése', 'sántítás', 'sántikálás'], groups: [], presence: true },
  ],

  adjectives,

  // Önmagukban is jellemzőt jelentő szavak („magas és félénk”).
  standalone: [
    // Testalkat
    'magas', 'alacsony', 'vékony', 'sovány', 'karcsú', 'kövér', 'elhízott', 'testes', 'termetes', 'robusztus', 'zömök', 'izmos',
    'atletikus', 'atlétikus', 'nyúlánk', 'tagbaszakadt', 'köpcös', 'pocakos', 'cingár', 'vézna', 'nyurga', 'molett', 'görnyedt',
    'hórihorgas', 'törékeny',
    // Külső
    'vonzó', 'jóképű', 'szép', 'gyönyörű', 'csinos', 'csúnya', 'elegáns', 'ápolatlan', 'ápolt', 'kopasz', 'szeplős', 'borostás',
    'szőke', 'őszülő', 'sápadt', 'napbarnított',
    // Életkor
    'fiatal', 'idős', 'öreg', 'kamasz', 'tinédzser', 'középkorú', 'éltes',
    // Jellem
    'félénk', 'bátor', 'gyáva', 'nagylelkű', 'önző', 'intelligens', 'okos', 'ravasz', 'naiv', 'büszke', 'alázatos', 'szerény',
    'kedves', 'kegyetlen', 'hűséges', 'bizalmatlan', 'becsvágyó', 'ambiciózus', 'lusta', 'szorgalmas', 'dolgos', 'lobbanékony',
    'impulzív', 'türelmes', 'türelmetlen', 'vidám', 'melankolikus', 'magányos', 'társaságkedvelő', 'introvertált', 'extrovertált',
    'zárkózott', 'optimista', 'pesszimista', 'makacs', 'csökönyös', 'féltékeny', 'kíváncsi', 'tartózkodó', 'arrogáns', 'érzékeny',
    'gyengéd', 'szeretetteljes', 'erőszakos', 'nyugodt', 'ideges', 'becsületes', 'őszinte', 'hazug', 'szarkasztikus', 'jószívű',
    'haragtartó', 'vakmerő', 'óvatos', 'megfontolt', 'beszédes', 'bőbeszédű', 'hallgatag', 'csendes', 'módszeres', 'babonás',
    'vallásos', 'ateista', 'lázadó', 'engedelmes', 'hiú', 'bizonytalan', 'manipulatív', 'mogorva', 'goromba', 'szelíd', 'flegma',
    // Állapot
    'balkezes', 'sánta', 'vak', 'süket', 'néma', 'félszemű', 'félkarú', 'nagyothalló', 'béna',
  ],

  // Szavak, amelyek a főnév és a melléknevei között állhatnak anélkül, hogy megtörnék a leírást
  // („a haja hosszú és fekete volt”).
  fillers: ['a', 'az', 'egy', 'és', 'meg', 'vagy', 'is', 'van', 'vannak', 'volt', 'voltak', 'lett', 'lettek', 'nagyon', 'elég',
    'eléggé', 'kissé', 'kicsit', 'olyan', 'annyira', 'szinte', 'majdnem', 'mindig', 'inkább', 'meglehetősen', 'egészen', 'feltűnően',
    'rendkívül', 'túl', 'enyhén', 'némileg', 'színű', 'még', 'már'],

  negations: ['nem', 'sem', 'se', 'nincs', 'nincsen', 'nincsenek', 'sincs', 'sincsenek', 'soha', 'sosem', 'sose', 'semmi', 'semmilyen',
    'korántsem', 'dehogy', 'ne'],

  // Számmal megadott életkor: „34 éves”, „egy 60 esztendős férfi”. Nem számít a „20 évesen”
  // vagy a „20 éves korában”: az egy korábbi időpontra vonatkozik, nem a jelenlegi életkorra.
  age: [{ regex: /(?<![\p{L}\p{N}])(\d{1,3})[\s-]*(?:éves|eves|esztendős|esztendos)(?![\p{L}\p{N}])(?!\s+kor\p{L}*(?:ban|ben|ra|re|ig))/giu, label: '{n} éves' }],

  // A jelző nem egyezik a főnévvel, ezért elég az alapalak. A többes számú vagy ragozott
  // állítmányi alakokat („kékek”, „magasnak tűnt”) szándékosan nem soroljuk fel: a felismert szó
  // úgy jelenik meg, ahogy a szövegben áll, és a „Kékek szemei” típusú címkék hibásak lennének.
  forms(word) {
    return [word];
  },
};
