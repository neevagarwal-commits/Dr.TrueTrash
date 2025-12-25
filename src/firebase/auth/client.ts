'use client';

import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as signOutFirebase,
} from 'firebase/auth';

export const signInWithGoogle = async (auth: Auth): Promise<void> => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google', error);
  }
};

export const signOut = async (auth: Auth): Promise<void> => {
  try {
    await signOutFirebase(auth);
  } catch (error) {
    console.error('Error signing out', error);
  }
};
