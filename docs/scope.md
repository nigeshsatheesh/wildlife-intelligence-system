# Wildlife Population Intelligence System — Project Scope

## Objective
A web platform that lets researchers log wildlife sightings, automatically 
identify species from uploaded images using a trained classifier, and track 
population trends over time.

## In Scope
- JWT authentication (Researcher, Admin roles)
- CRUD for Species, Monitoring Sites, and Sightings
- Image upload with ML-based species classification (transfer learning 
  on a pretrained CNN, fine-tuned on 12 species)
- Basic population analytics: sighting counts and trends per species over time
- Rule-based conservation status flag (e.g. sighting decline > X% → flagged)
- Role-based dashboard (React + Chart.js)
- Docker-based local deployment

## Out of Scope (future work)
- Bioacoustic/audio species recognition
- Drone/satellite imagery integration
- GIS-based habitat mapping
- Cloud/Kubernetes production deployment
- Multi-region distributed microservices

## Tech Stack
- Frontend: React
- Backend: Node.js / Express
- Database: MongoDB (Mongoose)
- ML service: Python / Flask, TensorFlow or PyTorch (transfer learning)
- Auth: JWT

## Data Sources
- Images: Kaggle "Animal Image Dataset (90 animals)" — 12 species subset
- Occurrence data: GBIF API