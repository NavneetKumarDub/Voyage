import React from 'react';
import { Link } from 'react-router-dom';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import NavBar from '../components/NavBar.jsx';
import { formatPlanTitle } from '../services/planUtils.js';

export default function GalleryPage() {
  const { allSaved, loadSaved, removeSaved } = useVoyage();
  const { user } = useAuth();

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="max-w-6xl mx-auto px-4">
        <div className="panel p-5 mb-6 flex items-center justify-between flex-wrap gap-3" style={{ background: '#FFD23F' }}>
          <div>
            <p className="font-comic text-xs tracking-widest uppercase opacity-60">Your Collection</p>
            <h1 className="font-bangers text-5xl tracking-wider leading-none">📚 THE GALLERY</h1>
            <p className="font-comic text-sm mt-1">
              {user ? `Signed in as ${user.name || user.email}. Synced across devices.` : 'Sign in with Google to sync across devices.'}
            </p>
          </div>
          <div className="font-bangers text-5xl opacity-80">
            {allSaved.length} SAVED
          </div>
        </div>

        {allSaved.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allSaved.map((entry) => (
              <ComicCard
                key={entry.id}
                entry={entry}
                onOpen={() => loadSaved(entry)}
                onRemove={() => removeSaved(entry.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ComicCard({ entry, onOpen, onRemove }) {
  const data = entry.itinerary;
  const style = data?.style?.palette || {};
  const date = entry.savedAt?.seconds
    ? new Date(entry.savedAt.seconds * 1000)
    : new Date(entry.savedAt || Date.now());

  return (
    <div
      className="panel p-4 relative flex flex-col gap-2"
      style={{ background: style.bg || '#FFF8E7', color: style.ink || '#0D1B2A' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-comic font-bold text-xs uppercase tracking-widest opacity-60">
            {data.genre || 'adventure'}
          </p>
          <h3 className="font-bangers text-2xl tracking-wider leading-tight truncate">
            {formatPlanTitle(entry)}
          </h3>
          {data.tagline && (
            <p className="font-comic text-xs italic opacity-75 truncate">"{data.tagline}"</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="text-xs font-comic font-bold px-2 py-1 border-2 border-black bg-white hover:bg-comic-red hover:text-white"
          title="Delete from gallery"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {(data.stops || []).slice(0, 4).map((s) => (
          <span key={s.order} className="text-xl" title={s.title}>
            {s.emoji || '✨'}
          </span>
        ))}
        {data.stops?.length > 4 && (
          <span className="font-comic text-xs opacity-60 self-center">+{data.stops.length - 4}</span>
        )}
      </div>

      <p className="font-comic text-[11px] opacity-60 mt-auto pt-2 border-t-2 border-black/30">
        Saved {date.toLocaleDateString()} · {data.stops?.length || 0} stops
      </p>

      <div className="flex gap-2 mt-2">
        <button
          onClick={onOpen}
          className="flex-1 py-2 font-bangers tracking-wide border-2 border-black"
          style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
        >
          📖 OPEN
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="panel p-10 text-center" style={{ background: '#fff' }}>
      <div className="text-7xl mb-3">📭</div>
      <h2 className="font-bangers text-3xl tracking-wider">NO COMICS YET</h2>
      <p className="font-comic text-sm mt-2 opacity-70">
        Generate a plan, hit "SAVE TO GALLERY" on the comic page, then come back here.
      </p>
      <Link
        to="/"
        className="inline-block mt-4 px-5 py-2 font-bangers text-xl tracking-wide border-2 border-black"
        style={{ background: '#FFD23F', boxShadow: '3px 3px 0 0 #000' }}
      >
        🎲 START ROLLING
      </Link>
    </div>
  );
}
