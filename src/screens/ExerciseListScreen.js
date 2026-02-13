import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { getExercisesByLesson } from '../services/exerciseService';

const { width } = Dimensions.get('window');
const numColumns = width > 600 ? 4 : 3;

export default function ExerciseListScreen({ route, navigation }) {
  const { lesson } = route.params;
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await getExercisesByLesson(lesson.lesson_id);
      setExercises(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.subtitle}>{exercises.length} exercises</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {exercises.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            style={[styles.exerciseCard, { width: `${100 / numColumns - 4}%` }]}
            onPress={() => navigation.navigate('PracticeExercise', { lesson, exercises, startIndex: index })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <Text style={styles.exerciseNumber}>#{index + 1}</Text>
            </View>
            <View style={styles.cardCenter}>
              <Text style={styles.exerciseText} numberOfLines={2}>{exercise.text}</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  exerciseCard: {
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTop: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  exerciseNumber: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardBottom: {
    padding: 8,
    alignItems: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 2,
  },
});
