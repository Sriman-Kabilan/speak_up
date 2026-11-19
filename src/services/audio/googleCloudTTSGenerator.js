// Google Cloud Text-to-Speech Integration
// Generates realistic human-like speech for pronunciation reference

export class GoogleCloudTTSGenerator {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.REACT_APP_GOOGLE_TTS_API_KEY;
    this.sampleRate = 16000;
    this.audioCache = new Map();
    this.endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  }

  async generateReferenceAudio(text) {
    const cacheKey = text.toLowerCase().trim();
    
    if (this.audioCache.has(cacheKey)) {
      console.log('📦 Using cached Google TTS audio for:', text);
      return this.audioCache.get(cacheKey);
    }

    console.log('🎙️ Generating Google Cloud TTS for:', text);
    
    try {
      const audioBuffer = await this.synthesizeWithGoogleTTS(text);
      this.audioCache.set(cacheKey, audioBuffer);
      console.log('✅ Google TTS generated:', audioBuffer.length, 'samples');
      return audioBuffer;
    } catch (error) {
      console.error('❌ Google TTS failed:', error);
      // Fallback to basic synthesis
      return this.fallbackSynthesis(text);
    }
  }

  async synthesizeWithGoogleTTS(text) {
    if (!this.apiKey) {
      throw new Error('Google Cloud TTS API key not configured');
    }

    const requestBody = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-J',  // High-quality neural voice
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: this.sampleRate,
        pitch: 0.0,
        speakingRate: 0.9,  // Slightly slower for clarity
        volumeGainDb: 0.0
      }
    };

    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TTS API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error('No audio content in response');
    }

    // Decode base64 audio to Float32Array
    return this.decodeBase64Audio(data.audioContent);
  }

  decodeBase64Audio(base64Audio) {
    // Decode base64 string
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert 16-bit PCM to Float32Array
    const samples = bytes.length / 2;
    const float32Array = new Float32Array(samples);
    const dataView = new DataView(bytes.buffer);

    for (let i = 0; i < samples; i++) {
      // Read 16-bit signed integer (little-endian)
      const int16 = dataView.getInt16(i * 2, true);
      // Normalize to [-1, 1]
      float32Array[i] = int16 / 32768.0;
    }

    return float32Array;
  }

  fallbackSynthesis(text) {
    console.warn('⚠️ Using fallback synthesis');
    const duration = Math.max(0.5, text.length * 0.08);
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);
    
    // Simple tone generation as fallback
    for (let i = 0; i < samples; i++) {
      buffer[i] = Math.sin(2 * Math.PI * 300 * i / this.sampleRate) * 0.3;
    }
    
    return buffer;
  }

  clearCache() {
    this.audioCache.clear();
  }
}
