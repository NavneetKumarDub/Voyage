// Firebase initialization with graceful fallback.
// If env vars are missing, isFirebaseReady() returns false and the app
// runs entirely on localStorage.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let auth = null;
let db = null;

export function isFirebaseReady() {
  return !!(config.apiKey && config.projectId && config.appId);
}

if (isFirebaseReady()) {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
} else {
  console.info('Firebase not configured — using localStorage only.');
}

export { app, auth, db };
