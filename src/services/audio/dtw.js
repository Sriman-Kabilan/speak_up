// Dynamic Time Warping for MFCC comparison
export class DTW {
  compute(sequence1, sequence2) {
    if (!sequence1?.length || !sequence2?.length) {
      console.error('❌ DTW: Empty sequences');
      return { distance: 0, normalizedDistance: 0, path: [], pathLength: 0, similarity: 0 };
    }

    const n = sequence1.length;
    const m = sequence2.length;
    const numCoeffs = sequence1[0]?.length || 13;
    
    // Length mismatch penalty - catches completely wrong words
    const lengthRatio = Math.max(n, m) / Math.min(n, m);
    if (lengthRatio > 2.5) {
      console.warn('⚠️ SEVERE LENGTH MISMATCH - Likely wrong word');
      return { distance: 999, normalizedDistance: 5.0, path: [], pathLength: 1, similarity: 0 };
    }

    const dtw = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = this.euclideanDistance(sequence1[i - 1], sequence2[j - 1]);
        dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      }
    }

    const path = this.backtrack(dtw, n, m);
    const pathLength = path.length || 1;
    const totalDistance = dtw[n][m];

    if (!isFinite(totalDistance) || isNaN(totalDistance)) {
      console.error('❌ DTW: Invalid distance (Infinity or NaN)');
      return { distance: 0, normalizedDistance: 0, path: [], pathLength: 0, similarity: 0 };
    }

    const normalizedDistance = totalDistance / (pathLength * numCoeffs);

    if (!isFinite(normalizedDistance) || isNaN(normalizedDistance)) {
      console.error('❌ DTW: Invalid normalized distance');
      return { distance: 0, normalizedDistance: 0, path: [], pathLength: 0, similarity: 0 };
    }

    console.log('📊 DTW Normalized Distance:', normalizedDistance.toFixed(4));
    console.log('📏 Length Ratio:', (Math.max(n, m) / Math.min(n, m)).toFixed(2), `(user=${n}, ref=${m})`);
    console.log('🔢 TOTAL DTW Distance:', totalDistance.toFixed(2), '(raw, before normalization)');
    
    // Log warning if distance suggests wrong word
    if (normalizedDistance > 0.5) {
      console.warn('⚠️ HIGH DISTANCE - Possible wrong word or poor pronunciation');
    }
    
    // CRITICAL: Check total distance for wrong word detection
    if (totalDistance > 400) {
      console.warn('🚨 VERY HIGH TOTAL DISTANCE - Likely wrong word or silence');
    }

    return {
      distance: totalDistance,
      normalizedDistance,
      path,
      pathLength,
      similarity: this.distanceToScore(normalizedDistance)
    };
  }

  distanceToScore(distance) {
    // Recalibrated based on actual data: distance ~0.18 for everything
    // Need much tighter thresholds
    
    if (distance < 0.15) return 95;  // Perfect
    if (distance < 0.18) return 90;  // Excellent  
    if (distance < 0.22) return 85;  // Good
    if (distance < 0.28) return 80;  // Pass
    if (distance < 0.35) return 70;  // Fair
    if (distance < 0.45) return 55;  // Poor
    if (distance < 0.60) return 35;  // Very poor
    return Math.max(0, 20);  // Wrong word
  }

  euclideanDistance(vec1, vec2) {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  backtrack(dtw, i, j) {
    const path = [];
    while (i > 0 && j > 0) {
      path.unshift([i - 1, j - 1]);
      const min = Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      if (min === dtw[i - 1][j - 1]) { i--; j--; }
      else if (min === dtw[i - 1][j]) { i--; }
      else { j--; }
    }
    return path;
  }

  alignPhonemes(userMFCC, refMFCC, phonemeBoundaries, dtwPath) {
    // REMOVED: Frontend cannot detect phonemes accurately with MFCC+DTW
    // This method is kept for reference but should not be used
    console.warn('⚠️ alignPhonemes called - this is not accurate for phoneme detection');
    return [];
  }

  calculateSeverity(score) {
    if (score >= 85) return 1;
    if (score >= 70) return 2;
    if (score >= 50) return 3;
    return 4;
  }
}
