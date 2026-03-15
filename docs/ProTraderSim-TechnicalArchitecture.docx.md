

**PROTRADER SIM**

Technical Architecture Document

*System Design, Service Architecture & Integration Specifications*

Version 1.0  —  Architecture Baseline  
Date: March 14, 2026  
Author: Claude (Anthropic) in collaboration with Client

**CONFIDENTIAL — Internal Use Only**

# **Table of Contents**

# **1\. Document Purpose & Scope**

This Technical Architecture Document (TAD) defines the complete system design for ProTraderSim — a multi-asset CFD simulation trading platform. It is the authoritative reference for the engineering team covering service boundaries, data flows, integration contracts, security model, and deployment topology.

This document assumes familiarity with the PRD (v0.1). It does not repeat business requirements — it translates them into engineering decisions.

| Audience | Purpose |
| :---- | :---- |
| **Lead Developer / Architect** | Primary reference for all system design decisions |
| **Backend Engineers** | Service contracts, API design, database schema guidance |
| **Frontend Engineers** | WebSocket event contracts, REST API surface, auth flow |
| **DevOps / Infra** | Deployment topology, environment config, scaling strategy |
| **QA Engineers** | Integration test boundaries, latency expectations, failure modes |

# **2\. System Overview**

## **2.1 High-Level Architecture Diagram**

The platform is composed of six independently deployable services, two data stores, and three external integrations, all orchestrated behind a reverse proxy.

| ┌─────────────────────────────────────────────────────────────────────┐ │                        NGINX / Reverse Proxy                        │ │           protradersim.com  ·  app.protradersim.com  ·  admin.protradersim.com │ └──────────┬──────────────────────┬───────────────────────┬───────────┘            │                      │                       │     ┌──────▼──────┐       ┌───────▼───────┐     ┌────────▼────────┐     │  Public Web  │       │   Client App   │     │  IB Admin Panel │     │  Next.js SSR │       │  Next.js CSR   │     │  Next.js CSR    │     │  (Marketing) │       │  (Dashboard,   │     │  (Multi-IB,     │     │              │       │   Trading,      │     │   KYC, Wallet   │     │              │       │   Wallet, KYC)  │     │   Management)   │     └──────────────┘       └───────┬───────┘     └────────┬────────┘                                    │ REST \+ WSS            │ REST                           ┌────────▼───────────────────────▼────────┐                           │              API SERVER                  │                           │         Node.js \+ Fastify                │                           │  Auth · Users · Orders · KYC · Wallet   │                           │  WebSocket Gateway (Socket.io)           │                           └────┬──────────┬──────────────┬──────────┘                                │          │              │                ┌───────────────▼─┐  ┌─────▼──────┐  ┌──▼──────────────┐                │  Trade Engine   │  │ Notif.Svc  │  │  Price Feed Svc │                │  Node.js        │  │ Node.js    │  │  Python/Twelve Data│                │  (Order fills,  │  │ (In-app \+  │  │  (Poll → Redis  │                │   Margin calc,  │  │  Email     │  │   pub/sub)      │                │   Liquidation)  │  │  dispatch) │  │                 │                └───────┬─────────┘  └────┬───────┘  └────────────────┘                        │                  │                ┌───────▼──────────────────▼───────────────────────────┐                │               DATA LAYER                              │                │   PostgreSQL (primary)      Redis (cache \+ pub/sub)   │                └───────────────────────────────────────────────────────┘                                    │                ┌───────────────────▼────────────────────────────────┐                │          EXTERNAL INTEGRATIONS                      │                │  NowPayments.io · Twelve Data (Python) · SendGrid/Resend│                │  TradingView Widget (client-side only)              │                └─────────────────────────────────────────────────────┘ |
| :---- |

## **2.2 Service Responsibilities Summary**

| Service | Language / Runtime | Primary Responsibility |
| :---- | :---- | :---- |
| **Public Web** | Next.js 14 (SSR) | Marketing pages, SEO, landing page, legal pages |
| **Client App** | Next.js 14 (CSR) | Authenticated trader dashboard, trading panel, wallet, KYC, notifications |
| **IB Admin Panel** | Next.js 14 (CSR) | Multi-IB admin: user management, KYC review, balance/bonus controls |
| **API Server** | Node.js \+ Fastify | Central REST API \+ WebSocket gateway. Auth, orders, users, wallet, KYC |
| **Trade Engine** | Node.js | Order matching, fill execution, P\&L calculation, margin checks, liquidation |
| **Price Feed Service** | Python 3.11 | Twelve Data polling, spread application, Redis pub/sub broadcast |
| **Notification Service** | Node.js | In-app WebSocket push, transactional email dispatch |
| **PostgreSQL 16** | Managed DB | All persistent financial data: users, accounts, orders, positions, transactions |
| **Redis 7** | In-memory store | Latest tick cache, pub/sub bus, session store, rate limiting |
| **Object Storage** | S3 / R2 | KYC document storage (private, signed URL access only) |

# **3\. Frontend Architecture**

## **3.1 Application Split**

Three distinct Next.js applications share a common component library and design system. They are deployed independently but share API and WebSocket endpoints.

| App | Subdomain | Rendering Strategy | Auth Required |
| :---- | :---- | :---- | :---- |
| **Public Web** | protradersim.com | SSR (Next.js App Router) | No — public facing |
| **Client App** | app.protradersim.com | CSR after auth shell (Next.js) | Yes — JWT required |
| **Admin Panel** | admin.protradersim.com | CSR after auth shell (Next.js) | Yes — IB Admin role |

## **3.2 Shared Design System**

* Tech: Tailwind CSS \+ shadcn/ui component library

