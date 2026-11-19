"""
Check and Fix Lesson ID Mismatch
This script will:
1. Read your actual lesson_ids from Firebase Lessons collection
2. Update all exercises to use the correct lesson_ids
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def check_and_fix_lesson_ids():
    print("="*70)
    print("CHECKING LESSON IDs")
    print("="*70)
    
    # Step 1: Get all lessons from Firebase
    lessons_ref = db.collection('Lessons')
    lessons = lessons_ref.order_by('order').stream()
    
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
    print("LESSON ID MAPPING")
    print("="*70)
    
    for script_id, actual_id in lesson_mapping.items():
        print(f"{script_id} -> {actual_id}")
    
    # Step 2: Check if exercises exist with wrong IDs
    print("\n" + "="*70)
    print("CHECKING EXERCISES")
    print("="*70)
    
    exercises_ref = db.collection('Exercises')
    
    for script_id, actual_id in lesson_mapping.items():
        # Check exercises with script ID (LESSON_X)
        wrong_exercises = exercises_ref.where('lesson_id', '==', script_id).stream()
        wrong_count = 0
        
        for ex in wrong_exercises:
            wrong_count += 1
        
        if wrong_count > 0:
            print(f"\nFound {wrong_count} exercises with wrong ID: {script_id}")
            print(f"Need to update to: {actual_id}")
    
    # Step 3: Ask user to fix
    print("\n" + "="*70)
    print("FIX OPTION")
    print("="*70)
    print("Do you want to update all exercise lesson_ids to match your Lessons collection?")
    print("This will update exercises from LESSON_1, LESSON_2... to your actual IDs")
    
    response = input("\nType 'YES' to fix: ")
    
    if response.strip().upper() == 'YES':
        print("\nUpdating exercises...")
        
        total_updated = 0
        
        for script_id, actual_id in lesson_mapping.items():
            # Get exercises with wrong ID
            wrong_exercises = exercises_ref.where('lesson_id', '==', script_id).stream()
            
            for ex in wrong_exercises:
                # Update lesson_id
                ex.reference.update({'lesson_id': actual_id})
                total_updated += 1
                print(f"Updated exercise: {ex.id} -> lesson_id: {actual_id}")
        
        print(f"\n✓ Updated {total_updated} exercises")
        print("✓ All exercises now use correct lesson_ids!")
        print("\nRefresh your app to see the changes.")
    else:
        print("Cancelled.")

if __name__ == '__main__':
    check_and_fix_lesson_ids()
