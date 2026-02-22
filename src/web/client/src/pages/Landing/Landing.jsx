import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config';
import './Landing.css';

const features = [
  {
    icon: 'fa-music',
    color: 'red',
    title: '🎵 Crystal Clear Audio',
    desc: 'High-quality streaming from YouTube, Spotify, SoundCloud, and more via Lavalink technology.'
  },
  {
    icon: 'fa-sliders',
    color: 'purple',
    title: 'Audio Filters',
    desc: 'Bass boost, nightcore, 8D audio, vaporwave, karaoke, and more — transform any track instantly.'
  },
  {
    icon: 'fa-list-check',
    color: 'blue',
    title: 'Smart Queue',
    desc: 'Advanced queue with shuffle, loop, jump, search, and automatic playlist loading support.'
  },
  {
    icon: 'fa-display',
    color: 'green',
    title: 'Web Dashboard',
    desc: 'Apple Music-inspired web interface to search songs, control playback, and manage your server.'
  },
  {
    icon: 'fa-heart',
    color: 'gold',
    title: 'Favorites & Playlists',
    desc: 'Create personal playlists, save favorites, and export collections for easy sharing.'
  },
  {
    icon: 'fa-chart-bar',
    color: 'red',
    title: 'Stats & Analytics',
    desc: 'Track listening history, see top songs and artists, and share your music stats with friends.'
  }
];

const commands = [
  { name: '/play', desc: 'Play any song from YouTube, Spotify, or direct URL' },
  { name: '/search', desc: 'Search and pick from multiple results' },
  { name: '/nowplaying', desc: 'See current track with live progress bar' },
  { name: '/lyrics', desc: 'Get full lyrics for any song' },
  { name: '/playlist', desc: 'Create and manage personal playlists' },
  { name: '/leaderboard', desc: 'See top listeners in your server' },
  { name: '/playerstats', desc: 'View listening statistics and top tracks' },
  { name: '/grab', desc: 'Save current song to your DMs' },
  { name: '/queue', desc: 'View and manage the current queue' }
];

const plans = [
  {
    tier: 'Starter',
    name: 'Free',
    price: '0',
    period: 'forever',
    features: ['YouTube & SoundCloud', 'Queue up to 50 tracks', '3 personal playlists', 'Basic commands'],
    featured: false,
    btnText: 'Get Started',
    btnClass: 'outline'
  },
  {
    tier: 'Most Popular',
    name: 'Pro',
    price: '4.99',
    period: 'month',
    features: ['Everything in Free', '10+ audio filters', 'Volume control', '25 playlists & history'],
    featured: true,
    btnText: 'Upgrade to Pro',
    btnClass: 'accent'
  },
  {
    tier: 'Ultimate',
    name: 'Pro Plus',
    price: '9.99',
    period: 'month',
    features: ['Everything in Pro', 'Unlimited playlists', 'Dashboard control', 'Priority support'],
    featured: false,
    btnText: 'Go Pro Plus',
    btnClass: 'purple'
  }
];

function Landing() {
  const [stats, setStats] = useState({ servers: '--', users: '--', commands: '--', uptime: '--' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({
          servers: data.servers?.toLocaleString() || '--',
          users: data.users?.toLocaleString() || '--',
          commands: data.commands ? `${data.commands}+` : '--',
          uptime: formatUptime(data.uptime)
        });
      })
      .catch(() => {});
  }, []);

  const formatUptime = (ms) => {
    if (!ms) return '--';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000) % 24;
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><span>SpaceBot</span></Link>
          <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/commands" className="nav-link">Commands</Link>
            <a href="#pricing" className="nav-link premium"><i className="fas fa-crown" /> Pricing</a>
            <a href={`${config.apiUrl}/auth/discord`} className="nav-btn"><i className="fab fa-discord" /> Dashboard</a>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fas fa-bars" />
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><i className="fas fa-bolt" /> Next-Gen Music Bot</div>
          <h1 className="hero-title">
            The Ultimate<br />
            <span className="accent">Discord Music</span><br />
            Experience
          </h1>
          <p className="hero-sub">
            Crystal-clear audio, smart queue management, stunning dashboard, and powerful premium features — all in one bot.
          </p>
          <div className="hero-buttons">
            <a href={`${config.apiUrl}/auth/discord`} className="hero-btn hero-btn-primary">
              <i className="fas fa-rocket" /> Open Dashboard
            </a>
            <a href="#features" className="hero-btn hero-btn-secondary">
              <i className="fas fa-sparkles" /> Explore Features
            </a>
          </div>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-num">{stats.servers}</div>
              <div className="stat-label">Servers</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.users}</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.commands}</div>
              <div className="stat-label">Commands</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.uptime}</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2 className="section-title">Powerful Features</h2>
        <p className="section-sub">Everything you need for the perfect music server.</p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`feature-icon icon-${feature.color}`}>
                <i className={`fas ${feature.icon}`} />
              </div>
              <h3 className="feature-name">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
        <div className="view-all-pricing" style={{ marginTop: '2rem' }}>
          <Link to="/features">Explore all features →</Link>
        </div>
      </section>

      <section id="commands" className="commands">
        <h2 className="section-title">Popular Commands</h2>
        <p className="section-sub">Slash commands to control every aspect of your music experience.</p>
        <div className="cmd-grid">
          {commands.map((cmd, index) => (
            <div key={index} className="cmd-card">
              <div className="cmd-name">{cmd.name}</div>
              <div className="cmd-desc">{cmd.desc}</div>
            </div>
          ))}
        </div>
        <div className="view-all-pricing" style={{ marginTop: '2rem' }}>
          <Link to="/commands">View all 50+ commands →</Link>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Choose Your Plan</h2>
        <p className="section-sub">Start free, upgrade when you need more.</p>
        <div className="pricing-cards">
          {plans.map((plan, index) => (
            <div key={index} className={`price-card ${plan.featured ? 'featured' : ''}`}>
              <div className={`price-tier ${plan.featured ? 'tier-accent' : ''}`}>{plan.tier}</div>
              <div className="price-name">{plan.name}</div>
              <div className="price-value">
                <span className="price-val"><span className="price-currency">$</span>{plan.price}</span>
                <span className="price-period">/{plan.period}</span>
              </div>
              <ul className="price-features">
                {plan.features.map((feature, i) => (
                  <li key={i}><i className="fas fa-check" /> {feature}</li>
                ))}
              </ul>
              <a href={`${config.apiUrl}/auth/discord`} className={`price-btn price-btn-${plan.btnClass}`}>
                {plan.btnText}
              </a>
            </div>
          ))}
        </div>
        <div className="view-all-pricing">
          <Link to="/pricing">View full comparison →</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/commands">Commands</Link>
          <Link to="/pricing">Pricing</Link>
          <a href={`${config.apiUrl}/auth/discord`}>Dashboard</a>
        </div>
        <p className="footer-copy">SpaceBot Music © 2026. Built with ❤️ for Discord communities.</p>
      </footer>
    </div>
  );
}

export default Landing;
