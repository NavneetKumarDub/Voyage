import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DIET_OPTIONS = [
  { key: 'no-restriction', label: 'No restriction', icon: '🍽️' },
  { key: 'vegetarian',     label: 'Vegetarian',      icon: '🥗' },
  { key: 'vegan',          label: 'Vegan',           icon: '🌱' },
  { key: 'pescatarian',    label: 'Pescatarian',     icon: '🐟' },
  { key: 'halal',          label: 'Halal',           icon: '☪️' },
  { key: 'jain',           label: 'Jain',            icon: '🪷' },
  { key: 'kosher',         label: 'Kosher',          icon: '✡️' },
  { key: 'gluten-free',    label: 'Gluten-free',     icon: '🌾' }
];

const INTERESTS = [
  'food', 'history', 'nature', 'art', 'music', 'nightlife',
  'adventure', 'shopping', 'photography', 'museums', 'architecture',
  'wellness', 'sports', 'literature', 'street culture', 'local crafts'
];

const ROLES = [
  { key: 'student',      label: 'Student',      icon: '🎓' },
  { key: 'professional', label: 'Professional', icon: '💼' },
  { key: 'creative',     label: 'Creative',     icon: '🎨' },
  { key: 'freelancer',   label: 'Freelancer',   icon: '🧑‍💻' },
  { key: 'retired',      label: 'Retired',      icon: '🌇' },
  { key: 'traveler',     label: 'Full-time traveler', icon: '🧳' }
];

const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    ageGroup: '',
    gender: '',
    diet: 'no-restriction',
    allergies: '',
    role: '',
    interests: [],
    homeCity: '',
    about: ''
  });

  const total = 4;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleInterest(t) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(t)
        ? f.interests.filter((i) => i !== t)
        : f.interests.length < 6
        ? [...f.interests, t]
        : f.interests
    }));
  }

  async function finish() {
    setSaving(true);
    try {
      await updateProfile({
        ...form,
        onboarded: true
      });
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 border-2 border-black"
              style={{
                background: i <= step ? '#EE4266' : '#fff',
                maxWidth: 80
              }}
            />
          ))}
        </div>

        <div className="panel p-6" style={{ background: '#fff' }}>
          <p className="font-comic text-xs tracking-widest uppercase opacity-60 text-center">
            STEP {step + 1} OF {total}
          </p>

          {step === 0 && (
            <Step title="Welcome aboard!" subtitle="Tell us a bit about you. This personalizes every plan.">
              <Field label="Your name">
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="panel px-3 py-2 w-full font-comic font-bold"
                  placeholder="e.g. Navneet"
                />
              </Field>
              <Field label="Age group (optional)">
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((a) => (
                    <Chip
                      key={a}
                      active={form.ageGroup === a}
                      onClick={() => update('ageGroup', a)}
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Home city (optional)">
                <input
                  value={form.homeCity}
                  onChange={(e) => update('homeCity', e.target.value)}
                  className="panel px-3 py-2 w-full font-comic font-bold"
                  placeholder="e.g. Delhi"
                />
              </Field>
            </Step>
          )}

          {step === 1 && (
            <Step title="What you eat" subtitle="We'll only recommend places that match your preferences.">
              <Field label="Diet">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DIET_OPTIONS.map((d) => (
                    <Chip
                      key={d.key}
                      active={form.diet === d.key}
                      onClick={() => update('diet', d.key)}
                    >
                      <span className="mr-1">{d.icon}</span>{d.label}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Allergies / strong dislikes (optional)">
                <input
                  value={form.allergies}
                  onChange={(e) => update('allergies', e.target.value)}
                  className="panel px-3 py-2 w-full font-comic font-bold"
                  placeholder="e.g. peanuts, cilantro, spicy food"
                />
              </Field>
            </Step>
          )}

          {step === 2 && (
            <Step title="What you do" subtitle="Helps us plan at your pace.">
              <Field label="What best describes you?">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <Chip
                      key={r.key}
                      active={form.role === r.key}
                      onClick={() => update('role', r.key)}
                    >
                      <span className="mr-1">{r.icon}</span>{r.label}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label={`Pick up to 6 things you love (${form.interests.length}/6)`}>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((t) => (
                    <Chip
                      key={t}
                      active={form.interests.includes(t)}
                      onClick={() => toggleInterest(t)}
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </Field>
            </Step>
          )}

          {step === 3 && (
            <Step title="A line about you" subtitle="Optional — used to tailor the comic voice.">
              <Field label="About you">
                <textarea
                  value={form.about}
                  onChange={(e) => update('about', e.target.value)}
                  rows={3}
                  className="panel px-3 py-2 w-full font-comic"
                  placeholder="e.g. Quiet mornings, loud evenings. Love old bookstores and tucked-away cafes."
                />
              </Field>
              <div className="panel p-3 mt-3 text-sm" style={{ background: '#FFF8E7' }}>
                <p className="font-comic"><strong>Ready!</strong> You can update all of this any time from the Profile page.</p>
              </div>
            </Step>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between mt-6 gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 py-2 font-bangers text-lg tracking-wide border-2 border-black disabled:opacity-40"
              style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
            >
              ← BACK
            </button>
            {step < total - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2 font-bangers text-lg tracking-wide border-2 border-black"
                style={{ background: '#FFD23F', boxShadow: '3px 3px 0 0 #000' }}
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={saving}
                className="px-5 py-2 font-bangers text-lg tracking-wide border-2 border-black"
                style={{ background: '#EE4266', color: '#fff', boxShadow: '3px 3px 0 0 #000' }}
              >
                {saving ? 'SAVING…' : '🎉 FINISH'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }) {
  return (
    <div>
      <h1 className="font-bangers text-4xl tracking-wider text-center mt-2">{title}</h1>
      <p className="font-comic text-sm opacity-70 text-center mb-4">{subtitle}</p>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="font-bangers text-sm tracking-widest mb-1">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 font-comic font-bold text-sm border-2 border-black"
      style={{
        background: active ? '#FFD23F' : '#fff',
        boxShadow: active ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
        transform: active ? 'translate(2px,2px)' : 'none'
      }}
    >
      {children}
    </button>
  );
}
