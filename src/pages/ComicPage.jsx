import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComicGrid from '../components/ComicGrid.jsx';
import ItinerarySummary from '../components/ItinerarySummary.jsx';
import MapView from '../components/MapView.jsx';
import TravelEssentials from '../components/TravelEssentials.jsx';
import ShareBar from '../components/ShareBar.jsx';
import VoiceToggle from '../components/VoiceToggle.jsx';
import WeatherStrip from '../components/WeatherStrip.jsx';
import RefineBox from '../components/RefineBox.jsx';
import NavBar from '../components/NavBar.jsx';
import JourneyTracker from '../components/JourneyTracker.jsx';
import { useVoyage } from '../context/VoyageContext.jsx';

export default function ComicPage() {
  const navigate = useNavigate();
  const {
    itinerary: data,
    currentPanel, setCurrentPanel,
    voiceMode, setVoiceMode,
    handleMood, handleRefine, refining,
    replayNarration,
    weatherByHour, imagesByOrder,
    saveToGallery, isCurrentSaved,
    lastMood, city, persona
  } = useVoyage();

  if (!data) {
    navigate('/');
    return null;
  }

  function scrollToPanel(i) {
    const stop = data.stops?.[i];
    if (!stop) return;
    const el = document.getElementById(`panel-${stop.order}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCurrentPanel?.(i);
  }

  return (
    <div className="page-bg min-h-screen pb-20">
      <NavBar />

      {/* Action row */}
      <div className="max-w-6xl mx-auto px-4 mb-2 flex justify-end gap-2 flex-wrap">
        <VoiceToggle enabled={voiceMode} onToggle={setVoiceMode} />
        {voiceMode && (
          <button
            onClick={replayNarration}
            className="panel px-4 py-2 font-bangers tracking-wide"
            style={{ background: '#3BCEAC' }}
          >
            🔁 REPLAY
          </button>
        )}
        <button
          onClick={() => handleMood(lastMood)}
          className="panel px-4 py-2 font-bangers tracking-wide"
          style={{ background: '#EE4266', color: '#fff' }}
        >
          🎲 REROLL
        </button>
      </div>

      <JourneyTracker />

      <div id="comic-capture">
        <ComicGrid
          data={data}
          currentPanel={currentPanel}
          weatherByHour={weatherByHour}
          imagesByOrder={imagesByOrder}
        />
      </div>

      <WeatherStrip data={data} weatherByHour={weatherByHour} />

      <ShareBar
        data={data}
        mood={lastMood}
        city={city}
        persona={persona}
        onSave={saveToGallery}
        isSaved={isCurrentSaved}
      />

      <MapView data={data} onStopClick={scrollToPanel} />

      <ItinerarySummary data={data} />

      <RefineBox onRefine={handleRefine} loading={refining} />

      <TravelEssentials data={data} />
    </div>
  );
}
