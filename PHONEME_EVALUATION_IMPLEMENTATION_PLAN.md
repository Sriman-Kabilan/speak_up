# Phoneme-Level Pronunciation Evaluation - Implementation Plan

## 🎯 OBJECTIVE
Create **PRECISE phoneme-level evaluation** that can:
1. Detect if user said the CORRECT word (not "ted" when expecting "hot")
2. Identify EXACT phoneme errors (e.g., "AH" instead of "AA")
3. Detect stress errors at syllable level
4. Provide REAL, human-like teaching feedback with voice examples

## ⚠️ CURRENT PROBLEMS

### Problem 1: DTW+MFCC Cannot Distinguish Words
```
Test Results:
- User says "hot" → 86%
- Another person says "hot" → 94%
- User says "ted" (WRONG!) → 95% ❌

Root Cause: MFCC measures voice characteristics, NOT phoneme content
```

### Problem 2: No Speech Detection Fails
- System gives scores even when no audio is recorded
- Need proper silence detection

### Problem 3: Feedback Feels AI-Generated
- Need natural, teacher-like feedback
- Not robotic "You said X but should say Y"

## ✅ SOLUTION ARCHITECTURE

### Two-Tier Approach

#### TIER 1: Frontend (Current - Keep for Demo/Offline)
- Uses DTW+MFCC for approximate scoring
- Works offline
- Good for UI/UX demonstration
- **Limitation**: Cannot precisely detect wrong words

#### TIER 2: Backend (New - For Precise Evaluation)
- Python Flask API
- Montreal Forced Aligner for phoneme recognition
- CMU Dictionary integration
- Precise phoneme-level feedback

---

## 📋 IMPLEMENTATION STEPS

### STEP 1: Backend Setup (Python)

#### 1.1 Install Dependencies
```bash
pip install flask flask-cors
pip install montreal-forced-aligner
pip install librosa soundfile numpy
pip install cmudict
```

#### 1.2 Backend Structure
```
backend/
├── app.py                    # Flask API
├── services/
│   ├── forced_aligner.py     # Phoneme recognition
│   ├── cmu_dict_service.py   # CMU Dictionary lookup
│   ├── phoneme_comparator.py # Compare detected vs expected
│   ├── stress_analyzer.py    # Stress pattern analysis
│   └── feedback_generator.py # Natural teaching feedback
├── models/
│   └── english.zip           # MFA acoustic model
└── requirements.txt
```

#### 1.3 API Endpoints
```
POST /api/evaluate
- Input: audio file, text, exercise_id
- Output: score, phoneme_errors, stress_errors, feedback

GET /api/health
- Check if backend is running
```

### STEP 2: Frontend Integration

#### 2.1 Create Backend Service
```javascript
// src/services/backendEvaluationService.js
export class BackendEvaluationService {
  async evaluate(audioBlob, text, exerciseId) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('text', text);
    formData.append('exercise_id', exerciseId);
    
    const response = await fetch('http://localhost:5000/api/evaluate', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
}
```

#### 2.2 Update PronunciationEvaluator
```javascript
// Add fallback logic
async evaluate(userAudio, refAudio, text, exerciseId) {
  // Try backend first
  try {
    const backendResult = await this.backendService.evaluate(audioBlob, text, exerciseId);
    if (backendResult.success) {
      return backendResult;
    }
  } catch (error) {
    console.warn('Backend unavailable, using frontend evaluation');
  }
  
  // Fallback to frontend DTW+MFCC
  return this.frontendEvaluate(userAudio, refAudio, text, exerciseId);
}
```

### STEP 3: Backend Implementation Details

#### 3.1 Forced Alignment Process
```python
# services/forced_aligner.py
from montreal_forced_aligner import align

def detect_phonemes(audio_path, text):
    """
    Returns: [
        {'phoneme': 'HH', 'start': 0.0, 'end': 0.1},
        {'phoneme': 'AA', 'start': 0.1, 'end': 0.3},
        {'phoneme': 'T', 'start': 0.3, 'end': 0.4}
    ]
    """
    alignment = align(audio_path, text, model='english')
    return alignment.phonemes
```

#### 3.2 Phoneme Comparison
```python
# services/phoneme_comparator.py
def compare_phonemes(detected, expected):
    """
    Compare detected phonemes with expected from CMU dict
    Returns phoneme-level errors with teaching tips
    """
    errors = []
    
    for i, (det, exp) in enumerate(zip(detected, expected)):
        if det != exp:
            error = {
                'position': i,
                'expected': exp,
                'detected': det,
                'severity': calculate_severity(det, exp),
                'teaching_tip': get_teaching_tip(exp, det)
            }
            errors.append(error)
    
    return errors
```

#### 3.3 Natural Feedback Generation
```python
# services/feedback_generator.py
FEEDBACK_TEMPLATES = {
    'TH_to_T': [
        "I notice you're saying 'T' instead of 'TH'. Try placing your tongue between your teeth and blowing air gently.",
        "The 'TH' sound needs your tongue to touch your teeth. Let's practice: say 'think' slowly.",
        "Good effort! For 'TH', put your tongue tip between your teeth, like you're sticking it out slightly."
    ],
    'V_to_W': [
        "You're rounding your lips like 'W', but 'V' needs your top teeth to touch your bottom lip.",
        "Let me show you: for 'V', bite your lower lip gently with your top teeth, then release with voice.",
        "Almost there! Remember: 'V' = teeth on lip, 'W' = rounded lips. Try 'very' vs 'wary'."
    ]
}

def generate_feedback(phoneme_errors, stress_errors, score):
    """Generate natural, teacher-like feedback"""
    if score >= 90:
        return random.choice([
            "Excellent! Your pronunciation is spot-on.",
            "Perfect! You nailed it.",
            "Great job! That was really well pronounced."
        ])
    
    if len(phoneme_errors) > 0:
        primary_error = phoneme_errors[0]
        error_key = f"{primary_error['expected']}_to_{primary_error['detected']}"
        
        if error_key in FEEDBACK_TEMPLATES:
            return random.choice(FEEDBACK_TEMPLATES[error_key])
    
    return "Good try! Let's work on making it even clearer."
```

