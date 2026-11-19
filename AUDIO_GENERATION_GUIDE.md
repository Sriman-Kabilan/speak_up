# How to Generate Reference Audio Files

## Quick Method (Recommended):

### Use Natural Readers (Free, High Quality)
1. Go to: https://www.naturalreaders.com/online/
2. Select voice: "US English - Amy" or "Brian"
3. Type your word/sentence
4. Click "Play" then "Download"
5. Save as MP3

### Convert to WAV (16kHz):
Use online converter: https://online-audio-converter.com/
- Upload MP3
- Format: WAV
- Sample rate: 16000 Hz
- Channels: Mono
- Download

### File Naming:
- "hot" → `hot.wav`
- "Thank you" → `thank_you.wav`
- "Thank you for your help" → `thank_you_for_your_help.wav`

### Place Files:
Save all WAV files in: `public/reference_audio/`

---

## Batch Generation Script (For 240 Lessons):

### Option 1: Use Python + gTTS (Free, No API Key)
```python
from gtts import gTTS
from pydub import AudioSegment
import os

lessons = ["hot", "hit", "dot", "Thank you", ...]  # Your 240 lessons

for text in lessons:
    # Generate speech
    tts = gTTS(text=text, lang='en', slow=False)
    filename = text.lower().replace(' ', '_').replace('[^a-z0-9_]', '')
    
    # Save as MP3
    tts.save(f"temp_{filename}.mp3")
    
    # Convert to WAV 16kHz
    audio = AudioSegment.from_mp3(f"temp_{filename}.mp3")
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(f"public/reference_audio/{filename}.wav", format="wav")
    
    os.remove(f"temp_{filename}.mp3")
    print(f"✅ Generated: {filename}.wav")
```

### Option 2: Use Balabolka (Windows, Free)
1. Download: http://www.cross-plus-a.com/balabolka.htm
2. Paste all 240 texts (one per line)
3. Tools → Batch File Converter
4. Output format: WAV, 16000 Hz, Mono
5. Save to `public/reference_audio/`

---

## For Your Project:

1. **Generate audio for all 240 lessons** (one-time, 2-3 hours)
2. **Place in `public/reference_audio/`**
3. **System will load them automatically**
4. **No API key needed**
5. **Works offline**
6. **Perfect quality**

---

## Sample Files to Start:

Create these first to test:
- `hot.wav`
- `hit.wav`
- `dot.wav`
- `thank_you_for_your_help.wav`

Then generate the rest!
