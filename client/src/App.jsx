import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ResearchDashboard from './components/ResearchDashboard';
import AdminDashboard from './components/AdminDashboard';
import AlertsPage from './components/AlertsPage';
import ReportsPage from './components/ReportsPage';
import SpeciesListPage from './components/SpeciesListPage';
import SpeciesDetailPage from './components/SpeciesDetailPage';
import SpeciesFormModal from './components/SpeciesFormModal';
import SitesListPage from './components/SitesListPage';
import SiteFormModal from './components/SiteFormModal';
import SightingsListPage from './components/SightingsListPage';
import SightingLogForm from './components/SightingLogForm';
import SightingDetailPage from './components/SightingDetailPage';
import RecordingLogForm from './components/RecordingLogForm';
import RecordingsListPage from './components/RecordingsListPage';
import PopulationPage from './components/PopulationPage';
import HabitatPage from './components/HabitatPage';
import BiodiversityPage from './components/BiodiversityPage';
import HealthScorePage from './components/HealthScorePage';
import ConservationOfficerDashboard from './components/ConservationOfficerDashboard';
import ForestDepartmentDashboard from './components/ForestDepartmentDashboard';
import SurveysPage from './components/SurveysPage';
import CameraTrapsPage from './components/CameraTrapsPage';
import ProfileModal from './components/ProfileModal';
import ErrorBoundary from './components/ErrorBoundary';
import { Search, Bell, Plus, UserCheck, Shield, Camera, Mic, X } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

const defaultSpecies = [
  { _id: 's1', commonName: 'Bengal Tiger', scientificName: 'Panthera tigris', category: 'Mammal', classifierLabel: 'tiger', conservationStatus: 'Critical', imageUrl: '/species-images/bengal-tiger.jpg' },
  { _id: 's2', commonName: 'African Elephant', scientificName: 'Loxodonta africana', category: 'Mammal', classifierLabel: 'elephant', conservationStatus: 'Vulnerable', imageUrl: '/species-images/asian-elephant.jpg' },
  { _id: 's3', commonName: 'Golden Eagle', scientificName: 'Aquila chrysaetos', category: 'Bird', classifierLabel: 'eagle', conservationStatus: 'Healthy', imageUrl: '/species-images/golden-eagle.jpg' },
  { _id: 's4', commonName: 'Eurasian Wolf', scientificName: 'Canis lupus', category: 'Mammal', classifierLabel: 'wolf', conservationStatus: 'Moderate Concern', imageUrl: '/species-images/indian-wolf.jpg' },
  { _id: 's5', commonName: 'Red Fox', scientificName: 'Vulpes vulpes', category: 'Mammal', classifierLabel: 'fox', conservationStatus: 'Healthy', imageUrl: '/species-images/red-fox.jpg' },
  { _id: 's6', commonName: 'Sloth Bear', scientificName: 'Melursus ursinus', category: 'Mammal', classifierLabel: 'bear', conservationStatus: 'Vulnerable', imageUrl: '/species-images/sloth-bear.jpg' },
  { _id: 's7', commonName: 'Sambar Deer', scientificName: 'Rusa unicolor', category: 'Mammal', classifierLabel: 'deer', conservationStatus: 'Healthy', imageUrl: '/species-images/sambar-deer.jpg' },
  { _id: 's8', commonName: 'Leopard', scientificName: 'Panthera pardus', category: 'Mammal', classifierLabel: 'leopard', conservationStatus: 'Vulnerable', imageUrl: '/species-images/leopard.jpg' },
  { _id: 's9', commonName: 'Asiatic Lion', scientificName: 'Panthera leo persica', category: 'Mammal', classifierLabel: 'lion', conservationStatus: 'Critical', imageUrl: '/species-images/asiatic-lion.jpg' },
  { _id: 's10', commonName: 'Eurasian Owl', scientificName: 'Bubo bubo', category: 'Bird', classifierLabel: 'owl', conservationStatus: 'Healthy', imageUrl: '/species-images/eurasian-owl.jpg' },
  { _id: 's11', commonName: 'Indian Giant Squirrel', scientificName: 'Ratufa indica', category: 'Mammal', classifierLabel: 'squirrel', conservationStatus: 'Healthy', imageUrl: '/species-images/giant-squirrel.jpg' },
  { _id: 's12', commonName: 'Plains Zebra', scientificName: 'Equus quagga', category: 'Mammal', classifierLabel: 'zebra', conservationStatus: 'Healthy', imageUrl: '/species-images/plains-zebra.jpg' }
];