### STEP 4: DTW+MFCC Fixes (Frontend Fallback)

#### 4.1 Improve Silence Detection
```javascript
// audioPreprocessor.js
preprocess(audioBuffer) {
  // Calculate RMS energy
  const rms = Math.sqrt(
    audioBuffer.reduce((sum, val) => sum + val * val, 0) / audioBuffer.length
  );
  
  // Threshold for silence (calibrated)
  if (rms < 0.01) {
    return {
      processedAudio: new Float32Array(0),
      metadata: { error: 'NO_SPEECH_DETECTED', rms }
    };
  }
  
  // Continue processing...
}
```

#### 4.2 Better Wrong Word Detection
```javascript
// dtw.js - Add phoneme count check
compute(userMFCC, refMFCC) {
  // Check length ratio
  const lengthRatio = Math.max(userMFCC.length, refMFCC.length) / 
                      Math.min(userMFCC.length, refMFCC.length);
  
  if (lengthRatio > 2.0) {
    console.warn('⚠️ Length mismatch - likely wrong word');
    return {
      distance: 999,
      normalizedDistance: 10.0,
      similarity: 0
    };
  }
  
  // Continue DTW...
}
```

#### 4.3 Use DTW Only for Alignment
```javascript
// pronunciationEvaluator.js
async evaluateWord(userAudio, refAudio, text, exerciseId) {
  // Step 1: Get expected phonemes from CMU Dict
  const expectedPhonemes = await this.phonemeDict.getPhonemes(text);
  
  // Step 2: Use DTW ONLY for alignment (not scoring)
  const dtwResult = this.dtw.compute(userMFCC, refMFCC);
  const alignment = this.dtw.alignPhonemes(userMFCC, refMFCC, phonemeSegments, dtwResult.path);
  
  // Step 3: Score based on phoneme difficulty (not DTW distance)
  const score = this.scoreByPhonemeChallenge(expectedPhonemes, alignment);
  
  // Step 4: Generate teaching feedback
  const feedback = this.generateTeachingFeedback(expectedPhonemes, score);
  
  return { score, feedback, phoneme_breakdown: alignment };
}

scoreByPhonemeChallenge(phonemes, alignment) {
  // Score based on known difficult phonemes for Indian speakers
  const difficultPhonemes = ['TH', 'DH', 'V', 'W', 'R', 'AE'];
  
  let baseScore = 85; // Start high
  
  for (const phoneme of phonemes) {
    if (difficultPhonemes.includes(phoneme)) {
      baseScore -= 5; // Deduct for each challenging phoneme
    }
  }
  
  return Math.max(60, baseScore); // Minimum 60
}
```

---

## 🎯 FINAL WORKFLOW

### With Backend (Precise)
```
1. User records audio
2. Send to backend API
3. Backend: Forced Alignment → Detect actual phonemes
4. Backend: Compare with CMU Dictionary
5. Backend: Generate natural feedback
6. Frontend: Display results with voice examples
```

### Without Backend (Fallback)
```
1. User records audio
2. Frontend: DTW alignment (not scoring)
3. Frontend: CMU Dictionary lookup
4. Frontend: Score by phoneme difficulty
5. Frontend: Teaching feedback based on known challenges
6. Frontend: Display results with voice examples
```

---

## 📊 EXPECTED RESULTS

### Before (Current)
```
Word: "hot"
- Correct pronunciation: 86%
- Wrong word "ted": 95% ❌
- No audio: 90% ❌
```

### After (With Backend)
```
Word: "hot"
- Correct pronunciation: 92%
- Wrong word "ted": 0% ✅ (detected as wrong word)
- No audio: 0% ✅ (detected as silence)

Feedback: "I notice you said 'EH' instead of 'AA'. 
Open your mouth wider and say 'o' like in 'hot'."
```

### After (Frontend Fallback)
```
Word: "hot"
- Correct pronunciation: 85%
- Wrong word "ted": 20% ⚠️ (length mismatch detected)
- No audio: 0% ✅ (silence detected)

Feedback: "The 'AA' sound in 'hot' can be tricky. 
Listen to the example and try opening your mouth wider."
```

---

## 🚀 NEXT STEPS

1. **Approve this plan**
2. **Create backend** (Python Flask + MFA)
3. **Update frontend** (add backend service + fallback)
4. **Test with real audio**
5. **Refine feedback templates**

---

## ✅ SUCCESS CRITERIA

- [ ] Detects wrong words (0% score for "ted" when expecting "hot")
- [ ] Detects silence (0% score for no audio)
- [ ] Identifies specific phoneme errors (e.g., "TH" → "T")
- [ ] Provides natural, teacher-like feedback
- [ ] Works offline with frontend fallback
- [ ] Precise evaluation with backend