* Theme: Dark-first (navy/dark blue palette matching ICMarkets / Exness aesthetic)

* Fonts: Inter (UI text), JetBrains Mono (prices, numbers, code)

* Component library housed in a shared /packages/ui workspace (monorepo)

* All price and metric displays use JetBrains Mono for visual clarity and trading authenticity

## **3.3 State Management**

| Concern | Solution | Rationale |
| :---- | :---- | :---- |
| **Server state (REST)** | TanStack Query v5 | Caching, background refetch, optimistic updates for order actions |
| **Real-time state (WS)** | Zustand store | Lightweight; WebSocket events update slices directly (prices, metrics, notifications) |
| **Auth state** | Zustand \+ httpOnly cookie | Access token in memory; refresh token in httpOnly cookie for security |
| **Form state** | React Hook Form \+ Zod | Registration, KYC upload, order ticket — all validated client-side before API call |
| **URL / routing state** | Next.js App Router | Page-level state via URL params (active symbol, order filter, etc.) |

## **3.4 TradingView Widget Integration**

TradingView Advanced Charts widget is embedded in the Trading Panel page only. It runs entirely client-side — no server-side data feed is required.

* Widget loads via the TradingView embed script on the trading page only (code-split, not global)

* Symbol mapping table required: internal symbol (e.g. EURUSD) → TradingView symbol (e.g. FX:EURUSD, BINANCE:BTCUSDT)

* Chart theme is set to 'dark' to match the platform UI

* Order execution does NOT interact with the TradingView widget — orders are placed via the custom order ticket panel beside the chart

* Widget is sandboxed in an iframe; no custom data feed API is used

| // Symbol mapping examples const TV\_SYMBOL\_MAP \= {   'EURUSD':   'FX:EURUSD',   'BTCUSD':   'BINANCE:BTCUSDT',   'XAUUSD':   'TVC:GOLD',   'US500':    'SP:SPX',   'AAPL':     'NASDAQ:AAPL',   // ... all 60 instruments mapped }; |
| :---- |

# **4\. API Server**

## **4.1 Framework & Structure**

* Runtime: Node.js 20 LTS

* Framework: Fastify 4 (chosen for high throughput, schema-based validation, plugin architecture)

* Language: TypeScript 5

* Architecture pattern: Layered (Routes → Controllers → Services → Repository → DB)

* Validation: Zod schemas, compiled to Fastify JSON Schema for request validation

## **4.2 Route Structure**

| /api/v1 ├── /auth │   ├── POST /register          — Step 1-4 multi-step registration │   ├── POST /login             — Returns access token \+ sets refresh cookie │   ├── POST /logout            — Clears refresh token cookie │   ├── POST /refresh           — Issues new access token from refresh cookie │   ├── POST /verify-email      — Validates email verification token │   └── POST /forgot-password   — Triggers OTP reset email ├── /users │   ├── GET  /me                — Current user profile │   ├── PUT  /me                — Update profile fields │   └── PUT  /me/password       — Change password ├── /kyc │   ├── POST /upload            — Multi-part upload (ID front/back, PoA, selfie) │   ├── GET  /status            — Current KYC status \+ rejection reason │   └── POST /resubmit          — Clears and re-opens submission ├── /instruments │   ├── GET  /                  — All 60 instruments with metadata \+ leverage │   └── GET  /:symbol/price     — Latest price snapshot for a symbol ├── /orders │   ├── POST /                  — Place new order (all types) │   ├── GET  /                  — List orders (pending \+ history, filterable) │   ├── PUT  /:id               — Modify pending order (TP/SL/price) │   └── DELETE /:id             — Cancel pending order ├── /positions │   ├── GET  /                  — All open positions with real-time metrics │   └── DELETE /:id             — Close position (full or partial) ├── /account │   └── GET  /metrics           — Balance, equity, margin, free margin, margin level ├── /wallet │   ├── POST /deposit           — Initiate NowPayments.io deposit │   ├── POST /withdraw          — Submit withdrawal request │   └── GET  /transactions      — Full transaction ledger ├── /notifications │   ├── GET  /                  — List notifications (paginated) │   └── PUT  /read              — Mark as read └── /admin                      — IB Admin routes (role-gated)     ├── /users     ├── /kyc     ├── /balance     ├── /bonus     └── /reports |
| :---- |

## **4.3 Authentication Architecture**

### **Token Strategy**

* Access Token: JWT, signed with RS256 (asymmetric). Expires in 15 minutes.

* Refresh Token: Opaque random token, stored in DB \+ set as httpOnly, Secure, SameSite=Strict cookie. Expires in 7 days.

* Every authenticated request carries the access token in Authorization: Bearer \<token\> header.

* The /auth/refresh endpoint validates the refresh cookie and issues a new access token silently.

### **Multi-IB Role Model**

| Role | Scope | Permissions |
| :---- | :---- | :---- |
| **trader** | Own account only | Trade, view own data, deposit/withdraw, KYC upload |
|  | Own client pool only | View/manage clients assigned to this IB; KYC, balance, bonus |
| **super\_admin** | All IBs \+ all users | Full platform access; IB account management; global reports |

Every IB admin account has an ib\_id foreign key. All queries in the admin API layer automatically append AND ib\_id \= ? to scope results to the requesting IB. Super admins bypass this filter.

## **4.4 WebSocket Gateway**

Socket.io is used for the WebSocket layer, running on the same Fastify server via the @fastify/socket.io plugin.

### **Connection & Authentication**

* Client connects with auth: { token: '\<access\_token\>' } in the Socket.io handshake.

* Server validates the JWT on connect. Invalid token → immediate disconnect.

