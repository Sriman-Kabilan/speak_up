import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { getCurrentUser, getUserData, logout } from '../services/authService';
import { getUserAttempts } from '../services/attemptService';
import { ProgressTracker } from '../services/progressTracker';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ 
    totalLessons: 0, totalExercises: 0, avgScore: 0, bestScore: 0, worstScore: 100,
    practiceTime: 0, streak: 0, longestStreak: 0, completedLessons: 0,
    totalPracticeMinutes: 0, thisWeekExercises: 0, thisMonthExercises: 0,
    improvementRate: 0, consistency: 0, perfectScores: 0, retryCount: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [problemPhonemes, setProblemPhonemes] = useState([]);
  const [strongPhonemes, setStrongPhonemes] = useState([]);
  const [recentTrend, setRecentTrend] = useState('stable');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        navigation.replace('SignIn');
        return;
      }

      const data = await getUserData(user.uid);
      setUserData(data);

      const attempts = await getUserAttempts(user.uid);
      const uniqueLessons = new Set(attempts.map(a => a.lesson_id)).size;
      const totalExercises = attempts.length;
      
      const scores = attempts.map(a => a.score || a.accuracy || 0);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const worstScore = scores.length > 0 ? Math.min(...scores) : 0;
      const perfectScores = scores.filter(s => s >= 95).length;
      
      const practiceTime = Math.round((totalExercises * 0.5) / 60);
      const totalPracticeMinutes = Math.round(totalExercises * 0.5);
      
      const { currentStreak, longestStreak } = calculateStreaks(attempts);
      const thisWeekExercises = getThisWeekCount(attempts);
      const thisMonthExercises = getThisMonthCount(attempts);
      const retryCount = attempts.filter(a => (a.retry_count || 0) > 0).length;
      
      const lessonScores = {};
      attempts.forEach(a => {
        if (!lessonScores[a.lesson_id]) lessonScores[a.lesson_id] = [];
        lessonScores[a.lesson_id].push(a.score || a.accuracy || 0);
      });
      const completedLessons = Object.values(lessonScores).filter(scores => {
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        return avg >= 80;
      }).length;

      const improvementRate = calculateImprovement(attempts);
      const consistency = calculateConsistency(attempts);
      const trend = calculateTrend(attempts);

      setStats({ 
        totalLessons: uniqueLessons, totalExercises, avgScore, bestScore, worstScore,
        practiceTime, streak: currentStreak, longestStreak, completedLessons,
        totalPracticeMinutes, thisWeekExercises, thisMonthExercises,
        improvementRate, consistency, perfectScores, retryCount
      });
      
      setRecentTrend(trend);
      
      const earnedAchievements = calculateAchievements(totalExercises, bestScore, currentStreak, completedLessons, perfectScores, longestStreak);
      setAchievements(earnedAchievements);
      
      const progressTracker = new ProgressTracker();
      const phonemes = await progressTracker.getProblemPhonemes();
      setProblemPhonemes(phonemes.slice(0, 5));
      
      const strong = phonemes.filter(p => p.count <= 2).slice(0, 3);
      setStrongPhonemes(strong);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  const calculateStreaks = (attempts) => {
    if (attempts.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const dates = attempts.map(a => {
      const timestamp = a.created_at?.toMillis ? a.created_at.toMillis() : Date.now();
      return new Date(timestamp).toDateString();
    });
    
    const uniqueDates = [...new Set(dates)].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - (uniqueDates.length - 1 - i));
      if (uniqueDates[i] === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
  };
  
  const getThisWeekCount = (attempts) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return attempts.filter(a => {
      const timestamp = a.created_at?.toMillis ? a.created_at.toMillis() : Date.now();
      return timestamp >= weekAgo.getTime();
    }).length;
  };
  
  const getThisMonthCount = (attempts) => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return attempts.filter(a => {
      const timestamp = a.created_at?.toMillis ? a.created_at.toMillis() : Date.now();
      return timestamp >= monthAgo.getTime();
    }).length;
  };
  
  const calculateImprovement = (attempts) => {
    if (attempts.length < 10) return 0;
    
    const sorted = [...attempts].sort((a, b) => {
      const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
      const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
      return timeA - timeB;
    });
    
    const first10 = sorted.slice(0, 10).map(a => a.score || a.accuracy || 0);
    const last10 = sorted.slice(-10).map(a => a.score || a.accuracy || 0);
    
    const firstAvg = first10.reduce((sum, s) => sum + s, 0) / first10.length;
    const lastAvg = last10.reduce((sum, s) => sum + s, 0) / last10.length;
    
    return Math.round(lastAvg - firstAvg);
  };
  
  const calculateConsistency = (attempts) => {
    if (attempts.length < 5) return 0;
    
    const scores = attempts.map(a => a.score || a.accuracy || 0);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, Math.round(100 - stdDev));
  };
  
  const calculateTrend = (attempts) => {
    if (attempts.length < 5) return 'stable';
    
    const recent = attempts.slice(-5).map(a => a.score || a.accuracy || 0);
    const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
    
    const previous = attempts.slice(-10, -5).map(a => a.score || a.accuracy || 0);
    const prevAvg = previous.length > 0 ? previous.reduce((sum, s) => sum + s, 0) / previous.length : recentAvg;
    
    if (recentAvg > prevAvg + 5) return 'improving';
    if (recentAvg < prevAvg - 5) return 'declining';
    return 'stable';
  };
  
  const calculateAchievements = (exercises, bestScore, streak, completedLessons, perfectScores, longestStreak) => {
    const badges = [];
    
    if (exercises >= 10) badges.push({ icon: '🎯', title: 'First Steps', desc: 'Completed 10 exercises', color: '#2196F3' });
    if (exercises >= 50) badges.push({ icon: '🔥', title: 'Dedicated', desc: 'Completed 50 exercises', color: '#ff9800' });
    if (exercises >= 100) badges.push({ icon: '⭐', title: 'Century', desc: 'Completed 100 exercises', color: '#ffc107' });
    if (exercises >= 200) badges.push({ icon: '💪', title: 'Unstoppable', desc: 'Completed 200 exercises', color: '#9c27b0' });
    
    if (bestScore >= 90) badges.push({ icon: '🏆', title: 'Excellence', desc: 'Scored 90%+', color: '#4caf50' });
    if (bestScore >= 95) badges.push({ icon: '💎', title: 'Perfection', desc: 'Scored 95%+', color: '#00bcd4' });
    if (bestScore === 100) badges.push({ icon: '👑', title: 'Flawless', desc: 'Perfect 100%', color: '#ffd700' });
    
    if (streak >= 3) badges.push({ icon: '📅', title: '3-Day Streak', desc: '3 days in a row', color: '#8bc34a' });
    if (streak >= 7) badges.push({ icon: '🔥', title: 'Week Warrior', desc: '7 days streak', color: '#ff5722' });
    if (longestStreak >= 14) badges.push({ icon: '⚡', title: 'Fortnight', desc: '14 days streak', color: '#e91e63' });
    if (longestStreak >= 30) badges.push({ icon: '🌟', title: 'Monthly Master', desc: '30 days streak', color: '#673ab7' });
    
    if (completedLessons >= 3) badges.push({ icon: '📚', title: 'Scholar', desc: 'Completed 3 lessons', color: '#3f51b5' });
    if (completedLessons >= 5) badges.push({ icon: '🎓', title: 'Graduate', desc: 'Completed 5 lessons', color: '#009688' });
    if (completedLessons >= 8) badges.push({ icon: '🏅', title: 'Expert', desc: 'Completed 8 lessons', color: '#795548' });
    
    if (perfectScores >= 5) badges.push({ icon: '✨', title: 'Consistent', desc: '5 perfect scores', color: '#cddc39' });
    if (perfectScores >= 10) badges.push({ icon: '🌈', title: 'Perfectionist', desc: '10 perfect scores', color: '#ff4081' });
    
    return badges;
  };
  
  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); navigation.replace('SignIn'); }}
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  const getTrendIcon = () => {
    if (recentTrend === 'improving') return '📈';
    if (recentTrend === 'declining') return '📉';
    return '➡️';
  };

  const getTrendText = () => {
    if (recentTrend === 'improving') return 'Improving';
    if (recentTrend === 'declining') return 'Needs Focus';
    return 'Stable';
  };

  const getTrendColor = () => {
    if (recentTrend === 'improving') return '#4caf50';
    if (recentTrend === 'declining') return '#f44336';
    return '#ff9800';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userData?.name?.charAt(0).toUpperCase() || '👤'}</Text>
        </View>
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
        <Text style={styles.memberSince}>
          Member since {userData?.created_at?.toDate ? userData.created_at.toDate().toLocaleDateString() : 'N/A'}
        </Text>
        <View style={[styles.trendBadge, { backgroundColor: getTrendColor() }]}>
          <Text style={styles.trendText}>{getTrendIcon()} {getTrendText()}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgScore}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalPracticeMinutes}m</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.completedLessons}/{stats.totalLessons}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Best Score</Text>
            <Text style={[styles.overviewValue, { color: '#4caf50' }]}>{stats.bestScore}%</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Lowest Score</Text>
            <Text style={[styles.overviewValue, { color: '#f44336' }]}>{stats.worstScore}%</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Perfect Scores (95%+)</Text>
            <Text style={styles.overviewValue}>{stats.perfectScores}</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Improvement Rate</Text>
            <Text style={[styles.overviewValue, { color: stats.improvementRate >= 0 ? '#4caf50' : '#f44336' }]}>
              {stats.improvementRate >= 0 ? '+' : ''}{stats.improvementRate}%
            </Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Consistency Score</Text>
            <Text style={styles.overviewValue}>{stats.consistency}%</Text>
          </View>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>Longest Streak</Text>
            <Text style={styles.overviewValue}>{stats.longestStreak} days</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Summary</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📊</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityValue}>{stats.totalExercises}</Text>
              <Text style={styles.activityLabel}>Total Exercises</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📅</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityValue}>{stats.thisWeekExercises}</Text>
              <Text style={styles.activityLabel}>This Week</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📆</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityValue}>{stats.thisMonthExercises}</Text>
              <Text style={styles.activityLabel}>This Month</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>🔄</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityValue}>{stats.retryCount}</Text>
              <Text style={styles.activityLabel}>Retries</Text>
            </View>
          </View>
        </View>
      </View>

      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements ({achievements.length})</Text>
          <View style={styles.badgeGrid}>
            {achievements.map((badge, idx) => (
              <View key={idx} style={[styles.badgeCard, { borderLeftColor: badge.color, borderLeftWidth: 4 }]}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phoneme Analysis</Text>
        {problemPhonemes.length > 0 && (
          <View style={styles.phonemeSection}>
            <Text style={styles.phonemeSubtitle}>⚠️ Needs Practice</Text>
            {problemPhonemes.map((item, idx) => (
              <View key={idx} style={styles.phonemeCard}>
                <Text style={styles.phonemeText}>{item.phoneme}</Text>
                <View style={styles.phonemeInfo}>
                  <Text style={styles.phonemeCount}>{item.count} errors</Text>
                  <View style={[styles.phonemeBar, { width: Math.min(item.count * 10, 100) }]} />
                </View>
              </View>
            ))}
          </View>
        )}
        {strongPhonemes.length > 0 && (
          <View style={styles.phonemeSection}>
            <Text style={[styles.phonemeSubtitle, { color: '#4caf50' }]}>✅ Strong Areas</Text>
            {strongPhonemes.map((item, idx) => (
              <View key={idx} style={[styles.phonemeCard, { borderLeftColor: '#4caf50' }]}>
                <Text style={[styles.phonemeText, { color: '#4caf50' }]}>{item.phoneme}</Text>
                <Text style={styles.phonemeCount}>Mastered</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Progress')}>
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Detailed Progress</Text>
            <Text style={styles.actionSubtitle}>Charts, trends & insights</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Lessons')}>
          <Text style={styles.actionIcon}>🎯</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Continue Learning</Text>
            <Text style={styles.actionSubtitle}>Practice exercises</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingCard} onPress={handleSignOut}>
          <Text style={styles.settingIcon}>🚪</Text>
          <Text style={styles.settingText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#2196F3', padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 48 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 16, color: '#fff', opacity: 0.9 },
  memberSince: { fontSize: 13, color: '#fff', opacity: 0.8, marginTop: 8 },
  trendBadge: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  trendText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12, marginTop: -30 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2196F3', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#666', textAlign: 'center' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  overviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  overviewLabel: { fontSize: 14, color: '#666' },
  overviewValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  activityCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  activityIcon: { fontSize: 32, marginRight: 16 },
  activityContent: { flex: 1 },
  activityValue: { fontSize: 24, fontWeight: 'bold', color: '#2196F3' },
  activityLabel: { fontSize: 12, color: '#666' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  badgeIcon: { fontSize: 40, marginBottom: 8 },
  badgeTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4, textAlign: 'center' },
  badgeDesc: { fontSize: 11, color: '#666', textAlign: 'center' },
  phonemeSection: { marginBottom: 20 },
  phonemeSubtitle: { fontSize: 16, fontWeight: 'bold', color: '#f44336', marginBottom: 12 },
  phonemeCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, borderLeftWidth: 4, borderLeftColor: '#f44336' },
  phonemeText: { fontSize: 18, fontWeight: 'bold', color: '#f44336' },
  phonemeInfo: { alignItems: 'flex-end' },
  phonemeCount: { fontSize: 14, color: '#666', marginBottom: 4 },
  phonemeBar: { height: 4, backgroundColor: '#f44336', borderRadius: 2 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  actionIcon: { fontSize: 32, marginRight: 16 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  actionSubtitle: { fontSize: 13, color: '#666' },
  actionArrow: { fontSize: 24, color: '#ccc' },
  settingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  settingIcon: { fontSize: 24, marginRight: 16 },
  settingText: { fontSize: 16, color: '#333', fontWeight: '500' },
});
