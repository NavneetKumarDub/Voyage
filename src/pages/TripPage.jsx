import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoyage } from '../context/VoyageContext.jsx';
import { generateItinerary } from '../services/groqAPI.js';
import NavBar from '../components/NavBar.jsx';

const DAY_COUNTS = [2, 3, 5, 7];
const MOOD_CHIPS = ['curious', 'adventurous', 'romantic', 'lazy', 'mysterious', 'hyper', 'nostalgic', 'happy'];

export default function TripPage() {
  const { city, setCity, persona, userCoords, setItinerary } = useVoyage();
  const navigate = useNavigate();
  const [days, setDays] = useState(3);
  const [moods, setMoods] = useState(['adventurous', 'romantic', 'lazy']);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(0);

  function setMoodAt(i, m) {
    setMoods((prev) => {
      const next = [...prev];
      next[i] = m;
      return next;
    });
  }

  function changeDays(n) {
    setDays(n);
    setMoods((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(MOOD_CHIPS[next.length % MOOD_CHIPS.length]);
      return next.slice(0, n);
    });
  }

  async function generateTrip() {
    setLoading(true);
    setTrip(null);
    try {
      const plans = await Promise.all(
        moods.slice(0, days).map((m) => generateItinerary(m, city, persona, userCoords))
      );
      setTrip(plans);
      setActiveDay(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openAsComic(dayIdx) {
    const plan = trip?.[dayIdx];
    if (!plan) return;
    setItinerary(plan);
    navigate('/comic');
  }

  const totalCostGuess = trip
    ? trip.reduce((acc, p) => acc + parseCost(p.summary?.totalCostRange), 0)
    : 0;
  const totalKm = trip
    ? trip.reduce((acc, p) => acc + (p.summary?.walkingDistanceKm || 0), 0)
    : 0;
  const totalStops = trip
    ? trip.reduce((acc, p) => acc + (p.stops?.length || 0), 0)
    : 0;

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="max-w-5xl mx-auto px-4">
        <div className="panel p-5 mb-6" style={{ background: '#3BCEAC' }}>
          <p className="font-comic text-xs tracking-widest uppercase opacity-70">Multi-Day Planner</p>
          <h1 className="font-bangers text-5xl tracking-wider leading-none">🗓️ THE TRIP</h1>
          <p className="font-comic text-sm mt-1">A different mood each day. One coherent trip.</p>
        </div>

        {/* Setup */}
        <div className="panel p-5 mb-6" style={{ background: '#fff' }}>
          <div className="mb-4">
            <p className="font-bangers text-xl tracking-widest">CITY</p>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full px-3 py-2 font-comic font-bold border-2 border-black"
            />
          </div>

          <div className="mb-4">
            <p className="font-bangers text-xl tracking-widest mb-2">HOW MANY DAYS?</p>
            <div className="flex flex-wrap gap-2">
              {DAY_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => changeDays(n)}
                  className="px-4 py-2 font-bangers text-xl tracking-wide border-2 border-black"
                  style={{
                    background: days === n ? '#FFD23F' : '#fff',
                    boxShadow: days === n ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                    transform: days === n ? 'translate(2px,2px)' : 'none'
                  }}
                >
                  {n} DAYS
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="font-bangers text-xl tracking-widest mb-2">MOOD PER DAY</p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: days }).map((_, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="font-bangers text-lg w-16">DAY {i + 1}</span>
                  <div className="flex gap-1 flex-wrap flex-1">
                    {MOOD_CHIPS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMoodAt(i, m)}
                        className="px-2 py-1 text-xs font-comic font-bold border-2 border-black"
                        style={{
                          background: moods[i] === m ? '#EE4266' : '#fff',
                          color: moods[i] === m ? '#fff' : '#0D1B2A'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateTrip}
            disabled={loading}
            className="px-6 py-3 font-bangers text-2xl tracking-widest border-2 border-black disabled:opacity-50"
            style={{ background: '#EE4266', color: '#fff', boxShadow: '4px 4px 0 0 #000' }}
          >
            {loading ? 'PLANNING…' : `🧳 GENERATE ${days}-DAY TRIP`}
          </button>
        </div>

        {/* Trip results */}
        {trip && (
          <>
            <div className="panel p-5 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: '#FFD23F' }}>
              <div>
                <p className="font-comic text-xs tracking-widest uppercase opacity-70">Trip Summary</p>
                <h2 className="font-bangers text-3xl tracking-wider leading-none">
                  {days} DAYS · {city?.toUpperCase()}
                </h2>
              </div>
              <div className="flex gap-4 text-center">
                <Stat label="Stops" value={totalStops} />
                <Stat label="Km" value={Math.round(totalKm * 10) / 10} />
                <Stat label="₹ (est.)" value={totalCostGuess.toLocaleString()} />
              </div>
            </div>

            {/* Day tabs */}
            <div className="flex gap-2 flex-wrap mb-4">
              {trip.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className="px-4 py-2 font-bangers tracking-wide border-2 border-black"
                  style={{
                    background: activeDay === i ? p.style?.palette?.bg || '#FFD23F' : '#fff',
                    boxShadow: activeDay === i ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                    transform: activeDay === i ? 'translate(2px,2px)' : 'none'
                  }}
                >
                  DAY {i + 1} · {p.mood?.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Active day preview */}
            <DayPreview plan={trip[activeDay]} onOpen={() => openAsComic(activeDay)} />
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-bangers text-2xl leading-none">{value}</p>
      <p className="font-comic text-[10px] uppercase opacity-70">{label}</p>
    </div>
  );
}

function DayPreview({ plan, onOpen }) {
  if (!plan) return null;
  const palette = plan.style?.palette || {};
  return (
    <div className="panel p-5" style={{ background: palette.bg || '#fff', color: palette.ink || '#0D1B2A' }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <p className="font-comic text-xs tracking-widest uppercase opacity-70">{plan.genre}</p>
          <h3 className="font-bangers text-3xl tracking-wider leading-none">{plan.tagline}</h3>
        </div>
        <button
          onClick={onOpen}
          className="px-4 py-2 font-bangers text-lg tracking-wide border-2 border-black"
          style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
        >
          📖 OPEN AS COMIC
        </button>
      </div>
      <ol className="space-y-1">
        {(plan.stops || []).map((s) => (
          <li key={s.order} className="font-comic text-sm flex gap-2">
            <span className="font-bold w-8">#{s.order}</span>
            <span className="w-24 opacity-70">{s.time}</span>
            <span className="mr-1">{s.emoji}</span>
            <span className="font-bold">{s.title}</span>
            <span className="opacity-70">— {s.place}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function parseCost(range) {
  if (!range) return 0;
  const nums = String(range).replace(/[,\s]/g, '').match(/\d+/g);
  if (!nums || !nums.length) return 0;
  const lo = parseInt(nums[0], 10);
  const hi = parseInt(nums[nums.length - 1], 10);
  return Math.round((lo + hi) / 2);
}