* Each authenticated socket is placed in a private room: user:\<userId\>.

* On price subscription, socket joins rooms: price:\<symbol\> for each subscribed symbol.

### **Server → Client Event Reference**

| Event | Room | Payload | Trigger |
| :---- | :---- | :---- | :---- |
| **price:tick** | price:\<symbol\> | { symbol, bid, ask, timestamp } | Every price poll cycle (\~2s) |
| **account:metrics** | user:\<id\> | { balance, equity, margin, freeMargin, marginLevel, floatingPnl } | Every tick where user has open positions |
| **position:update** | user:\<id\> | { positionId, floatingPnl, currentPrice } | Every tick per open position |
| **order:filled** | user:\<id\> | { orderId, fillPrice, fillTime, positionId } | On order execution |
| **order:cancelled** | user:\<id\> | { orderId, reason } | On system or user cancel |
| **position:closed** | user:\<id\> | { positionId, realizedPnl, closePrice, closeTime } | On position close / TP/SL hit |
| **margin:call** | user:\<id\> | { marginLevel, threshold, message } | When margin level breaches 80% |
| **liquidation:triggered** | user:\<id\> | { positionId, reason, balanceAfter } | On auto-liquidation |
| **kyc:status** | user:\<id\> | { status, reason } | On IB KYC action |
| **wallet:credited** | user:\<id\> | { amount, type, newBalance } | On deposit confirm / IB credit |
| **notification:new** | user:\<id\> | { id, type, message, timestamp } | Any system event |

# **5\. Price Feed Service**

## **5.1 Overview**

The Price Feed Service is a standalone Python 3.11 microservice. It is the only component that touches Twelve Data. Its sole job is to fetch current prices for all 60 instruments and publish normalised bid/ask ticks to Redis pub/sub.

## **5.2 Twelve Data Polling Design**

* Polling interval: 2 seconds per full cycle

* Batch strategy: 60 symbols split into 3 batches of 20, fetched concurrently with asyncio

* Twelve Data provides last trade price. Bid/ask are simulated: bid \= price \- (spread/2), ask \= price \+ (spread/2)

* Spread is loaded from the instruments table in PostgreSQL at service startup and cached in memory

* Price deltas \< 0.001% are suppressed to avoid broadcasting noise ticks

| \# Simplified polling loop import asyncio, twelvedata as yf, redis.asyncio as aioredis BATCH\_SIZE \= 20 POLL\_INTERVAL \= 2  \# seconds STALE\_THRESHOLD \= 10  \# seconds before marking price as stale async def poll\_batch(symbols: list\[str\], spreads: dict, redis\_client):     tickers \= yf.Tickers(' '.join(symbols))     for symbol in symbols:         try:             price \= tickers.tickers\[symbol\].fast\_info\['last\_price'\]             spread \= spreads.get(symbol, 0.0002)             bid \= round(price \- spread / 2, 6\)             ask \= round(price \+ spread / 2, 6\)             tick \= {'symbol': symbol, 'bid': bid, 'ask': ask,                     'timestamp': int(time.time() \* 1000), 'stale': False}             await redis\_client.publish(f'price:{symbol}', json.dumps(tick))             await redis\_client.setex(f'latest:{symbol}', 30, json.dumps(tick))         except Exception as e:             \# Publish stale marker if consecutive failures exceed threshold             await publish\_stale(symbol, redis\_client) |
| :---- |

## **5.3 Stale Price Handling**

| Condition | Action | UI Behaviour |
| :---- | :---- | :---- |
| **Fetch succeeds normally** | Publish fresh tick to Redis | Price updates normally |
| **Single fetch failure** | Retry immediately; publish last known price | No change visible |
| **3 consecutive failures (6s)** | Publish stale:true tick | Amber 'Delayed' badge on price |
| **5 consecutive failures (10s)** | Publish stale:true \+ block\_orders:true | Red 'Offline' badge; new order button disabled |
| **Service restart / reconnect** | Re-fetch all symbols immediately | Prices resume; stale cleared automatically |

## **5.4 Redis Tick Schema**

| \# Redis pub/sub channel: price:\<SYMBOL\> \# Redis key (latest snapshot): latest:\<SYMBOL\>  (TTL: 30s) {   "symbol":    "EURUSD",   "bid":       1.08432,   "ask":       1.08436,   "spread":    0.00004,   "timestamp": 1710000000000,   // Unix ms   "stale":     false,   "blockOrders": false } |
| :---- |

# **6\. Trade Engine**

## **6.1 Overview**

The Trade Engine is a Node.js service that subscribes to ALL price channels on Redis. On each tick it runs a deterministic evaluation loop for every affected account. It is the financial brain of the platform — all order fills, P\&L calculations, margin enforcement, and liquidations originate here.

CRITICAL RULE: No financial calculation is ever trusted from the client. The Trade Engine is the single source of truth for all monetary values.

## **6.2 Per-Tick Evaluation Loop**

| On each Redis price tick for symbol S: 1\. LOAD all open positions for symbol S from DB (cached in Redis for 5s) 2\. LOAD all pending orders for symbol S 3\. For each open position:    a. Calculate floating P\&L \= (currentPrice \- entryPrice) × lots × contractSize × direction    b. Check TP hit → if yes, schedule position close at TP price    c. Check SL hit → if yes, schedule position close at SL price    d. Check trailing stop adjustment → update SL if price moved in favour 4\. For each pending order:    a. Check trigger condition (Limit, Stop, StopLimit, Trailing Stop)    b. If triggered → schedule order fill 5\. For each affected account:    a. Recalculate: Equity, Margin Used, Free Margin, Margin Level    b. If Margin Level \< 80%  → emit margin:call WebSocket event    c. If Margin Level \< 50%  → trigger liquidation routine 6\. BATCH all DB writes (position updates, order fills) in a single transaction 7\. EMIT updated account metrics to WebSocket gateway via Redis pub/sub |
| :---- |

