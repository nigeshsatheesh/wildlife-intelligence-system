# EcoGuard — Wildlife Intelligence System

An AI-powered wildlife monitoring platform combining a full **MERN stack web application** with **Python/Flask machine learning microservices** for species identification, bioacoustic detection, population analytics, and automated reporting.

Built as part of the **Infosys AI Springboard Internship 7.0 — Batch 2**.

---

## Overview

**EcoGuard** helps wildlife researchers and conservation teams record, classify, and analyze wildlife observations using both **image** and **audio** data.

The platform combines a conventional CRUD-based web application with independent machine learning services for:

* Image-based species classification
* Bioacoustic species identification
* Wildlife population analytics
* Geographic occurrence analysis
* Automated PDF report generation

The system follows a distributed cloud architecture, with the frontend, backend, database, and machine-learning inference services deployed independently.

---

## Tech Stack

| Layer                | Technology                                                            |
| -------------------- | --------------------------------------------------------------------- |
| Frontend             | React 18, Vite                                                        |
| Backend              | Node.js, Express                                                      |
| Database             | MongoDB Atlas                                                         |
| ML Services          | Python, Flask                                                         |
| Image Classification | TensorFlow, MobileNetV2                                               |
| Audio Classification | TensorFlow Hub — YAMNet + Google Perch 2.0, scikit-learn RandomForest |
| Population Analytics | GBIF API                                                              |
| Reports              | pdfkit                                                                |
| Containerization     | Docker                                                                |
| Frontend Deployment  | AWS Amplify                                                           |
| Backend Deployment   | Render                                                                |
| ML Deployment        | Google Cloud Run                                                      |
| Database Hosting     | MongoDB Atlas                                                         |

---

## Project Status: All Milestones Complete ✅

### Milestone 1 — Foundation: Authentication & Core CRUD

* JWT-based user authentication
* Secure password hashing
* User registration and login
* Full CRUD operations for wildlife observation records
* MongoDB Atlas integration
* Schema-based validation for application data

---

### Milestone 2 — Image Intelligence

* Developed an image-based wildlife species classifier using **MobileNetV2**
* Trained using a **12-species Kaggle dataset**
* Achieved **95.83% validation accuracy**
* Integrated image classification with the main application
* Implemented the `/classify-preview` endpoint to populate the species dropdown using live model output
* Fixed an earlier issue where the species dropdown could retain an incorrect default value

---

### Milestone 3 — Analytics & Reporting

* Integrated bioacoustic event detection using **YAMNet**
* Developed wildlife population analytics functionality
* Added population trend analysis
* Added species distribution analysis
* Added occurrence overlays using the **GBIF API**
* Implemented server-side PDF report generation using **pdfkit**
* Consolidated duplicate and parallel analytics implementations into a single analytics engine

---

### Milestone 4 — Bioacoustic Species Classification & Cloud Deployment

* Developed a dedicated bioacoustic species classifier
* Combined embeddings from:

  * **YAMNet — 1024 dimensions**
  * **Google Perch 2.0 — 1536 dimensions**
* Combined embeddings produce a **2560-dimensional feature vector**
* Used a **RandomForest classifier** for final species prediction
* Classifier supports 8 wildlife species:

  * Bear
  * Eagle
  * Elephant
  * Fox
  * Lion
  * Owl
  * Tiger
  * Wolf
* Performed a file-level **80/20 train-validation split before augmentation**
* Prevented augmented versions of the same recording from appearing in both training and validation datasets
* Containerized the application using Docker
* Deployed the frontend using **AWS Amplify**
* Deployed the Node.js/Express backend using **Render**
* Deployed Python/Flask ML inference services using **Google Cloud Run**
* Used **MongoDB Atlas** as the production cloud database
* Fixed a production layout issue using `min-width: 0` on the flex container to prevent content clipping

---

## Bioacoustic Classifier — Detailed Results

### Overall Validation Results

| Metric               |        Result |
| -------------------- | ------------: |
| Chunk-level Accuracy |     **71.0%** |
| Correct Chunks       | **262 / 369** |
| Clip-level Accuracy  |     **80.0%** |
| Correct Clips        |   **64 / 80** |

