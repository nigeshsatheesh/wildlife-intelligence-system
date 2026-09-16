import React, { useState } from 'react';
import { Search, Plus, MapPin, Trees, Radio, Compass, ShieldCheck } from 'lucide-react';

export default function SitesListPage({ sites, onOpenAddSite, habitatData = [] }) {
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

      {/* GIS Spatial Location Map Preview Section (same as Dashboard Wildlife Distribution) */}
      <div className="eco-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Compass size={18} color="var(--forest-green)" /> GIS Spatial Location Map Preview
          </span>
          <span className="badge-pill badge-green">{sites.length} Active Stations Plotted</span>
        </div>

        {/* Interactive GIS Map Canvas Graphic */}
        <div style={{
          height: '220px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #c7e9d9 0%, #b8decb 50%, #d4ede1 100%)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #b2d8c5'
        }}>
          {/* Topography vector paths / map terrain */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="M 0 60 Q 80 20 160 80 T 320 50 T 480 110 T 600 70" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
            <path d="M 0 120 Q 100 80 200 140 T 400 100 T 600 150" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
            <path d="M 0 170 Q 120 140 240 180 T 480 160 T 600 190" fill="none" stroke="#90c8ad" strokeWidth="2" opacity="0.7" />
            {/* River path */}
            <path d="M -10 160 C 100 140, 150 200, 250 180 C 350 160, 400 220, 610 180" fill="none" stroke="#60a5fa" strokeWidth="4" opacity="0.8" />
          </svg>

          {/* Map Location Labels matching existing map UI */}
          <div style={{ position: 'absolute', top: '45%', left: '15%', fontSize: '0.65rem', fontWeight: '800', color: '#165b40', background: 'rgba(255,255,255,0.85)', padding: '2px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
            <MapPin size={12} color="#113829" /> Bandipur Tiger Reserve
          </div>
          <div style={{ position: 'absolute', top: '25%', right: '18%', fontSize: '0.65rem', fontWeight: '800', color: '#165b40', background: 'rgba(255,255,255,0.85)', padding: '2px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
            <MapPin size={12} color="#10b981" /> Kaziranga Wetland Station
          </div>

          {/* Map Station Markers at exact dashboard coordinates (35% / 30%, 55% / 55%, 25% / 70%) */}
          <div style={{ position: 'absolute', top: '35%', left: '30%', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#113829', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#113829', background: 'rgba(255,255,255,0.88)', padding: '1px 5px', borderRadius: '4px' }}>BTR-ALPHA-01</span>
          </div>
          <div style={{ position: 'absolute', top: '55%', left: '55%', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#113829', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></span>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#113829', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: '4px' }}>Sector 4 Field Hub</span>
          </div>
          <div style={{ position: 'absolute', top: '25%', left: '70%', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', background: 'rgba(255,255,255,0.88)', padding: '1px 5px', borderRadius: '4px' }}>KZR-WET-02</span>
          </div>

          {/* Bottom Right Legend */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            padding: '0.35rem 0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-dark)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#113829' }}></span>
              Camera Trap Station
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-dark)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              High Activity Station
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-dark)' }}>
              <span style={{ width: '10px', height: '2px', background: '#60a5fa' }}></span>
              River Corridor
            </div>
          </div>
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
                <th style={{ padding: '0.75rem 1rem' }}>Habitat Activity</th>
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
                  <td style={{ padding: '0.85rem 1rem' }}>
                  {habitatData.find(h => h.siteId === site._id) && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Richness Index: {habitatData.find(h => h.siteId === site._id).richnessIndex} · {habitatData.find(h => h.siteId === site._id).activityLevel}
                    </span>
                  )}
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
