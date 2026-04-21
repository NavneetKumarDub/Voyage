import React from 'react';

const WHO_OPTS = [
  { key: 'solo',    label: 'Solo',     icon: '🧍' },
  { key: 'couple',  label: 'Couple',   icon: '💑' },
  { key: 'family',  label: 'Family',   icon: '👨‍👩‍👧' },
  { key: 'friends', label: 'Friends',  icon: '👯' }
];

const BUDGET_OPTS = [
  { key: 'low',    label: 'Shoestring', hint: '₹500–1,500',  icon: '💰' },
  { key: 'mid',    label: 'Comfortable', hint: '₹1,500–4k',  icon: '💰💰' },
  { key: 'high',   label: 'Splurge',    hint: '₹4k+',        icon: '💰💰💰' }
];

const PACE_OPTS = [
  { key: 'chill',    label: 'Chill',    hint: '4 stops',  icon: '🐢' },
  { key: 'balanced', label: 'Balanced', hint: '6 stops',  icon: '⚖️' },
  { key: 'packed',   label: 'Packed',   hint: '8 stops',  icon: '⚡' }
];

export default function PersonaPicker({ persona, setPersona }) {
  const update = (field) => (value) => setPersona({ ...persona, [field]: value });

  return (
    <div className="max-w-4xl mx-auto px-4 mb-6">
      <div className="panel p-5" style={{ background: '#fff' }}>
        <p className="font-comic font-bold text-sm uppercase tracking-widest opacity-60 mb-4 text-center">
          Who · Budget · Pace — shapes your entire day
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Section title="WHO" opts={WHO_OPTS} value={persona.who} onChange={update('who')} />
          <Section title="BUDGET" opts={BUDGET_OPTS} value={persona.budget} onChange={update('budget')} />
          <Section title="PACE" opts={PACE_OPTS} value={persona.pace} onChange={update('pace')} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, opts, value, onChange }) {
  return (
    <div>
      <p className="font-bangers tracking-widest text-center mb-2">{title}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {opts.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              onClick={() => onChange(o.key)}
              className="px-3 py-2 font-comic font-bold text-sm border-2 border-black transition-all"
              style={{
                background: active ? '#FFD23F' : '#fff',
                boxShadow: active ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                transform: active ? 'translate(2px,2px)' : 'none'
              }}
            >
              <span className="mr-1">{o.icon}</span>
              {o.label}
              {o.hint && <span className="block text-[10px] opacity-60">{o.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
