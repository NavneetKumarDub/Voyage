import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateItinerary, refineItinerary } from '../services/groqAPI.js';
import { narrateItinerary, cancelSpeech } from '../services/voiceService.js';
import { fetchWeatherForCity } from '../services/weatherAPI.js';
import { getComicImageURL } from '../services/imageAPI.js';
import { readShareURL } from '../services/exportService.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useAuth } from './AuthContext.jsx';
import { saveComic, listComics, deleteComic } from '../services/dbService.js';
import {
  startJourney as fbStartJourney,
  createPlanningJourney as fbCreatePlanningJourney,
  subscribeMyJourneys as fbSubscribeMyJourneys,
  markStopVisited as fbMarkStopVisited,
  completeJourney as fbCompleteJourney,
  endJourney as fbEndJourney,
  joinJourney as fbJoinJourney
} from '../services/journeyService.js';
import {
  sendInvitation as fbSendInvitation,
  subscribeIncoming as fbSubscribeIncoming,
  subscribeOutgoing as fbSubscribeOutgoing,
  acceptInvitation as fbAcceptInvitation,
  declineInvitation as fbDeclineInvitation,
  cancelInvitation as fbCancelInvitation
} from '../services/invitationService.js';

const Ctx = createContext(null);

export function VoyageProvider({ children }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // ── Itinerary state, persisted to localStorage so pages survive refreshes ──
  const [itinerary, setItineraryState] = useState(() => {
    try {
      const raw = localStorage.getItem('voyage:currentItinerary');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const setItinerary = useCallback((data) => {
    setItineraryState(data);
    try {
      if (data) localStorage.setItem('voyage:currentItinerary', JSON.stringify(data));
      else localStorage.removeItem('voyage:currentItinerary');
    } catch {}
  }, []);

  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(-1);
  const [city, setCity] = useLocalStorage('voyage:city', 'Delhi');
  const [userCoords, setUserCoords] = useLocalStorage('voyage:userCoords', { lat: 28.6139, lng: 77.2090, kind: 'center' });
  const [lastMood, setLastMood] = useLocalStorage('voyage:lastMood', '');
  const [persona, setPersona] = useState({ who: 'solo', budget: 'mid', pace: 'balanced' });
  const [weatherByHour, setWeatherByHour] = useState(null);

  const [saved, setSaved] = useLocalStorage('voyage:saved', []);
  const [history, setHistory] = useLocalStorage('voyage:history', []);
  const [cloudSaved, setCloudSaved] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [activeJourneyId, setActiveJourneyId] = useState(null);

  // ── Realtime invitations (Firestore push subscriptions) ──
  const [incomingInvites, setIncomingInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);

  // People queued up (before the plan is generated) to be invited along with
  // this trip. Cleared after the plan is generated and invitations fired off.
  const [plannedInvitees, setPlannedInvitees] = useState([]);

  const didNarrate = useRef(null);

  function addPlannedInvitee(userLike) {
    if (!userLike?.email) return;
    const emailLower = userLike.email.toLowerCase();
    if (user && user.email && user.email.toLowerCase() === emailLower) return; // no self
    setPlannedInvitees((list) => {
      if (list.some((i) => (i.email || '').toLowerCase() === emailLower)) return list;
      return [...list, {
        uid: userLike.uid || null,
        email: emailLower,
        name: userLike.name || '',
        photo: userLike.photo || ''
      }];
    });
  }
  function removePlannedInvitee(email) {
    const e = (email || '').toLowerCase();
    setPlannedInvitees((list) => list.filter((i) => (i.email || '').toLowerCase() !== e));
  }
  function clearPlannedInvitees() { setPlannedInvitees([]); }

  // Load cloud-saved comics on sign-in (journeys come from realtime below).
  useEffect(() => {
    if (!user) {
      setCloudSaved([]);
      setJourneys([]);
      return;
    }
    listComics(user.uid).then(setCloudSaved).catch(() => {});
  }, [user]);

  // Realtime subscriptions — open on sign-in, close on sign-out.
  useEffect(() => {
    if (!user?.uid) {
      setIncomingInvites([]);
      setOutgoingInvites([]);
      setJourneys([]);
      return;
    }
    const unsubIn = fbSubscribeIncoming(user.email, setIncomingInvites);
    const unsubOut = fbSubscribeOutgoing(user.uid, setOutgoingInvites);
    const unsubJourneys = fbSubscribeMyJourneys(user.uid, setJourneys);
    return () => {
      try { unsubIn(); } catch {}
      try { unsubOut(); } catch {}
      try { unsubJourneys(); } catch {}
    };
  }, [user?.uid, user?.email]);

  // Find (or create) a planning journey for the current plan, then return its id.
  async function ensurePlanningJourney(forItinerary) {
    const target = forItinerary || itinerary;
    if (!user || !target) return '';
    const existing = journeys.find((j) =>
      j.hostUid === user.uid &&
      (j.status === 'planning' || j.status === 'active') &&
      j.mood === (target.mood || '') &&
      j.city === (target.city || '') &&
      j.tagline === (target.tagline || '')
    );
    if (existing) return existing.id;
    try {
      return await fbCreatePlanningJourney(user, target);
    } catch (e) {
      console.warn('createPlanningJourney failed:', e?.message);
      return '';
    }
  }

  async function sendInvite(toEmail, itineraryOverride = null, note = '', pickedUser = null) {
    if (!user) throw new Error('Sign in to invite people');
    const payload = itineraryOverride || itinerary;
    if (!payload) throw new Error('No plan to share yet — create one first.');
    // Ad-hoc invites (from ShareBar/NavBar) also attach to a planning journey
    // so accepting invitees get a proper "Shared Trip" record.
    const journeyId = await ensurePlanningJourney(payload);
    return fbSendInvitation(user, toEmail, payload, note, pickedUser, journeyId);
  }
  async function acceptInvite(inv) {
    await fbAcceptInvitation(inv.id, user);
    try {
      await fbJoinJourney({
        journeyId: inv.journeyId,
        hostUid: inv.fromUid,
        acceptingUser: user,
        itinerary: inv.itinerary
      });
    } catch (e) {
      console.warn('joinJourney skipped:', e?.message);
    }
    if (inv.itinerary) {
      setItinerary(inv.itinerary);
      setLastMood(inv.itinerary.mood || '');
      setCity(inv.itinerary.city || city);
      navigate('/comic');
    }
  }
  async function declineInvite(inv) {
    await fbDeclineInvitation(inv.id, user);
  }
  async function cancelInvite(inv) {
    await fbCancelInvitation(inv.id);
  }

  const pendingIncomingCount = incomingInvites.filter((i) => i.status === 'pending').length;

  async function startJourneyNow() {
    if (!itinerary || !user) return null;
    const id = await fbStartJourney(user, itinerary);
    setActiveJourneyId(id);
    return id;
  }

  async function visitStop(order) {
    if (!user || !activeJourneyId) return;
    await fbMarkStopVisited(user, activeJourneyId, order);
  }

  async function finishJourney() {
    if (!user || !activeJourneyId) return;
    await fbCompleteJourney(user, activeJourneyId);
    setActiveJourneyId(null);
  }

  async function endJourney(id) {
    if (!user) return;
    await fbEndJourney(user, id);
    if (id === activeJourneyId) setActiveJourneyId(null);
  }

  // Pick the journey tied to the current itinerary — prefers active, falls
  // back to the most recent planning journey (so the tracker can show
  // "awaiting start" state with live member avatars).
  useEffect(() => {
    if (!itinerary) {
      if (activeJourneyId) setActiveJourneyId(null);
      return;
    }
    const matches = journeys.filter((j) =>
      (j.status === 'active' || j.status === 'planning') &&
      j.mood === (itinerary.mood || '') &&
      j.city === (itinerary.city || '') &&
      j.tagline === (itinerary.tagline || '')
    );
    const active = matches.find((j) => j.status === 'active');
    const planning = matches.find((j) => j.status === 'planning');
    const chosen = active || planning || null;
    if (chosen && chosen.id !== activeJourneyId) setActiveJourneyId(chosen.id);
    else if (!chosen && activeJourneyId) setActiveJourneyId(null);
  }, [journeys, itinerary, activeJourneyId]);

  const imagesByOrder = useMemo(() => {
    if (!itinerary?.stops) return {};
    const out = {};
    itinerary.stops.forEach((s) => {
      out[s.order] = getComicImageURL(s, itinerary);
    });
    return out;
  }, [itinerary]);

  useEffect(() => {
    const shared = readShareURL();
    if (shared?.mood) {
      setPersona(shared.persona);
      setCity(shared.city);
      handleMood(shared.mood, shared.city, shared.persona);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => cancelSpeech(), []);

  async function handleMood(mood, cityOverride = null, personaOverride = null) {
    const useCity = cityOverride || city;
    // If invitees are staged, nudge the AI to plan for the group regardless
    // of whether they eventually accept. Persona stays user-editable.
    const groupCount = 1 + plannedInvitees.length;
    const usePersona = {
      ...(personaOverride || persona),
      groupSize: groupCount,
      who: groupCount > 1 ? 'friends' : (personaOverride || persona).who
    };

    setLoading(true);
    setError('');
    setItinerary(null);
    setCurrentPanel(-1);
    setLastMood(mood);
    setWeatherByHour(null);
    cancelSpeech();
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Snapshot invitees at submit-time so late toggles don't corrupt this trip.
    const invitees = plannedInvitees.slice();

    try {
      const [data, weather] = await Promise.all([
        generateItinerary(mood, useCity, usePersona, userCoords, profile),
        fetchWeatherForCity(useCity)
      ]);
      setItinerary(data);
      setWeatherByHour(weather);
      setHistory((prev) => [{ mood, city: useCity, at: Date.now() }, ...prev.slice(0, 19)]);

      // If the user pre-selected travel buddies, create a planning journey
      // now and fire off live invitations linked to it. The plan itself was
      // already generated for the whole group.
      if (user && invitees.length > 0) {
        try {
          const journeyId = await fbCreatePlanningJourney(user, data);
          await Promise.all(invitees.map((inv) =>
            fbSendInvitation(user, inv.email, data, '', inv, journeyId).catch((e) =>
              console.warn('invite', inv.email, 'failed:', e?.message))
          ));
          clearPlannedInvitees();
        } catch (e) {
          console.warn('plan-time invitations skipped:', e?.message);
        }
      }

      navigate('/comic');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefine(userRequest) {
    if (!itinerary) return;
    setRefining(true);
    try {
      const refined = await refineItinerary(itinerary, userRequest, persona, userCoords);
      setItinerary(refined);
    } catch (e) {
      console.error(e);
      setError('Refine failed. Try again.');
    } finally {
      setRefining(false);
    }
  }

  function replayNarration() {
    if (!itinerary) return;
    didNarrate.current = null;
    cancelSpeech();
    narrateItinerary(narrationPayload(itinerary), { onPanel: setCurrentPanel });
  }

  useEffect(() => {
    if (!itinerary || !voiceMode) return;
    if (didNarrate.current === itinerary) return;
    didNarrate.current = itinerary;
    narrateItinerary(narrationPayload(itinerary), { onPanel: setCurrentPanel });
  }, [itinerary, voiceMode]);

  const saveToGallery = useCallback(async () => {
    if (!itinerary) return;
    const id = `${itinerary.mood}-${itinerary.city}-${Date.now()}`;
    const entry = { id, savedAt: Date.now(), itinerary };
    setSaved((prev) => [entry, ...prev.slice(0, 19)]);
    if (user) {
      await saveComic(user.uid, id, itinerary);
      const list = await listComics(user.uid);
      setCloudSaved(list);
    }
  }, [itinerary, user, setSaved]);

  const removeSaved = useCallback(async (id) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
    if (user) {
      await deleteComic(user.uid, id);
      setCloudSaved((prev) => prev.filter((s) => s.id !== id));
    }
  }, [user, setSaved]);

  const loadSaved = useCallback((entry) => {
    const data = entry.itinerary;
    setItinerary(data);
    setLastMood(data.mood || '');
    setCity(data.city || 'Delhi');
    navigate('/comic');
  }, [navigate]);

  const allSaved = useMemo(() => {
    if (user) return cloudSaved;
    return saved;
  }, [user, cloudSaved, saved]);

  const isCurrentSaved = useMemo(() => {
    if (!itinerary) return false;
    return allSaved.some((s) => s.itinerary?.mood === itinerary.mood && s.itinerary?.city === itinerary.city);
  }, [allSaved, itinerary]);

  const activeJourney = journeys.find((j) => j.id === activeJourneyId) || null;
  const isHostOfActive = !!(activeJourney && user && activeJourney.hostUid === user.uid);

  // Every outgoing invitation for the CURRENT plan (pending + accepted + declined).
  // Used on the comic page to show "who was invited" with live status badges.
  const invitationsForCurrent = useMemo(() => {
    if (!itinerary) return [];
    return outgoingInvites.filter(
      (i) =>
        i.itineraryMood === itinerary.mood &&
        i.itineraryCity === itinerary.city &&
        i.itineraryTagline === (itinerary.tagline || '')
    );
  }, [outgoingInvites, itinerary]);

  const acceptedInviteesForCurrent = useMemo(
    () => invitationsForCurrent.filter((i) => i.status === 'accepted'),
    [invitationsForCurrent]
  );

  // Journeys split by host/member relationship for "My Trips" / "Shared" views.
  const myHostedJourneys = useMemo(
    () => journeys.filter((j) => user && j.hostUid === user.uid),
    [journeys, user]
  );
  const sharedJourneys = useMemo(
    () => journeys.filter((j) => user && j.hostUid !== user.uid),
    [journeys, user]
  );

  const value = {
    itinerary, setItinerary,
    loading, refining, error,
    voiceMode, setVoiceMode,
    currentPanel, setCurrentPanel,
    city, setCity,
    userCoords, setUserCoords,
    lastMood,
    persona, setPersona,
    weatherByHour,
    imagesByOrder,
    allSaved, history,
    handleMood, handleRefine, replayNarration,
    saveToGallery, removeSaved, loadSaved,
    isCurrentSaved,
    // journey
    journeys, myHostedJourneys, sharedJourneys,
    activeJourney, activeJourneyId, isHostOfActive,
    acceptedInviteesForCurrent, invitationsForCurrent,
    startJourneyNow, visitStop, finishJourney, endJourney,
    // realtime invitations
    incomingInvites, outgoingInvites, pendingIncomingCount,
    sendInvite, acceptInvite, declineInvite, cancelInvite,
    // planned invitees (pre-generation picker)
    plannedInvitees, addPlannedInvitee, removePlannedInvitee, clearPlannedInvitees
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVoyage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVoyage must be used inside VoyageProvider');
  return ctx;
}

function narrationPayload(data) {
  return {
    tagline: data.tagline,
    mood: data.mood,
    city: data.city,
    panels: (data.stops || []).map((s) => ({
      time: s.time, title: s.title, caption: s.caption, dialogue: s.dialogue
    }))
  };
}
