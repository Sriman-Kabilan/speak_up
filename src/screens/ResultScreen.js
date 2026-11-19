import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Button from '../components/Button';
import { saveAttempt } from '../services/attemptService';
import { getCurrentUser } from '../services/authService';
import { markExerciseCompleted, isExerciseCompleted } from '../services/completedExerciseService';

export default function ResultScreen({ route, navigation }) {
  const { lesson, exercise, evaluationResult, isLastExercise = true, nextIndex, exercises, attemptCount = 0 } = route.params;
  const [saving, setSaving] = useState(false);

  // NO DUMMY SCORING - Use real evaluation result only
  const accuracy = evaluationResult?.score ?? 0;
  
  if (!evaluationResult) {
    console.error('❌ No evaluation result provided to ResultScreen');
  }
  const user = getCurrentUser();
  const userId = user ? user.uid : 'user_001';

  const getFeedback = () => {
    if (accuracy >= 90) return '🎉 Excellent! Perfect pronunciation!';
    if (accuracy >= 80) return '👍 Great job! Keep practicing!';
    if (accuracy >= 70) return '👌 Good effort! Try again for better score!';
    return '💪 Keep practicing! You\'ll improve!';
  };

  const handleSaveAttempt = async () => {
    setSaving(true);
    try {
      // Check if already completed
      const alreadyCompleted = await isExerciseCompleted(userId, lesson.lesson_id, exercise?.id || 'unknown');
      
      if (!alreadyCompleted) {
        // Save attempt with research-grade evaluation data
        const phonemeErrorMap = {};
        if (evaluationResult?.incorrectPhonemes) {
          evaluationResult.incorrectPhonemes.forEach(p => {
            phonemeErrorMap[p.phoneme] = {
              score: p.score,
              severity: p.severity,
              distance: p.distance
            };
          });
        }

        await saveAttempt({
          user_id: userId,
          lesson_id: lesson.lesson_id,
          exercise_id: exercise?.id || 'unknown',
          score: accuracy,
          total_dtw_distance: evaluationResult?.distance || 0,
          normalized_dtw_distance: evaluationResult?.normalizedDtwDistance || 0,
          phoneme_error_map: phonemeErrorMap,
          pitch_deviation_score: evaluationResult?.pitchDeviationScore || 0,
          confidence_level: evaluationResult?.confidenceLevel || 'medium',
          retry_count: attemptCount || 0,
          audio_quality: evaluationResult?.audioQuality || {},
          incorrect_phonemes: evaluationResult?.incorrectPhonemes || [],
          algorithm_version: evaluationResult?.algorithmVersion || '2.0-research-grade'
        });
        
        // Mark as completed
        await markExerciseCompleted(userId, lesson.lesson_id, exercise?.id || 'unknown');
      }
      
      if (isLastExercise) {
        navigation.navigate('Progress');
      } else {
        navigation.replace('PracticeExercise', { 
          lesson, 
          exercises, 
          startIndex: nextIndex 
        });
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
      setSaving(false);
    }
  };

  const handleTryAgain = () => {
    navigation.replace('PracticeExercise', { 
      lesson, 
      exercises, 
      startIndex: isLastExercise ? exercises.length - 1 : nextIndex - 1
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.scoreCircle}>
          <Text style={styles.accuracy}>{accuracy}%</Text>
        </View>
        
        <Text style={styles.title}>{exercise?.text || lesson.title}</Text>
        <Text style={styles.feedback}>{getFeedback()}</Text>
        
        {/* Phoneme Breakdown */}
        {evaluationResult?.phoneme_segments && evaluationResult.phoneme_segments.length > 0 && (
          <View style={styles.phonemeCard}>
            <Text style={styles.phonemeTitle}>📊 Phoneme Analysis</Text>
            <Text style={styles.phonemeSubtitle}>Individual sound scores:</Text>
            {evaluationResult.phoneme_segments.map((phoneme, index) => (
              <View key={index} style={styles.phonemeRow}>
                <Text style={styles.phonemeLabel}>{phoneme.readable || phoneme.phoneme}</Text>
                <View style={styles.phonemeScoreContainer}>
                  <View style={[
                    styles.phonemeBar,
                    { width: `${phoneme.score}%` },
                    phoneme.score >= 70 ? styles.phonemeGood : 
                    phoneme.score >= 50 ? styles.phonemeWarning : 
                    styles.phonemeBad
                  ]} />
                  <Text style={styles.phonemeScore}>{phoneme.score}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Incorrect Phonemes Highlight */}
        {evaluationResult?.incorrectPhonemes && evaluationResult.incorrectPhonemes.length > 0 && (
          <View style={styles.incorrectCard}>
            <Text style={styles.incorrectTitle}>⚠️ Needs Improvement</Text>
            {evaluationResult.incorrectPhonemes.map((phoneme, index) => (
              <View key={index} style={styles.incorrectRow}>
                <Text style={styles.incorrectPhoneme}>{phoneme.readableLabel || phoneme.phoneme}</Text>
                <Text style={styles.incorrectScore}>Score: {phoneme.score}%</Text>
              </View>
            ))}
            <Text style={styles.incorrectHint}>{evaluationResult.feedbackText}</Text>
          </View>
        )}
        
        <View style={styles.detailsCard}>
          <Text style={styles.detailLabel}>Lesson Category</Text>
          <Text style={styles.detailValue}>{lesson.category}</Text>
          <Text style={styles.detailLabel}>Difficulty Level</Text>
          <Text style={styles.detailValue}>{lesson.level}</Text>
        </View>
        
        {saving ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              title={isLastExercise ? "View My Progress" : "Next Exercise"}
              onPress={handleSaveAttempt}
              style={styles.button}
            />
            <Button
              title="Try Again"
              onPress={handleTryAgain}
              variant="secondary"
              style={styles.button}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    borderWidth: 8,
    borderColor: '#4caf50',
  },
  accuracy: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  feedback: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    elevation: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
  },
  phonemeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    elevation: 3,
  },
  phonemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  phonemeSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
  },
  phonemeRow: {
    marginBottom: 12,
  },
  phonemeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  phonemeScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonemeBar: {
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  phonemeGood: {
    backgroundColor: '#4caf50',
  },
  phonemeWarning: {
    backgroundColor: '#ff9800',
  },
  phonemeBad: {
    backgroundColor: '#f44336',
  },
  phonemeScore: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  incorrectCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  incorrectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 10,
  },
  incorrectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  incorrectPhoneme: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d84315',
  },
  incorrectScore: {
    fontSize: 14,
    color: '#666',
  },
  incorrectHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
