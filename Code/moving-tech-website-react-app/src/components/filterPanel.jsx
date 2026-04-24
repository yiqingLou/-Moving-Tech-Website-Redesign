import React, { useState, useRef, useEffect } from 'react';
import '../styles/components.css';

// Broad list of spoken languages relevant to moving software markets.
// DB options are merged in at runtime so nothing is ever missing.
const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Polish', 'Russian', 'Arabic', 'Chinese', 'Japanese',
  'Korean', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Turkish',
  'Hebrew', 'Greek', 'Czech', 'Romanian', 'Hungarian', 'Ukrainian',
];

const FEATURE_KEYS = [
  { key: 'lead_mgmt', label: 'Lead Management' },
  { key: 'dispatch',  label: 'Dispatch' },
  { key: 'crew_app',  label: 'Crew App' },
  { key: 'storage',   label: 'Storage' },
  { key: 'surveying', label: 'Surveying' },
];

// ─── Language multi-select ────────────────────────────────────────────────────

function LanguageMultiSelect({ dbOptions = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Merge DB options with the common list, deduplicated, sorted
  const allLanguages = Array.from(
    new Set([...COMMON_LANGUAGES, ...dbOptions])
  ).sort((a, b) => a.localeCompare(b));

  const filtered = allLanguages.filter((lang) =>
    lang.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (lang) => {
    const next = selected.includes(lang)
      ? selected.filter((l) => l !== lang)
      : [...selected, lang];
    onChange(next);
  };

  const removeTag = (lang, e) => {
    e.stopPropagation();
    onChange(selected.filter((l) => l !== lang));
  };

  return (
    <div className="lang-select" ref={containerRef}>
      {/* Trigger */}
      <div
        className={`lang-select__trigger ${open ? 'lang-select__trigger--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
      >
        {selected.length === 0 ? (
          <span className="lang-select__placeholder">All languages</span>
        ) : (
          <div className="lang-select__tags">
            {selected.map((lang) => (
              <span key={lang} className="lang-select__tag">
                {lang}
                <button
                  className="lang-select__tag-remove"
                  onClick={(e) => removeTag(lang, e)}
                  aria-label={`Remove ${lang}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <span className="lang-select__arrow">{open ? '▴' : '▾'}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="lang-select__dropdown">
          <div className="lang-select__search-wrap">
            <input
              className="lang-select__search"
              type="text"
              placeholder="Search languages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="lang-select__list">
            {filtered.length === 0 && (
              <li className="lang-select__empty">No matches</li>
            )}
            {filtered.map((lang) => {
              const checked = selected.includes(lang);
              return (
                <li key={lang} className="lang-select__item">
                  <label className="lang-select__item-label">
                    <input
                      type="checkbox"
                      className="lang-select__checkbox"
                      checked={checked}
                      onChange={() => toggle(lang)}
                    />
                    {lang}
                    {dbOptions.includes(lang) && (
                      <span className="lang-select__dot" title="Available in directory" />
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
          {selected.length > 0 && (
            <div className="lang-select__footer">
              <button
                className="lang-select__clear"
                onClick={() => onChange([])}
              >
                Clear selection
              </button>
              <span className="lang-select__count">
                {selected.length} selected
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main FilterPanel ─────────────────────────────────────────────────────────

export default function FilterPanel({ options, filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  // Binary toggle: null (inactive) ↔ true (active)
  const handleFeatureToggle = (key) => {
    onChange({ ...filters, [key]: filters[key] === true ? null : true });
  };

  const hasActiveFilters =
    Object.entries(filters).some(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && v !== '';
    });

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

      {/* Language — searchable multi-select */}
      <div className="filter-group">
        <label className="filter-group__label">Language</label>
        <LanguageMultiSelect
          dbOptions={options?.language ?? []}
          selected={filters.language ?? []}
          onChange={(langs) => handleChange('language', langs)}
        />
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

      {/* Feature toggles — binary on/off checkboxes */}
      <div className="filter-group">
        <label className="filter-group__label">Features</label>
        <div className="filter-features">
          {FEATURE_KEYS.map(({ key, label }) => {
            const active = filters[key] === true;
            return (
              <label key={key} className={`filter-feature-toggle ${active ? 'filter-feature-toggle--on' : ''}`}>
                <input
                  type="checkbox"
                  className="filter-feature-toggle__checkbox"
                  checked={active}
                  onChange={() => handleFeatureToggle(key)}
                />
                <span className="filter-feature-toggle__track">
                  <span className="filter-feature-toggle__thumb" />
                </span>
                <span className="filter-feature-toggle__label">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}