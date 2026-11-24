// Folha de traços em português (Brasil e Portugal): as palavras-chave com que se extraem traços
// de um texto. Pode ser ampliada à vontade: basta acrescentar palavras às listas (no masculino
// singular; as formas no feminino e no plural são geradas sozinhas). Quando o Brasil e Portugal
// usam palavras diferentes, as duas estão na lista («marrom» e «castanho», «cacheado» e
// «encaracolado», «manco» e «coxo»…). Os acentos não contam: «trêmulo» e «trémulo» são a mesma palavra.
export default {
  // Partes ou atributos que se descrevem com adjetivos. `groups` indica que listas de
  // adjetivos se aplicam a eles; `presence` significa que nomeá-lo já é um traço («usa óculos»).
  features: [
    { nouns: ['olho', 'olhos', 'olhar'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['cabelo', 'cabelos', 'cabeleira', 'madeixas', 'melena', 'melenas', 'cachos', 'caracóis'], groups: ['color', 'hair', 'length'] },
    { nouns: ['pele', 'tez', 'cútis'], groups: ['color', 'skin'] },
    { nouns: ['barba'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['bigode', 'bigodes'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nariz'], groups: ['size', 'nose'] },
    { nouns: ['lábios', 'boca'], groups: ['size', 'lips', 'color'] },
    { nouns: ['rosto', 'cara', 'feições', 'semblante'], groups: ['face', 'size'] },
    { nouns: ['mãos', 'dedos'], groups: ['size', 'hands', 'length'] },
    { nouns: ['voz'], groups: ['voice'] },
    { nouns: ['sobrancelhas', 'sobrolho'], groups: ['color', 'density', 'size'] },
    { nouns: ['ombros', 'costas'], groups: ['size', 'shoulders'] },
    { nouns: ['pernas', 'braços'], groups: ['length', 'size', 'hands'] },
    { nouns: ['sorriso'], groups: ['smile', 'size'] },
    { nouns: ['óculos', 'lentes'], groups: ['size'], presence: true },
    { nouns: ['sardas'], groups: [], presence: true },
    { nouns: ['cicatriz', 'cicatrizes'], groups: ['size'], presence: true },
    { nouns: ['tatuagem', 'tatuagens'], groups: ['size'], presence: true },
    { nouns: ['pinta', 'pintas', 'verruga', 'verrugas'], groups: [], presence: true },
    { nouns: ['rugas'], groups: [], presence: true },
    { nouns: ['cãs'], groups: [], presence: true },
    { nouns: ['manqueira', 'coxeira'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['azul', 'verde', 'castanho', 'marrom', 'preto', 'negro', 'loiro', 'louro', 'aloirado', 'alourado', 'ruivo', 'vermelho',
      'avermelhado', 'cinza', 'cinzento', 'acinzentado', 'grisalho', 'branco', 'alvo', 'prateado', 'dourado', 'moreno', 'pálido',
      'escuro', 'claro', 'mel', 'avelã', 'âmbar', 'violeta', 'acobreado', 'mogno', 'rosado', 'corado', 'bronzeado', 'trigueiro',
      'azeitonado', 'azeviche', 'acastanhado', 'esverdeado', 'azulado', 'arruivado'],
    hair: ['liso', 'escorrido', 'crespo', 'cacheado', 'encaracolado', 'ondulado', 'frisado', 'encrespado', 'trançado', 'raspado',
      'rapado', 'despenteado', 'desgrenhado', 'revolto', 'sedoso', 'oleoso', 'ensebado', 'ralo', 'fino', 'grosso', 'espesso', 'farto',
      'abundante', 'preso', 'solto', 'emaranhado', 'armado', 'volumoso'],
    length: ['comprido', 'longo', 'curto', 'compridíssimo', 'longuíssimo', 'curtíssimo'],
    size: ['grande', 'pequeno', 'pequenino', 'enorme', 'minúsculo', 'largo', 'estreito', 'fino', 'grosso', 'redondo', 'gigantesco'],
    eyes: ['puxado', 'amendoado', 'fundo', 'encovado', 'esbugalhado', 'arregalado', 'brilhante', 'vivo', 'apagado', 'triste',
      'penetrante', 'rasgado', 'profundo', 'sonhador', 'cansado', 'inquieto', 'frio', 'caloroso', 'cálido', 'expressivo', 'vivaz'],
    skin: ['suave', 'macio', 'áspero', 'enrugado', 'curtido', 'sardento', 'imberbe', 'glabro', 'delicado', 'macilento', 'liso'],
    nose: ['aquilino', 'adunco', 'achatado', 'chato', 'arrebitado', 'reto', 'direito', 'afilado', 'torto', 'proeminente', 'bicudo'],
    lips: ['carnudo', 'grosso', 'fino', 'delgado', 'rachado', 'gretado', 'ressecado'],
    face: ['alongado', 'oval', 'ovalado', 'anguloso', 'afilado', 'quadrado', 'redondo', 'encovado', 'abatido', 'macilento', 'chupado',
      'juvenil', 'infantil', 'curtido', 'sardento', 'enrugado'],
    hands: ['forte', 'delicado', 'calejado', 'ossudo', 'nodoso', 'musculoso', 'magro', 'delgado', 'esguio', 'fino'],
    shoulders: ['caído', 'curvado', 'encurvado', 'largo', 'reto', 'direito', 'forte', 'estreito'],
    voice: ['grave', 'agudo', 'rouco', 'suave', 'doce', 'profundo', 'estridente', 'áspero', 'melodioso', 'nasal', 'fanhoso', 'cavernoso',
      'firme', 'trêmulo', 'pausado', 'arrastado', 'cantado', 'aveludado', 'potente', 'fraco', 'débil', 'esganiçado'],
    density: ['espesso', 'cerrado', 'basto', 'farto', 'ralo', 'aparado', 'cuidado', 'descuidado', 'fino', 'hirsuto', 'falhado', 'grosso'],
    smile: ['franco', 'tímido', 'torto', 'largo', 'aberto', 'triste', 'trocista', 'zombeteiro', 'irônico', 'sarcástico', 'maroto',
      'matreiro', 'caloroso', 'forçado'],
  },

  // Traços que valem por si sós («é alto e tímido»).
  standalone: [
    // Compleição
    'alto', 'baixo', 'baixinho', 'baixote', 'magro', 'magricela', 'franzino', 'mirrado', 'raquítico', 'gordo', 'gorducho', 'obeso',
    'rechonchudo', 'roliço', 'anafado', 'corpulento', 'robusto', 'encorpado', 'troncudo', 'entroncado', 'espadaúdo', 'musculoso',
    'atlético', 'esbelto', 'esguio', 'desengonçado', 'encurvado', 'corcunda',
    // Aparência
    'atraente', 'bonito', 'bonitão', 'belo', 'lindo', 'formoso', 'charmoso', 'feio', 'elegante', 'janota', 'desleixado', 'desalinhado',
    'asseado', 'careca', 'calvo', 'barbudo', 'sardento', 'grisalho', 'loiro', 'louro', 'moreno', 'ruivo', 'pálido',
    // Idade
    'jovem', 'idoso', 'velho', 'ancião', 'adolescente',
    // Caráter
    'tímido', 'corajoso', 'valente', 'covarde', 'cobarde', 'generoso', 'egoísta', 'inteligente', 'astuto', 'esperto', 'ingênuo',
    'orgulhoso', 'humilde', 'amável', 'gentil', 'simpático', 'antipático', 'cruel', 'leal', 'desconfiado', 'ambicioso', 'preguiçoso',
    'trabalhador', 'impulsivo', 'paciente', 'impaciente', 'alegre', 'melancólico', 'solitário', 'sociável', 'introvertido',
    'extrovertido', 'otimista', 'optimista', 'pessimista', 'teimoso', 'cabeçudo', 'obstinado', 'ciumento', 'curioso', 'reservado',
    'arrogante', 'sensível', 'carinhoso', 'afetuoso', 'afectuoso', 'violento', 'tranquilo', 'calmo', 'nervoso', 'honesto',
    'mentiroso', 'sarcástico', 'bondoso', 'rancoroso', 'temerário', 'prudente', 'sincero', 'falador', 'tagarela', 'calado',
    'metódico', 'distraído', 'desajeitado', 'trapalhão', 'brincalhão', 'mandão', 'resmungão', 'sonhador', 'supersticioso',
    'religioso', 'ateu', 'rebelde', 'obediente', 'vaidoso', 'inseguro', 'manipulador', 'autoritário',
    // Condição
    'canhoto', 'esquerdino', 'coxo', 'manco', 'perneta', 'cego', 'surdo', 'mudo', 'gago', 'zarolho', 'caolho', 'maneta',
  ],

  // Palavras que podem ficar entre o substantivo e os adjetivos sem quebrar a descrição.
  fillers: ['é', 'são', 'era', 'eram', 'foi', 'foram', 'está', 'esta', 'estão', 'estava', 'estavam', 'fica', 'ficava', 'parece',
    'parecia', 'muito', 'bastante', 'bem', 'meio', 'de', 'do', 'da', 'dos', 'das', 'cor', 'e', 'ou', 'mas', 'tão', 'mais', 'um', 'uma',
    'pouco', 'algo', 'quase', 'sempre', 'ainda', 'já', 'tem', 'têm', 'tinha', 'tinham', 'usa', 'usava', 'traz', 'trazia', 'leva',
    'levava', 'o', 'a', 'os', 'as', 'seu', 'sua', 'seus', 'suas', 'dele', 'dela', 'que', 'embora', 'puxando', 'puxado', 'para', 'pro',
    'pra', 'entre', 'ligeiramente', 'levemente'],

  negations: ['não', 'nem', 'nunca', 'sem', 'nada', 'jamais', 'tampouco', 'nenhum', 'nenhuma'],

  // Idade expressa com número: «tem 34 anos», «um homem de 60 anos», «aos 20 anos».
  // Não conta «há mais de 20 anos», «depois de 5 anos» nem «tem 20 anos de casado»: isso não é uma idade.
  age: [{ regex: /(?<![\p{L}\p{N}])(?:tem|têm|tinha|tinham|tenho|tínhamos|teria|terá|tera|fez|fizera|completou|completa|completara|completava|completará|completara|aos|com|(?<!(?:mais|menos|depois|antes|dentro|cabo|fim|cerca|perto|além|alem|partir|período|periodo|prazo|pena|espaço|espaco|intervalo|durante)\s+)de)\s+(?:cerca\s+de\s+|uns\s+|umas\s+|quase\s+|apenas\s+|só\s+|so\s+|mal\s+|já\s+|ja\s+)?(\d{1,3})\s+anos(?![\p{L}\p{N}])(?!\s+de\s+(?!idade(?![\p{L}\p{N}])))/giu, label: '{n} anos' }],

  // Recebe a palavra já sem acentos e em minúsculas; devolve as formas em que pode aparecer.
  forms(word) {
    // -ão: chorão, chorona, chorões; ancião, anciã, anciãos, anciães
    if (word.endsWith('ao')) {
      const stem = word.slice(0, -2);
      return [word, stem + 'ona', stem + 'onas', stem + 'oes', stem + 'aos', stem + 'aes', stem + 'a', stem + 'as'];
    }
    // -eu: ateu, ateia, ateus, ateias
    if (word.endsWith('eu')) {
      const stem = word.slice(0, -1);
      return [word, word + 's', stem + 'ia', stem + 'ias'];
    }
    // -o: alto, alta, altos, altas
    if (word.endsWith('o')) {
      const stem = word.slice(0, -1);
      return [word, stem + 'a', word + 's', stem + 'as'];
    }
    // -a, -e, -i, -u: verde, verdes; egoísta, egoístas
    if (/[aeiu]$/.test(word)) return [word, word + 's'];
    // -il: gentil, gentis; frágil, frágeis (sem acentos não se distinguem: geram-se as duas)
    if (word.endsWith('il')) {
      const stem = word.slice(0, -2);
      return [word, stem + 'is', stem + 'eis'];
    }
    // -al, -el, -ol, -ul: leal, leais; cruel, cruéis; azul, azuis; espanhol, espanhola, espanhóis
    if (/[aeou]l$/.test(word)) {
      const stem = word.slice(0, -1);
      return [word, stem + 'is', word + 'a', word + 'as'];
    }
    // -or: trabalhador, trabalhadora, trabalhadores, trabalhadoras
    if (word.endsWith('or')) return [word, word + 'a', word + 'es', word + 'as'];
    // -ês: português, portuguesa, portugueses, portuguesas
    if (word.endsWith('es')) return [word, word + 'a', word + 'es', word + 'as'];
    // -m: jovem, jovens; marrom, marrons
    if (word.endsWith('m')) return [word, word.slice(0, -1) + 'ns'];
    // -r, -z: regular, regulares; feliz, felizes
    if (/[rz]$/.test(word)) return [word, word + 'es'];
    if (word.endsWith('s')) return [word];
    return [word, word + 's', word + 'es'];
  },
};
