// Polski arkusz cech: słowa kluczowe, dzięki którym z tekstu wydobywa się cechy.
// Można go swobodnie rozszerzać: wystarczy dopisać słowa do list. Przymiotniki wpisuje się
// w rodzaju męskim, w liczbie pojedynczej i w mianowniku („zielony”, „niebieski”); pozostałe
// formy (rodzaje, liczby i najczęstsze przypadki) tworzy funkcja forms(). Rzeczowniki odmieniają
// się nieregularnie, więc ich najczęstsze formy są wpisane wprost.
export default {
  // Po polsku przymiotnik zwykle stoi przed rzeczownikiem („niebieskie oczy”); przymiotniki po
  // rzeczowniku liczą się tylko wtedy, gdy zaraz po nim jest czasownik łączący („oczy miała
  // niebieskie”, „jej włosy były długie”).
  prenominal: true,
  copulas: ['jest', 'są', 'był', 'była', 'było', 'były', 'byli', 'ma', 'mają', 'miał', 'miała', 'miały', 'mieli',
    'wydawał', 'wydawała', 'wydawały', 'wyglądał', 'wyglądała', 'wyglądały'],

  // Części ciała lub cechy opisywane przymiotnikami. `groups` mówi, które listy przymiotników do
  // nich pasują; `presence` oznacza, że już samo ich wymienienie jest cechą („nosi okulary”).
  features: [
    { nouns: ['oko', 'oczy', 'oczu', 'oczach', 'oczami', 'spojrzenie', 'spojrzeniem', 'wzrok', 'wzrokiem'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['włosy', 'włosów', 'włosach', 'włosami', 'czupryna', 'czuprynę', 'czupryną', 'fryzura', 'fryzurę', 'loki', 'lokami', 'grzywa', 'grzywę'], groups: ['color', 'hair', 'length'] },
    { nouns: ['skóra', 'skórę', 'skórą', 'skórze', 'cera', 'cerę', 'cerą', 'karnacja', 'karnację', 'karnacją'], groups: ['color', 'skin'] },
    { nouns: ['broda', 'brodę', 'brodą', 'brody', 'brodzie','zarost', 'zarostem', 'zarostu'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['wąsy', 'wąsów', 'wąsami', 'wąs', 'wąsik'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nos', 'nosa', 'nosem', 'nosie'], groups: ['size', 'nose'] },
    { nouns: ['usta', 'ustach', 'ustami', 'wargi', 'wargach', 'wargami'], groups: ['size', 'lips', 'color'] },
    { nouns: ['twarz', 'twarzy', 'twarzą', 'rysy', 'rysach', 'rysami', 'oblicze'], groups: ['face', 'size'] },
    { nouns: ['dłonie', 'dłoniach', 'dłońmi', 'ręce', 'rękach', 'rękami', 'palce', 'palcach', 'palcami'], groups: ['size', 'hands', 'length'] },
    { nouns: ['głos', 'głosem', 'głosie'], groups: ['voice'] },
    { nouns: ['brwi', 'brwiach', 'brwiami'], groups: ['color', 'density', 'size'] },
    { nouns: ['ramiona', 'barki', 'plecy', 'plecach'], groups: ['size', 'shoulders'] },
    { nouns: ['nogi', 'nogach', 'nogami'], groups: ['length', 'size', 'hands'] },
    { nouns: ['uśmiech', 'uśmiechem', 'uśmiechu'], groups: ['smile', 'size'] },
    { nouns: ['okulary', 'okularach', 'okularów', 'okularami'], groups: ['size'], presence: true },
    { nouns: ['piegi', 'piegów', 'piegami'], groups: [], presence: true },
    { nouns: ['blizna', 'bliznę', 'blizny', 'blizn', 'bliznami'], groups: ['size'], presence: true },
    { nouns: ['tatuaż', 'tatuaże', 'tatuażu', 'tatuaży', 'tatuażami'], groups: ['size'], presence: true },
    { nouns: ['pieprzyk', 'pieprzyki', 'pieprzyka', 'pieprzyków', 'znamię'], groups: [], presence: true },
    { nouns: ['zmarszczki', 'zmarszczek', 'zmarszczkami'], groups: [], presence: true },
    { nouns: ['siwizna', 'siwiznę', 'siwizną'], groups: [], presence: true },
    { nouns: ['utykanie', 'utyka'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['niebieski', 'błękitny', 'zielony', 'brązowy', 'piwny', 'orzechowy', 'czarny', 'kruczoczarny', 'ciemny', 'jasny', 'blond',
      'złoty', 'złocisty', 'rudy', 'miedziany', 'rdzawy', 'kasztanowy', 'szary', 'popielaty', 'siwy', 'srebrny', 'srebrzysty', 'biały',
      'blady', 'śniady', 'smagły', 'opalony', 'oliwkowy', 'różowy', 'rumiany', 'czerwony', 'bursztynowy', 'fiołkowy', 'fioletowy',
      'słomkowy', 'platynowy', 'mahoniowy', 'szarozielony', 'szaroniebieski'],
    hair: ['prosty', 'gładki', 'kręcony', 'falowany', 'falujący', 'kędzierzawy', 'puszysty', 'zmierzwiony', 'rozczochrany', 'potargany',
      'splątany', 'zaczesany', 'spięty', 'rozpuszczony', 'związany', 'zapleciony', 'ostrzyżony', 'ogolony', 'jedwabisty', 'lśniący',
      'tłusty', 'przetłuszczony', 'rzadki', 'cienki', 'gęsty', 'bujny', 'sztywny', 'matowy'],
    length: ['długi', 'krótki', 'półdługi', 'przydługi'],
    size: ['duży', 'wielki', 'mały', 'drobny', 'ogromny', 'malutki', 'niewielki', 'szeroki', 'wąski', 'cienki', 'gruby', 'okrągły',
      'pełny', 'olbrzymi'],
    eyes: ['skośny', 'migdałowy', 'zapadnięty', 'wyłupiasty', 'błyszczący', 'żywy', 'przygaszony', 'smutny', 'przenikliwy', 'głęboki',
      'rozmarzony', 'zmęczony', 'niespokojny', 'zimny', 'ciepły', 'bystry', 'łagodny', 'czujny', 'wesoły', 'zamglony'],
    skin: ['gładki', 'miękki', 'szorstki', 'pomarszczony', 'jędrny', 'ogorzały', 'piegowaty', 'delikatny', 'porcelanowy', 'chropowaty',
      'zniszczony'],
    nose: ['orli', 'zadarty', 'prosty', 'haczykowaty', 'spiczasty', 'krzywy', 'wydatny', 'perkaty', 'płaski', 'rzymski', 'garbaty',
      'kartoflowaty'],
    lips: ['pełny', 'wąski', 'cienki', 'spierzchnięty', 'zmysłowy', 'zaciśnięty'],
    face: ['pociągły', 'owalny', 'okrągły', 'kanciasty', 'kwadratowy', 'wychudzony', 'zapadnięty', 'chłopięcy', 'dziewczęcy', 'ogorzały',
      'piegowaty', 'pomarszczony', 'pyzaty', 'pucołowaty', 'szczupły', 'ostry'],
    hands: ['silny', 'mocny', 'delikatny', 'zrogowaciały', 'kościsty', 'żylasty', 'muskularny', 'smukły', 'szczupły', 'spracowany', 'drobny'],
    shoulders: ['opadający', 'pochylony', 'przygarbiony', 'zgarbiony', 'prosty', 'szeroki', 'wąski', 'silny', 'mocny', 'kościsty'],
    voice: ['niski', 'wysoki', 'ochrypły', 'zachrypnięty', 'chrapliwy', 'miękki', 'łagodny', 'słodki', 'głęboki', 'piskliwy', 'szorstki',
      'melodyjny', 'nosowy', 'donośny', 'stanowczy', 'drżący', 'spokojny', 'aksamitny', 'mocny', 'słaby', 'cichy', 'matowy', 'ciepły', 'zimny'],
    density: ['gęsty', 'krzaczasty', 'rzadki', 'przystrzyżony', 'zadbany', 'niechlujny', 'zaniedbany', 'cienki', 'bujny', 'kilkudniowy'],
    smile: ['szczery', 'nieśmiały', 'krzywy', 'szeroki', 'smutny', 'szyderczy', 'kpiący', 'ciepły', 'wymuszony', 'promienny',
      'łobuzerski', 'zawadiacki', 'ironiczny'],
  },

  // Cechy, które znaczą coś same w sobie („jest wysoki i nieśmiały”).
  standalone: [
    // Budowa ciała
    'wysoki', 'niski', 'szczupły', 'chudy', 'gruby', 'otyły', 'tęgi', 'krępy', 'postawny', 'barczysty', 'umięśniony', 'muskularny',
    'wysportowany', 'smukły', 'drobny', 'pulchny', 'korpulentny', 'kościsty', 'żylasty', 'przygarbiony', 'zgarbiony', 'tyczkowaty',
    // Wygląd
    'atrakcyjny', 'przystojny', 'piękny', 'ładny', 'brzydki', 'elegancki', 'zaniedbany', 'niechlujny', 'schludny', 'łysy', 'brodaty',
    'wąsaty', 'piegowaty', 'siwy', 'rudy', 'blady', 'śniady', 'jasnowłosy', 'ciemnowłosy', 'rudowłosy', 'blondyn', 'blondynka',
    'brunet', 'brunetka', 'szatyn', 'szatynka',
    // Wiek
    'młody', 'nastoletni', 'sędziwy', 'leciwy', 'podstarzały',
    // Charakter
    'nieśmiały', 'odważny', 'dzielny', 'tchórzliwy', 'hojny', 'szczodry', 'samolubny', 'egoistyczny', 'inteligentny', 'bystry',
    'sprytny', 'przebiegły', 'naiwny', 'dumny', 'pokorny', 'skromny', 'uprzejmy', 'życzliwy', 'miły', 'okrutny', 'lojalny', 'wierny',
    'nieufny', 'podejrzliwy', 'ambitny', 'leniwy', 'pracowity', 'impulsywny', 'porywczy', 'cierpliwy', 'niecierpliwy', 'wesoły',
    'pogodny', 'melancholijny', 'samotny', 'towarzyski', 'introwertyczny', 'ekstrawertyczny', 'optymistyczny', 'pesymistyczny',
    'uparty', 'zazdrosny', 'zawistny', 'ciekawski', 'powściągliwy', 'skryty', 'arogancki', 'wrażliwy', 'czuły', 'serdeczny',
    'agresywny', 'gwałtowny', 'spokojny', 'nerwowy', 'uczciwy', 'szczery', 'kłamliwy', 'sarkastyczny', 'dobroduszny', 'pamiętliwy',
    'zuchwały', 'lekkomyślny', 'ostrożny', 'rozważny', 'rozmowny', 'gadatliwy', 'milczący', 'małomówny', 'metodyczny', 'pedantyczny',
    'przesądny', 'religijny', 'pobożny', 'niewierzący', 'zbuntowany', 'buntowniczy', 'posłuszny', 'próżny', 'niepewny', 'zarozumiały',
    'cyniczny', 'manipulacyjny',
    // Stan
    'leworęczny', 'kulawy', 'ślepy', 'niewidomy', 'głuchy', 'niemy', 'jednooki', 'jednoręki',
  ],

  // Słowa, które mogą stać między rzeczownikiem a jego przymiotnikami, nie przerywając opisu.
  fillers: ['jest', 'są', 'był', 'była', 'było', 'były', 'byli', 'ma', 'mają', 'miał', 'miała', 'miały', 'mieli', 'bardzo', 'dość',
    'dosyć', 'całkiem', 'nieco', 'trochę', 'lekko', 'raczej', 'wręcz', 'zupełnie', 'całkowicie', 'prawie', 'niemal', 'i', 'oraz', 'a',
    'ale', 'lub', 'albo', 'czy', 'tak', 'zawsze', 'wciąż', 'nadal', 'już', 'jeszcze', 'też', 'także', 'choć', 'chociaż', 'jej', 'jego',
    'ich', 'koloru', 'kolorze', 'barwy', 'odcieniu', 'w', 'o', 'z', 'się'],

  negations: ['nie', 'niezbyt', 'ani', 'bez', 'nigdy', 'wcale', 'żaden', 'żadna', 'żadne', 'żadnych', 'nic', 'niczego'],

  // Wiek podany liczbą: „ma 34 lata”, „miała 60 lat”, „w wieku 40 lat”, „34-letni”.
  // Nie liczy się „30 lat temu” ani „20 lat doświadczenia”: to nie jest wiek. W etykiecie
  // „lata” dla 2–4, 22–24, 32–34… i „lat” dla pozostałych liczb.
  age: [
    { regex: /(?<![\p{L}\p{N}])(?:ma|mam|masz|miał|miała|miało|miałem|miałam|skończył|skończyła|skończyłem|skończyłam|skończy|kończy|ukończył|ukończyła|liczy|liczył|liczyła)\s+(?:już\s+|prawie\s+|niemal\s+|około\s+|ok\.\s+|dopiero\s+|zaledwie\s+)?(\d{1,3})\s+lata(?![\p{L}\p{N}])/giu, label: '{n} lata' },
    { regex: /(?<![\p{L}\p{N}])(?:ma|mam|masz|miał|miała|miało|miałem|miałam|skończył|skończyła|skończyłem|skończyłam|skończy|kończy|ukończył|ukończyła|liczy|liczył|liczyła)\s+(?:już\s+|prawie\s+|niemal\s+|około\s+|ok\.\s+|dopiero\s+|zaledwie\s+)?(\d{1,3})\s+lat(?![\p{L}\p{N}])(?!\s+(?:temu|później|wcześniej|doświadczenia|stażu|pracy|praktyki))/giu, label: '{n} lat' },
    { regex: /(?<![\p{L}\p{N}])w\s+wieku\s+((?:\d?[02-9])?[2-4])\s+lat(?![\p{L}\p{N}])/giu, label: '{n} lata' },
    { regex: /(?<![\p{L}\p{N}])w\s+wieku\s+(\d{0,2}[05-9]|\d{1,2}1|\d?1[2-4])\s+lat(?![\p{L}\p{N}])/giu, label: '{n} lat' },
    { regex: /(?<![\p{L}\p{N}])((?:\d?[02-9])?[2-4])[-‑]?letni\p{L}*/giu, label: '{n} lata' },
    { regex: /(?<![\p{L}\p{N}])(\d{0,2}[05-9]|\d{1,2}1|\d?1[2-4])[-‑]?letni\p{L}*/giu, label: '{n} lat' },
  ],

  // Formy przymiotnika z mianownika rodzaju męskiego (słowo przychodzi już bez znaków
  // diakrytycznych, ale z „ł”): rodzaj żeński i nijaki, liczba mnoga (także męskoosobowa)
  // oraz dopełniacz, celownik, biernik, narzędnik i miejscownik. Słowa nieodmienne („blond”)
  // i rzeczowniki („blondynka”) zostają bez zmian.
  forms(word) {
    const out = new Set([word]);
    const add = (stem, vowel, e) => {
      // vowel: „y” albo „i” (zielonym, niebieskim); e: końcówka przed „e” (zielone, niebieskie).
      out.add(stem + 'a');                 // zielona, zieloną (bez „ą”)
      for (const end of ['', 'go', 'j', 'mu']) out.add(stem + e + end); // zielone, zielonego, zielonej, zielonemu
      for (const end of ['m', 'ch', 'mi']) out.add(stem + vowel + end); // zielonym, zielonych, zielonymi
    };
    if (/[kg]i$/.test(word)) {
      // niebieski, długi: niebieska, niebieskie, niebieskiego…; męskoosobowe: niebiescy, dłudzy.
      const stem = word.slice(0, -1);
      add(stem, 'i', 'ie');
      out.add(stem.slice(0, -1) + (stem.endsWith('k') ? 'cy' : 'dzy'));
      return [...out];
    }
    if (word.endsWith('li')) {
      // orli: orla, orle, orlego, orlim…
      const stem = word.slice(0, -1);
      add(stem, 'i', 'e');
      return [...out];
    }
    if (word.endsWith('i')) {
      // tani, głupi, olbrzymi: tania, tanie, taniego, tanim… (męskoosobowe bez zmian).
      add(word, '', 'e');
      return [...out];
    }
    if (word.endsWith('y')) {
      // zielony, duży, chłopięcy: zielona, zielone, zielonego, zielonym…
      const stem = word.slice(0, -1);
      add(stem, 'y', 'e');
      // Męskoosobowa liczba mnoga: zieloni, młodzi, dobrzy, złoci, prości, cisi, lepsi, mali, duzi.
      let virile;
      if (stem.endsWith('st')) virile = stem.slice(0, -2) + 'sci';
      else if (/(ch|sz)$/.test(stem)) virile = stem.slice(0, -2) + 'si';
      else if (stem.endsWith('r')) virile = stem + 'zy';
      else if (stem.endsWith('t')) virile = stem.slice(0, -1) + 'ci';
      else if (stem.endsWith('d')) virile = stem.slice(0, -1) + 'dzi';
      else if (stem.endsWith('ł')) virile = stem.slice(0, -1) + 'li';
      else if (/(c|rz)$/.test(stem)) virile = stem + 'y';
      else virile = stem + 'i';
      out.add(virile);
      return [...out];
    }
    return [...out];
  },
};
