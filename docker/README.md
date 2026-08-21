# Docker Infrastructure

Containerized production environment managing the **Nginx Reverse Proxy**, **PostgreSQL Database**, and **Backend REST API**.

## Service Architecture

* **reverse-proxy** (`nginx:1.31.4-alpine`): Entry point (`:80`) handling reverse proxying, rate limiting (`30r/s`), connection limits (`20/IP`), security headers, and distributed request tracing (`X-Request-Id`).
* **postgres-db** (`postgres:18.6-alpine`): Primary database (`:5432`) with persistent storage (`pgdata`) and automated initialization via `sql/` scripts.
* **backend-api** (`Node.js 24-alpine`): Multi-stage containerized REST API (`:3000`) with built-in health probes and database readiness dependencies.

## Directory Structure

```text
docker/
├── Dockerfile.backend    # Multi-stage build (tsup compiler -> Node.js runtime)
├── docker-compose.yml    # Multi-container orchestration stack
└── nginx.conf            # Reverse proxy, upstream load balancing & security hardening

```

## Quick Start

Execute from the project root directory:

```bash
# Build and run all services in detached mode
docker compose -f docker/docker-compose.yml up --build -d

# Stream logs across all containers
docker compose -f docker/docker-compose.yml logs -f

# Stop and remove running containers
docker compose -f docker/docker-compose.yml down

```

## Health Checks

```bash
# Nginx Liveness Probe
curl -i http://localhost:8080/nginx-health

# Backend Application Health
curl -i http://localhost:8080/healthz

```
