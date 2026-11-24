// Türkçe özellik sayfası: bir metinden özellik çıkarmak için kullanılan anahtar sözcükler.
// Listelere sözcük ekleyerek serbestçe genişletilebilir.
//
// Türkçede sıfat adın önüne gelir ve uyum göstermez (“mavi gözler”, “uzun saçlı”); yüklem
// olarak hemen arkasına da gelebilir (“gözleri mavi”, “saçları çok uzun ve kıvırcık”). Ek-fiil
// ayrı bir sözcük değildir (mavi-ydi, mavi-dir); bu yüzden copulas, adın hemen arkasında
// yüklem başladığını gösteren sözcüklerden oluşur: pekiştiriciler (“çok”, “oldukça”…) ve
// sıfatların kendileri. Böylece “mavi gözleri ve kır sakalı” gibi sıralamalarda “kır” gözlere
// değil, sakala bağlanır. Adlar forms()’tan geçmez; bu yüzden çekimli biçimleri (gözleri,
// saçlı…) listede tek tek yazılıdır.
//
// “i” ile başlayan sıfatlar “İ” ile yazılır (“İri”, “İnce”): özellik adı büyük harfle
// başlatılırken “i” harfi “I” olmasın diye. Karşılaştırma büyük/küçük harf ve aksan
// gözetmediği için metindeki “iri” yine eşleşir.

const adjectives = {
  color: ['mavi', 'masmavi', 'yeşil', 'yemyeşil', 'kahverengi', 'kahve', 'ela', 'siyah', 'simsiyah', 'kara', 'kapkara', 'sarı', 'sapsarı',
    'sarışın', 'kızıl', 'kumral', 'kestane', 'gri', 'beyaz', 'bembeyaz', 'ak', 'kır', 'kırçıl', 'gümüşi', 'altın', 'esmer', 'buğday',
    'solgun', 'koyu', 'açık', 'bal', 'kehribar', 'mor', 'bakır', 'pembe', 'bronz', 'yanık', 'zeytin', 'kırmızı', 'lacivert'],
  hair: ['düz', 'dümdüz', 'kıvırcık', 'dalgalı', 'lüle', 'örgülü', 'kazınmış', 'dağınık', 'karmakarışık', 'ipeksi', 'yağlı', 'seyrek',
    'İnce', 'gür', 'kalın', 'toplu', 'kabarık', 'keçeleşmiş', 'parlak'],
  length: ['uzun', 'upuzun', 'kısa', 'kısacık'],
  size: ['büyük', 'küçük', 'küçücük', 'kocaman', 'minik', 'minicik', 'ufak', 'ufacık', 'geniş', 'dar', 'İnce', 'İncecik', 'kalın',
    'yuvarlak', 'İri'],
  eyes: ['çekik', 'badem', 'patlak', 'çukur', 'parlak', 'canlı', 'donuk', 'hüzünlü', 'üzgün', 'delici', 'derin', 'dalgın', 'yorgun',
    'huzursuz', 'soğuk', 'sıcak', 'buğulu', 'fersiz', 'keskin', 'şaşı'],
  skin: ['yumuşak', 'pürüzsüz', 'pürüzlü', 'sert', 'kırışık', 'buruşuk', 'gergin', 'yıpranmış', 'çilli', 'tüysüz', 'narin', 'kuru', 'mat'],
  nose: ['kartal', 'kemerli', 'basık', 'kalkık', 'düz', 'kanca', 'sivri', 'eğri', 'çarpık', 'kıvrık'],
  lips: ['dolgun', 'İnce', 'çatlak', 'kalın', 'etli'],
  face: ['uzun', 'oval', 'yuvarlak', 'köşeli', 'keskin', 'kare', 'çökük', 'çocuksu', 'yıpranmış', 'çilli', 'kırışık', 'zayıf', 'dolgun',
    'sert', 'yumuşak'],
  hands: ['güçlü', 'narin', 'nasırlı', 'kemikli', 'damarlı', 'kaslı', 'İnce', 'zayıf', 'kaba', 'yumuşak'],
  shoulders: ['düşük', 'çökük', 'kambur', 'dik', 'güçlü', 'geniş', 'dar'],
  voice: ['kalın', 'İnce', 'boğuk', 'kısık', 'yumuşak', 'tatlı', 'derin', 'tiz', 'cırlak', 'pürüzlü', 'melodik', 'alçak', 'yüksek',
    'sert', 'kararlı', 'çatlak', 'titrek', 'ağır', 'kadifemsi', 'güçlü', 'zayıf', 'gür'],
  density: ['gür', 'sık', 'seyrek', 'kalın', 'İnce', 'düzgün', 'bakımlı', 'bakımsız', 'kırpılmış', 'özenli'],
  smile: ['İçten', 'utangaç', 'çarpık', 'geniş', 'hüzünlü', 'alaycı', 'sıcak', 'zoraki', 'yapmacık', 'sinsi', 'tatlı'],
  // Boy ve yapı: “uzun boylu”, “orta boylu”, “iri yapılı”.
  height: ['uzun', 'kısa', 'orta'],
  build: ['İri', 'güçlü', 'zayıf', 'İnce', 'sağlam', 'atletik', 'tıknaz', 'cılız', 'narin', 'kemikli', 'geniş', 'ufak', 'kaslı', 'kalıplı',
    'balıketli'],
};

