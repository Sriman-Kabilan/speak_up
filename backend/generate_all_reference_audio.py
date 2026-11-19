"""
Complete Reference Audio Generator
Generates audio for ALL exercises in Firebase + ensures no missing files
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.tts_service import TTSService
import json

def load_exercises_from_audit():
    """Load exercises from audit report if available"""
    audit_file = 'firebase_audit_report.json'
    
    if os.path.exists(audit_file):
        print(f"✓ Loading exercises from {audit_file}")
        with open(audit_file, 'r') as f:
            data = json.load(f)
            return data.get('all_exercises', [])
    
    return None

def get_sample_exercises():
    """Fallback: comprehensive sample exercises covering all lessons"""
    return [
        # Lesson 1: Alphabet/Basic Sounds
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        
        # Lesson 2: Short Vowel Sounds
        'hot', 'hat', 'hit', 'hut', 'cat', 'sit', 'pot', 'cut', 'bat', 'bit',
        'cot', 'but', 'mat', 'mit', 'not', 'nut', 'pat', 'pit', 'rot', 'rut',
        
        # Lesson 3: TH Sounds
        'think', 'thank', 'that', 'this', 'them', 'then', 'three', 'throw',
        'thick', 'thin', 'thing', 'thought', 'through', 'thumb', 'thunder',
        
        # Lesson 4: V vs W
        'very', 'water', 'vest', 'west', 'vine', 'wine', 'veil', 'whale',
        'vet', 'wet', 'vow', 'wow', 'veal', 'wheel',
        
        # Lesson 5: Greetings
        'hello', 'hi', 'good morning', 'good afternoon', 'good evening',
        'good night', 'goodbye', 'see you', 'take care', 'how are you',
        'nice to meet you', 'pleased to meet you',
        
        # Lesson 6: Workplace Words
        'meeting', 'presentation', 'deadline', 'project', 'report',
        'schedule', 'conference', 'email', 'document', 'client',
        'manager', 'colleague', 'office', 'desk', 'computer',
        
        # Lesson 7: Common Phrases
        'thank you', 'excuse me', 'i am sorry', 'you are welcome',
        'how can i help you', 'could you please', 'i would like',
        'may i ask', 'let me know', 'have a nice day',
        
        # Lesson 8: Full Sentences
        'i am fine thank you', 'what is your name', 'where are you from',
        'the weather is nice today', 'i would like to schedule a meeting',
        'thank you for your time', 'please let me know if you need anything',
        'i appreciate your help', 'have a great day',
        'it was nice talking to you',
        
        # Additional common words
        'yes', 'no', 'please', 'sorry', 'okay', 'sure', 'maybe',
        'today', 'tomorrow', 'yesterday', 'now', 'later', 'soon',
        'here', 'there', 'where', 'when', 'why', 'how', 'what', 'who',
    ]

def generate_all_reference_audio():
    """Generate reference audio for all exercises"""
    
    print("="*70)
    print("REFERENCE AUDIO GENERATOR")
    print("="*70)
    
    # Try to load from Firebase audit first
    exercises = load_exercises_from_audit()
    
    if exercises:
        print(f"✓ Loaded {len(exercises)} exercises from Firebase audit")
        texts = list(set([ex['text'] for ex in exercises if ex.get('text')]))
    else:
        print("⚠️  No audit file found, using comprehensive sample exercises")
        texts = get_sample_exercises()
    
    print(f"Total unique texts to generate: {len(texts)}")
    print()
    
    # Setup output directory
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'reference_audio')
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory: {output_dir}")
    print()
    
    # Initialize TTS
    tts = TTSService(cache_dir=output_dir)
    
    # Generate audio
    generated = 0
    cached = 0
    failed = 0
    
    for i, text in enumerate(sorted(texts), 1):
        try:
            # Check if already exists
            filename = text.lower().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')
            expected_path = os.path.join(output_dir, f"{filename}_normal.mp3")
            
            if os.path.exists(expected_path):
                cached += 1
                print(f"[{i}/{len(texts)}] [CACHED] {text}")
            else:
                # Generate
                audio_path = tts.generate_audio(text, 'normal')
                
                if audio_path and os.path.exists(audio_path):
                    generated += 1
                    print(f"[{i}/{len(texts)}] [NEW] {text} -> {os.path.basename(audio_path)}")
                else:
                    failed += 1
                    print(f"[{i}/{len(texts)}] [FAIL] {text}")
        
        except Exception as e:
            failed += 1
            print(f"[{i}/{len(texts)}] [ERROR] {text}: {e}")
    
    # Summary
    print()
    print("="*70)
    print("SUMMARY")
    print("="*70)
    print(f"Total texts: {len(texts)}")
    print(f"Newly generated: {generated}")
    print(f"Already cached: {cached}")
    print(f"Failed: {failed}")
    print()
    
    if failed == 0:
        print("✓ SUCCESS! All reference audio is ready")
    else:
        print(f"⚠️  WARNING: {failed} files failed to generate")
    
    print()
    print("Reference audio location:", output_dir)
    print("App will load audio from: /reference_audio/{filename}.wav")

if __name__ == '__main__':
    generate_all_reference_audio()
