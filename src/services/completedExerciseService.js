import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Local completed exercise storage for guest / offline mode
const localCompleted = new Set();

export const markExerciseCompleted = async (userId, lessonId, exerciseId) => {
  const completedId = `${userId}_${lessonId}_${exerciseId}`;
  localCompleted.add(completedId);

  if (!db || userId === 'guest_user') {
    return;
  }

  try {
    await setDoc(doc(db, 'completed_exercises', completedId), {
      user_id: userId,
      lesson_id: lessonId,
      exercise_id: exerciseId,
      completed_at: new Date()
    });
  } catch (error) {
    console.warn('⚠️ Could not sync completed exercise to Firestore:', error.message);
  }
};

export const isExerciseCompleted = async (userId, lessonId, exerciseId) => {
  const completedId = `${userId}_${lessonId}_${exerciseId}`;
  if (localCompleted.has(completedId)) {
    return true;
  }

  if (!db || userId === 'guest_user') {
    return false;
  }

  try {
    const docRef = doc(db, 'completed_exercises', completedId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    return localCompleted.has(completedId);
  }
};

export const getCompletedExercises = async (userId, lessonId) => {
  const prefix = `${userId}_${lessonId}_`;
  const localList = Array.from(localCompleted)
    .filter(key => key.startsWith(prefix))
    .map(key => key.replace(prefix, ''));

  if (!db || userId === 'guest_user') {
    return localList;
  }

  try {
    const q = query(
      collection(db, 'completed_exercises'),
      where('user_id', '==', userId),
      where('lesson_id', '==', lessonId)
    );
    const snapshot = await getDocs(q);
    const remoteList = snapshot.docs.map(doc => doc.data().exercise_id);
    return Array.from(new Set([...localList, ...remoteList]));
  } catch (error) {
    console.warn('⚠️ Error getting completed exercises from Firebase, using local:', error.message);
    return localList;
  }
};
