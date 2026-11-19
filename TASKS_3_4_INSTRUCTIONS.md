# CRITICAL TASKS 3 & 4 - STEP BY STEP INSTRUCTIONS

## Prerequisites
1. Firebase Admin SDK credentials (service account key)
2. Python with firebase-admin installed

## STEP 1: Get Firebase Credentials

1. Go to: https://console.firebase.google.com/project/speakup-cbe48/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Save the JSON file as `serviceAccountKey.json` in the `backend/` folder

## STEP 2: Install Firebase Admin SDK

```cmd
cd backend
pip install firebase-admin
```

## STEP 3: Update Audit Script

Open `backend/audit_firebase.py` and replace line 13-24 with:

```python
cred = credentials.Certificate('serviceAccountKey.json')
```

## STEP 4: Run Cleanup and Generation

```cmd
.\CLEANUP_AND_GENERATE.bat
```

This will:
1. ✓ Audit Firebase for duplicate exercises
2. ✓ Generate `firebase_audit_report.json` (review this!)
3. ✓ Generate `firebase_cleanup_script.js` (to remove duplicates)
4. ✓ Generate ALL reference audio files

## STEP 5: Review Duplicates

Open `firebase_audit_report.json` to see:
- Which lessons have duplicates
- Which exercises to keep/delete
- Full list of all exercises

## STEP 6: Clean Firebase (IMPORTANT!)

### Option A: Manual Cleanup (Recommended for first time)
1. Open Firebase Console: https://console.firebase.google.com/project/speakup-cbe48/firestore
2. Go to each lesson with duplicates
3. Delete duplicate exercises (keep the first one)

### Option B: Automated Cleanup (Advanced)
1. Install Node.js Firebase Admin SDK
2. Run `firebase_cleanup_script.js`

## STEP 7: Verify Reference Audio

Check `public/reference_audio/` folder:
- Should have .mp3 files for all exercises
- Filenames match exercise text (with underscores)
- Example: `hot_normal.mp3`, `good_morning_normal.mp3`

## STEP 8: Test the App

1. Restart backend: `.\START_BACKEND.bat`
2. Test each lesson
3. Verify:
   - No duplicate exercises appear
   - Reference audio plays correctly
   - Teaching audio sounds natural (not robotic)

## Troubleshooting

### "Firebase connection failed"
- Check `serviceAccountKey.json` exists in `backend/` folder
- Verify Firebase project ID matches: `speakup-cbe48`

### "Audio generation failed"
- Check `backend/services/tts_service.py` exists
- Verify gTTS is installed: `pip install gTTS`

### "No exercises found"
- Firebase might be empty
- Use sample exercises (script has fallback)

## Files Created

- `backend/audit_firebase.py` - Finds duplicates
- `backend/generate_all_reference_audio.py` - Creates audio
- `CLEANUP_AND_GENERATE.bat` - Runs both
- `firebase_audit_report.json` - Duplicate report (generated)
- `firebase_cleanup_script.js` - Cleanup script (generated)

## Safety Notes

✓ Audit script is READ-ONLY (won't modify Firebase)
✓ Audio generator won't overwrite existing files
✓ Cleanup script is generated but not auto-executed
✓ Always review audit report before cleaning
