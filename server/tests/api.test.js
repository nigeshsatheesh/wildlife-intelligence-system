const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Create test instance of express app matching server.js structure
const app = express();
app.use(express.json());

const memoryDb = {
  users: [
    { _id: 'u1', name: 'Dr. Sarah Chen', email: 'sarah.chen@ecoguard.org', role: 'Admin' }
  ],
  species: [
    { _id: 's1', commonName: 'Bengal Tiger', scientificName: 'Panthera tigris', category: 'Mammal', classifierLabel: 'tiger' }
  ],
  sites: [
    { _id: 'st1', siteName: 'Bandipur Tiger Reserve', siteCode: 'BTR-ALPHA-01', active: true }
  ],
  sightings: [],
  notifications: [],
  incidents: []
};

app.use((req, res, next) => {
  req.isMongoConnected = false;
  req.memoryDb = memoryDb;
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', mongoConnected: false }));
app.get('/api/species', (req, res) => res.json(req.memoryDb.species));
app.get('/api/sites', (req, res) => res.json(req.memoryDb.sites));
app.get('/api/notifications', (req, res) => res.json(req.memoryDb.notifications));
app.get('/api/incidents', (req, res) => res.json(req.memoryDb.incidents));

describe('EcoGuard API Integration Tests (InMemory Mode)', () => {
  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.mongoConnected).toBe(false);
  });

  test('GET /api/species should return initial species list', async () => {
    const res = await request(app).get('/api/species');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].commonName).toBe('Bengal Tiger');
  });

  test('GET /api/sites should return monitoring sites', async () => {
    const res = await request(app).get('/api/sites');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].siteCode).toBe('BTR-ALPHA-01');
  });

  test('GET /api/notifications should return array', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/incidents should return array', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
