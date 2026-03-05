import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config';
import Footer from '../../components/Footer';
import './Landing.css';const IMAGES = {  crystalAudio: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop',
  audioFilters: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
  smartQueue: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop',
  webDashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',  defaultAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
};function useScrollAnimation() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);
  return [ref, isVisible];
}
const features = [
  {
    icon: 'fa-music',
    color: 'red',
    title: 'Crystal Clear Audio',
    desc: 'High-quality streaming from YouTube, Spotify, SoundCloud, and more via Lavalink technology.',
    image: IMAGES.crystalAudio
  },
  {
    icon: 'fa-sliders',
    color: 'purple',
    title: 'Audio Filters',
    desc: 'Bass boost, nightcore, 8D audio, vaporwave, karaoke, and more — transform any track instantly.',
    image: IMAGES.audioFilters
  },
  {
    icon: 'fa-list-check',
    color: 'blue',
    title: 'Smart Queue',
    desc: 'Advanced queue with shuffle, loop, jump, search, and automatic playlist loading support.',
    image: IMAGES.smartQueue
  },
  {
    icon: 'fa-display',
    color: 'green',
    title: 'Web Dashboard',
    desc: 'Apple Music-inspired web interface to search songs, control playback, and manage your server.',
    image: IMAGES.webDashboard
  }
];
const commands = [
  { name: '/play', desc: 'Play any song from YouTube, Spotify, or URL', category: 'Music' },
  { name: '/search', desc: 'Search and pick from multiple results', category: 'Music' },
  { name: '/nowplaying', desc: 'See current track with progress bar', category: 'Music' },
  { name: '/lyrics', desc: 'Get full lyrics for any song', category: 'Music' },
  { name: '/playlist', desc: 'Create and manage playlists', category: 'Playlist' },
  { name: '/leaderboard', desc: 'See top listeners in server', category: 'Stats' },
  { name: '/playerstats', desc: 'View listening statistics', category: 'Stats' },
  { name: '/grab', desc: 'Save current song to DMs', category: 'Utility' },
  { name: '/queue', desc: 'View and manage the queue', category: 'Music' },
  { name: '/filter', desc: 'Apply audio filters', category: 'Premium' },
  { name: '/247', desc: 'Keep bot in VC 24/7', category: 'Premium' },
  { name: '/autoplay', desc: 'Auto-play similar songs', category: 'Premium' }
];
const leaderboardData = [
  { rank: 1, user: 'MusicLover', plays: 2847, avatar: IMAGES.defaultAvatar },
  { rank: 2, user: 'NightOwl', plays: 2234, avatar: IMAGES.defaultAvatar },
  { rank: 3, user: 'BeatDropper', plays: 1987, avatar: IMAGES.defaultAvatar },
  { rank: 4, user: 'VibeMaster', plays: 1654, avatar: IMAGES.defaultAvatar },
  { rank: 5, user: 'ChillSeeker', plays: 1432, avatar: IMAGES.defaultAvatar }
];
const chartData = [
  { day: 'Mon', plays: 120 },
  { day: 'Tue', plays: 180 },
  { day: 'Wed', plays: 150 },
  { day: 'Thu', plays: 220 },
  { day: 'Fri', plays: 280 },
  { day: 'Sat', plays: 350 },
  { day: 'Sun', plays: 310 }
];
function Landing() {
  const [stats, setStats] = useState({ servers: '--', users: '--', commands: '--', uptime: '--' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [commandsRef, commandsVisible] = useScrollAnimation();
  const [analyticsRef, analyticsVisible] = useScrollAnimation();
  const [leaderboardRef, leaderboardVisible] = useScrollAnimation();
  const [discordRef, discordVisible] = useScrollAnimation();
  useEffect(() => {    fetch(`${config.apiUrl}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({
          servers: data.servers?.toLocaleString() || '--',
          users: data.users?.toLocaleString() || '--',
          commands: data.commands ? `${data.commands}+` : '--',
          uptime: formatUptime(data.uptime)
        });
      })
      .catch(() => {      });
  }, []);
  const formatUptime = (ms) => {
    if (!ms) return '--';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000) % 24;
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };
  const maxPlays = Math.max(...chartData.map(d => d.plays));
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><span>SpaceBot</span></Link>
          <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/commands" className="nav-link">Commands</Link>
            <Link to="/docs" className="nav-link">Docs</Link>
            <Link to="/status" className="nav-link">Status</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <a href={`${config.apiUrl}/auth/discord`} className="nav-btn"><i className="fab fa-discord" /> Dashboard</a>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fas fa-bars" />
          </button>
        </div>
      </nav>
      {}
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
      {}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-sub">Everything you need for the perfect music server.</p>
        </div>
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`feature-row ${index % 2 === 1 ? 'reverse' : ''} ${featuresVisible ? 'animate-in' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="feature-content">
              <div className={`feature-icon icon-${feature.color}`}>
                <i className={`fas ${feature.icon}`} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
              <Link to="/features" className="feature-link">
                Learn more <i className="fas fa-arrow-right" />
              </Link>
            </div>
            <div className="feature-image">
              <img src={feature.image} alt={feature.title} loading="lazy" />
              <div className="feature-image-overlay" />
            </div>
          </div>
        ))}
        <div className="section-cta">
          <Link to="/features" className="cta-btn">View All Features <i className="fas fa-arrow-right" /></Link>
        </div>
      </section>
      {}
      <section id="commands" className="commands-section" ref={commandsRef}>
        <div className="section-header">
          <h2 className="section-title">Popular Commands</h2>
          <p className="section-sub">Slash commands to control every aspect of your music experience.</p>
        </div>
        <div className={`commands-grid ${commandsVisible ? 'animate-in' : ''}`}>
          {commands.map((cmd, index) => (
            <div 
              key={index} 
              className="command-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="command-category">{cmd.category}</div>
              <div className="command-name">{cmd.name}</div>
              <div className="command-desc">{cmd.desc}</div>
            </div>
          ))}
        </div>
        <div className="section-cta">
          <Link to="/commands" className="cta-btn">View All Commands <i className="fas fa-arrow-right" /></Link>
        </div>
      </section>
      {}
      <section id="analytics" className="analytics-section" ref={analyticsRef}>
        <div className="section-header">
          <h2 className="section-title">Analytics & Insights</h2>
          <p className="section-sub">Track your listening habits and discover your music journey.</p>
        </div>
        <div className={`analytics-grid ${analyticsVisible ? 'animate-in' : ''}`}>
          <div className="analytics-card chart-card">
            <h4 className="card-title">Weekly Activity</h4>
            <div className="chart-container">
              {chartData.map((item, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ height: `${(item.plays / maxPlays) * 100}%` }}
                  >
                    <span className="chart-value">{item.plays}</span>
                  </div>
                  <span className="chart-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="analytics-card stats-card">
            <h4 className="card-title">Your Stats</h4>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-icon"><i className="fas fa-music" /></span>
                <span className="stat-text">Songs Played</span>
                <span className="stat-value">1,234</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon"><i className="fas fa-clock" /></span>
                <span className="stat-text">Hours Listened</span>
                <span className="stat-value">89h</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon"><i className="fas fa-heart" /></span>
                <span className="stat-text">Favorites</span>
                <span className="stat-value">45</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon"><i className="fas fa-list" /></span>
                <span className="stat-text">Playlists</span>
                <span className="stat-value">8</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {}
      <section id="leaderboard" className="leaderboard-section" ref={leaderboardRef}>
        <div className="section-header">
          <h2 className="section-title">Top Listeners</h2>
          <p className="section-sub">See who's been vibing the most this week.</p>
        </div>
        <div className={`leaderboard-container ${leaderboardVisible ? 'animate-in' : ''}`}>
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <span className="lb-rank">Rank</span>
              <span className="lb-user">User</span>
              <span className="lb-plays">Plays</span>
            </div>
            {leaderboardData.map((item, index) => (
              <div 
                key={index} 
                className="leaderboard-row"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className={`lb-rank-num rank-${item.rank}`}>
                  {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                </span>
                <span className="lb-user-info">
                  <img src={item.avatar} alt={item.user} className="lb-avatar" />
                  <span className="lb-username">{item.user}</span>
                </span>
                <span className="lb-plays-num">{item.plays.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="section-cta">
          <Link to="/leaderboard" className="cta-btn">View Full Leaderboard <i className="fas fa-arrow-right" /></Link>
        </div>
      </section>
      {}
      <section id="discord" className="discord-section" ref={discordRef}>
        <div className="section-header">
          <h2 className="section-title">Join Our Community</h2>
          <p className="section-sub">Connect with other music lovers and get support.</p>
        </div>
        <div className={`discord-container ${discordVisible ? 'animate-in' : ''}`}>
          <div className="discord-info">
            <h3>SpaceBot Discord Server</h3>
            <p>Join our community to get help, share feedback, and stay updated on new features!</p>
            <ul className="discord-features">
              <li><i className="fas fa-check"></i> Get instant support</li>
              <li><i className="fas fa-check"></i> Announcements & updates</li>
              <li><i className="fas fa-check"></i> Community events</li>
              <li><i className="fas fa-check"></i> Premium giveaways</li>
            </ul>
            <a href="https://discord.gg/spacebot" className="discord-join-btn" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-discord"></i> Join Server
            </a>
          </div>
          <div className="discord-widget">
            <iframe 
              src="https://discord.com/widget?id=1447235805813805101&theme=dark" 
              width="350" 
              height="500" 
              allowtransparency="true" 
              frameBorder="0" 
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              title="Discord Widget"
            ></iframe>
          </div>
        </div>
      </section>
      {}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to elevate your server?</h2>
          <p>Join thousands of servers already using SpaceBot.</p>
          <div className="cta-buttons">
            <a href={`${config.apiUrl}/auth/discord`} className="cta-primary">
              <i className="fas fa-rocket" /> Add to Discord
            </a>
            <Link to="/pricing" className="cta-secondary">
              <i className="fas fa-crown" /> View Premium
            </Link>
          </div>
        </div>
      </section>
      {}
      <Footer />
    </div>
  );
}
export default Landing;