const defaultSites = [
  { _id: 'st1', siteName: 'Bandipur Tiger Reserve', siteCode: 'BTR-ALPHA-01', habitatType: 'Forest', protectedArea: 'Bandipur National Park', location: { latitude: 11.6664, longitude: 76.6292 }, monitoringDevice: 'Camera Trap', active: true },
  { _id: 'st2', siteName: 'Kaziranga Wetland Station', siteCode: 'KZR-WET-02', habitatType: 'Wetland', protectedArea: 'Kaziranga National Park', location: { latitude: 26.5775, longitude: 93.1711 }, monitoringDevice: 'Camera Trap', active: true }
];

const defaultSightings = [
  {
    _id: 'sg1',
    species: defaultSpecies[0],
    monitoringSite: defaultSites[0],
    observedBy: { name: 'Nigesh Researcher' },
    imageUrl: '/species-images/bengal-tiger.jpg',
    classifierPrediction: 'Panthera tigris',
    classifierConfidence: 0.964,
    verified: true,
    individualCount: 2,
    location: { latitude: 11.6664, longitude: 76.6292 },
    locality: 'Bandipur Sector 4',
    country: 'India',
    eventDate: new Date('2026-08-01T14:30:00Z'),
    notes: 'Female tiger with sub-adult cub spotted near water hole.'
  },
  {
    _id: 'sg2',
    species: defaultSpecies[1],
    monitoringSite: defaultSites[1],
    observedBy: { name: 'Nigesh Researcher' },
    imageUrl: '/species-images/asian-elephant.jpg',
    classifierPrediction: 'Loxodonta africana',
    classifierConfidence: 0.988,
    verified: true,
    individualCount: 14,
    location: { latitude: 26.5775, longitude: 93.1711 },
    locality: 'Kaziranga Wetland Corridor',
    country: 'India',
    eventDate: new Date('2026-08-04T09:15:00Z'),
    notes: 'Matriarch herd migrating towards northern pastures.'
  },
  {
    _id: 'sg3',
    species: defaultSpecies[3],
    monitoringSite: defaultSites[0],
    observedBy: { name: 'Nigesh Researcher' },
    imageUrl: '/species-images/indian-wolf.jpg',
    classifierPrediction: 'Canis lupus',
    classifierConfidence: 0.912,
    verified: false,
    individualCount: 4,
    location: { latitude: 11.6664, longitude: 76.6292 },
    locality: 'Bandipur Ridge Zone',
    country: 'India',
    eventDate: new Date('2026-08-06T22:45:00Z'),
    notes: 'Night camera trap trigger. Pack movement recorded.'
  }
];

