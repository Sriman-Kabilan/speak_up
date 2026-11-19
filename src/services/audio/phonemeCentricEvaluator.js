// Phoneme-Centric Pronunciation Evaluator
// Focus: CMU Dictionary + Phoneme Teaching (not DTW scoring)
import { PhonemeDict } from './phonemeDict';
import { CorrectionAudioService } from './correctionAudioService';

export class PhonemeCentricEvaluator {
  constructor() {
    this.phonemeDict = new PhonemeDict();
    this.correctionAudioService = new CorrectionAudioService();
    
    // Common Indian English pronunciation errors
    this.commonErrors = {
      'TH': { likely: 'T', tip: 'Place tongue between teeth, blow air gently' },
      'DH': { likely: 'D', tip: 'Place tongue between teeth, voice it' },
      'V': { likely: 'W', tip: 'Touch upper teeth to lower lip' },
      'W': { likely: 'V', tip: 'Round lips, no teeth contact' },
      'R': { likely: 'retroflex', tip: 'Curl tongue tip up, not back' },
      'AE': { likely: 'EH', tip: 'Open mouth wider, say "a" in "cat"' },
      'AA': { likely: 'AH', tip: 'Open mouth fully, say "o" in "hot"' }
    };
  }

  async evaluate(text, attemptNumber = 1) {
    console.log('\n🎯 ========== PHONEME-CENTRIC EVALUATION ==========');
    console.log('📝 Word:', text);
    console.log('🔢 Attempt:', attemptNumber);
    
    // Get expected phonemes from CMU Dictionary
    const expectedPhonemes = await this.phonemeDict.getPhonemes(text.toLowerCase());
    
    if (!expectedPhonemes || expectedPhonemes.length === 0) {
      console.error('❌ Word not found in CMU Dictionary');
      return this.createErrorResult(text);
    }

    console.log('📚 Expected Phonemes:', expectedPhonemes.join(' '));
    
    // Identify challenging phonemes for Indian speakers
    const challengingPhonemes = this.identifyChallengingPhonemes(expectedPhonemes);
    
    // Generate teaching feedback
    const feedback = await this.generateTeachingFeedback(
      text,
      expectedPhonemes,
      challengingPhonemes,
      attemptNumber
    );

    // Progressive scoring based on attempts (simulated improvement)
    const score = this.calculateProgressiveScore(attemptNumber, challengingPhonemes.length);

    console.log('✅ Evaluation Complete');
    console.log('📊 Score:', score);
    console.log('🎯 Focus Phonemes:', challengingPhonemes.map(p => p.phoneme).join(', '));
    console.log('================================================\n');

    return {
      score,
      expectedPhonemes,
      challengingPhonemes: challengingPhonemes.map(cp => ({
        phoneme: cp.phoneme,
        readable: cp.readable,
        errorType: cp.errorType,
        likelyMistake: cp.likelyMistake,
        teachingTip: cp.teachingTip,
        severity: cp.severity
      })),
      feedbackText: feedback.text,
      correctionAudios: feedback.correctionAudios,
      stressPattern: this.getStressPattern(expectedPhonemes),
      attemptNumber,
      algorithmVersion: '4.0-phoneme-centric'
    };
  }

  identifyChallengingPhonemes(phonemes) {
    const challenging = [];
    
    for (const phoneme of phonemes) {
      const basePhoneme = phoneme.replace(/[0-9]/g, ''); // Remove stress markers
      
      if (this.commonErrors[basePhoneme]) {
        const error = this.commonErrors[basePhoneme];
        challenging.push({
          phoneme: basePhoneme,
          readable: this.getReadablePhoneme(basePhoneme),
          errorType: 'substitution',
          likelyMistake: error.likely,
          teachingTip: error.tip,
          severity: this.getSeverity(basePhoneme)
        });
      }
    }
    
    return challenging;
  }

  getReadablePhoneme(phoneme) {
    const map = {
      'TH': 'th (think)',
      'DH': 'th (this)',
      'V': 'v',
      'W': 'w',
      'R': 'r',
      'AE': 'a (cat)',
      'AA': 'o (hot)',
      'AH': 'u (cup)',
      'EH': 'e (bed)',
      'IH': 'i (sit)',
      'IY': 'ee (see)',
      'UH': 'oo (book)',
      'UW': 'oo (food)'
    };
    return map[phoneme] || phoneme.toLowerCase();
  }

  getSeverity(phoneme) {
    const highPriority = ['TH', 'DH', 'V', 'W'];
    const mediumPriority = ['R', 'AE', 'AA'];
    
    if (highPriority.includes(phoneme)) return 4;
    if (mediumPriority.includes(phoneme)) return 3;
    return 2;
  }

  async generateTeachingFeedback(word, phonemes, challengingPhonemes, attemptNumber) {
    if (challengingPhonemes.length === 0) {
      return {
        text: `Great! "${word}" has no particularly challenging sounds. Keep practicing!`,
        correctionAudios: []
      };
    }

    const primary = challengingPhonemes[0];
    const correctionAudios = await this.correctionAudioService.getMultipleCorrectionAudios(
      challengingPhonemes.map(cp => cp.phoneme)
    );

    let text = '';
    
    if (attemptNumber === 1) {
      text = `🎯 Focus on the "${primary.readable}" sound. ${primary.teachingTip}`;
    } else if (attemptNumber === 2) {
      text = `📈 Better! Keep practicing "${primary.readable}". Listen to the audio example.`;
    } else {
      text = `✨ Good progress! Fine-tune the "${primary.readable}" sound.`;
    }

    if (challengingPhonemes.length > 1) {
      text += ` Also practice: ${challengingPhonemes.slice(1).map(cp => cp.readable).join(', ')}.`;
    }

    return { text, correctionAudios };
  }

  calculateProgressiveScore(attemptNumber, challengingCount) {
    // Base score depends on word difficulty
    let baseScore = 60;
    
    if (challengingCount === 0) baseScore = 85;
    else if (challengingCount === 1) baseScore = 70;
    else if (challengingCount === 2) baseScore = 60;
    else baseScore = 50;

    // Progressive improvement with attempts
    const improvement = Math.min(attemptNumber - 1, 3) * 10;
    
    return Math.min(100, baseScore + improvement);
  }

  getStressPattern(phonemes) {
    return phonemes
      .map(p => {
        if (p.includes('1')) return 'PRIMARY';
        if (p.includes('2')) return 'SECONDARY';
        return 'UNSTRESSED';
      })
      .join('-');
  }

  createErrorResult(text) {
    return {
      score: 0,
      expectedPhonemes: [],
      challengingPhonemes: [],
      feedbackText: `Word "${text}" not found in dictionary. Please try another word.`,
      correctionAudios: [],
      stressPattern: '',
      error: 'WORD_NOT_FOUND'
    };
  }
}
