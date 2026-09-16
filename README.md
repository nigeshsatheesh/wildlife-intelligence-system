# EcoGuard — Wildlife Intelligence System

An AI-powered wildlife monitoring platform combining a full MERN stack web application with Python/Flask machine learning microservices for species identification, bioacoustic detection, and population analytics.

Built as part of the **Infosys AI Springboard Internship 7.0 (Batch 2)**.

---

## Overview

EcoGuard helps wildlife researchers and conservation teams log, classify, and analyze species observations using both **image** and **audio** data. It combines a conventional CRUD-based web app with two independent ML microservices — an image classifier and a bioacoustic species classifier — and surfaces the results through analytics dashboards and exportable PDF reports.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| ML Services | Python, Flask |
| Image Classification | TensorFlow (MobileNetV2) |
| Audio Classification | TensorFlow Hub (YAMNet + Google Perch 2.0), scikit-learn (RandomForest) |
| Reports | pdfkit (server-side PDF generation) |
| Deployment | Docker |

---

## Project Status: All Milestones Complete ✅

### Milestone 1 — Foundation (Auth & Core CRUD)
- User authentication (JWT-based) with secure password hashing
- Full CRUD for wildlife observation records
- MongoDB Atlas integration with schema validation

### Milestone 2 — Image Intelligence
- Image-based species classifier using **MobileNetV2**, trained on a 12-species Kaggle dataset
- Achieved **95.83% validation accuracy**
- `/classify-preview` endpoint to correctly populate the species dropdown from live classifier output (fixing an earlier default-value bug)

### Milestone 3 — Analytics & Reporting
- Bioacoustic event detection using **YAMNet**
- Population analytics engines (trends, distribution, occurrence overlays via the GBIF API)
- Server-side PDF report generation with pdfkit
- Consolidated duplicate/parallel analytics implementations into a single engine

### Milestone 4 — Bioacoustic Species Classification & Deployment
- Combined **YAMNet + Google Perch 2.0** embeddings (1024-d + 1536-d = **2560-d feature vector**) feeding a RandomForest species classifier across 8 species: bear, eagle, elephant, fox, lion, owl, tiger, wolf
- File-level train/validation split (80/20) performed **before** augmentation to prevent data leakage
- **Validation results:**
  - Chunk-level accuracy: **71.0%** (262/369 chunks)
  - Clip-level accuracy: **80.0%** (64/80 clips)
- Full Docker containerization of the web app and both ML services
- Production layout bug fixed (`min-width: 0` on flex container preventing content clipping)

---

## Bioacoustic Classifier — Detailed Results

| Species | Precision | Recall | F1-Score |
|---|:---:|:---:|:---:|
| Eagle | 1.00 | 1.00 | 1.00 |
| Owl | 1.00 | 0.80 | 0.89 |
| Elephant | 1.00 | 0.90 | 0.95 |
| Wolf | 0.90 | 0.90 | 0.90 |
| Fox | 0.69 | 0.90 | 0.78 |
| Lion | 0.70 | 0.70 | 0.70 |
| Tiger | 0.50 | 0.80 | 0.62 |
| Bear | 1.00 | 0.40 | 0.57 |

### Known Limitations (reported honestly, not smoothed over)

- **Validation set is small** — 10 clips per species. Each individual clip is worth 10 percentage points of recall, so per-species numbers should be read as directional, not precise.
- **Perch domain mismatch**: Google Perch 2.0 is pre-trained primarily on bird vocalizations (Xeno-canto). This produces strong separation for Eagle and Owl but limited benefit for mammal species, whose classification still relies mainly on YAMNet.
- **Bear/Tiger confusion is asymmetric and diffuse**: Bear clips are frequently misclassified as Tiger (5/10), driven by spectral overlap in low-frequency growls (~100–400 Hz) rather than a single confusable pair. Bear embeddings show low intra-class separation rather than a specific mislabeling pattern.
- **Some training data is synthetic (stock SFX)**, not field-recorded audio. This is a larger driver of overall accuracy ceiling than the model architecture itself, and remains the top priority for further improvement.
- Numbers reported here are the actual measured results from the validation run — not adjusted or rounded up.

---

## Architecture

```
wildlife-intelligence-system/
├── client/              # React 18 + Vite frontend
├── server/              # Node.js + Express backend, MongoDB models/routes
├── ml-service/           # Python Flask ML microservices
│   ├── audio_features.py    # Shared YAMNet + Perch feature extraction (train/inference parity)
│   ├── train_audio.py       # Bioacoustic species classifier training
│   ├── app_audio.py         # Audio classification serving endpoint (port 5002)
│   ├── train_image.py       # Image classifier training
│   └── app_image.py         # Image classification serving endpoint (port 5001)
└── docker-compose.yml
```

---

## Setup

```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run dev

# ML Services
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app_image.py          # port 5001
python app_audio.py          # port 5002
```

### Docker

```bash
docker-compose up --build
```

---

## Data Sources

- **Image dataset**: Kaggle (12 species)
- **Audio dataset**: Field/library recordings across 8 species (bear, eagle, elephant, fox, lion, owl, tiger, wolf)
- **Occurrence data**: GBIF API

---

## Author

**Nigesh S**
B.Tech, Artificial Intelligence & Data Science
Infosys AI Springboard Internship 7.0 — Batch 2

GitHub: [github.com/nigeshsatheesh/wildlife-intelligence-system](https://github.com/nigeshsatheesh/wildlife-intelligence-system)