import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Commands.css';

const allCommands = [
  {
    name: 'play',
    description: 'Play a song from YouTube, SoundCloud, Spotify, or a direct URL',
    usage: '/play <song>',
    category: 'everyone',
    options: [{ name: 'song', type: 'String', required: true, desc: 'Song name, URL, or playlist link' }],
    examples: ['/play never gonna give you up', '/play https://open.spotify.com/track/...']
  },
  {
    name: 'search',
    description: 'Search for a song across multiple sources and pick from results',
    usage: '/search <query> [source]',
    category: 'everyone',
    options: [
      { name: 'query', type: 'String', required: true, desc: 'Song name to search' },
      { name: 'source', type: 'String', required: false, desc: 'Music source: YouTube, YouTube Music, SoundCloud, Spotify' }
    ],
    examples: ['/search lofi beats', '/search chill vibes source:soundcloud']
  },
  {
    name: 'nowplaying',
    description: 'Show the currently playing track with progress bar, source, and queue info',
    usage: '/nowplaying',
    category: 'everyone',
    options: [],
    examples: ['/nowplaying']
  },
  {
    name: 'queue',
    description: 'View the current music queue with track list and total duration',
    usage: '/queue',
    category: 'everyone',
    options: [],
    examples: ['/queue']
  },
  {
    name: 'lyrics',
    description: 'Fetch and display lyrics for the current song or a custom search',
    usage: '/lyrics [query]',
    category: 'everyone',
    options: [{ name: 'query', type: 'String', required: false, desc: 'Song name (uses current song if empty)' }],
    examples: ['/lyrics', '/lyrics imagine dragons believer']
  },
  {
    name: 'grab',
    description: 'Save the currently playing song info to your DMs',
    usage: '/grab',
    category: 'everyone',
    options: [],
    examples: ['/grab']
  },
  {
    name: 'leaderboard',
    description: 'View the top 10 listeners in the server ranked by total plays',
    usage: '/leaderboard [period]',
    category: 'everyone',
    options: [{ name: 'period', type: 'String', required: false, desc: 'Time period: Today, This Week, This Month, All Time' }],
    examples: ['/leaderboard', '/leaderboard period:This Week']
  },
  {
    name: 'songinfo',
    description: 'Get detailed information about the currently playing track',
    usage: '/songinfo',
    category: 'everyone',
    options: [],
    examples: ['/songinfo']
  },
  {
    name: 'voteskip',
    description: 'Start a vote to skip the current track (requires 50% of voice channel)',
    usage: '/voteskip',
    category: 'everyone',
    options: [],
    examples: ['/voteskip']
  },
  {
    name: 'playlist',
    description: 'Create, view, load, and manage your personal playlists',
    usage: '/playlist <action> [name]',
    category: 'everyone',
    options: [
      { name: 'action', type: 'String', required: true, desc: 'create, view, load, delete, add, remove, list' },
      { name: 'name', type: 'String', required: false, desc: 'Playlist name' }
    ],
    examples: ['/playlist create MyVibes', '/playlist load MyVibes', '/playlist list']
  },
  {
    name: 'export-playlist',
    description: 'Export a playlist to a shareable text file',
    usage: '/export-playlist <name>',
    category: 'everyone',
    options: [{ name: 'name', type: 'String', required: true, desc: 'Playlist name to export' }],
    examples: ['/export-playlist MyVibes']
  },
  {
    name: 'playerstats',
    description: 'View listening statistics for yourself or another user',
    usage: '/playerstats [user]',
    category: 'everyone',
    options: [{ name: 'user', type: 'User', required: false, desc: 'User to check stats for (defaults to you)' }],
    examples: ['/playerstats', '/playerstats @username']
  },
  {
    name: 'premiumstatus',
    description: 'Check the premium status of the current server',
    usage: '/premiumstatus',
    category: 'everyone',
    options: [],
    examples: ['/premiumstatus']
  },
  {
    name: 'ping',
    description: "Check the bot's latency and API response time",
    usage: '/ping',
    category: 'everyone',
    options: [],
    examples: ['/ping']
  },
  {
    name: 'updates',
    description: 'View the latest bot updates and changelog',
    usage: '/updates',
    category: 'everyone',
    options: [],
    examples: ['/updates']
  },
  {
    name: 'pause',
    description: 'Pause the current track playback',
    usage: '/pause',
    category: 'dj',
    options: [],
    examples: ['/pause']
  },
  {
    name: 'resume',
    description: 'Resume paused track playback',
    usage: '/resume',
    category: 'dj',
    options: [],
    examples: ['/resume']
  },
  {
    name: 'skip',
    description: 'Skip the current track and play the next one in queue',
    usage: '/skip',
    category: 'dj',
    options: [],
    examples: ['/skip']
  },
  {
    name: 'stop',
    description: 'Stop playback completely and clear the queue',
    usage: '/stop',
    category: 'dj',
    options: [],
    examples: ['/stop']
  },
  {
    name: 'shuffle',
    description: 'Randomly shuffle all tracks in the queue',
    usage: '/shuffle',
    category: 'dj',
    options: [],
    examples: ['/shuffle']
  },
  {
    name: 'loop',
    description: 'Set the loop mode for playback',
    usage: '/loop <mode>',
    category: 'dj',
    options: [{ name: 'mode', type: 'String', required: true, desc: 'off, track, or queue' }],
    examples: ['/loop track', '/loop queue', '/loop off']
  },
  {
    name: 'seek',
    description: 'Jump to a specific timestamp in the current track',
    usage: '/seek <time>',
    category: 'dj',
    options: [{ name: 'time', type: 'String', required: true, desc: 'Timestamp (e.g. 1:30, 0:45)' }],
    examples: ['/seek 1:30', '/seek 2:00']
  },
  {
    name: 'clear',
    description: 'Clear the entire music queue without stopping the current track',
    usage: '/clear',
    category: 'dj',
    options: [],
    examples: ['/clear']
  },
  {
    name: 'move',
    description: 'Move a track from one queue position to another',
    usage: '/move <from> <to>',
    category: 'dj',
    options: [
      { name: 'from', type: 'Integer', required: true, desc: 'Current position of the track' },
      { name: 'to', type: 'Integer', required: true, desc: 'New position for the track' }
    ],
    examples: ['/move 5 1']
  },
  {
    name: 'remove',
    description: 'Remove a specific track from the queue by position',
    usage: '/remove <position>',
    category: 'dj',
    options: [{ name: 'position', type: 'Integer', required: true, desc: 'Queue position to remove' }],
    examples: ['/remove 3']
  },
  {
    name: 'replay',
    description: 'Restart the currently playing track from the beginning',
    usage: '/replay',
    category: 'dj',
    options: [],
    examples: ['/replay']
  },
  {
    name: 'leave',
    description: 'Disconnect the bot from the voice channel',
    usage: '/leave',
    category: 'dj',
    options: [],
    examples: ['/leave']
  },
  {
    name: 'forward',
    description: 'Fast forward the current track by a specified amount of seconds',
    usage: '/forward <seconds>',
    category: 'playback',
    options: [{ name: 'seconds', type: 'Integer', required: true, desc: 'Seconds to skip forward' }],
    examples: ['/forward 10', '/forward 30']
  },
  {
    name: 'rewind',
    description: 'Rewind the current track by a specified amount of seconds',
    usage: '/rewind <seconds>',
    category: 'playback',
    options: [{ name: 'seconds', type: 'Integer', required: true, desc: 'Seconds to rewind' }],
    examples: ['/rewind 10']
  },
  {
    name: 'jump',
    description: 'Jump to a specific position in the queue and play it',
    usage: '/jump <position>',
    category: 'playback',
    options: [{ name: 'position', type: 'Integer', required: true, desc: 'Queue position to jump to' }],
    examples: ['/jump 5']
  },
  {
    name: 'previous',
    description: 'Play the previous track from history',
    usage: '/previous',
    category: 'playback',
    options: [],
    examples: ['/previous']
  },
  {
    name: 'volume',
    description: 'Adjust the playback volume (1-200%)',
    usage: '/volume <level>',
    category: 'premium',
    options: [{ name: 'level', type: 'Integer', required: true, desc: 'Volume level (1-200)' }],
    examples: ['/volume 80', '/volume 150']
  },
  {
    name: 'filter',
    description: 'Apply audio filters to the playback',
    usage: '/filter <type>',
    category: 'premium',
    options: [{ name: 'type', type: 'String', required: true, desc: 'Filter type to apply' }],
    examples: ['/filter bassboost', '/filter nightcore']
  },
  {
    name: 'bassboost',
    description: 'Toggle bass boost effect on the current playback',
    usage: '/bassboost',
    category: 'premium',
    options: [],
    examples: ['/bassboost']
  },
  {
    name: 'nightcore',
    description: 'Toggle nightcore effect (faster + higher pitch)',
    usage: '/nightcore',
    category: 'premium',
    options: [],
    examples: ['/nightcore']
  },
  {
    name: 'vaporwave',
    description: 'Toggle vaporwave effect (slower + lower pitch)',
    usage: '/vaporwave',
    category: 'premium',
    options: [],
    examples: ['/vaporwave']
  },
  {
    name: 'demon',
    description: 'Toggle demon voice effect (deep pitch shift)',
    usage: '/demon',
    category: 'premium',
    options: [],
    examples: ['/demon']
  },
  {
    name: 'speed',
    description: 'Adjust the playback speed of the current track',
    usage: '/speed <rate>',
    category: 'premium',
    options: [{ name: 'rate', type: 'Number', required: true, desc: 'Speed multiplier (0.5-2.0)' }],
    examples: ['/speed 1.5', '/speed 0.75']
  },
  {
    name: '247',
    description: 'Toggle 24/7 mode — bot stays in voice channel even when idle',
    usage: '/247',
    category: 'premium',
    options: [],
    examples: ['/247']
  },
  {
    name: 'autoplay',
    description: 'Toggle autoplay — automatically plays similar tracks when queue is empty',
    usage: '/autoplay',
    category: 'premium',
    options: [],
    examples: ['/autoplay']
  },
  {
    name: 'add-favorite',
    description: 'Save the currently playing track to your favorites',
    usage: '/add-favorite',
    category: 'premium',
    options: [],
    examples: ['/add-favorite']
  },
  {
    name: 'manage-favorites',
    description: 'View, play, or remove tracks from your favorites list',
    usage: '/manage-favorites <action>',
    category: 'premium',
    options: [{ name: 'action', type: 'String', required: true, desc: 'list, play, or remove' }],
    examples: ['/manage-favorites list', '/manage-favorites play']
  },
  {
    name: 'history',
    description: 'View your recent listening history in this server',
    usage: '/history',
    category: 'premium',
    options: [],
    examples: ['/history']
  },
  {
    name: 'lyrics-sync',
    description: 'View synchronized lyrics that highlight the current line being played',
    usage: '/lyrics-sync',
    category: 'premium',
    options: [],
    examples: ['/lyrics-sync']
  },
  {
    name: 'skipto',
    description: 'Skip to a specific position in the queue, removing all tracks before it',
    usage: '/skipto <position>',
    category: 'premium',
    options: [{ name: 'position', type: 'Integer', required: true, desc: 'Queue position to skip to' }],
    examples: ['/skipto 5', '/skipto 3']
  },
  {
    name: 'settings',
    description: 'View or modify server bot settings',
    usage: '/settings <action>',
    category: 'admin',
    options: [{ name: 'action', type: 'String', required: true, desc: 'view, reset, or a specific setting' }],
    examples: ['/settings view', '/settings reset']
  },
  {
    name: 'setup',
    description: 'Set up a dedicated music channel with player embed and controls',
    usage: '/setup',
    category: 'admin',
    options: [],
    examples: ['/setup']
  },
  {
    name: 'setdj',
    description: 'Set or remove the DJ role for music controls',
    usage: '/setdj <role>',
    category: 'admin',
    options: [{ name: 'role', type: 'Role', required: true, desc: 'Role to assign as DJ' }],
    examples: ['/setdj @DJ']
  },
  {
    name: 'setvc',
    description: 'Restrict bot to specific voice channels',
    usage: '/setvc <action> [channel]',
    category: 'admin',
    options: [
      { name: 'action', type: 'String', required: true, desc: 'add, remove, list, or clear' },
      { name: 'channel', type: 'Channel', required: false, desc: 'Voice channel to add/remove' }
    ],
    examples: ['/setvc add #music-vc', '/setvc list']
  },
  {
    name: 'language',
    description: 'Change the bot language for this server',
    usage: '/language <lang>',
    category: 'admin',
    options: [{ name: 'lang', type: 'String', required: true, desc: 'Language code (en, id, ja, ko, etc.)' }],
    examples: ['/language id', '/language en']
  },
  {
    name: 'announce',
    description: 'Toggle song announcement messages when a new track starts',
    usage: '/announce',
    category: 'admin',
    options: [],
    examples: ['/announce']
  },
  {
    name: 'limit',
    description: 'Set maximum queue size for this server',
    usage: '/limit <number>',
    category: 'admin',
    options: [{ name: 'number', type: 'Integer', required: true, desc: 'Max queue size (0 = unlimited)' }],
    examples: ['/limit 50', '/limit 0']
  },
  {
    name: 'requester',
    description: 'Toggle showing who requested each song in the queue',
    usage: '/requester',
    category: 'admin',
    options: [],
    examples: ['/requester']
  },
  {
    name: 'ban',
    description: 'Ban a user from using music commands in this server',
    usage: '/ban <user>',
    category: 'admin',
    options: [{ name: 'user', type: 'User', required: true, desc: 'User to ban from music commands' }],
    examples: ['/ban @username']
  },
  {
    name: 'unban',
    description: 'Unban a previously banned user from music commands',
    usage: '/unban <user>',
    category: 'admin',
    options: [{ name: 'user', type: 'User', required: true, desc: 'User to unban' }],
    examples: ['/unban @username']
  },
  {
    name: 'cleanup',
    description: 'Clean up bot messages in the current channel',
    usage: '/cleanup [amount]',
    category: 'admin',
    options: [{ name: 'amount', type: 'Integer', required: false, desc: 'Number of messages to clean (default: 50)' }],
    examples: ['/cleanup', '/cleanup 100']
  },
  {
    name: 'fix',
    description: 'Fix common bot issues like stuck player or broken queue',
    usage: '/fix',
    category: 'admin',
    options: [],
    examples: ['/fix']
  }
];

