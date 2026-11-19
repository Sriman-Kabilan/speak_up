/**
 * Audio Teaching Service
 * Handles pronunciation audio playback with speed control
 */

export class AudioTeachingService {
  constructor() {
    this.audioContext = null;
    this.currentSource = null;
    this.audioBuffer = null;
    this.isPlaying = false;
    this.onPlaybackEnd = null;
    this.onPlaybackProgress = null;
    this.startTime = 0;
    this.pauseTime = 0;
  }

  /**
   * Initialize audio context
   */
  initialize() {
    try {
      if (typeof window === 'undefined') return false;
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return false;
      }
      
      this.audioContext = new AudioContext();
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  /**
   * Load audio file
   */
  async loadAudio(audioPath) {
    try {
      if (!this.audioContext) {
        const initialized = this.initialize();
        if (!initialized) {
          throw new Error('Audio context not available');
        }
      }

      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      return {
        success: true,
        duration: this.audioBuffer.duration
      };
    } catch (error) {
      console.error('Error loading audio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Play audio at specified speed
   */
  play(speed = 1.0, onEnd = null, onProgress = null) {
    try {
      if (!this.audioBuffer) {
        throw new Error('No audio loaded');
      }

      // Stop any currently playing audio
      this.stop();

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create source
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = this.audioBuffer;
      this.currentSource.playbackRate.value = speed;
      this.currentSource.connect(this.audioContext.destination);

      // Set callbacks
      this.onPlaybackEnd = onEnd;
      this.onPlaybackProgress = onProgress;

      // Handle playback end
      this.currentSource.onended = () => {
        this.isPlaying = false;
        if (this.onPlaybackEnd) {
          this.onPlaybackEnd();
        }
      };

      // Start playback
      this.currentSource.start(0);
      this.isPlaying = true;
      this.startTime = this.audioContext.currentTime;

      // Start progress tracking
      if (onProgress) {
        this.trackProgress();
      }

      return { success: true };
    } catch (error) {
      console.error('Error playing audio:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track playback progress
   */
  trackProgress() {
    if (!this.isPlaying || !this.onPlaybackProgress) return;

    const elapsed = this.audioContext.currentTime - this.startTime;
    const duration = this.audioBuffer.duration;
    const progress = Math.min(elapsed / duration, 1.0);

    this.onPlaybackProgress(progress, elapsed, duration);

    if (this.isPlaying && progress < 1.0) {
      requestAnimationFrame(() => this.trackProgress());
    }
  }

  /**
   * Stop playback
   */
  stop() {
    try {
      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.currentSource = null;
      }
      this.isPlaying = false;
      return { success: true };
    } catch (error) {
      // Ignore errors when stopping (source might already be stopped)
      this.isPlaying = false;
      return { success: true };
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Get audio duration
   */
  getDuration() {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffer = null;
  }
}

/**
 * Generate phoneme audio path
 */
export function getPhonemeAudioPath(phoneme) {
  // For now, use TTS as fallback
  // In production, you'd have pre-recorded phoneme sounds
  return null;
}

/**
 * Generate word audio path
 */
export function getWordAudioPath(word) {
  const filename = word.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
  return `/reference_audio/${filename}.wav`;
}

/**
 * Play phoneme sound using TTS (fallback)
 */
export function playPhonemeTTS(phoneme, rate = 0.5) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve({ success: false, error: 'TTS not available' });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      const phonemeMap = {
        'AA': 'ah', 'AE': 'a', 'AH': 'uh', 'AO': 'aw', 'AW': 'ow',
        'AY': 'eye', 'EH': 'eh', 'ER': 'er', 'EY': 'ay', 'IH': 'ih',
        'IY': 'ee', 'OW': 'oh', 'OY': 'oy', 'UH': 'uh', 'UW': 'oo',
        'HH': 'h', 'TH': 'th', 'DH': 'th', 'V': 'v', 'W': 'w',
        'R': 'r', 'L': 'l', 'T': 't', 'D': 'd', 'K': 'k',
        'G': 'g', 'P': 'p', 'B': 'b', 'F': 'f', 'S': 's',
        'Z': 'z', 'SH': 'sh', 'ZH': 'zh', 'CH': 'ch', 'JH': 'j',
        'M': 'm', 'N': 'n', 'NG': 'ng', 'Y': 'y'
      };

      const sound = phonemeMap[phoneme] || phoneme.toLowerCase();
      const utterance = new SpeechSynthesisUtterance(sound);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve({ success: true });
      utterance.onerror = (error) => resolve({ success: false, error: error.message });

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}
