// Test Firebase Auth Setup
// Run this in browser console after app loads to test auth

import { signUp, signIn, getCurrentUser } from './src/services/authService';

// Test sign up
export const testSignUp = async () => {
  try {
    console.log('Testing sign up...');
    const user = await signUp('Test User', 'test@example.com', 'password123');
    console.log('Sign up successful!', user);
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
};

// Test sign in
export const testSignIn = async () => {
  try {
    console.log('Testing sign in...');
    const user = await signIn('test@example.com', 'password123');
    console.log('Sign in successful!', user);
  } catch (error) {
    console.error('Sign in failed:', error.message);
  }
};

// Check current user
export const checkUser = () => {
  const user = getCurrentUser();
  console.log('Current user:', user);
};
