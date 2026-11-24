// Her sayfanın ayrıntılı yardımı (tr): “?” düğmesine basınca görünen. Her girişte bir
// giriş cümlesi, [başlık, metin] bölümleri, ipuçları ve uygulama kılavuzunda konunun daha
// ayrıntılı anlatıldığı bölüm vardır. Burada olmayan sayfalar yalnızca kısa cümlelerini
// gösterir (i18n/tr.js içindeki help.<bölüm>).
export default {
  home: {
    intro: 'Girerken görmeniz gerekenler: nereden devam edeceğiniz, nasıl gittiğiniz, ne kadar kaldığı ve neyin gözden geçirilmesi gerektiği.',
    parts: [
      ['Nereden devam etmeli', 'En son üzerinde çalıştığınız sahne ve sırada yazılacak olan, doğrudan erişimle. “Yazmaya devam et” ilkini açar. Yeni bir projede ilk adımlar buradadır.'],
      ['Dört sayı', 'Sözcük hedefine göre metin, günlük hedefe göre bugün yazılanlar, art arda yazılan günlerin serisi ve teslime kalan günler; gereken tempo ve şu anki tempo ile birlikte.'],
      ['Tempo ve durum', 'Son 30 günün her birinde yazılan sözcükler ve kaç kartın, bölümün ve sahnenin yapılacak, sürüyor ya da bitti durumunda olduğu.'],
      ['Gözden geçirilecekler', 'En yeni açık yapılacaklar ve uyarılar: Süreklilik’teki olanaksızlıklar ve uyarılar, tarihsiz sahneler ve hiçbir olay örgüsüne bağlı olmayan sahneler.'],
    ],
    tips: ['Hedefler “Kitap → Hedefler” altında belirlenir. Onlar olmadan sayılar yalnızca var olanı gösterir.', '“Kitap” bölümüne bir kapak ya da tanıtım cümlesi eklediyseniz ilk blokta yer alırlar; kapağa tıklayarak büyük görebilirsiniz.', 'Bilgisayarda herhangi bir bağlantıya sağ tıklayın → “Yeni pencerede aç”: örneğin yazdığınız sahnenin yanında bir karakterin kartı.', 'Telefonda, bir şeye bakmak için sahneden çıkarsanız üstteki ↩ düğmesi sizi oraya geri götürür.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Hikâyenin temelleri: ne anlattığınız, hangi dünyada ve hangi ipliklerle ilerlediği.',
    parts: [
      ['Öncül', 'Bir iki cümlede fikir: kim ne istiyor ve ona ne engel oluyor.'],
      ['Fabula, ortam ve notlar', 'Kronolojik sırayla olaylar, dönem ve yer ve tüm romanı ilgilendiren notlar. Yazmak için her bloğa dokunun.'],
      ['Olay örgüleri', 'Her satırda bir anlatı ipliği; ağırlıklarına göre gruplanmış: ana, yan ve arka plan. Sınıflandırma her olay örgüsünün kartında yapılır.'],
      ['Her olay örgüsünün seyri', 'Çubukta kitabın her sahnesi için, okuma sırasıyla bir çizgi vardır; renkli olanlar o olay örgüsüne ait olanlardır. Nerede başladığı, nerede kaybolduğu ve sona ulaşıp ulaşmadığı görülür.'],
    ],
    tips: [
      'Sahneler bir olay örgüsüne sahnenin kartında, “Olay örgüleri ve nesneler” bloğunda atanır.',
      '“Hiçbir olay örgüsüne bağlı olmayan sahneler” uyarısı, belki hiçbir şeyi ilerletmeyen sahneleri gösterir.',
      '“Tümünü oku” mimariyi bir belge gibi art arda gösterir.',
      '“Olay örgüsü ekle”nin yanındaki “İçe / dışa aktar”, olay örgülerini Excel, CSV, Word, metin ya da JSON olarak dışa çıkarır ve geri getirir.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Projenin dağınık notları: fikirler, metin parçaları, hatırlatmalar.',
    parts: [
      ['Etiketler', 'Her notun birden çok etiketi olabilir. Burada etikete göre gruplanırlar; iki etiketli bir not iki blokta da görünür.'],
      ['Renk', 'Bir bakışta ayırt etmek için sekiz renk. “Sıralama ölçütü: Renk” onları böyle gruplar.'],
      ['Bağlar', 'Bir not karakterlere, mekânlara, nesnelere, gruplara, özel kartlara, olay örgülerine, bölümlere ve sahnelere bağlanabilir. O zaman her birinin kartında da görünür.'],
      ['Sıralama ve bakım', 'Her bloğun içinde sürükleyerek yeniden sıralanırlar. Bir etiketin ⋯ menüsü onu yeniden adlandırır ya da tüm notlarından kaldırır.'],
    ],
    tips: ['Başvuru malzemesi (bağlantılar, planlar, makaleler) için Kaynaklar, gözden geçirilecekler için Yapılacaklar daha uygundur.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Romanın başvuru malzemesi: bağlantılar, makaleler, görseller, haritalar, planlar ve belgeler.',
    parts: [
      ['Kaynaklar', 'Her birinin bir türü, isteğe bağlı bir web adresi, bir metni ve ekli dosyaları (görseller, SVG ya da PDF) olur.'],
      ['Bağlar', 'Bir kaynak sahnelere, bölümlere ya da kartlara bağlanır ve onlarda görünür: böylece o sahneyi yazarken el altındadır.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Hikâyeyi yaşayanların kartları.',
    parts: [
      ['Ana ve yan karakterler', 'Ana karakterlerin bölümlere ayrılmış bir görüşmesi vardır (kişisel bilgiler, dış görünüş, psikoloji, çatışma, gelişim…); yan karakterlerin serbest bir açıklaması. Kartından biri ötekine dönüştürülebilir.'],
      ['Metinde algılama', 'Karakterleri yazmaya başlamadan önce oluşturursanız sahneler onları adlarından ve diğer adlarından tanır ve kendiliğinden işaretler.'],
      ['Tarihler ve yaş', 'Kartta doğum tarihi varsa her tarihli sahne karakterin yaşını gösterir.'],
      ['İlişkiler', 'Bir karakterin “İlişkiler”de çizilmiş bir ilişkisi olduğunda burada hepsini bir araya getiren bir sekme belirir.'],
    ],
    tips: ['“İçe / dışa aktar” listeyi Excel, CSV, Word, metin ya da JSON olarak dışa çıkarır ve geri getirir. Her kart eksiksiz gider: veriler, metin, özellikler, olaylar, göründüğü sahneler ve ilişkiler.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Bir ana karakterin kartı: onu tanımanıza yardım eden, bölümlere ayrılmış bir görüşme.',
    parts: [
      ['Bölümler', 'Her bölüm soru soru ya da serbest metin olarak yanıtlanabilir. Durumu (yapılacak, sürüyor, bitti) size ne kaldığını söyler.'],
      ['Özellikler', 'Kendinizle çelişmemeniz için yazdıklarınızdan kendiliğinden çıkarılır (yaş, saç, gözler…); kendinizinkileri de ekleyebilirsiniz.'],
      ['Rol, diğer adlar ve tarihler', 'Hikâyedeki rolü, ona verilen diğer adlar (metnin onu tanıması için) ve doğumu ile ölümü.'],
      ['İlişkiler', 'Her ilişki için bir çift: her birinin fotoğrafının altında, onun öbürü için ne olduğu (“Uçuş direktörü” / “Komutan”). Yalnızca birini yazarsanız ikisi için de geçerli olur (“Meslektaş”). İlişki ister burada, ister öbürünün kartında not edilmiş, ister bir haritada çizilmiş olsun tek bir liste vardır; değiştirdiğinizde ya da kaldırdığınızda tüm bu yerlerde güncellenir.'],
      ['Görseller, olaylar ve görünmeler', 'Başvuru fotoğrafları, zaman çizelgesi için tarihli olaylar ve göründüğü sahneler.'],
    ],
    tips: [
      'Öldükten sonra da görünmeye devam ediyorsa (cesedi, bir anı, bir hayalet) ölüm tarihinin altındaki kutuyu işaretleyin; Süreklilik uyarmaz.',
      '⋯ menüsü kartı dışa aktarır ya da ona veri içe aktarır.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Romanın geçtiği yerler, en büyüğünden en küçüğüne.',
    parts: [
      ['Liste', 'Tüm mekânların kartları; sürüklenerek yeniden sıralanırlar.'],
      ['Ağaç', 'Hangi mekânın hangisinin içinde olduğu: salon güvertede, güverte gemide. Bir mekânda olan, onu içerenler için de sayılır.'],
      ['Haritalar', 'Bir plan ya da harita (görsel ya da SVG) yükler, mekânlarınızı üzerine raptiyelerle yerleştirirsiniz.'],
      ['İlişkiler', 'Bir mekânın “İlişkiler”de çizilmiş bir ilişkisi olduğunda görünür.'],
    ],
    tips: ['Ağaçta her satırın ⋯ menüsü onu başka bir mekânın içine taşır ya da içine mekân ekler.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Bir mekânın kartı.',
    parts: [
      ['Nerede', 'Ülke, bölge ve şehir; bir de “İçinde olduğu yer”: onu içeren mekân. “İçerdikleri” içindeki mekânları listeler.'],
      ['Açıklama ve sorular', 'Serbest metin ve tüm mekânlar için tanımladığınız sorular.'],
      ['Görünmeler', 'Burada ya da içerdiği mekânlardan herhangi birinde geçen sahneler.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Kendi tanımladığınız türlerin kartları: gemiler, teknolojiler, yaratıklar, örgütler…',
    parts: [
      ['Türler', '“Tür ekle”, adı, simgesi ve alanlarıyla yeni bir tür oluşturur. Her tür bir sekmedir.'],
      ['Kartlar', 'Türlerinin alanlarına ek olarak açıklamaları, görselleri ve kimlikleri vardır.'],
      ['Diğer öğeler gibi', 'Sahnelerde işaretlenirler (“Olay örgüleri ve nesneler” bloğu), zaman çizelgesinde ve aramada görünürler ve Süreklilik’e dâhil olurlar.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Romandaki öğelerin birbiriyle nasıl ilişkili olduğu: sizin çizdikleriniz ve kendiliğinden çıkarılanlar.',
    parts: [
      ['Haritalarım', 'Birden çok haritanız olabilir: aile, mürettebat, saflar. Her biri bir tuvaldir.'],
      ['Öğeler ve oklar', 'Bir haritaya kartlar (ya da serbest metinler) ekler ve ikisini etiketli bir okla birleştirirsiniz: “annesi”, “düşmanı”, “için çalışıyor”.'],
      ['Otomatik', 'Not ettiklerinizden kendiliğinden çıkan on çizim: aynı sahnede kimlerin olduğu, her nesnenin kimde olduğu, her sırrı kimin bildiği, bir olayın neyi birleştirdiği, karakterler ve mekânlar, karakterler ve olay örgüleri, yer değiştirmeler, gruplar, mekân içinde mekânlar ve ilişkiler (kartlarda ve haritalarda not edilenlerin hepsi, artı çıkarılan kardeşler ile dedeler ve nineler). Saklanmazlar: açılınca yeniden hesaplanırlar.'],
      ['Hepsi bir arada', 'Sizinkileri (düz çizgi) ve otomatik olanları (kesik çizgi, her biri kendi renginde) içeren genel bir çizim; hangilerinin görüneceğini seçmek için kutularla.'],
      ['Bir çizimi okumak', 'Çizgi ne kadar kalınsa ilişki o kadar sık yaşanıyor. Fareyi bir öğenin üzerine getirin ya da sabitlemek için ona dokunun; onun ilişkileri etiketleriyle vurgulanır. Altta liste vardır.'],
      ['Kartlarda görmek', 'Karakterler ve Mekânlar sayfalarında, tüm haritalarınızdaki ilişkileri bir araya getiren bir “İlişkiler” sekmesi vardır.'],
    ],
    tips: ['“İlişkileri dışa aktar” onları Word, metin, Excel, CSV ya da JSON olarak çıkarır.', 'İki karakter arasındaki “anne”, “baba” ya da “oğul” oku, ayrıca Süreklilik’in doğum tarihlerini denetlemesine de yarar.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'Romanın yapısı: kısımlar, bölümler, önsöz ve sonsöz.',
    parts: [
      ['Liste', 'Her bölüm sahneleri, sözcükleri, okuma süresi, durumu, en çok yer alan karakterleri ve dokunduğu her olay örgüsü için renkli bir kareyle. Üstte kitabın toplamı.'],
      ['Okuma süresi', 'Yaklaşık olarak, dakikada 250 sözcük kadar. Her bölümün içinde her sahnenin süresi de görünür.'],
      ['Olay örgüleri', 'Olay örgüsünün adını, türünü ve açıklamasını görmek için fareyi bir karenin üzerine getirin (dokunmatik ekranda basılı tutun).'],
      ['Yeniden sıralama', 'Satırları sürükleyin, Alt+↑/↓ tuşlarını ya da her birinin ⋯ menüsünü kullanın.'],
      ['Diğer görünümler', '“Pano” sahneleri bölümler arasında taşımak için kartlar olarak gösterir; “Ana hat” her şeyi bir ağaçta.'],
    ],
    tips: ['“Yapı” kısım, önsöz ya da sonsöz ekler, Word’deki bir taslağı içe aktarır ve tüm sahnelerde adı geçenleri algılar.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Bir bölüm: sahneleri ve notları.',
    parts: [
      ['Sahneler', 'Oluşturulur, sürüklenerek yeniden sıralanır ve ⋯ menülerinden başka bir bölüme taşınır. Her birinin başlığının altında: ne zaman geçtiği ve ne kadar sürdüğü, kimin anlattığı ve her mekân için renkli bir kare (hangisi olduğunu görmek için fareyi üzerine getirin ya da basılı tutun).'],
      ['Amaç ve notlar', 'Bölümün romandaki işlevi ve yazarken hatırlamak istedikleriniz.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Yazılan yer. Solda metin, sağda sahnenin kartı.',
    parts: [
      ['Metin', 'Kendiliğinden kaydedilir. Çubukta biçimlendirme, konuşma çizgisi ve tırnaklar, bul ve değiştir ve seçili metne yapılacak işareti koyma vardır.'],
      ['Kart', 'Katlanır bloklar hâlinde: kim yer alıyor ve kim anlatıyor, nerede ve ne zaman, olaylar, olay örgüleri ve nesneler, süreklilik, yapılacaklar, kaynaklar ve revizyonlar.'],
      ['Olaylar', '“Olaylar” bloğu sahneyle ilgili olguları gösterir: onda yaşananlar (sahnenin tarihini alırlar) ve onda anlatılanlar (bir anı: kendi tarihlerini korurlar). Kapalıyken hangileri olduğunu söyler; açıkken her birinin tarihini, açıklamasını, kimi etkilediğini ve başka hangi sahnelerde olduğunu verir.'],
      ['Otomatik algılama', 'Metinde adını andıklarınız (karakterler, mekânlar, nesneler, gruplar) “oto” sözcüğüyle kendiliğinden işaretlenir. Kaldırırsanız yeniden eklenmez.'],
      ['Revizyonlar', 'Sahne metninin sürümleri. Yeniden yazmadan önce yenisini oluşturabilir, onları karşılaştırabilir ve öncekine dönebilirsiniz.'],
      ['Araçlar', 'Çubukta: bölünmüş görünüm (yanda bir kart ya da başka bir sahne), üslup denetimi, sesli okuma ve dikkat dağıtmayan mod.'],
      ['Süreklilik', 'Burada durumu değişenleri (“kolundan yaralı”, “anahtar Alex’e geçiyor”) ve hangi sırrın kime açıldığını not edin.'],
    ],
    tips: ['Ctrl+S hemen kaydeder; Ctrl+F arar; Esc dikkat dağıtmayan moddan çıkar.', 'Sahnenin tarihi onu zaman çizelgesine yerleştirir; yaşları hesaplamayı ve olanaksızlıkları saptamayı sağlar.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Romanı bir bakışta görmek ve yeniden düzenlemek için kart hâlinde sahneler.',
    parts: [
      ['Sütunlar ve kartlar', 'Her bölüm bir sütun (her sırada dört tane), her sahne özeti, anlatıcısı, yeri ve zamanıyla bir karttır.'],
      ['Özet', 'Sahnenin neyle ilgili olduğunu yazmak için bir kartın metnine dokunun.'],
      ['Taşıma', 'Yerini ya da bölümünü değiştirmek için bir kartı sürükleyin. Dokunmatik ekranlarda ⋯ menüsünü kullanın.'],
      ['Olay örgüleri', 'Renkli çizgiler sahnenin olay örgüleridir; üstteki açıklama hangisinin hangisi olduğunu söyler.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Romanı kitap olarak tanımlayan her şey.',
    parts: [
      ['Kitap bilgileri', 'Başlık ve dil (zorunlu) ile yazar, seri, sıra, yayın tarihi, yayınevi, kapak ve özet (isteğe bağlı). İç kapakta ve e-kitabın bilgilerinde yer alırlar.'],
      ['Hedefler', 'Sözcük hedefi, günlük hedef, teslim tarihi ve bölüm başına sözcük. Giriş sayfasından izlenir.'],
      ['Kitabın sayfaları', 'Künye, ithaf, epigraf, teşekkür ve fotoğrafıyla “Yazar hakkında”. Dışa aktarırken eklenir.'],
      ['Proje', 'Yedek (tüm verileri, görselleri ve belgeleri, bir de Word biçiminde kitabı ve kartları içeren bir .zip), devam kitabı oluşturma (dünyayı korur, bölümsüz başlar) ve projeyi silme. Yedek, “Projeleriniz” sayfasındaki “Yedeği içe aktar” ile geri yüklenir.'],
    ],
    tips: ['Yazar adı yoksa kitap “Anonim” olarak dışa aktarılır.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Gözden geçirilecek her şey, tek bir yerde.',
    parts: [
      ['Nereden gelirler', 'Bir sahnenin metnine konan bir işaretten ya da bir karta veya projeye bağlı serbest notlardan.'],
      ['Türler ve durum', 'Her yapılacağın bir türü (gözden geçir, denetle, araştır…) vardır ve çözüldüğünde çözüldü olarak işaretlenir.'],
      ['Yerine gitmek', 'Metne işaretlenmiş bir yapılacaktan sahnedeki cümlenin tam yerine atlanır.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Olaylar sırayla: tarihli sahneler ve dünyadaki olaylar.',
    parts: [
      ['Neler görünür', 'Bir sahne, kartında ona tarih verdiğinizde görünür. Bir olay burada ya da bir öğenin kartında oluşturulur; genel olabilir ya da bir veya birden çok öğeye ait olabilir.'],
      ['Olaylar ve sahneler', 'Bir olay, yaşandığı sahnelere (onların tarihini alır ve içlerinde görünür) ya da yalnızca anlatıldığı sahnelere (kendi tarihini korur) bağlanır. Bağımsız bir olay tarih ve saat olarak bir sahneyle çakışırsa bir uyarı onları bağlamayı önerir.'],
      ['İki sıralama', '“Kronolojik” tarihe göre sıralar; “Okuma sırası” kitaptaki gibi, anlatının nerede geriye sıçradığını görmek için.'],
      ['Kitabın başı ve sonu', 'İki işaret okurun okuduğu ilk ve son sahneyi gösterir: öncesi, romandan önceki geçmiştir.'],
      ['İzle ve süzgeçler', '“İzle” çizelgeyi tek bir öğeye indirger; kutular giriş türlerini gizler.'],
      ['Arama', 'Metne, tarihe ya da kimliğe göre. “a & b” ikisini birden ister; “a | b” birini. Yanındaki “?” örnekler verir.'],
      ['İçe ve dışa aktarma', 'CSV, JSON, Excel ya da Word’e ve geri: eksik olayları oluşturur ve var olanları günceller.'],
    ],
    tips: ['İki giriş arasında geçen süre gösterilir; fareyi üzerine getirince ayrıntılı dökümü çıkar.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Kendinizle çelişmemek için: saptanabilen olanaksızlıklar, kimin neyi bildiği ve her öğenin nasıl değiştiği.',
    parts: [
      ['Denetimler', 'Sahnelerin tarihlerini ve mekânlarını, bulunan karakterleri, doğumları ve ölümleri, durumları ve sırları karşılaştırır. Örneğin aynı anda iki yerde bulunan biri için uyarır.'],
      ['Olanaksız ya da gözden geçirilecek', 'Olamayacak olan “Olanaksız”, bilerek yapılmış olabilecek olan “Gözden geçirilecek” olarak çıkar. Her uyarı yok sayılabilir.'],
      ['Kim neyi biliyor', 'Romanın sırları, her satırda bir tane, ve her karakterin ve okurun onu hangi sahnede öğrendiği. İlk açığa çıkışlarına göre (tarihe ya da okuma sırasına göre) sıralanırlar; arama kutusu başlığa, içeriğe, kişiye ya da sahneye göre bulur. Ayrıntıyı görmek için bir satıra dokunun.'],
      ['İzleme', 'Bir öğeyi izleyerek kitabı dolaşır: nerede göründüğünü ve durumunun nasıl değiştiğini.'],
    ],
    tips: ['Durumlar ve açığa çıkışlar her sahnenin kartında, “Süreklilik” bloğunda not edilir.', 'Ne kadar çok doldurursanız (tarihler, mekânlar, doğumlar) o kadar çok şey bulunur.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Metninizin ve onu yazma biçiminizin ölçüleri.',
    parts: [
      ['Yazma alışkanlığım', 'Günlük sözcük, seriler, oturumlar ve bitiş tahmini.'],
      ['Kitap', 'Bölüm ve sahne uzunlukları, diyalog ve anlatım oranı ve tekrarlar.'],
      ['Üslup', '-mente ile biten zarflar, yakın tekrarlar, dolgu sözcükleri ve uzun cümleler, bölüm bölüm; en çok nerede olduğunu vurgular. Romanın dilinin kurallarını izler.'],
      ['Anlatı grafiği', 'Her öğe için bir satır, her sahne için bir sütun: kim çok uzun süre kayboluyor ve hangi olay örgüleri hiç kesişmiyor.'],
      ['Dağılım ve görünmeler', 'Her öğenin her bölümde kaç sahnede göründüğü ve bir karakterin sahnelerinin listesi.'],
    ],
    tips: ['Her sütunun yanındaki “?” neyi ölçtüğünü açıklar.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Tüm projede arar (ve değiştirir).',
    parts: [
      ['Nerede arar', 'Alanları işaretleyin: sahnelerin metni, başlıklar, karakterler, dünya, mimari ve notlar, kaynaklar ve yapılacaklar.'],
      ['Seçenekler', 'Büyük/küçük harf duyarlılığı ve yalnızca tam sözcükleri arama.'],
      ['Değiştir', 'Kaç yerde olduğunu söyledikten sonra metni işaretli olan her yerde değiştirir. Bir karakterin adını değiştirmek için kullanışlıdır.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Romanı ya da çalışma malzemesini bir dosyaya çıkarır.',
    parts: [
      ['Dışa aktarılacak', 'Roman ya da proje defteri (mimari, karakterler, mekânlar ve diğer kartlar).'],
      ['Dışa aktarma türleri', 'Göndermek için metin, basılı kitap (sayfa ve sırt tahminiyle), e-kitap (EPUB) ya da serbest biçim.'],
      ['Biçimler', 'Word, EPUB, web sayfası ya da PDF ve metin.'],
      ['Kitabın bilgileri ve sayfaları', 'İç kapak, e-kitabın bilgileri, kapak ve ön ile arka sayfalar “Kitap” bölümünden gelir.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Silinenler hemen kaybolmaz: buraya gelir.',
    parts: [
      ['Geri yükle', 'Bir öğeyi ona bağlı olanlarla birlikte yerine döndürür.'],
      ['Süre sonu', 'Ayarlar’da belirlediğiniz gün sayısı (1 ile 60 arası) dolunca kalıcı olarak silinir.'],
    ],
    guide: 'data#trash',
  },
};
