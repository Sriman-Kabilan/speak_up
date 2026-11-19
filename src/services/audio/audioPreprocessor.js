// Audio Preprocessing Module
export class AudioPreprocessor {
  constructor(sampleRate = 16000) {
    this.sampleRate = sampleRate;
    this.preEmphasisCoeff = 0.97;
    this.energyThreshold = 0.02;
    this.noiseFloorPercentile = 10;
  }

  preprocess(audioBuffer, referenceDuration = null) {
    const rmsEnergy = this.calculateRMS(audioBuffer);
    const silenceThreshold = 0.02;  // Reasonable threshold for background noise
    
    console.log('🔊 RMS Energy:', rmsEnergy.toFixed(6));
    
    if (rmsEnergy < silenceThreshold) {
      console.error('❌ SILENCE DETECTED - No speech in audio');
      return {
        processedAudio: new Float32Array(0),
        metadata: {
          originalLength: audioBuffer.length,
          trimmedLength: 0,
          snr: 0,
          clipping: 0,
          confidence: 'silent',
          noiseFloor: 0,
          rmsEnergy,
          error: 'NO_SPEECH_DETECTED'
        }
      };
    }
    
    const emphasized = this.applyPreEmphasis(audioBuffer);
    const noiseFloor = this.estimateNoiseFloor(emphasized);
    const noiseGated = this.applyNoiseGate(emphasized, noiseFloor * 5);
    let trimmed = this.trimSilence(noiseGated, noiseFloor);
    
    if (referenceDuration) {
      const maxDuration = Math.min(referenceDuration * 1.5, 1.2);
      const maxSamples = Math.floor(maxDuration * this.sampleRate);
      if (trimmed.length > maxSamples) {
        trimmed = trimmed.slice(0, maxSamples);
      }
    }
    
    const normalized = this.normalizeAmplitude(trimmed);
    const clipping = this.detectClipping(audioBuffer);
    const snr = this.calculateSNR(normalized, noiseFloor);
    const confidence = this.calculateConfidence(snr, clipping, trimmed.length);
    
    return {
      processedAudio: normalized,
      metadata: {
        originalLength: audioBuffer.length,
        trimmedLength: trimmed.length,
        snr,
        clipping,
        confidence,
        noiseFloor,
        rmsEnergy
      }
    };
  }

  applyNoiseGate(signal, threshold) {
    const result = new Float32Array(signal.length);
    const frameSize = 256;
    
    for (let i = 0; i < signal.length; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize && i + j < signal.length; j++) {
        energy += signal[i + j] * signal[i + j];
      }
      energy /= frameSize;
      
      const gain = energy > threshold ? 1 : 0;
      for (let j = 0; j < frameSize && i + j < signal.length; j++) {
        result[i + j] = signal[i + j] * gain;
      }
    }
    
    return result;
  }

  calculateRMS(signal) {
    let sum = 0;
    for (let i = 0; i < signal.length; i++) {
      sum += signal[i] * signal[i];
    }
    return Math.sqrt(sum / signal.length);
  }

  applyPreEmphasis(signal) {
    const result = new Float32Array(signal.length);
    result[0] = signal[0];
    for (let i = 1; i < signal.length; i++) {
      result[i] = signal[i] - this.preEmphasisCoeff * signal[i - 1];
    }
    return result;
  }

  estimateNoiseFloor(signal) {
    const energies = [];
    const frameSize = 256;
    
    for (let i = 0; i < signal.length - frameSize; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += signal[i + j] * signal[i + j];
      }
      energies.push(energy / frameSize);
    }
    
    energies.sort((a, b) => a - b);
    const index = Math.floor(energies.length * this.noiseFloorPercentile / 100);
    return energies[index] || 0.001;
  }

  trimSilence(signal, noiseFloor) {
    const frameSize = 256;
    const threshold = noiseFloor * 3;
    
    let start = 0;
    let end = signal.length;
    
    // Find start
    for (let i = 0; i < signal.length - frameSize; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += signal[i + j] * signal[i + j];
      }
      if (energy / frameSize > threshold) {
        start = Math.max(0, i - frameSize);
        break;
      }
    }
    
    // Find end
    for (let i = signal.length - frameSize; i >= 0; i -= frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += signal[i + j] * signal[i + j];
      }
      if (energy / frameSize > threshold) {
        end = Math.min(signal.length, i + frameSize * 2);
        break;
      }
    }
    
    return signal.slice(start, end);
  }

  normalizeAmplitude(signal) {
    const max = Math.max(...signal.map(Math.abs));
    if (max === 0) return signal;
    
    const normalized = new Float32Array(signal.length);
    const scale = 0.95 / max;
    for (let i = 0; i < signal.length; i++) {
      normalized[i] = signal[i] * scale;
    }
    return normalized;
  }

  detectClipping(signal) {
    let clippedSamples = 0;
    const threshold = 0.99;
    
    for (let i = 0; i < signal.length; i++) {
      if (Math.abs(signal[i]) >= threshold) {
        clippedSamples++;
      }
    }
    
    return clippedSamples / signal.length;
  }

  calculateSNR(signal, noiseFloor) {
    let signalPower = 0;
    for (let i = 0; i < signal.length; i++) {
      signalPower += signal[i] * signal[i];
    }
    signalPower /= signal.length;
    
    const snr = 10 * Math.log10(signalPower / (noiseFloor + 1e-10));
    return Math.max(0, snr);
  }

  calculateConfidence(snr, clipping, signalLength) {
    let score = 100;
    
    // SNR penalty
    if (snr < 10) score -= 40;
    else if (snr < 20) score -= 20;
    
    // Clipping penalty
    if (clipping > 0.05) score -= 30;
    else if (clipping > 0.01) score -= 15;
    
    // Length penalty
    if (signalLength < 4000) score -= 20;
    
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
