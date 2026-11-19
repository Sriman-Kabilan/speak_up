# QUICK START GUIDE

## 🚀 Get Started in 5 Minutes

### Step 1: Start Backend (Precise Evaluation)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

You should see:
```
✅ All services initialized successfully
* Running on http://0.0.0.0:5000
```

### Step 2: Start Frontend
```bash
cd ..
npm start
```

### Step 3: Test the System

1. Open browser to `http://localhost:19006` (or your Expo URL)
2. Select a lesson (e.g., "Basic Vowels")
3. Click on an exercise (e.g., "hot")
4. Click "Record" and say "hot"
5. Click "Stop"
6. Click "Evaluate My Pronunciation"

### Expected Results

#### ✅ If Backend is Running (Precise)
```
Score: 85-95% (if correct)
Feedback: "Excellent! Your pronunciation is spot-on."

OR

Score: 0% (if wrong word)
Feedback: "It seems you said a different word..."

OR

Score: 70-80% (if phoneme error)
Feedback: "I notice you're saying 'AH' instead of 'AA'. Open your mouth wider..."
```

#### ⚠️ If Backend is NOT Running (Fallback)
```
Console: "⚠️ Backend unavailable, using frontend fallback"
Score: Approximate (70-90%)
Feedback: Generic teaching tips
```

---

## 🧪 Test Cases

### Test 1: Correct Pronunciation
1. Word: "hot"
2. Say: "hot" (correctly)
3. Expected: 90-95% score, positive feedback

### Test 2: Wrong Word
1. Word: "hot"
2. Say: "ted" (wrong word)
3. Expected: 0% score, "wrong word" feedback

### Test 3: Phoneme Error
1. Word: "think"
2. Say: "tink" (T instead of TH)
3. Expected: 60-75% score, "TH sound" feedback

### Test 4: No Audio
1. Word: "hot"
2. Don't speak (silence)
3. Expected: 0% score, "no speech detected" feedback

---

## 🔍 Troubleshooting

### Backend Not Starting
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check port 5000 is free
netstat -an | findstr 5000
```

### Frontend Not Connecting to Backend
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Should return:
# {"status":"healthy","message":"Phoneme evaluation backend is running"}
```

### Evaluation Always Uses Fallback
- Check backend console for errors
- Check browser console for connection errors
- Verify CORS is enabled in backend

---

## 📊 How to Verify It's Working

### Backend Logs (Precise Evaluation)
```
INFO:__main__:Evaluating: 'hot' (exercise: ex_123)
INFO:__main__:Expected phonemes: ['HH', 'AA', 'T']
INFO:__main__:Detected phonemes: ['HH', 'AA', 'T']
INFO:__main__:Scores - Phoneme: 100, Stress: 100, Final: 100
```

### Frontend Logs (Fallback)
```
🔄 Attempting backend evaluation...
⚠️ Backend unavailable, using frontend fallback
🔄 Using frontend evaluation...
📖 WORD MODE: Single word evaluation
✅ EVALUATION COMPLETE: {dtw: 85, phoneme: 80, stress: 90, final: 84}
```

---

## 🎯 What to Show Your Panel

1. **Backend Running**: Show terminal with "✅ All services initialized"
2. **Precise Evaluation**: Record "hot" → Get 90%+ score
3. **Wrong Word Detection**: Record "ted" → Get 0% score
4. **Phoneme Feedback**: Record with error → Get specific tip
5. **Fallback Works**: Stop backend → Still get evaluation

---

## 📝 Key Points for Presentation

1. **Uses Required Technologies**: DTW + MFCC + CMU Dictionary ✅
2. **Precise Evaluation**: Backend detects actual phonemes ✅
3. **Natural Feedback**: Teacher-like, not robotic ✅
4. **Graceful Degradation**: Works offline with fallback ✅
5. **Real Teaching Tool**: Helps students improve pronunciation ✅

---

## 🎉 You're Ready!

The system is now complete with:
- ✅ Precise phoneme detection (backend)
- ✅ Wrong word detection
- ✅ Silence detection
- ✅ Natural teaching feedback
- ✅ Frontend fallback
- ✅ Voice examples
- ✅ CMU Dictionary integration
- ✅ DTW+MFCC (as required)

**Time to test and refine!**
