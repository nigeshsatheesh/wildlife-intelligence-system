import React, { useState } from 'react';
import { 
  PawPrint, 
  Users, 
  Award, 
  TrendingDown, 
  AlertTriangle, 
  Trees, 
  Radio, 
  ChevronDown,
  Layers,
  Info
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ResearchDashboard({ analytics, sightings, species }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');

  // Smooth wave graph matching Stitch mock
  const trendData = {
    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    datasets: [
      {
        label: 'Population Count',
        data: [2200, 2400, 2100, 3100, 2300, 3800, 3400],
        borderColor: '#113829',
        borderWidth: 4,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'rgba(17, 56, 41, 0.28)');
          gradient.addColorStop(1, 'rgba(17, 56, 41, 0.02)');
          return gradient;
        },
        tension: 0.5,
        fill: true,
        pointBackgroundColor: '#113829',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#113829',
        titleColor: '#ffffff',
        bodyColor: '#e6f4ee',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Greeting Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Good morning, Researcher
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', fontWeight: '500' }}>
          Overview of ecological intelligence and real-time monitoring streams across active zones.
        </p>
      </div>

      {/* Top 3 Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        {/* Card 1: SPECIES DETECTED */}
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              SPECIES DETECTED
            </span>
            <PawPrint size={18} color="var(--forest-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1' }}>128</span>
            <span className="badge-pill badge-green">+4%</span>
          </div>
        </div>

        {/* Card 2: POPULATION (EST.) */}
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              POPULATION (EST.)
            </span>
            <Users size={18} color="var(--forest-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1' }}>4,862</span>
            <span className="badge-pill badge-green">+12%</span>
          </div>
        </div>

        {/* Card 3: BIODIVERSITY INDEX */}
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              BIODIVERSITY INDEX
            </span>
            <Award size={18} color="var(--forest-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1' }}>78.4</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>/ 100</span>
          </div>
        </div>

      </div>

      {/* Middle Row: Population Trends & Wildlife Distribution Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        
        {/* Left Column: Population Trends Graph */}
        <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)' }}>Population Trends</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-medium)', fontWeight: '600', cursor: 'pointer' }}>
              <span>{selectedTimeframe}</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        {/* Right Column: Wildlife Distribution GIS Map */}
        <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)' }}>Wildlife Distribution</h3>
            <button style={{
              background: '#113829',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}>
              Expand GIS
            </button>
          </div>

          {/* Interactive GIS Map Canvas Graphic */}
          <div style={{
            height: '210px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #c7e9d9 0%, #b8decb 50%, #d4ede1 100%)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #b2d8c5'
          }}>
            {/* Topography vector paths / map terrain */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d="M 0 60 Q 80 20 160 80 T 320 50 T 480 110 T 600 70" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
              <path d="M 0 120 Q 100 80 200 140 T 400 100 T 600 150" fill="none" stroke="#a4d4bc" strokeWidth="2" opacity="0.6" />
              <path d="M 0 170 Q 120 140 240 180 T 480 160 T 600 190" fill="none" stroke="#90c8ad" strokeWidth="2" opacity="0.7" />
              {/* River path */}
              <path d="M -10 160 C 100 140, 150 200, 250 180 C 350 160, 400 220, 610 180" fill="none" stroke="#60a5fa" strokeWidth="4" opacity="0.8" />
            </svg>

            {/* Map Location Labels */}
            <div style={{ position: 'absolute', top: '45%', left: '15%', fontSize: '0.65rem', fontWeight: '800', color: '#165b40', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px' }}>
              Northern Reserve
            </div>
            <div style={{ position: 'absolute', top: '25%', right: '20%', fontSize: '0.65rem', fontWeight: '800', color: '#165b40', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px' }}>
              Sector 4
            </div>

            {/* Map Cluster Markers */}
            <div style={{ position: 'absolute', top: '35%', left: '30%', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#113829', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></span>
            </div>
            <div style={{ position: 'absolute', top: '55%', left: '55%', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#113829', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></span>
            </div>
            <div style={{ position: 'absolute', top: '25%', left: '70%', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></span>
            </div>

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
              gap: '0.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#113829' }}></span>
                <span>Camera trap</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                <span>Cluster</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: 3 Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        {/* Card 1: ECOSYSTEM HEALTH */}
        <div className="eco-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              ECOSYSTEM HEALTH
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>82</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>/ 100</span>
            </div>
          </div>
          {/* Circular Progress Ring */}
          <div style={{ position: 'relative', width: '42px', height: '42px' }}>
            <svg width="42" height="42" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e9e6"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#113829"
                strokeWidth="3.5"
                strokeDasharray="82, 100"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: ENDANGERED SPECIES */}
        <div className="eco-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              ENDANGERED SPECIES
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>12</span>
              <span className="badge-pill badge-red">Critical</span>
            </div>
          </div>
          {/* Icon Circle */}
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#b91c1c" />
          </div>
        </div>

        {/* Card 3: ACTIVE SURVEYS */}
        <div className="eco-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              ACTIVE SURVEYS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>24</span>
              <span className="badge-pill badge-teal">Deploying</span>
            </div>
          </div>
          {/* Icon Circle */}
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={20} color="#0f766e" />
          </div>
        </div>

      </div>

      {/* Row 4: Important Alerts Card */}
      <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
          Important Alerts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Alert 1 */}
          <div className="alert-row alert-row-red">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingDown size={18} color="#b91c1c" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.15rem' }}>
                  Tiger population decline detected
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)' }}>
                  Significant deviation from projected models in Northern Reserve sector.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span className="badge-pill badge-red">High Priority</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>2 hrs ago</span>
            </div>
          </div>

          {/* Alert 2 */}
          <div className="alert-row alert-row-gray">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trees size={18} color="#4b5563" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.15rem' }}>
                  Habitat degradation detected in Zone 3
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)' }}>
                  Satellite imagery indicates 5% loss in core canopy cover over 30 days.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span className="badge-pill badge-gray">Medium</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>5 hrs ago</span>
            </div>
          </div>

          {/* Alert 3 */}
          <div className="alert-row alert-row-teal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Info size={18} color="#15803d" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.15rem' }}>
                  New species observation
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)' }}>
                  Camera trap CT-402 recorded unclassified avian species in Sector B.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span className="badge-pill badge-green">Info</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>12 hrs ago</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

