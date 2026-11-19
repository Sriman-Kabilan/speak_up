import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateTTSAudio } from './pronunciationService';

// Sample pronunciation data for common words
const pronunciationData = {
  'rice': {
    phonemes: ['R', 'AY', 'S'],
    common_errors: [
      'Pronouncing R as L (lice instead of rice)',
      'Using short I sound instead of long AI',
      'Soft S sound at the end'
    ],
    correction_tips: [
      'R sound: Curl tongue backward without touching roof of mouth',
      'AI sound: Open mouth wide, say "ah" then "ee" smoothly',
      'S sound: Press tongue tip behind upper teeth, blow air sharply'
    ],
    mouth_position: 'Start: Tongue curled back, lips slightly rounded. Middle: Mouth opens wide. End: Tongue behind teeth'
  },
  'light': {
    phonemes: ['L', 'AY', 'T'],
    common_errors: [
      'Pronouncing L as R (right instead of light)',
      'Dark L sound instead of clear L',
      'Silent or soft T at the end'
    ],
    correction_tips: [
      'L sound: Touch tongue tip to roof of mouth behind teeth, release air on sides',
      'AI sound: Open mouth wide for long vowel',
      'T sound: Stop air completely, then release with small explosion'
    ],
    mouth_position: 'Start: Tongue tip touches alveolar ridge. Middle: Mouth wide open. End: Tongue blocks air then releases'
  },
  'think': {
    phonemes: ['TH', 'IH', 'NG', 'K'],
    common_errors: [
      'Pronouncing TH as T or S (tink or sink)',
      'Missing NG sound',
      'Silent K at the end'
    ],
    correction_tips: [
      'TH sound: Place tongue tip between teeth, blow air gently (voiceless)',
      'IH sound: Relaxed short vowel, tongue in middle position',
      'NK sound: Back of tongue touches soft palate, release with K'
    ],
    mouth_position: 'Start: Tongue between teeth. Middle: Tongue relaxed. End: Back of tongue touches soft palate'
  },
  'ship': {
    phonemes: ['SH', 'IH', 'P'],
    common_errors: [
      'Pronouncing SH as S (sip instead of ship)',
      'Wrong vowel sound',
      'Soft P without lip closure'
    ],
    correction_tips: [
      'SH sound: Round lips forward, create wider air stream than S',
      'IH sound: Short relaxed vowel, tongue slightly raised',
      'P sound: Close lips completely, build pressure, release suddenly'
    ],
    mouth_position: 'Start: Lips rounded and protruded. Middle: Lips relaxed. End: Lips pressed together then pop open'
  },
  'cat': {
    phonemes: ['K', 'AE', 'T'],
    common_errors: [
      'Soft K sound without aspiration',
      'Wrong vowel (saying "cut" or "cot")',
      'Soft T or missing T'
    ],
    correction_tips: [
      'K sound: Back of tongue touches soft palate, release with burst of air',
      'AE sound: Open mouth wide, tongue low and forward (like "apple")',
      'T sound: Tongue tip touches alveolar ridge, sharp release'
    ],
    mouth_position: 'Start: Mouth closed, tongue back. Middle: Mouth wide open, jaw drops. End: Tongue tip touches roof'
  },
  'bed': {
    phonemes: ['B', 'EH', 'D'],
    common_errors: [
      'Soft B without lip vibration',
      'Wrong vowel sound (saying "bad" or "bid")',
      'Soft D or missing D'
    ],
    correction_tips: [
      'B sound: Press lips together, voice vibrates, release with small explosion',
      'EH sound: Mid-open mouth, tongue in middle (like "egg")',
      'D sound: Tongue tip touches alveolar ridge, voice continues, release'
    ],
    mouth_position: 'Start: Lips pressed together. Middle: Mouth half open. End: Tongue touches roof behind teeth'
  },
  'fish': {
    phonemes: ['F', 'IH', 'SH'],
    common_errors: [
      'Pronouncing F as P',
      'Wrong vowel sound',
      'Pronouncing SH as S or CH'
    ],
    correction_tips: [
      'F sound: Upper teeth touch lower lip, blow air (voiceless)',
      'IH sound: Short relaxed vowel',
      'SH sound: Round lips, wider air stream, continuous sound'
    ],
    mouth_position: 'Start: Teeth on lip. Middle: Lips relaxed. End: Lips rounded forward'
  },
  'dog': {
    phonemes: ['D', 'AO', 'G'],
    common_errors: [
      'Soft D sound',
      'Wrong vowel (saying "dug" or "dig")',
      'Soft G or missing G'
    ],
    correction_tips: [
      'D sound: Tongue tip touches alveolar ridge, voice on, release',
      'AO sound: Round lips, open mouth, back vowel (like "caught")',
      'G sound: Back of tongue touches soft palate, voice on, release'
    ],
    mouth_position: 'Start: Tongue tip up. Middle: Lips rounded, mouth open. End: Tongue back touches palate'
  }
};

// Default data for exercises without specific pronunciation info
const getDefaultPronunciationData = (text) => {
  const words = text.toLowerCase().split(' ');
  const firstWord = words[0];
  
  // Check if we have specific data
  if (pronunciationData[firstWord]) {
    return pronunciationData[firstWord];
  }
  
  // Generate generic data
  return {
    phonemes: text.split('').slice(0, 5).map(c => c.toUpperCase()),
    common_errors: ['Incorrect stress', 'Wrong vowel sound'],
    correction_tips: [
      'Listen carefully to the reference',
      'Practice slowly first',
      'Focus on each sound'
    ],
    mouth_position: 'Standard English pronunciation position'
  };
};

export const upgradeExercisesWithPronunciation = async () => {
  try {
    // Check if Firebase is available
    if (!db) {
      return { success: false, error: 'Firebase not available - running in offline mode' };
    }

    console.log('Starting exercise upgrade...');
    
    const exercisesRef = collection(db, 'Exercises');
    const snapshot = await getDocs(exercisesRef);
    
    let updated = 0;
    
    for (const docSnap of snapshot.docs) {
      const exercise = docSnap.data();
      const updates = {};
      
      // Add phonemes if missing
      if (!exercise.phonemes) {
        const pronData = getDefaultPronunciationData(exercise.text);
        updates.phonemes = pronData.phonemes;
        updates.common_errors = pronData.common_errors;
        updates.correction_tips = pronData.correction_tips;
        updates.mouth_position = pronData.mouth_position;
      }
      
      // Generate reference audio if missing
      if (!exercise.reference_audio || exercise.reference_audio.trim() === '') {
        const audioUrl = await generateTTSAudio(exercise.text);
        updates.reference_audio = audioUrl;
      }
      
      // Update document if there are changes
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'Exercises', docSnap.id), updates);
        updated++;
        console.log(`Updated exercise: ${exercise.text}`);
      }
    }
    
    console.log(`Upgrade complete! Updated ${updated} exercises.`);
    return { success: true, updated };
  } catch (error) {
    console.error('Error upgrading exercises:', error);
    return { success: false, error: error.message };
  }
};
