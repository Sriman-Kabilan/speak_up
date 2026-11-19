// Audio Input Abstraction Layer
export class AudioInputService {
  constructor(implementation) {
    this.implementation = implementation;
  }

  async startRecording() {
    return await this.implementation.startRecording();
  }

  async stopRecording() {
    return await this.implementation.stopRecording();
  }

  getLastRecording() {
    return this.implementation.getLastRecording();
  }

  async getAudioBuffer() {
    return await this.implementation.getAudioBuffer();
  }
}

// Web Microphone Implementation
export class WebMicrophoneInput {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.lastAudioBuffer = null;
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.start();
      return { success: true };
    } catch (error) {
      console.error('Recording error:', error);
      return { success: false, error: error.message };
    }
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ success: false, error: 'No active recording' });
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioBuffer = await this.blobToAudioBuffer(audioBlob);
        this.lastAudioBuffer = audioBuffer;
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve({ success: true, audioBuffer });
      };

      this.mediaRecorder.stop();
    });
  }

  getLastRecording() {
    return { audioBuffer: this.lastAudioBuffer };
  }

  async blobToAudioBuffer(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer.getChannelData(0);
  }

  async getAudioBuffer() {
    return this.audioChunks;
  }
}
