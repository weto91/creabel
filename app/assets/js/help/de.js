// Ausführliche Hilfe zu jeder Seite (de): was beim Tippen auf „?“ erscheint. Jeder Eintrag hat
// einen Einleitungssatz, Abschnitte [Titel, Text], Tipps und das Kapitel des App-Leitfadens,
// in dem es ausführlicher erklärt wird. Seiten, die hier fehlen, zeigen nur ihren kurzen Satz
// (help.<Bereich> in i18n/de.js).
export default {
  home: {
    intro: 'Was du beim Öffnen sehen solltest: wo es weitergeht, wie du vorankommst, wie viel noch fehlt und was zu prüfen ist.',
    parts: [
      ['Wo es weitergeht', 'Die zuletzt bearbeitete Szene und die nächste, die noch zu schreiben ist, mit direktem Zugriff. „Weiterschreiben“ öffnet die erste. In einem neuen Projekt stehen hier die ersten Schritte.'],
      ['Vier Zahlen', 'Das Manuskript im Verhältnis zu seinem Wortziel, das heute Geschriebene im Verhältnis zum Tagespensum, die Serie aufeinanderfolgender Tage und die Tage bis zur Abgabe, mit dem Tempo, das du brauchst, und dem, das du hast.'],
      ['Tempo und Stand', 'Die Wörter jedes der letzten 30 Tage und wie viele Karteikarten, Kapitel und Szenen offen, in Arbeit oder fertig sind.'],
      ['Zu prüfen', 'Die neuesten offenen Aufgaben und die Hinweise: Unmöglichkeiten und Hinweise aus Kontinuität, Szenen ohne Datum und Szenen ohne Handlungsstrang.'],
    ],
    tips: ['Die Ziele legst du unter „Buch → Ziele“ fest. Ohne sie zeigen die Zahlen nur, was da ist.', 'Wenn du unter „Buch“ ein Cover oder einen Satz zur Vorstellung eingetragen hast, stehen sie im ersten Block; klicke auf das Cover, um es groß zu sehen.', 'Am PC: Rechtsklick auf einen beliebigen Link → „In neuem Fenster öffnen“, zum Beispiel die Karteikarte einer Figur neben der Szene, die du schreibst.', 'Auf dem Handy bringt dich die Schaltfläche ↩ oben zurück zur Szene, wenn du sie verlassen hast, um etwas nachzusehen.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Das Fundament der Geschichte: was du erzählst, in welcher Welt und entlang welcher Fäden sie vorankommt.',
    parts: [
      ['Prämisse', 'Die Idee in ein, zwei Sätzen: Wer will was, und was steht dem im Weg?'],
      ['Fabel, Setting und Notizen', 'Die Ereignisse in chronologischer Reihenfolge, Epoche und Ort sowie die Notizen, die den ganzen Roman betreffen. Tippe auf einen Block, um ihn zu schreiben.'],
      ['Handlungsstränge', 'Ein Erzählfaden pro Zeile, gruppiert nach Gewicht: Haupthandlungen, Nebenhandlungen und Hintergrundhandlungen. Die Einordnung legst du auf der Karteikarte jedes Handlungsstrangs fest.'],
      ['Der Verlauf jedes Handlungsstrangs', 'Die Leiste hat einen Strich pro Szene des Buchs, in Lesereihenfolge; die farbigen gehören zu diesem Handlungsstrang. Man sieht, wo er beginnt, wo er verschwindet und ob er bis zum Ende reicht.'],
    ],
    tips: [
      'Szenen werden einem Handlungsstrang auf der Szenenkarteikarte zugeordnet, Block „Handlungsstränge und Gegenstände“.',
      'Der Hinweis „Szenen ohne Handlungsstrang“ zeigt Szenen, die vielleicht nichts voranbringen.',
      '„Alles lesen“ zeigt die Architektur am Stück, wie ein Dokument.',
      '„Importieren / Exportieren“ neben „Handlungsstrang hinzufügen“ exportiert die Handlungsstränge nach Excel, CSV, Word, Text oder JSON und liest sie wieder ein.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Lose Notizen zum Projekt: Ideen, Textschnipsel, Erinnerungen.',
    parts: [
      ['Schlagwörter', 'Jede Notiz kann mehrere haben. Hier werden sie nach Schlagwort gruppiert, und eine Notiz mit zwei Schlagwörtern erscheint in beiden Blöcken.'],
      ['Farbe', 'Acht Farben, um sie auf einen Blick zu unterscheiden. „Sortieren nach: Farbe“ gruppiert sie danach.'],
      ['Verknüpfungen', 'Eine Notiz lässt sich mit Figuren, Orten, Gegenständen, Gruppen, eigenen Karteikarten, Handlungssträngen, Kapiteln und Szenen verknüpfen. Sie erscheint dann auf der Karteikarte jedes dieser Elemente.'],
      ['Ordnen und pflegen', 'Innerhalb jedes Blocks ordnest du sie durch Ziehen um. Das Menü ⋯ eines Schlagworts benennt es um oder entfernt es aus allen seinen Notizen.'],
    ],
    tips: ['Für Nachschlagematerial (Links, Pläne, Artikel) eignet sich Recherche besser, für Dinge, die zu prüfen sind, Aufgaben.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Das Nachschlagematerial des Romans: Links, Artikel, Bilder, Karten, Pläne und Dokumente.',
    parts: [
      ['Referenzen', 'Jede hat eine Art, eine optionale Webadresse, einen Text und angehängte Dateien (Bilder, SVG oder PDF).'],
      ['Verknüpfungen', 'Eine Referenz wird mit Szenen, Kapiteln oder Karteikarten verknüpft und erscheint dort: So hast du sie griffbereit, während du diese Szene schreibst.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Die Karteikarten der Menschen, die die Geschichte erleben.',
    parts: [
      ['Haupt- und Nebenfiguren', 'Hauptfiguren haben ein Interview nach Abschnitten (persönliche Daten, Aussehen, Psychologie, Konflikt, Entwicklung …), Nebenfiguren eine freie Beschreibung. Auf ihrer Karteikarte lässt sich die eine in die andere umwandeln.'],
      ['Erkennung im Text', 'Wenn du die Figuren vor dem Schreiben anlegst, erkennen die Szenen sie an Namen und anderen Namen und markieren sie automatisch.'],
      ['Datum und Alter', 'Mit dem Geburtsdatum auf der Karteikarte zeigt jede Szene mit Datum das Alter der Figur.'],
      ['Beziehungen', 'Sobald eine Figur eine unter „Beziehungen“ gezeichnete Beziehung hat, erscheint hier ein Reiter, der alle zusammenfasst.'],
    ],
    tips: ['„Importieren / Exportieren“ exportiert die Liste nach Excel, CSV, Word, Text oder JSON und liest sie wieder ein. Jede Karteikarte ist vollständig enthalten: Daten, Text, Merkmale, Ereignisse, Szenen, in denen die Figur vorkommt, und Beziehungen.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'Die Karteikarte einer Hauptfigur: ein Interview nach Abschnitten, das dir hilft, sie kennenzulernen.',
    parts: [
      ['Abschnitte', 'Jeden Abschnitt kannst du Frage für Frage oder als freien Text beantworten. Sein Status (offen, in Arbeit, fertig) zeigt dir, was noch fehlt.'],
      ['Merkmale', 'Sie werden automatisch aus deinem Text gewonnen (Alter, Haare, Augen …), damit du dir nicht widersprichst; du kannst eigene hinzufügen.'],
      ['Rolle, andere Namen und Daten', 'Die Rolle in der Geschichte, die anderen Namen der Figur (damit der Text sie erkennt) sowie Geburt und Tod.'],
      ['Beziehungen', 'Ein Paar pro Beziehung: unter dem Foto jeder Figur, was sie für die andere ist („Flugdirektor“ / „Kommandantin“). Schreibst du nur eins, gilt es für beide („Kollegen“). Es ist eine einzige Liste, ob die Beziehung hier, auf der Karteikarte der anderen Figur oder auf einer Karte gezeichnet ist; änderst oder entfernst du sie, wird das überall nachgezogen.'],
      ['Bilder, Ereignisse und Auftritte', 'Referenzfotos, Ereignisse mit Datum für die Zeitleiste und die Szenen, in denen die Figur vorkommt.'],
    ],
    tips: [
      'Kommt die Figur nach ihrem Tod weiter vor (die Leiche, eine Erinnerung, ein Geist), setze das Häkchen unter dem Sterbedatum, und Kontinuität gibt keinen Hinweis.',
      'Das Menü ⋯ exportiert die Karteikarte oder importiert Daten in sie.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Die Schauplätze des Romans, vom größten bis zum kleinsten.',
    parts: [
      ['Liste', 'Die Karteikarten aller Orte, die du durch Ziehen umordnest.'],
      ['Baum', 'Welcher Ort in welchem liegt: der Raum auf dem Deck, das Deck im Raumschiff. Was an einem Ort passiert, zählt auch für die Orte, die ihn enthalten.'],
      ['Karten', 'Du lädst einen Plan oder eine Karte hoch (Bild oder SVG) und platzierst deine Orte mit Pins darauf.'],
      ['Beziehungen', 'Erscheint, sobald ein Ort eine unter „Beziehungen“ gezeichnete Beziehung hat.'],
    ],
    tips: ['Im Baum verschiebt das Menü ⋯ jeder Zeile den Ort in einen anderen oder fügt Orte darin hinzu.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'Die Karteikarte eines Orts.',
    parts: [
      ['Wo er liegt', 'Land, Region und Stadt sowie „Liegt in“: der Ort, der ihn enthält. „Enthält“ listet die Orte auf, die in ihm liegen.'],
      ['Beschreibung und Fragen', 'Der freie Text und die eigenen Fragen, die du für alle Orte festgelegt hast.'],
      ['Auftritte', 'Die Szenen, die hier spielen oder in einem der Orte, die er enthält.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Karteikarten der Typen, die du selbst festlegst: Raumschiffe, Technologien, Kreaturen, Organisationen …',
    parts: [
      ['Typen', '„Typ hinzufügen“ legt einen Typ mit Namen, Symbol und Feldern an. Jeder Typ ist ein Reiter.'],
      ['Karteikarten', 'Sie haben die Felder ihres Typs und außerdem Beschreibung, Bilder und Kennung.'],
      ['Wie jedes andere Element', 'Sie werden in den Szenen markiert (Block „Handlungsstränge und Gegenstände“), erscheinen in der Zeitleiste und in der Suche und werden in Kontinuität berücksichtigt.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Wie die Elemente des Romans zusammenhängen: was du selbst zeichnest und was sich von selbst ergibt.',
    parts: [
      ['Meine Karten', 'Du kannst mehrere haben: die Familie, die Besatzung, die Lager. Jede ist eine Arbeitsfläche.'],
      ['Elemente und Pfeile', 'Auf einer Karte fügst du Karteikarten (oder freie Texte) hinzu und verbindest zwei mit einem beschrifteten Pfeil: „Mutter von“, „Feind von“, „arbeitet für“.'],
      ['Automatisch', 'Zehn Grafiken, die sich von selbst aus dem bereits Notierten ergeben: wer gemeinsam in Szenen vorkommt, wer welchen Gegenstand besitzt, wer welches Geheimnis kennt, was ein Ereignis verbindet, Figuren und Orte, Figuren und Handlungsstränge, Ortswechsel, Gruppen, Orte in Orten und Beziehungen (alle in Karteikarten und Karten notierten, dazu die abgeleiteten Geschwister und Großeltern). Sie werden nicht gespeichert, sondern beim Öffnen neu berechnet.'],
      ['Alles zusammen', 'Eine Gesamtgrafik mit deinen Beziehungen (durchgezogen) und den automatischen (gestrichelt, jede in ihrer Farbe), mit Häkchen, um auszuwählen, welche angezeigt werden.'],
      ['Eine Grafik lesen', 'Je dicker die Linie, desto häufiger kommt die Beziehung vor. Fahre mit der Maus über ein Element oder tippe darauf, um es festzuhalten, und seine Beziehungen werden mit ihrer Beschriftung hervorgehoben. Darunter steht die Liste.'],
      ['Auf den Karteikarten', 'Figuren und Orte haben einen Reiter „Beziehungen“, der die aus allen deinen Karten zusammenfasst.'],
    ],
    tips: ['„Beziehungen exportieren“ exportiert sie nach Word, Text, Excel, CSV oder JSON.', 'Ein Pfeil „Mutter“, „Vater“ oder „Sohn“ zwischen zwei Figuren sorgt außerdem dafür, dass Kontinuität ihre Geburtsdaten prüft.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'Der Aufbau des Romans: Teile, Kapitel, Prolog und Epilog.',
    parts: [
      ['Die Liste', 'Jedes Kapitel mit seinen Szenen, Wörtern, seiner Lesezeit, seinem Status, den Figuren mit der stärksten Präsenz und einem farbigen Kästchen für jeden Handlungsstrang, den es berührt. Oben die Summe für das ganze Buch.'],
      ['Lesezeit', 'Ungefähr, bei etwa 250 Wörtern pro Minute. Innerhalb jedes Kapitels steht auch die jeder Szene.'],
      ['Die Handlungsstränge', 'Fahre mit der Maus über ein Kästchen (oder halte es auf einem Touchscreen gedrückt), um Namen, Art und Beschreibung des Handlungsstrangs zu sehen.'],
      ['Umordnen', 'Ziehe die Zeilen, verwende Alt+↑/↓ oder das Menü ⋯ jeder Zeile.'],
      ['Andere Ansichten', '„Pinnwand“ zeigt die Szenen als Karten, um sie zwischen Kapiteln zu verschieben; „Gliederung“ zeigt alles als Baum.'],
    ],
    tips: ['„Struktur“ fügt Teile, Prolog oder Epilog hinzu, importiert einen Entwurf aus Word und erkennt Erwähnungen in allen Szenen.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Ein Kapitel: seine Szenen und seine Notizen.',
    parts: [
      ['Szenen', 'Du legst sie an, ordnest sie durch Ziehen um und verschiebst sie über ihr Menü ⋯ in ein anderes Kapitel. Unter dem Titel jeder Szene: wann sie spielt und wie lange sie dauert, wer erzählt, und ein farbiges Kästchen für jeden Ort (fahre mit der Maus darüber oder halte es gedrückt, um zu sehen, welcher es ist).'],
      ['Zweck und Notizen', 'Wozu das Kapitel im Roman dient und woran du beim Schreiben denken willst.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Hier wird geschrieben. Links der Text, rechts die Szenenkarteikarte.',
    parts: [
      ['Der Text', 'Er wird automatisch gespeichert. Die Leiste bietet Formatierung, Gedankenstrich und Anführungszeichen, Suchen und Ersetzen und eine Aufgabe zum markierten Text.'],
      ['Die Karteikarte', 'In aufklappbaren Blöcken: wer vorkommt und wer erzählt, wo und wann, Ereignisse, Handlungsstränge und Gegenstände, Kontinuität, Aufgaben, Recherche und Fassungen.'],
      ['Ereignisse', 'Der Block „Ereignisse“ zeigt die Geschehnisse, die mit der Szene zu tun haben: die, die in ihr passieren (sie übernehmen ihr Datum), und die, die in ihr erzählt werden (eine Erinnerung: Sie behalten ihr eigenes). Zugeklappt nennt er sie; aufgeklappt zeigt er zu jedem Datum, Beschreibung, wen es betrifft und in welchen anderen Szenen es vorkommt.'],
      ['Automatische Erkennung', 'Was du im Text nennst (Figuren, Orte, Gegenstände, Gruppen), wird automatisch markiert, mit dem Wort „auto“. Wenn du es entfernst, wird es nicht wieder hinzugefügt.'],
      ['Fassungen', 'Versionen des Szenentextes. Du kannst vor dem Umschreiben eine neue anlegen, sie vergleichen und zu einer früheren zurückkehren.'],
      ['Werkzeuge', 'In der Leiste: geteilte Ansicht (eine Karteikarte oder eine andere Szene daneben), Stilprüfung, Vorlesen und ablenkungsfreier Modus.'],
      ['Kontinuität', 'Notiere hier, was seinen Zustand ändert („am Arm verletzt“, „der Schlüssel geht an Alex“), und welches Geheimnis enthüllt wird und wem.'],
    ],
    tips: ['Strg+S speichert sofort; Strg+F sucht; Esc beendet den ablenkungsfreien Modus.', 'Das Datum der Szene ordnet sie in die Zeitleiste ein und ermöglicht es, das Alter zu berechnen und Unmöglichkeiten zu erkennen.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Die Szenen als Karten, um den Roman auf einen Blick zu sehen und neu zu ordnen.',
    parts: [
      ['Spalten und Karten', 'Jedes Kapitel ist eine Spalte (vier pro Reihe) und jede Szene eine Karte mit ihrer Zusammenfassung, wer erzählt, wo und wann.'],
      ['Zusammenfassung', 'Tippe auf den Text einer Karte, um zu schreiben, worum es in der Szene geht.'],
      ['Verschieben', 'Ziehe eine Karte, um sie an eine andere Stelle oder in ein anderes Kapitel zu verschieben. Auf Touchscreens verwendest du ihr Menü ⋯.'],
      ['Handlungsstränge', 'Die farbigen Striche sind die Handlungsstränge der Szene; die Legende oben sagt, welcher welcher ist.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Alles, was den Roman als Buch beschreibt.',
    parts: [
      ['Buchdaten', 'Titel und Sprache (Pflichtfelder) sowie Autor, Reihe, Band, Erscheinungsdatum, Verlag, Cover und Synopsis (optional). Sie erscheinen auf dem Schmutztitel und in den Metadaten des E-Books.'],
      ['Ziele', 'Wortziel, Tagespensum, Abgabetermin und Wörter pro Kapitel. Den Stand verfolgst du auf der Startseite.'],
      ['Buchseiten', 'Impressum, Widmung, Motto, Danksagung und „Über den Autor“ mit Foto. Sie werden beim Export hinzugefügt.'],
      ['Projekt', 'Sicherung (eine ZIP-Datei mit allen Daten, den Bildern und Dokumenten sowie dem Buch und den Karteikarten als Word-Dateien), Fortsetzung erstellen (übernimmt die Welt, beginnt ohne Kapitel) und das Projekt löschen. Die Sicherung wird mit „Sicherung importieren“ unter „Deine Projekte“ wiederhergestellt.'],
    ],
    tips: ['Ohne Autor wird das Buch als „Anonym“ exportiert.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Was noch zu prüfen ist, an einem einzigen Ort.',
    parts: [
      ['Woher sie kommen', 'Aus einer Markierung im Text einer Szene oder lose, mit einer Karteikarte oder dem Projekt verbunden.'],
      ['Arten und Status', 'Jede Aufgabe hat eine Art (überarbeiten, prüfen, recherchieren …) und wird als erledigt markiert, wenn sie es ist.'],
      ['Zur Stelle springen', 'Von einer im Text markierten Aufgabe springst du genau zu dem Satz in der Szene.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Die Ereignisse der Reihe nach: die Szenen mit Datum und die Ereignisse der Welt.',
    parts: [
      ['Was erscheint', 'Eine Szene erscheint, sobald du ihr auf ihrer Karteikarte ein Datum gibst. Ein Ereignis legst du hier oder auf der Karteikarte eines Elements an; es kann allgemein sein oder zu einem oder mehreren Elementen gehören.'],
      ['Ereignisse und Szenen', 'Ein Ereignis wird mit den Szenen verknüpft, in denen es passiert (es übernimmt ihr Datum und erscheint in ihnen), oder mit denen, in denen es nur erzählt wird (es behält sein eigenes). Fällt ein loses Ereignis in Datum und Uhrzeit mit einer Szene zusammen, schlägt ein Hinweis vor, sie zu verknüpfen.'],
      ['Zwei Reihenfolgen', '„Chronologisch“ ordnet nach Datum, „Leseordnung“ wie im Buch, damit du siehst, wo die Erzählung zurückspringt.'],
      ['Anfang und Ende des Buchs', 'Zwei Markierungen zeigen die erste und die letzte Szene, die die Leser lesen: Was davor liegt, ist Vorgeschichte des Romans.'],
      ['Folgen und Filter', '„Folgen“ beschränkt die Zeitleiste auf ein einziges Element; die Häkchen blenden Arten von Einträgen aus.'],
      ['Suchfeld', 'Nach Text, Datum oder Kennung. „a & b“ verlangt beides, „a | b“ eines davon. Das „?“ daneben zeigt Beispiele.'],
      ['Importieren und Exportieren', 'Nach CSV, JSON, Excel oder Word und zurück: Fehlende Ereignisse werden angelegt und vorhandene aktualisiert.'],
    ],
    tips: ['Zwischen zwei Einträgen steht, wie viel Zeit vergeht; mit der Maus darüber siehst du es aufgeschlüsselt.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Damit du dir nicht widersprichst: Unmöglichkeiten, die sich erkennen lassen, wer was weiß und wie sich jedes Element verändert.',
    parts: [
      ['Prüfungen', 'Gleicht Datum und Ort der Szenen, anwesende Figuren, Geburten und Todesfälle, Zustände und Geheimnisse ab. Weist zum Beispiel darauf hin, wenn jemand an zwei Orten gleichzeitig ist.'],
      ['Unmöglich oder zu prüfen', 'Was nicht sein kann, erscheint als „Unmöglich“; was Absicht sein kann, als „Zu prüfen“. Jeder Hinweis lässt sich ignorieren.'],
      ['Wer weiß was', 'Die Geheimnisse des Romans, eins pro Zeile, und in welcher Szene jede Figur und die Leser davon erfahren. Sie sind nach ihrer ersten Enthüllung geordnet (nach Datum oder Lesereihenfolge), und das Suchfeld findet sie nach Titel, Inhalt, Person oder Szene. Tippe auf eine Zeile, um die Einzelheiten zu sehen.'],
      ['Verlauf', 'Geht das Buch durch und folgt dabei einem Element: wo es vorkommt und wie sich sein Zustand verändert.'],
    ],
    tips: ['Zustände und Enthüllungen werden auf der Karteikarte jeder Szene im Block „Kontinuität“ notiert.', 'Je mehr du ausfüllst (Daten, Orte, Geburten), desto mehr wird gefunden.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Kennzahlen des Manuskripts und deiner Art, es zu schreiben.',
    parts: [
      ['Mein Schreiben', 'Wörter pro Tag, Serien, Sitzungen und eine Prognose für das Ende.'],
      ['Das Buch', 'Länge von Kapiteln und Szenen, Anteil von Dialog und Erzählung und Wiederholungen.'],
      ['Stil', 'Adverbien auf -mente, nahe Wiederholungen, Füllwörter und lange Sätze, pro Kapitel; hebt hervor, wo es am meisten davon gibt. Folgt den Regeln der Sprache des Romans.'],
      ['Erzählgrafik', 'Eine Zeile pro Element und eine Spalte pro Szene: wer zu lange verschwindet und welche Handlungsstränge sich nie kreuzen.'],
      ['Verteilung und Auftritte', 'In wie vielen Szenen jedes Kapitels jedes Element vorkommt, und die Liste der Szenen einer Figur.'],
    ],
    tips: ['Das „?“ neben jeder Spalte erklärt, was sie misst.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Suchen (und ersetzen) im ganzen Projekt.',
    parts: [
      ['Wo gesucht wird', 'Hake die Bereiche an: Text der Szenen, Titel, Figuren, Welt, Architektur und Notizen, Recherche und Aufgaben.'],
      ['Optionen', 'Groß-/Kleinschreibung beachten und nur ganze Wörter suchen.'],
      ['Ersetzen', 'Ändert den Text in allem Angehakten, nachdem es dir gesagt hat, an wie vielen Stellen. Praktisch, um eine Figur umzubenennen.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Bringt den Roman oder das Arbeitsmaterial in eine Datei.',
    parts: [
      ['Was exportieren', 'Den Roman oder das Dossier (Architektur, Figuren, Orte und die übrigen Karteikarten).'],
      ['Arten des Exports', 'Manuskript zum Einreichen, gedrucktes Buch (mit geschätzter Seitenzahl und Rückenbreite), E-Book (EPUB) oder freies Format.'],
      ['Formate', 'Word, EPUB, Webseite oder PDF und Text.'],
      ['Buchdaten und Buchseiten', 'Schmutztitel, Metadaten des E-Books, Cover sowie Titelei und Anhang kommen aus „Buch“.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Was du löschst, ist nicht sofort weg: Es kommt hierher.',
    parts: [
      ['Wiederherstellen', 'Bringt ein Element an seinen Platz zurück, samt allem, was daran hing.'],
      ['Ablauf', 'Nach den Tagen, die du in den Einstellungen festlegst (zwischen 1 und 60), wird es endgültig gelöscht.'],
    ],
    guide: 'data#trash',
  },
};
