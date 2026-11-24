// Arkusz korekty tekstu (polski): z niego korzystają „Analiza”, kontrola stylu w edytorze
// i wykrywanie imion w powieści pisanej w tym języku. Można go swobodnie rozszerzać.
export default {
  // Słowa pospolite (spójniki, przyimki, zaimki, czasowniki posiłkowe, częste przysłówki):
  // nie liczą się jako powtórzenia ani wśród najczęstszych słów. Z ogonkami lub bez — bez różnicy.
  stop: (
    'a ale albo aby ach bardzo bez beze bo by był była było były byli będzie będą będę być byłam byłem byłaby byłoby '
    + 'bym byś bądź chociaż choć ci cię co coś czy czyli czemu często dla dlaczego do dość dopiero dużo gdy gdyby gdyż gdzie '
    + 'gdzieś go i ich ile im inny inna inne innych iż ja jak jakby jakiś jakaś jakieś jako jakoś je jednak jego jej jemu '
    + 'jeszcze jest jestem jesteś jesteśmy jesteście są jeśli jeżeli już ją każdy każda każde kiedy kiedyś kto ktoś która '
    + 'które którego której któremu których którym którzy ku lecz lub ma mają mam masz mi miał miała miało mieli mieć '
    + 'między mimo mnie mną mogła mogło mogli mogły mógł mogą może można moi moich moim mój moja moje mu my na nad nade nam '
    + 'nami nas nasz nasza nasze naszych nawet nic nich nie niego niej niemu nigdy nim nimi niż no o od ode około on ona '
    + 'one oni ono oraz oto owszem po pod pode podczas ponad ponieważ powinien poza przecież przed przede przez '
    + 'przy raz razem sam sama same sami się sobie sobą swój swoja swoje swoich swoim swoimi swojej swojego swoją tak '
    + 'taka taki takie takich także tam te tego tej tem temu ten teraz też to tobie tobą toteż trochę tu tutaj twój '
    + 'twoja twoje ty tych tylko tym u w wam wami was wasz wasza wasze we wiele wielu więc więcej wszyscy wszystko wszystkich '
    + 'wszystkim wtedy wy z za zaś ze zawsze zbyt znów żadna żaden żadne że żeby dalej potem wciąż właśnie wreszcie '
    + 'nagle niby mówił mówiła powiedział powiedziała rzekł rzekła zrobił zrobiła '
    + 'musiał musiała musiało chciał chciała chcieli wiedział wiedziała'
  ).split(' '),

  // Wypełniacze: słowa i zwroty, które wchodzą do tekstu, nic nie wnosząc.
  fillers: ['nagle', 'w tej chwili', 'w tym momencie', 'w jednej chwili', 'w pewnej chwili', 'na chwilę', 'trochę', 'nieco',
    'właściwie', 'faktycznie', 'naprawdę', 'po prostu', 'zasadniczo', 'dosłownie', 'oczywiście', 'najwyraźniej', 'wyraźnie',
    'prawie', 'całkiem', 'dość', 'jakoś', 'coś', 'rzecz', 'rzeczy', 'zaczął', 'zaczęła', 'wydawało się', 'westchnął',
    'westchnęła', 'skinął głową', 'skinęła głową', 'uśmiechnął się', 'uśmiechnęła się', 'wzruszył ramionami',
    'wzruszyła ramionami', 'zmarszczył brwi', 'zmarszczyła brwi', 'przełknął ślinę', 'przełknęła ślinę'],

  // Przysłówki sposobu nie mają w polskim niezawodnej końcówki: lepiej nie liczyć niczego niż liczyć źle.
  adverbs: null,

  // Polski nie ma rodzajników.
  articles: [],

  // Zwroty grzecznościowe i tytuły przed imieniem lub nazwiskiem.
  titles: ['pan', 'pani', 'panna', 'państwo', 'doktor', 'doktorze', 'dr', 'profesor', 'profesorze', 'prof', 'kapitan',
    'kapitanie', 'major', 'pułkownik', 'generał', 'porucznik', 'sierżant', 'ksiądz', 'ojciec', 'matka', 'siostra', 'brat',
    'wuj', 'wujek', 'ciocia', 'ciotka', 'król', 'królowa', 'książę', 'księżna', 'hrabia', 'hrabina', 'baron', 'święty',
    'święta', 'św', 'mistrz', 'inżynier', 'mecenas', 'komisarz'],
};
