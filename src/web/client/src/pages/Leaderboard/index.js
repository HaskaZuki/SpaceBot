import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import './Leaderboard.css';

function Leaderboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Mock leaderboard data
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, username: 'MusicLover#1234', avatar: '🎵', tracks: 15420, servers: 45, hours: 2341 },
    { rank: 2, username: 'DJMaster#5678', avatar: '🎧', tracks: 12350, servers: 38, hours: 1892 },
    { rank: 3, username: 'PartyKing#9012', avatar: '🎉', tracks: 9870, servers: 32, hours: 1567 },
    { rank: 4, username: 'BeatDropper#3456', avatar: '🔊', tracks: 8230, servers: 28, hours: 1234 },
    { rank: 5, username: 'VibeMachine#7890', avatar: '✨', tracks: 6540, servers: 24, hours: 987 },
    { rank: 6, username: 'SoundWave#2345', avatar: '🌊', tracks: 5420, servers: 21, hours: 765 },
    { rank: 7, username: 'MelodyMaker#6789', avatar: '🎼', tracks: 4310, servers: 18, hours: 654 },
    { rank: 8, username: 'RhythmRider#0123', avatar: '🏎️', tracks: 3280, servers: 15, hours: 543 },
    { rank: 9, username: 'TuneTastic#4567', avatar: '🎤', tracks: 2150, servers: 12, hours: 432 },
    { rank: 10, username: 'GrooveGuru#8901', avatar: '💫', tracks: 1890, servers: 10, hours: 321 }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <DashboardLayout>
      <div className="leaderboard-page">
        <div className="leaderboard-header">
          <h1 className="page-title">
            <i className="fas fa-trophy"></i>
            Leaderboard
          </h1>
          <p className="page-subtitle">Top SpaceBot users by total tracks played</p>
          
          <div className="time-filter">
            <button 
              className={`filter-btn ${timeFilter === 'daily' ? 'active' : ''}`}
              onClick={() => setTimeFilter('daily')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
              onClick={() => setTimeFilter('weekly')}
            >
              This Week
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeFilter('monthly')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="leaderboard-content">
          <div className="top-three">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <div key={entry.rank} className={`top-card rank-${entry.rank}`}>
                <div className="rank-badge">{getRankEmoji(entry.rank)}</div>
                <div className="avatar-large">{entry.avatar}</div>
                <div className="username">{entry.username}</div>
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-value">{entry.tracks.toLocaleString()}</span>
                    <span className="stat-label">Tracks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{entry.servers}</span>
                    <span className="stat-label">Servers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{entry.hours}h</span>
                    <span className="stat-label">Play Time</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="leaderboard-table">
            <div className="table-header">
              <span className="col-rank">Rank</span>
              <span className="col-user">User</span>
              <span className="col-tracks">Tracks</span>
              <span className="col-servers">Servers</span>
              <span className="col-hours">Play Time</span>
            </div>
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="table-row">
                <span className="col-rank">{getRankEmoji(entry.rank)}</span>
                <span className="col-user">
                  <span className="user-avatar">{entry.avatar}</span>
                  {entry.username}
                </span>
                <span className="col-tracks">{entry.tracks.toLocaleString()}</span>
                <span className="col-servers">{entry.servers}</span>
                <span className="col-hours">{entry.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Leaderboard;
