import React, { useState, useEffect } from 'react';
import { HeartPulse, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const STATUS_COLORS = {
  'Excellent': '#2e7d32',
  'Healthy': '#4caf50',
  'Moderate Concern': '#f9a825',
  'Vulnerable': '#ef6c00',
  'Critical': '#c0392b'
};

function FactorCard({ title, factor }) {
  const unavailable = factor.score === null;
  return (
    <div className="eco-card" style={{ padding: '1.1rem', opacity: unavailable ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{title}</h4>
        <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>
          {unavailable ? 'N/A' : factor.score}
        </span>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        Spec weight {factor.specWeight} · applied weight {factor.weight}
      </p>
      <p style={{ fontSize: '0.78rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
        {factor.note || factor.unavailableReason}
      </p>
    </div>
  );
}

export default function HealthScorePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodDays, setPeriodDays] = useState(90);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    fetch(`${API_BASE}/health-score?periodDays=${periodDays}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load ecosystem health score');
        return res.json();
      })
      .then(json => { if (!cancelled) setData(json); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [periodDays]);

  if (loading) {
    return <div className="eco-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading ecosystem health score...</div>;
  }
  if (error) {
    return (
      <div className="eco-card" style={{ padding: '2rem', textAlign: 'center', color: '#c0392b' }}>
        {error}. Make sure the backend server is running.
      </div>
    );
  }

  const statusColor = STATUS_COLORS[data.status] || 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Ecosystem Health Score</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Weighted composite of species diversity, population stability, habitat quality, and endangered species status
          </p>
        </div>
        <select
          value={periodDays}
          onChange={e => setPeriodDays(Number(e.target.value))}
          style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>

      <div className="eco-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <HeartPulse size={48} color={statusColor} />
        <div>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: statusColor, lineHeight: 1 }}>
            {data.overallScore}
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: statusColor, marginTop: '0.3rem' }}>
            {data.status}
          </div>
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1rem 1.25rem', background: '#f5f9f7', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} color="var(--forest-green)" />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {data.weightingNote}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <FactorCard title="Species Diversity" factor={data.factors.speciesDiversity} />
        <FactorCard title="Population Stability" factor={data.factors.populationStability} />
        <FactorCard title="Habitat Quality" factor={data.factors.habitatQuality} />
        <FactorCard title="Endangered Species Status" factor={data.factors.endangeredStatus} />
        <FactorCard title="Environmental Conditions" factor={data.factors.environmentalConditions} />
      </div>
    </div>
  );
}