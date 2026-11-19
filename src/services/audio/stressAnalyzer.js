// Stress Pattern Analyzer - Detects syllable stress errors
export class StressAnalyzer {
  constructor() {
    // Common English stress patterns from CMU dictionary
    this.stressPatterns = {
      'content': { noun: [1, 0], verb: [0, 1] },  // CONtent vs conTENT
      'present': { noun: [1, 0], verb: [0, 1] },  // PREsent vs preSENT
      'record': { noun: [1, 0], verb: [0, 1] },   // REcord vs reCORD
      'permit': { noun: [1, 0], verb: [0, 1] },   // PERmit vs perMIT
      'project': { noun: [1, 0], verb: [0, 1] },  // PROject vs proJECT
    };
  }

  // Extract stress pattern from real audio using energy and pitch
  extractStressPattern(audioBuffer, phonemeBoundaries) {
    if (!audioBuffer?.length || !phonemeBoundaries?.length) {
      return { syllables: [], confidence: 0 };
    }

    const syllables = this.groupPhonemesIntoSyllables(phonemeBoundaries);
    const stressLevels = [];

    console.log('🎵 Analyzing stress pattern for', syllables.length, 'syllables');

    for (const syllable of syllables) {
      const startFrame = syllable.startFrame;
      const endFrame = syllable.endFrame;
      const startSample = Math.floor(startFrame * 160); // 16kHz, 10ms frames
      const endSample = Math.floor(endFrame * 160);

      if (startSample >= audioBuffer.length || endSample > audioBuffer.length) {
        stressLevels.push(0);
        continue;
      }

      const segment = audioBuffer.slice(startSample, endSample);
      
      // Calculate energy (RMS)
      const energy = this.calculateRMS(segment);
      
      // Calculate pitch (fundamental frequency)
      const pitch = this.estimatePitch(segment, 16000);
      
      // Calculate duration
      const duration = (endSample - startSample) / 16000;

      // Stress score combines energy, pitch, and duration
      const stressScore = (energy * 0.5) + (pitch / 300 * 0.3) + (duration / 0.2 * 0.2);
      
      stressLevels.push(stressScore);
      
      console.log(`  Syllable "${syllable.text}": energy=${energy.toFixed(3)}, pitch=${pitch.toFixed(1)}Hz, duration=${(duration*1000).toFixed(0)}ms, stress=${stressScore.toFixed(3)}`);
    }

    // Normalize stress levels to 0-1 range
    const maxStress = Math.max(...stressLevels, 0.001);
    const normalizedStress = stressLevels.map(s => s / maxStress);

    // Convert to binary stress pattern (1 = stressed, 0 = unstressed)
    const threshold = 0.6;
    const binaryPattern = normalizedStress.map(s => s > threshold ? 1 : 0);

    console.log('📊 Detected stress pattern:', binaryPattern.join('-'));

    return {
      syllables: syllables.map((syl, i) => ({
        text: syl.text,
        stressed: binaryPattern[i] === 1,
        stressLevel: normalizedStress[i],
        energy: stressLevels[i]
      })),
      pattern: binaryPattern,
      confidence: this.calculateConfidence(normalizedStress)
    };
  }

  // Compare user stress pattern with expected pattern
  compareStressPatterns(userPattern, expectedPattern, word) {
    if (!userPattern?.pattern || !expectedPattern) {
      return { match: true, errors: [], score: 100 };
    }

    const errors = [];
    let matchCount = 0;

    for (let i = 0; i < Math.min(userPattern.pattern.length, expectedPattern.length); i++) {
      const userStress = userPattern.pattern[i];
      const expectedStress = expectedPattern[i];
      
      if (userStress === expectedStress) {
        matchCount++;
      } else {
        errors.push({
          syllableIndex: i,
          syllable: userPattern.syllables[i]?.text || `syllable ${i+1}`,
          expected: expectedStress === 1 ? 'stressed' : 'unstressed',
          actual: userStress === 1 ? 'stressed' : 'unstressed',
          severity: Math.abs(userPattern.syllables[i]?.stressLevel - expectedStress)
        });
      }
    }

    const score = Math.round((matchCount / expectedPattern.length) * 100);
    const match = errors.length === 0;

    if (!match) {
      console.log('❌ Stress pattern mismatch:');
      console.log('  Expected:', expectedPattern.join('-'));
      console.log('  Got:', userPattern.pattern.join('-'));
      errors.forEach(err => {
        console.log(`  Syllable "${err.syllable}": should be ${err.expected}, but is ${err.actual}`);
      });
    }

    return { match, errors, score };
  }

  // Group phonemes into syllables based on vowels
  groupPhonemesIntoSyllables(phonemeBoundaries) {
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
    const syllables = [];
    let currentSyllable = [];

    for (const phoneme of phonemeBoundaries) {
      currentSyllable.push(phoneme);
      
      // If this is a vowel, end the syllable
      if (vowels.includes(phoneme.symbol)) {
        syllables.push({
          phonemes: [...currentSyllable],
          text: currentSyllable.map(p => p.symbol).join(''),
          startFrame: currentSyllable[0].start,
          endFrame: currentSyllable[currentSyllable.length - 1].end
        });
        currentSyllable = [];
      }
    }

    // Add remaining consonants to last syllable
    if (currentSyllable.length > 0 && syllables.length > 0) {
      syllables[syllables.length - 1].phonemes.push(...currentSyllable);
      syllables[syllables.length - 1].endFrame = currentSyllable[currentSyllable.length - 1].end;
    }

    return syllables;
  }

  // Calculate RMS energy
  calculateRMS(samples) {
    if (!samples?.length) return 0;
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  // Estimate pitch using autocorrelation
  estimatePitch(samples, sampleRate) {
    if (!samples?.length || samples.length < 100) return 0;

    const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
    const maxPeriod = Math.floor(sampleRate / 50);  // 50 Hz min

    let maxCorr = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period < Math.min(maxPeriod, samples.length / 2); period++) {
      let corr = 0;
      for (let i = 0; i < samples.length - period; i++) {
        corr += samples[i] * samples[i + period];
      }
      if (corr > maxCorr) {
        maxCorr = corr;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  // Calculate confidence based on stress level variance
  calculateConfidence(stressLevels) {
    if (stressLevels.length < 2) return 0.5;
    
    const mean = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
    const variance = stressLevels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stressLevels.length;
    
    // Higher variance = clearer stress distinction = higher confidence
    return Math.min(1, variance * 2);
  }

  // Get expected stress pattern for a word
  getExpectedPattern(word, context = 'noun') {
    const normalized = word.toLowerCase();
    if (this.stressPatterns[normalized]) {
      return this.stressPatterns[normalized][context] || this.stressPatterns[normalized].noun;
    }
    return null;
  }
}
