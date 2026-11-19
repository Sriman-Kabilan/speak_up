# TESTING GUIDE - CROSS-PLATFORM PRODUCTION FIX

## Pre-Testing Setup

### 1. Clear Cache and Restart
```bash
# Stop any running instances
# Then clear cache and restart
npm start -- --clear
```

### 2. Verify Files Exist
```bash
# Check dictionary files
dir src\services\audio\cmudict.dict
dir public\cmudict.dict

# Check metro config
type metro.config.js
```

### 3. Check Console for Startup Logs
Expected output:
```
📚 CMU dictionary loaded: 133779 words
```

---

## TEST SUITE 1: CMU Dictionary Loading

### Test 1.1: Web Platform Dictionary Load
**Platform**: Web Browser
**Steps**:
1. Open app in web browser
2. Open browser console (F12)
3. Navigate to any practice screen
4. Check console logs

**Expected**:
```
📚 CMU dictionary loaded: 133779 words
```

**Pass Criteria**:
- ✅ Word count > 130,000
- ✅ No fetch errors
- ✅ No expo-file-system errors

### Test 1.2: Native Platform Dictionary Load
**Platform**: Android/iOS Emulator
**Steps**:
1. Run on emulator: `npm run android` or `npm run ios`
2. Check Metro bundler console
3. Navigate to practice screen
4. Check device logs

**Expected**:
```
📚 CMU dictionary loaded: 133779 words
```

**Pass Criteria**:
- ✅ Word count > 130,000
- ✅ Asset loads successfully
- ✅ No file system errors

### Test 1.3: Dictionary Lookup
**Platform**: Both
**Steps**:
1. Practice any word (e.g., "think")
2. Check console for phoneme lookup

**Expected**:
```
🔍 Processing 1 words from: "think"
🔎 Looking up word: "think"
✅ Found 4 phonemes for "think"
🔤 Total phonemes extracted: 4
```

**Pass Criteria**:
- ✅ Word found in dictionary
- ✅ Phonemes extracted
- ✅ No "Dictionary lookup failed" errors

---

## TEST SUITE 2: Sentence Mode Evaluation

### Test 2.1: Multi-Word Sentence
**Platform**: Both
**Steps**:
1. Practice a sentence: "Think about it"
2. Record audio
3. Check console logs

**Expected**:
```
📚 SENTENCE MODE: 3 words detected
📝 Word 1/3: "think" - Score: 85, Phonemes: 4
📝 Word 2/3: "about" - Score: 78, Phonemes: 5
📝 Word 3/3: "it" - Score: 92, Phonemes: 2
===== SENTENCE EVALUATION COMPLETE =====
Total Words: 3
Per-Word Scores: 85.0, 78.0, 92.0
Avg DTW Score: 85.0
Phoneme Score: 82.3
Final Score: 83
Total Phoneme Count: 11
```

**Pass Criteria**:
- ✅ All 3 words processed
- ✅ Individual word scores shown
- ✅ Final score calculated
- ✅ Total phoneme count = sum of all words

### Test 2.2: Single Word (Word Mode)
**Platform**: Both
**Steps**:
1. Practice single word: "think"
2. Record audio
3. Check console logs

**Expected**:
```
📖 WORD MODE: Single word evaluation
===== WORD EVALUATION COMPLETE =====
DTW Score: 85
Phoneme Score: 82
Final Score: 84
Phoneme Count: 4
```

**Pass Criteria**:
- ✅ Word mode activated
- ✅ Single word evaluated
- ✅ Phoneme count matches word

---

## TEST SUITE 3: NaN and Infinity Safety

### Test 3.1: Empty Audio Buffer
**Platform**: Both
**Steps**:
1. Simulate empty recording (if possible)
2. Check for graceful handling

**Expected**:
```
❌ DTW: Empty sequences
```

**Pass Criteria**:
- ✅ No crash
- ✅ Score = 0
- ✅ Error message logged

### Test 3.2: Invalid MFCC Data
**Platform**: Both
**Steps**:
1. Practice any word
2. Monitor DTW computation
3. Check for Infinity/NaN

**Expected**:
```
📊 DTW Normalized Distance: 0.4523
🎯 Final DTW Score: 82
```

**Pass Criteria**:
- ✅ Distance is finite number
- ✅ Score is 0-100
- ✅ No NaN in output
- ✅ No Infinity in output

### Test 3.3: Missing Phoneme Boundaries
**Platform**: Both
**Steps**:
1. Practice word with no phoneme data
2. Check alignment handling

**Expected**:
```
⚠️ No phoneme boundaries provided
```

