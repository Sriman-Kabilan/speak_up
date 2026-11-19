# Google Cloud TTS Setup Guide

## Why This Change?

The previous formant synthesis generated **unrealistic reference audio** that matched any speech, causing:
- Wrong words scoring 85-87%
- Unable to detect pronunciation errors accurately
- Generic patterns that don't represent real speech

**Google Cloud TTS** generates **realistic human speech** for accurate pronunciation comparison.

---

## Setup Steps

### 1. Create Google Cloud Account
- Go to: https://console.cloud.google.com/
- Sign up (Free tier: 1 million characters/month)

### 2. Enable Text-to-Speech API
```
1. In Google Cloud Console
2. Navigate to "APIs & Services" → "Library"
3. Search for "Cloud Text-to-Speech API"
4. Click "Enable"
```

### 3. Create API Key
```
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated key
4. (Optional) Restrict key to "Cloud Text-to-Speech API" only
```

### 4. Configure Your App
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
REACT_APP_GOOGLE_TTS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Restart Development Server
```bash
npm start
```

---

## Cost Estimate

**Free Tier**: 1 million characters/month

**For 240 lessons:**
- Average 10 words per lesson = 2,400 words
- Average 5 characters per word = 12,000 characters
- **Total: 12,000 characters** (well within free tier)

**After free tier**: $4 per 1 million characters

---

## How It Works

```
1. User attempts word "hot"
2. System calls Google TTS API: "hot" → realistic audio
3. Cache audio (never call API again for same word)
4. Extract MFCC from realistic reference
5. Compare with user's MFCC
6. Accurate scoring + phoneme-level feedback
```

---

## Alternative: Amazon Polly

If you prefer AWS:

```javascript
// In googleCloudTTSGenerator.js, replace with:
import AWS from 'aws-sdk';

const polly = new AWS.Polly({
  region: 'us-east-1',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
});

const params = {
  Text: text,
  OutputFormat: 'pcm',
  VoiceId: 'Joanna',  // Neural voice
  Engine: 'neural',
  SampleRate: '16000'
};

const data = await polly.synthesizeSpeech(params).promise();
```

---

## Testing

After setup, test with:

1. **Correct word**: Say "hot" → Should score 75-90%
2. **Wrong word**: Say "elephant" → Should score <30%
3. **Check logs**: Should see "✅ Google TTS generated: X samples"

---

## Troubleshooting

**Error: "API key not configured"**
- Check `.env` file exists
- Restart development server
- Verify key starts with `AIzaSy`

**Error: "TTS API error: 403"**
- Enable Text-to-Speech API in Google Cloud Console
- Check API key restrictions

**Error: "Quota exceeded"**
- You've used free tier limit
- Upgrade to paid plan or wait for monthly reset

---

## For Production

**Security**: Don't expose API key in frontend!

Use backend proxy:
```javascript
// Backend (Node.js)
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  const audio = await generateTTS(text, process.env.GOOGLE_TTS_API_KEY);
  res.send(audio);
});

// Frontend
const audio = await fetch('/api/tts', {
  method: 'POST',
  body: JSON.stringify({ text })
});
```
