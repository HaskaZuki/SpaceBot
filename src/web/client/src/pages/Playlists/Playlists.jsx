import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Playlists.css';

function Playlists() {
  const { user, isPremium, premiumInfo } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [maxPlaylists, setMaxPlaylists] = useState(3);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/user/playlists`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.playlists || []);
        setMaxPlaylists(data.maxPlaylists || 3);
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setError('');
    
    try {
      const res = await fetch(`${config.apiUrl}/api/user/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newPlaylistName.trim() })
      });
      
      const data = await res.json();

      if (res.status === 403 && data.requiresPremium) {
        setError(`Playlist limit reached (${maxPlaylists}). Upgrade to Premium for more!`);
        return;
      }

      if (res.ok && data.success) {
        setPlaylists([...playlists, data.playlist]);
        setNewPlaylistName('');
        setShowCreateModal(false);
      } else {
        setError(data.message || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
      setError('Network error. Please try again.');
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const res = await fetch(`${config.apiUrl}/api/user/playlists/${playlistId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        setPlaylists(playlists.filter(p => (p.id || p._id) !== playlistId));
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const canCreateMore = playlists.length < maxPlaylists;

  return (
    <DashboardLayout title="📝 My Playlists">
      <div className="playlists-content">
        <div className="playlists-header">
          <div>
            <h2>Your Playlists</h2>
            <p>Create and manage your personal music collections</p>
          </div>
          <div className="playlists-header-right">
            <span className="playlist-count">
              {playlists.length} / {maxPlaylists}
              {!isPremium && <span className="playlist-limit-hint"> (Free limit)</span>}
            </span>
            <button 
              className={`btn ${canCreateMore ? 'btn-primary' : 'btn-disabled'}`} 
              onClick={() => canCreateMore ? setShowCreateModal(true) : null}
              title={canCreateMore ? 'Create playlist' : `Limit reached (${maxPlaylists})`}
            >
              <i className="fas fa-plus" /> Create Playlist
            </button>
          </div>
        </div>

        {!isPremium && playlists.length >= maxPlaylists && (
          <div className="premium-upsell-banner">
            <div className="upsell-content">
              <i className="fas fa-crown" />
              <div>
                <strong>Want more playlists?</strong>
                <p>Upgrade to Premium for up to 100 playlists!</p>
              </div>
            </div>
            <a href="/pricing" className="upsell-btn">Upgrade Now</a>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-music" />
            </div>
            <h3>No Playlists Yet</h3>
            <p>Create your first playlist to start organizing your favorite tracks</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <i className="fas fa-plus" /> Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div key={playlist.id || playlist._id} className="playlist-card">
                <div className="playlist-cover">
                  {playlist.tracks && playlist.tracks.length > 0 ? (
                    <img 
                      src={playlist.tracks[0].thumbnail || '/images/default-album.png'} 
                      alt={playlist.name}
                    />
                  ) : (
                    <div className="playlist-cover-placeholder">
                      <i className="fas fa-music" />
                    </div>
                  )}
                  <div className="playlist-overlay">
                    <button className="play-btn">
                      <i className="fas fa-play" />
                    </button>
                  </div>
                </div>
                <div className="playlist-info">
                  <h3 className="playlist-name">{playlist.name}</h3>
                  <p className="playlist-meta">
                    {playlist.tracks?.length || 0} tracks
                  </p>
                </div>
                <div className="playlist-actions">
                  <button className="action-btn-small" title="Play All">
                    <i className="fas fa-play" />
                  </button>
                  <button className="action-btn-small" title="Shuffle">
                    <i className="fas fa-shuffle" />
                  </button>
                  <button 
                    className="action-btn-small delete" 
                    title="Delete"
                    onClick={() => deletePlaylist(playlist.id || playlist._id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setError(''); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create New Playlist</h3>
                <button className="modal-close" onClick={() => { setShowCreateModal(false); setError(''); }}>
                  <i className="fas fa-times" />
                </button>
              </div>
              <div className="modal-body">
                <label>Playlist Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Playlist"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                  autoFocus
                />
                {error && (
                  <div className="modal-error">
                    <i className="fas fa-exclamation-circle" /> {error}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowCreateModal(false); setError(''); }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={createPlaylist}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Playlists;