export default function App() {
  const roleCycle = ['Researcher', 'Conservation Officer', 'Forest Department Officer', 'Admin'];
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'authenticated'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'species' | 'sites' | 'sightings' | 'reports'
  
  // Selected detail views
  const [selectedSpeciesDetail, setSelectedSpeciesDetail] = useState(null);
  const [selectedSightingDetail, setSelectedSightingDetail] = useState(null);
  const [isLogSightingFormOpen, setIsLogSightingFormOpen] = useState(false);
  const [isLogRecordingFormOpen, setIsLogRecordingFormOpen] = useState(false);
  const [isSightingTypeModalOpen, setIsSightingTypeModalOpen] = useState(false);

  // Modals
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [editingSpeciesData, setEditingSpeciesData] = useState(null);
  
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSiteData, setEditingSiteData] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Data states
  const [species, setSpecies] = useState([]);
  const [sites, setSites] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [dataLoadError, setDataLoadError] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [populationData, setPopulationData] = useState([]);
  const [habitatData, setHabitatData] = useState([]);
  const [conservationRecs, setConservationRecs] = useState([]);
  const [ecosystemHealth, setEcosystemHealth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isBellDrawerOpen, setIsBellDrawerOpen] = useState(false);

  // Fetch API data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoadError(null);
        const [spRes, stRes, sgRes, anRes, recRes, popRes, habRes, conRes, healthRes, notifRes] = await Promise.all([
          fetch(`${API_BASE}/species`),
          fetch(`${API_BASE}/sites`),
          fetch(`${API_BASE}/sightings`),
          fetch(`${API_BASE}/analytics`),
          fetch(`${API_BASE}/recordings`),
          fetch(`${API_BASE}/population`),
          fetch(`${API_BASE}/habitat`),
          fetch(`${API_BASE}/analytics/conservation-recommendations`),
          fetch(`${API_BASE}/health-score`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${API_BASE}/notifications`)
        ]);

        if (spRes.ok && stRes.ok && sgRes.ok && anRes.ok) {
          const spData = await spRes.json();
          const stData = await stRes.json();
          const sgData = await sgRes.json();
          const anData = await anRes.json();

          if (spData.length) setSpecies(spData);
          if (stData.length) setSites(stData);
          if (sgData.length) setSightings(sgData);
          setAnalytics(anData);
        }
        if (notifRes.ok) setNotifications(await notifRes.json());
        if (popRes.ok) setPopulationData((await popRes.json()).speciesMetrics);
        if (habRes.ok) setHabitatData((await habRes.json()).siteReports);
        if (conRes.ok) setConservationRecs((await conRes.json()).recommendations);
        if (healthRes.ok) setEcosystemHealth(await healthRes.json());
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecordings(recData);
        }
      } catch (err) {
        setDataLoadError('Could not connect to backend. Data may be incomplete.');
        console.error('Failed to fetch backend data:', err);
      }
    };

    fetchData();
  }, []);

  const fetchUsers = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : ''
        }
      });

      if (!res.ok) return;
      const userData = await res.json();
      setUsers(userData);
    } catch (err) {
      console.error('Unable to load users', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setAuthMode('login');
    setSelectedSpeciesDetail(null);
    setSelectedSightingDetail(null);
    setIsLogSightingFormOpen(false);
    setActiveTab('dashboard');
  };

  useEffect(() => {
    // Do not auto-authenticate on initial load. Always show the login page first.
    // This keeps the login page visible when a user first opens the site.
    setAuthLoading(false);
    setAuthMode('login');
  }, []);

  const handleSaveSpecies = (newSpeciesObj) => {
    if (newSpeciesObj._id) {
      setSpecies(prev => prev.map(s => s._id === newSpeciesObj._id ? newSpeciesObj : s));
    } else {
      setSpecies(prev => [...prev, { ...newSpeciesObj, _id: 'sp_' + Date.now() }]);
    }
  };

  const handleSaveSite = (newSiteObj) => {
    if (newSiteObj._id) {
      setSites(prev => prev.map(st => st._id === newSiteObj._id ? newSiteObj : st));
    } else {
      setSites(prev => [...prev, { ...newSiteObj, _id: 'st_' + Date.now() }]);
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }

      const savedUser = await res.json();
      localStorage.setItem('token', savedUser.token);
      setToken(savedUser.token);
      setUser(savedUser);
      setActiveTab('dashboard');
      setAuthMode('authenticated');

      if (savedUser.role === 'Admin') {
        await fetchUsers(savedUser.token);
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleRegister = async ({ name, email, password, role }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }

      const savedUser = await res.json();
      localStorage.setItem('token', savedUser.token);
      setToken(savedUser.token);
      setUser(savedUser);
      setActiveTab('dashboard');
      setAuthMode('authenticated');

      if (savedUser.role === 'Admin') {
        await fetchUsers(savedUser.token);
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleSaveSighting = (savedSighting) => {
    setSightings(prev => [savedSighting, ...prev]);
  };

  const handleSaveRecording = (savedRecording) => {
    setRecordings(prev => [savedRecording, ...prev]);
  };

  const handleVerifySighting = (sightingId, verifiedState) => {
    setSightings(prev => prev.map(s => s._id === sightingId ? { ...s, verified: verifiedState } : s));
    if (selectedSightingDetail && selectedSightingDetail._id === sightingId) {
      setSelectedSightingDetail(prev => ({ ...prev, verified: verifiedState }));
    }
  };

  const handleCorrectSightingSpecies = (sightingId, newSpeciesObj) => {
    setSightings(prev => prev.map(s => s._id === sightingId ? { ...s, species: newSpeciesObj, classifierPrediction: newSpeciesObj.scientificName } : s));
    if (selectedSightingDetail && selectedSightingDetail._id === sightingId) {
      setSelectedSightingDetail(prev => ({ ...prev, species: newSpeciesObj, classifierPrediction: newSpeciesObj.scientificName }));
    }
  };

  // Auth pages view override
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
        Validating session...
      </div>
    );
  }

  if (!user) {
    if (authMode === 'register') {
      return <RegisterPage onRegister={handleRegister} onNavigateLogin={() => setAuthMode('login')} />;
    }

    return <LoginPage onLogin={handleLogin} onNavigateRegister={() => setAuthMode('register')} />;
  }

  return (
    <div className="app-layout">
      
      
      {/* Left Navigation Sidebar (Pages 3-12) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedSpeciesDetail(null);
          setSelectedSightingDetail(null);
          setIsLogSightingFormOpen(false);
        }} 
        user={user} 
        onOpenAuth={() => setAuthMode('login')} 
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        
        {/* Top Header Bar */}
        <header className="top-header">
          {/* Search Box */}
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search species, clusters, or GIS coordinates..." />
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Role Switcher Badge */}
            <button
              onClick={() => setUser(prev => ({ ...prev, role: roleCycle[(roleCycle.indexOf(prev.role) + 1) % roleCycle.length] }))}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: 'var(--forest-green)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Shield size={14} />
              <span>Role: {user?.role || 'Researcher'} (Switch)</span>
            </button>

            {/* Bell Notification */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsBellDrawerOpen(prev => !prev)}
                style={{ position: 'relative', cursor: 'pointer', background: '#ffffff', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Toggle notifications"
              >
                <Bell size={18} color="var(--text-medium)" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '16px', height: '16px', borderRadius: '9999px', background: '#ef4444', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {isBellDrawerOpen && (
                <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 300, overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Notifications</span>
                    <button
                      onClick={() => { setActiveTab('alerts'); setIsBellDrawerOpen(false); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--forest-green)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.slice(0, 5).map(n => (
                      <div
                        key={n._id || n.id}
                        onClick={() => { setActiveTab('alerts'); setIsBellDrawerOpen(false); }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          borderLeft: `3px solid ${n.severity === 'critical' ? '#ef4444' : n.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                          cursor: 'pointer',
                          background: n.read ? '#ffffff' : '#fcfdfe'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* + New Survey / Log Sighting Button */}
            <button className="btn-new-survey" onClick={() => setIsSightingTypeModalOpen(true)}>
              <Plus size={16} /> Log Sighting
            </button>
          </div>
        </header>
          {/* Backend Connection Warning */}
          {dataLoadError && (
            <div
              style={{
                background: '#fef2f2',
                color: '#c0392b',
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              {dataLoadError}
            </div>
          )}
        {/* Tab View Router across 12 Milestone Pages */}
        <main>
          {/* Sighting Log Form View (Page 11) */}
          {isLogSightingFormOpen && (
            <SightingLogForm 
              species={species} 
              sites={sites} 
              onSaveSighting={handleSaveSighting} 
              onClose={() => setIsLogSightingFormOpen(false)} 
            />
          )}

          {/* Recording Log Form View (Bioacoustics) */}
          {!isLogSightingFormOpen && isLogRecordingFormOpen && (
            <RecordingLogForm 
              sites={sites} 
              onSaveRecording={handleSaveRecording} 
              onClose={() => setIsLogRecordingFormOpen(false)} 
            />
          )}

          {/* Sighting Detail View (Page 12) */}
          {!isLogSightingFormOpen && !isLogRecordingFormOpen && selectedSightingDetail && (
            <SightingDetailPage 
              sighting={selectedSightingDetail} 
              speciesList={species} 
              onVerify={handleVerifySighting} 
              onCorrectSpecies={handleCorrectSightingSpecies} 
              onBack={() => setSelectedSightingDetail(null)} 
            />
          )}

          {/* Species Detail View (Page 6) */}
          {!isLogSightingFormOpen && !isLogRecordingFormOpen && !selectedSightingDetail && selectedSpeciesDetail && (
            <SpeciesDetailPage 
              speciesItem={selectedSpeciesDetail} 
              sightings={sightings} 
              onBack={() => setSelectedSpeciesDetail(null)} 
            />
          )}

          {/* Main Views */}
          {!isLogSightingFormOpen && !isLogRecordingFormOpen && !selectedSightingDetail && !selectedSpeciesDetail && (
            <ErrorBoundary key={activeTab}>
              {/* Dashboard View: Researcher (Page 3) or Admin (Page 4) */}
              {(activeTab === 'dashboard') && (
                user?.role === 'Admin' ? (
                  <AdminDashboard analytics={analytics} species={species} sites={sites} sightings={sightings} users={users} />
                ) : user?.role === 'Conservation Officer' ? (
                  <ConservationOfficerDashboard analytics={analytics} species={species} recommendations={conservationRecs} />
                ) : user?.role === 'Forest Department Officer' ? (
                  <ForestDepartmentDashboard sites={sites} sightings={sightings} species={species} />
                ) : (
                  <ResearchDashboard analytics={analytics} sightings={sightings} species={species} population={populationData} />
                )
              )}
              {activeTab === 'population' && (
                <PopulationPage />
              )}

              {activeTab === 'alerts' && (
                <AlertsPage species={species} sightings={sightings} recommendations={conservationRecs} />
              )}

              {activeTab === 'reports' && (
                <ReportsPage analytics={analytics} species={species} sightings={sightings} ecosystemHealth={ecosystemHealth} />
              )}

              {activeTab === 'sightings' && (
                <SightingsListPage 
                  sightings={sightings} 
                  speciesList={species} 
                  sitesList={sites} 
                  onSelectSighting={(sg) => setSelectedSightingDetail(sg)} 
                  onOpenLogSighting={() => setIsLogSightingFormOpen(true)} 
                />
              )}

              {activeTab === 'surveys' && (
                <SurveysPage sites={sites} />
              )}

              {activeTab === 'camera-traps' && (
                <CameraTrapsPage sites={sites} />
              )}

              {/* Bioacoustic Recordings Listing Page */}
              {activeTab === 'bioacoustics' && (
                <RecordingsListPage 
                  recordings={recordings} 
                  sitesList={sites} 
                  onOpenLogRecording={() => setIsLogRecordingFormOpen(true)} 
                />
              )}

              {/* Species Listing Page (Page 5) */}
              {(activeTab === 'species') && (
                <SpeciesListPage 
                  species={species} 
                  user={user} 
                  onSelectSpecies={(sp) => setSelectedSpeciesDetail(sp)} 
                  onOpenAddSpecies={() => { setEditingSpeciesData(null); setIsSpeciesModalOpen(true); }} 
                />
              )}

              {activeTab === 'habitat' && (
                <HabitatPage />
              )}

              {activeTab === 'biodiversity' && (
                <BiodiversityPage />
              )}

              {activeTab === 'health-score' && (
                <HealthScorePage />
              )}

              {/* Monitoring Sites Listing Page */}
              {activeTab === 'sites' && (
                <SitesListPage 
                  sites={sites} 
                  onOpenAddSite={() => { setEditingSiteData(null); setIsSiteModalOpen(true); }} 
                  habitatData={habitatData}
                />
              )}

              {/* Image Analysis / Sighting Log (Page 11) */}
              {activeTab === 'image-analysis' && (
                <SightingLogForm 
                  species={species} 
                  sites={sites} 
                  onSaveSighting={handleSaveSighting} 
                  onClose={() => setActiveTab('surveys')} 
                />
              )}
              {activeTab === 'settings' && (
                <div className="eco-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>Settings</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    No system settings available.
                  </p>
                </div>
              )}
            </ErrorBoundary>
          )}
        </main>

      </div>

      {/* Modals */}
      <SpeciesFormModal 
        isOpen={isSpeciesModalOpen} 
        onClose={() => setIsSpeciesModalOpen(false)} 
        onSaveSpecies={handleSaveSpecies} 
        initialData={editingSpeciesData} 
      />

      <SiteFormModal 
        isOpen={isSiteModalOpen} 
        onClose={() => setIsSiteModalOpen(false)} 
        onSaveSite={handleSaveSite} 
        initialData={editingSiteData} 
      />

      <ProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdateUser={(updated) => setUser(prev => ({ ...prev, ...updated }))}
      />

      {/* Sighting Type Selection Modal */}
      {isSightingTypeModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsSightingTypeModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Select Sighting Modality
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Choose whether you are uploading a camera trap image or a field bioacoustic audio recording.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSightingTypeModalOpen(false);
                  setActiveTab('image-analysis');
                  setIsLogSightingFormOpen(true);
                  setIsLogRecordingFormOpen(false);
                  setSelectedSpeciesDetail(null);
                  setSelectedSightingDetail(null);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem 1rem',
                  background: '#f8fafc',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--forest-green)';
                  e.currentTarget.style.background = '#e8f3ee';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#e8f3ee',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Image Sighting</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Camera trap photo & AI classification</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSightingTypeModalOpen(false);
                  setActiveTab('bioacoustics');
                  setIsLogRecordingFormOpen(true);
                  setIsLogSightingFormOpen(false);
                  setSelectedSpeciesDetail(null);
                  setSelectedSightingDetail(null);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem 1rem',
                  background: '#f8fafc',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--forest-green)';
                  e.currentTarget.style.background = '#e8f3ee';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#e8f3ee',
                  color: 'var(--forest-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mic size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Audio Sighting</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Bioacoustic audio & YAMNet detection</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}