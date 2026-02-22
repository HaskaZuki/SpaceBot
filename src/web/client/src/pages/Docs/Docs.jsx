import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Docs.css';

const docsSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    content: `
      Welcome to SpaceBot! This documentation will help you get started with using SpaceBot
      in your Discord server.
      
      ## Adding SpaceBot to Your Server
      1. Use the invite link from our dashboard
      2. Select the server you want to add SpaceBot to
      3. Grant the required permissions
      4. SpaceBot will join your server automatically!
      
      ## Basic Commands
      - \`/play <song>\` - Play a song or add to queue
      - \`/queue\` - View the current queue
      - \`/skip\` - Skip the current song
      - \`/pause\` - Pause the current song
      - \`/resume\` - Resume playback
    `
  },
  {
    id: 'music-commands',
    title: 'Music Commands',
    icon: '🎵',
    content: `
      SpaceBot has a powerful music system with many features:
      
      ## Playback
      - \`/play [query]\` - Play music from YouTube, Spotify, SoundCloud
      - \`/search [query]\` - Search and select from results
      - \`/queue\` - View upcomming songs
      - \`/nowplaying\` - Current song info
      
      ## Controls
      - \`/pause\` - Pause playback
      - \`/resume\` - Resume playback  
      - \`/skip\` - Skip to next song
      - \`/stop\` - Stop playback and clear queue
      - \`/leave\` - Disconnect from voice channel
      
      ## Queue Management
      - \`/clear\` - Clear the queue
      - \`/shuffle\` - Shuffle the queue
      - \`/remove [position]\` - Remove a song from queue
      - \`/move [from] [to]\` - Move song in queue
    `
  },
  {
    id: 'premium',
    title: 'Premium Features',
    icon: '💎',
    content: `
      Upgrade to Premium for enhanced features!
      
      ## Premium Benefits
      - 🎧 Higher audio quality (256kbps vs 128kbps)
      - 📊 Extended queue (500 songs vs 50)
      - 🎚️ Audio filters (bass boost, nightcore, etc.)
      - ⏰ 24/7 Mode - Keep music playing always
      - 📝 Unlimited playlists (100 vs 3)
      - 🎵 Lyrics sync display
      
      ## Audio Filters
      Premium users can apply these filters:
      - Bass Boost - Enhance bass frequencies
      - Nightcore - Speed up + pitch shift
      - Vaporwave - Retro aesthetic
      - Demon - Deep voice effect
      - Speed control - Adjust playback speed
    `
  },
  {
    id: 'dashboard',
    title: 'Web Dashboard',
    icon: '🌐',
    content: `
      Control your server's music from our web dashboard!
      
      ## Features
      - 📊 Server statistics and analytics
      - ⚙️ Server-specific settings
      - 🎵 Full music queue management
      - 📈 Playback history
      - 👥 User activity tracking
      
      ## Accessing the Dashboard
      1. Visit spacebot.me
      2. Login with Discord
      3. Select your server
      4. Manage settings and view stats!
    `
  },
  {
    id: 'server-settings',
    title: 'Server Settings',
    icon: '⚙️',
    content: `
      Configure SpaceBot for your server!
      
      ## Setup Commands
      - \`/setup\` - Interactive server setup
      - \`/setdj [role]\` - Set DJ role
      - \`/setvc [channel]\` - Set music request channel
      - \`/settings\` - View all server settings
      
      ## Available Settings
      - DJ Role - Who can use music commands
      - Music Channel - Dedicated song request channel
      - Language - Server language preference
      - Auto-play - Auto play when queue is empty
      - Default volume - Starting volume level
    `
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: '❓',
    content: `
      Frequently Asked Questions
      
      ## Why isn't music playing?
      - Make sure the bot is in a voice channel
      - Check if the queue has songs
      - Verify the bot has permission to connect/speak
      
      ## How do I get support?
      - Join our support server
      - Use /help command for command list
      - Check the dashboard for server stats
      
      ## Can I use Spotify?
      Yes! SpaceBot supports:
      - YouTube videos and playlists
      - Spotify tracks and playlists
      - SoundCloud tracks
      - Direct MP3/FLAC URLs
      
      ## How do I become premium?
      Visit spacebot.me/pricing to see available plans!
    `
  }
];

function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSection = docsSections.find(s => s.id === activeSection);

  const filteredSections = searchQuery 
    ? docsSections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docsSections;

  return (
    <div className="docs-page">
      <div className="docs-sidebar">
        <div className="docs-logo">
          <span className="docs-logo-icon">📚</span>
          <span className="docs-logo-text">Docs</span>
        </div>
        
        <div className="docs-search">
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="docs-nav">
          {filteredSections.map(section => (
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
            <div className="docs-header">
              <span className="docs-header-icon">{currentSection.icon}</span>
              <h1>{currentSection.title}</h1>
            </div>
            
            <div className="docs-body">
              {currentSection.content.split('\n').map((line, i) => {
                if (line.trim().startsWith('## ')) {
                  return <h2 key={i}>{line.replace('## ', '')}</h2>;
                }
                if (line.trim().startsWith('- ')) {
                  return <li key={i}>{line.replace('- ', '')}</li>;
                }
                if (line.trim() === '') {
                  return <br key={i} />;
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
