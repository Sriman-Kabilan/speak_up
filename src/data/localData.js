/**
 * Local Fallback Data for SpeakUp
 * Used whenever Cloud Firestore is empty, offline, or inaccessible.
 */

export const GUEST_USER = {
  uid: 'guest_user',
  email: 'guest@speakup.local',
  name: 'Demo Learner',
  isGuest: true
};

export const LOCAL_LESSONS = [
  {
    id: 'SHORT_VOWELS',
    lesson_id: 'SHORT_VOWELS',
    title: 'Short Vowels',
    category: 'Vowels',
    level: 'Beginner',
    difficulty: 1,
    hint: 'Practice short vowel sounds',
    order: 1
  },
  {
    id: 'ALPHABET_SOUNDS',
    lesson_id: 'ALPHABET_SOUNDS',
    title: 'Alphabet Sounds',
    category: 'Basic',
    level: 'Beginner',
    difficulty: 1,
    hint: 'Learn to pronounce each letter clearly',
    order: 2
  },
  {
    id: 'LONG_VOWELS',
    lesson_id: 'LONG_VOWELS',
    title: 'Long Vowels',
    category: 'Vowels',
    level: 'Beginner',
    difficulty: 1,
    hint: 'Master long vowel pronunciation',
    order: 3
  },
  {
    id: 'TH_SOUND',
    lesson_id: 'TH_SOUND',
    title: 'TH Sound',
    category: 'Consonants',
    level: 'Intermediate',
    difficulty: 2,
    hint: 'Place tongue between teeth',
    order: 4
  },
  {
    id: 'V_W',
    lesson_id: 'V_W',
    title: 'V vs W',
    category: 'Consonants',
    level: 'Intermediate',
    difficulty: 2,
    hint: 'Distinguish V and W sounds',
    order: 5
  },
  {
    id: 'R_L',
    lesson_id: 'R_L',
    title: 'R vs L',
    category: 'Consonants',
    level: 'Intermediate',
    difficulty: 2,
    hint: 'Master R and L sounds',
    order: 6
  },
  {
    id: 'GREETINGS',
    lesson_id: 'GREETINGS',
    title: 'Greetings',
    category: 'Phrases',
    level: 'Beginner',
    difficulty: 1,
    hint: 'Common greeting phrases',
    order: 7
  },
  {
    id: 'WORKPLACE',
    lesson_id: 'WORKPLACE',
    title: 'Workplace',
    category: 'Phrases',
    level: 'Intermediate',
    difficulty: 2,
    hint: 'Professional vocabulary',
    order: 8
  },
  {
    id: 'SENTENCES',
    lesson_id: 'SENTENCES',
    title: 'Daily Sentences',
    category: 'Sentences',
    level: 'Advanced',
    difficulty: 3,
    hint: 'Complete sentence practice',
    order: 9
  },
  {
    id: 'LONG_SENTENCES',
    lesson_id: 'LONG_SENTENCES',
    title: 'Long Sentences',
    category: 'Sentences',
    level: 'Advanced',
    difficulty: 3,
    hint: 'Complex sentence structures',
    order: 10
  }
];

