import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import FeatureBadge from "../components/featureBadge";
import { LoadingSpinner, ErrorMessage } from "../components/statusComponents";
import { getSoftwareById } from '../api/client';
import { toTitleCase, normalizeLanguage } from '../components/filterPanel';
import '../styles/global.css';

const FEATURE_SECTIONS = [
  {
    title: 'Sales',
    icon: '◈',
    keys: ['lead_mgmt', 'surveying', 'quoting'],
    labels: { lead_mgmt: 'Lead Management', surveying: 'Surveying', quoting: 'Quoting' },
  },
  {
    title: 'Move Management',
    icon: '⬡',
    keys: ['job_booking', 'move_mgmt'],
    labels: { job_booking: 'Job Booking', move_mgmt: 'Move Management' },
  },
  {
    title: 'Operations',
    icon: '◉',
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
    icon: '◧',
    keys: ['ar', 'ap', 'hr'],
    labels: { ar: 'Accounts Receivable', ap: 'Accounts Payable', hr: 'HR / Payroll' },
  },
];

function FeatureValue({ val }) {
  if (val === null || val === undefined) {
    return <span className="feature-status feature-status--unknown">—</span>;
  }
  const isYes = String(val).toUpperCase() === 'Y';
  return (
    <span className={`feature-status ${isYes ? 'feature-status--yes' : 'feature-status--no'}`}>
      {isYes ? '✓ Yes' : '✗ No'}
    </span>
  );
}

function CoverageRing({ score, label }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }}
        />
        <text
          x="36" y="36"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: 'rotate(90deg)',
            transformOrigin: '36px 36px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 700,
            fill: color,
          }}
        >
          {score}%
        </text>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}

function SectionCoverageBar({ section, features }) {
  const vals = section.keys.map((k) => features?.[k]);
  const known = vals.filter((v) => v !== null && v !== undefined);
  const yes = known.filter((v) => String(v).toUpperCase() === 'Y').length;
  const score = known.length > 0 ? Math.round((yes / known.length) * 100) : 0;
  const color = score >= 75 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
      <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 34, textAlign: 'right' }}>
        {score}%
      </span>
    </div>
  );
}

function computeOverallCoverage(features) {
  if (!features) return 0;
  const allKeys = FEATURE_SECTIONS.flatMap((s) => s.keys);
  const vals = allKeys.map((k) => features[k]).filter((v) => v !== null && v !== undefined);
  const yes = vals.filter((v) => String(v).toUpperCase() === 'Y').length;
  return vals.length > 0 ? Math.round((yes / vals.length) * 100) : 0;
}

function computeSectionScore(section, features) {
  const vals = section.keys.map((k) => features?.[k]).filter((v) => v !== null && v !== undefined);
  const yes = vals.filter((v) => String(v).toUpperCase() === 'Y').length;
  return vals.length > 0 ? Math.round((yes / vals.length) * 100) : 0;
}

export default function SoftwareDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [item, setItem] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (item) return;
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

  const overallScore = computeOverallCoverage(item.features);
  const keywordList = item.keywords
    ? item.keywords.split(/[,;]+/).map((kw) => kw.trim()).filter(Boolean)
    : [];

  const overviewCards = [
    {
      label: 'Total Market',
      icon: '◎',
      accent: 'var(--accent)',
      accentLight: 'var(--accent-light)',
      value: item.best_for
        ? item.best_for.split(',').map((v) => toTitleCase(v.trim())).join(', ')
        : null,
    },
    {
      label: 'Deployment',
      icon: '⬢',
      accent: '#10b981',
      accentLight: '#d1fae5',
      value: toTitleCase(item.install),
    },
    {
      label: 'Languages',
      icon: '◈',
      accent: '#f59e0b',
      accentLight: '#fef3c7',
      value: item.language ? normalizeLanguage(item.language) : null,
    },
    {
      label: 'Keywords',
      icon: '◉',
      accent: '#8b5cf6',
      accentLight: '#ede9fe',
      value: keywordList.length > 0 ? keywordList.slice(0, 4).join(' · ') + (keywordList.length > 4 ? ` +${keywordList.length - 4}` : '') : null,
      raw: keywordList,
    },
  ].filter(({ value }) => value);

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
          <div className="detail-header__meta">
            {item.typology && <span className="detail-typology">{toTitleCase(item.typology)}</span>}
            {item.status && (
              <span className={`detail-status detail-status--${item.status.toLowerCase()}`}>
                {toTitleCase(item.status)}
              </span>
            )}
          </div>
          <h1 className="detail-header__name">{item.name || 'Unnamed Software'}</h1>
          {item.description && (
            <p className="detail-header__description">{item.description}</p>
          )}
          {item.website && (
            <a href={item.website} target="_blank" rel="noreferrer" className="detail-header__website">
              {item.website} ↗
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="detail-body">

        {/* ── Overview ── */}
        <section className="detail-section">
          <h2 className="detail-section__title">Overview</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${overviewCards.length}, 1fr)`,
            gap: 14,
          }}
            className="overview-grid-responsive"
          >
            {overviewCards.map(({ label, icon, accent, accentLight, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '22px 20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Subtle accent stripe top */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: accent,
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                }} />

                {/* Icon + Label row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 32, height: 32,
                    background: accentLight,
                    color: accent,
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {icon}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.11em',
                    color: 'var(--text-muted)',
                  }}>
                    {label}
                  </span>
                </div>

                {/* Value */}
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Matrix ── */}
        {item.features && (
          <section className="detail-section">
            {/* Section header with overall coverage ring */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Feature Coverage
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Capability breakdown across {FEATURE_SECTIONS.length} functional areas
                </p>
              </div>

              {/* Overall score rings */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <CoverageRing score={overallScore} label="Overall" />
                {FEATURE_SECTIONS.map((s) => (
                  <CoverageRing
                    key={s.title}
                    score={computeSectionScore(s, item.features)}
                    label={s.title}
                  />
                ))}
              </div>
            </div>

            {/* Feature matrix cards */}
            <div className="feature-matrix">
              {FEATURE_SECTIONS.map((section) => (
                <div
                  key={section.title}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{
                      fontSize: 18,
                      color: 'var(--accent)',
                      lineHeight: 1,
                    }}>
                      {section.icon}
                    </span>
                    <h3 style={{
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: 'var(--text-muted)',
                    }}>
                      {section.title}
                    </h3>
                  </div>

                  {/* Feature rows */}
                  <div style={{ flex: 1 }}>
                    {section.keys.map((key, idx) => (
                      <div
                        key={key}
                        className="feature-matrix__row"
                        style={{
                          borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                        }}
                      >
                        <span className="feature-matrix__name">{section.labels[key]}</span>
                        <FeatureValue val={item.features[key]} />
                      </div>
                    ))}
                  </div>

                  {/* Section coverage bar */}
                  <SectionCoverageBar section={section} features={item.features} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Keywords ── */}
        {keywordList.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Keywords</h2>
            <div className="detail-keywords">
              {keywordList.map((kw) => (
                <FeatureBadge key={kw} label={kw} size="md" />
              ))}
            </div>
          </section>
        )}

        {/* ── Notes ── */}
        {item.notes && (
          <section className="detail-section">
            <h2 className="detail-section__title">Notes</h2>
            <div className="detail-notes">{item.notes}</div>
          </section>
        )}
      </div>

      {/* Responsive grid style injected */}
      <style>{`
        @media (max-width: 860px) {
          .overview-grid-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          .overview-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 780px) {
          .detail-section > div[style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px;
          }
          .detail-section > div[style*="justify-content: space-between"] > div:last-child {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}