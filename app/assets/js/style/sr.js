// List za pregled teksta (srpski): koriste ga „Analiza“, provera stila u uredniku i prepoznavanje
// imena u romanu pisanom na ovom jeziku. Može se slobodno proširivati. Roman može biti pisan latinicom
// ili ćirilicom, pa je svaka reč navedena u oba pisma (prvo latinica, zatim ćirilica).
export default {
  // Uobičajene reči (veznici, predlozi, zamenice, pomoćni glagoli, česti prilozi): ne računaju se
  // kao ponavljanja ni među najčešćim rečima. Svejedno je da li ima dijakritika.
  stop: (
    'a ali ama ako već da dok i ili jer kad kada kao kako kojeg kojem koji koja koje koju kojima kojih kojoj kojim ni niti '
    + 'nego no pa pošto sve svi sva svaki svaka svako svakog svakom svih svim sam sama samo sami sebe sebi sobom se si smo '
    + 'ste su sa sad sada onda tada tamo tu ovde ovdje tuda bio bila bilo bili bile bih bi biste bismo biće biti bude budu '
    + 'budem budeš budemo budete jesam jesi je jeste jesmo jesu nisam nisi nije nismo niste nisu ću ćeš će ćemo ćete mogu '
    + 'možeš može možemo možete mogao mogla moglo mogli mogle moram moraš mora moramo morate moraju morao morala morali hteo '
    + 'htela htelo hteli htio htjela imam imaš ima imamo imate imaju imao imala imali imati ja mene me meni mi mnom ti tebe '
    + 'te tebi tobom on njega ga njemu mu njim ona nje joj nju ju ono nas nam nama vi vas vam vama oni one njih ih im njima '
    + 'moj moja moje moju mog mom mojim mojih tvoj tvoja tvoje njegov njegova njegovo njen njena njeno njeni njihov njihova '
    + 'njihovo naš naša naše vaš vaša vaše ovaj ova ovo ovog ovom ovim ovih ove ovu taj ta to tog tom tim tih onaj onog onom '
    + 'onim onih onu takav takva takvo tako ovako onako šta što ko ništa niko nešto neko nekad nikad nigde nikada ponekad '
    + 'uvek uvijek često stalno ipak međutim zato zbog toga stoga dakle naime čak još tek baš upravo jedva skoro gotovo malo '
    + 'više manje mnogo vrlo veoma sasvim dosta previše opet ponovo zatim posle pre nakon prije kroz bez do iz na nad o od '
    + 'ispod iznad ispred iza oko po pod pred pri preko prema protiv radi umesto uprkos u za između među sred rekao rekla '
    + 'reče rekli reci uradio uradila znao znala video videla gledao gledala '
    + 'а али ама ако већ да док и или јер кад када као како којег којем који која које коју којима којих којој којим ни нити '
    + 'него но па пошто све сви сва сваки свака свако сваког сваком свих свим сам сама само сами себе себи собом се си смо '
    + 'сте су са сад сада онда тада тамо ту овде овдје туда био била било били биле бих би бисте бисмо биће бити буде буду '
    + 'будем будеш будемо будете јесам јеси је јесте јесмо јесу нисам ниси није нисмо нисте нису ћу ћеш ће ћемо ћете могу '
    + 'можеш може можемо можете могао могла могло могли могле морам мораш мора морамо морате морају морао морала морали хтео '
    + 'хтела хтело хтели хтио хтјела имам имаш има имамо имате имају имао имала имали имати ја мене ме мени ми мном ти тебе '
    + 'те теби тобом он њега га њему му њим она ње јој њу ју оно нас нам нама ви вас вам вама они оне њих их им њима мој моја '
    + 'моје моју мог мом мојим мојих твој твоја твоје његов његова његово њен њена њено њени њихов њихова њихово наш наша '
    + 'наше ваш ваша ваше овај ова ово овог овом овим ових ове ову тај та то тог том тим тих онај оног оном оним оних ону '
    + 'такав таква такво тако овако онако шта што ко ништа нико нешто неко некад никад нигде никада понекад увек увијек често '
    + 'стално ипак међутим зато због тога стога дакле наиме чак још тек баш управо једва скоро готово мало више мање много '
    + 'врло веома сасвим доста превише опет поново затим после пре након прије кроз без до из на над о од испод изнад испред '
    + 'иза око по под пред при преко према против ради уместо упркос у за између међу сред рекао рекла рече рекли реци урадио '
    + 'урадила знао знала видео видела гледао гледала'
  ).split(' '),

  // Popune: reči i izrazi koji se uvuku u tekst a ništa ne daju.
  fillers: [
    'iznenada', 'odjednom', 'u tom trenutku', 'u tom času', 'na trenutak', 'malo', 'pomalo', 'donekle', 'zapravo',
    'naime', 'stvarno', 'zaista', 'jednostavno', 'u suštini', 'doslovno', 'naravno', 'očigledno', 'jasno', 'skoro',
    'gotovo', 'nekako', 'nešto', 'stvar', 'stvari', 'počeo je', 'počela je', 'činilo se', 'uzdahnuo je', 'uzdahnula je',
    'klimnuo glavom', 'klimnula glavom', 'nasmešio se', 'nasmešila se', 'slegnuo ramenima', 'slegnula ramenima',
    'namrštio se', 'namrštila se', 'progutao knedlu', 'progutala knedlu', 'изненада', 'одједном', 'у том тренутку',
    'у том часу', 'на тренутак', 'мало', 'помало', 'донекле', 'заправо', 'наиме', 'стварно', 'заиста', 'једноставно',
    'у суштини', 'дословно', 'наравно', 'очигледно', 'јасно', 'скоро', 'готово', 'некако', 'нешто', 'ствар', 'ствари',
    'почео је', 'почела је', 'чинило се', 'уздахнуо је', 'уздахнула је', 'климнуо главом', 'климнула главом',
    'насмешио се', 'насмешила се', 'слегнуо раменима', 'слегнула раменима', 'намрштио се', 'намрштила се',
    'прогутао кнедлу', 'прогутала кнедлу'
  ],

  // Prilozi za način nemaju pouzdan nastavak: bolje je ne brojati ništa nego brojati pogrešno.
  adverbs: null,

  // Srpski nema člana.
  articles: [],

  // Oslovljavanja i titule ispred imena ili prezimena.
  titles: [
    'gospodin', 'gospođa', 'gospođica', 'g', 'gđa', 'gđica', 'doktor', 'doktorka', 'dr', 'profesor', 'profesorka', 'prof',
    'kapetan', 'major', 'pukovnik', 'general', 'poručnik', 'narednik', 'otac', 'majka', 'sestra', 'brat', 'stric', 'ujak',
    'teta', 'tetka', 'kralj', 'kraljica', 'princ', 'princeza', 'knez', 'grof', 'grofica', 'car', 'sveti', 'sveta', 'sv',
    'majstor', 'inženjer', 'komesar', 'pop', 'iguman', 'господин', 'госпођа', 'госпођица', 'г', 'гђа', 'гђица', 'доктор',
    'докторка', 'др', 'професор', 'професорка', 'проф', 'капетан', 'мајор', 'пуковник', 'генерал', 'поручник', 'наредник',
    'отац', 'мајка', 'сестра', 'брат', 'стриц', 'ујак', 'тета', 'тетка', 'краљ', 'краљица', 'принц', 'принцеза', 'кнез',
    'гроф', 'грофица', 'цар', 'свети', 'света', 'св', 'мајстор', 'инжењер', 'комесар', 'поп', 'игуман'
  ],
};
