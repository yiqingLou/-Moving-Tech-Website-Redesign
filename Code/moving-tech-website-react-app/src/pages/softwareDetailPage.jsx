import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import FeatureBadge from "../components/featureBadge";
import { LoadingSpinner, ErrorMessage } from "../components/statusComponents";
import { getSoftwareById } from '../api/client';
import '../styles/global.css';

const FEATURE_SECTIONS = [
  {
    title: 'Sales',
    keys: ['lead_mgmt', 'surveying', 'quoting'],
    labels: { lead_mgmt: 'Lead Management', surveying: 'Surveying', quoting: 'Quoting' },
  },
  {
    title: 'Move Management',
    keys: ['job_booking', 'move_mgmt'],
    labels: { job_booking: 'Job Booking', move_mgmt: 'Move Management' },
  },
  {
    title: 'Operations',
    keys: ['dispatch', 'shipments', 'crew_app', 'storage'],
    labels: {
      dispatch: 'Dispatch',
      shipments: 'Shipments',
      crew_app: 'Crew App',
      storage: 'Storage',
    },
  },
  {
    title: 'ERP / Back Office',
    keys: ['ar', 'ap', 'hr'],
    labels: { ar: 'Accounts Receivable', ap: 'Accounts Payable', hr: 'HR / Payroll' },
  },
];

function FeatureValue({ val }) {
  if (val === null || val === undefined) {
    return <span className="feature-status feature-status--unknown">Unknown</span>;
  }
  const isYes = String(val).toUpperCase() === 'Y';
  return (
    <span className={`feature-status ${isYes ? 'feature-status--yes' : 'feature-status--no'}`}>
      {isYes ? '✓ Yes' : '✗ No'}
    </span>
  );
}

export default function SoftwareDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefer item passed via navigation state; fall back to API fetch
  const [item, setItem] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (item) return; // already have it from router state
    setLoading(true);
    getSoftwareById(id)
      .then((found) => {
        if (!found) setError('Software profile not found.');
        else setItem(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, item]);

  if (loading) return <LoadingSpinner message="Loading software profile…" />;
  if (error) return (
    <div style={{ padding: '60px 24px' }}>
      <ErrorMessage message={error} onRetry={() => navigate('/directory')} />
    </div>
  );
  if (!item) return null;

  return (
    <main className="detail-page">
      {/* Back nav */}
      <div className="detail-page__breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate(-1)}>
          ← Back to Directory
        </button>
      </div>

      {/* Header */}
      <header className="detail-header">
        <div className="detail-header__inner">
          <div className="detail-header__content">
            <div className="detail-header__meta">
              {item.typology && <span className="detail-typology">{item.typology}</span>}
              {item.status && (
                <span className={`detail-status detail-status--${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              )}
            </div>
            <h1 className="detail-header__name">{item.name || 'Unnamed Software'}</h1>
            {item.description && (
              <p className="detail-header__description">{item.description}</p>
            )}
            {item.website && (
              <a
                href={item.website}
                target="_blank"
                rel="noreferrer"
                className="detail-header__website"
              >
                {item.website} ↗
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="detail-body">
        {/* Overview card */}
        <section className="detail-section">
          <h2 className="detail-section__title">Overview</h2>
          <div className="detail-overview-grid">
            {[
              { label: 'Best For', value: item.best_for },
              { label: 'Deployment', value: item.install },
              { label: 'Language', value: item.language },
            ]
              .filter(({ value }) => value)
              .map(({ label, value }) => (
                <div key={label} className="detail-overview-item">
                  <div className="detail-overview-item__label">{label}</div>
                  <div className="detail-overview-item__value">{value}</div>
                </div>
              ))}
          </div>
        </section>

        {/* Feature matrix */}
        {item.features && (
          <section className="detail-section">
            <h2 className="detail-section__title">Feature Coverage</h2>
            <div className="feature-matrix">
              {FEATURE_SECTIONS.map((section) => (
                <div key={section.title} className="feature-matrix__group">
                  <h3 className="feature-matrix__group-title">{section.title}</h3>
                  <div className="feature-matrix__rows">
                    {section.keys.map((key) => (
                      <div key={key} className="feature-matrix__row">
                        <span className="feature-matrix__name">{section.labels[key]}</span>
                        <FeatureValue val={item.features[key]} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {item.notes && (
          <section className="detail-section">
            <h2 className="detail-section__title">Notes & Features</h2>
            <div className="detail-notes">{item.notes}</div>
          </section>
        )}

        {/* Keywords */}
        {item.keywords && (
          <section className="detail-section">
            <h2 className="detail-section__title">Keywords</h2>
            <div className="detail-keywords">
              {item.keywords.split(/[,;]+/).map((kw) => kw.trim()).filter(Boolean).map((kw) => (
                <FeatureBadge key={kw} label={kw} size="md" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}