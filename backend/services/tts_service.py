"""  
Text-to-Speech Service using gTTS
Generates natural pronunciation audio at different speeds
"""

from gtts import gTTS
import os

class TTSService:
    def __init__(self, cache_dir='tts_cache'):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def generate_audio(self, text, speed='normal', lang='en'):
        """
        Generate audio for text at specified speed
        
        Args:
            text: Word or phrase to speak
            speed: 'slow' (0.5x), 'medium' (0.75x), 'normal' (1.0x)
            lang: Language code (default: 'en')
        
        Returns:
            Path to generated audio file
        """
        # Create cache filename
        cache_filename = f"{text.lower().replace(' ', '_')}_{speed}.mp3"
        cache_path = os.path.join(self.cache_dir, cache_filename)
        
        # Return cached file if exists
        if os.path.exists(cache_path):
            return cache_path
        
        try:
            # Generate audio with gTTS
            # slow=True makes it ~0.5x speed, slow=False is normal
            use_slow = (speed == 'slow')
            
            tts = gTTS(text=text, lang=lang, slow=use_slow)
            tts.save(cache_path)
            
            return cache_path
            
        except Exception as e:
            print(f"[ERROR] TTS generation failed: {e}")
            return None
    
    def clear_cache(self):
        """Clear all cached audio files"""
        for file in os.listdir(self.cache_dir):
            file_path = os.path.join(self.cache_dir, file)
            if os.path.isfile(file_path):
                os.unlink(file_path)
