"""
Clean up wrongly added LESSON_2 exercises
Your existing exercises are fine - just need to remove the 25 LESSON_2 ones
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def cleanup():
    print("="*70)
    print("CLEANING UP WRONG EXERCISES")
    print("="*70)
    
    exercises_ref = db.collection('Exercises')
    
    # Delete LESSON_2 exercises
    wrong_exercises = list(exercises_ref.where('lesson_id', '==', 'LESSON_2').stream())
    
    print(f"\nFound {len(wrong_exercises)} exercises with wrong ID: LESSON_2")
    print("Deleting them...")
    
    for ex in wrong_exercises:
        ex.reference.delete()
        print(f"  Deleted: {ex.to_dict().get('text')}")
    
    print(f"\n✓ Deleted {len(wrong_exercises)} wrong exercises")
    print("✓ Your existing 450 exercises are intact!")
    print("\nYour lessons now have:")
    
    # Show final count
    lessons = ['SHORT_VOWELS', 'LONG_VOWELS', 'TH_SOUND', 'V_W', 'R_L', 
               'GREETINGS', 'WORKPLACE', 'SENTENCES', 'LONG_SENTENCES']
    
    for lesson_id in lessons:
        count = len(list(exercises_ref.where('lesson_id', '==', lesson_id).stream()))
        print(f"  {lesson_id}: {count} exercises")

if __name__ == '__main__':
    cleanup()
