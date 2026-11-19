"""
Automated Reference Audio Generator for SpeakUp Project
Extracts all exercises from Firestore and generates WAV files using gTTS
"""

import firebase_admin
from firebase_admin import credentials, firestore
from gtts import gTTS
from pydub import AudioSegment
import os
import re

# Step 1: Initialize Firebase
# Load serviceAccountKey.json file
import json

try:
    with open('serviceAccountKey.json', 'r') as f:
        service_account_key = json.load(f)
    cred = credentials.Certificate(service_account_key)
except FileNotFoundError:
    print("❌ serviceAccountKey.json not found!")
    print("Download from: Firebase Console → Project Settings → Service Accounts → Generate Key")
    exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure serviceAccountKey.json is valid and not manually edited.")
    exit(1)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Step 2: Create output directory
os.makedirs('public/reference_audio', exist_ok=True)

def text_to_filename(text):
    """Convert text to valid filename"""
    filename = text.lower()
    filename = re.sub(r'[^a-z0-9\s]', '', filename)
    filename = filename.replace(' ', '_')
    return filename + '.wav'

def generate_audio(text, output_path):
    """Generate WAV audio from text using gTTS"""
    try:
        # Generate speech
        tts = gTTS(text=text, lang='en', slow=False)
        temp_mp3 = 'temp.mp3'
        tts.save(temp_mp3)
        
        # Convert to WAV 16kHz mono
        audio = AudioSegment.from_mp3(temp_mp3)
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(output_path, format='wav')
        
        # Cleanup
        os.remove(temp_mp3)
        
        print(f"✅ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Failed for '{text}': {e}")
        return False

# Step 3: Fetch all exercises from Firestore
print("📥 Fetching exercises from Firestore...")
exercises_ref = db.collection('Exercises')
exercises = exercises_ref.stream()

generated_count = 0
failed_count = 0
unique_texts = set()

# Step 4: Generate audio for each unique text
for exercise in exercises:
    data = exercise.to_dict()
    text = data.get('text', '').strip()
    
    if not text or text in unique_texts:
        continue
    
    unique_texts.add(text)
    filename = text_to_filename(text)
    output_path = f'public/reference_audio/{filename}'
    
    # Skip if already exists
    if os.path.exists(output_path):
        print(f"⏭️  Skipped (exists): {text}")
        continue
    
    # Generate audio
    if generate_audio(text, output_path):
        generated_count += 1
    else:
        failed_count += 1

# Step 5: Summary
print("\n" + "="*50)
print(f"✅ Successfully generated: {generated_count} files")
print(f"❌ Failed: {failed_count} files")
print(f"📁 Total unique exercises: {len(unique_texts)}")
print(f"📂 Output directory: public/reference_audio/")
print("="*50)
