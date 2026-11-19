"""
CMU Dictionary Service
Provides expected phonemes for words
"""

import os

class CMUDictService:
    def __init__(self):
        self.dict = {}
        self.loaded = False
    
    def load(self):
        """Load CMU Dictionary"""
        dict_path = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'cmudict.dict')
        
        if not os.path.exists(dict_path):
            print(f"⚠️ CMU dict not found at {dict_path}, using built-in")
            self._load_builtin()
            return
        
        print(f"Loading CMU Dictionary from {dict_path}...")
        
        with open(dict_path, 'r', encoding='latin-1') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith(';;;'):
                    continue
                
                parts = line.split()
                if len(parts) < 2:
                    continue
                
                word = parts[0].lower()
                phonemes = [p.rstrip('012') for p in parts[1:]]  # Remove stress markers
                
                self.dict[word] = phonemes
        
        print(f"Loaded {len(self.dict)} words")
        self.loaded = True
    
    def _load_builtin(self):
        """Load built-in common words"""
        self.dict = {
            'hot': ['HH', 'AA', 'T'],
            'think': ['TH', 'IH', 'NG', 'K'],
            'very': ['V', 'EH', 'R', 'IY'],
            'cat': ['K', 'AE', 'T'],
            'bed': ['B', 'EH', 'D'],
            'sit': ['S', 'IH', 'T'],
            'meet': ['M', 'IY', 'T'],
            'good': ['G', 'UH', 'D'],
            'morning': ['M', 'AO', 'R', 'N', 'IH', 'NG'],
            'thank': ['TH', 'AE', 'NG', 'K'],
            'you': ['Y', 'UW'],
            'please': ['P', 'L', 'IY', 'Z'],
            'hello': ['HH', 'EH', 'L', 'OW'],
            'welcome': ['W', 'EH', 'L', 'K', 'AH', 'M']
        }
        self.loaded = True
    
    def get_phonemes(self, word):
        """Get phonemes for a word"""
        if not self.loaded:
            self.load()
        
        word = word.lower().strip()
        return self.dict.get(word, None)
    
    def get_readable_phonemes(self, phonemes):
        """Convert phonemes to readable format"""
        readable_map = {
            'AA': 'o (hot)',
            'AE': 'a (cat)',
            'AH': 'u (cup)',
            'AO': 'aw (law)',
            'AW': 'ow (how)',
            'AY': 'i (my)',
            'EH': 'e (bed)',
            'ER': 'er (her)',
            'EY': 'a (say)',
            'IH': 'i (sit)',
            'IY': 'ee (see)',
            'OW': 'o (go)',
            'OY': 'oy (boy)',
            'UH': 'oo (book)',
            'UW': 'oo (food)',
            'B': 'b',
            'CH': 'ch',
            'D': 'd',
            'DH': 'th (this)',
            'F': 'f',
            'G': 'g',
            'HH': 'h',
            'JH': 'j',
            'K': 'k',
            'L': 'l',
            'M': 'm',
            'N': 'n',
            'NG': 'ng',
            'P': 'p',
            'R': 'r',
            'S': 's',
            'SH': 'sh',
            'T': 't',
            'TH': 'th (think)',
            'V': 'v',
            'W': 'w',
            'Y': 'y',
            'Z': 'z',
            'ZH': 'zh (vision)'
        }
        
        return [readable_map.get(p, p.lower()) for p in phonemes]
