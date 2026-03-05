import React from 'react';
export default function Support() {
  return (
    <div className="docs-body">
      <p className="docs-description">Need help? We're here for you!</p>
      <h2 id="links">Quick Links</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>Website</code>
          <span><a href="https://spacebot.me" target="_blank" rel="noopener noreferrer" className="docs-link">spacebot.me</a></span>
        </div>
        <div className="docs-command-item">
          <code>Discord</code>
          <span><a href="https://discord.gg/spacebot" target="_blank" rel="noopener noreferrer" className="docs-link">discord.gg/spacebot</a></span>
        </div>
        <div className="docs-command-item">
          <code>Docs</code>
          <span><a href="https://spacebot.me/docs" target="_blank" rel="noopener noreferrer" className="docs-link">spacebot.me/docs</a></span>
        </div>
        <div className="docs-command-item">
          <code>Status</code>
          <span><a href="https://status.spacebot.me" target="_blank" rel="noopener noreferrer" className="docs-link">status.spacebot.me</a></span>
        </div>
      </div>
      <h2 id="command-help">Command Help</h2>
      <p>Use these commands for quick help:</p>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/help</code>
          <span>View all commands</span>
        </div>
        <div className="docs-command-item">
          <code>/support</code>
          <span>Get support links</span>
        </div>
      </div>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <h3>Bot not responding?</h3>
      <ul>
        <li>Check if bot is online in the server</li>
        <li>Try kicking and re-inviting the bot</li>
        <li>Check bot permissions in the channel</li>
      </ul>
      <h3>Music stops by itself?</h3>
      <ul>
        <li>Check your internet connection</li>
        <li>Use <code>/247</code> mode (Premium) to keep bot in VC</li>
        <li>Make sure bot has permission to speak</li>
      </ul>
      <h3>Queue not saved?</h3>
      <ul>
        <li>Queue resets when bot restarts</li>
        <li>Use playlists to save your favorite songs</li>
        <li>Premium users can use history feature</li>
      </ul>
      <h2 id="contact">Contact Us</h2>
      <p>Join our Discord server for direct support: <a href="https://discord.gg/spacebot" target="_blank" rel="noopener noreferrer" className="docs-link">discord.gg/spacebot</a></p>
    </div>
  );
}
