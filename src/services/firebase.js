import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
