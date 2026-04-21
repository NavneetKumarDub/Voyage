import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

export default function WelcomePage() {
  const { signIn, continueAsGuest, available } = useAuth();
  const navigate = useNavigate();

  async function handleSignIn() {
    await signIn();
  }

  function handleGuest() {
    continueAsGuest();
    navigate('/');
  }

  return (
    <div className="page-bg min-h-screen w-full overflow-hidden relative">
      {/* Decorative floating comic dots */}
      <FloatingDecor />

      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-10 p-4 lg:p-8 xl:p-12">
        {/* ═════════ LEFT: Hero + CTA ═════════ */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center"
        >
          <div className="max-w-3xl">
            <div className="inline-block mb-5 wobble">
              <span
                className="inline-block px-4 py-1 font-bangers text-base tracking-widest border-4 border-black"
                style={{ background: '#FFD23F', boxShadow: '4px 4px 0 0 #000' }}
              >
                ISSUE #001 · REALTIME EDITION
              </span>
            </div>

            <h1 className="font-bangers text-6xl sm:text-7xl md:text-8xl xl:text-9xl tracking-wider leading-[0.9]">
              VOYAGE<span className="text-comic-red">!</span>
            </h1>

            <p className="font-comic text-xl md:text-2xl xl:text-3xl mt-5 font-bold max-w-2xl leading-snug">
              A mood-based 1-day travel planner — rendered as a comic book.
              <span className="block mt-2 text-base md:text-lg xl:text-xl opacity-80 font-normal">
                Now with <strong>realtime invitations</strong> — plan together,
                live, across devices.
              </span>
            </p>

            {/* CTA panel */}
            <div
              className="panel p-6 xl:p-8 mt-8 max-w-xl"
              style={{ background: '#fff' }}
            >
              <p className="font-comic font-bold text-sm opacity-70 mb-4">
                Sign in to save plans and send live invites to friends.
              </p>

              <button
                onClick={handleSignIn}
                disabled={!available}
                className="w-full panel py-4 font-bangers text-xl tracking-widest flex items-center justify-center gap-3 hover:bg-comic-yellow transition-colors disabled:opacity-50"
              >
                <GoogleLogo size={24} />
                <span>SIGN IN WITH GOOGLE</span>
              </button>

              {!available && (
                <p className="font-comic text-[11px] opacity-70 mt-2">
                  Firebase not configured — sign-in disabled. Add your Firebase
                  config to .env.local.
                </p>
              )}

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-0.5 bg-black/20" />
                <span className="font-comic text-xs uppercase tracking-widest opacity-60">
                  or
                </span>
                <div className="flex-1 h-0.5 bg-black/20" />
              </div>

              <button
                onClick={handleGuest}
                className="w-full px-4 py-3 font-comic font-bold text-sm border-2 border-black hover:bg-comic-yellow"
              >
                🚶 Continue as Guest
              </button>
              <p className="font-comic text-[11px] opacity-60 mt-2">
                Guests can generate plans but can't send or receive live
                invitations.
              </p>
            </div>

            {/* Feature row (desktop widescreen) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-3xl">
              <MiniFeature icon="🤖" title="AI plans" body="Personalized to you" />
              <MiniFeature icon="🗺️" title="Real maps" body="Walkable routes" />
              <MiniFeature icon="📖" title="Comic style" body="A day you'll remember" />
              <MiniFeature icon="📡" title="Live invites" body="Realtime co-planning" />
            </div>
          </div>
        </motion.section>

        {/* ═════════ RIGHT: Visual showcase ═════════ */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col justify-center gap-4"
        >
          {/* Preview comic panel card */}
          <div
            className="panel p-5 xl:p-6 relative overflow-hidden"
            style={{ background: '#FFD23F' }}
          >
            <div
              className="absolute inset-0 opacity-30 halftone-light pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="font-bangers text-sm tracking-widest opacity-70">PANEL 01</p>
              <h3 className="font-bangers text-3xl xl:text-4xl tracking-wider leading-none mt-1">
                A MOOD.
              </h3>
              <h3 className="font-bangers text-3xl xl:text-4xl tracking-wider leading-none mt-1">
                A CITY.
              </h3>
              <h3 className="font-bangers text-3xl xl:text-4xl tracking-wider leading-none mt-1 text-comic-red">
                AN ADVENTURE.
              </h3>

              <div
                className="mt-4 bubble max-w-[80%]"
                style={{ background: '#fff' }}
              >
                <p className="font-comic font-bold text-sm">
                  "Feeling adventurous in Delhi..."
                </p>
              </div>
              <div
                className="mt-3 ml-auto bubble max-w-[85%]"
                style={{ background: '#3BCEAC' }}
              >
                <p className="font-comic font-bold text-sm">
                  BAM! Here's a 6-stop day, mapped and ready.
                </p>
              </div>
            </div>
          </div>

          {/* Realtime-invite showcase */}
          <div
            className="panel p-5 xl:p-6 relative overflow-hidden"
            style={{ background: '#EE4266', color: '#fff' }}
          >
            <p className="font-bangers text-sm tracking-widest opacity-80">LIVE NOW</p>
            <h3 className="font-bangers text-2xl xl:text-3xl tracking-wider leading-none mt-1">
              📡 REALTIME INVITES
            </h3>
            <p className="font-comic text-sm mt-2 opacity-90">
              Send a plan to a friend's email — if they're online, it pops into
              their inbox <em>instantly</em> via a live connection. No refresh.
              No email wait.
            </p>
            <div className="mt-3 grid gap-2">
              <MiniInvitePreview
                from="You"
                to="alex@email.com"
                status="🟡 pending…"
              />
              <MiniInvitePreview
                from="Alex"
                to="you"
                status="🟢 accepted"
                flip
              />
            </div>
          </div>

          {/* Credit bar */}
          <div className="panel p-3 flex items-center justify-between text-xs font-comic">
            <span>📚 Built like a comic</span>
            <span>•</span>
            <span>🔗 Firestore-powered live sync</span>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

function MiniFeature({ icon, title, body }) {
  return (
    <div className="panel p-3 xl:p-4" style={{ background: '#fff' }}>
      <div className="text-2xl xl:text-3xl">{icon}</div>
      <p className="font-bangers tracking-wide text-sm xl:text-base leading-none mt-1">
        {title}
      </p>
      <p className="font-comic text-[11px] xl:text-xs opacity-70">{body}</p>
    </div>
  );
}

function MiniInvitePreview({ from, to, status, flip = false }) {
  return (
    <div
      className={`border-2 border-black p-2 bg-white text-[#0D1B2A] text-xs font-comic flex items-center gap-2 ${
        flip ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <span className="w-6 h-6 rounded-full bg-comic-yellow border-2 border-black flex items-center justify-center font-bangers">
        {from[0]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{from} → {to}</p>
        <p className="opacity-70">{status}</p>
      </div>
    </div>
  );
}

function FloatingDecor() {
  return (
    <>
      <div
        className="absolute top-8 right-10 font-bangers text-6xl xl:text-8xl opacity-20 select-none pointer-events-none rotate-12"
        aria-hidden="true"
      >
        POW!
      </div>
      <div
        className="absolute bottom-12 left-10 font-bangers text-5xl xl:text-7xl opacity-15 select-none pointer-events-none -rotate-6"
        aria-hidden="true"
      >
        ZOOM!
      </div>
      <div
        className="absolute top-1/2 right-1/3 font-bangers text-4xl xl:text-6xl opacity-10 select-none pointer-events-none rotate-6 hidden md:block"
        aria-hidden="true"
      >
        BAM!
      </div>
    </>
  );
}

function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.2 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.7 29 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.3-4.3 2.1-6.9 2.1-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C8.8 38.7 15.8 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.2l6 4.9C40.9 34.9 43.5 30 43.5 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
