# PPT Content Guide - SpeakUp Pronunciation Training App

## Slide 1: Title Slide

**Content:**

- Title: SpeakUp - AI-Powered English Pronunciation Training
- Subtitle: Mobile Application with Real-time Feedback
- Your Name & Date

**Screenshot:** App icon or splash screen

---

## Slide 2: Project Overview

**Content:**

- React Native (Expo) mobile application
- Real-time pronunciation evaluation using MFCC + DTW algorithms
- Firebase backend for user management
- Cross-platform (iOS, Android, Web)
- 8 lesson categories with 229+ exercises

**Screenshot:** Home screen showing app overview

---

## Slide 3: Authentication Module

**What We Did:**

- Implemented Firebase Authentication
- Email/Password sign-up and sign-in
- Secure session management with AsyncStorage persistence
- User profile creation with Firestore integration
- Auto-login for returning users

**Screenshots to Take:**

1. Sign In screen (empty form)
2. Sign Up screen (empty form)
3. Sign In screen with validation errors (optional)

**How to Take:**

- Open app → Sign In screen
- Open app → Click "Sign Up" → Sign Up screen

---

## Slide 4: Home Screen Module

**What We Did:**

- Welcome dashboard with user greeting
- Quick access to lessons
- Navigation to Profile and Progress analytics
- Clean, intuitive UI with Material Design
- Responsive layout for all screen sizes

**Screenshots to Take:**

1. Home screen after login (showing user name)
2. Home screen with navigation buttons visible

**How to Take:**

- After login → Home screen (main view)

---

## Slide 5: Lesson Management Module

**What We Did:**

- 8 categorized lessons (Short Vowels, Long Vowels, TH Sound, V vs W, R vs L, etc.)
- Each lesson contains 20-30 exercises
- Difficulty progression from basic to advanced
- Visual lesson cards with icons and descriptions
- Exercise count display per lesson

**Screenshots to Take:**

1. Lesson list screen showing all 8 lessons
2. Individual lesson card (zoomed view)

**How to Take:**

- Home → "Start Learning" → Lesson List screen

---

## Slide 6: Practice Screen Module

**What We Did:**

- Exercise selection interface
- Shows exercise text, phonetic hints, and pronunciation tips
- Progress indicator (X/Y exercises)
- Start practice button
- Navigation back to lesson list

**Screenshots to Take:**

1. Practice screen showing list of exercises
2. Exercise card with text and hint

**How to Take:**

- Lesson List → Select any lesson → Practice screen

---

## Slide 7: Audio Recording Module

**What We Did:**

- Cross-platform audio recording (Web: WebMicrophoneInput, Mobile: expo-av)
- Real-time waveform visualization during recording
- Microphone permission handling
- Audio quality validation (16kHz, mono)
- Playback functionality for recorded audio
- Support for ESP32 hardware microphone (optional)

**Screenshots to Take:**

1. Recording screen (before recording - mic icon)
2. Recording screen (during recording - red waveform)
3. Recording screen (after recording - "Recorded" checkmark)

**How to Take:**

- Practice → Select exercise → Click "Start Recording"
- While recording → capture waveform
- After stopping → capture "Recorded" state

---

## Slide 8: Reference Audio Module

**What We Did:**

- 229 pre-generated gTTS reference audio files (16kHz WAV)
- Web: Loads actual WAV files from /public/reference_audio/
- Mobile: Uses expo-speech TTS for playback
- Speech synthesis with adjustable rate (0.6x for clarity)
- Play/Pause controls

**Screenshots to Take:**

1. Exercise screen with "Play Audio" button
2. Exercise screen while audio is playing (button shows "Playing...")

**How to Take:**

- Practice Exercise screen → Click "Play Audio" button
- Capture during playback

---

## Slide 9: Pronunciation Evaluation Module (Core Algorithm)

**What We Did:**

