import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import './DashboardCommands.css';

const commandCategories = [
  {
    name: 'Music',
    icon: 'fa-music',
    color: '#e91e63',
    commands: [
      { name: '/play', desc: 'Play a song from YouTube, Spotify, or URL', usage: '/play <song>' },
      { name: '/search', desc: 'Search for songs and select from results', usage: '/search <query>' },
      { name: '/queue', desc: 'View the current queue', usage: '/queue' },
      { name: '/nowplaying', desc: 'Show current track with progress bar', usage: '/nowplaying' },
      { name: '/lyrics', desc: 'Get lyrics for current or specified song', usage: '/lyrics [song]' },
      { name: '/grab', desc: 'Save current song to your DMs', usage: '/grab' },
    ]
  },
  {
    name: 'Playback Controls',
    icon: 'fa-sliders',
    color: '#9c27b0',
    commands: [
      { name: '/pause', desc: 'Pause the current track', usage: '/pause' },
      { name: '/resume', desc: 'Resume playback', usage: '/resume' },
      { name: '/skip', desc: 'Skip to the next track', usage: '/skip' },
      { name: '/stop', desc: 'Stop playback and clear queue', usage: '/stop' },
      { name: '/leave', desc: 'Disconnect bot from voice channel', usage: '/leave' },
      { name: '/loop', desc: 'Set loop mode (off, song, queue)', usage: '/loop <mode>' },
    ]
  },
  {
    name: 'Queue Management',
    icon: 'fa-list-check',
    color: '#3F51B5',
    commands: [
      { name: '/clear', desc: 'Clear all songs from queue', usage: '/clear' },
      { name: '/shuffle', desc: 'Shuffle the queue', usage: '/shuffle' },
      { name: '/remove', desc: 'Remove a song from queue', usage: '/remove <position>' },
      { name: '/move', desc: 'Move a song to different position', usage: '/move <from> <to>' },
      { name: '/jump', desc: 'Jump to a specific song in queue', usage: '/jump <position>' },
    ]
  },
  {
    name: 'Premium',
    icon: 'fa-crown',
    color: '#ffd60a',
    commands: [
      { name: '/filter', desc: 'Apply audio filters (bassboost, nightcore, etc)', usage: '/filter <type>', premium: true },
      { name: '/volume', desc: 'Adjust playback volume (1-200%)', usage: '/volume <1-200>', premium: true },
      { name: '/speed', desc: 'Adjust playback speed', usage: '/speed <0.5-2.0>', premium: true },
      { name: '/247', desc: 'Keep bot in voice channel 24/7', usage: '/247', premium: true },
      { name: '/autoplay', desc: 'Auto-play similar songs when queue ends', usage: '/autoplay', premium: true },
      { name: '/history', desc: 'View your listening history', usage: '/history', premium: true },
    ]
  },
  {
    name: 'Playlists',
    icon: 'fa-list',
    color: '#10B981',
    commands: [
      { name: '/playlist create', desc: 'Create a new playlist', usage: '/playlist create <name>' },
      { name: '/playlist add', desc: 'Add song to playlist', usage: '/playlist add <name> <song>' },
      { name: '/playlist load', desc: 'Load a playlist into queue', usage: '/playlist load <name>' },
      { name: '/playlist delete', desc: 'Delete a playlist', usage: '/playlist delete <name>' },
      { name: '/playlist list', desc: 'View all your playlists', usage: '/playlist list' },
    ]
  },
  {
    name: 'Stats & Info',
    icon: 'fa-chart-bar',
    color: '#0a84ff',
    commands: [
      { name: '/playerstats', desc: 'View your listening statistics', usage: '/playerstats' },
      { name: '/leaderboard', desc: 'See top listeners in server', usage: '/leaderboard' },
      { name: '/songinfo', desc: 'Get detailed info about a song', usage: '/songinfo <song>' },
    ]
  }
];

function DashboardCommands() {
  return (
    <DashboardLayout>
      <div className="dashboard-commands">
        <div className="commands-header">
          <h1>Commands</h1>
          <p>All available commands for SpaceBot</p>
        </div>

        <div className="commands-search">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search commands..." />
        </div>

        <div className="commands-categories">
          {commandCategories.map((category, idx) => (
            <div key={idx} className="command-category">
              <div className="category-header">
                <div className="category-icon" style={{ background: category.color }}>
                  <i className={`fas ${category.icon}`}></i>
                </div>
                <h2>{category.name}</h2>
              </div>
              
              <div className="category-commands">
                {category.commands.map((cmd, cmdIdx) => (
                  <div key={cmdIdx} className="command-item">
                    <div className="command-info">
                      <div className="command-name">
                        {cmd.name}
                        {cmd.premium && <span className="premium-tag">PREMIUM</span>}
                      </div>
                      <div className="command-desc">{cmd.desc}</div>
                    </div>
                    <div className="command-usage">
                      <code>{cmd.usage}</code>
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

export default DashboardCommands;
