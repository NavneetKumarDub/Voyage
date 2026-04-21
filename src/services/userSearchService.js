// Search indexed users from the top-level `users` collection.
// Matches partial prefixes of email OR name (case-insensitive) — the
// same pattern used by most "@-mention" people pickers.
//
// Firestore doesn't support substring search, so we run two parallel
// prefix queries (`>=` term and `<` term + '') and merge them.

import {
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase.js';

const MAX = 8;
const SUFFIX = '';

function normalize(s) { return (s || '').trim().toLowerCase(); }

async function runPrefix(field, term) {
  const q = query(
    collection(db, 'users'),
    orderBy(field),
    where(field, '>=', term),
    where(field, '<', term + SUFFIX),
    limit(MAX)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function searchUsers(rawTerm, { excludeUid = '' } = {}) {
  if (!isFirebaseReady() || !db) return [];
  const term = normalize(rawTerm);
  if (term.length < 2) return [];

  try {
    const [byEmail, byName] = await Promise.all([
      runPrefix('emailLower', term),
      runPrefix('nameLower', term)
    ]);

    const map = new Map();
    [...byEmail, ...byName].forEach((u) => {
      if (!u.uid || u.uid === excludeUid) return;
      if (!map.has(u.uid)) map.set(u.uid, u);
    });

    // Score: email prefix match > name prefix match; then shorter = closer.
    const term_ = term;
    const scored = [...map.values()].map((u) => {
      const emailHit = u.emailLower?.startsWith(term_) ? 0 : 1;
      const nameHit = u.nameLower?.startsWith(term_) ? 0 : 1;
      return { u, score: emailHit * 2 + nameHit, len: (u.emailLower || '').length };
    });
    scored.sort((a, b) => a.score - b.score || a.len - b.len);
    return scored.slice(0, MAX).map((s) => s.u);
  } catch (e) {
    console.error('searchUsers failed:', e);
    return [];
  }
}
