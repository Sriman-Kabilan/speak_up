import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import PhonemeBreakdown from './PhonemeBreakdown';

export default function FeedbackCard({ visible, result, onTryAgain, onNext, attemptCount = 0, maxAttempts = 3, passThreshold = 80 }) {
  if (!result) return null;

  console.log('🎨 FeedbackCard received result:', JSON.stringify(result, null, 2));
  console.log('📊 incorrectPhonemes:', result.incorrectPhonemes);
  console.log('📊 phonemeBreakdown:', result.phonemeBreakdown);

  const [playingAudio, setPlayingAudio] = React.useState(null);
  const [showPhonemeBreakdown, setShowPhonemeBreakdown] = React.useState(false);
  const [autoPlayedCorrection, setAutoPlayedCorrection] = React.useState(false);

  const isPassed = result.score >= passThreshold;
  const hasAttemptsLeft = attemptCount < maxAttempts - 1;
  const shouldShowTryAgain = !isPassed && hasAttemptsLeft;

  // AUDIO-FIRST: Auto-play slow pronunciation on first incorrect attempt
  React.useEffect(() => {
    if (!isPassed && !autoPlayedCorrection && result.slowAudioUrl) {
      console.log('🎧 Auto-playing slow pronunciation correction');
      playAudio(result.slowAudioUrl, 'slow');
      setAutoPlayedCorrection(true);
    }
  }, [isPassed, result]);

  const playPhonemeSound = (phoneme) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    console.log(`🎵 Playing phoneme sound: ${phoneme}`);
    
    // Map ARPABET to pronounceable sounds
    const phonemeMap = {
      'AA': 'ah ah ah',
      'AE': 'a a a',
      'AH': 'uh uh uh',
      'AO': 'aw aw aw',
      'AW': 'ow ow ow',
      'AY': 'eye eye eye',
      'EH': 'eh eh eh',
      'ER': 'er er er',
      'EY': 'ay ay ay',
      'IH': 'ih ih ih',
      'IY': 'ee ee ee',
      'OW': 'oh oh oh',
      'OY': 'oy oy oy',
      'UH': 'uh uh uh',
      'UW': 'oo oo oo',
      'HH': 'h h h',
      'TH': 'th th th',
      'DH': 'th th th',
      'V': 'v v v',
      'W': 'w w w',
      'R': 'r r r',
      'L': 'l l l',
      'T': 't t t',
      'D': 'd d d',
      'K': 'k k k',
      'G': 'g g g',
      'P': 'p p p',
      'B': 'b b b',
      'F': 'f f f',
      'S': 's s s',
      'Z': 'z z z',
      'SH': 'sh sh sh',
      'ZH': 'zh zh zh',
      'CH': 'ch ch ch',
      'JH': 'j j j',
      'M': 'm m m',
      'N': 'n n n',
      'NG': 'ng ng ng',
      'Y': 'y y y'
    };
    
    const sound = phonemeMap[phoneme] || phoneme.toLowerCase();
    const utterance = new SpeechSynthesisUtterance(sound);
    utterance.lang = 'en-US';
    utterance.rate = 0.4; // Very slow
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const playArticulationTip = (phoneme, tip) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    console.log(`👄 Playing articulation tip for: ${phoneme}`);
    
    // Extract first sentence of tip for audio
    const firstSentence = tip.split('.')[0] + '.';
    const utterance = new SpeechSynthesisUtterance(firstSentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.7;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = async (url, type) => {
    if (!url || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('⚠️ Audio playback not available');
      return;
    }
    
    setPlayingAudio(type);
    
    // TEACHING MODE: Distinct audio sequences for each button
    if (type === 'correction' && result.incorrectPhonemes && result.incorrectPhonemes.length > 0) {
      console.log('🎯 Teaching mode started for phoneme:', result.incorrectPhonemes[0].phoneme);
      
      const phoneme = result.incorrectPhonemes[0];
      
      // Step 1: Isolated phoneme
      console.log('🎧 Playing isolated phoneme audio');
      const isolatedUtterance = new SpeechSynthesisUtterance(phoneme.phoneme);
      isolatedUtterance.lang = 'en-US';
      isolatedUtterance.rate = 0.5;
      isolatedUtterance.pitch = 1.2;
      window.speechSynthesis.speak(isolatedUtterance);
      
      await new Promise(resolve => {
        isolatedUtterance.onend = () => setTimeout(resolve, 500);
      });
      
      // Step 2: Articulation instruction
      console.log('👄 Playing articulation instruction audio');
      const instructions = {
        'TH': 'Place your tongue between your teeth and blow air gently.',
        'DH': 'Place your tongue between your teeth and vibrate your vocal cords.',
        'V': 'Touch your upper teeth to your lower lip and vibrate.',
        'W': 'Round your lips and blow air without touching teeth.',
        'R': 'Curl your tongue back without touching the roof of your mouth.',
        'L': 'Touch the tip of your tongue to the roof of your mouth.'
      };
      
      const instruction = instructions[phoneme.phoneme] || `Focus on the ${phoneme.readableLabel} sound.`;
      const instructionUtterance = new SpeechSynthesisUtterance(instruction);
      instructionUtterance.lang = 'en-US';
      instructionUtterance.rate = 0.7;
      window.speechSynthesis.speak(instructionUtterance);
      
      await new Promise(resolve => {
        instructionUtterance.onend = () => setTimeout(resolve, 500);
      });
      
      // Step 3: Slow word correction
      console.log('🐢 Playing slow word correction audio');
      const slowUtterance = new SpeechSynthesisUtterance(result.feedbackText || 'Practice slowly');
      slowUtterance.lang = 'en-US';
      slowUtterance.rate = 0.4;
      window.speechSynthesis.speak(slowUtterance);
      
      await new Promise(resolve => {
        slowUtterance.onend = () => {
          setPlayingAudio(null);
          resolve();
        };
      });
    } else if (type === 'slow') {
      console.log('🐢 Playing slow pronunciation audio only');
      const utterance = new SpeechSynthesisUtterance(result.feedbackText || 'Listen carefully');
      utterance.lang = 'en-US';
      utterance.rate = 0.5;
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else if (type === 'articulation') {
      console.log('👄 Playing articulation instruction audio only');
      const utterance = new SpeechSynthesisUtterance(result.feedbackText || 'Listen to the instruction');
      utterance.lang = 'en-US';
      utterance.rate = 0.6;
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('🔊 Playing standard audio');
      const utterance = new SpeechSynthesisUtterance(result.feedbackText || 'Listen carefully');
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayPhoneme = (phonemeCode, audioType) => {
    console.log(`🎵 Playing ${audioType} audio for phoneme: ${phonemeCode}`);
    const phonemeAudio = result.correctionAudios?.find(ca => ca.phoneme === phonemeCode);
    if (phonemeAudio) {
      const url = phonemeAudio[audioType];
      if (url) playAudio(url, audioType);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.header, isPassed ? styles.headerSuccess : styles.headerError]}>
            <Text style={styles.icon}>{isPassed ? '✅' : '❌'}</Text>
            <Text style={styles.title}>
              {isPassed ? 'Excellent Pronunciation!' : 'Needs Improvement'}
            </Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={[styles.scoreValue, isPassed ? styles.scoreSuccess : styles.scoreError]}>
                {result.score}%
              </Text>
              {!isPassed && (
                <Text style={styles.attemptText}>
                  Attempt {attemptCount + 1} of {maxAttempts}
                </Text>
              )}
            </View>

            {!isPassed && result.incorrectPhonemes && result.incorrectPhonemes.length > 0 && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>❌ Pronunciation Errors Detected</Text>
                {result.incorrectPhonemes.map((phoneme, idx) => (
                  <View key={idx} style={styles.phonemeError}>
                    <Text style={styles.errorText}>
                      Expected: "{phoneme.phoneme}" but you said "{phoneme.detectedPhoneme || phoneme.phoneme}"
                    </Text>
                    {phoneme.teachingTip && (
                      <Text style={styles.teachingTip}>💡 {phoneme.teachingTip}</Text>
                    )}
                    {phoneme.practice_words && (
                      <Text style={styles.practiceWords}>🎯 {phoneme.practice_words}</Text>
                    )}
                    <View style={styles.audioButtons}>
                      <TouchableOpacity 
                        style={styles.smallAudioButton}
                        onPress={() => playPhonemeSound(phoneme.phoneme)}
                      >
                        <Text style={styles.smallAudioText}>🎵 Hear Sound</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.smallAudioButton}
                        onPress={() => playArticulationTip(phoneme.phoneme, phoneme.teachingTip)}
                      >
                        <Text style={styles.smallAudioText}>👄 How To Say</Text>
                      </TouchableOpacity>
                    </View>
                    {phoneme.errorType && (
                      <Text style={styles.errorType}>Type: {phoneme.errorType.replace('_', ' ')}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {!isPassed && result.phonemeBreakdown && result.phonemeBreakdown.length > 0 && 
             result.phonemeBreakdown.every(p => p.isCorrect) && (
              <View style={styles.qualitySection}>
                <Text style={styles.sectionTitle}>⚠️ Pronunciation Quality Issue</Text>
                <Text style={styles.qualityText}>
                  All phonemes are correct, but the pronunciation quality needs improvement. 
                  Focus on clarity, proper articulation, and matching the reference audio more closely.
                </Text>
              </View>
            )}

            {!isPassed && result.stressErrors && result.stressErrors.length > 0 && (
              <View style={styles.stressSection}>
                <Text style={styles.sectionTitle}>⚡ Stress Pattern Errors</Text>
                {result.stressErrors.map((err, idx) => (
                  <View key={idx} style={styles.stressError}>
                    <Text style={styles.errorText}>
                      Syllable "{err.syllable}" should be {err.expected}
                    </Text>
                    <Text style={styles.stressHint}>
                      {err.expected === 'stressed' ? 'Say it LOUDER and LONGER' : 'Say it softer and shorter'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!isPassed && (!result.incorrectPhonemes || result.incorrectPhonemes.length === 0) && 
             (!result.phonemeBreakdown || !result.phonemeBreakdown.every(p => p.isCorrect)) && (
              <View style={styles.fallbackSection}>
                <Text style={styles.sectionTitle}>⚠️ Phoneme Data Unavailable</Text>
                <Text style={styles.fallbackText}>
                  Detailed phoneme analysis could not be performed. Listen to the full word correction below.
                </Text>
              </View>
            )}

            {result.confidenceLevel === 'low' && (
              <View style={styles.warningSection}>
                <Text style={styles.sectionTitle}>⚠️ Audio Quality Warning</Text>
                <Text style={styles.warningText}>
                  Low audio quality detected. Please record in a quieter environment for better results.
                </Text>
                {result.audioQuality && (
                  <Text style={styles.qualityDetails}>
                    SNR: {result.audioQuality.snr?.toFixed(1)}dB | Clipping: {(result.audioQuality.clipping * 100)?.toFixed(1)}%
                  </Text>
                )}
              </View>
            )}

            {result.feedbackText && (
              <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>📝 Detailed Feedback</Text>
                <Text style={styles.tipText}>{result.feedbackText}</Text>
              </View>
            )}

            {result.phonemeBreakdown && result.phonemeBreakdown.length > 0 && (
              <View style={styles.phonemeSection}>
                <Text style={styles.sectionTitle}>🔤 Phoneme Analysis</Text>
                <View style={styles.phonemeGrid}>
                  {result.phonemeBreakdown.map((phoneme, idx) => {
                    const severityColor = 
                      phoneme.severity === 0 ? '#4caf50' : // Green - correct
                      phoneme.severity === 1 ? '#ffeb3b' : // Yellow - minor
                      phoneme.severity === 2 ? '#ff9800' : // Orange - moderate
                      phoneme.severity === 3 ? '#ff5722' : // Deep orange - significant
                      '#f44336'; // Red - critical
                    
                    return (
                      <View
                        key={idx}
                        style={[styles.phonemeCard, { backgroundColor: severityColor }]}
                      >
                        <Text style={styles.phonemeText}>{phoneme.phoneme}</Text>
                        <Text style={styles.phonemeStatus}>
                          {phoneme.isCorrect ? '✓' : '✗'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.phonemeNote}>
                  🟢 Correct  🟡 Minor  🟠 Moderate  🔴 Critical
                </Text>
              </View>
            )}

            {!isPassed && (
              <View style={styles.audioSection}>
                <Text style={styles.sectionTitle}>🎧 Listen to Correct Pronunciation</Text>
                <Text style={styles.audioNote}>Play the reference audio to hear the correct pronunciation</Text>
                <TouchableOpacity 
                  style={[styles.audioButton, styles.audioPrimary]}
                  onPress={() => playAudio('reference', 'reference')}
                >
                  <Text style={styles.audioButtonText}>
                    ▶️ Play Correct Pronunciation
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {shouldShowTryAgain && (
              <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.nextButton, shouldShowTryAgain && { flex: 1 }]} 
              onPress={onNext}
            >
              <Text style={styles.nextText}>
                {!isPassed && !hasAttemptsLeft ? 'Continue Anyway' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <PhonemeBreakdown
        visible={showPhonemeBreakdown}
        phonemes={result.phonemeBreakdown}
        onClose={() => setShowPhonemeBreakdown(false)}
        onPlayPhoneme={handlePlayPhoneme}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerSuccess: {
    backgroundColor: '#4caf50',
  },
  headerError: {
    backgroundColor: '#f44336',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreSuccess: {
    color: '#4caf50',
  },
  scoreError: {
    color: '#f44336',
  },
  attemptText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorSection: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewBreakdownButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewBreakdownText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  phonemeErrorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityBadge: {
    backgroundColor: '#f44336',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipsSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  mouthSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#d32f2f',
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#2196F3',
    marginRight: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  severityText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  phonemeError: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  teachingTip: {
    fontSize: 13,
    color: '#1976d2',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  practiceWords: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 6,
    fontWeight: '600',
    backgroundColor: '#e8f5e9',
    padding: 6,
    borderRadius: 4,
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  smallAudioButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  smallAudioText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorType: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  stressSection: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stressError: {
    marginBottom: 12,
  },
  stressHint: {
    fontSize: 13,
    color: '#f57c00',
    marginTop: 4,
    fontWeight: '600',
  },
  fallbackSection: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  fallbackText: {
    fontSize: 14,
    color: '#e65100',
  },
  warningSection: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    fontSize: 14,
    color: '#e65100',
  },
  qualitySection: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  qualityText: {
    fontSize: 14,
    color: '#e65100',
  },
  qualityDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  audioSection: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  audioNote: {
    fontSize: 12,
    color: '#e65100',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  audioPrimary: {
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  audioButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  audioButtonActive: {
    backgroundColor: '#ffe0b2',
  },
  audioButtonText: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '600',
    textAlign: 'center',
  },
  phonemeSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  phonemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  phonemeCard: {
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  phonemeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  phonemeStatus: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  phonemeNote: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mouthText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
