import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { getPhonemeTeaching } from '../data/phonemeTeachingData';

export default function PhonemeTeachingCard({ phoneme, word, onClose }) {
  const [isPlayingPhoneme, setIsPlayingPhoneme] = useState(false);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const phonemeSoundRef = useRef(null);
  const wordSoundRef = useRef(null);
  const teaching = getPhonemeTeaching(phoneme);

  useEffect(() => {
    return () => {
      if (phonemeSoundRef.current) phonemeSoundRef.current.unloadAsync();
      if (wordSoundRef.current) wordSoundRef.current.unloadAsync();
    };
  }, []);

  const handlePlayPhoneme = async (speed) => {
    if (isPlayingPhoneme) return;
    setIsPlayingPhoneme(true);
    try {
      if (Platform.OS === 'web') {
        const speedMap = { 0.5: 'slow', 0.75: 'medium', 1.0: 'normal' };
        const url = `http://localhost:5000/api/tts/${encodeURIComponent(phoneme)}?speed=${speedMap[speed] || 'normal'}`;
        const { Audio } = require('expo-av');
        if (phonemeSoundRef.current) await phonemeSoundRef.current.unloadAsync();
        const { sound } = await Audio.Sound.createAsync(
          { uri: url }, { shouldPlay: true },
          (status) => { if (status.didJustFinish) setIsPlayingPhoneme(false); }
        );
        phonemeSoundRef.current = sound;
      } else {
        const Speech = require('expo-speech');
        Speech.speak(phoneme, {
          language: 'en-US', rate: speed,
          onDone: () => setIsPlayingPhoneme(false),
          onError: () => setIsPlayingPhoneme(false),
        });
      }
    } catch (error) {
      console.error('Phoneme playback error:', error);
      setIsPlayingPhoneme(false);
    }
  };

  const handlePlayWord = async (speed) => {
    if (isPlayingWord) return;
    setIsPlayingWord(true);
    try {
      if (Platform.OS === 'web') {
        const speedMap = { 0.5: 'slow', 0.75: 'medium', 1.0: 'normal' };
        const url = `http://localhost:5000/api/tts/${encodeURIComponent(word)}?speed=${speedMap[speed] || 'normal'}`;
        const { Audio } = require('expo-av');
        if (wordSoundRef.current) await wordSoundRef.current.unloadAsync();
        const { sound } = await Audio.Sound.createAsync(
          { uri: url }, { shouldPlay: true },
          (status) => { if (status.didJustFinish) setIsPlayingWord(false); }
        );
        wordSoundRef.current = sound;
      } else {
        const Speech = require('expo-speech');
        Speech.speak(word, {
          language: 'en-US', rate: speed,
          onDone: () => setIsPlayingWord(false),
          onError: () => setIsPlayingWord(false),
        });
      }
    } catch (error) {
      console.error('Word playback error:', error);
      setIsPlayingWord(false);
    }
  };



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.phonemeTitle}>{phoneme}</Text>
          <Text style={styles.exampleText}>as in "{teaching.example}"</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Audio Teaching Section */}
      <View style={styles.audioSection}>
        <Text style={styles.sectionTitle}>🎧 Listen & Learn</Text>
        
        {/* Step 1: Isolated Phoneme Sound */}
        <View style={styles.audioControl}>
          <Text style={styles.audioLabel}>Step 1: Learn the {phoneme} sound alone</Text>
          <View style={styles.speedButtons}>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => handlePlayPhoneme(0.5)}
              disabled={isPlayingPhoneme}
            >
              <Text style={styles.speedButtonText}>▶ Slow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => handlePlayPhoneme(0.75)}
              disabled={isPlayingPhoneme}
            >
              <Text style={styles.speedButtonText}>▶ Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => handlePlayPhoneme(1.0)}
              disabled={isPlayingPhoneme}
            >
              <Text style={styles.speedButtonText}>▶ Normal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 2: Full Word Pronunciation */}
        <View style={styles.audioControl}>
          <Text style={styles.audioLabel}>Step 2: Hear it in the word "{word}"</Text>
          <View style={styles.speedButtons}>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => handlePlayWord(0.5)}
              disabled={isPlayingWord}
            >
              <Text style={styles.speedButtonText}>▶ Slow</Text>
              <Text style={styles.speedButtonSubtext}>Each sound</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => handlePlayWord(0.75)}
              disabled={isPlayingWord}
            >
              <Text style={styles.speedButtonText}>▶ Medium</Text>
              <Text style={styles.speedButtonSubtext}>With emphasis</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => handlePlayWord(1.0)}
              disabled={isPlayingWord}
            >
              <Text style={styles.speedButtonText}>▶ Normal</Text>
              <Text style={styles.speedButtonSubtext}>Natural speed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stress Pattern - VISUAL */}
        {teaching.stress && (
          <View style={styles.stressSection}>
            <Text style={styles.stressLabel}>⚡ Stress Pattern:</Text>
            <Text style={styles.stressText}>{teaching.stress}</Text>
            <Text style={styles.stressHint}>Bold = LOUDER and LONGER</Text>
          </View>
        )}

        {/* Sound Breakdown */}
        <View style={styles.soundSection}>
          <Text style={styles.stressLabel}>🔊 Sound Breakdown:</Text>
          <Text style={styles.soundText}>{word.toUpperCase()}</Text>
          <Text style={styles.soundPhonemes}>
            {teaching.example ? `Sounds like: "${teaching.example}"` : ''}
          </Text>
        </View>
      </View>

      {/* Teaching Instructions - ALL STEPS */}
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>👄 How to Pronounce</Text>
        <View style={styles.instructionsList}>
          {teaching.mouthPosition.map((instruction, idx) => (
            <View key={idx} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{idx + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Common Mistakes */}
      {teaching.commonMistakes && teaching.commonMistakes.length > 0 && (
        <View style={styles.mistakesSection}>
          <Text style={styles.sectionTitle}>⚠️ Common Mistakes</Text>
          {teaching.commonMistakes.slice(0, 2).map((mistake, idx) => (
            <View key={idx} style={styles.mistakeItem}>
              <Text style={styles.mistakeWrong}>❌ {mistake.wrong}</Text>
              <Text style={styles.mistakeCorrect}>✓ {mistake.correct}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Practice Words */}
      {teaching.practiceWords.length > 0 && (
        <View style={styles.practiceSection}>
          <Text style={styles.sectionTitle}>🎯 Practice These</Text>
          <Text style={styles.practiceWords}>
            {teaching.practiceWords.slice(0, 5).join(' • ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  phonemeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#999',
  },
  audioSection: {
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  audioControl: {
    marginBottom: 12,
  },
  audioLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  audioButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioButtonActive: {
    backgroundColor: '#1976d2',
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  speedButtonActive: {
    backgroundColor: '#1976d2',
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  speedButtonSubtext: {
    color: '#e3f2fd',
    fontSize: 10,
    fontWeight: '400',
  },
  stressSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff9c4',
    borderRadius: 8,
  },
  stressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f57f17',
    marginBottom: 4,
  },
  stressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f57f17',
    letterSpacing: 2,
  },
  stressHint: {
    fontSize: 11,
    color: '#f57f17',
    marginTop: 4,
    fontStyle: 'italic',
  },
  soundSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e1f5fe',
    borderRadius: 8,
  },
  soundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#01579b',
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 8,
  },
  soundPhonemes: {
    fontSize: 13,
    color: '#0277bd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  stopButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 8,
    textAlign: 'center',
  },
  instructionsSection: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6f00',
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  mistakesSection: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mistakeItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  mistakeWrong: {
    fontSize: 13,
    color: '#c62828',
    marginBottom: 4,
    fontWeight: '500',
  },
  mistakeCorrect: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '500',
  },
  practiceSection: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
  },
  practiceWords: {
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '500',
    lineHeight: 24,
  },
});
