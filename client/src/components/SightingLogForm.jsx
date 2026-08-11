import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle, Save, X, Camera } from 'lucide-react';

export default function SightingLogForm({ species, sites, onSaveSighting, onClose }) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(species[0]?._id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?._id || '');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [individualCount, setIndividualCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80');

  // Simulated AI Prediction state
  const [aiPrediction, setAiPrediction] = useState({
    speciesName: species[0]?.commonName || 'Bengal Tiger',
    scientificName: species[0]?.scientificName || 'Panthera tigris',
    confidence: 96.4
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const matchedSpecies = species.find(s => s._id === selectedSpeciesId) || species[0];
    const matchedSite = sites.find(st => st._id === selectedSiteId) || sites[0];

    onSaveSighting({
      species: matchedSpecies._id,
      monitoringSite: matchedSite._id,
      imageUrl,
      classifierPrediction: matchedSpecies.scientificName,
      classifierConfidence: aiPrediction.confidence / 100,
      verified: true,
      individualCount: Number(individualCount),
      locality: matchedSite.siteName,
      notes,
      eventDate: new Date(eventDate)
    });

    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Log New Wildlife Sighting</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Upload camera trap photo for AI species classification & telemetry recording
          </p>
        </div>
        <button onClick={onClose} style={{ background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Top Section: Drag and Drop Image Upload Area */}
        <div className="eco-card" style={{ padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--border-light)', background: '#f9fafb' }}>
          {imageUrl ? (
            <div style={{ position: 'relative', height: '220px', borderRadius: '10px', overflow: 'hidden', margin: '0 auto', maxWidth: '400px' }}>
              <img src={imageUrl} alt="Sighting Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                type="button" 
                onClick={() => setImageUrl('')}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f3ee', color: 'var(--forest-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Upload size={22} />
              </div>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Drag & Drop Image Here</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Supports JPEG, PNG or TIFF files up to 500MB</p>
              <button 
                type="button" 
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80')}
                style={{ background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Use Sample Photo
              </button>
            </div>
          )}
        </div>

        {/* AI Suggestion Highlight Box */}
        <div className="eco-card" style={{ background: '#e8f3ee', border: '1px solid var(--forest-green)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Sparkles size={18} color="var(--forest-green)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--forest-green)' }}>AI Suggestion</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                {aiPrediction.speciesName} <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-medium)' }}>({aiPrediction.scientificName})</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)', marginTop: '0.15rem' }}>
                Confidence: <strong style={{ color: 'var(--forest-green)' }}>{aiPrediction.confidence}%</strong>
              </div>
            </div>

            {/* Confirm or Override Species Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)' }}>Confirm / Override:</label>
              <select
                value={selectedSpeciesId}
                onChange={e => {
                  setSelectedSpeciesId(e.target.value);
                  const sel = species.find(s => s._id === e.target.value);
                  if (sel) {
                    setAiPrediction(prev => ({ ...prev, speciesName: sel.commonName, scientificName: sel.scientificName }));
                  }
                }}
                style={{ background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', outline: 'none' }}
              >
                {species.map(s => (
                  <option key={s._id} value={s._id}>{s.commonName} ({s.scientificName})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Details Grid */}
        <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Monitoring Site</label>
              <select
                value={selectedSiteId}
                onChange={e => setSelectedSiteId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
              >
                {sites.map(st => (
                  <option key={st._id} value={st._id}>{st.siteName} ({st.siteCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Event Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Individual Count</label>
            <input
              type="number"
              min="1"
              required
              value={individualCount}
              onChange={e => setIndividualCount(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Field Researcher Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observation notes, weather conditions, animal behavior..."
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
              Cancel
            </button>
            <button className="btn-new-survey" type="submit" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', borderRadius: '8px' }}>
              <Save size={16} /> Submit Sighting
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
