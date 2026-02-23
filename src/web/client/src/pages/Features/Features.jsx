import React from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

const featureCategories = [
  {
    title: 'Audio & Playback',
    icon: 'fa-headphones',
    color: '#e91e63',
    features: [
      {
        icon: 'fa-music',
        title: 'Multi-Source Streaming',
        desc: 'Play music from YouTube, Spotify, SoundCloud, and more. Paste any URL or search by name — SpaceBot finds the best quality source automatically.',
        highlight: true
      },
      {
        icon: 'fa-headphones',
        title: 'Crystal Clear Audio',
        desc: 'Powered by Lavalink technology for lag-free, high-quality audio streaming. No buffering, no delays — just pure music.'
      },
      {
        icon: 'fa-sliders',
        title: 'Audio Filters & Effects',
        desc: 'Transform any track with bass boost, nightcore, vaporwave, demon voice, 8D audio, and custom speed control.',
        premium: true
      },
      {
        icon: 'fa-volume-high',
        title: 'Volume Control',
        desc: 'Fine-tune volume from whisper-quiet to chest-thumping 200%. Perfect for every mood and setting.',
        premium: true
      }
    ]
  },
  {
    title: 'Queue & Management',
    icon: 'fa-list-check',
    color: '#3F51B5',
    features: [
      {
        icon: 'fa-shuffle',
        title: 'Smart Queue System',
        desc: 'Add, remove, move, shuffle, and loop tracks. Jump to any position or skip ahead. Full control over your playlist.'
      },
      {
        icon: 'fa-forward-step',
        title: 'Advanced Playback',
        desc: 'Forward, rewind, seek to timestamp, replay, and skip. Navigate through songs like a pro DJ.'
      },
      {
        icon: 'fa-heart',
        title: 'Favorites & Playlists',
        desc: 'Create personal playlists, save favorites, and instantly load them into queue. Export and share with friends.'
      },
      {
        icon: 'fa-infinity',
        title: '24/7 Mode',
        desc: "Keep the bot in your voice channel around the clock. Music never stops, even when no one's listening.",
        premium: true
      }
    ]
  },
  {
    title: 'Discovery & Lyrics',
    icon: 'fa-compass',
    color: '#9c27b0',
    features: [
      {
        icon: 'fa-magnifying-glass',
        title: 'Multi-Source Search',
        desc: 'Search across YouTube, YouTube Music, SoundCloud, and Spotify simultaneously. Find any track in seconds.'
      },
      {
        icon: 'fa-microphone',
        title: 'Live Lyrics',
        desc: 'Get full lyrics for any song. Free users see complete lyrics, and Premium users get synchronized karaoke-style display.'
      },
      {
        icon: 'fa-wand-magic-sparkles',
        title: 'Auto-Play',
        desc: 'When the queue runs out, SpaceBot automatically finds and plays similar tracks. Endless music discovery.',
        premium: true
      },
      {
        icon: 'fa-download',
        title: 'Grab & Save',
        desc: 'Love a song? Grab it to your DMs with one command. Save the title, artist, and link for later.'
      }
    ]
  },
  {
    title: 'Dashboard & Analytics',
    icon: 'fa-chart-line',
    color: '#10B981',
    features: [
      {
        icon: 'fa-display',
        title: 'Web Dashboard',
        desc: 'Web Dashboard to control your server. Search songs, control playback, manage playlists, and configure settings — all from your browser.',
        highlight: true
      },
      {
        icon: 'fa-chart-bar',
        title: 'Listening Analytics',
        desc: 'Track your listening history, see your top songs and artists, and compare stats with friends.'
      },
      {
        icon: 'fa-trophy',
        title: 'Server Leaderboard',
        desc: 'See who listens the most in your server. Weekly, monthly, and all-time rankings to fuel friendly competition.'
      },
      {
        icon: 'fa-clock-rotate-left',
        title: 'Play History',
        desc: 'Browse your complete listening history sorted by date. Rediscover that song you loved last week.',
        premium: true
      },
    ]
  },
  {
    title: 'Server Management',
    icon: 'fa-shield-halved',
    color: '#f59e0b',
    features: [
      {
        icon: 'fa-user-shield',
        title: 'DJ Role System',
        desc: 'Assign a DJ role to control who can manage music. Perfect for large servers where you want organized control.'
      },
      {
        icon: 'fa-gear',
        title: 'Customizable Settings',
        desc: 'Configure announce messages, queue limits, voice channel restrictions, requester display, and more per-server.'
      },
      {
        icon: 'fa-globe',
        title: 'Multi-Language',
        desc: 'Support for English, Indonesian, Japanese, Korean, and more. Switch language with a single command.'
      },
      {
        icon: 'fa-hammer',
        title: 'Moderation Tools',
        desc: 'Ban users from music commands, clean up bot messages, and fix stuck players. Keep your music channel clean.'
      }
    ]
  }
];

function Features() {
  return (
    <div className="landing features-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><span>SpaceBot</span></Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link active">Features</Link>
            <Link to="/commands" className="nav-link">Commands</Link>
            <a href="/#pricing" className="nav-link premium"><i className="fas fa-crown" /> Pricing</a>
            <Link to="/dashboard" className="nav-btn"><i className="fab fa-discord" /> Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="features-hero">
        <div className="features-hero-content">
          <div className="features-badge">
            <i className="fas fa-sparkles" /> Feature Overview
          </div>
          <h1>Everything You Need</h1>
          <p>SpaceBot is packed with features that make it the ultimate music bot for your Discord server.</p>
        </div>
      </section>

      <section className="features-main">
        {featureCategories.map((category, catIndex) => (
          <div key={catIndex} className="feature-category">
            <div className="category-header">
              <div className="category-icon" style={{ background: `${category.color}15`, color: category.color }}>
                <i className={`fas ${category.icon}`} />
              </div>
              <h2>{category.title}</h2>
            </div>

            <div className="feature-cards">
              {category.features.map((feature, feaIndex) => (
                <div
                  key={feaIndex}
                  className={`feat-card ${feature.highlight ? 'feat-highlight' : ''} ${feature.premium ? 'feat-premium' : ''}`}
                >
                  {feature.premium && (
                    <div className="premium-tag">
                      <i className="fas fa-gem" /> Premium
                    </div>
                  )}
                  <div className="feat-icon" style={{ color: category.color }}>
                    <i className={`fas ${feature.icon}`} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="features-cta">
        <div className="cta-content">
          <h2>Ready to get started?</h2>
          <p>Add SpaceBot to your server and experience the best music bot for Discord.</p>
          <div className="cta-buttons">
            <Link to="/commands" className="cta-btn cta-secondary">
              <i className="fas fa-terminal" /> View Commands
            </Link>
            <Link to="/pricing" className="cta-btn cta-primary">
              <i className="fas fa-rocket" /> See Pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/commands">Commands</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
        <p className="footer-copy">SpaceBot Music © 2026. Built with ❤️ for Discord communities.</p>
      </footer>
    </div>
  );
}

export default Features;
