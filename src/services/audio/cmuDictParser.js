import * as FileSystem from 'expo-file-system';

let cachedDict = null;

export async function loadCMUDict() {
  if (cachedDict) return cachedDict;

  const dictPath = `${FileSystem.documentDirectory}../../../src/services/audio/cmudict.dict`;
  const content = await FileSystem.readAsStringAsync(dictPath, { encoding: FileSystem.EncodingType.UTF8 });
  
  const dict = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (!line || line.startsWith(';;;')) continue;
    
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;
    
    let word = parts[0].toLowerCase();
    
    // Skip alternate pronunciations (e.g., WORD(2))
    if (word.includes('(')) continue;
    
    // Remove stress digits from phonemes
    const phonemes = parts.slice(1).map(p => p.replace(/[0-9]/g, ''));
    
    dict[word] = phonemes;
  }
  
  cachedDict = dict;
  console.log('✅ Full CMU dictionary loaded:', Object.keys(dict).length, 'words');
  
  return dict;
}

export function getPhonemes(word) {
  if (!cachedDict) {
    console.warn('⚠️ CMU dictionary not loaded yet');
    return null;
  }
  return cachedDict[word.toLowerCase()] || null;
}
