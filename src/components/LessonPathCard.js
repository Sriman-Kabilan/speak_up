import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export default function LessonPathCard({ lesson, index, isUnlocked, isCompleted, onPress }) {
  const getPosition = () => {
    const positions = ['left', 'center', 'right'];
    return positions[index % 3];
  };

  const getCategoryEmoji = () => {
    const emojis = {
      'Basic': '🎯',
      'Vowels': '💬',
      'Consonants': '🗣️',
      'Phrases': '💼',
      'Sentences': '📝'
    };
    return emojis[lesson.category] || '📚';
  };

  const position = getPosition();

  return (
    <View style={[styles.container, styles[position]]}>
      <TouchableOpacity
        style={[
          styles.card,
          !isUnlocked && styles.cardLocked,
          isCompleted && styles.cardCompleted
        ]}
        onPress={onPress}
        disabled={!isUnlocked}
        activeOpacity={0.8}
      >
        <View style={styles.cardInner}>
          <View style={[styles.iconCircle, !isUnlocked && styles.iconCircleLocked, isCompleted && styles.iconCircleCompleted]}>
            {isCompleted ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : !isUnlocked ? (
              <Text style={styles.lock}>🔒</Text>
            ) : (
              <Text style={styles.emoji}>{getCategoryEmoji()}</Text>
            )}
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.title, !isUnlocked && styles.textLocked]}>{lesson.title}</Text>
            <Text style={[styles.category, !isUnlocked && styles.textLocked]}>{lesson.category}</Text>
            {lesson.hint && (
              <Text style={[styles.hint, !isUnlocked && styles.textLocked]} numberOfLines={2}>{lesson.hint}</Text>
            )}
          </View>

          <View style={styles.rightSection}>
            <View style={[styles.numberBadge, !isUnlocked && styles.numberBadgeLocked]}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            {isCompleted && (
              <View style={styles.completeStar}>
                <Text style={styles.starText}>⭐</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {index < 7 && (
        <View style={[styles.connector, position === 'center' && styles.connectorCenter]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  left: {
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  center: {
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 320,
    elevation: 6,
  },
  cardLocked: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  cardCompleted: {
    borderWidth: 3,
    borderColor: '#4caf50',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircleLocked: {
    backgroundColor: '#bdbdbd',
  },
  iconCircleCompleted: {
    backgroundColor: '#4caf50',
  },
  emoji: {
    fontSize: 32,
  },
  checkmark: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  lock: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  textLocked: {
    color: '#999',
  },
  rightSection: {
    alignItems: 'center',
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberBadgeLocked: {
    backgroundColor: '#bdbdbd',
  },
  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  completeStar: {
    marginTop: 4,
  },
  starText: {
    fontSize: 20,
  },
  connector: {
    width: 4,
    height: 40,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginVertical: 8,
  },
  connectorCenter: {
    backgroundColor: '#2196F3',
  },
});
