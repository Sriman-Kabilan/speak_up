import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Local storage cache for attempts (used in guest/offline mode)
const localAttempts = [];

export const saveAttempt = async (attemptData) => {
  const localAttempt = {
    id: 'local_' + Date.now(),
    user_id: attemptData.userId || attemptData.user_id || 'guest_user',
    lesson_id: attemptData.lessonId || attemptData.lesson_id,
    exercise_id: attemptData.exerciseId || attemptData.exercise_id,
    score: attemptData.score,
    total_dtw_distance: attemptData.totalDtwDistance || attemptData.total_dtw_distance || 0,
    normalized_dtw_distance: attemptData.normalizedDtwDistance || attemptData.normalized_dtw_distance || 0,
    phoneme_error_map: attemptData.phonemeErrorMap || attemptData.phoneme_error_map || {},
    pitch_deviation_score: attemptData.pitchDeviationScore || attemptData.pitch_deviation_score || 0,
    confidence_level: attemptData.confidenceLevel || attemptData.confidence_level || 'medium',
    retry_count: attemptData.retryCount || attemptData.retry_count || 0,
    audio_quality: attemptData.audioQuality || attemptData.audio_quality || {},
    incorrect_phonemes: attemptData.incorrectPhonemes || attemptData.incorrect_phonemes || [],
    algorithm_version: attemptData.algorithmVersion || attemptData.algorithm_version || '2.0-research-grade',
    created_at: new Date()
  };

  localAttempts.unshift(localAttempt);

  if (!db || localAttempt.user_id === 'guest_user') {
    console.log('ℹ️ Saved attempt locally for guest/offline mode');
    return localAttempt.id;
  }

  try {
    const docRef = await addDoc(collection(db, 'Attempts'), {
      ...localAttempt,
      created_at: serverTimestamp()
    });
    console.log('✅ Attempt saved to Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.warn('⚠️ Firebase save attempt error, saved in local store:', error.message);
    return localAttempt.id;
  }
};

export const getUserAttempts = async (userId) => {
  const localUserAttempts = localAttempts.filter(a => a.user_id === userId);

  if (!db || userId === 'guest_user') {
    return localUserAttempts;
  }

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

    if (attempts.length === 0) {
      return localUserAttempts;
    }

    return attempts.sort((a, b) => {
      const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
      const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    console.warn('⚠️ Error fetching attempts from Firebase, using local attempts:', error.message);
    return localUserAttempts;
  }
};