## **6.3 Order Execution Logic**

### **Market Order**

* Fill price \= ask (buy) or bid (sell) at moment of receipt

* Simulated latency: random delay 50–200ms before confirming fill (configurable per instrument)

* Slippage: ±0 to ±2 pips random within configured slippage band

* Margin check MUST pass before fill is written to DB

### **Pending Orders (Limit, Stop, Stop-Limit)**

* Stored in orders table with status PENDING

* Trade Engine evaluates on every tick for the relevant symbol

* Limit Buy: fills when ask ≤ limit price

* Limit Sell: fills when bid ≥ limit price

* Stop Buy: fills at market when ask ≥ stop price (converted to market order)

* Stop Sell: fills at market when bid ≤ stop price

* Stop-Limit: activates at stop price, then only fills at limit price or better

### **OCO (One Cancels Other)**

* Two orders linked by oco\_group\_id in the orders table

* When one order fills or is cancelled, the Trade Engine immediately cancels the partner order

* Atomic DB transaction: fill one \+ cancel other in a single commit

### **Trailing Stop**

* Stored as an offset (pips) not an absolute price

* On each tick: if price moves in favour by any amount, recompute SL \= currentPrice \- trailPips

* SL can only move in favour — never widens

* When price reverses and hits SL, position closes at market

## **6.4 Financial Calculations**

| // Margin Required (per position) marginRequired \= (lots × contractSize × price) / leverage // Floating P\&L (long position) floatingPnl \= (currentBid \- entryPrice) × lots × contractSize // Floating P\&L (short position) floatingPnl \= (entryPrice \- currentAsk) × lots × contractSize // Equity equity \= balance \+ SUM(floatingPnl for all open positions) // Margin Level marginLevel \= (equity / totalMarginUsed) × 100 // Free Margin freeMargin \= equity \- totalMarginUsed // Swap (applied at UTC 00:00 daily) dailySwap \= lots × contractSize × swapRate / 365 |
| :---- |

## **6.5 Liquidation Engine**

Liquidation fires synchronously within the per-tick evaluation loop when Margin Level \< 50%. It cannot be bypassed.

1. Sort open positions by floating P\&L ascending (largest loss first)

2. Close the worst-performing position at current market bid/ask

3. Recalculate Margin Level after close

4. If Margin Level is still below 50%, repeat from step 1 until Margin Level ≥ 50% or no positions remain

5. If balance would go negative after all positions closed, apply Negative Balance Protection: set balance \= 0, log event

6. Emit liquidation:triggered WebSocket event for each closed position

7. Record all closures in positions table with close\_reason \= 'LIQUIDATION'

## **6.6 Swap / Rollover**

* Swap runs as a scheduled job at UTC 00:00 daily

* For each open position at rollover time: calculate swap \= lots × contractSize × swapRate / 365

* Debit or credit the account balance directly (not floating P\&L)

* Record each swap as a transaction of type SWAP in the transactions table

* Positions opened and closed within the same UTC day do NOT incur swap

* Wednesday rollover: triple swap applied (standard market convention for FX/CFD)

# **7\. Database Schema**

## **7.1 Overview**

PostgreSQL 16 is the primary datastore. All financial data is stored with BIGINT (cents) precision to avoid floating-point errors. Every table has created\_at and updated\_at timestamps managed by a trigger.

## **7.2 Core Tables**

### **users**

| users ├── id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid() ├── ib\_id           UUID NOT NULL REFERENCES ib\_accounts(id) ├── email           VARCHAR(255) UNIQUE NOT NULL ├── password\_hash   VARCHAR(255) NOT NULL ├── first\_name      VARCHAR(100) ├── last\_name       VARCHAR(100) ├── phone           VARCHAR(30) ├── date\_of\_birth   DATE ├── country         VARCHAR(100) ├── address         TEXT ├── role            VARCHAR(20) DEFAULT 'trader'  \-- trader | ib\_admin | super\_admin ├── email\_verified  BOOLEAN DEFAULT FALSE ├── is\_active       BOOLEAN DEFAULT TRUE ├── created\_at      TIMESTAMPTZ DEFAULT NOW() └── updated\_at      TIMESTAMPTZ DEFAULT NOW() |
| :---- |

### **accounts**

| accounts  (1:1 with users) ├── id              UUID PRIMARY KEY ├── user\_id         UUID UNIQUE NOT NULL REFERENCES users(id) ├── balance         BIGINT (cents) NOT NULL DEFAULT 0 ├── bonus\_balance   BIGINT (cents) NOT NULL DEFAULT 0 ├── currency        VARCHAR(10) DEFAULT 'USD' ├── leverage        INTEGER DEFAULT 500  \-- account-level override ├── margin\_call\_pct INTEGER DEFAULT 80 ├── stop\_out\_pct    INTEGER DEFAULT 50 ├── is\_locked       BOOLEAN DEFAULT FALSE └── created\_at, updated\_at |
| :---- |

### **positions**

