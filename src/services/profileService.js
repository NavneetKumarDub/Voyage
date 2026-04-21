// Firestore CRUD for the user profile document (users/{uid}).
// Journeys and companions are handled elsewhere:
//   - journeys: /services/journeyService.js (top-level, shared via memberUids)
//   - companions: removed — replaced by live invitations.

import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase.js';

function available() {
  return isFirebaseReady() && !!db;
}

function lower(s) { return (s || '').toString().trim().toLowerCase(); }

export async function getProfile(uid) {
  if (!available() || !uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function initProfileFromAuth(user) {
  if (!available() || !user?.uid) return null;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  // Always upsert the searchable fields so previously-created docs
  // get backfilled with emailLower / nameLower on next sign-in.
  const searchable = {
    uid: user.uid,
    email: user.email || '',
    emailLower: lower(user.email),
    name: user.name || '',
    nameLower: lower(user.name),
    photo: user.photo || ''
  };

  if (!snap.exists()) {
    const seed = {
      ...searchable,
      onboarded: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, seed);
    return seed;
  }

  await updateDoc(ref, { ...searchable, updatedAt: serverTimestamp() });
  return { ...snap.data(), ...searchable };
}

export async function saveProfile(uid, patch) {
  if (!available() || !uid) return;
  const withIndex = { ...patch };
  if (patch && typeof patch.name === 'string') withIndex.nameLower = lower(patch.name);
  if (patch && typeof patch.email === 'string') withIndex.emailLower = lower(patch.email);
  await updateDoc(doc(db, 'users', uid), { ...withIndex, updatedAt: serverTimestamp() });
}
