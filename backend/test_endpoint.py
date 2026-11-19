"""Test the /api/evaluate endpoint"""
import requests
import io
import numpy as np
import soundfile as sf

# Create test audio
sample_rate = 16000
duration = 0.5
audio = np.random.randn(int(sample_rate * duration)) * 0.02
audio_bytes = io.BytesIO()
sf.write(audio_bytes, audio, sample_rate, format='WAV')
audio_bytes.seek(0)

# Test endpoint
try:
    response = requests.post(
        'http://localhost:5000/api/evaluate',
        files={'audio': ('test.wav', audio_bytes, 'audio/wav')},
        data={'text': 'hot', 'exercise_id': 'test'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"ERROR: {e}")
