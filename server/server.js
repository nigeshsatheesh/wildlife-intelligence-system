const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const Sighting = require('./models/Sighting');

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded files (images, audio)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve raw dataset images so the client can reference them directly
app.use('/raw-images', express.static(path.join(__dirname, '..', 'data', 'raw-images')));

// Helper endpoint: return a representative thumbnail for a species label
const fs = require('fs');
app.get('/raw-images/thumbnail/:label', (req, res) => {
  const label = req.params.label;
  const dir = path.join(__dirname, '..', 'data', 'raw-images', label);
  if (!fs.existsSync(dir)) return res.status(404).send('Not found');
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files || files.length === 0) return res.status(404).send('No images');
  // send first image as representative thumbnail
  const imgPath = path.join(dir, files[0]);
  res.sendFile(imgPath);
});

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
      { _id: 's5', commonName: 'Red Fox', scientificName: 'Vulpes vulpes', category: 'Mammal', classifierLabel: 'fox', conservationStatus: 'Healthy' },
      { _id: 's6', commonName: 'Sloth Bear', scientificName: 'Melursus ursinus', category: 'Mammal', classifierLabel: 'bear', conservationStatus: 'Vulnerable' },
      { _id: 's7', commonName: 'Sambar Deer', scientificName: 'Rusa unicolor', category: 'Mammal', classifierLabel: 'deer', conservationStatus: 'Healthy' },
      { _id: 's8', commonName: 'Leopard', scientificName: 'Panthera pardus', category: 'Mammal', classifierLabel: 'leopard', conservationStatus: 'Vulnerable' },
      { _id: 's9', commonName: 'Asiatic Lion', scientificName: 'Panthera leo persica', category: 'Mammal', classifierLabel: 'lion', conservationStatus: 'Critical' },
      { _id: 's10', commonName: 'Eurasian Owl', scientificName: 'Bubo bubo', category: 'Bird', classifierLabel: 'owl', conservationStatus: 'Healthy' },
      { _id: 's11', commonName: 'Indian Giant Squirrel', scientificName: 'Ratufa indica', category: 'Mammal', classifierLabel: 'squirrel', conservationStatus: 'Healthy' },
      { _id: 's12', commonName: 'Plains Zebra', scientificName: 'Equus quagga', category: 'Mammal', classifierLabel: 'zebra', conservationStatus: 'Healthy' }
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
  ],
  recordings: []
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

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url);
    console.log('BODY:', req.body);
    next();
});

// Route Modules
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/species', require('./routes/speciesRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/sightings', require('./routes/sightingRoutes'));
app.use('/api/recordings', require('./routes/recordingRoutes'));
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

  // Real month-over-month comparison, not fabricated percentages
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const conservationAlerts = speciesList.map(s => {
    const speciesSightings = sightingsList.filter(sg =>
      (sg.species?._id || sg.species || '').toString() === (s._id || '').toString()
    );
    const count = speciesSightings.length;

    const thisMonthCount = speciesSightings.filter(sg => new Date(sg.eventDate) >= startOfThisMonth).length;
    const lastMonthCount = speciesSightings.filter(sg =>
      new Date(sg.eventDate) >= startOfLastMonth && new Date(sg.eventDate) < startOfThisMonth
    ).length;

    let trend;
    if (lastMonthCount === 0 && thisMonthCount === 0) {
      trend = 'No data yet';
    } else if (lastMonthCount === 0) {
      trend = 'New activity this month';
    } else {
      const percentChange = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
      trend = `${percentChange >= 0 ? '+' : ''}${percentChange}% vs last month`;
    }

    // Rule-based status: low overall sighting volume flags for attention.
    // This is intentionally simple (count-based), not a predictive model.
    let statusFlag = s.conservationStatus || 'Healthy';
    if (count === 0) statusFlag = 'No sightings recorded';

    return {
      speciesId: s._id,
      commonName: s.commonName,
      scientificName: s.scientificName,
      sightingCount: count,
      statusFlag,
      trend
    };
  });

  // Real monthly aggregation from actual Sighting documents
  const sightingTrends = isMongoConnected
    ? await SightingModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$eventDate' } },
            sightings: { $sum: 1 },
            verified: { $sum: { $cond: ['$verified', 1, 0] } }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: '$_id', sightings: 1, verified: 1 } }
      ])
    : [];

  res.json({
    totalSightings,
    totalIndividuals,
    activeSpeciesCount,
    activeSitesCount: sitesCount,
    conservationAlerts,
    sightingTrends
  });
});

app.get('/', (req, res) => {
  res.send('Wildlife Intelligence System API is running');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Wildlife Intelligence API running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} occupied, starting on port 5001...`);
      app.listen(5001, () => {
          console.log(`Wildlife Intelligence API running on port 5001`);
      });
  }
  else {
    console.error('Server error:', err.message);
  }
});

setInterval(() => {}, 10000); // Keep event loop active

