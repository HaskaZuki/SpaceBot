import React from 'react';
export default function Dashboard() {
  return (
    <div className="docs-body">
      <p className="docs-description">Manage your server and music through the web dashboard.</p>
      <h2 id="how-to-access">How to Access</h2>
      <ol>
        <li>Open <a href="https://spacebot.me" target="_blank" rel="noopener noreferrer" className="docs-link">spacebot.me</a></li>
        <li>Click "Login with Discord"</li>
        <li>Select your server</li>
        <li>Start managing!</li>
      </ol>
      <h2 id="features">Dashboard Features</h2>
      <ul>
        <li><strong>Server Overview</strong> - View server statistics and bot status</li>
        <li><strong>Music Player</strong> - Control playback directly from the web</li>
        <li><strong>Queue Management</strong> - View and manage the music queue</li>
        <li><strong>Playlists</strong> - Create and manage your playlists</li>
        <li><strong>Analytics</strong> - Detailed listening statistics</li>
        <li><strong>Settings</strong> - Configure server settings</li>
      </ul>
      <h2 id="dashboard-menu">Dashboard Menu</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>Dashboard</code>
          <span>Server overview</span>
        </div>
        <div className="docs-command-item">
          <code>Music</code>
          <span>Playback control</span>
        </div>
        <div className="docs-command-item">
          <code>Playlists</code>
          <span>Manage playlists</span>
        </div>
        <div className="docs-command-item">
          <code>Analytics</code>
          <span>Detailed stats</span>
        </div>
        <div className="docs-command-item">
          <code>Settings</code>
          <span>Server config</span>
        </div>
        <div className="docs-command-item">
          <code>Leaderboard</code>
          <span>Top listeners</span>
        </div>
      </div>
    </div>
  );
}
