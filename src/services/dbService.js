// Firestore CRUD for saved comics, mood history, preferences.
// Automatically no-ops when Firebase isn't configured.

import {
  doc, setDoc, deleteDoc, getDoc, collection, getDocs,
  query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase.js';

export function dbAvailable() {
  return isFirebaseReady() && !!db;
}

// ── Saved comics ──
const SAVED = (uid) => `users/${uid}/saved`;

export async function saveComic(uid, id, itinerary) {
  if (!dbAvailable() || !uid) return null;
  const ref = doc(db, SAVED(uid), id);
  await setDoc(ref, {
    id,
    itinerary,
    savedAt: serverTimestamp(),
    mood: itinerary.mood || '',
    city: itinerary.city || ''
  });
  return id;
}

export async function deleteComic(uid, id) {
  if (!dbAvailable() || !uid) return;
  await deleteDoc(doc(db, SAVED(uid), id));
}

export async function listComics(uid) {
  if (!dbAvailable() || !uid) return [];
  const q = query(collection(db, SAVED(uid)), orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ── Preferences ──
const PREFS = (uid) => `users/${uid}/prefs/default`;

export async function getPrefs(uid) {
  if (!dbAvailable() || !uid) return null;
  const snap = await getDoc(doc(db, PREFS(uid)));
  return snap.exists() ? snap.data() : null;
}

export async function setPrefs(uid, prefs) {
  if (!dbAvailable() || !uid) return;
  await setDoc(doc(db, PREFS(uid)), prefs, { merge: true });
}

// ── Bulk sync of localStorage saved items at sign-in ──
export async function syncSavedFromLocal(uid, localSaved) {
  if (!dbAvailable() || !uid || !Array.isArray(localSaved)) return;
  await Promise.all(
    localSaved.map((entry) => saveComic(uid, entry.id, entry.itinerary))
  );
}
