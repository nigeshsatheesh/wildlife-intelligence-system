import React, { useState, useEffect } from 'react';
import { Sprout, Info, MapPin } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function BiodiversityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/analytics/biodiversity`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load biodiversity metrics');
        return res.json();
      })
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="eco-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading biodiversity metrics...</div>;
  if (error) return <div className="eco-card" style={{ padding: '2rem', textAlign: 'center', color: '#c0392b' }}>{error}</div>;

  const { overall, perSite } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Biodiversity Intelligence</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Shannon Diversity Index computed from real recorded sightings
        </p>
      </div>

      <div className="eco-card" style={{ padding: '1rem 1.25rem', background: '#f5f9f7', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} color="var(--forest-green)" />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          The Shannon Diversity Index (H') measures both how many species are present (richness) and how
          evenly sightings are distributed across them. <strong>Evenness</strong> is H' normalized to a
          0–1 scale, where 1 means every observed species was sighted equally often.
        </p>
      </div>

      <div className="eco-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <Sprout size={16} color="var(--forest-green)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>System-wide Diversity</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Shannon Index (H')</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{overall.index}</div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Species Richness</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{overall.speciesRichness}</div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Evenness</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{overall.evenness}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem' }}>By Monitoring Site</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {perSite.length === 0 && (
            <div className="eco-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No monitoring sites recorded yet.
            </div>
          )}
          {perSite.map(site => (
            <div key={site.siteId} className="eco-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--forest-green)" />
                  <span style={{ fontWeight: '700' }}>{site.siteName}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{site.totalSightings} sighting(s)</span>
              </div>
              {site.totalSightings === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No sightings recorded at this site yet.</div>
              ) : (
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>H': </span><strong>{site.index}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Richness: </span><strong>{site.speciesRichness}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Evenness: </span><strong>{site.evenness}</strong></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}