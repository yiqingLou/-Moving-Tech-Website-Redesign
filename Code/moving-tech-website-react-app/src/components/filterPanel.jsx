import React, { useState, useRef, useEffect } from 'react';
import '../styles/components.css';

// Only show these four language options in the filter
const ALLOWED_LANGUAGES = ['English', 'Spanish', 'French', 'Multilanguage'];

/**
 * Converts a snake_case or underscore-separated string to Title Case.
 * e.g. "domestic_local" → "Domestic Local"
 */
export function toTitleCase(str) {
  if (!str) return str;
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Maps a raw language value from the DB to one of our four display values.
 * Anything not English/Spanish/French becomes "Multilanguage".
 */
export function normalizeLanguage(lang) {
  if (!lang) return null;
  const trimmed = lang.trim();
  if (['English', 'Spanish', 'French'].includes(trimmed)) return trimmed;
  return 'Multilanguage';
}

/**
 * Splits a potentially comma-separated multi-value string into individual
 * title-cased entries. e.g. "domestic_local, relocation_management"
 * → ["Domestic Local", "Relocation Management"]
 */
function splitAndFormat(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => toTitleCase(v.trim()))
    .filter(Boolean);
}

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

  // Language: fixed list of four options only
  const languageOptions = ALLOWED_LANGUAGES;

  // Format a raw options array: title-case each entry
  const formatOptions = (arr = []) =>
    Array.from(new Set(arr.map(toTitleCase))).sort((a, b) => a.localeCompare(b));

  // Best For: split multi-value entries (e.g. "domestic_local, relocation_management")
  // into individual options so filters are always single values
  const bestForOptions = Array.from(
    new Set(
      (options?.best_for ?? []).flatMap((v) => splitAndFormat(v))
    )
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
          options={formatOptions(options?.typology ?? [])}
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
          options={bestForOptions}
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
          options={formatOptions(options?.install ?? [])}
          selected={filters.install ?? []}
          onChange={(vals) => handleChange('install', vals)}
          placeholder="All types"
          searchable={false}
        />
      </div>

      {/* Language — fixed four options */}
      <div className="filter-group">
        <label className="filter-group__label">Language</label>
        <MultiSelect
          options={languageOptions}
          selected={filters.language ?? []}
          onChange={(vals) => handleChange('language', vals)}
          placeholder="All languages"
          searchable={false}
        />
      </div>

      {/* Status */}
      <div className="filter-group">
        <label className="filter-group__label">Status</label>
        <MultiSelect
          options={formatOptions(options?.status ?? [])}
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