import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config';
import Footer from '../../components/Footer';
import './Status.css';
function Status() {
  const [shardData, setShardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  useEffect(() => {
    const fetchShardData = () => {
      fetch(`${config.apiUrl}/api/shards`)
        .then(res => res.json())
        .then(data => {
          setShardData(data);
          setLoading(false);
          setLastUpdated(new Date());
        })
        .catch(err => {
          console.error('Failed to fetch shard data:', err);
          setLoading(false);
        });
    };
    fetchShardData();
    const interval = setInterval(fetchShardData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);
  const formatUptime = (ms) => {
    if (!ms) return '--';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000) % 24;
    const minutes = Math.floor(ms / 60000) % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  const getShardStatusColor = (shard) => {
    if (!shard.ready) return '#ef4444'; // Red - offline/disconnected
    if (shard.ping > 200) return '#f59e0b'; // Orange - high latency
    return '#22c55e'; // Green - healthy
  };
  const getShardStatusText = (shard) => {
    if (!shard.ready) return 'Offline';
    if (shard.ping > 200) return 'Degraded';
    return 'Online';
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'degraded': return '#f59e0b';
      case 'outage': return '#ef4444';
      default: return '#6b7280';
    }
  };
  const getOverallStatus = () => {
    if (!shardData) return { status: 'unknown', text: 'Unknown', color: '#6b7280' };
    if (shardData.onlineShards === 0) return { status: 'outage', text: 'Major Outage', color: '#ef4444' };
    if (shardData.onlineShards < shardData.totalShards) return { status: 'degraded', text: 'Partial Outage', color: '#f59e0b' };
    if (shardData.avgPing > 200) return { status: 'degraded', text: 'Degraded Performance', color: '#f59e0b' };
    return { status: 'operational', text: 'All Systems Operational', color: '#22c55e' };
  };
  const overall = getOverallStatus();
  return (
    <div className="status-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><span>SpaceBot</span></Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/commands" className="nav-link">Commands</Link>
            <Link to="/status" className="nav-link active">Status</Link>
            <a href={`${config.apiUrl}/auth/discord`} className="nav-btn"><i className="fab fa-discord" /> Dashboard</a>
          </div>
        </div>
      </nav>
      <div className="status-content">
        {}
        <div className="status-header">
          <h1>System Status</h1>
          <p>Real-time status and performance metrics for SpaceBot</p>
        </div>
        {}
        <div className={`status-banner ${overall.status}`}>
          <div className="status-banner-icon">
            {overall.status === 'operational' ? (
              <i className="fas fa-check-circle"></i>
            ) : overall.status === 'degraded' ? (
              <i className="fas fa-exclamation-triangle"></i>
            ) : (
              <i className="fas fa-times-circle"></i>
            )}
          </div>
          <div className="status-banner-text">
            <h2>{overall.text}</h2>
            <p>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}</p>
          </div>
        </div>
        {loading && !shardData ? (
          <div className="status-loading">
            <div className="loading-spinner"></div>
            <p>Loading status information...</p>
          </div>
        ) : shardData ? (
          <>
            {}
            <div className="status-summary">
              <div className="summary-card">
                <div className="summary-icon servers">
                  <i className="fas fa-server"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-value">{shardData.totalGuilds?.toLocaleString()}</span>
                  <span className="summary-label">Total Servers</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon shards">
                  <i className="fas fa-cubes"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-value">{shardData.totalShards}</span>
                  <span className="summary-label">Total Shards</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon online">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-value online">{shardData.onlineShards}</span>
                  <span className="summary-label">Shards Online</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon ping">
                  <i className="fas fa-signal"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-value">{shardData.avgPing}ms</span>
                  <span className="summary-label">Avg Latency</span>
                </div>
              </div>
            </div>
            {}
            <div className="services-section">
              <h3>Services</h3>
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor('operational') }}></div>
                  <div className="service-info">
                    <span className="service-name">Discord Gateway</span>
                    <span className="service-status">Operational</span>
                  </div>
                </div>
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor(shardData.lavalink ? 'operational' : 'outage') }}></div>
                  <div className="service-info">
                    <span className="service-name">Lavalink</span>
                    <span className="service-status">{shardData.lavalink ? 'Operational' : 'Outage'}</span>
                  </div>
                </div>
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor(shardData.database ? 'operational' : 'outage') }}></div>
                  <div className="service-info">
                    <span className="service-name">Database</span>
                    <span className="service-status">{shardData.database ? 'Operational' : 'Outage'}</span>
                  </div>
                </div>
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor('operational') }}></div>
                  <div className="service-info">
                    <span className="service-name">Web Dashboard</span>
                    <span className="service-status">Operational</span>
                  </div>
                </div>
              </div>
            </div>
            {}
            <div className="shards-section">
              <h3>Shard Status</h3>
              <p className="shards-description">Each shard handles a portion of servers. Hover over a shard to see details.</p>
              <div className="shard-grid">
                {shardData.shards.map((shard) => (
                  <div 
                    key={shard.id}
                    className={`shard-card ${!shard.ready ? 'offline' : shard.ping > 200 ? 'degraded' : 'online'}`}
                  >
                    <div className="shard-card-header">
                      <span className="shard-id">Shard #{shard.id}</span>
                      <span className="shard-status-badge" style={{ background: getShardStatusColor(shard) }}>
                        {getShardStatusText(shard)}
                      </span>
                    </div>
                    <div className="shard-metrics">
                      <div className="shard-metric">
                        <i className="fas fa-signal"></i>
                        <span className="metric-value">{shard.ping || 0}ms</span>
                        <span className="metric-label">Ping</span>
                      </div>
                      <div className="shard-metric">
                        <i className="fas fa-server"></i>
                        <span className="metric-value">{shard.guilds?.toLocaleString()}</span>
                        <span className="metric-label">Servers</span>
                      </div>
                      <div className="shard-metric">
                        <i className="fas fa-clock"></i>
                        <span className="metric-value">{formatUptime(shard.uptime)}</span>
                        <span className="metric-label">Uptime</span>
                      </div>
                      <div className="shard-metric">
                        <i className="fas fa-users"></i>
                        <span className="metric-value">{shard.users?.toLocaleString()}</span>
                        <span className="metric-label">Users</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {}
            <div className="status-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#22c55e' }}></span>
                <span>Online - All systems normal</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                <span>Degraded - High latency or partial issues</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                <span>Offline - Shard disconnected</span>
              </div>
            </div>
          </>
        ) : (
          <div className="status-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>Failed to load status information. Please try again later.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
export default Status;
