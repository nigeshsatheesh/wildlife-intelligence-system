import React, { useState, useEffect } from 'react';
import { HeartPulse, Info, HelpCircle } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

const STATUS_COLORS = {
  'Excellent': '#10b981',
  'Healthy': '#14b8a6',
  'Moderate Concern': '#f59e0b',
  'Vulnerable': '#f97316',
  'Critical': '#ef4444'
};

const FACTOR_COLORS = {
  speciesDiversity: '#10b981',
  populationStability: '#14b8a6',
  habitatQuality: '#2563eb',
  endangeredStatus: '#f59e0b',
  environmentalConditions: '#8b5cf6'
};

export default function HealthScorePage() {
  const [periodDays, setPeriodDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    fetch(`${API_BASE}/health-score?periodDays=${periodDays}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load ecosystem health score');
        return res.json();
      })
      .then(json => {
        setData(json);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [periodDays]);

  if (loading) {
    return <div className="eco-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating 5-factor ecosystem health metrics...</div>;
  }

  if (error || !data) {
    return (
      <div className="eco-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#ef4444' }}>
        {error || 'Could not load ecosystem health score.'}
      </div>
    );
  }

  const statusColor = STATUS_COLORS[data.status] || '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-dark)' }}>Ecosystem Health Index</h2>
            <span className="badge-pill" style={{ background: `${statusColor}20`, color: statusColor }}>
              {data.status}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Composite environmental health index evaluated across 5 weighted ecological factors.
          </p>
        </div>

        <select
          value={periodDays}
          onChange={e => setPeriodDays(Number(e.target.value))}
          style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
        >
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={180}>Last 180 Days</option>
          <option value={365}>Last 365 Days</option>
        </select>
      </div>

      {/* Main Score Hero Widget */}
      <div className="eco-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: `${statusColor}15`, color: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={44} />
          </div>

          <div>
            <div style={{ fontSize: '3.2rem', fontWeight: '800', color: statusColor, lineHeight: 1 }}>
              {data.overallScore}
              <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginTop: '0.4rem' }}>
              Status: {data.status}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Generated on {new Date(data.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Status Band Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>HEALTH STATUS BANDS</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span><strong>Excellent:</strong> 85 – 100</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#14b8a6' }}></span><strong>Healthy:</strong> 70 – 84</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span><strong>Moderate:</strong> 50 – 69</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }}></span><strong>Vulnerable:</strong> 30 – 49</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span><strong>Critical:</strong> &lt; 30</div>
        </div>
      </div>

      {/* Weighted Formula Info Box */}
      <div className="eco-card" style={{ padding: '1.25rem 1.5rem', background: '#f5f9f7', borderLeft: '4px solid var(--forest-green)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <HelpCircle size={20} color="var(--forest-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>Formula & Component Weighting Model</h4>
            <code style={{ fontSize: '0.78rem', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '6px', display: 'inline-block', border: '1px solid var(--border-light)', color: 'var(--forest-green)', fontWeight: 700 }}>
              {data.formula || 'Score = SpeciesDiversity*0.30 + PopulationStability*0.25 + HabitatQuality*0.20 + EndangeredStatus*0.15 + EnvironmentalConditions*0.10'}
            </code>
          </div>
        </div>
      </div>

      {/* 5 Factor Progress Meters */}
      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>5-Component Breakdown Meters</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {data.factors && Object.entries(data.factors).map(([key, f]) => {
            const factorColor = FACTOR_COLORS[key] || '#10b981';
            const labelName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const scoreVal = f.score !== null ? f.score : 0;

            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-dark)' }}>{labelName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(Weight: {f.weight})</span>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: factorColor }}>{scoreVal} / 100</span>
                </div>

                {/* Progress Meter */}
                <div style={{ width: '100%', height: '10px', borderRadius: '9999px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, scoreVal))}%`,
                      height: '100%',
                      background: factorColor,
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {f.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}