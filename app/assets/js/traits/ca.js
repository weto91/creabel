// Full de trets en català: les paraules clau amb què s’extreuen trets d’un text.
// Es pot ampliar lliurement: n’hi ha prou d’afegir paraules a les llistes (en masculí singular;
// les formes en femení i plural es generen soles amb forms()).
// Les paraules amb apòstrof («d'ulls», «l'esquena») porten l’apòstrof recte entre cometes dobles,
// com al full anglès: el lector de text el converteix així abans de comparar.
// Les paraules amb ela geminada (pàl·lid, intel·ligent) no hi són: el lector talla la paraula pel
// punt volat i no les reconeixeria.

// Adjectius amb formes que no surten de les regles generals (sense accents, com arriben a forms()).
const IRREGULAR = {
  ros: ['ros', 'rossa', 'rossos', 'rosses'],
  more: ['more', 'morena', 'morens', 'morenes'],
  bru: ['bru', 'bruna', 'bruns', 'brunes'],
  marro: ['marro', 'marrons'],
  rodo: ['rodo', 'rodona', 'rodons', 'rodones'],
  xato: ['xato', 'xata', 'xatos', 'xates'],
  fi: ['fi', 'fina', 'fines'], // sense «fins», que és sobretot la preposició
  geganti: ['geganti', 'gegantina', 'gegantins', 'gegantines'],
  lleig: ['lleig', 'lletja', 'lletjos', 'lletges', 'lleigs'],
  ancia: ['ancia', 'anciana', 'ancians', 'ancianes'],
  esquerra: ['esquerrana', 'esquerrans', 'esquerranes'], // «esquerra» sola és la mà o el costat
};

