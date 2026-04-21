import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoyage } from '../context/VoyageContext.jsx';
import SfxSticker from '../components/SfxSticker.jsx';
import { speak, cancelSpeech } from '../services/voiceService.js';

export default function ReaderPage() {
  const { itinerary, imagesByOrder } = useVoyage();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [narrate, setNarrate] = useState(false);

  useEffect(() => {
    if (!itinerary) navigate('/');
  }, [itinerary, navigate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') navigate('/comic');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, itinerary]);

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => next(), 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, auto]);

  useEffect(() => {
    if (!narrate || !itinerary) return;
    const p = itinerary.stops?.[idx];
    if (!p) return;
    cancelSpeech();
    speak(`${p.time}. ${p.title}. ${p.caption} ${p.dialogue || ''}`);
    return () => cancelSpeech();
  }, [idx, narrate, itinerary]);

  if (!itinerary) return null;

  const stops = itinerary.stops || [];
  const total = stops.length;
  const stop = stops[idx];
  const palette = itinerary.style?.palette || {};

  function next() { setIdx((i) => Math.min(total - 1, i + 1)); }
  function prev() { setIdx((i) => Math.max(0, i - 1)); }
  function jump(i) { setIdx(i); }

  const img = imagesByOrder?.[stop?.order];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: palette.ink || '#0D1B2A', color: '#fff' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-white/20">
        <button
          onClick={() => navigate('/comic')}
          className="px-3 py-1 font-bangers tracking-wide border-2 border-white bg-transparent"
        >
          ← EXIT READER
        </button>
        <div className="font-bangers tracking-wider text-lg">
          {itinerary.mood?.toUpperCase()} · {itinerary.city?.toUpperCase()}
        </div>
        <div className="flex gap-2">
          <ToggleBtn on={auto} onClick={() => setAuto((a) => !a)} label={auto ? '⏸ PAUSE' : '▶ AUTO'} />
          <ToggleBtn on={narrate} onClick={() => setNarrate((a) => !a)} label={narrate ? '🔊 ON' : '🔇 OFF'} />
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="panel relative w-full max-w-4xl mx-auto overflow-hidden"
            style={{
              background: palette.bg || '#FFF8E7',
              color: palette.ink || '#0D1B2A',
              minHeight: '60vh'
            }}
          >
            <ReaderImage
              src={img}
              emoji={stop.emoji}
              bg={palette.accent || '#FFD23F'}
              sfx={stop.sfx}
            />

            <div className="p-6 md:p-8">
              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span
                  className="px-3 py-1 font-bangers tracking-widest text-sm"
                  style={{ background: palette.ink, color: palette.bg }}
                >
                  #{stop.order} · {stop.time?.toUpperCase()}
                </span>
                {stop.clock && (
                  <span className="font-comic font-bold text-sm opacity-80">{stop.clock}</span>
                )}
                {stop.costRange && (
                  <span className="font-comic text-xs px-2 py-0.5 border-2 border-black bg-white">{stop.costRange}</span>
                )}
              </div>
              <h2 className="font-bangers text-4xl md:text-6xl tracking-wider leading-none">
                {stop.emoji} {stop.title}
              </h2>
              <p className="font-comic font-bold text-lg uppercase opacity-80 mt-1">
                📍 {stop.place}
              </p>
              <p className="font-comic text-lg mt-3 italic">{stop.caption}</p>
              {stop.dialogue && (
                <div className="bubble mt-4 text-base max-w-md">{stop.dialogue}</div>
              )}
              {stop.tip && (
                <p className="font-comic text-sm mt-4 px-3 py-2 border-2 border-dashed inline-block" style={{ borderColor: palette.ink }}>
                  💡 {stop.tip}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="px-4 py-3 border-t-2 border-white/20 flex items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="px-4 py-2 font-bangers tracking-wide border-2 border-white disabled:opacity-30"
        >
          ← PREV
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {stops.map((_, i) => (
            <button
              key={i}
              onClick={() => jump(i)}
              aria-label={`Panel ${i + 1}`}
              className="w-3 h-3 rounded-full border-2 border-white transition-all"
              style={{ background: i === idx ? '#FFD23F' : 'transparent' }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={idx === total - 1}
          className="px-4 py-2 font-bangers tracking-wide border-2 border-white disabled:opacity-30"
        >
          NEXT →
        </button>
      </div>

      <p className="text-center font-comic text-xs opacity-50 py-2">
        ← / → arrows · SPACE to advance · ESC to exit
      </p>
    </div>
  );
}

function ReaderImage({ src, emoji, bg, sfx }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  // Reset status on src change
  useEffect(() => {
    setStatus('loading');
  }, [src]);

  return (
    <div className="relative border-b-4 border-black overflow-hidden" style={{ height: '38vh', background: bg }}>
      {/* Always-on emoji layer (visible while loading or on error) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontSize: '14vh',
          opacity: status === 'loaded' ? 0 : 1,
          transition: 'opacity 0.4s ease'
        }}
      >
        <span className="wobble inline-block drop-shadow">{emoji || '✨'}</span>
      </div>

      {src && status !== 'error' && (
        <img
          src={src}
          alt=""
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: status === 'loaded' ? 1 : 0,
            transition: 'opacity 0.4s ease'
          }}
        />
      )}

      {status === 'loading' && src && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-comic font-bold bg-black text-white">
          drawing…
        </div>
      )}

      {sfx && (
        <div className="absolute -top-2 -right-2 z-10">
          <SfxSticker text={sfx} color="#FFD23F" />
        </div>
      )}
    </div>
  );
}

function ToggleBtn({ on, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 font-bangers tracking-wide border-2 border-white"
      style={{ background: on ? '#FFD23F' : 'transparent', color: on ? '#0D1B2A' : '#fff' }}
    >
      {label}
    </button>
  );
}
