import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@pronunciation_progress';

export class ProgressTracker {
  async saveEvaluation(exerciseId, text, result) {
    try {
      const progress = await this.getProgress();
      
      const evaluation = {
        exerciseId,
        text,
        score: result.score,
        timestamp: new Date().toISOString(),
        errors: result.incorrectPhonemes?.map(p => p.phoneme) || [],
        qualityScore: result.breakdown?.quality_score || 0,
        phonemeScore: result.breakdown?.phoneme_score || 0
      };
      
      // Add to history
      if (!progress.history) progress.history = [];
      progress.history.push(evaluation);
      
      // Update exercise stats
      if (!progress.exercises) progress.exercises = {};
      if (!progress.exercises[exerciseId]) {
        progress.exercises[exerciseId] = {
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          lastAttempt: null
        };
      }
      
      const exerciseStats = progress.exercises[exerciseId];
      exerciseStats.attempts++;
      exerciseStats.bestScore = Math.max(exerciseStats.bestScore, result.score);
      exerciseStats.lastAttempt = evaluation.timestamp;
      
      // Calculate average
      const exerciseHistory = progress.history.filter(h => h.exerciseId === exerciseId);
      exerciseStats.averageScore = Math.round(
        exerciseHistory.reduce((sum, h) => sum + h.score, 0) / exerciseHistory.length
      );
      
      // Track problem phonemes
      if (!progress.problemPhonemes) progress.problemPhonemes = {};
      result.incorrectPhonemes?.forEach(p => {
        const phoneme = p.phoneme;
        if (!progress.problemPhonemes[phoneme]) {
          progress.problemPhonemes[phoneme] = { count: 0, lastSeen: null };
        }
        progress.problemPhonemes[phoneme].count++;
        progress.problemPhonemes[phoneme].lastSeen = evaluation.timestamp;
      });
      
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      console.log('✅ Progress saved:', exerciseId, result.score);
      
      return progress;
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
      return null;
    }
  }
  
  async getProgress() {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      return data ? JSON.parse(data) : { history: [], exercises: {}, problemPhonemes: {} };
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
      return { history: [], exercises: {}, problemPhonemes: {} };
    }
  }
  
  async getExerciseStats(exerciseId) {
    const progress = await this.getProgress();
    return progress.exercises?.[exerciseId] || null;
  }
  
  async getProblemPhonemes() {
    const progress = await this.getProgress();
    const phonemes = progress.problemPhonemes || {};
    
    // Sort by count (most problematic first)
    return Object.entries(phonemes)
      .map(([phoneme, data]) => ({ phoneme, ...data }))
      .sort((a, b) => b.count - a.count);
  }
  
  async getRecentHistory(limit = 10) {
    const progress = await this.getProgress();
    return (progress.history || [])
      .slice(-limit)
      .reverse();
  }
  
  async clearProgress() {
    try {
      await AsyncStorage.removeItem(PROGRESS_KEY);
      console.log('✅ Progress cleared');
    } catch (error) {
      console.error('❌ Failed to clear progress:', error);
    }
  }
}
