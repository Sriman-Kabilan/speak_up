import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MFCCExtractor } from './mfccExtractor';
import { PhonemeDict } from './phonemeDict';
import { PreRecordedAudioLoader } from './preRecordedAudioLoader';  // Use pre-recorded audio

export class ReferenceMFCCService {
  constructor() {
    this.mfccExtractor = new MFCCExtractor();
    this.phonemeDict = new PhonemeDict();
    this.audioLoader = new PreRecordedAudioLoader();  // Load from files
    this.mfccCache = new Map();
  }

  async getOrComputeReference(exerciseId, text, audioBuffer) {
    const cacheKey = `${exerciseId}_${text.toLowerCase()}`;
    
    // TEMPORARILY DISABLED: Force recompute to get raw MFCC
    // if (this.mfccCache.has(cacheKey)) {
    //   console.log('📦 Using cached MFCC for:', text);
    //   return this.mfccCache.get(cacheKey);
    // }

    // Skip Firestore cache to force fresh computation
    // const cached = await this.getCachedReference(exerciseId);
    // if (cached) {
    //   const mfccVector = this.reconstructMFCC(cached.flat_mfcc, cached.frames, cached.coefficients);
    //   console.log('📦 Loaded Firestore cached MFCC:', { frames: cached.frames, coeffs: cached.coefficients });
    //   const result = { ...cached, mfcc_vector: mfccVector };
    //   this.mfccCache.set(cacheKey, result);
    //   return result;
    // }

    console.log('🎵 Loading pre-recorded reference for:', text);
    
    const referenceAudio = await this.audioLoader.loadReferenceAudio(text);
    console.log('✅ Reference audio loaded:', referenceAudio.length, 'samples');
    
    const mfccVector = this.mfccExtractor.extract(Array.from(referenceAudio));
    // DON'T normalize here - let evaluator do joint normalization
    const phonemeSegments = await this.phonemeDict.getPhonemeBoundaries(text);
    
    const flatMFCC = this.flattenMFCC(mfccVector);

    const result = {
      exercise_id: exerciseId,
      text,
      frames: mfccVector.length,
      coefficients: mfccVector[0].length,
      flat_mfcc: flatMFCC,
      phoneme_segments: phonemeSegments,
      mfcc_vector: mfccVector,  // Raw MFCC, not normalized
      computed_at: new Date().toISOString()
    };
    
    this.mfccCache.set(cacheKey, result);
    return result;
  }

  flattenMFCC(mfccVector) {
    const flat = [];
    for (const frame of mfccVector) {
      flat.push(...frame);
    }
    return flat;
  }

  reconstructMFCC(flatMFCC, frames, coefficients) {
    const mfccVector = [];
    for (let i = 0; i < frames; i++) {
      const frame = flatMFCC.slice(i * coefficients, (i + 1) * coefficients);
      mfccVector.push(frame);
    }
    return mfccVector;
  }

  normalizeMFCC(mfccVector) {
    const numCoeffs = mfccVector[0].length;
    const means = new Array(numCoeffs).fill(0);
    const stds = new Array(numCoeffs).fill(0);

    // Calculate means
    for (let i = 0; i < numCoeffs; i++) {
      for (const frame of mfccVector) {
        means[i] += frame[i];
      }
      means[i] /= mfccVector.length;
    }

    // Calculate standard deviations
    for (let i = 0; i < numCoeffs; i++) {
      for (const frame of mfccVector) {
        stds[i] += Math.pow(frame[i] - means[i], 2);
      }
      stds[i] = Math.sqrt(stds[i] / mfccVector.length);
    }

    // Normalize
    const normalized = mfccVector.map(frame =>
      frame.map((val, i) => (val - means[i]) / (stds[i] + 1e-10))
    );
    
    // Log normalization stats
    const flatValues = normalized.flat();
    console.log('📊 Reference MFCC Normalization:', {
      frames: normalized.length,
      coeffs: numCoeffs,
      mean: (flatValues.reduce((a, b) => a + b, 0) / flatValues.length).toFixed(4),
      std: Math.sqrt(flatValues.reduce((sum, val) => sum + val * val, 0) / flatValues.length).toFixed(4),
      min: Math.min(...flatValues).toFixed(4),
      max: Math.max(...flatValues).toFixed(4)
    });

    return normalized;
  }

  async getCachedReference(exerciseId) {
    try {
      const docRef = doc(db, 'ReferenceMFCC', exerciseId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error fetching cached reference:', error);
      return null;
    }
  }

  async cacheReference(exerciseId, reference) {
    try {
      // CRITICAL FIX: Serialize to plain JSON (no Promise, no functions)
      const cleanData = JSON.parse(JSON.stringify(reference));
      console.log('💾 Saving clean data to Firestore');
      
      const docRef = doc(db, 'ReferenceMFCC', exerciseId);
      await setDoc(docRef, cleanData);
      console.log('✅ Reference cached successfully');
    } catch (error) {
      console.error('❌ Error caching reference:', error);
      throw error;
    }
  }
}
