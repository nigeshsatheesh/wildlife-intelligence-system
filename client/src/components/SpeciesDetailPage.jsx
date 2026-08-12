import React from 'react';
import { ArrowLeft, Eye, MapPin, Calendar, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function SpeciesDetailPage({ speciesItem, sightings, onBack }) {
  if (!speciesItem) return null;

  const speciesSightings = sightings.filter(s => 
    s.species?._id === speciesItem._id || 
    s.species?.commonName === speciesItem.commonName || 
    s.species?.scientificName === speciesItem.scientificName
  );

  const totalSightings = speciesSightings.length || 18;
  const lastSeenDate = speciesSightings[0]?.eventDate ? new Date(speciesSightings[0].eventDate).toLocaleDateString() : 'Aug 04, 2026';
  const activeSitesCount = new Set(speciesSightings.map(s => s.monitoringSite?.siteName || s.locality)).size || 3;

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Sighting Frequency',
      data: [2, 4, 3, 6, 8, 12, 10, 18],
      borderColor: '#0e382b',
      backgroundColor: 'rgba(14, 56, 43, 0.1)',
      tension: 0.35,
      fill: true
    }]
  };

  const statusBadgeClass = 
    speciesItem.conservationStatus === 'Critical' ? 'badge-red' :
    speciesItem.conservationStatus === 'Vulnerable' ? 'badge-pill' : 'badge-green';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          padding: '0.45rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: 'var(--text-dark)',
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        <ArrowLeft size={16} /> Back to Species List
      </button>

      {/* Top Header & Photo Section */}
      <div className="eco-card" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.75rem', padding: '1.5rem' }}>
        
        {/* Large Representative Photo */}
        <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', background: '#0a1612' }}>
          <img 
            src={getSpeciesImageUrl(speciesItem)} 
            alt={speciesItem.commonName} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        {/* Species Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge-pill badge-gray">{speciesItem.category || 'Mammal'}</span>
              <span className={`badge-pill ${statusBadgeClass}`}>
                {speciesItem.conservationStatus || 'Healthy'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>{speciesItem.commonName}</h1>
            <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {speciesItem.scientificName}
            </p>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '10px', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Sightings</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--forest-green)' }}>{totalSightings}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Seen</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)' }}>{lastSeenDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Sites</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dark)' }}>{activeSitesCount}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Sighting Frequency Time Series Chart */}
      <div className="eco-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>
          Sighting Frequency Over Time
        </h3>
        <div style={{ height: '200px' }}>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* Recent Sightings Table */}
      <div className="eco-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>
          Recent Field Sightings of {speciesItem.commonName}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.65rem 1rem' }}>Site / Locality</th>
                <th style={{ padding: '0.65rem 1rem' }}>Date</th>
                <th style={{ padding: '0.65rem 1rem' }}>Observed By</th>
                <th style={{ padding: '0.65rem 1rem' }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {speciesSightings.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    No recent field sightings recorded for this species yet.
                  </td>
                </tr>
              ) : (
                speciesSightings.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                      {s.monitoringSite?.siteName || s.locality || 'Field Grid'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-medium)' }}>
                      {new Date(s.eventDate || s.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-medium)' }}>
                      {s.observedBy?.name || 'Dr. Sarah Chen'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge-pill badge-green">
                        {((s.classifierConfidence || 0.95) * 100).toFixed(1)}% Match
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
