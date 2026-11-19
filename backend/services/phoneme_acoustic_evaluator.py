"""
Phoneme-Level Acoustic Pronunciation Evaluator
Evaluates pronunciation by analyzing acoustic features of each phoneme
Based on acoustic phonetics principles, not just audio quality
"""

import librosa
import numpy as np
import soundfile as sf

class PhonemeAcousticEvaluator:
    def __init__(self):
        # Expected formant ranges for vowels (F1, F2 in Hz)
        self.vowel_formants = {
            'AA': {'F1': (700, 850), 'F2': (1100, 1300)},  # "hot" - low back
            'AE': {'F1': (600, 750), 'F2': (1700, 2000)},  # "cat" - low front
            'AH': {'F1': (600, 750), 'F2': (1100, 1400)},  # "cup" - mid central
            'AO': {'F1': (500, 650), 'F2': (800, 1000)},   # "caught" - low back rounded
            'EH': {'F1': (500, 650), 'F2': (1700, 2000)},  # "bed" - mid front
            'IY': {'F1': (250, 350), 'F2': (2200, 2600)},  # "see" - high front
            'IH': {'F1': (350, 500), 'F2': (1900, 2300)},  # "sit" - high front lax
            'UW': {'F1': (250, 350), 'F2': (800, 1000)},   # "boot" - high back
            'UH': {'F1': (350, 500), 'F2': (1000, 1300)},  # "book" - high back lax
        }
        
        # Expected acoustic features for consonants
        self.consonant_features = {
            'T': {'type': 'stop', 'voicing': False, 'burst_freq': (3000, 5000)},
            'D': {'type': 'stop', 'voicing': True, 'burst_freq': (3000, 5000)},
            'K': {'type': 'stop', 'voicing': False, 'burst_freq': (2000, 4000)},
            'G': {'type': 'stop', 'voicing': True, 'burst_freq': (2000, 4000)},
            'P': {'type': 'stop', 'voicing': False, 'burst_freq': (500, 2000)},
            'B': {'type': 'stop', 'voicing': True, 'burst_freq': (500, 2000)},
            'S': {'type': 'fricative', 'voicing': False, 'center_freq': (4000, 8000)},
            'Z': {'type': 'fricative', 'voicing': True, 'center_freq': (4000, 8000)},
            'F': {'type': 'fricative', 'voicing': False, 'center_freq': (3000, 7000)},
            'V': {'type': 'fricative', 'voicing': True, 'center_freq': (3000, 7000)},
            'TH': {'type': 'fricative', 'voicing': False, 'center_freq': (4000, 8000)},
            'DH': {'type': 'fricative', 'voicing': True, 'center_freq': (4000, 8000)},
            'SH': {'type': 'fricative', 'voicing': False, 'center_freq': (2000, 4000)},
            'HH': {'type': 'fricative', 'voicing': False, 'center_freq': (500, 3000)},
            'M': {'type': 'nasal', 'voicing': True, 'formant_freq': (200, 400)},
            'N': {'type': 'nasal', 'voicing': True, 'formant_freq': (200, 400)},
            'NG': {'type': 'nasal', 'voicing': True, 'formant_freq': (200, 400)},
            'L': {'type': 'liquid', 'voicing': True, 'formant_freq': (300, 600)},
            'R': {'type': 'liquid', 'voicing': True, 'formant_freq': (1000, 1500)},
            'W': {'type': 'glide', 'voicing': True, 'formant_freq': (200, 400)},
            'Y': {'type': 'glide', 'voicing': True, 'formant_freq': (200, 400)},
        }
    
    def evaluate_pronunciation(self, audio_path, expected_phonemes, detected_phonemes):
        """
        Evaluate pronunciation by analyzing acoustic features of each phoneme
        
        Returns:
            - score: 0-100 based on phoneme accuracy
            - phoneme_scores: Individual scores for each phoneme
            - errors: Detailed error descriptions
        """
        try:
            # Load audio
            audio, sr = sf.read(audio_path)
            if len(audio.shape) > 1:
                audio = audio[:, 0]
            
            # Resample to 16kHz
            if sr != 16000:
                audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
                sr = 16000
            
            # Segment audio by phonemes (equal duration for now)
            phoneme_segments = self._segment_audio(audio, sr, len(expected_phonemes))
            
            # Evaluate each phoneme with STRICT criteria
            phoneme_scores = []
            errors = []
            
            print(f"[ACOUSTIC] Evaluating {len(expected_phonemes)} phonemes...")
            
            for i, (expected, detected, segment) in enumerate(zip(expected_phonemes, detected_phonemes, phoneme_segments)):
                if expected == detected:
                    # Same phoneme - check acoustic quality STRICTLY
                    score = self._evaluate_phoneme_quality(segment, sr, expected)
                    phoneme_scores.append(score)
                    
                    print(f"[ACOUSTIC] Phoneme {i}: {expected} = score {score}")
                    
                    # Report issues for scores below 85 (not 70)
                    if score < 85:
                        errors.append({
                            'position': i,
                            'phoneme': expected,
                            'detected': detected,
                            'score': score,
                            'severity': 4 if score < 60 else (3 if score < 70 else 2),
                            'issue': self._diagnose_phoneme_issue(segment, sr, expected),
                            'teaching_tip': self._get_acoustic_teaching_tip(expected, score),
                            'type': 'pronunciation_quality'
                        })
                else:
                    # Different phoneme - substitution error
                    phoneme_scores.append(0)
                    errors.append({
                        'position': i,
                        'phoneme': expected,
                        'detected': detected,
                        'score': 0,
                        'severity': 5,
                        'issue': f'Said "{detected}" instead of "{expected}"',
                        'teaching_tip': f'You substituted "{detected}" for "{expected}". Focus on the correct sound.',
                        'type': 'phoneme_mismatch'
                    })
            
            # Calculate overall score
            if len(phoneme_scores) > 0:
                overall_score = int(np.mean(phoneme_scores))
            else:
                overall_score = 0
            
            return {
                'score': overall_score,
                'phoneme_scores': phoneme_scores,
                'errors': errors
            }
            
        except Exception as e:
            print(f"[ERROR] Phoneme evaluation CRASHED: {e}")
            import traceback
            traceback.print_exc()
            print(f"[ERROR] Returning default score 50")
            return {'score': 50, 'phoneme_scores': [], 'errors': []}
    
    def _segment_audio(self, audio, sr, num_phonemes):
        """Segment audio into phoneme-sized chunks"""
        segment_length = len(audio) // num_phonemes
        segments = []
        
        for i in range(num_phonemes):
            start = i * segment_length
            end = start + segment_length if i < num_phonemes - 1 else len(audio)
            segments.append(audio[start:end])
        
        return segments
    
    def _evaluate_phoneme_quality(self, segment, sr, phoneme):
        """Evaluate acoustic quality of a single phoneme"""
        if len(segment) < 100:
            return 50
        
        # Check if vowel or consonant
        if phoneme in self.vowel_formants:
            return self._evaluate_vowel(segment, sr, phoneme)
        elif phoneme in self.consonant_features:
            return self._evaluate_consonant(segment, sr, phoneme)
        else:
            return 70  # Unknown phoneme
    
    def _evaluate_vowel(self, segment, sr, phoneme):
        """Evaluate vowel pronunciation by checking formants - STRICT evaluation"""
        try:
            # Extract formants using LPC
            formants = self._extract_formants(segment, sr)
            
            if formants is None or len(formants) < 2:
                # Can't extract formants = poor quality
                return 55
            
            F1, F2 = formants[0], formants[1]
            expected = self.vowel_formants[phoneme]
            
            # Calculate percentage deviation from expected range center
            F1_center = (expected['F1'][0] + expected['F1'][1]) / 2
            F2_center = (expected['F2'][0] + expected['F2'][1]) / 2
            
            F1_deviation = abs(F1 - F1_center) / F1_center
            F2_deviation = abs(F2 - F2_center) / F2_center
            
            # STRICT scoring:
            # 0-5% deviation = 95-100 (excellent)
            # 5-10% deviation = 85-95 (good)
            # 10-20% deviation = 70-85 (acceptable)
            # 20-30% deviation = 50-70 (needs work)
            # >30% deviation = 30-50 (poor)
            
            F1_score = max(30, min(100, 100 - (F1_deviation * 200)))
            F2_score = max(30, min(100, 100 - (F2_deviation * 200)))
            
            # Average the two formant scores
            score = int((F1_score + F2_score) / 2)
            
            print(f"  Vowel {phoneme}: F1={F1:.0f}Hz (expected {expected['F1']}), F2={F2:.0f}Hz (expected {expected['F2']}), score={score}")
            
            return max(30, min(100, score))
            
        except Exception as e:
            print(f"[ERROR] Vowel evaluation failed: {e}")
            return 55
    
    def _evaluate_consonant(self, segment, sr, phoneme):
        """Evaluate consonant pronunciation - STRICT evaluation"""
        try:
            features = self.consonant_features[phoneme]
            
            # Check voicing - STRICT
            if features['voicing']:
                voicing_score = self._check_voicing(segment, sr)
            else:
                voicing_score = 100 - self._check_voicing(segment, sr)
            
            # Check spectral characteristics - STRICT
            spectral_score = self._check_spectral_features(segment, sr, features)
            
            # Check duration - STRICT
            duration = len(segment) / sr
            if features['type'] == 'stop':
                # Stops should be 0.05-0.15 seconds
                if 0.05 <= duration <= 0.15:
                    duration_score = 95
                elif duration < 0.05:
                    duration_score = max(50, 95 - (0.05 - duration) * 500)
                else:
                    duration_score = max(50, 95 - (duration - 0.15) * 300)
            else:
                # Fricatives should be 0.1-0.25 seconds
                if 0.1 <= duration <= 0.25:
                    duration_score = 95
                elif duration < 0.1:
                    duration_score = max(50, 95 - (0.1 - duration) * 400)
                else:
                    duration_score = max(50, 95 - (duration - 0.25) * 200)
            
            # Combine scores with STRICT weighting
            score = int((voicing_score * 0.35 + spectral_score * 0.45 + duration_score * 0.20))
            
            print(f"  Consonant {phoneme}: voicing={voicing_score}, spectral={spectral_score}, duration={duration_score}, final={score}")
            
            return max(30, min(100, score))
            
        except Exception as e:
            print(f"[ERROR] Consonant evaluation failed: {e}")
            return 55
    
    def _extract_formants(self, segment, sr):
        """Extract first 2 formants using LPC"""
        try:
            # Pre-emphasis
            pre_emphasized = np.append(segment[0], segment[1:] - 0.97 * segment[:-1])
            
            # LPC analysis
            lpc_order = 12
            a = librosa.lpc(pre_emphasized, order=lpc_order)
            
            # Find roots
            roots = np.roots(a)
            roots = roots[np.imag(roots) >= 0]
            
            # Convert to frequencies
            angles = np.arctan2(np.imag(roots), np.real(roots))
            freqs = sorted(angles * (sr / (2 * np.pi)))
            
            # Return first 2 formants (F1, F2)
            formants = [f for f in freqs if 200 < f < 4000]
            
            return formants[:2] if len(formants) >= 2 else None
            
        except Exception as e:
            return None
    
    def _check_voicing(self, segment, sr):
        """Check if segment is voiced (0-100 score)"""
        # Calculate zero-crossing rate
        zcr = np.mean(librosa.feature.zero_crossing_rate(segment))
        
        # Voiced sounds have lower ZCR
        if zcr < 0.1:
            return 100  # Strongly voiced
        elif zcr < 0.2:
            return 70   # Moderately voiced
        else:
            return 30   # Unvoiced
    
    def _check_spectral_features(self, segment, sr, features):
        """Check spectral characteristics - STRICT evaluation"""
        try:
            # Calculate spectral centroid
            centroid = np.mean(librosa.feature.spectral_centroid(y=segment, sr=sr))
            
            # Check against expected frequency range
            if 'burst_freq' in features:
                expected_range = features['burst_freq']
            elif 'center_freq' in features:
                expected_range = features['center_freq']
            elif 'formant_freq' in features:
                expected_range = features['formant_freq']
            else:
                return 65
            
            # Calculate center and deviation
            center = (expected_range[0] + expected_range[1]) / 2
            deviation = abs(centroid - center) / center
            
            # STRICT scoring based on percentage deviation
            # 0-10% deviation = 90-100
            # 10-20% deviation = 75-90
            # 20-40% deviation = 55-75
            # >40% deviation = 30-55
            
            if deviation < 0.1:
                score = int(100 - (deviation * 100))
            elif deviation < 0.2:
                score = int(90 - ((deviation - 0.1) * 150))
            elif deviation < 0.4:
                score = int(75 - ((deviation - 0.2) * 100))
            else:
                score = int(max(30, 55 - ((deviation - 0.4) * 50)))
            
            return max(30, min(100, score))
                
        except Exception as e:
            return 60
    
    def _diagnose_phoneme_issue(self, segment, sr, phoneme):
        """Diagnose what's wrong with the phoneme"""
        if phoneme in self.vowel_formants:
            formants = self._extract_formants(segment, sr)
            if formants and len(formants) >= 2:
                expected = self.vowel_formants[phoneme]
                F1, F2 = formants[0], formants[1]
                
                if F1 < expected['F1'][0]:
                    return "Tongue too high"
                elif F1 > expected['F1'][1]:
                    return "Tongue too low"
                elif F2 < expected['F2'][0]:
                    return "Tongue too back"
                elif F2 > expected['F2'][1]:
                    return "Tongue too front"
        
        return "Unclear pronunciation"
    
    def _get_acoustic_teaching_tip(self, phoneme, score):
        """Get teaching tip based on acoustic analysis"""
        if score >= 80:
            return f"Good pronunciation of {phoneme}. Minor improvements possible."
        elif score >= 60:
            return f"Your {phoneme} sound needs improvement. Focus on mouth position and tongue placement."
        else:
            return f"Your {phoneme} sound is significantly off. Review the teaching instructions carefully."
