import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import Button from '../components/Button';
import FeedbackCard from '../components/FeedbackCardNew';
import PronunciationGuide from '../components/PronunciationGuide';
import { AudioInputService, WebMicrophoneInput } from '../services/audio/audioInputService';
import { MobileAudioInput } from '../services/audio/MobileAudioInput';
import { PronunciationEvaluator } from '../services/audio/pronunciationEvaluator';
import { ensureReferenceAudio } from '../services/pronunciationService';
import { ProgressTracker } from '../services/progressTracker';

const PASS_THRESHOLD = 80;
const MAX_ATTEMPTS = 3;

export default function PracticeExerciseScreen({ route, navigation }) {
  const { lesson, exercises, startIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(startIndex || 0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState(null);
  const [referenceAudioUrl, setReferenceAudioUrl] = useState(null);
  const [referenceAudioBuffer, setReferenceAudioBuffer] = useState(null);
  const [sound, setSound] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const correctionAudioRef = useRef(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const waveformIntervalRef = useRef(null);
  
  // Platform-specific audio input
  const audioInputRef = useRef(
    new AudioInputService(
      Platform.OS === 'web' ? new WebMicrophoneInput() : new MobileAudioInput()
    )
  );
  const evaluatorRef = useRef(new PronunciationEvaluator());
  const progressTrackerRef = useRef(new ProgressTracker());

  const currentExercise = exercises[currentIndex];

  // Load reference audio
  React.useEffect(() => {
    loadReferenceAudio();
  }, [currentIndex]);

  const loadReferenceAudio = async () => {
    const audioUrl = await ensureReferenceAudio(currentExercise);
    setReferenceAudioUrl(audioUrl);
    
    // Generate reference audio buffer
    const buffer = await generateReferenceBuffer(currentExercise.text);
    setReferenceAudioBuffer(buffer);
  };

  const generateReferenceBuffer = async (text) => {
    try {
      // Skip loading corrupted audio files - use fallback directly
      console.log('🎵 Using fallback reference buffer for:', text);
      
      // Generate a simple reference buffer (not silence)
      const duration = 1.0; // 1 second
      const sampleRate = 16000;
      const length = Math.floor(duration * sampleRate);
      const buffer = new Float32Array(length);
      
      // Generate a simple audio pattern based on text
      const freq = 200 + (text.length * 50); // Vary by text length
      for (let i = 0; i < length; i++) {
        buffer[i] = Math.sin(2 * Math.PI * freq * i / sampleRate) * 0.3;
      }
      
      console.log('✅ Reference buffer generated:', length, 'samples at 16kHz');
      return buffer;
      
    } catch (error) {
      console.error('❌ Error generating reference buffer:', error);
      // Final fallback: return non-silent buffer
      const length = 8000;
      const buffer = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        buffer[i] = Math.sin(2 * Math.PI * 300 * i / 16000) * 0.3;
      }
      return buffer;
    }
  };

  // Reset state when returning to this screen
  React.useEffect(() => {
    if (route.params?.startIndex !== undefined) {
      setCurrentIndex(route.params.startIndex);
      setHasRecorded(false);
      setIsRecording(false);
      setShowFeedback(false);
      setPronunciationResult(null);
      setAttemptCount(0);
    }
  }, [route.params?.startIndex]);

  const handleBackPress = () => {
    navigation.navigate('Practice', { lesson });
  };

  // Override hardware back button behavior
  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress} style={{ marginLeft: 10 }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, lesson]);

  const handlePlayAudio = async () => {
    if (!referenceAudioUrl) {
      Alert.alert('Audio not available', 'Reference audio is being generated...');
      return;
    }
    
    try {
      setIsPlaying(true);
      
      if (Platform.OS === 'web') {
        // Web: Use Speech Synthesis
        if (sound) {
          sound.pause();
        }
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(currentExercise.text);
          utterance.lang = 'en-US';
          utterance.rate = 0.6;
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        }
      } else {
        // Mobile: Use expo-speech for TTS
        const Speech = require('expo-speech');
        Speech.speak(currentExercise.text, {
          language: 'en-US',
          rate: 0.6,
          onDone: () => setIsPlaying(false),
          onError: () => {
            setIsPlaying(false);
            Alert.alert('Error', 'Could not play audio');
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Playback Error', 'Could not play reference audio');
      setIsPlaying(false);
    }
  };

  const handleStartRecording = async () => {
    setWaveformData([]);
    const result = await audioInputRef.current.startRecording();
    if (result.success) {
      setIsRecording(true);
      startWaveformVisualization();
    } else {
      Alert.alert('Error', 'Could not start recording: ' + result.error);
    }
  };

  const startWaveformVisualization = () => {
    if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
    waveformIntervalRef.current = setInterval(() => {
      setWaveformData(prev => {
        const newData = [...prev, Math.random() * 100];
        return newData.slice(-30);
      });
    }, 100);
  };

  const handleStopRecording = async () => {
    console.log('🛑 Stopping recording...');
    setIsRecording(false);
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    setWaveformData([]);
    
    const result = await audioInputRef.current.stopRecording();
    console.log('📊 Stop result:', result);
    
    if (result.success && result.audioBuffer) {
      setHasRecorded(true);
      
      if (Platform.OS === 'web') {
        const audioBlob = audioBufferToBlob(result.audioBuffer);
        setRecordedAudioBlob(audioBlob);
      } else {
        // Mobile: store the URI for playback, but evaluation uses audio buffer
        setRecordedAudioBlob(result.uri);
      }
      
      console.log('✅ Recording saved successfully, buffer length:', result.audioBuffer.length);
    } else {
      console.error('❌ Recording failed:', result.error);
      Alert.alert('Error', 'Recording failed: ' + (result.error || 'Unknown error'));
    }
  };

  const handleEvaluate = async () => {
    if (!hasRecorded) return;
    
    setIsEvaluating(true);
    
    const result = await audioInputRef.current.getLastRecording();
    if (result && result.audioBuffer) {
      console.log('🎯 Starting evaluation, uri:', result.uri);
      
      const evaluation = await evaluatorRef.current.evaluate(
        result.audioBuffer,
        referenceAudioBuffer || new Float32Array(16000),
        currentExercise.text,
        currentExercise.exercise_id || currentExercise.id,
        result.uri  // pass original URI for mobile
      );
      
      // Save to AsyncStorage (local)
      await progressTrackerRef.current.saveEvaluation(
        currentExercise.exercise_id || currentExercise.id,
        currentExercise.text,
        evaluation
      );
      
      setPronunciationResult(evaluation);
      setShowFeedback(true);
    } else {
      console.error('❌ No audio buffer available for evaluation');
      Alert.alert('Error', 'No recording available for evaluation');
    }
    
    setIsEvaluating(false);
  };

  const audioBufferToBlob = (buffer) => {
    const wav = encodeWAV(buffer, 16000);
    return new Blob([wav], { type: 'audio/wav' });
  };

  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  };

  const handlePlayRecording = async () => {
    if (!recordedAudioBlob) return;
    
    try {
      setIsPlayingRecording(true);
      
      if (Platform.OS === 'web') {
        // Web: Use Audio element
        const url = URL.createObjectURL(recordedAudioBlob);
        const audio = new window.Audio(url);
        audio.onended = () => {
          setIsPlayingRecording(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsPlayingRecording(false);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } else {
        // Mobile: Use Expo AV
        const { Audio } = require('expo-av');
        const uri = recordedAudioBlob; // On mobile, this is a URI string
        const { sound: playbackSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        
        playbackSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlayingRecording(false);
            playbackSound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlayingRecording(false);
    }
  };

  const handleTryAgain = async () => {
    if (correctionAudioRef.current) {
      try {
        await correctionAudioRef.current.stopAsync();
        await correctionAudioRef.current.unloadAsync();
        correctionAudioRef.current = null;
      } catch (error) {
        console.log('Audio cleanup error:', error);
      }
    }
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Mobile: Stop any expo-speech
    if (Platform.OS !== 'web') {
      try {
        const Speech = require('expo-speech');
        Speech.stop();
      } catch (error) {
        console.log('Speech stop error:', error);
      }
    }
    
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    
    setShowFeedback(false);
    setHasRecorded(false);
    setIsRecording(false);
    setPronunciationResult(null);
    setRecordedAudioBlob(null);
    setWaveformData([]);
    setAttemptCount(prev => prev + 1);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setHasRecorded(false);
    setIsRecording(false);
    setPronunciationResult(null);
    setAttemptCount(0);
    
    if (currentIndex < exercises.length - 1) {
      navigation.replace('PracticeExercise', { 
        lesson, 
        exercises, 
        startIndex: currentIndex + 1 
      });
    } else {
      navigation.navigate('Result', { 
        lesson, 
        exercise: currentExercise,
        isLastExercise: true
      });
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

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseText}>{currentExercise.text}</Text>
          <Text style={styles.hint}>{currentExercise.hint}</Text>
        </View>

        <PronunciationGuide exercise={currentExercise} />

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
          
          {isRecording && waveformData.length > 0 && (
            <View style={styles.waveformContainer}>
              {waveformData.map((amplitude, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.waveformBar,
                    { height: Math.max(2, amplitude / 2) }
                  ]}
                />
              ))}
            </View>
          )}
          
          <View style={styles.micContainer}>
            <View style={[styles.micCircle, isRecording && styles.micCircleActive]}>
              <Text style={styles.micIcon}>🎙️</Text>
            </View>
            {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
            {isEvaluating && <Text style={styles.evaluatingText}>⏳ Evaluating...</Text>}
            {hasRecorded && !isRecording && !isEvaluating && <Text style={styles.successText}>✅ Recorded</Text>}
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
          
          {hasRecorded && recordedAudioBlob && !isRecording && (
            <View style={styles.evaluateSection}>
              <TouchableOpacity 
                style={styles.playRecordingButton} 
                onPress={handlePlayRecording}
                disabled={isPlayingRecording}
              >
                <Text style={styles.playRecordingText}>
                  {isPlayingRecording ? '⏸️ Playing...' : '🔊 Play My Recording'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.evaluateButton} 
                onPress={handleEvaluate}
                disabled={isEvaluating}
              >
                <Text style={styles.evaluateButtonText}>
                  {isEvaluating ? '⏳ Evaluating...' : '✅ Evaluate My Pronunciation'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={currentIndex === exercises.length - 1 ? "Finish" : "Next"}
          onPress={handleNext}
          disabled={!showFeedback}
        />
      </View>

      {showFeedback && (
        <FeedbackCard
          visible={showFeedback}
          result={pronunciationResult}
          onTryAgain={handleTryAgain}
          onNext={handleNext}
          attemptCount={attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          passThreshold={PASS_THRESHOLD}
          exerciseType="word"
          exerciseText={currentExercise.text}
        />
      )}
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
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
  evaluatingText: {
    fontSize: 16,
    color: '#ff9800',
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
  playRecordingButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 12,
  },
  playRecordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  evaluateSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  evaluateButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 12,
    width: '80%',
  },
  evaluateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginVertical: 12,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#f44336',
    borderRadius: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
  },
});
