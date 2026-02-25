import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import './Premium.css';

const premiumFeatures = [
  { icon: 'fa-infinity', title: '24/7 Mode', desc: 'Bot stays in VC forever, even when idle.' },
  { icon: 'fa-wand-magic-sparkles', title: 'Auto-Play', desc: 'Automatically queues similar songs when queue ends.' },
  { icon: 'fa-sliders', title: 'Audio Filters', desc: 'Bassboost, Nightcore, Vaporwave, Demon, 8D, and more.' },
  { icon: 'fa-volume-high', title: 'Volume up to 200%', desc: 'Push the audio beyond the default ceiling.' },
  { icon: 'fa-list', title: '100 Playlists', desc: 'Create and manage up to 100 personal playlists.' },
  { icon: 'fa-heart', title: 'Unlimited Favorites', desc: 'Save as many songs to your favorites as you want.' },
  { icon: 'fa-clock-rotate-left', title: 'Listening History', desc: 'Full history of every song you\'ve played.' },
  { icon: 'fa-microphone-lines', title: 'Synced Lyrics', desc: 'Karaoke-style real-time synchronized lyrics.' },
  { icon: 'fa-forward-step', title: 'Skip to Position', desc: 'Jump directly to any track in your queue.' },
  { icon: 'fa-headset', title: 'Priority Support', desc: 'Get faster responses from our support team.' },
];

function Premium() {
  const { isPremium } = useAuth();

  if (isPremium) {
    return (
      <DashboardLayout title="Premium">
        <div className="premium-page">
          <div className="premium-active-banner">
            <div className="premium-active-icon">
              <i className="fas fa-crown" />
            </div>
            <div className="premium-active-text">
              <h2>You&apos;re Premium! 🎉</h2>
              <p>You have access to all premium features. Enjoy the full SpaceBot experience.</p>
            </div>
          </div>

          <div className="premium-features-grid">
            {premiumFeatures.map((feat) => (
              <div key={feat.title} className="premium-feat-card active">
                <div className="premium-feat-icon">
                  <i className={`fas ${feat.icon}`} />
                </div>
                <div className="premium-feat-body">
                  <h4>{feat.title}</h4>
                  <p>{feat.desc}</p>
                </div>
                <span className="premium-feat-check"><i className="fas fa-check" /></span>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Premium">
      <div className="premium-page">
        {/* Upgrade Hero */}
        <div className="premium-upgrade-hero">
          <div className="premium-upgrade-glow" />
          <div className="premium-upgrade-badge">
            <i className="fas fa-crown" /> Premium
          </div>
          <h1>Unlock Premium Features</h1>
          <p>You&apos;re currently on the Free plan. Upgrade to access all premium features.</p>
          <Link to="/pricing" className="premium-upgrade-btn">
            <i className="fas fa-rocket" /> View Plans & Pricing
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="premium-features-grid">
          {premiumFeatures.map((feat) => (
            <div key={feat.title} className="premium-feat-card locked">
              <div className="premium-feat-icon">
                <i className={`fas ${feat.icon}`} />
              </div>
              <div className="premium-feat-body">
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
              <span className="premium-feat-lock"><i className="fas fa-lock" /></span>
            </div>
          ))}
        </div>

        <div className="premium-cta-row">
          <Link to="/pricing" className="premium-cta-link">
            <i className="fas fa-arrow-right" /> See full comparison on the Pricing page
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Premium;
