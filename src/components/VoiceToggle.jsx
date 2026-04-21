import React from 'react';
import { voiceSupported } from '../services/voiceService.js';

export default function VoiceToggle({ enabled, onToggle }) {
  if (!voiceSupported.synthesis && !voiceSupported.recognition) return null;

  return (
    <button
      onClick={() => onToggle(!enabled)}
      className="panel flex items-center gap-2 px-4 py-2 font-bangers text-lg tracking-wide"
      style={{
        background: enabled ? '#EE4266' : '#fff',
        color: enabled ? '#fff' : '#0D1B2A'
      }}
      aria-pressed={enabled}
    >
      <span className="text-xl">{enabled ? '🔊' : '🔇'}</span>
      VOICE MODE: {enabled ? 'ON' : 'OFF'}
    </button>
  );
}
