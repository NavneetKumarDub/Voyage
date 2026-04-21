import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useVoyage } from '../context/VoyageContext.jsx';
import NavBar from '../components/NavBar.jsx';
import { reorderStopsFromUser } from '../services/planUtils.js';

export default function EditorPage() {
  const { itinerary, setItinerary, userCoords } = useVoyage();
  const navigate = useNavigate();
  const [stops, setStops] = useState([]);

  useEffect(() => {
    if (!itinerary) { navigate('/'); return; }
    setStops(itinerary.stops || []);
  }, [itinerary, navigate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStops((items) => {
      const oldIdx = items.findIndex((s) => s.order === active.id);
      const newIdx = items.findIndex((s) => s.order === over.id);
      return arrayMove(items, oldIdx, newIdx);
    });
  }

  function updateStop(order, patch) {
    setStops((prev) => prev.map((s) => (s.order === order ? { ...s, ...patch } : s)));
  }

  function removeStop(order) {
    setStops((prev) => prev.filter((s) => s.order !== order));
  }

  function duplicateStop(order) {
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.order === order);
      if (idx < 0) return prev;
      const copy = { ...prev[idx], title: prev[idx].title + ' (copy)' };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  }

  function savePlan() {
    // Renumber orders to 1..n
    const renumbered = stops.map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...itinerary, stops: renumbered };
    // Rebuild transitions roughly (preserve existing where possible)
    updated.transitions = renumbered.slice(0, -1).map((s, i) => ({
      from: s.order, to: s.order + 1, mode: 'walk', minutes: 10, distanceKm: 1, note: ''
    }));
    setItinerary(updated);
    navigate('/comic');
  }

  function autoOptimize() {
    const updated = reorderStopsFromUser({ ...itinerary, stops }, userCoords);
    setStops(updated.stops);
  }

  if (!itinerary) return null;
  const palette = itinerary.style?.palette || {};

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="max-w-4xl mx-auto px-4">
        <div className="panel p-5 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: palette.bg || '#FFD23F' }}>
          <div>
            <p className="font-comic text-xs tracking-widest uppercase opacity-60">Edit · Reorder · Remove</p>
            <h1 className="font-bangers text-4xl tracking-wider leading-none">✏️ PLAN EDITOR</h1>
            <p className="font-comic text-sm mt-1">
              Drag ⣿ to reorder. Click fields to edit. Save to apply.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={autoOptimize}
              className="px-4 py-2 font-bangers tracking-wide border-2 border-black"
              style={{ background: '#3BCEAC', boxShadow: '3px 3px 0 0 #000' }}
              title="Reorder by distance from your location"
            >
              🧭 AUTO-OPTIMIZE
            </button>
            <button
              onClick={() => navigate('/comic')}
              className="px-4 py-2 font-bangers tracking-wide border-2 border-black"
              style={{ background: '#fff', boxShadow: '3px 3px 0 0 #000' }}
            >
              ✕ CANCEL
            </button>
            <button
              onClick={savePlan}
              className="px-4 py-2 font-bangers tracking-wide border-2 border-black"
              style={{ background: '#EE4266', color: '#fff', boxShadow: '3px 3px 0 0 #000' }}
            >
              ✅ SAVE PLAN
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stops.map((s) => s.order)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {stops.map((s, i) => (
                <SortableStop
                  key={s.order}
                  stop={s}
                  index={i}
                  palette={palette}
                  onChange={(patch) => updateStop(s.order, patch)}
                  onRemove={() => removeStop(s.order)}
                  onDuplicate={() => duplicateStop(s.order)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {stops.length === 0 && (
          <div className="panel p-6 text-center" style={{ background: '#fff' }}>
            <p className="font-bangers text-2xl">NO STOPS LEFT</p>
            <p className="font-comic text-sm opacity-70 mt-1">Cancel or go regenerate a plan.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function SortableStop({ stop, index, palette, onChange, onRemove, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.order });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: palette.bg || '#FFF8E7', color: palette.ink || '#0D1B2A' }}
      className="panel p-4 flex gap-3 items-start"
    >
      <button
        {...attributes}
        {...listeners}
        className="px-2 py-2 font-bangers text-2xl cursor-grab active:cursor-grabbing border-2 border-black bg-white"
        title="Drag to reorder"
      >
        ⣿
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 font-bangers text-sm tracking-widest"
            style={{ background: palette.ink, color: palette.bg }}
          >
            #{index + 1}
          </span>
          <input
            value={stop.time || ''}
            onChange={(e) => onChange({ time: e.target.value })}
            placeholder="Morning"
            className="font-bangers text-base uppercase tracking-wider bg-transparent outline-none border-b border-dashed border-black/40 px-1 w-28"
          />
          <input
            value={stop.clock || ''}
            onChange={(e) => onChange({ clock: e.target.value })}
            placeholder="8:00 AM — 10:00 AM"
            className="font-comic text-sm bg-transparent outline-none border-b border-dashed border-black/40 px-1 flex-1 min-w-0"
          />
        </div>
        <input
          value={stop.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Stop title"
          className="block mt-1 font-bangers text-2xl w-full bg-transparent outline-none border-b-2 border-dashed border-black/40 px-1"
        />
        <input
          value={stop.place || ''}
          onChange={(e) => onChange({ place: e.target.value })}
          placeholder="Place name"
          className="block mt-1 font-comic font-bold text-sm w-full bg-transparent outline-none border-b border-dashed border-black/40 px-1"
        />
        <input
          value={stop.action || ''}
          onChange={(e) => onChange({ action: e.target.value })}
          placeholder="What happens here…"
          className="block mt-1 font-comic text-sm w-full bg-transparent outline-none border-b border-dashed border-black/30 px-1"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          <input
            value={stop.costRange || ''}
            onChange={(e) => onChange({ costRange: e.target.value })}
            placeholder="₹200 – ₹400"
            className="font-comic text-xs px-2 py-1 border-2 border-black bg-white w-28"
          />
          <input
            value={stop.emoji || ''}
            onChange={(e) => onChange({ emoji: e.target.value })}
            placeholder="☕"
            className="font-comic text-xs px-2 py-1 border-2 border-black bg-white w-16"
          />
          <input
            value={stop.sfx || ''}
            onChange={(e) => onChange({ sfx: e.target.value })}
            placeholder="POW!"
            className="font-comic text-xs px-2 py-1 border-2 border-black bg-white w-20"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={onDuplicate}
          className="px-2 py-1 text-xs font-bangers border-2 border-black bg-white hover:bg-comic-yellow"
          title="Duplicate stop"
        >
          ＋
        </button>
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs font-bangers border-2 border-black bg-white hover:bg-comic-red hover:text-white"
          title="Remove stop"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
