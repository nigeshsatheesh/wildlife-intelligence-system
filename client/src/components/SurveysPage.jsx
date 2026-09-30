import React, { useState, useEffect } from 'react';
import { Compass, Plus, Search, Filter, Calendar, MapPin, Trees } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

export default function SurveysPage({ sites = [] }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New survey form state
  const [name, setName] = useState('');
  const [site, setSite] = useState(sites[0]?._id || '');
  const [protectedArea, setProtectedArea] = useState('');
  const [habitatType, setHabitatType] = useState('Forest');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/surveys`);
      if (res.ok) setSurveys(await res.json());
    } catch (err) {
      console.error('Failed to fetch surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedSite = sites.find(s => s._id === site || s.id === site) || sites[0];
      const res = await fetch(`${API_BASE}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          site: site || sites[0]?._id,
          protectedArea: protectedArea || selectedSite?.protectedArea || 'Protected Reserve',
          habitatType: habitatType || selectedSite?.habitatType || 'Forest',
          notes,
          status: 'active'
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setNotes('');
        await fetchSurveys();
      }
    } catch (err) {
      alert(`Error creating survey: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.surveyId || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.protectedArea || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Field Surveys Management</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active, planned, and completed ecological field census campaigns
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search survey or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <button className="btn-new-survey" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Survey
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="eco-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Filter Status:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'planned', 'completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                border: 'none',
                background: statusFilter === st ? 'var(--forest-green)' : '#f1f5f9',
                color: statusFilter === st ? '#ffffff' : 'var(--text-medium)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Surveys Table */}
      <div className="eco-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading field surveys...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Survey ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Campaign Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Site / Reserve</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Habitat</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Survey Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map(srv => (
                  <tr key={srv._id || srv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <code className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--forest-green)', background: '#e8f3ee', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                        {srv.surveyId}
                      </code>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {srv.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-medium)' }}>
                      {srv.site?.siteName || 'Bandipur Reserve'} ({srv.protectedArea || 'Protected Area'})
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-medium)' }}>
                        <Trees size={14} color="var(--forest-green)" /> {srv.habitatType || 'Forest'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(srv.surveyDate || srv.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span className={`badge-pill ${srv.status === 'active' ? 'badge-green' : srv.status === 'planned' ? 'badge-teal' : 'badge-gray'}`}>
                        ● {srv.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredSurveys.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No field surveys found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Survey Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '460px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Create Field Survey Campaign</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Register a new field monitoring or camera trap campaign.</p>

            <form onSubmit={handleCreateSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Campaign Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Bandipur Tiger Census Q4"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Monitoring Site:</label>
                <select
                  value={site}
                  onChange={e => setSite(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                >
                  {sites.map(s => <option key={s._id} value={s._id}>{s.siteName}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Protected Area:</label>
                  <input
                    type="text"
                    placeholder="e.g. Bandipur NP"
                    value={protectedArea}
                    onChange={e => setProtectedArea(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Habitat Type:</label>
                  <select
                    value={habitatType}
                    onChange={e => setHabitatType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  >
                    <option value="Forest">Forest</option>
                    <option value="Wetland">Wetland</option>
                    <option value="Grassland">Grassland</option>
                    <option value="Mountain">Mountain</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Notes:</label>
                <textarea
                  rows="2"
                  placeholder="Field objectives, target species, survey parameters..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Create Survey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
