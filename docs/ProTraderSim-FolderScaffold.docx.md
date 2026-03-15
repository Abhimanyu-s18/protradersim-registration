

**PROTRADER SIM**

Project Folder Scaffold

*Complete Monorepo Directory Structure — Every File, Every Directory, Fully Annotated*

Version 1.0  —  Scaffold Baseline  
Date: March 14, 2026  
Monorepo: Turborepo \+ pnpm workspaces

**CONFIDENTIAL — Internal Use Only**

# **Table of Contents**

# **1\. Overview & Conventions**

This document defines the complete folder and file structure for the ProTraderSim monorepo. Every directory and key file is listed with a purpose annotation. Developers should treat this as the canonical reference before creating any new file.

## **1.1 Monorepo Tooling**

* Package manager: pnpm 9 with workspaces

* Build orchestration: Turborepo — parallel builds, remote caching

* Node version: 20 LTS (enforced via .nvmrc and engines field in package.json)

* TypeScript: 5.x across all apps and packages

* Linting: ESLint with shared config from packages/config/eslint

* Formatting: Prettier with shared config from packages/config/prettier

## **1.2 Naming Conventions**

| Convention | Rule |
| :---- | :---- |
| Directories | kebab-case (e.g. trade-engine, price-feed) |
| TypeScript files | camelCase for utilities, PascalCase for components/classes |
| React components | PascalCase filename matching the export (e.g. OrderTicket.tsx) |
| API route files | kebab-case matching the URL path segment (e.g. auth.routes.ts) |
| DB migration files | NNN\_description.sql — zero-padded sequence prefix (e.g. 001\_extensions.sql) |
| Test files | Same name as source \+ .test.ts or .spec.ts suffix |
| Environment files | .env (never committed), .env.example (always committed) |
| Docker files | Dockerfile (no extension), docker-compose.yml |

## **1.3 Workspace Structure at a Glance**

| protrader-sim/ ├── apps/                    6 independently deployable applications │   ├── web/                 Public marketing site (Next.js SSR) │   ├── app/                 Trader dashboard (Next.js CSR) │   ├── admin/               IB Admin panel (Next.js CSR) │   ├── api/                 Fastify REST API \+ WebSocket gateway │   ├── trade-engine/        Order matching & financial calculation service │   ├── price-feed/          Python Twelve Data price polling service │   └── notification/        Email \+ WebSocket notification dispatcher ├── packages/                Shared code consumed by apps │   ├── ui/                  React component library (shadcn/ui base) │   ├── emails/              React Email transactional templates │   ├── db/                  Prisma schema, migrations, generated client │   ├── types/               Shared TypeScript types, DTOs, enums, WS contracts │   └── config/              Shared ESLint, TypeScript, Tailwind, Prettier configs ├── infra/                   Deployment and infrastructure config │   ├── docker/              Dockerfiles per service │   └── deploy/              Railway/Render service configs ├── .github/                 CI/CD GitHub Actions workflows ├── turbo.json               Turborepo pipeline definition ├── pnpm-workspace.yaml      Workspace package declarations ├── package.json             Root package.json — dev scripts only └── .nvmrc                   Node version pin (20) |
| :---- |

# **2\. Root-Level Files**

The repository root contains only workspace orchestration files. No application code lives here.

| File | Purpose |
| :---- | :---- |
| package.json | Root package — defines workspaces, shared dev scripts (lint:all, build:all, test:all, dev). No dependencies installed here. |
| pnpm-workspace.yaml | Declares workspace globs: apps/\*, packages/\* |
| turbo.json | Turborepo pipeline: build, dev, lint, test, typecheck tasks with correct dependency order and caching rules |
| .nvmrc | Node version pin: 20\. Used by CI and nvm users. |
| .gitignore | Global ignores: node\_modules, .env\*, dist, .turbo, .next, \_\_pycache\_\_, .venv |
| .prettierrc | Root Prettier config — extends packages/config/prettier |
| .eslintrc.js | Root ESLint config — extends packages/config/eslint/base |
| tsconfig.base.json | Root TypeScript config — path aliases and strict settings inherited by all packages |
| README.md | Project overview, quickstart, architecture links |
| CONTRIBUTING.md | Dev setup, branch strategy, PR process, coding standards |
| LICENSE | License file |

## **2.1 turbo.json**

| {   "$schema": "https://turbo.build/schema.json",   "globalDotEnv": \[".env"\],   "pipeline": {     "build": {       "dependsOn": \["^build"\],       "outputs": \[".next/\*\*", "dist/\*\*", "\!.next/cache/\*\*"\]     },     "dev": {       "cache": false,       "persistent": true     },     "lint": { "outputs": \[\] },     "typecheck": { "dependsOn": \["^build"\], "outputs": \[\] },     "test": {       "dependsOn": \["^build"\],       "outputs": \["coverage/\*\*"\]     }   } } |
| :---- |

## **2.2 pnpm-workspace.yaml**

| packages:   \- 'apps/\*'   \- 'packages/\*' |
| :---- |

# **3\. packages/ — Shared Libraries**

All shared code lives in packages/. Apps import from these packages by workspace name (e.g. @protrader/ui, @protrader/types). Packages never import from apps.

## **3.1 packages/types — Shared TypeScript Types**

Single source of truth for all types shared between frontend and backend: DTOs, enums, WebSocket event payloads, error codes. Zero runtime dependencies — types only.

