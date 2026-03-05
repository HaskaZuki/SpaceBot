import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../../config';
import './PublicNav.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/features', label: 'Features' },
  { to: '/commands', label: 'Commands' },
  { to: '/docs', label: 'Docs' },
  { to: '/status', label: 'Status' },
  { to: '/pricing', label: 'Pricing', crown: true },
];

function PublicNav() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  return (
    <nav className="public-nav">
      <div className="public-nav-container">
        <Link to="/" className="public-nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <span>SpaceBot</span>
        </Link>

        <div className={`public-nav-links ${mobileMenuOpen ? 'show' : ''}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`public-nav-link ${isActive(link) ? 'active' : ''} ${link.crown ? 'crown-link' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.crown && <i className="fas fa-crown" />}
              {link.label}
            </Link>
          ))}

          <div className="public-nav-actions">
            <a
              href={config.inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="public-nav-btn invite-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-plus" /> Invite Bot
            </a>
            <a
              href={`${config.apiUrl}/auth/discord`}
              className="public-nav-btn dashboard-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fab fa-discord" /> Dashboard
            </a>
          </div>
        </div>

        <button
          className={`public-nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

export default PublicNav;
