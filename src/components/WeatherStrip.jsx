import React from 'react';

// Shows a horizontal weather timeline for the panel hours of the day.
export default function WeatherStrip({ data, weatherByHour }) {
  if (!weatherByHour || !data?.stops) return null;
  const palette = data.style?.palette || {};

  const rows = data.stops.map((s) => {
    const hour = parseHourFromClock(s.clock);
    const w = weatherByHour[hour];
    return { order: s.order, time: s.time, clock: s.clock, weather: w, emoji: s.emoji };
  });

  const anyWeather = rows.some((r) => r.weather);
  if (!anyWeather) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 mt-6">
      <div className="panel p-4" style={{ background: '#fff', color: palette.ink || '#0D1B2A' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bangers text-2xl tracking-wider">🌤️ TODAY'S WEATHER IN {data.city?.toUpperCase()}</span>
          <span className="font-comic text-xs opacity-60">· hourly forecast (Open-Meteo)</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {rows.map((r) => (
            <div
              key={r.order}
              className="flex-1 min-w-[110px] border-2 border-black p-2 text-center"
              style={{ background: palette.bg || '#FFF8E7', boxShadow: '3px 3px 0 0 #000' }}
            >
              <p className="font-comic font-bold text-[11px] uppercase opacity-70">
                #{r.order} · {r.time}
              </p>
              <div className="text-3xl my-1">{r.weather?.icon || '❔'}</div>
              <p className="font-bangers text-xl tracking-wide">
                {r.weather ? `${r.weather.temp}°C` : '—'}
              </p>
              <p className="font-comic text-[10px] opacity-70">{r.clock?.split('—')[0].trim()}</p>
            </div>
          ))}
        </div>
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
