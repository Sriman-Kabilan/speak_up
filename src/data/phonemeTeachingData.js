/**
 * Phoneme Teaching Database
 * Comprehensive teaching content for all English phonemes
 * Focused on common Indian English pronunciation challenges
 */

export const PHONEME_TEACHING_DATA = {
  // VOWELS
  'AA': {
    name: 'AA',
    example: 'hot, pot, father',
    mouthPosition: [
      'Drop your jaw FULLY down (maximum opening)',
      'Open mouth VERY WIDE like at the dentist',
      'Keep tongue FLAT and LOW in mouth',
      'Lips relaxed, NOT rounded'
    ],
    steps: [
      'Relax your entire jaw',
      'Drop jaw down as far as comfortable',
      'Say "ahhh" like at the doctor for 0.5 seconds',
      'Feel the sound coming from deep in throat'
    ],
    commonMistakes: [
      { wrong: 'Closing mouth too much', sounds: 'AE (hat)', fix: 'Open jaw WIDER' },
      { wrong: 'Not dropping jaw enough', sounds: 'AH (cup)', fix: 'Drop jaw MORE' },
      { wrong: 'Rounding lips', sounds: 'AO (caught)', fix: 'Keep lips relaxed' }
    ],
    practiceWords: ['hot', 'pot', 'lot', 'dot', 'got', 'father', 'palm'],
    stress: 'Usually the MAIN stressed vowel in words'
  },

  'AE': {
    name: 'AE',
    example: 'cat, hat, bad',
    mouthPosition: [
      'Stretch mouth WIDE like a big smile',
      'Pull lips BACK towards ears',
      'Jaw drops slightly (not as much as AA)',
      'Tongue stays LOW and FLAT'
    ],
    steps: [
      'Smile widely showing teeth',
      'Pull corners of mouth back',
      'Drop jaw slightly (half of AA)',
      'Say "a" while maintaining the smile'
    ],
    commonMistakes: [
      { wrong: 'Not smiling enough', sounds: 'EH (bed)', fix: 'Stretch mouth WIDER' },
      { wrong: 'Opening jaw too much', sounds: 'AA (hot)', fix: 'Less jaw drop' },
      { wrong: 'Lips not pulled back', sounds: 'unclear', fix: 'Pull lips BACK' }
    ],
    practiceWords: ['cat', 'hat', 'bat', 'mat', 'sad', 'bad', 'hand'],
    stress: 'Often stressed in one-syllable words'
  },

  'HH': {
    name: 'HH',
    example: 'hot, hat, house',
    mouthPosition: [
      'Mouth open in position for next vowel',
      'Tongue relaxed, not touching anything',
      'Throat slightly constricted',
      'No lip movement needed'
    ],
    steps: [
      'Take a breath in',
      'Exhale FORCEFULLY from deep in throat',
      'Make a "hhhh" sound like fogging a mirror',
      'Feel warm air on your hand'
    ],
    commonMistakes: [
      { wrong: 'Too weak/silent', sounds: 'almost nothing', fix: 'Blow MORE air' },
      { wrong: 'Using throat too much', sounds: 'KH (like German)', fix: 'Lighter, just breath' },
      { wrong: 'Closing mouth', sounds: 'muffled', fix: 'Keep mouth OPEN' }
    ],
    practiceWords: ['hot', 'hat', 'house', 'hand', 'happy', 'hello'],
    stress: 'Always at the START of syllable, never stressed itself'
  },

  'T': {
    name: 'T',
    example: 'top, cat, water',
    mouthPosition: [
      'Touch tongue TIP to roof behind upper teeth',
      'Build up air pressure behind tongue',
      'Lips slightly open',
      'Teeth slightly apart'
    ],
    steps: [
      'Place tongue tip on roof of mouth',
      'Press firmly to seal',
      'Build pressure behind tongue',
      'Release SHARPLY with a small burst of air'
    ],
    commonMistakes: [
      { wrong: 'Too soft/weak', sounds: 'D or unclear', fix: 'Release MORE sharply' },
      { wrong: 'Tongue too far back', sounds: 'K', fix: 'Touch FRONT of roof' },
      { wrong: 'Not releasing', sounds: 'held/stuck', fix: 'Quick SHARP release' }
    ],
    practiceWords: ['top', 'tip', 'cat', 'hot', 'water', 'better'],
    stress: 'Stronger at word start, softer in middle/end'
  },

  'TH': {
    name: 'TH',
    example: 'think, three, bath',
    mouthPosition: [
      'Place tongue TIP between upper and lower teeth',
      'Tongue should stick out SLIGHTLY',
      'Teeth lightly touch tongue',
      'Lips relaxed and open'
    ],
    steps: [
      'Stick tongue out slightly between teeth',
      'Let teeth touch tongue lightly',
      'Blow air gently over tongue',
      'Should feel air on tongue tip'
    ],
    commonMistakes: [
      { wrong: 'Using T instead', sounds: 'tink (think)', fix: 'Tongue BETWEEN teeth' },
      { wrong: 'Using S instead', sounds: 'sink (think)', fix: 'Tongue must TOUCH teeth' },
      { wrong: 'Tongue behind teeth', sounds: 'T or D', fix: 'Tongue BETWEEN teeth' }
    ],
    practiceWords: ['think', 'thank', 'three', 'throw', 'bath', 'math'],
    stress: 'Same stress as surrounding sounds'
  },

  'DH': {
    name: 'DH',
    example: 'this, that, the',
    mouthPosition: [
      'Place tongue TIP between teeth (same as TH)',
      'Tongue sticks out slightly',
      'Teeth touch tongue lightly',
      'Vocal cords VIBRATE (voiced)'
    ],
    steps: [
      'Position tongue between teeth like TH',
      'Start vocal cord vibration (hum)',
      'Blow air while vibrating',
      'Should feel buzzing on tongue'
    ],
    commonMistakes: [
      { wrong: 'Using D instead', sounds: 'dis (this)', fix: 'Tongue BETWEEN teeth' },
      { wrong: 'Using Z instead', sounds: 'zis (this)', fix: 'Tongue must TOUCH teeth' },
      { wrong: 'Not voicing', sounds: 'TH (think)', fix: 'Add vocal vibration' }
    ],
    practiceWords: ['this', 'that', 'the', 'they', 'there', 'mother'],
    stress: 'Usually unstressed (in "the", "this")'
  },

  'V': {
    name: 'V',
    example: 'very, voice, have',
    mouthPosition: [
      'Touch UPPER teeth to LOWER lip',
      'Lower lip slightly inside upper teeth',
      'Upper teeth visible',
      'Vocal cords VIBRATE'
    ],
    steps: [
      'Bite lower lip gently with upper teeth',
      'Start vocal cord vibration',
      'Blow air while vibrating',
      'Should feel buzzing on lip'
    ],
    commonMistakes: [
      { wrong: 'Using W instead', sounds: 'wery (very)', fix: 'Teeth MUST touch lip' },
      { wrong: 'Rounding lips', sounds: 'W', fix: 'NO lip rounding' },
      { wrong: 'Not voicing', sounds: 'F', fix: 'Add vocal vibration' }
    ],
    practiceWords: ['very', 'voice', 'video', 'have', 'love', 'give'],
    stress: 'Can be stressed or unstressed'
  },

  'W': {
    name: 'W',
    example: 'water, we, away',
    mouthPosition: [
      'ROUND lips tightly (like kissing)',
      'Lips pushed forward',
      'NO teeth contact with lips',
      'Vocal cords vibrate'
    ],
    steps: [
      'Pucker lips like kissing',
      'Push lips forward',
      'Start vocal vibration',
      'Quickly move to next vowel'
    ],
    commonMistakes: [
      { wrong: 'Using V instead', sounds: 'vater (water)', fix: 'NO teeth on lip' },
      { wrong: 'Not rounding enough', sounds: 'unclear', fix: 'Round lips MORE' },
      { wrong: 'Holding too long', sounds: 'oo-ater', fix: 'Quick transition' }
    ],
    practiceWords: ['water', 'we', 'will', 'way', 'word', 'away'],
    stress: 'Never stressed itself, leads to vowel'
  },

  'R': {
    name: 'R',
    example: 'red, right, car',
    mouthPosition: [
      'CURL tongue back (retroflex)',
      'Tongue does NOT touch roof',
      'Tongue tip points toward throat',
      'Lips slightly rounded'
    ],
    steps: [
      'Curl tongue tip back toward throat',
      'Keep tongue floating (not touching)',
      'Round lips slightly',
      'Make sound from throat'
    ],
    commonMistakes: [
      { wrong: 'Using L instead', sounds: 'led (red)', fix: 'CURL tongue back' },
      { wrong: 'Touching roof', sounds: 'unclear', fix: 'Keep tongue FLOATING' },
      { wrong: 'Not rounding lips', sounds: 'weak', fix: 'Round lips slightly' }
    ],
    practiceWords: ['red', 'right', 'run', 'car', 'far', 'more'],
    stress: 'Can be stressed or unstressed'
  },

  'L': {
    name: 'L',
    example: 'light, love, call',
    mouthPosition: [
      'Touch tongue TIP to roof behind teeth',
      'Tongue tip pressed FIRMLY',
      'Sides of tongue down (air flows around)',
      'Vocal cords vibrate'
    ],
    steps: [
      'Press tongue tip to roof firmly',
      'Keep sides of tongue down',
      'Vibrate vocal cords',
      'Air flows around sides of tongue'
    ],
    commonMistakes: [
      { wrong: 'Using R instead', sounds: 'right (light)', fix: 'Touch tongue to ROOF' },
      { wrong: 'Weak contact', sounds: 'unclear', fix: 'Press FIRMLY' },
      { wrong: 'Tongue too far back', sounds: 'dark L', fix: 'Touch FRONT of roof' }
    ],
    practiceWords: ['light', 'love', 'like', 'call', 'feel', 'well'],
    stress: 'Can be stressed or unstressed'
  },

  'IY': {
    name: 'IY',
    example: 'see, tree, happy',
    mouthPosition: [
      'Stretch lips WIDE (big smile)',
      'Tongue HIGH and FORWARD',
      'Tongue almost touching roof',
      'Jaw almost closed'
    ],
    steps: [
      'Smile widely',
      'Raise tongue high toward roof',
      'Keep jaw almost closed',
      'Hold sound for 0.3 seconds'
    ],
    commonMistakes: [
      { wrong: 'Not smiling enough', sounds: 'IH (sit)', fix: 'Stretch lips WIDER' },
      { wrong: 'Tongue too low', sounds: 'IH', fix: 'Raise tongue HIGHER' },
      { wrong: 'Too short', sounds: 'IH', fix: 'Hold LONGER' }
    ],
    practiceWords: ['see', 'tree', 'free', 'happy', 'key', 'me'],
    stress: 'Often stressed in words'
  },

  'S': {
    name: 'S',
    example: 'sit, see, bus',
    mouthPosition: [
      'Teeth almost closed together',
      'Tongue tip near (not touching) upper teeth ridge',
      'Air flows through narrow gap in center',
      'Lips slightly spread'
    ],
    steps: [
      'Bring teeth close together',
      'Place tongue tip near roof behind teeth',
      'Blow air through the narrow gap',
      'Should sound like a hissing snake'
    ],
    commonMistakes: [
      { wrong: 'Tongue touching teeth', sounds: 'TH', fix: 'Keep tongue NEAR but not touching' },
      { wrong: 'Too much air', sounds: 'SH', fix: 'Narrow the airflow' },
      { wrong: 'Jaw too open', sounds: 'unclear', fix: 'Close teeth more' }
    ],
    practiceWords: ['sit', 'see', 'sun', 'bus', 'yes', 'this'],
    stress: 'Can appear at start, middle, or end of words'
  },

  'IH': {
    name: 'IH',
    example: 'sit, bit, happy',
    mouthPosition: [
      'Lips slightly spread (small smile)',
      'Tongue high but RELAXED',
      'Jaw slightly more open than IY',
      'Shorter duration than IY'
    ],
    steps: [
      'Relax mouth (not full smile)',
      'Raise tongue but keep relaxed',
      'Open jaw slightly',
      'Quick, short sound'
    ],
    commonMistakes: [
      { wrong: 'Too much smile', sounds: 'IY (see)', fix: 'RELAX lips more' },
      { wrong: 'Tongue too high', sounds: 'IY', fix: 'Lower tongue slightly' },
      { wrong: 'Too long', sounds: 'IY', fix: 'Make it SHORTER' }
    ],
    practiceWords: ['sit', 'bit', 'hit', 'fit', 'kit', 'it'],
    stress: 'Usually unstressed or lightly stressed'
  }
};

/**
 * Get teaching data for a phoneme
 */
export function getPhonemeTeaching(phoneme) {
  return PHONEME_TEACHING_DATA[phoneme] || {
    name: phoneme,
    example: 'various words',
    mouthPosition: ['Position your mouth for this sound'],
    steps: ['Practice this sound carefully'],
    commonMistakes: [],
    practiceWords: [],
    stress: 'Varies by context'
  };
}

/**
 * Get all available phonemes
 */
export function getAllPhonemes() {
  return Object.keys(PHONEME_TEACHING_DATA);
}
