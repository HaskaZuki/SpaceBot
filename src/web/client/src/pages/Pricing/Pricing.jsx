import React, { useState } from 'react';
import Footer from '../../components/Footer';
import config from '../../config';
import PublicNav from '../../components/PublicNav/PublicNav';
import './Pricing.css';

const FREE_FEATURES = [
  { icon: 'fa-music', text: 'Basic Music Playback' },
  { icon: 'fa-list', text: 'Up to 3 Playlists' },
  { icon: 'fa-layer-group', text: '50 Songs Queue' },
  { icon: 'fa-headphones', text: 'Standard Audio Quality' },
  { icon: 'fa-comments', text: 'Community Support' },
];

const PREMIUM_FEATURES = [
  { icon: 'fa-infinity', text: 'Up to 100 Playlists' },
  { icon: 'fa-layer-group', text: '500 Songs Queue' },
  { icon: 'fa-clock', text: '24/7 Stay in Voice Channel' },
  { icon: 'fa-robot', text: 'Auto-Play Similar Songs' },
  { icon: 'fa-sliders', text: 'Dynamic Audio Filters + Custom Levels' },
  { icon: 'fa-volume-high', text: 'Volume Control up to 200%' },
  { icon: 'fa-heart', text: 'Unlimited Favorites' },
  { icon: 'fa-history', text: 'Full Listening History' },
  { icon: 'fa-forward', text: 'Skip to Position in Queue' },
  { icon: 'fa-headset', text: 'Priority Support' },
];

const COMPARISON = [
  { label: 'Music Playback', rows: [
    { name: 'Basic Music Playback',            free: true,        premium: true },
    { name: 'Songs Queue Size',                free: '50 songs',  premium: '500 songs' },
    { name: 'Audio Quality',                   free: 'Standard',  premium: 'High Quality' },
    { name: '24/7 Voice Channel Mode',         free: false,       premium: true },
    { name: 'Auto-Play Similar Songs',         free: false,       premium: true },
  ]},
  { label: 'Playlists & Library', rows: [
    { name: 'Playlists',                       free: 'Up to 3',   premium: 'Up to 100' },
    { name: 'Favorites',                       free: 'Limited',   premium: 'Unlimited' },
    { name: 'Listening History',               free: false,       premium: true },
  ]},
  { label: 'Audio Effects', rows: [
    { name: 'Audio Filters (with custom level)', free: false,     premium: true },
    { name: 'Volume Control (up to 200%)',     free: false,       premium: true },
  ]},
  { label: 'Advanced Controls', rows: [
    { name: 'Skip to Any Queue Position',      free: false,       premium: true },
    { name: 'Priority Support',                free: false,       premium: true },
  ]},
];

const FAQS = [
  { q: 'How do I activate Premium?', a: 'Contact us on the support server or use the /premiumstatus command to see how to upgrade your account or server.' },
  { q: 'Can I cancel anytime?', a: 'Yes! Your premium features stay active until the end of your billing period. No hidden fees.' },
  { q: 'Does premium work in all servers?', a: 'Premium is tied to your Discord account and activates in any server where SpaceBot is installed.' },
  { q: 'What payment methods are accepted?', a: 'We accept direct transfers and Discord-based payments. Reach out to us on Discord for details.' },
];

function CellValue({ val, gold }) {
  if (val === true)  return <span className={`cmp-check ${gold ? 'cmp-check--gold' : ''}`}><i className="fas fa-check" /></span>;
  if (val === false) return <span className="cmp-cross"><i className="fas fa-times" /></span>;
  return <span className={`cmp-text ${gold ? 'cmp-text--gold' : ''}`}>{val}</span>;
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-card ${open ? 'faq-card--open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="faq-card-header">
        <span>{q}</span>
        <i className={`fas fa-chevron-down faq-chevron ${open ? 'faq-chevron--open' : ''}`} />
      </div>
      {open && <p className="faq-card-body">{a}</p>}
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="landing pricing-page">
      <PublicNav />
      <div className="pricing-body">

        {/* ── Hero ── */}
        <div className="pricing-hero">
          <div className="pricing-hero-badge"><i className="fas fa-rocket" /> Upgrade Today</div>
          <h1>Unlock the Full Experience</h1>
          <p>Take your music to the next level with SpaceBot Premium</p>
        </div>

        {/* ── Plan Cards ── */}
        <div className="plans-row">
          {/* Free */}
          <div className="plan-card plan-card--free">
            <div className="plan-card-header">
              <div className="plan-icon plan-icon--free"><i className="fas fa-music" /></div>
              <h2 className="plan-title">Free</h2>
              <div className="plan-price"><span className="plan-price-amount">$0</span><span className="plan-price-period">forever</span></div>
              <p className="plan-subtitle">Everything you need to get started</p>
            </div>
            <ul className="plan-list">
              {FREE_FEATURES.map(f => (
                <li key={f.text}><i className={`fas ${f.icon}`} />{f.text}</li>
              ))}
            </ul>
            <a href={`${config.apiUrl}/auth/discord`} className="plan-btn plan-btn--free">Get Started Free</a>
          </div>

          {/* Premium */}
          <div className="plan-card plan-card--premium">
            <div className="plan-glow" />
            <div className="plan-badge"><i className="fas fa-star" /> Most Popular</div>
            <div className="plan-card-header">
              <div className="plan-icon plan-icon--premium"><i className="fas fa-crown" /></div>
              <h2 className="plan-title plan-title--premium">Premium</h2>
              <div className="plan-price">
                <span className="plan-price-amount plan-price-amount--premium">$4.99</span>
                <span className="plan-price-period">/month</span>
              </div>
              <p className="plan-subtitle">Unlock every feature, no limits</p>
            </div>
            <ul className="plan-list plan-list--premium">
              <li className="plan-list-inherit"><i className="fas fa-check-double" />Everything in Free</li>
              {PREMIUM_FEATURES.map(f => (
                <li key={f.text}><i className={`fas ${f.icon}`} />{f.text}</li>
              ))}
            </ul>
            <a href={config.supportUrl} target="_blank" rel="noopener noreferrer" className="plan-btn plan-btn--premium">
              <i className="fas fa-rocket" /> Get Premium
            </a>
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <section className="cmp-section">
          <div className="cmp-header">
            <h2>Full Feature Comparison</h2>
            <p>See exactly what you get with each plan</p>
          </div>

          <div className="cmp-table">
            {/* Sticky header row */}
            <div className="cmp-row cmp-row--head">
              <div className="cmp-col-feature">Feature</div>
              <div className="cmp-col-plan">Free</div>
              <div className="cmp-col-plan cmp-col-plan--premium">
                <i className="fas fa-crown" /> Premium
              </div>
            </div>

            {COMPARISON.map(section => (
              <React.Fragment key={section.label}>
                <div className="cmp-row cmp-row--section">{section.label}</div>
                {section.rows.map(row => (
                  <div className="cmp-row cmp-row--feature" key={row.name}>
                    <div className="cmp-col-feature">{row.name}</div>
                    <div className="cmp-col-plan"><CellValue val={row.free} gold={false} /></div>
                    <div className="cmp-col-plan cmp-col-plan--premium"><CellValue val={row.premium} gold={true} /></div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
