import React, { useState } from 'react';
import { X, Save, Layers } from 'lucide-react';

export default function SpeciesFormModal({ isOpen, onClose, onSaveSpecies, initialData }) {
  const [commonName, setCommonName] = useState(initialData?.commonName || '');
  const [scientificName, setScientificName] = useState(initialData?.scientificName || '');
  const [category, setCategory] = useState(initialData?.category || 'Mammal');
  const [classifierLabel, setClassifierLabel] = useState(initialData?.classifierLabel || '');
  const [conservationStatus, setConservationStatus] = useState(initialData?.conservationStatus || 'Healthy');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSpecies({
      _id: initialData?._id,
      commonName,
      scientificName,
      category,
      classifierLabel: classifierLabel || commonName.toLowerCase().replace(/\s+/g, '_'),
      conservationStatus,
      imageUrl
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
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="var(--forest-green)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              {initialData ? 'Edit Species Record' : 'Add New Species Record'}
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Taxonomic classification and ML classifier label mapping
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Common Name</label>
              <input
                type="text"
                required
                value={commonName}
                onChange={e => setCommonName(e.target.value)}
                placeholder="Bengal Tiger"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Scientific Name</label>
              <input
                type="text"
                required
                value={scientificName}
                onChange={e => setScientificName(e.target.value)}
                placeholder="Panthera tigris"
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontStyle: 'italic' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
              >
                <option value="Mammal">Mammal</option>
                <option value="Bird">Bird</option>
                <option value="Reptile">Reptile</option>
                <option value="Amphibian">Amphibian</option>
                <option value="Insect">Insect</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Conservation Status</label>
              <select
                value={conservationStatus}
                onChange={e => setConservationStatus(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
              >
                <option value="Excellent">Excellent</option>
                <option value="Healthy">Healthy</option>
                <option value="Moderate Concern">Moderate Concern</option>
                <option value="Vulnerable">Vulnerable</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.2rem' }}>Classifier Label</label>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Helper text: must match the ML model's output label exactly
            </span>
            <input
              type="text"
              required
              value={classifierLabel}
              onChange={e => setClassifierLabel(e.target.value)}
              placeholder="tiger"
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none', fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>Representative Photo URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button className="btn-new-survey" type="submit" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', borderRadius: '8px' }}>
              <Save size={16} /> Save Species
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
