# Speak Up Flutter App

Real-time English pronunciation evaluation mobile app.

## Pipeline mapping
The backend performs:
1. ASR
2. Phoneme extraction
3. DTW alignment
4. Error detection
5. Feedback generation

The Flutter app handles lesson selection, audio capture, API upload, feedback display, and Firestore progress dashboard.

## Run
```bash
flutter pub get
flutter run --dart-define=BACKEND_URL=http://<your-backend-host>:8000
```

## Required backend response from `/evaluate`
```json
{
  "recognized_text": "...",
  "phoneme_comparison": ["..."],
  "pronunciation_score": 82.5,
  "detected_errors": ["th", "r"],
  "articulation_feedback": "..."
}
```
