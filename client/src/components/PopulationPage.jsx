import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, MapPin, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function PopulationPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodDays, setPeriodDays] = useState(90);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetch(`${API_BASE}/population?periodDays=${periodDays}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load population metrics');
        return res.json();
      })
      .then(data => { if (!cancelled) setMetrics(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [periodDays]);

  if (loading) {
    return <div className="eco-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading population data...</div>;
  }

  if (error) {
    return (
      <div className="eco-card" style={{ padding: '2rem', textAlign: 'center', color: '#c0392b' }}>
        {error}. Make sure the backend server is running.
      </div>
    );
  }

  const activeSpecies = metrics.speciesMetrics.filter(sp => sp.populationSize > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Population Intelligence</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Minimum count index, density, and growth trends derived from real sighting records
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

      <div className="eco-card" style={{ padding: '1rem 1.25rem', background: '#f5f9f7', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} color="var(--forest-green)" />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Population size shown is a <strong>minimum count index</strong> — the sum of individuals
          recorded in sightings this period. It is not corrected for the same animal being
          photographed more than once, so treat it as a lower bound, not an exact census.
          Density is only shown for monitoring sites with a known area.
        </p>
      </div>

      {activeSpecies.length === 0 && (
        <div className="eco-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No sightings recorded in this period yet.
        </div>
      )}

      {activeSpecies.map(sp => (
        <div key={sp.speciesId} className="eco-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>{sp.commonName}</h3>
              <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>{sp.scientificName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                <Users size={16} color="var(--forest-green)" />
                <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{sp.populationSize}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: sp.growthRate > 0 ? '#2e7d32' : sp.growthRate < 0 ? '#c0392b' : 'var(--text-muted)' }}>
                {sp.growthRate > 0 ? <TrendingUp size={12} /> : sp.growthRate < 0 ? <TrendingDown size={12} /> : null}
                {sp.growthRateLabel}
              </div>
            </div>
          </div>

          {sp.siteBreakdown.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              {sp.siteBreakdown.map(site => (
                <div key={site.siteId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    {site.siteName}
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    {site.count} individuals
                    {site.densityPerKm2 != null
                      ? ` · ${site.densityPerKm2}/km²`
                      : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · density unavailable (no area set)</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {metrics.richnessBySite.length > 0 && (
        <div className="eco-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem' }}>Species Richness by Site</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {metrics.richnessBySite.map(site => (
              <div key={site.siteId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0' }}>
                <span>{site.siteName}</span>
                <span style={{ color: 'var(--text-muted)' }}>{site.speciesRichness} species · {site.totalSightings} sightings</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}