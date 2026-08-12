const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Species = require('./models/Species');
const MonitoringSite = require('./models/MonitoringSite');

dotenv.config();

const speciesData = [
  { commonName: 'Sloth Bear', scientificName: 'Melursus ursinus', category: 'Mammal', classifierLabel: 'bear', conservationStatus: 'Vulnerable' },
  { commonName: 'Sambar Deer', scientificName: 'Rusa unicolor', category: 'Mammal', classifierLabel: 'deer', conservationStatus: 'Healthy' },
  { commonName: 'Golden Eagle', scientificName: 'Aquila chrysaetos', category: 'Bird', classifierLabel: 'eagle', conservationStatus: 'Healthy' },
  { commonName: 'Asian Elephant', scientificName: 'Elephas maximus', category: 'Mammal', classifierLabel: 'elephant', conservationStatus: 'Vulnerable' },
  { commonName: 'Red Fox', scientificName: 'Vulpes vulpes', category: 'Mammal', classifierLabel: 'fox', conservationStatus: 'Healthy' },
  { commonName: 'Leopard', scientificName: 'Panthera pardus', category: 'Mammal', classifierLabel: 'leopard', conservationStatus: 'Vulnerable' },
  { commonName: 'Asiatic Lion', scientificName: 'Panthera leo persica', category: 'Mammal', classifierLabel: 'lion', conservationStatus: 'Critical' },
  { commonName: 'Eurasian Owl', scientificName: 'Bubo bubo', category: 'Bird', classifierLabel: 'owl', conservationStatus: 'Healthy' },
  { commonName: 'Indian Giant Squirrel', scientificName: 'Ratufa indica', category: 'Mammal', classifierLabel: 'squirrel', conservationStatus: 'Healthy' },
  { commonName: 'Bengal Tiger', scientificName: 'Panthera tigris tigris', category: 'Mammal', classifierLabel: 'tiger', conservationStatus: 'Critical' },
  { commonName: 'Indian Wolf', scientificName: 'Canis lupus pallipes', category: 'Mammal', classifierLabel: 'wolf', conservationStatus: 'Vulnerable' },
  { commonName: 'Plains Zebra', scientificName: 'Equus quagga', category: 'Mammal', classifierLabel: 'zebra', conservationStatus: 'Healthy' }
];

const siteData = [
  { siteName: 'Bandipur Tiger Reserve', siteCode: 'BTR-01', habitatType: 'Forest', protectedArea: 'Bandipur National Park', location: { latitude: 11.6664, longitude: 76.6292 }, monitoringDevice: 'Camera Trap', active: true },
  { siteName: 'Kaziranga Wetland Station', siteCode: 'KZR-02', habitatType: 'Wetland', protectedArea: 'Kaziranga National Park', location: { latitude: 26.5775, longitude: 93.1711 }, monitoringDevice: 'Manual Observation', active: true }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Species.deleteMany({});
  await MonitoringSite.deleteMany({});

  // registeredBy is required on MonitoringSite — need a user ID first.
  const REPLACE_WITH_YOUR_USER_ID = '6a7b593c9741d2bc913f7a39';

  const insertedSpecies = await Species.insertMany(speciesData);
  const insertedSites = await MonitoringSite.insertMany(
    siteData.map(s => ({ ...s, registeredBy: REPLACE_WITH_YOUR_USER_ID }))
  );

  console.log(`Inserted ${insertedSpecies.length} species`);
  console.log(`Inserted ${insertedSites.length} monitoring sites`);

  console.log('\nSpecies _ids for testing:');
  insertedSpecies.forEach(s => console.log(`${s.commonName}: ${s._id}`));

  console.log('\nSite _ids for testing:');
  insertedSites.forEach(s => console.log(`${s.siteName}: ${s._id}`));

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });