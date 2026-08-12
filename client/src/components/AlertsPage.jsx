import React from 'react';
import { AlertTriangle, TrendingDown, ShieldAlert, Layers } from 'lucide-react';
import { getSpeciesImageUrl } from '../utils/speciesImages';

export default function AlertsPage({ species = [], sightings = [] }) {
  const alertSpecies = species.filter(sp => ['Critical', 'Vulnerable'].includes(sp.conservationStatus));
  const speciesById = new Map(species.map(sp => [sp._id?.toString(), sp]));

  const alertSightings = sightings.filter((s) => {
    const sightingSpecies = typeof s.species === 'string'
      ? speciesById.get(s.species.toString())
      : s.species;
    return ['Critical', 'Vulnerable'].includes(sightingSpecies?.conservationStatus);
  });

  const latestAlerts = [...alertSightings]
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .slice(0, 4);

  const topAlertSpecies = [...alertSpecies]
    .map((sp) => ({
      ...sp,
      sightingCount: sightings.filter((s) => {
        const sightingSpecies = typeof s.species === 'string'
          ? speciesById.get(s.species.toString())
          : s.species;
        return sightingSpecies?._id?.toString() === sp._id?.toString();
      }).length
    }))
    .sort((a, b) => b.sightingCount - a.sightingCount)
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-dark)' }}>Alerts & Conservation Watch</h2>
          <span className="badge-pill badge-red">Attention</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Review real-time risk alerts for threatened species and vulnerable populations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>THREATENED SPECIES</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{alertSpecies.length}</div>
            </div>
            <ShieldAlert size={18} color="#b91c1c" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Critical and Vulnerable species under active monitoring.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ACTIVE ALERTS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{latestAlerts.length}</div>
            </div>
            <AlertTriangle size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Recent field observations with conservation concern.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PRIORITY SPECIES</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{topAlertSpecies.length}</div>
            </div>
            <Layers size={18} color="#065f46" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Species with the highest vulnerable sighting activity.</div>
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>Alert Watchlist</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Species needing immediate conservation focus.</p>
          </div>
          <span className="badge-pill badge-red">Critical / Vulnerable</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {topAlertSpecies.map((sp) => (
            <div key={sp._id} className="alert-row alert-row-red" style={{ padding: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: '#0a1612' }}>
                  <img src={getSpeciesImageUrl(sp)} alt={sp.commonName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>{sp.commonName}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-medium)' }}>{sp.scientificName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.9rem' }}>
                <span className={`badge-pill ${sp.conservationStatus === 'Critical' ? 'badge-red' : 'badge-pill'}`}>
                  {sp.conservationStatus}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sp.sightingCount} sightings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>Recent Alerts</h3>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {latestAlerts.length ? latestAlerts.map((sighting) => {
            const sightingSpecies = typeof sighting.species === 'string'
              ? speciesById.get(sighting.species.toString())
              : sighting.species;
            return (
              <div key={sighting._id} className="alert-row alert-row-gray" style={{ padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                      {sightingSpecies?.commonName || 'Unknown Species'} sighted at {sighting.monitoringSite?.siteName || sighting.locality || 'Unknown location'}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)', marginBottom: '0.45rem' }}>
                      {sighting.notes || 'Field observation requires review by the conservation team.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(sighting.eventDate || sighting.createdAt).toLocaleDateString()}</span>
                      <span>{sighting.individualCount || 1} specimen(s)</span>
                      <span>{Math.round((sighting.classifierConfidence || 0.8) * 100)}% confidence</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <TrendingDown size={20} color="#b91c1c" />
                    <span className="badge-pill badge-red">Critical Watch</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: 'var(--text-muted)' }}>
              No alert sightings are currently available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
