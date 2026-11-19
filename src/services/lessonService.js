import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';
import { LOCAL_LESSONS } from '../data/localData';

export const subscribeToLessons = (callback, errorCallback) => {
  if (!db) {
    console.log('ℹ️ Firebase db unavailable. Using local fallback lessons.');
    callback(LOCAL_LESSONS);
    return () => {};
  }

  let hasResponded = false;

  // Timeout fallback in case Firestore connection hangs/stalls
  const timeoutId = setTimeout(() => {
    if (!hasResponded) {
      console.log('⏳ Firestore connection slow or offline. Providing local lessons fallback.');
      callback(LOCAL_LESSONS);
    }
  }, 3000);

  try {
    const q = query(collection(db, 'Lessons'));
    return onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(timeoutId);
        hasResponded = true;

        if (!snapshot || snapshot.empty || snapshot.docs.length === 0) {
          console.log('ℹ️ Firestore Lessons collection is empty. Using local fallback lessons.');
          callback(LOCAL_LESSONS);
          return;
        }

        const lessons = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        callback(lessons);
      },
      (error) => {
        clearTimeout(timeoutId);
        hasResponded = true;
        console.warn('⚠️ Firestore error in subscribeToLessons:', error.message);
        console.log('ℹ️ Falling back to local lessons.');
        callback(LOCAL_LESSONS);
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('⚠️ Exception in subscribeToLessons:', error.message);
    callback(LOCAL_LESSONS);
    return () => {};
  }
};
