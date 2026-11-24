// Folla de trazos en galego: as palabras clave coas que se extraen trazos dun texto.
// Pódese ampliar libremente: abonda con engadir palabras ás listas (en masculino singular;
// as formas en feminino e plural xéranse soas con forms()).
export default {
  // Partes ou atributos que se describen con adxectivos. `groups` indica que listas de
  // adxectivos lles aplican; `presence` significa que nomealo xa é un trazo («leva lentes»).
  features: [
    { nouns: ['ollo', 'ollos', 'mirada'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['pelo', 'cabelo', 'cabelos', 'melena', 'cabeleira', 'guedellas', 'rizos'], groups: ['color', 'hair', 'length'] },
    { nouns: ['pel', 'tez', 'cute'], groups: ['color', 'skin'] },
    { nouns: ['barba'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['bigote', 'bigotes'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nariz'], groups: ['size', 'nose'] },
    { nouns: ['beizos', 'labios', 'boca'], groups: ['size', 'lips', 'color'] },
    { nouns: ['rostro', 'cara', 'faccións', 'trazos'], groups: ['face', 'size'] },
    { nouns: ['mans', 'dedos'], groups: ['size', 'hands', 'length'] },
    { nouns: ['voz'], groups: ['voice'] },
    { nouns: ['cellas'], groups: ['color', 'density', 'size'] },
    { nouns: ['ombreiros', 'costas', 'lombo'], groups: ['size', 'shoulders'] },
    { nouns: ['pernas', 'brazos'], groups: ['length', 'size', 'hands'] },
    { nouns: ['sorriso'], groups: ['smile', 'size'] },
    { nouns: ['lentes', 'anteollos', 'gafas'], groups: ['size'], presence: true },
    { nouns: ['sardas', 'pencas'], groups: [], presence: true },
    { nouns: ['cicatriz', 'cicatrices'], groups: ['size'], presence: true },
    { nouns: ['tatuaxe', 'tatuaxes'], groups: ['size'], presence: true },
    { nouns: ['lunar', 'lunares'], groups: [], presence: true },
    { nouns: ['engurras', 'rugas'], groups: [], presence: true },
    { nouns: ['canas'], groups: [], presence: true },
    { nouns: ['coxeira'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['azul', 'verde', 'marrón', 'castaño', 'negro', 'louro', 'roxo', 'pelirroxo', 'vermello', 'avermellado', 'gris',
      'agrisado', 'branco', 'canoso', 'prateado', 'dourado', 'moreno', 'pálido', 'escuro', 'claro', 'mel', 'abelá', 'ámbar',
      'violeta', 'acobrado', 'caoba', 'rosado', 'bronceado', 'tostado', 'cetrino', 'sonrosado', 'azabache', 'trigueiro',
      'oliváceo'],
    hair: ['liso', 'lacio', 'rizado', 'crecho', 'encrechado', 'ondulado', 'crespo', 'trenzado', 'rapado', 'despeiteado',
      'esguedellado', 'revolto', 'sedoso', 'graxento', 'ralo', 'fino', 'mesto', 'abundante', 'recollido', 'solto',
      'enguedellado'],
    length: ['longo', 'curto', 'longuísimo', 'curtísimo'],
    size: ['grande', 'pequeno', 'enorme', 'diminuto', 'ancho', 'estreito', 'fino', 'groso', 'redondo', 'xigantesco'],
    eyes: ['rasgado', 'amendoado', 'afundido', 'saltón', 'brillante', 'vivo', 'apagado', 'triste', 'penetrante', 'achinado',
      'profundo', 'soñador', 'canso', 'inquedo', 'frío', 'cálido'],
    skin: ['suave', 'áspero', 'engurrado', 'terso', 'curtido', 'sardento', 'lampo', 'delicado'],
    nose: ['aquilino', 'aguileño', 'chato', 'arrebitado', 'recto', 'ganchudo', 'afiado', 'torto', 'prominente'],
    lips: ['carnoso', 'delgado', 'gretado', 'fino'],
    face: ['alongado', 'ovalado', 'anguloso', 'afiado', 'cadrado', 'demacrado', 'redondo', 'curtido', 'sardento', 'engurrado'],
    hands: ['forte', 'delicado', 'caloso', 'ososo', 'nervudo', 'musculoso', 'delgado'],
    shoulders: ['caído', 'cargado', 'encurvado', 'recto', 'forte', 'ancho'],
    voice: ['grave', 'agudo', 'rouco', 'suave', 'doce', 'profundo', 'estridente', 'áspero', 'melodioso', 'nasal', 'cascado',
      'firme', 'crebado', 'pausado', 'aveludado', 'potente', 'débil', 'feble'],
    density: ['poboado', 'mesto', 'ralo', 'pechado', 'recortado', 'coidado', 'descoidado', 'fino'],
    smile: ['franco', 'tímido', 'torto', 'amplo', 'triste', 'burlón', 'cálido', 'forzado'],
  },

  // Trazos que valen por si sós («é alto e tímido»).
  standalone: [
    // Complexión
    'alto', 'baixo', 'delgado', 'fraco', 'gordo', 'obeso', 'corpulento', 'robusto', 'fornido', 'musculoso', 'atlético',
    'esvelto', 'miúdo', 'rexoncho', 'enxoito', 'desgarbado', 'espigado', 'encurvado',
    // Aspecto
    'atractivo', 'guapo', 'fermoso', 'belo', 'feo', 'elegante', 'desaliñado', 'pulcro', 'calvo', 'barbudo', 'sardento',
    'canoso', 'louro', 'moreno', 'pelirroxo', 'pálido',
    // Idade
    'xove', 'ancián', 'adolescente',
    // Carácter
    'tímido', 'valente', 'covarde', 'xeneroso', 'egoísta', 'intelixente', 'astuto', 'inxenuo', 'orgulloso', 'humilde',
    'amable', 'cruel', 'leal', 'desconfiado', 'ambicioso', 'preguiceiro', 'traballador', 'impulsivo', 'paciente', 'impaciente',
    'alegre', 'melancólico', 'solitario', 'sociable', 'introvertido', 'extrovertido', 'optimista', 'pesimista', 'teimudo',
    'teimoso', 'celoso', 'curioso', 'reservado', 'arrogante', 'sensible', 'agarimoso', 'violento', 'tranquilo', 'nervioso',
    'honesto', 'mentireiro', 'sarcástico', 'bondadoso', 'rancoroso', 'temerario', 'prudente', 'sincero', 'falador', 'calado',
    'metódico', 'supersticioso', 'relixioso', 'ateo', 'rebelde', 'obediente', 'vaidoso', 'inseguro', 'manipulador',
    // Condición («coxo» non vai aquí: a súa forma feminina, «coxa», é tamén a parte da perna)
    'zurdo', 'cego', 'xordo', 'mudo', 'chosco', 'maneto',
  ],

  // Palabras que poden ir entre o substantivo e os seus adxectivos sen romper a descrición.
  fillers: ['é', 'son', 'era', 'eran', 'foi', 'está', 'esta', 'están', 'estan', 'estaba', 'moi', 'bastante', 'de', 'do', 'da',
    'dos', 'das', 'dun', 'dunha', 'cor', 'e', 'ou', 'pero', 'mais', 'tan', 'máis', 'ben', 'un', 'unha', 'pouco', 'algo', 'case',
    'sempre', 'ten', 'tiña', 'tina', 'leva', 'levaba', 'o', 'a', 'os', 'as', 'seu', 'súa', 'sua', 'seus', 'súas', 'suas',
    'aínda', 'ainda', 'que', 'tirando', 'entre', 'tamén', 'tamen'],

  negations: ['non', 'nin', 'nunca', 'sen', 'nada', 'xamais', 'endexamais', 'tampouco', 'ningún', 'ningun', 'ningunha'],

  // Idade expresada con número: «ten 34 anos», «un home de 60 anos», «cumpriu os 40 anos».
  // Non conta «hai máis de 20 anos» nin «despois de 5 anos»: iso non é unha idade.
  age: [{ regex: /(?<![\p{L}\p{N}])(?:ten|tiña|tina|teño|teno|cumpre|cumpriu|cumprira|cumprido|cumpridos|(?<!(?:máis|mais|menos|despois|antes|dentro|cabo|longo|logo|arredor|preto)\s+)de)\s+(?:uns\s+|os\s+|case\s+|apenas\s+|arredor\s+de\s+|preto\s+de\s+)?(\d{1,3})\s+anos(?![\p{L}\p{N}])/giu, label: '{n} anos' }],

  // Recibe a palabra sen acentos e devolve as súas formas: masculino e feminino, singular e plural.
  forms(word) {
    // «xove» só en singular: o plural, «xoves», é tamén o día da semana.
    if (word === 'xove') return [word];
    // -o: alto, alta, altos, altas
    if (word.endsWith('o')) {
      const stem = word.slice(0, -1);
      return [word, stem + 'a', stem + 'os', stem + 'as'];
    }
    // -eu: europeu, europea, europeus, europeas
    if (word.endsWith('eu')) {
      const stem = word.slice(0, -1);
      return [word, word + 's', stem + 'a', stem + 'as'];
    }
    // -u: cru, crúa, crus, crúas
    if (word.endsWith('u')) return [word, word + 's', word + 'a', word + 'as'];
    // -án: ancián, anciá, anciáns, anciás (e -ana, -anas: folgazán, folgazana)
    if (word.endsWith('an')) {
      const stem = word.slice(0, -1);
      return [word, word + 's', stem, stem + 's', word + 'a', word + 'as'];
    }
    // -ón, -ín: burlón, burlona, burlóns, burlonas
    if (/(on|in)$/.test(word)) return [word, word + 's', word + 'a', word + 'as'];
    // -or, -és: traballador, traballadora, traballadores, traballadoras
    if (/(or|es)$/.test(word)) return [word, word + 'es', word + 'a', word + 'as'];
    // -z: feliz, felices
    if (word.endsWith('z')) return [word, word.slice(0, -1) + 'ces'];
    // -l: azul, azuis; leal, leais; cruel, crueis; xentil, xentís; débil, débiles
    if (/[aeou]l$/.test(word)) return [word, word.slice(0, -1) + 'is'];
    if (word.endsWith('il')) return [word, word.slice(0, -1) + 's', word + 'es'];
    // outras consoantes: gris, grises; familiar, familiares
    if (/[rs]$/.test(word)) return [word, word + 'es'];
    // vogal (-a, -e, -i): optimista, optimistas; grande, grandes
    if (/[aei]$/.test(word)) return [word, word + 's'];
    return [word, word + 's', word + 'es'];
  },
};
