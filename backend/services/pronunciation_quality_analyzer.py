"""
Pronunciation Quality Analyzer
Uses MFCC+DTW to analyze pronunciation quality
Checks HOW WELL the word was pronounced, not just WHAT was said
"""

import soundfile as sf
import numpy as np

class PronunciationQualityAnalyzer:
    def analyze_quality(self, user_audio_path, reference_audio_path, expected_phonemes, is_correct_word):
        """
        Analyze pronunciation quality using MFCC+DTW
        
        Returns quality score and phoneme-level errors
        """
        
        if not reference_audio_path:
            # No reference audio - estimate quality from audio characteristics
            print("WARNING: No reference audio, using audio quality estimation")
            try:
                user_audio, user_sr = sf.read(user_audio_path)
                if len(user_audio.shape) > 1:
                    user_audio = user_audio[:, 0]
                
                # Estimate quality from audio characteristics
                quality_score = self._estimate_quality_from_audio(user_audio, user_sr)
                
                # Generate phoneme errors if quality is low
                phoneme_errors = []
                if quality_score < 85:
                    # Distribute quality issues across phonemes
                    num_issues = max(1, int((85 - quality_score) / 15))
                    for i in range(min(num_issues, len(expected_phonemes))):
                        phoneme = expected_phonemes[i]
                        severity = 4 if quality_score < 50 else (3 if quality_score < 65 else 2)
                        phoneme_errors.append({
                            'position': i,
                            'expected': phoneme,
                            'detected': phoneme,
                            'severity': severity,
                            'type': 'pronunciation_quality',
                            'teaching_tip': self._get_quality_teaching_tip(phoneme, quality_score),
                            'readableLabel': phoneme,
                            'quality_score': quality_score
                        })
                
                return {
                    'quality_score': quality_score,
                    'phoneme_errors': phoneme_errors
                }
            except Exception as e:
                print(f"ERROR: Audio quality estimation error: {e}")
                return {
                    'quality_score': 70,
                    'phoneme_errors': []
                }
        
        if not is_correct_word:
            # Wrong word - return neutral quality
            return {
                'quality_score': 70,
                'phoneme_errors': []
            }
        
        try:
            # Load audios
            user_audio, user_sr = sf.read(user_audio_path)
            ref_audio, ref_sr = sf.read(reference_audio_path)
            
            # Convert to mono
            if len(user_audio.shape) > 1:
                user_audio = user_audio[:, 0]
            if len(ref_audio.shape) > 1:
                ref_audio = ref_audio[:, 0]
            
            # Extract MFCC
            user_mfcc = self._extract_mfcc(user_audio, user_sr)
            ref_mfcc = self._extract_mfcc(ref_audio, ref_sr)
            
            # Normalize separately
            user_mfcc = self._normalize(user_mfcc)
            ref_mfcc = self._normalize(ref_mfcc)
            
            # DTW comparison
            dtw_distance = self._dtw_distance(user_mfcc, ref_mfcc)
            
            # Convert distance to quality score
            quality_score = self._distance_to_score(dtw_distance)
            
            # Analyze phoneme-level quality
            phoneme_errors = self._analyze_phoneme_quality(
                user_mfcc, ref_mfcc, expected_phonemes, quality_score
            )
            
            print(f"Quality Analysis: DTW={dtw_distance:.4f}, Score={quality_score}")
            
            return {
                'quality_score': quality_score,
                'phoneme_errors': phoneme_errors
            }
            
        except Exception as e:
            print(f"ERROR: Quality analysis error: {e}")
            return {
                'quality_score': 70,
                'phoneme_errors': []
            }
    
    def _extract_mfcc(self, audio, sr):
        """Extract MFCC features"""
        import librosa
        
        # Resample to 16kHz
        if sr != 16000:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
        
        # Extract 13 MFCC coefficients
        mfcc = librosa.feature.mfcc(y=audio, sr=16000, n_mfcc=13, n_fft=512, hop_length=160)
        
        return mfcc.T  # Transpose to (time, features)
    
    def _estimate_quality_from_audio(self, audio, sr):
        """Estimate pronunciation quality from audio characteristics when no reference available"""
        import librosa
        
        # Resample to 16kHz
        if sr != 16000:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
            sr = 16000
        
        # Calculate audio quality metrics
        # 1. Energy/volume
        energy = np.sqrt(np.mean(audio ** 2))
        
        # 2. Zero crossing rate (clarity)
        zcr = np.mean(librosa.feature.zero_crossing_rate(audio))
        
        # 3. Spectral centroid (brightness/clarity)
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))
        
        # 4. Duration (too short = rushed, too long = unclear)
        duration = len(audio) / sr
        
        # Score based on metrics
        score = 100
        
        # Energy check (too quiet = poor quality)
        if energy < 0.01:
            score -= 30
        elif energy < 0.03:
            score -= 15
        
        # Duration check (for single word, expect 0.3-1.5 seconds)
        if duration < 0.2:
            score -= 20  # Too rushed
        elif duration > 2.0:
            score -= 10  # Too slow
        
        # ZCR check (clarity indicator)
        if zcr < 0.05:
            score -= 10
        
        # Spectral centroid (brightness)
        if spectral_centroid < 500:
            score -= 10  # Too muffled
        
        score = max(50, min(100, score))  # Clamp between 50-100
        
        print(f"Audio quality estimation: energy={energy:.4f}, zcr={zcr:.4f}, duration={duration:.2f}s, score={score}")
        
        return score
    
    def _normalize(self, mfcc):
        """Normalize MFCC"""
        mean = np.mean(mfcc)
        std = np.std(mfcc)
        return (mfcc - mean) / (std + 1e-8)
    
    def _dtw_distance(self, seq1, seq2):
        """Compute DTW distance"""
        n, m = len(seq1), len(seq2)
        dtw = np.full((n + 1, m + 1), np.inf)
        dtw[0, 0] = 0
        
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                cost = np.linalg.norm(seq1[i-1] - seq2[j-1])
                dtw[i, j] = cost + min(dtw[i-1, j], dtw[i, j-1], dtw[i-1, j-1])
        
        # Normalize by path length
        path_length = n + m
        return dtw[n, m] / (path_length * 13)
    
    def _distance_to_score(self, distance):
        """Convert DTW distance to quality score - STRICT thresholds"""
        if distance < 0.08: return 100
        if distance < 0.12: return 95
        if distance < 0.16: return 90
        if distance < 0.20: return 85
        if distance < 0.24: return 80
        if distance < 0.28: return 75
        if distance < 0.32: return 70
        if distance < 0.36: return 65
        if distance < 0.40: return 60
        if distance < 0.45: return 55
        if distance < 0.50: return 50
        return max(30, int(100 - distance * 120))
    
    def _analyze_phoneme_quality(self, user_mfcc, ref_mfcc, phonemes, overall_score):
        """Analyze quality of ALL phonemes - if overall score is low, distribute issues"""
        errors = []
        phoneme_duration = len(ref_mfcc) / len(phonemes)
        phoneme_scores = []
        
        # First pass: calculate all phoneme scores
        for i, phoneme in enumerate(phonemes):
            start = int(i * phoneme_duration)
            end = int((i + 1) * phoneme_duration)
            
            if start < len(user_mfcc) and end <= len(ref_mfcc):
                user_segment = user_mfcc[start:end]
                ref_segment = ref_mfcc[start:end]
                
                if len(user_segment) > 0 and len(ref_segment) > 0:
                    segment_distance = self._dtw_distance(user_segment, ref_segment)
                    segment_score = self._distance_to_score(segment_distance)
                    phoneme_scores.append((i, phoneme, segment_score))
                else:
                    phoneme_scores.append((i, phoneme, overall_score))
            else:
                phoneme_scores.append((i, phoneme, overall_score))
        
        # If overall score is low but all segments are high, adjust worst segments
        if overall_score < 85 and all(score >= 85 for _, _, score in phoneme_scores):
            # Find phonemes with lowest scores and mark them
            phoneme_scores.sort(key=lambda x: x[2])
            # Mark worst phonemes based on how low overall score is
            num_to_mark = max(1, int((85 - overall_score) / 10))
            for i in range(min(num_to_mark, len(phoneme_scores))):
                pos, phoneme, score = phoneme_scores[i]
                # Adjust score to reflect overall quality
                adjusted_score = min(score, overall_score + 10)
                severity = 4 if adjusted_score < 50 else (3 if adjusted_score < 65 else (2 if adjusted_score < 80 else 1))
                teaching_tip = self._get_quality_teaching_tip(phoneme, adjusted_score)
                
                errors.append({
                    'position': pos,
                    'expected': phoneme,
                    'detected': phoneme,
                    'severity': severity,
                    'type': 'pronunciation_quality',
                    'teaching_tip': teaching_tip,
                    'readableLabel': phoneme,
                    'quality_score': adjusted_score
                })
        else:
            # Normal case: report phonemes with quality < 85
            for i, phoneme, segment_score in phoneme_scores:
                if segment_score < 85:
                    severity = 4 if segment_score < 50 else (3 if segment_score < 65 else (2 if segment_score < 80 else 1))
                    teaching_tip = self._get_quality_teaching_tip(phoneme, segment_score)
                    
                    errors.append({
                        'position': i,
                        'expected': phoneme,
                        'detected': phoneme,
                        'severity': severity,
                        'type': 'pronunciation_quality',
                        'teaching_tip': teaching_tip,
                        'readableLabel': phoneme,
                        'quality_score': segment_score
                    })
        
        print(f"Phoneme quality errors found: {len(errors)}")
        for err in errors:
            print(f"  - {err['expected']}: score={err['quality_score']}, severity={err['severity']}")
        
        return errors
    
    def _get_quality_teaching_tip(self, phoneme, score):
        """Get specific teaching tip based on phoneme and quality score"""
        
        # Determine quality issue type
        if score < 65:
            level = 'critical'
        elif score < 80:
            level = 'moderate'
        else:
            level = 'minor'
        
        tips = {
            'HH': {
                'critical': 'Your H sound is very weak. Blow air FORCEFULLY from deep in your throat with mouth wide open. Practice: "ha-ha-ha" loudly.',
                'moderate': 'Your H sound needs MORE air. Exhale STRONGLY while saying H. Imagine fogging a mirror.',
                'minor': 'Your H sound is slightly weak. Add a bit more breath at the start.'
            },
            'AA': {
                'critical': 'Your AA vowel is WRONG. Drop jaw FULLY, open mouth WIDE, and say "ahhh" for 2 seconds like at doctor.',
                'moderate': 'Your AA vowel is too CLOSED. Open mouth WIDER and hold sound LONGER (0.3 seconds).',
                'minor': 'Your AA vowel is slightly short. Hold it a bit longer with mouth fully open.'
            },
            'AE': {
                'critical': 'Your AE vowel is WRONG. Stretch mouth VERY WIDE like big smile, pull lips back, say "aaaa".',
                'moderate': 'Your AE vowel needs more WIDTH. Make mouth WIDER, stretch lips more.',
                'minor': 'Your AE vowel is slightly narrow. Smile wider while saying it.'
            },
            'T': {
                'critical': 'Your T sound is UNCLEAR. Touch tongue TIP to roof behind teeth, build pressure, release SHARPLY.',
                'moderate': 'Your T sound needs to be CRISPER. Make a SHARP release with tongue.',
                'minor': 'Your T sound is slightly soft. Make it more crisp and clear.'
            },
            'TH': {
                'critical': 'Your TH sound is WRONG. Place tongue BETWEEN teeth (stick out slightly) and blow air gently.',
                'moderate': 'Your TH sound needs tongue BETWEEN teeth. Don\'t touch teeth with lips.',
                'minor': 'Your TH sound is almost correct. Ensure tongue touches teeth lightly.'
            },
            'V': {
                'critical': 'Your V sound is WRONG. Touch UPPER teeth to LOWER lip firmly and VIBRATE vocal cords.',
                'moderate': 'Your V sound needs teeth ON lip. Don\'t round lips like W.',
                'minor': 'Your V sound is close. Ensure teeth touch lower lip more firmly.'
            },
            'W': {
                'critical': 'Your W sound is WRONG. ROUND lips tightly (like kissing), NO teeth contact, blow air.',
                'moderate': 'Your W sound needs MORE lip rounding. Make lips rounder.',
                'minor': 'Your W sound is close. Round lips a bit more.'
            },
            'R': {
                'critical': 'Your R sound is WRONG. CURL tongue back (don\'t touch roof), make throat sound.',
                'moderate': 'Your R sound needs more tongue CURL. Pull tongue back more.',
                'minor': 'Your R sound is close. Curl tongue back slightly more.'
            },
            'L': {
                'critical': 'Your L sound is WRONG. Touch tongue TIP to roof of mouth behind teeth FIRMLY.',
                'moderate': 'Your L sound needs FIRMER tongue contact with roof.',
                'minor': 'Your L sound is close. Press tongue to roof more firmly.'
            }
        }
        
        if phoneme in tips:
            return tips[phoneme][level]
        else:
            if level == 'critical':
                return f'Your "{phoneme}" sound has SERIOUS issues (score: {score}%). Listen to reference audio and practice this sound in isolation 10 times.'
            elif level == 'moderate':
                return f'Your "{phoneme}" sound needs improvement (score: {score}%). Focus on matching the reference pronunciation exactly.'
            else:
                return f'Your "{phoneme}" sound is almost correct (score: {score}%). Practice to match reference perfectly.'
