# EcoGuard — Wildlife Intelligence System: Technical & Operational Deep-Dive

## Executive Summary

**EcoGuard** is an end-to-end, multi-modal **Wildlife Intelligence & Monitoring Platform** designed for conservation scientists, field researchers, forest department officials, and wildlife administrators. The platform merges conventional CRUD monitoring workflows with dual **Machine Learning microservices** for automated image species identification (via MobileNetV2) and bioacoustic audio event/species classification (via YAMNet + Google Perch 2.0).

Built as part of the **Infosys AI Springboard Internship 7.0 (Batch 2)** by **Nigesh S**, the platform features a complete MERN-stack architecture, role-based interactive dashboards, real-time biodiversity analytics (Shannon Diversity Index, Ecosystem Health Scores), GBIF occurrence data overlays, and server-side PDF report generation.

---

## Technical Stack Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               React 18 + Vite                │
                    │        (Lucide Icons, Canvas, CSS3)          │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP / REST APIs
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            Node.js / Express Server          │
                    │       (JWT Auth, Multer, PDFKit, CORS)       │
                    └───────┬──────────────────────────────┬───────┘
                            │                              │
         MongoDB Atlas / In-Memory Fallback                │ Internal HTTP Proxies
                            │                              │
             ┌──────────────┴──────────────┐               │
             ▼                             ▼               ▼
    ┌─────────────────┐           ┌────────────────────────────────┐
    │ MongoDB Schemas │           │    Flask ML Microservices      │
    │  - Species      │           ├────────────────────────────────┤
    │  - Sightings    │           │ Image Service (Port 5001):     │
    │  - Recordings   │           │   - TensorFlow / MobileNetV2   │
    │  - Sites        │           │ Audio Service (Port 5002):     │
    │  - Users        │           │   - YAMNet (1024-d)            │
    └─────────────────┘           │   - Perch 2.0 (1536-d)         │
                                  │   - scikit-learn RandomForest  │
                                  └────────────────────────────────┘
