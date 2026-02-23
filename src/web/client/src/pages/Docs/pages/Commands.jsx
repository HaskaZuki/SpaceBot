import React from 'react';

export default function Commands() {
  return (
    <div className="docs-body">
      <p className="docs-description">All music commands available in SpaceBot.</p>
      
      <h2 id="basic">Basic Commands</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/play</code>
          <span>Play a song</span>
        </div>
        <div className="docs-command-item">
          <code>/search</code>
          <span>Search for songs</span>
        </div>
        <div className="docs-command-item">
          <code>/queue</code>
          <span>View the queue</span>
        </div>
        <div className="docs-command-item">
          <code>/nowplaying</code>
          <span>Current track info</span>
        </div>
        <div className="docs-command-item">
          <code>/grab</code>
          <span>Save song to DM</span>
        </div>
        <div className="docs-command-item">
          <code>/lyrics</code>
          <span>Get song lyrics</span>
        </div>
      </div>
      
      <h2 id="controls">Playback Controls</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/pause</code>
          <span>Pause playback</span>
        </div>
        <div className="docs-command-item">
          <code>/resume</code>
          <span>Resume playback</span>
        </div>
        <div className="docs-command-item">
          <code>/skip</code>
          <span>Skip current song</span>
        </div>
        <div className="docs-command-item">
          <code>/stop</code>
          <span>Stop and clear queue</span>
        </div>
        <div className="docs-command-item">
          <code>/leave</code>
          <span>Disconnect bot</span>
        </div>
        <div className="docs-command-item">
          <code>/voteskip</code>
          <span>Vote to skip</span>
        </div>
      </div>
      
      <h2 id="queue-management">Queue Management</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/clear</code>
          <span>Clear the queue</span>
        </div>
        <div className="docs-command-item">
          <code>/shuffle</code>
          <span>Shuffle the queue</span>
        </div>
        <div className="docs-command-item">
          <code>/remove</code>
          <span>Remove a song</span>
        </div>
        <div className="docs-command-item">
          <code>/move</code>
          <span>Move song position</span>
        </div>
        <div className="docs-command-item">
          <code>/loop</code>
          <span>Set loop mode</span>
        </div>
        <div className="docs-command-item">
          <code>/jump</code>
          <span>Jump to song</span>
        </div>
      </div>
    </div>
  );
}