| positions ├── id              UUID PRIMARY KEY ├── account\_id      UUID NOT NULL REFERENCES accounts(id) ├── instrument\_id   UUID NOT NULL REFERENCES instruments(id) ├── direction       VARCHAR(5) NOT NULL  \-- LONG | SHORT ├── lots            NUMERIC(10,4) NOT NULL ├── entry\_price     BIGINT (cents) NOT NULL ├── close\_price     BIGINT (cents) ├── tp\_price        BIGINT (cents) ├── sl\_price        BIGINT (cents) ├── trailing\_pips   NUMERIC(10,2) ├── margin\_used     BIGINT (cents) NOT NULL ├── realized\_pnl    BIGINT (cents) ├── swap\_accrued    BIGINT (cents) DEFAULT 0 ├── commission      BIGINT (cents) DEFAULT 0 ├── status          VARCHAR(20)  \-- OPEN | CLOSED | LIQUIDATED ├── close\_reason    VARCHAR(30)  \-- TP | SL | MANUAL | LIQUIDATION | MARGIN\_CALL ├── opened\_at       TIMESTAMPTZ ├── closed\_at       TIMESTAMPTZ └── created\_at, updated\_at |
| :---- |

### **orders**

| orders ├── id              UUID PRIMARY KEY ├── account\_id      UUID NOT NULL REFERENCES accounts(id) ├── instrument\_id   UUID NOT NULL REFERENCES instruments(id) ├── type            VARCHAR(20)  \-- MARKET|LIMIT|STOP|STOP\_LIMIT|TRAILING\_STOP|OCO ├── direction       VARCHAR(5)   \-- LONG | SHORT ├── lots            NUMERIC(10,4) NOT NULL ├── price           BIGINT (cents)  \-- trigger/limit price ├── stop\_price      BIGINT (cents)  \-- for STOP\_LIMIT ├── tp\_price        BIGINT (cents) ├── sl\_price        BIGINT (cents) ├── trailing\_pips   NUMERIC(10,2) ├── oco\_group\_id    UUID           \-- links OCO pair ├── fill\_price      BIGINT (cents) ├── status          VARCHAR(20)  \-- PENDING|FILLED|CANCELLED|REJECTED|EXPIRED ├── position\_id     UUID REFERENCES positions(id) ├── placed\_at       TIMESTAMPTZ ├── filled\_at       TIMESTAMPTZ └── created\_at, updated\_at |
| :---- |

### **instruments**

| instruments ├── id              UUID PRIMARY KEY ├── symbol          VARCHAR(20) UNIQUE NOT NULL  \-- e.g. EURUSD ├── display\_name    VARCHAR(50) ├── asset\_class     VARCHAR(20)  \-- FOREX|CRYPTO|INDICES|COMMODITIES|STOCKS ├── segment         VARCHAR(30)  \-- Major|Minor|Large Cap|etc. ├── leverage        INTEGER NOT NULL  \-- e.g. 500, 300, 20 ├── contract\_size   NUMERIC(18,4)  \-- e.g. 100000 for FX, 1 for crypto ├── pip\_size        BIGINT (cents)  \-- e.g. 0.0001 for EURUSD ├── spread          NUMERIC(10,6)  \-- configurable by IB ├── swap\_long       NUMERIC(10,6)  \-- daily swap rate long ├── swap\_short      NUMERIC(10,6)  \-- daily swap rate short ├── min\_lot         NUMERIC(10,4) DEFAULT 0.01 ├── max\_lot         NUMERIC(10,4) DEFAULT 100 ├── margin\_pct      NUMERIC(6,4)   \-- derived from leverage ├── tv\_symbol       VARCHAR(50)   \-- TradingView widget symbol ├── td\_symbol       VARCHAR(20)   \-- Twelve Data ticker ├── is\_active       BOOLEAN DEFAULT TRUE └── created\_at, updated\_at |
| :---- |

### **transactions**

| transactions ├── id              UUID PRIMARY KEY ├── account\_id      UUID NOT NULL REFERENCES accounts(id) ├── type            VARCHAR(30) │                   \-- DEPOSIT | WITHDRAWAL | IB\_CREDIT | IB\_DEBIT │                   \-- BONUS\_GRANT | BONUS\_REVOKE | TRADE\_PNL │                   \-- SWAP | COMMISSION | LIQUIDATION\_SETTLE ├── amount          BIGINT (cents) NOT NULL  \-- positive \= credit, negative \= debit ├── balance\_after   BIGINT (cents) NOT NULL  \-- snapshot of balance post-transaction ├── reference\_id    UUID  \-- links to position/order/deposit where applicable ├── memo            TEXT ├── status          VARCHAR(20)  \-- PENDING | COMPLETED | FAILED | REVERSED ├── initiated\_by    UUID  \-- user\_id or ib\_admin\_id └── created\_at, updated\_at |
| :---- |

### **kyc\_submissions**

| kyc\_submissions ├── id              UUID PRIMARY KEY ├── user\_id         UUID NOT NULL REFERENCES users(id) ├── id\_front\_url    TEXT  \-- S3/R2 object key (NOT public URL) ├── id\_back\_url     TEXT ├── proof\_of\_address\_url TEXT ├── selfie\_url      TEXT ├── status          VARCHAR(20)  \-- NOT\_STARTED|PENDING|APPROVED|REJECTED ├── rejection\_note  TEXT ├── reviewed\_by     UUID  \-- ib\_admin user\_id ├── reviewed\_at     TIMESTAMPTZ └── created\_at, updated\_at |
| :---- |

### **ib\_accounts**

| ib\_accounts ├── id              UUID PRIMARY KEY ├── name            VARCHAR(100) NOT NULL ├── email           VARCHAR(255) UNIQUE NOT NULL ├── password\_hash   VARCHAR(255) NOT NULL ├── role            VARCHAR(20) DEFAULT 'ib\_admin' ├── is\_active       BOOLEAN DEFAULT TRUE └── created\_at, updated\_at |
| :---- |

# **8\. Redis Architecture**

## **8.1 Key Namespaces**

