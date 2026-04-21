// Shared journeys — top-level `journeys` collection.
//
// Lifecycle:
//   planning  — plan exists, host hasn't hit "Start" yet; invitees who accept
//               are added to memberUids so they can preview it as a "Shared Trip"
//   active    — host has started; progress is tracked live
//   completed — host marked it done
//   abandoned — host ended early
//
// Only the host may transition state or mark stops visited.
// All members (host + accepted invitees) can READ the journey in realtime
// and contribute photos.
//
// Shape:
//   {
//     id, hostUid, hostEmail, hostName, hostPhoto,
//     memberUids: [hostUid, ...acceptedInviteeUids],
//     members: [{ uid, email, name, photo, role: 'host'|'member' }],
//     itinerary, mood, city, tagline,
//     status: 'planning' | 'active' | 'completed' | 'abandoned',
//     visitedStops: { [order]: timestampMs },
//     plannedAt, startedAt, completedAt, endedAt
//   }

import {
  collection, addDoc, doc, updateDoc, getDocs, getDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, arrayUnion, limit
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase.js';

function available() { return isFirebaseReady() && !!db; }

function meMember(user, role = 'host') {
  return {
    uid: user.uid,
    email: (user.email || '').toLowerCase(),
    name: user.name || '',
    photo: user.photo || '',
    role
  };
}

function planMatches(j, itinerary) {
  if (!j || !itinerary) return false;
  return (
    j.mood === (itinerary.mood || '') &&
    j.city === (itinerary.city || '') &&
    j.tagline === (itinerary.tagline || '')
  );
}

// Create a journey record the moment a host wants to co-plan with invitees.
// Status starts as 'planning' so the host can preview it and invitees who
// accept show up as members BEFORE the trip actually starts.
export async function createPlanningJourney(hostUser, itinerary) {
  if (!available()) throw new Error('Firebase not configured');
  if (!hostUser?.uid) throw new Error('Sign in first');
  if (!itinerary) throw new Error('No itinerary to plan');

  const host = meMember(hostUser, 'host');
  const payload = {
    hostUid: host.uid,
    hostEmail: host.email,
    hostName: host.name,
    hostPhoto: host.photo,
    memberUids: [host.uid],
    memberEmails: [host.email],
    members: [host],
    itinerary,
    mood: itinerary.mood || '',
    city: itinerary.city || '',
    tagline: itinerary.tagline || '',
    status: 'planning',
    visitedStops: {},
    plannedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'journeys'), payload);
  return ref.id;
}

// Find the most recent planning-status journey for this host + itinerary.
async function findPlanningJourneyForPlan(hostUid, itinerary) {
  if (!available() || !hostUid || !itinerary) return null;
  const q = query(
    collection(db, 'journeys'),
    where('hostUid', '==', hostUid),
    where('mood', '==', itinerary.mood || ''),
    where('city', '==', itinerary.city || ''),
    where('status', '==', 'planning')
  );
  const snap = await getDocs(q);
  const candidates = snap.docs
    .map((d) => ({ id: d.id, ref: d.ref, data: d.data() }))
    .filter((x) => planMatches(x.data, itinerary));
  return candidates[0] || null;
}

// "Start journey" — either promotes a planning journey to active or creates
// a brand-new active journey if the host never invited anyone.
export async function startJourney(hostUser, itinerary) {
  if (!available()) throw new Error('Firebase not configured');
  if (!hostUser?.uid) throw new Error('Sign in to start a journey');
  if (!itinerary) throw new Error('No itinerary to start');

  const existing = await findPlanningJourneyForPlan(hostUser.uid, itinerary);
  if (existing) {
    await updateDoc(existing.ref, {
      status: 'active',
      startedAt: serverTimestamp()
    });
    return existing.id;
  }

  const host = meMember(hostUser, 'host');
  const payload = {
    hostUid: host.uid,
    hostEmail: host.email,
    hostName: host.name,
    hostPhoto: host.photo,
    memberUids: [host.uid],
    memberEmails: [host.email],
    members: [host],
    itinerary,
    mood: itinerary.mood || '',
    city: itinerary.city || '',
    tagline: itinerary.tagline || '',
    status: 'active',
    visitedStops: {},
    plannedAt: serverTimestamp(),
    startedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'journeys'), payload);
  return ref.id;
}

