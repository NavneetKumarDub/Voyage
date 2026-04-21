import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseReady } from './firebase.js';

export function authAvailable() {
  return isFirebaseReady() && !!auth;
}

export async function signInWithGoogle() {
  if (!authAvailable()) throw new Error('Firebase not configured');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return shapeUser(result.user);
}

export async function signOut() {
  if (!authAvailable()) return;
  await fbSignOut(auth);
}

export function onAuthChange(cb) {
  if (!authAvailable()) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (u) => cb(u ? shapeUser(u) : null));
}

function shapeUser(u) {
  return {
    uid: u.uid,
    email: u.email,
    name: u.displayName,
    photo: u.photoURL
  };
}
