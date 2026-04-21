import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase.js';

function available() { return isFirebaseReady() && !!db; }

// ──────────── Shared, journey-scoped photos ────────────
// Stored at /journeys/{journeyId}/photos. Any member of the journey can
// add/read; only the uploader (or host) should delete — the UI enforces this.

export async function addJourneyPhoto(journeyId, uploader, { dataURL, caption = '', stopOrder = null }) {
  if (!available() || !journeyId || !uploader?.uid) return null;
  const entry = {
    dataURL,
    caption,
    stopOrder,
    uploadedByUid: uploader.uid,
    uploadedByName: uploader.name || '',
    uploadedByPhoto: uploader.photo || '',
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'journeys', journeyId, 'photos'), entry);
  return { id: ref.id, ...entry };
}

export function subscribeJourneyPhotos(journeyId, callback) {
  if (!available() || !journeyId) { callback([]); return () => {}; }
  const q = query(
    collection(db, 'journeys', journeyId, 'photos'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error('subscribeJourneyPhotos error:', err);
      callback([]);
    }
  );
}

export async function listJourneyPhotos(journeyId) {
  if (!available() || !journeyId) return [];
  const q = query(
    collection(db, 'journeys', journeyId, 'photos'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteJourneyPhoto(journeyId, photoId) {
  if (!available() || !journeyId || !photoId) return;
  await deleteDoc(doc(db, 'journeys', journeyId, 'photos', photoId));
}
