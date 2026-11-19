import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ProgressTracker } from '../services/progressTracker';
import { getUserAttempts } from '../services/attemptService';
import { getCurrentUser } from '../services/authService';

const { width } = Dimensions.get('window');

export default function ProgressScreen({ navigation }) {
  const [progress, setProgress] = useState(null);
  const [problemPhonemes, setProblemPhonemes] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [lessonPerformance, setLessonPerformance] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState({ morning: 0, afternoon: 0, evening: 0, night: 0 });
  const [insights, setInsights] = useState([]);
  const progressTracker = new ProgressTracker();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await progressTracker.getProgress();
    setProgress(data);
    
    const phonemes = await progressTracker.getProblemPhonemes();
    setProblemPhonemes(phonemes.slice(0, 8));
    
    const history = await progressTracker.getRecentHistory(15);
    setRecentHistory(history);
    
    const user = getCurrentUser();
    if (user) {
      const attempts = await getUserAttempts(user.uid);
      calculateLessonPerformance(attempts);
      calculateWeeklyProgress(attempts);
      calculateMonthlyProgress(attempts);
      calculateScoreDistribution(attempts);
      calculateTimeAnalysis(attempts);
      generateInsights(attempts, phonemes);
    }
  };
  
  const calculateLessonPerformance = (attempts) => {
    const lessonMap = {};
    
    attempts.forEach(a => {
      const lessonId = a.lesson_id;
      if (!lessonMap[lessonId]) {
        lessonMap[lessonId] = { scores: [], count: 0, bestScore: 0, recentScores: [] };
      }
      const score = a.score || a.accuracy || 0;
      lessonMap[lessonId].scores.push(score);
      lessonMap[lessonId].count++;
      lessonMap[lessonId].bestScore = Math.max(lessonMap[lessonId].bestScore, score);
    });
    
    const performance = Object.entries(lessonMap).map(([id, data]) => {
      const avg = Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length);
      const recent = data.scores.slice(-5);
      const recentAvg = Math.round(recent.reduce((sum, s) => sum + s, 0) / recent.length);
      const trend = recentAvg > avg + 3 ? 'up' : recentAvg < avg - 3 ? 'down' : 'stable';
      
      return {
        lessonId: id,
        avgScore: avg,
        recentAvg,
        count: data.count,
        bestScore: data.bestScore,
        trend,
        name: getLessonName(id)
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
    
    setLessonPerformance(performance);
  };
  
  const calculateWeeklyProgress = (attempts) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayAttempts = attempts.filter(a => {
        const attemptDate = a.created_at?.toMillis ? 
          new Date(a.created_at.toMillis()).toDateString() : null;
        return attemptDate === dateStr;
      });
      
      const scores = dayAttempts.map(a => a.score || a.accuracy || 0);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: avgScore,
        maxScore,
        count: dayAttempts.length,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    setWeeklyProgress(last7Days);
  };
  
  const calculateMonthlyProgress = (attempts) => {
    const last4Weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekAttempts = attempts.filter(a => {
        const timestamp = a.created_at?.toMillis ? a.created_at.toMillis() : Date.now();
        return timestamp >= weekStart.getTime() && timestamp <= weekEnd.getTime();
      });
      
      const scores = weekAttempts.map(a => a.score || a.accuracy || 0);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
      
      last4Weeks.push({
        week: `Week ${4 - i}`,
        score: avgScore,
        count: weekAttempts.length
      });
    }
    
    setMonthlyProgress(last4Weeks);
  };
  
  const calculateScoreDistribution = (attempts) => {
    const ranges = [
      { label: '90-100%', min: 90, max: 100, count: 0, color: '#4caf50' },
      { label: '80-89%', min: 80, max: 89, count: 0, color: '#8bc34a' },
      { label: '70-79%', min: 70, max: 79, count: 0, color: '#ffc107' },
      { label: '60-69%', min: 60, max: 69, count: 0, color: '#ff9800' },
      { label: 'Below 60%', min: 0, max: 59, count: 0, color: '#f44336' }
    ];
    
    attempts.forEach(a => {
      const score = a.score || a.accuracy || 0;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });
    
    const total = attempts.length;
    const distribution = ranges.map(r => ({
      ...r,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
    }));
    
    setScoreDistribution(distribution);
  };
  
  const calculateTimeAnalysis = (attempts) => {
    const times = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    attempts.forEach(a => {
      const timestamp = a.created_at?.toMillis ? a.created_at.toMillis() : Date.now();
      const hour = new Date(timestamp).getHours();
      
      if (hour >= 5 && hour < 12) times.morning++;
      else if (hour >= 12 && hour < 17) times.afternoon++;
      else if (hour >= 17 && hour < 21) times.evening++;
      else times.night++;
    });
    
    setTimeAnalysis(times);
  };
  
  const generateInsights = (attempts, phonemes) => {
    const insights = [];
    
    if (attempts.length >= 10) {
      const recent = attempts.slice(-10).map(a => a.score || a.accuracy || 0);
      const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
      
      if (recentAvg >= 85) {
        insights.push({ icon: '🎉', text: 'Excellent progress! Your recent scores are outstanding.', type: 'success' });
      } else if (recentAvg < 70) {
        insights.push({ icon: '💪', text: 'Keep practicing! Focus on problem phonemes to improve.', type: 'warning' });
      }
    }
    
    if (phonemes.length > 0 && phonemes[0].count > 10) {
      insights.push({ icon: '🎯', text: `Focus on "${phonemes[0].phoneme}" - it's your most challenging phoneme.`, type: 'info' });
    }
    
    const { morning, afternoon, evening, night } = timeAnalysis;
    const bestTime = Object.entries({ morning, afternoon, evening, night }).sort((a, b) => b[1] - a[1])[0];
    if (bestTime[1] > 0) {
      insights.push({ icon: '⏰', text: `You practice most in the ${bestTime[0]}. Great consistency!`, type: 'info' });
    }
    
    if (attempts.length >= 50) {
      insights.push({ icon: '🏆', text: 'You\'re a dedicated learner! Keep up the amazing work.', type: 'success' });
    }
    
    setInsights(insights);
  };
  
  const getLessonName = (id) => {
    const names = {
      'SHORT_VOWELS': 'Short Vowels', 'LONG_VOWELS': 'Long Vowels', 'TH_SOUND': 'TH Sound',
      'V_W': 'V vs W', 'R_L': 'R vs L', 'GREETINGS': 'Greetings', 'WORKPLACE': 'Workplace',
      'SENTENCES': 'Sentences', 'LONG_SENTENCES': 'Long Sentences',
      'BUSINESS_PHRASES': 'Business Phrases', 'QUESTION_INTONATION': 'Question Intonation'
    };
    return names[id] || id;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#8bc34a';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };
  
  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Detailed analytics & insights</Text>
      </View>

      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {insights.map((insight, idx) => (
            <View key={idx} style={[styles.insightCard, { borderLeftColor: insight.type === 'success' ? '#4caf50' : insight.type === 'warning' ? '#ff9800' : '#2196F3' }]}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>
      )}

      {weeklyProgress.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Progress (Last 7 Days)</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyProgress.map((day, idx) => (
                <View key={idx} style={styles.chartBar}>
                  <Text style={styles.chartScore}>{day.score > 0 ? day.score : ''}</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: `${day.score}%`, backgroundColor: getScoreColor(day.score) }]} />
                  </View>
                  <Text style={styles.chartLabel}>{day.day}</Text>
                  <Text style={styles.chartDate}>{day.date}</Text>
                  <Text style={styles.chartCount}>{day.count} ex</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {monthlyProgress.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trend</Text>
          <View style={styles.monthlyCard}>
            {monthlyProgress.map((week, idx) => (
              <View key={idx} style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>{week.week}</Text>
                <View style={styles.monthlyBarContainer}>
                  <View style={[styles.monthlyBar, { width: `${week.score}%`, backgroundColor: getScoreColor(week.score) }]} />
                </View>
                <Text style={styles.monthlyValue}>{week.score}%</Text>
                <Text style={styles.monthlyCount}>({week.count})</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {scoreDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Distribution</Text>
          <View style={styles.distributionCard}>
            {scoreDistribution.map((range, idx) => (
              <View key={idx} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{range.label}</Text>
                <View style={styles.distributionBarContainer}>
                  <View style={[styles.distributionBar, { width: `${range.percentage}%`, backgroundColor: range.color }]} />
                </View>
                <Text style={styles.distributionValue}>{range.count}</Text>
                <Text style={styles.distributionPercent}>({range.percentage}%)</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {lessonPerformance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lesson Performance</Text>
          {lessonPerformance.map((lesson, idx) => (
            <View key={idx} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonName}>{lesson.name}</Text>
                <View style={styles.lessonScores}>
                  <Text style={styles.lessonTrend}>{getTrendIcon(lesson.trend)}</Text>
                  <Text style={[styles.lessonScore, { color: getScoreColor(lesson.avgScore) }]}>{lesson.avgScore}%</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${lesson.avgScore}%`, backgroundColor: getScoreColor(lesson.avgScore) }]} />
              </View>
              <View style={styles.lessonDetails}>
                <Text style={styles.lessonDetail}>{lesson.count} exercises</Text>
                <Text style={styles.lessonDetail}>Best: {lesson.bestScore}%</Text>
                <Text style={styles.lessonDetail}>Recent: {lesson.recentAvg}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {Object.values(timeAnalysis).some(v => v > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Time Analysis</Text>
          <View style={styles.timeCard}>
            {[
              { label: 'Morning (5AM-12PM)', value: timeAnalysis.morning, icon: '🌅' },
              { label: 'Afternoon (12PM-5PM)', value: timeAnalysis.afternoon, icon: '☀️' },
              { label: 'Evening (5PM-9PM)', value: timeAnalysis.evening, icon: '🌆' },
              { label: 'Night (9PM-5AM)', value: timeAnalysis.night, icon: '🌙' }
            ].map((time, idx) => (
              <View key={idx} style={styles.timeRow}>
                <Text style={styles.timeIcon}>{time.icon}</Text>
                <Text style={styles.timeLabel}>{time.label}</Text>
                <Text style={styles.timeValue}>{time.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {problemPhonemes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phoneme Analysis (Top 8)</Text>
          {problemPhonemes.map((item, idx) => (
            <View key={idx} style={styles.phonemeCard}>
              <View style={styles.phonemeRank}>
                <Text style={styles.phonemeRankText}>#{idx + 1}</Text>
              </View>
              <Text style={styles.phonemeText}>{item.phoneme}</Text>
              <View style={styles.phonemeInfo}>
                <Text style={styles.phonemeCount}>{item.count} errors</Text>
                <View style={styles.phonemeBarContainer}>
                  <View style={[styles.phonemeBar, { width: `${Math.min((item.count / (problemPhonemes[0]?.count || 1)) * 100, 100)}%` }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {recentHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity (Last 15)</Text>
          {recentHistory.map((item, idx) => (
            <View key={idx} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyText}>{item.text}</Text>
                <Text style={[styles.historyScore, { color: getScoreColor(item.score) }]}>{item.score}%</Text>
              </View>
              <Text style={styles.historyDate}>
                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
              {item.errors && item.errors.length > 0 && (
                <Text style={styles.historyErrors}>Errors: {item.errors.join(', ')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {(!progress || (recentHistory.length === 0 && problemPhonemes.length === 0)) && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No practice history yet</Text>
          <Text style={styles.emptySubtext}>Start practicing to see detailed analytics!</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('Lessons')}>
            <Text style={styles.startButtonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2196F3', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  insightCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4 },
  insightIcon: { fontSize: 28, marginRight: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2 },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 180 },
  chartBar: { flex: 1, alignItems: 'center' },
  chartScore: { fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 4, height: 16 },
  barContainer: { width: 32, height: 120, backgroundColor: '#f0f0f0', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 4 },
  chartLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginTop: 6 },
  chartDate: { fontSize: 9, color: '#999' },
  chartCount: { fontSize: 9, color: '#999' },
  monthlyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  monthlyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  monthlyLabel: { width: 70, fontSize: 13, fontWeight: 'bold', color: '#333' },
  monthlyBarContainer: { flex: 1, height: 24, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  monthlyBar: { height: '100%', borderRadius: 4 },
  monthlyValue: { width: 45, fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  monthlyCount: { width: 40, fontSize: 11, color: '#666', textAlign: 'right' },
  distributionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  distributionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  distributionLabel: { width: 90, fontSize: 12, color: '#333', fontWeight: '500' },
  distributionBarContainer: { flex: 1, height: 20, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  distributionBar: { height: '100%', borderRadius: 4 },
  distributionValue: { width: 35, fontSize: 13, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  distributionPercent: { width: 50, fontSize: 11, color: '#666', textAlign: 'right' },
  lessonCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  lessonName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  lessonScores: { flexDirection: 'row', alignItems: 'center' },
  lessonTrend: { fontSize: 16, marginRight: 8 },
  lessonScore: { fontSize: 20, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  lessonDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  lessonDetail: { fontSize: 11, color: '#666' },
  timeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  timeIcon: { fontSize: 24, marginRight: 12 },
  timeLabel: { flex: 1, fontSize: 14, color: '#333' },
  timeValue: { fontSize: 18, fontWeight: 'bold', color: '#2196F3' },
  phonemeCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  phonemeRank: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f44336', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  phonemeRankText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  phonemeText: { fontSize: 20, fontWeight: 'bold', color: '#f44336', width: 60 },
  phonemeInfo: { flex: 1, marginLeft: 12 },
  phonemeCount: { fontSize: 13, color: '#666', marginBottom: 6 },
  phonemeBarContainer: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  phonemeBar: { height: '100%', backgroundColor: '#f44336', borderRadius: 4 },
  historyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyText: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  historyScore: { fontSize: 22, fontWeight: 'bold' },
  historyDate: { fontSize: 11, color: '#999', marginBottom: 4 },
  historyErrors: { fontSize: 12, color: '#f44336', marginTop: 4 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999', marginBottom: 20 },
  startButton: { backgroundColor: '#2196F3', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
