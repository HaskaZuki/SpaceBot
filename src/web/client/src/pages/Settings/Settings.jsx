import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Settings.css';
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'fa-user' },
  { id: 'audio', label: 'Audio', icon: 'fa-headphones' },
  { id: 'premium', label: 'Premium', icon: 'fa-crown' },
  { id: 'servers', label: 'Servers', icon: 'fa-server' },
  { id: 'privacy', label: 'Privacy', icon: 'fa-shield-alt' }
];
function Settings() {
  const { user, isPremium, getAvatarUrl } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    compactMode: false,
    notifications: { songChanges: true, queueUpdates: true, systemAlerts: true },
    trackHistory: true,
    shareActivity: false
  });
  const [serverList, setServerList] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  useEffect(() => {
    fetchSettings();
    fetchStatus();
  }, []);
  useEffect(() => {
    if (activeTab === 'servers') {
      fetchServers();
    }
  }, [activeTab]);
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/user/settings`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/status`);
      if (res.ok) {
        const data = await res.json();
        setServiceStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };
  const fetchServers = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/guilds`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setServerList(data);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    }
  };
  const saveSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setSaveStatus('saving');
    try {
      const res = await fetch(`${config.apiUrl}/api/user/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setSaveStatus('saved');
      } else {
        const data = await res.json();
        setSaveStatus('error');
        if (data.requiresPremium) {
          alert('Premium required for this feature. Please upgrade!');
        }
      }
    } catch (error) {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };
  const clearData = async (type) => {
    try {
      setSaveStatus('saving');
      const res = await fetch(`${config.apiUrl}/api/user/clear/${type}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    }
    setConfirmAction(null);
    setTimeout(() => setSaveStatus(''), 2000);
  };
  const formatUptime = (ms) => {
    if (!ms) return '--';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000) % 24;
    const mins = Math.floor(ms / 60000) % 60;
    return `${days}d ${hours}h ${mins}m`;
  };
  const getStatusColor = (status) => status ? '#22c55e' : '#ef4444';
  const getStatusText = (status) => status ? 'Operational' : 'Down';
  return (
    <DashboardLayout title="Settings">
      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {saveStatus && (
          <div className={`save-toast ${saveStatus}`}>
            <i className={`fas ${saveStatus === 'saved' ? 'fa-check' : saveStatus === 'saving' ? 'fa-spinner fa-spin' : 'fa-times'}`} />
            {saveStatus === 'saved' ? 'Settings saved!' : saveStatus === 'saving' ? 'Saving...' : 'Failed to save'}
          </div>
        )}
        <div className="settings-panel">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="profile-section">
                <img
                  src={user ? getAvatarUrl(user) : '/images/default-avatar.png'}
                  alt="Profile"
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <h2>{user?.username || 'User'}</h2>
                  <span className={`tier-badge ${isPremium ? 'premium' : 'free'}`}>
                    <i className={`fas ${isPremium ? 'fa-gem' : 'fa-user'}`} />
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>
              </div>
              <div className="settings-group">
                <h3 className="group-title">Preferences</h3>
                <div className="setting-item">
                  <div><strong>Theme</strong><p className="setting-desc">Choose your preferred appearance</p></div>
                  <select
                    value={settings.theme || 'dark'}
                    onChange={(e) => saveSettings({ theme: e.target.value })}
                  >
                    <option value="dark">Dark</option>
                    <option value="midnight">Midnight</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div><strong>Language</strong><p className="setting-desc">Interface language</p></div>
                  <select
                    value={settings.language || 'en'}
                    onChange={(e) => saveSettings({ language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div><strong>Track History</strong><p className="setting-desc">Save your listening history</p></div>
                  <div
                    className={`toggle-switch ${settings.trackHistory ? 'active' : ''}`}
                    onClick={() => saveSettings({ trackHistory: !settings.trackHistory })}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
                <div className="setting-item">
                  <div><strong>Share Activity</strong><p className="setting-desc">Show what you're listening to</p></div>
                  <div
                    className={`toggle-switch ${settings.shareActivity ? 'active' : ''}`}
                    onClick={() => saveSettings({ shareActivity: !settings.shareActivity })}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
              </div>
              {serviceStatus && (
                <div className="settings-group">
                  <h3 className="group-title">System Status</h3>
                  <div className="status-grid">
                    <div className="status-item">
                      <span className="status-dot" style={{ background: getStatusColor(serviceStatus.api) }} />
                      <span>API</span>
                      <span className="status-label" style={{ color: getStatusColor(serviceStatus.api) }}>{getStatusText(serviceStatus.api)}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot" style={{ background: getStatusColor(serviceStatus.database) }} />
                      <span>Database</span>
                      <span className="status-label" style={{ color: getStatusColor(serviceStatus.database) }}>{getStatusText(serviceStatus.database)}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot" style={{ background: getStatusColor(serviceStatus.lavalink) }} />
                      <span>Audio Node</span>
                      <span className="status-label" style={{ color: getStatusColor(serviceStatus.lavalink) }}>{getStatusText(serviceStatus.lavalink)}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot" style={{ background: '#22c55e' }} />
                      <span>Uptime</span>
                      <span className="status-label">{formatUptime(serviceStatus.uptime)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'audio' && (
            <div className="tab-content">
              {}
              <div className="audio-visualizer-header">
                <div className="audio-wave-container">
                  <div className="audio-wave">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="wave-bar"
                        style={{ 
                          animationDelay: `${i * 0.1}s`,
                          height: `${Math.random() * 60 + 20}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="audio-header-content">
                  <div className="audio-icon-pulse">
                    <i className="fas fa-headphones" />
                  </div>
                  <h2>Audio Settings</h2>
                  <p>Customize your listening experience</p>
                </div>
              </div>
              {}
              <div className="audio-quality-section">
                <h3 className="group-title">Stream Quality</h3>
                <div className="quality-cards">
                  <div 
                    className={`quality-card ${settings.audioQuality === '64' ? 'selected' : ''} ${settings.audioQuality === '64' ? '' : 'clickable'}`}
                    onClick={() => saveSettings({ audioQuality: '64' })}
                  >
                    <div className="quality-icon normal">
                      <i className="fas fa-music" />
                    </div>
                    <div className="quality-info">
                      <h4>Normal</h4>
                      <span className="quality-bitrate">64 kbps</span>
                      <p className="quality-desc">Standard quality, uses less data</p>
                    </div>
                    <div className="quality-check">
                      {settings.audioQuality === '64' && <i className="fas fa-check-circle" />}
                    </div>
                  </div>
                  <div 
                    className={`quality-card ${settings.audioQuality === '128' ? 'selected' : ''} ${isPremium ? 'clickable' : 'locked'}`}
                    onClick={() => isPremium && saveSettings({ audioQuality: '128' })}
                  >
                    {!isPremium && <div className="premium-lock"><i className="fas fa-crown" /></div>}
                    <div className="quality-icon hd">
                      <i className="fas fa-headphones-alt" />
                    </div>
                    <div className="quality-info">
                      <h4>HD</h4>
                      <span className="quality-bitrate">128 kbps</span>
                      <p className="quality-desc">High quality audio experience</p>
                    </div>
                    <div className="quality-check">
                      {settings.audioQuality === '128' && <i className="fas fa-check-circle" />}
                    </div>
                  </div>
                  <div 
                    className={`quality-card ${settings.audioQuality === '256' ? 'selected' : ''} ${isPremium ? 'clickable' : 'locked'}`}
                    onClick={() => isPremium && saveSettings({ audioQuality: '256' })}
                  >
                    {!isPremium && <div className="premium-lock"><i className="fas fa-crown" /></div>}
                    <div className="quality-icon ultra">
                      <i className="fas fa-gem" />
                    </div>
                    <div className="quality-info">
                      <h4>Ultra HD</h4>
                      <span className="quality-bitrate">256 kbps</span>
                      <p className="quality-desc">Studio quality, best experience</p>
                    </div>
                    <div className="quality-check">
                      {settings.audioQuality === '256' && <i className="fas fa-check-circle" />}
                    </div>
                  </div>
                </div>
              </div>
              {}
              <div className="audio-features-section">
                <h3 className="group-title">Audio Features</h3>
                <div className="audio-features-grid">
                  <div className="audio-feature-card">
                    <div className="feature-icon-wrapper">
                      <i className="fas fa-bell" />
                    </div>
                    <div className="feature-content">
                      <h4>Song Notifications</h4>
                      <p>Get notified when songs change</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications?.songChanges ? 'active' : ''}`}
                      onClick={() => saveSettings({ notifications: { ...settings.notifications, songChanges: !settings.notifications?.songChanges } })}
                    >
                      <div className="toggle-slider" />
                    </div>
                  </div>
                  <div className="audio-feature-card">
                    <div className="feature-icon-wrapper">
                      <i className="fas fa-volume-up" />
                    </div>
                    <div className="feature-content">
                      <h4>Volume Boost</h4>
                      <p>{isPremium ? 'Up to 200% volume' : 'Upgrade for 200%'}</p>
                    </div>
                    <span className={`feature-badge ${isPremium ? 'active' : 'locked'}`}>
                      {isPremium ? '200%' : '🔒 Premium'}
                    </span>
                  </div>
                  <div className="audio-feature-card">
                    <div className="feature-icon-wrapper">
                      <i className="fas fa-sliders-h" />
                    </div>
                    <div className="feature-content">
                      <h4>Audio Filters</h4>
                      <p>Bassboost, Nightcore, etc</p>
                    </div>
                    <span className={`feature-badge ${isPremium ? 'active' : 'locked'}`}>
                      {isPremium ? '12 Filters' : '🔒 Premium'}
                    </span>
                  </div>
                  <div className="audio-feature-card">
                    <div className="feature-icon-wrapper">
                      <i className="fas fa-infinity" />
                    </div>
                    <div className="feature-content">
                      <h4>24/7 Mode</h4>
                      <p>Stay in voice channel forever</p>
                    </div>
                    <span className={`feature-badge ${isPremium ? 'active' : 'locked'}`}>
                      {isPremium ? 'Active' : '🔒 Premium'}
                    </span>
                  </div>
                </div>
              </div>
              {}
              <div className="equalizer-section">
                <h3 className="group-title">Equalizer Preview</h3>
                <div className="equalizer-visual">
                  <div className="eq-bars">
                    {['60Hz', '150Hz', '400Hz', '1kHz', '2.4kHz', '6kHz', '15kHz'].map((freq, i) => (
                      <div key={freq} className="eq-bar-wrapper">
                        <div 
                          className="eq-bar"
                          style={{ 
                            height: `${[70, 85, 60, 75, 90, 65, 80][i]}%`
                          }}
                        />
                        <span className="eq-label">{freq}</span>
                      </div>
                    ))}
                  </div>
                  <p className="eq-note">
                    <i className="fas fa-info-circle" />
                    Equalizer presets available via /filter command in Discord
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'premium' && (
            <div className="tab-content">
              <div className="premium-overview">
                <div className={`premium-card ${isPremium ? 'active' : ''}`}>
                  <div className="premium-card-header">
                    <i className={`fas ${isPremium ? 'fa-gem' : 'fa-lock'}`} />
                    <h3>{isPremium ? 'Premium Active' : 'Free Plan'}</h3>
                  </div>
                  <p className="premium-card-desc">
                    {isPremium
                      ? 'You have access to all premium features'
                      : 'Upgrade to unlock premium features'}
                  </p>
                  {!isPremium && (
                    <a href="/pricing" className="btn btn-primary">
                      <i className="fas fa-rocket" /> Upgrade Now
                    </a>
                  )}
                </div>
                <div className="features-list">
                  <h3>Premium Features</h3>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>HD & Ultra HD Audio Quality</span>
                  </div>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>24/7 Voice Connection</span>
                  </div>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>Auto-Play Similar Songs</span>
                  </div>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>Volume Up to 200%</span>
                  </div>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>Audio Filters (Bass Boost, Nightcore)</span>
                  </div>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>Up to 100 Playlists</span>
                  </div>
                  <div className="feature-item">
                    <i className={`fas ${isPremium ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: isPremium ? '#22c55e' : '#64748b' }} />
                    <span>500 Songs Queue Limit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'servers' && (
            <div className="tab-content">
              <div className="settings-group">
                <h3 className="group-title">Your Servers</h3>
                <p className="group-desc">Servers where you can manage the bot</p>
                {serverList.length === 0 ? (
                  <div className="empty-state small">
                    <i className="fas fa-server" />
                    <p>No manageable servers found</p>
                  </div>
                ) : (
                  <div className="server-list-settings">
                    {serverList.map(server => (
                      <div key={server.id} className="server-list-item">
                        <img
                          src={server.icon
                            ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`
                            : '/images/default-server.png'}
                          alt={server.name}
                          className="server-icon-small"
                        />
                        <span className="server-name">{server.name}</span>
                        <a href={`/dashboard`} className="btn btn-sm btn-primary">
                          Manage
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'privacy' && (
            <div className="tab-content">
              <div className="settings-group">
                <h3 className="group-title">Data & Privacy</h3>
                <p className="group-desc">Manage your personal data stored by SpaceBot</p>
                <div className="privacy-actions">
                  <div className="privacy-action-card">
                    <div className="privacy-action-info">
                      <div className="privacy-action-icon history">
                        <i className="fas fa-history" />
                      </div>
                      <div>
                        <strong>Listening History</strong>
                        <p className="setting-desc">Clear your recently played tracks</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => setConfirmAction('history')}
                    >
                      <i className="fas fa-trash" /> Clear
                    </button>
                  </div>
                  <div className="privacy-action-card">
                    <div className="privacy-action-info">
                      <div className="privacy-action-icon favorites">
                        <i className="fas fa-heart" />
                      </div>
                      <div>
                        <strong>Favorites</strong>
                        <p className="setting-desc">Remove all your favorited tracks</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => setConfirmAction('favorites')}
                    >
                      <i className="fas fa-trash" /> Clear
                    </button>
                  </div>
                  <div className="privacy-action-card danger">
                    <div className="privacy-action-info">
                      <div className="privacy-action-icon danger">
                        <i className="fas fa-exclamation-triangle" />
                      </div>
                      <div>
                        <strong>All Data</strong>
                        <p className="setting-desc">Delete all your data including settings, history, and favorites</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => setConfirmAction('all')}
                    >
                      <i className="fas fa-trash" /> Delete All
                    </button>
                  </div>
                </div>
              </div>
              {confirmAction && (
                <div className="confirm-overlay" onClick={() => setConfirmAction(null)}>
                  <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-icon">
                      <i className="fas fa-exclamation-triangle" />
                    </div>
                    <h3>Are you sure?</h3>
                    <p>
                      {confirmAction === 'all'
                        ? 'This will permanently delete ALL your data. This action cannot be undone.'
                        : `This will permanently clear your ${confirmAction}. This action cannot be undone.`}
                    </p>
                    <div className="confirm-actions">
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
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
export default Settings;
