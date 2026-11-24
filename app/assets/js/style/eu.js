// Testuaren berrikuspen-orria (euskara): «Azterketak», editoreko estilo-berrikuspenak eta izen-detekzioak
// erabiltzen dutena, hizkuntza honetan idatzitako eleberri baterako. Libreki zabal daiteke.
export default {
  // Hitz hutsak (lokailuak, atzizki-hitzak, izenordainak, aditz laguntzaileak, adberbio arruntak):
  // ez dira zenbatzen errepikapen gisa, ezta gehien erabilitako hitzen artean ere. Azentuek ez dute eraginik.
  stop: (
    'eta edo baina ere ez bai ba baita ezta ezen zeren nahiz baldin ordea ordez aldiz berriz berriro bezala bezain '
    + 'arte bitartean gabe buruz gainera ondoren aurretik aurrera atzera barruan kanpoan gainean azpian ondoan aldean '
    + 'artean inguruan bidez arabera kontra alde baino baizik ni zu hura gu zuek haiek nik zuk hark guk niri zuri hari '
    + 'guri zuei haiei nire zure bere gure zuen beren euren neu zeu bera geu zeuek beraiek hau hori hauek horiek honek '
    + 'horrek honi horri honen horren haren honetan horretan hartan hauen horien haien hauetan horietan haietan '
    + 'honetatik hortik harrezkero honetara horretara hartara honela horrela hala hola hemen hor han hona horra hara '
    + 'hemengo horko hango da dira zen ziren dago daude zegoen zeuden du dute zuten dut dugu duzu duzue ditut ditugu '
    + 'dituzu dituzue ditu dituzte zituen zituzten nuen genuen zenuen zenuten nintzen ginen zinen zineten naiz gara '
    + 'zara zarete nago gaude zaude zaudete dela zela direla zirela dutela zutela zegoela zeudela duen den diren dituen '
    + 'zuela zituela izan izango izaten egon egongo eduki ukan egin egiten egingo esan esaten zion zien zidan zizkion '
    + 'zioen dio diote dezake daiteke ahal ezin behar nahi orain gero orduan behin beti inoiz sekula oso asko gutxi '
    + 'gehiago gutxiago nahiko ia bakarrik bakar dena denak guztia guztiak guztiz batzuk batzuek beste bertze edozein '
    + 'zer nor non noiz nola zergatik zein zenbat bat bi hiru ezer inor inork inon inondik ezein inolako zerbait '
    + 'norbait nonbait noizbait nolabait beraz hortaz horregatik orduko gaur atzo bihar goian behean aurrean atzean '
    + 'ondoko aldi zati dagoen daudenak zegoena'
  ).split(' '),

  // Betegarriak eta esaldi tipikoak: ezer ekarri gabe sartzen diren hitzak eta esamoldeak.
  fillers: ['bat-batean', 'ustekabean', 'une horretan', 'momentu hartan', 'une batez', 'pixka bat', 'apur bat',
    'egia esan', 'izatez', 'benetan', 'sinpleki', 'oro har', 'noski', 'jakina', 'nolabait', 'berez', 'alegia',
    'esan nahi dut', 'zerbait', 'gauza', 'gauzak', 'hasi zen', 'hasi ziren', 'ematen zuen', 'iruditu zitzaion',
    'hasperen egin zuen', 'irribarre egin zuen', 'baiezkoa egin zuen buruarekin', 'sorbaldak jaso zituen',
    'bekainak zimurtu zituen', 'listua irentsi zuen'],

  // Euskaraz adberbio-sailkapena ez dago amaiera fidagarri baten mende: ez dira zenbatzen.
  adverbs: null,

  // Euskarak ez du artikulu aurrizkirik izen propioen aurrean.
  articles: [],

  // Izen propioen aurretik joan daitezkeen tratamenduak eta tituluak («Doña Ines» → «Ines»).
  titles: ['jaun', 'jauna', 'andere', 'andrea', 'don', 'doña', 'done', 'doktore', 'doktorea', 'dr', 'kapitain',
    'kapitaina', 'aita', 'ama', 'osaba', 'izeba', 'aitona', 'amona', 'san', 'santa', 'errege', 'erregina', 'printze',
    'printzesa', 'konde', 'kondesa', 'duke', 'jenerala', 'koronela', 'sarjentua', 'tenientea', 'irakasle', 'maisu',
    'maistra', 'apaiz', 'abade', 'alkate'],
};
