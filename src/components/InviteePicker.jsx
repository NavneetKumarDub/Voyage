import React, { useState } from 'react';
import UserSearchField from './UserSearchField.jsx';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Pre-plan invitee picker.
//
// Before the user clicks "Generate", they can queue up travel buddies here.
// The plan is then generated for the whole group, and live invitations are
// dispatched the moment the itinerary is ready. Invitees who accept land
// in their "Shared Trips" tab; the plan accounts for them either way.
export default function InviteePicker() {
  const { user, isAuthed } = useAuth();
  const { plannedInvitees, addPlannedInvitee, removePlannedInvitee } = useVoyage();
  const [term, setTerm] = useState('');
  const [expanded, setExpanded] = useState(false);

  if (!isAuthed) return null;

  function handlePick(u) {
    addPlannedInvitee(u);
    setTerm('');
  }

  function handleEnterEmail(e) {
    e?.preventDefault?.();
    const email = term.trim();
    if (!email || !email.includes('@')) return;
    addPlannedInvitee({ email, name: '', photo: '' });
    setTerm('');
  }

  const hasInvitees = plannedInvitees.length > 0;

  return (
    <div
      className="border-2 border-black p-3 md:p-4"
      style={{ background: '#FFF8E7' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">👥</span>
          <div className="min-w-0">
            <p className="font-bangers text-base tracking-widest leading-none">
              TRAVEL BUDDIES
            </p>
            <p className="font-comic text-[11px] opacity-70 leading-tight">
              Invited before generation — the plan is tailored to everyone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasInvitees && (
            <span
              className="px-2 py-0.5 font-bangers text-xs tracking-widest border-2 border-black"
              style={{ background: '#3BCEAC' }}
            >
              {plannedInvitees.length} queued
            </span>
          )}
          <button
            type="button"
            onClick={() => setExpanded((x) => !x)}
            className="text-xs font-comic font-bold underline"
          >
            {expanded ? 'Hide' : hasInvitees ? 'Manage' : '+ Add someone'}
          </button>
        </div>
      </div>

      {hasInvitees && (
        <ul className="flex flex-wrap gap-2 mb-2">
          {plannedInvitees.map((inv) => (
            <li
              key={inv.email}
              className="flex items-center gap-2 pl-1 pr-2 py-1 border-2 border-black bg-white text-xs font-comic"
            >
              {inv.photo ? (
                <img src={inv.photo} alt="" className="w-5 h-5 rounded-full border border-black object-cover" />
              ) : (
                <span className="w-5 h-5 rounded-full border border-black bg-comic-yellow flex items-center justify-center font-bangers text-[10px]">
                  {(inv.name || inv.email || '?')[0].toUpperCase()}
                </span>
              )}
              <span className="max-w-[160px] truncate font-bold">
                {inv.name || inv.email}
              </span>
              <button
                type="button"
                onClick={() => removePlannedInvitee(inv.email)}
                className="text-sm opacity-60 hover:opacity-100"
                aria-label={`Remove ${inv.email}`}
                title="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {expanded && (
        <form onSubmit={handleEnterEmail} className="grid gap-2">
          <UserSearchField
            value={term}
            onChange={setTerm}
            onUserPicked={handlePick}
            excludeUid={user?.uid || ''}
            placeholder="Search name or email · or type an email and press Enter"
          />
          {term.includes('@') && (
            <button
              type="submit"
              className="self-start px-3 py-2 font-bangers text-sm tracking-widest border-2 border-black"
              style={{ background: '#FFD23F', boxShadow: '2px 2px 0 0 #000' }}
            >
              ＋ ADD {term.trim()}
            </button>
          )}
          <p className="font-comic text-[11px] opacity-60">
            Tip: no match? Type the full email and press Enter — they'll get
            the invite the next time they sign in.
          </p>
        </form>
      )}
    </div>
  );
}
