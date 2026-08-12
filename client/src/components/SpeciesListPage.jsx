import React, { useState } from 'react';
import { Search, Plus, Filter, ArrowRight } from 'lucide-react';
import { getSpeciesImageUrl } from '../utils/speciesImages';

export default function SpeciesListPage({ species, user, onSelectSpecies, onOpenAddSpecies }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredSpecies = species.filter(s => {
    const matchesSearch = (s.commonName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.scientificName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.conservationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Species Catalog</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Monitored wildlife taxa and conservation status classification
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search species..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                fontSize: '0.85rem',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>

          {/* Conservation Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              outline: 'none',
              fontWeight: '600'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Moderate Concern">Moderate Concern</option>
            <option value="Vulnerable">Vulnerable</option>
            <option value="Critical">Critical</option>
          </select>

          {/* + Add Species Button (Admin Conceptually) */}
          {(user?.role === 'Admin' || true) && (
            <button className="btn-new-survey" onClick={onOpenAddSpecies}>
              <Plus size={16} /> Add Species
            </button>
          )}
        </div>
      </div>

      {/* Species Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredSpecies.map(sp => {
          const statusBadge = 
            sp.conservationStatus === 'Critical' ? 'badge-red' :
            sp.conservationStatus === 'Vulnerable' ? 'badge-pill' : 'badge-green';

          return (
            <div key={sp._id} className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem' }}>
              <div>
                {/* Species Representative Photo */}
                <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.85rem', background: '#0a1612' }}>
                  <img 
                    src={getSpeciesImageUrl(sp)} 
                    alt={sp.commonName} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>{sp.commonName}</h3>
                    <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>{sp.scientificName}</p>
                  </div>
                  <span className={`badge-pill ${statusBadge}`}>
                    {sp.conservationStatus || 'Healthy'}
                  </span>
                </div>
              </div>

              {/* View Details Link */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Category: {sp.category || 'Mammal'}</span>
                <button
                  onClick={() => onSelectSpecies(sp)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--forest-green)',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  View Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
