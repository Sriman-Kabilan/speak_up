import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { getPhonemeTeaching } from '../data/phonemeTeachingData';
import PhonemeTeachingCard from './PhonemeTeachingCard';

export default function FeedbackCard({ visible, result, onTryAgain, onNext, attemptCount = 0, maxAttempts = 3, passThreshold = 80, exerciseType = 'word', exerciseText = '' }) {
  if (!result) return null;

  const [expandedPhoneme, setExpandedPhoneme] = React.useState(null);
  const [playingAudio, setPlayingAudio] = React.useState(null);

  const isPassed = result.score >= passThreshold;
  const hasAttemptsLeft = attemptCount < maxAttempts - 1;
  const shouldShowTryAgain = !isPassed && hasAttemptsLeft;
  
  // Determine if we should show detailed teaching
  const showDetailedTeaching = result.incorrectPhonemes && result.incorrectPhonemes.length > 0 && result.incorrectPhonemes.length <= 3;

  console.log('🎓 FeedbackCard render:', { score: result.score, isPassed, showDetailedTeaching, incorrectPhonemesCount: result.incorrectPhonemes?.length, exerciseType });

  const playAudio = async (text, rate = 0.8) => {
    try {
      const { Platform } = require('react-native');
      if (Platform.OS === 'web') {
        const speedMap = { 0.6: 'slow', 0.8: 'medium', 1.0: 'normal' };
        const speed = speedMap[rate] || 'normal';
        const url = `http://localhost:5000/api/tts/${encodeURIComponent(text)}?speed=${speed}`;
        const audio = new Audio(url);
        audio.onended = () => setPlayingAudio(null);
        audio.onerror = () => setPlayingAudio(null);
        await audio.play();
      } else {
        const Speech = require('expo-speech');
        Speech.speak(text, {
          language: 'en-US',
          rate: rate,
          onDone: () => setPlayingAudio(null),
          onError: () => setPlayingAudio(null),
        });
      }
      setPlayingAudio(text);
    } catch (error) {
      console.error('Playback error:', error);
      setPlayingAudio(null);
    }
  };

  const togglePhonemeTeaching = (phoneme) => {
    setExpandedPhoneme(expandedPhoneme === phoneme ? null : phoneme);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={[styles.header, isPassed ? styles.headerSuccess : styles.headerError]}>
            <View style={styles.headerRow}>
              <Text style={styles.headerIcon}>{isPassed ? '✅' : '❌'}</Text>
              <Text style={styles.headerTitle}>{isPassed ? 'Excellent!' : 'Keep Practicing'}</Text>
              <Text style={styles.headerScore}>{result.score}%</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Simple Feedback Message */}
            {result.feedbackText && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackText}>{result.feedbackText}</Text>
              </View>
            )}

            {/* Phoneme Cards - Visual Overview */}
            {result.phonemeBreakdown && result.phonemeBreakdown.length > 0 && (
              <View style={styles.phonemeCardsSection}>
                <Text style={styles.sectionTitle}>Phoneme Analysis</Text>
                <View style={styles.phonemeGrid}>
                  {result.phonemeBreakdown.map((phoneme, idx) => {
                    const severityColor = 
                      phoneme.severity === 0 ? '#4caf50' :
                      phoneme.severity <= 2 ? '#ff9800' :
                      '#f44336';
                    
                    return (
                      <View key={idx} style={[styles.phonemeCard, { borderColor: severityColor }]}>
                        <Text style={styles.phonemeCardText}>{phoneme.phoneme}</Text>
                        <Text style={styles.phonemeCardStatus}>
                          {phoneme.isCorrect ? '✓' : '✗'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                
                {/* Color Legend */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: '#4caf50' }]} />
                    <Text style={styles.legendText}>Correct</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: '#ff9800' }]} />
                    <Text style={styles.legendText}>Minor Issue</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: '#f44336' }]} />
                    <Text style={styles.legendText}>Needs Work</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Teaching - For words: detailed phoneme teaching, For sentences: sentence-level teaching */}
            {!isPassed && result.incorrectPhonemes && result.incorrectPhonemes.length > 0 && (
              <View style={styles.teachingSection}>
                <Text style={styles.sectionTitle}>How to Fix</Text>
                
                {showDetailedTeaching ? (
                  // Single word: Show phoneme teaching cards
                  result.incorrectPhonemes.map((error, idx) => {
                    const phoneme = error.phoneme;
                    const isExpanded = expandedPhoneme === phoneme;

                    return (
                      <View key={idx}>
                        <TouchableOpacity 
                          style={styles.errorHeader}
                          onPress={() => togglePhonemeTeaching(phoneme)}
                        >
                          <View style={styles.errorHeaderLeft}>
                            <Text style={styles.errorPhoneme}>{phoneme}</Text>
                            <Text style={styles.errorExample}>Tap to learn</Text>
                          </View>
                          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                        </TouchableOpacity>

                        {isExpanded && (
                          <PhonemeTeachingCard
                            phoneme={phoneme}
                            word={exerciseText}
                            onClose={() => setExpandedPhoneme(null)}
                          />
                        )}
                      </View>
                    );
                  })
                ) : (
                  // Sentence: Show sentence-level teaching
                  <View style={styles.sentenceTeaching}>
                    <Text style={styles.sentenceTeachingTitle}>Listen and Repeat</Text>
                    
                    {/* Play full sentence at different speeds */}
                    <View style={styles.sentenceAudioSection}>
                      <Text style={styles.audioLabel}>Practice the full sentence:</Text>
                      <View style={styles.speedButtons}>
                        <TouchableOpacity
                          style={styles.speedButton}
                          onPress={() => playAudio(exerciseText, 0.6)}
                          disabled={playingAudio === exerciseText}
                        >
                          <Text style={styles.speedButtonText}>▶ Slow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.speedButton}
                          onPress={() => playAudio(exerciseText, 0.8)}
                          disabled={playingAudio === exerciseText}
                        >
                          <Text style={styles.speedButtonText}>▶ Medium</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.speedButton}
                          onPress={() => playAudio(exerciseText, 1.0)}
                          disabled={playingAudio === exerciseText}
                        >
                          <Text style={styles.speedButtonText}>▶ Normal</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Show word-by-word breakdown */}
                    <View style={styles.wordBreakdown}>
                      <Text style={styles.wordBreakdownTitle}>Word by Word:</Text>
                      <View style={styles.wordList}>
                        {exerciseText.split(' ').map((word, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.wordButton}
                            onPress={() => playAudio(word, 0.8)}
                          >
                            <Text style={styles.wordButtonText}>{word}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Tips for sentence practice */}
                    <View style={styles.sentenceTips}>
                      <Text style={styles.tipTitle}>💡 Tips:</Text>
                      <Text style={styles.tipText}>• Listen to the slow version first</Text>
                      <Text style={styles.tipText}>• Practice each word separately</Text>
                      <Text style={styles.tipText}>• Pay attention to pauses between words</Text>
                      <Text style={styles.tipText}>• Speak at a comfortable pace</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Success Message */}
            {isPassed && (
              <View style={styles.successSection}>
                <Text style={styles.successText}>
                  🎉 Great job! Your pronunciation is excellent. Keep up the good work!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {shouldShowTryAgain && (
              <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
                <Text style={styles.tryAgainText}>🔄 Try Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.nextButton, shouldShowTryAgain && styles.nextButtonHalf]} 
              onPress={onNext}
            >
              <Text style={styles.nextText}>
                {!isPassed && !hasAttemptsLeft ? 'Continue' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '92%',
    maxWidth: 600,
    height: '90%',
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    padding: 12,
    alignItems: 'center',
  },
  headerSuccess: {
    backgroundColor: '#4caf50',
  },
  headerError: {
    backgroundColor: '#f44336',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    flexShrink: 1,
  },
  scrollContent: {
    padding: 20,
  },
  feedbackSection: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    textAlign: 'center',
  },
  phonemeCardsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  phonemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  phonemeCard: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderRadius: 12,
    padding: 12,
    minWidth: 70,
    alignItems: 'center',
    elevation: 2,
  },
  phonemeCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phonemeCardStatus: {
    fontSize: 16,
    marginTop: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  teachingSection: {
    marginBottom: 20,
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff3e0',
  },
  errorHeaderLeft: {
    flex: 1,
  },
  errorPhoneme: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e65100',
  },
  errorExample: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 18,
    color: '#e65100',
    fontWeight: 'bold',
  },
  teachingContent: {
    padding: 16,
    backgroundColor: '#fffbf5',
  },
  teachingBlock: {
    marginBottom: 16,
  },
  teachingBlockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  teachingPoint: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 4,
  },
  teachingStep: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
  mistakeItem: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  mistakeWrong: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
  },
  mistakeSounds: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  mistakeFix: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginTop: 2,
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  audioButton: {
    flex: 1,
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
    fontSize: 14,
    fontWeight: '600',
  },
  practiceWords: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 22,
    fontWeight: '500',
  },
  practiceBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  practiceLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  simpleErrorSection: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  simpleError: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 22,
    marginBottom: 6,
  },
  sentenceTeaching: {
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 16,
  },
  sentenceTeachingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  sentenceAudioSection: {
    marginBottom: 16,
  },
  audioLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  wordBreakdown: {
    marginBottom: 16,
  },
  wordBreakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  wordButtonText: {
    color: '#1976d2',
    fontSize: 13,
    fontWeight: '600',
  },
  sentenceTips: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 4,
  },
  successSection: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  tryAgainButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tryAgainText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonHalf: {
    flex: 1,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
