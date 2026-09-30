# EcoGuard API Endpoint Specifications

## Base URL
`http://localhost:5000/api`

## Authentication Header
`Authorization: Bearer <JWT_TOKEN>`

---

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register`: Register new user (Admin, Researcher, Conservation Officer, Forest Department Officer).
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Get current authenticated user profile.
- `PATCH /api/auth/profile`: Update user profile details.
- `PATCH /api/auth/password`: Change account password.

### Species Catalog (`/api/species`)
- `GET /api/species`: List all catalogued species with conservation status and image metadata.
- `POST /api/species`: Add new species entry (Admin / Researcher).
- `GET /api/species/:id`: Retrieve single species profile.

### Sightings & Vision Intelligence (`/api/sightings`)
- `GET /api/sightings`: List sightings with site and species population filters.
- `POST /api/sightings`: Create new sighting with image upload, auto-triggering AI vision classification and alert evaluation.
- `POST /api/sightings/classify-preview`: Upload camera trap image preview to get AI species prediction, top-3 candidates, and image quality metrics.
- `PATCH /api/sightings/:id/verify`: Toggle verified status.

### Bioacoustic Recordings (`/api/recordings`)
- `GET /api/recordings`: List field audio recordings and bioacoustic predictions.
- `POST /api/recordings`: Upload audio file for YAMNet & Random Forest species classification, SNR estimate, and noise level analysis.

### Ecosystem Health Score (`/api/health-score`)
- `GET /api/health-score`: Retrieve 5-factor weighted Ecosystem Health Index score and status band.

### Reports & Export (`/api/reports`)
- `POST /api/reports/download`: Generate executive PDF report (Survey, Species Population, Biodiversity, Habitat, Conservation).
- `POST /api/reports/excel`: Export dataset to styled XLSX spreadsheet.

### Notifications & System Alerts (`/api/notifications`)
- `GET /api/notifications`: Retrieve real-time notifications filtered by severity or type.
- `POST /api/alerts/evaluate`: Manually trigger evaluation of alert rules against recent sightings.
- `PATCH /api/notifications/:id/read`: Mark notification as read.

### Incidents & Field Security (`/api/incidents`)
- `GET /api/incidents`: Retrieve field incidents.
- `POST /api/incidents`: Report new poaching threat or human-wildlife conflict incident.
- `PATCH /api/incidents/:id/status`: Update incident status (Open, Under Investigation, Resolved).
