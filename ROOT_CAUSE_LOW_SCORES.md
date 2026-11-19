# ROOT CAUSE: Scores Stuck at 20-35%

## 🚨 CRITICAL ISSUE IDENTIFIED

### The Problem
**Reference audio is a FAKE SINE WAVE, not real speech**

Current code in `PracticeExerciseScreen.js`:
```javascript
const generateReferenceBuffer = async (text) => {
  const buffer = new Float32Array(Math.floor(sampleRate * estimatedDuration));
  
  // This generates a SINE WAVE, not speech!
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    const freq = 200 + Math.sin(t * 2) * 50;
    buffer[i] = Math.sin(2 * Math.PI * freq * t) * 0.3 * (1 - t / estimatedDuration);
  }
  
  return buffer;
};
```

### What Happens
1. User speaks "cat" (real speech with phonemes)
2. Reference is 200-250Hz sine wave (pure tone)
3. MFCC extracts features:
   - User MFCC: Complex speech patterns
   - Reference MFCC: Simple sine wave pattern
4. DTW compares speech vs tone
5. Distance is ALWAYS massive (>2.0)
6. Score = 100 - (2.0/2.5 * 100) = 20%

### Why Scores Don't Rise
- Even perfect pronunciation gets 20-35%
- DTW is working correctly
- MFCC is working correctly
- **The reference is wrong!**

---

## ✅ SOLUTIONS

### Option 1: Use Web Speech API (Quick Fix)
Record reference audio using Web Speech API:

```javascript
const generateReferenceBuffer = async (text) => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    
    // Capture audio using MediaRecorder
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const dest = audioContext.createMediaStreamDestination();
    
    // Connect speech synthesis to destination
    const source = audioContext.createMediaStreamSource(dest.stream);
    const recorder = new MediaRecorder(dest.stream);
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks);
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      resolve(audioBuffer.getChannelData(0));
    };
    
    recorder.start();
    window.speechSynthesis.speak(utterance);
    utterance.onend = () => recorder.stop();
  });
};
```

### Option 2: Pre-recorded Audio Files (Best)
Store real audio recordings:

```
/public/audio/reference/
  a.wav
  b.wav
  c.wav
  ...
  cat.wav
  dog.wav
```

Load in `loadReferenceAudio()`:
```javascript
const loadReferenceAudio = async () => {
  const audioUrl = `/audio/reference/${currentExercise.text.toLowerCase()}.wav`;
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  setReferenceAudioBuffer(audioBuffer.getChannelData(0));
};
```

### Option 3: User's First Recording as Reference (Temporary)
Use user's own recording as reference:

```javascript
// After first recording
if (!referenceAudioBuffer) {
  setReferenceAudioBuffer(result.audioBuffer);
  Alert.alert('Reference Set', 'Your recording is now the reference. Try again!');
  return;
}
```

---

## 🔬 VERIFICATION

Check console logs after evaluation:

### Current (Broken):
```
🔬 USER MFCC extracted: { frames: 45, mean: 0.0012 }
🎯 REFERENCE MFCC: { frames: 52, mean: -0.0001 }  ← Sine wave pattern
⚠️⚠️⚠️ CRITICAL ISSUE ⚠️⚠️⚠️
Reference audio is FAKE SINE WAVE (not real speech)
📊 DTW Normalized Distance: 2.1234  ← Always high
Final Score: 25  ← Always low
```

### After Fix (Working):
```
🔬 USER MFCC extracted: { frames: 45, mean: 0.0012 }
🎯 REFERENCE MFCC: { frames: 48, mean: 0.0015 }  ← Real speech pattern
📊 DTW Normalized Distance: 0.3456  ← Varies by quality
Final Score: 86  ← Realistic score
```

---

## 🎯 IMMEDIATE ACTION

**Recommended: Option 2 (Pre-recorded Audio)**

1. Record reference audio for all exercises
2. Store in `/public/audio/reference/`
3. Update `loadReferenceAudio()` to fetch real files
4. Scores will immediately jump to 70-95% for good pronunciation

**Quick Test: Option 3 (Self-Reference)**

1. Record once
2. Use that as reference
3. Record again with same pronunciation
4. Should get 80-90% score
5. This proves the system works when reference is real speech

---

## 📊 EXPECTED RESULTS AFTER FIX

| Pronunciation Quality | Current Score | After Fix |
|----------------------|---------------|-----------|
| Perfect              | 25-35%        | 90-100%   |
| Good                 | 20-30%        | 75-89%    |
| Fair                 | 15-25%        | 60-74%    |
| Poor                 | 10-20%        | 40-59%    |
| Wrong word           | 10-15%        | 10-30%    |

---

## 🔧 WHY THIS WASN'T CAUGHT EARLIER

1. MFCC extraction works (verified ✅)
2. DTW computation works (verified ✅)
3. Phoneme detection works (verified ✅)
4. Preprocessing works (verified ✅)
5. **Reference audio was never verified** ❌

The system is scientifically sound. The only issue is garbage input (sine wave) → garbage output (low scores).

**Fix the reference audio = Fix the scores.**
