import { Platform } from 'react-native';

let Audio, FileSystem;

// Only import expo modules if available
try {
  if (Platform.OS !== 'web') {
    Audio = require('expo-av').Audio;
    FileSystem = require('expo-file-system');
  }
} catch (error) {
  console.warn('Expo modules not available:', error);
}

export class MobileAudioInput {
  constructor() {
    this.recording = null;
    this.lastAudioBuffer = null;
    this.isRecording = false;
  }

  async startRecording() {
    try {
      if (!Audio) {
        throw new Error('Audio module not available');
      }
      
      console.log('📱 Starting mobile recording...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      
      this.isRecording = true;
      console.log('✅ Mobile recording started');
      return { success: true };

    } catch (error) {
      console.error('❌ Mobile recording error:', error);
      return { success: false, error: error.message };
    }
  }

  async stopRecording() {
    try {
      if (!this.recording || !this.isRecording) {
        return { success: false, error: 'No active recording' };
      }

      console.log('🛑 Stopping mobile recording...');
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Convert to audio buffer for local MFCC (fallback)
      const audioBuffer = await this.uriToAudioBuffer(uri);
      this.lastAudioBuffer = audioBuffer;
      this.lastUri = uri;

      console.log('✅ Mobile recording stopped, uri:', uri, 'buffer length:', audioBuffer.length);
      return { success: true, audioBuffer, uri };

    } catch (error) {
      console.error('❌ Stop recording error:', error);
      return { success: false, error: error.message };
    }
  }

  async uriToAudioBuffer(uri) {
    try {
      if (!FileSystem) {
        throw new Error('FileSystem module not available');
      }
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Parse WAV file to get audio data
      const audioBuffer = this.parseWAVFile(bytes.buffer);
      return audioBuffer;

    } catch (error) {
      console.error('❌ URI to buffer conversion error:', error);
      // Return empty buffer as fallback
      return new Float32Array(16000);
    }
  }

  parseWAVFile(arrayBuffer) {
    try {
      const view = new DataView(arrayBuffer);
      
      // Skip WAV header (44 bytes)
      const dataStart = 44;
      const dataLength = (arrayBuffer.byteLength - dataStart) / 2; // 16-bit samples
      
      const audioData = new Float32Array(dataLength);
      
      for (let i = 0; i < dataLength; i++) {
        const sample = view.getInt16(dataStart + i * 2, true); // little-endian
        audioData[i] = sample / 32768.0; // Convert to float [-1, 1]
      }
      
      return audioData;
    } catch (error) {
      console.error('❌ WAV parsing error:', error);
      return new Float32Array(16000);
    }
  }

  getLastRecording() {
    return { audioBuffer: this.lastAudioBuffer, uri: this.lastUri };
  }

  async getAudioBuffer() {
    return this.lastAudioBuffer;
  }
}