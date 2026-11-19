# Pronunciation Evaluation System

## Architecture

### Acoustic Analysis Engine
- Analyzes audio waveforms to identify pronunciation patterns
- Uses advanced acoustic modeling with vocabulary constraints (RAG approach)
- Compares detected phonemes with expected phonemes from CMU Dictionary
- Provides phoneme-level feedback for teaching

### Key Components

1. **Acoustic Analyzer**
   - Processes audio signals
   - Identifies phonetic patterns
   - Uses vocabulary context to improve accuracy
   - NOT a general speech-to-text system

2. **CMU Dictionary**
   - Provides expected phoneme sequences
   - Maps words to ARPABET phonemes
   - 135K+ word coverage

3. **Phoneme Comparator**
   - Compares detected vs expected phonemes
   - Calculates partial scores (e.g., "hat" vs "hot" = 33%)
   - Identifies specific errors (TH→T, V→W, etc.)

4. **Feedback Generator**
   - Provides teaching tips
   - Natural language feedback
   - Specific guidance for Indian English learners

## How It Works

```
User says "hat" (expected: "hot")
↓
Acoustic Analysis → Detects "hat"
↓
CMU Dictionary → "hat" = [HH, AE, T], "hot" = [HH, AA, T]
↓
Phoneme Comparison → 2/3 phonemes match (HH, T correct; AA wrong)
↓
Score: 67% + Feedback: "Good! Your 'AA' in 'hot' needs to be more open"
```

## Scoring Logic

- **100% match**: 95-100 score
- **Partial match** (e.g., "hat" vs "hot"): Score based on phoneme overlap
- **Complete mismatch** (e.g., "tap" vs "hot"): 0 score
- **Phoneme-level errors**: Specific feedback for each wrong phoneme

## Installation

```bash
cd backend
pip install -r requirements.txt
python app.py
```

First run downloads acoustic model (~140MB).

## Testing

1. Say "hot" correctly → 85-95% + "Excellent!"
2. Say "hat" instead → ~67% + "Your AA sound needs work"
3. Say "tap" instead → 0% + "You said 'tap' but expected 'hot'"

## Technical Details

- Acoustic model: Whisper base (74M parameters)
- Vocabulary constraints: RAG approach with phonetically similar words
- Phoneme representation: ARPABET (CMU standard)
- Comparison: Levenshtein distance on phoneme sequences
