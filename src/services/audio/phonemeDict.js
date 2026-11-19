// Full CMU Pronouncing Dictionary Parser
import { Platform } from 'react-native';

// Platform-specific imports
let Asset, FileSystem;
if (Platform.OS !== 'web') {
  try {
    Asset = require('expo-asset').Asset;
    FileSystem = require('expo-file-system');
  } catch (error) {
    console.warn('Expo modules not available:', error);
  }
}

export class PhonemeDict {
  constructor() {
    this.dict = null;
    this.loadPromise = null;
  }

  async loadDict() {
    if (this.loadPromise) return this.loadPromise;
    
    this.loadPromise = (async () => {
      try {
        let content;
        
        if (Platform.OS === 'web') {
          const response = await fetch('/cmudict.dict');
          if (!response.ok) throw new Error('Failed to fetch dictionary');
          content = await response.text();
        } else {
          // For mobile, use a fallback or skip dictionary loading
          console.warn('CMU dictionary not available on mobile, using fallback');
          this.dict = this.getFallbackDict();
          return;
        }
        
        this.dict = this.parseCMUDict(content);
        console.log('📚 CMU dictionary loaded:', Object.keys(this.dict).length, 'words');
      } catch (error) {
        console.error('❌ Failed to load CMU dictionary:', error);
        this.dict = this.getFallbackDict();
      }
    })();
    
    return this.loadPromise;
  }

  getFallbackDict() {
    // Basic fallback dictionary for common words
    return {
      'hello': ['HH', 'EH', 'L', 'OW'],
      'cat': ['K', 'AE', 'T'],
      'dog': ['D', 'AO', 'G'],
      'fish': ['F', 'IH', 'SH'],
      'bird': ['B', 'ER', 'D'],
      'think': ['TH', 'IH', 'NG', 'K'],
      'this': ['DH', 'IH', 'S'],
      'rice': ['R', 'AY', 'S'],
      'light': ['L', 'AY', 'T'],
      'right': ['R', 'AY', 'T'],
      'bed': ['B', 'EH', 'D'],
      'red': ['R', 'EH', 'D'],
      'sit': ['S', 'IH', 'T'],
      'ship': ['SH', 'IH', 'P'],
      'good': ['G', 'UH', 'D'],
      'morning': ['M', 'AO', 'R', 'N', 'IH', 'NG'],
      'afternoon': ['AE', 'F', 'T', 'ER', 'N', 'UW', 'N'],
      'evening': ['IY', 'V', 'N', 'IH', 'NG'],
      'thank': ['TH', 'AE', 'NG', 'K'],
      'you': ['Y', 'UW'],
      'welcome': ['W', 'EH', 'L', 'K', 'AH', 'M']
    };
  }

  parseCMUDict(content) {
    const dict = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Ignore comments
      if (line.startsWith(';;;') || !line.trim()) continue;
      
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;
      
      let word = parts[0].toLowerCase();
      
      // Remove variant markers (e.g., "WORD(2)" -> "word")
      word = word.replace(/\(\d+\)$/, '');
      
      // Skip if already exists (keep first pronunciation)
      if (dict[word]) continue;
      
      // Extract phonemes and remove stress digits
      const phonemes = parts.slice(1).map(p => p.replace(/[012]$/g, ''));
      
      dict[word] = phonemes;
    }
    