- **MFCC Extraction**: 13 Mel-Frequency Cepstral Coefficients
- **Audio Preprocessing**: Pre-emphasis, noise gating, silence trimming, normalization
- **DTW Algorithm**: Dynamic Time Warping for sequence alignment
- **Joint Normalization**: Combined user+reference MFCC normalization
- **Scoring System**: Distance-to-score conversion with demo-friendly thresholds
  - <0.20 = 95%, <0.25 = 90%, <0.30 = 85%, <0.35 = 80%
- **Platform-specific**: Web uses backend API, Mobile uses local MFCC+DTW

**Screenshots to Take:**

1. Evaluation in progress (loading spinner with "Evaluating...")
2. Code snippet showing MFCC extraction (from mfccExtractor.js)
3. Code snippet showing DTW algorithm (from dtw.js)

**How to Take:**

- After recording → Click "Evaluate" → capture loading state
- For code: Take screenshot of mfccExtractor.js and dtw.js files in IDE

---

## Slide 10: Feedback & Results Module

**What We Did:**

- Real-time score display (0-100%)
- Color-coded feedback (Green: 90+, Yellow: 80-89, Red: <80)
- Phoneme-level error detection
- Teaching tips for incorrect phonemes
- Practice word suggestions
- Try Again / Next Exercise options
- Attempt counter (max 3 attempts)

**Screenshots to Take:**

1. Feedback card with high score (90%+) - success state
2. Feedback card with medium score (70-89%) - improvement needed
3. Feedback card showing phoneme errors (if available)

**How to Take:**

- After evaluation → Feedback modal appears
- Try multiple recordings to get different scores

---

## Slide 11: Progress Tracking Module

**What We Did:**

- **AsyncStorage**: Local progress storage
- **Firebase Firestore**: Cloud sync for cross-device access
- Tracks: exercise attempts, scores, timestamps, phoneme errors
- Calculates: average score, best score, improvement rate
- Recent history (last 15 attempts)
- Problem phoneme identification

**Screenshots to Take:**

1. Progress screen showing weekly chart
2. Progress screen showing lesson performance
3. Progress screen showing phoneme analysis

**How to Take:**

- Bottom tab → "View Progress"
- Scroll to capture different sections

---

## Slide 12: Profile & Analytics Module

**What We Did:**

- User profile with avatar and email
- Statistics dashboard:
  - Total exercises, average score, practice time, streak
  - Best/worst scores, perfect scores count
  - Improvement rate, consistency score
- Achievement badges (20+ achievements)
- Weekly/Monthly activity charts
- Score distribution analysis
- Practice time analysis (morning/afternoon/evening/night)
- Phoneme mastery tracking
- Trend indicators (improving/stable/declining)

**Screenshots to Take:**

1. Profile header with user info and stats grid
2. Performance overview section
3. Achievement badges section
4. Phoneme analysis section

**How to Take:**

- Bottom tab → "Profile"
- Scroll to capture different sections

---

## Slide 13: Data Architecture

**What We Did:**

- **Firebase Firestore Collections**:
  - Users: user profiles (name, email, created_at)
  - Attempts: practice history (user_id, lesson_id, exercise_id, score, phoneme_errors, timestamp)
- **AsyncStorage**: Local cache for offline access
- **Data Flow**: UI → Services → Firebase/AsyncStorage
- **Real-time sync**: Automatic cloud backup

**Screenshots to Take:**

1. Firebase Console showing Firestore collections
2. Firebase Console showing Attempts collection with data
3. Code snippet of attemptService.js (saveAttempt function)

**How to Take:**

- Open Firebase Console → Firestore Database
- Navigate to Attempts collection
- Take screenshot of data structure

---

## Slide 14: Audio Processing Pipeline (Technical)

**What We Did:**

1. **Input**: Raw audio from microphone (Float32Array)
2. **Pre-emphasis**: High-frequency boost (0.97 coefficient)
3. **Noise Gate**: Frame-based energy thresholding
4. **Silence Trimming**: Remove leading/trailing silence
5. **Normalization**: Amplitude scaling to 0.95 max
6. **MFCC Extraction**: 13 coefficients per frame
7. **DTW Alignment**: Compare user vs reference
8. **Scoring**: Convert distance to percentage

