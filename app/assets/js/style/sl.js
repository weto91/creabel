// List za pregled besedila (slovenščina): uporabljajo ga »Analiza«, slogovni pregled v urejevalniku
// in prepoznavanje imen v romanu, napisanem v tem jeziku. Lahko ga poljubno razširite.
export default {
  // Pogoste besede (vezniki, predlogi, zaimki, pomožni glagoli, pogosti prislovi): ne štejejo
  // kot ponovitve niti med najpogostejšimi besedami. S strešicami ali brez, vseeno je.
  stop: (
    'a ali ampak da dokler in ker ko kot če čeprav četudi kajti niti ne nisem nisi nismo niste niso bi bil bila bilo bili '
    + 'bile bom boš bo bomo boste bodo biti sem si je smo ste so bodi bodite sva sta ima imam imaš imamo imate imajo imel '
    + 'imela imelo imeli imeti lahko mogel mogla moral morala moralo morali moram moraš mora morajo hotel hotela hoteli '
    + 'želel želela ja jaz mene me meni mi menoj ti tebe te tebi teboj on ga njega mu njemu njim ono ona nje jo njej '
    + 'njo nas nam nami vi vas vam vami oni one njih jim njimi se sebe sebi seboj svoj svoja svoje svojo svojega '
    + 'svojemu svojih svojim moj moja moje mojo mojega mojemu mojih mojim tvoj tvoja tvoje njegov njegova njegovo '
    + 'njegove njen njena njeno njene njihov njihova njihovo naš naša naše vaš vaša vaše ta to tega temu tem '
    + 'tisti tista tisto tiste tistega tistemu tistih tistim ten tak taka tako takšen takšna takšno kateri '
    + 'katera katero katere katerega kateremu katerih katerim kdo kdor koga komu kom kdaj kje kam kako kaj česa '
    + 'čemu čim čimer nekdo nekaj nekdaj nekje nekako nič nihče nikoli nikjer nikamor vsak vsaka vsako vse vsi vsega '
    + 'vsem vsemu vseh vsej drug druga drugo druge drugi drugega drugih že še tudi samo le pa pač zdaj potem nato tedaj '
    + 'takrat tukaj tu tam tja sedaj spet znova vedno večkrat zelo precej bolj več manj preveč skoraj malo dovolj '
    + 'zato torej namreč vendar toda sicer razen brez do iz izza ob od okoli po pod pred pri proti s z za zaradi med na '
    + 'nad o skozi v čez k h ni rekel rekla dejal dejala naredil naredila vedel vedela gledal gledala'
  ).split(' '),

  // Polnila: besede in zveze, ki se vrinejo v besedilo, ne da bi kaj prispevale.
  fillers: ['nenadoma', 'naenkrat', 'v tistem trenutku', 'v tem trenutku', 'za trenutek', 'za hip', 'malo', 'nekoliko',
    'pravzaprav', 'dejansko', 'resnično','preprosto', 'v bistvu', 'dobesedno', 'seveda', 'očitno', 'jasno',
    'skoraj', 'kar', 'nekako', 'nekaj', 'stvar', 'stvari', 'začel', 'začela', 'zdelo se je', 'vzdihnil', 'vzdihnila',
    'prikimal', 'prikimala', 'nasmehnil se je', 'nasmehnila se je', 'skomignil z rameni', 'skomignila z rameni',
    'zmrdnil obrvi', 'namrščil se je', 'požrl slino', 'požrla slino'],

  // Prislovi načina v slovenščini nimajo zanesljive končnice: bolje je ne šteti nič kot šteti narobe.
  adverbs: null,

  // Slovenščina nima členov.
  articles: [],

  // Nagovori in nazivi pred imenom ali priimkom.
  titles: ['gospod', 'gospa', 'gospodična', 'g', 'ga', 'doktor', 'doktorica', 'dr', 'profesor', 'profesorica', 'prof',
    'kapitan', 'major', 'polkovnik', 'general', 'poročnik', 'narednik', 'župnik', 'oče', 'mati', 'sestra', 'brat', 'stric',
    'teta', 'kralj', 'kraljica', 'princ', 'princesa', 'grof', 'grofica', 'baron', 'sveti', 'sveta', 'sv', 'mojster',
    'inženir', 'komisar'],
};
