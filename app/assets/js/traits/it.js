// Foglio dei tratti in italiano: le parole chiave con cui si estraggono i tratti da un testo.
// Si può ampliare liberamente: basta aggiungere parole agli elenchi (al maschile singolare;
// le forme al femminile e al plurale si generano da sole con forms()).
// In italiano l’aggettivo va di solito dopo il nome («occhi azzurri»), ma può anche precederlo
// («lunghi capelli neri»): si guardano entrambi i lati, come in spagnolo.
export default {
  // Parti o attributi che si descrivono con aggettivi. `groups` indica quali elenchi di
  // aggettivi si applicano; `presence` significa che nominarlo è già un tratto («porta gli occhiali»).
  features: [
    { nouns: ['occhio', 'occhi', 'sguardo'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['capelli', 'capello', 'chioma', 'capigliatura', 'zazzera', 'ciocche', 'riccioli'], groups: ['color', 'hair', 'length'] },
    { nouns: ['pelle', 'carnagione', 'incarnato', 'colorito'], groups: ['color', 'skin'] },
    { nouns: ['barba'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['baffi', 'baffo', 'pizzetto'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['naso'], groups: ['size', 'nose'] },
    { nouns: ['labbra', 'labbro', 'bocca'], groups: ['size', 'lips', 'color'] },
    { nouns: ['viso', 'volto', 'faccia', 'lineamenti'], groups: ['face', 'size'] },
    { nouns: ['mani', 'mano', 'dita'], groups: ['size', 'hands', 'length'] },
    { nouns: ['voce'], groups: ['voice'] },
    { nouns: ['sopracciglia', 'sopracciglio'], groups: ['color', 'density', 'size'] },
    { nouns: ['spalle', 'schiena'], groups: ['size', 'shoulders'] },
    { nouns: ['gambe', 'braccia'], groups: ['length', 'size', 'hands'] },
    { nouns: ['sorriso'], groups: ['smile', 'size'] },
    { nouns: ['occhiali'], groups: ['size'], presence: true },
    { nouns: ['lentiggini'], groups: [], presence: true },
    { nouns: ['cicatrice', 'cicatrici'], groups: ['size'], presence: true },
    { nouns: ['tatuaggio', 'tatuaggi'], groups: ['size'], presence: true },
    { nouns: ['neo'], groups: [], presence: true },
    { nouns: ['rughe'], groups: [], presence: true },
    { nouns: ['zoppia'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['azzurro', 'blu', 'celeste', 'verde', 'marrone', 'castano', 'nero', 'biondo', 'rosso', 'rossiccio', 'ramato', 'grigio',
      'brizzolato', 'bianco', 'canuto', 'argenteo', 'argentato', 'dorato', 'bruno', 'moro', 'pallido', 'scuro', 'chiaro', 'nocciola',
      'ambrato', 'violetto', 'rosato', 'roseo', 'abbronzato', 'olivastro', 'corvino', 'mogano', 'cenere', 'fulvo', 'rame'],
    hair: ['liscio', 'riccio', 'ricciuto', 'ondulato', 'mosso', 'crespo', 'intrecciato', 'rasato', 'spettinato', 'arruffato', 'scompigliato',
      'setoso', 'unto', 'grasso', 'rado', 'fine', 'sottile', 'folto', 'spesso', 'raccolto', 'sciolto', 'lucente', 'lucido', 'arricciato'],
    length: ['lungo', 'corto', 'lunghissimo', 'cortissimo'],
    size: ['grande', 'piccolo', 'enorme', 'minuscolo', 'largo', 'stretto', 'sottile', 'spesso', 'tondo', 'rotondo', 'gigantesco', 'grosso'],
    eyes: ['allungato', 'infossato', 'sporgente', 'brillante', 'vivace', 'spento', 'triste', 'penetrante', 'profondo', 'sognante',
      'stanco', 'inquieto', 'freddo', 'caldo', 'luminoso', 'dolce', 'malinconico'],
    skin: ['morbido', 'liscio', 'ruvido', 'rugoso', 'grinzoso', 'levigato', 'vellutato', 'segnato', 'lentigginoso', 'glabro', 'delicato', 'diafano'],
    nose: ['aquilino', 'camuso', 'schiacciato', 'dritto', 'diritto', 'adunco', 'affilato', 'storto', 'prominente', 'pronunciato', 'greco', 'rincagnato'],
    lips: ['carnoso', 'sottile', 'screpolato', 'pieno', 'tumido'],
    face: ['allungato', 'ovale', 'spigoloso', 'angoloso', 'affilato', 'squadrato', 'quadrato', 'scavato', 'emaciato', 'smunto', 'infantile',
      'segnato', 'lentigginoso', 'rugoso', 'paffuto', 'tondo', 'rotondo'],
    hands: ['forte', 'delicato', 'calloso', 'ossuto', 'nodoso', 'muscoloso', 'sottile', 'affusolato', 'tozzo', 'robusto'],
    shoulders: ['curvo', 'ricurvo', 'cadente', 'spiovente', 'dritto', 'largo', 'forte', 'possente', 'stretto'],
    voice: ['grave', 'profondo', 'acuto', 'roco', 'rauco', 'morbido', 'dolce', 'stridulo', 'aspro', 'melodioso', 'nasale', 'incrinato',
      'fermo', 'pacato', 'vellutato', 'potente', 'debole', 'flebile', 'squillante', 'cavernoso', 'caldo', 'basso', 'alto'],
    density: ['folto', 'fitto', 'rado', 'ispido', 'curato', 'trascurato', 'incolto', 'spesso', 'sottile', 'fine'],
    smile: ['franco', 'timido', 'storto', 'sghembo', 'ampio', 'triste', 'beffardo', 'caldo', 'forzato', 'aperto', 'radioso', 'smagliante', 'malizioso'],
  },

  // Tratti che valgono da soli («è alto e timido»).
  standalone: [
    // Corporatura
    'alto', 'basso', 'magro', 'snello', 'esile', 'grasso', 'obeso', 'corpulento', 'robusto', 'tarchiato', 'muscoloso', 'atletico',
    'slanciato', 'minuto', 'paffuto', 'segaligno', 'allampanato', 'curvo', 'gobbo', 'massiccio', 'mingherlino', 'smilzo',
    // Aspetto
    'attraente', 'bello', 'affascinante', 'brutto', 'elegante', 'trasandato', 'calvo', 'pelato', 'barbuto', 'lentigginoso',
    'brizzolato', 'biondo', 'bruno', 'moro', 'pallido', 'canuto',
    // Età
    'giovane', 'anziano', 'vecchio', 'adolescente',
    // Carattere
    'timido', 'coraggioso', 'codardo', 'vigliacco', 'generoso', 'egoista', 'intelligente', 'astuto', 'furbo', 'ingenuo', 'orgoglioso',
    'umile', 'gentile', 'crudele', 'leale', 'diffidente', 'ambizioso', 'pigro', 'laborioso', 'impulsivo', 'paziente', 'impaziente',
    'allegro', 'malinconico', 'solitario', 'socievole', 'introverso', 'estroverso', 'ottimista', 'pessimista', 'testardo', 'cocciuto',
    'geloso', 'curioso', 'riservato', 'arrogante', 'sensibile', 'affettuoso', 'violento', 'tranquillo', 'calmo', 'nervoso', 'onesto',
    'bugiardo', 'sarcastico', 'ironico', 'rancoroso', 'temerario', 'prudente', 'sincero', 'chiacchierone', 'taciturno', 'silenzioso',
    'metodico', 'superstizioso', 'religioso', 'ateo', 'ribelle', 'obbediente', 'vanitoso', 'insicuro', 'manipolatore', 'scontroso',
    'irascibile', 'permaloso', 'cinico', 'premuroso',
    // Condizione
    'mancino', 'zoppo', 'cieco', 'sordo', 'muto', 'guercio', 'monco',
  ],

  // Parole che possono stare tra il nome e i suoi aggettivi senza interrompere la descrizione.
  fillers: ['è', 'sono', 'era', 'erano', 'sembra', 'sembrava', 'molto', 'piuttosto', 'abbastanza', 'assai', 'di', 'del', 'della', 'dei',
    'delle', 'colore', 'color', 'e', 'ed', 'o', 'ma', 'però', 'così', 'tanto', 'più', 'un', 'uno', 'una', 'po', 'poco', 'quasi',
    'sempre', 'ha', 'aveva', 'porta', 'portava', 'il', 'lo', 'la', 'i', 'gli', 'le', 'suo', 'sua', 'suoi', 'sue', 'anche', 'tendente',
    'al', 'tra', 'fra', 'leggermente', 'appena', 'ben', 'bene'],

  negations: ['non', 'né', 'mai', 'senza', 'nessun', 'nessuno', 'nessuna', 'niente', 'nulla', 'neanche', 'nemmeno', 'neppure', 'privo', 'priva'],

  // Età espressa con un numero: «ha 34 anni», «un uomo di 60 anni», «ha compiuto 40 anni».
  // Non conta «da più di 20 anni» né «dopo 5 anni» o «nel giro di 3 anni»: quella non è un’età.
  age: [{ regex: /(?<![\p{L}\p{N}])(?:ha|aveva|avrà|avra|ho|compie|compiva|compiuto|compiuti|(?<!(?:più|piu|meno|dopo|prima|oltre|circa|giro|arco|corso|spazio)\s+)di)\s+(?:circa\s+|quasi\s+|appena\s+|solo\s+)?(\d{1,3})\s+anni(?![\p{L}\p{N}])/giu, label: '{n} anni' }],

  // Riceve la parola al maschile singolare, senza accenti, e restituisce le sue forme:
  // maschile e femminile, singolare e plurale (alto → alta, alti, alte; verde → verdi).
  forms(word) {
    if (word.endsWith('tore')) {
      const stem = word.slice(0, -4);
      return [word, stem + 'trice', stem + 'tori', stem + 'trici'];
    }
    if (word.endsWith('one')) {
      const stem = word.slice(0, -3);
      return [word, stem + 'ona', stem + 'oni', stem + 'one'];
    }
    if (/[cg]o$/.test(word)) {
      // bianco → bianchi, simpatico → simpatici: si generano le due possibilità.
      const stem = word.slice(0, -1);
      const h = stem + 'h';
      return [word, stem + 'a', h + 'i', stem + 'i', h + 'e'];
    }
    if (word.endsWith('io')) {
      // grigio → grigia, grigi, grigie; liscio → lisce.
      const stem = word.slice(0, -2);
      return [word, stem + 'ia', stem + 'i', stem + 'ie', stem + 'e'];
    }
    if (word.endsWith('o')) {
      const stem = word.slice(0, -1);
      return [word, stem + 'a', stem + 'i', stem + 'e'];
    }
    if (word.endsWith('a')) {
      // egoista, ottimista: -a al singolare, -i e -e al plurale.
      const stem = word.slice(0, -1);
      return [word, stem + 'i', stem + 'e'];
    }
    if (word.endsWith('e')) return [word, word.slice(0, -1) + 'i'];
    return [word]; // blu e gli altri invariabili
  },
};
