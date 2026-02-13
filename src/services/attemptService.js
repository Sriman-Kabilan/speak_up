import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const saveAttempt = async (attemptData) => {
  try {
    const docRef = await addDoc(collection(db, 'Attempts'), {
      ...attemptData,
      created_at: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserAttempts = async (userId) => {
  try {
    const q = query(
      collection(db, 'Attempts'),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return attempts.sort((a, b) => {
      const timeA = a.created_at?.toMillis() || 0;
      const timeB = b.created_at?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    throw error;
  }
};
