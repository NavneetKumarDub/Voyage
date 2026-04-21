import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import UserSearchField from './UserSearchField.jsx';
import { formatPlanTitle } from '../services/planUtils.js';

export default function InviteModal({ open, onClose, itinerary = null }) {
  const { sendInvite, outgoingInvites, cancelInvite, itinerary: currentItinerary, allSaved } = useVoyage();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [picked, setPicked] = useState(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const planOptions = useMemo(() => {
    const list = [];
    if (currentItinerary) {
      list.push({
        key: 'current',
        label: `🎯 Current · ${formatPlanTitle(currentItinerary)}`,
        itinerary: currentItinerary
      });
    }
    (allSaved || []).forEach((e) => {
      list.push({
        key: e.id,
        label: `💾 ${formatPlanTitle(e)}`,
        itinerary: e.itinerary
      });
    });
    return list;
  }, [currentItinerary, allSaved]);

  const [selectedKey, setSelectedKey] = useState('current');
  useEffect(() => {
    if (itinerary) return;
    if (!planOptions.find((p) => p.key === selectedKey)) {
      setSelectedKey(planOptions[0]?.key || '');
    }
  }, [planOptions, selectedKey, itinerary]);

  // Reset form state when modal re-opens.
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPicked(null);
      setNote('');
      setStatus(null);
    }
  }, [open]);

  const lockedItinerary = itinerary;
  const selectedItinerary = lockedItinerary
    || planOptions.find((p) => p.key === selectedKey)?.itinerary
    || null;

  async function handleSend(e) {
    e?.preventDefault();
    setStatus(null);
    setSending(true);
    try {
      if (!selectedItinerary) throw new Error('Pick a plan to invite someone to, or create one first.');
      await sendInvite(email, selectedItinerary, note, picked);
      setStatus({
        ok: true,
        msg: `Invitation sent to ${picked?.name || email}${picked ? '' : ' — they\'ll see it live on sign-in.'}`
      });
      setEmail('');
      setPicked(null);
      setNote('');
    } catch (err) {
      setStatus({ ok: false, msg: err.message || 'Could not send invitation.' });
    } finally {
      setSending(false);
    }
  }

  const relevantOutgoing = selectedItinerary
    ? outgoingInvites.filter((i) => i.itineraryMood === selectedItinerary.mood && i.itineraryCity === selectedItinerary.city)
    : outgoingInvites;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="panel w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-comic text-xs tracking-widest uppercase opacity-70">Realtime invite</p>
                  <h2 className="font-bangers text-3xl md:text-4xl tracking-wider leading-none">
                    📨 INVITE FRIENDS ON THIS PLAN
                  </h2>
                  {lockedItinerary && (
                    <p className="font-comic text-sm mt-1 opacity-80">
                      <strong>{formatPlanTitle(lockedItinerary)}</strong>
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="px-3 py-1 font-bangers border-2 border-black"
                  style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
                >
                  ✕
                </button>
              </div>

              {!user && (
                <div
                  className="panel p-3 mb-4 font-comic text-sm"
                  style={{ background: '#FFD23F' }}
                >
                  Sign in to send invitations — they arrive in real time for anyone you invite.
                </div>
              )}

              <form onSubmit={handleSend} className="grid gap-3">
                {!lockedItinerary && (
                  <label className="block">
                    <span className="font-comic font-bold text-sm">Which plan?</span>
                    {planOptions.length === 0 ? (
                      <div
                        className="mt-1 border-4 border-black px-4 py-3 font-comic text-sm"
                        style={{ background: '#FFF8E7' }}
                      >
                        You don't have any plans yet — generate one on the home page first,
                        then come back to invite people to it.
                      </div>
                    ) : (
                      <select
                        value={selectedKey}
                        onChange={(e) => setSelectedKey(e.target.value)}
                        disabled={!user || sending}
                        className="mt-1 w-full border-4 border-black px-4 py-3 font-comic text-base focus:outline-none focus:bg-comic-yellow bg-white"
                      >
                        {planOptions.map((p) => (
                          <option key={p.key} value={p.key}>{p.label}</option>
                        ))}
                      </select>
                    )}
                  </label>
                )}

                <div className="block">
                  <span className="font-comic font-bold text-sm">Find a person</span>
                  <div className="mt-1">
                    <UserSearchField
                      value={email}
                      onChange={(v) => { setEmail(v); if (picked?.email !== v) setPicked(null); }}
                      onUserPicked={(u) => setPicked(u)}
                      excludeUid={user?.uid || ''}
                      disabled={!user || sending}
                      placeholder="Search by name or email… (e.g. 'alex' or 'alex@')"
                      autoFocus
                    />
                  </div>
                  {picked && (
                    <div
                      className="mt-2 panel p-2 flex items-center gap-2 font-comic text-sm"
                      style={{ background: '#FFF8E7' }}
                    >
                      {picked.photo ? (
                        <img src={picked.photo} alt="" className="w-7 h-7 rounded-full border-2 border-black object-cover" />
                      ) : (
                        <span className="w-7 h-7 rounded-full border-2 border-black bg-comic-yellow flex items-center justify-center font-bangers text-sm">
                          {(picked.name || picked.email || '?')[0].toUpperCase()}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{picked.name || picked.email}</p>
                        <p className="text-xs opacity-70 truncate">{picked.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPicked(null); setEmail(''); }}
                        className="text-xs border-2 border-black bg-white px-2 py-0.5"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="font-comic font-bold text-sm">Short note (optional)</span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder="Wanna come?"
                    disabled={!user || sending}
                    className="mt-1 w-full border-4 border-black px-4 py-3 font-comic text-base focus:outline-none focus:bg-comic-yellow resize-none"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!user || sending || !email || !selectedItinerary}
                  className="panel py-3 font-bangers text-xl tracking-widest hover:bg-comic-yellow transition-colors disabled:opacity-50"
                  style={{ background: '#3BCEAC' }}
                >
                  {sending ? '📡 SENDING…' : '🚀 SEND LIVE INVITE'}
                </button>

                {status && (
                  <div
                    className="panel p-3 font-comic text-sm"
                    style={{ background: status.ok ? '#3BCEAC' : '#EE4266', color: status.ok ? '#0D1B2A' : '#fff' }}
                  >
                    {status.msg}
                  </div>
                )}
              </form>

              {relevantOutgoing.length > 0 && (
                <div className="mt-6 border-t-4 border-black pt-4">
                  <h3 className="font-bangers text-xl tracking-wider mb-2">🛰️ LIVE STATUS</h3>
                  <ul className="grid gap-2">
                    {relevantOutgoing.map((inv) => (
                      <li
                        key={inv.id}
                        className="panel p-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ background: '#FFF8E7' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-comic font-bold text-sm truncate">
                            ✉️ {inv.toName || inv.toEmail}
                          </p>
                          <p className="font-comic text-xs opacity-70 truncate">
                            {formatPlanTitle({
                              mood: inv.itineraryMood,
                              city: inv.itineraryCity,
                              plannedAt: inv.createdAt
                            })}
                          </p>
                        </div>
                        <StatusBadge status={inv.status} />
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => cancelInvite(inv)}
                            className="px-2 py-1 font-comic font-bold text-xs border-2 border-black bg-white"
                          >
                            Cancel
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   { label: '… waiting',  bg: '#FFD23F', color: '#0D1B2A' },
    accepted:  { label: '✓ accepted', bg: '#3BCEAC', color: '#0D1B2A' },
    declined:  { label: '✗ declined', bg: '#EE4266', color: '#fff'    },
    cancelled: { label: '⊘ cancelled', bg: '#ccc',    color: '#0D1B2A' }
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="px-2 py-1 border-2 border-black font-comic font-bold text-xs"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
