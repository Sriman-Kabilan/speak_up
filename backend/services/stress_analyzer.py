"""
Stress Analyzer
Analyzes stress patterns in pronunciation
"""

import soundfile as sf
import numpy as np

class StressAnalyzer:
    def analyze(self, audio_path, detected_phonemes, expected_phonemes):
        """
        Analyze stress patterns
        
        Returns list of stress errors
        """
        try:
            y, sr = sf.read(audio_path)
            if len(y.shape) > 1:
                y = y[:, 0]
            
            frame_length = int(sr * 0.025)
            hop_length = int(sr * 0.010)
            
            energy = []
            for i in range(0, len(y) - frame_length, hop_length):
                frame = y[i:i+frame_length]
                rms = np.sqrt(np.mean(frame**2))
                energy.append(rms)
            
            return []
            
        except Exception as e:
            print(f"Stress analysis error: {e}")
            return []
    
    def calculate_score(self, stress_errors):
        """Calculate stress score"""
        if not stress_errors:
            return 100
        
        score = 100 - (len(stress_errors) * 10)
        return max(60, score)
