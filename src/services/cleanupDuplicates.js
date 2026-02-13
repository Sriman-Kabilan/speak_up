import { collection, getDocs, writeBatch, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export const cleanupDuplicateAlphabetLessons = async () => {
  try {
    console.log('Starting duplicate cleanup...');
    
    // Find all Alphabet Sounds lessons
    const lessonsQuery = query(
      collection(db, 'Lessons'),
      where('title', '==', 'Alphabet Sounds'),
      orderBy('difficulty', 'asc')
    );
    
    const lessonsSnapshot = await getDocs(lessonsQuery);
    
    if (lessonsSnapshot.docs.length <= 1) {
      console.log('No duplicates found');
      return { success: true, message: 'No duplicates found' };
    }
    
    // Keep first (lowest difficulty), delete rest
    const toKeep = lessonsSnapshot.docs[0];
    const toDelete = lessonsSnapshot.docs.slice(1);
    
    console.log(`Found ${lessonsSnapshot.docs.length} Alphabet Sounds lessons`);
    console.log(`Keeping lesson_id: ${toKeep.data().lesson_id}`);
    
    // Delete duplicate lessons
    const batch = writeBatch(db);
    const deletedLessonIds = [];
    
    toDelete.forEach(doc => {
      deletedLessonIds.push(doc.data().lesson_id);
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${toDelete.length} duplicate lessons`);
    
    // Delete exercises for deleted lessons
    const exercisesQuery = query(collection(db, 'Exercises'));
    const exercisesSnapshot = await getDocs(exercisesQuery);
    
    const exercisesToDelete = exercisesSnapshot.docs.filter(doc => 
      deletedLessonIds.includes(doc.data().lesson_id)
    );
    
    if (exercisesToDelete.length > 0) {
      const exBatch = writeBatch(db);
      exercisesToDelete.forEach(doc => exBatch.delete(doc.ref));
      await exBatch.commit();
      console.log(`Deleted ${exercisesToDelete.length} exercises`);
    }
    
    console.log('✅ Duplicate Alphabet lesson removed successfully');
    return { success: true, message: 'Duplicate Alphabet lesson removed successfully' };
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return { success: false, error: error.message };
  }
};
