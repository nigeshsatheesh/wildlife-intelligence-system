import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  MapPin, 
  TrendingDown, 
  Layers, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HabitatIntelligence() {
  const [selectedTargetSpecies, setSelectedTargetSpecies] = useState('Elephas maximus');

  // Gauge Donut Chart Data
  const healthGaugeData = {
    labels: ['Health Score', 'Remaining'],
    datasets: [{
      data: [74, 26],
      backgroundColor: ['#0e382b', '#e5e7eb'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Page Header */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
          HABITAT ASSESSMENT
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>Intelligence & Health Scoring</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-medium)', maxWidth: '800px', marginTop: '0.2rem' }}>
          Real-time multi-dimensional analysis of ecosystem vitality, vegetation indices, and predictive suitability modeling for targeted conservation efforts.
        </p>
      </div>

      {/* Main Grid: Top 2 Cards + Bottom 3 Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Top Row: Ecosystem Health Score & Vegetation Analysis (NDVI) */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
          
          {/* Ecosystem Health Score Card */}
          <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>Ecosystem Health Score</h3>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>SECTOR ALPHA-6</div>
                </div>
                <span className="badge-pill badge-green">Healthy</span>
              </div>

              {/* Central Gauge */}
              <div style={{ height: '140px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.75rem 0' }}>
                <Doughnut data={healthGaugeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1' }}>74</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</div>
                </div>
              </div>
            </div>

            {/* Sub-metrics 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Species Div.</span>
                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>30%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pop. Stability</span>
                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>25%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Water Quality</span>
                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>20%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vegetation</span>
                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>25%</span>
              </div>
            </div>
          </div>

          {/* Vegetation Analysis (NDVI) Card */}
          <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>Vegetation Analysis (NDVI)</h3>
              <Globe size={18} color="var(--text-muted)" />
            </div>

            {/* Map Canvas with NDVI Overlay */}
            <div style={{
              width: '100%',
              height: '180px',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
            }}>
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" alt="NDVI Map" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />

              {/* Map Nodes */}
              <div style={{ position: 'absolute', top: '30%', left: '40%', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#ffffff', background: 'rgba(0,0,0,0.6)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>Serengeti National Park</span>
              </div>
            </div>

            {/* Bottom Scale */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                <span>NDVI Scale: Sparse</span>
                <span>Dense Canopy</span>
              </div>
              <div style={{ height: '6px', width: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #fef08a, #86efac, #15803d)' }}></div>
            </div>
          </div>

        </div>

        {/* Bottom Row: AI Recommendations, Climate Suitability, Target Species Suitability */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem' }}>
          
          {/* Left Sub-column: AI Recommendations & Climate Prediction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* AI Recommendations Card (Dark Forest Green Background) */}
            <div className="eco-card" style={{ background: '#0e382b', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#10b981" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff' }}>AI Recommendations</h4>
              </div>

              {/* Recommendation 1 */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginTop: '0.35rem' }}></div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#ffffff' }}>Restore Wetland Corridor</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                    Sector B4 shows 12% moisture deficit. Immediate restoration recommended.
                  </div>
                </div>
              </div>

              {/* Recommendation 2 */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginTop: '0.35rem' }}></div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#ffffff' }}>Increase Patrol Frequency</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                    Habitat edge near coordinates 34.2N shows human encroachment risk.
                  </div>
                </div>
              </div>
            </div>

            {/* Climate Suitability Prediction Card */}
            <div className="eco-card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                Climate Suitability Prediction
              </h4>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Projected shift based on 5-year precipitation models.
              </p>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>
                -4.2% <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>suitability delta</span>
              </div>
            </div>

          </div>

          {/* Target Species Suitability Card (Right side contour map) */}
          <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>Target Species Suitability</h3>
              <select
                value={selectedTargetSpecies}
                onChange={e => setSelectedTargetSpecies(e.target.value)}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="Elephas maximus">Elephas maximus</option>
                <option value="Panthera tigris">Panthera tigris</option>
                <option value="Loxodonta africana">Loxodonta africana</option>
              </select>
            </div>

            {/* Regional Topographic Contour Map Canvas */}
            <div style={{
              width: '100%',
              height: '240px',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
            }}>
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80" alt="Topographic Contour Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Legend Box in Map */}
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.1rem' }}>Suitability Index</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0e382b' }}></div>
                  <span>Optimal (&gt;0.8)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span>Marginal (0.4 - 0.8)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <span>Unsuitable (&lt;0.4)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
