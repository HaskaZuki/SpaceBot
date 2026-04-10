import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import config from '../../config';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [botAvatar, setBotAvatar] = useState(null);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/bot-info`)
      .then(res => res.json())
      .then(data => {
        if (data.avatarUrl) setBotAvatar(data.avatarUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            {botAvatar && (
              <img src={botAvatar} alt="SpaceBot Logo" className="footer-logo-img" />
            )}
            <span className="footer-title">SpaceBot</span>
          </div>
          <p className="footer-desc">
            A Discord music bot with premium features, 
            Lavalink support, and dashboard control.
          </p>
          <div className="footer-social">
            <a href="https://discord.gg/CFRKf8mXe4" target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
              <i className="fab fa-discord"></i>
            </a>
            <a href="https://github.com/HaskaZuki/SpaceBot" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <NavLink to="/features" className="footer-link">Features</NavLink>
            <NavLink to="/pricing" className="footer-link">Premium</NavLink>
            <NavLink to="/commands" className="footer-link">Commands</NavLink>
            <NavLink to="/docs" className="footer-link">Documentation</NavLink>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Community</h4>
            <a href="https://discord.gg/CFRKf8mXe4" target="_blank" rel="noopener noreferrer" className="footer-link">Discord Server</a>
            <NavLink to="/leaderboard" className="footer-link">Leaderboard</NavLink>
            <NavLink to="/updates" className="footer-link">Changelog</NavLink>
            <NavLink to="/status" className="footer-link">Status</NavLink>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <NavLink to="/privacy" className="footer-link">Privacy Policy</NavLink>
            <NavLink to="/terms" className="footer-link">Terms of Service</NavLink>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="copyright">
          © {currentYear} SpaceBot. All rights reserved.
        </p>
        <p className="footer-version">
          Made with <span className="heart">❤️</span> by SpaceBot Team
        </p>
      </div>
    </footer>
  );
}
export default Footer;
