import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import './Leaderboard.css';
function Leaderboard() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="leaderboard-page">
        <div className="leaderboard-header">
          <h1 className="page-title">
            <i className="fas fa-trophy"></i>
            Leaderboard
          </h1>
          <p className="page-subtitle">Top listeners in your server</p>
        </div>
        <div className="leaderboard-redirect">
          <div className="redirect-card">
            <div className="redirect-icon">
              <i className="fas fa-server"></i>
            </div>
            <h2>Server Leaderboard</h2>
            <p>
              The leaderboard now shows top listeners per server. 
              Go to Dashboard, select a server, and view the leaderboard for that specific server.
            </p>
            <button className="redirect-btn" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-external-link-alt"></i>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
export default Leaderboard;
