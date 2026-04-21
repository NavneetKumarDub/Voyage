import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import NavBar from '../components/NavBar.jsx';
import { fileToResizedDataURL, dataURLSize } from '../services/imageUtils.js';

const DIET_LIST = ['no-restriction', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'jain', 'kosher', 'gluten-free'];
const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55+'];
const TRAVEL_STYLES = ['backpacker', 'budget', 'comfort', 'luxury'];
const ACTIVITY_LEVELS = ['low', 'moderate', 'high', 'intense'];
const TRANSPORT = ['walk', 'metro', 'auto', 'taxi', 'own vehicle', 'rental'];
const BEDTIMES = ['early bird', 'regular', 'night owl'];
const CLIMATES = ['cool', 'mild', 'warm', 'hot', 'any'];

export default function ProfilePage() {
  const { user, profile, updateProfile, isAuthed } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState(profile || {});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setForm(profile || {}); }, [profile]);

  if (!isAuthed) {
    return (
      <div className="page-bg min-h-screen">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 text-center mt-16">
          <p className="font-bangers text-3xl">Sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try { await updateProfile(form); } finally { setSaving(false); }
  }

  async function handlePickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataURL = await fileToResizedDataURL(file, { maxWidth: 512, maxHeight: 512, quality: 0.8 });
      const size = dataURLSize(dataURL);
      if (size > 900_000) {
        alert('Photo is too large after compression. Try a smaller image.');
        return;
      }
      const patch = { photo: dataURL };
      setForm((f) => ({ ...f, ...patch }));
      await updateProfile(patch);
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'unknown error'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removePhoto() {
    setForm((f) => ({ ...f, photo: '' }));
    updateProfile({ photo: '' });
  }

  const photo = form.photo || user.photo;
  const displayName = form.name || user.name;

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="max-w-4xl mx-auto px-4">
        {/* Header card with photo upload */}
        <div className="panel p-5 mb-6 flex items-center gap-4 flex-wrap" style={{ background: '#FFD23F' }}>
          <div className="relative">
            <Avatar url={photo} name={displayName} size={96} />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePickPhoto}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 px-2 py-1 text-xs font-bangers tracking-wide border-2 border-black bg-white disabled:opacity-50"
              style={{ boxShadow: '2px 2px 0 0 #000' }}
              title="Upload a new photo"
            >
              {uploading ? '…' : '📷 CHANGE'}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-comic text-xs tracking-widest uppercase opacity-70">Signed in</p>
            <h1 className="font-bangers text-3xl md:text-4xl tracking-wider leading-none">{displayName}</h1>
            <p className="font-comic text-sm opacity-80 truncate">{user.email}</p>
            {photo && photo.startsWith('data:') && (
              <button
                onClick={removePhoto}
                className="mt-2 text-xs font-comic font-bold underline opacity-70"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Tab-less single edit panel — the basics + more */}
        <div className="panel p-5 mb-6" style={{ background: '#fff' }}>
          <SectionHeader title="👤 THE BASICS" sub="Who you are, at a glance." />
          <Grid>
            <Field label="Name">
              <Input value={form.name} onChange={(v) => setField('name', v)} />
            </Field>
            <Field label="Age group">
              <Select value={form.ageGroup || ''} onChange={(v) => setField('ageGroup', v)} options={['', ...AGE_GROUPS]} />
            </Field>
            <Field label="Gender (optional)">
              <Input value={form.gender} onChange={(v) => setField('gender', v)} placeholder="any word is fine" />
            </Field>
            <Field label="Home city">
              <Input value={form.homeCity} onChange={(v) => setField('homeCity', v)} />
            </Field>
            <Field label="Languages (comma-separated)">
              <Input
                value={Array.isArray(form.languages) ? form.languages.join(', ') : (form.languages || '')}
                onChange={(v) => setField('languages', v.split(',').map((s) => s.trim()).filter(Boolean))}
                placeholder="English, Hindi, Japanese"
              />
            </Field>
            <Field label="Role / what you do">
              <Input value={form.role} onChange={(v) => setField('role', v)} />
            </Field>
          </Grid>

          <SectionHeader title="🍴 FOOD & DRINK" sub="Non-negotiable for every meal stop." />
          <Grid>
            <Field label="Diet">
              <Select value={form.diet || 'no-restriction'} onChange={(v) => setField('diet', v)} options={DIET_LIST} />
            </Field>
            <Field label="Allergies / dislikes">
              <Input value={form.allergies} onChange={(v) => setField('allergies', v)} placeholder="peanuts, cilantro, spicy food" />
            </Field>
            <Field label="Favorite cuisines">
              <Input value={form.cuisines} onChange={(v) => setField('cuisines', v)} placeholder="Italian, Thai, South Indian" />
            </Field>
            <Field label="Alcohol">
              <Select value={form.alcohol || ''} onChange={(v) => setField('alcohol', v)} options={['', 'yes', 'no', 'occasionally']} />
            </Field>
          </Grid>

          <SectionHeader title="🎒 HOW YOU TRAVEL" sub="Drives pace, budget, and vibes." />
          <Grid>
            <Field label="Travel style">
              <Select value={form.travelStyle || ''} onChange={(v) => setField('travelStyle', v)} options={['', ...TRAVEL_STYLES]} />
            </Field>
            <Field label="Activity level">
              <Select value={form.activity || ''} onChange={(v) => setField('activity', v)} options={['', ...ACTIVITY_LEVELS]} />
            </Field>
            <Field label="Preferred transport">
              <Select value={form.transport || ''} onChange={(v) => setField('transport', v)} options={['', ...TRANSPORT]} />
            </Field>
            <Field label="Wake / sleep pattern">
              <Select value={form.bedtime || ''} onChange={(v) => setField('bedtime', v)} options={['', ...BEDTIMES]} />
            </Field>
            <Field label="Climate preference">
              <Select value={form.climate || ''} onChange={(v) => setField('climate', v)} options={['', ...CLIMATES]} />
            </Field>
            <Field label="Accessibility / mobility needs">
              <Input value={form.accessibility} onChange={(v) => setField('accessibility', v)} placeholder="wheelchair, stroller, low-step…" />
            </Field>
          </Grid>

          <SectionHeader title="💖 WHAT YOU LOVE" sub="Sharpens every recommendation." />
          <Grid>
            <Field label="Interests (comma-separated)" wide>
              <Input
                value={Array.isArray(form.interests) ? form.interests.join(', ') : (form.interests || '')}
                onChange={(v) => setField('interests', v.split(',').map((s) => s.trim()).filter(Boolean))}
                placeholder="food, history, photography, live music"
              />
            </Field>
            <Field label="Dealbreakers (optional)" wide>
              <Input value={form.dealbreakers} onChange={(v) => setField('dealbreakers', v)} placeholder="crowds, long queues, loud clubs" />
            </Field>
            <Field label="About you (affects comic tone)" wide>
              <Textarea value={form.about} onChange={(v) => setField('about', v)} />
            </Field>
          </Grid>

          <div className="flex justify-end mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-3 font-bangers text-xl tracking-widest border-2 border-black disabled:opacity-50"
              style={{ background: '#3BCEAC', boxShadow: '4px 4px 0 0 #000' }}
            >
              {saving ? 'SAVING…' : '💾 SAVE PROFILE'}
            </button>
          </div>
        </div>

        {/* Info about the new invite flow */}
        <div className="panel p-5 mb-6" style={{ background: '#3BCEAC' }}>
          <h2 className="font-bangers text-2xl tracking-widest">👥 TRAVELING WITH SOMEONE?</h2>
          <p className="font-comic text-sm mt-1">
            Invite friends directly by name or email from any plan — they'll see
            live invitations and can join your journey in real time. No more
            managing a static companion list.
          </p>
        </div>
      </section>
    </div>
  );
}

// ──────────── UI atoms ────────────

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-3 mt-4 first:mt-0">
      <h2 className="font-bangers text-2xl tracking-widest">{title}</h2>
      {sub && <p className="font-comic text-xs opacity-70">{sub}</p>}
    </div>
  );
}
function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, wide, children }) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <p className="font-bangers text-sm tracking-widest mb-1">{label}</p>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="panel px-3 py-2 w-full font-comic font-bold"
    />
  );
}
function Textarea({ value, onChange }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="panel px-3 py-2 w-full font-comic"
    />
  );
}
function Select({ value, onChange, options }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="panel px-3 py-2 w-full font-comic font-bold"
    >
      {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
    </select>
  );
}

function Avatar({ url, name, size }) {
  if (url) {
    return <img src={url} alt={name} className="border-4 border-black rounded-full object-cover"
                 style={{ width: size, height: size }} />;
  }
  return (
    <div className="border-4 border-black rounded-full flex items-center justify-center font-bangers bg-white"
         style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}
