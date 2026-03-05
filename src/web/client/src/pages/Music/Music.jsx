import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import config from '../../config';
import './Music.css';
function Music() {
  const { isPremium } = useAuth();
  const { playerState, joinGuild, playPause, skip, previous, seek, setVolume, addToQueue, clearQueue, shuffle, toggleLoop, connected } = useSocket();
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loopActive, setLoopActive] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  useEffect(() => {
    fetchServers();
    if (isPremium) fetchHistory();
  }, []);
  useEffect(() => {
    if (selectedServer) {
      joinGuild(selectedServer);
    }
  }, [selectedServer, joinGuild]);
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
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/user/analytics`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setRecentlyPlayed(data.recentlyPlayed || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };
  const handleServerChange = (serverId) => {
    setSelectedServer(serverId);
  };
  const handlePlaySong = () => {
    if (searchQuery.trim()) {
      addToQueue(searchQuery.trim());
      setSearchQuery('');
    }
  };
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const position = Math.floor(percent * playerState.duration);
    seek(position);
  };
  const handleVolumeChange = (newVolume) => {
    if (!isPremium && newVolume > 100) {
      return;
    }
    setVolume(parseInt(newVolume));
  };
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const progressPercent = playerState.duration > 0 ? (playerState.progress / playerState.duration) * 100 : 0;
  return (
    <DashboardLayout title="Music Player">
      <div className="music-content">
        <div className="server-selector">
          <label className="server-label">Select Server</label>
          <select
            className="server-select"
            value={selectedServer}
            onChange={(e) => handleServerChange(e.target.value)}
          >
            <option value="">Select a server...</option>
            {servers.map(server => (
              <option key={server.id} value={server.id}>{server.name}</option>
            ))}
          </select>
          <div className="connection-status">
            <span className={`status-dot ${connected ? 'connected' : ''}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        {playerState.currentTrack ? (
          <div className="now-playing-hero">
            <div className="now-playing-content">
              <img
                src={playerState.currentTrack.thumbnail || '/images/default-album.png'}
                alt="Album Art"
                className="album-art-large"
              />
              <div className="track-info-large">
                <h1>{playerState.currentTrack.title || 'No track playing'}</h1>
                <p>{playerState.currentTrack.author || 'Add songs to get started'}</p>
                <div className="player-controls-hero">
                  <button className="control-btn-hero" onClick={shuffle} title="Shuffle">
                    <i className="fas fa-shuffle" />
                  </button>
                  <button className="control-btn-hero" onClick={previous} title="Previous">
                    <i className="fas fa-backward-step" />
                  </button>
                  <button className="control-btn-hero play-btn" onClick={playPause}
                    title={playerState.isPlaying ? 'Pause' : 'Play'}>
                    <i className={`fas ${playerState.isPlaying ? 'fa-pause' : 'fa-play'}`} />
                  </button>
                  <button className="control-btn-hero" onClick={skip} title="Skip">
                    <i className="fas fa-forward-step" />
                  </button>
                  <button
                    className={`control-btn-hero ${loopActive ? 'active' : ''}`}
                    onClick={() => { setLoopActive(!loopActive); toggleLoop(); }}
                    title="Loop"
                  >
                    <i className="fas fa-repeat" />
                  </button>
                </div>
                <div className="progress-bar-hero">
                  <div className="progress-track" onClick={handleSeek}>
                    <div className="progress-fill-hero" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="time-labels">
                    <span>{formatTime(playerState.progress)}</span>
                    <span>{formatTime(playerState.duration)}</span>
                  </div>
                </div>
                <div className="volume-control">
                  <i className="fas fa-volume-low volume-icon" />
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max={isPremium ? 200 : 100}
                    value={playerState.volume}
                    onChange={(e) => handleVolumeChange(e.target.value)}
                  />
                  <span className="volume-label">{playerState.volume}%</span>
                  {!isPremium && (
                    <span className="volume-premium-hint" title="Upgrade for 200% volume">
                      <i className="fas fa-lock" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-track-hero">
            <div className="no-track-content">
              <i className="fas fa-music" />
              <h2>No Track Playing</h2>
              <p>Select a server and add songs to start listening</p>
            </div>
          </div>
        )}
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a song or paste URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlaySong()}
          />
          <button className="btn btn-primary" onClick={handlePlaySong}>
            <i className="fas fa-plus" /> Add
          </button>
        </div>
        <div className="quick-actions">
          <button className="action-btn" onClick={shuffle}>
            <i className="fas fa-shuffle" /> Shuffle
          </button>
          <button className="action-btn" onClick={clearQueue}>
            <i className="fas fa-trash" /> Clear Queue
          </button>
          {isPremium && (
            <button className="action-btn premium-action">
              <i className="fas fa-sliders-h" /> Filters
            </button>
          )}
          {!isPremium && (
            <a href="/pricing" className="action-btn premium-locked-btn">
              <i className="fas fa-crown" /> Premium Features
            </a>
          )}
        </div>
        <div className="section-header">
          <h2 className="section-title">Queue</h2>
          <span className="badge">{playerState.queue?.length || 0} tracks</span>
        </div>
        <div className="queue-section">
          {playerState.queue && playerState.queue.length > 0 ? (
            <div className="queue-list">
              {playerState.queue.map((track, index) => (
                <div key={index} className="queue-item">
                  <span className="queue-num">{index + 1}</span>
                  <img
                    src={track.thumbnail || '/images/default-album.png'}
                    alt={track.title}
                    className="queue-item-art"
                  />
                  <div className="queue-item-info">
                    <div className="queue-item-title">{track.title}</div>
                    <div className="queue-item-artist">{track.author}</div>
                  </div>
                  <span className="queue-item-duration">{formatTime(track.duration)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="queue-empty">
              <i className="fas fa-music" />
              <p>No songs in queue</p>
              <p className="queue-hint">Search above to add music</p>
            </div>
          )}
        </div>
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-history" style={{ marginRight: '0.5rem', opacity: 0.7 }} />
            Listening History
          </h2>
          {isPremium && <span className="badge">{recentlyPlayed.length} tracks</span>}
          {!isPremium && <span className="badge premium-badge-sm"><i className="fas fa-crown" style={{ marginRight: '0.3rem' }} /> Premium</span>}
        </div>
        {isPremium ? (
          <div className="queue-section history-section">
            {recentlyPlayed.length > 0 ? (
              <div className="queue-list">
                {recentlyPlayed.slice(0, 10).map((track, index) => (
                  <div key={index} className="queue-item history-item">
                    <span className="queue-num">{index + 1}</span>
                    <div className="queue-item-info">
                      <div className="queue-item-title">{track.title || 'Unknown Track'}</div>
                      <div className="queue-item-artist">{track.author || 'Unknown Artist'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="queue-empty">
                <i className="fas fa-history" />
                <p>No listening history yet</p>
                <p className="queue-hint">Start playing music to build your history</p>
              </div>
            )}
          </div>
        ) : (
          <div className="queue-section history-locked">
            <div className="history-locked-content">
              <i className="fas fa-lock" />
              <h3>Premium Feature</h3>
              <p>Upgrade to Premium to view your listening history</p>
              <a href="/pricing" className="btn btn-primary">
                <i className="fas fa-crown" /> Upgrade Now
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
export default Music;
