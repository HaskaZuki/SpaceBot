import React from 'react';

export default function Filters() {
  return (
    <div className="docs-body">
      <p className="docs-description">Audio filters to enhance your music experience. Premium feature only.</p>
      
      <h2 id="available-filters">Available Filters</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/filter bassboost</code>
          <span>Bass boost effect</span>
        </div>
        <div className="docs-command-item">
          <code>/filter nightcore</code>
          <span>Nightcore effect</span>
        </div>
        <div className="docs-command-item">
          <code>/filter vaporwave</code>
          <span>Vaporwave effect</span>
        </div>
        <div className="docs-command-item">
          <code>/filter 8d</code>
          <span>8D audio effect</span>
        </div>
        <div className="docs-command-item">
          <code>/filter karaoke</code>
          <span>Karaoke mode</span>
        </div>
        <div className="docs-command-item">
          <code>/filter pop</code>
          <span>Pop enhancement</span>
        </div>
        <div className="docs-command-item">
          <code>/filter soft</code>
          <span>Soft mode</span>
        </div>
        <div className="docs-command-item">
          <code>/filter treble</code>
          <span>Treble boost</span>
        </div>
      </div>
      
      <h2 id="volume-speed">Volume & Speed</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/volume 1-200</code>
          <span>Adjust volume</span>
        </div>
        <div className="docs-command-item">
          <code>/speed 0.5-2.0</code>
          <span>Adjust speed</span>
        </div>
      </div>
      
      <div className="docs-note">
        Note: Audio filters are for Premium users only. Visit <a href="https://spacebot.me/pricing" target="_blank" rel="noopener noreferrer">spacebot.me/pricing</a> to upgrade.
      </div>
    </div>
  );
}
