// Podrobná nápověda ke každé stránce (cs): to, co se zobrazí po stisknutí „?“. Každá položka má
// úvodní větu, oddíly [nadpis, text], tipy a kapitolu příručky k aplikaci, kde je vše vysvětleno
// podrobněji. Stránky, které tu nejsou, ukazují jen svou krátkou větu (help.<sekce> v i18n/cs.js).
export default {
  home: {
    intro: 'Co se vyplatí vidět hned po otevření: kde pokračovat, jak jste na tom, kolik zbývá a co je třeba zkontrolovat.',
    parts: [
      ['Kde pokračovat', 'Naposledy upravená scéna a další, která čeká na napsání, s přímým odkazem. „Pokračovat v psaní“ otevře tu první. V novém projektu tu najdete první kroky.'],
      ['Čtyři čísla', 'Rukopis oproti cílovému počtu slov, dnes napsaná slova oproti dennímu cíli, série dní v řadě a dny zbývající do odevzdání, s tempem, které potřebujete, a tempem, které máte.'],
      ['Tempo a stav', 'Slova za každý z posledních 30 dní a kolik karet, kapitol a scén je nezačatých, rozpracovaných nebo hotových.'],
      ['Ke kontrole', 'Nejnovější otevřené úkoly a upozornění: nemožnosti a upozornění z Kontinuity, scény bez data a scény bez dějové linie.'],
    ],
    tips: ['Cíle se nastavují v sekci „Kniha → Cíle“. Bez nich čísla ukazují jen to, co je.', 'Pokud jste v sekci „Kniha“ přidali obálku nebo představující větu, zobrazí se v prvním bloku; kliknutím na obálku ji uvidíte ve velkém.', 'Na počítači klikněte pravým tlačítkem na libovolný odkaz → „Otevřít v novém okně“: například kartu postavy vedle scény, kterou píšete.', 'V mobilu, když opustíte scénu, abyste si něco dohledali, vás tlačítko ↩ nahoře vrátí zpět.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Základy příběhu: co vyprávíte, v jakém světě a po jakých nitkách děj postupuje.',
    parts: [
      ['Premisa', 'Myšlenka v jedné nebo dvou větách: kdo chce co a co mu v tom brání.'],
      ['Fabule, prostředí a poznámky', 'Události v chronologickém pořadí, doba a místo a postřehy, které se týkají celého románu. Stiskněte blok a pište.'],
      ['Dějové linie', 'Jedna vyprávěcí nitka na řádek, seskupené podle váhy: hlavní, vedlejší a v pozadí. Zařazení se nastavuje na kartě každé dějové linie.'],
      ['Průběh každé linie', 'Pruh má jednu čárku za každou scénu knihy v pořadí čtení; barevné patří k této linii. Je vidět, kde začíná, kde mizí a zda dojde až do konce.'],
    ],
    tips: [
      'Scény se k dějové linii přiřazují na kartě scény, v bloku „Dějové linie a předměty“.',
      'Upozornění „scény bez dějové linie“ ukazuje scény, které možná nic neposouvají.',
      '„Číst vše“ zobrazí architekturu v jednom kuse jako dokument.',
      '„Import / export“ vedle tlačítka „Přidat dějovou linii“ vyexportuje linie do Excelu, CSV, Wordu, textu nebo JSON a zase je načte zpět.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Volné poznámky k projektu: nápady, úryvky, připomínky.',
    parts: [
      ['Štítky', 'Každá poznámka jich může mít víc. Tady se seskupují podle štítku a poznámka se dvěma štítky se objeví v obou blocích.'],
      ['Barva', 'Osm barev, abyste je na první pohled rozlišili. „Řadit podle: Barvy“ je takto seskupí.'],
      ['Propojení', 'Poznámku lze propojit s postavami, místy, předměty, skupinami, vlastními kartami, dějovými liniemi, kapitolami a scénami. Pak se zobrazí na kartě každého z nich.'],
      ['Řazení a údržba', 'Uvnitř každého bloku se pořadí mění přetažením. Nabídka ⋯ u štítku ho přejmenuje nebo odebere ze všech jeho poznámek.'],
    ],
    tips: ['Na materiál, ze kterého čerpáte (odkazy, plánky, články), jsou lepší Podklady; na to, co je třeba zkontrolovat, Úkoly.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Materiál, ze kterého při psaní románu čerpáte: odkazy, články, obrázky, mapy, plánky a dokumenty.',
    parts: [
      ['Podklady', 'Každý má typ, nepovinnou webovou adresu, text a přiložené soubory (obrázky, SVG nebo PDF).'],
      ['Propojení', 'Podklad se propojí se scénami, kapitolami nebo kartami a zobrazí se v nich: máte ho po ruce, když danou scénu píšete.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Karty těch, kdo příběh prožívají.',
    parts: [
      ['Hlavní a vedlejší', 'Hlavní postavy mají dotazník rozdělený do oddílů (osobní údaje, vzhled, psychologie, konflikt, vývoj…); vedlejší volný popis. Jednu na druhou lze změnit z její karty.'],
      ['Rozpoznávání v textu', 'Když postavy vytvoříte před psaním, scény je poznají podle jména a dalších jmen a samy je označí.'],
      ['Data a věk', 'Když je na kartě datum narození, každá scéna s datem ukazuje věk postavy.'],
      ['Vztahy', 'Jakmile má některá postava vztah nakreslený ve „Vztazích“, objeví se tu záložka, která je shromáždí všechny.'],
    ],
    tips: ['„Import / export“ vyexportuje seznam do Excelu, CSV, Wordu, textu nebo JSON a zase ho načte zpět. Každá karta jde celá: údaje, text, rysy, události, scény, ve kterých se vyskytuje, a vztahy.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Karta hlavní postavy: dotazník rozdělený do oddílů, který vám ji pomůže poznat.',
    parts: [
      ['Oddíly', 'Na každý oddíl lze odpovídat otázku po otázce, nebo volným textem. Jeho stav (nezačato, rozpracováno, hotovo) ukazuje, co zbývá.'],
      ['Rysy', 'Získávají se samy z toho, co píšete (věk, vlasy, oči…), abyste si neprotiřečili; můžete přidat i vlastní.'],
      ['Role, další jména a data', 'Role v příběhu, další způsoby, jak postavu oslovovat (aby ji text poznal), a její narození a úmrtí.'],
      ['Vztahy', 'Jedna dvojice na vztah: pod fotografií každého to, čím je pro toho druhého („Letový ředitel“ / „Velitel“). Když vyplníte jen jedno, platí pro oba („Kolegové“). Je to jediný seznam, ať je vztah zapsaný tady, na kartě toho druhého, nebo nakreslený v mapě; když ho změníte nebo odeberete, aktualizuje se na všech těchto místech.'],
      ['Obrázky, události a výskyty', 'Referenční fotografie, skutečnosti s datem pro časovou osu a scény, ve kterých vystupuje.'],
    ],
    tips: [
      'Pokud se objevuje i po smrti (tělo, vzpomínka, přízrak), zaškrtněte políčko pod datem úmrtí a Kontinuita nebude upozorňovat.',
      'Nabídka ⋯ kartu vyexportuje nebo do ní importuje data.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Prostředí románu, od největšího po nejmenší.',
    parts: [
      ['Seznam', 'Karty všech míst; pořadí se mění přetažením.'],
      ['Strom', 'Které místo je uvnitř kterého: sál na palubě, paluba na lodi. Co se děje na nějakém místě, počítá se i pro místa, která ho obsahují.'],
      ['Mapy', 'Nahrajete plánek nebo mapu (obrázek nebo SVG) a umístíte na ni svá místa špendlíky.'],
      ['Vztahy', 'Objeví se, jakmile má některé místo vztah nakreslený ve „Vztazích“.'],
    ],
    tips: ['Ve stromu nabídka ⋯ u každého řádku místo přesune do jiného nebo do něj přidá další místa.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Karta místa.',
    parts: [
      ['Kde leží', 'Země, kraj a město a „Uvnitř“: místo, které ho obsahuje. „Obsahuje“ uvádí ta, která má uvnitř.'],
      ['Popis a otázky', 'Volný text a vlastní otázky, které jste definovali pro všechna místa.'],
      ['Výskyty', 'Scény, které se odehrávají tady nebo na kterémkoli místě, které toto místo obsahuje.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Karty typů, které si definujete sami: lodě, technologie, tvorové, organizace…',
    parts: [
      ['Typy', '„Přidat typ“ vytvoří typ s názvem, ikonou a poli. Každý typ je jedna záložka.'],
      ['Karty', 'Mají pole svého typu a k tomu popis, obrázky a identifikátor.'],
      ['Jako každý jiný prvek', 'Označují se ve scénách (blok „Dějové linie a předměty“), objevují se na časové ose a ve vyhledávání a zahrnuje je Kontinuita.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Jak spolu souvisejí prvky románu: co nakreslíte sami a co se odvodí samo.',
    parts: [
      ['Moje mapy', 'Můžete jich mít víc: rodina, posádka, znepřátelené strany. Každá je jedno plátno.'],
      ['Prvky a šipky', 'Do mapy přidáte karty (nebo volné texty) a dvě spojíte šipkou s popiskem: „matka“, „nepřítel“, „pracuje pro“.'],
      ['Automatické', 'Deset grafů, které vzniknou samy z toho, co už je zapsané: kdo se potkává ve scéně, kdo má který předmět, kdo zná které tajemství, co spojuje událost, postavy a místa, postavy a dějové linie, přesuny, skupiny, místa uvnitř míst a vztahy (všechny zapsané na kartách a v mapách a k tomu odvození sourozenci a prarodiče). Neukládají se: přepočítají se při otevření.'],
      ['Vše dohromady', 'Celkový graf s vašimi vztahy (plná čára) a automatickými (přerušovaná, každý typ svou barvou), se zaškrtávacími políčky, kterými zvolíte, co se zobrazí.'],
      ['Jak číst graf', 'Čím silnější čára, tím častěji se vztah vyskytuje. Najeďte myší na prvek, nebo ho stiskněte, aby zůstal vybraný, a zvýrazní se jeho vztahy s popiskem. Pod grafem je seznam.'],
      ['Vztahy na kartách', 'Postavy a Místa mají záložku „Vztahy“, která shromáždí vztahy ze všech vašich map.'],
    ],
    tips: ['„Exportovat vztahy“ je uloží do Wordu, textu, Excelu, CSV nebo JSON.', 'Šipka „matka“, „otec“ nebo „syn“ mezi dvěma postavami navíc umožní Kontinuitě zkontrolovat jejich data narození.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'Struktura románu: části, kapitoly, prolog a epilog.',
    parts: [
      ['Seznam', 'Každá kapitola se svými scénami, slovy, dobou čtení, stavem, nejvýraznějšími postavami a barevným čtverečkem za každou dějovou linii, které se týká. Nahoře je souhrn celé knihy.'],
      ['Doba čtení', 'Přibližná, při zhruba 250 slovech za minutu. Uvnitř každé kapitoly je uvedena i u každé scény.'],
      ['Dějové linie', 'Najeďte myší na čtvereček (nebo ho na dotykové obrazovce podržte) a uvidíte název dějové linie, její typ a popis.'],
      ['Změna pořadí', 'Přetáhněte řádky, použijte Alt+↑/↓ nebo nabídku ⋯ u každého z nich.'],
      ['Další zobrazení', '„Nástěnka“ ukazuje scény jako kartičky, které můžete přesouvat mezi kapitolami; „Osnova“ vše ve stromu.'],
    ],
    tips: ['„Struktura“ přidá části, prolog nebo epilog, importuje koncept z Wordu a rozpozná zmínky ve všech scénách.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Kapitola: její scény a poznámky.',
    parts: [
      ['Scény', 'Vytvářejí se, pořadí se mění přetažením a do jiné kapitoly se přesouvají z jejich nabídky ⋯. Pod názvem každé: kdy se odehrává a jak dlouho trvá, kdo vypráví a barevný čtvereček za každé místo (najeďte myší nebo podržte a uvidíte které).'],
      ['Smysl a poznámky', 'K čemu kapitola v románu slouží a co si chcete při psaní zapamatovat.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Tady se píše. Vlevo text, vpravo karta scény.',
    parts: [
      ['Text', 'Ukládá se sám. Lišta umí formátování, pomlčku pro dialog a uvozovky, hledání a nahrazování a označení úkolu na vybraném textu.'],
      ['Karta', 'Ve sbalitelných blocích: kdo vystupuje a kdo vypráví, kde a kdy, události, dějové linie a předměty, kontinuita, úkoly, podklady a verze.'],
      ['Události', 'Blok „Události“ ukazuje skutečnosti, které se scénou souvisejí: ty, které se v ní dějí (přebírají její datum), a ty, které se v ní vyprávějí (vzpomínka: ponechávají si vlastní). Sbalený říká, které to jsou; rozbalený u každé uvádí datum, popis, koho se týká a ve kterých dalších scénách je.'],
      ['Automatické rozpoznávání', 'Co v textu zmíníte (postavy, místa, předměty, skupiny), samo se označí slovem „auto“. Když to odeberete, znovu se to nepřidá.'],
      ['Verze', 'Podoby textu scény. Před přepisováním můžete vytvořit novou, porovnat je a vrátit se k předchozí.'],
      ['Nástroje', 'Na liště: rozdělené zobrazení (vedle karta nebo jiná scéna), kontrola stylu, čtení nahlas a režim bez rušivých vlivů.'],
      ['Kontinuita', 'Zapište sem, co mění stav („zraněný na paži“, „klíč má teď Álex“) a které tajemství se odhaluje a komu.'],
    ],
    tips: ['Ctrl+S okamžitě uloží; Ctrl+F hledá; Esc ukončí režim bez rušivých vlivů.', 'Datum scény ji umístí na časovou osu a umožní počítat věk a odhalovat nemožnosti.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Scény jako kartičky, abyste viděli celý román najednou a mohli ho přeskládat.',
    parts: [
      ['Sloupce a kartičky', 'Každá kapitola je sloupec (čtyři na řádek) a každá scéna kartička se shrnutím, kdo vypráví, kde a kdy.'],
      ['Shrnutí', 'Stiskněte text kartičky a napište, o čem scéna je.'],
      ['Přesouvání', 'Přetažením kartičku přesunete na jiné místo nebo do jiné kapitoly. Na dotykových obrazovkách použijte její nabídku ⋯.'],
      ['Dějové linie', 'Barevné proužky jsou dějové linie scény; legenda nahoře říká, která je která.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Vše, co román popisuje jako knihu.',
    parts: [
      ['Údaje o knize', 'Název a jazyk (povinné) a autor, série, číslo, datum vydání, nakladatelství, obálka a synopse (nepovinné). Objeví se na patitulu a v metadatech e-knihy.'],
      ['Cíle', 'Cílový počet slov, denní cíl, termín a slova na kapitolu. Sledují se na úvodní stránce.'],
      ['Strany knihy', 'Tiráž, věnování, motto, poděkování a „O autorovi“ s fotografií. Přidají se při exportu.'],
      ['Projekt', 'Záloha (.zip se všemi daty, obrázky a dokumenty a s knihou a kartami ve Wordu), vytvoření pokračování (zachová svět, začne bez kapitol) a smazání projektu. Záloha se obnovuje tlačítkem „Importovat zálohu“ v části „Vaše projekty“.'],
    ],
    tips: ['Bez autora se kniha vyexportuje jako „Anonym“.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Co zbývá zkontrolovat, na jednom místě.',
    parts: [
      ['Odkud se berou', 'Ze značky na textu scény, nebo samostatně, navázané na kartu nebo na projekt.'],
      ['Typy a stav', 'Každý úkol má typ (zkontrolovat, ověřit, dohledat…) a jakmile je vyřešený, označí se tak.'],
      ['Přejít na místo', 'Z úkolu označeného na textu se dostanete přímo k dané větě ve scéně.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Události v pořadí: scény s datem a události ze světa příběhu.',
    parts: [
      ['Co se zobrazuje', 'Scéna se objeví, když jí na její kartě přidáte datum. Událost se vytváří tady nebo na kartě prvku a může být obecná, nebo patřit k jednomu či více prvkům.'],
      ['Události a scény', 'Událost se propojí se scénami, ve kterých se odehrává (přebírá jejich datum a zobrazuje se uvnitř nich), nebo ve kterých se jen vypráví (ponechává si vlastní). Když se samostatná událost shoduje datem a časem se scénou, upozornění navrhne je propojit.'],
      ['Dvě pořadí', '„Chronologické“ řadí podle data; „Podle čtení“ jako v knize, abyste viděli, kde se vyprávění vrací zpět.'],
      ['Kde kniha začíná a končí', 'Dvě značky vyznačují první a poslední scénu, kterou čtenář čte: co je před nimi, je minulost před románem.'],
      ['Sledovat a filtry', '„Sledovat“ omezí osu na jediný prvek; zaškrtávací políčka skrývají typy záznamů.'],
      ['Hledání', 'Podle textu, data nebo identifikátoru. „a & b“ vyžaduje obojí; „a | b“ jedno z toho. „?“ vedle něj ukáže příklady.'],
      ['Import a export', 'Do CSV, JSON, Excelu nebo Wordu a zpět: vytvoří chybějící události a aktualizuje ty, které už existují.'],
    ],
    tips: ['Mezi dvěma záznamy je uvedeno, kolik času uplyne; po najetí myší se zobrazí podrobně.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Abyste si neprotiřečili: nemožnosti, které se dají odhalit, kdo co ví a jak se každý prvek mění.',
    parts: [
      ['Kontroly', 'Porovnávají data a místa scén, přítomné postavy, narození a úmrtí, stavy a tajemství. Upozorní například na někoho, kdo je na dvou místech zároveň.'],
      ['Nemožné, nebo ke kontrole', 'Co nemůže být, se zobrazí jako „Nemožné“; co může být záměrné, jako „Ke kontrole“. Každé upozornění lze ignorovat.'],
      ['Kdo co ví', 'Tajemství románu, jedno na řádek, a ve které scéně se je dozví každá postava i čtenář. Řadí se podle prvního odhalení (podle data nebo pořadí čtení) a hledání najde podle názvu, obsahu, osoby nebo scény. Stiskněte řádek a uvidíte podrobnosti.'],
      ['Sledování', 'Prochází knihou v patách jednoho prvku: kde se vyskytuje a jak se mění jeho stav.'],
    ],
    tips: ['Stavy a odhalení se zapisují na kartě každé scény, v bloku „Kontinuita“.', 'Čím víc toho vyplníte (data, místa, narození), tím víc toho najde.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Měření rukopisu a toho, jak ho píšete.',
    parts: [
      ['Moje psaní', 'Slova za den, série, sezení a odhad dokončení.'],
      ['Kniha', 'Délka kapitol a scén, poměr dialogu a vyprávění a opakování.'],
      ['Styl', 'Příslovce na -mente, blízká opakování, vatová slova a dlouhé věty po kapitolách; zvýrazní, kde jich je nejvíc. Řídí se pravidly jazyka románu.'],
      ['Narativní graf', 'Jeden řádek na prvek a jeden sloupec na scénu: kdo na příliš dlouho zmizí a které dějové linie se nekříží.'],
      ['Rozložení a výskyty', 'V kolika scénách každé kapitoly se který prvek vyskytuje a seznam scén jedné postavy.'],
    ],
    tips: ['„?“ u každého sloupce vysvětluje, co měří.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Hledá (a nahrazuje) v celém projektu.',
    parts: [
      ['Kde hledá', 'Zaškrtněte oblasti: text scén, názvy, postavy, svět, architektura a poznámky, podklady a úkoly.'],
      ['Možnosti', 'Rozlišovat velká a malá písmena a hledat jen celá slova.'],
      ['Nahradit', 'Změní text ve všem zaškrtnutém, když vám předtím řekne, na kolika místech. Hodí se k přejmenování postavy.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Uloží román nebo pracovní materiály do souboru.',
    parts: [
      ['Co exportovat', 'Román, nebo dosiér (architektura, postavy, místa a další karty).'],
      ['Typy exportu', 'Rukopis k odeslání, tištěná kniha (s odhadem počtu stran a hřbetu), elektronická kniha (EPUB) nebo volný formát.'],
      ['Formáty', 'Word, EPUB, webová stránka nebo PDF a text.'],
      ['Údaje a strany knihy', 'Patitul, metadata e-knihy, obálka a úvodní a závěrečné strany se berou ze sekce „Kniha“.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Co smažete, nezmizí hned: přesune se sem.',
    parts: [
      ['Obnovit', 'Vrátí položku na původní místo i s tím, co k ní patřilo.'],
      ['Doba uchování', 'Po uplynutí počtu dní nastaveného v Nastavení (1 až 60) se natrvalo smaže.'],
    ],
    guide: 'data#trash',
  },
};
