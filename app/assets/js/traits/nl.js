// Nederlandse kenmerkenlijst: de trefwoorden waarmee kenmerken uit een tekst worden gehaald.
// Je kunt hem vrij uitbreiden door woorden aan de lijsten toe te voegen. Bijvoeglijke naamwoorden
// staan in hun grondvorm (“blauw”, “groot”); de verbogen vorm op -e (“blauwe”, “grote”) wordt
// vanzelf gemaakt.
export default {
  // In het Nederlands staat het bijvoeglijk naamwoord vóór het zelfstandig naamwoord
  // (“blauwe ogen”); erachter telt het alleen als er een koppelwerkwoord volgt
  // (“haar ogen waren blauw”).
  prenominal: true,
  copulas: ['is', 'zijn', 'was', 'waren', 'lijkt', 'lijken', 'leek', 'leken', 'oogt', 'oogde', 'oogden', 'blijft', 'bleef',
    'bleven', 'wordt', 'worden', 'werd', 'werden'],

  // Delen of eigenschappen die met bijvoeglijke naamwoorden worden beschreven. `groups` zegt welke
  // lijsten met bijvoeglijke naamwoorden erbij horen; `presence` betekent dat het noemen ervan al
  // een kenmerk is (“draagt een bril”).
  features: [
    { nouns: ['oog', 'ogen', 'blik'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['haar', 'haren', 'kapsel', 'haardos', 'krullen', 'lokken'], groups: ['color', 'hair', 'length'] },
    { nouns: ['huid', 'teint', 'huidskleur', 'gelaatskleur'], groups: ['color', 'skin'] },
    { nouns: ['baard', 'stoppels', 'stoppelbaard', 'sik', 'sikje'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['snor', 'snorren', 'snorretje', 'knevel'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['neus'], groups: ['size', 'nose'] },
    { nouns: ['lippen', 'lip', 'mond'], groups: ['size', 'lips', 'color'] },
    { nouns: ['gezicht', 'gelaat', 'gelaatstrekken'], groups: ['face', 'size'] },
    { nouns: ['handen', 'hand', 'vingers'], groups: ['size', 'hands', 'length'] },
    { nouns: ['stem'], groups: ['voice'] },
    { nouns: ['wenkbrauwen', 'wenkbrauw'], groups: ['color', 'density', 'size'] },
    { nouns: ['schouders', 'rug'], groups: ['size', 'shoulders'] },
    { nouns: ['benen', 'armen'], groups: ['length', 'size', 'hands'] },
    { nouns: ['glimlach', 'lach', 'lachje'], groups: ['smile', 'size'] },
    { nouns: ['bril', 'brillen', 'brilletje'], groups: ['size'], presence: true },
    { nouns: ['sproeten', 'sproetjes'], groups: [], presence: true },
    { nouns: ['litteken', 'littekens'], groups: ['size'], presence: true },
    { nouns: ['tatoeage', 'tatoeages', 'tattoo', 'tattoos'], groups: ['size'], presence: true },
    { nouns: ['moedervlek', 'moedervlekken'], groups: [], presence: true },
    { nouns: ['rimpels', 'rimpeltjes'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['blauw', 'groen', 'bruin', 'zwart', 'blond', 'rood', 'rossig', 'grijs', 'grijzend', 'wit', 'zilvergrijs',
      'zilverkleurig', 'goudblond', 'asblond', 'donker', 'donkerbruin', 'lichtbruin', 'licht', 'bleek', 'kastanjebruin',
      'koperrood', 'koperkleurig', 'amberkleurig', 'honingkleurig', 'hazelnootbruin', 'violet', 'paars', 'rozig', 'roze',
      'gebruind', 'getaand', 'olijfkleurig', 'ravenzwart', 'gitzwart', 'blozend', 'lichtblauw', 'donkerblauw', 'staalblauw',
      'grijsblauw', 'sneeuwwit'],
    hair: ['steil', 'sluik', 'krullend', 'krullig', 'gekruld', 'golvend', 'kroes', 'kroezend', 'kroezig', 'gevlochten',
      'kortgeknipt', 'kaalgeschoren', 'geschoren', 'warrig', 'verward', 'slordig', 'zijdezacht', 'vettig', 'piekerig', 'dun',
      'dik', 'fijn', 'vol', 'weelderig', 'opgestoken', 'los', 'loshangend', 'samengebonden', 'springerig', 'pluizig', 'stug'],
    length: ['lang', 'kort', 'halflang', 'schouderlang', 'superlang', 'superkort'],
    size: ['groot', 'klein', 'enorm', 'piepklein', 'minuscuul', 'breed', 'smal', 'dun', 'dik', 'fijn', 'rond', 'reusachtig',
      'gigantisch'],
    eyes: ['amandelvormig', 'schuin', 'diepliggend', 'uitpuilend', 'stralend', 'helder', 'levendig', 'dof', 'triest',
      'droevig', 'verdrietig', 'doordringend', 'priemend', 'diep', 'dromerig', 'moe', 'vermoeid', 'onrustig', 'rusteloos',
      'koud', 'kil', 'warm', 'fonkelend', 'twinkelend'],
    skin: ['zacht', 'ruw', 'gerimpeld', 'rimpelig', 'glad', 'verweerd', 'gelooid', 'sproeterig', 'onbehaard', 'teer', 'gaaf',
      'smetteloos', 'doorschijnend'],
    nose: ['gebogen', 'haakvormig', 'krom', 'plat', 'stomp', 'opgewipt', 'recht', 'scherp', 'spits', 'puntig', 'scheef',
      'prominent', 'gebroken', 'markant'],
    lips: ['vol', 'dun', 'smal', 'gebarsten', 'gesprongen', 'sensueel', 'vlezig'],
    face: ['langwerpig', 'ovaal', 'hoekig', 'vierkant', 'scherp', 'ingevallen', 'uitgemergeld', 'mager', 'jongensachtig',
      'kinderlijk', 'verweerd', 'sproeterig', 'gerimpeld', 'hartvormig', 'markant'],
    hands: ['sterk', 'krachtig', 'teer', 'fijn', 'eeltig', 'knokig', 'benig', 'pezig', 'gespierd', 'slank', 'ruw'],
    shoulders: ['hangend', 'afhangend', 'gebogen', 'gekromd', 'krom', 'recht', 'sterk', 'gespierd'],
    voice: ['laag', 'diep', 'zwaar', 'hoog', 'schor', 'hees', 'zacht', 'lief', 'zoet', 'schel', 'schril', 'krassend', 'rasperig',
      'melodieus', 'nasaal', 'vast', 'vastberaden', 'gebroken', 'trillend', 'beverig', 'kalm', 'traag', 'fluweelzacht',
      'krachtig', 'luid', 'zwak', 'warm', 'donker', 'helder', 'iel', 'monotoon'],
    density: ['borstelig', 'dik', 'dun', 'dicht', 'vol', 'getrimd', 'bijgeknipt', 'verzorgd', 'onverzorgd', 'slordig', 'warrig',
      'fijn', 'spaarzaam', 'ruig'],
    smile: ['open', 'oprecht', 'verlegen', 'scheef', 'breed', 'triest', 'droevig', 'spottend', 'warm', 'geforceerd', 'stralend',
      'ondeugend', 'flauw', 'innemend', 'sardonisch'],
  },

  // Kenmerken die op zichzelf staan (“hij is lang en verlegen”).
  standalone: [
    // Bouw
    'lang', 'klein', 'slank', 'dun', 'mager', 'broodmager', 'dik', 'mollig', 'zwaarlijvig', 'gezet', 'fors', 'robuust', 'potig',
    'gespierd', 'atletisch', 'tenger', 'slungelig', 'rijzig', 'gedrongen', 'breedgeschouderd', 'voorovergebogen',
    // Uiterlijk
    'aantrekkelijk', 'knap', 'mooi', 'beeldschoon', 'lelijk', 'elegant', 'slordig', 'verzorgd', 'kaal', 'kaalhoofdig', 'bebaard',
    'sproeterig', 'grijzend', 'blond', 'roodharig', 'bleek', 'getaand',
    // Leeftijd
    'jong', 'piepjong', 'jeugdig', 'bejaard', 'hoogbejaard', 'stokoud',
    // Karakter
    'verlegen', 'dapper', 'moedig', 'laf', 'gul', 'vrijgevig', 'egoïstisch', 'zelfzuchtig', 'intelligent', 'slim', 'sluw',
    'listig', 'naïef', 'trots', 'bescheiden', 'nederig', 'vriendelijk', 'aardig', 'wreed', 'loyaal', 'trouw', 'wantrouwig',
    'achterdochtig', 'ambitieus', 'eerzuchtig', 'lui', 'ijverig', 'hardwerkend', 'impulsief', 'geduldig', 'ongeduldig',
    'vrolijk', 'opgewekt', 'melancholiek', 'melancholisch', 'eenzaam', 'eenzelvig', 'sociabel', 'introvert', 'extravert',
    'extrovert', 'optimistisch', 'pessimistisch', 'koppig', 'eigenwijs', 'jaloers', 'nieuwsgierig', 'gereserveerd',
    'terughoudend', 'arrogant', 'gevoelig', 'liefdevol', 'hartelijk', 'gewelddadig', 'agressief', 'rustig', 'kalm', 'nerveus',
    'zenuwachtig', 'eerlijk', 'leugenachtig', 'sarcastisch', 'goedhartig', 'goedaardig', 'rancuneus', 'haatdragend',
    'roekeloos', 'voorzichtig', 'oprecht', 'spraakzaam', 'praatgraag', 'zwijgzaam', 'methodisch', 'bijgelovig', 'gelovig',
    'religieus', 'atheïstisch', 'opstandig', 'rebels', 'gehoorzaam', 'ijdel', 'onzeker', 'manipulatief',
    // Lichamelijke toestand
    'linkshandig', 'kreupel', 'mank', 'blind', 'doof', 'slechtziend', 'slechthorend', 'eenogig', 'eenarmig',
  ],

  // Woorden die tussen het zelfstandig naamwoord en zijn bijvoeglijke naamwoorden kunnen staan
  // zonder de beschrijving te onderbreken.
  fillers: ['is', 'zijn', 'was', 'waren', 'lijkt', 'lijken', 'leek', 'leken', 'heel', 'erg', 'zeer', 'nogal', 'vrij', 'tamelijk',
    'behoorlijk', 'redelijk', 'best', 'echt', 'en', 'of', 'maar', 'van', 'kleur', 'een', 'beetje', 'wat', 'iets', 'ietwat',
    'enigszins', 'lichtjes', 'zo', 'te', 'altijd', 'bijna', 'heeft', 'had', 'hebben', 'hadden', 'de', 'het', 'haar', 'hun',
    "z'n", "d'r", 'toch', 'eerder', 'nog', 'al', 'wel', 'tegen', 'aan'],

  negations: ['niet', 'geen', 'nooit', 'zonder', 'noch', 'evenmin', 'allerminst', 'nergens'],

  // Leeftijd met een getal: “34 jaar oud”, “een 60-jarige man”, “ze is 34”, “een man van 60 jaar”.
  // Telt niet mee: “het is 20 jaar geleden”, “hij was 5 jaar weg”, “het is 3 uur”: dat is geen leeftijd.
  age: [
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})[\s-]+jaar[\s-]+oud(?![\p{L}\p{N}])/giu, label: '{n} jaar' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})-jarige?(?![\p{L}\p{N}])/giu, label: '{n} jaar' },
    { regex: /(?<![\p{L}\p{N}])(?:is|was|wordt|werd|ben|bent|word|geworden)\s+(?:al\s+|bijna\s+|pas\s+|net\s+|ongeveer\s+|ruim\s+|zo['’]n\s+)?(\d{1,3})\s+jaar(?![\p{L}\p{N}])(?!\s+(?:geleden|later|lang|terug|eerder|na|voor|getrouwd|samen|weg|dood|bezig|in|op|bij|met|zonder|niet)(?![\p{L}\p{N}]))/giu, label: '{n} jaar' },
    { regex: /(?<![\p{L}\p{N}])(?:is|was|wordt|werd|ben|bent)\s+(?:al\s+|bijna\s+|pas\s+|net\s+|ongeveer\s+|ruim\s+)?(\d{1,3})(?=\s*(?:$|[;:!?)]|[.,](?!\d)|\s(?:en|maar|toen|nu|sinds)(?![\p{L}\p{N}])))/giu, label: '{n} jaar' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s+(?:jaar\s+)?geworden(?![\p{L}\p{N}])/giu, label: '{n} jaar' },
    { regex: /(?<![\p{L}\p{N}])(?<!(?:periode|straf|celstraf|gevangenisstraf|tijd|termijn|duur|looptijd|contract|huwelijk|relatie|reis|afwezigheid)\s+)van\s+(?:ongeveer\s+|rond\s+|bijna\s+|ruim\s+|zo['’]n\s+)?(\d{1,3})\s+jaar(?![\p{L}\p{N}])(?!\s+(?:geleden|lang|later|terug|oud)(?![\p{L}\p{N}]))/giu, label: '{n} jaar' },
  ],

  // Vormen van een bijvoeglijk naamwoord (zonder accenten, in kleine letters): de grondvorm en de
  // verbogen vorm op -e, met de gewone spellingwisselingen: groot → grote, dun → dunne,
  // grijs → grijze, lief → lieve, donker → donkere. Waar de spelling twijfelt (hees → hese,
  // boos → boze; grof → grove, laf → laffe), komen beide vormen mee.
  forms(word) {
    const out = new Set([word]);
    // Onverbuigbaar: op -e (oranje, roze), op -en na een medeklinker (gebogen, open, verlegen)
    // of op één losse klinker (lila, sexy).
    if (/e$/.test(word) || /[^aeiou]en$/.test(word) || /(^|[^aeiouy])[aiouy]$/.test(word)) return [...out];
    const m = /(ij|[aeiouy]+)([^aeiouy]*)$/.exec(word);
    if (!m) return [...out];
    const [, vowel, cons] = m;
    const prefix = word.slice(0, word.length - vowel.length - cons.length);
    const add = (stem) => out.add(stem + 'e');
    const syllables = (word.match(/ij|[aeiouy]+/g) || []).length;
    if (!cons) {
      // Eindigt op een tweeklank of ij: mooi → mooie, blij → blije, lui → luie.
      add(word);
    } else if (cons.length === 1) {
      const c = cons;
      if (vowel.length > 1 || vowel === 'ij') {
        // Lange klinker: een dubbele klinker wordt enkel in een open lettergreep (groot → grote, kaal → kale).
        const root = prefix + (/(aa|ee|oo|uu)$/.test(vowel) ? vowel.slice(0, -1) : vowel);
        if (c === 's') { add(root + 'z'); add(root + 's'); } // grijs → grijze, boos → boze, hees → hese
        else if (c === 'f') { add(root + 'v'); add(root + 'f'); } // lief → lieve, doof → dove
        else add(root + c);
      } else {
        // Korte klinker: de medeklinker wordt verdubbeld (dun → dunne, wit → witte), behalve in een
        // onbeklemtoonde slotlettergreep (donker → donkere, krullig → krullige, ijdel → ijdele).
        const unstressed = syllables > 1 && /^(?:e[lmnr]|ig|ik)$/.test(vowel + c);
        if (unstressed || 'wxhj'.includes(c)) add(word); // ruw → ruwe
        else if (c === 'f') { add(word + 'f'); add(word.slice(0, -1) + 'v'); } // laf → laffe, grof → grove
        else add(word + c);
      }
    } else if (/[lr]f$/.test(cons)) {
      add(word.slice(0, -1) + 'v'); // half → halve
      add(word);
    } else {
      add(word); // zwart → zwarte, sarcastisch → sarcastische
    }
    return [...out];
  },
};
