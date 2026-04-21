import React from 'react';
import { formatPlanTitle } from '../services/planUtils.js';

export default function JourneyCard({ journey, onOpen, onEnd }) {
  const data = journey.itinerary || {};
  const palette = data?.style?.palette || {};

  const timestamp =
    journey.plannedAt?.toDate?.() ||
    (journey.plannedAt?.seconds ? new Date(journey.plannedAt.seconds * 1000) : null) ||
    journey.startedAt?.toDate?.() ||
    (journey.startedAt?.seconds ? new Date(journey.startedAt.seconds * 1000) : null) ||
    new Date();

  const visited = Object.keys(journey.visitedStops || {}).length;
  const total = data?.stops?.length || 0;
  const pct = total ? Math.round((visited / total) * 100) : 0;

  const statusBadge = {
    planning:  { text: 'PLANNING',    color: '#FFD23F' },
    active:    { text: 'IN PROGRESS', color: '#3BCEAC' },
    completed: { text: 'COMPLETED',   color: '#FFD23F' },
    abandoned: { text: 'ENDED',       color: '#9CA3AF' }
  }[journey.status] || { text: 'SAVED', color: '#EE4266' };

  const title = formatPlanTitle(journey);
  const others = (journey.members || []).filter((m) => m.uid !== journey.hostUid);

  return (
    <div
      className="panel p-4 flex flex-col gap-2"
      style={{
        background: palette.bg || '#FFF8E7',
        color: palette.ink || '#0D1B2A'
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-comic text-[11px] uppercase tracking-widest opacity-60">
            {timestamp.toLocaleDateString()} · {data?.city || journey.city}
          </p>
          <h3 className="font-bangers text-xl tracking-wider leading-tight truncate">
            {title}
          </h3>
          {data?.tagline && (
            <p className="font-comic text-xs italic opacity-75 truncate">
              "{data.tagline}"
            </p>
          )}
          <p className="font-comic text-xs font-bold opacity-75">
            {data?.stops?.length || 0} stops
            {total > 0 && journey.status === 'active' && ` · ${visited} visited`}
          </p>
        </div>
        <span
          className="px-2 py-0.5 font-bangers text-[11px] tracking-widest border-2 border-black whitespace-nowrap"
          style={{ background: statusBadge.color, color: '#0D1B2A' }}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Progress bar */}
      {journey.status === 'active' && (
        <div>
          <div className="h-2 border-2 border-black bg-white overflow-hidden">
            <div className="h-full bg-comic-red" style={{ width: `${pct}%` }} />
          </div>
          <p className="font-comic text-[11px] opacity-70 mt-1">
            {visited}/{total} stops visited · {pct}%
          </p>
        </div>
      )}

      <div className="flex gap-1 flex-wrap">
        {(data?.stops || []).slice(0, 5).map((s) => (
          <span key={s.order} className="text-lg" title={s.title}>{s.emoji || '✨'}</span>
        ))}
      </div>

      {/* Members */}
      {(journey.members || []).length > 1 && (
        <div className="flex items-center gap-2 font-comic text-[11px] opacity-80 min-w-0">
          <span>👥</span>
          <div className="flex items-center -space-x-1.5 shrink-0">
            {(journey.members || []).slice(0, 4).map((m, i) => (
              <MemberDot key={(m.uid || m.email || i).toString()} member={m} />
            ))}
            {(journey.members || []).length > 4 && (
              <span
                className="w-5 h-5 rounded-full border-2 border-black bg-white text-[10px] font-bangers flex items-center justify-center"
              >
                +{(journey.members || []).length - 4}
              </span>
            )}
          </div>
          <span className="truncate">
            {others.length > 0
              ? `with ${others.map((m) => m.name || m.email).slice(0, 2).join(', ')}${others.length > 2 ? '…' : ''}`
              : 'solo'}
          </span>
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-2 flex-wrap">
        <button
          onClick={onOpen}
          className="flex-1 px-3 py-1.5 font-bangers tracking-wide text-sm border-2 border-black"
          style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
        >
          📖 OPEN
        </button>
        {(journey.status === 'active' || journey.status === 'planning') && onEnd && (
          <button
            onClick={onEnd}
            className="px-3 py-1.5 font-bangers tracking-wide text-sm border-2 border-black"
            style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
          >
            🏁 {journey.status === 'planning' ? 'CANCEL' : 'END'}
          </button>
        )}
      </div>
    </div>
  );
}

function MemberDot({ member }) {
  const title = member.name || member.email || 'Member';
  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={title}
        title={title}
        className="w-5 h-5 rounded-full border-2 border-black object-cover"
      />
    );
  }
  return (
    <span
      className="w-5 h-5 rounded-full border-2 border-black bg-comic-yellow text-[10px] font-bangers flex items-center justify-center"
      title={title}
    >
      {(member.name || member.email || '?')[0].toUpperCase()}
    </span>
  );
}