| packages/types/ ├── package.json             name: @protrader/types ├── tsconfig.json └── src/     ├── index.ts             Re-exports everything     ├── enums/     │   ├── AssetClass.ts    'forex' | 'crypto' | 'indices' | 'commodities' | 'stocks'     │   ├── OrderType.ts     'market' | 'limit' | 'stop' | 'stop\_limit' | 'trailing\_stop' | 'oco'     │   ├── OrderStatus.ts   'pending' | 'filled' | 'cancelled' | 'rejected' | 'expired'     │   ├── TradeDirection.ts 'long' | 'short'     │   ├── PositionStatus.ts 'open' | 'closed' | 'liquidated'     │   ├── CloseReason.ts   'tp' | 'sl' | 'manual' | 'liquidation' | 'margin\_call'     │   ├── TransactionType.ts     │   ├── KycStatus.ts     'not\_started' | 'pending' | 'approved' | 'rejected'     │   └── UserRole.ts      'trader' | 'agent' | 'ib\_team\_leader' | 'super\_admin'     ├── dtos/                Data Transfer Objects (request \+ response shapes)     │   ├── auth/     │   │   ├── RegisterStep1Dto.ts     │   │   ├── RegisterStep2Dto.ts     │   │   ├── RegisterStep3Dto.ts     │   │   ├── RegisterStep4Dto.ts     │   │   ├── LoginDto.ts     │   │   └── AuthResponseDto.ts     │   ├── orders/     │   │   ├── PlaceOrderDto.ts     │   │   ├── ModifyOrderDto.ts     │   │   └── OrderResponseDto.ts     │   ├── positions/     │   │   ├── ClosePositionDto.ts     │   │   ├── ModifyPositionDto.ts     │   │   └── PositionResponseDto.ts     │   ├── wallet/     │   │   ├── InitiateDepositDto.ts     │   │   ├── WithdrawDto.ts     │   │   └── TransactionResponseDto.ts     │   ├── kyc/     │   │   └── KycStatusResponseDto.ts     │   └── account/     │       └── AccountMetricsDto.ts     ├── ws/                  WebSocket event payload types     │   ├── PriceTick.ts     │   ├── AccountMetricsEvent.ts     │   ├── PositionUpdateEvent.ts     │   ├── OrderFilledEvent.ts     │   ├── PositionClosedEvent.ts     │   ├── MarginCallEvent.ts     │   ├── LiquidationEvent.ts     │   ├── KycStatusEvent.ts     │   ├── WalletCreditedEvent.ts     │   └── NotificationEvent.ts     └── api/         ├── ApiResponse.ts   Generic ApiResponse\<T\> and ApiError wrapper         ├── PaginatedResponse.ts         └── ErrorCodes.ts    All standard error code string literals |
| :---- |

## **3.2 packages/db — Database Client & Migrations**

Prisma schema, all SQL migrations, and the generated Prisma client. The API server and Trade Engine both import the Prisma client from here. Never instantiate PrismaClient directly in an app — always use the singleton from this package.

| packages/db/ ├── package.json             name: @protrader/db ├── tsconfig.json ├── prisma/ │   ├── schema.prisma        Prisma schema — all 16 models matching the DB schema doc │   └── migrations/          SQL migration files (managed by prisma migrate) │       ├── 20240101\_001\_extensions/ │       │   └── migration.sql │       ├── 20240101\_002\_enums/ │       │   └── migration.sql │       ├── 20240101\_003\_trigger\_function/ │       │   └── migration.sql │       ├── 20240101\_004\_ib\_accounts/ │       │   └── migration.sql │       ├── 20240101\_005\_users/ │       │   └── migration.sql │       ├── 20240101\_006\_accounts/ │       │   └── migration.sql │       ├── 20240101\_007\_instruments/ │       │   └── migration.sql │       ├── 20240101\_008\_orders/ │       │   └── migration.sql │       ├── 20240101\_009\_positions/ │       │   └── migration.sql │       ├── 20240101\_010\_transactions/ │       │   └── migration.sql │       ├── 20240101\_011\_kyc\_submissions/ │       │   └── migration.sql │       ├── 20240101\_012\_deposits/ │       │   └── migration.sql │       ├── 20240101\_013\_withdrawals/ │       │   └── migration.sql │       ├── 20240101\_014\_bonuses/ │       │   └── migration.sql │       ├── 20240101\_015\_swap\_history/ │       │   └── migration.sql │       ├── 20240101\_016\_notifications/ │       │   └── migration.sql │       ├── 20240101\_017\_auth\_tables/ │       │   └── migration.sql │       ├── 20240101\_018\_seed\_super\_admin/ │       │   └── migration.sql │       └── 20240101\_019\_seed\_instruments/ │           └── migration.sql └── src/     ├── index.ts             Exports: prisma singleton, all Prisma types     ├── client.ts            PrismaClient singleton with connection pooling     └── seeds/               Standalone seed scripts (for dev resets)         ├── instruments.seed.ts         └── superadmin.seed.ts |
| :---- |

## **3.3 packages/ui — React Component Library**

All shared React components. Built on shadcn/ui primitives \+ Tailwind CSS. Used by apps/app and apps/admin. The apps/web has its own marketing-specific components.

