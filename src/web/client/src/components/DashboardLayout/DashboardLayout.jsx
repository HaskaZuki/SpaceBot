import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './DashboardLayout.css';

function DashboardLayout({ children, title }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', newState);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    window.location.href = `${config.apiUrl}/auth/discord`;
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'white', marginTop: '1rem' }}>Redirecting to Discord...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        collapsed={sidebarCollapsed} 
        open={sidebarOpen}
        onToggle={toggleSidebar}
      />
      <Header 
        title={title} 
        onToggleSidebar={toggleSidebar}
      />
      <main className="main-content">
        {children}
      </main>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

export default DashboardLayout;
