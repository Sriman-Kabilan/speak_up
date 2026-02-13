import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Button from '../components/Button';

export default function PracticeExerciseScreen({ route, navigation }) {
  const { lesson, exercises, startIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentExercise = exercises[currentIndex];

  const handlePlayAudio = () => {
    setIsPlaying(true);
    console.log('Playing:', currentExercise.reference_audio);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasRecorded(false);
      setIsRecording(false);
    } else {
      navigation.navigate('Result', { lesson });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / exercises.length) * 100}%` }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.progress}>{currentIndex + 1} / {exercises.length}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseText}>{currentExercise.text}</Text>
          <Text style={styles.hint}>{currentExercise.hint}</Text>
        </View>

        <View style={styles.audioSection}>
          <Text style={styles.sectionLabel}>🎧 Listen</Text>
          <TouchableOpacity 
            style={[styles.audioButton, isPlaying && styles.audioButtonActive]} 
            onPress={handlePlayAudio}
            disabled={isPlaying}
          >
            <Text style={styles.audioIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            <Text style={styles.audioText}>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordSection}>
          <Text style={styles.sectionLabel}>🎤 Record</Text>
          
          <View style={styles.micContainer}>
            <View style={[styles.micCircle, isRecording && styles.micCircleActive]}>
              <Text style={styles.micIcon}>🎙️</Text>
            </View>
            {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
            {hasRecorded && !isRecording && <Text style={styles.successText}>✅ Recorded</Text>}
          </View>

          {!isRecording ? (
            <TouchableOpacity style={styles.recordButton} onPress={handleStartRecording}>
              <Text style={styles.recordButtonText}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={currentIndex === exercises.length - 1 ? "Finish" : "Next"}
          onPress={handleNext}
          disabled={!hasRecorded}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    alignItems: 'center',
  },
  progress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    alignItems: 'center',
  },
  exerciseText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  audioSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  audioButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  audioIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  audioText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordSection: {
    alignItems: 'center',
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  micCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    marginBottom: 12,
  },
  micCircleActive: {
    backgroundColor: '#ffebee',
  },
  micIcon: {
    fontSize: 48,
  },
  recordingText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
  successText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  recordButton: {
    backgroundColor: '#f44336',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#666',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
  },
});
