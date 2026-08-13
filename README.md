# 🍃EcoGuard Wildlife Population Intelligence System

An AI-powered wildlife monitoring platform for logging animal sightings, classifying species from camera trap photos via a real trained image classifier, detecting acoustic events from field audio recordings, and tracking population trends — built as a scoped-down, solo-feasible version of a larger original specification.

## Tech Stack

- **Backend:** Node.js / Express (port 5000), MongoDB Atlas + Mongoose
- **Frontend:** React 18 + Vite (port 5175), Tailwind-style CSS, Lucide icons
- **Image Classification microservice:** Python Flask (port 5001), TensorFlow, MobileNetV2 transfer learning, trained on 12 wildlife species
- **Bioacoustic microservice:** Python Flask (port 5002), TensorFlow Hub YAMNet (pretrained on AudioSet)
- **Auth:** JWT, bcrypt password hashing, role-based access (Researcher / Admin)

## Scope note

This project intentionally scopes down from a much larger original specification (bioacoustics as a full species-level system, drone/satellite imagery, GIS/GDAL mapping, habitat intelligence, Kubernetes deployment, OAuth2, multi-region microservices). Given a solo developer and a realistic timeline, those items were either cut entirely or reduced to an honestly-scoped version. Where something is a simplified/partial version of the original spec, that's noted explicitly below rather than presented as fully equivalent.

---

## Milestone 1 (Weeks 1–2): Project Initialization, Species Recognition & Biodiversity Analysis

**Status: Complete**

- [x] Project scope defined and documented (`docs/scope.md`)
- [x] 4 Mongoose schemas designed and implemented: `User`, `Species`, `MonitoringSite`, `Sighting`
- [x] Real dataset collection: 12-species image subset from Kaggle (Animal Image Dataset), cleaned and split 80/20 train/validation (48/12 images per class)
- [x] Real occurrence data collected from the GBIF public API to inform schema design
- [x] MongoDB Atlas connected; JWT authentication implemented and verified (real bcrypt hashing, confirmed rejection of incorrect passwords)
- [x] Full CRUD APIs: Species, MonitoringSite, Sighting, with role-based access control (`protect` + `authorize` middleware)
- [x] Image upload via Multer, wired to a **real trained image classifier** — MobileNetV2 transfer learning on the 12-species dataset, **95.83% validation accuracy**
- [x] Node backend to Flask ML service integration verified end-to-end: real photo upload, real model inference, real prediction saved to MongoDB with correct species/site references
- [x] Full flow re-verified through the actual React UI (not just API testing tools): login, upload sighting photo, real AI prediction displayed, persisted and visible in Sightings list and dashboards
- [x] Analytics endpoint computes real metrics from actual MongoDB data (total sightings, individuals, species/site counts, month-over-month trend comparison) — no hardcoded/fabricated numbers
- [x] Role-gated authentication flow (unauthenticated users cannot reach the app shell)
- [x] 12 species and 2 monitoring sites seeded with real reference data

**Known limitations / honest caveats:**
- Validation accuracy (95.83%) is based on a small validation set (12 images/class) — a real, legitimate number, but should be read as directional given the sample size.
- Admin user-management list depends on a working `/api/users` endpoint with correct role authorization — verify this is functioning in your deployment before a live demo.

---

## Milestone 2 (Weeks 3–4): Bioacoustic Recognition & Biodiversity Intelligence

**Status: In progress**

- [x] `Recording` schema + full CRUD (`recordingController.js`, `recordingRoutes.js`)
- [x] Bioacoustic microservice built on real pretrained YAMNet (Google, trained on AudioSet, 521 general sound event classes) — **general acoustic event detection is real and verified**, correctly distinguishing different real audio inputs (e.g., music vs. dial tone vs. "Roaring cats (lions, tigers)" for an actual tiger roar clip)
- [x] Frontend recording upload/playback/list flow built and tested end-to-end through the real UI
- [ ] **Species-level audio classification** (e.g., identifying "Bengal Tiger" specifically, not just general "Roar"/"Growling" categories): in progress. Approach: a lightweight classifier trained on top of frozen YAMNet embeddings (transfer learning, same principle as the image model), using real labeled clips sourced from free sound libraries (Pixabay, Freesound). **Data availability is a genuine constraint** — species-specific labeled animal call recordings are far scarcer than labeled images, especially for mammals. Expect this to cover a reduced subset of species (not all 12), and to be a smaller-sample prototype rather than a rigorously validated classifier.
- [ ] Biodiversity Index engine (Shannon Diversity Index) — backend endpoint written (`/api/analytics/biodiversity`), computes real species richness and evenness from actual sighting data; **not yet wired into the Dashboard/Reports UI**.
- [ ] Wire biodiversity metrics into Dashboard/Reports pages

**What was deliberately not pursued:**
- Full species-level bioacoustic classification with production-grade accuracy — not achievable within project timeline given real data scarcity for wildlife call recordings. General event detection (a real, working, defensible feature) is the honest scope here instead.

---

## Explicitly out of scope (from the original specification)

These were part of the original project brief but cut for a realistic solo 3-4 week build:

- Drone/satellite imagery integration
- GIS/GDAL/QGIS habitat mapping
- Full Habitat Intelligence and Conservation Recommendation "engines"
- OAuth2 login
- Kubernetes / multi-region cloud deployment
- Multi-service microservices architecture beyond the 3 services actually built (Node API, image classifier, audio classifier)

## Running the project locally

Three services must run simultaneously:
```
# Terminal 1 - backend API
cd server && node server.js          # port 5000

# Terminal 2 - image classifier
cd ml-service && venv\Scripts\activate && python app.py       # port 5001

# Terminal 3 - bioacoustic classifier
cd ml-service && venv\Scripts\activate && python app_audio.py # port 5002

# Terminal 4 - frontend
cd client && npm run dev             # port 5175
```

Seed reference data (12 species, 2 monitoring sites) with `node server/seed.js` (requires a valid MongoDB user `_id` - see script comments).
