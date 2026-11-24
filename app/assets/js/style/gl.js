// Folla de revisión do texto (galego): o que usan a «Análise», a revisión de estilo do editor
// e a detección de nomes para unha novela escrita neste idioma. Pódese ampliar libremente.
export default {
  // Palabras baleiras (artigos, preposicións, pronomes, verbos auxiliares, adverbios comúns):
  // non contan como repeticións nin entre as palabras máis usadas. Tanto ten con ou sen acento.
  stop: (
    'a á as ao aos o os un unha uns unhas de da das do dos dun dunha duns dunhas en na nas no nos nun nunha nuns '
    + 'nunhas por pola polas polo polos para pra pro con sen sobre entre ata desde tras contra ante segundo durante '
    + 'mediante e ou nin pero mais senón porén que se como cando porque pois mentres aínda logo xa eu ti el ela nós vós '
    + 'eles elas vostede vostedes me min comigo te contigo si consigo lle lles connosco convosco vos lo la los las llo '
    + 'lla mo ma meu miña meus miñas teu túa teus túas seu súa seus súas noso nosa nosos nosas voso vosa vosos vosas '
    + 'este esta estes estas ese esa eses esas aquel aquela aqueles aquelas isto iso aquilo neste nesta nestes nestas '
    + 'nese nesa neses nesas naquel naquela naqueles naquelas deste desta destes destas dese desa deses desas daquel '
    + 'daquela daqueles daquelas disto diso daquilo nisto niso naquilo quen cal cales canto canta cantos cantas cuxo '
    + 'cuxa cuxos cuxas onde ser son es é somos sodes era eras eramos eran fun foches foi fomos fostes foron fose fosen '
    + 'sexa sexan sendo sido será serán sería estar estou estás está estamos estades están estaba estabas estabamos '
    + 'estaban estiven estivo estivemos estiveron estivese estando estado ter teño tes ten temos tedes teñen tiña tiñas '
    + 'tiñamos tiñan tiven tivo tiveron tivese tendo tido terá tería haber hai había habían houbo houbese habendo '
    + 'habido ir vai vas van ía ían vou imos poder pode poden podía podían puido puideron podendo facer fai fan facía '
    + 'facían fixo fixeron facendo feito dicir di din dicía dicían dixo dixeron dicindo dito ver viu viron vía dar deu '
    + 'deron dá agora aquí alí aló acó así tamén quizais quizabes sempre nunca endexamais só soamente mesmo mesma '
    + 'mesmos mesmas moito moita moitos moitas pouco pouca poucos poucas máis menos tan tanto tanta tantos tantas ben '
    + 'mal case todo toda todos todas outro outra outros outras algún algunha algúns algunhas ningún ningunha ningúns '
    + 'ningunhas nada algo alguén ninguén cada calquera entón despois antes onte hoxe mañá dentro fóra non vez enriba '
    + 'debaixo'
  ).split(' '),

  // Mulletillas e comodíns: palabras e locucións que se cola sen achegar nada.
  fillers: ['de súpeto', 'de repente', 'nese momento', 'naquel momento', 'por un momento', 'por un instante',
    'un pouco', 'un chisco', 'na verdade', 'de feito', 'por suposto', 'sen dúbida', 'realmente', 'simplemente',
    'basicamente', 'literalmente', 'obviamente', 'evidentemente', 'claramente', 'practicamente', 'bastante',
    'moi', 'cousa', 'cousas', 'comezou a', 'púxose a', 'parecía', 'pareceu', 'suspirou', 'asentiu',
    'asentiu coa cabeza', 'sorriu', 'encolleu os ombros', 'arrugou a fronte', 'franciu o ceño', 'tragou saliva'],

  // Adverbios de modo recoñecidos pola terminación. `exceptions`: palabras con -mente que non o son.
  adverbs: {
    suffix: 'mente', minLength: 7, per1000: 9,
    exceptions: ['demente', 'clemente', 'vehemente', 'semente', 'cemente', 'comente', 'lamente', 'alimente', 'aumente',
      'experimente', 'documente', 'fermente', 'implemente', 'complemente', 'atormente', 'tormente', 'fomente',
      'argumente', 'segmente', 'sedimente'],
  },

  // Artigos que poden ir diante dun nome («O Farol»): o nome búscase tamén sen el.
  articles: ['o', 'a', 'os', 'as', 'un', 'unha', 'uns', 'unhas'],

  // Tratamentos e títulos que preceden un nome propio («Don Quixote» → «Quixote»).
  titles: ['don', 'dona', 'señor', 'señora', 'sr', 'sra', 'srta', 'dr', 'dra', 'doutor', 'doutora', 'capitán', 'pai',
    'nai', 'tío', 'tía', 'frei', 'irmá', 'irmán', 'san', 'santo', 'santa', 'rei', 'raíña', 'príncipe', 'princesa',
    'conde', 'condesa', 'duque', 'duquesa', 'xeneral', 'coronel', 'sarxento', 'tenente', 'profesor', 'profesora',
    'mestre', 'avó', 'avoa', 'maior', 'almirante'],
};
