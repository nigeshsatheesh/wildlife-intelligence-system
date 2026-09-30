import React, { useState, useEffect } from 'react';
import { Camera, Radio, Plus, Search, Filter, BatteryCharging, MapPin, X } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

const defaultDevices = [
  {
    _id: 'dev1',
    deviceCode: 'CT-BTR-01',
    type: 'camera_trap',
    site: 'st1',
    status: 'active',
    batteryLevel: 88,
    lastSeen: '2026-09-30T12:00:00.000Z'
  },
  {
    _id: 'dev2',
    deviceCode: 'AS-BTR-01',
    type: 'audio_sensor',
    site: 'st1',
    status: 'active',
    batteryLevel: 92,
    lastSeen: '2026-09-30T14:15:00.000Z'
  },
  {
    _id: 'dev3',
    deviceCode: 'CT-KZR-02',
    type: 'camera_trap',
    site: 'st2',
    status: 'active',
    batteryLevel: 64,
    lastSeen: '2026-09-29T22:30:00.000Z'
  },
  {
    _id: 'dev4',
    deviceCode: 'AS-KZR-02',
    type: 'audio_sensor',
    site: 'st2',
    status: 'maintenance',
    batteryLevel: 14,
    lastSeen: '2026-09-24T16:10:00.000Z'
  }
];

