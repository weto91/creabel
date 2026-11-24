// Aide détaillée de chaque page (fr) : ce qui s’affiche quand on clique sur « ? ». Chaque entrée a une
// phrase d’introduction, des sections [titre, texte], des astuces et le chapitre du guide de l’application
// où c’est expliqué plus en détail. Les pages absentes d’ici n’affichent que leur phrase courte
// (help.<section> dans i18n/fr.js).
export default {
  home: {
    intro: 'Ce qu’il est utile de voir en arrivant : où reprendre, où vous en êtes, ce qu’il reste et ce qu’il faut vérifier.',
    parts: [
      ['Où reprendre', 'La dernière scène modifiée et la suivante à écrire, avec un accès direct. « Reprendre l’écriture » ouvre la première. Dans un nouveau projet, vous trouverez ici les premiers pas.'],
      ['Quatre chiffres', 'Le manuscrit par rapport à son objectif de mots, ce que vous avez écrit aujourd’hui par rapport à l’objectif quotidien, la série de jours consécutifs et les jours restants avant l’échéance, avec le rythme nécessaire et le vôtre.'],
      ['Rythme et état', 'Les mots de chacun des 30 derniers jours, et combien de fiches, chapitres et scènes sont à faire, en cours ou terminés.'],
      ['À vérifier', 'Les tâches ouvertes les plus récentes et les alertes : impossibilités et avertissements de Continuité, scènes sans date et scènes sans aucune intrigue.'],
    ],
    tips: ['Les objectifs se fixent dans « Livre → Objectifs ». Sans eux, les chiffres montrent seulement ce qui existe.', 'Si vous avez ajouté une couverture ou une phrase de présentation dans « Livre », elles figurent dans le premier bloc. Cliquez sur la couverture pour la voir en grand.', 'Sur le PC, clic droit sur n’importe quel lien → « Ouvrir dans une nouvelle fenêtre » : par exemple, la fiche d’un personnage à côté de la scène que vous écrivez.', 'Sur le téléphone, si vous quittez une scène pour consulter quelque chose, le bouton ↩ en haut vous y ramène.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Les fondations de l’histoire : ce que vous racontez, dans quel monde et par quels fils elle avance.',
    parts: [
      ['Prémisse', 'L’idée en une ou deux phrases : qui veut quoi et ce qui l’en empêche.'],
      ['Fabula, cadre et notes', 'Les faits dans l’ordre chronologique, l’époque et le lieu, et les notes qui concernent tout le roman. Cliquez sur chaque bloc pour l’écrire.'],
      ['Intrigues', 'Un fil narratif par ligne, regroupés selon leur poids : principales, secondaires et de fond. Le classement se règle dans la fiche de chaque intrigue.'],
      ['Le parcours de chaque intrigue', 'La barre a un trait par scène du livre, dans l’ordre de lecture ; ceux en couleur sont ceux de cette intrigue. On voit où elle commence, où elle disparaît et si elle arrive jusqu’à la fin.'],
    ],
    tips: [
      'Les scènes sont attribuées à une intrigue dans la fiche de la scène, bloc « Intrigues et objets ».',
      'L’alerte « scènes sans aucune intrigue » signale des scènes qui ne font peut-être rien avancer.',
      '« Tout lire » affiche l’architecture d’une traite, comme un document.',
      '« Importer / exporter », à côté d’« Ajouter une intrigue », exporte les intrigues vers Excel, CSV, Word, texte ou JSON et les réimporte.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Les notes libres du projet : idées, extraits, pense-bêtes.',
    parts: [
      ['Étiquettes', 'Chaque note peut en avoir plusieurs. Ici, elles sont regroupées par étiquette, et une note avec deux étiquettes apparaît dans les deux blocs.'],
      ['Couleur', 'Huit couleurs pour les distinguer d’un coup d’œil. « Trier par : Couleur » les regroupe ainsi.'],
      ['Liens', 'Une note peut être liée à des personnages, lieux, objets, groupes, fiches personnalisées, intrigues, chapitres et scènes. Elle apparaît alors dans la fiche de chacun.'],
      ['Trier et entretenir', 'Dans chaque bloc, on réordonne en faisant glisser. Le menu ⋯ d’une étiquette la renomme ou la retire de toutes ses notes.'],
    ],
    tips: ['Pour le matériel de consultation (liens, plans, articles), mieux vaut Documentation ; pour ce qu’il faut revoir, Tâches.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Le matériel de consultation du roman : liens, articles, images, cartes, plans et documents.',
    parts: [
      ['Références', 'Chacune a un type, une adresse web facultative, un texte et des fichiers joints (images, SVG ou PDF).'],
      ['Liens', 'Une référence se lie à des scènes, des chapitres ou des fiches, et y apparaît : vous l’avez ainsi sous la main en écrivant cette scène.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Les fiches de ceux qui vivent l’histoire.',
    parts: [
      ['Principaux et secondaires', 'Les principaux ont un entretien par sections (identité, physique, psychologie, conflit, évolution…) ; les secondaires, une description libre. On peut passer de l’un à l’autre depuis la fiche.'],
      ['Détection dans le texte', 'Si vous créez les personnages avant d’écrire, les scènes les reconnaissent à leur nom et à leurs autres noms, et les indiquent toutes seules.'],
      ['Dates et âge', 'Avec la date de naissance dans la fiche, chaque scène datée affiche l’âge du personnage.'],
      ['Relations', 'Dès qu’un personnage a une relation dessinée dans « Relations », un onglet apparaît ici pour les réunir toutes.'],
    ],
    tips: ['« Importer / exporter » exporte la liste vers Excel, CSV, Word, texte ou JSON, et la réimporte. Chaque fiche est complète : données, texte, traits, événements, scènes où il apparaît et relations.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'La fiche d’un personnage principal : un entretien par sections qui vous aide à le connaître.',
    parts: [
      ['Sections', 'Chaque section se remplit question par question ou en texte libre. Son état (à faire, en cours, terminé) vous dit ce qu’il reste.'],
      ['Traits', 'Ils sont extraits automatiquement de ce que vous écrivez (âge, cheveux, yeux…) pour éviter de vous contredire ; vous pouvez ajouter les vôtres.'],
      ['Rôle, autres noms et dates', 'Le rôle dans l’histoire, les autres façons de le nommer (pour que le texte le reconnaisse) ainsi que sa naissance et son décès.'],
      ['Relations', 'Une paire par relation : sous la photo de chacun, ce qu’il est pour l’autre (« Directeur de vol » / « Commandant »). Si vous n’en écrivez qu’un, il vaut pour les deux (« Collègues »). C’est une seule liste, que la relation soit notée ici, dans la fiche de l’autre ou dessinée sur une carte ; quand vous la changez ou la retirez, elle est mise à jour partout.'],
      ['Images, événements et apparitions', 'Photos de référence, faits datés pour la chronologie et scènes où il apparaît.'],
    ],
    tips: [
      'S’il continue d’apparaître après sa mort (son corps, un souvenir, un fantôme), cochez la case sous la date de décès et Continuité ne vous avertira pas.',
      'Le menu ⋯ exporte la fiche ou y importe des données.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Les décors du roman, du plus grand au plus petit.',
    parts: [
      ['Liste', 'Les fiches de tous les lieux, que l’on réordonne en les faisant glisser.'],
      ['Arbre', 'Quel lieu se trouve dans quel autre : la salle sur le pont, le pont dans le vaisseau. Ce qui se passe dans un lieu compte aussi pour ceux qui le contiennent.'],
      ['Cartes', 'Vous envoyez un plan ou une carte (image ou SVG) et vous placez vos lieux dessus avec des épingles.'],
      ['Relations', 'Apparaît dès qu’un lieu a une relation dessinée dans « Relations ».'],
    ],
    tips: ['Dans l’arbre, le menu ⋯ de chaque ligne place le lieu dans un autre ou y ajoute des lieux.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'La fiche d’un lieu.',
    parts: [
      ['Où il se trouve', 'Pays, région et ville, et « Dans » : le lieu qui le contient. « Contient » liste ceux qui se trouvent à l’intérieur.'],
      ['Description et questions', 'Le texte libre et les questions personnalisées que vous avez définies pour tous les lieux.'],
      ['Apparitions', 'Les scènes qui se passent ici ou dans l’un des lieux qu’il contient.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Des fiches des types que vous définissez : vaisseaux, technologies, créatures, organisations…',
    parts: [
      ['Types', '« Ajouter un type » en crée un avec son nom, son icône et ses champs. Chaque type est un onglet.'],
      ['Fiches', 'Elles ont les champs de leur type et, en plus, une description, des images et un identifiant.'],
      ['Comme n’importe quel élément', 'Elles s’indiquent dans les scènes (bloc « Intrigues et objets »), apparaissent dans la chronologie et dans la recherche, et entrent dans Continuité.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Les liens entre les éléments du roman : ce que vous dessinez et ce qui se déduit tout seul.',
    parts: [
      ['Mes cartes', 'Vous pouvez en avoir plusieurs : la famille, l’équipage, les camps. Chacune est une zone de dessin.'],
      ['Éléments et flèches', 'Sur une carte, vous ajoutez des fiches (ou des textes libres) et vous en reliez deux par une flèche étiquetée : « mère de », « ennemi de », « travaille pour ».'],
      ['Automatiques', 'Dix schémas qui découlent de ce qui est déjà noté : qui se croise en scène, qui détient chaque objet, qui connaît chaque secret, ce que relie un événement, personnages et lieux, personnages et intrigues, déplacements, groupes, lieux dans des lieux et relations (toutes celles notées dans les fiches et sur les cartes, plus les frères et sœurs et les grands-parents qui s’en déduisent). Ils ne sont pas enregistrés : ils sont recalculés à l’ouverture.'],
      ['Tout ensemble', 'Un schéma général avec les vôtres (trait plein) et les automatiques (pointillés, chacune de sa couleur), avec des cases à cocher pour choisir celles qui s’affichent.'],
      ['Lire un schéma', 'Plus la ligne est épaisse, plus la relation est fréquente. Survolez un élément, ou touchez-le pour le fixer, et les siennes sont mises en évidence avec leur intitulé. La liste se trouve en dessous.'],
      ['Les voir dans les fiches', 'Personnages et Lieux ont un onglet « Relations » qui réunit celles de toutes vos cartes.'],
    ],
    tips: ['« Exporter les relations » les exporte vers Word, texte, Excel, CSV ou JSON.', 'Une flèche « mère », « père » ou « fils » entre deux personnages permet aussi à Continuité de vérifier leurs dates de naissance.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'La structure du roman : parties, chapitres, prologue et épilogue.',
    parts: [
      ['La liste', 'Chaque chapitre avec ses scènes, ses mots, son temps de lecture, son état, les personnages les plus présents et un carré de couleur pour chaque intrigue qu’il touche. En haut, le total du livre.'],
      ['Temps de lecture', 'Approximatif, à environ 250 mots par minute. Dans chaque chapitre figure aussi celui de chaque scène.'],
      ['Les intrigues', 'Survolez un carré (ou maintenez le doigt dessus sur un écran tactile) pour voir le nom de l’intrigue, son type et sa description.'],
      ['Réordonner', 'Faites glisser les lignes, utilisez Alt+↑/↓ ou le menu ⋯ de chacune.'],
      ['Autres vues', '« Tableau » affiche les scènes sous forme de cartes pour les déplacer d’un chapitre à l’autre ; « Plan », tout sous forme d’arbre.'],
    ],
    tips: ['« Structure » ajoute des parties, un prologue ou un épilogue, importe un brouillon Word et repère les mentions dans toutes les scènes.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Un chapitre : ses scènes et ses notes.',
    parts: [
      ['Scènes', 'On les crée, on les réordonne en les faisant glisser et on les déplace vers un autre chapitre depuis leur menu ⋯. Sous le titre de chacune : quand elle se passe et combien de temps elle dure, qui raconte et un carré de couleur pour chaque lieu (survolez-le, ou maintenez le doigt dessus, pour voir lequel).'],
      ['Raison d’être et notes', 'À quoi sert le chapitre dans le roman et ce que vous voulez garder en tête en l’écrivant.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'C’est ici qu’on écrit. À gauche, le texte ; à droite, la fiche de la scène.',
    parts: [
      ['Le texte', 'Il s’enregistre tout seul. La barre propose la mise en forme, le tiret de dialogue et les guillemets, la recherche et le remplacement, et l’ajout d’une tâche sur la sélection.'],
      ['La fiche', 'En blocs repliables : qui apparaît et qui raconte, où et quand, événements, intrigues et objets, continuité, tâches, documentation et révisions.'],
      ['Événements', 'Le bloc « Événements » montre les faits liés à la scène : ceux qui s’y passent (ils prennent sa date) et ceux qui y sont racontés (un souvenir : ils gardent la leur). Replié, il dit lesquels ; ouvert, il donne pour chacun la date, la description, qui il concerne et dans quelles autres scènes il figure.'],
      ['Détection automatique', 'Ce que vous nommez dans le texte (personnages, lieux, objets, groupes) s’indique tout seul, avec le mot « auto ». Si vous le retirez, il n’est pas rajouté.'],
      ['Révisions', 'Des versions du texte de la scène. Vous pouvez en créer une nouvelle avant de réécrire, les comparer et revenir à une version précédente.'],
      ['Outils', 'Dans la barre : vue partagée (une fiche ou une autre scène à côté), révision du style, lecture à voix haute et mode sans distraction.'],
      ['Continuité', 'Notez ici ce qui change d’état (« blessée au bras », « la clé passe à Alex ») et quel secret est révélé, et à qui.'],
    ],
    tips: ['Ctrl+S enregistre immédiatement ; Ctrl+F recherche ; Échap quitte le mode sans distraction.', 'La date de la scène la place dans la chronologie et permet de calculer les âges et de détecter les impossibilités.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Les scènes sous forme de cartes, pour voir le roman d’un coup d’œil et le réorganiser.',
    parts: [
      ['Colonnes et cartes', 'Chaque chapitre est une colonne (quatre par rangée) et chaque scène une carte avec son résumé, qui raconte, où et quand.'],
      ['Résumé', 'Cliquez sur le texte d’une carte pour écrire de quoi parle la scène.'],
      ['Déplacer', 'Faites glisser une carte pour la déplacer ou la changer de chapitre. Sur écran tactile, utilisez son menu ⋯.'],
      ['Intrigues', 'Les traits de couleur sont les intrigues de la scène ; la légende du haut indique laquelle est laquelle.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Tout ce qui décrit le roman en tant que livre.',
    parts: [
      ['Informations du livre', 'Titre et langue (obligatoires), et auteur, série, numéro, date de publication, éditeur, couverture et synopsis (facultatifs). Ils figurent sur la page de faux-titre et dans les métadonnées du livre numérique.'],
      ['Objectifs', 'Objectif de mots, objectif quotidien, date d’échéance et mots par chapitre. Ils se suivent depuis l’accueil.'],
      ['Pages du livre', 'Copyright, dédicace, épigraphe, remerciements et « À propos de l’auteur » avec sa photo. Ils sont ajoutés à l’exportation.'],
      ['Projet', 'Sauvegarde (un .zip avec toutes les données, les images et documents, ainsi que le livre et les fiches au format Word), création d’une suite (elle conserve le monde et commence sans chapitres) et suppression du projet. La sauvegarde se restaure avec « Importer une sauvegarde » dans « Vos projets ».'],
    ],
    tips: ['Sans auteur, le livre est exporté comme « Anonyme ».'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Ce qu’il reste à revoir, en un seul endroit.',
    parts: [
      ['D’où elles viennent', 'D’une marque sur le texte d’une scène, ou indépendantes, rattachées à une fiche ou au projet.'],
      ['Types et état', 'Chaque tâche a un type (incohérence, information à vérifier, à revoir, idée) et se marque comme résolue quand elle l’est.'],
      ['Aller à l’endroit', 'Depuis une tâche marquée sur le texte, on saute à la phrase exacte de la scène.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Les faits dans l’ordre : les scènes datées et les événements du monde.',
    parts: [
      ['Ce qui apparaît', 'Une scène apparaît quand vous lui donnez une date dans sa fiche. Un événement se crée ici ou dans la fiche d’un élément ; il peut être général ou appartenir à un ou plusieurs éléments.'],
      ['Événements et scènes', 'Un événement se lie aux scènes où il se passe (il prend leur date et apparaît à l’intérieur) ou à celles où il est seulement raconté (il garde la sienne). Si un événement indépendant a la même date et la même heure qu’une scène, une alerte propose de les lier.'],
      ['Deux ordres', '« Chronologique » trie par date ; « De lecture », comme dans le livre, pour voir où le récit revient en arrière.'],
      ['Début et fin du livre', 'Deux repères signalent la première et la dernière scène que lit le lecteur : ce qui précède appartient au passé antérieur au roman.'],
      ['Suivre et filtres', '« Suivre » limite la chronologie à un seul élément ; les cases à cocher masquent des types d’entrées.'],
      ['Recherche', 'Par texte, date ou identifiant. « a & b » exige les deux ; « a | b », l’un des deux. Le « ? » à côté donne des exemples.'],
      ['Importer et exporter', 'Vers CSV, JSON, Excel ou Word, et dans l’autre sens : crée les événements manquants et met à jour ceux qui existent déjà.'],
    ],
    tips: ['Entre deux entrées, le temps écoulé est indiqué ; en survolant, il s’affiche en détail.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Pour ne pas vous contredire : les impossibilités détectables, qui sait quoi et comment chaque élément évolue.',
    parts: [
      ['Vérifications', 'Croise les dates et les lieux des scènes, les personnages présents, les naissances et les décès, les états et les secrets. Signale, par exemple, quelqu’un qui se trouve à deux endroits à la fois.'],
      ['Impossible ou à vérifier', 'Ce qui ne peut pas être apparaît comme « Impossible » ; ce qui peut être voulu, comme « À vérifier ». Chaque alerte peut être ignorée.'],
      ['Qui sait quoi', 'Les secrets du roman, un par ligne, et la scène où chaque personnage, et le lecteur, les apprend. Ils sont triés selon leur première révélation (par date ou dans l’ordre de lecture), et la recherche trouve par titre, contenu, personne ou scène. Cliquez sur une ligne pour voir le détail.'],
      ['Suivi', 'Parcourt le livre en suivant un élément : où il apparaît et comment son état évolue.'],
    ],
    tips: ['Les états et les révélations se notent dans la fiche de chaque scène, bloc « Continuité ».', 'Plus vous complétez (dates, lieux, naissances), plus on trouve.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Des mesures du manuscrit et de votre façon de l’écrire.',
    parts: [
      ['Mon écriture', 'Mots par jour, séries, sessions et prévision de fin.'],
      ['Le livre', 'Longueur des chapitres et des scènes, proportion de dialogue et de narration, et répétitions.'],
      ['Style', 'Adverbes en -ment, répétitions rapprochées, tics de langage et phrases longues, par chapitre ; met en évidence où il y en a le plus. Suit les règles de la langue du roman.'],
      ['Graphique narratif', 'Une ligne par élément et une colonne par scène : qui disparaît trop longtemps et quelles intrigues ne se croisent pas.'],
      ['Répartition et apparitions', 'Dans combien de scènes de chaque chapitre apparaît chaque élément, et la liste des scènes d’un personnage.'],
    ],
    tips: ['Le « ? » à côté de chaque colonne explique ce qu’elle mesure.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Recherchez (et remplacez) dans tout le projet.',
    parts: [
      ['Où chercher', 'Cochez les domaines : texte des scènes, titres, personnages, monde, architecture et notes, documentation et tâches.'],
      ['Options', 'Respecter la casse et rechercher uniquement des mots entiers.'],
      ['Remplacer', 'Change le texte dans tout ce qui est coché, après vous avoir indiqué à combien d’endroits. Pratique pour renommer un personnage.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Sortez le roman ou le matériel de travail dans un fichier.',
    parts: [
      ['Quoi exporter', 'Le roman ou le dossier (architecture, personnages, lieux et autres fiches).'],
      ['Types d’exportation', 'Manuscrit à envoyer, livre imprimé (avec estimation du nombre de pages et du dos), livre numérique (EPUB) ou format libre.'],
      ['Formats', 'Word, EPUB, page web ou PDF, et texte.'],
      ['Informations et pages du livre', 'La page de faux-titre, les métadonnées du livre numérique, la couverture et les pages liminaires et finales viennent de « Livre ».'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Ce que vous supprimez n’est pas perdu tout de suite : il arrive ici.',
    parts: [
      ['Restaurer', 'Remet un élément à sa place, avec ce qui en dépendait.'],
      ['Expiration', 'Au bout du nombre de jours fixé dans les Réglages (entre 1 et 60), il est supprimé définitivement.'],
    ],
    guide: 'data#trash',
  },
};