    return dict;
  }

  async getPhonemes(text) {
    if (!this.loadPromise) this.loadPromise = this.loadDict();
    await this.loadPromise;
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const words = normalized.split(/\s+/).filter(w => w);
    const phonemes = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (!cleanWord) continue;
      
      if (this.dict[cleanWord]) {
        phonemes.push(...this.dict[cleanWord]);
      } else {
        // Generate basic phonemes for unknown words
        phonemes.push(...this.generateBasicPhonemes(cleanWord));
      }
    }
    
    return phonemes;
  }

  generateBasicPhonemes(word) {
    // Very basic phoneme generation for unknown words
    const basicMapping = {
      'a': 'AE', 'e': 'EH', 'i': 'IH', 'o': 'AO', 'u': 'AH',
      'b': 'B', 'c': 'K', 'd': 'D', 'f': 'F', 'g': 'G',
      'h': 'HH', 'j': 'JH', 'k': 'K', 'l': 'L', 'm': 'M',
      'n': 'N', 'p': 'P', 'r': 'R', 's': 'S', 't': 'T',
      'v': 'V', 'w': 'W', 'x': 'K S', 'y': 'Y', 'z': 'Z'
    };
    
    return word.split('').map(char => basicMapping[char] || 'AH').filter(p => p);
  }

  async getPhonemeBoundaries(text, frameDuration = 0.016) {
    if (!this.loadPromise) this.loadPromise = this.loadDict();
    await this.loadPromise;
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const words = normalized.split(/\s+/).filter(w => w);
    const boundaries = [];
    let currentFrame = 0;
    const framesPerPhoneme = 8;
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (!cleanWord) continue;
      
      const phonemeList = this.dict[cleanWord] || this.generateBasicPhonemes(cleanWord);
      
      phonemeList.forEach((phoneme) => {
        boundaries.push({
          symbol: phoneme,
          start: currentFrame,
          end: currentFrame + framesPerPhoneme,
          readable: this.phonemeToReadable(phoneme)
        });
        currentFrame += framesPerPhoneme;
      });
    }
    
    return boundaries;
  }

  getAveragePhonemeDuration(phoneme) {
    const durations = {
      'AE': 0.08, 'EH': 0.07, 'IH': 0.06, 'AA': 0.09, 'EY': 0.10,
      'IY': 0.09, 'AY': 0.12, 'OW': 0.11, 'UW': 0.10, 'AH': 0.05,
      'ER': 0.08, 'AO': 0.09, 'AW': 0.11, 'OY': 0.12,
      'K': 0.08, 'T': 0.07, 'P': 0.07, 'B': 0.06, 'D': 0.05, 'G': 0.06,
      'F': 0.09, 'V': 0.07, 'TH': 0.08, 'DH': 0.06, 'S': 0.10, 'Z': 0.08,
      'SH': 0.10, 'ZH': 0.09, 'HH': 0.06, 'M': 0.07, 'N': 0.06, 'NG': 0.08,
      'L': 0.06, 'R': 0.07, 'W': 0.06, 'Y': 0.05, 'CH': 0.09, 'JH': 0.08
    };
    return durations[phoneme] || 0.07;
  }

  phonemeToReadable(phoneme) {
    const readable = {
      'AE': 'a as in cat', 'EH': 'e as in bed', 'IH': 'i as in sit',
      'AA': 'o as in hot', 'EY': 'ay as in cake', 'IY': 'ee as in feet',
      'AY': 'i as in time', 'OW': 'o as in home', 'UW': 'oo as in blue',
      'AH': 'uh as in the', 'ER': 'er as in her', 'AO': 'aw as in thought',
      'AW': 'ow as in now', 'OY': 'oy as in boy',
      'TH': 'th as in think', 'DH': 'th as in this',
      'SH': 'sh as in she', 'ZH': 'zh as in vision',
      'CH': 'ch as in church', 'JH': 'j as in judge',
      'NG': 'ng as in sing',
      'K': 'k sound', 'T': 't sound', 'P': 'p sound',
      'B': 'b sound', 'D': 'd sound', 'G': 'g sound',
      'F': 'f sound', 'V': 'v sound', 'S': 's sound', 'Z': 'z sound',
      'HH': 'h sound', 'M': 'm sound', 'N': 'n sound',
      'L': 'l sound', 'R': 'r sound', 'W': 'w sound', 'Y': 'y sound'
    };
    return readable[phoneme] || phoneme;
  }
}
