// POLARIS Backend API Service
// Connects to FastAPI backend running on port 8000 (Historical NCPOR AWS Data)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      credentials: 'omit',
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.detail) errorMsg = parsed.detail;
      } catch (_e) {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err) {
    console.error(`POLARIS API error requesting [${url}]:`, err.message);
    throw err;
  }
}

export const polarisApi = {
  async getHealth() {
    return fetchJson('/health');
  },

  async listStations() {
    return fetchJson('/api/v1/stations');
  },

  async getStationInfo(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}`);
  },

  async getLatestObservation(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/latest`);
  },

  async getObservations(station = 'Maitri', params = {}) {
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.set('limit', params.limit);
    if (params.offset !== undefined) query.set('offset', params.offset);
    if (params.sort) query.set('sort', params.sort);
    if (params.startDate) query.set('start_date', params.startDate);
    if (params.endDate) query.set('end_date', params.endDate);

    const qs = query.toString();
    const endpoint = `/api/v1/stations/${encodeURIComponent(station)}/observations${qs ? '?' + qs : ''}`;
    return fetchJson(endpoint);
  },

  async getStationStatistics(station = 'Maitri', params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.set('start_date', params.startDate);
    if (params.endDate) query.set('end_date', params.endDate);

    const qs = query.toString();
    const endpoint = `/api/v1/stations/${encodeURIComponent(station)}/statistics${qs ? '?' + qs : ''}`;
    return fetchJson(endpoint);
  },
};

export default polarisApi;
