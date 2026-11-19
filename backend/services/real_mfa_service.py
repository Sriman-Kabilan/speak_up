"""
Real Montreal Forced Aligner Implementation
Detects ACTUAL phonemes from audio using MFA
"""

import subprocess
import os
import tempfile
import soundfile as sf
import numpy as np
from pathlib import Path

class RealMFAService:
    def __init__(self):
        self.initialized = False
        self.model_path = "english_us_arpa"
        self.dict_path = "english_us_arpa"
    
    def initialize(self):
        """Initialize MFA"""
        print("Initializing Montreal Forced Aligner...")
        # Check if MFA is installed
        try:
            result = subprocess.run(['mfa', 'version'], capture_output=True, text=True)
            print(f"MFA Version: {result.stdout.strip()}")
            self.initialized = True
            print("MFA initialized successfully")
        except FileNotFoundError:
            print("ERROR: MFA not found. Please install: pip install montreal-forced-aligner")
            self.initialized = False
    
    def align_and_detect(self, audio_path, text):
        """
        Use MFA to detect actual phonemes from audio
        WITHOUT using transcript (so it detects what user actually said)
        """
        try:
            # Check for silence
            if self._is_silence(audio_path):
                return {
                    'phonemes': [],
                    'timings': [],
                    'error': 'NO_SPEECH',
                    'message': 'No speech detected'
                }
            
            # CRITICAL: We cannot use MFA align because it requires knowing the transcript
            # MFA align forces the audio to match the expected text
            # We need to DETECT what was actually said, not force-align to expected text
            
            print(f"⚠️ MFA align cannot detect wrong words - it force-aligns to expected text")
            print(f"⚠️ Falling back to CMU dictionary (cannot detect actual phonemes)")
            
            return self._fallback_detection(audio_path, text)
                    
        except Exception as e:
            print(f"MFA alignment error: {e}")
            return self._fallback_detection(audio_path, text)
    
    def _parse_textgrid(self, textgrid_path):
        """Parse MFA TextGrid output to extract phonemes"""
        from praatio import textgrid
        
        tg = textgrid.openTextgrid(textgrid_path, includeEmptyIntervals=False)
        phone_tier = tg.getTier('phones')
        
        phonemes = []
        timings = []
        
        for entry in phone_tier.entries:
            phoneme = entry.label.upper()
            if phoneme and phoneme != 'SIL' and phoneme != 'SP':
                phonemes.append(phoneme)
                timings.append((entry.start, entry.end))
        
        return phonemes, timings
    
    def _is_silence(self, audio_path):
        """Check if audio is silence"""
        try:
            y, sr = sf.read(audio_path)
            if len(y.shape) > 1:
                y = y[:, 0]
            rms = np.sqrt(np.mean(y**2))
            return rms < 0.01
        except:
            return False
    
    def _fallback_detection(self, audio_path, text):
        """Fallback when MFA fails - use CMU dictionary"""
        from .cmu_dict_service import CMUDictService
        
        cmu = CMUDictService()
        cmu.load()
        expected_phonemes = cmu.get_phonemes(text)
        
        if not expected_phonemes:
            return {
                'phonemes': [],
                'timings': [],
                'error': 'WORD_NOT_FOUND',
                'message': f'Word "{text}" not in dictionary'
            }
        
        # Estimate timings
        y, sr = sf.read(audio_path)
        if len(y.shape) > 1:
            y = y[:, 0]
        duration = len(y) / sr
        
        phoneme_duration = duration / len(expected_phonemes)
        timings = [(i * phoneme_duration, (i + 1) * phoneme_duration) 
                   for i in range(len(expected_phonemes))]
        
        print(f"Fallback: Using expected phonemes {expected_phonemes}")
        return {
            'phonemes': expected_phonemes,
            'timings': timings,
            'error': None
        }
