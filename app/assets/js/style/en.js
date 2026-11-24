// Text review sheet (English): what «Analysis», the editor's style review and name detection use
// for a novel written in this language. It can be freely extended.
export default {
  // Stop words (articles, prepositions, pronouns, auxiliaries, common adverbs): they do not count
  // as repetitions or among the most used words.
  stop: (
    'a about after again against all along also am among an and another any are around as at be because been before '
    + 'being between both but by can could did didn do does doing done down during each either even every for from had '
    + 'has have having he her here hers him his how i if in into is it its just like me might mine more most much must my '
    + 'neither no not now of off on one only onto or other our ours out over own said says same shall she should so some '
    + 'still such than that the their theirs them then there these they this those through to too under up upon very was '
    + 'we were what when where which while who whom whose will with within without would yet you your yours'
  ).split(' '),

  // Filler words and stock phrases.
  fillers: ['suddenly', 'all of a sudden', 'at that moment', 'for a moment', 'a bit', 'a little', 'in fact', 'of course',
    'really', 'just', 'very', 'quite', 'rather', 'actually', 'basically', 'literally', 'obviously', 'clearly', 'somehow',
    'began to', 'started to', 'seemed', 'sighed', 'nodded', 'smiled', 'shrugged', 'frowned'],

  // Manner adverbs recognised by their ending (see es.js).
  adverbs: {
    suffix: 'ly', minLength: 5, per1000: 18,
    exceptions: ['only', 'family', 'early', 'reply', 'apply', 'supply', 'fly', 'july', 'italy', 'belly', 'holy', 'ugly',
      'lonely', 'friendly', 'lovely', 'silly', 'jelly', 'ally', 'rely', 'bully', 'daily', 'likely', 'elderly', 'curly',
      'lily', 'emily', 'sally', 'molly', 'ply', 'reply', 'assembly', 'butterfly', 'monopoly', 'anomaly', 'homily'],
  },

  // Articles that can precede a name («The Lighthouse»).
  articles: ['the', 'a', 'an'],

  // Forms of address and titles before a proper name.
  titles: ['mr', 'mrs', 'ms', 'miss', 'sir', 'lady', 'lord', 'dr', 'doctor', 'captain', 'father', 'mother', 'uncle', 'aunt',
    'king', 'queen', 'prince', 'princess', 'saint', 'st', 'professor', 'general', 'colonel', 'sergeant', 'lieutenant'],
};
