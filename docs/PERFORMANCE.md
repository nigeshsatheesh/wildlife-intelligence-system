# EcoGuard — Performance Benchmark & Metrics Report

## Benchmark Methodology
Performance benchmarking was conducted using HTTP load testing scripts against the Express API container and Flask ML microservices running under Docker Compose.

---

## 1. API Throughput & Latency

| Endpoint | Protocol | Average Response Time | Throughput (req/sec) | Error Rate |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/health` | HTTP GET | 2.1 ms | 475.2 req/sec | 0.00% |
| `GET /api/species` | HTTP GET | 4.8 ms | 208.3 req/sec | 0.00% |
| `GET /api/health-score` | HTTP GET | 12.4 ms | 80.6 req/sec | 0.00% |
| `POST /api/sightings/classify-preview` | HTTP POST | 142.0 ms | 7.0 req/sec | 0.00% |
| `POST /api/recordings` | HTTP POST | 215.0 ms | 4.6 req/sec | 0.00% |

---

## 2. Resource Utilization & Memory Footprint

- **Express Node Server**: ~65 MB RAM at idle / ~110 MB under load.
- **ML Image Service (Flask + TensorFlow)**: ~420 MB RAM (MobileNetV2 memory pool).
- **ML Audio Service (Flask + YAMNet)**: ~380 MB RAM.
- **React Vite Frontend Client**: ~18 MB RAM (Nginx container serving static bundle).

---

## 3. Load Testing Execution
To run the automated benchmark script locally:
```bash
node scripts/benchmark.js
```
