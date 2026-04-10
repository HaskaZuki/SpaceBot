import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import './Updates.css';

function Updates() {
  const [selectedVersion, setSelectedVersion] = useState('v1.3.0');

  const updates = [
    {
      version: 'v1.3.0',
      date: 'April 10, 2026',
      type: 'major',
      title: 'Spotify-First Playback & Anti-Spam',
      changes: [
        { type: 'new', text: 'Spotify-first search priority (Spotify → Deezer → YouTube Music → YouTube → SoundCloud)' },
        { type: 'new', text: 'Now Playing embed no longer spams — edits the same message instead of sending new ones' },
        { type: 'new', text: 'Duration shown inline next to song title in Now Playing embed' },
        { type: 'new', text: 'Dual-level premium gate: server premium unlocks for all, user premium works in any server' },
        { type: 'new', text: 'Bot avatar now used as favicon and footer logo on website' },
        { type: 'new', text: 'General commands category added to website Commands page' },
        { type: 'new', text: 'Scrollable category tabs with arrow buttons on Commands page' },
        { type: 'fix', text: 'Fixed ReferenceError: track is not defined when playing songs' },
        { type: 'fix', text: 'Fixed analytics not tracking plays and listening time' },
        { type: 'fix', text: 'Removed Music Player page and persistent bottom player from website' },
        { type: 'update', text: 'Now Playing embed redesigned — cleaner, no thumbnail, shows source icon' },
      ]
    },
    {
      version: 'v1.2.0',
      date: 'April 3, 2026',
      type: 'minor',
      title: 'Spotify API Direct Playlist Fetch',
      changes: [
        { type: 'new', text: 'Spotify playlists now fetched directly via Spotify API (not via Lavalink cache)' },
        { type: 'new', text: 'Multi-source fallback for Spotify playlist tracks: spsearch → dzsearch → ytsearch' },
        { type: 'new', text: 'Setup channel prefix stripping — type song name directly without /play' },
        { type: 'new', text: 'Auto-delete confirmation messages in setup channels after 8 seconds' },
        { type: 'fix', text: 'Fixed voice channel connection failures for playlist requests' },
        { type: 'fix', text: 'Fixed Now Playing notifications not triggering for playlist tracks' },
        { type: 'update', text: 'Web Commands page updated with correct command descriptions' },
      ]
    },
    {
      version: 'v1.1.0',
      date: 'March 29, 2026',
      type: 'minor',
      title: 'Self-Hosted Lavalink & Premium System',
      changes: [
        { type: 'new', text: 'Migrated to self-hosted Lavalink instance on AWS for stable playback' },
        { type: 'new', text: 'Premium commands folder with category-based protection' },
        { type: 'new', text: 'Fallback node support — if primary node fails, bot uses backup node' },
        { type: 'fix', text: 'Fixed DJ commands allowing general user access when no DJ role set' },
        { type: 'fix', text: 'Resolved hardcoded shard ID issues in music player' },
        { type: 'update', text: 'Updated Lavalink LavaSrc plugin for Spotify & Deezer support' },
      ]
    },
    {
      version: 'v1.0.0',
      date: 'February 22, 2026',
      type: 'major',
      title: 'Initial Release',
      changes: [
        { type: 'new', text: 'Web dashboard with server management' },
        { type: 'new', text: 'Real-time player sync with Socket.IO' },
        { type: 'new', text: 'Premium subscription system with exclusive features' },
        { type: 'new', text: 'Playlist management (create, delete, manage)' },
        { type: 'new', text: 'Analytics dashboard with listening stats' },
        { type: 'new', text: 'Leaderboard system per server' },
        { type: 'new', text: '24/7 playback for premium servers' },
        { type: 'new', text: 'Auto-play mode (premium)' },
        { type: 'new', text: 'Audio filters: Bass Boost, Nightcore, 8D, Vaporwave, Karaoke' },
        { type: 'new', text: 'Setup channel — dedicated music text channel' },
        { type: 'new', text: 'DJ role system and voice channel restrictions' },
      ]
    },
  ];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'new': return 'fa-star';
      case 'fix': return 'fa-wrench';
      case 'update': return 'fa-sync';
      default: return 'fa-circle';
    }
  };

  const getTypeClass = (type) => {
    switch(type) {
      case 'new': return 'type-new';
      case 'fix': return 'type-fix';
      case 'update': return 'type-update';
      default: return '';
    }
  };

  const selectedUpdate = updates.find(u => u.version === selectedVersion);

  return (
    <DashboardLayout>
      <div className="updates-page">
        <div className="updates-header">
          <h1 className="page-title">
            <i className="fas fa-rocket"></i>
            Changelog
          </h1>
          <p className="page-subtitle">Latest updates and improvements to SpaceBot</p>
        </div>
        <div className="updates-content">
          <div className="version-list">
            {updates.map((update) => (
              <button
                key={update.version}
                className={`version-item ${selectedVersion === update.version ? 'active' : ''} type-${update.type}`}
                onClick={() => setSelectedVersion(update.version)}
              >
                <span className="version-badge">{update.version}</span>
                <span className="version-date">{update.date}</span>
              </button>
            ))}
          </div>
          <div className="version-details">
            {selectedUpdate && (
              <div className="changelog-card">
                <div className="changelog-header">
                  <span className={`changelog-version type-${selectedUpdate.type}`}>{selectedUpdate.version}</span>
                  <span className="changelog-date">{selectedUpdate.date}</span>
                </div>
                <h2 className="changelog-title">{selectedUpdate.title}</h2>
                <ul className="changelog-list">
                  {selectedUpdate.changes.map((change, index) => (
                    <li key={index} className={`changelog-item ${getTypeClass(change.type)}`}>
                      <i className={`fas ${getTypeIcon(change.type)}`}></i>
                      <span>{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="updates-footer">
          <p>Stay updated! Join our <a href="https://discord.gg/CFRKf8mXe4">Discord</a> for announcements.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Updates;
