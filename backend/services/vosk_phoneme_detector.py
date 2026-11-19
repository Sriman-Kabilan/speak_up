"""
Vosk Phoneme Detector
Uses Vosk offline speech recognition to detect actual phonemes
"""

import json
import wave
import soundfile as sf
from vosk import Model, KaldiRecognizer

class VoskPhonemeDetector:
    def __init__(self):
        self.model = None
        self.model_path = "model"  # vosk-model-small-en-us-0.15
    
    def initialize(self):
        """Load Vosk model"""
        try:
            print(f"Loading Vosk model from {self.model_path}...")
            self.model = Model(self.model_path)
            print("✅ Vosk model loaded")
            return True
        except Exception as e:
            print(f"❌ Vosk model load failed: {e}")
            print("Download model: https://alphacephei.com/vosk/models")
            print("Extract to backend/model/")
            return False
    
    def detect_phonemes(self, audio_path):
        """
        Detect actual phonemes from audio
        Returns list of phonemes
        """
        if not self.model:
            return None
        
        try:
            # Read audio
            data, samplerate = sf.read(audio_path)
            
            # Convert to 16kHz mono if needed
            if samplerate != 16000:
                import numpy as np
                from scipy import signal
                data = signal.resample(data, int(len(data) * 16000 / samplerate))
                samplerate = 16000
            
            if len(data.shape) > 1:
                data = data[:, 0]
            
            # Convert to int16
            import numpy as np
            audio_int16 = (data * 32767).astype(np.int16)
            
            # Create recognizer with phoneme output
            rec = KaldiRecognizer(self.model, samplerate)
            rec.SetWords(True)
            
            # Process audio
            rec.AcceptWaveform(audio_int16.tobytes())
            result = json.loads(rec.FinalResult())
            
            if 'text' not in result or not result['text']:
                return None
            
            # Get recognized word
            recognized_word = result['text'].strip().lower()
            print(f"🎤 Vosk detected word: '{recognized_word}'")
            
            # Convert word to phonemes using CMU dict
            from .cmu_dict_service import CMUDictService
            cmu = CMUDictService()
            cmu.load()
            phonemes = cmu.get_phonemes(recognized_word)
            
            if phonemes:
                print(f"📝 Phonemes for '{recognized_word}': {phonemes}")
                return {
                    'word': recognized_word,
                    'phonemes': phonemes
                }
            
            return None
            
        except Exception as e:
            print(f"❌ Vosk detection error: {e}")
            return None
