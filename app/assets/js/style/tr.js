// Metin denetimi sayfası (Türkçe): „Çözümleme”, düzenleyicideki üslup denetimi ve bu dilde yazılmış
// bir romandaki adların bulunması bunu kullanır. Serbestçe genişletilebilir.
export default {
  // Sık geçen sözcükler (bağlaçlar, edatlar, zamirler, yardımcı fiiller, yaygın zarflar): tekrar
  // sayılmazlar, en çok kullanılan sözcükler arasına da girmezler. Noktalı ya da noktasız fark etmez.
  stop: (
    've ile ya veya yahut ama fakat ancak lakin oysa oysaki halbuki çünkü zira ki de da dahi bile hem hiç yine yani hatta '
    + 'ise eğer şayet madem mademki gerek ne nasıl neden niçin niye nerede nereye nereden kim kimi kimin kime kimse kimsenin '
    + 'hangi hangisi kaç bir birisi birkaç bazı bütün tüm hep her herkes herhangi hiçbir hiçbiri biri birçok çok az daha '
    + 'en pek oldukça gayet fazla kadar sadece yalnız yalnızca sanki belki mutlaka tabii tabi evet hayır '
    + 'ben beni bana benim bende benden benimle sen seni sana senin sende senden seninle o onu ona onun onda ondan onunla '
    + 'biz bizi bize bizim bizde bizden bizimle siz sizi size sizin sizde sizden sizinle onlar onları onlara onların '
    + 'onlarda onlardan onlarla kendi kendim kendin kendini kendine kendisi kendisini kendisine kendileri '
    + 'bu bunu buna bunun bunda bundan bunlar bunları bunlara bunların bunlarla şu şunu şuna şunun şundan şunlar '
    + 'öyle böyle şöyle öylece böylece şöylece orada burada şurada oraya buraya şuraya oradan buradan şuradan '
    + 'için gibi göre karşı doğru rağmen dolayı beri önce sonra üzere üzerine üzerinde üzerinden altında altına '
    + 'altından yanında yanına yanından arasında arasına arasından içinde içine içinden dışında dışına önünde önüne '
    + 'önünden arkasında arkasına ardından boyunca sırasında hakkında ilgili dair yerine başka ötürü '
    + 'şimdi şimdilik artık hâlâ henüz sonunda hemen bazen sık çoğu zaman asla '
    + 'ayrıca üstelik zaten aslında neredeyse tam tamamen büsbütün '
    + 'mi mı mu mü değil değildi değilim yok yoktu var vardı '
    + 'idi imiş iken olarak olan olduğu olduğunu oldu olmuş olmuştu olacak olur olurdu olsa olmak olup olmadı '
    + 'oluyordu olabilir olabilirdi olamaz etti etmiş eden etmek yaptı yapmış yapıyor yapmak yapan yaparak '
    + 'dedi demiş diye diyor demek diyen derken söyledi sordu cevap bakıp gördü baktı '
    + 'geldi gitti aldı verdi kaldı çıktı girdi durdu başladı istedi bildi biliyordu bilmiyordu '
    + 'ettim ettin edip ederek yapıp gelip gidip alıp verip kalıp'
  ).split(' '),

  // Dolgu sözcükler: metne sızıp bir şey katmayan sözcükler ve kalıplar.
  fillers: ['birden', 'aniden', 'bir anda', 'o anda', 'tam o sırada', 'o sırada', 'bir an', 'bir süre', 'biraz', 'bir miktar',
    'aslında', 'gerçekten', 'sahiden', 'sadece', 'basitçe', 'kısacası', 'harfiyen', 'elbette', 'tabii ki', 'açıkça',
    'neredeyse', 'oldukça', 'bir şey', 'şey', 'bir şekilde', 'bir nevi', 'başladı', 'gibi görünüyordu', 'sanki',
    'iç çekti', 'başını salladı', 'gülümsedi', 'omuz silkti', 'omuzlarını silkti', 'kaşlarını çattı', 'yutkundu'],

  // Türkçede tarz zarflarını ayırt etmeye yarayan güvenilir bir ek yoktur: yanlış saymaktansa hiç saymamak yeğdir.
  adverbs: null,

  // Türkçede tanımlık (artikel) yoktur.
  articles: [],

  // Hitaplar ve unvanlar (Türkçede çoğunlukla addan sonra gelirler: Ahmet Bey, Ayşe Hanım).
  titles: ['bey', 'hanım', 'efendi', 'beyefendi', 'hanımefendi', 'bay', 'bayan', 'doktor', 'dr', 'profesör', 'prof', 'doçent',
    'kaptan', 'binbaşı', 'albay', 'general', 'yüzbaşı', 'teğmen', 'çavuş', 'komiser', 'hoca', 'hocam', 'usta', 'abi', 'abla',
    'amca', 'dayı', 'teyze', 'hala', 'baba', 'anne', 'kral', 'kraliçe', 'prens', 'prenses', 'sultan', 'paşa', 'ağa',
    'aziz', 'mühendis', 'avukat', 'şeyh', 'molla', 'rahip', 'peder'],
};
