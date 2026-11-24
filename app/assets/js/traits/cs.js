// Český list rysů: klíčová slova, podle kterých se z textu získávají rysy.
// Seznamy lze libovolně rozšiřovat: přídavná jména stačí zapsat v 1. pádě jednotného čísla
// mužského rodu (modrý, cizí); tvary pro ostatní rody, čísla a pády se vytvoří samy.
// Rysy se zobrazují v tom tvaru, v jakém jsou napsané v textu („modré oči“, „dlouhé vlasy“).
export default {
  // Přídavné jméno v češtině obvykle stojí před podstatným jménem („modré oči“); za ním se
  // počítá, jen když hned po podstatném jménu následuje sponové sloveso („oči měla modré“).
  prenominal: true,
  copulas: ['je', 'jsou', 'byl', 'byla', 'bylo', 'byly', 'byli', 'má', 'mají', 'měl', 'měla', 'mělo', 'měly', 'měli',
    'vypadá', 'vypadají', 'vypadal', 'vypadala', 'vypadaly', 'působí', 'působil', 'působila', 'bývá', 'bývají', 'nosí', 'nosil', 'nosila'],

  // Části těla nebo vlastnosti, které se popisují přídavnými jmény. `groups` říká, které seznamy
  // přídavných jmen k nim patří; `presence` znamená, že už samotná zmínka je rys („nosí brýle“).
  features: [
    { nouns: ['oko', 'oči', 'očí', 'očima', 'pohled', 'pohledem'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['vlasy', 'vlas', 'vlasů', 'hříva', 'hřívu', 'kštice', 'kštici', 'kadeře', 'účes', 'účesem'], groups: ['color', 'hair', 'length'] },
    { nouns: ['pleť', 'pleti', 'pletí', 'kůže', 'kůži', 'kůží'], groups: ['color', 'skin'] },
    { nouns: ['vousy', 'plnovous', 'bradka', 'strniště'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['knír', 'knírek', 'kníry'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nos', 'nosem'], groups: ['size', 'nose'] },
    { nouns: ['rty', 'ret', 'rtů', 'ústa', 'pusa', 'pusu'], groups: ['size', 'lips', 'color'] },
    { nouns: ['obličej', 'obličejem', 'tvář', 'tváře', 'tváří', 'rysy'], groups: ['face', 'size'] },
    { nouns: ['ruce', 'ruka', 'rukou', 'rukama', 'prsty', 'prstů'], groups: ['size', 'hands', 'length'] },
    { nouns: ['hlas', 'hlasem'], groups: ['voice'] },
    { nouns: ['obočí'], groups: ['color', 'density', 'size'] },
    { nouns: ['ramena', 'rameny', 'záda'], groups: ['size', 'shoulders'] },
    { nouns: ['nohy', 'nohama', 'paže', 'pažemi'], groups: ['length', 'size', 'hands'] },
    { nouns: ['úsměv', 'úsměvem'], groups: ['smile', 'size'] },
    { nouns: ['brýle'], groups: ['size'], presence: true },
    { nouns: ['pihy'], groups: [], presence: true },
    { nouns: ['jizva', 'jizvy'], groups: ['size'], presence: true },
    { nouns: ['tetování'], groups: ['size'], presence: true },
    { nouns: ['znaménko', 'znaménka'], groups: [], presence: true },
    { nouns: ['vrásky'], groups: [], presence: true },
    { nouns: ['šediny'], groups: [], presence: true },
    { nouns: ['kulhání'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['modrý', 'zelený', 'hnědý', 'kaštanový', 'černý', 'blond', 'plavý', 'zrzavý', 'ryšavý', 'rudý', 'červený', 'rezavý',
      'šedý', 'šedivý', 'prošedivělý', 'bílý', 'stříbrný', 'zlatý', 'zlatavý', 'tmavý', 'světlý', 'bledý', 'oříškový', 'jantarový',
      'medový', 'fialový', 'měděný', 'snědý', 'opálený', 'olivový', 'růžový', 'havraní', 'popelavý', 'pískový', 'uhlový'],
    hair: ['rovný', 'hladký', 'kudrnatý', 'vlnitý', 'kadeřavý', 'zacuchaný', 'rozcuchaný', 'zapletený', 'oholený', 'ostříhaný',
      'hedvábný', 'mastný', 'řídký', 'jemný', 'hustý', 'bohatý', 'sčesaný', 'rozpuštěný', 'svázaný', 'neupravený', 'ježatý'],
    length: ['dlouhý', 'krátký', 'předlouhý', 'kratičký'],
    size: ['velký', 'malý', 'obrovský', 'drobný', 'široký', 'úzký', 'tenký', 'silný', 'tlustý', 'kulatý', 'mohutný', 'maličký'],
    eyes: ['mandlový', 'šikmý', 'vpadlý', 'zapadlý', 'vypoulený', 'jasný', 'zářivý', 'živý', 'pohaslý', 'smutný', 'pronikavý',
      'hluboký', 'zasněný', 'unavený', 'neklidný', 'chladný', 'studený', 'vřelý', 'laskavý', 'přimhouřený'],
    skin: ['jemný', 'hrubý', 'drsný', 'vrásčitý', 'hladký', 'ošlehaný', 'pihovatý', 'křehký', 'sametový'],
    nose: ['orlí', 'tupý', 'rovný', 'zahnutý', 'ostrý', 'křivý', 'zlomený', 'výrazný', 'špičatý', 'pršatý'],
    lips: ['plný', 'tenký', 'úzký', 'rozpraskaný', 'masitý', 'smyslný'],
    face: ['protáhlý', 'oválný', 'hranatý', 'ostrý', 'vyzáblý', 'pohublý', 'propadlý', 'chlapecký', 'dětský', 'ošlehaný',
      'pihovatý', 'vrásčitý', 'kulatý', 'souměrný'],
    hands: ['silný', 'jemný', 'mozolnatý', 'kostnatý', 'šlachovitý', 'svalnatý', 'štíhlý', 'hubený', 'útlý'],
    shoulders: ['shrbený', 'svěšený', 'nahrbený', 'rovný', 'silný', 'široký'],
    voice: ['hluboký', 'vysoký', 'chraplavý', 'hrubý', 'jemný', 'sladký', 'pištivý', 'ječivý', 'skřehotavý', 'melodický', 'zvučný',
      'nosový', 'huhňavý', 'tichý', 'pevný', 'zlomený', 'rozvážný', 'sametový', 'mocný', 'slabý', 'zastřený', 'hlasitý'],
    density: ['hustý', 'řídký', 'zastřižený', 'upravený', 'pěstěný', 'neupravený', 'zanedbaný', 'jemný', 'huňatý', 'srostlý'],
    smile: ['upřímný', 'plachý', 'nesmělý', 'křivý', 'široký', 'smutný', 'posměšný', 'vřelý', 'nucený', 'šibalský', 'odzbrojující'],
  },

  // Rysy, které platí samy o sobě („je vysoký a plachý“).
  standalone: [
    // Postava
    'vysoký', 'štíhlý', 'hubený', 'tlustý', 'obézní', 'statný', 'robustní', 'zavalitý', 'svalnatý', 'atletický', 'útlý',
    'drobný', 'podsaditý', 'vytáhlý', 'kostnatý', 'shrbený', 'korpulentní', 'mohutný', 'ramenatý', 'vychrtlý',
    // Vzhled
    'přitažlivý', 'pohledný', 'hezký', 'krásný', 'ošklivý', 'elegantní', 'zanedbaný', 'upravený', 'plešatý', 'holohlavý',
    'vousatý', 'pihovatý', 'šedivý', 'prošedivělý', 'zrzavý', 'ryšavý', 'bledý', 'snědý', 'světlovlasý', 'tmavovlasý',
    'černovlasý', 'blonďatý',
    // Věk
    'mladý', 'starý', 'postarší', 'dospívající',
    // Povaha
    'plachý', 'nesmělý', 'stydlivý', 'statečný', 'odvážný', 'zbabělý', 'štědrý', 'sobecký', 'inteligentní', 'chytrý', 'mazaný',
    'prohnaný', 'naivní', 'pyšný', 'hrdý', 'skromný', 'laskavý', 'vlídný', 'krutý', 'věrný', 'loajální', 'nedůvěřivý',
    'ctižádostivý', 'ambiciózní', 'líný', 'pracovitý', 'impulzivní', 'trpělivý', 'netrpělivý', 'veselý', 'melancholický',
    'osamělý', 'společenský', 'introvertní', 'extrovertní', 'optimistický', 'pesimistický', 'tvrdohlavý', 'umíněný', 'žárlivý',
    'zvědavý', 'zdrženlivý', 'arogantní', 'citlivý', 'přítulný', 'násilnický', 'klidný', 'nervózní', 'poctivý', 'čestný',
    'prolhaný', 'sarkastický', 'dobrosrdečný', 'mstivý', 'lehkomyslný', 'opatrný', 'rozvážný', 'upřímný', 'upovídaný',
    'mlčenlivý', 'zamlklý', 'metodický', 'pověrčivý', 'nábožný', 'vzpurný', 'poslušný', 'ješitný', 'marnivý', 'nejistý',
    'manipulativní',
    // Tělesný stav
    'levoruký', 'chromý', 'kulhavý', 'slepý', 'hluchý', 'němý', 'jednooký', 'jednoruký',
  ],

  // Slova, která mohou stát mezi podstatným jménem a jeho přídavnými jmény, aniž by popis přerušila.
  fillers: ['je', 'jsou', 'byl', 'byla', 'bylo', 'byly', 'byli', 'má', 'mají', 'měl', 'měla', 'mělo', 'měly', 'měli',
    'vypadá', 'vypadají', 'vypadal', 'vypadala', 'vypadaly', 'působí', 'působil', 'působila', 'bývá', 'bývají', 'nosí', 'nosil',
    'nosila', 'velmi', 'hodně', 'dost', 'docela', 'celkem', 'trochu', 'poněkud', 'lehce', 'mírně', 'tak', 'moc', 'spíš', 'spíše',
    'skoro', 'téměř', 'vždy', 'vždycky', 'stále', 'pořád', 'a', 'i', 'nebo', 'ale', 'však', 'sice', 'jeho', 'její', 'jejich',
    'své', 'svoje', 'barvy', 'až', 'jako', 'ještě', 'už', 'již', 'zároveň', 'ji', 'ho'],

  negations: ['ne', 'není', 'nejsou', 'nebyl', 'nebyla', 'nebylo', 'nebyly', 'nebyli', 'nemá', 'nemají', 'neměl', 'neměla',
    'nemělo', 'neměly', 'neměli', 'nevypadá', 'nevypadal', 'nevypadala', 'nikdy', 'ani', 'bez', 'žádný', 'žádná', 'žádné',
    'žádnou', 'nijak'],

  // Věk zapsaný číslem: „je mu 34 let“, „bylo jí 20“, „ve věku 60 let“, „34letý“, „oslavila 40. narozeniny“.
  // Nepočítá se „před 20 lety“ ani „po 5 letech“: to není věk.
  age: [
    { regex: /(?<![\p{L}\p{N}])(?:je|bylo|bude|byl[oa]?)\s+(?:mu|jí)\s+(?:asi\s+|skoro\s+|téměř\s+|necelých\s+|přes\s+|teprve\s+|už\s+|již\s+)?(\d{1,3})(?:\s+(?:let|roků|roky|rok)(?![\p{L}\p{N}])|(?=\s*(?:[.,;:!?)]|$)))/giu, label: 'Věk: {n}' },
    { regex: /(?<![\p{L}\p{N}])ve\s+věku\s+(?:asi\s+|kolem\s+|necelých\s+)?(\d{1,3})(?:\s+(?:let|roků|roky|rok))?(?![\p{L}\p{N}])/giu, label: 'Věk: {n}' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s?-?\s?let(?:ý|á|é|ého|ou|ému|ém|ým|í|ých|ými)(?![\p{L}\p{N}])/giu, label: 'Věk: {n}' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\.\s+narozenin/giu, label: 'Věk: {n}' },
  ],

  // Tvary přídavného jména (slovo přichází bez diakritiky: „modry“, „cizi“): rod, číslo a nejčastější pády.
  forms(word) {
    if (word.endsWith('y')) {
      // Tvrdé skloňování (mladý): -ý, -á, -é, -í, -ého, -ému, -ém, -ým, -ou, -ých, -ými, -ýma.
      const stem = word.slice(0, -1);
      const out = [word, stem + 'a', stem + 'e', stem + 'i', stem + 'eho', stem + 'emu', stem + 'em', stem + 'ym', stem + 'ou',
        stem + 'ych', stem + 'ymi', stem + 'yma'];
      // 1. pád množného čísla životného rodu se změnou souhlásky: vysoký → vysocí, tichý → tiší,
      // drahý → drazí, lidský → lidští, sobecký → sobečtí.
      let soft = '';
      if (stem.endsWith('sk')) soft = stem.slice(0, -2) + 'st';
      else if (stem.endsWith('ck')) soft = stem.slice(0, -2) + 'ct';
      else if (stem.endsWith('ch')) soft = stem.slice(0, -2) + 's';
      else if (stem.endsWith('k')) soft = stem.slice(0, -1) + 'c';
      else if (stem.endsWith('h')) soft = stem.slice(0, -1) + 'z';
      if (soft) out.push(soft + 'i');
      return out;
    }
    // Měkké skloňování (cizí): -í, -ího, -ímu, -ím, -ích, -ími, -íma.
    if (word.endsWith('i')) return [word, word + 'ho', word + 'mu', word + 'm', word + 'ch', word + 'mi', word + 'ma'];
    // Nesklonná (blond).
    return [word];
  },
};
