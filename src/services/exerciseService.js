import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { getLocalExercises } from '../data/localData';

export const getExercisesByLesson = async (lessonId) => {
  const localFallback = getLocalExercises(lessonId);

  if (!db) {
    console.log(`ℹ️ Firebase db unavailable. Returning ${localFallback.length} local exercises for ${lessonId}`);
    return localFallback;
  }

  try {
    const q = query(
      collection(db, 'Exercises'),
      where('lesson_id', '==', lessonId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot || snapshot.empty || snapshot.docs.length === 0) {
      console.log(`ℹ️ Firestore returned 0 exercises for ${lessonId}. Using local fallback (${localFallback.length} exercises).`);
      return localFallback;
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.warn(`⚠️ Error fetching exercises from Firestore for ${lessonId}:`, error.message);
    console.log(`ℹ️ Returning local exercises fallback (${localFallback.length} exercises).`);
    return localFallback;
  }
};
