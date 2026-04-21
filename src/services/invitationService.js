// Real-time invitations for travel plans.
// Uses Firestore onSnapshot subscriptions — effectively a server-push stream
// (the same mechanism that powers chat / realtime presence features).
//
// Data shape (top-level `invitations` collection so two distinct users can
// read the same doc):
//   {
//     id, fromUid, fromName, fromEmail, fromPhoto,
//     toEmail (lower-cased), toUid (null until accepted),
//     itinerary, itineraryMood, itineraryCity,
//     status: 'pending' | 'accepted' | 'declined' | 'cancelled',
//     createdAt, respondedAt
//   }

import {
  collection, addDoc, doc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase.js';

function available() {
  return isFirebaseReady() && !!db;
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export async function sendInvitation(fromUser, toEmail, itinerary, note = '', pickedUser = null, journeyId = null) {
  if (!available()) throw new Error('Firebase is not configured');
  if (!fromUser?.uid) throw new Error('You must be signed in to invite people');
  const email = normalizeEmail(pickedUser?.email || toEmail);
  if (!email || !email.includes('@')) throw new Error('Please enter a valid email address');
  if (email === normalizeEmail(fromUser.email)) throw new Error("You can't invite yourself");

  const payload = {
    fromUid: fromUser.uid,
    fromName: fromUser.name || fromUser.email || 'Someone',
    fromEmail: normalizeEmail(fromUser.email),
    fromPhoto: fromUser.photo || '',
    toEmail: email,
    toUid: pickedUser?.uid || null,
    toName: pickedUser?.name || '',
    toPhoto: pickedUser?.photo || '',
    itinerary: itinerary || null,
    itineraryMood: itinerary?.mood || '',
    itineraryCity: itinerary?.city || '',
    itineraryTagline: itinerary?.tagline || '',
    journeyId: journeyId || '',
    note: note || '',
    status: 'pending',
    createdAt: serverTimestamp(),
    respondedAt: null
  };

  const ref = await addDoc(collection(db, 'invitations'), payload);
  return { id: ref.id, ...payload };
}

// Live stream of invitations TO the signed-in user (by email).
// Returns an unsubscribe function.
export function subscribeIncoming(email, callback) {
  if (!available() || !email) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'invitations'),
    where('toEmail', '==', normalizeEmail(email))
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const tb = b.createdAt?.toMillis?.() ?? 0;
          const ta = a.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
      callback(rows);
    },
    (err) => {
      console.error('subscribeIncoming error:', err);
      callback([]);
    }
  );
}

// Live stream of invitations I have SENT.
export function subscribeOutgoing(uid, callback) {
  if (!available() || !uid) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'invitations'),
    where('fromUid', '==', uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const tb = b.createdAt?.toMillis?.() ?? 0;
          const ta = a.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
      callback(rows);
    },
    (err) => {
      console.error('subscribeOutgoing error:', err);
      callback([]);
    }
  );
}

export async function acceptInvitation(id, acceptingUser) {
  if (!available()) return;
  await updateDoc(doc(db, 'invitations', id), {
    status: 'accepted',
    toUid: acceptingUser?.uid || null,
    respondedAt: serverTimestamp()
  });
}

export async function declineInvitation(id, acceptingUser) {
  if (!available()) return;
  await updateDoc(doc(db, 'invitations', id), {
    status: 'declined',
    toUid: acceptingUser?.uid || null,
    respondedAt: serverTimestamp()
  });
}

export async function cancelInvitation(id) {
  if (!available()) return;
  await updateDoc(doc(db, 'invitations', id), {
    status: 'cancelled',
    respondedAt: serverTimestamp()
  });
}

// Non-realtime one-shot fetch (used for server-style checks / debugging).
export async function listIncomingOnce(email) {
  if (!available() || !email) return [];
  const q = query(
    collection(db, 'invitations'),
    where('toEmail', '==', normalizeEmail(email))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