| packages/ui/ ├── package.json             name: @protrader/ui ├── tsconfig.json ├── tailwind.config.ts       Shared Tailwind config — dark theme, custom colours └── src/     ├── index.ts             Re-exports all components     ├── primitives/          shadcn/ui base components (unstyled / lightly styled)     │   ├── Button.tsx     │   ├── Input.tsx     │   ├── Select.tsx     │   ├── Dialog.tsx     │   ├── Tooltip.tsx     │   ├── Badge.tsx     │   ├── Tabs.tsx     │   ├── Table.tsx     │   ├── Skeleton.tsx     │   ├── Spinner.tsx     │   └── Toast.tsx     ├── trading/             Trading-specific UI components     │   ├── PriceDisplay.tsx         Bid/ask with JetBrains Mono, stale badge     │   ├── OrderTicket.tsx          Buy/sell order form panel     │   ├── PositionRow.tsx          Single open position table row     │   ├── OrderRow.tsx             Single order history row     │   ├── MarginMeter.tsx          Margin level progress bar with thresholds     │   ├── AccountMetricsBar.tsx    Balance / Equity / Margin / Free Margin bar     │   ├── InstrumentSelector.tsx   Searchable dropdown for 60 instruments     │   ├── LotSizeInput.tsx         Lot size stepper with min/max validation     │   ├── TpSlInputs.tsx           Take Profit / Stop Loss price fields     │   ├── MarginCallAlert.tsx      Dismissable margin call warning banner     │   └── LiquidationToast.tsx     Liquidation notification toast     ├── layout/              Shared layout components     │   ├── Sidebar.tsx              Collapsible nav sidebar     │   ├── TopBar.tsx               Header bar with account summary \+ notifications bell     │   ├── PageWrapper.tsx          Standard page container with padding     │   └── SectionHeader.tsx        Page section title \+ optional action button     ├── data/                Data display components     │   ├── DataTable.tsx            TanStack Table wrapper with sorting/pagination     │   ├── StatCard.tsx             KPI metric card (label \+ value \+ delta)     │   ├── PnlDisplay.tsx           P\&L number with red/green colouring     │   ├── EmptyState.tsx           Empty list placeholder with icon \+ message     │   └── LoadingState.tsx         Full-page or inline loading skeleton     ├── forms/               Form utility components     │   ├── FormField.tsx            Label \+ Input \+ error message wrapper     │   ├── CurrencyInput.tsx        USD-formatted numeric input     │   ├── FileUpload.tsx           Drag-and-drop file upload (KYC docs)     │   └── OtpInput.tsx             6-digit OTP code input (email verify / 2FA)     └── charts/              Chart wrappers         ├── TradingViewWidget.tsx    TradingView embed wrapper with symbol prop         └── EquityChart.tsx          Recharts equity curve line chart |
| :---- |

## **3.4 packages/emails — Transactional Email Templates**

React Email components compiled to HTML and sent via Resend. All templates share a base layout with ProTraderSim branding.

| packages/emails/ ├── package.json             name: @protrader/emails ├── tsconfig.json └── src/     ├── index.ts             Exports renderEmail(templateName, props) helper     ├── layouts/     │   └── BaseLayout.tsx   Dark header, footer with unsubscribe, branded wrapper     └── templates/         ├── WelcomeEmail.tsx              Registration welcome         ├── VerifyEmailEmail.tsx          Email verification with token link         ├── PasswordResetEmail.tsx        Password reset with OTP link         ├── KycApprovedEmail.tsx          KYC approved — trading unlocked         ├── KycRejectedEmail.tsx          KYC rejected with rejection note         ├── KycReverifyEmail.tsx          Re-verification requested by IB         ├── DepositConfirmedEmail.tsx     Deposit credited confirmation         ├── WithdrawalProcessedEmail.tsx  Withdrawal sent confirmation         ├── WithdrawalRejectedEmail.tsx   Withdrawal rejected with reason         ├── MarginCallEmail.tsx           Margin level warning (optional send)         └── LiquidationEmail.tsx          Liquidation occurred summary |
| :---- |

## **3.5 packages/config — Shared Tooling Configs**

| packages/config/ ├── package.json             name: @protrader/config ├── eslint/ │   ├── base.js              Base ESLint rules for all TypeScript packages │   ├── nextjs.js            Next.js specific rules (extends base) │   └── node.js              Node.js server rules (extends base) ├── prettier/ │   └── index.js             Shared Prettier config (semi, singleQuote, etc.) ├── typescript/ │   ├── base.json            Strict TypeScript base (target ES2022, strict: true) │   ├── nextjs.json          Next.js tsconfig (extends base \+ JSX) │   └── node.json            Node.js tsconfig (extends base, no DOM lib) └── tailwind/     └── base.ts              Shared Tailwind preset: dark theme, colour tokens, fonts |
| :---- |

# **4\. apps/web — Public Marketing Site**

Server-side rendered Next.js 14 application. Serves the public landing page, legal documents, and the registration funnel. SEO-optimised. No trading functionality.

| apps/web/ ├── package.json             name: @protrader/web ├── tsconfig.json            Extends @protrader/config/typescript/nextjs ├── next.config.ts ├── tailwind.config.ts       Extends @protrader/config/tailwind/base ├── postcss.config.js ├── .env.example ├── public/ │   ├── favicon.ico │   ├── logo.svg │   ├── logo-white.svg │   └── images/              Hero and feature section images └── src/     ├── app/                 Next.js App Router     │   ├── layout.tsx       Root layout: fonts, metadata, analytics     │   ├── page.tsx         Landing page (Hero, Features, Assets, CTA)     │   ├── globals.css     │   ├── register/     │   │   └── page.tsx     Registration wizard entry (redirects to app.protradersim.com/register)     │   ├── about/     │   │   └── page.tsx     │   ├── markets/     │   │   └── page.tsx     Instrument overview table (public, SSR)     │   └── legal/     │       ├── terms/page.tsx     │       ├── privacy/page.tsx     │       ├── risk-disclosure/page.tsx     │       └── aml-policy/page.tsx     ├── components/          Marketing-specific components (not in shared UI)     │   ├── HeroSection.tsx     │   ├── FeaturesGrid.tsx     │   ├── AssetClassTabs.tsx     │   ├── LeverageTable.tsx     │   ├── TestimonialsSection.tsx     │   ├── CtaSection.tsx     │   ├── NavBar.tsx     │   └── Footer.tsx     └── lib/         └── instruments.ts   Static instrument data for SSR markets page |
| :---- |

| File | Notes |
| :---- | :---- |
| next.config.ts | Redirects /app/\* to app.protradersim.com. Sets security headers. Enables image domains. |
| .env.example | NEXT\_PUBLIC\_APP\_URL, NEXT\_PUBLIC\_API\_URL |

# **5\. apps/app — Trader Dashboard**

The primary trader-facing application. Client-side rendered after a lightweight auth shell. Contains all trading, wallet, KYC, portfolio, and notification screens.

