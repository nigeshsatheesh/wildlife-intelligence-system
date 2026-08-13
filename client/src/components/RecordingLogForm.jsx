import React, { useState } from 'react';
import { Upload, Sparkles, Save, X, Music } from 'lucide-react';

const CATEGORY_COLORS = {
  'Bird Call': '#2f855a',
  'Mammal Vocalization': '#b7791f',
  'Amphibian Call': '#2b6cb0',
  'Insect Sound': '#6b46c1',
  'Environmental Noise': '#718096'
};

export default function RecordingLogForm({ sites, onSaveRecording, onClose }) {
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?._id || '');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [detectedEvents, setDetectedEvents] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
    setDetectedEvents(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!audioFile) {
      setError('Please upload an audio recording before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('monitoringSite', selectedSiteId);
      formData.append('eventDate', eventDate);
      formData.append('notes', notes);

      const site = sites.find(s => s._id === selectedSiteId);
      if (site?.location) {
        formData.append('latitude', site.location.latitude);
        formData.append('longitude', site.location.longitude);
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/recordings', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Bioacoustic service down (503) or nothing detected (422) both surface here honestly
        throw new Error(errData.message || 'Failed to save recording');
      }

      const saved = await res.json();
      setDetectedEvents(saved.detectedEvents || []);

      onSaveRecording(saved);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Log New Bioacoustic Recording</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Upload an audio recording for AI acoustic event detection (YAMNet)
          </p>
        </div>
        <button onClick={onClose} style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div className="eco-card" style={{ padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--border-light)', background: '#f9fafb' }}>
          {audioPreviewUrl ? (
            <div style={{ maxWidth: '450px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Music size={18} color="var(--forest-green)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{audioFile?.name}</span>
                <button type="button" onClick={() => { setAudioFile(null); setAudioPreviewUrl(null); setDetectedEvents(null); }}
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}>
                  <X size={12} />
                </button>
              </div>
              <audio controls src={audioPreviewUrl} style={{ width: '100%' }} />
            </div>
          ) : (
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f3ee', color: 'var(--forest-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Upload size={22} />
              </div>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Upload a real field audio recording</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>.wav, .mp3, .ogg, .flac, .m4a</p>
              <input type="file" accept="audio/wav,audio/mpeg,audio/ogg,audio/flac,audio/x-m4a,audio/mp4" onChange={handleFileSelect} required />
            </div>
          )}
        </div>

        {detectedEvents && (
          <div className="eco-card" style={{ background: '#e8f3ee', border: '1px solid var(--forest-green)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="var(--forest-green)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--forest-green)' }}>Detected Acoustic Events (Real)</h3>
            </div>
            {detectedEvents.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No confident acoustic events detected.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {detectedEvents.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ev.label}</div>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                        background: CATEGORY_COLORS[ev.category] || '#718096',
                        borderRadius: '999px', padding: '0.1rem 0.5rem', display: 'inline-block', marginTop: '0.2rem'
                      }}>
                        {ev.category}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--forest-green)', fontSize: '0.85rem' }}>
                      {(ev.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>Monitoring Site</label>
              <select value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}>
                {sites.map(st => <option key={st._id} value={st._id}>{st.siteName} ({st.siteCode})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>Event Date</label>
              <input type="date" required value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>Field Researcher Notes</label>
            <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', resize: 'none' }} />
          </div>

          {error && <div style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 600 }}>{error}</div>}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            <button className="btn-new-survey" type="submit" disabled={submitting} style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', borderRadius: '8px' }}>
              <Save size={16} /> {submitting ? 'Analyzing & Saving...' : 'Submit Recording'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}