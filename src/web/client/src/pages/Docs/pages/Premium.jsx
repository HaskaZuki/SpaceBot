import React from 'react';

export default function Premium() {
  return (
    <div className="docs-body">
      <p className="docs-description">Unlock the full potential of SpaceBot with Premium features.</p>
      
      <h2 id="benefits">Premium Benefits</h2>
      <ul>
        <li><strong>Better audio quality</strong> - 256kbps instead of 128kbps</li>
        <li><strong>Longer queue</strong> - 500 songs instead of 100</li>
        <li><strong>Audio filters</strong> - Bassboost, nightcore, vaporwave, and more</li>
        <li><strong>24/7 mode</strong> - Bot stays in voice channel always</li>
        <li><strong>Unlimited playlists</strong> - 100 playlists instead of 3</li>
        <li><strong>Lyrics sync</strong> - Real-time lyrics display</li>
        <li><strong>Priority support</strong> - Faster response times</li>
      </ul>
      
      <h2 id="how-to-upgrade">How to Upgrade</h2>
      <ol>
        <li>Visit <a href="https://spacebot.me/pricing" target="_blank" rel="noopener noreferrer" className="docs-link">spacebot.me/pricing</a></li>
        <li>Choose your plan (Monthly or Yearly)</li>
        <li>Click "Upgrade" and follow payment instructions</li>
        <li>Enjoy your Premium features!</li>
      </ol>
      
      <h2 id="premium-commands">Premium Commands</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/247</code>
          <span>Toggle 24/7 mode</span>
        </div>
        <div className="docs-command-item">
          <code>/autoplay</code>
          <span>Auto play similar songs</span>
        </div>
        <div className="docs-command-item">
          <code>/volume</code>
          <span>Control volume</span>
        </div>
        <div className="docs-command-item">
          <code>/speed</code>
          <span>Adjust playback speed</span>
        </div>
        <div className="docs-command-item">
          <code>/filter</code>
          <span>Apply audio filters</span>
        </div>
        <div className="docs-command-item">
          <code>/history</code>
          <span>View listening history</span>
        </div>
      </div>
    </div>
  );
}
