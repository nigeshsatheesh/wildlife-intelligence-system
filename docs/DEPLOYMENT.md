# EcoGuard — Production Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js v18+ & npm
- Python 3.10+ (for local microservice development)

---

## 1. Environment Configuration

Copy `.env.example` to `.env` or set the following variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ecoguard?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost,http://localhost:80,http://localhost:5173
ML_IMAGE_SERVICE_URL=http://ml-image:5001
ML_AUDIO_SERVICE_URL=http://ml-audio:5002
```

---

## 2. Deploying via Docker Compose

Run all 4 microservices (`client`, `server`, `ml-image`, `ml-audio`) in detached mode:

```bash
docker-compose up --build -d
```

### Container Status & Healthcheck Verification
```bash
docker-compose ps
```

All 4 containers will display `(healthy)` status on their respective ports:
- **Client Web UI**: Port 80
- **Node.js Express Server**: Port 5000
- **ML Vision Microservice**: Port 5001
- **ML Audio Microservice**: Port 5002

---

## 3. Stopping Deployment

```bash
docker-compose down
```
