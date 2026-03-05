import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import './Updates.css';
function Updates() {
  const [selectedVersion, setSelectedVersion] = useState('v1.0.0');
  const updates = [
    {
      version: 'v1.0.0',
      date: 'February 22, 2026',
      type: 'major',
      title: 'Initial Release',
      changes: [
        { type: 'new', text: 'Dashboard with server management' },
        { type: 'new', text: 'Persistent music player across all pages' },
        { type: 'new', text: 'Real-time player sync with Socket.IO' },
        { type: 'new', text: 'Multi-language support (13 languages)' },
        { type: 'new', text: 'Premium system with exclusive features' },
        { type: 'new', text: 'Playlist management and sharing' },
        { type: 'new', text: 'Lyrics display with sync support' },
        { type: 'new', text: 'Analytics dashboard with detailed stats' },
        { type: 'new', text: 'Leaderboard system' },
        { type: 'new', text: 'Documentation and help center' },
        { type: 'new', text: '24/7 playback for premium servers' },
        { type: 'new', text: 'Auto-play mode' },
        { type: 'new', text: 'Bass boost and audio filters' },
        { type: 'new', text: 'Speed control' },
        { type: 'new', text: 'Vaporwave and Nightcore effects' }
      ]
    },
    {
      version: 'v0.9.5',
      date: 'January 15, 2026',
      type: 'minor',
      title: 'Beta Improvements',
      changes: [
        { type: 'new', text: 'Added Lavalink node management' },
        { type: 'fix', text: 'Fixed queue loop behavior' },
        { type: 'fix', text: 'Improved search results accuracy' },
        { type: 'fix', text: 'Fixed premium status checking' },
        { type: 'update', text: 'Updated Discord.js to v14' },
        { type: 'update', text: 'Improved memory usage' }
      ]
    },
    {
      version: 'v0.9.0',
      date: 'December 1, 2025',
      type: 'minor',
      title: 'Premium Features Beta',
      changes: [
        { type: 'new', text: 'Premium subscription system' },
        { type: 'new', text: 'VIP commands unlock' },
        { type: 'new', text: 'Extended queue limits' },
        { type: 'new', text: 'Custom prefix per server' },
        { type: 'fix', text: 'Fixed music stopping unexpectedly' },
        { type: 'fix', text: 'Improved DJ role handling' }
      ]
    },
    {
      version: 'v0.8.0',
      date: 'October 20, 2025',
      type: 'minor',
      title: 'Music Enhancements',
      changes: [
        { type: 'new', text: 'Added shuffle command' },
        { type: 'new', text: 'Vote skip system' },
        { type: 'new', text: 'Seek command for tracks' },
        { type: 'new', text: 'Move track in queue' },
        { type: 'fix', text: 'Fixed track skipping issues' },
        { type: 'update', text: 'Better error messages' }
      ]
    },
    {
      version: 'v0.7.0',
      date: 'August 5, 2025',
      type: 'minor',
      title: 'Playlist System',
      changes: [
        { type: 'new', text: 'Create and manage playlists' },
        { type: 'new', text: 'Save favorite tracks' },
        { type: 'new', text: 'Export playlists' },
        { type: 'new', text: 'Import playlists' },
        { type: 'fix', text: 'Fixed playlist loading times' }
      ]
    }
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
  return (
    <DashboardLayout>
      <div className="updates-page">
        <div className="updates-header">
          <h1 className="page-title">
            <i className="fas fa-bullhorn"></i>
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
            {updates.filter(u => u.version === selectedVersion).map((update) => (
              <div key={update.version} className="changelog-card">
                <div className="changelog-header">
                  <span className={`changelog-version type-${update.type}`}>{update.version}</span>
                  <span className="changelog-date">{update.date}</span>
                </div>
                <h2 className="changelog-title">{update.title}</h2>
                <ul className="changelog-list">
                  {update.changes.map((change, index) => (
                    <li key={index} className={`changelog-item ${getTypeClass(change.type)}`}>
                      <i className={`fas ${getTypeIcon(change.type)}`}></i>
                      <span>{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="updates-footer">
          <p>More updates coming soon! Follow our <a href="https://discord.gg/spacebot">Discord</a> for announcements.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
export default Updates;
