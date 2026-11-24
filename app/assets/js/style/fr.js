// Fiche de révision du texte (français) : ce qu'utilisent l'« Analyse », la révision de style de l'éditeur
// et la détection des noms pour un roman écrit dans cette langue. On peut l'enrichir librement.
export default {
  // Mots vides (articles, prépositions, pronoms, auxiliaires, adverbes courants) : ils ne comptent
  // ni comme répétitions ni parmi les mots les plus employés. Accents sans importance.
  stop: (
    'le la les un une des du de au aux à en dans sur sous avec sans pour par chez vers entre contre depuis pendant '
    + 'devant derrière après avant selon malgré parmi et ou mais donc or ni car que qui quoi dont où si comme quand '
    + 'lorsque puisque quoique tandis alors puis ensuite enfin je tu il elle on nous vous ils elles me te se lui leur y '
    + 'moi toi soi eux mon ma mes ton ta tes son sa ses notre nos votre vos leurs ce cet cette ces ceci cela ça celui '
    + 'celle ceux celles lequel laquelle lesquels quel quelle quels quelles être suis es est sommes êtes sont étais '
    + 'était étions étiez étaient fus fut fûmes furent sera seras serai seront serait serais été étant sois soit soient '
    + 'fût avoir ai as a avons avez ont avais avait avions aviez avaient eus eut eurent aura auront aurait eu ayant aie '
    + 'ait eût faire fais fait faisons faites font faisait faisaient fit firent faisant dire dis dit disons dites '
    + 'disent disait disaient dirent disant pouvoir peux peut pouvons pouvez peuvent pouvait pouvaient put purent pu '
    + 'pourrait pourraient aller vais vas va allons allez vont allait allaient alla allèrent allé devoir doit doivent '
    + 'devait devaient dut vouloir veux veut voulait voulut voir vit virent vu ne pas plus jamais rien tout tous toute '
    + 'toutes très trop peu assez bien mal aussi encore déjà toujours ici là maintenant hier demain seulement même '
    + 'autre autres chaque quelque quelques plusieurs aucun aucune nul nulle tel telle tels telles beaucoup moins tant '
    + 'autant ainsi pourtant cependant non oui sinon dessus dessous dehors dedans '
    + "qu'il qu'elle qu'on qu'ils qu'elles qu'un qu'une c'est c'était c'étaient j'ai j'avais j'étais n'est n'était n'a n'avait n'y n'en s'est s'était s'en m'a t'a l'a l'avait l'on d'un d'une d'abord d'autres l'autre jusqu'à jusqu'au lorsqu'il lorsqu'elle puisqu'il aujourd'hui quelqu'un"
  ).split(' '),

  // Tics de langage et mots de remplissage : mots et locutions qui se glissent sans rien apporter.
  fillers: ['soudain', 'soudainement', 'tout à coup', "tout d'un coup", 'à ce moment-là', 'à cet instant', 'un instant',
    'un moment', 'un peu', 'quelque peu', 'en fait', 'en effet', 'au fond', 'la vérité est que', 'le fait est que',
    'bien sûr', 'naturellement', 'évidemment', 'littéralement', 'simplement', 'tout simplement', 'vraiment',
    'franchement', 'finalement', 'plutôt', 'assez', 'chose', 'choses', 'commença à', 'se mit à', 'sembla', 'semblait',
    'soupira', 'hocha la tête', 'sourit', 'haussa les épaules', 'fronça les sourcils', 'avala sa salive'],

  // Adverbes de manière reconnus par la terminaison. `exceptions` : mots en -ment qui n'en sont pas.
  adverbs: {
    suffix: 'ment', minLength: 7, per1000: 9,
    exceptions: [
      'moment', 'comment', 'sentiment', 'mouvement', 'gouvernement', 'appartement', 'changement', 'vêtement', 'document',
      'instrument', 'élément', 'argument', 'monument', 'fragment', 'segment', 'sédiment', 'supplément', 'complément',
      'compliment', 'ornement', 'aliment', 'ciment', 'testament', 'tempérament', 'règlement', 'régiment', 'sacrement',
      'serment', 'tourment', 'bâtiment', 'logement', 'jugement', 'développement', 'enseignement', 'établissement',
      'événement', 'évènement', 'commencement', 'rassemblement', 'déplacement', 'remplacement', 'traitement',
      'mécontentement', 'contentement', 'consentement', 'ressentiment', 'pressentiment', 'tremblement', 'battement',
      'claquement', 'craquement', 'grincement', 'bourdonnement', 'bruissement', 'frémissement', 'gémissement',
      'hurlement', 'rugissement', 'sifflement', 'ronronnement', 'grondement', 'aboiement', 'éclatement', 'déchirement',
      'étonnement', 'emportement', 'enchantement', 'enivrement', 'enlèvement', 'enterrement', 'engagement',
      'encouragement', 'enregistrement', 'ensevelissement', 'entêtement', 'entraînement', 'équipement', 'éloignement',
      'effondrement', 'effacement', 'égarement', 'éblouissement', 'éclaircissement', 'endormissement', 'évanouissement',
      'épanouissement', 'étourdissement', 'aveuglement', 'avertissement', 'avancement', 'avènement', 'avilissement',
      'apaisement', 'applaudissement', 'arrangement', 'arrachement', 'assaisonnement', 'attachement', 'attendrissement',
      'blanchissement', 'bégaiement', 'balancement', 'bombardement', 'bouleversement', 'branlement', 'bouillonnement',
      'ricanement', 'raisonnement', 'ravissement', 'rebondissement', 'recueillement', 'redressement', 'refroidissement',
      'relâchement', 'remerciement', 'renoncement', 'renseignement', 'retentissement', 'retournement', 'revêtement',
      'roulement', 'ruissellement', 'saisissement', 'soulagement', 'soulèvement', 'soutènement', 'tâtonnement',
      'tiraillement', 'tressaillement', 'trépignement', 'tutoiement', 'vieillissement', 'vomissement', 'abattement',
      'abaissement', 'abonnement', 'accablement', 'accompagnement', 'accouchement', 'accroissement', 'acharnement',
      'acheminement', 'achèvement', 'affaiblissement', 'affolement', 'affrontement', 'agenouillement', 'agencement',
      'agrandissement', 'ajournement', 'ajustement', 'alignement', 'allègement', 'allongement', 'aménagement',
      'amendement', 'amoncellement', 'amusement', 'anéantissement', 'appauvrissement', 'approvisionnement',
      'arrondissement', 'bondissement', 'bredouillement', 'cantonnement', 'chargement', 'chatouillement', 'chuchotement',
      'clignement', 'clapotement', 'compartiment', 'comportement', 'conditionnement', 'contournement', 'couronnement',
      'croisement', 'croassement', 'déchaînement', 'déménagement', 'dénouement', 'dépaysement', 'dérèglement',
      'désenchantement', 'détachement', 'dévouement', 'dérangement', 'dessèchement', 'discernement', 'dédommagement',
      'divertissement', 'dégagement', 'dénuement', 'déroulement', 'effleurement', 'élargissement', 'embellissement',
      'emplacement', 'empoisonnement', 'empressement', 'enchaînement', 'enfoncement', 'ensoleillement', 'entassement',
      'épuisement', 'escarpement', 'étranglement', 'fléchissement', 'fonctionnement', 'fondement', 'foisonnement',
      'fourmillement', 'froissement', 'frottement', 'gazouillement', 'gonflement', 'groupement', 'hébergement',
      'hennissement', 'hochement', 'hululement', 'isolement', 'jaillissement', 'lancement', 'ménagement', 'mugissement',
      'nivellement', 'ondoiement', 'paiement', 'pansement', 'parlement', 'piétinement', 'placement', 'pourrissement',
      'ralentissement', 'rapprochement', 'ravalement', 'rayonnement', 'rétrécissement', 'roucoulement', 'saignement',
      'tintement', 'traînement', 'tortillement', 'tournoiement', 'tapotement', 'ferment', 'forment', 'calment',
      'charment', 'arment', 'alarment', 'réclament', 'proclament', 'enferment', 'informent', 'transforment', 'confirment',
      'consomment', 'nomment', 'blâment', 'entament', 'déforment', 'réforment', 'renferment', 'désarment', 'embaument',
      'parfument', 'allument', 'fument', 'rallument', 'exhument', 'dorment', 'endorment',
    ],
  },

  // Articles qui peuvent précéder un nom (« Le Phare ») : le nom se cherche aussi sans eux.
  // Ceux qui s'élident s'écrivent avec l'apostrophe à la fin (« l' »).
  articles: ['le', 'la', 'les', 'un', 'une', "l'"],

  // Titres et appellations qui précèdent un nom propre (« Monsieur Dupont » → « Dupont »).
  titles: ['monsieur', 'madame', 'mademoiselle', 'm', 'mme', 'mlle', 'dr', 'docteur', 'professeur', 'maître',
    'capitaine', 'commandant', 'colonel', 'général', 'lieutenant', 'sergent', 'père', 'mère', 'frère', 'sœur',
    'oncle', 'tante', 'abbé', 'curé', 'saint', 'sainte', 'roi', 'reine', 'prince', 'princesse', 'comte',
    'comtesse', 'duc', 'duchesse', 'baron', 'marquis'],
};
