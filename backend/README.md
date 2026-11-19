# Backend Setup - Precise Phoneme Evaluation

## Overview
Python Flask backend for precise phoneme-level pronunciation evaluation using Montreal Forced Aligner and CMU Dictionary.

## Installation

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
python app.py
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Evaluate Pronunciation
```
POST /api/evaluate
Content-Type: multipart/form-data

Parameters:
- audio: WAV file
- text: Expected text
- exercise_id: Exercise identifier

Response:
{
  "success": true,
  "score": 85,
  "phoneme_errors": [...],
  "stress_errors": [...],
  "feedback": "Natural teaching feedback",
  "detected_phonemes": ["HH", "AA", "T"],
  "expected_phonemes": ["HH", "AA", "T"]
}
```

### Get Phonemes
```
GET /api/phonemes/<word>

Response:
{
  "word": "hot",
  "phonemes": ["HH", "AA", "T"],
  "readable": ["h", "o (hot)", "t"]
}
```

## How It Works

1. **Receives audio** from frontend
2. **Detects silence** using RMS energy
3. **Runs forced alignment** to detect actual phonemes
4. **Compares with CMU Dictionary** expected phonemes
5. **Identifies errors** (TH→T, V→W, etc.)
6. **Generates natural feedback** using templates
7. **Returns results** to frontend

## Frontend Integration

Frontend automatically tries backend first, falls back to DTW+MFCC if unavailable.

```javascript
// Frontend will call:
const result = await evaluator.evaluate(audioBuffer, refBuffer, "hot", "ex_123");

// Backend available: Precise evaluation
// Backend unavailable: Frontend DTW+MFCC fallback
```

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test phoneme lookup
curl http://localhost:5000/api/phonemes/hot
```

## Troubleshooting

**Backend not starting:**
- Check Python version (3.8+)
- Install dependencies: `pip install -r requirements.txt`

**Frontend not connecting:**
- Check backend is running on port 5000
- Check CORS is enabled
- Check firewall settings

**Evaluation errors:**
- Check audio file format (WAV, 16kHz)
- Check word exists in CMU Dictionary
- Check audio is not silence
