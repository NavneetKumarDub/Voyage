import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '../services/locationAPI.js';

const pinIcon = L.divIcon({
  className: 'voyage-drop-pin',
  html: `<div style="
    width:34px;height:34px;
    border-radius:50% 50% 50% 0;
    background:#EE4266;
    border:3px solid #000;
    transform:rotate(-45deg);
    box-shadow:3px 3px 0 0 #000;
    display:flex;align-items:center;justify-content:center;
  ">
    <span style="
      transform:rotate(45deg);
      font-family:Bangers,cursive;color:#fff;font-size:16px;
    ">📍</span>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick([e.latlng.lat, e.latlng.lng]); }
  });
  return null;
}

function RecenterOn({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPinPicker({ initial, onConfirm }) {
  const [pos, setPos] = useState(initial || [28.6139, 77.2090]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');

  async function resolveLabel(latlng) {
    setLoading(true);
    try {
      const r = await reverseGeocode({ latitude: latlng[0], longitude: latlng[1] });
      setLabel(`${r.city || '(unnamed)'}${r.country ? ', ' + r.country : ''}`);
    } catch {
      setLabel('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (pos) resolveLabel(pos);
  }, []);

  async function handlePick(latlng) {
    setPos(latlng);
    resolveLabel(latlng);
  }

  function confirm() {
    onConfirm({
      lat: pos[0],
      lng: pos[1],
      kind: 'pin',
      city: label.split(',')[0] || 'Custom Point'
    });
  }

  return (
    <div>
      <div className="mb-2 font-comic text-xs opacity-75">
        Click anywhere on the map to drop a starting pin. Drag to refine.
      </div>
      <div className="border-4 border-black" style={{ height: 320 }}>
        <MapContainer center={pos} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <RecenterOn center={pos} />
          <Marker
            position={pos}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng();
                handlePick([ll.lat, ll.lng]);
              }
            }}
          />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
        <div className="font-comic text-sm">
          <span className="opacity-60">Picked:</span>{' '}
          <span className="font-bold">{pos[0].toFixed(4)}, {pos[1].toFixed(4)}</span>
          {label && <span className="ml-2 italic">({loading ? '…' : label})</span>}
        </div>
        <button
          onClick={confirm}
          className="panel px-4 py-2 font-bangers text-lg tracking-wide"
          style={{ background: '#3BCEAC' }}
        >
          ✅ USE THIS SPOT
        </button>
      </div>
    </div>
  );
}
