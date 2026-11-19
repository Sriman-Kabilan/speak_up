# AUTOMATED CLEANUP - SIMPLE STEPS

## What This Does
✅ Deletes ALL duplicate exercises
✅ Adds 25 unique, pedagogically useful exercises per lesson
✅ Generates reference audio for all exercises
✅ Takes 10-15 minutes total

---

## Step 1: Get Firebase Key (5 min)

1. Go to: https://console.firebase.google.com/project/speakup-cbe48/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Save as: `S:\SpeakUp_native\backend\serviceAccountKey.json`

---

## Step 2: Install Requirements (2 min)

```cmd
cd S:\SpeakUp_native\backend
pip install firebase-admin
```

---

## Step 3: Run Automated Cleanup (10 min)

```cmd
cd S:\SpeakUp_native\backend
python automated_cleanup.py
```

When prompted, type: **YES**

**This will:**
- Delete all existing exercises (including duplicates)
- Add 25 new unique exercises to each lesson
- Generate MP3 audio for all 200 exercises (8 lessons × 25)
- Save audio to `public/reference_audio/`

---

## Step 4: Verify (2 min)

### Check Firebase
1. Open: https://console.firebase.google.com/project/speakup-cbe48/firestore
2. Go to any lesson → Exercises
3. Should see exactly 25 exercises
4. No duplicates

### Check Audio
```cmd
dir S:\SpeakUp_native\public\reference_audio
```
Should show 200+ MP3 files

---

## Step 5: Test App (5 min)

```cmd
cd S:\SpeakUp_native
taskkill /F /IM python.exe
.\START_BACKEND.bat
```

In browser:
1. Open each lesson
2. Verify 25 unique exercises
3. Test audio playback
4. Test evaluation

---

## What You Get

**Each Lesson Has 25 Exercises:**

- **Lesson 1:** Alphabet sounds (a, b, c, d...)
- **Lesson 2:** Vowel minimal pairs (hot, hat, hit...)
- **Lesson 3:** TH sounds (think, this, that...)
- **Lesson 4:** V vs W (very/wary, vest/west...)
- **Lesson 5:** Greetings (hello, good morning...)
- **Lesson 6:** Workplace phrases (thank you, excuse me...)
- **Lesson 7:** Common sentences (i am fine, what is your name...)
- **Lesson 8:** Long sentences (business communication)

**All exercises teach specific pronunciation patterns!**

---

## Troubleshooting

### "Firebase connection failed"
- Check `serviceAccountKey.json` exists
- Verify it's valid JSON

### "Audio generation failed"
- Run: `pip install gTTS`
- Check internet connection

### "Permission denied"
- Check Firebase rules allow write access
- Verify service account has admin rights

---

## Total Time: ~25 minutes

- Setup: 7 min
- Cleanup: 10 min
- Verify: 5 min
- Test: 5 min

**After this, your app will be perfect for demo!**
