import React from 'react';
export default function FAQ() {
  return (
    <div className="docs-body">
      <p className="docs-description">Frequently asked questions about SpaceBot.</p>
      <h2 id="music-issues">Music won't play?</h2>
      <ul>
        <li>Make sure bot is in a voice channel</li>
        <li>Check if queue has songs</li>
        <li>Bot needs Connect and Speak permissions</li>
        <li>Try <code>/leave</code> then <code>/play</code> again</li>
        <li>Check if Lavalink server is online</li>
      </ul>
      <h2 id="support">How to get support?</h2>
      <ul>
        <li>Join our Discord: <a href="https://discord.gg/spacebot" target="_blank" rel="noopener noreferrer" className="docs-link">discord.gg/spacebot</a></li>
        <li>Use <code>/help</code> to see all commands</li>
        <li>Check the dashboard for server stats</li>
        <li>Use <code>/support</code> command for quick links</li>
      </ul>
      <h2 id="spotify">Can I use Spotify?</h2>
      <p>Yes! SpaceBot supports multiple platforms:</p>
      <ul>
        <li><strong>YouTube</strong> - Videos, playlists, and shorts</li>
        <li><strong>Spotify</strong> - Tracks and playlists</li>
        <li><strong>SoundCloud</strong> - Tracks and sets</li>
        <li><strong>Apple Music</strong> - Tracks and albums</li>
        <li><strong>Direct URLs</strong> - MP3, FLAC, and more</li>
      </ul>
      <h2 id="premium-questions">How to get Premium?</h2>
      <p>Visit <a href="https://spacebot.me/pricing" target="_blank" rel="noopener noreferrer" className="docs-link">spacebot.me/pricing</a> for plans and pricing!</p>
      <h2 id="bot-offline">Bot offline?</h2>
      <p>If the bot appears offline:</p>
      <ul>
        <li>Wait a few minutes - might be restarting</li>
        <li>Check our Discord for status updates</li>
        <li>Try kicking and re-inviting the bot</li>
        <li>Contact support if issue persists</li>
      </ul>
    </div>
  );
}
