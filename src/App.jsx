import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { VoyageProvider, useVoyage } from './context/VoyageContext.jsx';
import PageTransition from './components/PageTransition.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import HomePage from './pages/HomePage.jsx';
import ComicPage from './pages/ComicPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import ReaderPage from './pages/ReaderPage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import TripPage from './pages/TripPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import JourneysPage from './pages/JourneysPage.jsx';
import PhotoAlbumPage from './pages/PhotoAlbumPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VoyageProvider>
          <Gate />
        </VoyageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Controls which page a user lands on based on auth status
function Gate() {
  const { ready, isAuthed, isGuest } = useAuth();
  const location = useLocation();

  if (!ready) return <Splash />;

  // Not signed in AND not chosen guest mode → force welcome
  if (!isAuthed && !isGuest && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  // If signed in, keep them off /welcome
  if (isAuthed && location.pathname === '/welcome') {
    return <Navigate to="/" replace />;
  }

  return <Shell />;
}

function Shell() {
  const { loading, lastMood, city } = useVoyage();

  if (loading) return <LoadingScreen mood={lastMood} city={city} />;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/welcome"    element={<PageTransition pageKey="welcome"><WelcomePage /></PageTransition>} />
        <Route path="/"           element={<PageTransition pageKey="home"><HomePage /></PageTransition>} />
        <Route path="/comic"      element={<PageTransition pageKey="comic"><ComicPage /></PageTransition>} />
        <Route path="/read"       element={<PageTransition pageKey="read"><ReaderPage /></PageTransition>} />
        <Route path="/edit"       element={<PageTransition pageKey="edit"><EditorPage /></PageTransition>} />
        <Route path="/gallery"    element={<PageTransition pageKey="gallery"><GalleryPage /></PageTransition>} />
        <Route path="/journeys"   element={<PageTransition pageKey="journeys"><JourneysPage /></PageTransition>} />
        <Route path="/trip"       element={<PageTransition pageKey="trip"><TripPage /></PageTransition>} />
        <Route path="/profile"    element={<PageTransition pageKey="profile"><ProfilePage /></PageTransition>} />
        <Route path="/photos"     element={<PageTransition pageKey="photos"><PhotoAlbumPage /></PageTransition>} />
        <Route path="/about"      element={<PageTransition pageKey="about"><AboutPage /></PageTransition>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function Splash() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-3 animate-bounce">💥</div>
        <p className="font-bangers text-4xl tracking-wider">VOYAGE</p>
        <p className="font-comic text-sm opacity-60 mt-1">Loading…</p>
      </div>
    </div>
  );
}

function LoadingScreen({ mood, city }) {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">✍️</div>
        <div className="inline-block panel px-8 py-4" style={{ background: '#FFD23F' }}>
          <p className="font-comic text-sm tracking-widest uppercase opacity-70">AI is drawing your comic…</p>
          <h2 className="font-bangers text-4xl md:text-6xl tracking-wider animate-wiggle">
            {mood?.toUpperCase() || 'YOUR'} DAY IN {city?.toUpperCase()}
          </h2>
          <p className="font-comic text-xs mt-2 opacity-60">
            Planning 6 stops · fetching weather · sketching panels
          </p>
        </div>
      </div>
    </div>
  );
}
