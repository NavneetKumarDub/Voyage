import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu.jsx';
import InvitationsInbox from './InvitationsInbox.jsx';
import InviteModal from './InviteModal.jsx';
import { useVoyage } from '../context/VoyageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/',         label: 'Home',     icon: '🏠' },
  { to: '/comic',    label: 'Comic',    icon: '📖', requiresComic: true },
  { to: '/read',     label: 'Reader',   icon: '🎬', requiresComic: true },
  { to: '/edit',     label: 'Editor',   icon: '✏️', requiresComic: true },
  { to: '/journeys', label: 'Journeys', icon: '🧭' },
  { to: '/gallery',  label: 'Gallery',  icon: '📚' },
  { to: '/photos',   label: 'Photos',   icon: '📸' },
  { to: '/about',    label: 'About',    icon: 'ℹ️' }
];

export default function NavBar() {
  const loc = useLocation();
  const { itinerary } = useVoyage();
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <header className="w-full max-w-[1600px] mx-auto px-4 xl:px-8 pt-5 pb-3 flex items-center gap-3">
      {/* Logo */}
      <NavLink to="/" className="font-bangers text-xl lg:text-2xl tracking-wider shrink-0">
        💥 VOYAGE
      </NavLink>

      {/* Nav links — scroll horizontally if they overflow */}
      <nav className="flex-1 flex gap-1 items-center overflow-x-auto no-scrollbar">
        {LINKS.map((l) => {
          const disabled = l.requiresComic && !itinerary;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={(e) => { if (disabled) e.preventDefault(); }}
              className={({ isActive }) =>
                `shrink-0 px-2 lg:px-3 py-1.5 font-comic font-bold text-xs lg:text-sm border-2 border-black flex items-center gap-1 transition-all ${
                  disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-comic-yellow'
                }`
              }
              style={({ isActive }) => ({
                background: isActive && loc.pathname === l.to ? '#FFD23F' : '#fff',
                boxShadow: isActive && loc.pathname === l.to ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                transform: isActive && loc.pathname === l.to ? 'translate(2px,2px)' : 'none'
              })}
              title={disabled ? 'Generate a comic first' : l.label}
            >
              <span>{l.icon}</span>
              <span className="hidden lg:inline">{l.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Send realtime invitation */}
      {user && (
        <button
          onClick={() => setInviteOpen(true)}
          className="shrink-0 px-3 py-1.5 font-comic font-bold text-xs lg:text-sm border-2 border-black flex items-center gap-1"
          style={{ background: '#3BCEAC', boxShadow: '3px 3px 0 0 #000' }}
          title="Send a live invitation"
        >
          <span>📨</span>
          <span className="hidden lg:inline">Invite</span>
        </button>
      )}

      {/* Realtime invitations inbox */}
      {user && (
        <div className="shrink-0">
          <InvitationsInbox />
        </div>
      )}

      {/* User menu — always at the end */}
      <div className="shrink-0">
        <UserMenu />
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </header>
  );
}
