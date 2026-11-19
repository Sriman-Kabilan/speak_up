"""
Wav2Vec2 Phoneme Detector
Detects phonemes DIRECTLY from audio without speech-to-text
"""

import torch
import soundfile as sf
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

class Wav2Vec2PhonemeDetector:
    def __init__(self):
        self.model = None
        self.processor = None
        self.model_name = "facebook/wav2vec2-lv-60-espeak-cv-ft"  # Phoneme model
    
    def initialize(self):
        """Load Wav2Vec2 phoneme model"""
        try:
            print(f"Loading Wav2Vec2 phoneme model...")
            self.processor = Wav2Vec2Processor.from_pretrained(self.model_name)
            self.model = Wav2Vec2ForCTC.from_pretrained(self.model_name)
            print("✅ Wav2Vec2 model loaded")
            return True
        except Exception as e:
            print(f"❌ Model load failed: {e}")
            return False
    
    def detect_phonemes(self, audio_path):
        """
        Detect phonemes DIRECTLY from audio
        No word recognition - pure phoneme detection
        """
        if not self.model:
            return None
        
        try:
            # Read audio
            audio, sr = sf.read(audio_path)
            
            # Resample to 16kHz if needed
            if sr != 16000:
                import librosa
                audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
            
            # Mono
            if len(audio.shape) > 1:
                audio = audio[:, 0]
            
            # Process audio
            inputs = self.processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
            
            with torch.no_grad():
                logits = self.model(inputs.input_values).logits
            
            # Get predicted phonemes
            predicted_ids = torch.argmax(logits, dim=-1)
            phonemes_raw = self.processor.batch_decode(predicted_ids)[0]
            
            # Clean phonemes
            phonemes = self._clean_phonemes(phonemes_raw)
            
            print(f"🎤 Detected phonemes: {phonemes}")
            
            return {
                'phonemes': phonemes,
                'raw': phonemes_raw
            }
            
        except Exception as e:
            print(f"❌ Detection error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _clean_phonemes(self, raw_phonemes):
        """Convert IPA phonemes to ARPABET for CMU comparison"""
        # Wav2Vec2 outputs IPA, need to convert to ARPABET
        # Simplified mapping
        ipa_to_arpabet = {
            'ə': 'AH',
            'ɪ': 'IH',
            'i': 'IY',
            'ɛ': 'EH',
            'æ': 'AE',
            'ʌ': 'AH',
            'ɑ': 'AA',
            'ɔ': 'AO',
            'ʊ': 'UH',
            'u': 'UW',
            'p': 'P',
            'b': 'B',
            't': 'T',
            'd': 'D',
            'k': 'K',
            'g': 'G',
            'f': 'F',
            'v': 'V',
            'θ': 'TH',
            'ð': 'DH',
            's': 'S',
            'z': 'Z',
            'ʃ': 'SH',
            'ʒ': 'ZH',
            'h': 'HH',
            'm': 'M',
            'n': 'N',
            'ŋ': 'NG',
            'l': 'L',
            'r': 'R',
            'w': 'W',
            'j': 'Y'
        }
        
        phonemes = []
        for char in raw_phonemes.replace(' ', ''):
            if char in ipa_to_arpabet:
                phonemes.append(ipa_to_arpabet[char])
        
        return phonemes
