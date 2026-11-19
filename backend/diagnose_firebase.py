"""
Diagnose Firebase State
Check what's actually in Lessons and Exercises collections
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def diagnose():
    print("="*70)
    print("FIREBASE DIAGNOSTIC")
    print("="*70)
    
    # Check Lessons
    print("\n1. LESSONS COLLECTION:")
    print("-" * 70)
    lessons_ref = db.collection('Lessons')
    lessons = list(lessons_ref.order_by('order').stream())
    
    if not lessons:
        print("ERROR: No lessons found!")
    else:
        for lesson in lessons:
            data = lesson.to_dict()
            print(f"  lesson_id: {data.get('lesson_id')} | title: {data.get('title')} | order: {data.get('order')}")
    
    # Check Exercises
    print("\n2. EXERCISES COLLECTION:")
    print("-" * 70)
    exercises_ref = db.collection('Exercises')
    all_exercises = list(exercises_ref.limit(10).stream())
    
    if not all_exercises:
        print("ERROR: No exercises found!")
    else:
        print(f"Total exercises in collection: {len(list(exercises_ref.stream()))}")
        print("\nFirst 10 exercises:")
        for ex in all_exercises:
            data = ex.to_dict()
            print(f"  lesson_id: {data.get('lesson_id')} | text: {data.get('text')}")
    
    # Check exercises per lesson
    print("\n3. EXERCISES PER LESSON:")
    print("-" * 70)
    
    if lessons:
        for lesson in lessons:
            lesson_id = lesson.to_dict().get('lesson_id')
            count = len(list(exercises_ref.where('lesson_id', '==', lesson_id).stream()))
            print(f"  {lesson_id}: {count} exercises")
    
    # Check for LESSON_X pattern
    print("\n4. CHECKING FOR LESSON_X PATTERN:")
    print("-" * 70)
    for i in range(1, 11):
        script_id = f"LESSON_{i}"
        count = len(list(exercises_ref.where('lesson_id', '==', script_id).stream()))
        if count > 0:
            print(f"  {script_id}: {count} exercises (NEEDS FIXING)")

if __name__ == '__main__':
    diagnose()