| Key Pattern | Type | TTL | Purpose |
| :---- | :---- | :---- | :---- |
| **latest:\<SYMBOL\>** | String (JSON) | 30s | Latest price snapshot for fast REST reads and engine bootstrap |
| **price:\<SYMBOL\>** | Pub/Sub channel | N/A | Live tick broadcast to Trade Engine \+ WS Gateway subscribers |
| **session:\<token\>** | String | 7d | Refresh token store for revocation checks |
| **ratelimit:\<ip\>:\<route\>** | String (counter) | 60s | Per-IP rate limiting on auth endpoints |
| **account:metrics:\<userId\>** | String (JSON) | 5s | Cached account metrics to reduce DB reads on high-frequency ticks |
| **positions:\<accountId\>** | String (JSON) | 5s | Cached open positions list for Trade Engine tick loop |
| **pending\_orders:\<symbol\>** | String (JSON) | 5s | Cached pending orders per symbol for Trade Engine tick loop |
| **notifications:\<userId\>** | List | 7d | Recent unread notification IDs for badge count |

## **8.2 Pub/Sub Flow**

| Price Feed Service (publisher)   └── PUBLISH price:EURUSD  '{bid, ask, timestamp...}'         │         ├── Trade Engine (subscriber)         │     └── Runs tick evaluation loop for EURUSD positions/orders         │           └── PUBLISH account:metrics:userId  '{equity, margin...}'         │                 └── WebSocket Gateway (subscriber)         │                       └── emit('account:metrics', payload) to user room         │         └── WebSocket Gateway (subscriber)               └── emit('price:tick', payload) to price:EURUSD socket room |
| :---- |

# **9\. Wallet & NowPayments.io Integration**

## **9.1 Accepted Coins (v1)**

| Coin | Network | NowPayments Currency Code | Notes |
| :---- | :---- | :---- | :---- |
| **USDT** | TRC20 (Tron) | usdttrc20 | Lowest fees; recommended for users |
| **USDT** | ERC20 (Ethereum) | usdterc20 | Higher gas fees; legacy network option |
| **ETH** | Ethereum Mainnet | eth | Native ETH deposits |

## **9.2 Deposit Flow**

| 1\. User selects coin \+ network on Deposit screen 2\. Client POST /api/v1/wallet/deposit { coin: 'usdttrc20', amount: 100 } 3\. API Server calls NowPayments.io  POST /v1/payment    → Returns: { payment\_id, pay\_address, pay\_amount, pay\_currency } 4\. API stores pending deposit in transactions table:    { type: DEPOSIT, status: PENDING, reference\_id: payment\_id } 5\. API returns pay\_address \+ QR code data to client 6\. User sends crypto to the address 7\. NowPayments.io sends IPN webhook to POST /api/v1/webhooks/nowpayments    → Payload: { payment\_id, payment\_status, actually\_paid, pay\_currency } 8\. API verifies HMAC-SHA512 signature using NOWPAYMENTS\_IPN\_SECRET 9\. On payment\_status \=== 'finished':    a. Convert actually\_paid to USD at current rate (NowPayments provides this)    b. Credit account balance atomically    c. Update transaction status to COMPLETED    d. Emit wallet:credited WebSocket event to user    e. Send deposit confirmation email |
| :---- |

## **9.3 Withdrawal Flow**

| 1\. User submits withdrawal: { coin, network, walletAddress, amount } 2\. API validates: amount ≤ real balance (bonus excluded), KYC approved 3\. Create transaction { type: WITHDRAWAL, status: PENDING } 4\. Debit balance immediately (reserved), update account balance 5\. IB Admin sees withdrawal request in admin panel 6\. IB Admin approves → API calls NowPayments.io Mass Payout API    POST /v1/payout  { address, amount, currency, ipn\_callback\_url } 7\. On payout confirmed webhook → update transaction status COMPLETED 8\. On payout failed → reverse balance deduction, status FAILED, notify user |
| :---- |

## **9.4 Bonus Logic**

* Bonus balance is stored separately in accounts.bonus\_balance

* Bonus is added to account equity for all margin calculations (acts as real capital for trading)

* Bonus is never included in withdrawal amount validation

* When losses occur: bonus\_balance is drawn first, then real balance

* Bonus has no expiry — IB can revoke at any time via admin panel (creates BONUS\_REVOKE transaction)

* Dashboard displays: Real Balance | Bonus Balance | Total Equity (combined)

# **10\. Multi-IB Data Architecture**

## **10.1 IB Isolation Model**

Every user is assigned to exactly one IB at registration (either by referral link with ib\_id param, or assigned to a default IB). This relationship is immutable after account creation.

| Layer | Isolation Mechanism |
| :---- | :---- |
| **Database** | All user records have ib\_id FK. Admin queries always filter WHERE ib\_id \= $ibId |
| **API Middleware** | IB admin JWT contains ib\_id claim. Middleware injects ib\_id into all admin route handlers |
| **Super Admin** | JWT role \= super\_admin bypasses ib\_id filter. Can see all IBs and all users |
| **Reporting** | All aggregate queries group by ib\_id. IBs never see cross-IB data |
| **KYC Documents** | S3 object keys include ib\_id prefix for organisational clarity (not a security boundary) |

## **10.2 IB Registration Flow**

8. Super admin creates IB account via admin panel (or API)

9. IB receives login credentials and a unique referral link: app.protradersim.com/register?ib=\<ib\_id\>

10. Users registering via referral link are automatically assigned to that IB

11. IB can view all their clients as leads from day 1 of registration

# **11\. KYC & Document Storage**

## **11.1 Upload Flow**

12. Client uploads files via multipart POST /api/v1/kyc/upload

