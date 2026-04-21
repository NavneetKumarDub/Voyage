import React, { useState } from 'react';

const QUICK_REQUESTS = [
  'Make it cheaper',
  'More adventurous',
  'Swap lunch for Italian',
  'Add a dessert stop',
  'Remove the last stop',
  'Make it kid-friendly',
  'Less walking',
  'More street food'
];

export default function RefineBox({ onRefine, loading }) {
  const [value, setValue] = useState('');

  function submit(text) {
    const t = (text || value).trim();
    if (!t || loading) return;
    onRefine(t);
    setValue('');
  }

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <div className="panel p-5" style={{ background: '#0D1B2A', color: '#fff' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bangers text-2xl tracking-wider">🛠️ TWEAK THIS PLAN</span>
          <span className="font-comic text-xs opacity-75">· AI will refine without losing your mood</span>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="flex flex-col md:flex-row gap-2 mb-3"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            placeholder="e.g. 'swap dinner for vegan', 'more budget-friendly', 'add a bookstore stop'…"
            className="flex-1 px-4 py-3 font-comic font-bold text-black outline-none border-4 border-black"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="px-6 py-3 font-bangers text-xl tracking-wide border-4 border-black disabled:opacity-50"
            style={{ background: '#EE4266', color: '#fff', boxShadow: '3px 3px 0 0 #fff' }}
          >
            {loading ? 'REFINING…' : '✨ REFINE'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <span className="font-comic text-xs opacity-70 self-center">Quick tweaks:</span>
          {QUICK_REQUESTS.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={loading}
              className="px-3 py-1 text-xs font-comic font-bold border-2 border-white bg-white/10 hover:bg-white/25 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