**Screenshots to Take:**

1. Flowchart diagram (create in PowerPoint)
2. Console logs showing audio processing steps
3. Code snippet from audioPreprocessor.js

**How to Take:**

- During evaluation → Check browser/app console logs
- Copy logs showing: "RMS Energy", "MFCC extracted", "DTW distance"

---

## Slide 15: Algorithm Performance

**What We Did:**

- **MFCC Features**: 13 coefficients capture phonetic characteristics
- **DTW Scoring**: Handles variable speech rates
- **Joint Normalization**: Preserves discriminative power
- **Demo-Friendly Thresholds**: Easy to achieve 80%+ scores
- **Quality Checks**: SNR, clipping detection, confidence levels

**Screenshots to Take:**

1. Console logs showing evaluation metrics (RMS, SNR, score)
2. Multiple evaluation results showing score variation
3. Graph/chart showing score distribution (from Progress screen)

**How to Take:**

- Record same word 3-4 times
- Capture different scores
- Use Progress screen score distribution chart

---

## Slide 16: Cross-Platform Implementation

**What We Did:**

- **Web**: WebMicrophoneInput, Web Audio API, Blob handling
- **Mobile**: expo-av recording, expo-speech TTS, URI-based audio
- **Platform Detection**: React Native Platform.OS checks
- **Conditional Logic**: Different code paths for web vs mobile
- **Shared Core**: Same MFCC+DTW algorithm on all platforms

**Screenshots to Take:**

1. App running on web browser
2. App running on mobile device (Android/iOS)
3. Code snippet showing Platform.OS checks

**How to Take:**

- Run app in browser → capture screenshot
- Run app on phone → capture screenshot
- Show PracticeExerciseScreen.js Platform checks

---

## Slide 17: Hardware Integration (ESP32)

**What We Did:**

- ESP32-WROOM-32 microcontroller integration
- INMP441 MEMS I2S microphone support
- WiFi web server for audio streaming
- Real-time audio capture at 16kHz
- HTTP endpoints: /test, /start, /stop, /audio
- Diagnostic logging for hardware debugging
- **Status**: Firmware complete, hardware module defective (DOA)

**Screenshots to Take:**

1. ESP32 hardware setup photo (if available)
2. Arduino IDE with firmware code
3. Serial monitor showing WiFi connection logs
4. Code snippet from esp32_audio_streamer.ino

**How to Take:**

- Open Arduino IDE → esp32_audio_streamer.ino
- Show setup() and loop() functions
- Show I2S configuration

---

## Slide 18: Security & Privacy

**What We Did:**

- Firebase Authentication with secure tokens
- Password hashing (handled by Firebase)
- AsyncStorage encryption for sensitive data
- No audio storage on server (privacy-first)
- Microphone permission requests (iOS/Android)
- HTTPS for all API calls

**Screenshots to Take:**

1. app.json showing permission configurations
2. Firebase Console → Authentication settings
3. Code snippet from firebase.js showing security rules

**How to Take:**

- Open app.json → show permissions section
- Firebase Console → Authentication tab

---

## Slide 19: Testing & Quality Assurance

**What We Did:**

- Manual testing on web and mobile platforms
- Audio quality validation (RMS, SNR checks)
- Edge case handling (silence detection, clipping)
- Error handling with user-friendly messages
- Console logging for debugging
- Performance optimization (MFCC caching)

**Screenshots to Take:**

1. Console logs showing successful evaluation
2. Console logs showing error handling
3. Alert message for recording errors

**How to Take:**

- Open browser console during app usage
- Trigger errors (deny mic permission, record silence)
- Capture error messages

---

## Slide 20: Challenges & Solutions

**Content:**
| Challenge | Solution |
|-----------|----------|
| Web APIs not available on mobile | Platform detection + expo-av/expo-speech |
| Reference audio silence (0 RMS) | Synthetic sine wave generation for mobile |
| Blob not supported in React Native | Platform-specific audio handling (URI vs Blob) |
| Double normalization bug | Removed normalization from referenceMFCCService |
| ESP32 hardware failure | Complete firmware ready, hardware DOA |
| AsyncStorage vs Firebase mismatch | Dual save to both storage systems |

