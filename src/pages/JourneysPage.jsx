import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';
import JourneyCard from '../components/JourneyCard.jsx';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'planning',  label: 'Planning' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'abandoned', label: 'Ended' }
];

export default function JourneysPage() {
  const { isAuthed } = useAuth();
  const { myHostedJourneys, sharedJourneys, loadSaved, endJourney } = useVoyage();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab from URL (?tab=shared) so deep-links from HomePage work
  const initialTab = new URLSearchParams(location.search).get('tab') === 'shared' ? 'shared' : 'mine';
  const [tab, setTab] = useState(initialTab);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const t = new URLSearchParams(location.search).get('tab');
    if (t === 'shared' || t === 'mine') setTab(t);
  }, [location.search]);

  function switchTab(next) {
    setTab(next);
    const p = new URLSearchParams(location.search);
    if (next === 'mine') p.delete('tab');
    else p.set('tab', next);
    navigate({ pathname: '/journeys', search: p.toString() }, { replace: true });
  }

  const source = tab === 'shared' ? sharedJourneys : myHostedJourneys;
  const filtered = useMemo(() => {
    if (status === 'all') return source;
    return source.filter((j) => j.status === status);
  }, [source, status]);

  const countFor = (key) =>
    key === 'all' ? source.length : source.filter((j) => j.status === key).length;

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="w-full max-w-[1600px] mx-auto px-4 xl:px-8">
        {/* Hero */}
        <div
          className="panel p-5 mb-5 flex items-center justify-between gap-3 flex-wrap"
          style={{ background: '#3BCEAC' }}
        >
          <div>
            <p className="font-comic text-xs tracking-widest uppercase opacity-70">History</p>
            <h1 className="font-bangers text-4xl xl:text-5xl tracking-wider leading-none">🧭 JOURNEYS</h1>
            <p className="font-comic text-sm mt-1">
              Plans you've hosted and trips you're traveling with others on.
            </p>
          </div>
          <div className="flex gap-2 text-right">
            <StatChip
              icon="👑"
              label="Hosted"
              value={myHostedJourneys.length}
              bg="#fff"
            />
            <StatChip
              icon="🤝"
              label="Shared"
              value={sharedJourneys.length}
              bg="#FFD23F"
            />
          </div>
        </div>

        {!isAuthed && (
          <div className="panel p-5 mb-5" style={{ background: '#fff' }}>
            <p className="font-comic">Sign in to keep your journey history across devices.</p>
          </div>
        )}

        {/* Top-level tabs: My Trips / Shared */}
        <div
          className="border-4 border-black p-1 mb-5 inline-flex gap-1"
          style={{ background: '#fff', boxShadow: '4px 4px 0 0 #000' }}
          role="tablist"
        >
          <TabButton
            active={tab === 'mine'}
            onClick={() => switchTab('mine')}
            icon="👑"
            label="My Trips"
            count={myHostedJourneys.length}
          />
          <TabButton
            active={tab === 'shared'}
            onClick={() => switchTab('shared')}
            icon="🤝"
            label="Shared With Me"
            count={sharedJourneys.length}
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUS_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className="px-4 py-2 font-bangers tracking-wide border-2 border-black text-sm"
              style={{
                background: status === t.key ? '#FFD23F' : '#fff',
                boxShadow: status === t.key ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                transform: status === t.key ? 'translate(2px,2px)' : 'none'
              }}
            >
              {t.label} · {countFor(t.key)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState tab={tab} status={status} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map((j) => (
              <JourneyCard
                key={j.id}
                journey={j}
                onOpen={() => loadSaved({ itinerary: j.itinerary })}
                onEnd={tab === 'mine' ? () => endJourney(j.id) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className="flex items-center gap-2 px-4 py-2 font-bangers tracking-widest text-sm border-2"
      style={{
        background: active ? '#FFD23F' : 'transparent',
        borderColor: active ? '#000' : 'transparent',
        color: '#0D1B2A'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span
        className="font-comic font-bold text-xs px-1.5 py-0.5 border-2 border-black"
        style={{ background: active ? '#fff' : '#FFF8E7' }}
      >
        {count}
      </span>
    </button>
  );
}

function StatChip({ icon, label, value, bg }) {
  return (
    <div
      className="px-3 py-2 border-2 border-black font-bangers flex items-center gap-2"
      style={{ background: bg, boxShadow: '2px 2px 0 0 #000' }}
    >
      <span>{icon}</span>
      <div className="leading-none">
        <p className="text-xl">{value}</p>
        <p className="font-comic text-[10px] tracking-widest opacity-70">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ tab, status }) {
  const base = tab === 'shared' ? {
    icon: '🤝',
    title: 'NO SHARED TRIPS',
    body: "Ask a friend to invite you on a plan — once you accept, it'll show up here."
  } : {
    icon: '🧭',
    title: 'NO JOURNEYS YET',
    body: 'Generate a plan, hit "Start Journey," and your trips will show up here.'
  };
  return (
    <div className="panel p-8 text-center" style={{ background: '#fff' }}>
      <div className="text-6xl mb-2">{base.icon}</div>
      <p className="font-bangers text-2xl tracking-wider">{base.title}</p>
      <p className="font-comic text-sm opacity-70 mt-1">
        {status !== 'all' ? `Nothing with status "${status}" yet.` : base.body}
      </p>
      <Link
        to="/"
        className="inline-block mt-4 px-5 py-2 font-bangers tracking-widest border-2 border-black"
        style={{ background: '#FFD23F', boxShadow: '3px 3px 0 0 #000' }}
      >
        🎲 PLAN A DAY
      </Link>
    </div>
  );
}
