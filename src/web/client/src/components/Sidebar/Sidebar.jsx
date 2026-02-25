import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

// ============================================
// LOGO CONFIGURATION - Ganti dengan URL logo bot Anda
// ============================================
const BOT_LOGO = 'https://cdn.discordapp.com/icons/1447235805813805101/a_c2b5e9e9e9e9e9e9e9e9e9e9e9e9e9e9.png'; // Ganti dengan logo bot Anda
// ============================================

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/music', label: 'Music Player' },
  { path: '/playlists', label: 'Playlists' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/updates', label: 'Updates' },
  { path: '/docs', label: 'Docs' },
  { path: '/pricing', label: 'Premium' }
];

function Sidebar({ collapsed, open, onToggle }) {
  const { isPremium } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={BOT_LOGO} alt="SpaceBot" className="logo-icon-img" />
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
            {item.path === '/pricing' && isPremium && !collapsed && (
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
