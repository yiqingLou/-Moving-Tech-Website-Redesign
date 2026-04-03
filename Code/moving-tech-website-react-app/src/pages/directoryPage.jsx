import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from "../components/filterPanel";
import SoftwareCard from "../components/softwareCard";
import Pagination from "../components/pagination";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/statusComponents";
import { searchSoftware, filterSoftware, getFilterOptions } from '../api/client';
import { useDebounce } from '../hooks/useAPI';
import '../styles/global.css';

const INITIAL_FILTERS = {
  typology: '',
  best_for: '',
  install: '',
  language: '',
  status: '',
  lead_mgmt: null,
  dispatch: null,
  crew_app: null,
  storage: null,
  surveying: null,
};

const PAGE_SIZE = 20;

export default function DirectoryPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  // Load filter dropdown options once on mount
  useEffect(() => {
    getFilterOptions()
      .then(setOptions)
      .catch(() => {/* non-fatal: filters just won't populate */});
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
        // Build filter payload — strip empty strings, convert bool features
        const activeFilters = {};
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') {
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

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Reset to page 1 when query or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setSearch('');
    setPage(1);
  };

  const isFiltered =
    debouncedSearch.trim() ||
    Object.values(filters).some((v) => v !== null && v !== undefined && v !== '');

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
              <button className="search-field__clear" onClick={() => setSearch('')}>
                ✕
              </button>
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
                <div className="results-summary">
                  Showing{' '}
                  <strong>
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, results.total)}
                  </strong>{' '}
                  of <strong>{results.total}</strong> software profiles
                </div>

                <div className="software-grid">
                  {results.items.map((item) => (
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