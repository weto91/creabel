// Detaljna pomoć za svaku stranicu (sr-Latn): ono što se vidi kad pritisnete „?“. Svaki unos ima
// uvodnu rečenicu, odeljke [naslov, tekst], savete i poglavlje vodiča kroz aplikaciju u kome se
// to detaljnije objašnjava. Stranice kojih ovde nema prikazuju samo svoju kratku rečenicu
// (help.<odeljak> u i18n/sr-Latn.js).
export default {
  home: {
    intro: 'Ono što vredi videti čim uđete: gde da nastavite, kako napredujete, koliko je ostalo i šta treba proveriti.',
    parts: [
      ['Gde da nastavite', 'Poslednja scena na kojoj ste radili i sledeća koju treba napisati, s direktnim pristupom. „Nastavi pisanje“ otvara prvu. U novom projektu ovde su prvi koraci.'],
      ['Četiri broja', 'Rukopis u odnosu na cilj u broju reči, ono što ste danas napisali u odnosu na dnevnu normu, niz uzastopnih dana pisanja i broj dana do roka, sa tempom koji vam je potreban i onim koji imate.'],
      ['Ritam i stanje', 'Reči za svaki od poslednjih 30 dana i koliko je kartona, poglavlja i scena nezapočeto, u toku ili završeno.'],
      ['Za proveru', 'Najnoviji otvoreni zadaci i upozorenja: nemogućnosti i upozorenja iz Kontinuiteta, scene bez datuma i scene bez ijednog zapleta.'],
    ],
    tips: ['Ciljevi se postavljaju u „Knjiga → Ciljevi“. Bez njih brojevi pokazuju samo ono što postoji.', 'Ako ste u odeljku „Knjiga“ dodali koricu ili rečenicu koja predstavlja roman, one stoje u prvom bloku; kliknite na koricu da je vidite u velikom formatu.', 'Na računaru kliknite desnim tasterom miša na bilo koju vezu → „Otvori u novom prozoru“: na primer karton lika pored scene koju pišete.', 'Na telefonu, ako napustite scenu da biste nešto proverili, dugme ↩ na vrhu vraća vas na nju.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Temelji priče: šta pričate, u kakvom svetu i kroz koje niti radnja napreduje.',
    parts: [
      ['Premisa', 'Ideja u jednoj ili dve rečenice: ko šta želi i šta ga u tome sprečava.'],
      ['Fabula, ambijent i beleške', 'Događaji hronološkim redom, epoha i mesto, i zabeleške koje se tiču celog romana. Pritisnite svaki blok da biste ga napisali.'],
      ['Zapleti', 'Jedna narativna nit po redu, grupisane po težini: glavni zapleti, podzapleti i pozadinski zapleti. Klasifikacija se postavlja u kartonu svakog zapleta.'],
      ['Tok svakog zapleta', 'Traka ima po jednu crticu za svaku scenu knjige, redom čitanja; obojene su scene tog zapleta. Vidi se gde počinje, gde nestaje i da li stiže do kraja.'],
    ],
    tips: [
      'Scene se dodeljuju zapletu u kartonu scene, u bloku „Zapleti i predmeti“.',
      'Upozorenje „scene bez ijednog zapleta“ ukazuje na scene koje možda ništa ne pomeraju napred.',
      '„Pročitaj sve“ prikazuje arhitekturu u jednom dahu, kao dokument.',
      '„Uvoz / izvoz“, pored dugmeta „Dodaj zaplet“, izvozi zaplete u Excel, CSV, Word, tekst ili JSON i ponovo ih uvozi.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Slobodne zabeleške o projektu: ideje, odlomci, podsetnici.',
    parts: [
      ['Oznake', 'Svaka beleška može imati više oznaka. Ovde su grupisane po oznaci, a beleška s dve oznake pojavljuje se u oba bloka.'],
      ['Boja', 'Osam boja da biste ih razlikovali na prvi pogled. „Razvrstaj po: Boja“ grupiše ih na taj način.'],
      ['Veze', 'Beleška može da se poveže sa likovima, mestima, predmetima, grupama, sopstvenim kartonima, zapletima, poglavljima i scenama. Tada se pojavljuje u kartonu svakog od njih.'],
      ['Redosled i održavanje', 'Unutar svakog bloka redosled se menja prevlačenjem. Meni ⋯ oznake preimenuje je ili je uklanja iz svih njenih beležaka.'],
    ],
    tips: ['Za materijal koji konsultujete (linkovi, planovi, članci) bolja je Građa; za ono što treba proveriti, Zadaci.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Materijal koji konsultujete za roman: linkovi, članci, slike, mape, planovi i dokumenti.',
    parts: [
      ['Reference', 'Svaka ima vrstu, neobaveznu veb-adresu, tekst i priložene datoteke (slike, SVG ili PDF).'],
      ['Veze', 'Referenca se povezuje sa scenama, poglavljima ili kartonima i pojavljuje se u njima: tako vam je pri ruci dok pišete tu scenu.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Kartoni onih koji žive u priči.',
    parts: [
      ['Glavni i sporedni', 'Glavni likovi imaju intervju po odeljcima (lični podaci, izgled, psihologija, sukob, razvoj…); sporedni, slobodan opis. Lik se iz jedne vrste u drugu pretvara iz njegovog kartona.'],
      ['Prepoznavanje u tekstu', 'Ako napravite likove pre pisanja, scene ih prepoznaju po imenu i drugim nazivima i same ih označavaju.'],
      ['Datumi i godine', 'Kad je u kartonu upisan datum rođenja, svaka scena s datumom pokazuje koliko lik ima godina.'],
      ['Odnosi', 'Kad neki lik ima odnos nacrtan u „Odnosi“, ovde se pojavljuje jezičak koji ih okuplja sve.'],
    ],
    tips: ['„Uvoz / izvoz“ izvozi listu u Excel, CSV, Word, tekst ili JSON i ponovo je uvozi. Svaki karton ide ceo: podaci, tekst, osobine, događaji, scene u kojima se pojavljuje i odnosi.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Karton glavnog lika: intervju po odeljcima koji vam pomaže da ga upoznate.',
    parts: [
      ['Odeljci', 'Na svaki odeljak može se odgovarati pitanje po pitanje ili slobodnim tekstom. Njegov status (nezapočeto, u toku, završeno) govori vam šta je preostalo.'],
      ['Osobine', 'Same se izdvajaju iz onoga što pišete (godine, kosa, oči…) da ne biste sami sebi protivrečili; možete dodati i svoje.'],
      ['Uloga, drugi nazivi i datumi', 'Uloga u priči, drugi načini na koje se lik naziva (da bi ga tekst prepoznao) i njegovo rođenje i smrt.'],
      ['Odnosi', 'Jedan par po odnosu: ispod fotografije svakog od njih, ono što je on drugome („Direktor leta“ / „Komandant“). Ako upišete samo jedno, važi za oba („Kolege“). To je jedna jedina lista, bez obzira na to da li je odnos zabeležen ovde, u kartonu drugog lika ili nacrtan na mapi; kad ga promenite ili uklonite, ažurira se na svim tim mestima.'],
      ['Slike, događaji i pojavljivanja', 'Referentne fotografije, činjenice s datumom za vremensku liniju i scene u kojima se pojavljuje.'],
    ],
    tips: [
      'Ako se pojavljuje i posle smrti (telo, sećanje, utvara), označite polje ispod datuma smrti i Kontinuitet neće upozoravati.',
      'Meni ⋯ izvozi karton ili u njega uvozi podatke.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Prostori romana, od najvećeg do najmanjeg.',
    parts: [
      ['Lista', 'Kartoni svih mesta, kojima se redosled menja prevlačenjem.'],
      ['Stablo', 'Koje je mesto unutar kog: sala na palubi, paluba na brodu. Ono što se dešava na nekom mestu važi i za mesta koja ga sadrže.'],
      ['Mape', 'Otpremite plan ili mapu (sliku ili SVG) i na nju čiodama postavite svoja mesta.'],
      ['Odnosi', 'Pojavljuje se kad neko mesto ima odnos nacrtan u „Odnosi“.'],
    ],
    tips: ['U stablu, meni ⋯ u svakom redu premešta mesto unutar drugog mesta ili u njega dodaje nova.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Karton mesta.',
    parts: [
      ['Gde se nalazi', 'Zemlja, region i grad, i „Unutar“: mesto koje ga sadrži. „Sadrži“ navodi mesta koja su u njemu.'],
      ['Opis i pitanja', 'Slobodan tekst i sopstvena pitanja koja ste definisali za sva mesta.'],
      ['Pojavljivanja', 'Scene koje se dešavaju ovde ili na bilo kom mestu koje ono sadrži.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Kartoni vrsta koje sami definišete: brodovi, tehnologije, stvorenja, organizacije…',
    parts: [
      ['Vrste', '„Dodaj vrstu“ pravi novu vrstu s nazivom, ikonom i poljima. Svaka vrsta je jedan jezičak.'],
      ['Kartoni', 'Imaju polja svoje vrste, a pored toga opis, slike i identifikator.'],
      ['Kao i svaki drugi element', 'Označavaju se u scenama (blok „Zapleti i predmeti“), pojavljuju se na vremenskoj liniji i u pretrazi i ulaze u Kontinuitet.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Kako su povezani elementi romana: ono što sami nacrtate i ono što se samo izvodi.',
    parts: [
      ['Moje mape', 'Možete ih imati više: porodica, posada, tabori. Svaka je jedno platno.'],
      ['Elementi i strelice', 'Na mapu dodajete kartone (ili slobodan tekst) i spajate po dva strelicom s oznakom: „majka“, „neprijatelj“, „radi za“.'],
      ['Automatski', 'Deset crteža koji nastaju sami iz onoga što je već zabeleženo: ko se sreće u sceni, ko ima koji predmet, ko zna koju tajnu, šta povezuje događaj, likovi i mesta, likovi i zapleti, kretanja, grupe, mesta unutar mesta i odnosi (svi zabeleženi u kartonima i na mapama, plus braća, sestre, dede i bake koji se iz njih izvode). Ne čuvaju se: ponovo se izračunavaju pri otvaranju.'],
      ['Sve zajedno', 'Opšti crtež s vašim odnosima (puna linija) i automatskim (isprekidana, svaki u svojoj boji), s poljima za izbor onoga što se vidi.'],
      ['Kako čitati crtež', 'Što je linija deblja, to se odnos češće javlja. Pređite mišem preko elementa ili ga pritisnite da ga fiksirate, i njegovi odnosi će se istaći zajedno sa oznakama. Ispod je lista.'],
      ['Odnosi u kartonima', 'Likovi i Mesta imaju jezičak „Odnosi“ koji okuplja odnose sa svih vaših mapa.'],
    ],
    tips: ['„Izvezi odnose“ izvozi ih u Word, tekst, Excel, CSV ili JSON.', 'Strelica „majka“, „otac“ ili „sin“ između dva lika služi i Kontinuitetu da proveri njihove datume rođenja.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'Struktura romana: delovi, poglavlja, prolog i epilog.',
    parts: [
      ['Lista', 'Svako poglavlje sa svojim scenama, brojem reči, vremenom čitanja, statusom, likovima koji se najviše pojavljuju i po jednim obojenim kvadratićem za svaki zaplet koji dotiče. Gore je zbir za celu knjigu.'],
      ['Vreme čitanja', 'Približno, oko 250 reči u minuti. Unutar svakog poglavlja prikazuje se i vreme za svaku scenu.'],
      ['Zapleti', 'Pređite mišem preko kvadratića (ili ga zadržite pritisnutim na ekranu osetljivom na dodir) da biste videli naziv zapleta, njegovu vrstu i opis.'],
      ['Promena redosleda', 'Prevucite redove, koristite Alt+↑/↓ ili meni ⋯ svakog reda.'],
      ['Drugi prikazi', '„Tabla“ prikazuje scene kao kartice, da biste ih premeštali između poglavlja; „Skica“ prikazuje sve u obliku stabla.'],
    ],
    tips: ['„Struktura“ dodaje delove, prolog ili epilog, uvozi nacrt iz Worda i prepoznaje pominjanja u svim scenama.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Poglavlje: njegove scene i beleške.',
    parts: [
      ['Scene', 'Prave se ovde, redosled im se menja prevlačenjem, a iz njihovog menija ⋯ premeštaju se u drugo poglavlje. Ispod naslova svake scene: kada se dešava i koliko traje, ko pripoveda i po jedan obojeni kvadratić za svako mesto (pređite mišem ili zadržite pritisak da vidite koje je).'],
      ['Svrha i beleške', 'Čemu poglavlje služi u romanu i ono što želite da zapamtite dok ga pišete.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Ovde se piše. Levo je tekst, desno karton scene.',
    parts: [
      ['Tekst', 'Čuva se sam. Traka nudi oblikovanje, crtu za dijalog i navodnike, pronalaženje i zamenu i označavanje zadatka na izabranom tekstu.'],
      ['Karton', 'U blokovima koji se sklapaju: ko se pojavljuje i ko pripoveda, gde i kada, događaji, zapleti i predmeti, kontinuitet, zadaci, građa i revizije.'],
      ['Događaji', 'Blok „Događaji“ prikazuje činjenice koje imaju veze sa scenom: one koje se u njoj dešavaju (preuzimaju njen datum) i one o kojima se u njoj pripoveda (sećanje: zadržavaju svoj). Kad je sklopljen, kaže koje su; kad je otvoren, za svaku navodi datum, opis, na koga se odnosi i u kojim je još scenama.'],
      ['Automatsko prepoznavanje', 'Ono što imenujete u tekstu (likovi, mesta, predmeti, grupe) samo se označava, uz reč „auto“. Ako to uklonite, neće se ponovo dodati.'],
      ['Revizije', 'Verzije teksta scene. Pre prepravljanja možete napraviti novu, uporediti ih i vratiti se na neku od ranijih.'],
      ['Alatke', 'Na traci: podeljeni prikaz (karton ili druga scena pored teksta), provera stila, čitanje naglas i režim bez ometanja.'],
      ['Kontinuitet', 'Ovde zabeležite šta menja stanje („ranjen u ruku“, „ključ prelazi kod Aleksa“) i koja se tajna otkriva, i kome.'],
    ],
    tips: ['Ctrl+S odmah čuva; Ctrl+F pretražuje; Esc izlazi iz režima bez ometanja.', 'Datum scene smešta je na vremensku liniju i omogućava da se izračunaju godine i otkriju nemogućnosti.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Scene kao kartice, da biste roman sagledali na prvi pogled i preuredili ga.',
    parts: [
      ['Kolone i kartice', 'Svako poglavlje je kolona (četiri u redu), a svaka scena kartica sa sažetkom, onim ko pripoveda, mestom i vremenom.'],
      ['Sažetak', 'Pritisnite tekst kartice da biste napisali o čemu je scena.'],
      ['Premeštanje', 'Prevucite karticu da biste joj promenili mesto ili poglavlje. Na ekranima osetljivim na dodir koristite njen meni ⋯.'],
      ['Zapleti', 'Obojene crtice su zapleti scene; legenda gore kaže koji je koji.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Sve što opisuje roman kao knjigu.',
    parts: [
      ['Podaci o knjizi', 'Naslov i jezik (obavezni) i autor, serijal, broj, datum objavljivanja, izdavač, korica i sinopsis (neobavezni). Pojavljuju se na naslovnoj strani i u podacima e-knjige.'],
      ['Ciljevi', 'Cilj u broju reči, dnevna norma, rok i broj reči po poglavlju. Prate se na početnoj stranici.'],
      ['Stranice knjige', 'Impresum, posveta, moto, zahvalnice i „O autoru“ s fotografijom. Dodaju se pri izvozu.'],
      ['Projekat', 'Rezervna kopija (.zip sa svim podacima, slikama i dokumentima, kao i knjigom i kartonima u Wordu), pravljenje nastavka (zadržava svet priče, počinje bez poglavlja) i brisanje projekta. Kopija se vraća preko „Uvezi kopiju“ u odeljku „Vaši projekti“.'],
    ],
    tips: ['Bez autora, knjiga se izvozi kao delo autora „Anonim“.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Ono što treba proveriti, na jednom mestu.',
    parts: [
      ['Odakle dolaze', 'Iz oznake na tekstu scene, ili samostalni, vezani za karton ili za projekat.'],
      ['Vrste i status', 'Svaki zadatak ima vrstu (pregledati, proveriti, istražiti…) i označava se kao rešen kad je rešen.'],
      ['Odlazak na mesto', 'Iz zadatka označenog na tekstu skače se tačno na rečenicu u sceni.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Događaji po redu: scene s datumom i događaji iz sveta priče.',
    parts: [
      ['Šta se pojavljuje', 'Scena se pojavljuje kad joj u kartonu dodelite datum. Događaj se pravi ovde ili u kartonu nekog elementa i može biti opšti ili pripadati jednom ili većem broju elemenata.'],
      ['Događaji i scene', 'Događaj se povezuje sa scenama u kojima se dešava (preuzima njihov datum i prikazuje se unutar njih) ili sa onima u kojima se o njemu samo pripoveda (zadržava svoj). Ako se samostalan događaj po datumu i vremenu poklapa sa nekom scenom, upozorenje predlaže da ih povežete.'],
      ['Dva redosleda', '„Hronološki“ ređa po datumu; „Redom čitanja“, kao u knjizi, da se vidi gde priča skače unazad.'],
      ['Gde knjiga počinje i gde se završava', 'Dve oznake pokazuju prvu i poslednju scenu koju čitalac čita: ono što je pre toga, prošlost je koja prethodi romanu.'],
      ['Praćenje i filteri', '„Prati“ ostavlja na liniji samo jedan element; polja za potvrdu skrivaju vrste unosa.'],
      ['Pretraga', 'Po tekstu, datumu ili identifikatoru. „a & b“ traži oba uslova; „a | b“, jedan od njih. „?“ pored polja daje primere.'],
      ['Uvoz i izvoz', 'U CSV, JSON, Excel ili Word, i nazad: pravi događaje koji nedostaju i ažurira one koji već postoje.'],
    ],
    tips: ['Između dva unosa navedeno je vreme koje protekne; kad pređete mišem, prikazuje se raščlanjeno.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Da ne biste sami sebi protivrečili: nemogućnosti koje se mogu otkriti, ko šta zna i kako se svaki element menja.',
    parts: [
      ['Provere', 'Ukršta datume i mesta scena, prisutne likove, rođenja i smrti, stanja i tajne. Upozorava, na primer, da je neko na dva mesta u isto vreme.'],
      ['Nemoguće ili za proveru', 'Ono što ne može biti prikazuje se kao „Nemoguće“; ono što može biti namerno, kao „Za proveru“. Svako upozorenje može se zanemariti.'],
      ['Ko šta zna', 'Tajne romana, po jedna u redu, i u kojoj sceni ih saznaje svaki lik i čitalac. Ređaju se po prvom otkriću (po datumu ili redom čitanja), a pretraga ih pronalazi po naslovu, sadržaju, osobi ili sceni. Pritisnite red da vidite detalje.'],
      ['Praćenje', 'Prolazi kroz knjigu prateći jedan element: gde se pojavljuje i kako mu se menja stanje.'],
    ],
    tips: ['Stanja i otkrića beleže se u kartonu svake scene, u bloku „Kontinuitet“.', 'Što više popunite (datume, mesta, rođenja), to više pronalazi.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Merenja rukopisa i vašeg načina pisanja.',
    parts: [
      ['Moje pisanje', 'Reči po danu, nizovi, sesije i procena završetka.'],
      ['Knjiga', 'Dužina poglavlja i scena, odnos dijaloga i pripovedanja, i ponavljanja.'],
      ['Stil', 'Prilozi na -mente, bliska ponavljanja, poštapalice i duge rečenice, po poglavljima; ističe gde ih ima najviše. Prati pravila jezika romana.'],
      ['Narativni grafikon', 'Jedan red po elementu i jedna kolona po sceni: ko predugo nestaje i koji se zapleti ne ukrštaju.'],
      ['Raspodela i pojavljivanja', 'U koliko se scena svakog poglavlja pojavljuje svaki element, i lista scena jednog lika.'],
    ],
    tips: ['„?“ pored svake kolone objašnjava šta meri.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Pretraga (i zamena) u celom projektu.',
    parts: [
      ['Gde traži', 'Označite oblasti: tekst scena, naslove, likove, svet priče, arhitekturu i beleške, građu i zadatke.'],
      ['Opcije', 'Razlikovanje velikih i malih slova i pretraga samo celih reči.'],
      ['Zamena', 'Menja tekst u svemu što je označeno, pošto vam kaže na koliko mesta. Korisno da biste preimenovali lik.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Izvezite roman ili radni materijal u datoteku.',
    parts: [
      ['Šta izvoziti', 'Roman ili dosije (arhitektura, likovi, mesta i ostali kartoni).'],
      ['Vrste izvoza', 'Rukopis za slanje, štampana knjiga (s procenom broja stranica i hrbata), elektronska knjiga (EPUB) ili slobodan format.'],
      ['Formati', 'Word, EPUB, veb-stranica ili PDF, i tekst.'],
      ['Podaci i stranice knjige', 'Naslovna strana, podaci e-knjige, korica i uvodne i završne stranice dolaze iz odeljka „Knjiga“.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Ono što obrišete ne nestaje odmah: dolazi ovde.',
    parts: [
      ['Vraćanje', 'Vraća element na njegovo mesto, zajedno sa onim što je od njega zavisilo.'],
      ['Rok trajanja', 'Kad prođe broj dana koji odredite u Podešavanjima (od 1 do 60), trajno se briše.'],
    ],
    guide: 'data#trash',
  },
};
