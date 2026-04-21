import { getMoodStyle } from '../data/moodPresets.js';
import fallback from '../data/fallbackData.js';
import { reorderStopsFromUser } from './planUtils.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are "Voyage" — an expert comic-book travel curator. Given a MOOD word, a CITY, a PERSONA (solo/couple/family/friends), a BUDGET (low/mid/high), and a PACE (chill/balanced/packed), you design a deeply detailed, realistic 1-day itinerary rendered as a comic-book narrative.

Return ONLY valid JSON with this EXACT schema — no commentary, no markdown:

{
  "mood": "<mood word>",
  "city": "<city>",
  "country": "<country name>",
  "tagline": "<dramatic comic tagline, ALL CAPS, max 8 words>",
  "genre": "<noir | action | mystery | romance | adventure | slice-of-life>",
  "summary": {
    "totalCostRange": "<e.g. ₹1500 – ₹2500>",
    "walkingDistanceKm": <number>,
    "totalDurationHours": <number>,
    "currencySymbol": "<₹ | $ | € | ¥ | £>",
    "weatherHint": "<one-line weather-aware tip>"
  },
  "stops": [
    {
      "order": 1,
      "type": "<breakfast | activity | snack | lunch | sight | golden-hour | dinner | nightlife>",
      "time": "<Morning | Midday | Afternoon | Evening | Night>",
      "clock": "<e.g. 8:00 AM — 10:30 AM>",
      "durationMinutes": <number>,
      "title": "<short bold title, 2-4 words>",
      "place": "<real place name>",
      "address": "<short address or neighborhood>",
      "coords": [<latitude>, <longitude>],
      "action": "<what the hero does, 1 sentence>",
      "caption": "<comic narrator caption, 1 punchy line>",
      "dialogue": "<short in-character dialogue under 10 words>",
      "sfx": "<uppercase SFX like POW, SIGH, WHOOSH>",
      "emoji": "<one emoji>",
      "tip": "<practical tip under 15 words>",
      "costRange": "<e.g. ₹200 – ₹400 | Free>",
      "openingHours": "<e.g. 7 AM – 11 PM | 24 hours | closed Mon>",
      "bookingURL": "<optional https URL or empty string>",
      "photoQuery": "<2-4 word search query describing the scene for image generation>",
      "alternative": "<one backup option, under 20 words>"
    }
    // ... 6 stops total for balanced pace, 4 for chill, 8 for packed
  ],
  "transitions": [
    { "from": 1, "to": 2, "mode": "<walk | auto | metro | bus | taxi>", "minutes": <number>, "distanceKm": <number>, "note": "<optional, under 10 words>" }
    // N-1 transitions matching stops
  ],
  "essentials": {
    "packingList": ["<item 1>", "<item 2>", "<item 3>", "<item 4>", "<item 5>"],
    "localPhrases": [
      { "text": "<phrase in local language>", "translation": "<english>", "pronounce": "<phonetic>" }
      // exactly 3 phrases
    ],
    "emergency": {
      "police": "<local emergency number>",
      "ambulance": "<local emergency number>",
      "touristHelpline": "<local tourist helpline or embassy>"
    }
  }
}

Hard rules:
0. HONOR THE USER PROFILE — if a PROFILE block is provided, dietary restrictions are non-negotiable (no pork for halal, no meat for vegetarian, no animal products for vegan, etc.). Factor in age group, interests, accessibility notes, and allergies in every single stop.
1. START NEAR THE USER — if a STARTING POINT (lat, lng) is given, stop #1 MUST be within 2 km of it (walking distance). Subsequent stops should flow outward without unnecessary backtracking.
2. MATCH THE MOOD VIBE — sad moods get noir/melancholic tone, hyper moods get action SFX, romantic gets soft, etc.
3. BUDGET-AWARE — low-budget uses street food, public transport, free sights; high-budget uses fine dining, private tours.
4. PERSONA-AWARE — family means kid-friendly, couple means romantic-leaning, solo is introspective, friends is social.
5. PACE-AWARE — chill = 4 stops, balanced = 6 stops, packed = 8 stops. Adjust "stops" array length accordingly.
6. COORDINATES MUST BE REAL — use actual latitude/longitude for the given city. Reasonable accuracy (within the right neighborhood).
7. TRANSITIONS — one fewer than stops. Realistic walk/metro times.
8. CURRENCY — use local currency symbol (₹ for India, $ for USA, € for EU, ¥ for Japan).
9. Return JSON only. No markdown. No prose.`;

export async function generateItinerary(mood, city = 'Delhi', persona = {}, userCoords = null, profile = null) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const { who = 'solo', budget = 'mid', pace = 'balanced' } = persona;

  if (!apiKey) {
    console.warn('No Groq API key — using fallback data');
    return enrich(getFallback(mood), mood, persona, userCoords);
  }

  const startLine = userCoords
    ? `STARTING POINT: latitude=${userCoords.lat}, longitude=${userCoords.lng} (stop #1 must be within 2 km)`
    : 'STARTING POINT: (not specified — pick a great morning opener for the city)';

  const profileLines = profile && profile.onboarded ? formatProfile(profile) : '';

  const userMsg = `MOOD: ${mood}
CITY: ${city}
PERSONA: ${who}
BUDGET: ${budget}
PACE: ${pace}
${startLine}
${profileLines}

Generate the JSON itinerary now.`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.85,
        max_tokens: 4096
      })
    });

    if (!res.ok) {
      console.error('Groq API error:', res.status);
      return enrich(getFallback(mood), mood, persona);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    parsed.source = 'ai';
    return enrich(parsed, mood, persona, userCoords);
  } catch (err) {
    console.error('Groq request failed:', err);
    return enrich(getFallback(mood), mood, persona, userCoords);
  }
}

