"""
AUTOMATED Firebase Cleanup + Exercise Generator
- Removes ALL duplicate exercises
- Adds 25 pedagogically useful exercises per lesson
- Generates reference audio for all
"""

import firebase_admin
from firebase_admin import credentials, firestore
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.tts_service import TTSService

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize TTS
output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'reference_audio')
os.makedirs(output_dir, exist_ok=True)
tts = TTSService(cache_dir=output_dir)

# 25 PEDAGOGICALLY USEFUL EXERCISES PER LESSON
LESSON_EXERCISES = {
    'SHORT_VOWELS': {  # Order 1
        'title': 'Short Vowels',
        'exercises': [
            ('hot', 'Short O sound'),
            ('hat', 'Short A sound'),
            ('hit', 'Short I sound'),
            ('hut', 'Short U sound'),
            ('cat', 'Short A in CAT'),
            ('cot', 'Short O in COT'),
            ('cut', 'Short U in CUT'),
            ('bat', 'Short A in BAT'),
            ('bet', 'Short E in BET'),
            ('bit', 'Short I in BIT'),
            ('but', 'Short U in BUT'),
            ('mat', 'Short A in MAT'),
            ('met', 'Short E in MET'),
            ('mit', 'Short I in MIT'),
            ('pot', 'Short O in POT'),
            ('pet', 'Short E in PET'),
            ('pit', 'Short I in PIT'),
            ('put', 'Short U in PUT'),
            ('rat', 'Short A in RAT'),
            ('rot', 'Short O in ROT'),
            ('rut', 'Short U in RUT'),
            ('sat', 'Short A in SAT'),
            ('sit', 'Short I in SIT'),
            ('not', 'Short O in NOT'),
            ('nut', 'Short U in NUT'),
        ]
    },
    
    'LONG_VOWELS': {  # Order 3
        'title': 'Long Vowels',
        'exercises': [
            ('cake', 'Long A sound'),
            ('make', 'Long A sound'),
            ('take', 'Long A sound'),
            ('bake', 'Long A sound'),
            ('lake', 'Long A sound'),
            ('feet', 'Long E sound'),
            ('meet', 'Long E sound'),
            ('greet', 'Long E sound'),
            ('sweet', 'Long E sound'),
            ('sheet', 'Long E sound'),
            ('time', 'Long I sound'),
            ('lime', 'Long I sound'),
            ('dime', 'Long I sound'),
            ('chime', 'Long I sound'),
            ('prime', 'Long I sound'),
            ('home', 'Long O sound'),
            ('dome', 'Long O sound'),
            ('rome', 'Long O sound'),
            ('chrome', 'Long O sound'),
            ('bone', 'Long O sound'),
            ('blue', 'Long U sound'),
            ('true', 'Long U sound'),
            ('clue', 'Long U sound'),
            ('glue', 'Long U sound'),
            ('flute', 'Long U sound'),
        ]
    },
    
    'TH_SOUND': {  # Order 4
        'title': 'TH Sound',
        'exercises': [
            ('think', 'Voiceless TH'),
            ('thank', 'Voiceless TH'),
            ('thick', 'Voiceless TH'),
            ('thin', 'Voiceless TH'),
            ('three', 'Voiceless TH'),
            ('throw', 'Voiceless TH'),
            ('thumb', 'Voiceless TH'),
            ('thought', 'Voiceless TH'),
            ('through', 'Voiceless TH'),
            ('thing', 'Voiceless TH'),
            ('thief', 'Voiceless TH'),
            ('thunder', 'Voiceless TH'),
            ('this', 'Voiced TH'),
            ('that', 'Voiced TH'),
            ('them', 'Voiced TH'),
            ('then', 'Voiced TH'),
            ('there', 'Voiced TH'),
            ('the', 'Voiced TH'),
            ('they', 'Voiced TH'),
            ('these', 'Voiced TH'),
            ('those', 'Voiced TH'),
            ('though', 'Voiced TH'),
            ('thus', 'Voiced TH'),
            ('than', 'Voiced TH'),
            ('their', 'Voiced TH'),
        ]
    },
    
    'V_W': {  # Order 5
        'title': 'V vs W',
        'exercises': [
            ('very', 'V sound'),
            ('wary', 'W sound'),
            ('vest', 'V sound'),
            ('west', 'W sound'),
            ('vine', 'V sound'),
            ('wine', 'W sound'),
            ('veil', 'V sound'),
            ('wail', 'W sound'),
            ('vet', 'V sound'),
            ('wet', 'W sound'),
            ('vow', 'V sound'),
            ('wow', 'W sound'),
            ('veal', 'V sound'),
            ('wheel', 'W sound'),
            ('verse', 'V sound'),
            ('worse', 'W sound'),
            ('vile', 'V sound'),
            ('while', 'W sound'),
            ('vote', 'V sound'),
            ('water', 'W sound'),
            ('voice', 'V sound'),
            ('way', 'W sound'),
            ('value', 'V sound'),
            ('wait', 'W sound'),
            ('visit', 'V sound'),
        ]
    },
    
    'R_L': {  # Order 6
        'title': 'R vs L',
        'exercises': [
            ('right', 'R sound'),
            ('light', 'L sound'),
            ('read', 'R sound'),
            ('lead', 'L sound'),
            ('red', 'R sound'),
            ('led', 'L sound'),
            ('rest', 'R sound'),
            ('lest', 'L sound'),
            ('race', 'R sound'),
            ('lace', 'L sound'),
            ('rock', 'R sound'),
            ('lock', 'L sound'),
            ('road', 'R sound'),
            ('load', 'L sound'),
            ('ray', 'R sound'),
            ('lay', 'L sound'),
            ('rip', 'R sound'),
            ('lip', 'L sound'),
            ('rake', 'R sound'),
            ('lake', 'L sound'),
            ('rice', 'R sound'),
            ('lice', 'L sound'),
            ('row', 'R sound'),
            ('low', 'L sound'),
            ('rent', 'R sound'),
        ]
    },
    
    'GREETINGS': {  # Order 7
        'title': 'Greetings',
        'exercises': [
            ('hello', 'Basic greeting'),
            ('hi', 'Casual greeting'),
            ('good morning', 'Morning greeting'),
            ('good afternoon', 'Afternoon greeting'),
            ('good evening', 'Evening greeting'),
            ('good night', 'Night farewell'),
            ('goodbye', 'Farewell'),
            ('see you', 'Casual farewell'),
            ('see you later', 'Casual farewell'),
            ('take care', 'Caring farewell'),
            ('how are you', 'Asking wellbeing'),
            ('how do you do', 'Formal greeting'),
            ('nice to meet you', 'First meeting'),
            ('pleased to meet you', 'Formal meeting'),
            ('good to see you', 'Seeing again'),
            ('welcome', 'Welcoming'),
            ('have a nice day', 'Day wish'),
            ('have a great day', 'Day wish'),
            ('have a good one', 'Casual wish'),
            ('catch you later', 'Casual farewell'),
            ('talk to you soon', 'Future contact'),
            ('until next time', 'Future meeting'),
            ('it was nice seeing you', 'Parting'),
            ('pleasure meeting you', 'Formal parting'),
            ('looking forward to seeing you', 'Future anticipation'),
        ]
    },
    
    'WORKPLACE': {  # Order 8
        'title': 'Workplace',
        'exercises': [
            ('thank you', 'Gratitude'),
            ('thanks', 'Casual gratitude'),
            ('excuse me', 'Polite interruption'),
            ('sorry', 'Apology'),
            ('i am sorry', 'Full apology'),
            ('could you please', 'Polite request'),
            ('would you mind', 'Polite request'),
            ('i would like', 'Polite want'),
            ('may i', 'Permission request'),
            ('let me know', 'Information request'),
            ('i appreciate it', 'Gratitude'),
            ('no problem', 'Acceptance'),
            ('you are welcome', 'Response to thanks'),
            ('my pleasure', 'Response to thanks'),
            ('i understand', 'Comprehension'),
            ('that makes sense', 'Agreement'),
            ('sounds good', 'Agreement'),
            ('i agree', 'Agreement'),
            ('i see', 'Understanding'),
            ('got it', 'Understanding'),
            ('sure', 'Agreement'),
            ('of course', 'Agreement'),
            ('certainly', 'Agreement'),
            ('absolutely', 'Strong agreement'),
            ('definitely', 'Strong agreement'),
        ]
    },
    
    'SENTENCES': {  # Order 9
        'title': 'Daily Sentences',
        'exercises': [
            ('i am fine thank you', 'Wellbeing response'),
            ('what is your name', 'Name question'),
            ('my name is', 'Name introduction'),
            ('where are you from', 'Origin question'),
            ('i am from', 'Origin statement'),
            ('how can i help you', 'Offering help'),
            ('please let me know', 'Information request'),
            ('i will get back to you', 'Future response'),
            ('thank you for your time', 'Time gratitude'),
            ('have a nice day', 'Day wish'),
            ('it was nice talking to you', 'Conversation end'),
            ('looking forward to hearing from you', 'Future contact'),
            ('please feel free to contact me', 'Contact invitation'),
            ('i hope this helps', 'Help offering'),
            ('let me check', 'Verification'),
            ('just a moment please', 'Wait request'),
            ('i will be right back', 'Brief absence'),
            ('how may i assist you', 'Help offering'),
            ('is there anything else', 'Additional help'),
            ('that would be great', 'Positive response'),
            ('sounds perfect', 'Agreement'),
            ('i completely understand', 'Empathy'),
            ('that is a good point', 'Agreement'),
            ('i had not thought of that', 'Realization'),
            ('you make a good point', 'Agreement'),
        ]
    },
    
    'LONG_SENTENCES': {  # Order 10
        'title': 'Long Sentences',
        'exercises': [
            ('i would appreciate it if you could send me the details by the end of the day', 'Detailed request'),
            ('could you please provide more information about the project timeline and deliverables', 'Information request'),
            ('i am writing to inform you that the meeting has been rescheduled to next week', 'Meeting update'),
            ('thank you for taking the time to discuss this matter with me yesterday afternoon', 'Discussion gratitude'),
            ('i wanted to follow up on our conversation regarding the new marketing strategy', 'Strategy follow-up'),
            ('please let me know if you have any questions or concerns about the proposal', 'Proposal inquiry'),
            ('i look forward to working with you on this exciting new project in the coming months', 'Future collaboration'),
            ('could you please confirm your availability for the conference call scheduled for tomorrow', 'Call confirmation'),
            ('i am pleased to announce that we have successfully completed the first phase of the project', 'Project announcement'),
            ('thank you for your patience and understanding during this transition period', 'Transition gratitude'),
            ('i would like to schedule a meeting to discuss the budget allocation for next quarter', 'Budget meeting'),
            ('please review the attached document and provide your feedback by friday', 'Document review'),
            ('i am confident that we can achieve our goals if we work together as a team', 'Team motivation'),
            ('could you please update me on the status of the client presentation', 'Status update'),
            ('i appreciate your dedication and hard work on this challenging assignment', 'Work appreciation'),
            ('please make sure to submit your reports before the deadline next monday', 'Deadline reminder'),
            ('i would like to congratulate you on your excellent performance this quarter', 'Performance congratulation'),
            ('could you please arrange a meeting with all the stakeholders next week', 'Stakeholder meeting'),
            ('i am writing to request your approval for the proposed changes to the project plan', 'Approval request'),
            ('thank you for bringing this important issue to my attention', 'Issue acknowledgment'),
            ('i will make sure to address your concerns in the upcoming meeting', 'Concern addressing'),
            ('please feel free to contact me if you need any further assistance', 'Assistance offer'),
            ('i would like to express my gratitude for your continued support and cooperation', 'Support gratitude'),
            ('could you please provide an update on the progress of the implementation phase', 'Implementation update'),
            ('i am looking forward to seeing the results of your hard work and dedication', 'Results anticipation'),
        ]
    },
}