13. API validates: file type (JPG, PNG, PDF), file size (max 10MB per file)

14. Files are streamed directly to S3/R2 private bucket — never written to disk

15. S3 key format: kyc/{ib\_id}/{user\_id}/{document\_type}/{uuid}.{ext}

16. DB record created: kyc\_submissions row with object keys (NOT URLs)

17. User's KYC status set to PENDING

## **11.2 IB Review Flow**

18. IB admin opens User Detail → KYC tab

19. API generates pre-signed S3 URLs (expiry: 15 minutes) for each document — never stores or exposes permanent URLs

20. IB admin views documents inline in browser

21. IB admin clicks Approve or Reject with a free-text comment

22. Status update written to kyc\_submissions; WebSocket event pushed to user

## **11.3 Re-verification**

* IB admin can trigger re-verification for any user at any time (e.g. annual compliance check)

* Re-verification resets KYC status to NOT\_STARTED and notifies user via email \+ in-app

* Previous submission records are preserved in DB (archived, not deleted) for compliance audit trail

* KYC records never expire automatically

# **12\. Security Architecture**

## **12.1 Security Controls**

| Control | Implementation |
| :---- | :---- |
| **Transport Security** | TLS 1.3 enforced on all endpoints. HSTS headers. WSS only (no plain WS) |
| **Password Hashing** | bcrypt, cost factor 12\. Rehash on login if cost factor has increased |
| **JWT Signing** | RS256 asymmetric. Private key stored in env/secrets manager. Public key used for verification only |
| **Refresh Token** | Opaque 256-bit random token. Stored hashed in DB. Rotated on every use |
| **CSRF Protection** | SameSite=Strict cookie \+ custom header check on mutating requests |
| **Rate Limiting** | Redis-backed: 10 requests/min on /auth/login, 5/min on /auth/forgot-password |
| **KYC Document Access** | Pre-signed URLs only (15 min expiry). Bucket is private. No public URLs ever |
| **NowPayments Webhook** | HMAC-SHA512 signature verified before processing. Replay protection via payment\_id idempotency |
| **SQL Injection** | All queries via parameterised ORM (Prisma or Drizzle). No raw string interpolation |
| **XSS Protection** | Content-Security-Policy headers. React escapes by default. No dangerouslySetInnerHTML |
| **Admin Isolation** | Admin panel on separate subdomain. IP whitelist configurable. Separate JWT audience claim |
| **Secrets Management** | All secrets via environment variables. Never committed to source control. Use Vault or provider secrets in prod |

# **13\. Deployment Architecture**

## **13.1 Infrastructure Overview**

| Component | Platform | Scaling |
| :---- | :---- | :---- |
| **Public Web (Next.js)** | Vercel | Automatic edge CDN, serverless functions |
| **Client App (Next.js)** | Vercel | Automatic edge CDN, serverless functions |
| **Admin Panel (Next.js)** | Vercel | Automatic edge CDN, serverless functions |
| **API Server (Fastify)** | Railway (dev/staging) → AWS ECS eu-west-1 (prod) | Horizontal scale via container replicas \+ ALB |
| **Trade Engine (Node.js)** | Railway (dev/staging) → AWS ECS eu-west-1 (prod) | Single instance v1 (stateful Redis subscriber); horizontal in v2 |
| **Price Feed Service (Python)** | Railway (dev/staging) → AWS ECS eu-west-1 (prod) | Single instance; health-checked with auto-restart |
| **Notification Service** | Railway (dev/staging) → AWS ECS eu-west-1 (prod) | Single instance v1 |
| **PostgreSQL 16** | Railway managed (dev/staging) → AWS RDS eu-west-1 (prod) | Managed; ap-southeast-1 Singapore read replica in prod |
| **Redis 7** | Railway managed (dev/staging) → AWS ElastiCache eu-west-1 (prod) | Managed; cluster mode in v2 |
| **Object Storage** | Cloudflare R2 (preferred) / AWS S3 | Unlimited; pay per use |

## **13.2 Environment Configuration**

| \# API Server DATABASE\_URL=postgresql://... REDIS\_URL=redis://... JWT\_PRIVATE\_KEY=\<RS256 private key\> JWT\_PUBLIC\_KEY=\<RS256 public key\> JWT\_ACCESS\_EXPIRY=15m JWT\_REFRESH\_EXPIRY=7d \# NowPayments NOWPAYMENTS\_API\_KEY=\<key\> NOWPAYMENTS\_IPN\_SECRET=\<hmac secret\> \# Object Storage S3\_BUCKET=protrader-kyc-docs S3\_REGION=auto S3\_ACCESS\_KEY=\<key\> S3\_SECRET\_KEY=\<secret\> S3\_ENDPOINT=https://\<r2-account\>.r2.cloudflarestorage.com \# Email EMAIL\_PROVIDER=resend RESEND\_API\_KEY=\<key\> EMAIL\_FROM=noreply@protradersim.com \# Price Feed Service (Python) REDIS\_URL=redis://... POSTGRES\_URL=postgresql://... POLL\_INTERVAL\_SECONDS=2 STALE\_THRESHOLD\_SECONDS=10 |
| :---- |

## **13.3 CI/CD Pipeline**

* Source control: Git (GitHub / GitLab). Branch strategy: main (prod), develop (staging), feature/\* (dev)

* Frontend (Vercel): Auto-deploy on push to main. Preview deployments on PRs.

* Backend services: Dockerfile per service. CI pipeline (GitHub Actions): lint → test → build → push image → deploy.

* Database migrations: Prisma Migrate / Drizzle Kit. Migrations run as a pre-deploy step. Never auto-applied in production without review.

