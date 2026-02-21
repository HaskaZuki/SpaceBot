import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import './Pricing.css';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: 'fa-music',
    color: '#64748b',
    features: [
      { name: 'Basic Music Playback', included: true },
      { name: 'Up to 3 Playlists', included: true },
      { name: '50 Songs Queue', included: true },
      { name: 'Normal Audio (64kbps)', included: true },
      { name: 'Basic Support', included: true },
      { name: '24/7 Mode', included: false },
      { name: 'Auto-Play', included: false },
      { name: 'Audio Filters', included: false },
      { name: 'Volume Control (200%)', included: false },
      { name: 'HD Audio Quality', included: false }
    ]
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    icon: 'fa-gem',
    color: '#6366f1',
    popular: true,
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Up to 100 Playlists', included: true },
      { name: '500 Songs Queue', included: true },
      { name: 'HD Audio (128kbps)', included: true },
      { name: '24/7 Mode', included: true },
      { name: 'Auto-Play', included: true },
      { name: 'Audio Filters', included: true },
      { name: 'Volume Up to 200%', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Ultra HD Audio', included: false }
    ]
  },
  {
    name: 'Pro Plus',
    price: '$9.99',
    period: '/month',
    icon: 'fa-crown',
    color: '#f59e0b',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Unlimited Playlists', included: true },
      { name: 'Unlimited Queue', included: true },
      { name: 'Ultra HD Audio (256kbps)', included: true },
      { name: 'Custom Bot Name', included: true },
      { name: 'Custom Bot Avatar', included: true },
      { name: 'Early Access Features', included: true },
      { name: 'Dedicated Support', included: true },
      { name: 'Multi-Server Premium', included: true },
      { name: 'Advanced Analytics', included: true }
    ]
  }
];

function Pricing() {
  const { isPremium, user } = useAuth();

  const getUserPlan = () => {
    if (!isPremium) return 'Free';
    return 'Pro';
  };

  const currentPlan = getUserPlan();

  return (
    <DashboardLayout title="💎 Premium Plans">
      <div className="pricing-content">
        <div className="pricing-hero">
          <h1>Upgrade Your Experience</h1>
          <p>Unlock premium features and take your music to the next level</p>
          {isPremium && (
            <div className="current-plan-badge">
              <i className="fas fa-gem" />
              You're on the <strong>{currentPlan}</strong> plan
            </div>
          )}
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === currentPlan;
            return (
              <div key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                {isCurrentPlan && <div className="current-badge">Current Plan</div>}

                <div className="plan-header">
                  <div className="plan-icon" style={{ background: `${plan.color}20`, color: plan.color }}>
                    <i className={`fas ${plan.icon}`} />
                  </div>
                  <h2 className="plan-name">{plan.name}</h2>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className={`plan-feature ${feature.included ? 'included' : 'excluded'}`}>
                      <i className={`fas ${feature.included ? 'fa-check' : 'fa-times'}`} />
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>

                <div className="plan-action">
                  {isCurrentPlan ? (
                    <button className="btn btn-current" disabled>
                      <i className="fas fa-check" /> Current Plan
                    </button>
                  ) : plan.name === 'Free' ? (
                    <button className="btn btn-secondary" disabled>Free Forever</button>
                  ) : (
                    <button className="btn btn-primary" style={{ background: plan.color }}>
                      <i className="fas fa-rocket" /> Get {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pricing-faq">
          <h2>FAQ</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> How do I activate Premium?</h3>
              <p>Contact us on Discord or use the /premium command in any server.</p>
            </div>
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> Can I cancel anytime?</h3>
              <p>Yes! Downgrade at any time. Your premium features remain active until the end of the billing period.</p>
            </div>
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> Does premium apply to all servers?</h3>
              <p>Pro covers one server. Pro Plus includes multi-server premium support.</p>
            </div>
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> What payment methods do you accept?</h3>
              <p>We currently accept payments via Discord or direct transfer. More options coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Pricing;
