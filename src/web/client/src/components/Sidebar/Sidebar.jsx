import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: 'fa-home', label: 'Dashboard' },
  { path: '/music', icon: 'fa-music', label: 'Music Player' },
  { path: '/playlists', icon: 'fa-list', label: 'Playlists' },
  { path: '/analytics', icon: 'fa-chart-bar', label: 'Analytics' },
  { path: '/commands', icon: 'fa-terminal', label: 'Commands' },
  { path: '/leaderboard', icon: 'fa-trophy', label: 'Leaderboard' },
  { path: '/updates', icon: 'fa-bullhorn', label: 'Updates' },
  { path: '/docs', icon: 'fa-book', label: 'Docs' },
  { path: '/features', icon: 'fa-star', label: 'Features' },
  { path: '/pricing', icon: 'fa-crown', label: 'Premium' }
];

function Sidebar({ collapsed, open, onToggle }) {
  const { isPremium } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">🚀</div>
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
            <i className={`nav-icon fas ${item.icon}`} />
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
            <i className="fas fa-gem" />
            <span>Premium Active</span>
          </div>
        )}
        <NavLink to="/settings" className="nav-item">
          <i className="nav-icon fas fa-cog" />
          {!collapsed && <span className="nav-text">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
