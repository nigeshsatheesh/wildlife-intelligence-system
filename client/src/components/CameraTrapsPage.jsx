import React, { useState, useEffect } from 'react';
import { Camera, Radio, Plus, Search, Filter, BatteryCharging, ShieldAlert } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

export default function CameraTrapsPage({ sites = [] }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'camera_trap' | 'audio_sensor'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New device form state
  const [deviceCode, setDeviceCode] = useState('');
  const [type, setType] = useState('camera_trap');
  const [site, setSite] = useState(sites[0]?._id || '');
  const [batteryLevel, setBatteryLevel] = useState('95');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/devices`);
      if (res.ok) setDevices(await res.json());
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceCode,
          type,
          site: site || sites[0]?._id,
          batteryLevel: Number(batteryLevel),
          status
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setDeviceCode('');
        await fetchDevices();
      }
    } catch (err) {
      alert(`Error creating device: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDevices = devices.filter(dev => {
    const matchesSearch = (dev.deviceCode || '').toLowerCase().includes(search.toLowerCase()) ||
                          (dev.site?.siteName || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || dev.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getBatteryBadgeClass = (level) => {
    if (level <= 20) return 'badge-red';
    if (level <= 50) return 'badge-pill';
    return 'badge-green';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Camera Traps & Bioacoustic Sensors</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hardware telemetry, deployment status, and battery monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search code or site..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <button className="btn-new-survey" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Register Device
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="eco-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Filter Hardware Type:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'all', label: 'All Hardware' },
            { id: 'camera_trap', label: 'Camera Traps' },
            { id: 'audio_sensor', label: 'Audio Sensors' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                border: 'none',
                background: typeFilter === item.id ? 'var(--forest-green)' : '#f1f5f9',
                color: typeFilter === item.id ? '#ffffff' : 'var(--text-medium)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Table */}
      <div className="eco-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading hardware telemetry...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Device Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Hardware Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Deployment Station</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Battery Level</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Last Seen Telemetry</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map(dev => (
                  <tr key={dev._id || dev.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <code className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--forest-green)', background: '#e8f3ee', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        {dev.deviceCode}
                      </code>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {dev.type === 'camera_trap' ? <Camera size={16} color="var(--forest-green)" /> : <Radio size={16} color="#0f766e" />}
                        {dev.type === 'camera_trap' ? 'Camera Trap' : 'Audio Sensor'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-medium)' }}>
                      {dev.site?.siteName || 'Bandipur Reserve'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge-pill ${getBatteryBadgeClass(dev.batteryLevel)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BatteryCharging size={13} /> {dev.batteryLevel}%
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(dev.lastSeen || dev.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span className={`badge-pill ${dev.status === 'active' ? 'badge-green' : dev.status === 'maintenance' ? 'badge-pill' : 'badge-red'}`}>
                        ● {dev.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No deployment devices registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Device Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '440px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Register Telemetry Hardware</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Add a new camera trap or bioacoustic audio sensor.</p>

            <form onSubmit={handleCreateDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Device Code:</label>
                <input
                  type="text"
                  placeholder="e.g. CT-BTR-05 or AS-BTR-02"
                  value={deviceCode}
                  onChange={e => setDeviceCode(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Hardware Type:</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  >
                    <option value="camera_trap">Camera Trap</option>
                    <option value="audio_sensor">Audio Sensor</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Battery Level (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={batteryLevel}
                    onChange={e => setBatteryLevel(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Deployment Station:</label>
                <select
                  value={site}
                  onChange={e => setSite(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                >
                  {sites.map(s => <option key={s._id} value={s._id}>{s.siteName}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
