import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Calendar,
  Wind,
  Gauge,
  Thermometer,
  Zap,
  ShieldAlert,
  Fuel,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useStation } from '../context/StationContext';
import polarisApi from '../services/api';

export const HistoricalReplay = () => {
  const { selectedStation } = useStation();
  const [replayData, setReplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x

  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchReplay = async () => {
      setLoading(true);
      try {
        const res = await polarisApi.getHistoricalReplay(selectedStation, 'JAN_2015_STORM');
        setReplayData(res);
        setCurrentFrameIdx(0);
      } catch (err) {
        console.error('Failed to load replay data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReplay();
  }, [selectedStation]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrameIdx((prev) => {
          if (!replayData?.frames || prev >= replayData.frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, replayData]);

  const frames = replayData?.frames || [];
  const currentFrame = frames[currentFrameIdx] || {};
  const meta = replayData?.event_metadata || {};

  const chartData = frames.map((f, i) => ({
    time: new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wind: f.wind_speed,
    pressure: f.atmospheric_pressure,
    temp: f.temperature,
    hazard_prob: Math.round(f.hazard_probability * 100),
    isCurrent: i === currentFrameIdx,
  }));

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          color: '#FFFFFF',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#F59E0B', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Historical Mission Replay
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>{meta.title || `${selectedStation} Event`}</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', color: '#F8FAFC' }}>
            {meta.title || 'Antarctic Cyclone Telemetry Replay'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', maxWidth: '750px' }}>
            {meta.description || 'Reconstruct past meteorological crises through the POLARIS Digital Twin engine.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Event Window:</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '4px' }}>
            {meta.date_range}
          </span>
        </div>
      </div>

      {/* Scrubber & Player Controls */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setCurrentFrameIdx(0)}
              title="Jump to Start"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setCurrentFrameIdx((p) => Math.max(0, p - 1))}
              title="Step Backward"
            >
              <SkipBack size={14} />
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ width: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} fill="#FFFFFF" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setCurrentFrameIdx((p) => Math.min(frames.length - 1, p + 1))}
              title="Step Forward"
            >
              <SkipForward size={14} />
            </button>

            {/* Speed Pills */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 'var(--radius-sm)', padding: '2px', marginLeft: '8px' }}>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  style={{
                    background: playbackSpeed === spd ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: playbackSpeed === spd ? 700 : 500,
                    color: playbackSpeed === spd ? 'var(--polar-navy)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: playbackSpeed === spd ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Timeline Frame:</span>
            <strong style={{ fontSize: '13px', color: 'var(--polar-navy)' }}>
              {currentFrameIdx + 1} / {frames.length}
            </strong>
            <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600, marginLeft: '6px' }}>
              {currentFrame.timestamp ? new Date(currentFrame.timestamp).toUTCString().slice(0, 22) : ''}
            </span>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <input
          type="range"
          min="0"
          max={Math.max(0, frames.length - 1)}
          value={currentFrameIdx}
          onChange={(e) => {
            setCurrentFrameIdx(parseInt(e.target.value));
            setIsPlaying(false);
          }}
          style={{ width: '100%', accentColor: '#0284C7' }}
        />
      </div>

      {/* Snapshot Cards for Current Replay Frame */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Wind size={15} color="#0284C7" />
            <span>Wind Speed</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--polar-navy)', marginTop: '6px' }}>
            {currentFrame.wind_speed} <span style={{ fontSize: '12px', fontWeight: 400 }}>m/s</span>
          </div>
          <div style={{ fontSize: '11px', color: currentFrame.wind_speed > 18 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
            {currentFrame.wind_speed > 18 ? 'Storm Gale' : 'Nominal katabatic'}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Gauge size={15} color="#0284C7" />
            <span>Barometric Pressure</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--polar-navy)', marginTop: '6px' }}>
            {currentFrame.atmospheric_pressure} <span style={{ fontSize: '12px', fontWeight: 400 }}>hPa</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Baseline: 985 hPa
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Thermometer size={15} color="#0284C7" />
            <span>Ambient Temp</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--polar-navy)', marginTop: '6px' }}>
            {currentFrame.temperature} <span style={{ fontSize: '12px', fontWeight: 400 }}>°C</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Trace heat active
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <ShieldAlert size={15} color={currentFrame.hazard_level === 'CRITICAL' ? '#EF4444' : '#F59E0B'} />
            <span>ML Hazard Risk</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: currentFrame.hazard_level === 'CRITICAL' ? '#EF4444' : '#F59E0B', marginTop: '6px' }}>
            {currentFrame.hazard_level}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {Math.round((currentFrame.hazard_probability || 0) * 100)}% risk probability
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Zap size={15} color="#F59E0B" />
            <span>Microgrid Load</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--polar-navy)', marginTop: '6px' }}>
            {currentFrame.energy_consumption_kw} <span style={{ fontSize: '12px', fontWeight: 400 }}>kW</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Autonomy: {currentFrame.fuel_autonomy_days} days
          </div>
        </div>
      </div>

      {/* Historical Chronological Trend Chart */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--polar-navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Historical Telemetry Waveform & ML Risk Trajectory
        </h3>
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis yAxisId="left" stroke="#0284C7" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#EF4444" domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="wind" name="Wind (m/s)" stroke="#0284C7" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="hazard_prob" name="Risk %" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoricalReplay;
