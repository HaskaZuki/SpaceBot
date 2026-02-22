import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Music from './pages/Music';
import Playlists from './pages/Playlists';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Commands from './pages/Commands';
import Features from './pages/Features';
import Docs from './pages/Docs';
import Leaderboard from './pages/Leaderboard';
import Updates from './pages/Updates';
import PersistentPlayer from './components/PersistentPlayer';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/features" element={<Features />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/music" element={<Music />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
          <PersistentPlayer />
          <Footer />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

