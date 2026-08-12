import React from 'react';
import { Layers, CalendarDays, FileText, TrendingDown } from 'lucide-react';

export default function ReportsPage({ analytics = {}, species = [], sightings = [] }) {
  const statusCounts = species.reduce((acc, sp) => {
    const key = sp.conservationStatus || 'Healthy';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const recentSightings = [...sightings]
    .sort((a, b) => new Date(b.eventDate || b.createdAt) - new Date(a.eventDate || a.createdAt))
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-dark)' }}>Reports & Intelligence</h2>
          <span className="badge-pill badge-green">Data-driven</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Generated conservation reports using the latest sightings and biodiversity analytics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TOTAL SIGHTINGS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{analytics.totalSightings ?? sightings.length}</div>
            </div>
            <CalendarDays size={18} color="#065f46" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Field records processed into actionable reports.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ACTIVE SPECIES</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{analytics.activeSpeciesCount ?? species.length}</div>
            </div>
            <Layers size={18} color="#0f766e" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tracked taxa contributing to biodiversity reporting.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SITE COVERAGE</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{analytics.activeSitesCount ?? '—'}</div>
            </div>
            <FileText size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Field stations and camera trap deployments available for analysis.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MONTHLY TREND</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{analytics.sightingTrends?.length ? `${analytics.sightingTrends.length} months` : 'N/A'}</div>
            </div>
            <TrendingDown size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Time series data available for report generation.</div>
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>Conservation Status Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="eco-card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>{status}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>Recent Sightings Snapshot</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest field logs</span>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {recentSightings.length ? recentSightings.map((sighting) => (
            <div key={sighting._id} style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                  {sighting.species?.commonName || 'Unknown species'} at {sighting.monitoringSite?.siteName || sighting.locality || 'unknown location'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {new Date(sighting.eventDate || sighting.createdAt).toLocaleString()} • {sighting.individualCount || 1} specimen(s)
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span className={`badge-pill ${sighting.verified ? 'badge-green' : 'badge-pill'}`} style={{ fontSize: '0.75rem' }}>
                  {sighting.verified ? 'Verified' : 'Unverified'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((sighting.classifierConfidence || 0.85) * 100)}% AI confidence</span>
              </div>
            </div>
          )) : (
            <div style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: 'var(--text-muted)' }}>
              No recent sightings are available to populate report snapshots.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
