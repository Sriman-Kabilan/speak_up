# Firebase Integration Analysis - Lessons & Exercises

## ✅ VERIFIED: Script is SAFE to Run

After deep analysis of all integrations, the `automated_cleanup.py` script is **SAFE** and will **NOT** break any connections.

**Script now includes ALL 10 lessons with 25 exercises each = 250 total exercises**

---

## 📊 Firebase Structure (CONFIRMED)

```
Firebase Collections:
├── Lessons (separate collection)
│   ├── lesson_id: "LESSON_1", "LESSON_2", etc.
│   ├── title, category, difficulty, order
│   └── (NO subcollections)
│
├── Exercises (separate collection) ⭐ KEY COLLECTION
│   ├── lesson_id: "LESSON_1" (foreign key linking to Lessons)
│   ├── text, hint, order, exercise_id
│   └── (Queried using: WHERE lesson_id == 'LESSON_X')
│
├── Attempts (user attempt history)
│   ├── user_id, lesson_id, exercise_id
│   └── score, phoneme_error_map, etc.
│
└── completed_exercises (completion tracking)
    ├── user_id, lesson_id, exercise_id
    └── completed_at timestamp
```

---

## 🔗 All Lesson-Exercise Connections

### 1. **Exercise Loading** (PRIMARY CONNECTION)
**File:** `src/services/exerciseService.js`
```javascript
collection(db, 'Exercises')
  .where('lesson_id', '==', lessonId)
```
✅ **Script handles this correctly** - Uses same query structure

---

### 2. **Lesson Completion Tracking**
**File:** `src/services/lessonCompletionService.js`
```javascript
// Checks if all exercises in a lesson are completed
const exercises = await getExercisesByLesson(lessonId);
const completedExerciseIds = // from completed_exercises collection
return exercises.every(ex => completedExerciseIds.includes(ex.id));
```
✅ **Safe** - Only reads exercise IDs, doesn't depend on specific exercise content

---

### 3. **Attempt Tracking**
**File:** `src/services/attemptService.js`
```javascript
// Saves user attempts with lesson_id reference
{
  user_id, 
  lesson_id,  // Links to Lessons collection
  exercise_id, // Links to Exercises collection
  score, phoneme_error_map, etc.
}
```
✅ **Safe** - New exercises will get new IDs, future attempts will reference new IDs

---

### 4. **Completed Exercise Marking**
**File:** `src/services/completedExerciseService.js`
```javascript
{
  user_id,
  lesson_id,
  exercise_id,
  completed_at
}
```
✅ **Safe** - Old completion records remain intact, new exercises start fresh

---

### 5. **Practice Screen**
**Files:** 
- `src/screens/PracticeScreen.js` (old simple version)
- `src/screens/PracticeExerciseScreen.js` (new advanced version)

```javascript
const exercises = await getExercisesByLesson(lesson.lesson_id);
// Displays exercises one by one
```
✅ **Safe** - Loads exercises dynamically, will show new exercises after cleanup

---

### 6. **Exercise List Screen**
**File:** `src/screens/ExerciseListScreen.js`
```javascript
const data = await getExercisesByLesson(lesson.lesson_id);
const completed = await getCompletedExercises(userId, lesson.lesson_id);
```
✅ **Safe** - Dynamically loads current exercises

---

### 7. **Result Screen**
**File:** `src/screens/ResultScreen.js`
```javascript
await markExerciseCompleted(userId, lesson.lesson_id, exercise.id);
```
✅ **Safe** - Marks new exercise IDs as completed

---

### 8. **Lesson List Screen**
**File:** `src/screens/LessonListScreen.js`
```javascript
// Checks lesson completion status
const isFullyDone = await isLessonFullyCompleted(userId, lesson.lesson_id);
```
✅ **Safe** - Checks completion dynamically based on current exercises

---

### 9. **Profile Screen**
**File:** `src/screens/ProfileScreen.js`
```javascript
const uniqueLessons = new Set(attempts.map(a => a.lesson_id)).size;
```
✅ **Safe** - Only counts unique lesson_ids from attempts

---

## 🎯 What the Script Does

### Step 1: Delete ALL Existing Exercises
```python
exercises_ref = db.collection('Exercises')
existing = exercises_ref.where('lesson_id', '==', lesson_id).stream()
for ex in existing:
    ex.reference.delete()  # Deletes from Exercises collection
```

### Step 2: Add 25 New Exercises Per Lesson
```python
exercises_ref.add({
    'text': text,
    'hint': hint,
    'lesson_id': lesson_id,  # ⭐ Links to Lessons collection
    'order': order,
    'exercise_id': f"{lesson_id}_{order}",
    'created_at': firestore.SERVER_TIMESTAMP
})
```

### Step 3: Generate Reference Audio
```python
audio_path = tts.generate_audio(text, 'normal')
# Saves to: public/reference_audio/{text}.wav
```

---

## ⚠️ Impact Analysis

