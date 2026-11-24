// Podrobna pomoč za vsako stran (sl): kar se prikaže ob pritisku na »?«. Vsak vnos ima
// uvodni stavek, razdelke [naslov, besedilo], nasvete in poglavje vodnika po aplikaciji,
// kjer je vse podrobneje razloženo. Strani, ki jih tukaj ni, prikažejo samo kratek stavek
// (help.<razdelek> v i18n/sl.js).
export default {
  home: {
    intro: 'Kar je dobro videti ob vstopu: kje nadaljevati, kako napredujete, koliko je še ostalo in kaj je treba pregledati.',
    parts: [
      ['Kje nadaljevati', 'Zadnji prizor, ki ste ga urejali, in naslednji, ki ga je treba napisati, z neposrednim dostopom. »Nadaljuj s pisanjem« odpre prvega. V novem projektu so tukaj prvi koraki.'],
      ['Štiri številke', 'Rokopis glede na cilj števila besed, današnje pisanje glede na dnevno kvoto, niz zaporednih dni in dnevi do roka oddaje, s tempom, ki ga potrebujete, in tistim, ki ga imate.'],
      ['Tempo in stanje', 'Besede za vsakega od zadnjih 30 dni ter koliko kartic, poglavij in prizorov ni začetih, je v delu ali končanih.'],
      ['Za pregled', 'Najnovejša odprta opravila in opozorila: nemogočosti in opozorila Kontinuitete, prizori brez datuma in prizori brez zgodbene niti.'],
    ],
    tips: ['Cilje določite v »Knjiga → Cilji«. Brez njih številke kažejo samo to, kar je.', 'Če ste v »Knjiga« dodali naslovnico ali predstavitveni stavek, sta v prvem sklopu; če kliknete naslovnico, jo vidite povečano.', 'Na računalniku kliknite z desno tipko miške katero koli povezavo → »Odpri v novem oknu«: na primer kartico lika ob prizoru, ki ga pišete.', 'Na telefonu vas gumb ↩ na vrhu vrne nazaj, če zapustite prizor, da bi si nekaj ogledali.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Temelji zgodbe: kaj pripovedujete, v kakšnem svetu in po katerih nitih napreduje.',
    parts: [
      ['Premisa', 'Zamisel v enem ali dveh stavkih: kdo hoče kaj in kaj mu to preprečuje.'],
      ['Fabula, okolje in zapiski', 'Dogodki v kronološkem zaporedju, čas in kraj ter zapiski, ki zadevajo ves roman. Pritisnite posamezni sklop, da ga napišete.'],
      ['Zgodbene niti', 'Ena pripovedna nit na vrstico, razvrščene po teži: glavne, stranske in v ozadju. Razvrstitev določite v kartici vsake niti.'],
      ['Pot vsake niti', 'Vrstica ima po eno črtico za vsak prizor knjige, v bralnem zaporedju; obarvane pripadajo tej niti. Vidi se, kje se začne, kje izgine in ali pride do konca.'],
    ],
    tips: [
      'Prizore niti dodelite v kartici prizora, v sklopu »Niti in predmeti«.',
      'Opozorilo »prizori brez zgodbene niti« označuje prizore, ki morda ničesar ne premaknejo naprej.',
      '»Beri vse« prikaže arhitekturo v enem kosu, kot dokument.',
      '»Uvoz / izvoz« ob »Dodaj nit« izvozi niti v Excel, CSV, Word, besedilo ali JSON in jih znova uvozi.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Posamezni zapiski projekta: zamisli, odlomki, opomniki.',
    parts: [
      ['Oznake', 'Vsak zapisek ima lahko več oznak. Tukaj so zapiski združeni po oznakah, zapisek z dvema oznakama pa se prikaže v obeh sklopih.'],
      ['Barva', 'Osem barv, da jih ločite na prvi pogled. »Razvrsti po: Barvi« jih združi tako.'],
      ['Povezave', 'Zapisek lahko povežete z liki, kraji, predmeti, skupinami, lastnimi karticami, nitmi, poglavji in prizori. Potem se prikaže v kartici vsakega od njih.'],
      ['Urejanje', 'Znotraj vsakega sklopa jih preurejate z vlečenjem. Meni ⋯ oznake jo preimenuje ali odstrani iz vseh njenih zapiskov.'],
    ],
    tips: ['Za gradivo (povezave, načrte, članke) je primernejša Dokumentacija, za tisto, kar je treba pregledati, pa Opravila.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Gradivo romana: povezave, članki, slike, zemljevidi, načrti in dokumenti.',
    parts: [
      ['Viri', 'Vsak ima vrsto, neobvezen spletni naslov, besedilo in priložene datoteke (slike, SVG ali PDF).'],
      ['Povezave', 'Vir povežete s prizori, poglavji ali karticami in tam se tudi prikaže: tako ga imate pri roki, ko pišete ta prizor.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Kartice tistih, ki živijo zgodbo.',
    parts: [
      ['Glavni in stranski', 'Glavni liki imajo intervju po razdelkih (osebni podatki, videz, psihologija, konflikt, razvoj …), stranski pa prost opis. V kartici lahko enega spremenite v drugega.'],
      ['Zaznavanje v besedilu', 'Če like ustvarite pred pisanjem, jih prizori prepoznajo po imenu in drugih imenih ter jih sami označijo.'],
      ['Datumi in starost', 'Če je v kartici datum rojstva, vsak prizor z datumom pokaže starost lika.'],
      ['Odnosi', 'Ko ima kakšen lik narisan odnos v »Odnosi«, se tukaj prikaže zavihek, ki jih zbere vse.'],
    ],
    tips: ['»Uvoz / izvoz« izvozi seznam v Excel, CSV, Word, besedilo ali JSON in ga znova uvozi. Vsaka kartica je izvožena v celoti: podatki, besedilo, lastnosti, dogodki, prizori, v katerih nastopa, in odnosi.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Kartica glavnega lika: intervju po razdelkih, ki vam pomaga, da ga spoznate.',
    parts: [
      ['Razdelki', 'Na vsak razdelek lahko odgovarjate vprašanje za vprašanjem ali s prostim besedilom. Njegovo stanje (ni začeto, v delu, končano) pove, kaj je še ostalo.'],
      ['Lastnosti', 'Samodejno se izluščijo iz tega, kar pišete (starost, lasje, oči …), da si ne nasprotujete; dodate lahko tudi svoje.'],
      ['Vloga, druga imena in datumi', 'Vloga v zgodbi, drugi načini, kako ga kličejo (da ga besedilo prepozna), ter njegovo rojstvo in smrt.'],
      ['Odnosi', 'En par na odnos: pod sliko vsakega to, kar je drugemu (»Vodja leta« / »Poveljnik«). Če napišete samo eno, velja za oba (»Sodelavca«). Seznam je en sam, ne glede na to, ali je odnos zapisan tukaj, v kartici drugega ali narisan na zemljevidu; ko ga spremenite ali odstranite, se posodobi povsod.'],
      ['Slike, dogodki in pojavitve', 'Referenčne fotografije, dejstva z datumom za časovnico in prizori, v katerih nastopa.'],
    ],
    tips: [
      'Če se pojavlja tudi po smrti (truplo, spomin, duh), označite potrditveno polje pod datumom smrti in Kontinuiteta ne bo opozarjala.',
      'Meni ⋯ izvozi kartico ali vanjo uvozi podatke.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Prizorišča romana, od največjega do najmanjšega.',
    parts: [
      ['Seznam', 'Kartice vseh krajev, ki jih preurejate z vlečenjem.'],
      ['Drevo', 'Kateri kraj je znotraj katerega: kabina na palubi, paluba na ladji. Kar se zgodi v kraju, velja tudi za kraje, ki ga vsebujejo.'],
      ['Zemljevidi', 'Naložite načrt ali zemljevid (sliko ali SVG) in nanj z bucikami postavite svoje kraje.'],
      ['Odnosi', 'Prikaže se, ko ima kakšen kraj narisan odnos v »Odnosi«.'],
    ],
    tips: ['V drevesu meni ⋯ vsake vrstice kraj premakne v drug kraj ali mu doda kraje znotraj.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Kartica kraja.',
    parts: [
      ['Kje je', 'Država, regija in mesto ter »Znotraj«: kraj, ki ga vsebuje. »Vsebuje« navede kraje, ki so v njem.'],
      ['Opis in vprašanja', 'Prosto besedilo in lastna vprašanja, ki ste jih določili za vse kraje.'],
      ['Pojavitve', 'Prizori, ki se odvijajo tukaj ali v katerem koli kraju, ki ga vsebuje.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Kartice vrst, ki jih določite sami: ladje, tehnologije, bitja, organizacije …',
    parts: [
      ['Vrste', '»Dodaj vrsto« ustvari vrsto z imenom, ikono in polji. Vsaka vrsta je svoj zavihek.'],
      ['Kartice', 'Imajo polja svoje vrste ter poleg tega opis, slike in identifikator.'],
      ['Kot vsak drug element', 'Označite jih v prizorih (sklop »Niti in predmeti«), prikazane so na časovnici in v iskalniku ter vključene v Kontinuiteto.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Kako so povezani elementi romana: kar narišete sami in kar se izpelje samo.',
    parts: [
      ['Moji zemljevidi', 'Imate jih lahko več: družino, posadko, tabore. Vsak je svoje platno.'],
      ['Elementi in puščice', 'Na zemljevid dodate kartice (ali prosta besedila) in po dve povežete s puščico z oznako: »mati«, »sovražnik«, »dela za«.'],
      ['Samodejni', 'Deset risb, ki nastanejo same iz že zapisanega: kdo se sreča v prizoru, kdo ima kateri predmet, kdo pozna katero skrivnost, kaj povezuje dogodek, liki in kraji, liki in niti, premiki, skupine, kraji v krajih in odnosi (vsi, zapisani v karticah in na zemljevidih, ter izpeljani sorojenci, dedki in babice). Ne shranjujejo se: ob odprtju se znova izračunajo.'],
      ['Vse skupaj', 'Splošna risba z vašimi odnosi (polna črta) in samodejnimi (črtkana, vsak v svoji barvi), s potrditvenimi polji za izbiro, kateri so vidni.'],
      ['Branje risbe', 'Debelejša ko je črta, pogosteje se odnos pojavi. Z miško pojdite čez element ali ga pritisnite, da ga zaklenete, in poudarijo se njegovi odnosi z oznakami. Spodaj je seznam.'],
      ['Odnosi v karticah', 'Liki in Kraji imajo zavihek »Odnosi«, ki zbere odnose z vseh vaših zemljevidov.'],
    ],
    tips: ['»Izvozi odnose« jih izvozi v Word, besedilo, Excel, CSV ali JSON.', 'Puščica »mati«, »oče« ali »sin« med dvema likoma Kontinuiteti omogoči tudi preverjanje njunih datumov rojstva.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'Zgradba romana: deli, poglavja, prolog in epilog.',
    parts: [
      ['Seznam', 'Vsako poglavje s svojimi prizori, besedami, časom branja, stanjem, najbolj prisotnimi liki in barvnim kvadratkom za vsako nit, ki se je dotika. Zgoraj je skupno število za vso knjigo.'],
      ['Čas branja', 'Približen, pri okoli 250 besedah na minuto. Znotraj vsakega poglavja je prikazan tudi čas za vsak prizor.'],
      ['Niti', 'Z miško pojdite čez kvadratek (ali ga na zaslonu na dotik pridržite), da vidite ime niti, njeno vrsto in opis.'],
      ['Preurejanje', 'Povlecite vrstice, uporabite Alt+↑/↓ ali meni ⋯ vsake vrstice.'],
      ['Drugi pogledi', '»Tabla« prikaže prizore kot listke, da jih premikate med poglavji; »Oris« pa vse v drevesu.'],
    ],
    tips: ['»Zgradba« doda dele, prolog ali epilog, uvozi osnutek iz Worda in zazna omembe v vseh prizorih.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Poglavje: njegovi prizori in zapiski.',
    parts: [
      ['Prizori', 'Ustvarite jih, preurejate z vlečenjem in v drugo poglavje premaknete v njihovem meniju ⋯. Pod naslovom vsakega: kdaj se zgodi in koliko traja, kdo pripoveduje in barvni kvadratek za vsak kraj (z miško pojdite čeznj ali ga pridržite, da vidite, kateri je).'],
      ['Namen in zapiski', 'Čemu poglavje služi v romanu in kar si želite zapomniti pri pisanju.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Tukaj pišete. Levo je besedilo, desno kartica prizora.',
    parts: [
      ['Besedilo', 'Shrani se samo. Vrstica ponuja oblikovanje, pomišljaj za dialog in narekovaje, iskanje in zamenjavo ter označevanje opravila na izbranem besedilu.'],
      ['Kartica', 'Po zložljivih sklopih: kdo nastopa in kdo pripoveduje, kje in kdaj, dogodki, niti in predmeti, kontinuiteta, opravila, dokumentacija in različice.'],
      ['Dogodki', 'Sklop »Dogodki« pokaže dejstva, povezana s prizorom: tista, ki se v njem zgodijo (prevzamejo njegov datum), in tista, ki se v njem le pripovedujejo (spomin: obdržijo svoj datum). Strnjen pove, kateri so; razprt pri vsakem pokaže datum, opis, koga zadeva in v katerih drugih prizorih je.'],
      ['Samodejno zaznavanje', 'Kar omenite v besedilu (liki, kraji, predmeti, skupine), se samodejno označi z oznako »samod.«. Če to odstranite, se ne doda več.'],
      ['Različice', 'Verzije besedila prizora. Pred ponovnim pisanjem lahko ustvarite novo, jih primerjate in se vrnete k prejšnji.'],
      ['Orodja', 'V vrstici: razdeljeni pogled (kartica ali drug prizor ob strani), slogovni pregled, branje na glas in način brez motenj.'],
      ['Kontinuiteta', 'Tukaj zapišite, kaj spremeni stanje (»ranjen v roko«, »ključ preide k Alexu«) ter katera skrivnost se razkrije in komu.'],
    ],
    tips: ['Ctrl+S takoj shrani; Ctrl+F išče; Esc zapre način brez motenj.', 'Datum prizora ga postavi na časovnico in omogoča izračun starosti ter zaznavanje nemogočosti.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Prizori kot listki, da roman zajamete s pogledom in ga preuredite.',
    parts: [
      ['Stolpci in listki', 'Vsako poglavje je stolpec (štirje v vrsti) in vsak prizor listek s povzetkom, s tem, kdo pripoveduje, ter kje in kdaj.'],
      ['Povzetek', 'Pritisnite besedilo listka, da napišete, o čem govori prizor.'],
      ['Premikanje', 'Povlecite listek, da ga premaknete drugam ali v drugo poglavje. Na zaslonih na dotik uporabite njegov meni ⋯.'],
      ['Niti', 'Barvne črte so niti prizora; legenda zgoraj pove, katera je katera.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Vse, kar opisuje roman kot knjigo.',
    parts: [
      ['Podatki o knjigi', 'Naslov in jezik (obvezna) ter avtor, serija, številka, datum izida, založba, naslovnica in sinopsis (neobvezni). Izpišejo se na naslovni strani in v podatkih e-knjige.'],
      ['Cilji', 'Cilj števila besed, dnevna kvota, rok in besede na poglavje. Spremljate jih na začetni strani.'],
      ['Strani knjige', 'Kolofon, posvetilo, moto, zahvala in »O avtorju« s fotografijo. Dodajo se ob izvozu.'],
      ['Projekt', 'Varnostna kopija (.zip z vsemi podatki, slikami in dokumenti ter knjigo in karticami v obliki Word), ustvarjanje nadaljevanja (ohrani svet, začne brez poglavij) in brisanje projekta. Kopijo obnovite z »Uvozi kopijo« v »Vaši projekti«.'],
    ],
    tips: ['Brez avtorja se knjiga izvozi kot »Anonimno«.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Kar je treba še pregledati, na enem mestu.',
    parts: [
      ['Od kod prihajajo', 'Iz oznake na besedilu prizora ali pa so samostojna, vezana na kartico ali na projekt.'],
      ['Vrste in stanje', 'Vsako opravilo ima vrsto (nedoslednost, preverjanje, pregled, zamisel) in ga označite kot razrešeno, ko je.'],
      ['Na mesto', 'Iz opravila, označenega na besedilu, skočite naravnost na točen stavek v prizoru.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Dogodki po vrsti: prizori z datumom in dogodki sveta.',
    parts: [
      ['Kaj se prikaže', 'Prizor se prikaže, ko mu v kartici določite datum. Dogodek ustvarite tukaj ali v kartici elementa; lahko je splošen ali pripada enemu ali več elementom.'],
      ['Dogodki in prizori', 'Dogodek povežete s prizori, v katerih se zgodi (prevzame njihov datum in je prikazan znotraj njih), ali s tistimi, v katerih se le pripoveduje (obdrži svoj datum). Če se samostojen dogodek po datumu in uri ujema s prizorom, opozorilo predlaga, da ju povežete.'],
      ['Dva vrstna reda', '»Kronološki« razvrsti po datumu; »Bralni« kot v knjigi, da vidite, kje pripoved skoči nazaj.'],
      ['Začetek in konec knjige', 'Dve oznaki kažeta prvi in zadnji prizor, ki ju prebere bralec: kar je pred tem, je preteklost pred romanom.'],
      ['Sledi in filtri', '»Sledi« omeji časovnico na en sam element; potrditvena polja skrijejo vrste vnosov.'],
      ['Iskalnik', 'Po besedilu, datumu ali identifikatorju. »a & b« zahteva oboje, »a | b« eno od obojega. »?« ob njem ponudi primere.'],
      ['Uvoz in izvoz', 'V CSV, JSON, Excel ali Word in nazaj: ustvari manjkajoče dogodke in posodobi obstoječe.'],
    ],
    tips: ['Med dvema vnosoma je naveden čas, ki mine; ko greste čezenj z miško, se prikaže razčlenjen.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Da si ne nasprotujete: nemogočosti, ki jih je mogoče zaznati, kdo kaj ve in kako se spreminja vsak element.',
    parts: [
      ['Preverjanja', 'Primerja datume in kraje prizorov, prisotne like, rojstva in smrti, stanja in skrivnosti. Opozori na primer na nekoga, ki je hkrati na dveh mestih.'],
      ['Nemogoče ali za pregled', 'Kar ne more biti res, je označeno kot »Nemogoče«; kar je morda namerno, kot »Za pregled«. Vsako opozorilo lahko prezrete.'],
      ['Kdo ve kaj', 'Skrivnosti romana, ena na vrstico, in v katerem prizoru jo izve vsak lik in bralec. Razvrščene so po prvem razkritju (po datumu ali v bralnem zaporedju), iskalnik pa najde po naslovu, vsebini, osebi ali prizoru. Pritisnite vrstico, da vidite podrobnosti.'],
      ['Sledenje', 'Gre skozi knjigo za enim elementom: kje se pojavi in kako se mu spreminja stanje.'],
    ],
    tips: ['Stanja in razkritja se zapisujejo v kartici vsakega prizora, v sklopu »Kontinuiteta«.', 'Bolj ko izpolnite (datume, kraje, rojstva), več najde.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Meritve rokopisa in vašega načina pisanja.',
    parts: [
      ['Moje pisanje', 'Besede na dan, nizi, seje in napoved konca.'],
      ['Knjiga', 'Dolžina poglavij in prizorov, razmerje med dialogom in pripovedjo ter ponovitve.'],
      ['Slog', 'Prislovi na -mente, bližnje ponovitve, mašila in dolge povedi po poglavjih; poudari, kje jih je največ. Upošteva pravila jezika romana.'],
      ['Pripovedni graf', 'Ena vrstica na element in en stolpec na prizor: kdo predolgo izgine in katere niti se ne križajo.'],
      ['Porazdelitev in pojavitve', 'V koliko prizorih vsakega poglavja se pojavi posamezni element in seznam prizorov posameznega lika.'],
    ],
    tips: ['»?« ob vsakem stolpcu razloži, kaj meri.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Iskanje (in zamenjava) v vsem projektu.',
    parts: [
      ['Kje išče', 'Označite področja: besedilo prizorov, naslove, like, svet, arhitekturo in zapiske, dokumentacijo in opravila.'],
      ['Možnosti', 'Razlikovanje velikih in malih črk ter iskanje samo celih besed.'],
      ['Zamenjava', 'Spremeni besedilo v vsem označenem, potem ko vam pove, na koliko mestih. Uporabno za preimenovanje lika.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Izvoz romana ali delovnega gradiva v datoteko.',
    parts: [
      ['Kaj izvoziti', 'Roman ali dosje (arhitektura, liki, kraji in druge kartice).'],
      ['Vrste izvoza', 'Rokopis za pošiljanje, tiskana knjiga (z oceno števila strani in hrbta), e-knjiga (EPUB) ali prosta oblika.'],
      ['Oblike', 'Word, EPUB, spletna stran ali PDF in besedilo.'],
      ['Podatki in strani knjige', 'Naslovna stran, podatki e-knjige, naslovnica ter uvodne in sklepne strani pridejo iz razdelka »Knjiga«.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Izbrisano se ne izgubi takoj: najprej pride sem.',
    parts: [
      ['Obnovitev', 'Vrne element na njegovo mesto, skupaj s tem, kar je viselo na njem.'],
      ['Rok hrambe', 'Ko mine število dni, ki ga določite v Nastavitvah (od 1 do 60), se dokončno izbriše.'],
    ],
    guide: 'data#trash',
  },
};
