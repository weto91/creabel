// Hoja de rasgos en español: las palabras clave con las que se extraen rasgos de un texto.
// Se puede ampliar libremente: basta con añadir palabras a las listas (en masculino singular;
// las formas en femenino y plural se generan solas).
export default {
  // Partes o atributos que se describen con adjetivos. `groups` indica qué listas de
  // adjetivos les aplican; `presence` significa que nombrarlo ya es un rasgo («lleva gafas»).
  features: [
    { nouns: ['ojo', 'ojos', 'mirada'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['pelo', 'cabello', 'cabellos', 'melena', 'cabellera'], groups: ['color', 'hair', 'length'] },
    { nouns: ['piel', 'tez', 'cutis'], groups: ['color', 'skin'] },
    { nouns: ['barba'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['bigote', 'bigotes'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nariz'], groups: ['size', 'nose'] },
    { nouns: ['labios', 'boca'], groups: ['size', 'lips', 'color'] },
    { nouns: ['rostro', 'cara', 'facciones'], groups: ['face', 'size'] },
    { nouns: ['manos', 'dedos'], groups: ['size', 'hands', 'length'] },
    { nouns: ['voz'], groups: ['voice'] },
    { nouns: ['cejas'], groups: ['color', 'density', 'size'] },
    { nouns: ['hombros', 'espalda'], groups: ['size', 'shoulders'] },
    { nouns: ['piernas', 'brazos'], groups: ['length', 'size', 'hands'] },
    { nouns: ['sonrisa'], groups: ['smile', 'size'] },
    { nouns: ['gafas', 'lentes', 'anteojos'], groups: ['size'], presence: true },
    { nouns: ['pecas'], groups: [], presence: true },
    { nouns: ['cicatriz', 'cicatrices'], groups: ['size'], presence: true },
    { nouns: ['tatuaje', 'tatuajes'], groups: ['size'], presence: true },
    { nouns: ['lunar', 'lunares'], groups: [], presence: true },
    { nouns: ['arrugas'], groups: [], presence: true },
    { nouns: ['canas'], groups: [], presence: true },
    { nouns: ['cojera'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['azul', 'verde', 'marrón', 'castaño', 'negro', 'rubio', 'pelirrojo', 'rojo', 'rojizo', 'gris', 'grisáceo', 'blanco',
      'canoso', 'plateado', 'dorado', 'moreno', 'pálido', 'oscuro', 'claro', 'miel', 'avellana', 'ámbar', 'violeta', 'cobrizo',
      'caoba', 'rosado', 'bronceado', 'tostado', 'cetrino', 'sonrosado', 'azabache', 'trigueño', 'aceitunado'],
    hair: ['lacio', 'liso', 'rizado', 'ondulado', 'crespo', 'encrespado', 'trenzado', 'rapado', 'despeinado', 'revuelto', 'sedoso',
      'grasiento', 'ralo', 'fino', 'espeso', 'abundante', 'recogido', 'suelto', 'enmarañado', 'alborotado'],
    length: ['largo', 'corto', 'larguísimo', 'cortísimo'],
    size: ['grande', 'pequeño', 'enorme', 'diminuto', 'ancho', 'estrecho', 'fino', 'grueso', 'redondo', 'gigantesco'],
    eyes: ['rasgado', 'almendrado', 'hundido', 'saltón', 'brillante', 'vivo', 'apagado', 'triste', 'penetrante', 'achinado',
      'profundo', 'soñador', 'cansado', 'inquieto', 'frío', 'cálido'],
    skin: ['suave', 'áspero', 'arrugado', 'terso', 'curtido', 'pecoso', 'lampiño', 'delicado'],
    nose: ['aguileño', 'chato', 'respingón', 'recto', 'ganchudo', 'afilado', 'torcido', 'prominente'],
    lips: ['carnoso', 'delgado', 'agrietado'],
    face: ['alargado', 'ovalado', 'anguloso', 'afilado', 'cuadrado', 'demacrado', 'aniñado', 'curtido', 'pecoso', 'arrugado'],
    hands: ['fuerte', 'delicado', 'calloso', 'huesudo', 'nervudo', 'musculoso', 'delgado'],
    shoulders: ['caído', 'cargado', 'encorvado', 'recto', 'fuerte'],
    voice: ['grave', 'agudo', 'ronco', 'suave', 'dulce', 'profundo', 'chillón', 'áspero', 'melodioso', 'nasal', 'cascado',
      'firme', 'quebrado', 'pausado', 'aterciopelado', 'potente', 'débil'],
    density: ['poblado', 'espeso', 'ralo', 'cerrado', 'recortado', 'cuidado', 'descuidado', 'fino'],
    smile: ['franco', 'tímido', 'torcido', 'amplio', 'triste', 'burlón', 'cálido', 'forzado'],
  },

  // Rasgos que valen por sí solos («es alto y tímido»).
  standalone: [
    // Complexión
    'alto', 'bajo', 'delgado', 'flaco', 'gordo', 'obeso', 'corpulento', 'robusto', 'fornido', 'musculoso', 'atlético',
    'esbelto', 'menudo', 'rechoncho', 'enjuto', 'desgarbado', 'espigado', 'encorvado',
    // Aspecto
    'atractivo', 'guapo', 'hermoso', 'bello', 'feo', 'elegante', 'desaliñado', 'pulcro', 'calvo', 'barbudo', 'pecoso',
    'canoso', 'rubio', 'moreno', 'pelirrojo', 'pálido',
    // Edad
    'joven', 'anciano', 'adolescente',
    // Carácter
    'tímido', 'valiente', 'cobarde', 'generoso', 'egoísta', 'inteligente', 'astuto', 'ingenuo', 'orgulloso', 'humilde',
    'amable', 'cruel', 'leal', 'desconfiado', 'ambicioso', 'perezoso', 'trabajador', 'impulsivo', 'paciente', 'impaciente',
    'alegre', 'melancólico', 'solitario', 'sociable', 'introvertido', 'extrovertido', 'optimista', 'pesimista', 'testarudo',
    'terco', 'celoso', 'curioso', 'reservado', 'arrogante', 'sensible', 'cariñoso', 'violento', 'tranquilo', 'nervioso',
    'honesto', 'mentiroso', 'sarcástico', 'bondadoso', 'rencoroso', 'temerario', 'prudente', 'sincero', 'hablador', 'callado',
    'metódico', 'supersticioso', 'religioso', 'ateo', 'rebelde', 'obediente', 'vanidoso', 'inseguro', 'manipulador',
    // Condición
    'zurdo', 'cojo', 'ciego', 'sordo', 'mudo', 'tuerto', 'manco',
  ],

  // Palabras que pueden ir entre el sustantivo y sus adjetivos sin romper la descripción.
  fillers: ['es', 'son', 'era', 'eran', 'está', 'esta', 'están', 'estan', 'muy', 'bastante', 'de', 'del', 'color', 'y', 'e', 'o', 'pero',
    'tan', 'más', 'mas', 'bien', 'un', 'poco', 'algo', 'casi', 'siempre', 'tiene', 'tenía', 'tenia', 'lleva', 'llevaba',
    'el', 'la', 'los', 'las', 'su', 'sus', 'aunque', 'tirando', 'a', 'entre'],

  negations: ['no', 'ni', 'nunca', 'sin', 'nada', 'jamás', 'jamas', 'tampoco'],

  // Edad expresada con número: «tiene 34 años», «un hombre de 60 años».
  // No cuenta «hace más de 20 años» ni «después de 5 años»: eso no es una edad.
  age: [{ regex: /(?<![\p{L}\p{N}])(?:tiene|tenía|tenia|tengo|cumple|cumplió|cumplio|cumplido|(?<!(?:más|mas|menos|después|despues|antes|dentro|cabo|largo)\s+)de)\s+(?:unos\s+|casi\s+|apenas\s+)?(\d{1,3})\s+años(?![\p{L}\p{N}])/giu, label: '{n} años' }],

  forms(word) {
    if (word.endsWith('o')) {
      const stem = word.slice(0, -1);
      return [word, stem + 'a', stem + 'os', stem + 'as'];
    }
    if (/[aeiu]$/.test(word)) return [word, word + 's'];
    if (word.endsWith('z')) return [word, word.slice(0, -1) + 'ces'];
    if (/(or|on|an|in|es)$/.test(word)) return [word, word + 'es', word + 'a', word + 'as'];
    return [word, word + 'es'];
  },
};
