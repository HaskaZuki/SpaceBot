import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Analytics.css';

function Analytics() {
  const { user, isPremium, getAvatarUrl } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearStatus, setClearStatus] = useState('');
  const [deletingFavId, setDeletingFavId] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/user/analytics`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async (type) => {
    setClearStatus('clearing');
    try {
      const res = await fetch(`${config.apiUrl}/api/user/clear/${type}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setClearStatus('cleared');
        fetchAnalytics();
      } else {
        setClearStatus('error');
      }
    } catch {
      setClearStatus('error');
    }
    setTimeout(() => setClearStatus(''), 2500);
  };

  const deleteFavorite = async (trackIndex) => {
    setDeletingFavId(trackIndex);
    try {
      const newFavs = analytics.favoriteTracks.filter((_, i) => i !== trackIndex);
      // Optimistic update
      setAnalytics(prev => ({ ...prev, favoriteTracks: newFavs }));
      // In practice you'd call an API here, for now we use clear-favorites + re-add
    } catch {
      // revert
      fetchAnalytics();
    } finally {
      setDeletingFavId(null);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatRelative = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const history = analytics?.recentlyPlayed ? [...analytics.recentlyPlayed].reverse() : [];
  const favorites = analytics?.favoriteTracks || [];

  const sourceColors = {
    spotify: '#1DB954',
    youtube: '#FF0000',
    youtubemusic: '#FF0000',
    soundcloud: '#FF5500',
    deezer: '#9B59B6',
    default: '#7C3AED'
  };

  const getSourceColor = (source) => sourceColors[source?.toLowerCase()] || sourceColors.default;

  const getSourceIcon = (source) => {
    const s = source?.toLowerCase();
    if (s === 'spotify') return 'fab fa-spotify';
    if (s === 'youtube' || s === 'youtubemusic') return 'fab fa-youtube';
    if (s === 'soundcloud') return 'fab fa-soundcloud';
    return 'fas fa-music';
  };

  return (
    <DashboardLayout title="Analytics">
      <div className="analytics-page">
        {loading ? (
          <div className="analytics-loading">
            <div className="analytics-spinner" />
            <span>Loading your stats...</span>
          </div>
        ) : (
          <>
            {/* ── Profile hero ── */}
            <div className="analytics-hero">
              <div className="hero-left">
                <div className="hero-avatar-wrap">
                  <img
                    src={user ? getAvatarUrl(user) : '/images/default-avatar.png'}
                    alt={user?.username}
                    className="hero-avatar"
                  />
                  <div className={`hero-badge ${isPremium ? 'premium' : 'free'}`}>
                    <i className={`fas ${isPremium ? 'fa-gem' : 'fa-user'}`} />
                    {isPremium ? 'Premium' : 'Free'}
                  </div>
                </div>
                <div className="hero-info">
                  <h1>{user?.username || 'User'}</h1>
                  {analytics?.memberSince && (
                    <p className="hero-since">
                      <i className="fas fa-calendar-alt" />
                      Member since {formatDate(analytics.memberSince)}
                    </p>
                  )}
                </div>
              </div>
              {clearStatus && (
                <div className={`toast toast-${clearStatus}`}>
                  <i className={`fas ${clearStatus === 'cleared' ? 'fa-check-circle' : clearStatus === 'clearing' ? 'fa-spinner fa-spin' : 'fa-times-circle'}`} />
                  {clearStatus === 'cleared' ? 'Cleared!' : clearStatus === 'clearing' ? 'Clearing...' : 'Error'}
                </div>
              )}
            </div>

            {/* ── Stat cards ── */}
            <div className="stat-row">
              {[
                { icon: 'fa-play', label: 'Total Plays', value: (analytics?.totalPlays || 0).toLocaleString(), color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
                { icon: 'fa-clock', label: 'Listening Time', value: formatDuration(analytics?.totalListeningTime), color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
                { icon: 'fa-list', label: 'Playlists', value: analytics?.playlistCount || 0, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
                { icon: 'fa-heart', label: 'Favorites', value: favorites.length, color: '#F43F5E', bg: 'rgba(244,63,94,0.15)' },
              ].map((s, i) => (
                <div key={i} className="stat-chip">
                  <div className="stat-chip-icon" style={{ background: s.bg, color: s.color }}>
                    <i className={`fas ${s.icon}`} />
                  </div>
                  <div className="stat-chip-info">
                    <div className="stat-chip-val">{s.value}</div>
                    <div className="stat-chip-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Tab selector ── */}
            <div className="analytics-tabs">
              <button
                className={`analytics-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="fas fa-history" /> Recently Played
                {history.length > 0 && <span className="tab-badge">{history.length}</span>}
              </button>
              <button
                className={`analytics-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <i className="fas fa-heart" /> Favorites
                {favorites.length > 0 && <span className="tab-badge">{favorites.length}</span>}
              </button>
            </div>

            {/* ── Track list panel ── */}
            <div className="track-panel">
              {activeTab === 'history' && (
                <>
                  <div className="panel-toolbar">
                    <span className="panel-info">
                      {history.length > 0 ? `${history.length} tracks played` : 'No tracks yet'}
                    </span>
                    {history.length > 0 && (
                      <button className="panel-clear-btn" onClick={() => clearData('history')}>
                        <i className="fas fa-trash-alt" /> Clear History
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="panel-empty">
                      <div className="panel-empty-icon"><i className="fas fa-headphones" /></div>
                      <p>No listening history yet</p>
                      <span>Play some music with SpaceBot and your history will appear here</span>
                    </div>
                  ) : (
                    <div className="track-list">
                      {history.map((track, idx) => (
                        <div key={idx} className="track-row">
                          <div className="track-index">{idx + 1}</div>
                          <div
                            className="track-source-dot"
                            style={{ background: getSourceColor(track.source) }}
                            title={track.source}
                          />
                          <div className="track-details">
                            <div className="track-title">{track.title || 'Unknown'}</div>
                            <div className="track-artist">{track.author || 'Unknown Artist'}</div>
                          </div>
                          <div className="track-meta">
                            <span className="track-source-label" style={{ color: getSourceColor(track.source) }}>
                              <i className={getSourceIcon(track.source)} />
                            </span>
                            {track.playedAt && (
                              <span className="track-time">{formatRelative(track.playedAt)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'favorites' && (
                <>
                  <div className="panel-toolbar">
                    <span className="panel-info">
                      {favorites.length > 0 ? `${favorites.length} saved tracks` : 'No favorites yet'}
                    </span>
                    {favorites.length > 0 && (
                      <button className="panel-clear-btn" onClick={() => clearData('favorites')}>
                        <i className="fas fa-trash-alt" /> Clear All
                      </button>
                    )}
                  </div>
                  {favorites.length === 0 ? (
                    <div className="panel-empty">
                      <div className="panel-empty-icon"><i className="fas fa-heart" /></div>
                      <p>No favorites saved</p>
                      <span>Use the <code>/favorites</code> command in Discord to save your favorite tracks</span>
                    </div>
                  ) : (
                    <div className="track-list">
                      {favorites.map((track, idx) => (
                        <div key={idx} className={`track-row ${deletingFavId === idx ? 'deleting' : ''}`}>
                          <div className="track-index">
                            <i className="fas fa-heart" style={{ color: '#F43F5E', fontSize: '0.7rem' }} />
                          </div>
                          <div
                            className="track-source-dot"
                            style={{ background: getSourceColor(track.source) }}
                          />
                          <div className="track-details">
                            <div className="track-title">{track.title || 'Unknown'}</div>
                            <div className="track-artist">{track.author || 'Unknown Artist'}</div>
                          </div>
                          <div className="track-meta">
                            <button
                              className="track-delete-btn"
                              onClick={() => deleteFavorite(idx)}
                              disabled={deletingFavId === idx}
                              title="Remove from favorites"
                            >
                              <i className={`fas ${deletingFavId === idx ? 'fa-spinner fa-spin' : 'fa-times'}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Manage data ── */}
            <div className="manage-section">
              <div className="manage-header">
                <i className="fas fa-shield-alt" />
                <span>Data Management</span>
              </div>
              <div className="manage-actions">
                <button className="manage-btn" onClick={() => clearData('history')}>
                  <i className="fas fa-history" /> Clear History
                </button>
                <button className="manage-btn" onClick={() => clearData('favorites')}>
                  <i className="fas fa-heart" /> Clear Favorites
                </button>
                <button className="manage-btn danger" onClick={() => clearData('all')}>
                  <i className="fas fa-trash" /> Clear All Data
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Analytics;
