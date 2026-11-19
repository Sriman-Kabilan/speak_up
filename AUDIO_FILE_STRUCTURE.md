# TEACHING-STYLE AUDIO FILE STRUCTURE

## Overview
Each phoneme requires 3 DISTINCT audio files for effective teaching.

## File Naming Convention

```
/audio/phonemes/
  ├── {phoneme}_isolated.mp3
  ├── {phoneme}_word_slow.mp3
  └── {phoneme}_teaching.mp3
```

## Audio Type Descriptions

### 1. Isolated Phoneme (`_isolated.mp3`)
**Purpose**: Pure phoneme sound only
**Duration**: 0.5-1 second
**Example for /TH/**:
- Audio: "/THHHH/" (sustained sound)
- No words, no explanation
- Just the pure phoneme

### 2. Slow Word Correction (`_word_slow.mp3`)
**Purpose**: Exaggerated slow pronunciation in word context
**Duration**: 2-3 seconds
**Example for /TH/ in "think"**:
- Audio: "THHH-ink... THHH-ink"
- Emphasize the target phoneme
- Slow, clear, exaggerated

### 3. Articulation Teaching (`_teaching.mp3`)
**Purpose**: Verbal instruction on how to produce the sound
**Duration**: 3-5 seconds
**Example for /TH/**:
- Audio: "Place your tongue between your teeth and blow air gently"
- Clear, instructional tone
- Describes mouth/tongue position

## Required Phonemes

### Priority Phonemes (Most Common Errors)
```
TH - th_isolated.mp3, th_word_slow.mp3, th_teaching.mp3
DH - dh_isolated.mp3, dh_word_slow.mp3, dh_teaching.mp3
V  - v_isolated.mp3,  v_word_slow.mp3,  v_teaching.mp3
W  - w_isolated.mp3,  w_word_slow.mp3,  w_teaching.mp3
R  - r_isolated.mp3,  r_word_slow.mp3,  r_teaching.mp3
L  - l_isolated.mp3,  l_word_slow.mp3,  l_teaching.mp3
```

### Vowel Phonemes
```
AE - ae_isolated.mp3, ae_word_slow.mp3, ae_teaching.mp3
EH - eh_isolated.mp3, eh_word_slow.mp3, eh_teaching.mp3
IH - ih_isolated.mp3, ih_word_slow.mp3, ih_teaching.mp3
AA - aa_isolated.mp3, aa_word_slow.mp3, aa_teaching.mp3
```

## Example Audio Scripts

### TH (Voiceless)
```
Isolated:     "/THHHH/"
Slow Word:    "THHH-ink... THHH-ink"
Teaching:     "Place your tongue between your teeth and blow air gently"
```

### DH (Voiced)
```
Isolated:     "/DHHH/"
Slow Word:    "DHHH-is... DHHH-is"
Teaching:     "Place your tongue between your teeth and vibrate your vocal cords"
```

### V
```
Isolated:     "/VVV/"
Slow Word:    "VVV-ery... VVV-ery"
Teaching:     "Touch your upper teeth to your lower lip and vibrate"
```

### R
```
Isolated:     "/RRR/"
Slow Word:    "RRR-ight... RRR-ight"
Teaching:     "Curl your tongue back without touching the roof of your mouth"
```

### L
```
Isolated:     "/LLL/"
Slow Word:    "LLL-ight... LLL-ight"
Teaching:     "Touch the tip of your tongue to the roof of your mouth"
```

## Recording Guidelines

### Voice Characteristics
- **Gender**: Neutral or female voice (research shows better learning)
- **Accent**: Standard American English (General American)
- **Tone**: Clear, friendly, instructional
- **Speed**: 
  - Isolated: Normal
  - Slow Word: 0.5x speed
  - Teaching: 0.7x speed

### Audio Quality
- **Format**: MP3, 128kbps minimum
- **Sample Rate**: 44.1kHz
- **Channels**: Mono
- **Normalization**: -3dB peak
- **Noise**: Remove background noise

### Recording Environment
- Quiet room
- Pop filter for plosives
- Close mic technique
- Consistent volume across all files

## Implementation in Code

### Current Mapping
```javascript
// src/services/audio/correctionAudioService.js
'TH': {
  isolated: '/audio/phonemes/th_isolated.mp3',
  slow: '/audio/phonemes/th_word_slow.mp3',
  articulation: '/audio/phonemes/th_teaching.mp3'
}
```

### Fallback Behavior
If audio file missing:
1. Log warning: `⚠️ No correction audio for phoneme: {phoneme}`
2. Return null for that audio type
3. UI shows button but disabled or hidden

## Production Checklist

### For Each Phoneme:
- [ ] Record isolated sound
- [ ] Record slow word example
- [ ] Record teaching instruction
- [ ] Normalize audio levels
- [ ] Remove noise
- [ ] Convert to MP3
- [ ] Test playback
- [ ] Upload to `/audio/phonemes/`
- [ ] Verify in app

### Quality Assurance:
- [ ] All 3 files sound DIFFERENT
- [ ] Teaching audio is instructional
- [ ] Slow word is clearly exaggerated
- [ ] Isolated sound is pure phoneme
- [ ] No clipping or distortion
- [ ] Consistent volume across files

## Future Extensions

### Additional Audio Types (Optional)
```
{phoneme}_contrast.mp3     - Minimal pair comparison
{phoneme}_sentence.mp3     - Full sentence example
{phoneme}_visual.mp3       - Paired with mouth diagram
```

### Multilingual Support
```
{phoneme}_isolated_es.mp3  - Spanish speaker version
{phoneme}_isolated_zh.mp3  - Chinese speaker version
```

## Notes

- **DO NOT** reuse the same audio file for different types
- **DO NOT** use TTS for teaching audio (use human voice)
- **DO** maintain consistent voice across all phonemes
- **DO** test with actual learners before production

## Contact for Audio Production

If you need professional audio recording:
1. Hire voice actor with teaching experience
2. Use professional recording studio
3. Provide this document as specification
4. Review samples before full production

---

**Last Updated**: ${new Date().toISOString()}
**Status**: Specification Complete - Ready for Audio Production
