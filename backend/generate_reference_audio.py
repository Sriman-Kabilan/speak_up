"""
Generate Reference Audio for All Firebase Exercises
Run this script whenever new exercises are added to Firebase
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.tts_service import TTSService

# Sample exercises (replace with Firebase data)
SAMPLE_EXERCISES = [
    # Vowel Sounds
    'hot', 'hat', 'hit', 'hut', 'cat', 'sit', 'pot', 'cut',
    
    # TH Words
    'think', 'thank', 'that', 'this', 'them', 'three', 'throw',
    
    # V vs W
    'very', 'water', 'vest', 'west', 'vine', 'wine',
    
    # Greetings
    'hello', 'good morning', 'good evening', 'good night', 'goodbye',
    'how are you', 'nice to meet you', 'take care',
    
    # Workplace
    'meeting', 'presentation', 'deadline', 'project', 'thank you',
    'excuse me', 'could you please',
    
    # Common Phrases
    'i am fine', 'what is your name', 'where are you from',
    'how can i help you', 'have a nice day',
    
    # Sentences
    'the weather is nice today',
    'i would like to schedule a meeting',
    'thank you for your time',
    'please let me know if you need anything',
]

def generate_reference_audio_for_exercises():
    """Generate reference audio for all exercises"""
    
    # Initialize TTS service with output to public folder
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'reference_audio')
    os.makedirs(output_dir, exist_ok=True)
    
    tts = TTSService(cache_dir=output_dir)
    
    print("=" * 60)
    print("GENERATING REFERENCE AUDIO")
    print("=" * 60)
    print(f"Output directory: {output_dir}")
    print(f"Total exercises: {len(SAMPLE_EXERCISES)}")
    print()
    
    generated = 0
    failed = 0
    
    for text in SAMPLE_EXERCISES:
        try:
            # Generate at normal speed (most commonly used)
            audio_path = tts.generate_audio(text, 'normal')
            
            if audio_path and os.path.exists(audio_path):
                generated += 1
                print(f"[OK] {text:40} -> {os.path.basename(audio_path)}")
            else:
                failed += 1
                print(f"[FAIL] {text}")
                
        except Exception as e:
            failed += 1
            print(f"[ERROR] {text}: {e}")
    
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total: {len(SAMPLE_EXERCISES)}")
    print(f"Generated: {generated}")
    print(f"Failed: {failed}")
    print()
    
    if failed == 0:
        print("[SUCCESS] All reference audio generated!")
    else:
        print(f"[WARNING] {failed} exercises failed")

if __name__ == '__main__':
    generate_reference_audio_for_exercises()
