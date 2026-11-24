// Full de revisió del text (català): el que fan servir l'«Anàlisi», la revisió d'estil de l'editor
// i la detecció de noms per a una novel·la escrita en aquest idioma. Es pot ampliar lliurement.
export default {
  // Paraules buides (articles, preposicions, pronoms, verbs auxiliars, adverbis comuns):
  // no compten com a repeticions ni entre les paraules més usades. Tant se val amb o sense accent.
  stop: (
    'a al als el la els les un una uns unes de del dels per pel pels amb sense sobre sota entre fins cap des davant '
    + 'darrere dins fora contra segons durant mitjançant vers i o ni però sinó doncs així perquè que com quan mentre '
    + 'encara tot malgrat jo tu ell ella nosaltres vosaltres vós ells elles vostè vostès em et es se li us ens hi ho en '
    + 'me te mi ti mon ma meu meva meus meves teu teva teus teves seu seva seus seves nostre nostra nostres vostre '
    + 'vostra vostres aquest aquesta aquests aquestes aquell aquella aquells aquelles això allò qui què quin quina '
    + 'quins quines qual quals quant quanta quants quantes on ser sóc ets és som sou són era eres érem éreu eren fou '
    + 'foren fos fossin sigui siguin sent estat estada estar estic estàs està estem esteu estan estava estaves estàvem '
    + 'estaven estigué estiguessin haver he has ha hem heu han havia havies havíem havien hagué hagut haguessin tenir '
    + 'tinc tens té tenim teniu tenen tenia tenies teníem tenien tingué tingut poder puc pots pot podem podeu poden '
    + 'podia podien pogué pogut fer faig fas fa fem feu fan feia feien va vas vam vau van fet fent dir dic dius diu '
    + 'diem dieu diuen deia deien digué dit dient anar vaig veure veia veié vist donar ara aquí allà allí també mai '
    + 'sempre ja només solament molt molta molts moltes poc poca pocs poques més menys tan tant tanta tants tantes bé '
    + 'mal gairebé tota tots totes altre altra altres cert certa algun alguna alguns algunes res algú ningú cada '
    + 'qualsevol llavors després abans ahir avui demà sí no mateix mateixa mateixos mateixes lluny prop damunt davall '
    + "d'un d'una n'hi l'altre m'ha t'ha s'ha l'ha"
  ).split(' '),

  // Mots de farciment i comodins: paraules i locucions que s'hi colen sense aportar res.
  fillers: ['de sobte', "d'un cop", 'en aquell moment', 'en aquest moment', 'per un moment', 'per un instant', 'una mica',
    'un xic', 'la veritat és que', 'el cert és que', 'de fet', 'és clar', 'sens dubte', 'realment', 'simplement',
    'bàsicament', 'literalment', 'òbviament', 'evidentment', 'clarament', 'pràcticament', 'bastant', 'molt', 'cosa',
    'coses', 'va començar a', 'es va posar a', 'semblava', 'va semblar', 'va sospirar', 'va assentir', 'va somriure',
    'va arronsar les espatlles', "va arrufar les celles", 'va empassar saliva', 'va fer un gest amb el cap'],

  // Adverbis de manera reconeguts per la terminació. `exceptions`: paraules acabades en -ment que no ho són.
  adverbs: {
    suffix: 'ment', minLength: 7, per1000: 9,
    exceptions: [
      'moment', 'pensament', 'sentiment', 'moviment', 'comportament', 'coneixement', 'ajuntament', 'parlament',
      'document', 'element', 'instrument', 'compliment', 'complement', 'ornament', 'monument', 'argument', 'fonament',
      'fragment', 'segment', 'sediment', 'experiment', 'suplement', 'tractament', 'naixement', 'creixement', 'sofriment',
      'patiment', 'lliurament', 'pagament', 'casament', 'enteniment', 'entenement', 'agraïment', 'reconeixement',
      'establiment', 'desenvolupament', 'comandament', 'manament', 'mandament', 'ensenyament', 'enfonsament',
      'enterrament', 'aixecament', 'alçament', 'allotjament', 'allunyament', 'apartament', 'aparcament', 'acompanyament',
      'acolliment', 'adormiment', 'agrupament', 'ajustament', 'aliment', 'armament', 'arranjament', 'assentament',
      'assortiment', 'atreviment', 'avorriment', 'bombardament', 'calçament', 'cobriment', 'commovement', 'compartiment',
      'condiment', 'consentiment', 'convenciment', 'debilitament', 'decaïment', 'departament', 'desacoblament',
      'desembarcament', 'desenganyament', 'despreniment', 'destacament', 'detriment', 'divertiment', 'empleniment',
      'enfrontament', 'enrariment', 'ensopiment', 'entrenament', 'entreteniment', 'equipament', 'esdeveniment',
      'estament', 'estancament', 'estirament', 'estrenyiment', 'ferment', 'frenament', 'fundament', 'funcionament',
      'gaudiment', 'impediment', 'implement', 'increment', 'instal·lament', 'jurament', 'jaciment', 'lament', 'lloament',
      'mament', 'manteniment', 'medicament', 'nodriment', 'nomenament', 'ofegament', 'oment', 'omplement', 'oprimiment',
      'passament', 'penediment', 'pigment', 'plantejament', 'pressentiment', 'procediment', 'pronunciament',
      'recolzament', 'reglament', 'regiment', 'requeriment', 'resentiment', 'revestiment', 'sagrament', 'salvament',
      'seguiment', 'temperament', 'testament', 'torment', 'tornament', 'trencament', 'trobament', 'turment', 'vestiment',
      'vessament', 'abastament', 'abonament', 'acabament', 'acarament', 'adoctrinament', 'afalagament', 'agenollament',
      'aixoplugament', 'allargament', 'amagament', 'apaivagament', 'aplaudiment', 'aprofitament',
      'assoliment', 'atordiment', 'atrapament', 'bressament', 'cobrament', 'concerniment',
      'desafiament', 'desmuntament', 'desplaçament', 'dimensionament', 'emplaçament', 'encariment',
      'encaminament', 'encoratjament', 'endeutament', 'enfonament', 'engrandiment', 'enllaçament', 'ensorrament',
      'envelliment', 'equilibrament', 'escalfament', 'esclariment', 'esgotament', 'espessiment', 'estudiament',
      'evacuament', 'finançament', 'gemegament', 'guariment', 'habillament', 'hospedament', 'ingrediment', 'maridament',
      'mirament', 'mudament', 'obliment', 'ocultament', 'oferiment', 'plegament', 'poblament',
      'pressionament', 'quadrament', 'recobrament', 'refredament', 'relliscament', 'reemplaçament', 'rendiment',
      'renaixement', 'resultament', 'revoltament', 'rodament', 'sepultament', 'soterrament', 'tancament', 'vencement'],
  },

  // Articles que poden anar davant d'un nom («El Far»): el nom es busca també sense.
  // Els que s'apostrofen s'escriuen amb l'apòstrof al final («l'»).
  articles: ['el', 'la', 'els', 'les', 'un', 'una', 'uns', 'unes', "l'", "d'", "n'", 'en', 'na', 'lo', 'es', 'sa', 'ses'],

  // Tractaments i títols que precedeixen un nom propi («Don Quixot» → «Quixot»).
  titles: ['en', 'na', 'don', 'dona', 'senyor', 'senyora', 'senyoreta', 'sr', 'sra', 'srta', 'dr', 'dra', 'doctor',
    'doctora', 'capità', 'pare', 'mare', 'oncle', 'tia', 'fra', 'germà', 'germana', 'sant', 'santa', 'rei', 'reina',
    'príncep', 'princesa', 'comte', 'comtessa', 'duc', 'duquessa', 'general', 'coronel', 'sergent', 'tinent',
    'professor', 'professora', 'mestre', 'mestra', 'avi', 'àvia', 'major', 'almirall'],
};
