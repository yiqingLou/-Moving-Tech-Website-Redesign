import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const PREVIEW_ITEMS = [
  {
    name: 'SmartMoving',
    typology: 'Moving ERP / CRM',
    description: 'Full-suite platform covering lead management, quoting, dispatch, and accounting for residential movers.',
    features: ['Lead Mgmt', 'Quoting', 'Dispatch', 'AR'],
  },
  {
    name: 'MoveBoard',
    typology: 'Field Service Mgmt',
    description: 'Real-time operations board with crew dispatch, GPS tracking, and mobile crew app for local moving companies.',
    features: ['Dispatch', 'Crew App', 'Move Mgmt'],
  },
  {
    name: 'ReloPoint',
    typology: 'Relocation Management',
    description: 'Corporate relocation management platform handling assignee moves, policy management, and expense reporting.',
    features: ['Move Mgmt', 'Shipments', 'HR'],
  },
];

const STATS = [
  { number: '150+', label: 'Software profiles' },
  { number: '12', label: 'Categories covered' },
  { number: '50+', label: 'Features tracked' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing">
      {/* Background decoration */}
      <div className="landing__glow landing__glow--1" />
      <div className="landing__glow landing__glow--2" />

      <div className="landing__inner">
        {/* Hero */}
        <section className="hero">
          <div className="hero__content">
            <span className="hero__eyebrow">Moving Software Comparison Platform</span>

            <h1 className="hero__title">
              Find the right software<br />
              <em>for your moving company.</em>
            </h1>

            <p className="hero__lead">
              A neutral, structured directory of 150+ software tools built for
              moving and relocation companies — from CRMs and dispatch systems to
              international relocation platforms.
            </p>

            <div className="hero__actions">
              <button className="btn btn--primary" onClick={() => navigate('/directory')}>
                Browse the Directory →
              </button>
              <button className="btn btn--ghost" onClick={() => navigate('/directory')}>
                Filter by feature
              </button>
            </div>

            <div className="hero__stats">
              {STATS.map(({ number, label }) => (
                <div key={label} className="hero__stat">
                  <div className="hero__stat-number">{number}</div>
                  <div className="hero__stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="hero__preview">
            <div className="preview-card">
              <div className="preview-card__header">
                <div>
                  <div className="preview-card__label">Live Directory</div>
                  <div className="preview-card__title">Software Explorer</div>
                </div>
                <span className="preview-card__live">● Live</span>
              </div>

              {PREVIEW_ITEMS.map((item) => (
                <div key={item.name} className="preview-item">
                  <div className="preview-item__top">
                    <div>
                      <div className="preview-item__name">{item.name}</div>
                      <div className="preview-item__type">{item.typology}</div>
                    </div>
                  </div>
                  <p className="preview-item__desc">{item.description}</p>
                  <div className="preview-item__features">
                    {item.features.map((f) => (
                      <span key={f} className="preview-item__feature">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="value-props">
          <div className="value-prop">
            <div className="value-prop__icon">◈</div>
            <h3 className="value-prop__title">Vendor-neutral</h3>
            <p className="value-prop__text">
              No paid placements. Data is sourced from public vendor information and
              validated by our editorial team before publishing.
            </p>
          </div>
          <div className="value-prop">
            <div className="value-prop__icon">⊞</div>
            <h3 className="value-prop__title">Structured data</h3>
            <p className="value-prop__text">
              Every profile uses a standardized schema covering 12 capability flags,
              deployment type, target market, and language support.
            </p>
          </div>
          <div className="value-prop">
            <div className="value-prop__icon">⌖</div>
            <h3 className="value-prop__title">Filter by need</h3>
            <p className="value-prop__text">
              Search by software type, target market, deployment model, or specific
              features like dispatch, crew app, or AR billing.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}