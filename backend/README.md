# Backend Service

## Prerequisites

- **Node.js**: `v24.19.0` (or compatible version)
- **Docker & Docker Compose** (required for containerized infrastructure)

## Tech Stack

- **Framework**: [Express.js](https://expressjs.com/) (`v5.2.1`)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (`v7.0.2`)
- **Database Driver**: [`pg` (node-postgres)](https://node-postgres.com/) (`v8.23.0`)
- **Testing Framework**: [Vitest](https://vitest.dev/) (`v4.1.11`)

---

## Getting Started

### 1. Environment Configuration

Navigate to the `backend` directory and instantiate the local `.env` configuration file from the template:

```bash
cd backend
cp .env.example .env

```

Ensure you review and update the environment variables to match your local setup if necessary.

---

### 2. Infrastructure & Database Setup

Make sure the Docker daemon is running on your host machine. From the root directory of the repository, build and start the multi-container stack (including **Nginx Reverse Proxy**, **PostgreSQL Database**, and the **Backend API Service**):

```bash
docker compose -f docker/docker-compose.yml up --build -d

```

#### Health Checks & Telemetry

Once the containers are operational, verify service availability and observability endpoints:

```bash
# Liveness Probe: Verify backend process health
curl -i http://localhost:8080/healthz

# Readiness Probe: Check database connectivity and connection pool status
curl -i http://localhost:8080/ready

# Real-time Telemetry: Scrape Prometheus metrics
curl -i http://localhost:8080/metrics

```

---

### 3. Local Development

To run the backend service standalone on your host machine (outside Docker):

```bash
cd backend

# Install dependencies
npm install

# Start the development server with hot-reload
npm run dev

```

> **Note:** Ensure PostgreSQL is running and `DATABASE_URL` in `backend/.env` points to `localhost:5432`.

---

### 4. Running Tests

The test suite covers **Unit**, **Integration**, and **End-to-End (E2E)** scenarios powered by Vitest.

> **Note:** Integration and E2E suites require environment variables to be configured and the PostgreSQL database to be healthy.

```bash
cd backend

# Run the complete test suite
npm run test

# Run tests and generate code coverage report
npm run test:coverage

# Run End-to-End (E2E) tests
npm run test:e2e

# Run Integration tests
npm run test:integration

# Run Unit tests
npm run test:unit

# Run tests in watch mode (recommended for local development)
npm run test:watch

```
