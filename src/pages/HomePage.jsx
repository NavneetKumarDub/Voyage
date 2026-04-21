import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MoodInput from '../components/MoodInput.jsx';
import PersonaPicker from '../components/PersonaPicker.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import NavBar from '../components/NavBar.jsx';
import JourneyCard from '../components/JourneyCard.jsx';
import InviteModal from '../components/InviteModal.jsx';
import InviteePicker from '../components/InviteePicker.jsx';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPlanTitle } from '../services/planUtils.js';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile, isGuest, signOut } = useAuth();
  const {
    handleMood, loading,
    city, setCity,
    userCoords, setUserCoords,
    persona, setPersona,
    voiceMode,
    myHostedJourneys, sharedJourneys, allSaved, loadSaved,
    endJourney,
    incomingInvites, pendingIncomingCount, acceptInvite, declineInvite
  } = useVoyage();

  const [setupOpen, setSetupOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const activeMine = myHostedJourneys.filter((j) => j.status === 'active');
  const planningMine = myHostedJourneys.filter((j) => j.status === 'planning');
  const completedMine = myHostedJourneys.filter((j) => j.status === 'completed');
  const sharedActive = sharedJourneys.filter((j) => j.status === 'active' || j.status === 'planning');
  const sharedDone = sharedJourneys.filter((j) => j.status === 'completed');
  const pendingInvites = incomingInvites.filter((i) => i.status === 'pending');
  const hostedCount = myHostedJourneys.length;
  const joinedCount = sharedJourneys.length;

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <main className="w-full max-w-[1600px] mx-auto px-4 xl:px-8">
        {/* ═══════════ Header row ═══════════ */}
        <ProfileHeader
          user={user}
          profile={profile}
          isGuest={isGuest}
          onSignOut={signOut}
          onOpenInvite={() => setInviteOpen(true)}
        />

        {/* Realtime invitation banner — sits above the grid when present */}
        {pendingInvites.length > 0 && (
          <InviteBanner
            pending={pendingInvites}
            onAccept={acceptInvite}
            onDecline={declineInvite}
          />
        )}

        {/* ═══════════ Primary grid ═══════════ */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* MAIN column */}
          <div className="xl:col-span-8 flex flex-col gap-6 min-w-0">
            {/* Planner card */}
            <section className="panel p-6 xl:p-8" style={{ background: '#fff' }}>
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="font-comic text-xs tracking-widest uppercase opacity-60">
                    Plan a day
                  </p>
                  <h2 className="font-bangers text-3xl xl:text-4xl tracking-wider leading-none">
                    🎲 START A NEW JOURNEY
                  </h2>
                  <p className="font-comic text-sm opacity-70 mt-1">
                    Tell us your mood — we'll sketch out a comic-book day.
                  </p>
                </div>
                <button
                  onClick={() => setSetupOpen((o) => !o)}
                  className="px-4 py-2 font-bangers tracking-wide border-2 border-black text-sm whitespace-nowrap"
                  style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
                >
                  {setupOpen ? 'HIDE SETUP ▲' : '⚙️ EDIT SETUP ▼'}
                </button>
              </div>

              {/* Persona pills — always visible summary */}
              <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                <Pill>📍 {city}</Pill>
                <Pill>
                  {persona.who === 'solo' ? '🧍' : persona.who === 'couple' ? '💑' : persona.who === 'family' ? '👨‍👩‍👧' : '👯'}{' '}
                  {persona.who}
                </Pill>
                <Pill>💰 {persona.budget}</Pill>
                <Pill>⚖️ {persona.pace}</Pill>
                {profile?.diet && profile.diet !== 'no-restriction' && (
                  <Pill>🥗 {profile.diet}</Pill>
                )}
              </div>

              {setupOpen && (
                <div className="mb-4 border-t-2 border-black pt-4 grid gap-4">
                  <LocationPicker
                    city={city} setCity={setCity}
                    userCoords={userCoords} setUserCoords={setUserCoords}
                  />
                  <PersonaPicker persona={persona} setPersona={setPersona} />
                </div>
              )}

              {/* Plan WITH people — invitees are considered at generation time */}
              <div className="mb-4">
                <InviteePicker />
              </div>

              <MoodInput onSubmit={handleMood} loading={loading} voiceMode={voiceMode} />
            </section>

            {/* ═════ MY TRIPS — hosted by me ═════ */}
            {(planningMine.length + activeMine.length + completedMine.length) > 0 && (
              <Section
                title="👑 MY TRIPS"
                linkTo="/journeys"
                linkLabel="See all"
                badge={planningMine.length + activeMine.length + completedMine.length}
              >
                {planningMine.length > 0 && (
                  <SubGroup label="Planning · awaiting start">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {planningMine.slice(0, 2).map((j) => (
                        <JourneyCard
                          key={j.id}
                          journey={j}
                          onOpen={() => loadSaved({ itinerary: j.itinerary })}
                          onEnd={() => endJourney(j.id)}
                        />
                      ))}
                    </div>
                  </SubGroup>
                )}
                {activeMine.length > 0 && (
                  <SubGroup label="Active right now">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeMine.slice(0, 2).map((j) => (
                        <JourneyCard
                          key={j.id}
                          journey={j}
                          onOpen={() => loadSaved({ itinerary: j.itinerary })}
                          onEnd={() => endJourney(j.id)}
                        />
                      ))}
                    </div>
                  </SubGroup>
                )}
                {completedMine.length > 0 && (
                  <SubGroup label="Completed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completedMine.slice(0, 2).map((j) => (
                        <JourneyCard
                          key={j.id}
                          journey={j}
                          onOpen={() => loadSaved({ itinerary: j.itinerary })}
                        />
                      ))}
                    </div>
                  </SubGroup>
                )}
              </Section>
            )}

            {/* ═════ SHARED TRIPS — I'm a guest ═════ */}
            {(sharedActive.length + sharedDone.length) > 0 && (
              <Section
                title="🤝 SHARED TRIPS"
                linkTo="/journeys?tab=shared"
                linkLabel="See all"
                badge={sharedActive.length + sharedDone.length}
              >
                {sharedActive.length > 0 && (
                  <SubGroup label="In progress / pending">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sharedActive.slice(0, 2).map((j) => (
                        <JourneyCard
                          key={j.id}
                          journey={j}
                          onOpen={() => loadSaved({ itinerary: j.itinerary })}
                        />
                      ))}
                    </div>
                  </SubGroup>
                )}
                {sharedDone.length > 0 && (
                  <SubGroup label="Completed together">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sharedDone.slice(0, 2).map((j) => (
                        <JourneyCard
                          key={j.id}
                          journey={j}
                          onOpen={() => loadSaved({ itinerary: j.itinerary })}
                        />
                      ))}
                    </div>
                  </SubGroup>
                )}
              </Section>
            )}

            {/* Saved comics */}
            {allSaved.length > 0 && (
              <Section
                title="💾 SAVED PLANS"
                linkTo="/gallery"
                linkLabel="Open gallery"
                badge={allSaved.length}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {allSaved.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => loadSaved(e)}
                      className="panel p-3 text-left hover:bg-comic-yellow transition-colors"
                      style={{ background: e.itinerary?.style?.palette?.bg || '#FFF8E7' }}
                    >
                      <p className="font-bangers text-lg tracking-wider leading-tight truncate">
                        {formatPlanTitle(e)}
                      </p>
                      <p className="font-comic text-xs opacity-70 truncate">
                        {e.itinerary?.tagline || e.itinerary?.mood?.toUpperCase()}
                      </p>
                    </button>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* SIDE column */}
          <aside className="xl:col-span-4 flex flex-col gap-5 min-w-0">
            <QuickStats
              hostedCount={hostedCount}
              joinedCount={joinedCount}
              savedCount={allSaved.length}
              pendingInvites={pendingIncomingCount}
            />

            {user && (
              <InviteCTACard onClick={() => setInviteOpen(true)} />
            )}

            <IncomingInvitesCard
              pendingInvites={pendingInvites}
              onAccept={acceptInvite}
              onDecline={declineInvite}
            />

            {isGuest && (
              <GuestCTA onSignIn={() => navigate('/welcome')} />
            )}

            <TipsCard />
          </aside>
        </div>
      </main>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

// ───────────────────────── Sub-components ─────────────────────────

function ProfileHeader({ user, profile, isGuest, onSignOut, onOpenInvite }) {
  const name = profile?.name || user?.name || 'Explorer';
  return (
    <section className="mt-4">
      <div
        className="panel p-4 md:p-5 flex items-center gap-4 flex-wrap"
        style={{ background: '#FFD23F' }}
      >
        <Avatar user={user} profile={profile} />
        <div className="flex-1 min-w-0">
          <p className="font-comic text-[11px] tracking-widest uppercase opacity-70">
            {isGuest ? 'Guest mode' : user ? `Welcome back,` : 'Ready when you are'}
          </p>
          <h1 className="font-bangers text-2xl md:text-3xl xl:text-4xl tracking-wider leading-none truncate">
            {name} {!isGuest && user ? '👋' : ''}
          </h1>
          {user && (
            <p className="font-comic text-xs opacity-70 truncate">
              {user.email}
              {profile?.diet && profile.diet !== 'no-restriction' ? ` · ${profile.diet}` : ''}
              {profile?.homeCity ? ` · home: ${profile.homeCity}` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={onOpenInvite}
              className="px-3 py-2 font-comic font-bold text-sm border-2 border-black bg-white"
              style={{ boxShadow: '3px 3px 0 0 #000' }}
              title="Send a live invitation"
            >
              📨 <span className="hidden sm:inline">Invite</span>
            </button>
          )}
          {user && (
            <Link
              to="/profile"
              className="px-3 py-2 font-comic font-bold text-sm border-2 border-black bg-white hidden md:inline-block"
              style={{ boxShadow: '3px 3px 0 0 #000' }}
            >
              ⚙️ Profile
            </Link>
          )}
          {user && (
            <button
              onClick={onSignOut}
              className="px-3 py-2 font-comic font-bold text-sm border-2 border-black bg-white hover:bg-comic-red hover:text-white"
              style={{ boxShadow: '3px 3px 0 0 #000' }}
              title="Sign out"
            >
              🚪 <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function InviteBanner({ pending, onAccept, onDecline }) {
  return (
    <section className="mt-4">
      <div
        className="panel p-4 flex flex-wrap items-center gap-3"
        style={{ background: '#EE4266', color: '#fff' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">📡</span>
          <span className="font-bangers text-xl tracking-wider">
            {pending.length} LIVE INVITATION{pending.length > 1 ? 'S' : ''}
          </span>
        </div>
        <div className="flex-1 min-w-0 font-comic text-sm opacity-90 truncate">
          {pending.slice(0, 2).map((i) => (
            <span key={i.id} className="mr-3">
              <strong>{i.fromName}</strong> → {i.itineraryCity}
            </span>
          ))}
          {pending.length > 2 && <span>+{pending.length - 2} more</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(pending[0])}
            className="px-3 py-2 font-bangers text-sm border-2 border-black"
            style={{ background: '#3BCEAC', color: '#0D1B2A', boxShadow: '3px 3px 0 0 #000' }}
          >
            ✓ OPEN FIRST
          </button>
          <button
            onClick={() => onDecline(pending[0])}
            className="px-3 py-2 font-bangers text-sm border-2 border-black bg-white text-black"
            style={{ boxShadow: '3px 3px 0 0 #000' }}
          >
            ✗ DISMISS
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickStats({ hostedCount, joinedCount, savedCount, pendingInvites }) {
  const stats = [
    { icon: '👑', label: 'Hosted',  value: hostedCount,   bg: '#3BCEAC' },
    { icon: '👥', label: 'Joined',  value: joinedCount,   bg: '#FFD23F' },
    { icon: '💾', label: 'Saved',   value: savedCount,    bg: '#fff' },
    {
      icon: '📨',
      label: 'Pending',
      value: pendingInvites,
      bg: pendingInvites > 0 ? '#EE4266' : '#fff',
      color: pendingInvites > 0 ? '#fff' : '#0D1B2A'
    }
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="panel p-3 flex items-center gap-2"
          style={{ background: s.bg, color: s.color || '#0D1B2A' }}
        >
          <span className="text-2xl">{s.icon}</span>
          <div className="min-w-0">
            <p className="font-bangers text-2xl leading-none">{s.value}</p>
            <p className="font-comic text-[11px] opacity-80">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InviteCTACard({ onClick }) {
  return (
    <div className="panel p-5" style={{ background: '#3BCEAC' }}>
      <p className="font-comic text-[11px] tracking-widest uppercase opacity-70 mb-1">
        Plan together
      </p>
      <h3 className="font-bangers text-2xl tracking-wider leading-tight">
        📨 INVITE FRIENDS
      </h3>
      <p className="font-comic text-sm mt-2 opacity-90">
        Search by name or email. Invites arrive live — once accepted, they join
        your journey automatically.
      </p>
      <button
        onClick={onClick}
        className="mt-3 w-full px-4 py-3 font-bangers text-lg tracking-widest border-2 border-black"
        style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
      >
        🚀 SEND LIVE INVITE
      </button>
    </div>
  );
}

function IncomingInvitesCard({ pendingInvites, onAccept, onDecline }) {
  return (
    <div className="panel p-4" style={{ background: '#fff' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">📡</span>
        <h3 className="font-bangers text-xl tracking-wider leading-none">LIVE INVITATIONS</h3>
      </div>

      {pendingInvites.length === 0 ? (
        <p className="font-comic text-xs opacity-60">
          Nothing pending. New invitations appear here in realtime.
        </p>
      ) : (
        <ul className="grid gap-2">
          {pendingInvites.slice(0, 4).map((inv) => (
            <li
              key={inv.id}
              className="border-2 border-black p-2"
              style={{ background: '#FFF8E7' }}
            >
              <p className="font-comic font-bold text-sm truncate">
                {inv.fromName} → {inv.itineraryCity}
              </p>
              <p className="font-comic text-xs opacity-70 truncate">
                {inv.itineraryTagline || inv.itineraryMood}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onAccept(inv)}
                  className="flex-1 px-2 py-1 font-bangers text-sm border-2 border-black"
                  style={{ background: '#3BCEAC', boxShadow: '2px 2px 0 0 #000' }}
                >
                  ✓ OPEN
                </button>
                <button
                  onClick={() => onDecline(inv)}
                  className="px-2 py-1 font-bangers text-sm border-2 border-black bg-white"
                  style={{ boxShadow: '2px 2px 0 0 #000' }}
                >
                  ✗
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuestCTA({ onSignIn }) {
  return (
    <div className="panel p-5 text-center" style={{ background: '#EE4266', color: '#fff' }}>
      <p className="font-bangers text-2xl tracking-wider">👤 GUEST MODE</p>
      <p className="font-comic text-sm mt-1 opacity-90">
        Your plans won't be saved. Sign in to send/receive live invitations.
      </p>
      <button
        onClick={onSignIn}
        className="mt-3 px-5 py-2 font-bangers tracking-widest border-2 border-white"
        style={{ background: '#fff', color: '#EE4266', boxShadow: '3px 3px 0 0 #000' }}
      >
        SIGN IN
      </button>
    </div>
  );
}

function TipsCard() {
  return (
    <div className="panel p-5" style={{ background: '#FFD23F' }}>
      <p className="font-comic text-[11px] tracking-widest uppercase opacity-70 mb-1">Tip</p>
      <p className="font-bangers text-xl tracking-wide leading-tight">
        Only the host can start a journey. Once you do, everyone who accepted
        your invite rides along in real time — including the photo album.
      </p>
    </div>
  );
}

function SubGroup({ label, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-comic text-[11px] tracking-widest uppercase opacity-60 mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function Section({ title, linkTo, linkLabel, badge, children }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bangers text-2xl xl:text-3xl tracking-widest">{title}</h3>
          {typeof badge === 'number' && badge > 0 && (
            <span
              className="px-2 py-0.5 font-bangers text-xs tracking-widest border-2 border-black"
              style={{ background: '#FFD23F', boxShadow: '2px 2px 0 0 #000' }}
            >
              {badge}
            </span>
          )}
        </div>
        {linkTo && (
          <Link to={linkTo} className="font-comic text-sm font-bold underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Avatar({ user, profile }) {
  const url = profile?.photo || user?.photo;
  const name = profile?.name || user?.name || '?';
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-14 h-14 rounded-full border-4 border-black object-cover"
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-full border-4 border-black bg-white flex items-center justify-center font-bangers text-2xl">
      {name[0].toUpperCase()}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="px-2 py-0.5 border-2 border-black bg-white font-comic font-bold text-xs">
      {children}
    </span>
  );
}
