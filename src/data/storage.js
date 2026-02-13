import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTEMPTS_KEY = '@speakup_attempts';

export const saveAttempt = async (attempt) => {
  try {
    const existing = await getAttempts();
    const updated = [...existing, { ...attempt, timestamp: new Date().toISOString() }];
    await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving attempt:', error);
    return [];
  }
};

export const getAttempts = async () => {
  try {
    const data = await AsyncStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting attempts:', error);
    return [];
  }
};