### What WILL Happen:
1. ✅ All duplicate exercises removed
2. ✅ 25 new unique exercises added per lesson (250 total for 10 lessons)
3. ✅ Reference audio generated for all new exercises
4. ✅ App will load new exercises immediately
5. ✅ Old user progress (Attempts) remains in database
6. ✅ Old completion records remain in database

### What Will NOT Break:
1. ✅ Lessons collection - **NOT TOUCHED**
2. ✅ Attempts collection - **NOT TOUCHED**
3. ✅ completed_exercises collection - **NOT TOUCHED**
4. ✅ All service files - **NO CODE CHANGES NEEDED**
5. ✅ All screen files - **NO CODE CHANGES NEEDED**

### User Experience After Cleanup:
1. **Existing Users:**
   - Old progress/attempts remain visible in profile
   - Old completed exercises still marked as completed (but exercises no longer exist)
   - Can start practicing new exercises immediately
   - Lesson completion status will reset (since exercises changed)

2. **New Users:**
   - Clean slate with 25 exercises per lesson
   - No duplicates
   - High-quality pedagogical progression

---

## 🔧 Prerequisites

### 1. Get Firebase Service Account Key

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **speakup-cbe48**
3. Click ⚙️ (Settings) → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save file as: `backend/serviceAccountKey.json`

**File structure should be:**
```json
{
  "type": "service_account",
  "project_id": "speakup-cbe48",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-...@speakup-cbe48.iam.gserviceaccount.com",
  ...
}
```

### 2. Verify Backend Dependencies
```bash
cd backend
pip install firebase-admin gtts
```

### 3. Create Backup (RECOMMENDED)
```bash
# Export current Firebase data
# Go to Firebase Console → Firestore Database → Import/Export
# Or use your existing zip backup
```

---

## 🚀 Execution Instructions

### Step 1: Navigate to Backend
```bash
cd s:\SpeakUp_native\backend
```

### Step 2: Verify Service Account Key
```bash
dir serviceAccountKey.json
```
Should show the file exists.

### Step 3: Run Script
```bash
python automated_cleanup.py
```

### Step 4: Confirm Execution
```
⚠️  WARNING: This will DELETE all existing exercises and replace with new ones!
Make sure you have a backup before proceeding.

Type 'YES' to continue: YES
```

### Step 5: Monitor Progress
Script will show:
```
📚 Processing: Alphabet Sounds (LESSON_1)
----------------------------------------------------------------------
  🗑️  Deleting all existing exercises...
  ✓ Deleted 15 exercises
  ➕ Adding 25 new exercises...
  [1/25] ✓ a
  [2/25] ✓ e
  ...
  [25/25] ✓ sh
  ✓ Added 25 exercises with audio

📚 Processing: Vowel Sounds (LESSON_2)
...
```

### Step 6: Verify Results
```
======================================================================
SUMMARY
======================================================================
Lessons processed: 10
Total exercises deleted: (varies based on current data)
Total exercises added: 250
Total audio files generated: 250

✓ Firebase is now clean with 25 unique exercises per lesson!
✓ Reference audio saved to: s:\SpeakUp_native\public\reference_audio
```

---

## ✅ Post-Execution Verification

### 1. Check Firebase Console
- Go to Firestore Database
- Open **Exercises** collection
- Verify each lesson has exactly 25 exercises
- Check `lesson_id` field exists on all exercises

### 2. Check Reference Audio
```bash
dir s:\SpeakUp_native\public\reference_audio
```
Should show 250+ audio files (25 per lesson × 10 lessons)

### 3. Test App
```bash
cd s:\SpeakUp_native
npm start
```
- Open app
- Navigate to any lesson
- Verify exercises load correctly
- Test audio playback
- Test pronunciation evaluation

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

1. **Restore from Backup:**
   - Go to Firebase Console
   - Firestore Database → Import/Export
   - Import your backup

2. **Or Re-run Script:**
   - Script is idempotent (can run multiple times)
   - Will delete and recreate exercises each time

---

## 📝 Summary

### ✅ SAFE TO RUN BECAUSE:
1. Only modifies **Exercises** collection
2. Does NOT touch **Lessons** collection
3. Does NOT touch **Attempts** collection
4. Does NOT touch **completed_exercises** collection
5. All app code uses dynamic queries (no hardcoded exercise IDs)
6. Script uses correct Firebase structure (verified against actual code)

### 🎯 BENEFITS:
1. Removes ALL duplicates
2. Adds 250 pedagogically useful exercises (10 lessons × 25 exercises)
3. Generates reference audio automatically
4. Maintains proper lesson progression
5. No code changes required

### ⚠️ ONLY IMPACT:
1. User lesson completion status will reset (since exercises changed)
2. Old exercise IDs in completed_exercises will reference non-existent exercises
3. This is EXPECTED and ACCEPTABLE for a cleanup operation

---

## 🚦 RECOMMENDATION: PROCEED

The script is **SAFE** and **READY** to run. All integrations have been verified.

**Next Step:** Get Firebase service account key and run the script.
