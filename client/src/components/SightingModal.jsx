import React, { useState } from 'react';
import { X, PlusCircle, Upload, Image as ImageIcon, MapPin, Eye, AlertCircle } from 'lucide-react';

export default function SightingModal({ isOpen, onClose, species, sites, onSaveSighting }) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(species[0]?._id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?._id || '');
  const [individualCount, setIndividualCount] = useState(1);
  const [locality, setLocality] = useState('Sector 4 Reserve');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80');
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [notes, setNotes] = useState('Observation logged via field camera trap / manual upload.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewSrc(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const matchedSpecies = species.find(s => s._id === selectedSpeciesId) || species[0];
      const matchedSite = sites.find(st => st._id === selectedSiteId) || sites[0];

      // Build Form Data for file upload if a file was chosen
      let newSightingData;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('species', matchedSpecies?._id || '');
        formData.append('monitoringSite', matchedSite?._id || '');
        formData.append('individualCount', individualCount);
        formData.append('locality', locality);
        formData.append('notes', notes);
        formData.append('classifierPrediction', matchedSpecies?.scientificName || 'Panthera tigris');
        formData.append('classifierConfidence', '0.96');
        formData.append('verified', 'true');
        
        newSightingData = formData;
      } else {
        newSightingData = {
          species: matchedSpecies?._id,
          monitoringSite: matchedSite?._id,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
          classifierPrediction: matchedSpecies?.scientificName || 'Panthera tigris',
          classifierConfidence: 0.96,
          verified: true,
          individualCount: Number(individualCount),
          locality,
          notes,
          eventDate: new Date()
        };
      }

      await onSaveSighting(newSightingData);
      alert('Wildlife sighting record & image successfully uploaded to Wildlife Intelligence System database!');
      onClose();
    } catch (err) {
      alert('Failed to log sighting: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 20, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="eco-card" style={{ width: '100%', maxWidth: '540px', padding: '1.75rem', position: 'relative', background: '#ffffff', borderRadius: '16px' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={22} color="var(--forest-green)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>Log Wildlife Sighting</h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)', marginTop: '0.2rem' }}>
            Upload specimen photo & log telemetry record into Wildlife Intelligence System database.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Species Dropdown */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Observed Species:</label>
            <select
              value={selectedSpeciesId}
              onChange={e => setSelectedSpeciesId(e.target.value)}
              style={{
                width: '100%',
                background: '#f9fafb',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-dark)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              {species.map(s => (
                <option key={s._id} value={s._id}>{s.commonName} ({s.scientificName})</option>
              ))}
            </select>
          </div>

          {/* Monitoring Site Dropdown */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Monitoring Site / Reserve:</label>
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              style={{
                width: '100%',
                background: '#f9fafb',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-dark)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              {sites.map(st => (
                <option key={st._id} value={st._id}>{st.siteName} ({st.siteCode})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Individual Count:</label>
              <input
                type="number"
                min="1"
                value={individualCount}
                onChange={e => setIndividualCount(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-dark)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Locality / Sector:</label>
              <input
                type="text"
                value={locality}
                onChange={e => setLocality(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                  color: 'var(--text-dark)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Image Upload Input */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Specimen Photo Upload:</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ fontSize: '0.78rem' }}
              />
            </div>
            {previewSrc && (
              <div style={{ marginTop: '0.5rem', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <img src={previewSrc} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Field Researcher Notes:</label>
            <textarea
              rows="2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                background: '#f9fafb',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-dark)',
                fontSize: '0.82rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '0.35rem',
              background: 'var(--forest-green)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            <Upload size={16} />
            <span>{isSubmitting ? 'Uploading Record...' : 'Save Sighting Record'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
