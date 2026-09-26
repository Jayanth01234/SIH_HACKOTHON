import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import polarisApi from '../services/api';

const StationContext = createContext(null);

export const StationProvider = ({ children }) => {
  const [selectedStation, setSelectedStation] = useState('Maitri');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stationInfo, setStationInfo] = useState(null);
  const [latestObservation, setLatestObservation] = useState(null);
  const [recentObservations, setRecentObservations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(null);

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
