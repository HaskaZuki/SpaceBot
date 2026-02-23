import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Dashboard.css';

const languages = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'th', flag: '🇹🇭', name: 'ไทย' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' }
];

function Dashboard() {
  const { isPremium } = useAuth();
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [serverConfig, setServerConfig] = useState(null);
  const [roles, setRoles] = useState([]);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botStats, setBotStats] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    fetchServers();
    fetchBotStats();
  }, []);

  const fetchBotStats = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setBotStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/user/servers`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    }
  };

  const fetchServerConfig = async (serverId) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/guild/${serverId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setServerConfig(data.config);
        setOriginalConfig(JSON.parse(JSON.stringify(data.config)));
        setRoles(data.roles || []);
        setPendingChanges({});
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerChange = (serverId) => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Discard them?')) {
      return;
    }
    const server = serverId ? servers.find(s => s.id === serverId) : null;
    setSelectedServer(server);
    
    if (serverId && server?.hasBot) {
      fetchServerConfig(serverId);
      fetchLeaderboard(serverId);
    } else {
      setServerConfig(null);
      setPendingChanges({});
      setHasUnsavedChanges(false);
      setLeaderboard([]);
    }
  };

  const fetchLeaderboard = async (serverId) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/guild/${serverId}/leaderboard`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const trackChange = (key, value) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const cancelChanges = () => {
    if (!window.confirm('Discard all unsaved changes?')) return;
    setPendingChanges({});
    setHasUnsavedChanges(false);
    if (originalConfig) {
      setServerConfig(JSON.parse(JSON.stringify(originalConfig)));
    }
  };

  const saveChanges = async () => {
    if (!selectedServer || Object.keys(pendingChanges).length === 0) return;
    
    setSaveStatus('saving');
    try {
      const res = await fetch(`${config.apiUrl}/api/guild/${selectedServer.id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pendingChanges)
      });
      
      if (res.ok) {
        const data = await res.json();
        setServerConfig(data.config);
        setOriginalConfig(JSON.parse(JSON.stringify(data.config)));
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const getValue = (key, defaultValue) => {
    if (pendingChanges.hasOwnProperty(key)) return pendingChanges[key];
    return serverConfig?.[key] ?? defaultValue;
  };

  const formatUptime = (ms) => {
    if (!ms) return '--';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000) % 24;
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };

  const guildIsPremium = serverConfig?.isPremium || false;

  return (
    <DashboardLayout title="🏠 Dashboard">
      <div className="dashboard-content">
        {botStats && (
          <div className="quick-stats-row">
            <div className="quick-stat">
              <i className="fas fa-server" />
              <div>
                <span className="qs-value">{botStats.servers?.toLocaleString() || '0'}</span>
                <span className="qs-label">Servers</span>
              </div>
            </div>
            <div className="quick-stat">
              <i className="fas fa-users" />
              <div>
                <span className="qs-value">{botStats.users?.toLocaleString() || '0'}</span>
                <span className="qs-label">Users</span>
              </div>
            </div>
            <div className="quick-stat">
              <i className="fas fa-terminal" />
              <div>
                <span className="qs-value">{botStats.commands || '0'}</span>
                <span className="qs-label">Commands</span>
              </div>
            </div>
            <div className="quick-stat">
              <i className="fas fa-clock" />
              <div>
                <span className="qs-value">{formatUptime(botStats.uptime)}</span>
                <span className="qs-label">Uptime</span>
              </div>
            </div>
          </div>
        )}

        <div className="server-select-card">
          <h2 className="card-title">
            <i className="fas fa-server" />
            Select Server
          </h2>
          <select
            className="server-select"
            value={selectedServer?.id || ''}
            onChange={(e) => handleServerChange(e.target.value)}
          >
            <option value="">Choose a server to manage...</option>
            {servers.map(server => (
              <option key={server.id} value={server.id}>
                {server.name} {!server.hasBot ? '(Bot not added)' : ''}
              </option>
            ))}
          </select>
          <p className="server-hint">
            Only servers where you have Administrator permission are shown
          </p>
        </div>

        {!selectedServer && (
          <div className="server-select-card">
            <div className="empty-state">
              <i className="fas fa-arrow-up" />
              <h3>Select a Server</h3>
              <p>Choose a server from the dropdown above to manage its settings</p>
            </div>
          </div>
        )}

        {selectedServer && !selectedServer.hasBot && (
          <div className="server-select-card">
            <div className="empty-state">
              <i className="fas fa-robot" />
              <h3>Bot Not in Server</h3>
              <p>SpaceBot hasn't been added to {selectedServer.name} yet.</p>
              <a 
                href={`https://discord.com/oauth2/authorize?client_id=${process.env.REACT_APP_CLIENT_ID || 'YOUR_CLIENT_ID'}&permissions=36768800&scope=bot%20applications.commands&guild_id=${selectedServer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="add-bot-btn"
              >
                <i className="fas fa-plus" /> Add SpaceBot to {selectedServer.name}
              </a>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        )}

        {selectedServer && serverConfig && !loading && (
          <>
            <div className="server-header-card">
              <div>
                <h3>
                  <i className="fas fa-cog" />
                  <span>{selectedServer.name} Settings</span>
                </h3>
                <p>Configure bot behavior for this server</p>
              </div>
              <div className="server-badges">
                {guildIsPremium ? (
                  <div className="premium-badge">
                    <i className="fas fa-crown" /> Premium Active
                  </div>
                ) : (
                  <div className="free-badge">
                    <i className="fas fa-cube" /> Free Tier
                  </div>
                )}
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-user-shield" /></div>
                  <div className="setting-title">DJ Role</div>
                </div>
                <p className="setting-description">
                  Role required to use DJ commands (skip, pause, clear).
                </p>
                <select
                  value={getValue('djRoleId', '')}
                  onChange={(e) => trackChange('djRoleId', e.target.value)}
                >
                  <option value="">No DJ Role (Everyone)</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-list-ol" /></div>
                  <div className="setting-title">Queue Limit</div>
                </div>
                <p className="setting-description">
                  Max songs per user in queue (0 = unlimited).
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={getValue('maxSongCount', 0)}
                  onChange={(e) => trackChange('maxSongCount', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-language" /></div>
                  <div className="setting-title">Language</div>
                </div>
                <p className="setting-description">
                  Bot response language.
                </p>
                <select
                  value={getValue('language', 'en')}
                  onChange={(e) => trackChange('language', e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                  ))}
                </select>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-bullhorn" /></div>
                  <div className="setting-title">Announce Songs</div>
                </div>
                <p className="setting-description">
                  Send a message when a new song starts playing.
                </p>
                <div className="toggle-row">
                  <span className="toggle-label">Enable Announcements</span>
                  <div
                    className={`toggle-switch ${getValue('announceSongs', false) ? 'active' : ''}`}
                    onClick={() => trackChange('announceSongs', !getValue('announceSongs', false))}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-user-tag" /></div>
                  <div className="setting-title">Show Requester</div>
                </div>
                <p className="setting-description">
                  Display who requested the song in embeds.
                </p>
                <div className="toggle-row">
                  <span className="toggle-label">Show Requester Info</span>
                  <div
                    className={`toggle-switch ${getValue('showRequester', true) ? 'active' : ''}`}
                    onClick={() => trackChange('showRequester', !getValue('showRequester', true))}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-stream" /></div>
                  <div className="setting-title">Allow Playlists</div>
                </div>
                <p className="setting-description">
                  Allow users to add entire playlists to queue.
                </p>
                <div className="toggle-row">
                  <span className="toggle-label">Enable Playlists</span>
                  <div
                    className={`toggle-switch ${getValue('allowPlaylists', true) ? 'active' : ''}`}
                    onClick={() => trackChange('allowPlaylists', !getValue('allowPlaylists', true))}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
              </div>

              <div className={`setting-card ${guildIsPremium ? '' : 'premium-locked'}`}>
                <div className="setting-header">
                  <div className="setting-icon premium"><i className="fas fa-infinity" /></div>
                  <div className="setting-title">24/7 Mode</div>
                  {!guildIsPremium && <span className="premium-tag">PREMIUM</span>}
                </div>
                <p className="setting-description">
                  Stay connected to voice channel 24/7.
                </p>
                <div className="toggle-row">
                  <span className="toggle-label">Enable 24/7</span>
                  <div
                    className={`toggle-switch ${getValue('alwaysOn', false) ? 'active' : ''} ${!guildIsPremium ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!guildIsPremium) return;
                      trackChange('alwaysOn', !getValue('alwaysOn', false));
                    }}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
              </div>

              <div className={`setting-card ${guildIsPremium ? '' : 'premium-locked'}`}>
                <div className="setting-header">
                  <div className="setting-icon premium"><i className="fas fa-magic" /></div>
                  <div className="setting-title">Auto-Play</div>
                  {!guildIsPremium && <span className="premium-tag">PREMIUM</span>}
                </div>
                <p className="setting-description">
                  Automatically play similar songs when queue ends.
                </p>
                <div className="toggle-row">
                  <span className="toggle-label">Enable Auto-Play</span>
                  <div
                    className={`toggle-switch ${getValue('autoPlay', false) ? 'active' : ''} ${!guildIsPremium ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!guildIsPremium) return;
                      trackChange('autoPlay', !getValue('autoPlay', false));
                    }}
                  >
                    <div className="toggle-slider" />
                  </div>
                </div>
              </div>

              <div className={`setting-card ${guildIsPremium ? '' : 'premium-locked'}`}>
                <div className="setting-header">
                  <div className="setting-icon premium"><i className="fas fa-volume-up" /></div>
                  <div className="setting-title">Default Volume</div>
                  {!guildIsPremium && <span className="premium-tag">PREMIUM</span>}
                </div>
                <p className="setting-description">
                  Set the default volume level (1-200%).
                </p>
                <input
                  type="number"
                  min="1"
                  max="200"
                  disabled={!guildIsPremium}
                  value={getValue('volume', 100)}
                  onChange={(e) => trackChange('volume', parseInt(e.target.value) || 100)}
                />
              </div>

              {!guildIsPremium && (
                <div className="setting-card upgrade-card">
                  <div className="setting-header">
                    <div className="setting-icon premium"><i className="fas fa-crown" /></div>
                    <div className="setting-title">Upgrade Server</div>
                  </div>
                  <p className="setting-description">
                    Unlock 24/7 mode, auto-play, volume control, and more for this server!
                  </p>
                  <div className="premium-plan-display">
                    <div className="premium-plan-label">Current Plan</div>
                    <div className="premium-plan-value">Free</div>
                  </div>
                  <a href="/pricing" className="btn btn-primary">
                    <i className="fas fa-rocket" /> Upgrade to Premium
                  </a>
                </div>
              )}
            </div>

            <div className="leaderboard-section">
              <div className="setting-card leaderboard-card">
                <div className="setting-header">
                  <div className="setting-icon"><i className="fas fa-trophy" /></div>
                  <div className="setting-title">Server Leaderboard</div>
                </div>
                <p className="setting-description">
                  Top listeners in this server based on play history.
                </p>
                {loadingLeaderboard ? (
                  <div className="loading-container">
                    <div className="spinner" />
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="leaderboard-list">
                    {leaderboard.map((entry) => (
                      <div key={entry.userId} className={`leaderboard-entry rank-${entry.rank}`}>
                        <div className="leaderboard-rank">
                          {entry.rank <= 3 ? (
                            <span className={`medal medal-${entry.rank}`}>
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="rank-number">{entry.rank}</span>
                          )}
                        </div>
                        <div className="leaderboard-user">
                          <img 
                            src={entry.avatar ? `https://cdn.discordapp.com/avatars/${entry.userId}/${entry.avatar}.png?size=32` : `https://cdn.discordapp.com/embed/avatars/0.png`} 
                            alt="avatar"
                            className="leaderboard-avatar"
                          />
                          <span className="leaderboard-username">{entry.username}</span>
                        </div>
                        <div className="leaderboard-stats">
                          <span className="track-count">{entry.trackCount.toLocaleString()} tracks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <i className="fas fa-music" />
                    <p>No play history yet for this server</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {hasUnsavedChanges && (
          <div className="unsaved-bar show">
            <div className="unsaved-message">
              <i className="fas fa-exclamation-triangle unsaved-icon" />
              <span>Careful — you have unsaved changes!</span>
            </div>
            <div className="unsaved-actions">
              <button className="btn-cancel" onClick={cancelChanges}>Cancel</button>
              <button className="btn-save-changes" onClick={saveChanges}>
                {saveStatus === 'saving' ? (
                  <><i className="fas fa-spinner fa-spin" /> Saving...</>
                ) : saveStatus === 'saved' ? (
                  <><i className="fas fa-check" /> Saved!</>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
