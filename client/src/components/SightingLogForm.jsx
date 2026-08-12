import React, { useState } from 'react';
import { Upload, Sparkles, Save, X } from 'lucide-react';

export default function SightingLogForm({ species, sites, onSaveSighting, onClose }) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(species[0]?._id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?._id || '');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [individualCount, setIndividualCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiPrediction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please upload an image before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('species', selectedSpeciesId);
      formData.append('monitoringSite', selectedSiteId);
      formData.append('eventDate', eventDate);
      formData.append('individualCount', individualCount);
      formData.append('notes', notes);

      const site = sites.find(s => s._id === selectedSiteId);
      if (site?.location) {
        formData.append('latitude', site.location.latitude);
        formData.append('longitude', site.location.longitude);
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sightings', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save sighting');
      }

      const saved = await res.json();
      setAiPrediction({
        speciesName: saved.species?.commonName || saved.species || 'Unknown species',
        scientificName: saved.species?.scientificName || saved.classifierPrediction || 'Unknown',
        confidence: saved.classifierConfidence ? (saved.classifierConfidence * 100).toFixed(1) : 'N/A'
      });

      onSaveSighting(saved);
      setTimeout(onClose, 1200);
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Log New Wildlife Sighting</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Upload camera trap photo for AI species classification & telemetry recording
          </p>
        </div>
        <button onClick={onClose} style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div className="eco-card" style={{ padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--border-light)', background: '#f9fafb' }}>
          {imagePreview ? (
            <div style={{ position: 'relative', height: '220px', borderRadius: '10px', overflow: 'hidden', margin: '0 auto', maxWidth: '400px' }}>
              <img src={imagePreview} alt="Sighting Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f3ee', color: 'var(--forest-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Upload size={22} />
              </div>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Upload a real camera trap photo</h4>
              <input type="file" accept="image/jpeg,image/png" onChange={handleFileSelect} required />
            </div>
          )}
        </div>

        {aiPrediction && (
          <div className="eco-card" style={{ background: '#e8f3ee', border: '1px solid var(--forest-green)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Sparkles size={18} color="var(--forest-green)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--forest-green)' }}>AI Prediction (Real)</h3>
            </div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>
              {aiPrediction.speciesName} <span style={{ fontStyle: 'italic', fontWeight: 400 }}>({aiPrediction.scientificName})</span>
            </div>
            <div style={{ fontSize: '0.75rem' }}>Confidence: <strong style={{ color: 'var(--forest-green)' }}>{aiPrediction.confidence}%</strong></div>
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
            <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>Individual Count</label>
            <input type="number" min="1" required value={individualCount} onChange={e => setIndividualCount(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>Field Researcher Notes</label>
            <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', resize: 'none' }} />
          </div>

          {error && <div style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 600 }}>{error}</div>}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            <button className="btn-new-survey" type="submit" disabled={submitting} style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', borderRadius: '8px' }}>
              <Save size={16} /> {submitting ? 'Classifying & Saving...' : 'Submit Sighting'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