* Secrets: injected via platform secret manager (Railway / Render secrets, not .env files in repo).

# **14\. Notification Service**

## **14.1 Event Sources & Routing**

| Event | Source | In-App WS | Email |
| :---- | :---- | :---- | :---- |
| **Trade Engine: margin:call** | Trade Engine | Yes — margin:call event | Optional (configurable) |
| **Trade Engine: liquidation:triggered** | Trade Engine | Yes | Yes |
| **Trade Engine: position:closed (TP/SL)** | Trade Engine | Yes | No |
| **Order filled** | Trade Engine | Yes | No |
| **KYC status change** | Admin API | Yes | Yes |
| **Wallet deposit confirmed** | Webhook handler | Yes | Yes |
| **Withdrawal status update** | Admin API / payout webhook | Yes | Yes |
| **IB balance/bonus credited** | Admin API | Yes | Yes |
| **Email verification** | Auth service | No | Yes |
| **Password reset** | Auth service | No | Yes |
| **Registration welcome** | Auth service | No | Yes |

## **14.2 Email Templates (Transactional)**

* Provider: Resend (recommended) or SendGrid

* Templates: React Email components, compiled to HTML. Stored in /packages/emails.

* All emails branded to ProTraderSim with dark header, instrument ticker footer.

* Templates: welcome, email-verify, password-reset, kyc-approved, kyc-rejected, deposit-confirmed, withdrawal-processed, margin-call, liquidation-notice.

# **15\. Error Handling & Resilience**

## **15.1 Graceful Degradation Rules**

| Failure | Behaviour | User Impact |
| :---- | :---- | :---- |
| **Twelve Data fetch fails (\< 10s)** | Serve last cached price from Redis with stale=true | Amber 'Delayed' badge on prices |
| **Twelve Data fetch fails (\> 10s)** | Publish blockOrders:true tick | Order placement disabled; 'Market Offline' alert |
| **Redis unavailable** | API falls back to direct DB read for price snapshot (degraded performance) | Slower updates; no real-time push |
| **Trade Engine crash** | Process supervisor auto-restarts within 5s. Pending tick events queue in Redis | Brief gap in fills/metrics updates |
| **NowPayments webhook missed** | Polling job checks pending deposits every 5 min via NowPayments GET /payment/:id | Deposit credited within 5 min of confirmation |
| **DB connection lost** | Connection pool retries 3x with backoff; circuit breaker opens after 5 failures | API returns 503; frontend shows 'Service unavailable' |
| **Email send failure** | Retry queue (3 attempts, exponential backoff). Failed emails logged. | User may not receive email; in-app notification still delivered |

## **15.2 Transaction Integrity**

* All financial mutations (balance changes, position opens/closes, order fills) are wrapped in DB transactions

* Idempotency keys used for NowPayments webhook processing — duplicate webhooks are safe to receive

* Optimistic locking on accounts table: version column incremented on each balance update; stale writes rejected

* All ledger entries are append-only — no balance record is ever deleted or mutated post-creation

# **16\. Repository Structure**

| protrader-sim/  (monorepo — Turborepo or pnpm workspaces) ├── apps/ │   ├── web/              — Public marketing site (Next.js SSR) │   ├── app/              — Trader dashboard (Next.js CSR) │   ├── admin/            — IB Admin panel (Next.js CSR) │   ├── api/              — Fastify API server \+ WebSocket gateway │   ├── trade-engine/     — Order matching & financial calculations │   ├── price-feed/       — Python Twelve Data polling service │   └── notification/     — Email \+ WebSocket notification dispatcher ├── packages/ │   ├── ui/               — Shared React component library (shadcn/ui base) │   ├── emails/           — React Email templates │   ├── db/               — Prisma schema \+ migrations \+ generated client │   ├── types/            — Shared TypeScript types (DTOs, enums, event contracts) │   └── config/           — Shared ESLint, TypeScript, Tailwind configs ├── infra/ │   ├── docker/           — Dockerfiles per service │   └── deploy/           — Railway/Render config files ├── .github/workflows/    — CI/CD pipelines └── turbo.json            — Turborepo pipeline config |
| :---- |

# **17\. Key Architectural Decisions (ADR Summary)**

| Decision | Choice | Rationale |
| :---- | :---- | :---- |
| **Price feed provider** | Twelve Data (Python polling) | Free, no API key, covers all 60 symbols. Limitation: \~2s latency is acceptable for simulation |
| **WebSocket library** | Socket.io | Room-based pub/sub, auto-reconnect, fallback transport. Simplifies per-user and per-symbol broadcast |
| **DB for financial data** | PostgreSQL with BIGINT (cents) | ACID compliance, no floating-point errors, battle-tested for financial workloads |
| **Cache \+ bus** | Redis | Sub-millisecond pub/sub for tick distribution; key-value cache for hot data (positions, metrics) |
| **Trade Engine isolation** | Separate Node.js service | Financial logic isolated from HTTP concerns; can be independently scaled/restarted without affecting API |
| **Frontend rendering** | SSR for public, CSR for app | SSR on marketing pages for SEO; CSR for dashboard to enable real-time WebSocket state |
| **Multi-IB isolation** | ib\_id FK \+ middleware filter | Simple, auditable. No row-level security complexity. Super admin bypasses cleanly |
| **Object storage** | Cloudflare R2 | No egress fees; S3-compatible API; private bucket with signed URLs for KYC security |
| **ORM** | Prisma or Drizzle ORM | Type-safe queries; migration tooling; prevents raw SQL injection risk |
| **Monorepo** | Turborepo \+ pnpm workspaces | Shared types and components across 6 apps; coordinated builds and deployments |

*— End of Technical Architecture Document —*