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
      { name: 'Standard Audio Quality', included: true },
      { name: 'Basic Support', included: true },
      { name: '24/7 Mode', included: false },
      { name: 'Auto-Play', included: false },
      { name: 'Audio Filters (Bassboost, Nightcore, etc)', included: false },
      { name: 'Volume Control up to 200%', included: false },
      { name: 'Unlimited Favorites', included: false },
      { name: 'Listening History', included: false },
      { name: 'Synchronized Lyrics', included: false }
    ]
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    icon: 'fa-crown',
    color: '#f59e0b',
    popular: true,
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Up to 100 Playlists', included: true },
      { name: '500 Songs Queue', included: true },
      { name: '24/7 Mode (Stay in VC forever)', included: true },
      { name: 'Auto-Play (Auto queue similar songs)', included: true },
      { name: 'Audio Filters (Bassboost, Nightcore, Vaporwave, etc)', included: true },
      { name: 'Volume Control up to 200%', included: true },
      { name: 'Unlimited Favorites', included: true },
      { name: 'Full Listening History', included: true },
      { name: 'Synchronized Lyrics', included: true },
      { name: 'Skip to Position in Queue', included: true },
      { name: 'Priority Support', included: true }
    ]
  }
];

function Pricing() {
  const { isPremium, user } = useAuth();

  const getUserPlan = () => {
    if (!isPremium) return 'Free';
    return 'Premium';
  };

  const currentPlan = getUserPlan();

  return (
    <DashboardLayout title="Premium Plans">
      <div className="pricing-content">
        <div className="pricing-hero">
          <h1>Upgrade Your Experience</h1>
          <p>Unlock premium features and take your music to the next level</p>
          {isPremium && (
            <div className="current-plan-badge">
              <i className="fas fa-crown" />
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
              <p>Contact us on Discord or use the /premiumstatus command to check your status.</p>
            </div>
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> Can I cancel anytime?</h3>
              <p>Yes! Your premium features remain active until the end of the billing period.</p>
            </div>
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> Does premium apply to all servers?</h3>
              <p>Premium is tied to your Discord account, so you can use premium features in any server where SpaceBot is installed.</p>
            </div>
            <div className="faq-item">
              <h3><i className="fas fa-question-circle" /> What payment methods do you accept?</h3>
              <p>We currently accept payments via Discord or direct transfer. Contact us for more info!</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Pricing;
