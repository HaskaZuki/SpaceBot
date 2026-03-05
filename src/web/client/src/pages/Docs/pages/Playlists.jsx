import React from 'react';
export default function Playlists() {
  return (
    <div className="docs-body">
      <p className="docs-description">Create and manage your personal playlists with SpaceBot.</p>
      <h2 id="playlist-commands">Playlist Commands</h2>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/playlist create</code>
          <span>Create new playlist</span>
        </div>
        <div className="docs-command-item">
          <code>/playlist add</code>
          <span>Add song to playlist</span>
        </div>
        <div className="docs-command-item">
          <code>/playlist remove</code>
          <span>Remove from playlist</span>
        </div>
        <div className="docs-command-item">
          <code>/playlist delete</code>
          <span>Delete playlist</span>
        </div>
        <div className="docs-command-item">
          <code>/playlist list</code>
          <span>View all playlists</span>
        </div>
        <div className="docs-command-item">
          <code>/playlist load</code>
          <span>Play a playlist</span>
        </div>
        <div className="docs-command-item">
          <code>/playlist view</code>
          <span>View playlist songs</span>
        </div>
        <div className="docs-command-item">
          <code>/export-playlist</code>
          <span>Export to file</span>
        </div>
      </div>
      <h2 id="favorites">Favorites</h2>
      <p>Save your favorite songs for quick access:</p>
      <div className="docs-command-grid">
        <div className="docs-command-item">
          <code>/add-favorite</code>
          <span>Add current song</span>
        </div>
        <div className="docs-command-item">
          <code>/manage-favorites</code>
          <span>View & manage</span>
        </div>
      </div>
      <div className="docs-note">
        Note: Free users can create up to 3 playlists. Premium users get unlimited playlists.
      </div>
    </div>
  );
}