```

| Layer | Technologies & Dependencies | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Lucide-React | SPA User Interface, responsive dashboards, interactive forms |
| **Backend** | Node.js, Express, Mongoose, Multer, PDFKit, Axios | REST API gateway, authentication, data persistence, ML proxying, PDF generation |
| **Database** | MongoDB Atlas + In-Memory Fallback (`memoryDb`) | Persistent storage with hybrid offline fallback capability |
| **Image ML Microservice** | Python, Flask, TensorFlow 2.x, Pillow | Species classification from camera trap photos (MobileNetV2) |
| **Audio ML Microservice** | Python, Flask, TensorFlow Hub, librosa, scikit-learn | Bioacoustic event detection (YAMNet) & species classification (YAMNet + Perch 2.0 + RandomForest) |
| **Deployment & Ops** | Docker, Docker Compose, AWS ECS, ALB, Render, Amplify | Multi-container containerization and cloud infrastructure deployment |

---

## Machine Learning Pipelines

### 1. Image Classification Pipeline (MobileNetV2)
- **Model Architecture**: MobileNetV2 (Pre-trained on ImageNet with fine-tuned top classification layers).
- **Target Classes (12 Species)**: Bengal Tiger, African Elephant, Golden Eagle, Eurasian Wolf, Eurasian Lynx, Red Fox, Sloth Bear, Sambar Deer, Leopard, Asiatic Lion, Eurasian Owl, Indian Giant Squirrel, Plains Zebra.
- **Preprocessing**: Resized to $224 \times 224 \times 3$, normalized pixel intensities to $[0, 1]$.
- **Training Strategy**: Transfer learning with frozen base feature extractor followed by Dense + Dropout layers trained on Kaggle 12-species wildlife dataset.
- **Accuracy Achieved**: **95.83% validation accuracy**.
- **Inference Workflow**:
  1. User uploads a photo via the UI.
  2. Express receives image via `multer` (`/api/sightings/classify-preview` or `/api/sightings`).
  3. Express streams the image file to the Python Flask microservice on port 5001 (`/predict`).
  4. Flask loads model in memory, executes tensor inference, and returns JSON `{ label, confidence }`.
  5. Express matches `label` to the corresponding `Species` document in MongoDB/in-memory store to auto-fill the sighting metadata.

---

### 2. Bioacoustic & Audio Classification Pipeline (YAMNet + Perch 2.0)
- **Problem Formulation**: Simultaneous generic AudioSet event tagging and targeted 8-species bioacoustic classification.
- **Target Species (8 Species)**: Bear, Eagle, Elephant, Fox, Lion, Owl, Tiger, Wolf.
- **Feature Extraction Architecture (`audio_features.py`)**:
  - **Silence Trimming**: `librosa.effects.trim(top_db=25)` removes non-informative silent tails.
  - **Dual-Stream Resampling**:
    - $16\text{ kHz}$ stream $\to$ **YAMNet** (TensorFlow Hub) $\to 1024$-dimensional embedding.
    - $32\text{ kHz}$ stream $\to$ **Google Perch 2.0** (Kaggle Models) $\to 1536$-dimensional embedding.
  - **Feature Concatenation**: Embeddings are merged into a unified **2,560-dimensional feature vector** per 5-second audio chunk.
  - **Train/Inference Parity**: Both `train_audio.py` and `app_audio.py` import `audio_features.py`, preventing feature shape or silence-trimming mismatches.
- **Classification Engine**: `RandomForestClassifier` trained on extracted 2,560-d embeddings.
- **Data Leakage Prevention**: File-level 80/20 train/validation split performed **prior** to audio chunking/augmentation.
- **Performance & Metrics**:
  - **Chunk-level accuracy**: **71.0%** ($262/369$ chunks)
  - **Clip-level accuracy**: **80.0%** ($64/80$ clips)
  - High recall for Avian species (Eagle 100%, Owl 80%) & Elephants (90%).
  - Detailed recall & confusion matrices are tracked and reported transparently.
- **Inference Optimization**:
  - **SHA-256 In-Memory Caching**: Audio payload hashes are cached to yield $0\text{ ms}$ response times on duplicate/re-tested audio files.
  - **Salient Chunk Selection**: For multi-minute recordings, the highest RMS power chunk is selected (`max_chunks=1`) to eliminate CPU bottlenecking and inference latency.

---

## Backend Infrastructure & API Services

### Dual Database Resilience Strategy
The Express server (`server.js`) attempts connection to MongoDB Atlas upon startup. If MongoDB connection fails (e.g., offline demo or restricted network), the system gracefully switches to `req.memoryDb`—an in-memory JSON fallback store loaded with realistic seed data. This guarantees that all platform routes, UI tabs, and analytical calculations remain 100% operational in disconnected environments.

### Core API Endpoints

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | `/api/auth/register` | `POST` | User registration with BCrypt hashing and JWT generation |
| | `/api/auth/login` | `POST` | User login validation returning bearer token |
| **Species** | `/api/species` | `GET/POST` | Catalog species with conservation statuses & classifier labels |
| **Sites** | `/api/sites` | `GET/POST` | Manage monitoring stations / camera trap locations |
| **Sightings** | `/api/sightings` | `GET/POST` | Log visual species observation; triggers Image ML prediction |
| | `/api/sightings/classify-preview` | `POST` | Standalone AI image classification preview endpoint |
| **Bioacoustics** | `/api/recordings` | `GET/POST` | Upload field audio; triggers YAMNet & Perch ML prediction |
| **Analytics** | `/api/analytics` | `GET` | Aggregated sighting trends, species counts, and monthly changes |
| | `/api/analytics/biodiversity` | `GET` | Calculates Shannon Diversity Index ($H'$) and Pielou's Evenness |
| | `/api/analytics/conservation-recommendations` | `GET` | Rule-based engine flagging declining or critical species |
| | `/api/health-score` | `GET` | Multi-factor Ecosystem Health Index score computation |
| **Reports** | `/api/reports/download` | `GET` | Dynamic PDF report generator powered by `pdfkit` |

---

## Frontend Architecture & Role-Based UI Flows

The single-page application is structured with React 18, Vite, and custom CSS design tokens (`client/src/App.jsx`).

### 1. Persona-Based Dynamic Dashboards
Users can authenticate under different user roles or toggle roles live in the header badge:
1. **Researcher Dashboard**: Focuses on species observation counts, population trend graphs, field recording audio player, and biodiversity indexes.
2. **Conservation Officer Dashboard**: Emphasizes threat alerts, IUCN conservation statuses (Critical, Vulnerable), and automated action recommendations.
3. **Forest Department Dashboard**: Manages local monitoring sites, active camera traps, ranger activity logs, and real-time field alerts.
4. **Admin Dashboard**: System administration view tracking user registrations, platform database health, API connection states, and total entity counts.

### 2. Primary Navigation Views
- **Surveys & Sightings**: Complete catalog of camera trap observations with filtering, detailed map coordinates, verification controls (Admin/Officer verify flag), and species manual override/correction.
- **Bioacoustic Recording Logs**: Audio playback interface showing YAMNet event categories (Bird Call, Mammal Vocalization, Environmental Noise) alongside predicted species probability.
- **Species Intelligence Catalog**: Comprehensive species cards displaying scientific names, IUCN statuses, classification confidence metrics, and embedded GBIF species occurrence maps.
- **Monitoring Stations**: Map & grid view of physical monitoring stations, habitat types (Forest, Wetland, Grassland), and active equipment.
- **Analytics & Health Score Pages**:
  - **Biodiversity Analytics**: Visualizes Shannon Diversity Index ($H' = -\sum p_i \ln(p_i)$) and Pielou's Evenness ($E = H' / \ln(S)$) across individual monitoring sites.
  - **Ecosystem Health Index**: Displays composite score calculated from species richness, habitat fragmentation, and sighting trends.
  - **Conservation Action Center**: Displays automated high/medium/low priority field recommendations (e.g. increase patrol frequency, investigate population drop).
  - **PDF Report Exporter**: On-demand server-side streaming PDF generator producing formatted multi-page executive summaries.

---

## End-to-End User Workflows

```
                           IMAGE LOGGING WORKFLOW
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Field User  │────>│ Uploads Photo│────>│ Express API  │────>│ Flask ML     │
│ Selects Image│     │  & Metadata  │     │ Gateway      │     │ (MobileNetV2)│
└──────────────┘     └──────────────┘     └──────┬───────┘     └──────┬───────┘
                                                 │                    │
                                                 │  Returns Sighting  │ Returns Class
                                                 │  Document + Record │ & Confidence
                                                 ▼                    ▼
                                          ┌──────────────────────────────────┐
                                          │ Saved to DB & Rendered on UI     │
                                          │ - Sightings Feed                 │
                                          │ - Population Analytics Engine    │
                                          │ - PDF Executive Report           │
                                          └──────────────────────────────────┘
