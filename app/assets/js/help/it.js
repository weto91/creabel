// Aiuto dettagliato di ogni pagina (it): ciò che si vede premendo «?». Ogni voce ha una
// frase introduttiva, sezioni [titolo, testo], consigli e il capitolo della guida dell’applicazione
// in cui viene spiegato con più calma. Le pagine che non sono qui mostrano solo la loro frase breve
// (help.<sezione> in i18n/it.js).
export default {
  home: {
    intro: 'Quello che conviene vedere entrando: da dove riprendere, come stai andando, quanto manca e che cosa c’è da rivedere.',
    parts: [
      ['Da dove riprendere', 'L’ultima scena su cui hai lavorato e la prossima da scrivere, con accesso diretto. «Continua a scrivere» apre la prima. In un progetto nuovo, qui trovi i primi passi.'],
      ['Quattro cifre', 'Il manoscritto rispetto al suo obiettivo di parole, quanto hai scritto oggi rispetto alla quota giornaliera, la serie di giorni consecutivi e i giorni che mancano alla consegna, con il ritmo che ti serve e quello che stai tenendo.'],
      ['Ritmo e stato', 'Le parole di ciascuno degli ultimi 30 giorni e quante schede, capitoli e scene sono da fare, in corso o completati.'],
      ['Da rivedere', 'I promemoria aperti più recenti e gli avvisi: casi impossibili e avvisi di Continuità, scene senza data e scene senza alcuna trama.'],
    ],
    tips: ['Gli obiettivi si fissano in «Libro → Obiettivi». Senza obiettivi, le cifre mostrano solo ciò che c’è.', 'Se in «Libro» hai messo una copertina o una frase di presentazione, compaiono nel primo blocco; clicca sulla copertina per vederla in grande.', 'Sul PC, clic destro su un qualsiasi collegamento → «Apri in una nuova finestra»: per esempio, la scheda di un personaggio accanto alla scena che stai scrivendo.', 'Sul telefono, se esci da una scena per consultare qualcosa, il pulsante ↩ in alto ti riporta lì.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Le fondamenta della storia: che cosa racconti, in quale mondo e lungo quali fili avanza.',
    parts: [
      ['Premessa', 'L’idea in una o due frasi: chi vuole che cosa e che cosa glielo impedisce.'],
      ['Fabula, ambientazione e note', 'I fatti in ordine cronologico, l’epoca e il luogo, e gli appunti che riguardano tutto il romanzo. Premi ogni blocco per scriverlo.'],
      ['Trame', 'Un filo narrativo per riga, raggruppate per peso: principali, sottotrame e di sfondo. La classificazione si imposta nella scheda di ogni trama.'],
      ['Il percorso di ogni trama', 'La barra ha un trattino per ogni scena del libro, in ordine di lettura; quelli colorati sono le scene di quella trama. Si vede dove inizia, dove scompare e se arriva alla fine.'],
    ],
    tips: [
      'Le scene si assegnano a una trama nella scheda della scena, blocco «Trame e oggetti».',
      'L’avviso «scene senza alcuna trama» segnala scene che forse non fanno avanzare nulla.',
      '«Leggi tutto» mostra l’architettura di seguito, come un documento.',
      '«Importa / esporta», accanto ad «Aggiungi trama», porta le trame in Excel, CSV, Word, testo o JSON e le reimporta.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Appunti sparsi del progetto: idee, frammenti, cose da ricordare.',
    parts: [
      ['Etichette', 'Ogni nota può averne più d’una. Qui sono raggruppate per etichetta, e una nota con due etichette compare in entrambi i blocchi.'],
      ['Colore', 'Otto colori per distinguerle a colpo d’occhio. «Ordina per: Colore» le raggruppa così.'],
      ['Collegamenti', 'Una nota si può collegare a personaggi, luoghi, oggetti, gruppi, schede personalizzate, trame, capitoli e scene. Compare allora nella scheda di ciascuno.'],
      ['Ordinare e gestire', 'All’interno di ogni blocco si riordinano trascinandole. Il menu ⋯ di un’etichetta la rinomina o la rimuove da tutte le sue note.'],
    ],
    tips: ['Per il materiale di consultazione (link, piantine, articoli) è meglio Documentazione; per ciò che va rivisto, Promemoria.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'Il materiale di consultazione del romanzo: link, articoli, immagini, mappe, piantine e documenti.',
    parts: [
      ['Riferimenti', 'Ognuno ha un tipo, un indirizzo web facoltativo, un testo e file allegati (immagini, SVG o PDF).'],
      ['Collegamenti', 'Un riferimento si collega a scene, capitoli o schede, e compare lì: così lo hai a portata di mano mentre scrivi quella scena.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'Le schede di chi vive la storia.',
    parts: [
      ['Principali e secondari', 'I principali hanno un’intervista divisa in sezioni (dati personali, aspetto fisico, psicologia, conflitto, evoluzione…); i secondari, una descrizione libera. Dalla scheda si può trasformare l’uno nell’altro.'],
      ['Rilevamento nel testo', 'Se crei i personaggi prima di scrivere, le scene li riconoscono dal nome e dagli altri nomi e li segnano da sole.'],
      ['Date ed età', 'Con la data di nascita nella scheda, ogni scena con una data mostra l’età del personaggio.'],
      ['Relazioni', 'Quando un personaggio ha una relazione disegnata in «Relazioni», qui compare una tab che le riunisce tutte.'],
    ],
    tips: ['«Importa / esporta» porta l’elenco in Excel, CSV, Word, testo o JSON, e lo reimporta. Ogni scheda va completa: dati, testo, tratti, eventi, scene in cui compare e relazioni.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'La scheda di un personaggio principale: un’intervista divisa in sezioni che ti aiuta a conoscerlo.',
    parts: [
      ['Sezioni', 'A ogni sezione si può rispondere domanda per domanda o con un testo libero. Il suo stato (da fare, in corso, completato) ti dice che cosa manca.'],
      ['Tratti', 'Si estraggono da soli da ciò che scrivi (età, capelli, occhi…) perché tu non ti contraddica; puoi aggiungere i tuoi.'],
      ['Ruolo, altri nomi e date', 'Il ruolo nella storia, gli altri modi di chiamarlo (perché il testo lo riconosca) e la sua nascita e morte.'],
      ['Relazioni', 'Una coppia per relazione: sotto la foto di ciascuno, che cosa è per l’altro («Direttore di volo» / «Comandante»). Se ne scrivi solo uno, vale per entrambi («Colleghi»). È un unico elenco, che la relazione sia annotata qui, nella scheda dell’altro o disegnata in una mappa; quando la cambi o la rimuovi, si aggiorna in tutti quei punti.'],
      ['Immagini, eventi e apparizioni', 'Foto di riferimento, fatti con una data per la linea temporale e le scene in cui compare.'],
    ],
    tips: [
      'Se continua a comparire dopo la morte (il suo corpo, un ricordo, uno spettro), spunta la casella sotto la data di morte e Continuità non avviserà.',
      'Il menu ⋯ esporta la scheda o vi importa dati.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Gli scenari del romanzo, dal più grande al più piccolo.',
    parts: [
      ['Elenco', 'Le schede di tutti i luoghi, che si riordinano trascinandole.'],
      ['Albero', 'Quale luogo si trova dentro quale: la sala sul ponte, il ponte nella nave. Ciò che succede in un luogo vale anche per quelli che lo contengono.'],
      ['Mappe', 'Carichi una piantina o una mappa (immagine o SVG) e ci collochi sopra i tuoi luoghi con delle puntine.'],
      ['Relazioni', 'Compare quando un luogo ha una relazione disegnata in «Relazioni».'],
    ],
    tips: ['Nell’albero, il menu ⋯ di ogni riga lo sposta all’interno di un altro luogo o vi aggiunge luoghi interni.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'La scheda di un luogo.',
    parts: [
      ['Dove si trova', 'Paese, regione e città, e «All’interno di»: il luogo che lo contiene. «Contiene» elenca quelli che ha al suo interno.'],
      ['Descrizione e domande', 'Il testo libero e le domande personalizzate che hai definito per tutti i luoghi.'],
      ['Apparizioni', 'Le scene che si svolgono qui o in uno qualsiasi dei luoghi che contiene.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Schede dei tipi che definisci tu: navi, tecnologie, creature, organizzazioni…',
    parts: [
      ['Tipi', '«Aggiungi tipo» ne crea uno con il suo nome, la sua icona e i suoi campi. Ogni tipo è una tab.'],
      ['Schede', 'Hanno i campi del loro tipo e, in più, descrizione, immagini e identificativo.'],
      ['Come qualsiasi altro elemento', 'Si segnano nelle scene (blocco «Trame e oggetti»), compaiono nella linea temporale e nella ricerca, e rientrano in Continuità.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Come sono legati gli elementi del romanzo: ciò che disegni tu e ciò che si deduce da solo.',
    parts: [
      ['Le mie mappe', 'Puoi averne più d’una: la famiglia, l’equipaggio, le fazioni. Ognuna è un’area di disegno.'],
      ['Elementi e frecce', 'In una mappa aggiungi schede (o testi liberi) e ne unisci due con una freccia con etichetta: «madre di», «nemico di», «lavora per».'],
      ['Automatiche', 'Dieci disegni che nascono da soli da ciò che hai già annotato: chi è insieme in scena, chi ha ogni oggetto, chi conosce ogni segreto, che cosa unisce un evento, personaggi e luoghi, personaggi e trame, spostamenti, gruppi, luoghi dentro luoghi e relazioni (tutte quelle annotate in schede e mappe, più i fratelli e i nonni che se ne deducono). Non vengono salvati: si ricalcolano all’apertura.'],
      ['Tutto insieme', 'Un disegno generale con le tue (linea continua) e le automatiche (tratteggiata, ciascuna del suo colore), con caselle per scegliere quali vedere.'],
      ['Leggere un disegno', 'Più è spessa la linea, più spesso si presenta la relazione. Passa il mouse su un elemento, o premilo per fissarlo, e si evidenziano le sue con la loro etichetta. Sotto c’è l’elenco.'],
      ['Vederle nelle schede', 'Personaggi e Luoghi hanno una tab «Relazioni» che riunisce quelle di tutte le tue mappe.'],
    ],
    tips: ['«Esporta relazioni» le porta in Word, testo, Excel, CSV o JSON.', 'Una freccia «madre», «padre» o «figlio» tra due personaggi serve anche perché Continuità verifichi le loro date di nascita.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'La struttura del romanzo: parti, capitoli, prologo ed epilogo.',
    parts: [
      ['L’elenco', 'Ogni capitolo con le sue scene, le sue parole, il suo tempo di lettura, il suo stato, i personaggi più presenti e un quadratino colorato per ogni trama che tocca. In alto, il totale del libro.'],
      ['Tempo di lettura', 'Approssimativo, a circa 250 parole al minuto. All’interno di ogni capitolo compare anche quello di ogni scena.'],
      ['Le trame', 'Passa il mouse su un quadratino (o tieni premuto su uno schermo touch) per vedere il nome della trama, il suo tipo e la sua descrizione.'],
      ['Riordinare', 'Trascina le righe, usa Alt+↑/↓ o il menu ⋯ di ciascuna.'],
      ['Altre viste', '«Bacheca» mostra le scene come riquadri per spostarle tra i capitoli; «Schema», tutto in un albero.'],
    ],
    tips: ['«Struttura» aggiunge parti, prologo o epilogo, importa una bozza in Word e rileva le menzioni in tutte le scene.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Un capitolo: le sue scene e i suoi appunti.',
    parts: [
      ['Scene', 'Si creano, si riordinano trascinandole e si spostano in un altro capitolo dal loro menu ⋯. Sotto il titolo di ciascuna: quando succede e quanto dura, chi narra e un quadratino colorato per ogni luogo (passa il mouse, o tieni premuto, per vedere quale).'],
      ['Scopo e note', 'A che cosa serve il capitolo nel romanzo e ciò che vuoi ricordare mentre lo scrivi.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Dove si scrive. A sinistra, il testo; a destra, la scheda della scena.',
    parts: [
      ['Il testo', 'Si salva da solo. La barra offre formattazione, lineetta di dialogo e virgolette, trova e sostituisci, e un promemoria da segnare sul testo selezionato.'],
      ['La scheda', 'A blocchi comprimibili: chi compare e chi narra, dove e quando, eventi, trame e oggetti, continuità, promemoria, documentazione e revisioni.'],
      ['Eventi', 'Il blocco «Eventi» mostra i fatti che hanno a che fare con la scena: quelli che succedono in essa (ne prendono la data) e quelli che vi si raccontano (un ricordo: conservano la propria). Compresso, dice quali sono; aperto, dà per ciascuno la data, la descrizione, chi riguarda e in quali altre scene si trova.'],
      ['Rilevamento automatico', 'Ciò che nomini nel testo (personaggi, luoghi, oggetti, gruppi) viene segnato da solo, con la parola «auto». Se lo rimuovi, non viene più aggiunto.'],
      ['Revisioni', 'Versioni del testo della scena. Puoi crearne una nuova prima di riscrivere, confrontarle e tornare a una precedente.'],
      ['Strumenti', 'Nella barra: vista divisa (una scheda o un’altra scena accanto), revisione dello stile, lettura ad alta voce e modalità senza distrazioni.'],
      ['Continuità', 'Annota qui ciò che cambia stato («ferita al braccio», «la chiave passa ad Alex») e quale segreto viene rivelato, e a chi.'],
    ],
    tips: ['Ctrl+S salva all’istante; Ctrl+F cerca; Esc esce dalla modalità senza distrazioni.', 'La data della scena la colloca nella linea temporale e permette di calcolare le età e di rilevare i casi impossibili.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'Le scene come riquadri, per vedere il romanzo a colpo d’occhio e risistemarlo.',
    parts: [
      ['Colonne e riquadri', 'Ogni capitolo è una colonna (quattro per riga) e ogni scena un riquadro con il suo riassunto, chi narra, dove e quando.'],
      ['Riassunto', 'Premi il testo di un riquadro per scrivere di che cosa parla la scena.'],
      ['Spostare', 'Trascina un riquadro per spostarlo di posto o di capitolo. Sugli schermi touch, usa il suo menu ⋯.'],
      ['Trame', 'Le strisce colorate sono le trame della scena; la legenda in alto dice qual è ciascuna.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Tutto ciò che descrive il romanzo come libro.',
    parts: [
      ['Dati del libro', 'Titolo e lingua (obbligatori) e autore, serie, numero, data di pubblicazione, editore, copertina e sinossi (facoltativi). Compaiono nel frontespizio e nei metadati dell’ebook.'],
      ['Obiettivi', 'Obiettivo di parole, quota giornaliera, scadenza e parole per capitolo. Si seguono dalla home.'],
      ['Pagine del libro', 'Crediti, dedica, epigrafe, ringraziamenti e «Sull’autore» con la sua foto. Vengono aggiunti all’esportazione.'],
      ['Progetto', 'Backup (un .zip con tutti i dati, le immagini e i documenti, più il libro e le schede in Word), creazione di un seguito (conserva il mondo, parte senza capitoli) ed eliminazione del progetto. Il backup si ripristina con «Importa backup» in «I tuoi progetti».'],
    ],
    tips: ['Senza autore, il libro viene esportato come «Anonimo».'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'Ciò che resta da rivedere, in un solo posto.',
    parts: [
      ['Da dove nascono', 'Da un segno sul testo di una scena, oppure a sé, legati a una scheda o al progetto.'],
      ['Tipi e stato', 'Ogni promemoria ha un tipo (incoerenza, dato da verificare, revisione, idea) e si segna come risolto quando lo è.'],
      ['Andare al punto', 'Da un promemoria segnato sul testo si salta alla frase esatta della scena.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'I fatti in ordine: le scene con una data e gli eventi del mondo.',
    parts: [
      ['Che cosa compare', 'Una scena compare quando le dai una data nella sua scheda. Un evento si crea qui o nella scheda di un elemento, e può essere generale o di uno o più elementi.'],
      ['Eventi e scene', 'Un evento si collega alle scene in cui succede (ne prende la data e compare al loro interno) o in cui viene solo raccontato (conserva la propria). Se un evento a sé coincide per data e ora con una scena, un avviso propone di collegarli.'],
      ['Due ordini', '«Cronologico» ordina per data; «Di lettura», come nel libro, per vedere dove il racconto torna indietro.'],
      ['Inizio e fine del libro', 'Due segni indicano la prima e l’ultima scena che legge il lettore: ciò che viene prima è passato anteriore al romanzo.'],
      ['Segui e filtri', '«Segui» limita la linea a un solo elemento; le caselle nascondono tipi di voce.'],
      ['Ricerca', 'Per testo, data o identificativo. «a & b» richiede entrambe le cose; «a | b», una delle due. Il «?» lì accanto dà degli esempi.'],
      ['Importare ed esportare', 'In CSV, JSON, Excel o Word, e viceversa: crea gli eventi che mancano e aggiorna quelli che esistono già.'],
    ],
    tips: ['Tra due voci viene indicato il tempo che passa; passando il mouse compare il dettaglio.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Per non contraddirti: le impossibilità che si possono rilevare, chi sa che cosa e come cambia ogni elemento.',
    parts: [
      ['Verifiche', 'Incrocia date e luoghi delle scene, personaggi presenti, nascite e morti, stati e segreti. Avvisa, per esempio, di qualcuno che si trova in due posti contemporaneamente.'],
      ['Impossibile o da rivedere', 'Ciò che non può essere compare come «Impossibile»; ciò che può essere intenzionale, come «Da rivedere». Ogni avviso si può ignorare.'],
      ['Chi sa cosa', 'I segreti del romanzo, uno per riga, e la scena in cui li scopre ogni personaggio e il lettore. Sono ordinati in base alla prima rivelazione (per data o per ordine di lettura), e la ricerca trova per titolo, contenuto, persona o scena. Premi una riga per vedere il dettaglio.'],
      ['Tracciamento', 'Percorre il libro seguendo un elemento: dove compare e come cambia stato.'],
    ],
    tips: ['Gli stati e le rivelazioni si annotano nella scheda di ogni scena, blocco «Continuità».', 'Più completi (date, luoghi, nascite), più trova.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Misure del manoscritto e del tuo modo di scriverlo.',
    parts: [
      ['La mia scrittura', 'Parole al giorno, serie, sessioni e previsione della fine.'],
      ['Il libro', 'Lunghezza di capitoli e scene, proporzione tra dialogo e narrazione, e ripetizioni.'],
      ['Stile', 'Avverbi in -mente, ripetizioni ravvicinate, riempitivi e frasi lunghe, per capitolo; evidenzia dove ce ne sono di più. Segue le regole della lingua del romanzo.'],
      ['Grafico narrativo', 'Una riga per elemento e una colonna per scena: chi sparisce troppo a lungo e quali trame non si incrociano.'],
      ['Distribuzione e apparizioni', 'In quante scene di ogni capitolo compare ogni elemento, e l’elenco delle scene di un personaggio.'],
    ],
    tips: ['Il «?» accanto a ogni colonna spiega che cosa misura.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Cerca (e sostituisci) in tutto il progetto.',
    parts: [
      ['Dove cerca', 'Seleziona gli ambiti: testo delle scene, titoli, personaggi, mondo, architettura e note, documentazione e promemoria.'],
      ['Opzioni', 'Distinguere maiuscole e minuscole e cercare solo parole intere.'],
      ['Sostituisci', 'Cambia il testo in tutto ciò che è selezionato, dopo averti detto in quanti punti. Utile per rinominare un personaggio.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Porta il romanzo o il materiale di lavoro in un file.',
    parts: [
      ['Che cosa esportare', 'Il romanzo o il dossier (architettura, personaggi, luoghi e le altre schede).'],
      ['Tipi di esportazione', 'Manoscritto da inviare, libro stampato (con stima di pagine e dorso), libro elettronico (EPUB) o formato libero.'],
      ['Formati', 'Word, EPUB, pagina web o PDF, e testo.'],
      ['Dati e pagine del libro', 'Il frontespizio, i metadati dell’ebook, la copertina e le pagine iniziali e finali vengono da «Libro».'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'Ciò che elimini non va perso subito: finisce qui.',
    parts: [
      ['Ripristina', 'Rimette un elemento al suo posto, con ciò che ne dipendeva.'],
      ['Scadenza', 'Trascorsi i giorni che fissi nelle Impostazioni (tra 1 e 60), viene eliminato definitivamente.'],
    ],
    guide: 'data#trash',
  },
};
