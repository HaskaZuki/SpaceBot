import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './Header.css';

function Header({ title, onToggleSidebar, showToggle = true }) {
  const { user, logout, getAvatarUrl } = useAuth();
  const { socket, connected, playerState } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const notifIdRef = useRef(0);

  const addNotification = useCallback((icon, text) => {
    const id = ++notifIdRef.current;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [
      { id, icon, text, time: timeStr, read: false },
      ...prev
    ].slice(0, 20));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTrackStart = (track) => {
      const trackTitle = track?.title || track?.info?.title || 'Unknown Track';
      addNotification('fa-play', `Now playing: ${trackTitle}`);
    };

    const handleQueueUpdate = (queue) => {
      if (queue && queue.length > 0) {
        addNotification('fa-list', `Queue updated: ${queue.length} track${queue.length > 1 ? 's' : ''}`);
      }
    };

    const handlePlayerUpdate = (data) => {
      if (data?.action === 'stopped') {
        addNotification('fa-stop', 'Playback stopped');
      } else if (data?.action === 'shuffled') {
        addNotification('fa-random', 'Queue shuffled');
      }
    };

    socket.on('trackStart', handleTrackStart);
    socket.on('queueUpdate', handleQueueUpdate);
    socket.on('player:update', handlePlayerUpdate);

    return () => {
      socket.off('trackStart', handleTrackStart);
      socket.off('queueUpdate', handleQueueUpdate);
      socket.off('player:update', handlePlayerUpdate);
    };
  }, [socket, addNotification]);

  useEffect(() => {
    if (connected && notifications.length === 0) {
      addNotification('fa-plug', 'Connected to server');
    }
  }, [connected]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setNotifOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-nav">
      <div className="nav-left">
        {showToggle && (
          <button className="toggle-btn" onClick={onToggleSidebar}>
            <i className="fas fa-bars" />
          </button>
        )}
      </div>

      <div className="nav-center">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="nav-right">
        <div className="notif-menu" ref={notifRef}>
          <button
            className="notif-btn"
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
          >
            <i className="fas fa-bell" />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown show">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                <div className="notif-header-actions">
                  {unreadCount > 0 && (
                    <button className="notif-action-btn" onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button className="notif-action-btn" onClick={clearNotifications}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <i className="fas fa-bell-slash" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notif-item ${notif.read ? 'read' : ''}`}>
                      <div className="notif-item-icon">
                        <i className={`fas ${notif.icon}`} />
                      </div>
                      <div className="notif-item-content">
                        <p>{notif.text}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                      {!notif.read && <div className="notif-unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-menu" ref={dropdownRef}>
          <button className="user-btn" onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}>
            <img
              src={user ? getAvatarUrl(user) : '/images/default-avatar.png'}
              alt="User"
              className="user-avatar"
            />
            <span className="user-name">{user?.username || 'Loading...'}</span>
            <i className="fas fa-chevron-down chevron-icon" />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown show">
              <div className="user-dropdown-header">
                <img
                  src={user ? getAvatarUrl(user) : '/images/default-avatar.png'}
                  alt="User"
                  className="dropdown-avatar"
                />
                <div className="user-dropdown-info">
                  <div className="name">{user?.username || 'Loading...'}</div>
                  <div className="status">via Discord</div>
                </div>
              </div>
              <div className="user-dropdown-menu">
                <Link to="/settings" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <i className="fas fa-cog" />
                  Settings
                </Link>
                <Link to="/pricing" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <i className="fas fa-crown" />
                  Premium
                </Link>
                <button onClick={logout} className="user-dropdown-item">
                  <i className="fas fa-sign-out-alt" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
