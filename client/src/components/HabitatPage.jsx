import React, { useState, useEffect } from 'react';
import { Leaf, MapPin, AlertCircle, Activity } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const activityColor = {
  'Active': '#2e7d32',
  'Moderate': '#c9a227',
  'Stale': '#c0392b',
  'No Data': 'var(--text-muted)'
};

export default function HabitatPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/habitat?periodDays=90`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load habitat metrics');
        return res.json();
      })
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="eco-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading habitat intelligence...</div>;
  if (error) return <div className="eco-card" style={{ padding: '2rem', textAlign: 'center', color: '#c0392b' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Habitat Intelligence</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Activity-based habitat proxy metrics and conservation recommendations
        </p>
      </div>

      <div className="eco-card" style={{ padding: '1rem 1.25rem', background: '#f5f9f7', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} color="var(--forest-green)" />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {data.methodologyNote}
        </p>
      </div>

      {data.siteReports.map(site => (
        <div key={site.siteId} className="eco-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} color="var(--forest-green)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>{site.siteName}</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{site.habitatType}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: activityColor[site.activityLevel] }}>
              <Activity size={13} />
              {site.activityLevel}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Richness Index</div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                {site.richnessIndex}%
                {site.richnessTrend !== 0 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, marginLeft: '0.4rem', color: site.richnessTrend > 0 ? '#2e7d32' : '#c0392b' }}>
                    {site.richnessTrend > 0 ? '+' : ''}{site.richnessTrend}
                  </span>
                )}
              </div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conservation Priority</div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>{site.conservationPriorityScore}/100</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {site.recommendations.map((rec, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', padding: '0.55rem 0.75rem', background: '#fff9ec', borderRadius: '8px', border: '1px solid #f0e4c0' }}>
                <Leaf size={14} color="#b8860b" style={{ flexShrink: 0, marginTop: '1px' }} />
                {rec}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}