const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded files (images, audio)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Standalone in-memory fallback store if MongoDB isn't reachable
const memoryDb = {
  users: [
    { _id: 'u1', name: 'Dr. Sarah Chen', email: 'sarah.chen@ecoguard.org', role: 'Admin' },
    { _id: 'u2', name: 'Alex Rivera', email: 'alex.rivera@ecoguard.org', role: 'Researcher' }
  ],
  species: [
    { _id: 's1', commonName: 'Bengal Tiger', scientificName: 'Panthera tigris', category: 'Mammal', classifierLabel: 'tiger', conservationStatus: 'Critical' },
    { _id: 's2', commonName: 'African Elephant', scientificName: 'Loxodonta africana', category: 'Mammal', classifierLabel: 'elephant', conservationStatus: 'Vulnerable' },
    { _id: 's3', commonName: 'Golden Eagle', scientificName: 'Aquila chrysaetos', category: 'Bird', classifierLabel: 'eagle', conservationStatus: 'Healthy' },
    { _id: 's4', commonName: 'Eurasian Wolf', scientificName: 'Canis lupus', category: 'Mammal', classifierLabel: 'wolf', conservationStatus: 'Moderate Concern' },
    { _id: 's5', commonName: 'Eurasian Lynx', scientificName: 'Lynx lynx', category: 'Mammal', classifierLabel: 'lynx', conservationStatus: 'Vulnerable' },
    { _id: 's6', commonName: 'Red Fox', scientificName: 'Vulpes vulpes', category: 'Mammal', classifierLabel: 'fox', conservationStatus: 'Healthy' }
  ],
  sites: [
    { _id: 'st1', siteName: 'Bandipur Tiger Reserve', siteCode: 'BTR-ALPHA-01', habitatType: 'Forest', protectedArea: 'Bandipur National Park', location: { latitude: 11.6664, longitude: 76.6292 }, monitoringDevice: 'Camera Trap', active: true },
    { _id: 'st2', siteName: 'Serengeti North Grid', siteCode: 'SER-GRID-04', habitatType: 'Grassland', protectedArea: 'Serengeti Ecosystem', location: { latitude: -2.3333, longitude: 34.8333 }, monitoringDevice: 'Camera Trap', active: true },
    { _id: 'st3', siteName: 'Kaziranga Wetland Station', siteCode: 'KZR-WET-02', habitatType: 'Wetland', protectedArea: 'Kaziranga Reserve', location: { latitude: 26.5775, longitude: 93.1711 }, monitoringDevice: 'Manual Observation', active: true },
    { _id: 'st4', siteName: 'Bialowieza Ancient Forest', siteCode: 'BWZ-FOR-09', habitatType: 'Forest', protectedArea: 'Bialowieza Biosphere', location: { latitude: 52.7000, longitude: 23.8667 }, monitoringDevice: 'Camera Trap', active: true }
  ],
  sightings: [
    {
      _id: 'sg1',
      species: { _id: 's1', commonName: 'Bengal Tiger', scientificName: 'Panthera tigris' },
      monitoringSite: { _id: 'st1', siteName: 'Bandipur Tiger Reserve' },
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
      species: { _id: 's2', commonName: 'African Elephant', scientificName: 'Loxodonta africana' },
      monitoringSite: { _id: 'st2', siteName: 'Serengeti North Grid' },
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
      species: { _id: 's4', commonName: 'Eurasian Wolf', scientificName: 'Canis lupus' },
      monitoringSite: { _id: 'st4', siteName: 'Bialowieza Ancient Forest' },
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
  ]
};

let isMongoConnected = false;

// Connect Database
connectDB().then((connected) => {
  isMongoConnected = connected;
});

// Middleware to inject connection state into requests
app.use((req, res, next) => {
  req.isMongoConnected = isMongoConnected;
  req.memoryDb = memoryDb;
  next();
});

// Route Modules
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/species', require('./routes/speciesRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/sightings', require('./routes/sightingRoutes'));
app.use('/api/audio', require('./routes/audioRoutes'));

// AI Image Detection & Bounding Box Simulator API
app.post('/api/classify', (req, res) => {
  const sampleSpecies = [
    { label: 'Panthera tigris', commonName: 'Bengal Tiger', confidence: 0.974, category: 'Mammal', risk: 'Critical' },
    { label: 'Loxodonta africana', commonName: 'African Elephant', confidence: 0.989, category: 'Mammal', risk: 'Vulnerable' },
    { label: 'Aquila chrysaetos', commonName: 'Golden Eagle', confidence: 0.942, category: 'Bird', risk: 'Healthy' },
    { label: 'Canis lupus', commonName: 'Eurasian Wolf', confidence: 0.915, category: 'Mammal', risk: 'Moderate Concern' },
    { label: 'Vulpes vulpes', commonName: 'Red Fox', confidence: 0.958, category: 'Mammal', risk: 'Healthy' }
  ];
  
  const match = sampleSpecies[Math.floor(Math.random() * sampleSpecies.length)];
  res.json({
    prediction: match.label,
    commonName: match.commonName,
    confidence: match.confidence,
    category: match.category,
    conservationStatus: match.risk,
    detectedCount: Math.floor(Math.random() * 3) + 1,
    boundingBox: { x: 25, y: 20, width: 50, height: 60 }
  });
});

// Biodiversity Analytics API
app.get('/api/analytics', async (req, res) => {
  const SpeciesModel = require('./models/Species');
  const SightingModel = require('./models/Sighting');
  const SiteModel = require('./models/MonitoringSite');

  const speciesList = isMongoConnected ? await SpeciesModel.find() : memoryDb.species;
  const sightingsList = isMongoConnected ? await SightingModel.find() : memoryDb.sightings;
  const sitesCount = isMongoConnected ? await SiteModel.countDocuments() : memoryDb.sites.length;

  const totalSightings = sightingsList.length;
  const totalIndividuals = sightingsList.reduce((acc, s) => acc + (s.individualCount || 1), 0);
  const activeSpeciesCount = speciesList.length;

  const conservationAlerts = speciesList.map(s => {
    const speciesSightings = sightingsList.filter(sg => 
      (sg.species._id || sg.species || '').toString() === (s._id || '').toString() || 
      (sg.species && sg.species.scientificName === s.scientificName)
    );
    const count = speciesSightings.length;
    let statusFlag = s.conservationStatus || 'Healthy';
    let trend = 'Stable';
    let percentChange = 0;

    if (count < 2) {
      statusFlag = 'Critical';
      trend = 'Decline (-24%)';
      percentChange = -24;
    } else if (count < 5) {
      statusFlag = 'Vulnerable';
      trend = 'Decline (-12%)';
      percentChange = -12;
    } else {
      trend = 'Increasing (+18%)';
      percentChange = 18;
    }

    return {
      speciesId: s._id,
      commonName: s.commonName,
      scientificName: s.scientificName,
      sightingCount: count,
      statusFlag,
      trend,
      percentChange
    };
  });

  res.json({
    totalSightings,
    totalIndividuals,
    activeSpeciesCount,
    activeSitesCount: sitesCount,
    conservationAlerts,
    sightingTrends: [
      { month: 'Jan', sightings: 45, verified: 40 },
      { month: 'Feb', sightings: 58, verified: 52 },
      { month: 'Mar', sightings: 72, verified: 68 },
      { month: 'Apr', sightings: 64, verified: 60 },
      { month: 'May', sightings: 89, verified: 81 },
      { month: 'Jun', sightings: 105, verified: 98 },
      { month: 'Jul', sightings: 120, verified: 114 },
      { month: 'Aug', sightings: 142, verified: 135 }
    ]
  });
});

app.get('/', (req, res) => {
  res.send('Wildlife Intelligence System API is running');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Wildlife Intelligence API running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} occupied, starting on port 5001...`);
    app.listen(5001, () => {
      console.log(`🚀 Wildlife Intelligence API running on port 5001`);
    });
  } else {
    console.error('Server error:', err.message);
  }
});

setInterval(() => {}, 10000); // Keep event loop active

