"""Test all exercise types to verify backend handles them correctly"""

from services.cmu_dict_service import CMUDictService

cmu = CMUDictService()
cmu.load()

# Test cases covering all lesson types
test_cases = [
    # Lesson 1: Alphabet Sounds (single letters/sounds)
    ('a', 'WORD'),
    ('b', 'WORD'),
    
    # Lesson 2: Vowel Sounds (single words)
    ('hot', 'WORD'),
    ('cat', 'WORD'),
    ('sit', 'WORD'),
    
    # Lesson 3: TH Words (single words)
    ('think', 'WORD'),
    ('that', 'WORD'),
    
    # Lesson 4: V vs W (single words)
    ('very', 'WORD'),
    ('water', 'WORD'),
    
    # Lesson 5: Greetings (phrases)
    ('hello', 'WORD'),
    ('good morning', 'SENTENCE'),
    ('good evening', 'SENTENCE'),
    ('good night', 'SENTENCE'),
    
    # Lesson 6: Workplace Words (single words and phrases)
    ('meeting', 'WORD'),
    ('thank you', 'SENTENCE'),
    
    # Lesson 7: Common Phrases (sentences)
    ('how are you', 'SENTENCE'),
    ('nice to meet you', 'SENTENCE'),
    
    # Lesson 8: Sentence Practice (full sentences)
    ('i am fine', 'SENTENCE'),
    ('what is your name', 'SENTENCE'),
]

print("=" * 60)
print("TESTING ALL EXERCISE TYPES")
print("=" * 60)

passed = 0
failed = 0

for text, expected_type in test_cases:
    words = text.split()
    is_sentence = len(words) > 1
    actual_type = 'SENTENCE' if is_sentence else 'WORD'
    
    # Check if we can get phonemes
    if is_sentence:
        phonemes = []
        success = True
        for word in words:
            word_phonemes = cmu.get_phonemes(word)
            if not word_phonemes:
                success = False
                break
            phonemes.extend(word_phonemes)
    else:
        phonemes = cmu.get_phonemes(text)
        success = phonemes is not None and len(phonemes) > 0
    
    status = "PASS" if success and actual_type == expected_type else "FAIL"
    
    if success and actual_type == expected_type:
        passed += 1
    else:
        failed += 1
    
    print(f"{status} | {text:25} | Type: {actual_type:8} | Phonemes: {len(phonemes) if success else 0}")

print("=" * 60)
print(f"RESULTS: {passed} passed, {failed} failed")
print("=" * 60)

if failed == 0:
    print("ALL EXERCISE TYPES SUPPORTED!")
else:
    print(f"{failed} exercise types have issues")
