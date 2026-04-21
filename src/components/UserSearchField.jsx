import React, { useEffect, useRef, useState } from 'react';
import { searchUsers } from '../services/userSearchService.js';

// A debounced people-picker. Shows matching users as you type.
// Parent gets the final picked email (or typed one) via `onChange`.
export default function UserSearchField({
  value,
  onChange,
  onUserPicked,
  excludeUid = '',
  placeholder = 'Search by name or email…',
  disabled = false,
  autoFocus = false
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [pickedUid, setPickedUid] = useState('');
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  // Keep internal query in sync if parent clears the field
  useEffect(() => {
    if ((value || '') !== query) setQuery(value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function close(e) {
      if (!wrapRef.current || wrapRef.current.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = (query || '').trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const rows = await searchUsers(term, { excludeUid });
      setResults(rows);
      setLoading(false);
      setHighlight(0);
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [query, excludeUid]);

  function handleTyping(v) {
    setQuery(v);
    setPickedUid('');
    onChange?.(v);
    setOpen(true);
  }

  function pick(user) {
    setPickedUid(user.uid);
    setQuery(user.email || user.name || '');
    onChange?.(user.email || '');
    onUserPicked?.(user);
    setOpen(false);
  }

  function handleKey(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[highlight]) {
        e.preventDefault();
        pick(results[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showEmpty = open && query.trim().length >= 2 && !loading && results.length === 0;

  return (
    <div className="relative" ref={wrapRef}>
      <div
        className="flex items-center gap-2 border-4 border-black bg-white focus-within:bg-comic-yellow"
        style={{ boxShadow: 'inset 2px 2px 0 0 rgba(0,0,0,0.08)' }}
      >
        <span className="pl-3 text-lg" aria-hidden="true">🔎</span>
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => handleTyping(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          className="flex-1 py-3 pr-3 font-comic text-base outline-none bg-transparent"
        />
        {pickedUid && (
          <span
            className="mr-2 text-xs font-comic font-bold px-2 py-0.5 border-2 border-black"
            style={{ background: '#3BCEAC' }}
            title="User selected from search"
          >
            ✓ picked
          </span>
        )}
      </div>

      {open && (results.length > 0 || loading || showEmpty) && (
        <div
          className="absolute left-0 right-0 mt-1 z-30 border-4 border-black bg-white max-h-72 overflow-y-auto"
          style={{ boxShadow: '4px 4px 0 0 #000' }}
        >
          {loading && (
            <div className="px-3 py-2 font-comic text-sm opacity-70">Searching…</div>
          )}
          {!loading && results.map((u, i) => (
            <button
              type="button"
              key={u.uid}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(u)}
              className="w-full text-left px-3 py-2 flex items-center gap-3 border-b-2 border-black/10 last:border-b-0"
              style={{
                background: i === highlight ? '#FFD23F' : '#fff'
              }}
            >
              {u.photo ? (
                <img
                  src={u.photo}
                  alt=""
                  className="w-9 h-9 rounded-full border-2 border-black object-cover"
                />
              ) : (
                <span
                  className="w-9 h-9 rounded-full border-2 border-black bg-comic-yellow flex items-center justify-center font-bangers text-base"
                  aria-hidden="true"
                >
                  {(u.name || u.email || '?')[0].toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-comic font-bold text-sm truncate">{u.name || u.email}</p>
                <p className="font-comic text-xs opacity-70 truncate">{u.email}</p>
              </div>
            </button>
          ))}
          {showEmpty && (
            <div className="px-3 py-3 font-comic text-sm">
              <p className="opacity-70">No Voyage user matches "<strong>{query}</strong>".</p>
              <p className="opacity-50 text-xs mt-1">
                You can still send the invite to that email — they'll see it
                when they sign in.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
