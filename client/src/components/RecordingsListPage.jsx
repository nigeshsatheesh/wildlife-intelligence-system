import React, { useState } from 'react';
import { Plus, Search, MapPin, Music } from 'lucide-react';

const CATEGORY_COLORS = {
  'Bird Call': '#2f855a',
  'Mammal Vocalization': '#b7791f',
  'Amphibian Call': '#2b6cb0',
  'Insect Sound': '#6b46c1',
  'Environmental Noise': '#718096'
};

export default function RecordingsListPage({ recordings, sitesList, onOpenLogRecording }) {
  const [selectedSite, setSelectedSite] = useState('All');
  const [search, setSearch] = useState('');

  const filteredRecordings = recordings.filter(r => {
    const siteMatch = selectedSite === 'All' || r.monitoringSite?._id === selectedSite || r.monitoringSite?.siteName === selectedSite;
    const searchMatch = (r.topLabel || '').toLowerCase().includes(search.toLowerCase()) ||
                        (r.monitoringSite?.siteName || '').toLowerCase().includes(search.toLowerCase());
    return siteMatch && searchMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Bioacoustic Recordings</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Field audio logs and AI-detected acoustic events (YAMNet)
          </p>
        </div>

        <button className="btn-new-survey" onClick={onOpenLogRecording}>
          <Plus size={16} /> Log New Recording
        </button>
      </div>

      {/* Filters Bar */}
      <div className="eco-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search recordings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#f9fafb',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem 0.4rem 2.2rem',
                fontSize: '0.85rem',
                outline: 'none',
                width: '180px'
              }}
            />
          </div>

          <select
            value={selectedSite}
            onChange={e => setSelectedSite(e.target.value)}
            style={{ background: '#f9fafb', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
          >
            <option value="All">All Sites</option>
            {sitesList.map(st => (
              <option key={st._id} value={st._id}>{st.siteName}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
          Showing {filteredRecordings.length} records
        </span>
      </div>

      {/* Recordings Table */}
      <div className="eco-card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Recording</th>
                <th style={{ padding: '0.75rem 1rem' }}>Top Detected Event</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Site / Locality</th>
                <th style={{ padding: '0.75rem 1rem' }}>Event Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecordings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No bioacoustic recordings logged yet.
                  </td>
                </tr>
              ) : filteredRecordings.map((rec) => {
                const conf = (rec.topConfidence || 0) * 100;
                const confBadge = conf > 80 ? 'badge-green' : conf >= 50 ? 'badge-pill' : 'badge-red';
                const topEventCategory = rec.detectedEvents?.[0]?.category || 'Environmental Noise';

                return (
                  <tr key={rec._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f3ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Music size={16} color="var(--forest-green)" />
                        </div>
                        <audio controls src={`http://localhost:5000${rec.audioUrl}`} style={{ height: '30px', maxWidth: '160px' }} />
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{rec.topLabel || 'Unclassified'}</div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                        background: CATEGORY_COLORS[topEventCategory] || '#718096',
                        borderRadius: '999px', padding: '0.2rem 0.6rem'
                      }}>
                        {topEventCategory}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-medium)', fontWeight: '600' }}>
                        <MapPin size={14} color="var(--forest-green)" /> {rec.monitoringSite?.siteName || 'Unknown Site'}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-medium)', fontSize: '0.8rem' }}>
                      {new Date(rec.eventDate || rec.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span className={`badge-pill ${confBadge}`}>
                        {conf.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}