### Per-Species Results

| Species  | Precision | Recall | F1-Score |
| -------- | --------: | -----: | -------: |
| Eagle    |      1.00 |   1.00 |     1.00 |
| Owl      |      1.00 |   0.80 |     0.89 |
| Elephant |      1.00 |   0.90 |     0.95 |
| Wolf     |      0.90 |   0.90 |     0.90 |
| Fox      |      0.69 |   0.90 |     0.78 |
| Lion     |      0.70 |   0.70 |     0.70 |
| Tiger    |      0.50 |   0.80 |     0.62 |
| Bear     |      1.00 |   0.40 |     0.57 |

---

## Known Limitations

The reported validation results are the actual measured results from the model evaluation and have not been adjusted or artificially increased.

* **Small validation dataset**
  The validation set contains 10 clips per species. Each incorrectly classified clip therefore affects recall by approximately 10 percentage points. Per-species metrics should therefore be interpreted as directional rather than highly precise estimates.

* **Perch domain mismatch**
  Google Perch 2.0 is primarily trained on bird vocalizations. It provides strong feature separation for species such as Eagle and Owl but provides less benefit for mammal classification. Mammal predictions rely more heavily on YAMNet features.

* **Bear and Tiger confusion**
  Bear recordings are frequently misclassified as Tiger. This appears to be associated with overlapping low-frequency acoustic characteristics, particularly growls in approximately the **100–400 Hz** range.

* **Low Bear intra-class separation**
  Bear embeddings demonstrate relatively weak separation within the feature space rather than one single consistent confusion pair.

* **Synthetic training audio**
  Some training samples originate from stock sound-effect recordings rather than natural field recordings. This remains one of the largest limitations affecting the classifier's ability to generalize to real-world wildlife recordings.

* **Future dataset improvements**
  Replacing synthetic samples with larger quantities of high-quality field recordings is expected to provide a greater improvement than increasing model complexity alone.

---

## System Architecture

```text
                         ┌──────────────────────┐
                         │      End User        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     AWS Amplify      │
                         │                      │
                         │   React + Vite UI    │
                         └──────────┬───────────┘
                                    │
                              HTTPS / REST
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Render         │
                         │                      │
                         │ Node.js + Express API│
                         └───────┬──────┬───────┘
                                 │      │
                      ┌──────────┘      └──────────┐
                      │                            │
                      ▼                            ▼
           ┌─────────────────────┐      ┌─────────────────────┐
           │  Google Cloud Run   │      │    MongoDB Atlas    │
           │                     │      │                     │
           │ Image ML Service    │      │ Users               │
           │ Audio ML Service    │      │ Observations        │
           │ Python + Flask      │      │ Classification Data │
           │                     │      │ Analytics Data      │
           └─────────────────────┘      └─────────────────────┘
```

---

## Cloud Deployment

EcoGuard uses a distributed cloud deployment model where each major component can be scaled and maintained independently.

| Component   | Platform         | Purpose                                                |
| ----------- | ---------------- | ------------------------------------------------------ |
| Frontend    | AWS Amplify      | Hosts and builds the React + Vite application          |
| Backend API | Render           | Hosts the Node.js + Express REST API                   |
| ML Services | Google Cloud Run | Hosts containerized Python/Flask ML inference services |
| Database    | MongoDB Atlas    | Stores application and wildlife observation data       |

### Deployment Flow

```text
React + Vite
     │
     ▼
AWS Amplify
     │
     │ HTTPS / REST
     ▼
Node.js + Express
     │
     ▼
   Render
     │
     ├───────────────────────────┐
     │                           │
     ▼                           ▼
Google Cloud Run           MongoDB Atlas
     │
     ├── Image Classifier
     │
     └── Audio Classifier
```

The frontend communicates with the REST API hosted on **Render**.

The backend handles:

* Authentication
* User management
* Wildlife observation management
* Database operations
* Analytics
* Report generation
* ML inference requests

Machine-learning inference requests are forwarded by the backend to the appropriate **Google Cloud Run** service.

