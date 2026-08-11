import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, MapPin, Calendar, User, Eye, Edit3 } from 'lucide-react';

export default function SightingDetailPage({ sighting, speciesList, onVerify, onCorrectSpecies, onBack }) {
  if (!sighting) return null;

  const [selectedCorrectSpecies, setSelectedCorrectSpecies] = useState(sighting.species?._id || '');

  const confidence = (sighting.classifierConfidence || 0.95) * 100;
  const confidenceBadge = 
    confidence > 80 ? 'badge-green' :
    confidence >= 50 ? 'badge-pill' : 'badge-red';

  const handleApplyCorrection = () => {
    const newSp = speciesList.find(s => s._id === selectedCorrectSpecies);
    if (newSp) {
      onCorrectSpecies(sighting._id, newSp);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          padding: '0.45rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: 'var(--text-dark)',
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        <ArrowLeft size={16} /> Back to Sightings List
      </button>

      {/* Main Grid: Large Image (Left) + Sighting Details (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        
        {/* Large Specimen Photo */}
        <div className="eco-card" style={{ padding: '1rem' }}>
          <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden', background: '#0a1612', position: 'relative' }}>
            <img 
              src={sighting.imageUrl || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80'} 
              alt="Sighting Specimen" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Coordinates & Location Map Pin Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: '700' }}>
              <MapPin size={16} color="var(--forest-green)" />
              <span>Location: {sighting.locality || sighting.monitoringSite?.siteName || 'Bandipur Reserve Sector 4'}</span>
            </div>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              11.6664° N, 76.6292° E
            </span>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
          <div>
            {/* Species Name & Confidence Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  {sighting.species?.commonName || 'Bengal Tiger'}
                </h1>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {sighting.species?.scientificName || 'Panthera tigris'}
                </p>
              </div>

              <span className={`badge-pill ${confidenceBadge}`} style={{ fontSize: '0.75rem' }}>
                AI Match: {confidence.toFixed(1)}%
              </span>
            </div>

            {/* Sighting Metadata Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monitoring Site:</span>
                <strong style={{ color: 'var(--text-dark)' }}>{sighting.monitoringSite?.siteName || 'Bandipur Reserve'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Event Date:</span>
                <strong style={{ color: 'var(--text-dark)' }}>{new Date(sighting.eventDate || sighting.createdAt).toLocaleDateString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Individual Count:</span>
                <strong style={{ color: 'var(--forest-green)', fontSize: '1rem' }}>{sighting.individualCount || 1} Specimen</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Observed By:</span>
                <strong style={{ color: 'var(--text-dark)' }}>{sighting.observedBy?.name || 'Dr. Sarah Chen'}</strong>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>Field Researcher Notes:</span>
                <div style={{ background: '#f9fafb', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-medium)' }}>
                  {sighting.notes || 'No extra notes recorded.'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Verify & Correct Species */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              onClick={() => onVerify(sighting._id, !sighting.verified)}
              className="btn-new-survey" 
              style={{ width: '100%', justifyContent: 'center', background: sighting.verified ? '#dcfce7' : 'var(--forest-green)', color: sighting.verified ? '#15803d' : '#ffffff', border: sighting.verified ? '1px solid #86efac' : 'none' }}
            >
              <CheckCircle size={16} />
              <span>{sighting.verified ? 'Verified Prediction' : 'Verify Prediction'}</span>
            </button>

            {/* Correct Species Dropdown */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={selectedCorrectSpecies}
                onChange={e => setSelectedCorrectSpecies(e.target.value)}
                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem', outline: 'none', fontWeight: '600' }}
              >
                {speciesList.map(s => (
                  <option key={s._id} value={s._id}>{s.commonName} ({s.scientificName})</option>
                ))}
              </select>

              <button
                onClick={handleApplyCorrection}
                style={{ background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Correct Species
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
