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

      {/* Incident Management Section */}
      <IncidentSection sites={sites} />

      {/* Patrol Planner Section */}
      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
          Patrol Planner & Field Operations
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Scheduled ranger patrols assigned based on species risk indices and incident locations.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid var(--forest-green)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>Alpha Patrol Team — Sector 4</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Bandipur Tiger Reserve · Morning Shift</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-green)', marginTop: '0.5rem' }}>Target: Tiger Corridor Audit</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>Bravo Patrol Team — Sector B</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Kaziranga Wetland · Night Shift</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.5rem' }}>Target: Wetland Runoff & Elephant Fence</div>
          </div>
        </div>
      </div>

      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Sightings Flagged for Patrol Follow-up</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
          Surfaced from unverified reports and Critical/Vulnerable species sightings.
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

function IncidentSection({ sites }) {
  const [incidents, setIncidents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newType, setNewType] = React.useState('Human-Wildlife Conflict');
  const [newSeverity, setNewSeverity] = React.useState('medium');
  const [newSiteId, setNewSiteId] = React.useState(sites[0]?._id || '');
  const [newNotes, setNewNotes] = React.useState('');

  const API_ROOT = import.meta.env.VITE_API_URL || window.location.origin;

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROOT}/api/incidents`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchIncidents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROOT}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: newTitle,
          incidentType: newType,
          severity: newSeverity,
          monitoringSite: newSiteId,
          notes: newNotes
        })
      });
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        setNewNotes('');
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="eco-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)' }}>Field Security & Incident Management</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Report and track human-wildlife conflict and encroachment incidents</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setShowModal(true)}>
          + Report New Incident
        </button>
      </div>

      {loading ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active field incidents reported.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {incidents.map(inc => (
            <div key={inc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '8px', borderLeft: `4px solid ${inc.severity === 'high' || inc.severity === 'critical' ? '#ef4444' : '#f59e0b'}` }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{inc.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inc.incidentType} · {inc.monitoringSite?.siteName || 'Reserve Sector'}</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', background: inc.status === 'Open' ? '#fee2e2' : '#e0e7ff', color: inc.status === 'Open' ? '#991b1b' : '#3730a3' }}>
                {inc.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="eco-card" style={{ width: '420px', padding: '1.5rem', background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Report Field Incident</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Title</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Incident Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <option value="Human-Wildlife Conflict">Human-Wildlife Conflict</option>
                  <option value="Illegal Encroachment">Illegal Encroachment</option>
                  <option value="Poaching Threat">Poaching Threat</option>
                  <option value="Device Tampering">Device Tampering</option>
                  <option value="Wildfire Risk">Wildfire Risk</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Severity</label>
                <select value={newSeverity} onChange={e => setNewSeverity(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Notes</label>
                <textarea rows="3" value={newNotes} onChange={e => setNewNotes(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fff' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}