| apps/app/ ├── package.json             name: @protrader/app ├── tsconfig.json ├── next.config.ts ├── tailwind.config.ts ├── postcss.config.js ├── middleware.ts            Auth guard — redirects unauthenticated to /login ├── .env.example ├── public/ │   ├── favicon.ico │   └── logo.svg └── src/     ├── app/                 Next.js App Router     │   ├── layout.tsx       Root layout: auth provider, query client, socket provider     │   ├── globals.css     │   ├── (auth)/          Route group — unauthenticated screens (no sidebar)     │   │   ├── layout.tsx   Centered card layout     │   │   ├── login/     │   │   │   └── page.tsx     │   │   ├── register/     │   │   │   └── page.tsx  Multi-step wizard (4 steps, one page, step state in Zustand)     │   │   ├── verify-email/     │   │   │   └── page.tsx  Token from URL query param     │   │   ├── forgot-password/     │   │   │   └── page.tsx     │   │   └── reset-password/     │   │       └── page.tsx     │   └── (dashboard)/     Route group — authenticated screens (sidebar \+ topbar)     │       ├── layout.tsx   Sidebar \+ TopBar wrapper     │       ├── dashboard/     │       │   └── page.tsx  Overview: account metrics, open positions, recent activity     │       ├── trade/     │       │   └── page.tsx  TradingView chart \+ Order Ticket \+ Positions panel     │       ├── orders/     │       │   └── page.tsx  Pending orders management table     │       ├── history/     │       │   └── page.tsx  Closed trades with filters and performance summary     │       ├── wallet/     │       │   ├── page.tsx  Wallet overview \+ transaction ledger     │       │   ├── deposit/     │       │   │   └── page.tsx  Coin/network selector \+ QR address display     │       │   └── withdraw/     │       │       └── page.tsx  Withdrawal form     │       ├── kyc/     │       │   └── page.tsx  KYC status \+ document upload form     │       ├── notifications/     │       │   └── page.tsx  Full notification history     │       └── settings/     │           ├── page.tsx  Profile settings     │           ├── security/     │           │   └── page.tsx  Password change \+ 2FA setup     │           └── preferences/     │               └── page.tsx  UI preferences (theme, language)     ├── components/          App-specific components (not in shared packages/ui)     │   ├── trading/     │   │   ├── TradePage.tsx            Full trading page layout controller     │   │   ├── ChartPanel.tsx           TradingView widget \+ symbol/timeframe controls     │   │   ├── OpenPositionsPanel.tsx   Live positions table with real-time P\&L     │   │   ├── PendingOrdersPanel.tsx   Pending orders with modify/cancel actions     │   │   └── MarketWatchPanel.tsx     Scrollable instrument list with live prices     │   ├── dashboard/     │   │   ├── AccountSummaryCard.tsx     │   │   ├── RecentActivityFeed.tsx     │   │   └── EquityCurveCard.tsx     │   ├── wallet/     │   │   ├── DepositAddress.tsx        QR \+ copy address \+ countdown timer     │   │   └── TransactionTypeBadge.tsx  Coloured badge for tx type     │   ├── kyc/     │   │   ├── KycStatusBanner.tsx     │   │   └── DocumentUploadForm.tsx     │   └── navigation/     │       ├── AppSidebar.tsx     │       └── AppTopBar.tsx     ├── hooks/               Custom React hooks     │   ├── useAuth.ts             Access auth state from Zustand     │   ├── useSocket.ts           Socket.io connection \+ auto-reconnect     │   ├── usePrices.ts           Subscribe to price ticks for given symbols     │   ├── useAccountMetrics.ts   Real-time account metrics from WS     │   ├── usePositions.ts        Open positions with WS floating P\&L overlay     │   ├── useOrders.ts           Pending orders     │   ├── useNotifications.ts    Unread count \+ list     │   └── useTradeForm.ts        Order ticket form logic \+ margin calc preview     ├── stores/              Zustand stores     │   ├── authStore.ts           accessToken, user, login(), logout()     │   ├── priceStore.ts          Map\<symbol, PriceTick\> — updated by WS     │   ├── metricsStore.ts        AccountMetricsDto — updated by WS     │   ├── positionStore.ts       Open positions — base from REST, overlaid by WS     │   ├── notificationStore.ts   Notifications \+ unread count     │   └── registrationStore.ts   Multi-step wizard state     ├── lib/     │   ├── api/     │   │   ├── client.ts          Axios instance: base URL, auth header, refresh interceptor     │   │   ├── auth.api.ts        All /auth/\* calls     │   │   ├── orders.api.ts      All /orders/\* calls     │   │   ├── positions.api.ts   All /positions/\* calls     │   │   ├── wallet.api.ts      All /wallet/\* calls     │   │   ├── kyc.api.ts         All /kyc/\* calls     │   │   ├── instruments.api.ts All /instruments/\* calls     │   │   ├── account.api.ts     All /account/\* calls     │   │   └── notifications.api.ts     │   ├── queryKeys.ts           TanStack Query key factory     │   ├── formatters.ts          formatCurrency, formatPips, formatLots, formatDate     │   ├── marginCalc.ts          Client-side margin preview (does NOT affect server)     │   └── tvSymbolMap.ts         Internal symbol → TradingView symbol mapping (60 entries)     └── providers/         ├── AuthProvider.tsx       Checks token on mount, initialises auth store         ├── QueryProvider.tsx      TanStack Query client setup         └── SocketProvider.tsx     Creates and provides Socket.io connection |
| :---- |

# **6\. apps/admin — IB Admin Panel**

Multi-IB administration panel. IB admins see only their own clients. Super admin has global view. Deployed at admin.protradersim.com.

