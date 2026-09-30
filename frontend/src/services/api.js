// POLARIS Digital Twin API Client
// Connects to FastAPI backend running on port 8000 (with SQLite & WebSocket streaming)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      credentials: 'omit',
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.detail) errorMsg = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
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
  // Observability & Health
  async getHealth() {
    return fetchJson('/health');
  },
  async getMetrics() {
    return fetchJson('/metrics');
  },

  // Stations & Observations
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
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/observations${qs ? '?' + qs : ''}`);
  },
  async getStationStatistics(station = 'Maitri', params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.set('start_date', params.startDate);
    if (params.endDate) query.set('end_date', params.endDate);
    const qs = query.toString();
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/statistics${qs ? '?' + qs : ''}`);
  },

  // Live Telemetry, AI Forecast & ML Hazard
  async getLiveStationData(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/live`);
  },
  async refreshLiveStationData(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/live/refresh`, { method: 'POST' });
  },
  async getStationForecast(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/forecast`);
  },
  async getStationHazard(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/hazard`);
  },

  // Core Digital Twin Subsystems
  async getDigitalTwinState(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/digital-twin`);
  },
  async getStationEnergy(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/energy`);
  },
  async getStationInfrastructure(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/infrastructure`);
  },
  async getStationLogistics(station = 'Maitri') {
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/logistics`);
  },
  async getStationAlerts(station = 'Maitri', statusFilter = null) {
    const qs = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    return fetchJson(`/api/v1/stations/${encodeURIComponent(station)}/alerts${qs}`);
  },
  async compareStations() {
    return fetchJson('/api/v1/stations/compare');
  },

  // Alerts & Operator Actions
  async acknowledgeAlert(alertId, operator = 'NCPOR Remote Operator', notes = '') {
    return fetchJson(`/api/v1/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ operator, notes }),
    });
  },
  async resolveAlert(alertId, operator = 'NCPOR Remote Operator', resolutionNotes = '') {
    return fetchJson(`/api/v1/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ operator, resolution_notes: resolutionNotes }),
    });
  },
  async getOperatorActions(station = null, limit = 50) {
    const query = new URLSearchParams();
    if (station) query.set('station', station);
    if (limit) query.set('limit', limit);
    const qs = query.toString();
    return fetchJson(`/api/v1/operator-actions${qs ? '?' + qs : ''}`);
  },
  async recordOperatorAction(payload) {
    return fetchJson('/api/v1/operator-actions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Cross-Domain Impact, What-If, Simulation, Replay & Quality
  async getCrossDomainImpact(station = 'Maitri') {
    return fetchJson(`/api/v1/cross-domain-impact?station=${encodeURIComponent(station)}`);
  },
  async getSimulationState() {
    return fetchJson('/api/v1/simulation/state');
  },
  async startDemoScenario(scenario = 'SEVERE_WEATHER') {
    return fetchJson('/api/v1/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  },
  async stopDemoScenario() {
    return fetchJson('/api/v1/simulation/stop', { method: 'POST' });
  },
  async advanceScenarioStep(step) {
    return fetchJson('/api/v1/simulation/step', {
      method: 'POST',
      body: JSON.stringify({ step }),
    });
  },
  async runWhatIf(payload) {
    return fetchJson('/api/v1/simulation/what-if', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async setDataMode(station, mode) {
    return fetchJson('/api/v1/simulation/data-mode', {
      method: 'POST',
      body: JSON.stringify({ station_id: station, mode }),
    });
  },
  async toggleConnectivity(station, status) {
    return fetchJson('/api/v1/connectivity/toggle', {
      method: 'POST',
      body: JSON.stringify({ station_id: station, status }),
    });
  },
  async syncOfflinePackets(station = 'Maitri') {
    return fetchJson(`/api/v1/connectivity/sync?station_id=${encodeURIComponent(station)}`, {
      method: 'POST',
    });
  },
  async getHistoricalReplay(station = 'Maitri', eventId = 'JAN_2015_STORM') {
    return fetchJson(`/api/v1/replay?station=${encodeURIComponent(station)}&event_id=${encodeURIComponent(eventId)}`);
  },
  async getDataQuality() {
    return fetchJson('/api/v1/data-quality');
  },
};

export default polarisApi;
