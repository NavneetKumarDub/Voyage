import React from 'react';

export default function TravelEssentials({ data }) {
  const e = data?.essentials;
  if (!e) return null;
  const palette = data.style?.palette || {};

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Packing list */}
      <div className="panel p-5" style={{ background: '#fff' }}>
        <p className="font-comic text-xs uppercase tracking-widest opacity-60">Pack This</p>
        <h3 className="font-bangers text-2xl tracking-wider mb-3">🎒 PACKING LIST</h3>
        <ul className="space-y-1">
          {(e.packingList || []).map((item, i) => (
            <li key={i} className="font-comic text-sm flex gap-2">
              <span className="font-bold" style={{ color: palette.accent }}>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Local phrases */}
      <div className="panel p-5" style={{ background: '#fff' }}>
        <p className="font-comic text-xs uppercase tracking-widest opacity-60">Talk Local</p>
        <h3 className="font-bangers text-2xl tracking-wider mb-3">🗣️ SURVIVAL PHRASES</h3>
        <ul className="space-y-3">
          {(e.localPhrases || []).map((p, i) => (
            <li key={i} className="font-comic text-sm border-l-4 pl-2" style={{ borderColor: palette.accent }}>
              <p className="font-bold text-base">{p.text}</p>
              <p className="italic opacity-70">"{p.pronounce}"</p>
              <p className="text-xs">→ {p.translation}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Emergency */}
      <div className="panel p-5" style={{ background: '#EE4266', color: '#fff' }}>
        <p className="font-comic text-xs uppercase tracking-widest opacity-90">Just In Case</p>
        <h3 className="font-bangers text-2xl tracking-wider mb-3">🆘 EMERGENCY</h3>
        <ul className="space-y-2 font-comic text-sm">
          {e.emergency?.police && (
            <li className="flex justify-between gap-2">
              <span>👮 Police</span>
              <a href={`tel:${e.emergency.police}`} className="font-bangers text-xl tracking-wide">{e.emergency.police}</a>
            </li>
          )}
          {e.emergency?.ambulance && (
            <li className="flex justify-between gap-2">
              <span>🚑 Ambulance</span>
              <a href={`tel:${e.emergency.ambulance}`} className="font-bangers text-xl tracking-wide">{e.emergency.ambulance}</a>
            </li>
          )}
          {e.emergency?.touristHelpline && (
            <li className="flex justify-between gap-2">
              <span>🧳 Tourist Help</span>
              <a href={`tel:${e.emergency.touristHelpline}`} className="font-bangers text-xl tracking-wide">{e.emergency.touristHelpline}</a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
