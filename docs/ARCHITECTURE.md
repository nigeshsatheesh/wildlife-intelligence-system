# EcoGuard — Wildlife Population Intelligence System
## System Architecture & Technical Specifications

```
                     +--------------------------------------------------+
                     |                React 19 Client UI                |
                     |  (Vite + Chart.js + Leaflet + Lucide Icons)     |
                     +------------------------+-------------------------+
                                              |
                                     HTTP / REST API (JWT)
                                              v
                     +--------------------------------------------------+
                     |                Express Node.js API               |
                     |    (Dual Mode: MongoDB Atlas / In-Memory Store)  |
                     +------------+------------------------+------------+
                                  |                        |
                   HTTP POST /predict            HTTP POST /predict
                                  v                        v
            +-----------------------------+  +-----------------------------+
            |    ML Vision Microservice   |  |   ML Audio Microservice     |
            | (Flask + MobileNetV2 / CNN) |  | (Flask + YAMNet / Librosa)  |
            +-----------------------------+  +-----------------------------+
```

### Core Architecture Components

1. **Client Tier (`client/`)**
   - **Framework**: React 19 SPA built with Vite.
   - **Styling & UI**: Custom Ecological Modernism design system (`index.css`) with CSS custom properties.
   - **Visualization**: Chart.js (`react-chartjs-2`), Leaflet (`react-leaflet`) for interactive species distribution maps, and Lucide Icons.

2. **Server API Tier (`server/`)**
   - **Framework**: Express.js REST API with JWT bearer authentication.
   - **Dual-Store Architecture**: Seamless fallback between Cloud MongoDB Atlas and `req.memoryDb` in-memory database store.
   - **Ecosystem Engine**: Real-time evaluation of Ecosystem Health Score ($\text{Score} = \sum \text{Weights} \times \text{Factors}$), rule-based notification triggers, and report generation (PDF via `pdfkit`, Excel via `exceljs`).

3. **ML Vision Microservice (`ml-service/app.py`)**
   - **Framework**: Flask microservice running on port 5001.
   - **Model**: TensorFlow MobileNetV2 classifier predicting across 12 wildlife species (`bear`, `deer`, `eagle`, `elephant`, `fox`, `leopard`, `lion`, `owl`, `squirrel`, `tiger`, `wolf`, `zebra`).
   - **Capabilities**: Pre-processing, image quality metrics (`blurScore`, `brightnessScore`, `resolution`), unknown species detection, and top-K candidate probabilities.

4. **ML Audio Microservice (`ml-service/app_audio.py`)**
   - **Framework**: Flask microservice running on port 5002.
   - **Model**: YAMNet AudioSet event classification combined with custom RandomForest species bioacoustic classifier (`train_audio.py` + `audio_features.py`).
   - **Capabilities**: Bioacoustic feature extraction (MFCCs, spectral centroid, zero-crossing rate), signal-to-noise ratio (`snrEstimate`), and noise floor analysis (`noiseLevelDb`).
