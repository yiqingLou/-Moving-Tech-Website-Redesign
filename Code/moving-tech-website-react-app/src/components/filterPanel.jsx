import React from 'react';
import '../styles/components.css';

export default function FilterPanel({ options, filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleBool = (key, current) => {
    // Cycle: null → true → false → null
    const next = current === null ? true : current === true ? false : null;
    onChange({ ...filters, [key]: next });
  };

  const boolLabel = (val) =>
    val === true ? '✓ Yes' : val === false ? '✗ No' : '— Any';

  const boolClass = (val) =>
    val === true ? 'filter-bool--yes' : val === false ? 'filter-bool--no' : '';

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== null && v !== undefined && v !== ''
  );

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h3 className="filter-panel__title">Filters</h3>
        {hasActiveFilters && (
          <button className="filter-panel__reset" onClick={onReset}>
            Clear all
          </button>
        )}
      </div>

      {/* Typology */}
      <div className="filter-group">
        <label className="filter-group__label">Software Type</label>
        <select
          className="filter-group__select"
          value={filters.typology || ''}
          onChange={(e) => handleChange('typology', e.target.value)}
        >
          <option value="">All types</option>
          {options?.typology?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Best For */}
      <div className="filter-group">
        <label className="filter-group__label">Best For</label>
        <select
          className="filter-group__select"
          value={filters.best_for || ''}
          onChange={(e) => handleChange('best_for', e.target.value)}
        >
          <option value="">All markets</option>
          {options?.best_for?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Deployment */}
      <div className="filter-group">
        <label className="filter-group__label">Deployment</label>
        <select
          className="filter-group__select"
          value={filters.install || ''}
          onChange={(e) => handleChange('install', e.target.value)}
        >
          <option value="">All types</option>
          {options?.install?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="filter-group">
        <label className="filter-group__label">Language</label>
        <select
          className="filter-group__select"
          value={filters.language || ''}
          onChange={(e) => handleChange('language', e.target.value)}
        >
          <option value="">All languages</option>
          {options?.language?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="filter-group">
        <label className="filter-group__label">Status</label>
        <select
          className="filter-group__select"
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {options?.status?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Feature toggles */}
      <div className="filter-group">
        <label className="filter-group__label">Features</label>
        <div className="filter-features">
          {[
            { key: 'lead_mgmt', label: 'Lead Management' },
            { key: 'dispatch', label: 'Dispatch' },
            { key: 'crew_app', label: 'Crew App' },
            { key: 'storage', label: 'Storage' },
            { key: 'surveying', label: 'Surveying' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-bool ${boolClass(filters[key] ?? null)}`}
              onClick={() => handleBool(key, filters[key] ?? null)}
            >
              <span className="filter-bool__label">{label}</span>
              <span className="filter-bool__value">{boolLabel(filters[key] ?? null)}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}