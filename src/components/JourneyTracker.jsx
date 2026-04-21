import React from 'react';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function JourneyTracker() {
  const { isAuthed } = useAuth();
  const {
    itinerary, activeJourney, isHostOfActive,
    startJourneyNow, visitStop, finishJourney, endJourney,
    invitationsForCurrent
  } = useVoyage();

  if (!itinerary) return null;

  const journey = activeJourney;
  const status = journey?.status || 'none';
  const isRunning = status === 'active';
  const isPlanning = status === 'planning';

  const total = itinerary.stops?.length || 0;
  const visited = journey ? Object.keys(journey.visitedStops || {}).length : 0;
  const pct = total ? Math.round((visited / total) * 100) : 0;

  const members = journey?.members || [];
  const acceptedMembers = members.filter((m) => m.uid !== journey?.hostUid);
  const accepted = invitationsForCurrent.filter((i) => i.status === 'accepted');
  const pending = invitationsForCurrent.filter((i) => i.status === 'pending');
  const declined = invitationsForCurrent.filter((i) => i.status === 'declined');

  // Nobody invited AND no journey yet → solo "start" CTA
  // Host planning w/ invitees → "awaiting start" preview
  // Active → progress tracker
  // Member viewing → read-only view
  const mode =
    isRunning ? 'running' :
    (isPlanning && isHostOfActive) ? 'host-planning' :
    (isPlanning && !isHostOfActive) ? 'member-planning' :
    'solo-start';

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 xl:px-8 mt-6">
      <div className="panel p-5" style={{ background: '#EE4266', color: '#fff' }}>

        {/* ═════════ HOST · solo start (no invitees, no journey yet) ═════════ */}
        {mode === 'solo-start' && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-[240px]">
              <p className="font-comic text-xs tracking-widest uppercase opacity-90">
                Ready to go?
              </p>
              <h3 className="font-bangers text-3xl tracking-wider leading-none">
                🚀 START THIS JOURNEY
              </h3>
              <p className="font-comic text-sm mt-1 opacity-90">
                Tracks which stops you visit. You can invite people anytime from
                the share bar — they'll join the journey live as they accept.
                {!isAuthed && ' Sign in to save your journey.'}
              </p>
            </div>
            <button
              onClick={startJourneyNow}
              disabled={!isAuthed}
              className="px-6 py-3 font-bangers text-xl tracking-widest border-2 border-white disabled:opacity-60"
              style={{ background: '#fff', color: '#EE4266', boxShadow: '3px 3px 0 0 #000' }}
            >
              🚀 START JOURNEY
            </button>
          </div>
        )}

        {/* ═════════ HOST · planning (invitees queued) ═════════ */}
        {mode === 'host-planning' && (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex-1 min-w-[240px]">
                <p className="font-comic text-xs tracking-widest uppercase opacity-90">
                  Planning — awaiting start
                </p>
                <h3 className="font-bangers text-3xl tracking-wider leading-none">
                  👑 YOU'RE THE HOST
                </h3>
                <p className="font-comic text-sm mt-1 opacity-90">
                  Invitations are live. Start whenever you're ready — every
                  accepted traveler will follow along in real time.
                </p>
              </div>
              <button
                onClick={startJourneyNow}
                className="px-6 py-3 font-bangers text-xl tracking-widest border-2 border-white"
                style={{ background: '#fff', color: '#EE4266', boxShadow: '3px 3px 0 0 #000' }}
              >
                🚀 START NOW
                {acceptedMembers.length > 0 && ` · +${acceptedMembers.length}`}
              </button>
            </div>

            <InvitationRollup
              accepted={accepted}
              pending={pending}
              declined={declined}
            />
          </div>
        )}

        {/* ═════════ MEMBER · planning (host hasn't started yet) ═════════ */}
        {mode === 'member-planning' && (
          <div>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div className="flex-1 min-w-[240px]">
                <p className="font-comic text-xs tracking-widest uppercase opacity-90">
                  Shared trip · not started
                </p>
                <h3 className="font-bangers text-3xl tracking-wider leading-none">
                  🤝 YOU'RE ON {journey.hostName?.split(' ')[0]?.toUpperCase() || 'THE HOST'}'S TRIP
                </h3>
                <p className="font-comic text-sm mt-1 opacity-90">
                  Hosted by <strong>{journey.hostName || journey.hostEmail}</strong>.
                  You'll see live progress as soon as they hit start.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AvatarStack people={members} />
              </div>
            </div>
          </div>
        )}

        {/* ═════════ RUNNING ═════════ */}
        {mode === 'running' && (
          <>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-comic text-xs tracking-widest uppercase opacity-90">
                    Journey in progress
                  </p>
                  {!isHostOfActive && (
                    <span
                      className="font-comic font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 border-2 border-white"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                      👀 viewer · host controls
                    </span>
                  )}
                </div>
                <h3 className="font-bangers text-3xl tracking-wider leading-none">
                  {isHostOfActive ? '🧭 ON THE MOVE' : '🧭 FOLLOWING ALONG'}
                </h3>
                {members.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="font-comic text-xs uppercase tracking-widest opacity-80">
                      Members:
                    </span>
                    <AvatarStack people={members} />
                  </div>
                )}
                <p className="font-comic text-sm mt-2 opacity-90">
                  {isHostOfActive
                    ? 'Tap each stop as you arrive. Everyone on your trip sees progress live.'
                    : `${journey.hostName || 'The host'} is leading — stops update in real time.`}
                </p>
              </div>

              {isHostOfActive && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={finishJourney}
                    className="px-4 py-2 font-bangers tracking-widest border-2 border-white"
                    style={{ background: '#3BCEAC', color: '#0D1B2A', boxShadow: '3px 3px 0 0 #000' }}
                  >
                    ✅ COMPLETE
                  </button>
                  <button
                    onClick={() => endJourney(journey.id)}
                    className="px-4 py-2 font-bangers tracking-widest border-2 border-white"
                    style={{ background: '#fff', color: '#EE4266', boxShadow: '3px 3px 0 0 #000' }}
                  >
                    🏁 END EARLY
                  </button>
                </div>
              )}
            </div>

            <div className="h-3 border-2 border-white bg-white/20 overflow-hidden">
              <div className="h-full bg-comic-yellow" style={{ width: `${pct}%`, transition: 'width 0.3s' }} />
            </div>
            <p className="font-comic text-xs opacity-90 mt-1">
              {visited}/{total} stops visited · {pct}%
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
              {(itinerary.stops || []).map((s) => {
                const done = !!(journey.visitedStops || {})[s.order];
                const Comp = isHostOfActive ? 'button' : 'div';
                return (
                  <Comp
                    key={s.order}
                    onClick={isHostOfActive ? () => visitStop(s.order) : undefined}
                    className="px-3 py-2 font-comic text-sm font-bold border-2 border-white text-left"
                    style={{
                      background: done ? '#FFD23F' : 'rgba(255,255,255,0.1)',
                      color: done ? '#0D1B2A' : '#fff',
                      cursor: isHostOfActive ? 'pointer' : 'default'
                    }}
                    title={isHostOfActive ? 'Mark visited' : 'Only the host can mark stops visited'}
                  >
                    <span className="mr-1">{done ? '✅' : '⬜'}</span>
                    <span className="font-bangers tracking-wide mr-1">#{s.order}</span>
                    <span className="truncate">{s.emoji} {s.title}</span>
                  </Comp>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function InvitationRollup({ accepted, pending, declined }) {
  if (accepted.length + pending.length + declined.length === 0) return null;
  return (
    <div className="mt-2 grid gap-2">
      {accepted.length > 0 && (
        <RollupRow
          label={`Joining · ${accepted.length}`}
          color="#3BCEAC"
          people={accepted.map(i => ({ name: i.toName || i.toEmail, email: i.toEmail, photo: i.toPhoto }))}
        />
      )}
      {pending.length > 0 && (
        <RollupRow
          label={`Waiting · ${pending.length}`}
          color="#FFD23F"
          people={pending.map(i => ({ name: i.toName || i.toEmail, email: i.toEmail, photo: i.toPhoto }))}
          dim
        />
      )}
      {declined.length > 0 && (
        <RollupRow
          label={`Declined · ${declined.length}`}
          color="#fff"
          people={declined.map(i => ({ name: i.toName || i.toEmail, email: i.toEmail, photo: i.toPhoto }))}
          strikethrough
        />
      )}
    </div>
  );
}

function RollupRow({ label, color, people, dim = false, strikethrough = false }) {
  return (
    <div
      className="flex items-center gap-2 border-2 border-white p-2"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <span
        className="font-bangers text-xs tracking-widest px-2 py-0.5 border-2 border-white"
        style={{ background: color, color: '#0D1B2A' }}
      >
        {label}
      </span>
      <div className={`flex items-center gap-1 min-w-0 ${dim ? 'opacity-70' : ''}`}>
        {people.slice(0, 6).map((p, i) => (
          <span
            key={i}
            className="font-comic text-xs truncate"
            style={{ textDecoration: strikethrough ? 'line-through' : 'none' }}
            title={p.email}
          >
            {p.name}{i < people.length - 1 && i < 5 ? ',' : ''}
          </span>
        ))}
        {people.length > 6 && <span className="text-xs opacity-80">+{people.length - 6}</span>}
      </div>
    </div>
  );
}

function AvatarStack({ people = [] }) {
  const visible = people.slice(0, 5);
  const extra = Math.max(0, people.length - visible.length);
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((p, i) => (
        <Avatar key={p.uid || p.email || i} person={p} />
      ))}
      {extra > 0 && (
        <span
          className="w-8 h-8 rounded-full border-2 border-white bg-white text-[#0D1B2A] flex items-center justify-center font-bangers text-xs"
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

function Avatar({ person }) {
  const title = person.name || person.email || 'Member';
  const role = person.role === 'host' ? '👑 ' : '';
  if (person.photo) {
    return (
      <img
        src={person.photo}
        alt={title}
        title={role + title}
        className="w-8 h-8 rounded-full border-2 border-white object-cover"
      />
    );
  }
  return (
    <span
      className="w-8 h-8 rounded-full border-2 border-white bg-comic-yellow text-[#0D1B2A] flex items-center justify-center font-bangers text-xs"
      title={role + title}
    >
      {(person.name || person.email || '?')[0].toUpperCase()}
    </span>
  );
}
