import React from 'react';
import { ShieldAlert, TrendingDown, TrendingUp, ClipboardList, AlertTriangle, Trees } from 'lucide-react';

const priorityOrder = { High: 0, Medium: 1, Low: 2 };
const priorityBadge = { High: 'badge-red', Medium: 'badge-gray', Low: 'badge-green' };

export default function ConservationOfficerDashboard({ analytics = {}, species = [], recommendations = [] }) {
  const criticalSpeciesCount = species.filter(s => s.conservationStatus === 'Critical').length;

  const flatActions = recommendations
    .flatMap(r => (r.recommendations || []).map(a => ({
      ...a,
      commonName: r.commonName,
      conservationStatus: r.conservationStatus
    })))
    .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  const highPriorityCount = flatActions.filter(a => a.priority === 'High').length;

  const speciesTrends = analytics.conservationAlerts || [];
  const decliningSpecies = speciesTrends.filter(a => typeof a.trend === 'string' && a.trend.startsWith('-'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Good morning, Conservation Officer
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', fontWeight: '500' }}>
          Threat monitoring and conservation priorities across all tracked species.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>HIGH PRIORITY ACTIONS</span>
            <ShieldAlert size={18} color="var(--forest-green)" />
          </div>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{highPriorityCount}</span>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>CRITICAL SPECIES</span>
            <AlertTriangle size={18} color="var(--forest-green)" />
          </div>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{criticalSpeciesCount}</span>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>DECLINING TRENDS</span>
            <TrendingDown size={18} color="var(--forest-green)" />
          </div>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{decliningSpecies.length}</span>
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={18} /> Conservation Priorities &amp; Recommended Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {flatActions.length ? flatActions.map((a, i) => (
            <div key={i} style={{ padding: '0.9rem 1rem', borderRadius: '10px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)' }}>{a.commonName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-medium)', marginTop: '0.2rem' }}>{a.action}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>{a.reason}</div>
              </div>
              <span className={`badge-pill ${priorityBadge[a.priority] || 'badge-pill'}`} style={{ flexShrink: 0 }}>{a.priority}</span>
            </div>
          )) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No priority actions flagged right now.</div>
          )}
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>Species Trend Analysis</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {speciesTrends.map(s => (
            <div key={s.speciesId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{s.commonName}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.sightingCount} sighting(s)</span>
              <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: s.trend?.startsWith('-') ? '#b91c1c' : 'var(--text-medium)' }}>
                {s.trend?.startsWith('-') ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {s.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {decliningSpecies.length > 0 && (
        <div className="eco-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>Threats Requiring Attention</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {decliningSpecies.map(s => (
              <div key={s.speciesId} className="alert-row alert-row-red">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trees size={18} color="#b91c1c" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)' }}>{s.commonName} sightings declining</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)' }}>{s.trend} — status: {s.statusFlag}</p>
                  </div>
                </div>
                <span className="badge-pill badge-red">Investigate</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}