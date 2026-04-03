/**
 * api/client.js
 * All communication with the Python/FastAPI backend.
 * Base URL is set via REACT_APP_API_URL env var (default: localhost:8000).
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Full-text search across company name, description, and keywords.
 * Maps to GET /api/software/search
 */
export async function searchSoftware(q, page = 1, pageSize = 20) {
  const params = new URLSearchParams({ q, page, pageSize });
  return request(`/api/software/search?${params}`);
}

/**
 * Structured filter query.
 * Maps to GET /api/software/filter
 * @param {Object} filters - Keys match backend query params
 */
export async function filterSoftware(filters = {}, page = 1, pageSize = 20) {
  const params = new URLSearchParams({ page, pageSize });
  Object.entries(filters).forEach(([key, val]) => {
    // Skip empty/null/undefined values
    if (val !== null && val !== undefined && val !== '') {
      params.append(key, val);
    }
  });
  return request(`/api/software/filter?${params}`);
}

/**
 * Fetch all distinct enum values for filter dropdowns.
 * Maps to GET /api/software/options
 * Returns: { typology[], best_for[], install[], language[], status[] }
 */
export async function getFilterOptions() {
  return request('/api/software/options');
}

/**
 * Fetch a single software item by its row index id.
 * The backend has no dedicated /:id endpoint, so we use the filter
 * endpoint and match client-side. The detail page may also receive
 * the full item via React Router location.state for zero extra requests.
 * @param {string} id - The row index string from the Excel dataset
 */
export async function getSoftwareById(id) {
  return request(`/api/software/${id}`);  // hits GET /api/software/smartmoving
}
