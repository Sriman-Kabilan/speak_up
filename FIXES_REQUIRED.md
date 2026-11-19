# Required Fixes for SpeakUp App

## Issue 1: Single Word Teaching (FIXED ✓)
**Status:** No issue found - PhonemeTeachingCard plays full word, not word-by-word

## Issue 2: Sentence Teaching Audio Quality
**Problem:** Sentence teaching uses browser TTS (speechSynthesis) which sounds artificial
**Solution:** Use backend gTTS for sentence audio (same as reference audio)

**Fix Location:** `src/components/FeedbackCardNew.js` line 18-31

**Change needed:**
```javascript
// BEFORE (artificial browser TTS):
const playAudio = (text, rate = 0.8) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};

// AFTER (use backend gTTS):
const playAudio = async (text, rate = 0.8) => {
  const speedMap = { 0.6: 'slow', 0.8: 'medium', 1.0: 'normal' };
  const speed = speedMap[rate] || 'normal';
  const url = `http://localhost:5000/api/tts/${encodeURIComponent(text)}?speed=${speed}`;
  
  const audio = new Audio(url);
  audio.onend = () => setPlayingAudio(null);
  await audio.play();
  setPlayingAudio(text);
};
```

## Issue 3: Duplicate Exercises in Firebase
**Problem:** Many lessons have duplicate exercises
**Solution:** Need to audit Firebase and remove duplicates

**Action Required:** 
1. Export all exercises from Firebase Firestore
2. Identify duplicates by `text` field within each lesson
3. Keep only unique, pedagogically useful exercises
4. Ensure each lesson has 8-12 unique exercises covering:
   - Beginner lessons: Single phoneme focus (hot, hat, hit)
   - Intermediate: Phoneme pairs (think/sink, very/wary)
   - Advanced: Sentences with target phonemes

**Firebase Collections to Check:**
- `Lessons/{lesson_id}/Exercises`
- Look for duplicate `text` values
- Remove exercises that don't teach specific pronunciation patterns

## Issue 4: Reference Audio Generation System
**Current System:**
- Reference audio stored in `/public/reference_audio/`
- Generated using gTTS (Google Text-to-Speech)
- Files named: `{text_with_underscores}.wav`
- Example: `hot.wav`, `good_morning.wav`

**Problem:** When adding new exercises to Firebase, reference audio must be generated

**Solution - Automatic Reference Audio Generation:**

### Step 1: Create reference audio generator script

Create file: `backend/generate_reference_audio.py`

```python
"""
Generate reference audio for all exercises in Firebase
Run this whenever new exercises are added
"""

import firebase_admin
from firebase_admin import credentials, firestore
from services.tts_service import TTSService
import os

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize TTS
tts = TTSService(cache_dir='../public/reference_audio')

def generate_all_reference_audio():
    """Generate reference audio for all exercises"""
    lessons = db.collection('Lessons').stream()
    
    total = 0
    generated = 0
    
    for lesson in lessons:
        lesson_id = lesson.id
        exercises = db.collection('Lessons').document(lesson_id).collection('Exercises').stream()
        
        for exercise in exercises:
            data = exercise.to_dict()
            text = data.get('text', '')
            
            if not text:
                continue
            
            total += 1
            
            # Generate audio at normal speed
            audio_path = tts.generate_audio(text, 'normal')
            
            if audio_path:
                generated += 1
                print(f"✓ Generated: {text}")
            else:
                print(f"✗ Failed: {text}")
    
    print(f"\n=== Summary ===")
    print(f"Total exercises: {total}")
    print(f"Generated: {generated}")
    print(f"Failed: {total - generated}")

if __name__ == '__main__':
    generate_all_reference_audio()
```

### Step 2: Run generator when adding exercises

**Workflow:**
1. Add new exercise to Firebase
2. Run: `python backend/generate_reference_audio.py`
3. Reference audio automatically created in `/public/reference_audio/`
4. App loads audio from that folder

### Step 3: Fallback for missing audio

Already implemented in `PracticeExerciseScreen.js` line 95-99:
- If reference audio file not found, returns empty buffer
- App continues to work without crashing

## Summary of Actions

### Immediate Fixes (Code Changes):
1. ✅ Issue 1: No fix needed
2. ⚠️ Issue 2: Update FeedbackCardNew.js to use backend TTS
3. ⚠️ Issue 3: Audit Firebase exercises (manual task)
4. ✅ Issue 4: Create reference audio generator script

### Manual Tasks Required:
1. Review Firebase exercises for duplicates
2. Remove duplicate exercises
3. Run reference audio generator for all exercises
4. Test each lesson to ensure exercises are unique and useful

### Safety Measures:
- Reference audio generator is idempotent (can run multiple times safely)
- Existing audio files are cached (won't regenerate)
- Missing audio doesn't crash app (fallback to empty buffer)
- TTS service handles both single words and full sentences


## Issue 5: Profile & Progress UI Upgrade (COMPLETED ✓)
**Status:** Implemented business-class Profile and Progress screens

**What Was Done:**

### ProfileScreen.js - Complete Overhaul
1. **User Info Section**: Avatar, name, email, member since date
2. **Progress Dashboard**: 4 key metrics (Overall Score, Practice Time, Lessons Progress, Day Streak)
3. **Achievements System**: 9 different badges based on milestones
4. **Detailed Stats**: Total exercises, best score, average, completed lessons, top 3 problem phonemes
5. **Quick Actions**: Navigate to Progress or Lessons
6. **Simple Settings**: Sign Out button only (no complex features as requested)

### ProgressScreen.js - Enhanced Analytics
1. **Weekly Progress Chart**: Visual bar chart for last 7 days with color coding
2. **Lesson Performance**: All lessons with scores, progress bars, and exercise counts
3. **Phonemes to Practice**: Top 5 most problematic phonemes
4. **Recent Activity**: Last 10 practice sessions with details
5. **Empty State**: Friendly message with "Start Learning" button

### Key Features
- Real-time calculations from Firebase Attempts and AsyncStorage
- Color-coded scores (Green 90%+, Orange 70-89%, Red <70%)
- Achievement badges for motivation
- Streak tracking for consistency
- Lesson completion tracking
- Problem phoneme identification
- Professional card-based design
- Smooth scrolling experience

### Files Modified
- `src/screens/ProfileScreen.js` - Complete rewrite with comprehensive features
- `src/screens/ProgressScreen.js` - Enhanced with charts and detailed analytics

### Documentation Created
- `PROFILE_PROGRESS_UPGRADE.md` - Technical implementation details
- `PROFILE_PROGRESS_VISUAL.md` - Visual layout mockups and design system

### Design Principles
- Clean, modern UI with rounded cards
- Consistent color scheme (Blue primary, Green/Orange/Red for scores)
- Proper spacing and typography
- Responsive layouts
- No complex settings (kept simple as requested)

**Testing Required:**
- [ ] Verify stats calculate correctly
- [ ] Check achievement badges display properly
- [ ] Test weekly chart renders for 7 days
- [ ] Confirm lesson performance shows all lessons
- [ ] Validate sign out functionality
- [ ] Test navigation between screens
- [ ] Check empty states display correctly
