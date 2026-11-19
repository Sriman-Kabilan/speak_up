import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { subscribeToLessons } from '../services/lessonService';
import { getUserAttempts } from '../services/attemptService';
import { getCurrentUser } from '../services/authService';
import { isLessonFullyCompleted } from '../services/lessonCompletionService';
import LessonPathCard from '../components/LessonPathCard';

export default function LessonsScreen({ navigation }) {
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [fullyCompletedLessons, setFullyCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = true; // Set to true for admin/developer access

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const unsubscribe = subscribeToLessons(
        async (data) => {
          const sorted = data.sort((a, b) => (a.order || 0) - (b.order || 0));
          setLessons(sorted);
          
          const user = getCurrentUser();
          const userId = user ? user.uid : 'user_001';
          const attempts = await getUserAttempts(userId);
          const completed = [...new Set(attempts.map(a => a.lesson_id))];
          setCompletedLessons(completed);
          
          // Check which lessons are fully completed
          const fullyCompleted = [];
          for (const lesson of sorted) {
            const isFullyDone = await isLessonFullyCompleted(userId, lesson.lesson_id);
            if (isFullyDone) {
              fullyCompleted.push(lesson.lesson_id);
            }
          }
          setFullyCompletedLessons(fullyCompleted);
          
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const isLessonUnlocked = (lesson, index) => {
    if (isAdmin) return true; // Admin can access all lessons
    if (index === 0) return true;
    return completedLessons.includes(lessons[index - 1].lesson_id);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎯</Text>
        <Text style={styles.headerTitle}>Your Learning Journey</Text>
        <Text style={styles.headerSubtitle}>Master English pronunciation step by step</Text>
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>👑 Admin Mode</Text>
          </View>
        )}
      </View>

      <View style={styles.pathContainer}>
        {lessons.map((lesson, index) => (
          <LessonPathCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            isUnlocked={isLessonUnlocked(lesson, index)}
            isCompleted={fullyCompletedLessons.includes(lesson.lesson_id)}
            onPress={() => {
              if (isLessonUnlocked(lesson, index)) {
                navigation.navigate('Practice', { lesson });
              }
            }}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🎉 Complete all lessons to master pronunciation!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  adminText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pathContainer: {
    paddingTop: 30,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
