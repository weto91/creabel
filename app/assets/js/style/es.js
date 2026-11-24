// Hoja de revisión del texto (español): lo que usan «Análisis», la revisión de estilo del editor
// y la detección de nombres para una novela escrita en este idioma. Se puede ampliar libremente.
export default {
  // Palabras vacías (artículos, preposiciones, pronombres, verbos auxiliares, adverbios comunes):
  // no cuentan como repeticiones ni entre las palabras más usadas. Da igual con o sin tilde.
  stop: (
    'a al algo algún alguna algunas alguno algunos alguien ante antes ahí ahora allá allí aquel aquella aquellas aquello '
    + 'aquellos aquí así aun aún aunque bien cada casi como cómo con contra cual cuál cuales cuando cuándo cuanto cuya cuyo '
    + 'de del desde después donde dónde dos durante e el él ella ellas ello ellos en entonces entre era eran eras eres es esa '
    + 'esas ese eso esos esta está estaba estaban estado estamos están estar estas este esto estos estoy estuvo éramos fue '
    + 'fuera fuese fueron fui ha había habían habría haber hace hacer hacía hacia han has hasta hay he hecho hizo hubiera hubo '
    + 'jamás la las le les lo los luego más me menos mi mí mientras mis misma mismas mismo mismos mucha muchas mucho muchos '
    + 'muy nada nadie ni ninguna ningún no nos nosotros nuestra nuestras nuestro nuestros nunca o os otra otras otro otros '
    + 'para pero poca pocas poco pocos podía poder pudo puede pueden pues porque que qué quien quién quienes quizá quizás se '
    + 'sea sean según ser si sí sido siempre siendo sin sino sobre solo sólo somos son soy su sus suya suyas suyo suyos '
    + 'también tampoco tan tanta tantas tanto tantos te tener tenía tenían tengo ti tiene tienen toda todas todavía todo '
    + 'todos tal tras tu tú tus tuvo un una unas uno unos usted ustedes va vez vosotros vuestra vuestro ya yo además '
    + 'mediante decía decir dijo dice dicho sería cuantos cuantas'
  ).split(' '),

  // Muletillas y comodines: palabras y giros que se cuelan sin aportar.
  fillers: ['de repente', 'de pronto', 'en ese momento', 'en aquel momento', 'por un momento', 'un poco', 'un tanto',
    'la verdad es que', 'lo cierto es que', 'de hecho', 'por supuesto', 'sin embargo', 'no obstante', 'realmente',
    'simplemente', 'básicamente', 'literalmente', 'obviamente', 'evidentemente', 'claramente', 'prácticamente', 'bastante',
    'muy', 'algo', 'cosa', 'cosas', 'empezó a', 'comenzó a', 'parecía', 'pareció', 'suspiró', 'asintió', 'sonrió',
    'se encogió de hombros', 'frunció el ceño', 'tragó saliva'],

  // Adverbios de modo que se reconocen por su terminación. `minLength`: largo mínimo de la
  // palabra; `exceptions`: palabras con esa terminación que no lo son; `per1000`: a partir de
  // cuántos por cada mil palabras se avisa. null si el idioma no tiene una terminación fiable.
  adverbs: { suffix: 'mente', minLength: 7, exceptions: ['demente', 'clemente', 'vehemente'], per1000: 9 },

  // Artículos que pueden ir delante de un nombre («El faro»): el nombre se busca también sin él.
  // Los que se apostrofan se escriben con el apóstrofo al final («l'»).
  articles: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo'],

  // Tratamientos y títulos que preceden a un nombre propio y no sirven por sí solos para
  // reconocerlo («Don Quijote» → «Quijote»).
  titles: ['don', 'doña', 'señor', 'señora', 'sr', 'sra', 'srta', 'dr', 'dra', 'doctor', 'doctora', 'capitán', 'padre',
    'madre', 'tío', 'tía', 'fray', 'sor', 'san', 'santa', 'rey', 'reina', 'príncipe', 'princesa', 'conde', 'condesa',
    'duque', 'duquesa', 'general', 'coronel', 'sargento', 'teniente', 'profesor', 'profesora', 'maestro', 'maestra'],
};
