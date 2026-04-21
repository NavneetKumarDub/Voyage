import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom numbered pin
function makePin(n, color = '#EE4266') {
  return L.divIcon({
    className: 'voyage-pin',
    html: `
      <div style="
        width:38px;height:38px;
        border-radius:50% 50% 50% 0;
        background:${color};
        border:3px solid #000;
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:3px 3px 0 0 #000;
      ">
        <span style="
          transform:rotate(45deg);
          font-family:Bangers,cursive;
          color:#fff;
          font-size:18px;
          text-shadow:1px 1px 0 #000;
        ">${n}</span>
      </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -34]
  });
}

// "You are here" pulse marker
function makeYouAreHerePin() {
  return L.divIcon({
    className: 'voyage-you-pin',
    html: `
      <div style="position:relative;width:28px;height:28px;">
        <div style="
          position:absolute;inset:0;
          background:#3BCEAC;border:3px solid #000;border-radius:50%;
          box-shadow:3px 3px 0 0 #000;
          display:flex;align-items:center;justify-content:center;
          font-family:Bangers,cursive;color:#0D1B2A;font-size:14px;
        ">YOU</div>
        <div style="
          position:absolute;inset:-8px;
          border-radius:50%;
          border:3px solid #3BCEAC;
          animation:youPulse 1.8s ease-out infinite;
        "></div>
      </div>
      <style>
        @keyframes youPulse {
          0%   { transform:scale(0.8); opacity:1; }
          100% { transform:scale(1.8); opacity:0; }
        }
      </style>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

// Re-invalidates map size after layout changes (like fullscreen toggle)
function Invalidator({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

export default function MapView({ data, onStopClick }) {
  const containerRef = useRef(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const handler = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  if (!data?.stops?.length) return null;

  const points = data.stops
    .filter((s) => Array.isArray(s.coords) && s.coords.length === 2)
    .map((s) => s.coords);

  if (points.length === 0) return null;

  const userPos = data.userCoords
    ? [data.userCoords.lat, data.userCoords.lng]
    : null;
  const allPoints = userPos ? [userPos, ...points] : points;

  const accent = data.style?.palette?.accent || '#EE4266';
  const ink = data.style?.palette?.ink || '#0D1B2A';

  // Google Maps deep link for full route
  const gmapsURL = buildGoogleMapsURL(data.stops);

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <div className="panel p-0 overflow-hidden" style={{ background: '#fff' }}>
        <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3 border-b-4 border-black"
             style={{ background: accent, color: '#fff' }}>
          <div>
            <p className="font-comic text-xs tracking-widest uppercase opacity-90">
              The Route
            </p>
            <h3 className="font-bangers text-2xl md:text-3xl tracking-wider leading-none">
              {data.stops.length} stops · {data.summary?.walkingDistanceKm ?? '—'} km total
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={gmapsURL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 font-bangers tracking-wide border-2 border-black"
              style={{ background: '#fff', color: ink, boxShadow: '3px 3px 0 0 #000' }}
            >
              🗺️ OPEN IN GOOGLE MAPS
            </a>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative"
          style={{
            height: isFull ? '100vh' : 480,
            width: '100%',
            background: '#fff'
          }}
        >
          {/* Floating fullscreen toggle — icon only */}
          <button
            onClick={toggleFullscreen}
            title={isFull ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            aria-label={isFull ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="absolute top-3 right-3 z-[500] w-11 h-11 flex items-center justify-center border-2 border-black bg-white hover:bg-comic-yellow transition-colors"
            style={{ boxShadow: '3px 3px 0 0 #000' }}
          >
            {isFull ? (
              // Exit fullscreen — inward-pointing arrows
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M15 3h6v6" transform="scale(-1 1) translate(-24 0)" />
                <path d="M9 21H3v-6" transform="scale(-1 1) translate(-24 0)" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            ) : (
              // Enter fullscreen — outward-pointing arrows
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M3 9V3h6" />
                <path d="M21 9V3h-6" />
                <path d="M3 15v6h6" />
                <path d="M21 15v6h-6" />
              </svg>
            )}
          </button>
          <MapContainer
            center={points[0]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={allPoints} />
            <Invalidator trigger={isFull} />

            {userPos && (
              <>
                <Marker position={userPos} icon={makeYouAreHerePin()}>
                  <Popup>
                    <div className="font-comic" style={{ minWidth: 140 }}>
                      <p className="font-bangers text-lg m-0">📍 You are here</p>
                      <p className="m-0 text-xs opacity-70">
                        Stop #1 is nearby — your plan starts within walking distance.
                      </p>
                    </div>
                  </Popup>
                </Marker>
                <Polyline
                  positions={[userPos, points[0]]}
                  pathOptions={{ color: '#3BCEAC', weight: 3, dashArray: '4 6' }}
                />
              </>
            )}

            <Polyline
              positions={points}
              pathOptions={{ color: ink, weight: 4, dashArray: '8 8' }}
            />

            {data.stops.map((s, i) => (
              <Marker
                key={s.order}
                position={s.coords}
                icon={makePin(s.order, accent)}
                eventHandlers={{
                  click: () => onStopClick?.(i)
                }}
              >
                <Popup>
                  <div className="font-comic" style={{ minWidth: 180 }}>
                    <p className="font-bangers text-lg m-0">{s.emoji} {s.title}</p>
                    <p className="m-0 text-sm font-bold">{s.place}</p>
                    <p className="m-0 text-xs opacity-70">{s.clock}</p>
                    <p className="m-0 text-xs">{s.costRange}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}

function buildGoogleMapsURL(stops) {
  const coords = stops
    .filter((s) => Array.isArray(s.coords))
    .map((s) => `${s.coords[0]},${s.coords[1]}`);
  if (coords.length < 2) return 'https://maps.google.com';
  const origin = coords[0];
  const destination = coords[coords.length - 1];
  const waypoints = coords.slice(1, -1).join('|');
  const base = 'https://www.google.com/maps/dir/?api=1';
  return `${base}&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;
}
