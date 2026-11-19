# Execute Firebase Cleanup - Step by Step

## ✅ Ready to Run
- Script verified safe
- All integrations checked
- 10 lessons × 25 exercises = 250 total

---

## 📋 Step 1: Get Firebase Service Account Key

1. Open: https://console.firebase.google.com/
2. Select project: **speakup-cbe48**
3. Click ⚙️ → **Project settings**
4. Click **Service accounts** tab
5. Click **"Generate new private key"** button
6. Save downloaded file as: `s:\SpeakUp_native\backend\serviceAccountKey.json`

---

## 📋 Step 2: Verify File Exists

Open Command Prompt:
```bash
cd s:\SpeakUp_native\backend
dir serviceAccountKey.json
```

Should show the file. If not, repeat Step 1.

---

## 📋 Step 3: Run Cleanup Script

```bash
python automated_cleanup.py
```

When prompted:
```
Type 'YES' to continue: YES
```

---

## 📋 Step 4: Wait for Completion

Script will process all 10 lessons:
- LESSON_1: Long Vowels (25 exercises)
- LESSON_2: Short Vowels (25 exercises)
- LESSON_3: TH Words (25 exercises)
- LESSON_4: V vs W (25 exercises)
- LESSON_5: Greetings (25 exercises)
- LESSON_6: Workplace Words (25 exercises)
- LESSON_7: Common Phrases (25 exercises)
- LESSON_8: Sentence Practice (25 exercises)
- LESSON_9: R vs L (25 exercises)
- LESSON_10: Long Sentences (25 exercises)

Expected time: 5-10 minutes

---

## 📋 Step 5: Verify Success

Final output should show:
```
Lessons processed: 10
Total exercises added: 250
Total audio files generated: 250
✓ Firebase is now clean with 25 unique exercises per lesson!
```

---

## 📋 Step 6: Test App

```bash
cd s:\SpeakUp_native
npm start
```

Test:
1. Open any lesson
2. Verify 25 exercises load
3. Play reference audio
4. Record and evaluate pronunciation

---

## ✅ Done!

Your app now has:
- 250 unique exercises
- No duplicates
- Reference audio for all exercises
- Proper pedagogical progression

---

## 🆘 If Something Goes Wrong

1. Check Firebase Console → Firestore Database
2. Verify Exercises collection exists
3. Re-run script (it's safe to run multiple times)
4. Or restore from your backup

---

## 📞 Need Help?

Check `FIREBASE_INTEGRATION_ANALYSIS.md` for detailed technical information.
