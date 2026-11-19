import { MFCCExtractor } from './mfccExtractor';
import { DTW } from './dtw';
import { PhonemeDict } from './phonemeDict';
import { AudioPreprocessor } from './audioPreprocessor';
import { PitchAnalyzer } from './pitchAnalyzer';
import { ReferenceMFCCService } from './referenceMFCCService';
import { CorrectionAudioService } from './correctionAudioService';
import { PhonemeErrorDetector } from './phonemeErrorDetector';
import { StressAnalyzer } from './stressAnalyzer';
import { BackendEvaluationService } from './backendEvaluationService';
import { Platform } from 'react-native';

export class PronunciationEvaluator {
  constructor() {
    this.mfccExtractor = new MFCCExtractor();
    this.dtw = new DTW();
    this.phonemeDict = new PhonemeDict();
    this.preprocessor = new AudioPreprocessor();
    this.pitchAnalyzer = new PitchAnalyzer();
    this.referenceMFCCService = new ReferenceMFCCService();
    this.correctionAudioService = new CorrectionAudioService();
    this.phonemeErrorDetector = new PhonemeErrorDetector();
    this.stressAnalyzer = new StressAnalyzer();
    this.backendService = new BackendEvaluationService();
    this.useBackend = true;
  }

  async evaluate(userAudioBuffer, referenceAudioBuffer, text, exerciseId = 'unknown', audioUri = null) {
    console.log('\n🎯 ========== PRONUNCIATION EVALUATION START ==========');
    console.log('📝 Exercise:', { exerciseId, text });
    
    try {
      console.log('🔄 Connecting to backend...');
      
      let audioData;
      if (Platform.OS === 'web') {
        const wav = this.encodeWAV(userAudioBuffer, 16000);
        audioData = new Blob([wav], { type: 'audio/wav' });
        console.log('🎵 Created WAV blob for web, size:', audioData.size);
      } else {
        // Mobile: pass URI directly to avoid re-encode corruption
        audioData = audioUri || null;
        console.log('🎵 Using original recording URI for mobile:', audioData);
      }
      
      const backendResult = await this.backendService.evaluate(audioData, text, exerciseId);
      
      if (backendResult.success) {
        console.log('✅ Backend evaluation successful');
        return this.formatBackendResult(backendResult);
      }
      
      // Backend returned error
      console.error('❌ Backend evaluation failed:', backendResult.error);
      return this.frontendEvaluate(userAudioBuffer, referenceAudioBuffer, text, exerciseId);
      
    } catch (error) {
      console.error('❌ Backend unavailable:', error.message);
      return this.frontendEvaluate(userAudioBuffer, referenceAudioBuffer, text, exerciseId);
    }
  }



  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return buffer;
  }

  formatBackendResult(backendResult) {
    console.log('📦 Backend result received:', JSON.stringify(backendResult, null, 2));
    
    // Convert phoneme_errors to incorrectPhonemes format
    const incorrectPhonemes = (backendResult.phoneme_errors || []).map(err => {
      console.log('🔄 Converting phoneme error:', err);
      return {
        phoneme: err.expected || err.phoneme,
        detectedPhoneme: err.detected,
        teachingTip: err.teaching_tip,
        practice_words: err.practice_words,
        errorType: err.type,
        severity: err.severity,
        readableLabel: err.expected || err.phoneme
      };
    });

    console.log('✅ Formatted incorrectPhonemes:', incorrectPhonemes);
    console.log('✅ Phoneme breakdown:', backendResult.phoneme_breakdown);

    return {
      score: backendResult.score,
      incorrectPhonemes: incorrectPhonemes,
      phonemeBreakdown: backendResult.phoneme_breakdown || [],
      stressErrors: backendResult.stress_errors || [],
      feedbackText: backendResult.feedback,
      correctionAudios: [],
      algorithmVersion: backendResult.algorithm_version,
      source: 'backend'
    };
  }

  async frontendEvaluate(userAudioBuffer, referenceAudioBuffer, text, exerciseId) {
    console.error('❌ Backend unavailable - Cannot provide teaching feedback');
    
    // For a teaching app, we MUST have backend for accurate feedback
    // Return 0 score to indicate backend is required
    
    return {
      score: 0,
      incorrectPhonemes: [],
      stressErrors: [],
      feedbackText: '⚠️ Backend server is not running. Please start the backend to get pronunciation feedback.\n\nRun: cd backend && python app.py\n\nMake sure both devices are on the same WiFi network.',
      error: 'BACKEND_REQUIRED',
      correctionAudios: [],
      algorithmVersion: 'backend-required',
      source: 'frontend-error'
    };
  }





  standardizeMFCC(mfcc) {
    const flat = mfcc.flat();
    const mean = flat.reduce((a, b) => a + b, 0) / flat.length;
    const std = Math.sqrt(flat.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / flat.length);
    return mfcc.map(frame => frame.map(value => (value - mean) / (std || 1)));
  }





  createErrorResult() {
    return {
      score: 0,
      incorrectPhonemes: [],
      incorrectPhoneme: '',
      incorrectPhonemeReadable: '',
      severity: 0,
      feedbackText: 'Evaluation failed. Please try again.',
      correctionAudioUrl: null,
      slowAudioUrl: null,
      articulationAudioUrl: null,
      phonemeAlignments: [],
      normalizedDtwDistance: 0,
      pitchDeviationScore: 0,
      confidenceLevel: 'low',
      audioQuality: {}
    };
  }
}
