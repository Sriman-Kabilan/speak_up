import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';

export const subscribeToLessons = (callback, errorCallback) => {
  const q = query(collection(db, 'Lessons'));
  return onSnapshot(q, 
    (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(lessons);
    },
    (error) => {
      errorCallback(error);
    }
  );
};
