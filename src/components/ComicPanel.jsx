import React, { useState } from 'react';
import SfxSticker from './SfxSticker.jsx';

export default function ComicPanel({ panel, index, style, highlighted, weather, imageURL }) {
  const palette = style?.palette || {};
  const delay = `${index * 0.12}s`;
  const [imgStatus, setImgStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  return (
    <div
      id={`panel-${panel.order}`}
      className={`panel panel-enter panel-hover relative ${highlighted ? 'ring-8 ring-comic-red' : ''}`}
      style={{
        animationDelay: delay,
        background: palette.bg || '#FFF8E7',
        color: palette.ink || '#0D1B2A',
        minHeight: 340
      }}
    >
      {/* Time banner */}
      <div
        className="absolute top-0 left-0 px-3 py-1 font-bangers tracking-widest text-base z-10"
        style={{
          background: palette.ink || '#0D1B2A',
          color: palette.bg || '#FFD23F',
          borderRight: '4px solid #000',
          borderBottom: '4px solid #000'
        }}
      >
        #{panel.order} · {panel.time?.toUpperCase()}
        {panel.clock && (
          <span className="block font-comic font-bold text-[10px] tracking-normal normal-case opacity-90">
            {panel.clock}
          </span>
        )}
      </div>

      {/* Weather chip — centered top to avoid SFX sticker */}
      {weather && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-comic font-bold border-2 border-black z-10"
          style={{ background: '#fff', boxShadow: '2px 2px 0 0 #000' }}
          title="Weather forecast for this hour"
        >
          <span className="text-lg mr-1">{weather.icon}</span>
          {weather.temp}°C
        </div>
      )}

      {/* AI Image with emoji fallback */}
      <div className="pt-10 pb-2 px-2">
        <div
          className="relative w-full border-2 border-black overflow-hidden"
          style={{ height: 150, background: palette.accent || '#FFD23F' }}
        >
          {/* Always-present emoji underneath, visible while loading or on error */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: 68, opacity: imgStatus === 'loaded' ? 0 : 1, transition: 'opacity 0.3s' }}
          >
            <span className="wobble inline-block drop-shadow">{panel.emoji || '✨'}</span>
          </div>

          {imageURL && imgStatus !== 'error' && (
            <img
              src={imageURL}
              alt={panel.title}
              loading="lazy"
              onLoad={() => setImgStatus('loaded')}
              onError={() => setImgStatus('error')}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: imgStatus === 'loaded' ? 1 : 0,
                transition: 'opacity 0.4s ease'
              }}
            />
          )}

          {imgStatus === 'loading' && imageURL && (
            <div className="absolute bottom-1 right-1 px-2 py-0.5 text-[10px] font-comic font-bold bg-black text-white rounded">
              drawing…
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="px-4 mt-2">
        <h3
          className="font-bangers text-2xl tracking-wide leading-tight"
          style={{ color: palette.ink || '#0D1B2A' }}
        >
          {panel.title}
        </h3>
        <p className="font-comic font-bold text-sm uppercase opacity-80">
          📍 {panel.place}
        </p>
        {panel.address && (
          <p className="font-comic text-[11px] opacity-60">{panel.address}</p>
        )}
      </div>

      {/* Caption */}
      <p className="font-comic text-sm px-4 mt-2 italic">
        {panel.caption}
      </p>

      {/* Meta row: cost, duration, hours */}
      <div className="px-4 mt-2 flex flex-wrap gap-1 text-[11px] font-comic font-bold">
        {panel.costRange && <span className="px-2 py-0.5 bg-white border border-black">💰 {panel.costRange}</span>}
        {panel.durationMinutes && <span className="px-2 py-0.5 bg-white border border-black">⏱️ {panel.durationMinutes}m</span>}
        {panel.openingHours && <span className="px-2 py-0.5 bg-white border border-black truncate">🕒 {panel.openingHours}</span>}
      </div>

      {/* Dialogue */}
      {panel.dialogue && (
        <div className="bubble mx-4 mt-3 text-sm">
          {panel.dialogue}
        </div>
      )}

      {/* Tip */}
      {panel.tip && (
        <div
          className="mx-4 mt-2 px-3 py-2 text-xs font-comic font-bold border-2 border-dashed"
          style={{ borderColor: palette.ink, background: 'rgba(255,255,255,0.55)' }}
        >
          💡 {panel.tip}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mx-4 mt-3 mb-10 flex-wrap">
        <a
          href={buildSingleMapURL(panel)}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] px-2 py-1 font-bangers tracking-wide border-2 border-black bg-white hover:bg-comic-yellow"
          style={{ boxShadow: '2px 2px 0 0 #000' }}
        >
          📍 DIRECTIONS
        </a>
        {panel.bookingURL && (
          <a
            href={panel.bookingURL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] px-2 py-1 font-bangers tracking-wide border-2 border-black bg-white hover:bg-comic-yellow"
            style={{ boxShadow: '2px 2px 0 0 #000' }}
          >
            🔗 BOOK
          </a>
        )}
      </div>

      {/* SFX sticker */}
      {panel.sfx && (
        <div className="absolute -top-4 -right-4 z-20">
          <SfxSticker text={panel.sfx} color={palette.accent || '#FFD23F'} />
        </div>
      )}
    </div>
  );
}

function buildSingleMapURL(panel) {
  if (Array.isArray(panel.coords) && panel.coords.length === 2) {
    return `https://www.google.com/maps/search/?api=1&query=${panel.coords[0]},${panel.coords[1]}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${panel.place} ${panel.address || ''}`)}`;
}
