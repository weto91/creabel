// Controleblad voor de tekst (Nederlands): wat de «Analyse», de stijlcontrole van de editor en de
// herkenning van namen gebruiken bij een roman in deze taal. Het mag vrij worden uitgebreid.
export default {
  // Stopwoorden (lidwoorden, voorzetsels, voornaamwoorden, hulpwerkwoorden, veelvoorkomende bijwoorden):
  // ze tellen niet mee als herhalingen en niet bij de meestgebruikte woorden.
  stop: (
    'de het een en of maar want dat die dit deze dan dus ook nog niet geen wel al als toen omdat doordat hoewel '
    + 'terwijl zodat voordat nadat totdat zodra indien ofschoon ik jij je u hij zij ze wij we jullie me mij jou hem '
    + 'haar ons onze hun hen zich zichzelf zelf mijn mijne jouw jouwe uw uwe zijn zijne hunne wie wat welke welk wiens '
    + 'waar waarom hoe wanneer waarmee waarvan waarop daarmee daarvan daarop daaraan daarin daarna daarvoor daardoor '
    + 'daarom van in op aan bij met naar voor over onder tegen uit door om tot tussen na zonder tijdens sinds binnen '
    + 'buiten achter naast langs ben bent is was waren geweest wezen hebben heb hebt heeft had hadden gehad hebbende '
    + 'worden word wordt werd werden geworden kunnen kan kunt kon konden gekund zullen zal zult zou zouden moeten moet '
    + 'moest moesten gemoeten willen wil wilt wilde wilden gewild mogen mag mocht mochten zeggen zegt zei zeiden gezegd '
    + 'doen doe doet deed deden gedaan gaan ga gaat ging gingen gegaan komen kom komt kwam kwamen gekomen zien zie ziet '
    + 'zag zagen gezien laten laat liet lieten er hier daar nu toch eens even weer altijd nooit niets iets iemand '
    + 'niemand alles alle allen elk elke veel vele weinig meer minder heel zeer erg zo te ja nee ervan erop erin eraan '
    + 'eruit ernaar erover erdoor hierop hieraan hierin hiervan later eerder eerst straks vandaag gisteren morgen boven '
    + 'beneden omhoog omlaag vooral bijna ongeveer misschien soms vaak echter immers namelijk bovendien daarentegen '
    + 'ofwel noch evenmin evenals zowel slechts alleen enkel pas reeds steeds sowieso hoeveel andere ander anders zelfs '
    + 'eigen'
  ).split(' '),

  // Stopwoordjes en stopfrasen: woorden en uitdrukkingen die zich insluipen zonder iets toe te voegen.
  fillers: ['plotseling', 'opeens', 'ineens', 'op dat moment', 'op dat ogenblik', 'een ogenblik', 'een moment',
    'een beetje', 'een tikkeltje', 'eigenlijk', 'echt', 'gewoon', 'werkelijk', 'inderdaad', 'natuurlijk', 'blijkbaar',
    'schijnbaar', 'zogenaamd', 'nogal', 'behoorlijk', 'in feite', 'feitelijk', 'zeg maar', 'dingen', 'begon te', 'leek',
    'scheen', 'zuchtte', 'knikte', 'glimlachte', 'haalde zijn schouders op', 'haalde haar schouders op',
    'haalde de schouders op', 'fronste zijn wenkbrauwen', 'fronste haar wenkbrauwen', 'slikte'],

  // Het Nederlands vormt bijwoorden van wijze niet met een betrouwbare uitgang: ze worden niet geteld.
  adverbs: null,

  // Lidwoorden die voor een naam kunnen staan («De Vuurtoren»): de naam wordt ook zonder gezocht.
  articles: ['de', 'het', 'een'],

  // Aanspreektitels die voor een eigennaam staan («Meneer Jansen» → «Jansen»).
  titles: ['meneer', 'mevrouw', 'mevr', 'mw', 'juffrouw', 'dhr', 'dokter', 'dr', 'prof', 'professor', 'kapitein', 'vader',
    'moeder', 'oom', 'tante', 'broeder', 'zuster', 'pater', 'pastoor', 'sint', 'graaf', 'gravin', 'koning', 'koningin',
    'prins', 'prinses', 'hertog', 'hertogin', 'baron', 'generaal', 'kolonel', 'majoor', 'luitenant', 'sergeant', 'meester',
    'opa', 'oma', 'inspecteur', 'keizer'],
};