```

```
                        BIOACOUSTIC AUDIO WORKFLOW
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Field User   │────>│ Uploads WAV/ │────>│ Express API  │────>│ SHA-256 Hash │
│ Selects Audio│     │ MP3 Audio    │     │ Gateway      │     │ Cache Check  │
└──────────────┘     └──────────────┘     └──────┬───────┘     └──────┬───────┘
                                                 │                    │ (Cache Miss)
                                                 │                    ▼
                                                 │            ┌──────────────┐
                                                 │            │ Flask ML     │
                                                 │            │ (YAMNet +    │
                                                 │            │  Perch 2.0)  │
                                                 │            └──────┬───────┘
                                                 │                   │
                                                 │  Returns Events   │ Returns
                                                 │  & Categories     │ Species Rec
                                                 ▼                   ▼
                                          ┌──────────────────────────────────┐
                                          │ Saved to DB & Rendered on UI     │
                                          │ - Bioacoustics Player View       │
                                          │ - Acoustic Event Breakdown       │
                                          │ - Ecosystem Health Score Input   │
                                          └──────────────────────────────────┘
```

---

## Deployment & Containerization

### Docker Configuration
- `docker-compose.yml` orchestrates 4 services:
  1. `client`: Built with Node, served via `nginx` on port 80.
  2. `server`: Node.js Express server on port 5000.
  3. `ml-image`: Python Flask MobileNetV2 container on port 5001.
  4. `ml-audio`: Python Flask YAMNet + Perch container on port 5002.

### Cloud Infrastructure (`aws/`)
- **AWS ALB Routing Rules (`alb-routing-rules.json`)**: Directs traffic matching `/api/*` to the Node backend container and root paths to the Nginx frontend.
- **ECS Task Definitions (`task-definition-backend.json`, `task-definition-ml.json`)**: Configured container definitions, memory allocations, environment variables, and health checks for AWS Elastic Container Service (ECS).

---

## Project Structure Reference

```
wildlife-intelligence-system/
├── client/                     # React 18 SPA Frontend (Vite)
│   ├── src/
│   │   ├── components/         # 20+ UI views, dashboards, and modals
│   │   ├── utils/              # Image resolvers and static mapping utilities
│   │   ├── App.jsx             # Main router, auth state, and layout shell
│   │   └── main.jsx            # React root DOM entrypoint
│   ├── Dockerfile              # Production Nginx image build
│   └── package.json            # Client dependencies
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # DB connection logic
│   ├── controllers/            # Sighting, Recording, Species, Report, Health controllers
│   ├── middleware/             # Auth (JWT) & Upload (Multer) middleware
│   ├── models/                 # Mongoose schemas (Species, Sighting, Recording, Site, User)
│   ├── routes/                 # Express API routes
│   ├── services/               # Population, Habitat, and Health Score computation services
│   ├── uploads/                # Local file storage for images and audio
│   ├── server.js               # Main Express entrypoint & in-memory fallback store
│   └── Dockerfile              # Backend container build
│
├── ml-service/                 # Python Machine Learning Microservices
│   ├── audio_features.py       # Shared YAMNet + Perch 2.0 feature extraction module
│   ├── app.py                  # Image Classifier microservice (MobileNetV2, port 5001)
│   ├── app_audio.py            # Audio Classifier microservice (YAMNet + Perch, port 5002)
│   ├── train.py                # Image model training script
│   ├── train_audio.py          # Bioacoustic model training script
│   ├── class_labels.json       # Image class label map
│   ├── Dockerfile.image        # Image service container build
│   └── Dockerfile.audio        # Audio service container build
│
├── aws/                        # Cloud Deployment Configurations
│   ├── alb-routing-rules.json  # AWS Application Load Balancer path rules
│   ├── task-definition-backend.json
│   └── task-definition-ml.json
│
├── scripts/                    # Helper & dataset utility scripts
│   ├── copy_species_images.js  # Static image copying utility
│   ├── fetch_gbif.py           # GBIF API occurrence fetching script
│   ├── split_dataset.py        # Dataset partitioner
│   └── validate_audio_dataset.py
│
├── docker-compose.yml          # Container orchestration file
└── README.md                   # Core project documentation
```