This separation allows the ML services to have their own CPU and memory configuration without coupling their runtime requirements to the main MERN application.

---

## Project Structure

```text
wildlife-intelligence-system/
│
├── client/
│   ├── src/
│   ├── public/
│   └── ...
│
│   # React 18 + Vite frontend
│   # Production deployment: AWS Amplify
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── ...
│
│   # Node.js + Express REST API
│   # MongoDB models and backend services
│   # Production deployment: Render
│
├── ml-service/
│   │
│   ├── audio_features.py
│   │   # Shared YAMNet + Perch feature extraction
│   │   # Ensures training/inference feature parity
│   │
│   ├── train_audio.py
│   │   # Bioacoustic species classifier training
│   │
│   ├── app_audio.py
│   │   # Audio classification Flask service
│   │
│   ├── train_image.py
│   │   # Image classifier training
│   │
│   └── app_image.py
│       # Image classification Flask service
│
│   # Production deployment: Google Cloud Run
│
├── docker-compose.yml
│   # Local container orchestration
│
└── README.md
```

---

## Machine Learning Architecture

### Image Classification

The image classification pipeline uses **MobileNetV2** with TensorFlow.

```text
Wildlife Image
      │
      ▼
Image Preprocessing
      │
      ▼
MobileNetV2
      │
      ▼
Species Probability Distribution
      │
      ▼
Predicted Species
```

The model was trained using a 12-species wildlife dataset and achieved:

```text
Validation Accuracy: 95.83%
```

---

## Bioacoustic Classification

The audio classifier uses two independent embedding models.

### YAMNet

YAMNet produces a:

```text
1024-dimensional embedding
```

It provides general-purpose audio representations useful for environmental and wildlife sounds.

### Google Perch 2.0

Google Perch 2.0 produces a:

```text
1536-dimensional embedding
```

It provides additional acoustic representations, particularly useful for bird vocalizations.

### Combined Feature Vector

```text
YAMNet Embedding
     1024-d
        │
        ├──────────────┐
        │              │
        ▼              │
                      CONCAT
        ▲              │
        │              │
Perch Embedding        │
     1536-d            │
        │              │
        └──────────────┘
               │
               ▼
       2560-d Feature Vector
               │
               ▼
        RandomForest
               │
               ▼
       Species Prediction
```

The final classifier predicts one of eight supported species.

---

## Supported Bioacoustic Species

| Species  |
| -------- |
| Bear     |
| Eagle    |
| Elephant |
| Fox      |
| Lion     |
| Owl      |
| Tiger    |
| Wolf     |

---

## Population Analytics

EcoGuard includes analytics tools for examining wildlife observations and population patterns.

The analytics module provides:

* Observation counts
* Species distribution
* Population trend visualization
* Geographic distribution
* Temporal observation patterns
* Species occurrence information
* GBIF occurrence overlays
* Wildlife observation summaries

---

## GBIF Integration

EcoGuard integrates with the **Global Biodiversity Information Facility — GBIF API** to retrieve external species occurrence records.

GBIF data can be combined with user-submitted observations to provide additional geographic context for wildlife occurrence and distribution.

```text
EcoGuard Observations
        │
        ├───────────────┐
        │               │
        ▼               ▼
Local Database       GBIF API
        │               │
        └───────┬───────┘
                ▼
       Occurrence Analysis
                │
                ▼
        Analytics Dashboard
```

---

## PDF Reporting

EcoGuard can generate server-side PDF reports using **pdfkit**.

Reports can include information such as:

* Wildlife observation summaries
* Species information
* Population analytics
* Classification results
* Distribution statistics

PDF generation is handled by the backend rather than the browser.

---

## Local Setup

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python
* pip
* MongoDB connection credentials
* Git
* Docker — optional

---

### Clone the Repository

```bash
git clone https://github.com/nigeshsatheesh/wildlife-intelligence-system.git

cd wildlife-intelligence-system
```

---

### Backend

```bash
cd server

npm install

npm start
```

The backend will start using the configured environment variables and MongoDB connection.

---

