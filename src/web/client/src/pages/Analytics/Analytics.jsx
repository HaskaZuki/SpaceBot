import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Analytics.css';

function Analytics() {
  const { user, isPremium, getAvatarUrl } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [clearStatus, setClearStatus] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/user/analytics`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async (type) => {
    try {
      setClearStatus('clearing');
      const res = await fetch(`${config.apiUrl}/api/user/clear/${type}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setClearStatus('cleared');
        fetchAnalytics();
      } else {
        setClearStatus('error');
      }
    } catch (error) {
      setClearStatus('error');
    }
    setConfirmAction(null);
    setTimeout(() => setClearStatus(''), 2000);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <DashboardLayout title="Analytics">
      <div className="analytics-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="analytics-header">
              <div className="analytics-profile">
                <img
                  src={user ? getAvatarUrl(user) : '/images/default-avatar.png'}
                  alt="Profile"
                  className="analytics-avatar"
                />
                <div className="analytics-profile-info">
                  <h2>{user?.username || 'User'}</h2>
                  <span className={`analytics-tier ${isPremium ? 'premium' : 'free'}`}>
                    <i className={`fas ${isPremium ? 'fa-gem' : 'fa-user'}`} />
                    {isPremium ? 'Premium' : 'Free Tier'}
                  </span>
                </div>
              </div>
              {analytics?.memberSince && (
                <div className="analytics-member-since">
                  <i className="fas fa-calendar-alt" />
                  Member since {formatDate(analytics.memberSince)}
                </div>
              )}
            </div>

            {clearStatus && (
              <div className={`clear-toast ${clearStatus}`}>
                <i className={`fas ${clearStatus === 'cleared' ? 'fa-check' : clearStatus === 'clearing' ? 'fa-spinner fa-spin' : 'fa-times'}`} />
                {clearStatus === 'cleared' ? 'Data cleared!' : clearStatus === 'clearing' ? 'Clearing...' : 'Failed to clear'}
              </div>
            )}

            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-card-icon play">
                  <i className="fas fa-play" />
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{analytics?.totalPlays || 0}</div>
                  <div className="stat-card-label">Total Plays</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon time">
                  <i className="fas fa-clock" />
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{formatDuration(analytics?.totalListeningTime)}</div>
                  <div className="stat-card-label">Listening Time</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon playlist">
                  <i className="fas fa-list" />
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{analytics?.playlistCount || 0}</div>
                  <div className="stat-card-label">Playlists</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon fav">
                  <i className="fas fa-heart" />
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{analytics?.favoriteTracks?.length || 0}</div>
                  <div className="stat-card-label">Favorites</div>
                </div>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-section">
                <div className="section-header-row">
                  <h3><i className="fas fa-history" /> Recently Played</h3>
                </div>
                {analytics?.recentlyPlayed && analytics.recentlyPlayed.length > 0 ? (
                  <div className="track-list">
                    {analytics.recentlyPlayed.map((track, index) => (
                      <div key={index} className="track-item">
                        <span className="track-num">{index + 1}</span>
                        <div className="track-info">
                          <div className="track-title">{track.title || 'Unknown Track'}</div>
                          <div className="track-artist">{track.author || 'Unknown Artist'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="analytics-empty">
                    <i className="fas fa-music" />
                    <p>No listening history yet</p>
                    <span>Start playing music to see your stats!</span>
                  </div>
                )}
              </div>

              <div className="analytics-section">
                <div className="section-header-row">
                  <h3><i className="fas fa-heart" /> Favorite Tracks</h3>
                </div>
                {analytics?.favoriteTracks && analytics.favoriteTracks.length > 0 ? (
                  <div className="track-list">
                    {analytics.favoriteTracks.map((track, index) => (
                      <div key={index} className="track-item">
                        <span className="track-num">
                          <i className="fas fa-heart" />
                        </span>
                        <div className="track-info">
                          <div className="track-title">{track.title || 'Unknown Track'}</div>
                          <div className="track-artist">{track.author || 'Unknown Artist'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="analytics-empty">
                    <i className="fas fa-heart" />
                    <p>No favorites yet</p>
                    <span>Use /favorites command to save tracks</span>
                  </div>
                )}
              </div>
            </div>

            <div className="analytics-data-actions">
              <h3><i className="fas fa-database" /> Manage Data</h3>
              <div className="data-action-row">
                <button className="data-action-btn" onClick={() => setConfirmAction('history')}>
                  <i className="fas fa-history" />
                  <span>Clear History</span>
                </button>
                <button className="data-action-btn" onClick={() => setConfirmAction('favorites')}>
                  <i className="fas fa-heart" />
                  <span>Clear Favorites</span>
                </button>
                <button className="data-action-btn danger" onClick={() => setConfirmAction('all')}>
                  <i className="fas fa-trash" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>

            {confirmAction && (
              <div className="analytics-confirm-overlay" onClick={() => setConfirmAction(null)}>
                <div className="analytics-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="analytics-confirm-icon">
                    <i className="fas fa-exclamation-triangle" />
                  </div>
                  <h3>Are you sure?</h3>
                  <p>
                    {confirmAction === 'all'
                      ? 'This will permanently delete ALL your analytics data. This cannot be undone.'
                      : `This will permanently clear your ${confirmAction}. This cannot be undone.`}
                  </p>
                  <div className="analytics-confirm-actions">
                    <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-danger" onClick={() => clearData(confirmAction)}>
                      <i className="fas fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Analytics;