export default {
  // Parts o atributs que es descriuen amb adjectius. `groups` indica quines llistes
  // d’adjectius s’hi apliquen; `presence` vol dir que anomenar-lo ja és un tret («porta ulleres»).
  features: [
    { nouns: ['ull', 'ulls', 'mirada', "d'ulls"], groups: ['color', 'size', 'eyes'] },
    { nouns: ['cabell', 'cabells', 'cabellera', 'melena', 'rínxols'], groups: ['color', 'hair', 'length'] },
    { nouns: ['pell', 'cutis'], groups: ['color', 'skin'] },
    { nouns: ['barba'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['bigoti', 'bigotis'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nas'], groups: ['size', 'nose'] },
    { nouns: ['llavis', 'boca'], groups: ['size', 'lips', 'color'] },
    { nouns: ['cara', 'rostre', 'faccions'], groups: ['face', 'size'] },
    { nouns: ['mans', 'dits'], groups: ['size', 'hands', 'length'] },
    { nouns: ['veu'], groups: ['voice'] },
    { nouns: ['celles'], groups: ['color', 'density', 'size'] },
    { nouns: ['espatlles', 'esquena', "l'esquena"], groups: ['size', 'shoulders'] },
    { nouns: ['cames', 'braços'], groups: ['length', 'size', 'hands'] },
    { nouns: ['somriure'], groups: ['smile', 'size'] },
    { nouns: ['ulleres'], groups: ['size'], presence: true },
    { nouns: ['piga', 'pigues'], groups: [], presence: true },
    { nouns: ['cicatriu', 'cicatrius'], groups: ['size'], presence: true },
    { nouns: ['tatuatge', 'tatuatges'], groups: ['size'], presence: true },
    { nouns: ['arrugues'], groups: [], presence: true },
    { nouns: ['canes'], groups: [], presence: true },
    { nouns: ['coixesa'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['blau', 'verd', 'marró', 'castany', 'negre', 'ros', 'roig', 'vermell', 'rogenc', 'gris', 'blanc', 'canós',
      'platejat', 'daurat', 'morè', 'bru', 'fosc', 'clar', 'mel', 'avellana', 'ambre', 'violeta', 'coure', 'caoba', 'rosat',
      'bronzejat', 'torrat', 'olivaci', 'atzabeja', 'cendrós'],
    hair: ['llis', 'arrissat', 'ondulat', 'cresp', 'trenat', 'rapat', 'despentinat', 'esbullat', 'sedós', 'greixós',
      'esclarissat', 'fi', 'espès', 'abundant', 'recollit', 'solt', 'embullat', 'eriçat'],
    length: ['llarg', 'curt', 'llarguíssim', 'curtíssim'],
    size: ['gran', 'petit', 'enorme', 'diminut', 'ample', 'estret', 'fi', 'gruixut', 'rodó', 'gegantí'],
    eyes: ['ametllat', 'enfonsat', 'sortit', 'brillant', 'viu', 'apagat', 'trist', 'penetrant', 'profund', 'somiador',
      'cansat', 'inquiet', 'fred', 'càlid', 'tendre', 'rialler'],
    skin: ['suau', 'aspre', 'arrugat', 'llis', 'colrat', 'pigat', 'imberbe', 'delicat', 'fi'],
    nose: ['aguilenc', 'xato', 'arremangat', 'recte', 'ganxut', 'esmolat', 'tort', 'prominent', 'punxegut'],
    lips: ['carnós', 'prim', 'esquerdat', 'gruixut'],
    face: ['allargat', 'ovalat', 'angulós', 'quadrat', 'esmolat', 'demacrat', 'xupat', 'infantil', 'colrat', 'pigat',
      'arrugat', 'rodó'],
    hands: ['fort', 'delicat', 'callós', 'ossut', 'musculós', 'prim'],
    shoulders: ['caigut', 'carregat', 'encorbat', 'recte', 'fort', 'ample'],
    voice: ['greu', 'agut', 'ronc', 'rogallós', 'suau', 'dolç', 'profund', 'estrident', 'aspre', 'melodiós', 'nasal',
      'esquerdat', 'ferm', 'trencat', 'pausat', 'vellutat', 'potent', 'feble', 'alt', 'baix'],
    density: ['poblat', 'espès', 'esclarissat', 'tancat', 'retallat', 'cuidat', 'descuidat', 'fi', 'abundant'],
    smile: ['franc', 'tímid', 'tort', 'ampli', 'trist', 'burleta', 'càlid', 'forçat', 'murri', 'tendre'],
  },

  // Trets que valen per si sols («és alt i tímid»).
  standalone: [
    // Complexió
    'alt', 'baix', 'prim', 'flac', 'gras', 'obès', 'corpulent', 'robust', 'fornit', 'musculós', 'atlètic',
    'esvelt', 'menut', 'rabassut', 'escanyolit', 'desmanegat', 'espigat', 'encorbat', 'geperut',
    // Aspecte
    'atractiu', 'bonic', 'formós', 'bell', 'lleig', 'elegant', 'desastrat', 'polit', 'calb', 'barbut', 'pigat',
    'canós', 'ros', 'morè',
    // Edat
    'jove', 'ancià', 'adolescent',
    // Caràcter
    'tímid', 'valent', 'covard', 'generós', 'egoista', 'savi', 'astut', 'ingenu', 'orgullós', 'humil',
    'amable', 'cruel', 'lleial', 'desconfiat', 'ambiciós', 'mandrós', 'treballador', 'impulsiu', 'pacient', 'impacient',
    'alegre', 'melangiós', 'solitari', 'sociable', 'introvertit', 'extravertit', 'extrovertit', 'optimista', 'pessimista',
    'tossut', 'obstinat', 'gelós', 'curiós', 'reservat', 'arrogant', 'sensible', 'afectuós', 'carinyós', 'violent',
    'tranquil', 'nerviós', 'honest', 'mentider', 'sarcàstic', 'bondadós', 'rancorós', 'temerari', 'prudent', 'sincer',
    'xerraire', 'callat', 'metòdic', 'supersticiós', 'religiós', 'ateu', 'rebel', 'obedient', 'vanitós', 'insegur',
    'manipulador',
    // Condició
    'esquerrà', 'coix', 'cec', 'sord', 'mut', 'borni',
  ],

  // Paraules que poden anar entre el substantiu i els seus adjectius sense trencar la descripció.
  fillers: ['és', 'són', 'era', 'eren', 'està', 'estan', 'estava', 'estaven', 'molt', 'força', 'bastant', 'de', 'del',
    "d'un", "d'una", 'color', 'i', 'o', 'però', 'tan', 'més', 'ben', 'un', 'una', 'mica', 'poc', 'gairebé', 'quasi',
    'sempre', 'té', 'tenia', 'porta', 'portava', 'duia', 'el', 'la', 'els', 'les', 'seu', 'seva', 'seus', 'seves',
    'encara', 'que', 'tirant', 'a', 'entre', 'amb'],

  negations: ['no', 'ni', 'mai', 'sense', 'res', 'gens', 'tampoc'],

  // Edat expressada amb número: «té 34 anys», «un home de 60 anys», «una nena d’11 anys».
  // No compta «fa 20 anys», «més de 20 anys» ni «al cap de 5 anys»: això no és una edat.
  age: [{ regex: /(?<![\p{L}\p{N}])(?:(?:té|tenia|tinc|tens|tenen|tenien|tindrà|tindria|compleix|complia|complirà|complir|complerts|fet)\s+|(?<!(?:més|mes|menys|després|despres|abans|dins|cap|llarg|partir|prop)\s+)(?:de\s+|d['’]))(?:uns\s+|gairebé\s+|gairebe\s+|quasi\s+)?(\d{1,3})\s+anys(?![\p{L}\p{N}])/giu, label: '{n} anys' }],

  forms(word) {
    if (IRREGULAR[word]) return IRREGULAR[word];
    const stem = word.slice(0, -1);
    const last = word.slice(-1);
    const out = new Set([word]);
    const add = (...forms) => forms.forEach((f) => out.add(f));
    if (last === 'a') add(stem + 'es'); // egoista, egoistes
    else if (last === 'e') add(word + 's', stem + 'a', stem + 'es'); // negre, negra, negres
    else if (last === 'o') add(word + 's', stem + 'a', stem + 'es');
    else if (last === 'i') add(word + 'a', word + 's', word + 'es'); // savi, sàvia, savis, sàvies
    else if (last === 'u') add(word + 's', stem + 'va', stem + 'ves', word + 'a', word + 'es', stem + 'a', stem + 'es'); // blau, blava; ingenu, ingènua; ateu, atea
    else if (last === 's') add(word + 'a', word + 'os', word + 'es', word + 'sa', word + 'sos', word + 'ses'); // gris, grisa; gras, grassa
    else if (last === 'x') add(word + 'a', word + 'os', word + 'es'); // baix, baixa, baixos, baixes
    else if (last === 'c') add(word + 'a', word + 's', word + 'os', word + 'es', stem + 'ques', stem + 'ga', stem + 'gues'); // blanc, blanques; groc, groga; dolç, dolços
    else if (last === 'g') {
      add(word + 'a', word + 's', word + 'os', stem + 'gues'); // llarg, llargues
      if (word.endsWith('ig')) { const s = word.slice(0, -2); add(s + 'ja', s + 'jos', s + 'ges'); } // roig, roja, rojos, roges
    } else if (last === 't') add(word + 'a', word + 's', word + 'os', word + 'es', stem + 'da', stem + 'des'); // curt, curta; agut, aguda; trist, tristos
    else add(word + 'a', word + 's', word + 'es'); // verd, verda, verds, verdes
    return [...out];
  },
};