### Frontend

Open another terminal:

```bash
cd client

npm install

npm run dev
```

Vite will start the local development server.

---

### ML Services

Open another terminal:

```bash
cd ml-service
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```bash
venv\Scripts\activate
```

For Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the image classification service:

```bash
python app_image.py
```

Run the audio classification service:

```bash
python app_audio.py
```

---

## Docker

The project also supports containerized development and deployment.

```bash
docker-compose up --build
```

Docker is used to provide reproducible environments and package the machine-learning services for deployment.

The ML service containers are deployed to **Google Cloud Run** for production inference.

---

## Production Infrastructure

```text
┌─────────────────────────────────────────────┐
│                 EcoGuard                    │
└─────────────────────────────────────────────┘

          Frontend
             │
             ▼
      AWS Amplify
             │
             ▼
       Render API
        /       \
       /         \
      ▼           ▼
Google Cloud    MongoDB
    Run          Atlas
      │
  ┌───┴───┐
  ▼       ▼
Image    Audio
Model    Model
```

### AWS Amplify

Used to host the production **React + Vite frontend**.

### Render

Used to host the production **Node.js + Express backend**.

### Google Cloud Run

Used to host the containerized **Python/Flask ML services**.

The image and bioacoustic classifiers operate independently from the main application backend.

### MongoDB Atlas

Used as the production cloud database for storing persistent application data.

---

## Data Sources

### Image Dataset

* Kaggle wildlife image dataset
* 12 species used for image classification training

### Audio Dataset

Audio recordings across eight species:

* Bear
* Eagle
* Elephant
* Fox
* Lion
* Owl
* Tiger
* Wolf

The dataset contains a combination of wildlife recordings and library/stock recordings.

### Occurrence Data

External occurrence records are retrieved using the:

**GBIF API — Global Biodiversity Information Facility**

---

## Key Features

* Secure JWT authentication
* Wildlife observation CRUD operations
* Image-based species recognition
* Bioacoustic wildlife classification
* Multi-model audio embeddings
* Population analytics
* Species distribution analytics
* GBIF occurrence integration
* PDF report generation
* MongoDB Atlas database
* Docker-based containerization
* Distributed cloud architecture
* AWS Amplify frontend deployment
* Render backend deployment
* Google Cloud Run ML deployment

---

## Model Performance Summary

| Model                         | Task                         | Validation Performance |
| ----------------------------- | ---------------------------- | ---------------------- |
| MobileNetV2                   | Image Species Classification | **95.83% accuracy**    |
| YAMNet + Perch + RandomForest | Audio Chunk Classification   | **71.0% accuracy**     |
| YAMNet + Perch + RandomForest | Audio Clip Classification    | **80.0% accuracy**     |

---

## Future Improvements

Potential improvements to EcoGuard include:

* Expand the wildlife image dataset
* Replace synthetic audio samples with field-recorded wildlife audio
* Increase the bioacoustic validation dataset
* Improve mammal-specific audio embeddings
* Add more supported wildlife species
* Improve geographic analytics
* Add real-time acoustic monitoring
* Support continuous microphone-based wildlife detection
* Add automated alerts for endangered or rare species
* Improve model explainability
* Add confidence-based prediction filtering
* Introduce automated model retraining pipelines
* Add more advanced population forecasting
* Integrate additional biodiversity data sources

---

## Repository

**GitHub:**
https://github.com/nigeshsatheesh/wildlife-intelligence-system

---

## Acknowledgements

This project was developed as part of the:

**Infosys AI Springboard Internship 7.0 — Batch 2**

Technologies and datasets used in the project include:

* TensorFlow
* TensorFlow Hub
* MobileNetV2
* YAMNet
* Google Perch 2.0
* scikit-learn
* React
* Vite
* Node.js
* Express
* MongoDB Atlas
* GBIF
* AWS Amplify
* Render
* Google Cloud Run
* Docker

---

## License

This project was developed for educational and internship purposes.

---

## Author

**Nigesh Satheesh**

Wildlife Intelligence System
Infosys AI Springboard Internship 7.0 — Batch 2
