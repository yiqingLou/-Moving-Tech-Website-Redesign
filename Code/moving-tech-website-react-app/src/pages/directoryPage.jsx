import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from "../components/filterPanel";
import SoftwareCard from "../components/softwareCard";
import Pagination from "../components/pagination";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/statusComponents";
import { searchSoftware, filterSoftware, getFilterOptions } from '../api/client';
import { useDebounce } from '../hooks/useAPI';
import '../styles/global.css';

const INITIAL_FILTERS = {
  typology: [],
  best_for: [],
  install: [],
  language: [],
  status: [],
  lead_mgmt: null,
  dispatch: null,
  crew_app: null,
  storage: null,
  surveying: null,
};

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: 'verified_first',   label: 'Verified first' },
  { value: 'unverified_first', label: 'Unverified first' },
  { value: 'name_asc',         label: 'Name A → Z' },
  { value: 'name_desc',        label: 'Name Z → A' },
];

// ── Client-side sort ────────────────────────────────────────────────────────

function sortItems(items, sortBy) {
  if (!items) return items;
  const sorted = [...items];
  switch (sortBy) {
    case 'verified_first':
      return sorted.sort((a, b) => {
        const av = (a.status || '').toLowerCase() === 'verified' ? 0 : 1;
        const bv = (b.status || '').toLowerCase() === 'verified' ? 0 : 1;
        return av - bv || (a.name || '').localeCompare(b.name || '');
      });
    case 'unverified_first':
      return sorted.sort((a, b) => {
        const av = (a.status || '').toLowerCase() === 'verified' ? 1 : 0;
        const bv = (b.status || '').toLowerCase() === 'verified' ? 1 : 0;
        return av - bv || (a.name || '').localeCompare(b.name || '');
      });
    case 'name_asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name_desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    default:
      return sorted;
  }
}

// ───────────────────────────────────────────────────────────────────────────

export default function DirectoryPage() {
  const [search, setSearch]   = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy]   = useState('verified_first');
  const [page, setPage]       = useState(1);
  const [results, setResults] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  // Load filter dropdown options once on mount
  useEffect(() => {
    getFilterOptions()
      .then(setOptions)
      .catch(() => {});
  }, []);

  // Fetch results whenever search query, filters, or page changes
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (debouncedSearch.trim()) {
        data = await searchSoftware(debouncedSearch.trim(), page, PAGE_SIZE);
      } else {
        const activeFilters = {};
        Object.entries(filters).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            if (v.length > 0) activeFilters[k] = v;
          } else if (v !== null && v !== undefined && v !== '') {
            activeFilters[k] = v;
          }
        });
        data = await filterSoftware(activeFilters, page, PAGE_SIZE);
      }
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  // Reset to page 1 on query / filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  const handleFilterChange = (newFilters) => { setFilters(newFilters); setPage(1); };
  const handleReset = () => { setFilters(INITIAL_FILTERS); setSearch(''); setPage(1); };

  const isFiltered =
    debouncedSearch.trim() ||
    Object.entries(filters).some(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && v !== '';
    });

  // Apply client-side sort to the current page of results
  const displayItems = results ? sortItems(results.items, sortBy) : [];

  return (
    <div className="directory">
      {/* Top bar */}
      <div className="directory__topbar">
        <div className="directory__topbar-inner">
          <div>
            <p className="directory__eyebrow">movingtech.ai</p>
            <h1 className="directory__title">Software Directory</h1>
            <p className="directory__subtitle">
              Search, compare, and filter moving software solutions.
            </p>
          </div>
          {results && (
            <div className="directory__count">
              <span className="directory__count-number">{results.total}</span>
              <span className="directory__count-label">results</span>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="directory__search-bar">
        <div className="directory__search-inner">
          <div className="search-field">
            <span className="search-field__icon">⌕</span>
            <input
              className="search-field__input"
              type="search"
              placeholder="Search by name, description, or keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button className="search-field__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="directory__body">
        <div className="directory__body-inner">
          {/* Sidebar filters */}
          <FilterPanel
            options={options}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          {/* Results */}
          <div className="directory__results">
            {loading && <LoadingSpinner message="Fetching software profiles…" />}

            {!loading && error && (
              <ErrorMessage message={error} onRetry={fetchResults} />
            )}

            {!loading && !error && results && results.items.length === 0 && (
              <EmptyState
                title="No software found"
                subtitle={
                  isFiltered
                    ? 'Try adjusting your search or filters.'
                    : 'No profiles in the database yet.'
                }
              />
            )}

            {!loading && !error && results && results.items.length > 0 && (
              <>
                {/* Results summary + sort control */}
                <div className="results-header">
                  <p className="results-summary">
                    Showing{' '}
                    <strong>
                      {(page - 1) * PAGE_SIZE + 1}–
                      {Math.min(page * PAGE_SIZE, results.total)}
                    </strong>{' '}
                    of <strong>{results.total}</strong> software profiles
                  </p>

                  <div className="results-sort">
                    <label className="results-sort__label" htmlFor="sort-select">
                      Sort by
                    </label>
                    <select
                      id="sort-select"
                      className="results-sort__select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {SORT_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="software-grid">
                  {displayItems.map((item) => (
                    <SoftwareCard key={item.id} item={item} />
                  ))}
                </div>

                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={results.total}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
