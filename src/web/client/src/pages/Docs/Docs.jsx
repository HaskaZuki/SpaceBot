import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Docs.css';

const docsSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    content: `
## 🚀 Getting Started

### How to Add Bot to Your Server
1. Go to spacebot.me
2. Click "Login with Discord"
3. Select the server you want to add
4. Allow all required permissions
5. Done! Bot will join your server

### Quick Commands
/play <song> - Play a song from YouTube, Spotify, SoundCloud
/queue - View the music queue
/skip - Skip current song
/pause - Pause playback
/resume - Resume playback
/leave - Disconnect from voice channel
    `
  },
  {
    id: 'setup',
    title: 'Setup Bot',
    icon: '⚙️',
    content: `
## ⚙️ Setting Up SpaceBot

### Automatic Setup
Run this command on your server:

/setup

Bot will automatically create #space-music channel!

### Manual Setup
You can also set up manually:
1. Create a new text channel
2. Name it "space-music" or whatever you want
3. Type /play in that channel
4. Bot will automatically join your voice channel

### Server Configuration
/setdj @role - Set DJ role
/language en/id/ja/ko - Change language
/announce - Toggle song announcements
/limit 50 - Set queue limit
    `
  },
  {
    id: 'music-commands',
    title: 'Music Commands',
    icon: '🎵',
    content: `
## 🎵 Music Commands

### Basic
/play <song> - Play song from YouTube, Spotify, SoundCloud
/search <query> - Search and pick from results
/queue - View music queue
/nowplaying - See current track
/grab - Save track info to your DM

### Controls
/pause - Pause playback
/resume - Resume playback
/skip - Skip to next song
/stop - Stop and clear queue
/leave - Disconnect from voice channel

### Queue Management
/clear - Clear all queue
/shuffle - Shuffle the queue
/remove <position> - Remove specific song
/move <from> <to> - Move song in queue
/loop off/track/queue - Set loop mode
    `
  },
  {
    id: 'filters',
    title: 'Audio Filters',
    icon: '🎛️',
    content: `
## 🎛️ Audio Filters (Premium)

### Available Filters
/filter bassboost - Bass boost effect
/filter nightcore - Nightcore effect
/filter vaporwave - Vaporwave effect
/filter 8d - 8D audio
/filter karaoke - Karaoke mode
/filter pop - Pop mode
/filter soft - Soft mode
/filter treble - Treble boost

### Volume & Speed
/volume 1-200 - Adjust volume (Premium)
/speed 0.5-2.0 - Adjust speed (Premium)

### Note
- Audio filters are for Premium users only
- Visit spacebot.me/pricing to upgrade
    `
  },
  {
    id: 'premium',
    title: 'Premium',
    icon: '💎',
    content: `
## 💎 Premium SpaceBot

### Benefits
- Better audio quality (256kbps)
- Longer queue (500 songs)
- Audio filters (bassboost, nightcore, etc)
- 24/7 mode - Bot stays in VC always
- Unlimited playlists (100 vs 3)
- Lyrics sync display

### How to Upgrade
1. Visit spacebot.me/pricing
2. Choose your plan
3. Click "Upgrade"
4. Follow payment instructions

### Premium Commands
/247 - Toggle 24/7 mode
/autoplay - Auto play similar songs
/volume - Control volume
/speed - Adjust speed
/favorites - View favorites
    `
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '🌐',
    content: `
## 🌐 Web Dashboard

### How to Access
1. Open spacebot.me
2. Click "Login with Discord"
3. Select your server
4. Start managing!

### Dashboard Features
- Server statistics & analytics
- Server settings management
- Music queue management
- Playback history
- User activity tracking
- Playlist management

### Dashboard Menu
- Dashboard - Server overview
- Music Player - Playback control
- Playlists - Create & manage playlists
- Analytics - Detailed statistics
- Settings - Server configuration
    `
  },
  {
    id: 'playlist',
    title: 'Playlists',
    icon: '📋',
    content: `
## 📋 Playlist Management

### Playlist Commands
/playlist create <name> - Create new playlist
/playlist add <name> - Add song to playlist
/playlist remove <name> <position> - Remove from playlist
/playlist delete <name> - Delete playlist
/playlist list - View all playlists
/playlist load <name> - Play a playlist

### Export/Import
/export-playlist <name> - Export to file
/playlist import - Import from file

### Favorites
/add-favorite - Add current song to favorites
/manage-favorites list - View favorites
/manage-favorites play - Play favorites
/manage-favorites remove - Remove from favorites
    `
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: '❓',
    content: `
## ❓ Frequently Asked Questions

### Music won't play?
- Make sure bot is in a voice channel
- Check if queue has songs
- Bot needs connect & speak permissions
- Try /leave then /play again

### How to get support?
- Join discord server: discord.gg/spacebot
- Use /help to see all commands
- Check dashboard for server stats

### Can I use Spotify?
Yes! SpaceBot supports:
- YouTube videos & playlists
- Spotify tracks & playlists
- SoundCloud
- Direct MP3/URL links

### How to get Premium?
Visit spacebot.me/pricing for plans!

### Bot offline?
Try restart with /restart (owner only)
or contact support server.
    `
  },
  {
    id: 'support',
    title: 'Support',
    icon: '🎫',
    content: `
## 🎫 Need Help?

### Links
🌐 Website: spacebot.me
💬 Discord: discord.gg/spacebot
📚 Docs: spacebot.me/docs

### Command Help
/help - View all commands
/help <command> - Command details
/support - Support server link

### Troubleshooting
/Bot not responding?
- Check if bot is online
- Try kick then re-invite

/Music stops by itself?
- Check connection stability
- Try /247 for Premium

/Queue not saved?
- Queue resets when bot restarts
- Use playlists to save

### Contact
Join discord.gg/spacebot for direct help!
    `
  }
];

