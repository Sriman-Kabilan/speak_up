import { doc, setDoc, getDoc, query, collection, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { GUEST_USER } from '../data/localData';

export const GUEST_ACCOUNT = GUEST_USER;

let currentUser = GUEST_ACCOUNT;
let authListeners = [];

// Test accounts for demo purposes
const TEST_ACCOUNTS = [
  {
    email: 'test@test.com',
    password: 'test',
    name: 'Test User',
    uid: 'test_user'
  },
  {
    email: 'guest@speakup.local',
    password: '',
    name: 'Demo Learner',
    uid: 'guest_user'
  },
  {
    email: 'demo@speakup.local',
    password: 'demo',
    name: 'Demo Learner',
    uid: 'demo_user'
  }
];

export const loginAsGuest = () => {
  currentUser = GUEST_ACCOUNT;
  notifyListeners(currentUser);
  return currentUser;
};

// Simple auth using Firestore with offline/guest fallback
export const signUp = async (name, email, password) => {
  // Test/Demo account bypass
  const matchedTest = TEST_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (matchedTest) {
    currentUser = { uid: matchedTest.uid, email: matchedTest.email, name: name || matchedTest.name };
    notifyListeners(currentUser);
    return currentUser;
  }

  // Firebase not available fallback: create local user
  if (!db) {
    console.log('ℹ️ Firebase unavailable - creating local offline account');
    const uid = 'local_' + Date.now();
    currentUser = { uid, email, name: name || 'Learner' };
    notifyListeners(currentUser);
    return currentUser;
  }

  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('Email already exists');
    }

    const uid = 'user_' + Date.now();

    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      password,
      created_at: serverTimestamp()
    });

    currentUser = { uid, email, name };
    notifyListeners(currentUser);
    return currentUser;
  } catch (error) {
    if (error.message === 'Email already exists') {
      throw error;
    }
    console.warn('⚠️ Firestore signup failed, falling back to local account:', error.message);
    const uid = 'local_' + Date.now();
    currentUser = { uid, email, name: name || 'Learner' };
    notifyListeners(currentUser);
    return currentUser;
  }
};

export const signIn = async (email, password) => {
  // Test / Guest account bypass
  const matchedTest = TEST_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (matchedTest) {
    if (!matchedTest.password || matchedTest.password === password) {
      currentUser = { uid: matchedTest.uid, email: matchedTest.email, name: matchedTest.name };
      notifyListeners(currentUser);
      return currentUser;
    }
  }

  if (email.toLowerCase().includes('guest') || email.toLowerCase().includes('demo')) {
    return loginAsGuest();
  }

  // Firebase not available fallback
  if (!db) {
    console.log('ℹ️ Firebase unavailable - signing in as local user');
    currentUser = { uid: 'local_' + Date.now(), email, name: email.split('@')[0] };
    notifyListeners(currentUser);
    return currentUser;
  }

  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('User not found');
    }

    const userData = snapshot.docs[0].data();

    if (userData.password !== password) {
      throw new Error('Invalid password');
    }

    currentUser = { uid: userData.uid, email: userData.email, name: userData.name };
    notifyListeners(currentUser);
    return currentUser;
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      throw error;
    }
    console.warn('⚠️ Firestore sign in error, using local session:', error.message);
    currentUser = { uid: 'local_' + Date.now(), email, name: email.split('@')[0] };
    notifyListeners(currentUser);
    return currentUser;
  }
};

export const logout = async () => {
  // Reset to guest account so lessons/practice remain accessible
  currentUser = GUEST_ACCOUNT;
  notifyListeners(currentUser);
};

export const getCurrentUser = () => {
  return currentUser || GUEST_ACCOUNT;
};

export const onAuthChange = (callback) => {
  authListeners.push(callback);
  callback(getCurrentUser());

  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
};

export const getUserData = async (uid) => {
  if (uid === GUEST_ACCOUNT.uid) {
    return GUEST_ACCOUNT;
  }
  if (!db) return null;

  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    return null;
  }
};

const notifyListeners = (user) => {
  authListeners.forEach(listener => listener(user));
};
