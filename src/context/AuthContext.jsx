import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthChange, signInWithGoogle, signOut, authAvailable } from '../services/authService.js';
import { syncSavedFromLocal, listComics } from '../services/dbService.js';
import { initProfileFromAuth, getProfile, saveProfile } from '../services/profileService.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useLocalStorage('voyage:guest', false);
  const available = authAvailable();

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        setGuestMode(false);
        const p = await initProfileFromAuth(u);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setReady(true);
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [setGuestMode]);

  const signIn = useCallback(async () => {
    if (!available) {
      alert('Firebase not configured. Add your Firebase config to .env.local and restart.');
      return;
    }
    try {
      const u = await signInWithGoogle();
      setUser(u);
      // Merge any anonymous localStorage saved comics into the account
      try {
        const raw = localStorage.getItem('voyage:saved');
        const local = raw ? JSON.parse(raw) : [];
        if (Array.isArray(local) && local.length) {
          await syncSavedFromLocal(u.uid, local);
        }
      } catch {}
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        alert('Sign-in failed: ' + (e.message || 'unknown error'));
      }
    }
  }, [available]);

  const signOutUser = useCallback(async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (!user) return;
    await saveProfile(user.uid, patch);
    const fresh = await getProfile(user.uid);
    setProfile(fresh);
  }, [user]);

  const continueAsGuest = useCallback(() => {
    setGuestMode(true);
  }, [setGuestMode]);

  const isAuthed = !!user;
  const isGuest = !user && guestMode;
  const isOnboarded = !!profile?.onboarded;

  return (
    <AuthCtx.Provider value={{
      user, profile, ready, available,
      isAuthed, isGuest, isOnboarded,
      signIn, signOut: signOutUser,
      continueAsGuest,
      updateProfile,
      setProfile
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Helper hook: fetches current user's saved comics from Firestore
export function useCloudSaved() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const list = await listComics(user.uid);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);
  return { items, loading, refresh };
}
