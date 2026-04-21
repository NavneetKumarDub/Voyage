// Exports: Google Maps route, .ics calendar, shareable URL (base64), PNG via html2canvas

import html2canvas from 'html2canvas';

export function buildGoogleMapsURL(stops) {
  const coords = (stops || [])
    .filter((s) => Array.isArray(s.coords))
    .map((s) => `${s.coords[0]},${s.coords[1]}`);
  if (coords.length < 2) return 'https://maps.google.com';
  const origin = coords[0];
  const destination = coords[coords.length - 1];
  const waypoints = coords.slice(1, -1).join('|');
  const base = 'https://www.google.com/maps/dir/?api=1';
  return `${base}&origin=${origin}&destination=${destination}` +
    `${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;
}

// Generate an .ics file from the itinerary and trigger download
export function downloadICS(data) {
  const ics = buildICS(data);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `voyage-${data.mood || 'plan'}-${data.city || 'city'}.ics`.replace(/\s+/g, '-').toLowerCase();
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function buildICS(data) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Voyage//Comic Travel Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  (data.stops || []).forEach((s) => {
    const { startStr, endStr } = parseClockToICSTimes(s.clock, yyyy, mm, dd);
    if (!startStr) return;
    lines.push(
      'BEGIN:VEVENT',
      `UID:voyage-${data.mood}-${s.order}-${Date.now()}@voyage.app`,
      `DTSTAMP:${icsNow()}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${escapeICS(`${s.emoji || ''} ${s.title}`)}`,
      `LOCATION:${escapeICS(`${s.place}${s.address ? ', ' + s.address : ''}`)}`,
      `DESCRIPTION:${escapeICS(`${s.caption}\\n\\nTip: ${s.tip || ''}\\nCost: ${s.costRange || ''}`)}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function parseClockToICSTimes(clock, y, m, d) {
  if (!clock) return {};
  const parts = clock.split(/—|-|to/i).map((s) => s.trim());
  if (parts.length < 2) return {};
  const s = to24(parts[0]);
  const e = to24(parts[1]);
  if (!s || !e) return {};
  const toStr = (hm) => `${y}${m}${d}T${String(hm.h).padStart(2, '0')}${String(hm.m).padStart(2, '0')}00`;
  return { startStr: toStr(s), endStr: toStr(e) };
}

function to24(str) {
  const m = str.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mm = parseInt(m[2] || '0', 10);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return { h, m: mm };
}

function icsNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeICS(str) {
  return String(str || '').replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

// Shareable URL encodes mood + city + persona
export function buildShareURL({ mood, city, persona }) {
  const params = new URLSearchParams();
  if (mood) params.set('mood', mood);
  if (city) params.set('city', city);
  if (persona?.who) params.set('who', persona.who);
  if (persona?.budget) params.set('budget', persona.budget);
  if (persona?.pace) params.set('pace', persona.pace);
  return `${window.location.origin}${window.location.pathname}#share?${params.toString()}`;
}

export function readShareURL() {
  const hash = window.location.hash;
  if (!hash.startsWith('#share?')) return null;
  const params = new URLSearchParams(hash.slice('#share?'.length));
  const mood = params.get('mood');
  if (!mood) return null;
  return {
    mood,
    city: params.get('city') || 'Delhi',
    persona: {
      who: params.get('who') || 'solo',
      budget: params.get('budget') || 'mid',
      pace: params.get('pace') || 'balanced'
    }
  };
}

export async function copyShareURL(payload) {
  const url = buildShareURL(payload);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

// Capture the comic DOM as a PNG
export async function downloadComicPNG(selector = '#comic-capture', filename = 'voyage-comic.png') {
  const el = document.querySelector(selector);
  if (!el) return false;
  try {
    const canvas = await html2canvas(el, {
      useCORS: true,
      backgroundColor: '#FFF8E7',
      scale: 2
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    return true;
  } catch (e) {
    console.error('PNG export failed:', e);
    return false;
  }
}