**Screenshots to Take:**

1. Before/after fix comparison (console logs)
2. Code showing Platform.OS checks

---

## Slide 21: Future Enhancements

**Content:**

- Real backend API with phoneme-level teaching feedback
- Advanced AI models (Wav2Vec2, Whisper)
- Sentence-level pronunciation evaluation
- Social features (leaderboards, challenges)
- Offline mode with full functionality
- Hardware microphone integration (working INMP441)
- Multi-language support
- Gamification (points, levels, rewards)

**Screenshots to Take:**

- Mockup/wireframe of future features (optional)

---

## Slide 22: Technology Stack

**Content:**

- **Frontend**: React Native (Expo SDK 51)
- **Navigation**: React Navigation 6
- **Audio**: expo-av, expo-speech, Web Audio API
- **Backend**: Firebase (Auth + Firestore)
- **Storage**: AsyncStorage, Firebase Firestore
- **Algorithms**: MFCC, DTW, Audio Preprocessing
- **Hardware**: ESP32-WROOM-32, INMP441 (optional)
- **Languages**: JavaScript, C++ (Arduino)

**Screenshots to Take:**

1. package.json showing dependencies
2. Project folder structure

**How to Take:**

- Open package.json in IDE
- File explorer showing /src folder structure

---

## Slide 23: Demo Video (Optional)

**Content:**

- Record 30-60 second video showing:
  1. Sign in
  2. Select lesson
  3. Play reference audio
  4. Record pronunciation
  5. Get evaluation result
  6. View progress

**How to Record:**

- Use screen recording software (OBS, QuickTime, Android Screen Recorder)
- Show complete user flow

---

## Slide 24: Conclusion

**Content:**

- Successfully implemented AI-powered pronunciation training app
- Cross-platform support (Web + Mobile)
- Real-time feedback using MFCC + DTW algorithms
- Comprehensive progress tracking and analytics
- 229+ exercises across 8 lesson categories
- Ready for production deployment

**Screenshots to Take:**

- Final app screenshot showing all features

---

## Slide 25: Thank You

**Content:**

- Thank You
- Questions?
- Contact Information
- GitHub Repository Link (if applicable)

---

## QUICK SCREENSHOT CHECKLIST

### Must-Have Screenshots (Priority):

1. ✅ Sign In screen
2. ✅ Home screen
3. ✅ Lesson list
4. ✅ Practice exercise screen
5. ✅ Recording (before, during, after)
6. ✅ Evaluation loading
7. ✅ Feedback card (high score)
8. ✅ Profile screen
9. ✅ Progress screen (charts)
10. ✅ Firebase Console (Firestore data)

### Code Screenshots:

11. ✅ mfccExtractor.js (extract function)
12. ✅ dtw.js (compute function)
13. ✅ audioPreprocessor.js (preprocess function)
14. ✅ PracticeExerciseScreen.js (Platform checks)
15. ✅ package.json (dependencies)

### Console Logs:

16. ✅ Successful evaluation logs
17. ✅ Audio processing logs (RMS, MFCC, DTW)
18. ✅ Firebase save confirmation

### Optional:

19. ESP32 hardware photo
20. Arduino IDE with firmware
21. App running on mobile device

---

## HOW TO ORGANIZE PPT

**Design Tips:**

- Use consistent color scheme (Blue #2196F3 as primary)
- Each slide: Title → Content (2-3 bullets) → Screenshot
- Code screenshots: Use syntax highlighting
- Console logs: Use monospace font
- Keep text minimal, let screenshots speak
- Add slide numbers
- Use transitions sparingly

**Layout:**

- Title at top
- Content on left (30-40%)
- Screenshot on right (60-70%)
- For full-screen screenshots, use full slide

Good luck with your presentation! 🎉
