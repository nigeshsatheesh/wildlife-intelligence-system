import React from 'react';
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
  Share2 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onOpenAuth }) {
  const monitoringItems = [
    { id: 'surveys', label: 'Surveys', icon: Map },
    { id: 'camera-traps', label: 'Camera Traps', icon: Camera }
  ];

  const analysisItems = [
    { id: 'image-analysis', label: 'Image Analysis', icon: Image },
    { id: 'population', label: 'Population', icon: Users },
    { id: 'biodiversity', label: 'Biodiversity', icon: Award },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Logo Header */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Leaf size={18} color="#ffffff" />
          </div>
          <div>
            <div className="logo-text-main">EcoIntelligence</div>
            <div className="logo-text-sub">ECOLOGICAL INTELLIGENCE</div>
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

      {/* User Card */}
      <div className="user-card" onClick={onOpenAuth} style={{ cursor: 'pointer', marginTop: '1rem' }}>
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
        <Settings size={15} color="var(--text-muted)" />
      </div>
    </aside>
  );
}

