import React, { useState } from 'react';
import { FileText, Download, Layers, ShieldAlert, Award, MapPin, Compass, FileSpreadsheet, Loader2 } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

export default function ReportsPage({ analytics = {}, species = [], sightings = [], sites = [], ecosystemHealth = null }) {
  const [downloadingFormat, setDownloadingFormat] = useState(null); // format + type, e.g. 'pdf-survey'

  const handleDownload = async (type, format) => {
    const token = localStorage.getItem('token');
    const key = `${format}-${type}`;
    setDownloadingFormat(key);

    try {
      const endpoint = format === 'excel'
        ? `${API_BASE}/reports/excel?type=${type}`
        : `${API_BASE}/reports/download?type=${type}`;

      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error('Failed to generate report');

      const disposition = res.headers.get('Content-Disposition');
      const match = disposition && disposition.match(/filename=(.+)/);
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      const filename = match ? match[1].replace(/['"]/g, '') : `wildlife-report-${type}.${ext}`;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Could not download report: ${err.message}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const reportCards = [
    {
      id: 'survey',
      title: 'Field Survey & Sighting Log Report',
      description: 'Comprehensive export of camera trap observations, specimen counts, AI confidence scores, and verifications.',
      icon: Compass,
      color: '#113829'
    },
    {
      id: 'species-population',
      title: 'Species Population Analytics Report',
      description: 'Detailed analysis of species richness, population size, MoM trends, and IUCN conservation statuses.',
      icon: Layers,
      color: '#0f766e'
    },
    {
      id: 'biodiversity',
      title: 'Biodiversity & Ecosystem Index Report',
      description: 'Shannon Diversity Index (H\') scores, species evenness breakdown, and site-by-site comparative metrics.',
      icon: Award,
      color: '#10b981'
    },
    {
      id: 'habitat',
      title: 'Habitat & Protected Area Report',
      description: 'Monitoring station inventory, habitat fragmentation scores, and protected area coverage data.',
      icon: MapPin,
      color: '#2563eb'
    },
    {
      id: 'conservation',
      title: 'Conservation Watch & Priority Action Plan',
      description: 'High-threat species alerts, declining population flags, and prioritized ranger patrol recommendations.',
      icon: ShieldAlert,
      color: '#ef4444'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-dark)' }}>Reports & Intelligence Center</h2>
          <span className="badge-pill badge-teal">5 Report Types</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Export publication-ready PDF summaries and raw Excel datasets for ecological analysis and governance compliance.
        </p>
      </div>

      {/* 5 Report Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {reportCards.map(card => {
          const Icon = card.icon;
          const isPdfLoading = downloadingFormat === `pdf-${card.id}`;
          const isExcelLoading = downloadingFormat === `excel-${card.id}`;

          return (
            <div key={card.id} className="eco-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)' }}>{card.title}</h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TYPE: {card.id}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', lineHeight: 1.45, marginBottom: '1.5rem' }}>
                  {card.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button
                  onClick={() => handleDownload(card.id, 'pdf')}
                  disabled={!!downloadingFormat}
                  className="btn-primary"
                  style={{ flex: 1, fontSize: '0.82rem', padding: '0.6rem 0.75rem' }}
                >
                  {isPdfLoading ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                  <span>{isPdfLoading ? 'Exporting PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={() => handleDownload(card.id, 'excel')}
                  disabled={!!downloadingFormat}
                  className="btn-primary"
                  style={{ flex: 1, fontSize: '0.82rem', padding: '0.6rem 0.75rem', background: '#ffffff', color: 'var(--forest-green)', border: '1px solid var(--border-light)' }}
                >
                  {isExcelLoading ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
                  <span>{isExcelLoading ? 'Exporting Excel...' : 'Download Excel'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Snapshot Data Overview */}
      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>Dataset Coverage Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL SIGHTINGS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>{analytics.totalSightings ?? sightings.length}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIVE SPECIES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>{species.length}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>MONITORING SITES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>{analytics.activeSitesCount ?? sites.length}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>HEALTH STATUS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--forest-green)' }}>{ecosystemHealth ? ecosystemHealth.status : 'Healthy'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}