| apps/admin/ ├── package.json             name: @protrader/admin ├── tsconfig.json ├── next.config.ts ├── tailwind.config.ts ├── middleware.ts            Auth guard — requires ib\_admin or super\_admin role ├── .env.example └── src/     ├── app/     │   ├── layout.tsx     │   ├── globals.css     │   ├── (auth)/     │   │   └── login/page.tsx     Admin login (separate from trader login)     │   └── (panel)/             Authenticated admin screens     │       ├── layout.tsx        Admin sidebar \+ top bar     │       ├── dashboard/     │       │   └── page.tsx      KPIs: signups, AUM, open positions, pending items     │       ├── users/     │       │   ├── page.tsx      User list with filters (KYC status, country, date)     │       │   └── \[userId\]/     │       │       └── page.tsx  Full user detail: profile, account, KYC, history     │       ├── kyc/     │       │   └── page.tsx      KYC review queue — inline document viewer     │       ├── balance/     │       │   └── page.tsx      Credit/debit and bonus grant forms     │       ├── withdrawals/     │       │   └── page.tsx      Pending withdrawal approvals     │       ├── reports/     │       │   ├── page.tsx      Overview stats and chart     │       │   └── volume/     │       │       └── page.tsx  Volume breakdown by asset class / date     │       └── settings/     │           └── page.tsx      Admin profile and password change     ├── components/     │   ├── users/     │   │   ├── UserListTable.tsx     │   │   ├── UserDetailPanel.tsx     │   │   ├── UserStatusBadge.tsx     │   │   └── LockAccountDialog.tsx     │   ├── kyc/     │   │   ├── KycQueueTable.tsx     │   │   ├── DocumentViewer.tsx      Renders signed URLs in iframe / img     │   │   ├── ApproveKycDialog.tsx     │   │   └── RejectKycDialog.tsx     Free-text rejection note input     │   ├── balance/     │   │   ├── CreditDebitForm.tsx     │   │   └── BonusGrantForm.tsx     │   ├── withdrawals/     │   │   ├── WithdrawalQueueTable.tsx     │   │   └── WithdrawalDetailDialog.tsx     │   ├── dashboard/     │   │   ├── KpiGrid.tsx     │   │   └── RecentSignupsTable.tsx     │   └── navigation/     │       ├── AdminSidebar.tsx     │       └── AdminTopBar.tsx     ├── hooks/     │   ├── useAdminUsers.ts     │   ├── useKycQueue.ts     │   └── useWithdrawals.ts     └── lib/         ├── api/         │   ├── client.ts          Admin API Axios instance (admin subdomain base URL)         │   ├── adminUsers.api.ts         │   ├── adminKyc.api.ts         │   ├── adminBalance.api.ts         │   ├── adminWithdrawals.api.ts         │   └── adminReports.api.ts         └── queryKeys.ts |
| :---- |

# **7\. apps/api — API Server**

Fastify 4 REST API server and Socket.io WebSocket gateway. The central backend service. All business logic is delegated to service classes; routes are thin controllers.

| apps/api/ ├── package.json             name: @protrader/api ├── tsconfig.json ├── .env.example ├── Dockerfile └── src/     ├── main.ts              Entry point — creates Fastify app, registers plugins, starts server     ├── app.ts               App factory: registers all plugins, routes, hooks     ├── plugins/             Fastify plugins (registered in order)     │   ├── cors.ts          CORS config — allow app.protradersim.com \+ admin.protradersim.com     │   ├── helmet.ts        Security headers     │   ├── rateLimit.ts     @fastify/rate-limit with Redis store     │   ├── jwt.ts           @fastify/jwt — RS256 key loading     │   ├── cookie.ts        @fastify/cookie — httpOnly refresh token     │   ├── multipart.ts     @fastify/multipart — KYC file uploads     │   ├── socketio.ts      @fastify/socket.io — WS gateway setup     │   ├── redis.ts         ioredis client singleton plugin     │   └── prisma.ts        @protrader/db PrismaClient decoration on fastify     ├── routes/              Route definitions — thin, delegate to services     │   ├── index.ts         Registers all route modules     │   ├── auth.routes.ts     │   ├── users.routes.ts     │   ├── kyc.routes.ts     │   ├── instruments.routes.ts     │   ├── orders.routes.ts     │   ├── positions.routes.ts     │   ├── account.routes.ts     │   ├── wallet.routes.ts     │   ├── portfolio.routes.ts     │   ├── notifications.routes.ts     │   ├── webhooks.routes.ts     │   └── admin/     │       ├── index.ts     Registers all admin routes under /admin prefix     │       ├── adminUsers.routes.ts     │       ├── adminKyc.routes.ts     │       ├── adminBalance.routes.ts     │       ├── adminWithdrawals.routes.ts     │       └── adminReports.routes.ts     ├── services/            Business logic — one file per domain     │   ├── auth.service.ts            Registration, login, token management     │   ├── users.service.ts           Profile CRUD     │   ├── kyc.service.ts             KYC submission, status management     │   ├── instruments.service.ts     Instrument list with Redis price overlay     │   ├── orders.service.ts          Order placement, validation, modification     │   ├── positions.service.ts       Position queries, close, TP/SL modification     │   ├── account.service.ts         Account metrics snapshot     │   ├── wallet.service.ts          Deposit initiation, withdrawal, tx history     │   ├── portfolio.service.ts       Closed trade history, performance summary     │   ├── notifications.service.ts   Notification list, mark read     │   ├── nowpayments.service.ts     NowPayments API calls \+ IPN webhook processing     │   ├── storage.service.ts         S3/R2 signed URL generation, multipart upload     │   ├── email.service.ts           Resend/SendGrid dispatch via @protrader/emails     │   └── admin/     │       ├── adminUsers.service.ts     │       ├── adminKyc.service.ts     │       ├── adminBalance.service.ts     │       ├── adminWithdrawals.service.ts     │       └── adminReports.service.ts     ├── middleware/          Fastify hooks used as middleware     │   ├── authenticate.ts  Verifies JWT, attaches user to request     │   ├── requireRole.ts   Role-based access: requireRole('agent' | 'ib\_team\_leader')     │   ├── scopeToIb.ts     Injects ib\_id into all admin route handlers     │   └── requireKyc.ts    Blocks order placement if kyc\_status \!= approved     ├── schemas/             Zod schemas \+ Fastify JSON Schema (one per route group)     │   ├── auth.schema.ts     │   ├── orders.schema.ts     │   ├── positions.schema.ts     │   ├── wallet.schema.ts     │   └── kyc.schema.ts     ├── ws/                  WebSocket gateway logic     │   ├── gateway.ts       Socket.io setup: auth, rooms, event routing     │   ├── priceSubscriber.ts  Redis subscribe price:\* → broadcast to price:\<symbol\> rooms     │   └── accountSubscriber.ts Redis subscribe account:metrics:\* → push to user rooms     └── lib/         ├── logger.ts        Pino logger with request ID         ├── errors.ts        AppError class, error handler plugin         ├── crypto.ts        Token generation, HMAC verification (NowPayments IPN)         ├── pagination.ts    Offset pagination helper         └── constants.ts     App-wide constants (token TTLs, rate limit windows) |
| :---- |

