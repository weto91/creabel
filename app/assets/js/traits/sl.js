// Slovenska tabela lastnosti: ključne besede, s katerimi se iz besedila izluščijo lastnosti.
// Lahko jo poljubno dopolnjujete: pridevnike vpišite v imenovalniku ednine moškega spola
// (»dolg«, »kratek«, »moder«); oblike za spol, število (tudi dvojino) in sklon nastanejo same.
// Samostalnike pa vpišite v vseh oblikah, v katerih se pogosto pojavljajo (»lasje«, »lase«, »las«).

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Končnice pridevnika: ednina, dvojina in množina vseh treh spolov in vseh sklonov.
const ENDINGS = ['', 'a', 'e', 'i', 'o', 'ega', 'emu', 'em', 'im', 'ih', 'ima', 'imi'];

// Pridevniki na -el, -en, -er, -ek, -an, -ak navadno izgubijo polglasnik (kratek → kratka,
// moder → modra, močan → močna). Ti ga ohranijo (vesel → vesela), zato se zanje ne tvorijo
// skrajšane oblike, ki bi lahko bile druge besede (debel → deblo, vesel → veslo).
const NO_FLEETING = new Set(['bel', 'debel', 'vesel', 'osivel', 'zagorel', 'ostarel', 'zelen', 'rumen', 'drobcen', 'pošten', 'iskren'].map(strip));

const adjectives = {
  color: ['moder', 'sinji', 'zelen', 'rjav', 'kostanjev', 'lešnikov', 'črn', 'plav', 'blond', 'svetlolas', 'rdečelas', 'rdeč',
    'rdečkast', 'siv', 'sivkast', 'bel', 'osivel', 'srebrn', 'zlat', 'zlatolas', 'temen', 'svetel', 'svetlorjav', 'temnorjav',
    'bled', 'zagorel', 'porjavel', 'jantarjev', 'vijoličen', 'bakren', 'rožnat', 'rdečeličen', 'olivni', 'vranji', 'peščen'],
  hair: ['raven', 'gladek', 'kodrast', 'valovit', 'skodran', 'kuštrav', 'skuštran', 'spleten', 'obrit', 'pobrit', 'razmršen',
    'zmršen', 'svilnat', 'masten', 'redek', 'tanek', 'gost', 'bujen', 'spet', 'razpuščen', 'postrižen', 'zlizan'],
  length: ['dolg', 'kratek', 'predolg', 'prekratek'],
  size: ['velik', 'majhen', 'ogromen', 'drobcen', 'širok', 'ozek', 'tanek', 'debel', 'okrogel', 'orjaški', 'droben'],
  eyes: ['mandljast', 'poševen', 'udrt', 'izbuljen', 'bister', 'živahen', 'moten', 'žalosten', 'prodoren', 'globok', 'zasanjan',
    'sanjav', 'utrujen', 'nemiren', 'hladen', 'topel', 'leden', 'iskriv', 'otožen'],
  skin: ['mehak', 'hrapav', 'naguban', 'zgubančen', 'gladek', 'pegast', 'nežen', 'ogorel', 'brezdlak', 'svilnat', 'mlečen'],
  nose: ['orlovski', 'kljukast', 'privihan', 'raven', 'zakrivljen', 'skrivljen', 'koničast', 'izrazit', 'sploščen', 'zlomljen',
    'širok', 'ozek'],
  lips: ['polen', 'mesnat', 'tanek', 'razpokan', 'stisnjen', 'našobljen'],
  face: ['podolgovat', 'ovalen', 'oglat', 'koščen', 'štirikoten', 'izčrpan', 'upadel', 'otroški', 'pegast', 'naguban', 'zagorel',
    'okrogel', 'shujšan', 'ozek', 'izrazit', 'bled'],
  hands: ['močan', 'nežen', 'žuljav', 'koščen', 'žilav', 'mišičast', 'vitek', 'tanek', 'dolg', 'grob', 'nemiren'],
  shoulders: ['povešen', 'sključen', 'upognjen', 'raven', 'močan', 'širok', 'ozek', 'koščen'],
  voice: ['globok', 'hripav', 'mehak', 'sladek', 'kričav', 'piskav', 'raskav', 'melodičen', 'nosljav', 'odločen', 'tresoč',
    'počasen', 'žameten', 'zvonek', 'gromek', 'močan', 'šibek', 'tih', 'hladen', 'topel', 'zamolkel', 'prijeten'],
  density: ['košat', 'gost', 'redek', 'pristrižen', 'urejen', 'neurejen', 'tanek', 'zanemarjen', 'skuštran', 'negovan'],
  smile: ['odkrit', 'nagajiv', 'širok', 'žalosten', 'posmehljiv', 'topel', 'prisiljen', 'skrivnosten', 'medel', 'kisel', 'kriv'],
};

