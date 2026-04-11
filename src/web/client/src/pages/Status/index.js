import React, { useState, useEffect } from 'react';
import config from '../../config';
import Footer from '../../components/Footer';
import PublicNav from '../../components/PublicNav/PublicNav';
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
        .catch(() => setLoading(false));
    };

    fetchShardData();
    const interval = setInterval(fetchShardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms) => {
    if (!ms) return '--';
    const weeks = Math.floor(ms / 604800000);
    const days = Math.floor(ms / 86400000) % 7;
    const hours = Math.floor(ms / 3600000) % 24;
    const minutes = Math.floor(ms / 60000) % 60;
    const seconds = Math.floor(ms / 1000) % 60;
    const parts = [];
    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const getShardColor = (shard) => {
    if (!shard.ready) return '#ef4444';
    if (shard.ping > 400) return '#f59e0b';
    return '#22c55e';
  };

  const getShardLabel = (shard) => {
    if (!shard.ready) return 'Offline';
    if (shard.ping > 400) return 'Degraded';
    return 'Online';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'partial': return '#f59e0b';
      case 'outage': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOverallStatus = () => {
    if (!shardData) return { status: 'unknown', text: 'Unknown' };
    if (shardData.onlineShards === 0) return { status: 'outage', text: 'Major Outage' };
    if (shardData.onlineShards < shardData.totalShards) return { status: 'degraded', text: 'Partial Outage' };
    if (shardData.avgPing > 400) return { status: 'degraded', text: 'Degraded Performance' };
    return { status: 'operational', text: 'All Systems Operational' };
  };

  const overall = getOverallStatus();

  const gatewayStatus = shardData
    ? shardData.onlineShards === shardData.totalShards ? 'operational'
      : shardData.onlineShards > 0 ? 'partial' : 'outage'
    : 'operational';

  const gatewayLabel = shardData
    ? shardData.onlineShards === shardData.totalShards ? 'Operational'
      : shardData.onlineShards > 0 ? `Partial (${shardData.onlineShards}/${shardData.totalShards})` : 'Outage'
    : 'Operational';

  return (
    <div className="status-page">
      <PublicNav />

      <div className="status-content">
        <div className="status-header">
          <h1>Status</h1>
          <p className="status-autoupdate">This page auto-updates every 15 seconds.</p>
        </div>

        <div className={`status-banner ${overall.status}`}>
          <div className="status-banner-icon">
            {overall.status === 'operational'
              ? <i className="fas fa-check-circle" />
              : overall.status === 'degraded'
                ? <i className="fas fa-exclamation-triangle" />
                : <i className="fas fa-times-circle" />}
          </div>
          <div className="status-banner-text">
            <h2>{overall.text}</h2>
            <p>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}</p>
          </div>
        </div>

        {loading && !shardData ? (
          <div className="status-loading">
            <div className="loading-spinner" />
            <p>Loading status information...</p>
          </div>
        ) : shardData ? (
          <>
            <div className="status-summary">
              <div className="summary-card">
                <div className="summary-icon servers"><i className="fas fa-server" /></div>
                <div className="summary-info">
                  <span className="summary-value">{shardData.totalGuilds?.toLocaleString()}</span>
                  <span className="summary-label">Total Servers</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon shards"><i className="fas fa-cubes" /></div>
                <div className="summary-info">
                  <span className="summary-value">{shardData.onlineShards}/{shardData.totalShards}</span>
                  <span className="summary-label">Shards Online</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon ping"><i className="fas fa-signal" /></div>
                <div className="summary-info">
                  <span className="summary-value">{shardData.avgPing}ms</span>
                  <span className="summary-label">Avg Latency</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon online"><i className="fas fa-headphones" /></div>
                <div className="summary-info">
                  <span className="summary-value online">
                    {typeof shardData.totalVoice === 'number' ? shardData.totalVoice.toLocaleString() : '--'}
                  </span>
                  <span className="summary-label">Voice Active</span>
                </div>
              </div>
            </div>

            <div className="services-section">
              <h3>Availability per service</h3>
              <div className="services-legend">
                <span><span className="legend-dot-sm" style={{ background: '#22c55e' }} />Operational</span>
                <span><span className="legend-dot-sm" style={{ background: '#f59e0b' }} />Partial Outage</span>
                <span><span className="legend-dot-sm" style={{ background: '#ef4444' }} />Major Outage</span>
              </div>
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor(gatewayStatus) }} />
                  <div className="service-info">
                    <span className="service-name">Discord Gateway</span>
                    <span className="service-status">{gatewayLabel}</span>
                  </div>
                </div>
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor(shardData.lavalink ? 'operational' : 'outage') }} />
                  <div className="service-info">
                    <span className="service-name">Lavalink</span>
                    <span className="service-status">{shardData.lavalink ? 'Operational' : 'Outage'}</span>
                  </div>
                </div>
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor(shardData.database ? 'operational' : 'outage') }} />
                  <div className="service-info">
                    <span className="service-name">Database</span>
                    <span className="service-status">{shardData.database ? 'Operational' : 'Outage'}</span>
                  </div>
                </div>
                <div className="service-card">
                  <div className="service-status-dot" style={{ background: getStatusColor('operational') }} />
                  <div className="service-info">
                    <span className="service-name">Web Dashboard</span>
                    <span className="service-status">Operational</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shards-section">
              <h3>Shard Status</h3>
              <p className="shards-description">Each shard handles a portion of servers. Hover over a shard to see details.</p>
              <div className="shard-dots-grid">
                {shardData.shards.map((shard) => (
                  <div
                    key={shard.id}
                    className="shard-dot-wrap"
                  >
                    <div
                      className="shard-dot"
                      style={{ background: getShardColor(shard) }}
                    >
                      {shard.id}
                    </div>
                    <div className="shard-hover-card">
                      <div className="shc-header">
                        <span className="shc-dot" style={{ background: getShardColor(shard) }} />
                        <strong>Shard #{shard.id}</strong>
                        <span className="shc-badge" style={{ color: getShardColor(shard) }}>{getShardLabel(shard)}</span>
                      </div>
                      <div className="shc-row"><span>Ping</span><span>{shard.ping || 0}ms</span></div>
                      <div className="shc-row"><span>Servers</span><span>{shard.guilds?.toLocaleString() ?? '--'}</span></div>
                      <div className="shc-row"><span>Users</span><span>{shard.users?.toLocaleString() ?? '--'}</span></div>
                      <div className="shc-row"><span>Uptime</span><span>{formatUptime(shard.uptime)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="status-legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} /><span>Online — All systems normal</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /><span>Degraded — High latency or partial issues</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /><span>Offline — Shard disconnected</span></div>
            </div>
          </>
        ) : (
          <div className="status-error">
            <i className="fas fa-exclamation-circle" />
            <p>Failed to load status information. Please try again later.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Status;
