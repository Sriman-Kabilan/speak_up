import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PronunciationGuide({ exercise }) {
  if (!exercise) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Pronunciation Guide</Text>
      
      {exercise.phonemes && exercise.phonemes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phonemes</Text>
          <View style={styles.phonemeContainer}>
            {exercise.phonemes.map((phoneme, index) => (
              <View key={index} style={styles.phonemeBox}>
                <Text style={styles.phonemeText}>{phoneme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {exercise.mouth_position && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👄 Mouth Position</Text>
          <Text style={styles.text}>{exercise.mouth_position}</Text>
        </View>
      )}

      {exercise.correction_tips && exercise.correction_tips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          {exercise.correction_tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  phonemeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  phonemeBox: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  phonemeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#2196F3',
    marginRight: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
