import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  Users, 
  Award, 
  Map, 
  ShieldAlert, 
  HeartPulse, 
  Bell, 
  FileText, 
  Settings, 
  Leaf, 
  Camera, 
  Radio, 
  Image, 
  Volume2, 
  Compass, 
  Share2,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const monitoringItems = [
    { id: 'surveys', label: 'Surveys', icon: Map },
    { id: 'camera-traps', label: 'Camera Traps', icon: Camera }
  ];

  const analysisItems = [
    { id: 'image-analysis', label: 'Image Analysis', icon: Image },
    { id: 'bioacoustics', label: 'Bioacoustics', icon: Volume2 },
    { id: 'population', label: 'Population', icon: Users },
    { id: 'biodiversity', label: 'Biodiversity', icon: Award },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Logo Header (uses project logo at /logo.png) */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="Wildlife Intelligence"
              style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6 }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="24" cy="24" r="12" fill="#174f3a"/></svg>`);
              }}
            />
            <div>
              <div className="logo-text-main">Wildlife Intelligence System</div>
              <div className="logo-text-sub">ECOLOGICAL INTELLIGENCE</div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Button */}
        <nav className="nav-menu">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            style={{ marginBottom: '1.25rem' }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* MONITORING Section */}
          <div className="sidebar-section-title">MONITORING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.25rem' }}>
            {monitoringItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-sub-item ${isActive ? 'active-sub' : ''}`}
                >
                  {Icon && <Icon size={14} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI ANALYSIS Section */}
          <div className="sidebar-section-title">AI ANALYSIS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {analysisItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={Icon ? `nav-item ${isActive ? 'active' : ''}` : `nav-sub-item ${isActive ? 'active-sub' : ''}`}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                >
                  {Icon && <Icon size={16} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* User Card with Settings menu */}
      <div className="user-card" style={{ cursor: 'default', marginTop: '1rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="user-avatar">
            {user ? user.name.charAt(0) : 'R'}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
              {user ? user.name : 'Researcher'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Lead Ecological Analyst
            </div>
          </div>
        </div>
        <button
          aria-label="Open settings"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}
          style={{ background: 'transparent', border: 'none', padding: 6, marginLeft: 6, cursor: 'pointer' }}
        >
          <Settings size={15} color="var(--text-muted)" />
        </button>

        {menuOpen && (
          <div ref={menuRef} style={{ position: 'absolute', left: 12, bottom: 72, width: 180, background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', zIndex: 200 }}>
            <button
              onClick={() => {
                setMenuOpen(false);
                if (typeof onLogout === 'function') onLogout();
              }}
              className="nav-sub-item"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <LogOut size={16} />
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}