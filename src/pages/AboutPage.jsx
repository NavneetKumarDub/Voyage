import React from 'react';
import NavBar from '../components/NavBar.jsx';

const STACK = [
  { name: 'React 18',      role: 'UI library',               why: 'Component-driven, fast hot-reload.' },
  { name: 'Vite',          role: 'Dev server + bundler',     why: '234ms boot. Instant HMR.' },
  { name: 'Tailwind CSS',  role: 'Styling',                  why: 'Comic-book theme hand-crafted with utility classes.' },
  { name: 'Framer Motion', role: 'Animations',               why: 'Smooth page + panel transitions.' },
  { name: 'React Router',  role: 'Routing',                  why: 'Real URLs per page, back/forward, shareable.' },
  { name: 'Groq · Llama 3.3 70B', role: 'Plan generation',   why: 'Fastest LLM API with JSON mode.' },
  { name: 'Pollinations.ai', role: 'Image generation',       why: 'Free comic-style visuals per panel.' },
  { name: 'Leaflet + OSM', role: 'Interactive map',          why: 'Free tiles, custom comic pins.' },
  { name: 'Open-Meteo',    role: 'Weather forecast',         why: 'Free hourly data, no key.' },
  { name: 'Nominatim',     role: 'Geocoding / reverse geo',  why: 'Free, powered by OpenStreetMap.' },
  { name: 'Web Speech API', role: 'Voice input + narration',  why: 'Browser-native, no libraries.' },
  { name: 'Firebase Auth + Firestore', role: 'Login + sync', why: 'Google Sign-in, cloud-saved comics.' },
  { name: '@dnd-kit',      role: 'Drag-drop',                why: 'Used in the Plan Editor.' },
  { name: 'html2canvas',   role: 'PNG export',                why: 'Capture the comic as an image.' }
];

const FEATURES = [
  ['🤖 Mood → Comic', 'One word becomes a 6-stop day with dialogue, SFX, and panels.'],
  ['🗺️ Real Map',     'Leaflet map with numbered pins, a YOU marker, and full-route deep link.'],
  ['🎙️ Voice Mode',   'Speak the mood · hear the comic narrated · "heard: X" feedback.'],
  ['🌦️ Weather Aware', 'Hourly forecast baked into each panel.'],
  ['📍 Start Near You', 'GPS, typed city, or dropped map pin — plan starts ≤2 km from you.'],
  ['✏️ Editor',        'Drag to reorder, edit inline, auto-optimize by distance.'],
  ['🎬 Reader',        'Cinematic single-panel mode with keyboard nav + auto-advance.'],
  ['📚 Gallery',       'Save favorites — synced to your Google account.'],
  ['🗓️ Multi-day Trip', 'Plan 2–7 days with a different mood each day.'],
  ['🛠️ AI Refine',     '"Make it cheaper" or "add a dessert stop" — AI rewrites the plan.'],
  ['📅 Calendar + PDF', 'Export .ics, download PNG, open full route in Google Maps.']
];

export default function AboutPage() {
  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="max-w-5xl mx-auto px-4">
        <div className="panel p-5 mb-6" style={{ background: '#0D1B2A', color: '#fff' }}>
          <p className="font-comic text-xs tracking-widest uppercase opacity-70">The Behind-the-Scenes</p>
          <h1 className="font-bangers text-5xl tracking-wider leading-none">ℹ️ ABOUT VOYAGE</h1>
          <p className="font-comic text-sm mt-2 max-w-2xl">
            A mood-based 1-day travel planner that renders your day as a comic book.
            Built for a 3-hour hackathon with the goal of winning on challenge completion,
            creativity, technical execution, and design + theme alignment.
          </p>
        </div>

        {/* Features */}
        <div className="mb-10">
          <h2 className="font-bangers text-3xl tracking-wider mb-3">⚡ FEATURES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURES.map(([t, d]) => (
              <div key={t} className="panel p-3" style={{ background: '#fff' }}>
                <p className="font-bangers text-xl tracking-wide">{t}</p>
                <p className="font-comic text-sm opacity-80">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="mb-10">
          <h2 className="font-bangers text-3xl tracking-wider mb-3">🛠️ TECH STACK</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STACK.map((t) => (
              <div key={t.name} className="panel p-3 flex flex-col" style={{ background: '#fff' }}>
                <div className="flex items-baseline gap-2">
                  <p className="font-bangers text-xl tracking-wide">{t.name}</p>
                  <p className="font-comic text-xs uppercase opacity-60">{t.role}</p>
                </div>
                <p className="font-comic text-sm opacity-80">{t.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How */}
        <div className="panel p-5 mb-10" style={{ background: '#FFD23F' }}>
          <h2 className="font-bangers text-3xl tracking-wider mb-2">🧠 HOW THE AI WORKS</h2>
          <ol className="space-y-2 font-comic text-sm">
            <li><strong>1.</strong> You pick a mood, persona, starting point, and city.</li>
            <li><strong>2.</strong> We send a structured prompt to <b>Groq (Llama 3.3 70B)</b> demanding JSON output with a strict schema for 6 stops, transitions, coordinates, essentials.</li>
            <li><strong>3.</strong> A post-processor (<code>planUtils.js</code>) reorders stops so #1 is closest to you — guaranteeing the plan starts near you.</li>
            <li><strong>4.</strong> Pollinations.ai generates a comic-style image per panel (same mood + place = same image, seeded).</li>
            <li><strong>5.</strong> Open-Meteo fetches hourly weather. Each panel tags the forecast for its hour.</li>
            <li><strong>6.</strong> Leaflet renders the route. You can refine with "tweak this plan" → AI regenerates respecting your constraints.</li>
          </ol>
        </div>

        <p className="text-center font-comic text-xs opacity-60">
          Roll. Commit. Ship. · Made with ❤️ and caffeine.
        </p>
      </section>
    </div>
  );
}
