"""
Auto-Fix Lesson ID Mismatch
Automatically updates exercise lesson_ids to match Lessons collection
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def auto_fix_lesson_ids():
    print("="*70)
    print("AUTO-FIXING LESSON IDs")
    print("="*70)
    
    # Step 1: Get all lessons from Firebase
    lessons_ref = db.collection('Lessons')
    lessons = list(lessons_ref.order_by('order').stream())
    
    lesson_mapping = {}
    print("\nCurrent Lessons in Firebase:")
    print("-" * 70)
    
    for idx, lesson in enumerate(lessons, 1):
        data = lesson.to_dict()
        lesson_id = data.get('lesson_id')
        title = data.get('title')
        order = data.get('order', idx)
        
        print(f"{order}. {title} -> lesson_id: {lesson_id}")
        
        # Map LESSON_X to actual lesson_id
        lesson_mapping[f"LESSON_{order}"] = lesson_id
    
    print("\n" + "="*70)
    print("UPDATING EXERCISES")
    print("="*70)
    
    exercises_ref = db.collection('Exercises')
    total_updated = 0
    
    for script_id, actual_id in lesson_mapping.items():
        # Get exercises with wrong ID (LESSON_X)
        wrong_exercises = list(exercises_ref.where('lesson_id', '==', script_id).stream())
        
        if wrong_exercises:
            print(f"\nUpdating {len(wrong_exercises)} exercises: {script_id} -> {actual_id}")
            
            for ex in wrong_exercises:
                ex.reference.update({'lesson_id': actual_id})
                total_updated += 1
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"Total exercises updated: {total_updated}")
    print("✓ All exercises now use correct lesson_ids!")
    print("\nRefresh your browser to see the changes.")

if __name__ == '__main__':
    auto_fix_lesson_ids()
