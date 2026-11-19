"""
Firebase Exercise Auditor
Finds duplicate exercises and generates cleanup script
"""

import firebase_admin
from firebase_admin import credentials, firestore
from collections import defaultdict
import json

# Initialize Firebase Admin
try:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": "speakup-cbe48",
        "private_key_id": "YOUR_PRIVATE_KEY_ID",
        "private_key": "YOUR_PRIVATE_KEY",
        "client_email": "YOUR_CLIENT_EMAIL",
        "client_id": "YOUR_CLIENT_ID",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "YOUR_CERT_URL"
    })
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✓ Connected to Firebase")
except Exception as e:
    print(f"✗ Firebase connection failed: {e}")
    print("\nTo use this script:")
    print("1. Go to Firebase Console > Project Settings > Service Accounts")
    print("2. Click 'Generate New Private Key'")
    print("3. Save the JSON file")
    print("4. Update the credentials in this script")
    exit(1)

def audit_exercises():
    """Find duplicate exercises in all lessons"""
    
    print("\n" + "="*60)
    print("FIREBASE EXERCISE AUDIT")
    print("="*60)
    
    lessons = db.collection('Lessons').stream()
    
    total_lessons = 0
    total_exercises = 0
    total_duplicates = 0
    duplicates_by_lesson = {}
    all_exercises = []
    
    for lesson in lessons:
        total_lessons += 1
        lesson_id = lesson.id
        lesson_data = lesson.to_dict()
        lesson_title = lesson_data.get('title', 'Unknown')
        
        print(f"\n📚 Lesson: {lesson_title} ({lesson_id})")
        
        exercises = db.collection('Lessons').document(lesson_id).collection('Exercises').stream()
        
        # Track exercises by text
        exercise_map = defaultdict(list)
        
        for exercise in exercises:
            total_exercises += 1
            exercise_id = exercise.id
            data = exercise.to_dict()
            text = data.get('text', '').strip().lower()
            
            if text:
                exercise_map[text].append({
                    'id': exercise_id,
                    'data': data,
                    'lesson_id': lesson_id,
                    'lesson_title': lesson_title
                })
                
                all_exercises.append({
                    'lesson_id': lesson_id,
                    'lesson_title': lesson_title,
                    'exercise_id': exercise_id,
                    'text': text,
                    'hint': data.get('hint', ''),
                    'phonemes': data.get('phonemes', [])
                })
        
        # Find duplicates in this lesson
        lesson_duplicates = []
        for text, exercises_list in exercise_map.items():
            if len(exercises_list) > 1:
                total_duplicates += len(exercises_list) - 1
                lesson_duplicates.append({
                    'text': text,
                    'count': len(exercises_list),
                    'exercises': exercises_list
                })
                print(f"  ⚠️  DUPLICATE: '{text}' appears {len(exercises_list)} times")
        
        if lesson_duplicates:
            duplicates_by_lesson[lesson_id] = {
                'title': lesson_title,
                'duplicates': lesson_duplicates
            }
        else:
            print(f"  ✓ No duplicates")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total Lessons: {total_lessons}")
    print(f"Total Exercises: {total_exercises}")
    print(f"Duplicate Exercises: {total_duplicates}")
    print(f"Lessons with Duplicates: {len(duplicates_by_lesson)}")
    
    # Save reports
    with open('firebase_audit_report.json', 'w') as f:
        json.dump({
            'summary': {
                'total_lessons': total_lessons,
                'total_exercises': total_exercises,
                'total_duplicates': total_duplicates
            },
            'duplicates': duplicates_by_lesson,
            'all_exercises': all_exercises
        }, f, indent=2)
    
    print(f"\n✓ Full report saved to: firebase_audit_report.json")
    
    # Generate cleanup script
    generate_cleanup_script(duplicates_by_lesson)
    
    return duplicates_by_lesson

def generate_cleanup_script(duplicates_by_lesson):
    """Generate JavaScript cleanup script for Firebase Console"""
    
    script_lines = [
        "// Firebase Cleanup Script",
        "// Run this in Firebase Console > Firestore > Query",
        "// Or use Firebase Admin SDK",
        "",
        "const admin = require('firebase-admin');",
        "const db = admin.firestore();",
        "",
        "async function cleanupDuplicates() {",
        "  console.log('Starting cleanup...');",
        "  let deleted = 0;",
        ""
    ]
    
    for lesson_id, lesson_info in duplicates_by_lesson.items():
        script_lines.append(f"  // Lesson: {lesson_info['title']}")
        
        for dup in lesson_info['duplicates']:
            text = dup['text']
            exercises = dup['exercises']
            
            # Keep first, delete rest
            script_lines.append(f"  // Keep first '{text}', delete {len(exercises)-1} duplicates")
            
            for i, ex in enumerate(exercises[1:], 1):  # Skip first
                script_lines.append(
                    f"  await db.collection('Lessons').doc('{lesson_id}').collection('Exercises').doc('{ex['id']}').delete();"
                )
                script_lines.append(f"  deleted++;")
                script_lines.append(f"  console.log('Deleted duplicate {i}: {text}');")
            
            script_lines.append("")
    
    script_lines.extend([
        "  console.log(`Cleanup complete! Deleted ${deleted} duplicates`);",
        "}",
        "",
        "cleanupDuplicates();"
    ])
    
    with open('firebase_cleanup_script.js', 'w') as f:
        f.write('\n'.join(script_lines))
    
    print(f"✓ Cleanup script saved to: firebase_cleanup_script.js")

if __name__ == '__main__':
    audit_exercises()
