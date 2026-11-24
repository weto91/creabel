// Deutsches Merkmalsblatt: die Schlüsselwörter, mit denen Merkmale aus einem Text gewonnen werden.
// Es lässt sich frei erweitern: Adjektive in der Grundform eintragen (blau, dunkel, leise);
// die gebeugten Formen (blaue, blauer, blaues, blauen, blauem) erzeugt forms() selbst.
// Substantive mit ihren gebräuchlichen Formen (Haar, Haare, Haaren).
export default {
  // Im Deutschen steht das Adjektiv vor dem Substantiv („blaue Augen“); Adjektive danach zählen
  // nur, wenn ein verbindendes Verb folgt („ihre Augen waren blau“).
  prenominal: true,
  copulas: ['ist', 'sind', 'war', 'waren', 'wirkt', 'wirken', 'wirkte', 'wirkten', 'scheint', 'scheinen', 'schien', 'schienen'],
  // Substantive behalten ihre Großschreibung („Blaue Augen“, nicht „Blaue augen“).
  nounCase: 'keep',

  // Körperteile oder Eigenschaften, die mit Adjektiven beschrieben werden. `groups` gibt an,
  // welche Adjektivlisten zu ihnen passen; `presence` heißt, dass schon die Nennung ein Merkmal
  // ist („trägt eine Brille“).
  features: [
    { nouns: ['auge', 'augen', 'blick', 'blicke'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['haar', 'haare', 'haaren', 'haares', 'locken', 'mähne', 'schopf', 'haarschopf'], groups: ['color', 'hair', 'length'] },
    { nouns: ['haut', 'teint', 'gesichtsfarbe'], groups: ['color', 'skin'] },
    { nouns: ['bart', 'barts', 'bartes', 'vollbart', 'kinnbart', 'dreitagebart', 'bartstoppeln'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['schnurrbart', 'schnauzbart', 'schnauzer', 'oberlippenbart'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nase'], groups: ['size', 'nose'] },
    { nouns: ['lippen', 'mund'], groups: ['size', 'lips', 'color'] },
    { nouns: ['gesicht', 'gesichts', 'antlitz', 'gesichtszüge'], groups: ['face', 'size'] },
    { nouns: ['hand', 'hände', 'händen', 'finger', 'fingern'], groups: ['size', 'hands', 'length'] },
    { nouns: ['stimme'], groups: ['voice'] },
    { nouns: ['augenbrauen', 'brauen'], groups: ['color', 'density', 'size'] },
    { nouns: ['schultern', 'rücken'], groups: ['size', 'shoulders'] },
    { nouns: ['beine', 'beinen', 'arme', 'armen'], groups: ['length', 'size', 'hands'] },
    { nouns: ['lächeln'], groups: ['smile', 'size'] },
    { nouns: ['brille', 'brillen'], groups: ['size'], presence: true },
    { nouns: ['sommersprossen'], groups: [], presence: true },
    { nouns: ['narbe', 'narben'], groups: ['size'], presence: true },
    { nouns: ['tattoo', 'tattoos', 'tätowierung', 'tätowierungen'], groups: ['size'], presence: true },
    { nouns: ['muttermal', 'muttermale', 'leberfleck', 'leberflecke', 'leberflecken'], groups: [], presence: true },
    { nouns: ['falten', 'fältchen'], groups: [], presence: true },
    { nouns: ['hinken'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['blau', 'grün', 'braun', 'haselnussbraun', 'dunkelbraun', 'hellbraun', 'kastanienbraun', 'schwarz', 'pechschwarz',
      'rabenschwarz', 'blond', 'aschblond', 'strohblond', 'rotblond', 'rot', 'rötlich', 'kupferrot', 'kupferfarben', 'grau',
      'gräulich', 'weiß', 'schneeweiß', 'silbern', 'silbrig', 'golden', 'dunkel', 'hell', 'blass', 'bleich', 'bernsteinfarben',
      'honigfarben', 'violett', 'brünett', 'rosig', 'gebräunt', 'braungebrannt', 'olivfarben', 'dunkelhäutig', 'hellhäutig'],
    hair: ['glatt', 'lockig', 'gelockt', 'wellig', 'gewellt', 'kraus', 'geflochten', 'geschoren', 'rasiert', 'zerzaust',
      'strubbelig', 'wirr', 'seidig', 'fettig', 'strähnig', 'schütter', 'fein', 'dicht', 'voll', 'hochgesteckt', 'offen',
      'verfilzt', 'zottelig', 'kurzgeschoren'],
    length: ['lang', 'kurz', 'schulterlang', 'kinnlang', 'hüftlang', 'raspelkurz'],
    size: ['groß', 'klein', 'riesig', 'winzig', 'breit', 'schmal', 'dünn', 'dick', 'rund', 'gewaltig'],
    eyes: ['mandelförmig', 'schräg', 'tiefliegend', 'hervorquellend', 'glänzend', 'strahlend', 'lebhaft', 'matt', 'traurig',
      'durchdringend', 'stechend', 'tief', 'verträumt', 'müde', 'unruhig', 'kalt', 'warm', 'wach'],
    skin: ['weich', 'rau', 'faltig', 'runzlig', 'glatt', 'wettergegerbt', 'gegerbt', 'sommersprossig', 'zart', 'makellos', 'unrein'],
    nose: ['gebogen', 'krumm', 'stupsig', 'spitz', 'gerade', 'markant', 'schief', 'platt'],
    lips: ['voll', 'schmal', 'dünn', 'rissig', 'aufgesprungen', 'sinnlich'],
    face: ['oval', 'kantig', 'eckig', 'hager', 'eingefallen', 'länglich', 'scharf', 'jungenhaft', 'kindlich', 'wettergegerbt',
      'sommersprossig', 'faltig', 'markant'],
    hands: ['kräftig', 'stark', 'zart', 'schwielig', 'knochig', 'sehnig', 'muskulös', 'schlank', 'feingliedrig', 'grob'],
    shoulders: ['hängend', 'gebeugt', 'gekrümmt', 'gerade', 'kräftig'],
    voice: ['tief', 'hoch', 'heiser', 'rau', 'weich', 'sanft', 'süß', 'schrill', 'kratzig', 'rauchig', 'melodisch', 'näselnd',
      'leise', 'laut', 'fest', 'brüchig', 'langsam', 'samtig', 'kräftig', 'schwach', 'dunkel', 'warm', 'klar'],
    density: ['buschig', 'dicht', 'dünn', 'schütter', 'gestutzt', 'gepflegt', 'ungepflegt', 'fein', 'voll'],
    smile: ['offen', 'schüchtern', 'schief', 'breit', 'traurig', 'spöttisch', 'warm', 'gezwungen', 'herzlich', 'verschmitzt'],
  },

  // Merkmale, die für sich allein stehen („sie ist groß und schüchtern“).
  standalone: [
    // Statur
    'groß', 'klein', 'schlank', 'dünn', 'mager', 'dick', 'korpulent', 'kräftig', 'stämmig', 'untersetzt', 'muskulös',
    'athletisch', 'zierlich', 'schlaksig', 'pummelig', 'rundlich', 'drahtig', 'hager', 'gebeugt',
    // Aussehen
    'attraktiv', 'gutaussehend', 'hübsch', 'schön', 'hässlich', 'elegant', 'ungepflegt', 'gepflegt', 'glatzköpfig', 'kahl',
    'bärtig', 'sommersprossig', 'grauhaarig', 'blond', 'brünett', 'rothaarig', 'blass',
    // Alter
    'jung', 'jugendlich', 'betagt', 'greis',
    // Charakter
    'schüchtern', 'mutig', 'tapfer', 'feige', 'großzügig', 'egoistisch', 'selbstsüchtig', 'intelligent', 'klug', 'schlau',
    'gerissen', 'naiv', 'stolz', 'bescheiden', 'freundlich', 'grausam', 'loyal', 'treu', 'misstrauisch', 'ehrgeizig', 'faul',
    'fleißig', 'impulsiv', 'geduldig', 'ungeduldig', 'fröhlich', 'heiter', 'melancholisch', 'einsam', 'gesellig',
    'introvertiert', 'extrovertiert', 'optimistisch', 'pessimistisch', 'stur', 'dickköpfig', 'eifersüchtig', 'neugierig',
    'zurückhaltend', 'arrogant', 'sensibel', 'empfindlich', 'liebevoll', 'gewalttätig', 'ruhig', 'nervös', 'ehrlich',
    'verlogen', 'sarkastisch', 'gutherzig', 'nachtragend', 'leichtsinnig', 'tollkühn', 'vorsichtig', 'aufrichtig', 'gesprächig',
    'redselig', 'schweigsam', 'wortkarg', 'methodisch', 'abergläubisch', 'religiös', 'gläubig', 'rebellisch', 'gehorsam',
    'eitel', 'unsicher', 'manipulativ',
    // Verfassung
    'linkshändig', 'hinkend', 'blind', 'taub', 'stumm', 'einäugig', 'einarmig', 'lahm',
  ],

  // Wörter, die zwischen dem Substantiv und seinen Adjektiven stehen können, ohne die
  // Beschreibung zu unterbrechen.
  fillers: ['ist', 'sind', 'war', 'waren', 'wirkt', 'wirken', 'wirkte', 'wirkten', 'scheint', 'scheinen', 'schien', 'schienen',
    'sehr', 'ziemlich', 'recht', 'eher', 'etwas', 'ganz', 'so', 'zu', 'leicht', 'fast', 'beinahe', 'immer', 'noch', 'schon',
    'und', 'oder', 'aber', 'doch', 'auch', 'wie', 'von', 'mit', 'farbe', 'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine',
    'einen', 'einem', 'einer', 'sein', 'seine', 'seinen', 'seinem', 'seiner', 'ihr', 'ihre', 'ihren', 'ihrem', 'ihrer',
    'hat', 'hatte', 'trägt', 'trug', 'irgendwie', 'zwar'],

  negations: ['nicht', 'kein', 'keine', 'keinen', 'keinem', 'keiner', 'keines', 'nie', 'niemals', 'ohne', 'weder'],

  // Alter als Zahl: „34 Jahre alt“, „eine 34-jährige Frau“, „im Alter von 60 Jahren“, „sie ist 34.“
  // Nicht gemeint sind „vor 20 Jahren“ oder „5 Jahre später“: Das ist kein Alter.
  age: [
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s*-?\s*jahre?\s+alt(?![\p{L}\p{N}])/giu, label: '{n} Jahre alt' },
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s*-?\s*j(?:ä|ae|a)hrig(?:e[rnms]?)?(?![\p{L}\p{N}])/giu, label: '{n} Jahre alt' },
    { regex: /(?<![\p{L}\p{N}])im\s+alter\s+von\s+(\d{1,3})(?:\s+jahren)?(?![\p{L}\p{N}])/giu, label: '{n} Jahre alt' },
    { regex: /(?<![\p{L}\p{N}])(?:ist|war|wird|wurde)\s+(?:gerade\s+|fast\s+|knapp\s+|erst\s+|schon\s+|etwa\s+)?(\d{1,3})(?:\s+jahre)?(?=\s*(?:[.,;:!?]|$))/giu, label: '{n} Jahre alt' },
  ],

  // Das Wort kommt kleingeschrieben und ohne Umlaute an (grün → grun). Gebildet werden die
  // Grundform und die Endungen -e, -er, -es, -en, -em: dunkel → dunkle, dunkler…;
  // teuer → teure…; hoch → hohe…; leise → leiser, leises… Mit ß zusätzlich die Schreibung mit ss.
  forms(word) {
    let stem = word;
    if (word === 'hoch') stem = 'hoh';
    else if (/[^aeiou]el$/.test(word)) stem = word.slice(0, -2) + 'l';
    else if (/(au|eu|ei)er$/.test(word)) stem = word.slice(0, -2) + 'r';
    const out = [word];
    if (word.endsWith('e')) {
      for (const end of ['r', 's', 'n', 'm']) out.push(word + end);
    } else {
      for (const end of ['e', 'er', 'es', 'en', 'em']) out.push(stem + end);
    }
    if (word.includes('ß')) for (const form of [...out]) out.push(form.replace(/ß/g, 'ss'));
    return out;
  },
};
