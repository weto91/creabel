// English trait sheet: the keywords used to extract traits from a text.
// Extend it freely by adding words to the lists.
export default {
  // In English the adjective goes before the noun ("blue eyes"); adjectives after the noun
  // only count when a linking verb follows it ("her eyes were blue").
  prenominal: true,
  copulas: ['is', 'are', 'was', 'were', 'looked', 'seemed', 'look', 'seem'],

  features: [
    { nouns: ['eye', 'eyes', 'gaze'], groups: ['color', 'size', 'eyes'] },
    { nouns: ['hair', 'locks', 'curls'], groups: ['color', 'hair', 'length'] },
    { nouns: ['skin', 'complexion'], groups: ['color', 'skin'] },
    { nouns: ['beard', 'stubble'], groups: ['color', 'hair', 'length', 'density'], presence: true },
    { nouns: ['moustache', 'mustache'], groups: ['color', 'length', 'density'], presence: true },
    { nouns: ['nose'], groups: ['size', 'nose'] },
    { nouns: ['lips', 'mouth'], groups: ['size', 'lips', 'color'] },
    { nouns: ['face', 'features'], groups: ['face', 'size'] },
    { nouns: ['hands', 'fingers'], groups: ['size', 'hands', 'length'] },
    { nouns: ['voice'], groups: ['voice'] },
    { nouns: ['eyebrows', 'brows'], groups: ['color', 'density', 'size'] },
    { nouns: ['shoulders', 'back'], groups: ['size', 'shoulders'] },
    { nouns: ['legs', 'arms'], groups: ['length', 'size', 'hands'] },
    { nouns: ['smile'], groups: ['smile', 'size'] },
    { nouns: ['glasses', 'spectacles'], groups: ['size'], presence: true },
    { nouns: ['freckles'], groups: [], presence: true },
    { nouns: ['scar', 'scars'], groups: ['size'], presence: true },
    { nouns: ['tattoo', 'tattoos'], groups: ['size'], presence: true },
    { nouns: ['mole', 'moles'], groups: [], presence: true },
    { nouns: ['wrinkles'], groups: [], presence: true },
    { nouns: ['limp'], groups: [], presence: true },
  ],

  adjectives: {
    color: ['blue', 'green', 'brown', 'hazel', 'black', 'blond', 'blonde', 'red', 'ginger', 'auburn', 'grey', 'gray', 'white',
      'silver', 'golden', 'dark', 'fair', 'pale', 'light', 'amber', 'violet', 'chestnut', 'copper', 'tanned', 'olive', 'ruddy',
      'rosy', 'raven', 'sandy'],
    hair: ['straight', 'curly', 'wavy', 'frizzy', 'braided', 'shaved', 'messy', 'tousled', 'silky', 'greasy', 'thin', 'thick',
      'fine', 'tangled', 'loose', 'cropped'],
    length: ['long', 'short'],
    size: ['big', 'large', 'small', 'huge', 'tiny', 'wide', 'narrow', 'thin', 'thick', 'round', 'broad'],
    eyes: ['bright', 'sad', 'piercing', 'sunken', 'bulging', 'slanted', 'deep', 'dreamy', 'tired', 'restless', 'cold', 'warm'],
    skin: ['soft', 'rough', 'wrinkled', 'smooth', 'weathered', 'freckled', 'delicate'],
    nose: ['aquiline', 'hooked', 'crooked', 'upturned', 'snub', 'sharp', 'straight', 'prominent'],
    lips: ['full', 'thin', 'chapped'],
    face: ['oval', 'angular', 'square', 'gaunt', 'long', 'sharp', 'boyish', 'weathered', 'freckled', 'wrinkled'],
    hands: ['strong', 'delicate', 'calloused', 'bony', 'sinewy', 'muscular', 'slender'],
    shoulders: ['stooped', 'hunched', 'straight', 'strong'],
    voice: ['deep', 'high', 'hoarse', 'soft', 'sweet', 'shrill', 'raspy', 'husky', 'melodious', 'nasal', 'low', 'firm',
      'cracked', 'slow', 'velvety', 'powerful', 'weak'],
    density: ['bushy', 'thick', 'thin', 'trimmed', 'neat', 'scruffy', 'fine'],
    smile: ['frank', 'shy', 'crooked', 'wide', 'sad', 'mocking', 'warm', 'forced'],
  },

  standalone: [
    // Build
    'tall', 'short', 'slim', 'slender', 'thin', 'skinny', 'fat', 'stout', 'stocky', 'burly', 'muscular', 'athletic',
    'petite', 'lanky', 'chubby', 'plump', 'wiry', 'stooped',
    // Looks
    'attractive', 'handsome', 'beautiful', 'pretty', 'ugly', 'elegant', 'scruffy', 'bald', 'bearded', 'freckled',
    'blond', 'blonde', 'pale',
    // Age
    'young', 'elderly', 'teenage',
    // Character
    'shy', 'brave', 'cowardly', 'generous', 'selfish', 'intelligent', 'clever', 'cunning', 'naive', 'proud', 'humble',
    'kind', 'cruel', 'loyal', 'distrustful', 'ambitious', 'lazy', 'hardworking', 'impulsive', 'patient', 'impatient',
    'cheerful', 'melancholic', 'lonely', 'sociable', 'introverted', 'extroverted', 'optimistic', 'pessimistic', 'stubborn',
    'jealous', 'curious', 'reserved', 'arrogant', 'sensitive', 'affectionate', 'violent', 'calm', 'nervous', 'honest',
    'sarcastic', 'reckless', 'cautious', 'sincere', 'talkative', 'quiet', 'methodical', 'superstitious', 'religious',
    'rebellious', 'obedient', 'vain', 'insecure', 'manipulative',
    // Condition
    'blind', 'deaf', 'mute', 'lame',
  ],

  fillers: ['is', 'are', 'was', 'were', 'very', 'quite', 'rather', 'and', 'or', 'but', 'of', 'colour', 'color', 'a', 'bit',
    'so', 'too', 'always', 'has', 'had', 'the', 'his', 'her', 'their', 'almost', 'though', 'somewhat'],

  negations: ['not', 'no', 'never', 'without', 'neither', 'nor', "isn't", "wasn't", "aren't", "weren't", "doesn't", "didn't", "don't"],

  age: [
    { regex: /\b(\d{1,3})[\s-]years?[\s-]old\b/giu, label: '{n} years old' },
    { regex: /\baged\s+(\d{1,3})\b/giu, label: '{n} years old' },
  ],

  forms(word) {
    return [word];
  },
};
