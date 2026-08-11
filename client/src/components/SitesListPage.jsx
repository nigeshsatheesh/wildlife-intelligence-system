import React, { useState } from 'react';
import { Search, Plus, MapPin, Trees, Radio, Compass, ShieldCheck } from 'lucide-react';

export default function SitesListPage({ sites, onOpenAddSite }) {
  const [search, setSearch] = useState('');

  const filteredSites = sites.filter(s => 
    (s.siteName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.siteCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.protectedArea || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Monitoring Sites</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Registered field stations, camera trap arrays, and protected reserves
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search site or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                fontSize: '0.85rem',
                outline: 'none',
                width: '220px'
              }}
            />
          </div>

          <button className="btn-new-survey" onClick={onOpenAddSite}>
            <Plus size={16} /> Add Site
          </button>
        </div>
      </div>

      {/* Static Placeholder Map Preview Section */}
      <div className="eco-card" style={{ padding: '1rem', position: 'relative', overflow: 'hidden', minHeight: '200px', background: 'linear-gradient(135deg, #dcfce7 0%, #e0f2fe 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={16} /> GIS Spatial Location Map Preview
          </span>
          <span className="badge-pill badge-green">{sites.length} Active Stations Plotted</span>
        </div>

        {/* Map Grid Container with Pins */}
        <div style={{
          width: '100%',
          height: '140px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid var(--border-light)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80" 
            alt="Map preview" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
          />

          {/* Interactive Map Pin Overlays */}
          {sites.map((st, idx) => (
            <div key={st._id} style={{
              position: 'absolute',
              top: `${25 + (idx * 18) % 55}%`,
              left: `${20 + (idx * 22) % 65}%`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid var(--forest-green)'
            }}>
              <MapPin size={12} color="var(--forest-green)" />
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-dark)' }}>{st.siteCode}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sites Table */}
      <div className="eco-card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Site Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Site Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Habitat Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Protected Area</th>
                <th style={{ padding: '0.75rem 1rem' }}>Monitoring Device</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => (
                <tr key={site._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {site.siteName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <code className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--forest-green)', background: '#e8f3ee', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {site.siteCode}
                    </code>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-medium)', fontWeight: '600' }}>
                      <Trees size={14} color="var(--forest-green)" /> {site.habitatType || 'Forest'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-medium)' }}>
                    {site.protectedArea || 'Protected Reserve'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-medium)' }}>
                      <Radio size={14} color="var(--forest-green)" /> {site.monitoringDevice || 'Camera Trap'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <span className={`badge-pill ${site.active !== false ? 'badge-green' : 'badge-gray'}`}>
                      {site.active !== false ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