function CameraTrapMap({ devices = [], sites = [] }) {
  const [selectedDevice, setSelectedDevice] = useState(null);

  const getSiteName = (dev) => {
    if (dev.site && typeof dev.site === 'object' && dev.site.siteName) return dev.site.siteName;
    const found = (sites || []).find(s => s._id === dev.site || s.id === dev.site);
    return found?.siteName || 'Bandipur Tiger Reserve';
  };

  const xPositions = [28, 52, 72, 85, 38, 62];
  const yPositions = [38, 56, 32, 62, 68, 42];

  const markers = (devices || []).map((dev, idx) => ({
    id: dev._id || dev.id || `dev-${idx}`,
    code: dev.deviceCode || 'CT-UNKNOWN',
    type: dev.type || 'camera_trap',
    status: dev.status || 'active',
    battery: dev.batteryLevel ?? 100,
    siteName: getSiteName(dev),
    left: `${xPositions[idx % xPositions.length]}%`,
    top: `${yPositions[idx % yPositions.length]}%`
  }));

  return (
    <div className="eco-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
      <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-dark)' }}>Camera Trap & Hardware Telemetry Map</h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{markers.length} Deployed Telemetry Nodes</span>
      </div>

      <div style={{
        height: '280px',
        borderRadius: '0 0 12px 12px',
        background: 'linear-gradient(135deg, #c7e9d9 0%, #b8decb 50%, #d4ede1 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #b2d8c5'
      }}>
        {/* Topography vector paths / map terrain extending to the rightmost edge */}
        <svg width="100%" height="100%" viewBox="0 0 1000 280" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Elevation contour waves */}
          <path d="M 0 45 Q 150 15 300 65 T 600 45 T 850 75 T 1000 40" fill="none" stroke="#a4d4bc" strokeWidth="1.8" opacity="0.5" />
          <path d="M 0 85 Q 130 50 260 95 T 520 70 T 780 110 T 1000 80" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
          <path d="M 0 130 Q 160 90 320 140 T 640 105 T 880 140 T 1000 115" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.65" />
          <path d="M 0 180 Q 180 140 360 185 T 680 160 T 900 190 T 1000 170" fill="none" stroke="#90c8ad" strokeWidth="2.2" opacity="0.7" />
          <path d="M 0 225 Q 160 195 340 230 T 680 215 T 880 235 T 1000 210" fill="none" stroke="#90c8ad" strokeWidth="1.8" opacity="0.5" />
          {/* Main river corridor running from far left across to the far right */}
          <path d="M -10 160 C 140 140, 220 200, 380 180 C 540 160, 680 220, 840 175 C 920 155, 960 185, 1010 165" fill="none" stroke="#60a5fa" strokeWidth="4.5" opacity="0.85" />
        </svg>

        {/* Map Location Labels */}
        <div style={{ position: 'absolute', top: '15%', left: '12%', fontSize: '0.65rem', fontWeight: '800', color: '#165b40', background: 'rgba(255,255,255,0.88)', padding: '2px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <MapPin size={11} color="#113829" /> Bandipur Sector 4 Array
        </div>
        <div style={{ position: 'absolute', top: '15%', right: '15%', fontSize: '0.65rem', fontWeight: '800', color: '#165b40', background: 'rgba(255,255,255,0.88)', padding: '2px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <MapPin size={11} color="#10b981" /> Kaziranga Wetland Array
        </div>

        {/* Device Markers */}
        {markers.map(m => {
          const isAct = m.status === 'active';
          const markerColor = !isAct ? '#ef4444' : m.type === 'camera_trap' ? '#113829' : '#0f766e';

          return (
            <div
              key={m.id}
              onClick={() => setSelectedDevice(m)}
              style={{
                position: 'absolute',
                top: m.top,
                left: m.left,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                zIndex: 10
              }}
              title={`${m.code} - ${m.siteName} (${m.battery}%)`}
            >
              <span style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: markerColor,
                border: '2px solid #ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                display: 'inline-block'
              }} />
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: markerColor,
                background: 'rgba(255,255,255,0.92)',
                padding: '1px 6px',
                borderRadius: '4px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}>
                {m.code}
              </span>
            </div>
          );
        })}

        {/* Selected Device Popup */}
        {selectedDevice && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffffff',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 30,
            border: '1px solid var(--border-light)',
            minWidth: '220px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--forest-green)' }}>{selectedDevice.code}</strong>
              <button onClick={() => setSelectedDevice(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
              <div><strong>Hardware:</strong> {selectedDevice.type === 'camera_trap' ? 'Camera Trap' : 'Audio Sensor'}</div>
              <div><strong>Station:</strong> {selectedDevice.siteName}</div>
              <div><strong>Battery:</strong> {selectedDevice.battery}%</div>
              <div><strong>Status:</strong> {selectedDevice.status.toUpperCase()}</div>
            </div>
          </div>
        )}

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
            Camera Trap (Active)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-dark)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f766e' }}></span>
            Audio Sensor (Active)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-dark)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
            Maintenance / Offline
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CameraTrapsPage({ sites = [] }) {
  const [devices, setDevices] = useState(defaultDevices);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'camera_trap' | 'audio_sensor'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New device form state
  const [deviceCode, setDeviceCode] = useState('');
  const [type, setType] = useState('camera_trap');
  const [site, setSite] = useState(sites?.[0]?._id || '');
  const [batteryLevel, setBatteryLevel] = useState('95');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  const getDeviceSiteName = (dev) => {
    if (dev.site && typeof dev.site === 'object' && dev.site.siteName) return dev.site.siteName;
    const found = (sites || []).find(s => s._id === dev.site || s.id === dev.site);
    return found?.siteName || 'Bandipur Reserve';
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/devices`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDevices(data);
        }
      }
    } catch (err) {
      console.warn('Backend /devices endpoint unavailable, using seeded telemetry:', err);
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
      const selectedSiteId = site || sites?.[0]?._id || 'st1';
      const res = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceCode,
          type,
          site: selectedSiteId,
          batteryLevel: Number(batteryLevel),
          status
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setDeviceCode('');
        await fetchDevices();
      } else {
        // Fallback local append if backend route not reachable
        const localDev = {
          _id: `dev_${Date.now()}`,
          deviceCode,
          type,
          site: selectedSiteId,
          batteryLevel: Number(batteryLevel),
          status,
          lastSeen: new Date().toISOString()
        };
        setDevices(prev => [localDev, ...prev]);
        setIsModalOpen(false);
        setDeviceCode('');
      }
    } catch (err) {
      // Local fallback
      const localDev = {
        _id: `dev_${Date.now()}`,
        deviceCode,
        type,
        site: site || sites?.[0]?._id || 'st1',
        batteryLevel: Number(batteryLevel),
        status,
        lastSeen: new Date().toISOString()
      };
      setDevices(prev => [localDev, ...prev]);
      setIsModalOpen(false);
      setDeviceCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const safeDevices = Array.isArray(devices) ? devices : defaultDevices;
  const filteredDevices = safeDevices.filter(dev => {
    const siteName = getDeviceSiteName(dev);
    const matchesSearch = (dev.deviceCode || '').toLowerCase().includes(search.toLowerCase()) ||
                          siteName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || dev.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getBatteryBadgeClass = (level = 100) => {
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
              style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', width: '220px' }}
            />
          </div>

          <button className="btn-new-survey" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Register Device
          </button>
        </div>
      </div>

      {/* Hardware Telemetry Map */}
      <CameraTrapMap devices={filteredDevices} sites={sites} />

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
                {filteredDevices.map(dev => {
                  const devStatus = dev.status || 'active';
                  const battery = dev.batteryLevel ?? 100;
                  const siteName = getDeviceSiteName(dev);

                  return (
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
                        {siteName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge-pill ${getBatteryBadgeClass(battery)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <BatteryCharging size={13} /> {battery}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {new Date(dev.lastSeen || dev.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <span className={`badge-pill ${devStatus === 'active' ? 'badge-green' : devStatus === 'maintenance' ? 'badge-pill' : 'badge-red'}`}>
                          ● {devStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No deployment devices found matching filter.
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
                  {(sites || []).map(s => <option key={s._id} value={s._id}>{s.siteName}</option>)}
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
