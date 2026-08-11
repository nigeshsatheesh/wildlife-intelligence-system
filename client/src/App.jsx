import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ResearchDashboard from './components/ResearchDashboard';
import AdminDashboard from './components/AdminDashboard';
import SpeciesListPage from './components/SpeciesListPage';
import SpeciesDetailPage from './components/SpeciesDetailPage';
import SpeciesFormModal from './components/SpeciesFormModal';
import SitesListPage from './components/SitesListPage';
import SiteFormModal from './components/SiteFormModal';
import SightingsListPage from './components/SightingsListPage';
import SightingLogForm from './components/SightingLogForm';
import SightingDetailPage from './components/SightingDetailPage';
import { Search, Bell, Plus, UserCheck, Shield } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const defaultSpecies = [
  { _id: 's1', commonName: 'Bengal Tiger', scientificName: 'Panthera tigris', category: 'Mammal', classifierLabel: 'tiger', conservationStatus: 'Critical', imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80' },
  { _id: 's2', commonName: 'African Elephant', scientificName: 'Loxodonta africana', category: 'Mammal', classifierLabel: 'elephant', conservationStatus: 'Vulnerable', imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80' },
  { _id: 's3', commonName: 'Golden Eagle', scientificName: 'Aquila chrysaetos', category: 'Bird', classifierLabel: 'eagle', conservationStatus: 'Healthy', imageUrl: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=600&q=80' },
  { _id: 's4', commonName: 'Eurasian Wolf', scientificName: 'Canis lupus', category: 'Mammal', classifierLabel: 'wolf', conservationStatus: 'Moderate Concern', imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?auto=format&fit=crop&w=600&q=80' },
  { _id: 's5', commonName: 'Eurasian Lynx', scientificName: 'Lynx lynx', category: 'Mammal', classifierLabel: 'lynx', conservationStatus: 'Vulnerable', imageUrl: 'https://images.unsplash.com/photo-1540573133985-780688d1728b?auto=format&fit=crop&w=600&q=80' },
  { _id: 's6', commonName: 'Red Fox', scientificName: 'Vulpes vulpes', category: 'Mammal', classifierLabel: 'fox', conservationStatus: 'Healthy', imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=600&q=80' }
];

const defaultSites = [
  { _id: 'st1', siteName: 'Bandipur Tiger Reserve', siteCode: 'BTR-ALPHA-01', habitatType: 'Forest', protectedArea: 'Bandipur National Park', location: { latitude: 11.6664, longitude: 76.6292 }, monitoringDevice: 'Camera Trap', active: true },
  { _id: 'st2', siteName: 'Serengeti North Grid', siteCode: 'SER-GRID-04', habitatType: 'Grassland', protectedArea: 'Serengeti Ecosystem', location: { latitude: -2.3333, longitude: 34.8333 }, monitoringDevice: 'Camera Trap', active: true },
  { _id: 'st3', siteName: 'Kaziranga Wetland Station', siteCode: 'KZR-WET-02', habitatType: 'Wetland', protectedArea: 'Kaziranga Reserve', location: { latitude: 26.5775, longitude: 93.1711 }, monitoringDevice: 'Manual Observation', active: true },
  { _id: 'st4', siteName: 'Bialowieza Ancient Forest', siteCode: 'BWZ-FOR-09', habitatType: 'Forest', protectedArea: 'Bialowieza Biosphere', location: { latitude: 52.7000, longitude: 23.8667 }, monitoringDevice: 'Camera Trap', active: true }
];

const defaultSightings = [
  {
    _id: 'sg1',
    species: defaultSpecies[0],
    monitoringSite: defaultSites[0],
    observedBy: { name: 'Dr. Sarah Chen' },
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
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
    observedBy: { name: 'Alex Rivera' },
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
    classifierPrediction: 'Loxodonta africana',
    classifierConfidence: 0.988,
    verified: true,
    individualCount: 14,
    location: { latitude: -2.3333, longitude: 34.8333 },
    locality: 'Mara River Basin',
    country: 'Tanzania',
    eventDate: new Date('2026-08-04T09:15:00Z'),
    notes: 'Matriarch herd migrating towards northern pastures.'
  },
  {
    _id: 'sg3',
    species: defaultSpecies[3],
    monitoringSite: defaultSites[3],
    observedBy: { name: 'Dr. Sarah Chen' },
    imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?auto=format&fit=crop&w=800&q=80',
    classifierPrediction: 'Canis lupus',
    classifierConfidence: 0.912,
    verified: false,
    individualCount: 4,
    location: { latitude: 52.7000, longitude: 23.8667 },
    locality: 'Bialowieza Core Zone',
    country: 'Poland',
    eventDate: new Date('2026-08-06T22:45:00Z'),
    notes: 'Night camera trap trigger. Pack movement recorded.'
  }
];

export default function App() {
  const [authMode, setAuthMode] = useState('authenticated'); // 'login' | 'register' | 'authenticated'
  const [user, setUser] = useState({ name: 'Dr. Sarah Chen', role: 'Researcher' });

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'species' | 'sites' | 'sightings' | 'bioacoustics' | 'habitat' | 'reports'
  
  // Selected detail views
  const [selectedSpeciesDetail, setSelectedSpeciesDetail] = useState(null);
  const [selectedSightingDetail, setSelectedSightingDetail] = useState(null);
  const [isLogSightingFormOpen, setIsLogSightingFormOpen] = useState(false);

  // Modals
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [editingSpeciesData, setEditingSpeciesData] = useState(null);
  
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSiteData, setEditingSiteData] = useState(null);

  // Data states
  const [species, setSpecies] = useState(defaultSpecies);
  const [sites, setSites] = useState(defaultSites);
  const [sightings, setSightings] = useState(defaultSightings);
  const [analytics, setAnalytics] = useState(null);

  // Fetch API data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spRes, stRes, sgRes, anRes] = await Promise.all([
          fetch(`${API_BASE}/species`),
          fetch(`${API_BASE}/sites`),
          fetch(`${API_BASE}/sightings`),
          fetch(`${API_BASE}/analytics`)
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
      } catch (err) {}
    };

    fetchData();
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

  const handleSaveSighting = (newSightingData) => {
    const matchedSpecies = species.find(s => s._id === newSightingData.species) || species[0];
    const matchedSite = sites.find(st => st._id === newSightingData.monitoringSite) || sites[0];

    const localCreated = {
      _id: 'sg_' + Date.now(),
      ...newSightingData,
      species: matchedSpecies,
      monitoringSite: matchedSite,
      observedBy: { name: user ? user.name : 'Dr. Sarah Chen' },
      createdAt: new Date()
    };
    setSightings(prev => [localCreated, ...prev]);
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
  if (authMode === 'login') {
    return <LoginPage onLogin={(u) => { setUser(u); setAuthMode('authenticated'); }} onNavigateRegister={() => setAuthMode('register')} />;
  }

  if (authMode === 'register') {
    return <RegisterPage onRegister={(u) => { setUser(u); setAuthMode('authenticated'); }} onNavigateLogin={() => setAuthMode('login')} />;
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
              onClick={() => setUser(prev => ({ ...prev, role: prev.role === 'Admin' ? 'Researcher' : 'Admin' }))}
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
            <div style={{ position: 'relative', cursor: 'pointer', background: '#ffffff', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="var(--text-medium)" />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }}></span>
            </div>

            {/* + New Survey / Log Sighting Button */}
            <button className="btn-new-survey" onClick={() => setIsLogSightingFormOpen(true)}>
              <Plus size={16} /> Log Sighting
            </button>
          </div>
        </header>

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

          {/* Sighting Detail View (Page 12) */}
          {!isLogSightingFormOpen && selectedSightingDetail && (
            <SightingDetailPage 
              sighting={selectedSightingDetail} 
              speciesList={species} 
              onVerify={handleVerifySighting} 
              onCorrectSpecies={handleCorrectSightingSpecies} 
              onBack={() => setSelectedSightingDetail(null)} 
            />
          )}

          {/* Species Detail View (Page 6) */}
          {!isLogSightingFormOpen && !selectedSightingDetail && selectedSpeciesDetail && (
            <SpeciesDetailPage 
              speciesItem={selectedSpeciesDetail} 
              sightings={sightings} 
              onBack={() => setSelectedSpeciesDetail(null)} 
            />
          )}

          {/* Main Views */}
          {!isLogSightingFormOpen && !selectedSightingDetail && !selectedSpeciesDetail && (
            <>
              {/* Dashboard View: Researcher (Page 3) or Admin (Page 4) */}
              {(activeTab === 'dashboard' || activeTab === 'population' || activeTab === 'alerts') && (
                user?.role === 'Admin' ? (
                  <AdminDashboard analytics={analytics} species={species} sites={sites} sightings={sightings} />
                ) : (
                  <ResearchDashboard analytics={analytics} sightings={sightings} species={species} />
                )
              )}

              {/* Sightings / Surveys Listing Page (Page 10) */}
              {(activeTab === 'sightings' || activeTab === 'surveys') && (
                <SightingsListPage 
                  sightings={sightings} 
                  speciesList={species} 
                  sitesList={sites} 
                  onSelectSighting={(sg) => setSelectedSightingDetail(sg)} 
                  onOpenLogSighting={() => setIsLogSightingFormOpen(true)} 
                />
              )}

              {/* Species Listing Page (Page 5) */}
              {(activeTab === 'species' || activeTab === 'biodiversity') && (
                <SpeciesListPage 
                  species={species} 
                  user={user} 
                  onSelectSpecies={(sp) => setSelectedSpeciesDetail(sp)} 
                  onOpenAddSpecies={() => { setEditingSpeciesData(null); setIsSpeciesModalOpen(true); }} 
                />
              )}

              {/* Monitoring Sites / Camera Traps Listing Page (Page 8) */}
              {(activeTab === 'sites' || activeTab === 'camera-traps') && (
                <SitesListPage 
                  sites={sites} 
                  onOpenAddSite={() => { setEditingSiteData(null); setIsSiteModalOpen(true); }} 
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

              {/* Bioacoustic Engine / Audio Sensors / Audio Analysis (Page 14) */}
              {(activeTab === 'bioacoustics' || activeTab === 'audio-sensors' || activeTab === 'audio-analysis') && (
                <BioacousticMonitoring />
              )}

              {/* Habitat & Health / Conservation (Page 13) */}
              {(activeTab === 'habitat' || activeTab === 'health' || activeTab === 'conservation') && (
                <HabitatIntelligence />
              )}

              {/* Reports & Archive */}
              {(activeTab === 'reports' || activeTab === 'settings') && (
                <div className="eco-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>Reports & System Settings</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    System telemetry, user access clearance, and historical archives are securely managed via MongoDB & Express.
                  </p>
                </div>
              )}
            </>
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

    </div>
  );
}
