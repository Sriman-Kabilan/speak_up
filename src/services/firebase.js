import { Platform } from 'react-native';

let db = null;
let auth = null;

// Initialize Firebase on all platforms
try {
  const { initializeApp } = require('firebase/app');
  const { getFirestore } = require('firebase/firestore');
  
  const firebaseConfig = {
    apiKey: "AIzaSyBf2qnCINZF1prlSWUpkXUOuFg7xb3uIWU",
    authDomain: "speakup-cbe48.firebaseapp.com",
    projectId: "speakup-cbe48",
    storageBucket: "speakup-cbe48.firebasestorage.app",
    messagingSenderId: "741469611112",
    appId: "1:741469611112:web:5452ec386d7984fa65c7dd",
    measurementId: "G-70L5LMC3CK"
  };
  
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Platform-specific Auth initialization
  if (Platform.OS === 'web') {
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  } else {
    // React Native with AsyncStorage persistence
    try {
      const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
    } catch (authError) {
      console.warn('⚠️ AsyncStorage auth failed, using default:', authError.message);
      const { getAuth } = require('firebase/auth');
      auth = getAuth(app);
    }
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  db = null;
  auth = null;
}

export { db, auth };
