// Haversine distance in km
export function distanceKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Reorder stops so the one closest to userCoords becomes #1.
// Then re-order remaining stops by nearest-neighbor from the previous stop
// (approximates a decent route, avoids backtracking).
// Preserves each stop's narrative fields, only updates `order` and array index.
export function reorderStopsFromUser(data, userCoords) {
  if (!data?.stops?.length || !userCoords) return data;
  const start = [userCoords.lat, userCoords.lng];

  const stops = [...data.stops].filter((s) => Array.isArray(s.coords) && s.coords.length === 2);
  if (stops.length < 2) return data;

  // Start: nearest to user
  const ordered = [];
  let pool = stops.slice();
  let pivot = start;

  while (pool.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const d = distanceKm(pivot, pool[i].coords);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const chosen = pool.splice(bestIdx, 1)[0];
    ordered.push(chosen);
    pivot = chosen.coords;
  }

  // Renumber order and rebuild transitions to match
  const renumbered = ordered.map((s, i) => ({ ...s, order: i + 1 }));
  const transitions = [];
  for (let i = 0; i < renumbered.length - 1; i++) {
    const a = renumbered[i];
    const b = renumbered[i + 1];
    const km = distanceKm(a.coords, b.coords);
    transitions.push({
      from: a.order,
      to: b.order,
      mode: km < 1.5 ? 'walk' : km < 6 ? 'auto' : 'metro',
      minutes: estimateMinutes(km, a.coords, b.coords),
      distanceKm: Math.round(km * 10) / 10,
      note: ''
    });
  }

  return {
    ...data,
    stops: renumbered,
    transitions,
    reordered: true
  };
}

function estimateMinutes(km, _a, _b) {
  if (km < 1.2) return Math.max(5, Math.round(km * 12)); // walking
  if (km < 6) return Math.max(8, Math.round(km * 3));    // auto
  return Math.max(12, Math.round(km * 2.5));             // metro/taxi
}

// Stable, human-readable title for any plan / journey / saved entry.
// Format: "Adventurous · Delhi · Apr 21"
// Accepts: a journey doc, an itinerary object, or a saved-entry wrapper.
export function formatPlanTitle(input, dateOverride = null) {
  if (!input) return 'Journey';
  const itinerary = input.itinerary || input;
  const mood = (itinerary?.mood || input?.mood || '').toString();
  const city = (itinerary?.city || input?.city || '').toString();
  const moodStr = mood ? mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase() : '';

  let date = null;
  if (dateOverride instanceof Date) date = dateOverride;
  else if (input?.plannedAt?.toDate) date = input.plannedAt.toDate();
  else if (input?.plannedAt?.seconds) date = new Date(input.plannedAt.seconds * 1000);
  else if (input?.startedAt?.toDate) date = input.startedAt.toDate();
  else if (input?.startedAt?.seconds) date = new Date(input.startedAt.seconds * 1000);
  else if (typeof input?.savedAt === 'number') date = new Date(input.savedAt);

  const dateStr = date
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  const parts = [moodStr, city, dateStr].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Journey';
}

// Longer form with year (used for completed / archived views).
export function formatPlanTitleLong(input) {
  if (!input) return 'Journey';
  const itinerary = input.itinerary || input;
  const mood = (itinerary?.mood || input?.mood || '').toString();
  const city = (itinerary?.city || input?.city || '').toString();
  const moodStr = mood ? mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase() : '';

  let date = null;
  if (input?.plannedAt?.toDate) date = input.plannedAt.toDate();
  else if (input?.plannedAt?.seconds) date = new Date(input.plannedAt.seconds * 1000);
  else if (input?.startedAt?.toDate) date = input.startedAt.toDate();
  else if (input?.startedAt?.seconds) date = new Date(input.startedAt.seconds * 1000);
  else if (typeof input?.savedAt === 'number') date = new Date(input.savedAt);

  const dateStr = date
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const parts = [moodStr, city, dateStr].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Journey';
}
