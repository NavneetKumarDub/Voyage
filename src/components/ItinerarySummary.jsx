import React, { useMemo } from 'react';

export default function ItinerarySummary({ data }) {
  if (!data?.stops) return null;
  const { stops, transitions = [], mood, city, style, summary } = data;
  const palette = style?.palette || {};
  const trMap = useMemo(
    () => new Map(transitions.map((t) => [`${t.from}-${t.to}`, t])),
    [transitions]
  );

  // Running cost totals (parse "₹200 – ₹400" → midpoint)
  const running = useMemo(() => {
    let total = 0;
    return stops.map((s) => {
      const mid = parseCostMidpoint(s.costRange);
      total += mid;
      return total;
    });
  }, [stops]);

  const grandTotal = running[running.length - 1] || 0;
  const symbol = summary?.currencySymbol || '₹';

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <div className="panel p-6" style={{ background: '#fff', color: palette.ink || '#0D1B2A' }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b-4 border-black">
          <div>
            <p className="font-comic text-xs tracking-widest uppercase opacity-60">
              Your 1-Day Plan
            </p>
            <h3 className="font-bangers text-3xl md:text-4xl tracking-wider">
              {mood?.toUpperCase()} · {city?.toUpperCase()}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-comic text-xs uppercase tracking-widest opacity-60">Estimated Total</p>
            <p className="font-bangers text-3xl">{symbol}{grandTotal.toLocaleString()}</p>
            <p className="font-comic text-xs opacity-60">(midpoint estimate)</p>
          </div>
        </div>

        <ol className="relative">
          {stops.map((p, i) => {
            const nextTr = trMap.get(`${p.order}-${p.order + 1}`);
            return (
              <React.Fragment key={p.order}>
                <li className="flex gap-4 pb-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 flex items-center justify-center font-bangers text-xl border-4 border-black rounded-full shrink-0"
                      style={{ background: palette.accent || '#FFD23F' }}
                    >
                      {p.order}
                    </div>
                    {i < stops.length - 1 && (
                      <div className="w-1 flex-1 bg-black mt-1" style={{ minHeight: 40 }} />
                    )}
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-bangers text-xl tracking-wide">
                        {p.time?.toUpperCase()}
                      </span>
                      {p.clock && (
                        <span className="font-comic font-bold text-sm opacity-70">· {p.clock}</span>
                      )}
                      {p.costRange && (
                        <span className="ml-auto font-comic text-xs px-2 py-0.5 border-2 border-black bg-white">
                          {p.costRange}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bangers text-2xl leading-tight">
                      {p.emoji} {p.title}
                    </h4>
                    <p className="font-comic text-sm">
                      <span className="font-bold">📍 {p.place}</span>
                      {p.address ? ` — ${p.address}` : ''}
                    </p>
                    <p className="font-comic text-xs opacity-80">{p.action}</p>
                    {p.tip && (
                      <p className="font-comic text-xs mt-1 italic opacity-80">💡 {p.tip}</p>
                    )}
                    {p.alternative && (
                      <p className="font-comic text-xs mt-1 opacity-70">
                        <span className="font-bold">🔀 Alt:</span> {p.alternative}
                      </p>
                    )}
                  </div>
                </li>

                {nextTr && (
                  <li className="flex gap-4 pl-12 pb-2">
                    <span
                      className="inline-flex items-center gap-2 px-3 py-0.5 border-2 border-dashed border-black rounded-full font-comic text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.04)' }}
                    >
                      {modeIcon(nextTr.mode)} {nextTr.minutes} min {nextTr.mode}
                      {nextTr.distanceKm ? ` · ${nextTr.distanceKm} km` : ''}
                      {nextTr.note ? ` · ${nextTr.note}` : ''}
                    </span>
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function parseCostMidpoint(range) {
  if (!range || /free|pay what/i.test(range)) return 0;
  const nums = String(range).replace(/[,\s]/g, '').match(/\d+/g);
  if (!nums || !nums.length) return 0;
  if (nums.length === 1) return parseInt(nums[0], 10);
  const lo = parseInt(nums[0], 10);
  const hi = parseInt(nums[nums.length - 1], 10);
  return Math.round((lo + hi) / 2);
}

function modeIcon(m) {
  return { walk: '🚶', auto: '🛺', metro: '🚇', bus: '🚌', taxi: '🚕', car: '🚗', bike: '🏍️' }[m] || '➡️';
}