function formatProfile(p) {
  const parts = ['\nPROFILE:'];
  if (p.name) parts.push(`- Name: ${p.name}`);
  if (p.ageGroup) parts.push(`- Age group: ${p.ageGroup}`);
  if (p.diet) parts.push(`- Diet: ${p.diet}`);
  if (p.allergies) parts.push(`- Allergies/dislikes: ${p.allergies}`);
  if (p.role) parts.push(`- Role: ${p.role}`);
  if (p.interests?.length) parts.push(`- Interests: ${(Array.isArray(p.interests) ? p.interests : [p.interests]).join(', ')}`);
  if (p.homeCity) parts.push(`- Home city: ${p.homeCity}`);
  if (p.about) parts.push(`- About: ${p.about}`);
  return parts.length > 1 ? parts.join('\n') : '';
}

function getFallback(mood) {
  const key = (mood || '').toLowerCase().trim();
  const data = fallback[key] || fallback.default;
  return { ...data, source: 'fallback' };
}

// Takes an existing plan + user's change request, returns a refined plan.
export async function refineItinerary(currentData, userRequest, persona = {}, userCoords = null) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.warn('No Groq API key — cannot refine without AI.');
    return currentData;
  }

  const refinePrompt = `You are refining an existing itinerary based on the user's feedback.

CURRENT PLAN (JSON):
${JSON.stringify({
  mood: currentData.mood,
  city: currentData.city,
  tagline: currentData.tagline,
  stops: currentData.stops?.map((s) => ({
    order: s.order, title: s.title, place: s.place, time: s.time,
    clock: s.clock, costRange: s.costRange, type: s.type
  }))
}, null, 2)}

USER REQUEST: "${userRequest}"

Return the FULL refreshed JSON itinerary honoring the SAME schema as before (mood, city, tagline, genre, summary, stops[], transitions[], essentials). Apply the user's request intelligently — if they ask for a cheaper lunch, change lunch stop; if they ask to add a stop, add one; if they ask for a different mood, adjust captions/SFX. Keep coordinates real. Return only JSON.`;

  const { who = 'solo', budget = 'mid', pace = 'balanced' } = persona;
  const startLine = userCoords
    ? `STARTING POINT: latitude=${userCoords.lat}, longitude=${userCoords.lng} (stop #1 must be within 2 km)`
    : '';

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${refinePrompt}\n\nPERSONA: ${who}\nBUDGET: ${budget}\nPACE: ${pace}\n${startLine}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4096
      })
    });
    if (!res.ok) return currentData;
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    parsed.source = 'ai-refined';
    return enrich(parsed, currentData.mood, persona, userCoords);
  } catch (err) {
    console.error('Refine failed:', err);
    return currentData;
  }
}

function enrich(data, mood, persona, userCoords) {
  const base = {
    ...data,
    style: getMoodStyle(mood),
    persona: { who: persona.who || 'solo', budget: persona.budget || 'mid', pace: persona.pace || 'balanced' },
    userCoords: userCoords || null
  };
  // Guarantee stop #1 is closest to user — works for both AI and fallback.
  return userCoords ? reorderStopsFromUser(base, userCoords) : base;
}
