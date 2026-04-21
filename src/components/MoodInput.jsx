import React, { useState, useRef } from 'react';
import { PRESET_MOODS, moodStyles } from '../data/moodPresets.js';
import { startListening, voiceSupported } from '../services/voiceService.js';

const KNOWN_MOODS = Object.keys(moodStyles);

export default function MoodInput({ onSubmit, loading, voiceMode }) {
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const stopRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const mood = value.trim();
    if (!mood || loading) return;
    onSubmit(mood);
  }

  function handleMic() {
    if (listening) {
      stopRef.current?.();
      setListening(false);
      return;
    }
    setListening(true);
    setHeard('');
    stopRef.current = startListening({
      onResult: (text) => {
        setHeard(text);
        const mood = extractMood(text);
        setValue(mood);
        setListening(false);
        if (mood) {
          setTimeout(() => onSubmit(mood), 400); // brief pause so user sees what we heard
        }
      },
      onError: () => setListening(false),
      onEnd: () => setListening(false)
    });
  }

  function pick(mood) {
    setValue(mood);
    onSubmit(mood);
  }

  // Smart extractor: tries known moods first, then picks a meaningful word
  // from phrases like "I feel happy", "I'm kinda lazy", "my mood is romantic".
  function extractMood(raw) {
    if (!raw) return '';
    const text = raw.toLowerCase().replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').filter(Boolean);

    // 1) Exact match against known moods (preset + custom aliases)
    for (const w of words) {
      if (KNOWN_MOODS.includes(w)) return w;
    }

    // 2) Contains a known mood as substring (e.g. "I'm feeling romantic today")
    for (const known of KNOWN_MOODS) {
      if (text.includes(known)) return known;
    }

    // 3) Strip filler words and take the most descriptive remaining word
    const FILLER = new Set([
      'i', 'am', 'a', 'an', 'the', 'my', 'me', 'is', 'are', 'was', 'were',
      'feel', 'feeling', 'felt', 'mood', 'kind', 'kinda', 'sort', 'really',
      'very', 'so', 'today', 'now', 'right', 'currently', 'bit', 'little',
      'of', 'to', 'in', 'on', 'and', 'but', 'just', 'im', 'its'
    ]);
    const meaningful = words.filter((w) => !FILLER.has(w) && w.length > 2);
    if (meaningful.length) return meaningful[meaningful.length - 1];

    // 4) Absolute fallback — first word that has letters
    return words[0] || '';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* What we heard */}
      {heard && (
        <div className="mb-3 text-center">
          <span className="inline-block px-3 py-1 font-comic text-sm bg-white border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
            🎙️ Heard: <em>"{heard}"</em> → <span className="font-bold">{value || '?'}</span>
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a mood… (happy, nostalgic, hyper)"
          className="panel flex-1 px-5 py-4 text-xl font-comic font-bold outline-none focus:ring-4 focus:ring-comic-red"
          disabled={loading}
        />

        {voiceSupported.recognition && (
          <button
            type="button"
            onClick={handleMic}
            className={`panel px-5 py-4 font-bangers text-2xl tracking-wider ${listening ? 'mic-pulse' : ''}`}
            style={{ background: listening ? '#EE4266' : '#3BCEAC', color: '#0D1B2A' }}
            disabled={loading}
            aria-label="Voice input"
          >
            {listening ? '🎙️ LISTENING…' : '🎙️ SPEAK'}
          </button>
        )}

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="panel px-8 py-4 font-bangers text-3xl tracking-widest disabled:opacity-50"
          style={{ background: '#FFD23F', color: '#0D1B2A' }}
        >
          {loading ? 'ROLLING…' : 'ROLL!'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-5 justify-center">
        <span className="font-comic text-sm opacity-70 self-center mr-2">Try:</span>
        {PRESET_MOODS.map((m) => (
          <button
            key={m}
            onClick={() => pick(m)}
            disabled={loading}
            className="px-4 py-1 font-bangers tracking-wide text-lg border-2 border-black bg-white hover:bg-comic-yellow transition-colors disabled:opacity-50"
            style={{ boxShadow: '3px 3px 0 0 #000' }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
