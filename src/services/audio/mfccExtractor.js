// MFCC Feature Extraction
export class MFCCExtractor {
  constructor(sampleRate = 16000, numCoefficients = 13) {
    this.sampleRate = sampleRate;
    this.numCoefficients = numCoefficients;
    this.frameSize = 512;
    this.hopSize = 256;
    this.numFilters = 26;
  }

  extract(audioBuffer) {
    const frames = this.frameSignal(audioBuffer);
    const mfccFeatures = [];

    for (const frame of frames) {
      const spectrum = this.fft(frame);
      const powerSpectrum = this.powerSpectrum(spectrum);
      const melFiltered = this.applyMelFilterbank(powerSpectrum);
      const logMel = melFiltered.map(x => Math.log(x + 1e-10));
      const mfcc = this.dct(logMel).slice(0, this.numCoefficients);
      mfccFeatures.push(mfcc);
    }

    return mfccFeatures;
  }

  frameSignal(signal) {
    const frames = [];
    for (let i = 0; i + this.frameSize <= signal.length; i += this.hopSize) {
      const frame = signal.slice(i, i + this.frameSize);
      const windowed = this.applyHammingWindow(frame);
      frames.push(windowed);
    }
    return frames;
  }

  applyHammingWindow(frame) {
    return frame.map((val, i) => 
      val * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (frame.length - 1)))
    );
  }

  fft(signal) {
    const N = signal.length;
    if (N <= 1) return [{ re: signal[0] || 0, im: 0 }];
    
    const even = this.fft(signal.filter((_, i) => i % 2 === 0));
    const odd = this.fft(signal.filter((_, i) => i % 2 === 1));
    
    const result = new Array(N);
    for (let k = 0; k < N / 2; k++) {
      const t = { re: Math.cos(-2 * Math.PI * k / N), im: Math.sin(-2 * Math.PI * k / N) };
      const oddK = odd[k] || { re: 0, im: 0 };
      result[k] = {
        re: even[k].re + t.re * oddK.re - t.im * oddK.im,
        im: even[k].im + t.re * oddK.im + t.im * oddK.re
      };
      result[k + N / 2] = {
        re: even[k].re - (t.re * oddK.re - t.im * oddK.im),
        im: even[k].im - (t.re * oddK.im + t.im * oddK.re)
      };
    }
    return result;
  }

  powerSpectrum(spectrum) {
    return spectrum.map(c => c.re * c.re + c.im * c.im);
  }

  applyMelFilterbank(powerSpectrum) {
    const melFilters = this.createMelFilterbank();
    return melFilters.map(filter => 
      filter.reduce((sum, weight, i) => sum + weight * (powerSpectrum[i] || 0), 0)
    );
  }

  createMelFilterbank() {
    const melMin = this.hzToMel(0);
    const melMax = this.hzToMel(this.sampleRate / 2);
    const melPoints = Array.from({ length: this.numFilters + 2 }, (_, i) => 
      melMin + (melMax - melMin) * i / (this.numFilters + 1)
    );
    const hzPoints = melPoints.map(m => this.melToHz(m));
    const binPoints = hzPoints.map(hz => Math.floor((this.frameSize + 1) * hz / this.sampleRate));

    const filters = [];
    for (let i = 1; i <= this.numFilters; i++) {
      const filter = new Array(this.frameSize / 2 + 1).fill(0);
      for (let j = binPoints[i - 1]; j < binPoints[i]; j++) {
        filter[j] = (j - binPoints[i - 1]) / (binPoints[i] - binPoints[i - 1]);
      }
      for (let j = binPoints[i]; j < binPoints[i + 1]; j++) {
        filter[j] = (binPoints[i + 1] - j) / (binPoints[i + 1] - binPoints[i]);
      }
      filters.push(filter);
    }
    return filters;
  }

  hzToMel(hz) {
    return 2595 * Math.log10(1 + hz / 700);
  }

  melToHz(mel) {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  dct(signal) {
    const N = signal.length;
    const result = new Array(N);
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += signal[n] * Math.cos(Math.PI * k * (n + 0.5) / N);
      }
      result[k] = sum;
    }
    return result;
  }
}
