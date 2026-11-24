// List pro kontrolu textu (čeština): používají ho „Analýza“, kontrola stylu v editoru
// a rozpoznávání jmen v románu psaném v tomto jazyce. Lze ho libovolně rozšiřovat.
export default {
  // Běžná slova (spojky, předložky, zájmena, pomocná slovesa, časté příslovce): nepočítají se
  // jako opakování ani mezi nejčastějšími slovy. S diakritikou i bez ní je to jedno.
  stop: (
    'a aby ač ačkoli ale ani až asi ať avšak bez bude budou budu budeš budeme budete byl byla bylo byli byly být jsem jsi '
    + 'jsme jste jsou je jest by bych bys bychom byste co což čeho čemu čím či dál další do dokonce '
    + 'když kdy kde kdo kdož kdyby kam každý každá každé každou kolem které který která kterou kterého kterému kterých '
    + 'kterým kteří koho komu kým kterak já mě mne mně mi mnou my nás nám námi ty tě tebe tobě ti tebou vy vás vám vámi '
    + 'on ho jej jeho mu jemu něm jím ona jí ji ní ni jiní ono ony oni jich jim jimi nich nim nimi se si sebe sobě sebou '
    + 'můj má moje mé mého mému mých mým mou svůj svá své svého svému svých svým svou tvůj tvá tvé náš naše našeho našich '
    + 'váš vaše její jejich ten ta to tu toho tomu tom tím té tou těch těm těmi tento tato toto tyto tuto tohoto '
    + 'tomto takový taková takové tak takto také též tedy tady tam teď potom pak pořád stále ještě již už vždy vždycky '
    + 'nikdy někdy někde někdo něco nic nikdo nikde žádný žádná žádné jak jako jakmile jaký jaká jaké jen jenom jenže jestli '
    + 'jestliže kvůli mezi mimo na nad nade o ode od po pod pode podle pro proti před přes při přece protože proto '
    + 'pouze s u v ve za ze z zda zde však zatím zase znovu často velmi více méně moc trochu mít měl měla mělo měli měly '
    + 'mohl mohla mohlo mohli mohly může můžu můžeš můžeme můžete mohou musel musela museli chtěl chtěla chtěli řekl řekla '
    + 'řekli dělat udělal udělala vlastně právě hned vůbec spíš snad nebo anebo ne ano nechť přitom nyní'
  ).split(' '),

  // Výplně: slova a obraty, které se do textu vkrádají, aniž by cokoli přidaly.
  fillers: ['najednou', 'vtom', 'v tu chvíli', 'v tom okamžiku', 'v jednu chvíli', 'na okamžik', 'na chvíli', 'trochu',
    'poněkud', 'vlastně', 'skutečně', 'opravdu', 'prostě', 'v podstatě', 'doslova', 'samozřejmě', 'očividně', 'zjevně',
    'téměř', 'docela', 'celkem', 'nějak', 'něco', 'věc', 'věci', 'začal', 'začala', 'zdálo se', 'povzdechl si',
    'povzdechla si', 'přikývl', 'přikývla', 'usmál se', 'usmála se', 'pokrčil rameny', 'pokrčila rameny',
    'svraštil čelo', 'svraštila čelo', 'polkl', 'polkla'],

  // Příslovce způsobu nemají v češtině spolehlivou příponu: je lepší nepočítat nic než počítat špatně.
  adverbs: null,

  // Čeština nemá členy.
  articles: [],

  // Oslovení a tituly před jménem nebo příjmením.
  titles: ['pan', 'paní', 'slečna', 'pane', 'doktor', 'doktore', 'dr', 'profesor', 'profesore', 'prof', 'kapitán', 'kapitáne',
    'major', 'plukovník', 'generál', 'poručík', 'seržant', 'páter', 'otec', 'matka', 'sestra', 'bratr', 'strýc', 'strejda',
    'teta', 'král', 'královna', 'princ', 'princezna', 'hrabě', 'hraběnka', 'baron', 'svatý', 'svatá', 'sv', 'mistr',
    'inženýr', 'ing', 'komisař'],
};
