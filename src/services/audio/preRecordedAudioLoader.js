// Pre-recorded Reference Audio Loader
// Uses pre-generated audio files stored in /public/reference_audio/

export class PreRecordedAudioLoader {
  constructor() {
    this.sampleRate = 16000;
    this.audioCache = new Map();
  }

  async loadReferenceAudio(text) {
    const cacheKey = text.toLowerCase().trim();
    
    if (this.audioCache.has(cacheKey)) {
      console.log('📦 Using cached audio for:', text);
      return this.audioCache.get(cacheKey);
    }

    console.log('🎵 Loading pre-recorded audio for:', text);
    
    try {
      // Generate filename from text
      const filename = this.textToFilename(text);
      const audioBuffer = await this.loadAudioFile(filename);
      
      this.audioCache.set(cacheKey, audioBuffer);
      console.log('✅ Loaded audio:', audioBuffer.length, 'samples');
      
      return audioBuffer;
    } catch (error) {
      console.error('❌ Failed to load audio:', error);
      console.warn('⚠️ Falling back to synthesis');
      return this.fallbackSynthesis(text);
    }
  }

  textToFilename(text) {
    // Convert text to filename: "hot" -> "hot.wav", "Thank you" -> "thank_you.wav"
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      + '.wav';
  }

  async loadAudioFile(filename) {
    const audioPath = `/reference_audio/${filename}`;
    
    // Fetch audio file
    const response = await fetch(audioPath);
    if (!response.ok) {
      throw new Error(`Audio file not found: ${filename}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Decode audio using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Convert to Float32Array at 16kHz
    return this.resampleAudio(audioBuffer);
  }

  resampleAudio(audioBuffer) {
    const sourceRate = audioBuffer.sampleRate;
    const targetRate = this.sampleRate;
    const sourceData = audioBuffer.getChannelData(0); // Mono
    
    if (sourceRate === targetRate) {
      return new Float32Array(sourceData);
    }
    
    // Simple resampling
    const ratio = sourceRate / targetRate;
    const targetLength = Math.floor(sourceData.length / ratio);
    const resampled = new Float32Array(targetLength);
    
    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = Math.floor(i * ratio);
      resampled[i] = sourceData[sourceIndex];
    }
    
    return resampled;
  }

  fallbackSynthesis(text) {
    // Simple fallback if audio file not found
    const duration = Math.max(0.5, text.length * 0.08);
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      buffer[i] = Math.sin(2 * Math.PI * 300 * i / this.sampleRate) * 0.3;
    }
    
    return buffer;
  }

  clearCache() {
    this.audioCache.clear();
  }
}
