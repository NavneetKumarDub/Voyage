import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoyage } from '../context/VoyageContext.jsx';
import { formatPlanTitle } from '../services/planUtils.js';

export default function InvitationsInbox() {
  const { incomingInvites, pendingIncomingCount, acceptInvite, declineInvite } = useVoyage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function close(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pending = incomingInvites.filter((i) => i.status === 'pending');
  const recent = incomingInvites.filter((i) => i.status !== 'pending').slice(0, 3);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative px-3 py-1.5 font-comic font-bold text-xs lg:text-sm border-2 border-black flex items-center gap-1"
        style={{
          background: pendingIncomingCount > 0 ? '#EE4266' : '#fff',
          color: pendingIncomingCount > 0 ? '#fff' : '#0D1B2A',
          boxShadow: '3px 3px 0 0 #000'
        }}
        title="Invitations"
      >
        <span>📨</span>
        <span className="hidden lg:inline">Invites</span>
        {pendingIncomingCount > 0 && (
          <span
            className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full border-2 border-black flex items-center justify-center font-bangers text-xs animate-pulse"
            style={{ background: '#FFD23F', color: '#0D1B2A' }}
          >
            {pendingIncomingCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] z-40 panel p-3"
            style={{ background: '#fff' }}
          >
            <p className="font-bangers text-lg tracking-wider leading-none mb-2">
              📡 LIVE INVITATIONS
            </p>

            {pending.length === 0 && recent.length === 0 && (
              <p className="font-comic text-sm opacity-70 py-4 text-center">
                No invitations yet. New ones arrive here in realtime.
              </p>
            )}

            {pending.length > 0 && (
              <ul className="grid gap-2">
                {pending.map((inv) => (
                  <li
                    key={inv.id}
                    className="border-2 border-black p-2"
                    style={{ background: '#FFF8E7' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {inv.fromPhoto ? (
                        <img
                          src={inv.fromPhoto}
                          alt=""
                          className="w-7 h-7 rounded-full border-2 border-black object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-black bg-comic-yellow flex items-center justify-center font-bangers text-sm">
                          {(inv.fromName || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <p className="font-comic font-bold text-sm truncate">{inv.fromName}</p>
                    </div>
                    <p className="font-bangers text-base tracking-wide leading-tight truncate">
                      {formatPlanTitle({
                        mood: inv.itineraryMood,
                        city: inv.itineraryCity,
                        plannedAt: inv.createdAt
                      })}
                    </p>
                    {inv.itineraryTagline && (
                      <p className="font-comic text-xs italic opacity-70 truncate">
                        "{inv.itineraryTagline}"
                      </p>
                    )}
                    {inv.note && (
                      <p className="font-comic italic text-xs mt-1 opacity-80">"{inv.note}"</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => acceptInvite(inv)}
                        className="flex-1 px-2 py-1 font-bangers text-sm border-2 border-black"
                        style={{ background: '#3BCEAC', boxShadow: '2px 2px 0 0 #000' }}
                      >
                        ✓ OPEN
                      </button>
                      <button
                        onClick={() => declineInvite(inv)}
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

            {recent.length > 0 && (
              <>
                <p className="font-comic text-[11px] tracking-widest uppercase opacity-60 mt-3 mb-1">History</p>
                <ul className="grid gap-1">
                  {recent.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center gap-2 border-2 border-black/40 p-1 text-xs font-comic"
                      style={{ background: '#FFF8E7' }}
                    >
                      <span>{inv.status === 'accepted' ? '✓' : inv.status === 'declined' ? '✗' : '⊘'}</span>
                      <span className="truncate flex-1">{inv.fromName} · {inv.itineraryCity}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