const categories = [
  { id: 'all', label: 'All Commands', icon: 'fa-layer-group' },
  { id: 'everyone', label: 'Music', icon: 'fa-music', color: '#e91e63', permission: 'Everyone' },
  { id: 'dj', label: 'DJ Controls', icon: 'fa-sliders', color: '#9c27b0', permission: 'DJ Role' },
  { id: 'playback', label: 'Playback', icon: 'fa-forward', color: '#3F51B5', permission: 'DJ Role' },
  { id: 'premium', label: 'Premium', icon: 'fa-gem', color: '#f1c40f', permission: 'Premium' },
  { id: 'admin', label: 'Admin', icon: 'fa-shield-halved', color: '#95a5a6', permission: 'Admin' }
];

function Commands() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCommand, setExpandedCommand] = useState(null);

  const filteredCommands = useMemo(() => {
    return allCommands.filter(cmd => {
      const matchesCategory = activeCategory === 'all' || cmd.category === activeCategory;
      const matchesSearch = !searchQuery ||
        cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const getCategoryConfig = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const toggleCommand = (cmdName) => {
    setExpandedCommand(expandedCommand === cmdName ? null : cmdName);
  };

  return (
    <div className="landing commands-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><span>SpaceBot</span></Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/commands" className="nav-link active">Commands</Link>
            <a href="/#pricing" className="nav-link premium"><i className="fas fa-crown" /> Pricing</a>
            <Link to="/dashboard" className="nav-btn"><i className="fab fa-discord" /> Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="commands-hero">
        <div className="commands-hero-content">
          <div className="commands-badge">
            <i className="fas fa-terminal" /> Command Reference
          </div>
          <h1>All Commands</h1>
          <p>Explore every command available in SpaceBot. Click any command to see detailed usage, options, and examples.</p>
          <div className="commands-stats">
            <span><strong>{allCommands.length}</strong> commands</span>
            <span className="dot">•</span>
            <span><strong>{categories.length - 1}</strong> categories</span>
          </div>
        </div>
      </section>

      <section className="commands-main">
        <div className="commands-toolbar">
          <div className="search-box">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                style={activeCategory === cat.id && cat.color ? { '--tab-color': cat.color } : {}}
              >
                <i className={`fas ${cat.icon}`} />
                <span>{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className="tab-count">
                    {allCommands.filter(c => c.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="commands-list">
          {filteredCommands.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search" />
              <p>No commands found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredCommands.map(cmd => {
              const catConfig = getCategoryConfig(cmd.category);
              const isExpanded = expandedCommand === cmd.name;

              return (
                <div
                  key={cmd.name}
                  className={`command-item ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCommand(cmd.name)}
                >
                  <div className="command-header">
                    <div className="command-left">
                      <span className="command-category-dot" style={{ background: catConfig.color }} />
                      <code className="command-name">/{cmd.name}</code>
                      <span className="command-desc-short">{cmd.description}</span>
                    </div>
                    <div className="command-right">
                      <span className="command-badge" style={{ color: catConfig.color, background: `${catConfig.color}15` }}>
                        {catConfig.label}
                      </span>
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} expand-icon`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="command-details" onClick={(e) => e.stopPropagation()}>
                      <div className="detail-section">
                        <h4><i className="fas fa-terminal" /> Usage</h4>
                        <code className="usage-code">{cmd.usage}</code>
                      </div>

                      <div className="detail-section">
                        <h4><i className="fas fa-info-circle" /> Description</h4>
                        <p>{cmd.description}</p>
                      </div>

                      {cmd.options.length > 0 && (
                        <div className="detail-section">
                          <h4><i className="fas fa-cog" /> Options</h4>
                          <div className="options-table">
                            {cmd.options.map((opt, i) => (
                              <div key={i} className="option-row">
                                <div className="option-name">
                                  <code>{opt.name}</code>
                                  <span className={`option-tag ${opt.required ? 'required' : 'optional'}`}>
                                    {opt.required ? 'REQUIRED' : 'optional'}
                                  </span>
                                </div>
                                <div className="option-type">{opt.type}</div>
                                <div className="option-desc">{opt.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="detail-section">
                        <h4><i className="fas fa-lightbulb" /> Examples</h4>
                        <div className="examples-list">
                          {cmd.examples.map((ex, i) => (
                            <code key={i} className="example-code">{ex}</code>
                          ))}
                        </div>
                      </div>

                      <div className="detail-footer">
                        <span className="detail-perm">
                          <i className="fas fa-lock" /> Permission: <strong>{catConfig.permission}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default Commands;