| Key File | Responsibility |
| :---- | :---- |
| src/main.ts | Server entry: Fastify app, port binding, graceful shutdown on SIGTERM |
| src/app.ts | Plugin registration order matters — Redis before routes, JWT before auth middleware |
| src/plugins/socketio.ts | Registers Socket.io, sets up auth middleware on connect, exports io instance |
| src/middleware/scopeToIb.ts | Reads ib\_id from JWT claim, injects into fastify.request.ibId for all admin routes |
| src/services/nowpayments.service.ts | verifySignature(), processIpn() — the two critical NowPayments functions |
| src/ws/priceSubscriber.ts | Subscribes to Redis price:\* pub/sub, calls io.to('price:SYMBOL').emit(...) |

# **8\. apps/trade-engine — Trade Engine**

Standalone Node.js service. Subscribes to all price channels on Redis. Runs the tick evaluation loop: fills orders, calculates P\&L, enforces margins, executes liquidations.

| CRITICAL:  The Trade Engine is the only service authorised to write to the positions and orders tables. The API server submits orders but does not fill them — that is the Trade Engine's sole responsibility. |
| :---- |

| apps/trade-engine/ ├── package.json             name: @protrader/trade-engine ├── tsconfig.json ├── .env.example ├── Dockerfile └── src/     ├── main.ts              Entry: Redis subscribe ALL price:\*, start scheduler     ├── engine/     │   ├── TickProcessor.ts        Main per-tick evaluation orchestrator     │   ├── OrderFiller.ts          Determines if pending orders trigger, executes fills     │   ├── PositionEvaluator.ts    Floating P\&L, TP/SL hit detection, trailing stop update     │   ├── MarginCalculator.ts     Equity, margin used, free margin, margin level     │   ├── LiquidationEngine.ts    Sort-and-close logic for stop-out events     │   └── SwapScheduler.ts        Daily UTC 00:00 cron — applies swap charges     ├── repositories/        DB access layer — all financial writes go through here     │   ├── PositionRepository.ts   Open/close positions, bulk updates     │   ├── OrderRepository.ts      Fill orders, cancel OCO partners     │   ├── AccountRepository.ts    Balance updates with optimistic locking     │   └── TransactionRepository.ts Append-only ledger inserts     ├── cache/               Redis read helpers     │   ├── PositionCache.ts        5s cached open positions per account     │   ├── OrderCache.ts           5s cached pending orders per symbol     │   └── InstrumentCache.ts      Instrument config (loaded once on startup)     ├── publisher/     │   └── EventPublisher.ts       Publishes account:metrics:userId to Redis pub/sub     └── lib/         ├── logger.ts         ├── financialMath.ts        NUMERIC-safe arithmetic helpers (no floating-point)         └── constants.ts            Margin thresholds, slippage ranges, max latency |
| :---- |

| Key File | Responsibility |
| :---- | :---- |
| src/engine/TickProcessor.ts | Entry point for each tick: loads positions/orders from cache, calls evaluators, batches all DB writes in a single transaction |
| src/engine/LiquidationEngine.ts | Sorts positions by floating P\&L ascending, closes worst first, loops until margin safe or account empty |
| src/engine/SwapScheduler.ts | node-cron job at '0 0 \* \* \*' UTC — iterates all open positions, applies swap, inserts swap\_history rows |
| src/lib/financialMath.ts | All arithmetic done with Decimal.js to match BIGINT (cents) DB precision |

# **9\. apps/price-feed — Price Feed Service**

Standalone Python 3.11 service. The only component that touches Twelve Data. Polls all 60 symbols every 2 seconds and publishes normalised bid/ask ticks to Redis.

| apps/price-feed/ ├── pyproject.toml           Python project config (replaces setup.py) ├── requirements.txt         twelvedata, redis, asyncio, psycopg2-binary, pydantic ├── .env.example ├── Dockerfile └── src/     ├── main.py              Entry: load config, start async poll loop     ├── poller/     │   ├── twelvedata\_client.py   Async Twelve Data batch fetching (3 batches of 20\)     │   └── poll\_loop.py         asyncio loop: fetch → normalise → publish → sleep 2s     ├── normaliser/     │   ├── tick\_builder.py      Builds PriceTick from raw Twelve Data data \+ spread     │   └── stale\_tracker.py     Tracks consecutive failures per symbol, sets stale flag     ├── publisher/     │   └── redis\_publisher.py   PUBLISH price:\<symbol\>, SETEX latest:\<symbol\>     ├── config/     │   ├── settings.py          Pydantic settings: REDIS\_URL, POSTGRES\_URL, POLL\_INTERVAL     │   └── instruments.py       Loads instrument config (spreads) from DB on startup     └── lib/         ├── logger.py         └── health.py            Simple HTTP /health endpoint (for container healthcheck) |
| :---- |

| Key File | Responsibility |
| :---- | :---- |
| src/poller/poll\_loop.py | Core async loop: asyncio.gather on 3 batches, publishes results, sleeps 2s |
| src/normaliser/stale\_tracker.py | Increments failure counter per symbol; emits stale=True after 3, blockOrders=True after 5 failures |
| src/config/instruments.py | Single DB query on startup to load spread per symbol into memory dict — never queries DB per tick |
| Dockerfile | python:3.11-slim base, non-root user, HEALTHCHECK /health |

