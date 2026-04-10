import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/playlists', label: 'Playlists' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/updates', label: 'Updates' },
  { path: '/docs', label: 'Docs' },
  { path: '/premium', label: 'Premium' }
];

function Sidebar({ collapsed, open, onToggle }) {
  const { isPremium } = useAuth();
  const [botAvatar, setBotAvatar] = useState(null);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/bot-info`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.avatarUrl) setBotAvatar(data.avatarUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {botAvatar ? (
            <img src={botAvatar} alt="SpaceBot" className="logo-icon-img" />
          ) : (
            <div className="logo-icon-placeholder">
              <i className="fas fa-robot" />
            </div>
          )}
          {!collapsed && <span className="logo-text">SpaceBot</span>}
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {!collapsed && <span className="nav-text">{item.label}</span>}
            {item.path === '/premium' && isPremium && !collapsed && (
              <span className="premium-badge-mini">PRO</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        {!collapsed && isPremium && (
          <div className="premium-status-mini">
            <span>Premium Active</span>
          </div>
        )}
        <NavLink to="/settings" className="nav-item">
          {!collapsed && <span className="nav-text">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
