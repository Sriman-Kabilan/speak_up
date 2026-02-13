import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getUserAttempts } from '../services/attemptService';

export default function ProgressScreen() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userId = 'user_001';
  const userName = 'John Doe';

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await getUserAttempts(userId);
      setAttempts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStats = () => {
    if (attempts.length === 0) return { total: 0, avgAccuracy: 0, bestScore: 0, streak: 0, uniqueLessons: 0 };
    
    const total = attempts.length;
    const avgAccuracy = Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / total);
    const bestScore = Math.max(...attempts.map(a => a.accuracy));
    
    // Calculate real streak
    const streak = calculateStreak(attempts);
    
    // Count unique lessons
    const uniqueLessons = new Set(attempts.map(a => a.lesson_id)).size;
    
    return { total, avgAccuracy, bestScore, streak, uniqueLessons };
  };

  const calculateStreak = (attempts) => {
    if (attempts.length === 0) return 0;
    
    const dates = attempts.map(a => {
      const date = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
      return date.toDateString();
    });
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (uniqueDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getAchievements = () => {
    return [
      {
        id: 1,
        emoji: '🌟',
        name: 'First Step',
        unlocked: stats.total >= 1,
        description: 'Complete your first lesson'
      },
      {
        id: 2,
        emoji: '🏆',
        name: '5 Lessons',
        unlocked: stats.total >= 5,
        description: 'Complete 5 lessons'
      },
      {
        id: 3,
        emoji: '💎',
        name: 'Perfect Score',
        unlocked: stats.bestScore >= 90,
        description: 'Score 90% or higher'
      },
      {
        id: 4,
        emoji: '🔥',
        name: 'Week Streak',
        unlocked: stats.streak >= 7,
        description: 'Practice 7 days in a row'
      },
      {
        id: 5,
        emoji: '🎯',
        name: 'Sharpshooter',
        unlocked: stats.avgAccuracy >= 85,
        description: 'Maintain 85% average accuracy'
      },
      {
        id: 6,
        emoji: '📚',
        name: 'Scholar',
        unlocked: stats.total >= 20,
        description: 'Complete 20 lessons'
      },
      {
        id: 7,
        emoji: '⚡',
        name: 'Speed Learner',
        unlocked: stats.uniqueLessons >= 10,
        description: 'Try 10 different lessons'
      },
      {
        id: 8,
        emoji: '👑',
        name: 'Master',
        unlocked: stats.total >= 50 && stats.avgAccuracy >= 80,
        description: 'Complete 50 lessons with 80% accuracy'
      },
    ];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderAttempt = ({ item, index }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyLeft}>
        <View style={[styles.miniCircle, { backgroundColor: item.accuracy >= 80 ? '#4caf50' : item.accuracy >= 60 ? '#ff9800' : '#f44336' }]}>
          <Text style={styles.miniScore}>{item.accuracy}%</Text>
        </View>
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyLesson}>{item.lesson_id}</Text>
        <Text style={styles.historyTime}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.xpText}>+{Math.floor(item.accuracy / 10)} XP</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const stats = getStats();
  const achievements = getAchievements();

  if (attempts.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userLevel}>Level 1 • Beginner</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Start Your Journey!</Text>
          <Text style={styles.emptySubtext}>Complete lessons to track your progress</Text>
        </View>
      </ScrollView>
    );
  }

  const level = Math.floor(stats.total / 5) + 1;
  const xpToNextLevel = ((level * 5) - stats.total) * 10;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userLevel}>Level {level} • {stats.avgAccuracy >= 80 ? 'Advanced' : stats.avgAccuracy >= 60 ? 'Intermediate' : 'Beginner'}</Text>
        
        <View style={styles.xpBar}>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${((stats.total % 5) / 5) * 100}%` }]} />
          </View>
          <Text style={styles.xpLabel}>{xpToNextLevel} XP to Level {level + 1}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>🔥</Text>
          </View>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>⚡</Text>
          </View>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>🎯</Text>
          </View>
          <Text style={styles.statValue}>{stats.avgAccuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map(achievement => (
            <View key={achievement.id} style={[styles.badge, achievement.unlocked && styles.badgeUnlocked]}>
              <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
              <Text style={styles.badgeName}>{achievement.name}</Text>
              {achievement.unlocked && <Text style={styles.badgeCheck}>✓</Text>}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <FlatList
          data={attempts.slice(0, 10)}
          keyExtractor={(item) => item.id}
          renderItem={renderAttempt}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: '#2196F3',
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 48,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  xpBar: {
    width: '80%',
    marginTop: 20,
  },
  xpTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  xpLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -20,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  achievementsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    opacity: 0.4,
    position: 'relative',
  },
  badgeUnlocked: {
    opacity: 1,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  badgeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: '#2196F3',
  },
  historySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  historyLeft: {
    marginRight: 16,
  },
  miniCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyContent: {
    flex: 1,
  },
  historyLesson: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
  },
});
