// High-Quality TTS Reference Generator
export class TTSReferenceGenerator {
  constructor() {
    this.sampleRate = 16000;
    this.audioCache = new Map();
  }

  async generateReferenceAudio(text) {
    const cacheKey = text.toLowerCase().trim();
    
    if (this.audioCache.has(cacheKey)) {
      console.log('📦 Using cached TTS audio for:', text);
      return this.audioCache.get(cacheKey);
    }

    console.log('🎙️ Generating TTS reference for:', text);
    
    const audioBuffer = await this.synthesizeWithTTS(text);
    this.audioCache.set(cacheKey, audioBuffer);
    
    return audioBuffer;
  }

  async synthesizeWithTTS(text) {
    const duration = Math.max(0.5, text.length * 0.1);  // Longer duration
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);
    
    // Use phoneme-based synthesis for better accuracy
    const phonemes = text.toLowerCase().split('');
    const samplesPerPhoneme = Math.floor(samples / phonemes.length);
    
    for (let p = 0; p < phonemes.length; p++) {
      const char = phonemes[p];
      const startSample = p * samplesPerPhoneme;
      const endSample = Math.min(startSample + samplesPerPhoneme, samples);
      
      const freqs = this.getCharFormants(char);
      
      for (let i = startSample; i < endSample; i++) {
        const t = (i - startSample) / samplesPerPhoneme;
        const phase = (i / this.sampleRate) * 2 * Math.PI;
        const envelope = Math.sin(Math.PI * t) * 0.8;  // Stronger envelope
        
        // Multiple formants for realistic speech
        buffer[i] = (
          Math.sin(freqs.f1 * phase) * 0.4 +
          Math.sin(freqs.f2 * phase) * 0.3 +
          Math.sin(freqs.f3 * phase) * 0.2 +
          (Math.random() * 0.1 - 0.05)  // Add noise for realism
        ) * envelope;
      }
    }
    
    console.log('✅ Enhanced formant synthesis:', buffer.length, 'samples');
    return this.normalizeAmplitude(buffer);
  }

  getCharFormants(char) {
    // More realistic formant frequencies based on phonetics
    const vowelFormants = {
      'a': { f1: 730, f2: 1090, f3: 2440 },
      'e': { f1: 530, f2: 1840, f3: 2480 },
      'i': { f1: 270, f2: 2290, f3: 3010 },
      'o': { f1: 570, f2: 840, f3: 2410 },
      'u': { f1: 300, f2: 870, f3: 2240 }
    };
    
    const consonantFormants = {
      'b': { f1: 150, f2: 1000, f3: 2500 },
      'c': { f1: 2000, f2: 3000, f3: 4000 },
      'd': { f1: 200, f2: 1700, f3: 2600 },
      'f': { f1: 3000, f2: 4000, f3: 5000 },
      'g': { f1: 250, f2: 2300, f3: 3000 },
      'h': { f1: 1000, f2: 2000, f3: 3000 },
      'j': { f1: 2500, f2: 3500, f3: 4500 },
      'k': { f1: 2000, f2: 3000, f3: 4000 },
      'l': { f1: 300, f2: 1000, f3: 2500 },
      'm': { f1: 200, f2: 1100, f3: 2200 },
      'n': { f1: 250, f2: 1700, f3: 2600 },
      'p': { f1: 150, f2: 1000, f3: 2500 },
      'r': { f1: 400, f2: 1200, f3: 2400 },
      's': { f1: 4000, f2: 5000, f3: 6000 },
      't': { f1: 3000, f2: 4000, f3: 5000 },
      'v': { f1: 150, f2: 1000, f3: 2500 },
      'w': { f1: 300, f2: 600, f3: 2400 },
      'y': { f1: 350, f2: 2000, f3: 2600 },
      'z': { f1: 3500, f2: 4500, f3: 5500 }
    };
    
    return vowelFormants[char] || consonantFormants[char] || { f1: 500, f2: 1500, f3: 2500 };
  }

  normalizeAmplitude(buffer) {
    const max = Math.max(...buffer.map(Math.abs));
    if (max === 0) return buffer;
    
    const normalized = new Float32Array(buffer.length);
    const scale = 0.8 / max;
    for (let i = 0; i < buffer.length; i++) {
      normalized[i] = buffer[i] * scale;
    }
    return normalized;
  }

  clearCache() {
    this.audioCache.clear();
  }
}
