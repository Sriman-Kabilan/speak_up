import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class CorrectionAudioService {
  constructor() {
    this.phonemeAudioMap = this.initializePhonemeAudioMap();
  }

  initializePhonemeAudioMap() {
    // PART 5: Complete ARPAbet phoneme mapping
    return {
      // Consonants
      'TH': { isolated: '/audio/phonemes/th_isolated.mp3', slow: '/audio/phonemes/th_slow.mp3', articulation: '/audio/phonemes/th_teaching.mp3' },
      'DH': { isolated: '/audio/phonemes/dh_isolated.mp3', slow: '/audio/phonemes/dh_slow.mp3', articulation: '/audio/phonemes/dh_teaching.mp3' },
      'V': { isolated: '/audio/phonemes/v_isolated.mp3', slow: '/audio/phonemes/v_slow.mp3', articulation: '/audio/phonemes/v_teaching.mp3' },
      'W': { isolated: '/audio/phonemes/w_isolated.mp3', slow: '/audio/phonemes/w_slow.mp3', articulation: '/audio/phonemes/w_teaching.mp3' },
      'R': { isolated: '/audio/phonemes/r_isolated.mp3', slow: '/audio/phonemes/r_slow.mp3', articulation: '/audio/phonemes/r_teaching.mp3' },
      'L': { isolated: '/audio/phonemes/l_isolated.mp3', slow: '/audio/phonemes/l_slow.mp3', articulation: '/audio/phonemes/l_teaching.mp3' },
      'K': { isolated: '/audio/phonemes/k_isolated.mp3', slow: '/audio/phonemes/k_slow.mp3', articulation: '/audio/phonemes/k_teaching.mp3' },
      'T': { isolated: '/audio/phonemes/t_isolated.mp3', slow: '/audio/phonemes/t_slow.mp3', articulation: '/audio/phonemes/t_teaching.mp3' },
      'P': { isolated: '/audio/phonemes/p_isolated.mp3', slow: '/audio/phonemes/p_slow.mp3', articulation: '/audio/phonemes/p_teaching.mp3' },
      'B': { isolated: '/audio/phonemes/b_isolated.mp3', slow: '/audio/phonemes/b_slow.mp3', articulation: '/audio/phonemes/b_teaching.mp3' },
      'D': { isolated: '/audio/phonemes/d_isolated.mp3', slow: '/audio/phonemes/d_slow.mp3', articulation: '/audio/phonemes/d_teaching.mp3' },
      'G': { isolated: '/audio/phonemes/g_isolated.mp3', slow: '/audio/phonemes/g_slow.mp3', articulation: '/audio/phonemes/g_teaching.mp3' },
      'F': { isolated: '/audio/phonemes/f_isolated.mp3', slow: '/audio/phonemes/f_slow.mp3', articulation: '/audio/phonemes/f_teaching.mp3' },
      'S': { isolated: '/audio/phonemes/s_isolated.mp3', slow: '/audio/phonemes/s_slow.mp3', articulation: '/audio/phonemes/s_teaching.mp3' },
      'Z': { isolated: '/audio/phonemes/z_isolated.mp3', slow: '/audio/phonemes/z_slow.mp3', articulation: '/audio/phonemes/z_teaching.mp3' },
      'SH': { isolated: '/audio/phonemes/sh_isolated.mp3', slow: '/audio/phonemes/sh_slow.mp3', articulation: '/audio/phonemes/sh_teaching.mp3' },
      'ZH': { isolated: '/audio/phonemes/zh_isolated.mp3', slow: '/audio/phonemes/zh_slow.mp3', articulation: '/audio/phonemes/zh_teaching.mp3' },
      'CH': { isolated: '/audio/phonemes/ch_isolated.mp3', slow: '/audio/phonemes/ch_slow.mp3', articulation: '/audio/phonemes/ch_teaching.mp3' },
      'JH': { isolated: '/audio/phonemes/jh_isolated.mp3', slow: '/audio/phonemes/jh_slow.mp3', articulation: '/audio/phonemes/jh_teaching.mp3' },
      'HH': { isolated: '/audio/phonemes/hh_isolated.mp3', slow: '/audio/phonemes/hh_slow.mp3', articulation: '/audio/phonemes/hh_teaching.mp3' },
      'M': { isolated: '/audio/phonemes/m_isolated.mp3', slow: '/audio/phonemes/m_slow.mp3', articulation: '/audio/phonemes/m_teaching.mp3' },
      'N': { isolated: '/audio/phonemes/n_isolated.mp3', slow: '/audio/phonemes/n_slow.mp3', articulation: '/audio/phonemes/n_teaching.mp3' },
      'NG': { isolated: '/audio/phonemes/ng_isolated.mp3', slow: '/audio/phonemes/ng_slow.mp3', articulation: '/audio/phonemes/ng_teaching.mp3' },
      'Y': { isolated: '/audio/phonemes/y_isolated.mp3', slow: '/audio/phonemes/y_slow.mp3', articulation: '/audio/phonemes/y_teaching.mp3' },
      
      // Vowels
      'AE': { isolated: '/audio/phonemes/ae_isolated.mp3', slow: '/audio/phonemes/ae_slow.mp3', articulation: '/audio/phonemes/ae_teaching.mp3' },
      'EH': { isolated: '/audio/phonemes/eh_isolated.mp3', slow: '/audio/phonemes/eh_slow.mp3', articulation: '/audio/phonemes/eh_teaching.mp3' },
      'IH': { isolated: '/audio/phonemes/ih_isolated.mp3', slow: '/audio/phonemes/ih_slow.mp3', articulation: '/audio/phonemes/ih_teaching.mp3' },
      'AA': { isolated: '/audio/phonemes/aa_isolated.mp3', slow: '/audio/phonemes/aa_slow.mp3', articulation: '/audio/phonemes/aa_teaching.mp3' },
      'AH': { isolated: '/audio/phonemes/ah_isolated.mp3', slow: '/audio/phonemes/ah_slow.mp3', articulation: '/audio/phonemes/ah_teaching.mp3' },
      'AO': { isolated: '/audio/phonemes/ao_isolated.mp3', slow: '/audio/phonemes/ao_slow.mp3', articulation: '/audio/phonemes/ao_teaching.mp3' },
      'UH': { isolated: '/audio/phonemes/uh_isolated.mp3', slow: '/audio/phonemes/uh_slow.mp3', articulation: '/audio/phonemes/uh_teaching.mp3' },
      'ER': { isolated: '/audio/phonemes/er_isolated.mp3', slow: '/audio/phonemes/er_slow.mp3', articulation: '/audio/phonemes/er_teaching.mp3' },
      'IY': { isolated: '/audio/phonemes/iy_isolated.mp3', slow: '/audio/phonemes/iy_slow.mp3', articulation: '/audio/phonemes/iy_teaching.mp3' },
      'UW': { isolated: '/audio/phonemes/uw_isolated.mp3', slow: '/audio/phonemes/uw_slow.mp3', articulation: '/audio/phonemes/uw_teaching.mp3' },
      'EY': { isolated: '/audio/phonemes/ey_isolated.mp3', slow: '/audio/phonemes/ey_slow.mp3', articulation: '/audio/phonemes/ey_teaching.mp3' },
      'AY': { isolated: '/audio/phonemes/ay_isolated.mp3', slow: '/audio/phonemes/ay_slow.mp3', articulation: '/audio/phonemes/ay_teaching.mp3' },
      'OW': { isolated: '/audio/phonemes/ow_isolated.mp3', slow: '/audio/phonemes/ow_slow.mp3', articulation: '/audio/phonemes/ow_teaching.mp3' },
      'AW': { isolated: '/audio/phonemes/aw_isolated.mp3', slow: '/audio/phonemes/aw_slow.mp3', articulation: '/audio/phonemes/aw_teaching.mp3' },
      'OY': { isolated: '/audio/phonemes/oy_isolated.mp3', slow: '/audio/phonemes/oy_slow.mp3', articulation: '/audio/phonemes/oy_teaching.mp3' }
    };
  }

  async getCorrectionAudios(phoneme) {
    try {
      const docRef = doc(db, 'PhonemeAudio', phoneme);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      const fallback = this.phonemeAudioMap[phoneme];
      if (!fallback) {
        console.warn(`⚠️ Missing correction audio for phoneme: ${phoneme}`);
        return { isolated: null, slow: null, articulation: null };
      }
      
      return fallback;
    } catch (error) {
      console.error('Error fetching correction audios:', error);
      const fallback = this.phonemeAudioMap[phoneme];
      if (!fallback) {
        console.warn(`⚠️ Missing correction audio for phoneme: ${phoneme}`);
      }
      return fallback || { isolated: null, slow: null, articulation: null };
    }
  }

  async getMultipleCorrectionAudios(phonemes) {
    const results = [];
    for (const phoneme of phonemes) {
      const audios = await this.getCorrectionAudios(phoneme);
      results.push({ phoneme, ...audios });
    }
    return results;
  }
}
