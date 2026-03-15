<div align="center">

<img src="apps/web/public/logo.svg" alt="ProTraderSim" width="200" />

# ProTraderSim

**A professional multi-asset CFD simulation trading platform.**  
Indistinguishable from a live broker. Built for Introducing Brokers.

[![CI](https://github.com/your-org/protrader-sim/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/protrader-sim/actions/workflows/ci.yml)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)
[![Node](https://img.shields.io/badge/Node-20_LTS-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org)

[Live Demo](#) · [Documentation](#documentation) · [Report a Bug](https://github.com/your-org/protrader-sim/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Monorepo Structure](#monorepo-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running Services](#running-services)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ProTraderSim is a full-stack CFD simulation trading platform built for Introducing Brokers (IBs). Traders experience a 100% realistic trading environment — live prices, real leverage, real margin calls, real liquidations — without any real capital at risk.

**What makes it different:**

- **60 instruments** across Forex, Crypto, Indices, Commodities, and Stocks
- **Leverage up to 1:500** — per instrument, matching real offshore broker rates
- **Real-time prices** via Twelve Data, broadcast over WebSocket every ~2 seconds
- **Full order type support** — Market, Limit, Stop, Stop-Limit, Trailing Stop, OCO
- **Multi-IB architecture** — multiple Introducing Brokers, each with their own scoped client pool
- **Crypto deposits & withdrawals** — USDT (TRC20/ERC20) and ETH via NowPayments.io
- **KYC workflow** — document upload, IB review, approve/reject with audit trail
- **TradingView charts** — embedded Advanced Charts widget for all 60 instruments

---

## Key Features

### For Traders
| Feature | Detail |
|---|---|
| **Trading** | Market, Limit, Stop, Stop-Limit, Trailing Stop, OCO orders |
| **Instruments** | 60 assets: 18 FX pairs, 12 Crypto, 10 Indices, 10 Commodities, 10 Stocks |
| **Role Hierarchy** | 4 levels: Super Admin → IB Team Leader → Agent → Trader |
| **Real-time P&L** | Floating P&L updates every tick for all open positions |
| **Risk tools** | Take Profit, Stop Loss, Trailing Stop on every position |
| **Margin system** | Margin Call at 80%, Stop Out / Liquidation at 50% |
| **Charts** | TradingView Advanced Charts widget, full history |
| **Wallet** | Crypto deposit (USDT TRC20/ERC20, ETH), withdrawal requests |
| **KYC** | 4-document identity verification with status tracking |
| **Portfolio** | Full closed trade history, P&L performance summary, win rate |

### For IB Admins
| Feature | Detail |
|---|---|
| **Client management** | Full user list with search, filters, KYC status, activity |
| **KYC review** | Inline document viewer, one-click approve or reject with note |
| **Balance control** | Credit/debit real balance, grant/revoke tradable bonuses |
| **Withdrawal approvals** | Review and approve or reject withdrawal requests |
| **Reports** | Dashboard KPIs, trading volume by asset class, CSV export |
| **Multi-IB isolation** | Each IB sees only their own clients — enforced at DB + API layers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query |
| **Charts** | TradingView Advanced Charts Widget |
| **API** | Node.js 20, Fastify 4, TypeScript |
| **WebSocket** | Socket.io |
| **Trade Engine** | Node.js 20, TypeScript |
| **Price Feed** | Python 3.11, Twelve Data, asyncio |
| **Database** | PostgreSQL 16 |
| **Cache / Pub-Sub** | Redis 7 |
| **ORM / Migrations** | Prisma 5 |
| **Object Storage** | Cloudflare R2 (S3-compatible) |
| **Payments** | NowPayments.io REST API + IPN Webhooks |
| **Email** | Resend + React Email |
| **Monorepo** | Turborepo + pnpm workspaces |
| **CI/CD** | GitHub Actions |
| **Hosting** | Vercel (frontends) + Railway (backend services) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX / Reverse Proxy                        │
│        protradersim.com · app.protradersim.com · admin.protradersim.com  │
└───────────┬──────────────────┬────────────────────┬─────────────┘
            │                  │                    │
    ┌───────▼──────┐  ┌────────▼────────┐  ┌───────▼────────┐
    │  Public Web  │  │   Trader App    │  │  IB Admin App  │
    │  (Next.js)   │  │   (Next.js)     │  │  (Next.js)     │
    └──────────────┘  └────────┬────────┘  └───────┬────────┘
                               │ REST + WSS         │ REST
                     ┌─────────▼────────────────────▼─────────┐
                     │             API SERVER                   │
                     │        Fastify + Socket.io               │
                     └────────┬────────────────┬───────────────┘
                              │                │
              ┌───────────────▼──┐  ┌──────────▼──────────────┐
              │  Trade Engine    │  │   Price Feed Service     │
              │  Node.js         │  │   Python / Twelve Data      │
              │  (fills, margin, │  │   (poll → Redis pub/sub) │
              │   liquidation)   │  │                          │
              └──────────────────┘  └──────────────────────────┘
                              │
              ┌───────────────▼──────────────────────────────┐
              │                 DATA LAYER                     │
              │   PostgreSQL 16 (RDS eu-west-1 prod)   Redis 7 (ElastiCache)  │
              └──────────────────────────────────────────────┘
```

The platform is composed of **6 services**:

| Service | Runtime | Role |
|---|---|---|
| `apps/web` | Next.js SSR | Public marketing site |
| `apps/app` | Next.js CSR | Trader-facing dashboard |
| `apps/admin` | Next.js CSR | IB Admin panel |
| `apps/api` | Node.js / Fastify | REST API + WebSocket gateway |
| `apps/trade-engine` | Node.js | Order execution, P&L, liquidation |
| `apps/price-feed` | Python 3.11 | Live price polling + broadcast |
| `apps/notification` | Node.js | Email + in-app notifications |

> **Full architecture documentation:** [`docs/TechnicalArchitecture.docx`](docs/TechnicalArchitecture.docx)

---

## Monorepo Structure

```
protrader-sim/
├── apps/
│   ├── web/              Public marketing site
│   ├── app/              Trader dashboard
│   ├── admin/            IB Admin panel
│   ├── api/              Fastify REST API + WebSocket gateway
│   ├── trade-engine/     Order matching & financial calculations
│   ├── price-feed/       Python Twelve Data price polling service
│   └── notification/     Email + WebSocket notification dispatcher
├── packages/
│   ├── ui/               Shared React component library
│   ├── emails/           Transactional email templates (React Email)
│   ├── db/               Prisma schema, migrations, generated client
│   ├── types/            Shared TypeScript types, DTOs, WS contracts
│   └── config/           Shared ESLint, TypeScript, Tailwind, Prettier
├── infra/
│   ├── docker/           Dockerfiles + docker-compose.yml
│   └── deploy/           Railway & Vercel service configs
├── .github/workflows/    CI/CD pipelines
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

> **Full scaffold documentation:** [`docs/FolderScaffold.docx`](docs/FolderScaffold.docx)

---

## Prerequisites

Ensure you have the following installed before proceeding:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) or `nvm use` |
| pnpm | 9.x | `npm install -g pnpm` |
| Python | 3.11 | [python.org](https://www.python.org) |
| Docker | 24+ | [docker.com](https://www.docker.com) |
| Git | 2.40+ | |

> **Node version is pinned in `.nvmrc`.** If you use nvm: `nvm use` from the repo root.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/protrader-sim.git
cd protrader-sim
```

### 2. Install Node dependencies

```bash
pnpm install
```

### 3. Start infrastructure

Spin up PostgreSQL and Redis via Docker Compose:

```bash
docker compose -f infra/docker/docker-compose.yml up postgres redis -d
```

Verify they're running:

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

### 4. Configure environment files

Copy each `.env.example` to `.env` and fill in your values:

```bash
cp apps/api/.env.example          apps/api/.env
cp apps/trade-engine/.env.example apps/trade-engine/.env
cp apps/price-feed/.env.example   apps/price-feed/.env
cp apps/notification/.env.example apps/notification/.env
cp apps/app/.env.example          apps/app/.env
cp apps/admin/.env.example        apps/admin/.env
cp apps/web/.env.example          apps/web/.env
```

> See [Environment Variables](#environment-variables) for a full reference.

### 5. Set up the database

Run all migrations and seed reference data (instruments + super admin):

```bash
cd packages/db
pnpm prisma migrate deploy
pnpm prisma db seed
cd ../..
```

> **Default super admin credentials (dev only):**  
> Email: `admin@protradersim.com` · Password: `ChangeMe123!`  
> **Change this immediately** — update `packages/db/src/seeds/superadmin.seed.ts` before running.

### 6. Install Python dependencies

```bash
cd apps/price-feed
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### 7. Start all services

```bash
pnpm dev
```

Turborepo starts all services in parallel with dependency-aware ordering:

| Service | URL |
|---|---|
| Trader App | http://localhost:3000 |
| API Server | http://localhost:3001 |
| Admin Panel | http://localhost:3002 |
| Public Web | http://localhost:3003 |

---

## Running Services

### All services (recommended for full-stack dev)

```bash
pnpm dev
```

### Individual services

```bash
# Frontend apps
pnpm --filter @protrader/app   dev    # Trader dashboard
pnpm --filter @protrader/admin dev    # Admin panel
pnpm --filter @protrader/web   dev    # Marketing site

# Backend services
pnpm --filter @protrader/api           dev    # API server
pnpm --filter @protrader/trade-engine  dev    # Trade engine

# Python price feed (activate venv first)
cd apps/price-feed
source .venv/bin/activate
python src/main.py
```

### Build all

```bash
pnpm build
```

### Lint and type-check

```bash
pnpm turbo run lint
pnpm turbo run typecheck
```

---

## Environment Variables

> **Full reference:** [`docs/FolderScaffold.docx`](docs/FolderScaffold.docx) — Section 14

### Core variables (apps/api)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_PRIVATE_KEY` | RS256 private key (base64 encoded) |
| `JWT_PUBLIC_KEY` | RS256 public key (base64 encoded) |
| `NOWPAYMENTS_API_KEY` | NowPayments.io API key |
| `NOWPAYMENTS_IPN_SECRET` | HMAC secret for IPN webhook verification |
| `S3_ENDPOINT` | Cloudflare R2 or AWS S3 endpoint |
| `S3_BUCKET` | KYC document storage bucket name |
| `S3_ACCESS_KEY` | Object storage access key |
| `S3_SECRET_KEY` | Object storage secret key |
| `RESEND_API_KEY` | Resend email API key |

### Generating RS256 keys (production)

```bash
# Generate private key
openssl genrsa -out jwt_private.pem 2048

# Extract public key
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem

# Base64 encode for environment variables
base64 -w 0 jwt_private.pem
base64 -w 0 jwt_public.pem
```

---

## Database

### Run migrations

```bash
cd packages/db
pnpm prisma migrate deploy      # Apply all pending migrations (staging/prod)
pnpm prisma migrate dev         # Apply + create new migration (dev only)
```

### Reset database (dev only)

```bash
cd packages/db
pnpm prisma migrate reset       # Drop, recreate, migrate, seed
```

### Open Prisma Studio (visual DB browser)

```bash
cd packages/db
pnpm prisma studio
```

### Migration order

Migrations are numbered `001` through `019` and must be applied in sequence. Prisma handles this automatically. **Never manually apply migrations in production** — use `prisma migrate deploy` in your CI/CD pipeline.

> **Full schema documentation:** [`docs/DatabaseSchema.docx`](docs/DatabaseSchema.docx)

---

## Testing

### Run all tests

```bash
pnpm test
```

### Run tests for a specific service

```bash
pnpm --filter @protrader/api          test
pnpm --filter @protrader/trade-engine test
```

### Run with coverage

```bash
pnpm --filter @protrader/trade-engine test --coverage
```

### Test structure

| Layer | Tooling | Requires DB? |
|---|---|---|
| Unit tests | Vitest | No — all dependencies mocked |
| Integration tests | Vitest + Fastify `inject()` | Yes — test PostgreSQL + Redis |
| Financial math tests | Vitest | No — pure function assertions |

> Integration tests require running PostgreSQL and Redis instances. The CI pipeline starts these automatically via GitHub Actions service containers.

### Key test suites

```
apps/trade-engine/src/engine/
├── MarginCalculator.test.ts    All financial formulas (equity, margin level, P&L)
├── LiquidationEngine.test.ts   Liquidation scenarios, negative balance protection
└── OrderFiller.test.ts         All 7 order type trigger conditions

apps/api/src/__tests__/integration/
├── auth.test.ts                Registration flow, login, token refresh
├── orders.test.ts              Order placement, modification, cancellation
└── wallet.test.ts              Deposit initiation, NowPayments webhook processing
```

---

## Deployment

### Frontend (Vercel)

The three Next.js apps deploy to Vercel automatically on push to `main`:

```bash
# Deploy manually
vercel --prod --cwd apps/app
vercel --prod --cwd apps/admin
vercel --prod --cwd apps/web
```

Configure each app in the Vercel dashboard with the environment variables from their respective `.env.example` files.

### Backend services (Railway)

The four Node.js / Python services deploy to Railway via Docker:

```bash
# Build and push Docker images (CI handles this automatically)
docker build -f infra/docker/api.Dockerfile          -t protrader-api .
docker build -f infra/docker/trade-engine.Dockerfile -t protrader-trade-engine .
docker build -f infra/docker/price-feed.Dockerfile   -t protrader-price-feed .
docker build -f infra/docker/notification.Dockerfile -t protrader-notification .
```

Service configs are in `infra/deploy/railway/`. Set all environment variables in the Railway dashboard — never commit secrets.

### CI/CD Pipelines

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | PR to `main` or `develop` | Lint, typecheck, test |
| `deploy-staging.yml` | Push to `develop` | Deploy to staging environment |
| `deploy-prod.yml` | Push to `main` | Deploy to production |
| `db-migrate.yml` | Manual trigger | Run `prisma migrate deploy` on target |

### Production checklist

Before going live, verify the following:

- [ ] Super admin password changed from seed default
- [ ] RS256 JWT keys generated and stored securely (not `.env` in repo)
- [ ] NowPayments.io `NOWPAYMENTS_SANDBOX=false` in production
- [ ] S3 bucket set to private — no public access
- [ ] CORS origins restricted to production domains only
- [ ] Rate limiting enabled and tuned
- [ ] Database connection pooling configured (PgBouncer recommended for prod)
- [ ] Redis password set in production
- [ ] All `.env` files confirmed gitignored
- [ ] Error monitoring configured (Sentry recommended)
- [ ] Uptime monitoring on all 4 backend service `/health` endpoints

---

## Documentation

The `docs/` directory contains the full engineering documentation suite:

| Document | Description |
|---|---|
| [`docs/PRD.docx`](docs/PRD.docx) | Product Requirements Document — full feature specs |
| [`docs/TechnicalArchitecture.docx`](docs/TechnicalArchitecture.docx) | System design, service boundaries, data flows |
| [`docs/DatabaseSchema.docx`](docs/DatabaseSchema.docx) | Full DDL, all indexes, constraints, seed data |
| [`docs/APIDesign.docx`](docs/APIDesign.docx) | REST endpoints, request/response schemas, WebSocket contracts |
| [`docs/FolderScaffold.docx`](docs/FolderScaffold.docx) | Complete monorepo directory structure, annotated |
| [`docs/README.md`](docs/README.md) | This document |
| [`docs/TaskBreakdown.docx`](docs/TaskBreakdown.docx) | Sprint-ready development tickets |

---

## Contributing

### Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production — always deployable |
| `develop` | Staging — integration branch |
| `feature/<name>` | Feature branches — branched from `develop` |
| `fix/<name>` | Bug fix branches |
| `chore/<name>` | Non-feature work (deps, config, docs) |

### Development workflow

```bash
# 1. Branch from develop
git checkout develop
git pull
git checkout -b feature/your-feature-name

# 2. Make changes, commit with conventional commits
git commit -m "feat(orders): add OCO order type support"
git commit -m "fix(margin): correct floating P&L for short positions"
git commit -m "chore(deps): upgrade Fastify to 4.28"

# 3. Push and open a PR to develop
git push origin feature/your-feature-name
```

### Commit message format

This repo uses [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <description>

Types: feat | fix | chore | docs | test | refactor | perf | ci
Scope: orders | positions | auth | wallet | kyc | admin | trade-engine | price-feed | ui | db
```

### Pull request requirements

- [ ] CI passes (lint, typecheck, tests)
- [ ] New features include unit tests
- [ ] Financial calculation changes include test cases for edge conditions
- [ ] Database changes include a Prisma migration
- [ ] API changes reflected in `docs/APIDesign.docx`

---

## Financial Precision Policy

All monetary balance and ledger values in this codebase use **`BIGINT` in PostgreSQL** (integer cents — $1.00 = 100) and **`Decimal.js`** in Node.js services for all boundary conversions. Price levels, rates, and spread values use `NUMERIC`. Floating-point types (`number`, `float`, `double`) are **never used** for financial calculations.

```typescript
// ❌ Never do this
const pnl = (closePrice - entryPrice) * lots * contractSize;

// ✅ Always do this — balances in cents, prices as Decimal
import Decimal from 'decimal.js';
const pnlUsd = new Decimal(closePrice)
  .minus(entryPrice)
  .times(lots)
  .times(contractSize);
const pnlCents = Math.round(pnlUsd.toNumber() * 100); // store as BIGINT cents
```

This applies without exception to: P&L calculations, balance updates, margin calculations, swap charges, commission, and all ledger entries.

---

## Security Notes

- **JWT tokens** are RS256-signed. Access tokens expire in 15 minutes. Refresh tokens are httpOnly cookies only.
- **KYC documents** are stored in a private S3/R2 bucket. No public URLs are ever generated. All document access uses pre-signed URLs with a 15-minute expiry.
- **NowPayments IPN** webhooks are verified with HMAC-SHA512 before processing. Duplicate webhook delivery is handled idempotently.
- **IB data isolation** is enforced at both the application (middleware) and database (ib_id FK) layers. An IB admin cannot access another IB's client data under any code path.
- **Negative balance protection** is implemented in the liquidation engine — a trader's balance cannot go below 0.

---

## License

Proprietary. All rights reserved. Unauthorised copying, distribution, or use of this software is strictly prohibited.

---

<div align="center">

Built with precision. Designed for IBs.

**ProTraderSim** · [protradersim.com](https://protradersim.com)

</div>
