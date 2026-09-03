import React from 'react';
import { Compass, MapPin, Radio, ClipboardCheck } from 'lucide-react';

export default function ForestDepartmentDashboard({ sites = [], sightings = [], species = [] }) {
  const activeSites = sites.filter(s => s.active);
  const protectedAreas = [...new Set(sites.map(s => s.protectedArea).filter(Boolean))];
  const unverified = sightings.filter(s => !s.verified);

  const recentMovement = [...sightings]
    .sort((a, b) => new Date(b.eventDate || b.createdAt) - new Date(a.eventDate || a.createdAt))
    .slice(0, 6);

  const flaggedSightings = sightings.filter(s => {
    const status = s.species?.conservationStatus;
    return !s.verified || status === 'Critical' || status === 'Vulnerable';
  }).slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Good morning, Forest Department Officer
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', fontWeight: '500' }}>
          Protected area monitoring and wildlife movement across active sites.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>PROTECTED AREAS</span>
            <Compass size={18} color="var(--forest-green)" />
          </div>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{protectedAreas.length}</span>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>ACTIVE MONITORING SITES</span>
            <Radio size={18} color="var(--forest-green)" />
          </div>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{activeSites.length} / {sites.length}</span>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>PENDING VERIFICATION</span>
            <ClipboardCheck size={18} color="var(--forest-green)" />
          </div>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{unverified.length}</span>
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} /> Protected Area Monitoring
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
          {sites.map(site => (
            <div key={site._id} className="eco-card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)' }}>{site.siteName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{site.protectedArea}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{site.habitatType} · {site.monitoringDevice}</div>
              <span className={`badge-pill ${site.active ? 'badge-green' : 'badge-gray'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                {site.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>Wildlife Movement — Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {recentMovement.length ? recentMovement.map(s => (
            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{s.species?.commonName || 'Unknown species'}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.monitoringSite?.siteName || s.locality}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(s.eventDate || s.createdAt).toLocaleDateString()}</span>
            </div>
          )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent sightings recorded.</div>}
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Sightings Flagged for Follow-up</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
          Derived from unverified reports and Critical/Vulnerable species sightings — there's no dedicated patrol-scheduling
          module yet, so this surfaces the underlying data that patrol planning would draw from.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {flaggedSightings.length ? flaggedSightings.map(s => (
            <div key={s._id} className="alert-row alert-row-gray">
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                  {s.species?.commonName || 'Unclassified'} at {s.monitoringSite?.siteName || s.locality}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                  {s.verified ? 'Verified' : 'Unverified'} · {s.species?.conservationStatus || 'Status unknown'}
                </p>
              </div>
              <span className={`badge-pill ${s.verified ? 'badge-gray' : 'badge-red'}`}>{s.verified ? 'Review' : 'Unverified'}</span>
            </div>
          )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nothing flagged right now.</div>}
        </div>
      </div>
    </div>
  );
}