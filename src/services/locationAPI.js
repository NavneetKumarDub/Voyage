// Free reverse geocoding via Nominatim (OpenStreetMap)
// Docs: https://nominatim.org/release-docs/latest/api/Reverse/

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000, ...options }
    );
  });
}

export async function reverseGeocode({ latitude, longitude }) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error('Reverse geocode failed');
  const data = await res.json();
  const a = data.address || {};
  const city = a.city || a.town || a.village || a.municipality || a.county || a.state || '';
  const country = a.country || '';
  return { city, country, full: data.display_name };
}

// Search a free-text city and return the best match with coords.
export async function searchCity(query) {
  if (!query?.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) return null;
  const arr = await res.json();
  if (!arr.length) return null;
  const hit = arr[0];
  const a = hit.address || {};
  const city = a.city || a.town || a.village || a.state || hit.name;
  return {
    city: city || query,
    country: a.country || '',
    latitude: parseFloat(hit.lat),
    longitude: parseFloat(hit.lon),
    full: hit.display_name
  };
}

export async function detectCurrentCity() {
  const pos = await getCurrentPosition();
  const result = await reverseGeocode(pos);
  return { ...result, ...pos };
}
