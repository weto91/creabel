// Lista osobina na srpskom (latinica, ekavica): ključne reči po kojima se iz teksta izdvajaju
// osobine. Može slobodno da se proširuje: pridevi se upisuju u muškom rodu jednine („plav“,
// „kratak“, „debeo“), a oblici za rod, broj i padež prave se sami (forms). Imenice se ne menjaju
// same, pa su navedeni njihovi najčešći padežni oblici („kosa“, „kosu“, „kosom“).
// Dijakritici nisu obavezni: „cupav“ i „čupav“ se računaju kao ista reč.

// Pridevi s nepostojanim a ili glasovnom promenom koju pravilo ne pogađa (ključ bez dijakritika).
const STEMS = {
  nizak: 'nisk', uzak: 'usk', blizak: 'blisk', gladak: 'glatk', sladak: 'slatk',
  redak: 'retk', tezak: 'tesk', mastan: 'masn',
};
// Nastavci prideva: neodređeni i određeni vid, sva tri roda, jednina i množina, svi padeži.
const ENDINGS = ['', 'a', 'e', 'i', 'o', 'u', 'og', 'oga', 'eg', 'ega', 'om', 'ome', 'omu', 'em', 'emu', 'oj', 'im', 'ima', 'ih'];

export default {
  // U srpskom pridev obično stoji ispred imenice („plave oči“); posle imenice se računa samo
  // ako odmah sledi glagol ili enklitika („oči su joj plave“, „kosa mu je bila duga“).
  prenominal: true,
  copulas: ['je', 'su', 'bio', 'bila', 'bilo', 'bili', 'bile', 'beše', 'behu', 'izgleda', 'izgledaju', 'izgledao',
    'izgledala', 'izgledale', 'izgledali', 'deluje', 'deluju', 'delovao', 'delovala', 'joj', 'mu', 'im'],

  // Delovi ili svojstva koja se opisuju pridevima. `groups` kaže koje liste prideva važe za njih;
  // `presence` znači da je već samo pominjanje osobina („nosi naočare“).
  features: [
    { nouns: ['oči', 'očiju', 'očima', 'pogled', 'pogleda', 'pogledom'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['kosa', 'kose', 'kosu', 'kosom', 'kosi', 'vlasi', 'kovrdže', 'uvojci', 'uvojke', 'grivu', 'griva'], groups: ['color', 'hair', 'length'] },
    { nouns: ['koža', 'kože', 'kožu', 'kožom', 'koži', 'ten', 'tena', 'tenom', 'puti'], groups: ['color', 'skin'] },
    { nouns: ['brada', 'brade', 'bradu', 'bradom'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['brkovi', 'brkove', 'brkova', 'brkovima', 'brk'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nos', 'nosa', 'nosom'], groups: ['size', 'nose'] },
    { nouns: ['usne', 'usana', 'usnama', 'usta', 'ustima'], groups: ['size', 'lips', 'color'] },
    { nouns: ['lice', 'lica', 'licem', 'licu', 'crte', 'crtama'], groups: ['face', 'size'] },
    { nouns: ['ruke', 'ruku', 'rukama', 'šake', 'šakama', 'prsti', 'prste', 'prstima'], groups: ['size', 'hands', 'length'] },
    { nouns: ['glas', 'glasa', 'glasom'], groups: ['voice'] },
    { nouns: ['obrve', 'obrva', 'obrvama'], groups: ['color', 'density', 'size'] },
    { nouns: ['ramena', 'ramenima', 'leđa', 'leđima'], groups: ['size', 'shoulders'] },
    { nouns: ['noge', 'nogama'], groups: ['length', 'size', 'hands'] },
    { nouns: ['osmeh', 'osmeha', 'osmehom', 'osmehu'], groups: ['smile', 'size'] },
    { nouns: ['naočare', 'naočari', 'naočarima'], groups: ['size'], presence: true },
    { nouns: ['pege', 'pegama', 'pegice'], groups: [], presence: true },
    { nouns: ['ožiljak', 'ožiljka', 'ožiljkom', 'ožiljci', 'ožiljke', 'ožiljcima'], groups: ['size'], presence: true },
    { nouns: ['tetovaža', 'tetovaže', 'tetovažu', 'tetovažom', 'tetovažama'], groups: ['size'], presence: true },
    { nouns: ['mladež', 'mladeža', 'mladeži', 'mladeže'], groups: [], presence: true },
    { nouns: ['bore', 'borama'], groups: [], presence: true },
    { nouns: ['sedina', 'sedine', 'sedinama'], groups: [], presence: true },
    { nouns: ['šepanje', 'hramanje'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['plav', 'zelen', 'smeđ', 'braon', 'kestenjast', 'crn', 'riđ', 'crven', 'crvenkast', 'sed', 'siv', 'sivkast', 'beo',
      'srebrnast', 'zlatan', 'zlatast', 'taman', 'bled', 'svetao', 'mrk', 'garav', 'lešnikast', 'jantaran', 'ljubičast',
      'bakarni', 'ružičast', 'preplanuo', 'maslinast', 'rumen', 'žućkast', 'pepeljast', 'pšeničan', 'tamnoput', 'svetloput'],
    hair: ['ravan', 'kovrdžav', 'kovrčav', 'talasast', 'kudrav', 'upleten', 'ošišan', 'obrijan', 'raščupan', 'čupav',
      'neuredan', 'svilenkast', 'mastan', 'proređen', 'redak', 'tanak', 'gust', 'bujan', 'vezan', 'pušten', 'zamršen', 'sjajan'],
    length: ['dug', 'dugačak', 'kratak', 'predug', 'prekratak'],
    size: ['velik', 'malen', 'ogroman', 'sitan', 'širok', 'uzak', 'tanak', 'debeo', 'okrugao', 'krupan', 'džinovski'],
    eyes: ['bademast', 'upao', 'izbuljen', 'sjajan', 'živahan', 'ugašen', 'tužan', 'prodoran', 'dubok', 'sanjiv', 'umoran',
      'nemiran', 'hladan', 'topao', 'bistar', 'krupan'],
    skin: ['mek', 'gladak', 'grub', 'naboran', 'zategnut', 'ogrubeo', 'pegav', 'nežan', 'ispucao'],
    nose: ['orlovski', 'kukast', 'prćast', 'pravilan', 'ravan', 'iskrivljen', 'šiljat', 'povijen', 'istaknut', 'pljosnat', 'spljošten'],
    lips: ['pun', 'tanak', 'ispucao', 'mesnat', 'napućen'],
    face: ['izdužen', 'ovalan', 'uglast', 'oštar', 'četvrtast', 'ispijen', 'upao', 'detinjast', 'dečački', 'ogrubeo', 'pegav',
      'naboran', 'okrugao', 'koščat', 'ispošćen'],
    hands: ['snažan', 'nežan', 'žuljevit', 'koščat', 'žilav', 'mišićav', 'vitak', 'mršav'],
    shoulders: ['pogrbljen', 'povijen', 'spušten', 'ravan', 'snažan', 'širok'],
    voice: ['dubok', 'visok', 'promukao', 'mek', 'blag', 'sladak', 'piskav', 'hrapav', 'melodičan', 'unjkav', 'nazalan',
      'čvrst', 'napukao', 'razvučen', 'baršunast', 'snažan', 'slab', 'grlen', 'zvonak'],
    density: ['gust', 'čupav', 'redak', 'proređen', 'podšišan', 'negovan', 'zapušten', 'neuredan', 'tanak', 'bujan'],
    smile: ['iskren', 'stidljiv', 'iskrivljen', 'širok', 'tužan', 'podrugljiv', 'topao', 'usiljen', 'blag', 'zagonetan'],
  },

  // Osobine koje važe same za sebe („visok je i stidljiv“).
  standalone: [
    // Građa
    'visok', 'nizak', 'mršav', 'vitak', 'debeo', 'gojazan', 'krupan', 'zdepast', 'plećat', 'stasit', 'mišićav', 'atletski',
    'koščat', 'sitan', 'punačak', 'nezgrapan', 'kršan', 'pogrbljen', 'žgoljav', 'krakat',
    // Izgled
    'privlačan', 'zgodan', 'naočit', 'lepuškast', 'markantan', 'ružan', 'elegantan', 'neuredan', 'aljkav', 'uredan', 'ćelav',
    'bradat', 'brkat', 'pegav', 'plavokos', 'crnokos', 'riđokos', 'smeđokos', 'bled', 'preplanuo',
    // Godine
    'mlad', 'postariji', 'sredovečan', 'vremešan', 'ostareo', 'maloletan',
    // Karakter
    'stidljiv', 'hrabar', 'plašljiv', 'velikodušan', 'darežljiv', 'sebičan', 'inteligentan', 'pametan', 'lukav', 'naivan',
    'ponosan', 'ohol', 'skroman', 'ljubazan', 'okrutan', 'odan', 'nepoverljiv', 'ambiciozan', 'lenj', 'vredan', 'impulsivan',
    'strpljiv', 'nestrpljiv', 'veseo', 'melanholičan', 'usamljen', 'druželjubiv', 'introvertan', 'ekstrovertan',
    'optimističan', 'pesimističan', 'tvrdoglav', 'svojeglav', 'ljubomoran', 'radoznao', 'povučen', 'uzdržan', 'arogantan',
    'osetljiv', 'nežan', 'nasilan', 'miran', 'nervozan', 'pošten', 'lažljiv', 'sarkastičan', 'dobroćudan', 'osvetoljubiv',
    'nepromišljen', 'oprezan', 'iskren', 'pričljiv', 'ćutljiv', 'metodičan', 'sujeveran', 'religiozan', 'pobožan',
    'buntovan', 'poslušan', 'sujetan', 'nesiguran', 'manipulativan',
    // Stanje
    'levoruk', 'hrom', 'šepav', 'slep', 'gluv', 'gluvonem', 'ćorav', 'jednook',
  ],

  // Reči koje mogu da stoje između imenice i njenih prideva a da ne prekinu opis.
  fillers: ['je', 'su', 'sam', 'si', 'smo', 'ste', 'bio', 'bila', 'bilo', 'bili', 'bile', 'beše', 'behu', 'joj', 'mu', 'im',
    'njoj', 'njemu', 'veoma', 'vrlo', 'prilično', 'dosta', 'jako', 'tako', 'sasvim', 'posve', 'malo', 'pomalo', 'nešto',
    'skoro', 'gotovo', 'uvek', 'još', 'i', 'a', 'ili', 'ali', 'pa', 'te', 'boje', 'boja', 'ima', 'imao', 'imala', 'imaju',
    'izgleda', 'izgledaju', 'izgledao', 'izgledala', 'izgledale', 'izgledali', 'deluje', 'deluju', 'delovao', 'delovala',
    'njegov', 'njegova', 'njegove', 'njen', 'njena', 'njene', 'sa', 's', 'od', 'na', 'više', 'manje', 'kao'],

  negations: ['ne', 'nije', 'nisu', 'nisam', 'nismo', 'nema', 'nemaju', 'nemam', 'nikad', 'nikada', 'bez', 'ni', 'niti',
    'nimalo', 'nipošto', 'nikako'],

  // Godine izražene brojem: „ima 34 godine“, „imao je oko 60 godina“, „40-godišnjak“.
  // Ne računa se „pre 20 godina“ ni „posle 5 godina“: to nisu godine starosti.
  age: [
    { regex: /(?<![\p{L}\p{N}])(?:ima|imaše|imao|imala|imam|imaš|napunio|napunila|puni|navršio|navršila|navršava|star|stara)(?:\s+je|\s+će|\s+ću)?\s+(?:oko\s+|skoro\s+|gotovo\s+|tek\s+|jedva\s+|već\s+|nekih\s+)?(\d{1,3})\s+godin(?:a|e|u)(?![\p{L}\p{N}])/giu, label: 'Godine: {n}' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s*-?\s*godi[šs]nj\p{L}*/giu, label: 'Godine: {n}' },
  ],

  forms(word) {
    const w = String(word).toLowerCase();
    const stems = new Set([w]);
    if (STEMS[w]) stems.add(STEMS[w]);
    if (/[aeiu]o$/.test(w)) {
      // debeo → debel-, veseo → vesel-, topao → topl-, radoznao → radoznal-, preplanuo → preplanul-
      stems.delete(w);
      stems.add(w.slice(0, -1) + 'l');
      if (w.endsWith('ao')) stems.add(w.slice(0, -2) + 'l');
    } else if (w.length >= 5 && /[^aeiou]a[kcnr]$/.test(w)) {
      // nepostojano a: kratak → kratk-, ružan → ružn-, hrabar → hrabr- (zadržava se i osnova bez promene: odan → odan-)
      stems.add(w.slice(0, -2) + w.slice(-1));
    } else if (w.length >= 5 && w.endsWith('i')) {
      // pridevi samo u određenom vidu: orlovski → orlovsk-, bakarni → bakarn-
      stems.add(w.slice(0, -1));
    } else if (/[aeiou]$/.test(w)) {
      return [w];
    }
    const out = new Set([w]);
    for (const stem of stems) for (const ending of ENDINGS) out.add(stem + ending);
    return [...out];
  },
};
