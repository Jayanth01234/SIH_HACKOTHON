import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import polarisApi from '../services/api';

const StationContext = createContext(null);

const ROUTE_MAP = {
  home: '/',
  dashboard: '/dashboard',
  environmental: '/environment',
  energy: '/energy',
  infrastructure: '/infrastructure',
  logistics: '/logistics',
  alerts: '/alerts',
};

const getPageFromPath = (path) => {
  const clean = path.toLowerCase().replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'home') return 'home';
  if (clean === 'dashboard') return 'dashboard';
  if (clean === 'environment' || clean === 'environmental') return 'environmental';
  if (clean === 'energy') return 'energy';
  if (clean === 'infrastructure') return 'infrastructure';
  if (clean === 'logistics') return 'logistics';
  if (clean === 'alerts') return 'alerts';
  return 'home';
};

export const StationProvider = ({ children }) => {
  const [selectedStation, setSelectedStation] = useState('Maitri');
  const [currentPage, setCurrentPageState] = useState(() => getPageFromPath(window.location.pathname));
  const [stationInfo, setStationInfo] = useState(null);
  const [latestObservation, setLatestObservation] = useState(null);
  const [recentObservations, setRecentObservations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(null);

  // Sync state with URL history
  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
    const targetUrl = ROUTE_MAP[page] || '/';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ page }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromPath(window.location.pathname);
      setCurrentPageState(page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const health = await polarisApi.getHealth();
      setBackendHealthy(health.status === 'healthy');
    } catch (err) {
      console.warn('Backend health check failed:', err.message);
      setBackendHealthy(false);
    }
  }, []);

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

      if (latest.status === 'rejected' && obsData.status === 'rejected') {
        throw new Error('Unable to connect to POLARIS data service.');
      }
    } catch (err) {
      console.error('Failed to load station telemetry:', err);
      setError(err.message || 'Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    fetchStationData(selectedStation);
  }, [selectedStation, checkHealth, fetchStationData]);

  const value = {
    selectedStation,
    setSelectedStation,
    currentPage,
    setCurrentPage,
    stationInfo,
    latestObservation,
    recentObservations,
    statistics,
    loading,
    error,
    backendHealthy,
    refreshStationData: () => fetchStationData(selectedStation),
    checkHealth,
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
