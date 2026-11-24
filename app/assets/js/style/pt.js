// Folha de revisão do texto (português, de Portugal e do Brasil): o que usam a «Análise», a revisão
// de estilo do editor e a deteção de nomes para um romance escrito neste idioma. Pode ampliar-se à vontade.
export default {
  // Palavras vazias (artigos, preposições, pronomes, verbos auxiliares, advérbios comuns):
  // não contam como repetições nem entre as palavras mais usadas. Tanto faz com ou sem acento.
  stop: (
    'a à às ao aos as o os um uma uns umas de da das do dos dum duma duns dumas em na nas no nos num numa nuns numas '
    + 'por pela pelas pelo pelos para pra pro pras pros com sem sob sobre entre até desde após perante contra ante e ou '
    + 'nem mas porém contudo todavia que se como quando porque pois enquanto embora conforme logo eu tu ele ela nós vós '
    + 'eles elas você vocês me mim comigo te ti contigo si consigo lhe lhes connosco conosco convosco vos lo la los las '
    + 'meu minha meus minhas teu tua teus tuas seu sua seus suas nosso nossa nossos nossas vosso vossa vossos vossas '
    + 'este esta estes estas esse essa esses essas aquele aquela aqueles aquelas isto isso aquilo neste nesta nestes '
    + 'nestas nesse nessa nesses nessas naquele naquela naqueles naquelas deste desta destes destas desse dessa desses '
    + 'dessas daquele daquela daqueles daquelas disto disso daquilo nisto nisso naquilo quem qual quais quanto quanta '
    + 'quantos quantas cujo cuja cujos cujas onde aonde ser sou és é somos sois são era eras éramos eram fui foste foi '
    + 'fomos foram fosse fossem seja sejam sendo sido será serão seria estar estou estás está estamos estão estava '
    + 'estavas estávamos estavam estive esteve estiveram estivesse estando estado ter tenho tens tem temos têm tinha '
    + 'tinhas tínhamos tinham tive teve tiveram tivesse tendo tido terá teria haver há havia houve houvesse havendo '
    + 'havido ir vai vais vão ia iam vou vamos poder pode podem podia podiam pôde puderam podendo fazer faz fazem fazia '
    + 'faziam fez fizeram fazendo feito dizer diz dizem dizia diziam disse disseram dizendo dito ver viu viram vê dar '
    + 'deu deram dá ainda agora ali aqui lá cá assim também talvez sempre nunca jamais já só apenas mesmo mesma mesmos '
    + 'mesmas muito muita muitos muitas pouco pouca poucos poucas mais menos tão tanto tanta tantos tantas bem mal '
    + 'quase todo toda todos todas outro outra outros outras algum alguma alguns algumas nenhum nenhuma nenhuns '
    + 'nenhumas tudo nada algo alguém ninguém cada qualquer quaisquer então depois antes ontem hoje amanhã dentro fora '
    + 'não sim vez cima baixo através'
  ).split(' '),

  // Muletillas e comodins: palavras e expressões que se infiltram sem acrescentar nada.
  fillers: ['de repente', 'de súbito', 'de golpe', 'naquele momento', 'nesse momento', 'por um momento', 'por um instante',
    'um pouco', 'um tanto', 'na verdade', 'o fato é que', 'o facto é que', 'de fato', 'de facto', 'claro', 'sem dúvida',
    'realmente', 'simplesmente', 'basicamente', 'literalmente', 'obviamente', 'evidentemente', 'claramente',
    'praticamente', 'bastante', 'muito', 'coisa', 'coisas', 'começou a', 'pôs-se a', 'parecia', 'pareceu', 'suspirou',
    'assentiu', 'acenou com a cabeça', 'sorriu', 'encolheu os ombros', 'deu de ombros', 'franziu a testa',
    'franziu o cenho', 'engoliu em seco'],

  // Advérbios de modo reconhecidos pela terminação. `exceptions`: palavras com -mente que não o são.
  adverbs: {
    suffix: 'mente', minLength: 7, per1000: 9,
    exceptions: ['demente', 'clemente', 'vehemente', 'veemente', 'jumente', 'semente', 'cimente', 'comente', 'lamente',
      'alimente', 'aumente', 'experimente', 'documente', 'fermente', 'implemente', 'complemente', 'atormente',
      'tormente', 'ornamente', 'argumente', 'sedimente', 'fomente', 'segmente'],
  },

  // Artigos que podem preceder um nome («O Farol»): o nome procura-se também sem ele.
  articles: ['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas'],

  // Tratamentos e títulos que precedem um nome próprio («Dom Quixote» → «Quixote»).
  titles: ['dom', 'dona', 'senhor', 'senhora', 'sr', 'sra', 'srta', 'dr', 'dra', 'doutor', 'doutora', 'capitão', 'padre',
    'mãe', 'pai', 'tio', 'tia', 'frei', 'irmã', 'irmão', 'são', 'santo', 'santa', 'rei', 'rainha', 'príncipe', 'princesa',
    'conde', 'condessa', 'duque', 'duquesa', 'general', 'coronel', 'sargento', 'tenente', 'professor', 'professora',
    'mestre', 'avô', 'avó', 'major', 'almirante'],
};
