import React, { useState, useEffect } from 'react';
import { Layers, CalendarDays, FileText, TrendingDown } from 'lucide-react';

export default function ReportsPage({ analytics = {}, species = [], sightings = [] }) {
  const [healthScore, setHealthScore] = useState(null);
  const [healthScoreError, setHealthScoreError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_BASE}/api/health-score`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load health score');
        return res.json();
      })
      .then(setHealthScore)
      .catch(err => setHealthScoreError(err.message));
  }, []);

  const statusColor = (status) =>
    status === 'Excellent' || status === 'Healthy' ? 'badge-green' : 'badge-red';

  const statusCounts = species.reduce((acc, sp) => {
    const key = sp.conservationStatus || 'Healthy';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const recentSightings = [...sightings]
    .sort((a, b) => new Date(b.eventDate || b.createdAt) - new Date(a.eventDate || a.createdAt))
    .slice(0, 4);

  const handleDownloadReport = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in to generate the report.');

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/reports/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return alert('Failed to generate report');

      const disposition = res.headers.get('Content-Disposition');
      const match = disposition && disposition.match(/filename=(.+)/);
      const filename = match ? match[1].replace(/['"]/g, '') : 'wildlife-monitoring-report.pdf';

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not reach the server to generate the report. Is the backend running on port 5000?');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-dark)' }}>Reports & Intelligence</h2>
            <span className="badge-pill badge-green">Data-driven</span>
          </div>
          <button className="btn-new-survey" onClick={handleDownloadReport}>
            Download Report
          </button>
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
        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>Ecosystem Health Score</h3>
        {healthScoreError && (
          <div style={{ fontSize: '0.82rem', color: '#c0392b' }}>{healthScoreError}</div>
        )}
        {!healthScoreError && !healthScore && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading health score…</div>
        )}
        {healthScore && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{healthScore.weightingNote}</div>
              <span className={`badge-pill ${statusColor(healthScore.status)}`} style={{ flexShrink: 0, marginLeft: '1rem' }}>
                {healthScore.overallScore} — {healthScore.status}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(healthScore.factors).map(([key, f]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: '700', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> · weight {f.weight} (spec: {f.specWeight})</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {f.score === null ? f.unavailableReason : f.note}
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', flexShrink: 0, marginLeft: '1rem' }}>
                    {f.score === null ? 'N/A' : f.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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