**Pass Criteria**:
- ✅ No crash
- ✅ Empty array returned
- ✅ Phoneme score = 0

### Test 3.4: Final Score Validation
**Platform**: Both
**Steps**:
1. Practice multiple words
2. Check final score calculation
3. Verify score range

**Expected**:
```
Final Score: 83
```

**Pass Criteria**:
- ✅ Score >= 0
- ✅ Score <= 100
- ✅ Score is integer
- ✅ No NaN
- ✅ No Infinity

---

## TEST SUITE 4: Firebase Integration

### Test 4.1: Save Attempt (No Promise Error)
**Platform**: Both
**Steps**:
1. Complete an exercise
2. Click "Next" or "View Progress"
3. Check Firebase console
4. Check browser/device console

**Expected**:
- No errors in console
- Attempt saved to Firestore
- All fields are JSON (no Promises)

**Pass Criteria**:
- ✅ No "Unsupported field value" error
- ✅ phoneme_segments is array of objects
- ✅ All fields serializable
- ✅ Data appears in Firebase

### Test 4.2: Phoneme Segments Structure
**Platform**: Both
**Steps**:
1. Complete exercise
2. Check saved data in Firestore
3. Inspect phoneme_segments field

**Expected Structure**:
```json
{
  "phoneme_segments": [
    {
      "phoneme": "TH",
      "readable": "th as in think",
      "score": 75,
      "distance": 0.523,
      "severity": 2
    }
  ]
}
```

**Pass Criteria**:
- ✅ Array of plain objects
- ✅ No Promise objects
- ✅ All values are primitives
- ✅ Readable in Firebase console

---

## TEST SUITE 5: UI Scrollability

### Test 5.1: Feedback Card Scroll
**Platform**: Web Browser
**Steps**:
1. Complete exercise with low score
2. View feedback card
3. Scroll through content
4. Verify buttons visible

**Pass Criteria**:
- ✅ Content scrolls smoothly
- ✅ All sections visible
- ✅ Buttons always reachable
- ✅ No overflow hidden

### Test 5.2: Long Feedback Content
**Platform**: Both
**Steps**:
1. Get multiple incorrect phonemes
2. View detailed feedback
3. Scroll to bottom
4. Click action buttons

**Pass Criteria**:
- ✅ All phonemes visible
- ✅ Audio buttons accessible
- ✅ Action buttons at bottom work
- ✅ No content cut off

### Test 5.3: Small Screen
**Platform**: Web (resize browser)
**Steps**:
1. Resize browser to mobile size (375x667)
2. Complete exercise
3. View feedback
4. Test scrolling

**Pass Criteria**:
- ✅ Card fits screen
- ✅ Content scrollable
- ✅ Buttons visible
- ✅ No horizontal scroll

---

## TEST SUITE 6: Teaching-Style Audio

### Test 6.1: Audio Button Labels
**Platform**: Both
**Steps**:
1. Get incorrect pronunciation
2. View feedback card
3. Check audio button labels

**Expected**:
```
🐢 Button 3: Slow Word Correction
▶️ Button 1: Isolated Phoneme
👄 Button 2: Articulation Guide
```

**Pass Criteria**:
- ✅ Three distinct buttons
- ✅ Clear labels
- ✅ Different icons

### Test 6.2: Audio Playback (Simulated)
**Platform**: Web
**Steps**:
1. Click each audio button
2. Check console logs
3. Verify different audio types

**Expected**:
```
🎧 Auto-playing slow pronunciation correction
🎯 Teaching mode started for phoneme: TH
🎧 Playing isolated phoneme audio
👄 Playing articulation instruction audio
🐢 Playing slow word correction audio
```

**Pass Criteria**:
- ✅ Each button triggers different audio
- ✅ Teaching sequence plays in order
- ✅ Console logs show audio type

### Test 6.3: Missing Audio Handling
**Platform**: Both
**Steps**:
1. Practice phoneme without audio files
2. Check console warnings
3. Verify graceful degradation

**Expected**:
```
⚠️ No correction audio for phoneme: XYZ
```

**Pass Criteria**:
- ✅ Warning logged
- ✅ No crash
- ✅ Buttons disabled or hidden
- ✅ Fallback message shown

---

## TEST SUITE 7: Cross-Platform Compatibility

### Test 7.1: Web Platform Full Flow
**Platform**: Web Browser
**Steps**:
1. Load app
2. Select lesson
3. Practice word
4. Record audio
5. View results
6. Save progress

**Pass Criteria**:
- ✅ Dictionary loads
- ✅ Recording works
- ✅ Evaluation completes
- ✅ Results display
- ✅ Data saves
- ✅ No platform-specific errors