function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const currentSection = docsSections.find(s => s.id === activeSection);

  // Build breadcrumb path
  const getBreadcrumb = () => {
    const items = ['Docs', activeSection.charAt(0).toUpperCase() + activeSection.slice(1)];
    return items.join(' / ');
  };

  return (
    <div className="docs-page">
      <div className="docs-sidebar">
        <div className="docs-logo">
          <Link to="/" className="docs-logo-link">
            <span className="docs-logo-icon">🚀</span>
            <span className="docs-logo-text">SpaceBot</span>
          </Link>
          <span className="docs-logo-sub">Docs</span>
        </div>
        
        <nav className="docs-nav">
          {docsSections.map(section => (
            <button
              key={section.id}
              className={`docs-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="docs-nav-icon">{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </nav>

        <div className="docs-footer">
          <Link to="/" className="docs-back-link">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="docs-content">
        {currentSection && (
          <>
            <div className="docs-breadcrumb">
              {getBreadcrumb()}
            </div>
            
            <div className="docs-header">
              <span className="docs-header-icon">{currentSection.icon}</span>
              <h1>{currentSection.title}</h1>
            </div>
            
            <div className="docs-body">
              {currentSection.content.split('\n').map((line, i) => {
                if (line.trim().startsWith('## ')) {
                  return <h2 key={i}>{line.replace('## ', '')}</h2>;
                }
                if (line.trim().startsWith('### ')) {
                  return <h3 key={i}>{line.replace('### ', '')}</h3>;
                }
                if (line.trim().startsWith('- ')) {
                  return <li key={i}>{line.replace('- ', '')}</li>;
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                // Highlight /commands
                if (line.includes('/')) {
                  return <p key={i} className="docs-code">{line}</p>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>

            <div className="docs-nav-buttons">
              {docsSections.findIndex(s => s.id === activeSection) > 0 && (
                <button 
                  className="docs-nav-btn prev"
                  onClick={() => {
                    const idx = docsSections.findIndex(s => s.id === activeSection);
                    setActiveSection(docsSections[idx - 1].id);
                  }}
                >
                  ← Previous
                </button>
              )}
              {docsSections.findIndex(s => s.id === activeSection) < docsSections.length - 1 && (
                <button 
                  className="docs-nav-btn next"
                  onClick={() => {
                    const idx = docsSections.findIndex(s => s.id === activeSection);
                    setActiveSection(docsSections[idx + 1].id);
                  }}
                >
                  Next →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Docs;
