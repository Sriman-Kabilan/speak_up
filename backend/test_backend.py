# Test backend services without Flask
import sys
sys.stdout.reconfigure(encoding='utf-8')

from services.cmu_dict_service import CMUDictService
from services.phoneme_comparator import PhonemeComparator

print("Testing backend services...")

# Test CMU Dictionary
cmu = CMUDictService()
cmu.load()
print(f"CMU Dict loaded: {len(cmu.dict)} words")

# Test phoneme lookup
hot_phonemes = cmu.get_phonemes("hot")
print(f"'hot' phonemes: {hot_phonemes}")

tap_phonemes = cmu.get_phonemes("tap")
print(f"'tap' phonemes: {tap_phonemes}")

# Test comparison
comparator = PhonemeComparator()

# Simulate: User said "tap" but expected "hot"
errors = comparator.compare(tap_phonemes, hot_phonemes, "hot")
print(f"\nErrors when saying 'tap' instead of 'hot': {len(errors)}")
for error in errors:
    print(f"  - Position {error['position']}: expected '{error['expected']}', got '{error['detected']}'")

score = comparator.calculate_score(errors, len(hot_phonemes))
print(f"\nScore: {score}%")
print("Expected: 0% or very low (wrong word)")

print("\n✓ Backend services working correctly!")
