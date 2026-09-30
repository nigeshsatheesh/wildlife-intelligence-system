# EcoGuard — Wildlife Population Intelligence System
## Release & Requirement Gap Closure Changelog

### Version 2.0.0 (Phase 1 – 9 Completion)

#### Phase 1: Notifications & Alerts System
- Added `Notification` schema, `alertService`, and `/api/notifications` endpoints.
- Integrated automated alert evaluation triggered by endangered species sightings or population drop trends.
- Added live unread notification badge and notification drawer dropdown to UI header.
- Updated `AlertsPage` with severity left-border accent styling (`#ef4444`, `#f59e0b`, `#3b82f6`) and filtering.

#### Phase 2: PDF & Excel Reporting Engine
- Extended `reportController` to support 5 distinct report types (*Survey*, *Species Population*, *Biodiversity*, *Habitat*, *Conservation*).
- Added multi-format export for both PDF (`pdfkit`) and Excel (`exceljs`).
- Created dedicated interactive report cards on `ReportsPage`.

#### Phase 3: Ecosystem Health Score Engine Alignment
- Refactored Ecosystem Health Index to exact 5-factor weighted formula:
  $$\text{Score} = \text{SpeciesDiversity}\times 0.30 + \text{PopulationStability}\times 0.25 + \text{HabitatQuality}\times 0.20 + \text{EndangeredStatus}\times 0.15 + \text{EnvironmentalConditions}\times 0.10$$
- Added `EnvironmentReading` schema and site-level submission modal on `SitesListPage`.
- Updated `HealthScorePage` with 5 factor progress meters, formula display box, and status band legend.

#### Phase 4: Surveys, Camera Traps & Profile Management
- Added `Survey` and `Device` schemas and endpoints (`/api/surveys`, `/api/devices`).
- Extended `MonitoringSite` with `protectedArea` and `areaKm2`.
- Added Profile Modal in UI header with account details and password change capabilities.

#### Phase 5: Image & Audio ML Microservice Intelligence
- Updated `ml-service/app.py` with image quality metrics (`blur`, `brightness`, `resolution`), unknown species detection, and top-3 candidate probabilities.
- Updated `ml-service/app_audio.py` with signal-to-noise ratio (`snrEstimate`) and noise level (`noiseLevelDb`).
- Updated `SightingLogForm` preview UI to display image quality chips, top-3 candidates, and unknown warnings.
- Updated `RecordingsListPage` table with audio signal quality chips.
- Harmonized exact 12 classifier species across frontend and backend seeds.

#### Phase 6: Population, Habitat & Conservation Engines
- Added population density calculations with site fallback area and species movement tracking across sites.
- Added interactive Leaflet (`react-leaflet`) Species Distribution Map to `PopulationPage`.
- Enhanced `habitatService` with `suitabilityScore` (0-100) and `degradationRisk` metrics.
- Added 5 categorized action tabs (*Priority*, *Habitat Restoration*, *Protection Strategy*, *Monitoring Optimization*, *Resource Allocation*) to `AlertsPage`.

#### Phase 7: Dashboard Completion & Field Incident Security
- Created `Incident` model, `incidentController`, and `/api/incidents` routes for reporting poaching threats and human-wildlife conflict.
- Exported `requireRole` RBAC authorization middleware.
- Enhanced `ForestDepartmentDashboard` with Patrol Planner, Wildlife Movement, and Incident Management reporting modal.

#### Phase 8: Testing, Benchmarking & CI/CD Pipelines
- Added Jest + Supertest API test suite (`server/tests/api.test.js`).
- Added Pytest ML test suite (`ml-service/test_ml.py`).
- Added `HEALTHCHECK` directives for all 4 containers in `docker-compose.yml`.
- Created Postman collection `docs/EcoGuard.postman_collection.json`.
- Created HTTP load testing benchmark script `scripts/benchmark.js`.
- Created GitHub Actions CI pipeline `.github/workflows/ci.yml`.

#### Phase 9: System Documentation & Harmonization
- Created comprehensive documentation suite in `docs/`: `ARCHITECTURE.md`, `API.md`, `USER_GUIDE.md`, `TESTING.md`, `PERFORMANCE.md`, `DEPLOYMENT.md`, and `CHANGELOG.md`.
