import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export default function LessonCard({ lesson, index, onPress }) {
  const getDifficultyGradient = () => {
    if (lesson.difficulty === 1) return ['#4caf50', '#66bb6a'];
    if (lesson.difficulty === 2) return ['#2196F3', '#42a5f5'];
    if (lesson.difficulty === 3) return ['#ff9800', '#ffa726'];
    return ['#f44336', '#ef5350'];
  };

  const getCategoryIcon = () => {
    const icons = {
      'Basics': '🎯',
      'Consonants': '🗣️',
      'Vowels': '💬',
      'Practical': '💼',
      'Advanced': '🚀',
      'Pronunciation': '🎤',
    };
    return icons[lesson.category] || '📚';
  };

  const colors = getDifficultyGradient();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.leftBar, { backgroundColor: colors[0] }]} />
      
      <View style={styles.iconSection}>
        <View style={[styles.iconCircle, { backgroundColor: colors[0] + '20' }]}>
          <Text style={styles.icon}>{getCategoryIcon()}</Text>
        </View>
        <View style={[styles.numberBadge, { backgroundColor: colors[0] }]}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{lesson.category}</Text>
          <View style={[styles.levelPill, { backgroundColor: colors[0] + '15' }]}>
            <Text style={[styles.levelText, { color: colors[0] }]}>{lesson.level}</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.hint && <Text style={styles.hint} numberOfLines={2}>{lesson.hint}</Text>}
        
        <View style={styles.footer}>
          <View style={styles.difficultyStars}>
            {[...Array(lesson.difficulty)].map((_, i) => (
              <Text key={i} style={styles.star}>⭐</Text>
            ))}
          </View>
          <View style={[styles.startBtn, { backgroundColor: colors[0] }]}>
            <Text style={styles.startText}>Practice</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  leftBar: {
    width: 6,
  },
  iconSection: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  numberBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyStars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  startBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
});
