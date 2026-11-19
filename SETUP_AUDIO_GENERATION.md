# Automated Reference Audio Generation - Complete Guide

## Step 1: Install Python Dependencies

```bash
pip install gtts pydub firebase-admin
```

## Step 2: Get Firebase Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ (Settings) → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save as `serviceAccountKey.json` in project root

## Step 3: Update Script Path

Edit `generate_reference_audio.py` line 15:
```python
cred = credentials.Certificate('serviceAccountKey.json')  # Update this path
```

## Step 4: Run the Script

```bash
cd s:\SpeakUp_native
python generate_reference_audio.py
```

**This will:**
- Connect to your Firestore
- Extract ALL exercise texts
- Generate WAV files (16kHz, mono) for each
- Save to `public/reference_audio/`
- Skip duplicates automatically
- Takes ~10 minutes for all exercises

## Step 5: Verify Generated Files

```bash
dir public\reference_audio
```

You should see files like:
- `hot.wav`
- `hit.wav`
- `thank_you_for_your_help.wav`
- etc.

## Step 6: Test in Your App

1. Restart development server: `npm start`
2. Open any lesson
3. Record pronunciation
4. System will automatically load pre-recorded reference audio
5. Compare and evaluate

---

## Troubleshooting

**Error: "No module named 'gtts'"**
```bash
pip install gtts pydub firebase-admin
```

**Error: "Could not find serviceAccountKey.json"**
- Make sure file is in project root
- Update path in script line 15

**Error: "Permission denied"**
- Run as administrator
- Check Firebase permissions

---

## What Happens Next?

✅ All reference audio files generated (one-time)
✅ System loads them automatically
✅ No API calls needed
✅ Works offline
✅ Perfect pronunciation evaluation
✅ Distinguishes "hot" from "hat" accurately

**Run the script once, and your project is ready!**
