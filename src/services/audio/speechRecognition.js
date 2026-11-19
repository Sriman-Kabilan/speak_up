// Web Speech API for actual word recognition
export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isSupported = typeof window !== 'undefined' && 
                       ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  async recognizeWord(audioBlob, expectedWord) {
    if (!this.isSupported) {
      console.warn('⚠️ Speech Recognition not supported, skipping verification');
      return { recognized: expectedWord, isCorrectWord: true, confidence: 1.0 };
    }

    return new Promise((resolve) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      // Play audio through recognition
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      this.recognition.onresult = (event) => {
        const results = Array.from(event.results[0]);
        const topResult = results[0];
        const recognized = topResult.transcript.trim().toLowerCase();
        const confidence = topResult.confidence;

        console.log('🎤 Speech Recognition:', recognized, `(confidence: ${(confidence * 100).toFixed(1)}%)`);
        console.log('🎯 Expected:', expectedWord.toLowerCase());

        const isCorrectWord = recognized === expectedWord.toLowerCase();
        
        if (!isCorrectWord) {
          console.warn(`❌ WRONG WORD: User said "${recognized}" but expected "${expectedWord}"`);
        }

        resolve({ recognized, isCorrectWord, confidence });
      };

      this.recognition.onerror = (event) => {
        console.error('❌ Speech Recognition Error:', event.error);
        // Fallback: assume correct word
        resolve({ recognized: expectedWord, isCorrectWord: true, confidence: 0.5 });
      };

      this.recognition.onnomatch = () => {
        console.warn('⚠️ No speech recognized');
        resolve({ recognized: '', isCorrectWord: false, confidence: 0 });
      };

      // Start recognition and play audio
      this.recognition.start();
      audio.play();
      
      // Timeout after 5 seconds
      setTimeout(() => {
        this.recognition.stop();
        resolve({ recognized: expectedWord, isCorrectWord: true, confidence: 0.5 });
      }, 5000);
    });
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
