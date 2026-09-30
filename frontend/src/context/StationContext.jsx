import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import polarisApi from '../services/api';

const StationContext = createContext(null);

export const StationProvider = ({ children }) => {
  const [selectedStation, setSelectedStation] = useState('Maitri');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Digital Twin state
  const [digitalTwinState, setDigitalTwinState] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [operatorActions, setOperatorActions] = useState([]);
  const [dataMode, setDataMode] = useState('SIMULATION');
  const [connectivityStatus, setConnectivityStatus] = useState('ONLINE');
  const [queuedPackets, setQueuedPackets] = useState(0);

  // Demo Scenario state
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoInfo, setDemoInfo] = useState(null);

  // Base state
  const [stationInfo, setStationInfo] = useState(null);
  const [latestObservation, setLatestObservation] = useState(null);
  const [recentObservations, setRecentObservations] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // System status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Check health
  const checkHealth = useCallback(async () => {
    try {
      const health = await polarisApi.getHealth();
      setBackendHealthy(health.status === 'healthy' || health.database !== undefined);
    } catch (err) {
      console.warn('Backend health check failed:', err.message);
      setBackendHealthy(false);
    }
  }, []);

  // Fetch full digital twin state
  const fetchDigitalTwin = useCallback(async (station = selectedStation) => {
    try {
      const twin = await polarisApi.getDigitalTwinState(station);
      setDigitalTwinState(twin);
      setDataMode(twin.data_mode);
      setConnectivityStatus(twin.connectivity_status);
      setQueuedPackets(twin.provenance?.queued_packets || 0);

      // Local storage cache for offline resiliency
      try {
        localStorage.setItem(`polaris_twin_${station}`, JSON.stringify(twin));
      } catch (_e) {}

      // Active alerts
      if (twin.active_alerts) {
        setActiveAlerts(twin.active_alerts);
      }
    } catch (err) {
      console.warn('Failed to fetch digital twin state, checking local cache:', err);
      try {
        const cached = localStorage.getItem(`polaris_twin_${station}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.connectivity_status = 'OFFLINE';
          parsed.data_mode = 'OFFLINE';
          setDigitalTwinState(parsed);
          setConnectivityStatus('OFFLINE');
          setDataMode('OFFLINE');
        }
      } catch (_e) {}
    }
  }, [selectedStation]);

  // Fetch action logs
  const fetchActions = useCallback(async () => {
    try {
      const acts = await polarisApi.getOperatorActions(selectedStation, 20);
      setOperatorActions(acts || []);
    } catch (_e) {}
  }, [selectedStation]);

  // Fetch base observations & stats
  const fetchStationData = useCallback(async (station) => {
    setLoading(true);
    setError(null);
    try {
      const [info, latest, obsData, stats] = await Promise.allSettled([
        polarisApi.getStationInfo(station),
        polarisApi.getLatestObservation(station),
        polarisApi.getObservations(station, { limit: 48, sort: 'asc' }),
        polarisApi.getStationStatistics(station),
      ]);

      if (info.status === 'fulfilled') setStationInfo(info.value);
      if (latest.status === 'fulfilled') setLatestObservation(latest.value);
      if (obsData.status === 'fulfilled') setRecentObservations(obsData.value.data || []);
      if (stats.status === 'fulfilled') setStatistics(stats.value);

      await fetchDigitalTwin(station);
      await fetchActions();
    } catch (err) {
      console.error('Failed to load station telemetry:', err);
      setError(err.message || 'Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  }, [fetchDigitalTwin, fetchActions]);

  // WebSocket Live Stream Connection
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname || 'localhost'}:8000/ws`;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          console.info('POLARIS WebSocket live telemetry stream connected.');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'DIGITAL_TWIN_TICK') {
              setDemoRunning(Boolean(data.demo_running));
              if (data.demo_step) setDemoStep(data.demo_step);

              // If current station has an update, refresh or update telemetry
              const stData = data.stations?.[selectedStation];
              if (stData && connectivityStatus !== 'OFFLINE') {
                setDigitalTwinState((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    overall_status: stData.status,
                    overall_health_score: stData.health,
                    environment: {
                      ...prev.environment,
                      temperature: stData.temp,
                      wind_speed: stData.wind,
                      atmospheric_pressure: stData.press,
                      pressure_trend: stData.press_trend,
                    },
                    energy: {
                      ...prev.energy,
                      consumption_kw: stData.consumption_kw,
                      battery_soc_pct: stData.battery_soc,
                      autonomy_days: stData.fuel_autonomy_days,
                    },
                    hazards: {
                      ...prev.hazards,
                      hazard_level: stData.hazard_level,
                      hazard_probability: stData.hazard_prob,
                    },
                    timestamp: new Date(data.timestamp),
                  };
                });
              }
            }
          } catch (_e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws.close();
        };
      } catch (_e) {
        setWsConnected(false);
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [selectedStation, connectivityStatus]);

  // Periodic polling fallback
  useEffect(() => {
    checkHealth();
    fetchStationData(selectedStation);

    const interval = setInterval(() => {
      if (connectivityStatus !== 'OFFLINE') {
        fetchDigitalTwin(selectedStation);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedStation, checkHealth, fetchStationData, fetchDigitalTwin, connectivityStatus]);

  // Operator Actions
  const handleAcknowledgeAlert = async (alertId, notes = '') => {
    try {
      const updated = await polarisApi.acknowledgeAlert(alertId, 'NCPOR Remote Operator', notes);
      setActiveAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', notes } : a))
      );
      fetchActions();
      return updated;
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolveAlert = async (alertId, resolutionNotes = '') => {
    try {
      const updated = await polarisApi.resolveAlert(alertId, 'NCPOR Remote Operator', resolutionNotes);
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
      fetchActions();
      return updated;
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // Connectivity Toggles
  const toggleOfflineMode = async () => {
    const nextStatus = connectivityStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await polarisApi.toggleConnectivity(selectedStation, nextStatus);
      setConnectivityStatus(nextStatus);
      setDataMode(nextStatus === 'OFFLINE' ? 'OFFLINE' : 'SIMULATION');
      if (nextStatus === 'ONLINE') {
        await polarisApi.syncOfflinePackets(selectedStation);
        setQueuedPackets(0);
      }
      fetchDigitalTwin(selectedStation);
    } catch (err) {
      console.error('Failed to toggle connectivity:', err);
    }
  };

  const syncNow = async () => {
    try {
      await polarisApi.syncOfflinePackets(selectedStation);
      setQueuedPackets(0);
      setConnectivityStatus('ONLINE');
      setDataMode('SIMULATION');
      fetchDigitalTwin(selectedStation);
    } catch (err) {
      console.error('Failed to sync packets:', err);
    }
  };

  // Change Data Mode
  const changeDataMode = async (mode) => {
    try {
      await polarisApi.setDataMode(selectedStation, mode);
      setDataMode(mode);
      fetchDigitalTwin(selectedStation);
    } catch (err) {
      console.error('Failed to set data mode:', err);
    }
  };

  // Automated Demo Scenario Engine
  const startDemoScenario = async (scenario = 'SEVERE_WEATHER') => {
    try {
      const res = await polarisApi.startDemoScenario(scenario);
      setDemoRunning(true);
      setDemoStep(1);
      setDemoInfo(res);
      fetchDigitalTwin(selectedStation);
    } catch (err) {
      console.error('Failed to start demo scenario:', err);
    }
  };

  const stopDemoScenario = async () => {
    try {
      await polarisApi.stopDemoScenario();
      setDemoRunning(false);
      setDemoStep(1);
      setDemoInfo(null);
      fetchDigitalTwin(selectedStation);
    } catch (err) {
      console.error('Failed to stop demo scenario:', err);
    }
  };

  const advanceDemoStep = async (stepNum) => {
    try {
      const res = await polarisApi.advanceScenarioStep(stepNum);
      setDemoStep(stepNum);
      setDemoInfo(res);
      fetchDigitalTwin(selectedStation);
      fetchActions();
      return res;
    } catch (err) {
      console.error('Failed to advance demo step:', err);
    }
  };

  const value = {
    selectedStation,
    setSelectedStation,
    currentPage,
    setCurrentPage,
    digitalTwinState,
    activeAlerts,
    operatorActions,
    dataMode,
    connectivityStatus,
    queuedPackets,
    demoRunning,
    demoStep,
    demoInfo,
    stationInfo,
    latestObservation,
    recentObservations,
    statistics,
    loading,
    error,
    backendHealthy,
    wsConnected,
    refreshStationData: () => fetchStationData(selectedStation),
    fetchDigitalTwin: () => fetchDigitalTwin(selectedStation),
    checkHealth,
    handleAcknowledgeAlert,
    handleResolveAlert,
    toggleOfflineMode,
    syncNow,
    changeDataMode,
    startDemoScenario,
    stopDemoScenario,
    advanceDemoStep,
  };

  return (
    <StationContext.Provider value={value}>
      {children}
    </StationContext.Provider>
  );
};

export const useStation = () => {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
};

export default StationContext;
