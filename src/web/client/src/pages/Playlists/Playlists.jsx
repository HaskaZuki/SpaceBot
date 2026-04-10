import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Playlists.css';

function Playlists() {
  const { isPremium } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [maxPlaylists, setMaxPlaylists] = useState(3);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
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
        setPlaylists(prev => [...prev, data.playlist]);
        setNewPlaylistName('');
        setShowCreateModal(false);
      } else {
        setError(data.message || 'Failed to create playlist');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const deletePlaylist = async (playlistId) => {
    setDeletingId(playlistId);
    try {
      const res = await fetch(`${config.apiUrl}/api/user/playlists/${playlistId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setPlaylists(prev => prev.filter(p => (p.id || p._id) !== playlistId));
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const canCreateMore = playlists.length < maxPlaylists;

  // Color palette for playlist cards
  const CARD_COLORS = [
    'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
    'linear-gradient(135deg, #DB2777 0%, #9333EA 100%)',
    'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
    'linear-gradient(135deg, #D97706 0%, #DC2626 100%)',
    'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    'linear-gradient(135deg, #0891B2 0%, #059669 100%)',
  ];

  return (
    <DashboardLayout title="My Playlists">
      <div className="playlists-content">

        {/* Header */}
        <div className="playlists-header">
          <div className="playlists-header-left">
            <h2>Your Playlists</h2>
            <p>Create and manage your personal music collections</p>
          </div>
          <div className="playlists-header-right">
            <div className="playlist-quota">
              <div className="quota-bar">
                <div
                  className="quota-fill"
                  style={{ width: `${Math.min((playlists.length / maxPlaylists) * 100, 100)}%` }}
                />
              </div>
              <span className="quota-text">
                {playlists.length} / {maxPlaylists} playlists
                {!isPremium && <span className="quota-hint"> · Free</span>}
              </span>
            </div>
            <button
              className={`btn-create ${!canCreateMore ? 'btn-create-disabled' : ''}`}
              onClick={() => canCreateMore && setShowCreateModal(true)}
              title={canCreateMore ? 'Create playlist' : `Limit reached (${maxPlaylists})`}
            >
              <i className="fas fa-plus" /> New Playlist
            </button>
          </div>
        </div>

        {/* Premium Banner */}
        {!isPremium && playlists.length >= maxPlaylists && (
          <div className="premium-upsell-banner">
            <i className="fas fa-crown" />
            <div className="upsell-text">
              <strong>Want more playlists?</strong>
              <span>Upgrade to Premium for up to 100 playlists</span>
            </div>
            <a href="/pricing" className="upsell-btn">Upgrade →</a>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <i className="fas fa-music" />
            </div>
            <h3>No Playlists Yet</h3>
            <p>Create your first playlist to start organizing your favorite tracks</p>
            <button className="btn-create" onClick={() => setShowCreateModal(true)}>
              <i className="fas fa-plus" /> Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist, idx) => {
              const playlistId = playlist.id || playlist._id;
              const trackCount = playlist.tracks?.length || 0;
              const gradient = CARD_COLORS[idx % CARD_COLORS.length];
              const isDeleting = deletingId === playlistId;
              return (
                <div key={playlistId} className={`playlist-card ${isDeleting ? 'deleting' : ''}`}>
                  <div className="playlist-cover" style={{ background: gradient }}>
                    <div className="playlist-cover-icon">
                      <i className="fas fa-music" />
                    </div>
                    <div className="playlist-track-badge">{trackCount} tracks</div>
                  </div>
                  <div className="playlist-body">
                    <h3 className="playlist-name" title={playlist.name}>{playlist.name}</h3>
                    <p className="playlist-sub">
                      {trackCount === 0
                        ? 'Empty playlist'
                        : `${trackCount} track${trackCount !== 1 ? 's' : ''}`}
                    </p>
                    <div className="playlist-actions">
                      <button
                        className="playlist-delete-btn"
                        title="Delete playlist"
                        onClick={() => {
                          if (window.confirm(`Delete "${playlist.name}"?`)) {
                            deletePlaylist(playlistId);
                          }
                        }}
                        disabled={isDeleting}
                      >
                        <i className={`fas ${isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create New Slot */}
            {canCreateMore && (
              <button className="playlist-card playlist-card-new" onClick={() => setShowCreateModal(true)}>
                <div className="new-playlist-inner">
                  <i className="fas fa-plus" />
                  <span>New Playlist</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setError(''); setNewPlaylistName(''); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-plus" /> Create New Playlist</h3>
                <button className="modal-close" onClick={() => { setShowCreateModal(false); setError(''); }}>
                  <i className="fas fa-times" />
                </button>
              </div>
              <div className="modal-body">
                <label>Playlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chill Vibes, Workout Mix..."
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                  autoFocus
                  maxLength={50}
                />
                <span className="char-count">{newPlaylistName.length} / 50</span>
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
                <button
                  className="btn btn-primary"
                  onClick={createPlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  <i className="fas fa-plus" /> Create
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
