import React, { useState } from 'react';
import { Search, Plus, MapPin, Trees, Radio } from 'lucide-react';

export default function SitesListPage({ sites = [], onOpenAddSite, habitatData = [] }) {
  const [search, setSearch] = useState('');
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [envSite, setEnvSite] = useState(sites?.[0]?._id || '');
  const [temp, setTemp] = useState('28.5');
  const [rainfall, setRainfall] = useState('10.0');
  const [humidity, setHumidity] = useState('65');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

  const handleEnvSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/environment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: envSite || sites[0]?._id,
          temperature: Number(temp),
          rainfall: Number(rainfall),
          humidity: Number(humidity)
        })
      });
      if (res.ok) {
        alert('Environment reading recorded successfully!');
        setIsEnvModalOpen(false);
      } else {
        alert('Failed to record environment reading');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const safeSites = Array.isArray(sites) ? sites : [];
  const safeHabitatData = Array.isArray(habitatData) ? habitatData : [];

  const filteredSites = safeSites.filter(s => 
    (s?.siteName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s?.siteCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (s?.protectedArea || '').toLowerCase().includes(search.toLowerCase())
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
          <button
            className="btn-primary"
            onClick={() => setIsEnvModalOpen(true)}
            style={{ background: '#ffffff', color: 'var(--forest-green)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
          >
            + Add Env Reading
          </button>

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
                  {safeHabitatData.find(h => (h?.siteId === site._id || h?.siteId === site._id?.toString())) && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Richness Index: {safeHabitatData.find(h => (h?.siteId === site._id || h?.siteId === site._id?.toString()))?.richnessIndex} · {safeHabitatData.find(h => (h?.siteId === site._id || h?.siteId === site._id?.toString()))?.activityLevel}
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

      {/* Environment Reading Modal */}
      {isEnvModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '440px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Record Environment Reading</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Submit field ambient temperature, rainfall, and humidity.</p>

            <form onSubmit={handleEnvSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Monitoring Site:</label>
                <select
                  value={envSite}
                  onChange={e => setEnvSite(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                >
                  {sites.map(s => <option key={s._id} value={s._id}>{s.siteName}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Temperature (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Rainfall (mm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rainfall}
                    onChange={e => setRainfall(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Humidity (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={e => setHumidity(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEnvModalOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Saving...' : 'Save Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
