// Szövegellenőrző lap (magyar): ezt használja az „Elemzés”, a szerkesztő stílusellenőrzése
// és a nevek felismerése az ezen a nyelven írt regényekben. Szabadon bővíthető.
export default {
  // Töltelékszavak (névelők, kötőszavak, névmások, segédigék, gyakori határozószók): nem számítanak
  // ismétlésnek, és nem kerülnek a leggyakoribb szavak közé. Ékezettel vagy anélkül, mindegy.
  stop: (
    'a az egy egyik másik mind minden mindig mindent mindenki mindez mindegyik és meg is s vagy de hanem azonban viszont '
    + 'mert hogy ha habár bár mintha mint mikor amikor amint amíg miközben mielőtt miután pedig hiszen tehát így úgy '
    + 'ugyanis sem se nem ne ni nincs nincsen nincsenek van vannak volt voltak lett lettek lenne lennének lesz lesznek '
    + 'lehet lehetett kell kellett kellene fog fognak fogok fogsz fogunk fogtok akar akart tud tudott tudta tudtam '
    + 'szeretne szabad még már csak épp éppen éppúgy igen nagyon elég egész egészen túl kissé eléggé majdnem szinte '
    + 'talán persze akkor aztán azután most itt ott ide oda ahol ahová ahonnan hol hova honnan amott ez ezt ezek ezeket '
    + 'ezen ezzel ezért ennek ebben ebből erre ettől ezzé azt azok azokat azon azzal azért annak abban abból arra '
    + 'attól azzá ilyen olyan ilyenek olyanok ekkor én engem nekem bennem tőlem rólam velem nekünk minket '
    + 'bennünk te téged neked benned tőled rólad veled ő őt neki benne tőle róla vele mi magunk ti titeket '
    + 'nektek bennetek ők őket nekik bennük tőlük róluk velük magam magad maga magát magának magukat '
    + 'enyém tied övé miénk tiétek övék kinek ki kit kié mit minek miért mivel miben mire kik melyik '
    + 'amelyik amely amelyek amelyet ami amit aminek amiért amiben miatt után előtt mellett között alatt fölött felett '
    + 'mögött mögé elé elől felé felől ellen iránt szerint által nélkül helyett óta múlva közben végett szemben '
    + 'ba be ra re ig fele '
    + 'mondta mondtam mondtad mondtuk mondták mondott kérdezte felelte válaszolta nézett látta látott tette tett '
    + 'csinált kezdett akarta néhány sok kevés több kevesebb egyszer kétszer valaki valami '
    + 'valahol valahogy valamikor senki semmi sehol soha sohasem néha gyakran folyton'
  ).split(' '),

  // Töltelékek: olyan szavak és fordulatok, amelyek belecsúsznak a szövegbe, de nem tesznek hozzá semmit.
  fillers: ['hirtelen', 'váratlanul', 'ebben a pillanatban', 'abban a pillanatban', 'egy pillanatra', 'egy pillanatig',
    'kicsit', 'egy kicsit', 'némileg', 'valamennyire', 'tulajdonképpen', 'voltaképpen', 'valójában', 'egyszerűen', 'lényegében',
    'szó szerint', 'természetesen', 'nyilvánvalóan', 'láthatóan', 'szinte', 'majdnem', 'meglehetősen', 'valahogy', 'valami',
    'dolog', 'dolgok', 'elkezdett', 'mintha', 'úgy tűnt', 'sóhajtott', 'bólintott', 'elmosolyodott', 'vállat vont',
    'homlokát ráncolta', 'összevonta a szemöldökét', 'nyelt egyet'],

  // A magyarban a módhatározószóknak nincs megbízható végződésük: jobb nem számolni semmit, mint rosszul számolni.
  adverbs: null,

  // Határozott és határozatlan névelők.
  articles: ['a', 'az', 'egy'],

  // Megszólítások és titulusok a név előtt (a magyarban sokszor a név után állnak is: úr, asszony).
  titles: ['úr', 'asszony', 'hölgy', 'kisasszony', 'doktor', 'doktornő', 'dr', 'professzor', 'prof', 'kapitány', 'őrnagy',
    'ezredes', 'tábornok', 'hadnagy', 'őrmester', 'atya', 'páter', 'apát', 'anya', 'nővér', 'testvér', 'bátyám', 'nagybácsi',
    'bácsi', 'néni', 'nagynéni', 'király', 'királyné', 'királynő', 'herceg', 'hercegnő', 'gróf', 'grófné', 'báró', 'szent',
    'szt', 'mester', 'mérnök', 'biztos'],
};
