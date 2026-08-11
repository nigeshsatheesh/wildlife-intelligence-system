import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Upload, 
  Filter, 
  Rewind, 
  FastForward, 
  ZoomIn, 
  ZoomOut,
  AlertTriangle,
  CheckCircle,
  FileAudio
} from 'lucide-react';

export default function BioacousticMonitoring() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentRecording, setCurrentRecording] = useState({
    name: 'Sector 4_Alpha_Night.wav',
    duration: '00:04:20',
    primaryMatch: { name: 'Chimpanzee', scientific: 'Pan troglodytes', confidence: '94.2%', callType: 'Alarm Call' },
    secondaryMatch: { name: 'African Grey Parrot', scientific: 'Psittacus erithacus', confidence: '88.5%', callType: 'Social Contact' }
  });
  const [isClassifying, setIsClassifying] = useState(false);
  const canvasRef = useRef(null);

  // Render Spectrogram Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let step = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Dark Spectrogram Canvas Background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);

      // Spectrogram Frequency Bars
      const numBars = 120;
      const barWidth = width / numBars;

      for (let i = 0; i < numBars; i++) {
        const barHeight = isPlaying 
          ? (Math.sin(i * 0.25 + step * 0.12) * 0.4 + 0.5) * (height * 0.75)
          : (Math.sin(i * 0.2) * 0.3 + 0.4) * (height * 0.5);

        ctx.fillStyle = i > 40 && i < 60 ? '#10b981' : i > 80 && i < 95 ? '#14b8a6' : '#374151';
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
      }

      // Red Timeline Cursor
      const cursorX = (step % numBars) * barWidth;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.stroke();

      step++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsClassifying(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('http://localhost:5000/api/audio/classify', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const resObj = data.result || {};
        const matches = resObj.matches || [];
        
        setCurrentRecording({
          name: file.name,
          duration: '00:02:15',
          primaryMatch: {
            name: resObj.commonName || 'Chimpanzee',
            scientific: resObj.label || 'Pan troglodytes',
            confidence: `${Math.round((resObj.confidence || 0.94) * 100 * 10) / 10}%`,
            callType: resObj.callType || 'Alarm Call'
          },
          secondaryMatch: matches[1] ? {
            name: matches[1].species,
            scientific: 'Species Match',
            confidence: `${Math.round(matches[1].confidence * 100)}%`,
            callType: matches[1].callType
          } : {
            name: 'African Elephant',
            scientific: 'Loxodonta africana',
            confidence: '86.4%',
            callType: 'Trumpet Call'
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
      setIsPlaying(true);
    }
  };

  const eventList = [
    { id: 'e1', title: 'Sector 4_Alpha...', subtitle: '2 Detections • Chimpanzee, Parrot', time: 'TODAY, 03:15 AM', active: true },
    { id: 'e2', title: 'River_Bend_02', subtitle: '1 Detection • Hippo Grunt', time: 'TODAY, 01:42 AM' },
    { id: 'e3', title: 'Perimeter_North', subtitle: 'Anomaly • Chainsaw Threat', time: 'YESTERDAY, 11:20 PM', isAnomaly: true },
    { id: 'e4', title: 'Canopy_Mic_7', subtitle: '4 Detections • Mixed Avian Call', time: 'YESTERDAY, 06:18 AM' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>Bioacoustic Engine</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Advanced audio identification & spectrographic frequency analysis for wildlife monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{
            background: 'var(--forest-green)',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '0.55rem 1.25rem',
            fontSize: '0.82rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}>
            <Upload size={15} /> Upload Audio File
            <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Main Grid: Player (Left) + Event Library (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
        
        {/* Left Column: Player Spectrogram & Match Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Main Spectrogram Player Card */}
          <div className="eco-card" style={{ padding: '1.25rem' }}>
            
            {/* Title & Transport Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Volume2 size={16} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                    {currentRecording.name}
                  </h3>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Status: {isClassifying ? 'Analyzing Audio...' : 'Audio Identification Active'} • Duration: {currentRecording.duration}
                </div>
              </div>

              {/* Play/Pause */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--forest-green)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(17, 56, 41, 0.3)'
                  }}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                </button>
              </div>
            </div>

            {/* Canvas Waveform Display */}
            <div style={{
              width: '100%',
              height: '210px',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <canvas ref={canvasRef} width={640} height={210} style={{ width: '100%', height: '100%' }} />

              {/* Detection Confidence Overlay Tags */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '20%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                borderRadius: '4px',
                padding: '0.15rem 0.4rem',
                fontSize: '0.65rem',
                fontWeight: '700',
                color: '#6ee7b7'
              }}>
                {currentRecording.primaryMatch.confidence} CONF
              </div>
            </div>

            {/* Bottom Spectrogram Bar Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span className="font-mono">00:00:00</span>

              {/* Noise Reduction Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Noise Reduction Filter:</span>
                <button
                  onClick={() => setNoiseReduction(!noiseReduction)}
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    background: noiseReduction ? 'var(--forest-green)' : '#cbd5e1',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: noiseReduction ? '18px' : '2px',
                    transition: 'all 0.2s ease'
                  }}></div>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="font-mono">{currentRecording.duration}</span>
              </div>
            </div>

          </div>

          {/* Bottom Cards: Primary Match & Secondary Match */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Primary Match Card */}
            <div className="eco-card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                Audio Identification - Primary Match
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#e6f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest-green)' }}>
                  <FileAudio size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    {currentRecording.primaryMatch.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {currentRecording.primaryMatch.scientific}
                  </div>
                  <span className="badge-pill badge-green" style={{ marginTop: '0.2rem' }}>
                    {currentRecording.primaryMatch.callType}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Confidence Score</span>
                  <span style={{ fontWeight: '800', color: 'var(--forest-green)' }}>
                    {currentRecording.primaryMatch.confidence}
                  </span>
                </div>
                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px' }}>
                  <div style={{ width: currentRecording.primaryMatch.confidence, height: '100%', background: 'var(--forest-green)', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>

            {/* Secondary Match Card */}
            <div className="eco-card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                Secondary Acoustic Match
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-medium)' }}>
                  <Volume2 size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    {currentRecording.secondaryMatch.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {currentRecording.secondaryMatch.scientific}
                  </div>
                  <span className="badge-pill badge-gray" style={{ marginTop: '0.2rem' }}>
                    {currentRecording.secondaryMatch.callType}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Confidence Score</span>
                  <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>
                    {currentRecording.secondaryMatch.confidence}
                  </span>
                </div>
                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px' }}>
                  <div style={{ width: currentRecording.secondaryMatch.confidence, height: '100%', background: 'var(--text-medium)', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Event Library Panel */}
        <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>Audio Event Library</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Spectrographic telemetry stream</p>
          </div>

          {/* Event Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {eventList.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: item.active ? '#e6f4ee' : '#f9fafb',
                  border: `1px solid ${item.active ? 'var(--forest-green)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: item.isAnomaly ? '#fee2e2' : 'var(--forest-green)', color: item.isAnomaly ? '#b91c1c' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                    {item.isAnomaly ? '▲' : '◆'}
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-dark)' }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-medium)', marginBottom: '0.2rem' }}>{item.subtitle}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
