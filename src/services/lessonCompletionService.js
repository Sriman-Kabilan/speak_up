import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { getExercisesByLesson } from './exerciseService';
import { getCompletedExercises } from './completedExerciseService';

export const isLessonFullyCompleted = async (userId, lessonId) => {
  try {
    // Get all exercises for this lesson
    const exercises = await getExercisesByLesson(lessonId);
    
    // Get completed exercises for this user and lesson
    const completedExerciseIds = await getCompletedExercises(userId, lessonId);
    
    // Check if all exercises are completed
    return exercises.length > 0 && exercises.every(ex => completedExerciseIds.includes(ex.id));
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return false;
  }
};

export const getCompletedLessonsCount = async (userId) => {
  if (!db || userId === 'guest_user') {
    return 0;
  }

  try {
    const q = query(
      collection(db, 'completed_exercises'),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    // Group by lesson_id
    const lessonExercises = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!lessonExercises[data.lesson_id]) {
        lessonExercises[data.lesson_id] = [];
      }
      lessonExercises[data.lesson_id].push(data.exercise_id);
    });
    
    // Count lessons with at least one completed exercise
    return Object.keys(lessonExercises).length;
  } catch (error) {
    console.warn('Error getting completed lessons count:', error.message);
    return 0;
  }
};
