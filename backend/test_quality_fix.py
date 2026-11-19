"""
Test script to verify quality analyzer generates teaching tips
"""
import sys
import numpy as np
import soundfile as sf

sys.path.append('.')
from services.pronunciation_quality_analyzer import PronunciationQualityAnalyzer

# Create test audio (simulate low quality)
sample_rate = 16000
duration = 0.5
audio = np.random.randn(int(sample_rate * duration)) * 0.005  # VERY quiet audio (poor quality)

# Save test audio
sf.write('test_audio.wav', audio, sample_rate)

# Test analyzer
analyzer = PronunciationQualityAnalyzer()
result = analyzer.analyze_quality(
    'test_audio.wav',
    None,  # No reference audio
    ['HH', 'AA', 'T'],
    True
)

print("\n" + "="*60)
print("QUALITY ANALYSIS TEST RESULTS")
print("="*60)
print(f"\nQuality Score: {result['quality_score']}")
print(f"Number of Phoneme Errors: {len(result['phoneme_errors'])}")
print("\nPhoneme Errors:")
for err in result['phoneme_errors']:
    print(f"\n  Phoneme: {err['expected']}")
    print(f"  Severity: {err['severity']}")
    print(f"  Teaching Tip: {err['teaching_tip'][:80]}...")

# Cleanup
import os
os.remove('test_audio.wav')

print("="*60)
if len(result['phoneme_errors']) > 0:
    print("SUCCESS: Teaching tips are being generated!")
else:
    print("FAILED: No teaching tips generated")
print("="*60 + "\n")
