"""Test to find the acoustic evaluator bug"""

from services.phoneme_acoustic_evaluator import PhonemeAcousticEvaluator
import soundfile as sf
import numpy as np

# Create test audio (1 second of random noise)
audio = np.random.randn(16000) * 0.1
sf.write('test_audio.wav', audio, 16000)

evaluator = PhonemeAcousticEvaluator()

# Test 1: Same phonemes (should give low scores for random noise)
print("\n=== TEST 1: Random noise as 'hot' ===")
result = evaluator.evaluate_pronunciation(
    'test_audio.wav',
    ['HH', 'AA', 'T'],
    ['HH', 'AA', 'T']
)
print(f"Score: {result['score']}")
print(f"Phoneme scores: {result['phoneme_scores']}")
print(f"Errors: {len(result['errors'])}")

# Test 2: Different length phonemes
print("\n=== TEST 2: Different lengths ===")
result = evaluator.evaluate_pronunciation(
    'test_audio.wav',
    ['HH', 'AA', 'T'],
    ['HH', 'AA']  # Missing T
)
print(f"Score: {result['score']}")
print(f"Phoneme scores: {result['phoneme_scores']}")

# Test 3: Empty phonemes
print("\n=== TEST 3: Empty detected ===")
result = evaluator.evaluate_pronunciation(
    'test_audio.wav',
    ['HH', 'AA', 'T'],
    []
)
print(f"Score: {result['score']}")
print(f"Phoneme scores: {result['phoneme_scores']}")

import os
os.remove('test_audio.wav')
