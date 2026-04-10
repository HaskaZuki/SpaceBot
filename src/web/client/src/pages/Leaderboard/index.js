import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import config from '../../config';
import './Leaderboard.css';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_LABELS = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const [servers, setServers] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [selectedServerName, setSelectedServerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingServers, setLoadingServers] = useState(true);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/user/servers`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const botServers = data.filter(s => s.hasBot);
        setServers(botServers);
        // Auto-select first server if exists
        if (botServers.length > 0) {
          setSelectedServerId(botServers[0].id);
          setSelectedServerName(botServers[0].name);
          fetchLeaderboard(botServers[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch servers:', err);
    } finally {
      setLoadingServers(false);
    }
  };

  const fetchLeaderboard = async (serverId) => {
    setLoading(true);
    setLeaderboard([]);
    try {
      const res = await fetch(`${config.apiUrl}/api/guild/${serverId}/leaderboard`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServerChange = (serverId) => {
    const server = servers.find(s => s.id === serverId);
    setSelectedServerId(serverId);
    setSelectedServerName(server?.name || '');
    if (serverId) fetchLeaderboard(serverId);
  };

  const formatDuration = (ms) => {
    if (!ms) return '0m';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getAvatarUrl = (userId, avatar) => {
    if (avatar) return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`;
    const defaultIndex = parseInt(userId) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <DashboardLayout title="Leaderboard">
      <div className="lb-page">

        {/* Header */}
        <div className="lb-header">
          <div className="lb-title-row">
            <div className="lb-title-icon">
              <i className="fas fa-trophy" />
            </div>
            <div>
              <h1>Server Leaderboard</h1>
              <p>Top listeners ranked by tracks played</p>
            </div>
          </div>

          {/* Server selector */}
          {loadingServers ? (
            <div className="lb-server-loading"><div className="lb-spinner" /></div>
          ) : servers.length > 0 ? (
            <div className="lb-server-select-wrap">
              <i className="fas fa-server" />
              <select
                className="lb-server-select"
                value={selectedServerId}
                onChange={e => handleServerChange(e.target.value)}
              >
                {servers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="lb-no-servers">
              <i className="fas fa-exclamation-circle" />
              No servers with SpaceBot found
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="lb-loading">
            <div className="lb-spinner" />
            <span>Loading leaderboard...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="lb-empty">
            <div className="lb-empty-icon">
              <i className="fas fa-music" />
            </div>
            <h3>No data yet</h3>
            <p>Start playing music in <strong>{selectedServerName}</strong> to see the leaderboard</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="lb-podium">
                {/* 2nd place */}
                {top3[1] && (
                  <div className="podium-card rank-2">
                    <div className="podium-avatar-wrap">
                      <img
                        src={getAvatarUrl(top3[1].userId, top3[1].avatar)}
                        alt={top3[1].username}
                        className="podium-avatar"
                        onError={e => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                      />
                      <div className="podium-medal" style={{ background: RANK_COLORS[1] }}>2</div>
                    </div>
                    <div className="podium-name">{top3[1].username}</div>
                    <div className="podium-tracks">{top3[1].trackCount.toLocaleString()} tracks</div>
                    <div className="podium-time">{formatDuration(top3[1].totalDuration)}</div>
                    <div className="podium-bar rank-2-bar" />
                  </div>
                )}
                {/* 1st place */}
                {top3[0] && (
                  <div className="podium-card rank-1">
                    <div className="podium-crown"><i className="fas fa-crown" /></div>
                    <div className="podium-avatar-wrap">
                      <img
                        src={getAvatarUrl(top3[0].userId, top3[0].avatar)}
                        alt={top3[0].username}
                        className="podium-avatar large"
                        onError={e => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                      />
                      <div className="podium-medal" style={{ background: RANK_COLORS[0] }}>1</div>
                    </div>
                    <div className="podium-name">{top3[0].username}</div>
                    <div className="podium-tracks">{top3[0].trackCount.toLocaleString()} tracks</div>
                    <div className="podium-time">{formatDuration(top3[0].totalDuration)}</div>
                    <div className="podium-bar rank-1-bar" />
                  </div>
                )}
                {/* 3rd place */}
                {top3[2] && (
                  <div className="podium-card rank-3">
                    <div className="podium-avatar-wrap">
                      <img
                        src={getAvatarUrl(top3[2].userId, top3[2].avatar)}
                        alt={top3[2].username}
                        className="podium-avatar"
                        onError={e => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                      />
                      <div className="podium-medal" style={{ background: RANK_COLORS[2] }}>3</div>
                    </div>
                    <div className="podium-name">{top3[2].username}</div>
                    <div className="podium-tracks">{top3[2].trackCount.toLocaleString()} tracks</div>
                    <div className="podium-time">{formatDuration(top3[2].totalDuration)}</div>
                    <div className="podium-bar rank-3-bar" />
                  </div>
                )}
              </div>
            )}

            {/* 4-10 list */}
            {rest.length > 0 && (
              <div className="lb-list">
                {rest.map((entry) => {
                  const pct = leaderboard[0]?.trackCount ? Math.round((entry.trackCount / leaderboard[0].trackCount) * 100) : 0;
                  return (
                    <div key={entry.userId} className="lb-row">
                      <div className="lb-rank">#{entry.rank}</div>
                      <img
                        src={getAvatarUrl(entry.userId, entry.avatar)}
                        alt={entry.username}
                        className="lb-avatar"
                        onError={e => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                      />
                      <div className="lb-user-info">
                        <div className="lb-username">{entry.username}</div>
                        <div className="lb-progress-bar">
                          <div className="lb-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="lb-stats">
                        <span className="lb-tracks">{entry.trackCount.toLocaleString()}</span>
                        <span className="lb-track-label">tracks</span>
                      </div>
                      <div className="lb-duration">{formatDuration(entry.totalDuration)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Leaderboard;
