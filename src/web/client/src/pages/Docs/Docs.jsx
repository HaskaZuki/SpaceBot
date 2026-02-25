import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Setup, Commands, Filters, Premium, Dashboard, Playlists, FAQ, Support } from './pages';
import Footer from '../../components/Footer';
import './Docs.css';

// Introduction component inline
const Introduction = () => (
  <div className="docs-body">
    <h2 id="getting-started">Getting Started</h2>
    <p className="docs-description">Welcome to SpaceBot! Here's how to get started with the bot.</p>
    
    <h3 id="add-to-server">How to Add Bot to Your Server</h3>
    <ol>
      <li>Go to <a href="https://spacebot.me" target="_blank" rel="noopener noreferrer" className="docs-link">spacebot.me</a></li>
      <li>Click "Login with Discord"</li>
      <li>Select the server you want to add</li>
      <li>Allow all required permissions</li>
      <li>Done! Bot will join your server</li>
    </ol>
    
    <h3 id="quick-commands">Quick Commands</h3>
    <div className="docs-command-grid">
      <div className="docs-command-item">
        <code>/play</code>
        <span>Play a song</span>
      </div>
      <div className="docs-command-item">
        <code>/queue</code>
        <span>View the queue</span>
      </div>
      <div className="docs-command-item">
        <code>/skip</code>
        <span>Skip current song</span>
      </div>
      <div className="docs-command-item">
        <code>/pause</code>
        <span>Pause playback</span>
      </div>
      <div className="docs-command-item">
        <code>/resume</code>
        <span>Resume playback</span>
      </div>
      <div className="docs-command-item">
        <code>/leave</code>
        <span>Disconnect bot</span>
      </div>
    </div>
  </div>
);

// Sidebar navigation data with categories
const navCategories = [
  {
    title: 'Getting Started',
    items: [
      { path: '/docs', label: 'Introduction', exact: true },
      { path: '/docs/setup', label: 'Setup Bot' },
    ]
  },
  {
    title: 'Commands',
    items: [
      { path: '/docs/commands', label: 'Music Commands' },
      { path: '/docs/filters', label: 'Audio Filters' },
      { path: '/docs/playlists', label: 'Playlists' },
    ]
  },
  {
    title: 'Premium',
    items: [
      { path: '/docs/premium', label: 'Premium Features' },
    ]
  },
  {
    title: 'Other',
    items: [
      { path: '/docs/dashboard', label: 'Dashboard' },
      { path: '/docs/faq', label: 'FAQ' },
      { path: '/docs/support', label: 'Support' },
    ]
  },
];

// Flatten nav items for navigation
const allNavItems = navCategories.flatMap(cat => cat.items);

// Table of contents for each page
const tableOfContents = {
  '/docs': [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'add-to-server', label: 'Add to Server' },
    { id: 'quick-commands', label: 'Quick Commands' },
  ],
  '/docs/setup': [
    { id: 'automatic-setup', label: 'Automatic Setup' },
    { id: 'manual-setup', label: 'Manual Setup' },
    { id: 'server-configuration', label: 'Server Configuration' },
  ],
  '/docs/commands': [
    { id: 'basic', label: 'Basic' },
    { id: 'controls', label: 'Controls' },
    { id: 'queue-management', label: 'Queue Management' },
  ],
  '/docs/filters': [
    { id: 'available-filters', label: 'Available Filters' },
    { id: 'volume-speed', label: 'Volume & Speed' },
  ],
  '/docs/premium': [
    { id: 'benefits', label: 'Benefits' },
    { id: 'how-to-upgrade', label: 'How to Upgrade' },
    { id: 'premium-commands', label: 'Premium Commands' },
  ],
  '/docs/dashboard': [
    { id: 'how-to-access', label: 'How to Access' },
    { id: 'features', label: 'Features' },
    { id: 'dashboard-menu', label: 'Dashboard Menu' },
  ],
  '/docs/playlists': [
    { id: 'playlist-commands', label: 'Playlist Commands' },
    { id: 'favorites', label: 'Favorites' },
  ],
  '/docs/faq': [
    { id: 'music-issues', label: 'Music Issues' },
    { id: 'support', label: 'Support' },
    { id: 'spotify', label: 'Spotify' },
    { id: 'premium-questions', label: 'Premium Questions' },
    { id: 'bot-offline', label: 'Bot Offline' },
  ],
  '/docs/support': [
    { id: 'links', label: 'Quick Links' },
    { id: 'command-help', label: 'Command Help' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'contact', label: 'Contact Us' },
  ],
};

function Docs() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current page info
  const currentItem = allNavItems.find(item => 
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  ) || allNavItems[0];

  // Get previous and next pages
  const currentIndex = allNavItems.findIndex(item => 
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );
  const prevPage = currentIndex > 0 ? allNavItems[currentIndex - 1] : null;
  const nextPage = currentIndex < allNavItems.length - 1 ? allNavItems[currentIndex + 1] : null;

  // Get table of contents for current page
  const currentTOC = tableOfContents[location.pathname] || [];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="docs-page">
      {/* Mobile Menu Toggle */}
      <button 
        className="docs-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
        Menu
      </button>

      {/* Left Sidebar */}
      <aside className={`docs-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="docs-sidebar-header">
          <Link to="/" className="docs-logo">
            <span className="docs-logo-icon">S</span>
            <span className="docs-logo-text">SpaceBot</span>
          </Link>
          <span className="docs-version">v1.0.0</span>
        </div>

        {/* Search */}
        <div className="docs-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search docs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation */}
        <nav className="docs-nav">
          {navCategories.map((category, idx) => (
            <div key={idx} className="docs-nav-category">
              <h4 className="docs-nav-title">{category.title}</h4>
              {category.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`docs-nav-item ${location.pathname === item.path || (!item.exact && location.pathname.startsWith(item.path) && item.path !== '/docs') ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="docs-main">
        <div className="docs-content-wrapper">
          {/* Content Area */}
          <div className="docs-content">
            {/* Breadcrumb */}
            <div className="docs-breadcrumb">
              <Link to="/docs" className="breadcrumb-link">Docs</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{currentItem.label}</span>
            </div>

            {/* Page Header */}
            <div className="docs-header">
              <h1>{currentItem.label}</h1>
            </div>

            {/* Page Content */}
            <Routes>
              <Route index element={<Introduction />} />
              <Route path="setup" element={<Setup />} />
              <Route path="commands" element={<Commands />} />
              <Route path="filters" element={<Filters />} />
              <Route path="premium" element={<Premium />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="support" element={<Support />} />
            </Routes>

            {/* Footer Navigation */}
            <div className="docs-footer-nav">
              {prevPage ? (
                <Link to={prevPage.path} className="docs-nav-card prev">
                  <span className="docs-nav-card-label">Previous</span>
                  <span className="docs-nav-card-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    {prevPage.label}
                  </span>
                </Link>
              ) : <div />}
              {nextPage ? (
                <Link to={nextPage.path} className="docs-nav-card next">
                  <span className="docs-nav-card-label">Next</span>
                  <span className="docs-nav-card-title">
                    {nextPage.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </span>
                </Link>
              ) : <div />}
            </div>
          </div>

          {/* Right Sidebar - Table of Contents */}
          {currentTOC.length > 0 && (
            <aside className="docs-toc">
              <h4 className="docs-toc-title">On this page</h4>
              <nav className="docs-toc-nav">
                {currentTOC.map(item => (
                  <a 
                    key={item.id} 
                    href={`#${item.id}`}
                    className="docs-toc-item"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Docs;
