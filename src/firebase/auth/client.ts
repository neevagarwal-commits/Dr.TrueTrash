'use client';

import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signOut as signOutFirebase,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export const signInWithGoogle = async (auth: Auth) => {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
}

export const signInWithEmail = async (auth: Auth, email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with email and password', error);
    throw error;
  }
};

export const signUpWithEmail = async (auth: Auth, email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up with email and password', error);
    throw error;
  }
};

export const sendPasswordReset = async (auth: Auth, email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email', error);
    throw error;
  }
}

export const signInAsGuest = async (auth: Auth) => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously', error);
    throw error;
  }
};

export const signOut = async (auth: Auth): Promise<void> => {
  try {
    await signOutFirebase(auth);
  } catch (error) {
    console.error('Error signing out', error);
    throw error;
  }
};
