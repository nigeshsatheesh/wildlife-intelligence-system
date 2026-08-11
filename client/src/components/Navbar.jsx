import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Map, 
  Scan, 
  Volume2, 
  PlusCircle, 
  UserCheck, 
  Radio,
  Clock,
  Database
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenSighting, user, isBackendConnected }) {
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Research Dashboard', icon: Activity },
    { id: 'habitat', label: 'Habitat Intelligence', icon: Map },
    { id: 'species', label: 'Species Classifier', icon: Scan },
    { id: 'bioacoustics', label: 'Bioacoustic Monitor', icon: Volume2 },
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '0.85rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0.3) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
          }}>
            <ShieldAlert size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#f0fdf4' }}>EcoGuard</h1>
              <span className="badge badge-telemetry" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>v2.4 AI</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wildlife Intelligence System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(6, 9, 7, 0.6)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(20, 184, 166, 0.2) 100%)' : 'transparent',
                  color: isActive ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
                }}
              >
                <Icon size={16} color={isActive ? '#10b981' : '#94a3b8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Telemetry Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(10, 16, 13, 0.5)', padding: '0.35rem 0.7rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <Clock size={14} color="#14b8a6" />
            <span className="font-mono">{time} UTC</span>
          </div>

          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <span className="pulse-dot"></span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isBackendConnected ? 'Express Live' : 'Standalone Mode'}
            </span>
          </div>

          {/* New Sighting Button */}
          <button className="btn-primary" onClick={onOpenSighting} style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}>
            <PlusCircle size={16} />
            <span>Log Sighting</span>
          </button>

          {/* User Auth Profile */}
          <button className="btn-secondary" onClick={onOpenAuth} style={{ fontSize: '0.85rem', padding: '0.45rem 0.8rem' }}>
            <UserCheck size={16} />
            <span>{user ? user.name : 'Researcher Access'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