// Listen to all journeys the user is a member of — host or invitee.
export function subscribeMyJourneys(uid, callback) {
  if (!available() || !uid) { callback([]); return () => {}; }
  const q = query(
    collection(db, 'journeys'),
    where('memberUids', 'array-contains', uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = (a.startedAt || a.plannedAt)?.toMillis?.() ?? 0;
          const tb = (b.startedAt || b.plannedAt)?.toMillis?.() ?? 0;
          return tb - ta;
        });
      callback(rows);
    },
    (err) => {
      console.error('subscribeMyJourneys error:', err);
      callback([]);
    }
  );
}

// Only host can mark a stop visited. Firestore rules should enforce this too.
export async function markStopVisited(hostUser, journeyId, order) {
  if (!available() || !hostUser?.uid || !journeyId) return;
  const ref = doc(db, 'journeys', journeyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const j = snap.data();
  if (j.hostUid !== hostUser.uid) throw new Error('Only the host can update journey progress');
  const visited = { ...(j.visitedStops || {}) };
  visited[order] = Date.now();
  await updateDoc(ref, { visitedStops: visited });
}

export async function completeJourney(hostUser, journeyId) {
  if (!available() || !hostUser?.uid || !journeyId) return;
  const ref = doc(db, 'journeys', journeyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().hostUid !== hostUser.uid) throw new Error('Only the host can complete the journey');
  await updateDoc(ref, { status: 'completed', completedAt: serverTimestamp() });
}

export async function endJourney(hostUser, journeyId) {
  if (!available() || !hostUser?.uid || !journeyId) return;
  const ref = doc(db, 'journeys', journeyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().hostUid !== hostUser.uid) throw new Error('Only the host can end the journey');
  await updateDoc(ref, { status: 'abandoned', endedAt: serverTimestamp() });
}

export async function deleteJourney(hostUser, journeyId) {
  if (!available() || !hostUser?.uid || !journeyId) return;
  const ref = doc(db, 'journeys', journeyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().hostUid !== hostUser.uid) throw new Error('Only the host can delete the journey');
  await deleteDoc(ref);
}

// Add accepting user to a journey (planning OR active) for this host+plan.
// Used when an invitee accepts an invitation.
export async function joinJourney({ journeyId, hostUid, acceptingUser, itinerary }) {
  if (!available() || !acceptingUser?.uid) return null;

  let docRef = null;
  let data = null;

  if (journeyId) {
    const ref = doc(db, 'journeys', journeyId);
    const snap = await getDoc(ref);
    if (snap.exists()) { docRef = ref; data = snap.data(); }
  }

  if (!docRef && hostUid && itinerary) {
    const q = query(
      collection(db, 'journeys'),
      where('hostUid', '==', hostUid),
      where('mood', '==', itinerary?.mood || ''),
      where('city', '==', itinerary?.city || ''),
      where('status', 'in', ['planning', 'active']),
      limit(5)
    );
    const snap = await getDocs(q);
    const match = snap.docs.find((d) => planMatches(d.data(), itinerary));
    if (match) { docRef = match.ref; data = match.data(); }
  }

  if (!docRef) return null;

  if ((data.memberUids || []).includes(acceptingUser.uid)) {
    return docRef.id;
  }
  const me = meMember(acceptingUser, 'member');
  await updateDoc(docRef, {
    memberUids: arrayUnion(acceptingUser.uid),
    memberEmails: arrayUnion(me.email),
    members: [...(data.members || []), me]
  });
  return docRef.id;
}
