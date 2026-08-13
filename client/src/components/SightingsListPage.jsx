import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle, AlertTriangle, MapPin, Eye } from 'lucide-react';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import { getSpeciesImageUrl } from '../utils/speciesImages';

export default function SightingsListPage({ sightings, speciesList, sitesList, onSelectSighting, onOpenLogSighting }) {
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [selectedSite, setSelectedSite] = useState('All');
  const [search, setSearch] = useState('');

  const filteredSightings = sightings.filter(s => {
    const speciesMatch = selectedSpecies === 'All' || s.species?._id === selectedSpecies || s.species?.commonName === selectedSpecies;
    const siteMatch = selectedSite === 'All' || s.monitoringSite?._id === selectedSite || s.monitoringSite?.siteName === selectedSite;
    const searchMatch = (s.species?.commonName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.locality || s.monitoringSite?.siteName || '').toLowerCase().includes(search.toLowerCase());
    return speciesMatch && siteMatch && searchMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Wildlife Sightings Telemetry</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Recorded field observations and AI vision confidence logs
          </p>
        </div>

        <button className="btn-new-survey" onClick={onOpenLogSighting}>
          <Plus size={16} /> Log New Sighting
        </button>
      </div>

      {/* Filters Bar */}
      <div className="eco-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search sightings..."
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

          {/* Filter Species */}
          <select
            value={selectedSpecies}
            onChange={e => setSelectedSpecies(e.target.value)}
            style={{ background: '#f9fafb', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
          >
            <option value="All">All Species</option>
            {speciesList.map(sp => (
              <option key={sp._id} value={sp._id}>{sp.commonName}</option>
            ))}
          </select>

          {/* Filter Site */}
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
          Showing {filteredSightings.length} records
        </span>
      </div>

      {/* Sightings Table */}
      <div className="eco-card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Specimen Media</th>
                <th style={{ padding: '0.75rem 1rem' }}>Species</th>
                <th style={{ padding: '0.75rem 1rem' }}>Site / Locality</th>
                <th style={{ padding: '0.75rem 1rem' }}>Event Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Observed By</th>
                <th style={{ padding: '0.75rem 1rem' }}>AI Prediction Confidence</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSightings.map((sighting, idx) => {
                const conf = (sighting.classifierConfidence || 0.95) * 100;
                const confBadge = 
                  conf > 80 ? 'badge-green' :
                  conf >= 50 ? 'badge-pill' : 'badge-red';
                // Real species name as identified by the classifier and matched via classifierLabel
                // in sightingController.js. No display overrides — what's shown here is what's stored.
                const displayCommonName = sighting.species?.commonName || 'Unknown';
                return (
                  <tr 
                    key={sighting._id}
                    onClick={() => onSelectSighting(sighting)}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.2s ease' }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#0a1612' }}>
                        <img 
                          src={resolveImageUrl(sighting.imageUrl) || getSpeciesImageUrl(sighting.species)}
                          alt="Thumbnail" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{displayCommonName}</div>
                      <div style={{ fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>{sighting.species?.scientificName}</div>
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-medium)', fontWeight: '600' }}>
                        <MapPin size={14} color="var(--forest-green)" /> {sighting.monitoringSite?.siteName || sighting.locality || 'Bandipur Reserve'}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-medium)', fontSize: '0.8rem' }}>
                      {new Date(sighting.eventDate || sighting.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-medium)' }}>
                      {sighting.observedBy?.name || 'Nigesh Researcher'}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge-pill ${confBadge}`}>
                        {conf.toFixed(1)}% Confidence
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {sighting.verified ? (
                        <span className="badge-pill badge-green" style={{ gap: '0.2rem' }}>
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="badge-pill badge-gray">
                          Pending Review
                        </span>
                      )}
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
