import React, { useState } from 'react';
import { detectCurrentCity, searchCity } from '../services/locationAPI.js';
import MapPinPicker from './MapPinPicker.jsx';

// Rough coords for quick-pick cities (city centers). Saves a geocode round-trip.
const POPULAR = [
  { name: 'Delhi',    lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',   lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore',lat: 12.9716, lng: 77.5946 },
  { name: 'Jaipur',   lat: 26.9124, lng: 75.7873 },
  { name: 'Goa',      lat: 15.2993, lng: 74.1240 },
  { name: 'Kolkata',  lat: 22.5726, lng: 88.3639 },
  { name: 'Tokyo',    lat: 35.6762, lng: 139.6503 },
  { name: 'Paris',    lat: 48.8566, lng: 2.3522 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London',   lat: 51.5074, lng: -0.1278 },
  { name: 'Bali',     lat: -8.4095, lng: 115.1889 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 }
];

export default function LocationPicker({ city, setCity, userCoords, setUserCoords }) {
  const [mode, setMode] = useState('quick');
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function useGPS() {
    setMode('gps');
    setLoading(true);
    setStatus('Asking your browser for location…');
    try {
      const res = await detectCurrentCity();
      if (!res.city) throw new Error('No city found for your coordinates');
      setCity(res.city);
      setUserCoords({ lat: res.latitude, lng: res.longitude, kind: 'gps' });
      setStatus(`📍 You are in ${res.city}${res.country ? ', ' + res.country : ''} · plan will start near you.`);
    } catch (e) {
      setStatus(`⚠️ ${humanizeError(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function useTyped(e) {
    e?.preventDefault();
    if (!typed.trim()) return;
    setLoading(true);
    setStatus('Looking up that place…');
    try {
      const result = await searchCity(typed.trim());
      if (!result) {
        setCity(typed.trim());
        setUserCoords(null);
        setStatus(`Using "${typed.trim()}" — AI will improvise since coords are unknown.`);
      } else {
        setCity(result.city);
        setUserCoords({ lat: result.latitude, lng: result.longitude, kind: 'typed' });
        setStatus(`✅ ${result.city}${result.country ? ', ' + result.country : ''} — plan will start there.`);
      }
    } catch {
      setCity(typed.trim());
      setUserCoords(null);
      setStatus(`Using "${typed.trim()}" as-is.`);
    } finally {
      setLoading(false);
    }
  }

  function pickQuick(c) {
    setCity(c.name);
    setUserCoords({ lat: c.lat, lng: c.lng, kind: 'center' });
    setStatus(`📍 Starting near the center of ${c.name}.`);
  }

  function clearStart() {
    setUserCoords(null);
    setStatus('Cleared starting point — AI will pick the best first stop on its own.');
  }

  const coordLabel = userCoords
    ? `${userCoords.lat.toFixed(3)}, ${userCoords.lng.toFixed(3)} · ${userCoords.kind.toUpperCase()}`
    : 'not set — AI picks';

  return (
    <div className="max-w-4xl mx-auto px-4 mb-6">
      <div className="panel p-4" style={{ background: '#fff' }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <p className="font-comic font-bold text-sm uppercase tracking-widest opacity-60">
            📍 Where will your day begin?
          </p>
          <div className="text-right">
            <p className="font-bangers tracking-wider text-lg leading-none">
              <span className="opacity-60 text-xs">CITY:</span> <span className="text-comic-red">{city || '—'}</span>
            </p>
            <p className="font-comic text-[11px] opacity-70 mt-0.5">
              START: {coordLabel}
              {userCoords && (
                <button onClick={clearStart} className="ml-2 underline">clear</button>
              )}
            </p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Tab active={mode === 'quick'} onClick={() => setMode('quick')}>⚡ Quick Pick</Tab>
          <Tab active={mode === 'type'}  onClick={() => setMode('type')}>⌨️ Type Any City</Tab>
          <Tab active={mode === 'gps'}   onClick={useGPS}>📍 Use My Location</Tab>
          <Tab active={mode === 'pin'}   onClick={() => setMode('pin')}>🗺️ Drop Pin on Map</Tab>
        </div>

        {mode === 'quick' && (
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((c) => (
              <button
                key={c.name}
                onClick={() => pickQuick(c)}
                className="px-3 py-1 font-comic font-bold text-sm border-2 border-black"
                style={{
                  background: city === c.name ? '#FFD23F' : '#fff',
                  boxShadow: city === c.name ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                  transform: city === c.name ? 'translate(2px,2px)' : 'none'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {mode === 'type' && (
          <form onSubmit={useTyped} className="flex flex-col md:flex-row gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Neighbourhood or city — e.g. Bandra Mumbai, Kyoto, Lisbon…"
              className="panel flex-1 px-4 py-3 font-comic font-bold outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !typed.trim()}
              className="panel px-5 py-3 font-bangers text-lg tracking-wide disabled:opacity-50"
              style={{ background: '#3BCEAC' }}
            >
              {loading ? 'FINDING…' : 'SET START'}
            </button>
          </form>
        )}

        {mode === 'gps' && (
          <div className="flex items-center gap-3">
            <button
              onClick={useGPS}
              disabled={loading}
              className="panel px-4 py-2 font-bangers tracking-wide"
              style={{ background: '#FFD23F' }}
            >
              {loading ? 'DETECTING…' : '📍 DETECT AGAIN'}
            </button>
            <p className="font-comic text-xs opacity-70">Accurate starting point → smarter day plan.</p>
          </div>
        )}

        {mode === 'pin' && (
          <MapPinPicker
            initial={userCoords ? [userCoords.lat, userCoords.lng] : undefined}
            onConfirm={(res) => {
              setUserCoords({ lat: res.lat, lng: res.lng, kind: 'pin' });
              if (res.city) setCity(res.city);
              setStatus(`📌 Pinned: ${res.lat.toFixed(4)}, ${res.lng.toFixed(4)} ${res.city ? '· ' + res.city : ''}`);
            }}
          />
        )}

        {status && (
          <p className="font-comic text-xs mt-3 opacity-75 italic">{status}</p>
        )}
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 font-comic font-bold text-xs border-2 border-black"
      style={{
        background: active ? '#0D1B2A' : '#fff',
        color: active ? '#FFD23F' : '#0D1B2A',
        boxShadow: '3px 3px 0 0 #000'
      }}
    >
      {children}
    </button>
  );
}

function humanizeError(e) {
  if (!e) return 'Location unknown';
  if (e.code === 1) return 'You blocked location access. Allow it in your browser address bar.';
  if (e.code === 2) return 'Your position could not be determined. Try again or type your city.';
  if (e.code === 3) return 'Location request timed out. Try again.';
  return e.message || 'Something went wrong. Try typing your city instead.';
}