### Test 7.2: Android Platform Full Flow
**Platform**: Android Emulator/Device
**Steps**:
1. Load app
2. Select lesson
3. Practice word
4. Record audio
5. View results
6. Save progress

**Pass Criteria**:
- ✅ Dictionary loads
- ✅ Recording works
- ✅ Evaluation completes
- ✅ Results display
- ✅ Data saves
- ✅ No platform-specific errors

### Test 7.3: iOS Platform Full Flow
**Platform**: iOS Simulator/Device
**Steps**:
1. Load app
2. Select lesson
3. Practice word
4. Record audio
5. View results
6. Save progress

**Pass Criteria**:
- ✅ Dictionary loads
- ✅ Recording works
- ✅ Evaluation completes
- ✅ Results display
- ✅ Data saves
- ✅ No platform-specific errors

---

## REGRESSION TESTS

### Regression 1: Previous Functionality
**Test**: Ensure old features still work
**Steps**:
1. Test all lesson categories
2. Test progress tracking
3. Test user authentication
4. Test navigation

**Pass Criteria**:
- ✅ All previous features work
- ✅ No new bugs introduced

### Regression 2: Performance
**Test**: Ensure no performance degradation
**Steps**:
1. Measure dictionary load time
2. Measure evaluation time
3. Check memory usage

**Pass Criteria**:
- ✅ Dictionary loads < 2 seconds
- ✅ Evaluation completes < 3 seconds
- ✅ No memory leaks

---

## EDGE CASES

### Edge Case 1: Very Long Sentence
**Test**: 10+ word sentence
**Expected**: All words processed, no timeout

### Edge Case 2: Special Characters
**Test**: "Don't think!" (apostrophe, exclamation)
**Expected**: Characters stripped, words processed

### Edge Case 3: Unknown Word
**Test**: Made-up word "xyzabc"
**Expected**: Warning logged, graceful handling

### Edge Case 4: Silent Audio
**Test**: Record silence
**Expected**: Low confidence result, no crash

### Edge Case 5: Very Loud Audio
**Test**: Record with clipping
**Expected**: Quality warning, evaluation continues

---

## AUTOMATED TEST SCRIPT

```javascript
// test/integration.test.js
describe('Cross-Platform Production Fix', () => {
  test('Dictionary loads with >130k words', async () => {
    const dict = new PhonemeDict();
    await dict.loadPromise;
    expect(Object.keys(dict.dict).length).toBeGreaterThan(130000);
  });

  test('Sentence mode processes all words', async () => {
    const evaluator = new PronunciationEvaluator();
    const result = await evaluator.evaluate(
      userAudio,
      refAudio,
      'think about it',
      'test'
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(isNaN(result.score)).toBe(false);
  });

  test('DTW never returns NaN or Infinity', () => {
    const dtw = new DTW();
    const result = dtw.compute(mfcc1, mfcc2);
    expect(isFinite(result.normalizedDistance)).toBe(true);
    expect(isFinite(result.similarity)).toBe(true);
  });

  test('Firebase data is serializable', async () => {
    const data = {
      phoneme_segments: result.phoneme_segments
    };
    expect(() => JSON.stringify(data)).not.toThrow();
  });
});
```

---

## SIGN-OFF CHECKLIST

### Development
- [ ] All 7 parts implemented
- [ ] Code reviewed
- [ ] Console logs verified
- [ ] Error handling tested

### Testing
- [ ] Web platform tested
- [ ] Android tested
- [ ] iOS tested
- [ ] Firebase integration tested
- [ ] Edge cases tested

### Documentation
- [ ] Implementation guide complete
- [ ] Audio file structure documented
- [ ] Testing guide complete
- [ ] Deployment notes ready

### Deployment
- [ ] public/cmudict.dict deployed
- [ ] metro.config.js included
- [ ] Environment variables set
- [ ] Firebase rules updated

---

## TROUBLESHOOTING

### Issue: Dictionary not loading on web
**Solution**: Check public/cmudict.dict exists and fetch path is correct

### Issue: NaN score appearing
**Solution**: Check DTW safety checks, verify MFCC data validity

### Issue: Firebase Promise error
**Solution**: Verify all async calls are awaited, check phoneme_segments structure

### Issue: Sentence only evaluates first word
**Solution**: Check loop in evaluateSentence, verify all words processed

### Issue: Feedback card not scrollable
**Solution**: Already implemented, check ScrollView styles

---

**Last Updated**: ${new Date().toISOString()}
**Status**: Ready for Testing
