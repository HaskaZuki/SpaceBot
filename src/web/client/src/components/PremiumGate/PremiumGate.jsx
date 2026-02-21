import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PremiumGate.css';

function PremiumGate({ children, feature = 'this feature' }) {
  const { isPremium } = useAuth();

  if (isPremium) {
    return children;
  }

  return (
    <div className="premium-gate">
      <div className="premium-gate-overlay">
        <div className="premium-gate-content">
          <div className="premium-gate-icon">
            <i className="fas fa-crown" />
          </div>
          <h3>Premium Required</h3>
          <p>Upgrade to unlock {feature}</p>
          <Link to="/pricing" className="premium-gate-btn">
            <i className="fas fa-rocket" /> Upgrade Now
          </Link>
        </div>
      </div>
      <div className="premium-gate-blurred">
        {children}
      </div>
    </div>
  );
}

export default PremiumGate;
