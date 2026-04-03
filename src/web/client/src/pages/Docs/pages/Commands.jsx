import React, { useState } from 'react';
import './Commands.css';
const categories = [
  {
    id: 'music',
    label: 'Music',
    icon: '🎵',
    color: '#e91e63',
    permission: 'Everyone',
    commands: [
      { name: '/play', desc: 'Play a song from YouTube, Spotify, SoundCloud or URL' },
      { name: '/search', desc: 'Search across sources and pick from results' },
      { name: '/nowplaying', desc: 'Show the current track with progress bar' },
      { name: '/queue', desc: 'View the current music queue' },
      { name: '/lyrics', desc: 'Fetch lyrics for the current or searched song' },
      { name: '/grab', desc: 'Save the current song info to your DMs' },
      { name: '/leaderboard', desc: 'Top 10 listeners ranked by total plays' },
      { name: '/songinfo', desc: 'Detailed info about the current track' },
      { name: '/voteskip', desc: 'Start a vote to skip the current track' },
      { name: '/playlist', desc: 'Create, view, load and manage playlists' },
      { name: '/export-playlist', desc: 'Export a playlist to a shareable file' },
      { name: '/playerstats', desc: 'View listening stats for you or another user' },
      { name: '/premiumstatus', desc: 'Check this server\'s premium status' },
      { name: '/removedupes', desc: 'Remove duplicate tracks from the queue' },
      { name: '/ping', desc: 'Check bot latency and API response time' },
      { name: '/updates', desc: 'View the latest bot changelog' },
      { name: '/support', desc: 'Get support links and help resources' },
    ],
  },
  {
    id: 'dj',
    label: 'DJ Controls',
    icon: '🎚️',
    color: '#9c27b0',
    permission: 'DJ Role / Admin',
    commands: [
      { name: '/pause', desc: 'Pause the current track' },
      { name: '/resume', desc: 'Resume paused playback' },
      { name: '/skip', desc: 'Skip the current track' },
      { name: '/forceskip', desc: 'Force-skip bypassing any active voteskip' },
      { name: '/stop', desc: 'Stop playback and clear the queue' },
      { name: '/shuffle', desc: 'Randomly shuffle all tracks in the queue' },
      { name: '/clear', desc: 'Clear the entire music queue' },
      { name: '/move', desc: 'Move a track to a different queue position' },
      { name: '/remove', desc: 'Remove a specific track from the queue' },
      { name: '/loop', desc: 'Cycle loop mode: Off → Track → Queue' },
      { name: '/replay', desc: 'Restart the current track from the beginning' },
      { name: '/seek', desc: 'Jump to a specific timestamp in the track' },
      { name: '/leave', desc: 'Disconnect the bot from the voice channel' },
      { name: '/connect', desc: 'Join your voice channel without playing' },
    ],
  },
  {
    id: 'playback',
    label: 'Playback',
    icon: '⏭️',
    color: '#3F51B5',
    permission: 'DJ Role / Admin',
    commands: [
      { name: '/forward', desc: 'Fast forward the track by N seconds' },
      { name: '/rewind', desc: 'Rewind the track by N seconds' },
      { name: '/jump', desc: 'Jump to a specific position in the queue' },
      { name: '/previous', desc: 'Play the previous track from history' },
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: '⭐',
    color: '#f1c40f',
    permission: 'Premium Server',
    commands: [
      { name: '/volume', desc: 'Adjust playback volume (1–200%)' },
      { name: '/filter', desc: 'Apply dynamic audio filters to playback (like bassboost, speed, etc)' },





      { name: '/247', desc: 'Toggle 24/7 mode — stay in VC when idle' },
      { name: '/autoplay', desc: 'Auto-play similar tracks when queue ends' },
      { name: '/add-favorite', desc: 'Save the current track to your favorites' },
      { name: '/manage-favorites', desc: 'View, play, or remove favorite tracks' },
      { name: '/history', desc: 'View your recent listening history' },
      { name: '/lyrics-sync', desc: 'Synchronized lyrics highlighting current line' },
      { name: '/skipto', desc: 'Skip directly to a specific queue position' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '⚙️',
    color: '#607D8B',
    permission: 'Administrator',
    commands: [
      { name: '/settings', desc: 'View or modify server bot settings' },
      { name: '/setup', desc: 'Setup a dedicated music channel with player embed' },
      { name: '/setdj', desc: 'Set or remove the DJ role' },
      { name: '/setvc', desc: 'Restrict bot to specific voice channels' },
      { name: '/language', desc: 'Change the bot language for this server' },
      { name: '/announce', desc: 'Toggle song announcement messages' },
      { name: '/limit', desc: 'Set maximum queue size for this server' },
      { name: '/requester', desc: 'Toggle showing who requested each song' },
      { name: '/ignore-channel', desc: 'Disable bot commands in specific channels' },
      { name: '/setcommandchannel', desc: 'Restrict all commands to one channel (whitelist)' },
      { name: '/ban', desc: 'Ban a user from using music commands' },
      { name: '/unban', desc: 'Unban a user from music commands' },
      { name: '/cleanup', desc: 'Clean up bot messages in the channel' },
      { name: '/fix', desc: 'Fix common bot issues (stuck player, broken queue)' },
    ],
  },
];
export default function Commands() {
  const [activeCategory, setActiveCategory] = useState('music');
  const [search, setSearch] = useState('');
  const current = categories.find(c => c.id === activeCategory);
  const filteredCommands = search.trim()
    ? categories.flatMap(c => c.commands.map(cmd => ({ ...cmd, categoryLabel: c.label, categoryColor: c.color })))
        .filter(cmd => cmd.name.toLowerCase().includes(search.toLowerCase()) || cmd.desc.toLowerCase().includes(search.toLowerCase()))
    : current?.commands.map(cmd => ({ ...cmd, categoryLabel: current.label, categoryColor: current.color })) || [];
  const totalCommands = categories.reduce((acc, c) => acc + c.commands.length, 0);
  return (
    <div className="commands-page">
      <div className="commands-header">
        <p className="commands-subtitle">
          <span className="commands-count">{totalCommands} commands</span> across {categories.length} categories
        </p>
        <div className="commands-search-wrap">
          <input
            className="commands-search"
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {!search.trim() && (
        <div className="commands-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`commands-tab ${activeCategory === cat.id ? 'active' : ''}`}
              style={{ '--tab-color': cat.color }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="commands-tab-icon">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="commands-tab-count">{cat.commands.length}</span>
            </button>
          ))}
        </div>
      )}
      {!search.trim() && current && (
        <div className="commands-category-header" style={{ borderColor: current.color }}>
          <div className="commands-category-title">
            <span className="commands-category-icon">{current.icon}</span>
            <span>{current.label}</span>
          </div>
          <span className="commands-category-badge" style={{ background: current.color }}>
            {current.permission}
          </span>
        </div>
      )}
      {search.trim() && (
        <p className="commands-search-info">
          Showing results for <strong>"{search}"</strong> — {filteredCommands.length} match{filteredCommands.length !== 1 ? 'es' : ''}
        </p>
      )}
      <div className="commands-grid">
        {filteredCommands.length > 0 ? filteredCommands.map((cmd, i) => (
          <div className="commands-card" key={i} style={{ '--card-accent': cmd.categoryColor }}>
            <code className="commands-card-name">{cmd.name}</code>
            <p className="commands-card-desc">{cmd.desc}</p>
            {search.trim() && (
              <span className="commands-card-category">{cmd.categoryLabel}</span>
            )}
          </div>
        )) : (
          <div className="commands-empty">
            <p>No commands found matching "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>
    </div>
  );
}
