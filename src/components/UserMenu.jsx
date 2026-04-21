import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserMenu() {
  const { user, profile, available, signIn } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="panel px-3 py-2 font-comic font-bold text-sm flex items-center gap-2 hover:bg-comic-yellow"
        title={available ? 'Sign in with Google' : 'Firebase not configured — add config to .env.local'}
      >
        <GoogleLogo />
        <span>SIGN IN</span>
      </button>
    );
  }

  const photo = profile?.photo || user.photo;
  const name = profile?.name || user.name || 'You';

  return (
    <button
      onClick={() => navigate('/profile')}
      title="Open your profile"
      className="panel px-2 py-1 font-comic font-bold text-sm flex items-center gap-2 hover:bg-comic-yellow"
    >
      <Avatar url={photo} name={name} size={32} />
      <span className="hidden md:inline max-w-[140px] truncate">{name.split(' ')[0]}</span>
    </button>
  );
}

function Avatar({ url, name, size }) {
  if (url) {
    return <img src={url} alt={name} style={{ width: size, height: size }}
                 className="rounded-full border-2 border-black object-cover" />;
  }
  return (
    <div className="rounded-full border-2 border-black bg-comic-yellow flex items-center justify-center font-bangers"
         style={{ width: size, height: size, fontSize: size * 0.48 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.2 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.7 29 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.3-4.3 2.1-6.9 2.1-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C8.8 38.7 15.8 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.2l6 4.9C40.9 34.9 43.5 30 43.5 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
