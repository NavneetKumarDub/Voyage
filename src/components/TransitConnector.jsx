import React from 'react';

const MODE_ICON = {
  walk: '🚶',
  auto: '🛺',
  metro: '🚇',
  bus: '🚌',
  taxi: '🚕',
  car: '🚗',
  bike: '🏍️'
};

export default function TransitConnector({ transition }) {
  if (!transition) return null;
  const icon = MODE_ICON[transition.mode] || '➡️';

  return (
    <div className="flex items-center justify-center my-2">
      <div
        className="inline-flex items-center gap-2 px-4 py-1 border-2 border-dashed border-black rounded-full bg-white/60 font-comic text-xs font-bold"
      >
        <span className="text-lg">{icon}</span>
        <span>
          {transition.minutes} min {transition.mode}
          {transition.distanceKm ? ` · ${transition.distanceKm} km` : ''}
        </span>
        {transition.note && (
          <span className="opacity-70 italic">· {transition.note}</span>
        )}
      </div>
    </div>
  );
}
