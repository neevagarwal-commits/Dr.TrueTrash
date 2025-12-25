
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
  // Check if we are in a browser environment and if the config is valid
  if (typeof window === 'undefined' || !firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
    // Return null if not in browser or if config is placeholder
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
