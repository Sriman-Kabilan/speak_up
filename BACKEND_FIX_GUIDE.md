# Backend Connection Error Fix

## Problem
`ERR_CONNECTION_RESET` - Backend server crashes when processing requests

## Root Cause
The backend server is likely:
1. Not running at all
2. Crashing due to missing dependencies
3. Crashing due to encoding issues (less likely now - already fixed)

## Solution Steps

### Step 1: Install Missing Dependencies
```bash
cd backend
pip install librosa
```

### Step 2: Test Backend Startup
```bash
cd backend
python test_server.py
```

This will show if there are any import errors.

### Step 3: Start Backend with Better Error Handling
Use the new startup script:
```bash
START_BACKEND_FIXED.bat
```

This script:
- Sets UTF-8 encoding (chcp 65001)
- Installs missing dependencies automatically
- Shows error messages if server crashes

### Step 4: Verify Backend is Running
Open browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "message": "Phoneme evaluation backend is running",
  "version": "1.0.0"
}
```

### Step 5: Check Backend Console
When you record audio in the app, you should see logs in the backend console like:
```
Evaluating: 'hot' (exercise: SHORT_VOWELS_24, type: word)
Expected phonemes: ['HH', 'AA', 'T']
Detected: 'hot' (confidence: 0.95)
```

## Common Issues

### Issue: "ModuleNotFoundError: No module named 'librosa'"
**Fix**: Run `pip install librosa`

### Issue: "ModuleNotFoundError: No module named 'whisper'"
**Fix**: Run `pip install openai-whisper`

### Issue: Backend starts but crashes on first request
**Fix**: Check backend console for error message. Most likely:
- Missing audio file in `reference_audio/` folder (this is OK - system will estimate quality)
- Encoding issue with print statements (already fixed)

### Issue: "WARNING: No reference audio, using audio quality estimation"
**Fix**: This is NORMAL. The system will estimate quality from audio characteristics. To add reference audio:
1. Record yourself saying the word clearly
2. Save as `reference_audio/{word}.wav` (e.g., `reference_audio/hot.wav`)

## Files Modified
1. `backend/requirements.txt` - Added librosa dependency
2. `START_BACKEND_FIXED.bat` - New startup script with UTF-8 encoding
3. `backend/test_server.py` - Test script to check imports

## Next Steps
1. Run `START_BACKEND_FIXED.bat`
2. Wait for "Running on http://0.0.0.0:5000"
3. Test the app - record audio
4. Check backend console for logs
