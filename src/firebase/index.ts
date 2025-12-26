
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This object represents a "null" or "disabled" Firebase state.
const nullFirebase = {
  app: null,
  auth: null,
  firestore: null,
};

// This function is memoized in the client provider, so it's safe to call it multiple times.
function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
} {
  // Check if we are in a browser environment
  if (typeof window === 'undefined') {
    return nullFirebase;
  }

  // Check if the config is valid (not placeholder)
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('your-')) {
    console.warn("Firebase config is not set. Chat history and other features requiring Firebase will be disabled.");
    return nullFirebase;
  }

  try {
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return { app, auth, firestore };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return nullFirebase;
  }
}

export { initializeFirebase };

export * from './provider';
export * from './client-provider';