// Pridevniki, ki so samo v seznamu »standalone«: zanje se ne tvori oblika na -o, ker je v
// pripovedi skoraj vedno prislov (»veselo je rekla«, »previdno je stopil«), ne lastnost.
const IN_GROUPS = new Set(Object.values(adjectives).flat().map(strip));

export default {
  // Pridevnik je v slovenščini navadno pred samostalnikom (»modre oči«); pridevniki za
  // samostalnikom štejejo le, če mu sledi vezni glagol (»oči so ji bile modre«).
  prenominal: true,
  copulas: ['je', 'so', 'sta', 'bil', 'bila', 'bilo', 'bili', 'bile', 'bo', 'bodo', 'bosta', 'ima', 'imel', 'imela', 'imeli',
    'imajo', 'izgleda', 'izgledajo', 'deluje', 'delujejo', 'zdi', 'zdijo'],

  // Deli telesa ali značilnosti, ki se opisujejo s pridevniki. `groups` pove, kateri seznami
  // pridevnikov zanje veljajo; `presence` pomeni, da je že omemba lastnost (»nosi očala«).
  features: [
    { nouns: ['oko', 'oči', 'očesa', 'očesi', 'očesu', 'očesom', 'očmi', 'očeh', 'očem', 'pogled', 'pogleda', 'pogledu', 'pogledom'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['lasje', 'las', 'lase', 'lasem', 'laseh', 'lasmi', 'griva', 'grivo', 'grive', 'pričeska', 'pričesko', 'pričeske',
      'frizura', 'frizuro', 'frizure', 'kodri', 'kodre', 'kodrov', 'kodrih'], groups: ['color', 'hair', 'length'] },
    { nouns: ['koža', 'kože', 'koži', 'kožo', 'polt', 'polti', 'ten'], groups: ['color', 'skin'] },
    { nouns: ['brada', 'brade', 'bradi', 'brado', 'bradica', 'bradico', 'bradice', 'strnišče', 'strnišča'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['brki', 'brke', 'brkov', 'brkih', 'brkami'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nos', 'nosa', 'nosu', 'nosom'], groups: ['size', 'nose'] },
    { nouns: ['ustnice', 'ustnic', 'ustnici', 'ustnicah', 'ustnicami', 'usta', 'ust', 'ustih', 'ustmi'], groups: ['size', 'lips', 'color'] },
    { nouns: ['obraz', 'obraza', 'obrazu', 'obrazom', 'poteze', 'potez', 'potezami', 'lica', 'lice'], groups: ['face', 'size'] },
    { nouns: ['roke', 'roka', 'roko', 'rokah', 'rokami', 'dlani', 'dlan', 'prsti', 'prste', 'prstov', 'prsti'], groups: ['size', 'hands', 'length'] },
    { nouns: ['glas', 'glasu', 'glasom', 'glasa'], groups: ['voice'] },
    { nouns: ['obrvi', 'obrv', 'obrvmi', 'obrveh'], groups: ['color', 'density', 'size'] },
    { nouns: ['ramena', 'ramen', 'rame', 'rami', 'hrbet', 'hrbta', 'hrbtu'], groups: ['size', 'shoulders'] },
    { nouns: ['noge', 'noga', 'nog', 'nogah', 'nogami'], groups: ['length', 'size', 'hands'] },
    { nouns: ['nasmeh', 'nasmeha', 'nasmehu', 'nasmehom', 'nasmešek', 'nasmeška'], groups: ['smile', 'size'] },
    { nouns: ['očala', 'očal', 'očali'], groups: ['size'], presence: true },
    { nouns: ['pege', 'peg', 'pegice', 'pegami'], groups: [], presence: true },
    { nouns: ['brazgotina', 'brazgotino', 'brazgotine', 'brazgotin', 'brazgotinami'], groups: ['size'], presence: true },
    { nouns: ['tetovaža', 'tetovažo', 'tetovaže', 'tetovaž', 'tetovažami'], groups: ['size'], presence: true },
    { nouns: ['znamenje', 'znamenja', 'znamenji', 'znamenj'], groups: [], presence: true },
    { nouns: ['gube', 'gub', 'gubice', 'gubami'], groups: [], presence: true },
    { nouns: ['pleša', 'plešo', 'pleše'], groups: [], presence: true },
    { nouns: ['šepanje'], groups: [], presence: true },
  ],

  adjectives,

  // Lastnosti, ki veljajo same po sebi (»je visok in sramežljiv«).
  standalone: [
    // Postava
    'visok', 'nizek', 'suh', 'vitek', 'debel', 'zajeten', 'čokat', 'krepak', 'postaven', 'mišičast', 'atletski', 'plečat',
    'trebušast', 'zalit', 'koščen', 'žilav', 'sključen',
    // Videz
    'privlačen', 'lep', 'čeden', 'grd', 'eleganten', 'zanemarjen', 'plešast', 'bradat', 'brkat', 'pegast',
    'sivolas', 'svetlolas', 'temnolas', 'rdečelas', 'plavolas', 'kodrolas', 'bled', 'zagorel',
    // Starost
    'mlad', 'ostarel', 'postaran', 'najstniški',
    // Značaj
    'sramežljiv', 'pogumen', 'strahopeten', 'radodaren', 'sebičen', 'inteligenten', 'pameten', 'zvit', 'prebrisan', 'naiven',
    'ponosen', 'ponižen', 'skromen', 'prijazen', 'krut', 'zvest', 'nezaupljiv', 'ambiciozen', 'len', 'delaven', 'priden',
    'impulziven', 'potrpežljiv', 'nepotrpežljiv', 'vesel', 'melanholičen', 'osamljen', 'družaben', 'introvertiran',
    'ekstravertiran', 'optimističen', 'pesimističen', 'trmast', 'svojeglav', 'ljubosumen', 'radoveden', 'zadržan', 'aroganten',
    'vzvišen', 'občutljiv', 'ljubeč', 'nasilen', 'miren', 'živčen', 'pošten', 'lažniv', 'sarkastičen', 'dobrosrčen',
    'zamerljiv', 'predrzen', 'nepremišljen', 'preudaren', 'previden', 'iskren', 'zgovoren', 'molčeč', 'metodičen',
    'vraževeren', 'veren', 'pobožen', 'uporen', 'uporniški', 'ubogljiv', 'nečimrn', 'negotov', 'manipulativen',
    // Stanje
    'šepav', 'slep', 'gluh', 'nem', 'enook', 'enorok', 'hrom', 'naglušen',
  ],

  // Besede, ki so lahko med samostalnikom in njegovimi pridevniki, ne da bi prekinile opis.
  fillers: ['je', 'so', 'sta', 'bil', 'bila', 'bilo', 'bili', 'bile', 'bo', 'bodo', 'ima', 'imel', 'imela', 'imeli', 'imajo',
    'ji', 'mu', 'jim', 'se', 'si', 'ga', 'jo', 'zelo', 'precej', 'dokaj', 'nekoliko', 'rahlo', 'malce', 'malo', 'kar', 'skoraj',
    'vedno', 'še', 'že', 'bolj', 'tako', 'prav', 'čisto', 'povsem', 'izrazito', 'in', 'ter', 'ali', 'pa', 'a', 'toda', 'vendar',
    'ampak', 'barve', 'njegovi', 'njegove', 'njegova', 'njegov', 'njen', 'njena', 'njene', 'njeni', 'svoj', 'svoja', 'svoje',
    'svoji', 'svojo', 'nosi', 'nosil', 'nosila', 'kot', 'nekam', 'skorajda'],

  negations: ['ne', 'ni', 'niso', 'nista', 'nisem', 'nisi', 'nismo', 'niste', 'nima', 'nimajo', 'nimata', 'nimam', 'nimaš',
    'brez', 'nikoli', 'nikdar', 'niti', 'noben', 'nobene', 'nobenega', 'nobenih', 'nič', 'nikakor'],

  // Starost s številko: »star 34 let«, »ima 34 let«, »dopolnila je 60 let«, »34 let star«,
  // »34-letni moški«. Ne šteje »pred 20 leti« ali »čez 5 let«: to ni starost.
  age: [
    { regex: /(?<![\p{L}\p{N}])(?:star[aie]?|ima|imel[aie]?|dopolni|dopolnil[aie]?|šteje|štel[aie]?)\s+(?:(?:je|že|približno|skoraj|komaj|okoli|dobrih)\s+){0,2}(\d{1,3})\s+(?:let|leto|leti|leta)(?![\p{L}\p{N}])/giu, label: 'Starost: {n}' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s+(?:let|leto|leti|leta)\s+star[aie]?(?![\p{L}\p{N}])/giu, label: 'Starost: {n}' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s*-\s*let(?:en|n[aeio]|nega|nemu|nem|nim|nih|nima|nimi|nik|nika|nica|nice|nici|nico)(?![\p{L}\p{N}])/giu, label: 'Starost: {n}' },
  ],

  // Dobi besedo brez strešic in z malimi črkami (»moder«) in vrne vse njene oblike:
  // modra, modre, modri, modro, modrega, modremu, modrem, modrim, modrih, modrima, modrimi.
  forms(word) {
    const ends = IN_GROUPS.has(word) ? ENDINGS : ENDINGS.filter((e) => e !== 'o');
    const out = new Set([word]);
    if (word.endsWith('i')) {
      // Pridevniki, ki imajo samo določno obliko: »orlovski«, »otroški«, »zadnji«.
      const stem = word.slice(0, -1);
      for (const e of ends) if (e) out.add(stem + e);
      return [...out];
    }
    const stems = [word];
    const fleeting = /^(.{2,})[ae]([klnrc])$/.exec(word);
    if (fleeting && word.length >= 5 && !NO_FLEETING.has(word)) stems.push(fleeting[1] + fleeting[2]);
    for (const stem of stems) for (const e of ends) out.add(stem + e);
    return [...out];
  },
};