// Sıfat uyum göstermez: yalnızca kendisi de sıfat olan türevler eklenir (“mavimsi”,
// “yeşilimtırak”). Gelen sözcük aksansızdır (ö → o, ü → u, ç → c, ş → s; ı korunur).
function forms(word) {
  const vowels = word.match(/[aeıiou]/g) || [];
  const last = vowels[vowels.length - 1] || 'e';
  const high = { a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u' }[last];
  const endsInVowel = /[aeıiou]$/.test(word);
  return [
    word,
    endsInVowel ? `${word}ms${high}` : `${word}${high}ms${high}`,
    endsInVowel ? `${word}mtırak` : `${word}${high}mtırak`,
  ];
}

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Adın hemen arkasında yüklemin başladığını gösteren sözcükler. İlki bir dolgu sözcüğü
// olmalı: soru tek bir özelliği sorduğunda (“Saçı nasıl?”) yanıtın önüne o eklenir.
const intensifiers = ['çok', 'oldukça', 'pek', 'biraz', 'hafif', 'epey', 'gayet', 'daha', 'en', 'hem', 'ise', 'de', 'da', 'hâlâ',
  'artık', 'hep', 'neredeyse', 'adeta', 'iyice', 'son', 'bayağı', 'gerçekten', 'tamamen'];
const copulas = [...new Set([...intensifiers, ...Object.values(adjectives).flat().flatMap((w) => forms(strip(w)))])];

export default {
  prenominal: true,
  copulas,

  features: [
    { nouns: ['göz', 'gözler', 'gözü', 'gözleri', 'gözlü', 'gözünü', 'gözlerini', 'gözlerinin', 'bakış', 'bakışı', 'bakışları', 'bakışlı'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['saç', 'saçlar', 'saçı', 'saçları', 'saçlı', 'saçını', 'saçlarını', 'saçlarının', 'bukleler', 'bukleleri', 'perçem', 'perçemi'], groups: ['color', 'hair', 'length'] },
    { nouns: ['ten', 'teni', 'tenli', 'cilt', 'cildi', 'ciltli', 'deri', 'derisi', 'derili'], groups: ['color', 'skin'] },
    { nouns: ['sakal', 'sakalı', 'sakallı', 'sakalını'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['bıyık', 'bıyığı', 'bıyıklı', 'bıyıkları', 'bıyığını'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['burun', 'burnu', 'burunlu', 'burnunu'], groups: ['size', 'nose'] },
    { nouns: ['dudak', 'dudaklar', 'dudakları', 'dudaklı', 'dudaklarını', 'ağız', 'ağzı', 'ağızlı'], groups: ['size', 'lips', 'color'] },
    { nouns: ['yüz', 'yüzü', 'yüzlü', 'yüzünü', 'çehre', 'çehresi', 'çehreli', 'hatları'], groups: ['face', 'size'] },
    { nouns: ['el', 'eller', 'eli', 'elleri', 'ellerini', 'parmak', 'parmaklar', 'parmakları', 'parmaklı'], groups: ['size', 'hands', 'length'] },
    { nouns: ['ses', 'sesi', 'sesli', 'sesini'], groups: ['voice'] },
    { nouns: ['kaş', 'kaşlar', 'kaşları', 'kaşlı'], groups: ['color', 'density', 'size'] },
    { nouns: ['omuz', 'omuzlar', 'omuzları', 'omuzlu', 'sırt', 'sırtı'], groups: ['size', 'shoulders'] },
    { nouns: ['bacak', 'bacaklar', 'bacakları', 'bacaklı', 'kol', 'kollar', 'kolları', 'kollu'], groups: ['length', 'size', 'hands'] },
    { nouns: ['gülüş', 'gülüşü', 'gülümseme', 'gülümsemesi'], groups: ['smile', 'size'] },
    { nouns: ['boy', 'boyu', 'boylu'], groups: ['height'] },
    { nouns: ['yapılı', 'yapısı'], groups: ['build'] },
    { nouns: ['gözlük', 'gözlüğü', 'gözlükleri', 'gözlüklü'], groups: ['size'], presence: true },
    { nouns: ['çil', 'çiller', 'çilleri', 'çilli'], groups: [], presence: true },
    { nouns: ['yara', 'yarası', 'yaraları'], groups: ['size'], presence: true },
    { nouns: ['dövme', 'dövmesi', 'dövmeler', 'dövmeleri', 'dövmeli'], groups: ['size'], presence: true },
    // “ben” ve “beni” zamirle karıştığı için yalnızca bunlar.
    { nouns: ['benleri', 'benli'], groups: [], presence: true },
    { nouns: ['kırışık', 'kırışıklar', 'kırışıkları', 'kırışıklık', 'kırışıklıklar', 'kırışıklıkları'], groups: [], presence: true },
    { nouns: ['aksaklık', 'aksaklığı'], groups: [], presence: true },
  ],

  adjectives,

  // Tek başına özellik olan sözcükler (“utangaç ve meraklı”). “uzun” ve “kısa” burada yok:
  // tek başlarına çok genel (“uzun bir süre”); boy için “uzun boylu” yukarıda yakalanır.
  standalone: [
    // Yapı
    'zayıf', 'sıska', 'şişman', 'şişko', 'tombul', 'balıketli', 'iriyarı', 'güçlü', 'kuvvetli', 'kaslı', 'atletik', 'narin', 'minyon',
    'tıknaz', 'kambur', 'cılız',
    // Görünüş
    'çekici', 'yakışıklı', 'güzel', 'alımlı', 'çirkin', 'zarif', 'pasaklı', 'bakımlı', 'kel', 'dazlak', 'çilli', 'sarışın', 'esmer',
    'kumral', 'kızıl', 'solgun',
    // Yaş
    'genç', 'yaşlı', 'ihtiyar', 'ergen', 'delikanlı',
    // Karakter
    'utangaç', 'çekingen', 'cesur', 'yürekli', 'korkak', 'cömert', 'bencil', 'zeki', 'akıllı', 'kurnaz', 'saf', 'gururlu', 'kibirli',
    'alçakgönüllü', 'mütevazı', 'nazik', 'kibar', 'zalim', 'acımasız', 'sadık', 'vefalı', 'kuşkucu', 'şüpheci', 'hırslı', 'tembel',
    'çalışkan', 'aceleci', 'sabırlı', 'sabırsız', 'neşeli', 'melankolik', 'girişken', 'iyimser', 'kötümser', 'İnatçı', 'kıskanç',
    'meraklı', 'ketum', 'suskun', 'ukala', 'duygusal', 'hassas', 'şefkatli', 'sevecen', 'saldırgan', 'sakin', 'sinirli', 'asabi',
    'dürüst', 'yalancı', 'alaycı', 'İyiliksever', 'kindar', 'pervasız', 'temkinli', 'ihtiyatlı', 'samimi', 'İçten', 'geveze',
    'konuşkan', 'sessiz', 'titiz', 'dindar', 'ateist', 'asi', 'isyankâr', 'itaatkâr', 'uysal', 'güvensiz', 'entrikacı', 'soğukkanlı',
    // Durum
    'solak', 'topal', 'kör', 'sağır', 'dilsiz', 'çolak',
  ],

  // Adla sıfatları arasına girip betimlemeyi bozmayan sözcükler (“saçları çok uzun ve kıvırcık”).
  fillers: [...intensifiers, 've', 'ile', 'ama', 'fakat', 'ancak', 'ya', 'veya', 'yahut', 'renkli', 'rengi', 'gibi', 'derece', 'bir', 'tane'],

  // Olumsuzluk adın önünde olanlar; “değil” ve “yok” arkadan geldiği için buraya konamaz.
  negations: ['hiç', 'ne', 'asla', 'hiçbir', 'katiyen'],
  // Arkadan gelen olumsuzluk: “gözleri mavi değil”, “sakalı yok”.
  negationsAfter: ['değil', 'değildi', 'değildir', 'değilmiş', 'değiller', 'değillerdi', 'yok', 'yoktu', 'yoktur', 'yokmuş'],

  // Sayıyla yaş: “34 yaşında”, “60 yaşındaki bir adam”, “yaşı 34”. “34 yaşındayken” geçmişteki
  // bir anı anlatır, şimdiki yaşı değil; o yüzden sayılmaz.
  age: [
    { regex: /(?<![\p{L}\p{N}])(\d{1,3})\s+yaşında(?:ki|dır|dir|ydı|ymış|ydi|ymiş)?(?![\p{L}\p{N}])/gu, label: '{n} yaşında' },
    { regex: /(?<![\p{L}\p{N}])yaşı\s+(\d{1,3})(?![\p{N}])/gu, label: '{n} yaşında' },
  ],

  forms,
};
