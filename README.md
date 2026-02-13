# SpeakUp - English Pronunciation Training App

A React Native (Expo) mobile application prototype for English pronunciation training with simulated scoring workflow.

## Features

- 8 pronunciation lessons across different categories
- Simulated pronunciation scoring (attempt-based)
- Progress tracking with AsyncStorage
- Clean, modular architecture ready for AI integration

## Project Structure

```
/src
  /screens
    - HomeScreen.js
    - LessonListScreen.js
    - PracticeScreen.js
    - ResultScreen.js
    - ProgressScreen.js
  /components
    - Button.js
    - LessonCard.js
  /data
    - lessons.js
    - storage.js
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the app:
```bash
npm start
```

3. Run on device/emulator:
```bash
npm run android  # For Android
npm run ios      # For iOS
```

## Simulated Scoring Logic

- Attempt 1: Score = 60
- Attempt 2: Score = 75
- Attempt 3+: Score = 90

## Future Extensions

The app is designed to easily integrate:

1. **Real Audio Recording**: Replace simulated recording in PracticeScreen with expo-av or react-native-audio-recorder
2. **AI Scoring**: Add API calls in PracticeScreen.handleStop() to send audio to phoneme analysis service
3. **Hardware Integration**: Add Bluetooth/USB device connection in a new /services/device.js module
4. **Advanced Analytics**: Extend storage.js to track phoneme-level data

## Extension Points

- `PracticeScreen.handleStart()` - Add real recording start
- `PracticeScreen.handleStop()` - Add real recording stop + AI scoring API call
- `storage.js` - Extend data model for detailed phoneme scores
- Create `/src/services/audioRecorder.js` for recording logic
- Create `/src/services/aiScoring.js` for AI API integration
- Create `/src/services/deviceManager.js` for hardware connection

## Dependencies

- React Navigation (Stack)
- AsyncStorage (local persistence)
- Expo SDK ~49.0.0