# **10\. apps/notification — Notification Service**

Lightweight Node.js service that listens for internal events on Redis pub/sub and dispatches: in-app WebSocket notifications (via the API server's Socket.io rooms) and transactional emails (via Resend).

| apps/notification/ ├── package.json             name: @protrader/notification ├── tsconfig.json ├── .env.example ├── Dockerfile └── src/     ├── main.ts              Entry: subscribe to notification:\* Redis channel, start worker     ├── dispatcher/     │   ├── EventRouter.ts         Routes incoming event to correct handler     │   ├── WebSocketDispatcher.ts Publishes to api:ws:emit Redis channel     │   │                          (API server subscribes and calls socket.io.to().emit())     │   └── EmailDispatcher.ts     Calls @protrader/emails renderEmail \+ Resend API     ├── handlers/            One handler per notification event type     │   ├── MarginCallHandler.ts     │   ├── LiquidationHandler.ts     │   ├── OrderFilledHandler.ts     │   ├── PositionClosedHandler.ts     │   ├── KycStatusHandler.ts     │   ├── WalletCreditedHandler.ts     │   ├── WithdrawalUpdatedHandler.ts     │   └── AuthNotificationHandler.ts  email verify, password reset, welcome     ├── db/     │   └── NotificationWriter.ts  Writes rows to notifications table     └── lib/         ├── logger.ts         └── resendClient.ts   Resend SDK singleton |
| :---- |

| DESIGN NOTE:  The Notification Service never connects to Socket.io directly. It publishes formatted payloads to a Redis channel (api:ws:emit) that the API server subscribes to and forwards through Socket.io. This keeps the notification service stateless and Socket.io sessions in one place. |
| :---- |

# **11\. infra/ — Infrastructure & Deployment**

## **11.1 infra/docker — Dockerfiles**

| infra/docker/ ├── api.Dockerfile           Node 20 slim — builds API server ├── trade-engine.Dockerfile  Node 20 slim — builds Trade Engine ├── price-feed.Dockerfile    Python 3.11 slim — builds Price Feed ├── notification.Dockerfile  Node 20 slim — builds Notification Service └── docker-compose.yml       Local dev: all services \+ PostgreSQL \+ Redis |
| :---- |

## **11.2 infra/deploy — Deployment Configs**

| infra/deploy/ ├── railway/ │   ├── api.railway.json         Railway service config: replicas, health check path │   ├── trade-engine.railway.json │   ├── price-feed.railway.json │   └── notification.railway.json └── vercel/     ├── web.vercel.json          Vercel project config for apps/web     ├── app.vercel.json          Vercel project config for apps/app     └── admin.vercel.json        Vercel project config for apps/admin |
| :---- |

## **11.3 docker-compose.yml (Local Dev)**

| \# infra/docker/docker-compose.yml version: '3.9' services:   postgres:     image: postgres:16     environment:       POSTGRES\_DB: protrader       POSTGRES\_USER: protrader       POSTGRES\_PASSWORD: protrader\_dev     ports: \['5432:5432'\]     volumes: \['postgres\_data:/var/lib/postgresql/data'\]   redis:     image: redis:7-alpine     ports: \['6379:6379'\]   api:     build: { context: ../.. , dockerfile: infra/docker/api.Dockerfile }     env\_file: apps/api/.env     ports: \['3001:3001'\]     depends\_on: \[postgres, redis\]   trade-engine:     build: { context: ../.. , dockerfile: infra/docker/trade-engine.Dockerfile }     env\_file: apps/trade-engine/.env     depends\_on: \[postgres, redis\]   price-feed:     build: { context: ../.. , dockerfile: infra/docker/price-feed.Dockerfile }     env\_file: apps/price-feed/.env     depends\_on: \[redis\]   notification:     build: { context: ../.. , dockerfile: infra/docker/notification.Dockerfile }     env\_file: apps/notification/.env     depends\_on: \[postgres, redis\] volumes:   postgres\_data: |
| :---- |

# **12\. .github/ — CI/CD Pipelines**

| .github/ ├── workflows/ │   ├── ci.yml               PR checks: lint, typecheck, test (runs on every PR) │   ├── deploy-staging.yml   Auto-deploy to staging on push to develop branch │   ├── deploy-prod.yml      Deploy to production on push to main branch │   └── db-migrate.yml       Manual trigger: run Prisma migrations on target env └── PULL\_REQUEST\_TEMPLATE.md |
| :---- |

## **12.1 ci.yml Overview**

| \# Triggered on: pull\_request to main or develop jobs:   lint-and-typecheck:     runs-on: ubuntu-latest     steps:       \- uses: actions/checkout@v4       \- uses: pnpm/action-setup@v3       \- run: pnpm install \--frozen-lockfile       \- run: pnpm turbo run lint typecheck   test:     runs-on: ubuntu-latest     services:       postgres: { image: postgres:16, env: ..., ports: \['5432:5432'\] }       redis:    { image: redis:7, ports: \['6379:6379'\] }     steps:       \- uses: actions/checkout@v4       \- run: pnpm install \--frozen-lockfile       \- run: pnpm turbo run test   build:     needs: \[lint-and-typecheck, test\]     runs-on: ubuntu-latest     steps:       \- run: pnpm turbo run build |
| :---- |

# **13\. Test Structure**

Tests live alongside source files, not in a separate top-level \_\_tests\_\_ directory. Each app and package owns its own tests. The integration test suite lives in apps/api.

| apps/api/src/ ├── services/ │   ├── auth.service.ts │   └── auth.service.test.ts         Unit tests for auth service (mocked DB) ├── routes/ │   ├── orders.routes.ts │   └── orders.routes.test.ts        Integration tests: HTTP \+ real test DB └── \_\_tests\_\_/     └── integration/         ├── setup.ts                 Test DB migrations \+ seed minimal data         └── teardown.ts              Truncate tables between tests apps/trade-engine/src/ ├── engine/ │   ├── LiquidationEngine.ts │   └── LiquidationEngine.test.ts    Unit: liquidation scenarios with mocked prices │   ├── MarginCalculator.ts │   └── MarginCalculator.test.ts     Unit: all financial formula assertions │   ├── OrderFiller.ts │   └── OrderFiller.test.ts          Unit: all 7 order type fill conditions packages/types/src/ │   — No tests (types only) packages/db/src/ └── \_\_tests\_\_/     └── migrations.test.ts           Smoke test: all migrations apply cleanly |
| :---- |

| Test Layer | Scope & Tooling |
| :---- | :---- |
| Unit tests | Pure function and service tests with mocked dependencies. Vitest. Fast — no DB required. |
| Integration tests | Full HTTP request through route → service → real test DB. Vitest \+ Fastify inject(). Requires running PostgreSQL and Redis. |
| Financial math tests | Exhaustive assertion suite for MarginCalculator and LiquidationEngine. Every formula, edge case, and rounding scenario. |
| E2E tests (v2) | Playwright — trader registration → deposit → trade → close flow. Not in v1 scope. |

# **14\. Environment Variables — Full Reference**

Each app has its own .env file. Variables are never shared via root .env. All .env files are gitignored. .env.example files are committed.

## **14.1 apps/api/.env.example**

| \# Server PORT=3001 NODE\_ENV=development API\_BASE\_URL=http://localhost:3001 \# Database DATABASE\_URL=postgresql://protrader:protrader\_dev@localhost:5432/protrader \# Redis REDIS\_URL=redis://localhost:6379 \# JWT (RS256) JWT\_PRIVATE\_KEY=\<base64 encoded RS256 private key\> JWT\_PUBLIC\_KEY=\<base64 encoded RS256 public key\> JWT\_ACCESS\_EXPIRY=15m JWT\_REFRESH\_EXPIRY=7d \# CORS CORS\_ORIGINS=http://localhost:3000,http://localhost:3002 \# Object Storage (Cloudflare R2 / AWS S3) S3\_ENDPOINT=https://\<account\>.r2.cloudflarestorage.com S3\_BUCKET=protrader-kyc-docs S3\_REGION=auto S3\_ACCESS\_KEY= S3\_SECRET\_KEY= S3\_SIGNED\_URL\_EXPIRY=900 \# Email EMAIL\_PROVIDER=resend RESEND\_API\_KEY= EMAIL\_FROM=noreply@protradersim.com \# NowPayments NOWPAYMENTS\_API\_KEY= NOWPAYMENTS\_IPN\_SECRET= NOWPAYMENTS\_SANDBOX=true |
| :---- |

## **14.2 apps/trade-engine/.env.example**

| DATABASE\_URL=postgresql://protrader:protrader\_dev@localhost:5432/protrader REDIS\_URL=redis://localhost:6379 NODE\_ENV=development LOG\_LEVEL=info SWAP\_CRON=0 0 \* \* \*          \# UTC 00:00 daily SLIPPAGE\_MAX\_PIPS=2          \# Max random slippage on market fills FILL\_LATENCY\_MIN\_MS=50       \# Min simulated order fill delay FILL\_LATENCY\_MAX\_MS=200      \# Max simulated order fill delay |
| :---- |

## **14.3 apps/price-feed/.env**

| REDIS\_URL=redis://localhost:6379 DATABASE\_URL=postgresql://protrader:protrader\_dev@localhost:5432/protrader POLL\_INTERVAL\_SECONDS=2 STALE\_WARN\_FAILURES=3        \# Failures before stale badge STALE\_BLOCK\_FAILURES=5       \# Failures before order blocking LOG\_LEVEL=INFO |
| :---- |

## **14.4 apps/notification/.env.example**

| REDIS\_URL=redis://localhost:6379 DATABASE\_URL=postgresql://protrader:protrader\_dev@localhost:5432/protrader RESEND\_API\_KEY= EMAIL\_FROM=noreply@protradersim.com NODE\_ENV=development |
| :---- |

## **14.5 apps/app/.env.example  &  apps/admin/.env.example**

| NEXT\_PUBLIC\_API\_URL=http://localhost:3001/api/v1 NEXT\_PUBLIC\_WS\_URL=http://localhost:3001 NEXT\_PUBLIC\_APP\_URL=http://localhost:3000 NEXT\_PUBLIC\_ADMIN\_URL=http://localhost:3002 |
| :---- |

# **15\. Development Quickstart**

| \# 1\. Clone the repo git clone https://github.com/your-org/protrader-sim.git cd protrader-sim \# 2\. Install dependencies pnpm install \# 3\. Start infrastructure (PostgreSQL \+ Redis) docker compose \-f infra/docker/docker-compose.yml up postgres redis \-d \# 4\. Set up environment files cp apps/api/.env.example apps/api/.env cp apps/trade-engine/.env.example apps/trade-engine/.env cp apps/price-feed/.env.example apps/price-feed/.env cp apps/notification/.env.example apps/notification/.env cp apps/app/.env.example apps/app/.env cp apps/admin/.env.example apps/admin/.env \# Edit each .env with your local values \# 5\. Run DB migrations and seed data cd packages/db && pnpm prisma migrate deploy && pnpm prisma db seed \# 6\. Start all services with Turborepo pnpm dev \# This starts: web (:3003), app (:3000), admin (:3002), \#              api (:3001), trade-engine, price-feed, notification \# 7\. Individual service start (for focused dev) pnpm \--filter @protrader/api dev pnpm \--filter @protrader/app dev \# 8\. Run all tests pnpm test \# 9\. Run linting and type-check pnpm turbo run lint typecheck |
| :---- |

*— End of Project Folder Scaffold —*