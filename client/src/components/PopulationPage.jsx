import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, TrendingDown, MapPin, Info } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

function DistributionMap({ species }) {
  const points = species?.distributionPoints || [];

  if (points.length === 0) {
    return (
      <div className="eco-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No geo-tagged sightings for {species?.commonName || 'this species'} in this period.
      </div>
    );
  }

  const xPositions = [28, 52, 72, 85, 38, 62];
  const yPositions = [38, 56, 32, 62, 68, 42];

  return (
    <div className="eco-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
      <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-dark)' }}>Wildlife Distribution GIS Map</h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{points.length} Observation Zones</span>
      </div>

      <div style={{
        height: '280px',
        borderRadius: '0 0 12px 12px',
        background: 'linear-gradient(135deg, #c7e9d9 0%, #b8decb 50%, #d4ede1 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #b2d8c5'
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <path d="M 0 60 Q 80 20 160 80 T 320 50 T 480 110 T 600 70" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
          <path d="M 0 120 Q 100 80 200 140 T 400 100 T 600 150" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
          <path d="M 0 170 Q 120 140 240 180 T 480 160 T 600 190" fill="none" stroke="#90c8ad" strokeWidth="2" opacity="0.7" />
          <path d="M -10 160 C 100 140, 150 200, 250 180 C 350 160, 400 220, 610 180" fill="none" stroke="#60a5fa" strokeWidth="4" opacity="0.8" />
        </svg>

        {points.map((p, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: `${yPositions[idx % yPositions.length]}%`,
              left: `${xPositions[idx % xPositions.length]}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#113829',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
            }} />
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#113829',
              background: 'rgba(255,255,255,0.92)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {p.siteName}: {p.count} sighted
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

let cachedPopulationData = {};

export default function PopulationPage() {
  const [periodDays, setPeriodDays] = useState(90);
  const [metrics, setMetrics] = useState(cachedPopulationData[90] || null);
  const [loading, setLoading] = useState(!cachedPopulationData[90]);
  const [error, setError] = useState('');
  const [mapSpeciesId, setMapSpeciesId] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (cachedPopulationData[periodDays]) {
      setMetrics(cachedPopulationData[periodDays]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetch(`${API_BASE}/population?periodDays=${periodDays}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load population metrics');
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          cachedPopulationData[periodDays] = data;
          setMetrics(data);
        }
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [periodDays]);

  const activeSpecies = useMemo(
    () => metrics ? metrics.speciesMetrics.filter(sp => sp.populationSize > 0) : [],
    [metrics]
  );

  useEffect(() => {
    if (activeSpecies.length > 0 && !activeSpecies.find(sp => sp.speciesId === mapSpeciesId)) {
      setMapSpeciesId(activeSpecies[0].speciesId);
    }
  }, [activeSpecies, mapSpeciesId]);

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

  const selectedSpecies = activeSpecies.find(sp => sp.speciesId === mapSpeciesId);

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

      {activeSpecies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Species Distribution Map</h3>
            <select
              value={mapSpeciesId}
              onChange={e => setMapSpeciesId(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
            >
              {activeSpecies.map(sp => (
                <option key={sp.speciesId} value={sp.speciesId}>{sp.commonName}</option>
              ))}
            </select>
          </div>
          <DistributionMap species={selectedSpecies} />
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