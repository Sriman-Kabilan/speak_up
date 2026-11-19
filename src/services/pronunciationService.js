// Pronunciation evaluation service
// Real DTW comparison will be added here later.

export const simulatePronunciationResult = (exercise) => {
  // Generate random score between 60-95
  const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
  
  const isCorrect = score > 80;
  
  let result = {
    score,
    status: isCorrect ? 'correct' : 'needs_improvement',
    wrongSound: null,
    tips: [],
    mouth_position: exercise.mouth_position || 'Standard position'
  };
  
  if (!isCorrect && exercise.common_errors && exercise.common_errors.length > 0) {
    // Pick random error from common_errors
    const randomError = exercise.common_errors[Math.floor(Math.random() * exercise.common_errors.length)];
    result.wrongSound = randomError;
    result.tips = exercise.correction_tips || [];
  }
  
  return result;
};

// Generate TTS audio URL (placeholder - will use actual TTS service)
export const generateTTSAudio = async (text) => {
  // For now, return a placeholder URL
  // In production, integrate with Google TTS, Expo Speech, or similar
  console.log('Generating TTS for:', text);
  
  // Placeholder: Use ResponsiveVoice or similar web TTS
  // This would be replaced with actual TTS API call
  const ttsUrl = `https://api.responsivevoice.org/v1/text:synthesize?text=${encodeURIComponent(text)}&lang=en-US&engine=g1&name=US%20English%20Female&pitch=0.5&rate=0.5&volume=1`;
  
  return ttsUrl;
};

// Check if exercise has reference audio, generate if missing
export const ensureReferenceAudio = async (exercise) => {
  if (exercise.reference_audio && exercise.reference_audio.trim() !== '') {
    return exercise.reference_audio;
  }
  
  // Generate TTS audio
  const audioUrl = await generateTTSAudio(exercise.text);
  return audioUrl;
};
