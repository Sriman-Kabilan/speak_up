import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const getExercisesByLesson = async (lessonId) => {
  try {
    const q = query(
      collection(db, 'Exercises'),
      where('lesson_id', '==', lessonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};
