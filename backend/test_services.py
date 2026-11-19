"""Test if evaluation code can run without crashing"""
import sys
import tempfile
import numpy as np
import soundfile as sf

sys.path.append('.')

print("1. Importing services...")
from services.acoustic_analyzer import AcousticAnalyzer
from services.cmu_dict_service import CMUDictService
from services.phoneme_comparator import PhonemeComparator
from services.pronunciation_quality_analyzer import PronunciationQualityAnalyzer
from services.feedback_generator import FeedbackGenerator
print("   SUCCESS: All imports work")

print("\n2. Creating test audio...")
sample_rate = 16000
duration = 0.5
audio = np.random.randn(int(sample_rate * duration)) * 0.02
with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
    sf.write(f.name, audio, sample_rate)
    audio_path = f.name
print(f"   SUCCESS: Audio saved to {audio_path}")

print("\n3. Testing CMU Dict...")
cmu_dict = CMUDictService()
cmu_dict.load()
phonemes = cmu_dict.get_phonemes('hot')
print(f"   SUCCESS: Got phonemes for 'hot': {phonemes}")

print("\n4. Testing Quality Analyzer...")
analyzer = PronunciationQualityAnalyzer()
result = analyzer.analyze_quality(audio_path, None, phonemes, True)
print(f"   SUCCESS: Quality score: {result['quality_score']}, Errors: {len(result['phoneme_errors'])}")

print("\n5. Testing Phoneme Comparator...")
comparator = PhonemeComparator()
errors = comparator.compare(phonemes, phonemes, 'hot')
score = comparator.calculate_score(errors, len(phonemes))
print(f"   SUCCESS: Score: {score}, Errors: {len(errors)}")

print("\n6. Testing Feedback Generator...")
feedback_gen = FeedbackGenerator()
feedback = feedback_gen.generate(errors, [], score, 'hot', [])
print(f"   SUCCESS: Feedback: {feedback[:50]}...")

print("\n=== ALL TESTS PASSED ===")

import os
os.unlink(audio_path)
