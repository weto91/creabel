// Szczegółowa pomoc do każdej strony (pl): to, co widać po naciśnięciu „?”. Każdy wpis ma
// zdanie wprowadzające, części [tytuł, tekst], wskazówki i rozdział przewodnika po aplikacji,
// w którym temat jest omówiony dokładniej. Strony, których tu nie ma, pokazują tylko krótkie
// zdanie (help.<sekcja> w i18n/pl.js).
export default {
  home: {
    intro: 'To, co warto zobaczyć na wejściu: gdzie kontynuować, jak ci idzie, ile zostało i co trzeba przejrzeć.',
    parts: [
      ['Gdzie kontynuować', 'Ostatnio edytowana scena i następna do napisania, z bezpośrednim dostępem. „Pisz dalej” otwiera pierwszą z nich. W nowym projekcie są tu pierwsze kroki.'],
      ['Cztery liczby', 'Rękopis w porównaniu z docelową liczbą słów, to, co napisane dzisiaj, w porównaniu z dziennym limitem, seria kolejnych dni pisania i dni pozostałe do terminu, z tempem, którego potrzebujesz, i tym, które utrzymujesz.'],
      ['Tempo i stan', 'Słowa z każdego z ostatnich 30 dni oraz liczba kart, rozdziałów i scen do zrobienia, w toku i ukończonych.'],
      ['Do przejrzenia', 'Najnowsze otwarte zadania i ostrzeżenia: sprzeczności i ostrzeżenia z Ciągłości, sceny bez daty i sceny bez żadnego wątku.'],
    ],
    tips: ['Cele ustala się w „Książka → Cele”. Bez nich liczby pokazują tylko to, co jest.', 'Jeśli w sekcji „Książka” ustawisz okładkę lub zdanie zachęty, znajdą się w pierwszym bloku; kliknij okładkę, aby zobaczyć ją w powiększeniu.', 'Na komputerze kliknij dowolny odnośnik prawym przyciskiem → „Otwórz w nowym oknie”: na przykład kartę postaci obok sceny, którą piszesz.', 'W telefonie, jeśli wyjdziesz ze sceny, żeby coś sprawdzić, przycisk ↩ u góry przeniesie cię z powrotem.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Fundamenty historii: co opowiadasz, w jakim świecie i jakimi wątkami toczy się akcja.',
    parts: [
      ['Premisa', 'Idea w jednym lub dwóch zdaniach: kto czego chce i co mu w tym przeszkadza.'],
      ['Fabuła, tło i notatki', 'Wydarzenia w porządku chronologicznym, epoka i miejsce oraz zapiski dotyczące całej powieści. Naciśnij blok, żeby go napisać.'],
      ['Wątki', 'Jedna nić narracyjna na wiersz, pogrupowane według wagi: główne, poboczne i w tle. Klasyfikację ustawia się w karcie każdego wątku.'],
      ['Przebieg każdego wątku', 'Pasek ma po jednej kresce na każdą scenę książki, w kolejności lektury; kolorowe to sceny tego wątku. Widać, gdzie się zaczyna, gdzie znika i czy dociera do końca.'],
    ],
    tips: [
      'Sceny przypisuje się do wątku w karcie sceny, w bloku „Wątki i przedmioty”.',
      'Ostrzeżenie „sceny bez żadnego wątku” wskazuje sceny, które być może niczego nie posuwają naprzód.',
      '„Czytaj całość” pokazuje architekturę jednym ciągiem, jak dokument.',
      '„Import / eksport”, obok „Dodaj wątek”, zapisuje wątki do Excela, CSV, Worda, tekstu lub JSON i wczytuje je z powrotem.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Luźne zapiski do projektu: pomysły, fragmenty, przypomnienia.',
    parts: [
      ['Etykiety', 'Każda notatka może mieć kilka. Tutaj są pogrupowane według etykiety, a notatka z dwiema etykietami pojawia się w obu blokach.'],
      ['Kolor', 'Osiem kolorów, by odróżnić notatki jednym spojrzeniem. „Sortuj według: Koloru” grupuje je w ten sposób.'],
      ['Powiązania', 'Notatkę można powiązać z postaciami, miejscami, przedmiotami, grupami, własnymi kartami, wątkami, rozdziałami i scenami. Pojawia się wtedy w karcie każdego z nich.'],
      ['Porządkowanie', 'W obrębie bloku kolejność zmienia się przeciąganiem. Menu ⋯ etykiety pozwala zmienić jej nazwę lub usunąć ją ze wszystkich notatek.'],
    ],
    tips: ['Na materiały źródłowe (linki, plany, artykuły) lepsza jest Dokumentacja; na to, co trzeba sprawdzić — Zadania.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Materiały źródłowe powieści: linki, artykuły, obrazy, mapy, plany i dokumenty.',
    parts: [
      ['Materiały', 'Każdy ma rodzaj, opcjonalny adres internetowy, tekst i załączone pliki (obrazy, SVG lub PDF).'],
      ['Powiązania', 'Materiał wiąże się ze scenami, rozdziałami lub kartami i pojawia się w nich: dzięki temu masz go pod ręką, gdy piszesz daną scenę.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Karty tych, którzy przeżywają historię.',
    parts: [
      ['Główne i drugoplanowe', 'Postacie główne mają wywiad podzielony na sekcje (dane osobowe, wygląd, psychologia, konflikt, przemiana…); drugoplanowe — dowolny opis. W karcie postaci można zmienić jeden rodzaj na drugi.'],
      ['Wykrywanie w tekście', 'Jeśli utworzysz postacie przed pisaniem, sceny rozpoznają je po imieniu i innych nazwach i same je oznaczają.'],
      ['Daty i wiek', 'Gdy w karcie jest data urodzenia, każda scena z datą pokazuje wiek postaci.'],
      ['Relacje', 'Gdy któraś postać ma relację narysowaną w sekcji „Relacje”, pojawia się tu zakładka, która zbiera je wszystkie.'],
    ],
    tips: ['„Import / eksport” zapisuje listę do Excela, CSV, Worda, tekstu lub JSON i wczytuje ją z powrotem. Każda karta trafia do pliku w całości: dane, tekst, cechy, wydarzenia, sceny, w których postać występuje, i relacje.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Karta postaci głównej: wywiad podzielony na sekcje, który pomaga ją poznać.',
    parts: [
      ['Sekcje', 'Na każdą sekcję można odpowiadać pytanie po pytaniu albo wolnym tekstem. Jej stan (do zrobienia, w toku, ukończone) mówi, co zostało.'],
      ['Cechy', 'Wydobywane są same z tego, co piszesz (wiek, włosy, oczy…), żeby nie popaść w sprzeczność; możesz dodać własne.'],
      ['Rola, inne nazwy i daty', 'Rola w historii, inne sposoby nazywania postaci (żeby tekst ją rozpoznawał) oraz data urodzenia i śmierci.'],
      ['Relacje', 'Jedna para na relację: pod zdjęciem każdej postaci wpisuje się, kim jest dla drugiej („Kierownik lotu” / „Dowódca”). Jeśli wpiszesz tylko jedno, dotyczy obu („Współpracownicy”). To jedna wspólna lista, niezależnie od tego, czy relację zapisano tutaj, w karcie drugiej postaci, czy narysowano na mapie; po zmianie lub usunięciu aktualizuje się we wszystkich tych miejscach.'],
      ['Obrazy, wydarzenia i wystąpienia', 'Zdjęcia poglądowe, fakty z datą dla osi czasu i sceny, w których postać się pojawia.'],
    ],
    tips: [
      'Jeśli postać pojawia się dalej po śmierci (ciało, wspomnienie, duch), zaznacz pole pod datą śmierci, a Ciągłość nie będzie ostrzegać.',
      'Menu ⋯ eksportuje kartę albo importuje do niej dane.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Scenerie powieści, od największej do najmniejszej.',
    parts: [
      ['Lista', 'Karty wszystkich miejsc; ich kolejność zmienia się przeciąganiem.'],
      ['Drzewo', 'Które miejsce leży w którym: sala na pokładzie, pokład na statku. To, co dzieje się w danym miejscu, liczy się też dla miejsc, które je zawierają.'],
      ['Mapy', 'Przesyłasz plan lub mapę (obraz lub SVG) i umieszczasz na nich swoje miejsca za pomocą pinezek.'],
      ['Relacje', 'Pojawia się, gdy któreś miejsce ma relację narysowaną w sekcji „Relacje”.'],
    ],
    tips: ['W drzewie menu ⋯ każdego wiersza przenosi miejsce do innego albo dodaje w nim kolejne miejsca.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Karta miejsca.',
    parts: [
      ['Gdzie leży', 'Kraj, region i miasto oraz „Wewnątrz”: miejsce, które je zawiera. „Zawiera” wymienia miejsca, które się w nim znajdują.'],
      ['Opis i pytania', 'Wolny tekst i własne pytania zdefiniowane dla wszystkich miejsc.'],
      ['Wystąpienia', 'Sceny, które rozgrywają się tutaj lub w którymkolwiek z zawartych w nim miejsc.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Karty rodzajów, które definiujesz: statki, technologie, stworzenia, organizacje…',
    parts: [
      ['Rodzaje', '„Dodaj rodzaj” tworzy nowy rodzaj z nazwą, ikoną i polami. Każdy rodzaj to osobna zakładka.'],
      ['Karty', 'Mają pola swojego rodzaju, a ponadto opis, obrazy i identyfikator.'],
      ['Jak każdy inny element', 'Oznacza się je w scenach (blok „Wątki i przedmioty”), pojawiają się na osi czasu i w wyszukiwarce i są uwzględniane w Ciągłości.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Jak łączą się elementy powieści: to, co rysujesz, i to, co wynika samo.',
    parts: [
      ['Moje mapy', 'Możesz mieć kilka: rodzinę, załogę, stronnictwa. Każda to osobny obszar roboczy.'],
      ['Elementy i strzałki', 'Na mapie dodajesz karty (lub luźne teksty) i łączysz dwie z nich opisaną strzałką: „matka”, „wróg”, „pracuje dla”.'],
      ['Automatyczne', 'Dziesięć rysunków, które powstają same z tego, co już zapisano: kto spotyka się w scenach, kto ma który przedmiot, kto zna który sekret, co łączy wydarzenie, postacie i miejsca, postacie i wątki, przemieszczenia, grupy, miejsca w miejscach i relacje (wszystkie zapisane w kartach i na mapach oraz wywnioskowane z nich rodzeństwo i dziadkowie). Nie są zapisywane: przelicza się je przy otwarciu.'],
      ['Wszystko razem', 'Jeden ogólny rysunek z twoimi relacjami (linia ciągła) i automatycznymi (przerywana, każda w swoim kolorze), z polami wyboru, które określają, co jest widoczne.'],
      ['Jak czytać rysunek', 'Im grubsza linia, tym częściej występuje relacja. Najedź kursorem na element albo naciśnij go, żeby go przypiąć, a jego relacje zostaną wyróżnione razem z etykietami. Pod spodem jest lista.'],
      ['Relacje w kartach', 'Postacie i Miejsca mają zakładkę „Relacje”, która zbiera relacje ze wszystkich twoich map.'],
    ],
    tips: ['„Eksportuj relacje” zapisuje je do Worda, tekstu, Excela, CSV lub JSON.', 'Strzałka „matka”, „ojciec” lub „syn” między dwiema postaciami pozwala też Ciągłości sprawdzić ich daty urodzenia.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'Struktura powieści: części, rozdziały, prolog i epilog.',
    parts: [
      ['Lista', 'Każdy rozdział z jego scenami, liczbą słów, czasem czytania, stanem, najczęściej występującymi postaciami i kolorowym kwadratem dla każdego wątku, którego dotyczy. Na górze podsumowanie całej książki.'],
      ['Czas czytania', 'Przybliżony, przy około 250 słowach na minutę. W każdym rozdziale widać też czas każdej sceny.'],
      ['Wątki', 'Najedź kursorem na kwadrat (albo przytrzymaj go na ekranie dotykowym), żeby zobaczyć nazwę wątku, jego rodzaj i opis.'],
      ['Zmiana kolejności', 'Przeciągaj wiersze, użyj Alt+↑/↓ albo menu ⋯ każdego z nich.'],
      ['Inne widoki', '„Tablica” pokazuje sceny jako kafelki, które można przenosić między rozdziałami; „Zarys” — wszystko w postaci drzewa.'],
    ],
    tips: ['„Struktura” dodaje części, prolog lub epilog, importuje szkic z Worda i wykrywa wzmianki we wszystkich scenach.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Rozdział: jego sceny i zapiski.',
    parts: [
      ['Sceny', 'Tworzy się je, zmienia ich kolejność przeciąganiem i przenosi do innego rozdziału z menu ⋯. Pod tytułem każdej: kiedy się dzieje i ile trwa, kto opowiada oraz kolorowy kwadrat dla każdego miejsca (najedź kursorem albo przytrzymaj, żeby zobaczyć, które to).'],
      ['Cel i notatki', 'Czemu rozdział służy w powieści i o czym chcesz pamiętać, gdy go piszesz.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Tu się pisze. Po lewej tekst; po prawej karta sceny.',
    parts: [
      ['Tekst', 'Zapisuje się sam. Pasek pozwala formatować, wstawiać myślnik dialogowy i cudzysłów, szukać i zamieniać oraz oznaczyć zaznaczony fragment jako zadanie.'],
      ['Karta', 'W zwijanych blokach: kto występuje i kto opowiada, gdzie i kiedy, wydarzenia, wątki i przedmioty, ciągłość, zadania, dokumentacja i wersje.'],
      ['Wydarzenia', 'Blok „Wydarzenia” pokazuje fakty związane ze sceną: te, które się w niej dzieją (przejmują jej datę), i te, które są w niej opowiadane (wspomnienie: zachowują własną). Zwinięty mówi, które to są; rozwinięty podaje dla każdego datę, opis, kogo dotyczy i w jakich innych scenach się pojawia.'],
      ['Automatyczne wykrywanie', 'To, co wymienisz w tekście (postacie, miejsca, przedmioty, grupy), oznacza się samo, z dopiskiem „auto”. Jeśli to usuniesz, nie zostanie dodane ponownie.'],
      ['Wersje', 'Warianty tekstu sceny. Możesz utworzyć nową przed przepisaniem, porównywać je i wrócić do wcześniejszej.'],
      ['Narzędzia', 'Na pasku: widok podzielony (karta lub inna scena obok), przegląd stylu, czytanie na głos i tryb skupienia.'],
      ['Ciągłość', 'Zapisz tu, co zmienia stan („rana w ramieniu”, „klucz przechodzi w ręce Alexa”), i jaki sekret zostaje ujawniony, i komu.'],
    ],
    tips: ['Ctrl+S zapisuje od razu; Ctrl+F wyszukuje; Esc zamyka tryb skupienia.', 'Data sceny umieszcza ją na osi czasu i pozwala obliczać wiek oraz wykrywać sprzeczności.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Sceny jako kafelki, żeby zobaczyć powieść jednym spojrzeniem i ją przearanżować.',
    parts: [
      ['Kolumny i kafelki', 'Każdy rozdział to kolumna (cztery w rzędzie), a każda scena to kafelek ze streszczeniem, informacją, kto opowiada, gdzie i kiedy.'],
      ['Streszczenie', 'Naciśnij tekst kafelka, żeby napisać, o czym jest scena.'],
      ['Przenoszenie', 'Przeciągnij kafelek, żeby zmienić jego miejsce lub rozdział. Na ekranach dotykowych użyj jego menu ⋯.'],
      ['Wątki', 'Kolorowe paski to wątki sceny; legenda u góry mówi, który jest który.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Wszystko, co opisuje powieść jako książkę.',
    parts: [
      ['Dane książki', 'Tytuł i język (wymagane) oraz autor, seria, numer, data publikacji, wydawnictwo, okładka i synopsis (opcjonalne). Pojawiają się na stronie tytułowej i w metadanych e-booka.'],
      ['Cele', 'Docelowa liczba słów, dzienny limit, termin i liczba słów na rozdział. Postępy widać na stronie startowej.'],
      ['Strony książki', 'Strona redakcyjna, dedykacja, motto, podziękowania i „O autorze” ze zdjęciem. Dodawane są przy eksporcie.'],
      ['Projekt', 'Kopia zapasowa (plik .zip ze wszystkimi danymi, obrazami i dokumentami oraz książką i kartami w formacie Word), utworzenie kontynuacji (zachowuje świat, zaczyna bez rozdziałów) i usunięcie projektu. Kopię przywraca się przyciskiem „Importuj kopię” na ekranie „Twoje projekty”.'],
    ],
    tips: ['Bez autora książka zostanie wyeksportowana jako „Anonim”.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'To, co zostało do sprawdzenia, w jednym miejscu.',
    parts: [
      ['Skąd się biorą', 'Z oznaczenia na tekście sceny albo jako osobne zadania, powiązane z kartą lub z całym projektem.'],
      ['Rodzaje i stan', 'Każde zadanie ma rodzaj (niespójność, sprawdzenie danych, do przejrzenia, pomysł) i oznacza się je jako rozwiązane, gdy już jest.'],
      ['Przejście do miejsca', 'Z zadania oznaczonego na tekście przechodzi się prosto do właściwego zdania w scenie.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Wydarzenia po kolei: sceny z datą i wydarzenia ze świata powieści.',
    parts: [
      ['Co się pojawia', 'Scena pojawia się, gdy nadasz jej datę w jej karcie. Wydarzenie tworzy się tutaj albo w karcie elementu; może być ogólne albo należeć do jednego lub kilku elementów.'],
      ['Wydarzenia i sceny', 'Wydarzenie wiąże się ze scenami, w których się dzieje (przejmuje ich datę i pojawia się w ich obrębie), albo z tymi, w których jest tylko opowiadane (zachowuje własną). Jeśli niepowiązane wydarzenie pokrywa się datą i godziną ze sceną, pojawia się propozycja, by je powiązać.'],
      ['Dwie kolejności', '„Chronologiczna” porządkuje według daty; „Według lektury” — jak w książce, żeby było widać, gdzie opowieść cofa się w czasie.'],
      ['Początek i koniec książki', 'Dwa znaczniki wskazują pierwszą i ostatnią scenę, którą czyta czytelnik: to, co wcześniej, to przeszłość sprzed akcji powieści.'],
      ['Śledzenie i filtry', '„Śledź” zawęża oś do jednego elementu; pola wyboru ukrywają rodzaje wpisów.'],
      ['Wyszukiwarka', 'Po tekście, dacie lub identyfikatorze. „a & b” wymaga obu warunków; „a | b” — jednego z nich. Znak „?” obok podaje przykłady.'],
      ['Import i eksport', 'Do CSV, JSON, Excela lub Worda i z powrotem: tworzy brakujące wydarzenia i aktualizuje te, które już istnieją.'],
    ],
    tips: ['Między dwoma wpisami widać, ile czasu mija; po najechaniu kursorem pojawia się dokładny rozkład.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Żeby sobie nie przeczyć: sprzeczności, które da się wykryć, kto co wie i jak zmienia się każdy element.',
    parts: [
      ['Kontrole', 'Zestawiają daty i miejsca scen, obecne postacie, narodziny i śmierci, stany i sekrety. Ostrzegają na przykład, gdy ktoś jest w dwóch miejscach naraz.'],
      ['Sprzeczność czy do przejrzenia', 'To, co niemożliwe, pojawia się jako „Sprzeczność”; to, co może być zamierzone — jako „Do przejrzenia”. Każde ostrzeżenie można zignorować.'],
      ['Kto co wie', 'Sekrety powieści, po jednym w wierszu, i scena, w której dowiaduje się o nich każda postać i czytelnik. Są uporządkowane według pierwszego ujawnienia (według daty lub kolejności lektury), a wyszukiwarka znajduje je po tytule, treści, osobie lub scenie. Naciśnij wiersz, żeby zobaczyć szczegóły.'],
      ['Śledzenie', 'Przechodzi przez książkę za wybranym elementem: gdzie się pojawia i jak zmienia się jego stan.'],
    ],
    tips: ['Stany i ujawnienia zapisuje się w karcie każdej sceny, w bloku „Ciągłość”.', 'Im więcej uzupełnisz (daty, miejsca, narodziny), tym więcej wykryje.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Pomiary rękopisu i twojego sposobu pisania.',
    parts: [
      ['Moje pisanie', 'Słowa dziennie, serie, sesje i prognoza ukończenia.'],
      ['Książka', 'Długość rozdziałów i scen, proporcja dialogu i narracji oraz powtórzenia.'],
      ['Styl', 'Przysłówki na -mente, bliskie powtórzenia, wypełniacze i długie zdania, według rozdziałów; wyróżnia, gdzie jest ich najwięcej. Stosuje reguły języka powieści.'],
      ['Wykres narracji', 'Jeden wiersz na element i jedna kolumna na scenę: kto znika na zbyt długo i które wątki się nie przecinają.'],
      ['Rozkład i wystąpienia', 'W ilu scenach każdego rozdziału pojawia się każdy element oraz lista scen danej postaci.'],
    ],
    tips: ['Znak „?” przy każdej kolumnie wyjaśnia, co ona mierzy.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Szukaj (i zamieniaj) w całym projekcie.',
    parts: [
      ['Gdzie szuka', 'Zaznacz zakresy: tekst scen, tytuły, postacie, świat, architekturę i notatki, dokumentację i zadania.'],
      ['Opcje', 'Uwzględnianie wielkości liter i szukanie tylko całych słów.'],
      ['Zamiana', 'Zmienia tekst we wszystkim, co zaznaczono, po wcześniejszym podaniu liczby miejsc. Przydaje się do zmiany imienia postaci.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Zapisz powieść lub materiał roboczy do pliku.',
    parts: [
      ['Co eksportować', 'Powieść albo teczkę projektu (architektura, postacie, miejsca i pozostałe karty).'],
      ['Rodzaje eksportu', 'Maszynopis do wysłania, książka drukowana (z szacowaną liczbą stron i grzbietem), e-book (EPUB) albo format dowolny.'],
      ['Formaty', 'Word, EPUB, strona internetowa lub PDF oraz tekst.'],
      ['Dane i strony książki', 'Strona tytułowa, metadane e-booka, okładka oraz strony początkowe i końcowe pochodzą z sekcji „Książka”.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'To, co usunięte, nie przepada od razu: trafia tutaj.',
    parts: [
      ['Przywracanie', 'Odkłada element na miejsce razem z tym, co od niego zależało.'],
      ['Termin ważności', 'Po upływie liczby dni ustawionej w Ustawieniach (od 1 do 60) element zostaje usunięty na zawsze.'],
    ],
    guide: 'data#trash',
  },
};
