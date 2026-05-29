# Production Orders Mini-SaaS

A tiny Production Orders management system with Directus CMS + NestJS backend + Next.js frontend.

## Requirements

- **Node.js** >= 18.0.0
- **Yarn** >= 4.0.0 (Berry)
- **Docker** & **Docker Compose**

> **Note:** This project uses Yarn Berry. Run `corepack enable` if needed.

## Quick Start

```bash
# 1. Start all services
docker compose up -d

# 2. Wait for Directus to initialize (~15 seconds)
# 3. Access the services:
#    - Frontend: http://localhost:3000
#    - Backend API: http://localhost:3001
#    - Directus CMS: http://localhost:8055
#      (admin@gmail.com / admin123)
```

## Development Setup

```bash
# Install dependencies
corepack enable
yarn install

# Build the project
yarn build

# Run tests
cd apps/backend && yarn test

# Start services locally (requires Directus running separately)
yarn dev
```

## Project Structure

```
.
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── directus/     # Directus integration
│   │   │   ├── lib/          # Reschedule algorithm + tests
│   │   │   ├── orders/       # CRUD endpoints
│   │   │   └── reschedule/    # Reschedule endpoints
│   │   └── Dockerfile
│   └── frontend/         # Next.js + Ant Design
│       ├── src/
│       │   ├── app/          # Next.js app router
│       │   └── lib/          # API client
│       └── Dockerfile
├── packages/
│   └── types/            # Shared TypeScript types
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all production orders |
| GET | `/orders/:id` | Get single order |
| POST | `/orders` | Create new order |
| PUT | `/orders/:id` | Update order |
| DELETE | `/orders/:id` | Delete order |
| POST | `/orders/reschedule` | Reschedule overlapping orders |
| GET | `/orders/reschedule/dry-run` | Preview reschedule changes |

## Domain Model

| Field | Type | Required | Default |
|-------|------|----------|---------|
| id | UUID | auto | - |
| reference | string | ✓ | - |
| product | string | ✓ | - |
| quantity | integer | - | 1 |
| startDate | date | - | - |
| endDate | date | - | - |
| status | enum | - | planned |
| createdAt | timestamp | auto | - |

## Reschedule Algorithm

Finds overlapping orders in "planned" status, prioritizes by `createdAt`, and reschedules them sequentially while preserving original duration.

## Test the System

```bash
# Check if all services are healthy
curl http://localhost:3001/orders
curl http://localhost:8055/server/info

# Create test data via API
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"reference":"ORD-001","product":"Widget A","quantity":10,"startDate":"2024-01-01","endDate":"2024-01-05"}'

# Test reschedule algorithm
curl http://localhost:3001/orders/reschedule/dry-run
```
