"""
Acoustic Analysis Engine
Uses advanced acoustic modeling to detect pronunciation patterns
"""

import whisper
import torch
import soundfile as sf
import numpy as np
from difflib import SequenceMatcher

class AcousticAnalyzer:
    def __init__(self):
        self.model = None
        self.model_size = "base"  # Fast and accurate
    
    def initialize(self):
        """Load acoustic model"""
        try:
            print(f"Loading acoustic analysis model ({self.model_size})...")
            self.model = whisper.load_model(self.model_size)
            print("[OK] Acoustic analyzer ready")
            return True
        except Exception as e:
            print(f"[ERROR] Model load failed: {e}")
            return False
    
    def analyze_pronunciation(self, audio_path, expected_word, vocabulary_context=None):
        """
        Analyze pronunciation with vocabulary constraints
        
        Args:
            audio_path: Path to audio file
            expected_word: The word student should say
            vocabulary_context: List of similar words for context (RAG approach)
        
        Returns:
            Detected word with confidence
        """
        if not self.model:
            return None
        
        try:
            # Load audio
            print(f"[DEBUG] Loading audio from: {audio_path}")
            audio, sr = sf.read(audio_path)
            print(f"[DEBUG] Audio loaded: shape={audio.shape}, sr={sr}")
            
            if len(audio.shape) > 1:
                audio = audio[:, 0]
                print(f"[DEBUG] Converted to mono: shape={audio.shape}")
            
            # Check if audio is silent
            max_amplitude = np.max(np.abs(audio))
            print(f"[DEBUG] Max amplitude: {max_amplitude}")
            
            if max_amplitude < 0.001:  # Very quiet audio
                print(f"[WARNING] Audio is too quiet (max amplitude: {max_amplitude})")
                return None
            
            # Resample to 16kHz if needed
            if sr != 16000:
                import librosa
                audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
                print(f"[DEBUG] Resampled to 16kHz")
            
            # Normalize
            audio = audio.astype(np.float32)
            if np.max(np.abs(audio)) > 0:
                audio = audio / np.max(np.abs(audio))
                print(f"[DEBUG] Audio normalized")
            
            # Build vocabulary context for better recognition
            if not vocabulary_context:
                vocabulary_context = self._build_vocabulary_context(expected_word)
            
            # Create prompt that helps Whisper recognize the full phrase
            prompt = f"English pronunciation: {expected_word}"
            
            result = self.model.transcribe(
                audio,
                language='en',
                initial_prompt=prompt,
                word_timestamps=False,
                fp16=False,
                condition_on_previous_text=False,  # Don't use context from previous
                temperature=0.0  # Deterministic output
            )
            
            detected_text = result['text'].strip().lower()
            
            # Clean detected text
            detected_word = self._extract_word(detected_text)
            
            # Calculate confidence based on similarity to vocabulary
            confidence = self._calculate_confidence(detected_word, vocabulary_context)
            
            print(f"[AUDIO] Acoustic analysis: '{detected_word}' (confidence: {confidence:.2f})")
            print(f"   Expected: '{expected_word}'")
            
            return {
                'word': detected_word,
                'confidence': confidence,
                'raw_text': detected_text
            }
            
        except Exception as e:
            print(f"[ERROR] Analysis error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _build_vocabulary_context(self, expected_word):
        """
        Build vocabulary context for RAG approach
        Includes expected word and phonetically similar words
        """
        # Common pronunciation practice words
        vocabulary = [expected_word]
        
        # Add phonetically similar words based on expected word
        similar_words = {
            'hot': ['hat', 'hit', 'hut', 'hop', 'pot', 'lot'],
            'hat': ['hot', 'hit', 'hut', 'cat', 'bat', 'mat'],
            'hit': ['hot', 'hat', 'hut', 'sit', 'bit', 'pit'],
            'tap': ['top', 'tip', 'cap', 'map', 'gap', 'lap'],
            'think': ['thing', 'sink', 'pink', 'thick', 'thin'],
            'that': ['this', 'than', 'them', 'then', 'the'],
        }
        
        if expected_word in similar_words:
            vocabulary.extend(similar_words[expected_word])
        
        return vocabulary[:10]  # Limit to 10 words
    
    def _extract_word(self, text):
        """Extract word(s) from transcription"""
        # Clean and return the full text (handles both single words and sentences)
        return text.lower().strip('.,!?')
    
    def _calculate_confidence(self, detected_word, vocabulary):
        """Calculate confidence based on vocabulary match"""
        if detected_word in vocabulary:
            return 1.0
        
        # Calculate similarity to vocabulary words
        max_similarity = 0.0
        for vocab_word in vocabulary:
            similarity = SequenceMatcher(None, detected_word, vocab_word).ratio()
            max_similarity = max(max_similarity, similarity)
        
        return max_similarity
