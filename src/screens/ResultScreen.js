import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Button from '../components/Button';
import { saveAttempt } from '../services/attemptService';

export default function ResultScreen({ route, navigation }) {
  const { lesson, spokenText = 'Sample recording' } = route.params;
  const [saving, setSaving] = useState(false);

  // Simulate accuracy calculation (replace with real AI scoring later)
  const calculateAccuracy = () => {
    return Math.floor(Math.random() * (95 - 70 + 1)) + 70; // Random 70-95%
  };

  const accuracy = calculateAccuracy();
  const userId = 'user_001'; // Replace with actual user ID from auth

  const getFeedback = () => {
    if (accuracy >= 90) return '🎉 Excellent! Perfect pronunciation!';
    if (accuracy >= 80) return '👍 Great job! Keep practicing!';
    if (accuracy >= 70) return '👌 Good effort! Try again for better score!';
    return '💪 Keep practicing! You\'ll improve!';
  };

  const handleSaveAttempt = async () => {
    setSaving(true);
    try {
      await saveAttempt({
        user_id: userId,
        lesson_id: lesson.lesson_id,
        spoken_text: spokenText,
        accuracy: accuracy
      });
      navigation.navigate('Progress');
    } catch (error) {
      console.error('Error saving attempt:', error);
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.scoreCircle}>
          <Text style={styles.accuracy}>{accuracy}%</Text>
        </View>
        
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.feedback}>{getFeedback()}</Text>
        
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
              title="View My Progress"
              onPress={handleSaveAttempt}
              style={styles.button}
            />
            <Button
              title="Try Again"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.button}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
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
});
