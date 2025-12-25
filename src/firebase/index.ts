
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This function is memoized in the client provider, so it's safe to call it multiple times.
function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null {
  // Check if we are in a browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if the config is valid (not placeholder)
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('your-')) {
    console.warn("Firebase config is not set. Features requiring Firebase will be disabled.");
    return null;
  }

  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}

export { initializeFirebase };

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
