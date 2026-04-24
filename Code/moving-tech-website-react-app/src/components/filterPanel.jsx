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

// ─── Generic multi-select ─────────────────────────────────────────────────────

/**
 * MultiSelect — a reusable searchable checkbox dropdown.
 *
 * Props:
 *   options      string[]   — the list of options to show
 *   selected     string[]   — currently selected values
 *   onChange     fn         — called with the new selected array
 *   placeholder  string     — trigger label when nothing is selected
 *   searchable   bool       — show the search input (default true)
 *   dotOptions   string[]   — optional subset that gets a colored dot (used for languages)
 */
function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = 'All',
  searchable = true,
  dotOptions = [],
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
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

  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next);
  };

  const removeTag = (opt, e) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== opt));
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
          <span className="lang-select__placeholder">{placeholder}</span>
        ) : (
          <div className="lang-select__tags">
            {selected.map((opt) => (
              <span key={opt} className="lang-select__tag">
                {opt}
                <button
                  className="lang-select__tag-remove"
                  onClick={(e) => removeTag(opt, e)}
                  aria-label={`Remove ${opt}`}
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
          {searchable && (
            <div className="lang-select__search-wrap">
              <input
                className="lang-select__search"
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <ul className="lang-select__list">
            {filtered.length === 0 && (
              <li className="lang-select__empty">No matches</li>
            )}
            {filtered.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <li key={opt} className="lang-select__item">
                  <label className="lang-select__item-label">
                    <input
                      type="checkbox"
                      className="lang-select__checkbox"
                      checked={checked}
                      onChange={() => toggle(opt)}
                    />
                    {opt}
                    {dotOptions.includes(opt) && (
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

  // Build the language options list: merge common list with DB options, dedupe, sort
  const languageOptions = Array.from(
    new Set([...COMMON_LANGUAGES, ...(options?.language ?? [])])
  ).sort((a, b) => a.localeCompare(b));

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

      {/* Software Type */}
      <div className="filter-group">
        <label className="filter-group__label">Software Type</label>
        <MultiSelect
          options={options?.typology ?? []}
          selected={filters.typology ?? []}
          onChange={(vals) => handleChange('typology', vals)}
          placeholder="All types"
          searchable={false}
        />
      </div>

      {/* Best For */}
      <div className="filter-group">
        <label className="filter-group__label">Best For</label>
        <MultiSelect
          options={options?.best_for ?? []}
          selected={filters.best_for ?? []}
          onChange={(vals) => handleChange('best_for', vals)}
          placeholder="All markets"
          searchable={false}
        />
      </div>

      {/* Deployment */}
      <div className="filter-group">
        <label className="filter-group__label">Deployment</label>
        <MultiSelect
          options={options?.install ?? []}
          selected={filters.install ?? []}
          onChange={(vals) => handleChange('install', vals)}
          placeholder="All types"
          searchable={false}
        />
      </div>

      {/* Language — searchable, with DB-availability dots */}
      <div className="filter-group">
        <label className="filter-group__label">Language</label>
        <MultiSelect
          options={languageOptions}
          selected={filters.language ?? []}
          onChange={(vals) => handleChange('language', vals)}
          placeholder="All languages"
          searchable={true}
          dotOptions={options?.language ?? []}
        />
      </div>

      {/* Status */}
      <div className="filter-group">
        <label className="filter-group__label">Status</label>
        <MultiSelect
          options={options?.status ?? []}
          selected={filters.status ?? []}
          onChange={(vals) => handleChange('status', vals)}
          placeholder="All statuses"
          searchable={false}
        />
      </div>

      {/* Feature toggles — binary on/off */}
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