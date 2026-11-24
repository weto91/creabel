// Feuille de traits en français : les mots clés qui servent à extraire des traits d’un texte.
// On peut l’enrichir librement : il suffit d’ajouter des mots aux listes (adjectifs au masculin
// singulier ; le féminin et le pluriel sont générés par forms()).
// Le texte est comparé sans accents ni majuscules. Les mots avec apostrophe (« d’un », « n’est »)
// forment un seul mot : ils s’écrivent ici avec l’apostrophe droite.
export default {
  // Parties ou attributs décrits par des adjectifs. `groups` indique quelles listes d’adjectifs
  // s’y appliquent ; `presence` signifie que les nommer est déjà un trait (« porte des lunettes »).
  // L’adjectif peut venir après le nom (« yeux bleus ») ou juste avant (« longs cheveux »).
  features: [
    { nouns: ['œil', 'oeil', 'yeux', 'regard'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['cheveux', 'cheveu', 'chevelure', 'tignasse', 'crinière', 'mèches'], groups: ['color', 'hair', 'length'] },
    { nouns: ['peau', 'teint'], groups: ['color', 'skin'] },
    { nouns: ['barbe', 'barbiche'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['moustache', 'moustaches'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nez'], groups: ['size', 'nose'] },
    { nouns: ['lèvres', 'bouche'], groups: ['size', 'lips', 'color'] },
    { nouns: ['visage', 'traits'], groups: ['face', 'size'] },
    { nouns: ['mains', 'doigts'], groups: ['size', 'hands', 'length'] },
    { nouns: ['voix'], groups: ['voice'] },
    { nouns: ['sourcils'], groups: ['color', 'density', 'size'] },
    { nouns: ['épaules', 'dos'], groups: ['size', 'shoulders'] },
    { nouns: ['jambes', 'bras'], groups: ['length', 'size', 'hands'] },
    { nouns: ['sourire'], groups: ['smile', 'size'] },
    { nouns: ['lunettes', 'binocles'], groups: ['size'], presence: true },
    { nouns: ['éphélides'], groups: [], presence: true },
    { nouns: ['cicatrice', 'cicatrices', 'balafre'], groups: ['size'], presence: true },
    { nouns: ['tatouage', 'tatouages'], groups: ['size'], presence: true },
    { nouns: ['piercing', 'piercings'], groups: [], presence: true },
    { nouns: ['rides'], groups: [], presence: true },
    { nouns: ['boiterie', 'claudication'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['bleu', 'vert', 'marron', 'brun', 'châtain', 'noir', 'blond', 'roux', 'rouge', 'gris', 'grisonnant', 'blanc',
      'argenté', 'doré', 'pâle', 'foncé', 'clair', 'noisette', 'ambré', 'violet', 'cuivré', 'acajou', 'auburn',
      'rose', 'bronzé', 'hâlé', 'mat', 'basané', 'olivâtre', 'cendré', 'platine', 'laiteux', 'diaphane', 'vermeil'],
    hair: ['raide', 'lisse', 'bouclé', 'frisé', 'ondulé', 'crépu', 'tressé', 'rasé', 'ébouriffé', 'hirsute', 'décoiffé',
      'soyeux', 'gras', 'clairsemé', 'fin', 'épais', 'abondant', 'attaché', 'lâché', 'emmêlé', 'dru', 'touffu'],
    length: ['long', 'court'],
    size: ['grand', 'petit', 'gros', 'énorme', 'minuscule', 'large', 'étroit', 'fin', 'épais', 'rond', 'immense'],
    eyes: ['bridé', 'enfoncé', 'globuleux', 'brillant', 'vif', 'éteint', 'triste', 'perçant', 'profond', 'rêveur',
      'fatigué', 'inquiet', 'froid', 'chaleureux', 'doux', 'pétillant'],
    skin: ['doux', 'rugueux', 'ridé', 'lisse', 'tanné', 'parcheminé', 'délicat', 'glabre', 'grêlé', 'buriné'],
    nose: ['aquilin', 'busqué', 'camus', 'retroussé', 'droit', 'crochu', 'pointu', 'tordu', 'proéminent', 'épaté'],
    lips: ['charnu', 'pulpeux', 'mince', 'gercé', 'fin'],
    face: ['allongé', 'ovale', 'anguleux', 'carré', 'émacié', 'poupin', 'buriné', 'ridé', 'rond', 'osseux', 'joufflu', 'fin'],
    hands: ['fort', 'délicat', 'calleux', 'osseux', 'noueux', 'musclé', 'fin', 'mince'],
    shoulders: ['tombant', 'voûté', 'droit', 'carré', 'large', 'fort', 'musclé'],
    voice: ['grave', 'aigu', 'rauque', 'doux', 'suave', 'criard', 'éraillé', 'mélodieux', 'nasillard', 'cassé', 'ferme',
      'posé', 'chaud', 'puissant', 'faible', 'profond', 'voilé', 'sourd', 'fluet', 'perché'],
    density: ['fourni', 'épais', 'clairsemé', 'taillé', 'soigné', 'négligé', 'broussailleux', 'fin', 'dru', 'touffu'],
    smile: ['franc', 'timide', 'narquois', 'large', 'triste', 'moqueur', 'chaleureux', 'forcé', 'éclatant', 'carnassier'],
  },

  // Traits qui valent par eux-mêmes (« il est grand et timide »).
  standalone: [
    // Silhouette
    'grand', 'petit', 'mince', 'maigre', 'svelte', 'gros', 'obèse', 'corpulent', 'robuste', 'costaud', 'trapu', 'musclé',
    'athlétique', 'élancé', 'rondouillard', 'potelé', 'fluet', 'dégingandé', 'voûté', 'chétif', 'massif', 'baraqué',
    // Apparence
    'beau', 'joli', 'séduisant', 'laid', 'élégant', 'négligé', 'débraillé', 'soigné', 'chauve', 'barbu', 'moustachu',
    'roux', 'blond', 'brun', 'pâle',
    // Âge
    'jeune', 'vieux', 'adolescent',
    // Caractère
    'timide', 'courageux', 'lâche', 'généreux', 'égoïste', 'intelligent', 'malin', 'rusé', 'naïf', 'fier', 'orgueilleux',
    'humble', 'aimable', 'gentil', 'cruel', 'loyal', 'méfiant', 'ambitieux', 'paresseux', 'travailleur', 'impulsif',
    'patient', 'impatient', 'joyeux', 'gai', 'mélancolique', 'solitaire', 'sociable', 'introverti', 'extraverti',
    'optimiste', 'pessimiste', 'têtu', 'obstiné', 'jaloux', 'curieux', 'réservé', 'arrogant', 'sensible', 'affectueux',
    'violent', 'calme', 'nerveux', 'anxieux', 'colérique', 'honnête', 'menteur', 'sarcastique', 'bienveillant', 'rancunier',
    'téméraire', 'prudent', 'sincère', 'bavard', 'taciturne', 'discret', 'méthodique', 'superstitieux', 'religieux',
    'athée', 'rebelle', 'obéissant', 'vaniteux', 'manipulateur', 'drôle', 'sérieux',
    // Condition
    'gaucher', 'boiteux', 'aveugle', 'sourd', 'muet', 'borgne', 'manchot',
  ],

  // Mots qui peuvent se glisser entre le nom et ses adjectifs sans rompre la description.
  fillers: ['est', 'sont', 'était', 'etait', 'étaient', 'etaient', 'semble', 'semblait', 'paraît', 'parait', 'très', 'tres',
    'assez', 'plutôt', 'plutot', 'un', 'une', 'peu', 'trop', 'si', 'tellement', 'bien', 'de', 'du', 'des', "d'un", "d'une",
    'couleur', 'et', 'ou', 'mais', 'aux', 'au', 'le', 'la', 'les', 'son', 'sa', 'ses', 'leur', 'leurs', 'a', 'avait',
    'porte', 'portait', 'presque', 'toujours', 'légèrement', 'tirant', 'sur', 'entre', 'encore', 'déjà', 'deja'],

  negations: ['ne', 'pas', 'jamais', 'sans', 'ni', 'aucun', 'aucune', 'guère', 'non', "n'est", "n'était", "n'etait",
    "n'a", "n'avait", "n'ont", "n'avaient", "n'étaient", "n'etaient"],

  // Âge exprimé par un nombre : « il a 34 ans », « une femme de 60 ans », « âgé de 12 ans ».
  // Ne compte pas « il y a 20 ans », « plus de 20 ans » ni « au bout de 5 ans » : ce n’est pas un âge.
  age: [{ regex: /(?<![\p{L}\p{N}])(?:(?<!\by\s+)(?:a|ai|as|avez|avons|ont|avait|avaient|aura|aurait|eu)|(?:fête|fêté|fêtait|fêtera|fete|fetait)|(?<!(?:plus|moins|près|pres|bout|cours|depuis|après|apres|pendant|durée|duree|peine|prison|absence|période|periode)\s+)de)\s+(?:presque\s+|à\s+peine\s+|a\s+peine\s+|environ\s+|déjà\s+|deja\s+|bientôt\s+|bientot\s+|tout\s+juste\s+|ses\s+)?(\d{1,3})\s+ans(?![\p{L}\p{N}])/giu, label: '{n} ans' }],

  // Formes d’un adjectif (reçu en minuscules et sans accents) : masculin et féminin, singulier et
  // pluriel. Les formes en trop ne gênent pas : elles ne correspondent à aucun mot réel.
  forms(word) {
    const irregular = {
      beau: ['beaux', 'belle', 'belles'], vieux: ['vieille', 'vieilles'], blanc: ['blancs', 'blanche', 'blanches'],
      franc: ['francs', 'franche', 'franches'], long: ['longs', 'longue', 'longues'], roux: ['rousse', 'rousses'],
      doux: ['douce', 'douces'], jaloux: ['jalouse', 'jalouses'], malin: ['malins', 'maligne', 'malignes'],
      fou: ['fous', 'folle', 'folles'], frais: ['fraiche', 'fraiches'], sec: ['secs', 'seche', 'seches'],
      gentil: ['gentils', 'gentille', 'gentilles'], favori: ['favoris', 'favorite', 'favorites'],
    };
    if (irregular[word]) return [word, ...irregular[word]];
    if (word.endsWith('eux')) { // généreux -> généreuse
      const stem = word.slice(0, -1);
      return [word, stem + 'se', stem + 'ses'];
    }
    if (word.endsWith('eau')) { // nouveau -> nouvelle
      const stem = word.slice(0, -3);
      return [word, word + 'x', stem + 'elle', stem + 'elles'];
    }
    if (word.endsWith('teur')) { // manipulateur -> manipulatrice ; menteur -> menteuse
      const stem = word.slice(0, -4);
      return [word, word + 's', stem + 'trice', stem + 'trices', stem + 'teuse', stem + 'teuses'];
    }
    if (word.endsWith('eur')) { // rêveur -> rêveuse ; supérieur -> supérieure
      const stem = word.slice(0, -1);
      return [word, word + 's', stem + 'se', stem + 'ses', word + 'e', word + 'es'];
    }
    if (word.endsWith('if')) { // naïf -> naïve
      const stem = word.slice(0, -1);
      return [word, word + 's', stem + 've', stem + 'ves'];
    }
    if (/(el|eil|il|ul)$/.test(word)) return [word, word + 's', word + 'le', word + 'les', word + 'e', word + 'es']; // cruel -> cruelle
    if (/(en|on)$/.test(word)) return [word, word + 's', word + 'ne', word + 'nes', word + 'e', word + 'es']; // mignon -> mignonne
    if (word.endsWith('et')) { // muet -> muette ; inquiet -> inquiète
      const stem = word.slice(0, -2);
      return [word, word + 's', word + 'te', word + 'tes', stem + 'ete', stem + 'etes'];
    }
    if (word.endsWith('er')) { // fier -> fière
      const stem = word.slice(0, -2);
      return [word, word + 's', stem + 'ere', stem + 'eres'];
    }
    if (word.endsWith('al')) { // loyal -> loyale, loyaux
      const stem = word.slice(0, -2);
      return [word, word + 's', word + 'e', word + 'es', stem + 'aux'];
    }
    // -e (rouge, mince) et -é sans accent (bouclé -> boucle) : on ajoute aussi le -e du féminin.
    if (word.endsWith('e')) return [word, word + 's', word + 'e', word + 'es'];
    if (/[sx]$/.test(word)) return [word, word + 'e', word + 'es', word + 'se', word + 'ses']; // gris -> grise ; gros -> grosse
    return [word, word + 's', word + 'e', word + 'es'];
  },
};
