import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import './DashboardFeatures.css';
const features = [
  {
    category: 'Audio & Playback',
    icon: 'fa-headphones',
    color: '#e91e63',
    items: [
      {
        icon: 'fa-music',
        title: 'Multi-Source Streaming',
        desc: 'Play music from YouTube, Spotify, SoundCloud, and more. Paste any URL or search by name.',
        highlight: true
      },
      {
        icon: 'fa-headphones',
        title: 'Crystal Clear Audio',
        desc: 'Powered by Lavalink technology for lag-free, high-quality audio streaming.'
      },
      {
        icon: 'fa-sliders',
        title: 'Audio Filters & Effects',
        desc: 'Bass boost, nightcore, vaporwave, 8D audio, and custom speed control.',
        premium: true
      },
      {
        icon: 'fa-volume-high',
        title: 'Volume Control',
        desc: 'Fine-tune volume from whisper-quiet to chest-thumping 200%.',
        premium: true
      }
    ]
  },
  {
    category: 'Queue & Management',
    icon: 'fa-list-check',
    color: '#3F51B5',
    items: [
      {
        icon: 'fa-shuffle',
        title: 'Smart Queue System',
        desc: 'Add, remove, move, shuffle, and loop tracks. Full control over your playlist.'
      },
      {
        icon: 'fa-forward-step',
        title: 'Advanced Playback',
        desc: 'Forward, rewind, seek to timestamp, replay, and skip like a pro DJ.'
      },
      {
        icon: 'fa-heart',
        title: 'Favorites & Playlists',
        desc: 'Create personal playlists, save favorites, and instantly load them into queue.'
      },
      {
        icon: 'fa-infinity',
        title: '24/7 Mode',
        desc: "Keep the bot in your voice channel around the clock. Music never stops.",
        premium: true
      }
    ]
  },
  {
    category: 'Discovery & Lyrics',
    icon: 'fa-compass',
    color: '#9c27b0',
    items: [
      {
        icon: 'fa-magnifying-glass',
        title: 'Multi-Source Search',
        desc: 'Search across YouTube, SoundCloud, and Spotify simultaneously.'
      },
      {
        icon: 'fa-microphone',
        title: 'Live Lyrics',
        desc: 'Get full lyrics for any song. Premium users get synchronized karaoke-style display.'
      },
      {
        icon: 'fa-wand-magic-sparkles',
        title: 'Auto-Play',
        desc: 'When the queue runs out, SpaceBot automatically finds and plays similar tracks.',
        premium: true
      },
      {
        icon: 'fa-download',
        title: 'Grab & Save',
        desc: 'Love a song? Grab it to your DMs with one command.'
      }
    ]
  },
  {
    category: 'Dashboard & Analytics',
    icon: 'fa-chart-line',
    color: '#10B981',
    items: [
      {
        icon: 'fa-display',
        title: 'Web Dashboard',
        desc: 'Control your server from your browser. Search songs, manage playlists, configure settings.'
      },
      {
        icon: 'fa-chart-bar',
        title: 'Listening Stats',
        desc: 'Track your listening habits, see top tracks, and view server leaderboard.'
      },
      {
        icon: 'fa-trophy',
        title: 'Server Leaderboard',
        desc: 'See who is the top listener in your server.'
      }
    ]
  }
];
function DashboardFeatures() {
  return (
    <DashboardLayout>
      <div className="dashboard-features">
        <div className="features-header">
          <h1>Features</h1>
          <p>Discover all the amazing features SpaceBot has to offer</p>
        </div>
        <div className="features-grid">
          {features.map((category, idx) => (
            <div key={idx} className="feature-category">
              <div className="category-header">
                <div className="category-icon" style={{ background: category.color }}>
                  <i className={`fas ${category.icon}`}></i>
                </div>
                <h2>{category.category}</h2>
              </div>
              <div className="category-items">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className={`feature-item ${item.highlight ? 'highlight' : ''}`}>
                    <div className="feature-icon">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <div className="feature-content">
                      <div className="feature-title">
                        {item.title}
                        {item.premium && <span className="premium-tag">PREMIUM</span>}
                      </div>
                      <div className="feature-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
export default DashboardFeatures;
