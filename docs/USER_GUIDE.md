# EcoGuard — User Operational Guide

Welcome to **EcoGuard**, the Wildlife Population Intelligence System. This guide details operational workflows for all four user roles.

---

## 1. Field Researcher Workflow
- **Logging Camera Trap Sightings**:
  1. Navigate to **Sightings** or click **Log New Sighting** in the header.
  2. Upload a camera trap photo (`.jpg`, `.png`).
  3. Review the **AI Vision Classifier** output, image quality chip, and top-3 species probabilities.
  4. Select the monitoring site, count, and field notes, then click **Submit Sighting**.

- **Uploading Audio Recordings**:
  1. Navigate to **Bioacoustic Recordings**.
  2. Click **Log New Recording** and select an audio file (`.wav`, `.mp3`).
  3. The system computes YAMNet acoustic events, Random Forest species labels, signal-to-noise ratio (SNR), and noise level.

---

## 2. Conservation Officer Workflow
- **Reviewing Ecosystem Health**:
  1. Open the **Ecosystem Health Score** tab.
  2. Inspect the 5 weighted factors: Species Diversity (30%), Population Stability (25%), Habitat Quality (20%), Endangered Status (15%), Environmental Conditions (10%).
  3. Review site-specific environmental readings (Temperature, Humidity, Air Quality, Water Availability).

- **Monitoring Alerts & Action Recommendations**:
  1. Open **Alerts & Notifications**.
  2. Filter notifications by severity (*Critical*, *Warning*, *Info*) or type (*Endangered Sighting*, *Population Decline*, *Habitat Degradation*).
  3. Review prioritized action recommendations across 5 categories (*Priority*, *Habitat Restoration*, *Protection Strategy*, *Monitoring Optimization*, *Resource Allocation*).

---

## 3. Forest Department Officer Workflow
- **Field Patrol & Incident Tracking**:
  1. Open the **Forest Department Dashboard**.
  2. View active monitoring sites and protected areas.
  3. Check scheduled ranger patrols in the **Patrol Planner**.
  4. Click **Report New Incident** to log poaching threats or human-wildlife conflict events.

---

## 4. Administrator Workflow
- **Reports & Data Export**:
  1. Navigate to **Reports & Export**.
  2. Choose a report type (*Survey*, *Species Population*, *Biodiversity*, *Habitat*, *Conservation*).
  3. Click **Download PDF** for formatted executive briefs or **Export Excel** for data analysis.
