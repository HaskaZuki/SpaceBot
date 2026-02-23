import React from 'react';

export default function Setup() {
  return (
    <div className="docs-body">
      <h2 id="automatic-setup">Automatic Setup</h2>
      <p className="docs-description">The easiest way to set up SpaceBot on your server.</p>
      
      <p>Run this command on your server:</p>
      <p className="docs-code">/setup</p>
      <p>Bot will automatically create #space-music channel!</p>
      
      <h2 id="manual-setup">Manual Setup</h2>
      <p>If you prefer to set up manually:</p>
      <ol>
        <li>Create a new text channel</li>
        <li>Name it "space-music" or whatever you want</li>
        <li>Type <code>/play</code> in that channel</li>
        <li>Bot will automatically join your voice channel</li>
      </ol>
      
      <h2 id="server-configuration">Server Configuration</h2>
      <p>Configure your server with these commands:</p>
      
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/setdj @role</code>
          <span>Set DJ role</span>
        </div>
        <div className="docs-command-item">
          <code>/language</code>
          <span>Change language</span>
        </div>
        <div className="docs-command-item">
          <code>/announce</code>
          <span>Toggle announcements</span>
        </div>
        <div className="docs-command-item">
          <code>/limit</code>
          <span>Set queue limit</span>
        </div>
      </div>
    </div>
  );
}
