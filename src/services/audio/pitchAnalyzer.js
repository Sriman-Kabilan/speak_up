// Pitch Extraction and Prosody Analysis
export class PitchAnalyzer {
  constructor(sampleRate = 16000) {
    this.sampleRate = sampleRate;
    this.minF0 = 75;
    this.maxF0 = 400;
  }

  extractPitchContour(signal) {
    const frameSize = 2048;
    const hopSize = 512;
    const pitchContour = [];
    
    for (let i = 0; i + frameSize <= signal.length; i += hopSize) {
      const frame = signal.slice(i, i + frameSize);
      const f0 = this.estimateF0(frame);
      pitchContour.push(f0);
    }
    
    return this.smoothPitchContour(pitchContour);
  }

  estimateF0(frame) {
    const acf = this.autocorrelation(frame);
    const minLag = Math.floor(this.sampleRate / this.maxF0);
    const maxLag = Math.floor(this.sampleRate / this.minF0);
    
    let maxCorr = -Infinity;
    let bestLag = minLag;
    
    for (let lag = minLag; lag < Math.min(maxLag, acf.length); lag++) {
      if (acf[lag] > maxCorr) {
        maxCorr = acf[lag];
        bestLag = lag;
      }
    }
    
    if (maxCorr < 0.3) return 0; // Unvoiced
    
    return this.sampleRate / bestLag;
  }

  autocorrelation(signal) {
    const n = signal.length;
    const result = new Array(n);
    
    for (let lag = 0; lag < n; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += signal[i] * signal[i + lag];
      }
      result[lag] = sum / (n - lag);
    }
    
    return result;
  }

  smoothPitchContour(contour) {
    const smoothed = [];
    const windowSize = 3;
    
    for (let i = 0; i < contour.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(contour.length, i + Math.ceil(windowSize / 2));
      
      let sum = 0;
      let count = 0;
      for (let j = start; j < end; j++) {
        if (contour[j] > 0) {
          sum += contour[j];
          count++;
        }
      }
      
      smoothed.push(count > 0 ? sum / count : 0);
    }
    
    return smoothed;
  }

  comparePitchContours(userContour, refContour) {
    const minLength = Math.min(userContour.length, refContour.length);
    
    // Normalize contours
    const userNorm = this.normalizePitch(userContour.slice(0, minLength));
    const refNorm = this.normalizePitch(refContour.slice(0, minLength));
    
    // Calculate correlation
    const correlation = this.calculateCorrelation(userNorm, refNorm);
    
    // Calculate RMSE
    let rmse = 0;
    let count = 0;
    for (let i = 0; i < minLength; i++) {
      if (userNorm[i] > 0 && refNorm[i] > 0) {
        rmse += Math.pow(userNorm[i] - refNorm[i], 2);
        count++;
      }
    }
    rmse = count > 0 ? Math.sqrt(rmse / count) : 1.0;
    
    // Calculate score
    const correlationScore = Math.max(0, correlation * 100);
    const rmseScore = Math.max(0, 100 - rmse * 50);
    
    return {
      correlation,
      rmse,
      score: (correlationScore * 0.6 + rmseScore * 0.4),
      deviation: rmse
    };
  }

  normalizePitch(contour) {
    const voiced = contour.filter(f => f > 0);
    if (voiced.length === 0) return contour;
    
    const mean = voiced.reduce((a, b) => a + b, 0) / voiced.length;
    const std = Math.sqrt(
      voiced.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / voiced.length
    );
    
    return contour.map(f => f > 0 ? (f - mean) / (std + 1e-10) : 0);
  }

  calculateCorrelation(arr1, arr2) {
    const n = arr1.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    let count = 0;
    
    for (let i = 0; i < n; i++) {
      if (arr1[i] > 0 && arr2[i] > 0) {
        sum1 += arr1[i];
        sum2 += arr2[i];
        sum1Sq += arr1[i] * arr1[i];
        sum2Sq += arr2[i] * arr2[i];
        pSum += arr1[i] * arr2[i];
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    const num = pSum - (sum1 * sum2 / count);
    const den = Math.sqrt(
      (sum1Sq - sum1 * sum1 / count) * (sum2Sq - sum2 * sum2 / count)
    );
    
    return den === 0 ? 0 : num / den;
  }
}
