import React, { useState } from 'react';
import { buildGoogleMapsURL, downloadICS, copyShareURL, downloadComicPNG } from '../services/exportService.js';
import InviteModal from './InviteModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ShareBar({ data, mood, city, persona, onSave, isSaved }) {
  const [copied, setCopied] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { user } = useAuth();

  async function handleShare() {
    const ok = await copyShareURL({ mood, city, persona });
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  }

  const gmaps = buildGoogleMapsURL(data.stops);

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 xl:px-8 mt-8">
      <div className="panel p-4 flex flex-wrap gap-2 justify-center" style={{ background: '#FFF8E7' }}>
        <ShareBtn
          onClick={() => setInviteOpen(true)}
          icon="📨"
          label="INVITE LIVE"
          bg="#EE4266"
          color="#fff"
          title={user ? 'Send a realtime invitation' : 'Sign in to send live invitations'}
        />
        <ShareBtn onClick={() => window.print()} icon="🖨️" label="PRINT / PDF" bg="#fff" />
        <ShareBtn onClick={() => downloadICS(data)} icon="📅" label="ADD TO CALENDAR" bg="#3BCEAC" />
        <a
          href={gmaps}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 font-bangers text-lg tracking-wide border-2 border-black"
          style={{ background: '#FFD23F', boxShadow: '3px 3px 0 0 #000' }}
        >
          🗺️ OPEN IN GOOGLE MAPS
        </a>
        <ShareBtn
          onClick={handleShare}
          icon={copied ? '✅' : '🔗'}
          label={copied ? 'COPIED!' : 'COPY SHARE LINK'}
          bg="#fff"
        />
        <ShareBtn
          onClick={() => downloadComicPNG('#comic-capture', `voyage-${mood}-${city}.png`)}
          icon="🖼️"
          label="DOWNLOAD PNG"
          bg="#fff"
        />
        <ShareBtn
          onClick={onSave}
          icon={isSaved ? '⭐' : '☆'}
          label={isSaved ? 'SAVED' : 'SAVE TO GALLERY'}
          bg={isSaved ? '#EE4266' : '#fff'}
          color={isSaved ? '#fff' : '#0D1B2A'}
        />
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        itinerary={data}
      />
    </section>
  );
}

function ShareBtn({ onClick, icon, label, bg = '#fff', color = '#0D1B2A', title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="px-4 py-2 font-bangers text-lg tracking-wide border-2 border-black"
      style={{ background: bg, color, boxShadow: '3px 3px 0 0 #000' }}
    >
      {icon} {label}
    </button>
  );
}
