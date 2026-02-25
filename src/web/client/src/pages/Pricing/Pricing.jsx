import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import config from '../../config';
import './Pricing.css';

const comparisonFeatures = [
  { category: 'Music Playback', features: [
    { name: 'Basic Music Playback', free: true, premium: true },
    { name: 'Songs Queue', free: '50 songs', premium: '500 songs' },
    { name: 'Audio Quality', free: 'Standard', premium: 'High Quality' },
    { name: '24/7 Stay in Voice Channel', free: false, premium: true },
    { name: 'Auto-Play Similar Songs', free: false, premium: true },
  ]},
  { category: 'Playlists & Library', features: [
    { name: 'Playlists', free: 'Up to 3', premium: 'Up to 100' },
    { name: 'Favorites', free: 'Limited', premium: 'Unlimited' },
    { name: 'Listening History', free: false, premium: true },
  ]},
  { category: 'Audio Effects', features: [
    { name: 'Audio Filters (Bassboost, Nightcore, Vaporwave)', free: false, premium: true },
    { name: 'Volume Control up to 200%', free: false, premium: true },
    { name: 'Synchronized Lyrics', free: false, premium: true },
  ]},
  { category: 'Advanced Controls', features: [
    { name: 'Skip to Any Position in Queue', free: false, premium: true },
    { name: 'Priority Support', free: false, premium: true },
  ]},
];

function FeatureValue({ value, isPremium }) {
  if (value === true) return <span className={`feat-yes ${isPremium ? 'feat-yes-premium' : ''}`}><i className="fas fa-check" /></span>;
  if (value === false) return <span className="feat-no"><i className="fas fa-times" /></span>;
  return <span className={`feat-label ${isPremium ? 'feat-label-premium' : ''}`}>{value}</span>;
}

function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing pricing-public-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo"><span>SpaceBot</span></Link>
          <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/commands" className="nav-link">Commands</Link>
            <Link to="/pricing" className="nav-link active">Pricing</Link>
            <a href={`${config.apiUrl}/auth/discord`} className="nav-btn"><i className="fab fa-discord" /> Dashboard</a>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fas fa-bars" />
          </button>
        </div>
      </nav>

      <div className="pricing-page-body">
        <div className="pricing-content">
          {/* Hero */}
          <div className="pricing-hero">
            <div className="pricing-hero-badge">
              <i className="fas fa-rocket" /> Upgrade Today
            </div>
            <h1>Unlock the Full Experience</h1>
            <p>Take your music to the next level with SpaceBot Premium</p>
          </div>

          {/* Plan Cards */}
          <div className="plans-grid">
            {/* Free Plan */}
            <div className="plan-card">
              <div className="plan-header">
                <div className="plan-icon free-icon">
                  <i className="fas fa-music" />
                </div>
                <h2 className="plan-name">Free</h2>
                <div className="plan-price">
                  <span className="price">$0</span>
                  <span className="period">forever</span>
                </div>
                <p className="plan-desc">Everything you need to get started</p>
              </div>
              <ul className="plan-features-list">
                <li><i className="fas fa-check" /> Basic Music Playback</li>
                <li><i className="fas fa-check" /> Up to 3 Playlists</li>
                <li><i className="fas fa-check" /> 50 Songs Queue</li>
                <li><i className="fas fa-check" /> Standard Audio Quality</li>
                <li><i className="fas fa-check" /> Basic Support</li>
              </ul>
              <div className="plan-action">
                <a href={`${config.apiUrl}/auth/discord`} className="btn btn-secondary">
                  Get Started Free
                </a>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="plan-card premium-card">
              <div className="premium-glow" />
              <div className="popular-badge"><i className="fas fa-star" /> Most Popular</div>
              <div className="plan-header">
                <div className="plan-icon premium-icon">
                  <i className="fas fa-crown" />
                </div>
                <h2 className="plan-name premium-name">Premium</h2>
                <div className="plan-price">
                  <span className="price premium-price">$4.99</span>
                  <span className="period">/month</span>
                </div>
                <p className="plan-desc">Unlock every feature, no limits</p>
              </div>
              <ul className="plan-features-list premium-features-list">
                <li><i className="fas fa-check" /> Everything in Free</li>
                <li><i className="fas fa-check" /> Up to 100 Playlists</li>
                <li><i className="fas fa-check" /> 500 Songs Queue</li>
                <li><i className="fas fa-check" /> 24/7 Stay in Voice Channel</li>
                <li><i className="fas fa-check" /> Auto-Play Similar Songs</li>
                <li><i className="fas fa-check" /> Audio Filters (Bassboost, Nightcore…)</li>
                <li><i className="fas fa-check" /> Volume Control up to 200%</li>
                <li><i className="fas fa-check" /> Unlimited Favorites</li>
                <li><i className="fas fa-check" /> Full Listening History</li>
                <li><i className="fas fa-check" /> Synchronized Lyrics</li>
                <li><i className="fas fa-check" /> Skip to Position in Queue</li>
                <li><i className="fas fa-check" /> Priority Support</li>
              </ul>
              <div className="plan-action">
                <a href="https://discord.gg/spacebot" target="_blank" rel="noopener noreferrer" className="btn btn-premium">
                  <i className="fas fa-rocket" /> Get Premium
                </a>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="comparison-section">
            <div className="comparison-header">
              <h2>Full Feature Comparison</h2>
              <p>See exactly what you get with each plan</p>
            </div>

            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="feature-col">Feature</th>
                    <th className="free-col">Free</th>
                    <th className="premium-col">
                      <span className="premium-col-label">
                        <i className="fas fa-crown" /> Premium
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((section) => (
                    <React.Fragment key={section.category}>
                      <tr className="category-row">
                        <td colSpan={3}>{section.category}</td>
                      </tr>
                      {section.features.map((feat) => (
                        <tr key={feat.name} className="feature-row">
                          <td className="feature-name">{feat.name}</td>
                          <td className="free-cell"><FeatureValue value={feat.free} isPremium={false} /></td>
                          <td className="premium-cell"><FeatureValue value={feat.premium} isPremium={true} /></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="pricing-faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3><i className="fas fa-question-circle" /> How do I activate Premium?</h3>
                <p>Contact us on Discord or use the <code>/premiumstatus</code> command to check your status.</p>
              </div>
              <div className="faq-item">
                <h3><i className="fas fa-question-circle" /> Can I cancel anytime?</h3>
                <p>Yes! Your premium features remain active until the end of the billing period.</p>
              </div>
              <div className="faq-item">
                <h3><i className="fas fa-question-circle" /> Does premium apply to all servers?</h3>
                <p>Premium is tied to your Discord account and works in any server where SpaceBot is installed.</p>
              </div>
              <div className="faq-item">
                <h3><i className="fas fa-question-circle" /> What payment methods are accepted?</h3>
                <p>We accept payments via Discord or direct transfer. Contact us for more info!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Pricing;
