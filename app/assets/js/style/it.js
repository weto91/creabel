// Scheda di revisione del testo (italiano): ciò che usano l'«Analisi», la revisione di stile dell'editor
// e il riconoscimento dei nomi per un romanzo scritto in questa lingua. Si può ampliare liberamente.
export default {
  // Parole vuote (articoli, preposizioni, pronomi, verbi ausiliari, avverbi comuni):
  // non contano come ripetizioni né tra le parole più usate. Non importa se con o senza accento.
  stop: (
    'il lo la i gli le un uno una a ad da di in con su per tra fra al allo alla ai agli alle dal dallo dalla dai '
    + 'dagli dalle del dello della dei degli delle nel nello nella nei negli nelle sul sullo sulla sui sugli sulle col '
    + 'coi sopra sotto dentro fuori verso senza contro presso oltre durante e ed o od ma però pure anche né che se come '
    + 'quando perché poiché mentre sebbene benché dunque quindi cioè ovvero io tu lui lei egli ella esso essa noi voi '
    + 'loro essi esse mi ti ci vi si ne me te sé li glielo mio mia miei mie tuo tua tuoi tue suo sua suoi sue nostro '
    + 'nostra nostri nostre vostro vostra vostri vostre proprio propria questo questa questi queste quello quella '
    + 'quelli quelle quel quei quegli ciò costui colui chi cui quale quali quanto quanta quanti quante dove essere sono '
    + 'sei è siamo siete era eri eravamo eravate erano fu fosti fummo foste furono sarà saranno sarebbe sarebbero sia '
    + 'siano fosse fossero stato stata stati state essendo stare sto stai sta stiamo stanno stava stavo stavamo stavano '
    + 'stette stettero stesse stando avere ho hai ha abbiamo avete hanno avevo aveva avevamo avevano ebbe ebbero avesse '
    + 'avuto avendo potere posso puoi può possiamo possono poteva potevo potevano poté dovere devo devi deve dobbiamo '
    + 'devono doveva dovevano dovette volere voglio vuoi vuole vogliamo vogliono voleva volevano volle fare faccio fai '
    + 'fa facciamo fanno faceva facevano fece fecero fatto facendo dire dico dici dice dicono diceva dicevano disse '
    + 'dissero detto dicendo andare va vado vai vanno andava andavano andò andarono andato vedere vide videro dare '
    + 'diede diedero ora adesso ancora già sempre mai qui qua lì là così molto molta molti molte poco poca pochi poche '
    + 'più meno tanto tanta tanti tante troppo tutto tutta tutti tutte ogni altro altra altri altre stesso stessa '
    + 'stessi certo certa nulla niente nessuno nessuna qualche qualcosa qualcuno alcuni alcune alcun alcuno alcuna non '
    + 'sì no allora poi dopo prima ieri oggi domani subito forse solo soltanto sol ormai quasi appena perfino neanche '
    + 'nemmeno neppure bene male intanto invece '
    + "c'era c'è c'erano l'ho l'ha un'altra un'altro"
  ).split(' '),

  // Intercalari e riempitivi: parole e locuzioni che si infilano senza aggiungere nulla.
  fillers: ["all'improvviso", 'di colpo', 'di punto in bianco', 'in quel momento', "in quell'istante", 'per un momento',
    'per un istante', 'un poco', "un po'", 'in effetti', 'in fondo', 'in realtà', 'la verità è che', 'il fatto è che', 'di fatto',
    'naturalmente', 'ovviamente', 'evidentemente', 'chiaramente', 'praticamente', 'letteralmente', 'semplicemente',
    'davvero', 'veramente', 'sostanzialmente', 'abbastanza', 'cosa', 'cose', 'iniziò a', 'cominciò a', 'sembrava',
    'sembrò', 'sospirò', 'annuì', 'sorrise', 'alzò le spalle', 'scrollò le spalle', 'aggrottò la fronte', 'ingoiò saliva',
    'deglutì'],

  // Avverbi di modo riconosciuti dalla terminazione. `exceptions`: parole in -mente che non lo sono.
  adverbs: {
    suffix: 'mente', minLength: 7, per1000: 9,
    exceptions: ['demente', 'clemente', 'veemente', 'vehemente', 'semente', 'gemente'],
  },

  // Articoli che possono precedere un nome («Il Faro»): il nome si cerca anche senza.
  // Quelli che si apostrofano si scrivono con l'apostrofo alla fine («l'»).
  articles: ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', "l'", "un'"],

  // Appellativi e titoli che precedono un nome proprio («Don Chisciotte» → «Chisciotte»).
  titles: ['don', 'signor', 'signore', 'signora', 'signorina', 'dottor', 'dottore',
    'dottoressa', 'prof', 'professore', 'professoressa', 'capitano', 'padre', 'madre', 'zio', 'zia', 'frate',
    'suor', 'san', 'santo', 'santa', 're', 'regina', 'principe', 'principessa', 'conte',
    'contessa', 'duca', 'duchessa', 'generale', 'colonnello', 'sergente', 'tenente', 'maestro', 'maestra', 'nonno',
    'nonna', 'maggiore', 'ammiraglio'],
};
