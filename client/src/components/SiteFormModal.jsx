import React, { useState } from 'react';
import { X, Save, MapPin } from 'lucide-react';

export default function SiteFormModal({ isOpen, onClose, onSaveSite, initialData }) {
  const [siteName, setSiteName] = useState(initialData?.siteName || '');
  const [siteCode, setSiteCode] = useState(initialData?.siteCode || '');
  const [habitatType, setHabitatType] = useState(initialData?.habitatType || 'Forest');
  const [protectedArea, setProtectedArea] = useState(initialData?.protectedArea || '');
  const [latitude, setLatitude] = useState(initialData?.location?.latitude || 11.6664);
  const [longitude, setLongitude] = useState(initialData?.location?.longitude || 76.6292);
  const [monitoringDevice, setMonitoringDevice] = useState(initialData?.monitoringDevice || 'Camera Trap');
  const [active, setActive] = useState(initialData?.active !== undefined ? initialData.active : true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSite({
      _id: initialData?._id,
      siteName,
      siteCode: siteCode || 'SITE-' + Math.floor(Math.random() * 1000),
      habitatType,
      protectedArea,
      location: { latitude: Number(latitude), longitude: Number(longitude) },
      monitoringDevice,
      active
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 22, 18, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="eco-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', position: 'relative' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={22} color="var(--forest-green)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              {initialData ? 'Edit Monitoring Site' : 'Add Monitoring Site'}
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Register new camera trap array or field observation station
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Site Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder="Bandipur Reserve"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Site Code</label>
              <input
                type="text"
                required
                value={siteCode}
                onChange={e => setSiteCode(e.target.value)}
                placeholder="BTR-ALPHA-01"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Habitat Type</label>
              <select
                value={habitatType}
                onChange={e => setHabitatType(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
              >
                <option value="Forest">Forest</option>
                <option value="Grassland">Grassland</option>
                <option value="Wetland">Wetland</option>
                <option value="Desert">Desert</option>
                <option value="Mountain">Mountain</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Protected Area</label>
              <input
                type="text"
                value={protectedArea}
                onChange={e => setProtectedArea(e.target.value)}
                placeholder="Bandipur National Park"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Latitude & Longitude Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Monitoring Device</label>
              <select
                value={monitoringDevice}
                onChange={e => setMonitoringDevice(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
              >
                <option value="Camera Trap">Camera Trap</option>
                <option value="Manual Observation">Manual Observation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Active Toggle Switch */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Status</label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: `1px solid ${active ? '#10b981' : 'var(--border-light)'}`,
                  background: active ? '#dcfce7' : '#f3f4f6',
                  color: active ? '#15803d' : 'var(--text-muted)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {active ? '● Station Active' : '○ Station Inactive'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button className="btn-new-survey" type="submit" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', borderRadius: '8px' }}>
              <Save size={16} /> Save Site
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
