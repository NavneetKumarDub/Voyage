import React from 'react';
import ComicPanel from './ComicPanel.jsx';
import TransitConnector from './TransitConnector.jsx';

export default function ComicGrid({ data, currentPanel, weatherByHour, imagesByOrder }) {
  if (!data) return null;
  const { stops = [], transitions = [], style, tagline, mood, city, genre, summary, source } = data;
  const palette = style?.palette || {};

  const trMap = new Map(transitions.map((t) => [`${t.from}-${t.to}`, t]));

  return (
    <section className="max-w-6xl mx-auto px-4">
      {/* Cover strip */}
      <div
        className="panel mb-6 px-6 py-5 flex flex-wrap items-center justify-between gap-3"
        style={{ background: palette.bg || '#FFD23F' }}
      >
        <div>
          <p className="font-comic uppercase text-xs tracking-widest opacity-60">
            Issue #001 · Genre: {genre} · {source === 'ai' ? '🤖 AI-generated' : '📦 Demo'}
          </p>
          <h2 className="font-bangers text-3xl md:text-5xl tracking-wider leading-none">
            {tagline}
          </h2>
          <p className="font-comic text-sm mt-1">
            <span className="font-bold uppercase">{mood}</span> · {city}
            {summary?.totalDurationHours ? ` · ${summary.totalDurationHours}h day` : ''}
            {summary?.walkingDistanceKm ? ` · ${summary.walkingDistanceKm} km` : ''}
            {summary?.totalCostRange ? ` · ${summary.totalCostRange}` : ''}
          </p>
          {summary?.weatherHint && (
            <p className="font-comic text-xs mt-1 italic opacity-75">☁️ {summary.weatherHint}</p>
          )}
        </div>
        <div className="font-bangers text-5xl md:text-7xl leading-none opacity-80">
          VOYAGE!
        </div>
      </div>

      {/* Panel grid with transit connectors interleaved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stops.map((p, i) => {
          const nextTr = trMap.get(`${p.order}-${p.order + 1}`);
          const panelHour = parseHourFromClock(p.clock);
          const weather = weatherByHour?.[panelHour];
          const imageURL = imagesByOrder?.[p.order];
          return (
            <div key={p.order} className="flex flex-col">
              <ComicPanel
                panel={p}
                index={i}
                style={style}
                highlighted={currentPanel === i}
                weather={weather}
                imageURL={imageURL}
              />
              {/* Transit connector below every panel except the last, spanning cols when possible */}
              {i < stops.length - 1 && nextTr && (
                <TransitConnector transition={nextTr} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function parseHourFromClock(clock) {
  if (!clock) return null;
  const m = clock.match(/^(\d+):?(\d+)?\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h;
}