const RAW_EXERCISES = {
  ALPHABET_SOUNDS: [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ],
  SHORT_VOWELS: [
    'cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat',
    'bed', 'red', 'led', 'fed', 'wed', 'shed', 'sled',
    'sit', 'bit', 'hit', 'kit', 'lit', 'fit', 'pit',
    'pot', 'hot', 'dot'
  ],
  LONG_VOWELS: [
    'cake', 'make', 'take', 'bake', 'lake', 'wake', 'sake',
    'feet', 'meet', 'greet', 'sweet', 'sheet', 'fleet',
    'time', 'lime', 'dime', 'chime', 'mime', 'prime',
    'home', 'dome', 'rome', 'chrome',
    'blue', 'true'
  ],
  TH_SOUND: [
    'think', 'thank', 'thick', 'thin', 'thing',
    'three', 'throw', 'through', 'thought', 'thumb', 'thief',
    'this', 'that', 'those', 'them', 'they',
    'there', 'then', 'the', 'these', 'though',
    'thus', 'than', 'their', 'theme'
  ],
  V_W: [
    'vine', 'wine', 'vet', 'wet', 'vest', 'west',
    'very', 'wary', 'veil', 'wail', 'vow', 'wow',
    'vote', 'wrote', 'van', 'wan', 'vane', 'wane',
    'vale', 'wale', 'verse', 'worse', 'vent', 'went', 'veal'
  ],
  R_L: [
    'right', 'light', 'read', 'lead', 'red', 'led',
    'rest', 'lest', 'race', 'lace', 'rock', 'lock',
    'road', 'load', 'ray', 'lay', 'rip', 'lip',
    'rake', 'lake', 'rice', 'lice', 'row', 'low', 'rent'
  ],
  GREETINGS: [
    'hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'good night',
    'how are you', 'nice to meet you', 'pleased to meet you', 'goodbye',
    'see you later', 'take care', 'have a nice day', 'welcome', 'thank you',
    'thanks', "you're welcome", 'excuse me', 'sorry', 'pardon me',
    'how do you do', "what's up", 'hey there', 'long time no see', 'catch you later'
  ],
  WORKPLACE: [
    'meeting', 'project', 'deadline', 'report', 'presentation',
    'email', 'schedule', 'conference', 'client', 'manager',
    'colleague', 'office', 'task', 'budget', 'proposal',
    'agenda', 'strategy', 'team', 'department', 'supervisor',
    'employee', 'contract', 'invoice', 'revenue', 'profit'
  ],
  SENTENCES: [
    'I would like to attend the meeting',
    'Could you please repeat that',
    'Thank you for your help',
    'I appreciate your time',
    'Let me know if you need anything',
    'I will send you the report',
    'Can we schedule a call',
    'I look forward to hearing from you',
    'Please find the attachment',
    'I have a question about this',
    'Could you clarify that point',
    'I understand your concern',
    'That sounds great',
    'I agree with you',
    'Let me think about it',
    'I will get back to you',
    'Please let me know',
    'I am available tomorrow',
    'What time works for you',
    'I will be there',
    'See you soon',
    'Have a great day',
    'Thanks for the update',
    'I will follow up',
    'Please confirm'
  ],
  LONG_SENTENCES: [
    'I would appreciate it if you could send me the details by the end of the day',
    'Could you please provide more information about the project timeline and deliverables',
    'I am writing to inform you that the meeting has been rescheduled to next week',
    'Thank you for taking the time to discuss this matter with me yesterday afternoon',
    'I wanted to follow up on our conversation regarding the new marketing strategy',
    'Please let me know if you have any questions or concerns about the proposal',
    'I look forward to working with you on this exciting new project in the coming months',
    'Could you please confirm your availability for the conference call scheduled for tomorrow',
    'I am pleased to announce that we have successfully completed the first phase of the project',
    'Thank you for your patience and understanding during this transition period',
    'I would like to schedule a meeting to discuss the budget allocation for next quarter',
    'Please review the attached document and provide your feedback by Friday',
    'I am confident that we can achieve our goals if we work together as a team',
    'Could you please update me on the status of the client presentation',
    'I appreciate your dedication and hard work on this challenging assignment',
    'Please make sure to submit your reports before the deadline next Monday',
    'I would like to congratulate you on your excellent performance this quarter',
    'Could you please arrange a meeting with all the stakeholders next week',
    'I am writing to request your approval for the proposed changes to the project plan',
    'Thank you for bringing this important issue to my attention',
    'I will make sure to address your concerns in the upcoming meeting',
    'Please feel free to contact me if you need any further assistance',
    'I would like to express my gratitude for your continued support and cooperation',
    'Could you please provide an update on the progress of the implementation phase',
    'I am looking forward to seeing the results of your hard work and dedication'
  ]
};

const getHint = (lessonId, text) => {
  const hints = {
    ALPHABET_SOUNDS: `Pronounce the letter "${text}" clearly`,
    SHORT_VOWELS: `Say "${text}" with a short vowel sound`,
    LONG_VOWELS: `Say "${text}" with a long vowel sound`,
    TH_SOUND: `Place your tongue between your teeth for "${text}"`,
    V_W: `Focus on the starting sound of "${text}"`,
    R_L: `Distinguish R and L in "${text}"`,
    GREETINGS: `Practice this common greeting: "${text}"`,
    WORKPLACE: `Professional term: "${text}"`,
    SENTENCES: `Practice this complete sentence naturally`,
    LONG_SENTENCES: `Practice this complex sentence with proper intonation`
  };
  return hints[lessonId] || `Practice saying: "${text}"`;
};

// Map each exercise to full schema object
export const LOCAL_EXERCISES = {};

Object.entries(RAW_EXERCISES).forEach(([lessonId, list]) => {
  LOCAL_EXERCISES[lessonId] = list.map((text, idx) => {
    const exerciseId = `${lessonId}_${String(idx + 1).padStart(3, '0')}`;
    const sanitized = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return {
      id: exerciseId,
      exercise_id: exerciseId,
      lesson_id: lessonId,
      text: text,
      hint: getHint(lessonId, text),
      order: idx + 1,
      audio_url: `audio/${lessonId.toLowerCase()}/${sanitized}.mp3`
    };
  });
});

export const getLocalExercises = (lessonId) => {
  return LOCAL_EXERCISES[lessonId] || [];
};
