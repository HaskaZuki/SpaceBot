import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';const BOT_LOGO = 'https://cdn.discordapp.com/icons/1447235805813805101/a_c2b5e9e9e9e9e9e9e9e9e9e9e9e9e9e9.png'; // Ganti dengan logo bot Anda
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={BOT_LOGO} alt="SpaceBot Logo" className="footer-logo-img" />
            <span className="footer-title">SpaceBot</span>
          </div>
          <p className="footer-desc">
            A Discord music bot with premium features, 
            Lavalink support, and dashboard control.
          </p>
          <div className="footer-social">
            <a href="https://discord.gg/q3aHaNhUgk" target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
              <i className="fab fa-discord"></i>
            </a>
            <a href="https://github.com/SpaceBot" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://twitter.com/spacebot" target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://youtube.com/spacebot" target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
              <i className="fab fa-youtube"></i>
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
            <a href="https://discord.gg/q3aHaNhUgk" target="_blank" rel="noopener noreferrer" className="footer-link">Discord Server</a>
            <NavLink to="/leaderboard" className="footer-link">Leaderboard</NavLink>
            <NavLink to="/updates" className="footer-link">Changelog</NavLink>
            <a href="https://github.com/spacebot/issues" target="_blank" rel="noopener noreferrer" className="footer-link">Report Bug</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <NavLink to="/privacy" className="footer-link">Privacy Policy</NavLink>
            <NavLink to="/terms" className="footer-link">Terms of Service</NavLink>
            <NavLink to="/refund" className="footer-link">Refund Policy</NavLink>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="copyright">
          © {currentYear} SpaceBot. All rights reserved.
        </p>
        <p className="footer-version">
          Version 1.0.0 • Made with <span className="heart">❤️</span> by SpaceBot Team
        </p>
      </div>
    </footer>
  );
}
export default Footer;
