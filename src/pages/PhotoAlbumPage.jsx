import React, { useEffect, useMemo, useRef, useState } from 'react';
import NavBar from '../components/NavBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useVoyage } from '../context/VoyageContext.jsx';
import {
  addJourneyPhoto, subscribeJourneyPhotos, deleteJourneyPhoto
} from '../services/photoService.js';
import { fileToResizedDataURL, dataURLSize } from '../services/imageUtils.js';
import { formatPlanTitle } from '../services/planUtils.js';

export default function PhotoAlbumPage() {
  const { user, isAuthed } = useAuth();
  const { journeys } = useVoyage();
  const fileRef = useRef(null);

  // Pick a default journey: active first, else most recent.
  const defaultJourneyId = useMemo(() => {
    const active = journeys.find((j) => j.status === 'active');
    if (active) return active.id;
    return journeys[0]?.id || '';
  }, [journeys]);

  const [journeyId, setJourneyId] = useState('');
  useEffect(() => {
    if (!journeyId && defaultJourneyId) setJourneyId(defaultJourneyId);
  }, [defaultJourneyId, journeyId]);

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [stopOrder, setStopOrder] = useState('');
  const [viewer, setViewer] = useState(null);

  // Realtime subscribe to this journey's shared album
  useEffect(() => {
    if (!journeyId) { setPhotos([]); return; }
    const unsub = subscribeJourneyPhotos(journeyId, setPhotos);
    return unsub;
  }, [journeyId]);

  const selectedJourney = journeys.find((j) => j.id === journeyId) || null;
  const isHost = !!(selectedJourney && user && selectedJourney.hostUid === user.uid);

  async function handlePick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user || !journeyId) return;
    setUploading(true);
    try {
      for (const f of files) {
        const dataURL = await fileToResizedDataURL(f, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 });
        if (dataURLSize(dataURL) > 950_000) {
          alert(`"${f.name}" is too large after compression. Try a smaller image.`);
          continue;
        }
        await addJourneyPhoto(journeyId, user, {
          dataURL,
          caption,
          stopOrder: stopOrder ? Number(stopOrder) : null
        });
      }
      setCaption('');
      setStopOrder('');
    } catch (err) {
      alert('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function removeOne(photo) {
    if (!user || !journeyId || !photo) return;
    // Only the uploader (or host) may delete.
    const canDelete = photo.uploadedByUid === user.uid || isHost;
    if (!canDelete) {
      alert('Only the uploader or the host can delete this photo.');
      return;
    }
    if (!confirm('Delete this photo?')) return;
    await deleteJourneyPhoto(journeyId, photo.id);
    setViewer(null);
  }

  if (!isAuthed) {
    return (
      <div className="page-bg min-h-screen">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 text-center mt-16 panel p-8" style={{ background: '#fff' }}>
          <div className="text-6xl mb-2">📸</div>
          <p className="font-bangers text-3xl tracking-wider">SIGN IN TO UPLOAD PHOTOS</p>
          <p className="font-comic text-sm opacity-70 mt-1">
            Photos live inside each journey's shared album — every member can
            see and add to them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      <section className="w-full max-w-[1600px] mx-auto px-4 xl:px-8">
        {/* Header */}
        <div className="panel p-5 mb-5" style={{ background: '#FFD23F' }}>
          <p className="font-comic text-xs tracking-widest uppercase opacity-70">Shared trip memories</p>
          <h1 className="font-bangers text-4xl xl:text-5xl tracking-wider leading-none">📸 PHOTO ALBUM</h1>
          <p className="font-comic text-sm mt-1">
            Each journey has its own shared album. Everyone invited can see and
            contribute photos in real time.
          </p>
        </div>

        {journeys.length === 0 ? (
          <div className="panel p-8 text-center" style={{ background: '#fff' }}>
            <div className="text-6xl mb-2">🧭</div>
            <p className="font-bangers text-2xl tracking-wider">NO JOURNEYS YET</p>
            <p className="font-comic text-sm opacity-70 mt-1">
              Generate a plan, tap "Start Journey", and the album shows up here.
            </p>
          </div>
        ) : (
          <>
            {/* Journey chooser — side scrollable chips */}
            <div className="panel p-4 mb-5" style={{ background: '#fff' }}>
              <p className="font-bangers text-sm tracking-widest opacity-70 mb-2">PICK A JOURNEY ALBUM</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {journeys.map((j) => {
                  const active = j.id === journeyId;
                  return (
                    <button
                      key={j.id}
                      onClick={() => setJourneyId(j.id)}
                      className="shrink-0 px-3 py-2 font-comic font-bold text-sm border-2 border-black"
                      style={{
                        background: active ? '#FFD23F' : '#fff',
                        boxShadow: active ? '1px 1px 0 0 #000' : '3px 3px 0 0 #000',
                        transform: active ? 'translate(2px,2px)' : 'none'
                      }}
                      title={formatPlanTitle(j)}
                    >
                      {j.hostUid === user.uid ? '👑 ' : '🤝 '}
                      {formatPlanTitle(j)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload */}
            {selectedJourney && (
              <div className="panel p-5 mb-6" style={{ background: '#fff' }}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3 items-end">
                  <div>
                    <p className="font-bangers text-sm tracking-widest mb-1">CAPTION (optional)</p>
                    <input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Sunrise at Lodhi Garden"
                      className="panel px-3 py-2 w-full font-comic font-bold"
                    />
                  </div>
                  <div>
                    <p className="font-bangers text-sm tracking-widest mb-1">LINK TO STOP</p>
                    <select
                      value={stopOrder}
                      onChange={(e) => setStopOrder(e.target.value)}
                      className="panel px-3 py-2 w-full font-comic font-bold"
                    >
                      <option value="">— none —</option>
                      {(selectedJourney.itinerary?.stops || []).map((s) => (
                        <option key={s.order} value={s.order}>#{s.order} · {s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePick}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="px-5 py-3 w-full font-bangers text-lg tracking-widest border-2 border-black disabled:opacity-50"
                      style={{ background: '#3BCEAC', boxShadow: '3px 3px 0 0 #000' }}
                    >
                      {uploading ? 'UPLOADING…' : '📤 UPLOAD PHOTOS'}
                    </button>
                  </div>
                </div>
                <p className="font-comic text-[11px] opacity-60 mt-2">
                  Uploaded to the shared album for <strong>{formatPlanTitle(selectedJourney)}</strong>.
                  Every member can see these photos.
                </p>
              </div>
            )}

            {/* Grid */}
            {photos.length === 0 ? (
              <div className="panel p-8 text-center" style={{ background: '#fff' }}>
                <div className="text-6xl mb-2">🌅</div>
                <p className="font-bangers text-2xl tracking-wider">NO PHOTOS YET</p>
                <p className="font-comic text-sm opacity-70 mt-1">
                  Be the first to upload a memory from this journey.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setViewer(p)}
                    className="panel p-0 overflow-hidden text-left"
                    style={{ background: '#fff' }}
                  >
                    <img
                      src={p.dataURL}
                      alt={p.caption || 'photo'}
                      className="w-full h-40 object-cover border-b-2 border-black"
                      loading="lazy"
                    />
                    <div className="p-2">
                      {p.caption && (
                        <p className="font-comic text-sm font-bold truncate">{p.caption}</p>
                      )}
                      <p className="font-comic text-[11px] opacity-70 truncate">
                        📷 {p.uploadedByName || 'member'}
                        {p.stopOrder ? ` · stop #${p.stopOrder}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Viewer */}
        {viewer && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setViewer(null)}
          >
            <div
              className="panel overflow-hidden max-w-3xl w-full"
              style={{ background: '#fff' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={viewer.dataURL} alt="" className="w-full max-h-[70vh] object-contain" />
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  {viewer.caption && <p className="font-comic font-bold truncate">{viewer.caption}</p>}
                  <p className="font-comic text-xs opacity-70">📷 {viewer.uploadedByName}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={viewer.dataURL}
                    download={`voyage-photo-${viewer.id}.jpg`}
                    className="px-3 py-1 text-sm font-bangers tracking-wide border-2 border-black bg-white"
                  >
                    ⬇️ DOWNLOAD
                  </a>
                  {(viewer.uploadedByUid === user.uid || isHost) && (
                    <button
                      onClick={() => removeOne(viewer)}
                      className="px-3 py-1 text-sm font-bangers tracking-wide border-2 border-black bg-white hover:bg-comic-red hover:text-white"
                    >
                      ✕ DELETE
                    </button>
                  )}
                  <button
                    onClick={() => setViewer(null)}
                    className="px-3 py-1 text-sm font-bangers tracking-wide border-2 border-black bg-white"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
