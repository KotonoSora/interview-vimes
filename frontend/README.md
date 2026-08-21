# Frontend Service

## Prerequisites

- **Node.js**: `v24.19.0` (or compatible version)
- **Docker & Docker Compose** (required for backend services and dependencies)

## Tech Stack

- **Framework**: [React Router](https://reactrouter.com/) (`v8.3.0`)
- **Design System / UI Library**: [shadcn/ui](https://ui.shadcn.com/) (`v4.18.0`)

---

## Getting Started

### 1. Environment Configuration

Navigate to the `frontend` directory and copy the environment template to create your local configuration:

```bash
cd frontend
cp .env.example .env

```

Review and update the environment variables (such as API endpoints) to match your local setup.

---

### 2. Backend Infrastructure Setup

Ensure the Docker daemon is running on your host machine. From the root directory, start the dependent backend services (**Nginx Reverse Proxy**, **PostgreSQL Database**, and **Backend API**):

```bash
docker compose -f docker/docker-compose.yml up --build -d

```

---

### 3. Local Development

Install the project dependencies and start the local development server:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

```

The application will be accessible at [http://localhost:5173](http://localhost:5173) (or your configured port).

---

### 4. Build & Production

```bash
# Type-check and build for production
npm run build

# Preview production build locally
npm run start

```
