// Prüfblatt für den Text (Deutsch): das, was die «Analyse», die Stilprüfung im Editor und die
// Namenserkennung bei einem Roman in dieser Sprache verwenden. Es kann beliebig erweitert werden.
export default {
  // Stoppwörter (Artikel, Präpositionen, Pronomen, Hilfsverben, häufige Adverbien): sie zählen weder
  // als Wiederholungen noch unter den meistgebrauchten Wörtern. Umlaute und ß spielen keine Rolle.
  stop: (
    'der die das den dem des ein eine einen einem einer eines kein keine keinen keinem keiner und oder aber denn '
    + 'sondern doch weil dass ob wenn als wie wo während bevor nachdem obwohl damit sodass sobald solange falls ich du '
    + 'er sie es wir ihr mich dich ihn uns euch ihnen mir dir ihm mein meine meinen meinem meiner meines dein deine '
    + 'deinen deinem deiner sein seine seinen seinem seiner seines unser unsere unseren unserem unserer euer eure euren '
    + 'eurem eurer ihre ihren ihrem ihrer ihres dieser diese dieses diesen diesem jener jene jenes jenen welcher welche '
    + 'welches wer was wem wen wessen in an auf aus bei mit nach von zu zum zur vom beim im am ins ans aufs über unter '
    + 'vor hinter neben zwischen durch für gegen ohne um bis seit entlang außer statt trotz wegen bin bist ist sind '
    + 'seid war warst waren wart gewesen sei seien wäre wären wärst haben habe hast hat habt hatte hatten hattest '
    + 'hattet gehabt hätte hätten werden werde wirst wird werdet wurde wurden wurdest worden geworden würde würden '
    + 'können kann kannst könnt konnte konnten gekonnt könnte könnten müssen muss musst musste mussten gemusst wollen '
    + 'will willst wollte wollten gewollt sollen soll sollst sollte sollten dürfen darf durfte durften mögen mag mochte '
    + 'sagen sagte sagten gesagt tun tut tat taten getan machen macht machte machten gemacht gehen geht ging gingen '
    + 'gegangen kommen kommt kam kamen gekommen sehen sah sahen gesehen nicht nur auch noch schon sehr immer nie '
    + 'niemals nichts dann da dort hier jetzt nun wieder mal ganz so fast etwa eben bloß wohl vielleicht ja nein man '
    + 'sich selbst selber alle alles allem aller allen viel viele vielen mehr weniger einige einigen manche manchen '
    + 'andere anderen anderer anderes jeder jede jedes jeden jedem etwas zurück hin her heraus herein hinaus hinein '
    + 'bald gleich gerade damals später früher heute gestern morgen oben unten drinnen draußen dabei dazu davon darauf '
    + 'daran darin dafür dagegen danach davor darüber darunter hierzu hierbei deshalb deswegen daher dennoch trotzdem '
    + 'jedoch zwar sogar bereits inzwischen schließlich zuerst zuletzt nämlich also außerdem ebenfalls ebenso genauso '
    + 'woher wohin warum weshalb wieso wann wieviel'
  ).split(' '),

  // Füllwörter und Floskeln: Wörter und Wendungen, die sich einschleichen, ohne etwas beizutragen.
  fillers: ['plötzlich', 'auf einmal', 'mit einem mal', 'in diesem moment', 'in dem moment', 'im selben augenblick',
    'einen moment lang', 'einen augenblick lang', 'ein wenig', 'ein bisschen', 'ein paar', 'tatsächlich', 'eigentlich',
    'irgendwie', 'einfach', 'wirklich', 'quasi', 'im grunde', 'sozusagen', 'übrigens', 'natürlich', 'offenbar',
    'anscheinend', 'ziemlich', 'ganz', 'sache', 'dinge', 'begann zu', 'fing an zu', 'schien', 'seufzte', 'nickte',
    'lächelte', 'zuckte mit den schultern', 'zuckte die achseln', 'runzelte die stirn', 'schluckte'],

  // Das Deutsche bildet Modaladverbien nicht mit einer verlässlichen Endung: sie werden nicht gezählt.
  adverbs: null,

  // Artikel, die vor einem Namen stehen können («Der Leuchtturm»): der Name wird auch ohne sie gesucht.
  articles: ['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines'],

  // Anreden und Titel, die einem Eigennamen vorangehen («Herr Müller» → «Müller»).
  titles: ['herr', 'frau', 'fräulein', 'dr', 'doktor', 'prof', 'professor', 'hauptmann', 'kapitän',
    'vater', 'mutter', 'onkel', 'tante', 'bruder', 'schwester', 'pater', 'pfarrer', 'sankt', 'graf', 'gräfin',
    'könig', 'königin', 'prinz', 'prinzessin', 'herzog', 'herzogin', 'fürst', 'kaiser', 'baron', 'general', 'oberst',
    'major', 'leutnant', 'sergeant', 'opa', 'oma', 'kommissar'],
};