def cleanup_and_populate():
    """Main function to clean and populate all lessons"""
    
    print("="*70)
    print("AUTOMATED FIREBASE CLEANUP + EXERCISE GENERATION")
    print("="*70)
    print()
    
    total_deleted = 0
    total_added = 0
    total_audio = 0
    
    for lesson_id, lesson_data in LESSON_EXERCISES.items():
        print(f"\n📚 Processing: {lesson_data['title']} ({lesson_id})")
        print("-" * 70)
        
        # Step 1: Delete ALL existing exercises for this lesson
        print("  🗑️  Deleting all existing exercises...")
        exercises_ref = db.collection('Exercises')
        existing = exercises_ref.where('lesson_id', '==', lesson_id).stream()
        
        deleted_count = 0
        for ex in existing:
            ex.reference.delete()
            deleted_count += 1
        
        total_deleted += deleted_count
        print(f"  ✓ Deleted {deleted_count} exercises")
        
        # Step 2: Add 25 new unique exercises
        print(f"  ➕ Adding 25 new exercises...")
        
        for order, (text, hint) in enumerate(lesson_data['exercises'], 1):
            # Add to Firebase Exercises collection
            exercises_ref.add({
                'text': text,
                'hint': hint,
                'lesson_id': lesson_id,  # Link to lesson
                'order': order,
                'exercise_id': f"{lesson_id}_{order}",
                'created_at': firestore.SERVER_TIMESTAMP
            })
            
            # Generate reference audio
            audio_path = tts.generate_audio(text, 'normal')
            if audio_path:
                total_audio += 1
                print(f"  [{order}/25] ✓ {text}")
            else:
                print(f"  [{order}/25] ✗ {text} (audio failed)")
        
        total_added += 25
        print(f"  ✓ Added 25 exercises with audio")
    
    # Summary
    print()
    print("="*70)
    print("SUMMARY")
    print("="*70)
    print(f"Lessons processed: {len(LESSON_EXERCISES)}")
    print(f"Total exercises deleted: {total_deleted}")
    print(f"Total exercises added: {total_added}")
    print(f"Total audio files generated: {total_audio}")
    print()
    print("✓ Firebase is now clean with 25 unique exercises per lesson!")
    print(f"✓ Reference audio saved to: {output_dir}")

if __name__ == '__main__':
    print("\n⚠️  WARNING: This will DELETE all existing exercises and replace with new ones!")
    print("Make sure you have a backup before proceeding.")
    print()
    
    response = input("Type 'YES' to continue: ")
    
    if response.strip().upper() == 'YES':
        cleanup_and_populate()
    else:
        print("Cancelled.")
