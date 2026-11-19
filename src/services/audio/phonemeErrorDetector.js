// Phoneme Error Detector - Identifies specific phoneme substitutions
export class PhonemeErrorDetector {
  constructor() {
    // Common Indian English phoneme substitutions
    this.commonSubstitutions = {
      'TH': ['T', 'D', 'S'],      // think → tink, dis
      'DH': ['D', 'TH'],          // this → dis
      'V': ['W', 'B'],            // very → wery
      'W': ['V'],                 // west → vest
      'R': ['D', 'L'],            // right → dight
      'L': ['R'],                 // light → right
      'Z': ['S', 'J'],            // zoo → soo
      'SH': ['S'],                // ship → sip
      'CH': ['S'],                // chair → sair
      'NG': ['N', 'NG G'],        // sing → sin
    };

    // Phoneme acoustic features for similarity detection
    this.phonemeFeatures = {
      'TH': { manner: 'fricative', place: 'dental', voice: false },
      'DH': { manner: 'fricative', place: 'dental', voice: true },
      'T': { manner: 'stop', place: 'alveolar', voice: false },
      'D': { manner: 'stop', place: 'alveolar', voice: true },
      'V': { manner: 'fricative', place: 'labiodental', voice: true },
      'W': { manner: 'approximant', place: 'labial', voice: true },
      'R': { manner: 'approximant', place: 'alveolar', voice: true },
      'L': { manner: 'lateral', place: 'alveolar', voice: true },
      'S': { manner: 'fricative', place: 'alveolar', voice: false },
      'Z': { manner: 'fricative', place: 'alveolar', voice: true },
      'SH': { manner: 'fricative', place: 'postalveolar', voice: false },
      'CH': { manner: 'affricate', place: 'postalveolar', voice: false },
      'NG': { manner: 'nasal', place: 'velar', voice: true },
    };
  }

  // Detect what phoneme the user likely said instead of expected
  detectSubstitution(expectedPhoneme, userMFCC, refMFCC, distance) {
    // If distance is low, phoneme is correct
    if (distance < 0.35) {
      return {
        correct: true,
        expected: expectedPhoneme,
        detected: expectedPhoneme,
        confidence: 1 - distance,
        errorType: null
      };
    }

    // High distance indicates wrong phoneme
    const likelySubstitutions = this.commonSubstitutions[expectedPhoneme] || [];
    
    // Analyze MFCC characteristics to guess substitution
    const detectedPhoneme = this.guessPhonemeFromMFCC(
      expectedPhoneme,
      userMFCC,
      refMFCC,
      likelySubstitutions
    );

    const errorType = this.classifyError(expectedPhoneme, detectedPhoneme);

    console.log(`🔍 Phoneme error detected: Expected ${expectedPhoneme}, likely said ${detectedPhoneme} (${errorType})`);

    return {
      correct: false,
      expected: expectedPhoneme,
      detected: detectedPhoneme,
      confidence: Math.max(0, 1 - distance),
      errorType,
      teachingTip: this.getTeachingTip(expectedPhoneme, detectedPhoneme)
    };
  }

  // Guess phoneme from MFCC characteristics
  guessPhonemeFromMFCC(expectedPhoneme, userMFCC, refMFCC, likelySubstitutions) {
    if (likelySubstitutions.length === 0) {
      return expectedPhoneme; // No known substitutions
    }

    // For now, return most common substitution
    // In production, this would analyze MFCC features more deeply
    return likelySubstitutions[0];
  }

  // Classify type of error
  classifyError(expected, detected) {
    const expFeatures = this.phonemeFeatures[expected];
    const detFeatures = this.phonemeFeatures[detected];

    if (!expFeatures || !detFeatures) {
      return 'substitution';
    }

    if (expFeatures.manner !== detFeatures.manner) {
      return 'manner_error'; // Wrong way of producing sound
    }
    if (expFeatures.place !== detFeatures.place) {
      return 'place_error'; // Wrong place in mouth
    }
    if (expFeatures.voice !== detFeatures.voice) {
      return 'voicing_error'; // Wrong voicing
    }

    return 'substitution';
  }

  // Get teaching tip for specific error
  getTeachingTip(expected, detected) {
    const tips = {
      'TH_T': 'Place your tongue between your teeth, not behind them',
      'TH_D': 'Place your tongue between your teeth and blow air gently',
      'TH_S': 'Move your tongue forward between your teeth',
      'V_W': 'Touch your upper teeth to your lower lip and vibrate',
      'W_V': 'Round your lips without touching teeth',
      'R_D': 'Curl your tongue back without touching the roof',
      'L_R': 'Touch the tip of your tongue to the roof of your mouth',
      'Z_S': 'Vibrate your vocal cords while making S sound',
      'SH_S': 'Move your tongue slightly back and round your lips',
    };

    const key = `${expected}_${detected}`;
    return tips[key] || `Focus on the ${expected} sound`;
  }

  // Analyze all phonemes and return detailed errors
  analyzePhonemeErrors(phonemeAlignments) {
    const errors = [];
    const correct = [];

    for (const alignment of phonemeAlignments) {
      if (alignment.score < 80) {
        const error = this.detectSubstitution(
          alignment.phoneme,
          null, // Would pass actual MFCC in production
          null,
          alignment.distance
        );
        
        errors.push({
          ...alignment,
          ...error,
          priority: this.calculatePriority(alignment.phoneme, error.errorType)
        });
      } else {
        correct.push(alignment);
      }
    }

    // Sort by priority (most important errors first)
    errors.sort((a, b) => b.priority - a.priority);

    console.log(`✅ Correct phonemes: ${correct.length}`);
    console.log(`❌ Incorrect phonemes: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('Top errors:');
      errors.slice(0, 3).forEach((err, i) => {
        console.log(`  ${i+1}. ${err.expected} → ${err.detected} (${err.errorType})`);
      });
    }

    return { errors, correct };
  }

  // Calculate priority for error correction
  calculatePriority(phoneme, errorType) {
    // Critical phonemes for intelligibility
    const criticalPhonemes = ['TH', 'DH', 'V', 'W', 'R', 'L'];
    let priority = 50;

    if (criticalPhonemes.includes(phoneme)) {
      priority += 30;
    }

    if (errorType === 'manner_error') {
      priority += 20;
    } else if (errorType === 'place_error') {
      priority += 15;
    } else if (errorType === 'voicing_error') {
      priority += 10;
    }

    return priority;
  }
}
