"""
Add 2 New Lessons: Business Phrases & Question Intonation
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

NEW_LESSONS = {
    'BUSINESS_PHRASES': {
        'title': 'Business Phrases',
        'order': 10,
        'exercises': [
            ('i would like to discuss the proposal', 'Proposal discussion'),
            ('could we schedule a meeting', 'Meeting request'),
            ('i will send you the details', 'Information sharing'),
            ('please review the attached document', 'Document review'),
            ('thank you for your cooperation', 'Gratitude'),
            ('i appreciate your feedback', 'Feedback acknowledgment'),
            ('let me get back to you on that', 'Follow-up promise'),
            ('i will look into this matter', 'Investigation promise'),
            ('we need to finalize the budget', 'Budget discussion'),
            ('the deadline is next friday', 'Deadline statement'),
            ('i have some concerns about this', 'Concern expression'),
            ('could you clarify your requirements', 'Clarification request'),
            ('we should prioritize this task', 'Priority suggestion'),
            ('i will coordinate with the team', 'Team coordination'),
            ('please confirm your availability', 'Availability check'),
            ('i need your approval on this', 'Approval request'),
            ('let me know if you have questions', 'Question invitation'),
            ('we are making good progress', 'Progress update'),
            ('i will update you by tomorrow', 'Update promise'),
            ('this requires immediate attention', 'Urgency statement'),
            ('i suggest we move forward', 'Suggestion'),
            ('we need to address this issue', 'Issue acknowledgment'),
            ('i will prepare the presentation', 'Task commitment'),
            ('please provide your input', 'Input request'),
            ('i look forward to your response', 'Response anticipation'),
        ]
    },
    
    'QUESTION_INTONATION': {
        'title': 'Question Intonation',
        'order': 11,
        'exercises': [
            ('what is your name', 'WH question - falling tone'),
            ('where are you from', 'WH question - falling tone'),
            ('when did you arrive', 'WH question - falling tone'),
            ('why did you choose this', 'WH question - falling tone'),
            ('how can i help you', 'WH question - falling tone'),
            ('are you ready', 'Yes/No question - rising tone'),
            ('do you understand', 'Yes/No question - rising tone'),
            ('can you hear me', 'Yes/No question - rising tone'),
            ('will you join us', 'Yes/No question - rising tone'),
            ('have you finished', 'Yes/No question - rising tone'),
            ('is this correct', 'Yes/No question - rising tone'),
            ('did you receive my email', 'Yes/No question - rising tone'),
            ('would you like some coffee', 'Yes/No question - rising tone'),
            ('should we start now', 'Yes/No question - rising tone'),
            ('may i ask a question', 'Yes/No question - rising tone'),
            ('you are coming tomorrow', 'Tag question - rising tone'),
            ('this is the right way', 'Tag question - rising tone'),
            ('you have the document', 'Tag question - rising tone'),
            ('we should leave now', 'Tag question - rising tone'),
            ('you understand the instructions', 'Tag question - rising tone'),
            ('what time is the meeting', 'WH question - falling tone'),
            ('where is the conference room', 'WH question - falling tone'),
            ('who is in charge of this project', 'WH question - falling tone'),
            ('which option do you prefer', 'WH question - falling tone'),
            ('how long will this take', 'WH question - falling tone'),
        ]
    },
}

def add_new_lessons():
    print("="*70)
    print("ADDING NEW LESSONS")
    print("="*70)
    
    lessons_ref = db.collection('Lessons')
    exercises_ref = db.collection('Exercises')
    
    total_added = 0
    total_audio = 0
    
    for lesson_id, lesson_data in NEW_LESSONS.items():
        print(f"\n📚 Adding: {lesson_data['title']} ({lesson_id})")
        print("-" * 70)
        
        # Add lesson to Lessons collection
        lessons_ref.add({
            'lesson_id': lesson_id,
            'title': lesson_data['title'],
            'category': 'Advanced',
            'level': 'Advanced',
            'difficulty': 3,
            'order': lesson_data['order'],
            'hint': f"Practice {lesson_data['title'].lower()}"
        })
        print(f"  ✓ Lesson added")
        
        # Add exercises
        print(f"  ➕ Adding 25 exercises...")
        
        for order, (text, hint) in enumerate(lesson_data['exercises'], 1):
            exercises_ref.add({
                'text': text,
                'hint': hint,
                'lesson_id': lesson_id,
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
    
    print()
    print("="*70)
    print("SUMMARY")
    print("="*70)
    print(f"New lessons added: {len(NEW_LESSONS)}")
    print(f"Total exercises added: {total_added}")
    print(f"Total audio files generated: {total_audio}")
    print()
    print("✓ You now have 11 lessons total!")

if __name__ == '__main__':
    add_new_lessons()
