import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Playlists from './pages/Playlists';
import Pricing from './pages/Pricing';
import Premium from './pages/Pricing/Premium';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Commands from './pages/Commands';
import Features from './pages/Features';
import Docs from './pages/Docs';
import Leaderboard from './pages/Leaderboard';
import Updates from './pages/Updates';
import Status from './pages/Status';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './styles/global.css';
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Landing />
          </motion.div>
        } />
        <Route path="/commands" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Commands />
          </motion.div>
        } />
        <Route path="/features" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Features />
          </motion.div>
        } />
        <Route path="/docs/*" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Docs />
          </motion.div>
        } />
        <Route path="/leaderboard" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Leaderboard />
          </motion.div>
        } />
        <Route path="/updates" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Updates />
          </motion.div>
        } />
        <Route path="/status" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Status />
          </motion.div>
        } />
        <Route path="/dashboard" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Dashboard />
          </motion.div>
        } />
        <Route path="/playlists" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Playlists />
          </motion.div>
        } />
        <Route path="/pricing" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Pricing />
          </motion.div>
        } />
        <Route path="/premium" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Premium />
          </motion.div>
        } />
        <Route path="/settings" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Settings />
          </motion.div>
        } />
        <Route path="/analytics" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <Analytics />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="app-container">
          <AnimatedRoutes />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
export default App;
