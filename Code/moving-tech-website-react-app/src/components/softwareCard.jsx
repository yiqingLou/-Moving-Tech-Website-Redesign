import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureBadge from './featureBadge';
import '../styles/components.css';

const FEATURE_LABELS = {
  lead_mgmt: 'Lead Mgmt',
  surveying: 'Surveying',
  quoting: 'Quoting',
  job_booking: 'Job Booking',
  move_mgmt: 'Move Mgmt',
  dispatch: 'Dispatch',
  shipments: 'Shipments',
  crew_app: 'Crew App',
  storage: 'Storage',
  ar: 'AR',
  ap: 'AP',
  hr: 'HR',
};

export default function SoftwareCard({ item }) {
  const navigate = useNavigate();

  const activeFeatures = item.features
    ? Object.entries(item.features)
        .filter(([, val]) => val && val.toUpperCase() === 'Y')
        .map(([key]) => FEATURE_LABELS[key] || key)
    : [];

  const handleClick = () => {
    navigate(`/software/${item.id}`, { state: { item } });
  };

  return (
    <article className="software-card" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
      <div className="software-card__header">
        <div className="software-card__title-group">
          <h3 className="software-card__name">{item.name || 'Unnamed'}</h3>
          {item.typology && (
            <span className="software-card__typology">{item.typology}</span>
          )}
        </div>
        {item.status && (
          <span className={`software-card__status software-card__status--${item.status.toLowerCase()}`}>
            {item.status}
          </span>
        )}
      </div>

      {item.description && (
        <p className="software-card__description">{item.description}</p>
      )}

      <div className="software-card__meta">
        {item.best_for && (
          <div className="software-card__meta-item">
            <span className="software-card__meta-label">Best For</span>
            <span className="software-card__meta-value">{item.best_for}</span>
          </div>
        )}
        {item.install && (
          <div className="software-card__meta-item">
            <span className="software-card__meta-label">Deployment</span>
            <span className="software-card__meta-value">{item.install}</span>
          </div>
        )}
        {item.language && (
          <div className="software-card__meta-item">
            <span className="software-card__meta-label">Language</span>
            <span className="software-card__meta-value">{item.language}</span>
          </div>
        )}
      </div>

      {activeFeatures.length > 0 && (
        <div className="software-card__features">
          {activeFeatures.slice(0, 8).map((feat) => (
            <FeatureBadge key={feat} label={feat} />
          ))}
          {activeFeatures.length > 8 && (
            <span className="software-card__features-more">+{activeFeatures.length - 8} more</span>
          )}
        </div>
      )}

      <div className="software-card__footer">
        {item.website && (
          <a
            href={item.website}
            className="software-card__website"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Visit website ↗
          </a>
        )}
        <span className="software-card__view-link">View profile →</span>
      </div>
    </article>
  );
}