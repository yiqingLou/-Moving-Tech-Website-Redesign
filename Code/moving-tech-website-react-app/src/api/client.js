const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function searchSoftware(q, page = 1, pageSize = 20, sortBy = 'verified_first') {
  const params = new URLSearchParams({ q, page, pageSize, sort_by: sortBy });
  return request(`/api/software/search?${params}`);
}

export async function filterSoftware(filters = {}, page = 1, pageSize = 20, sortBy = 'verified_first') {
  const params = new URLSearchParams({ page, pageSize, sort_by: sortBy });
  Object.entries(filters).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, v));
    } else if (val !== null && val !== undefined && val !== '') {
      params.append(key, val);
    }
  });
  return request(`/api/software/filter?${params}`);
}

export async function getFilterOptions() {
  return request('/api/software/options');
}

export async function getSoftwareById(id) {
  return request(`/api/software/${id}`);
}
