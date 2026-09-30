# EcoGuard — Automated & Manual Testing Manual

## 1. Backend API Unit & Integration Tests (Jest)

The backend test suite verifies core API routes, response schemas, and dual-mode execution using Jest and Supertest.

### Execution Command
```bash
cd server
npm test
```

### Coverage Scope
- `/api/health`: Status check & MongoDB connection mode verification.
- `/api/species`: Retrieval of catalogued species array.
- `/api/sites`: Retrieval of active monitoring sites.
- `/api/notifications`: Alert notification stream retrieval.
- `/api/incidents`: Field security incident retrieval.

---

## 2. Python ML Microservices Unit Tests (Pytest)

The ML test suite validates Flask endpoint routing, health status, and input boundary validation for both image and audio microservices.

### Execution Command
```bash
cd ml-service
python test_ml.py
```

---

## 3. Postman API Collection

A pre-built Postman collection is supplied in `docs/EcoGuard.postman_collection.json`.

### How to Import & Run
1. Open Postman.
2. Click **Import** and select `docs/EcoGuard.postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000`.
4. Execute test requests sequentially.
