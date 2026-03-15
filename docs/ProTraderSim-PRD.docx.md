

**PROTRADERSIM**

Multi-Asset CFD Simulation Trading Platform

*Product Requirements Document*

Version 0.1  —  Initial Draft  
Date: March 14, 2026  
Author: Claude (Anthropic) in collaboration with Client

**CONFIDENTIAL — Internal Use Only**

# **Table of Contents**

# **1\. Executive Summary**

ProTraderSim is a web-based, multi-asset CFD simulation trading platform designed to deliver a 100% authentic trading experience that is indistinguishable from a live brokerage. Operating with offshore leverage up to 1:500 across 60 real-time priced instruments, the platform provides retail traders a risk-free environment to practise professional-grade order execution, margin/risk management, and portfolio tracking.

The platform operates on an Introducing Broker (IB) model with a four-level role hierarchy: Super Admin, IB Team Leader, IB Agent, and Trader. IB Team Leaders build and manage teams of Agents. Agents manage assigned traders with limited access. Every trader must enter a unique Pool Code at registration to join their IB pool. Traders start with a $0 balance, complete multi-step KYC through a two-step review workflow (Agent recommendation → Team Leader final approval), and receive funds via NowPayments.io crypto deposits or IB balance injection.

The product covers the full surface area of a production retail brokerage: a futuristic, marketing-forward public website; authenticated trading dashboard; TradingView-powered charting; real-time P\&L, margin, and liquidation engine; order management with every professional order type; and a complete wallet \+ transaction ledger.

# **2\. Goals & Non-Goals**

## **2.1 Goals (v1 MVP)**

* Deliver a simulated CFD trading environment that is visually and functionally indistinguishable from a live trading platform.

* Support 50+ real-time priced assets across Forex, Crypto, Commodities, Indices, and Stocks.

* Implement professional order types: Market, Limit, Stop, Stop-Limit, Trailing Stop, OCO, and TP/SL brackets.

* Execute trades with realistic latency simulation, partial fill logic, slippage, and spread.

* Provide a complete real-time financial metrics engine: Margin, Free Margin, Margin Level %, Equity, Floating P\&L, Realized P\&L.

* Implement a full liquidation engine: Margin Call alerts at configurable thresholds and Auto-Liquidation at breach.

* Deliver a complete IB Admin Panel: user management, KYC review, balance injection, bonus allocation, and lead tracking.

* Integrate NowPayments.io as the sole crypto payment gateway for deposits and withdrawals.

* Build a multi-step user registration and full KYC document upload workflow.

* Launch a futuristic, high-conversion public landing page and supporting marketing pages.

## **2.2 Non-Goals (Out of Scope for v1)**

* Live/real money trading or connectivity to actual brokerage APIs (e.g. cTrader, MT4 bridge).

* Native mobile applications (iOS / Android). Mobile-responsive web only.

* Nested multi-level IB trees (the four-level hierarchy — Super Admin, IB Team Leader, Agent, Trader — is the full supported model).

* Social/copy trading features.

* Automated trading / bot API (public REST API for algo trading).

* Fiat payment gateways (bank wire, card). Crypto-only via NowPayments.io.

* Multi-language / multi-currency UI (English \+ USD in v1).

* Email marketing automation or CRM integration beyond lead capture.

# **3\. Target Users & Use Cases**

## **3.1 User Personas**

### **Retail Trader (End User)**

* Aspiring or active retail trader wanting to practise CFD trading without risking real capital.

* Comfortable with crypto payments; may be located in regions with limited brokerage access.

* Expects a professional, fast, reliable trading interface identical to a live broker.

### **IB Team Leader**

* Operates a client network; acquires leads and manages their trading accounts.

* Needs full visibility of all registered users, their KYC status, balances, and trading activity.

* Controls wallet top-ups, bonus grants, and KYC approvals from a dedicated admin panel.

## **3.2 Primary Use Cases / User Stories**

1. As a Retail Trader, I want to register and complete KYC so that I can be approved and funded by my IB.

2. As a Retail Trader, I want to deposit crypto via NowPayments.io so that my wallet balance reflects the received amount.

3. As a Retail Trader, I want to place a Buy Stop order on EUR/USD with a TP and SL so that my trade auto-closes at my target or stop level.

4. As a Retail Trader, I want to see real-time margin level, equity, and floating P\&L on my dashboard so that I always know my account health.

5. As a Retail Trader, I want to receive a Margin Call notification and understand my liquidation risk so that I can act before auto-liquidation.

6. As an IB Admin, I want to view all newly registered users as leads in my dashboard so that I can track acquisition.

7. As an IB Admin, I want to review KYC documents and approve or reject them so that compliant users can start trading.

8. As an IB Admin, I want to inject balance or a tradable bonus into a user's account so that they can begin trading immediately after approval.

9. As an IB Admin, I want to see a live summary of all open positions, equity, and trading volume across all managed accounts.

# **4\. Platform Pages & UI Structure**

All pages are web-responsive. The UI must feel futuristic, dark-themed, and consistent with a premium financial brand.

## **4.1 Public Pages (Unauthenticated)**

* Landing Page — Hero section, asset ticker tape, leverage highlights, feature showcase, testimonials, CTA. Design reference: ICMarkets, Exness, XM — professional forex broker aesthetic with dark/navy hero, trust badges, animated price feeds, and strong conversion CTAs.

* Markets Page — Live preview of 50+ instruments with prices, % change, spread.

* About Page — Company narrative, team, offshore regulatory framing.

* Features Page — Deep-dive on platform capabilities.

* Pricing / Accounts Page — Account tiers, spreads, leverage table.

* Legal Pages — Terms & Conditions, Privacy Policy, Risk Disclosure, AML Policy.

* Contact Page — Support form and contact details.

## **4.2 Auth Pages**

* Register — Multi-step (Step 1: Personal details; Step 2: Address; Step 3: Trading experience; Step 4: Password & consent).

* Login — Email \+ password, remember me, CAPTCHA.

* Forgot Password — Email OTP reset flow.

* Email Verification — Token-based confirmation.

## **4.3 KYC Pages**

* KYC Upload — Government ID (front \+ back), Proof of Address, Selfie with ID. Upload status tracker.

* KYC Status — Shows Pending / Approved / Rejected with reason.

## **4.4 Authenticated User Pages**

* Dashboard — Account summary cards (Balance, Equity, Margin, Free Margin, Floating P\&L, Margin Level %), open positions mini-table, recent transactions, market movers widget.

* Trading Panel — TradingView chart widget (full), order ticket (side panel), depth of market, open positions & order tabs, one-click trade mode.

* Markets — Full asset list with real-time prices, search, filter by category, star favourites, click-to-trade.

* Order Management — Pending orders table, order history, filters by date/asset/type, cancel/modify actions.

* Portfolio — Closed trades history, P\&L breakdown by asset, performance metrics, downloadable statement.

* Wallet — Balance summary, deposit (NowPayments.io flow), withdrawal request form, bonus balance, transaction history table with status.

* My Profile — Personal details edit, password change, 2FA setup, referral code.

* KYC — Upload / re-upload documents, live status.

* Notifications — In-app notification centre (margin calls, KYC updates, balance credits, system alerts).

* Settings — Theme toggle (dark/light), notification preferences, session management.

## **4.5 IB Admin Panel Pages**

* Admin Dashboard — Aggregate stats scoped to the logged-in IB: total clients, total equity, total volume, pending KYC count, daily signups. Super-admin sees cross-IB global stats.

* Users / Leads — Full user list with search/filter, registration date, KYC status, balance, equity, trading status.

* User Detail — Per-user view: profile, KYC docs viewer, balance controls, bonus controls, trade history, transaction log.

* KYC Management — Queue of pending KYC submissions with document viewer, Approve / Reject actions \+ reason field.

* Balance Management — Add/deduct balance per user with memo; full ledger of IB-initiated transactions.

* Bonus Management — Add tradable bonus with expiry and conditions; view active/used/expired bonuses.

* Reports — Volume by asset, P\&L distribution, deposit/withdrawal summary, user activity.

# **5\. Functional Requirements**

## **5.1 Authentication & Registration**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| Multi-Step Registration | 4-step wizard collecting personal info, address, trading profile, and account credentials. | User successfully creates account and receives verification email. | **Must Have** |
| Email Verification | Token link emailed post-registration; account locked until verified. | Unverified users cannot log in. | **Must Have** |
| Login | Email \+ password authentication with JWT session and refresh tokens. | User authenticates and receives access token; invalid credentials return error. | **Must Have** |
| Forgot Password | Email OTP / link flow to reset password securely. | User can reset password via email link within 15-minute window. | **Must Have** |
| Session Management | Auto-logout after configurable inactivity period; concurrent session limit. | Session expires after 30 min idle; re-login required. | **Must Have** |
| 2FA (TOTP) | Optional TOTP-based two-factor authentication via authenticator app. | User can enable/disable 2FA; login requires OTP when enabled. | **Should Have** |

## **5.2 KYC Workflow**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| Document Upload | User uploads Gov ID (front \+ back), Proof of Address, and Selfie. Supports JPG, PNG, PDF up to 10MB. | Files uploaded successfully; file type and size validated client-side and server-side. | **Must Have** |
| KYC Status Tracking | User sees live status: Not Started, Pending Review, Approved, Rejected. | Status updates in real-time via polling or WebSocket push. | **Must Have** |
| KYC Two-Step Review | Step 1: Agent reviews documents, selects Recommend Approve or Recommend Reject (mandatory note if reject). Step 2: IB Team Leader sees recommendation and makes final binding decision (Approve or Reject). | Trader not notified until Team Leader makes final decision. 3 rejections triggers lock requiring Super Admin unlock. | **Must Have** |
| KYC Re-submission | Rejected users can re-upload corrected documents. IB admin can also trigger re-verification for any approved user at any time via admin panel. | Re-verification trigger resets KYC status to Pending and notifies user to re-upload. Documents do not expire automatically. | **Must Have** |

## **5.3 Asset Catalogue & Real-Time Prices**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| 50+ Instruments | Asset categories: Forex (major/minor pairs), Crypto (BTC, ETH, etc.), Commodities (Gold, Oil), Indices (S\&P500, NASDAQ), Stocks (AAPL, TSLA, etc.). | All 50+ assets display live bid/ask prices with configurable spread. | **Must Have** |
| Real-Time Price Feed | Prices update in real-time via WebSocket. Source: TradingView widget data or a market data API (e.g. Twelve Data, Polygon). | Prices visually flash on update; max 1-second delay from source. | **Must Have** |
| Spread Configuration | Each instrument has a configurable spread (pips) set by IB in admin. | Spread is applied to bid/ask at the data layer before display. | **Must Have** |
| Instrument Metadata | Each asset stores: symbol, category, pip size, lot size, margin %, swap rates (long/short), trading hours. | Metadata drives all trade calculations. | **Must Have** |

## **5.4 Order Types & Trade Execution**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| Market Order | Instant execution at current ask (buy) or bid (sell) with simulated 50–200ms latency and configurable slippage. | Order fills within latency window; fill price within slippage band. | **Must Have** |
| Limit Order | Pending order that fills when price reaches specified level. Stored until triggered or cancelled. | Order activates and fills at limit price when market touches it. | **Must Have** |
| Stop Order | Buy Stop / Sell Stop: activates and fills at market when trigger price is reached. | Order converts to market order at trigger price. | **Must Have** |
| Stop-Limit Order | Two-price order: activates at stop price, fills at limit price or better. | Fills only within limit price; otherwise stays pending. | **Must Have** |
| Trailing Stop | Stop loss that moves with price by a specified distance (pips). Locks in gains. | Trailing stop adjusts on every tick; triggers on reversal equal to trail distance. | **Must Have** |
| OCO (One Cancels Other) | Two linked orders; execution of one cancels the other. | On fill of either leg, partner order is automatically cancelled. | **Must Have** |
| TP / SL Bracket | Take Profit and Stop Loss attached to any position or order. | Position auto-closes when market hits TP or SL; P\&L calculated and recorded. | **Must Have** |
| Partial Close | User can close a portion of an open position by specifying lot size. | Remaining position continues with adjusted margin. | **Should Have** |
| Modify Order | User can modify TP, SL, and price of any pending order. | Changes reflected immediately in order book and P\&L calculations. | **Must Have** |

## **5.5 Financial Metrics Engine (Real-Time)**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| Balance | Cash balance excluding open P\&L. Updated on trade close, deposit, withdrawal, fee charge. | Balance \= prev balance \+ realized P\&L \- fees \+ deposits \- withdrawals. | **Must Have** |
| Equity | Real-time account value including floating P\&L. Equity \= Balance \+ Floating P\&L. | Equity updates on every price tick for open positions. | **Must Have** |
| Margin Used | Sum of margin requirements across all open positions. Margin \= (Lot Size × Contract Size × Price) / Leverage. | Margin Used recalculates on each position open/close. | **Must Have** |
| Free Margin | Available margin for new trades. Free Margin \= Equity \- Margin Used. | Free Margin updates in real-time; negative triggers Margin Call. | **Must Have** |
| Margin Level % | Health indicator. Margin Level \= (Equity / Margin Used) × 100\. | Displayed as percentage; colour-coded (green \> 100%, amber 50–100%, red \< 50%). | **Must Have** |
| Floating P\&L | Unrealized gain/loss on open positions based on current market price. | Calculated per position and aggregated; updates every tick. | **Must Have** |
| Swap / Rollover | Daily swap charges or credits applied at rollover time (configurable, e.g. 00:00 server time) based on instrument swap rates. | Swap applied to open positions daily; recorded in transaction log. | **Must Have** |
| Commission | Per-trade commission for configured instrument types (e.g. stocks, crypto). | Commission deducted from balance on trade open/close; recorded in ledger. | **Should Have** |
| Spread Cost | Implicit cost of bid-ask spread factored into fill price. | Buy fills at ask, sell fills at bid; spread cost visible in trade detail. | **Must Have** |

## **5.6 Risk Management & Liquidation Engine**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| Margin Call Alert | Notification triggered when Margin Level drops below configurable threshold (default: 80%). | In-app and optionally email/SMS notification sent on breach. | **Must Have** |
| Stop-Out / Liquidation | Auto-close positions (largest losing first) when Margin Level drops below Stop-Out level (default: 50%). | Liquidation engine fires synchronously on each tick; positions closed at market; event logged. | **Must Have** |
| Negative Balance Protection | Account balance cannot go below $0. Losses are capped at account equity. | If equity \< 0 after liquidation, balance is reset to $0 and event is flagged. | **Must Have** |
| Per-Asset-Class Leverage | Leverage varies by asset class and segment as per the confirmed leverage table (60 instruments). Forex Majors: 1:500, Forex Minors: 1:300, Forex Exotics: 1:50–1:100. Crypto Large/Mid Cap: 1:10–1:20. Indices: 1:50–1:100. Commodities: 1:25–1:200 (Gold highest at 1:200). Stocks: 1:10–1:20. | Margin calculation uses instrument-specific leverage. UI shows leverage ratio on order ticket per selected instrument. | **Must Have** |
| Leverage Enforcement | Platform prevents order placement if the required margin (calculated at instrument leverage) would exceed the account's free margin. | Order rejected with 'Insufficient margin' error. No exceptions — server-side validation only. | **Must Have** |
| Daily Loss Limit (Optional) | Configurable per-account daily loss limit. Trading suspended if breached. | System blocks new orders and notifies IB when daily loss limit is hit. | **Nice to Have** |
| Maximum Position Size | Per-instrument max lot size limits configurable by IB. | Order rejected if lot size exceeds instrument maximum. | **Should Have** |

## **5.7 Wallet & Transactions**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| Crypto Deposit via NowPayments.io | User initiates deposit, selects coin (USDT via TRC20 or ERC20, or ETH). Platform calls NowPayments.io API to generate a payment address. Network fee warning shown per network. IPN webhook updates balance on payment confirmation. | Deposit reflected in balance within 1 network confirmation; transaction recorded with coin, network, and amount. | **Must Have** |
| Withdrawal Request | User submits withdrawal with crypto wallet address and amount. Request queued for IB approval. | Withdrawal request visible in IB admin; approved amounts trigger NowPayments.io payout or manual process. | **Must Have** |
| IB Balance Injection | IB admin can credit any user's real balance directly from admin panel with a memo. | Balance updated immediately; transaction type \= 'IB Credit'; visible in user ledger. | **Must Have** |
| Tradable Bonus | IB admin grants a tradable, non-withdrawable bonus. Bonus acts as additional capital providing a larger trading cushion and reducing margin call risk. No expiry — IB can revoke manually. | Bonus shown as separate line in wallet. Withdrawal validation never allows bonus withdrawal. Bonus has no automatic expiry. | **Must Have** |
| Transaction History | Full ledger of all wallet events: deposits, withdrawals, IB credits, bonuses, P\&L settlements, swaps, commissions. | Every event has: timestamp, type, amount, status, reference ID. | **Must Have** |
| Bonus Balance Tracking | Bonus and real balance tracked separately. Losses absorbed by bonus first, protecting real balance. Bonus acts as a safety buffer. | If bonus depleted by losses, real balance absorbs subsequent losses. Bonus balance visible in all dashboard metrics. | **Must Have** |

## **5.8 IB Admin Panel**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| User Lead List | All registered users displayed as leads with registration date, KYC status, balance, equity, and trading activity. | New user registrations appear in real-time or within 60 seconds. | **Must Have** |
| User Detail View | Drill-down per user: full profile, KYC document viewer, balance/bonus controls, trade history, transaction log. | All user data accessible in single view; actions take effect immediately. | **Must Have** |
| KYC Review Queue | List of pending KYC submissions with document preview. Approve/Reject with reason. | Status change propagated to user within 5 seconds via WebSocket or polling. | **Must Have** |
| Balance & Bonus Management | Input fields to add/deduct real balance and add bonus. All changes logged with admin ID \+ memo. | Balance updates reflected on user dashboard in real-time. | **Must Have** |
| Reporting | Exportable reports: user list (CSV), trading volume, P\&L, deposit/withdrawal summary by date range. | Reports download as CSV within 5 seconds for up to 10,000 rows. | **Should Have** |
| Admin Authentication & Multi-IB | Separate login for IB admins. Multiple IB admin accounts supported, each scoped to their own client pool. Super-admin role can manage all IBs. | IB admin sees only their registered clients. Super-admin has global view. Role enforced at API level. | **Must Have** |

## **5.9 Notifications**

| Feature | Description | Acceptance Criteria | Priority |
| :---- | :---- | :---- | :---- |
| In-App Notification Centre | Bell icon in nav with unread count badge. Notification types: Margin Call, KYC update, Balance credit, Trade executed, Withdrawal status, System alerts. | Notifications delivered in-app within 2 seconds of event via WebSocket. | **Must Have** |
| Email Notifications | Transactional emails: registration, email verification, password reset, KYC status, deposit confirmed, margin call. | Emails delivered within 60 seconds via transactional email service (e.g. SendGrid, Resend). | **Must Have** |

# **6\. Non-Functional Requirements**

## **6.1 Performance**

* Price feed WebSocket tick latency: \< 1 second end-to-end.

* Trade execution round-trip (UI submit → confirmation): \< 500ms (simulated latency excluded).

* Dashboard initial load: \< 2 seconds on standard broadband.

* Financial metrics recalculation per tick: \< 50ms server-side.

* API endpoints: 95th-percentile response time \< 200ms under 500 concurrent users.

## **6.2 Security**

* All data in transit over HTTPS / WSS (TLS 1.2+).

* Passwords hashed with bcrypt (cost factor ≥ 12).

* JWT access tokens expire in 15 min; refresh tokens in 7 days, stored in httpOnly cookies.

* KYC documents stored in private object storage (not publicly accessible); access via signed URLs only.

* NowPayments.io IPN webhook verified via HMAC signature.

* Rate limiting on all auth endpoints (login, register, password reset).

* Input validation and parameterized queries throughout to prevent SQLi / XSS.

* Admin panel on a separate subdomain with IP whitelist option.

## **6.3 Scalability**

* Architecture must support 1,000 concurrent authenticated users at launch with a clear path to 10,000.

* Price feed and metrics engine must be horizontally scalable (stateless workers \+ shared cache).

* Database connection pooling and query optimisation for real-time read-heavy workload.

## **6.4 Reliability**

* Target uptime: 99.5% excluding scheduled maintenance.

* Graceful degradation: if price feed drops, display last known price with a stale data warning rather than crashing.

* All financial transactions (balance changes, trade closures) must be atomic and idempotent.

## **6.5 Accessibility**

* Meets WCAG 2.1 Level AA for all public pages.

* Keyboard navigable authentication and KYC flows.

## **6.6 Browser & Device Support**

* Desktop: Chrome 120+, Firefox 120+, Edge 120+, Safari 17+.

* Mobile web: iOS Safari 16+, Android Chrome 120+. Fully responsive, no native app.

# **7\. Technical Constraints & Preferences**

## **7.1 Suggested Tech Stack**

The following stack is recommended based on the real-time, financial-grade requirements of the platform:

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| Frontend | Next.js 14 (React), TypeScript, Tailwind CSS | SSR for public pages (SEO), CSR for trading dashboard |
| State Mgmt | Zustand \+ React Query / TanStack Query | Lightweight global state; server state caching |
| Charting | TradingView Lightweight / Advanced Charts Widget | Industry-standard; no backend required for chart data |
| Backend | Node.js, Fastify (or NestJS for structure) | High I/O throughput; WebSocket native support |
| Real-Time | WebSockets (Socket.io or native ws) | Bi-directional push for prices, metrics, notifications |
| Database | PostgreSQL (primary) \+ Redis (cache / pub-sub) | ACID transactions for financial data; Redis for tick cache |
| File Storage | AWS S3 or Cloudflare R2 (private bucket) | KYC documents; signed URL access only |
| Auth | JWT (access \+ refresh) \+ bcrypt | Stateless, scalable; httpOnly cookie for refresh token |
| Email | Resend or SendGrid | Transactional email reliability |
| Payments | NowPayments.io REST API \+ IPN Webhooks | Specified by client; handles crypto deposits/withdrawals |
| Hosting | Vercel (frontend) \+ Railway / Render / VPS (backend) | Zero-config deployment; scalable |
| Price Data | Twelve Data (Python) via backend polling → Redis → WebSocket broadcast | Free, no API key required; 50+ instruments via ticker symbols |

## **7.2 Integrations**

* NowPayments.io — Crypto deposit address generation (USDT TRC20, USDT ERC20, ETH), IPN webhook for payment confirmation, mass payout API for withdrawals.

* TradingView Widget — Embedded Advanced Chart widget in trading panel only (no custom data feed). Symbol mapping required for all 50+ instruments.

* Twelve Data (Python) — Backend price polling service fetches real-time bid/ask approximations via Twelve Data ticker data, publishes to Redis pub/sub, broadcast to clients via WebSocket.

* Email Service — Transactional email (SendGrid / Resend) for auth, KYC, and notification emails.

## **7.3 Constraints**

* All financial logic (margin calculations, liquidation, P\&L) must run server-side. Never trust client-sent financial values.

* Platform must be deployable on standard VPS / cloud infrastructure — no proprietary dependencies.

* KYC documents must never be served via a public URL; signed expiring URLs only.

# **8\. High-Level Architecture**

The platform is split into four major layers that communicate via REST API, WebSocket, and event queues.

## **8.1 Component Overview**

* Public Web (Next.js SSR) — Landing page, marketing pages, auth pages. SEO-optimised.

* Client App (Next.js CSR) — Authenticated dashboard, trading panel, wallet, KYC, settings. Connects to backend via REST \+ WebSocket.

* IB Admin Panel (Next.js or React SPA) — Separate subdomain. Connects to Admin API.

* API Server (Fastify/NestJS) — Central backend. Handles auth, orders, wallet, user management, KYC. Exposes REST endpoints and a WebSocket gateway.

* Price Feed Service (Python) — Polls Twelve Data for all 50+ instrument prices on a configurable interval (e.g. 1–2 seconds). Applies configured per-instrument spread to derive bid/ask. Publishes tick data to Redis pub/sub channel.

* Trade Engine — Subscribes to Redis tick channel. Evaluates pending orders and open positions on every tick. Triggers fills, TP/SL executions, swap application, and liquidation checks.

* Notification Service — Consumes internal events (margin call, KYC status, deposit confirmed). Dispatches in-app WebSocket pushes and email via SendGrid/Resend.

* PostgreSQL — Primary persistent store for users, accounts, positions, orders, transactions, KYC records.

* Redis — Tick cache (latest price per symbol), pub/sub for price broadcast, session store.

* Object Storage (S3/R2) — KYC document storage. Write-once, read via signed URL.

## **8.2 Data Flow — Trade Execution**

10. Client submits order via REST POST /orders.

11. API Server validates margin sufficiency, instrument config, and user state.

12. Order written to PostgreSQL with status PENDING.

13. For Market Orders: Trade Engine picks up order, applies slippage, fills immediately, writes OPEN position, deducts margin.

14. For Pending Orders: Trade Engine monitors tick stream. On price match, order fills as above.

15. On every tick: Trade Engine recalculates Floating P\&L, Equity, Free Margin, Margin Level for all accounts with open positions. Pushes updated metrics to clients via WebSocket.

16. Liquidation check: if Margin Level \< Stop-Out threshold, liquidation routine fires for that account.

# **9\. Confirmed Decisions Log**

All architectural and product decisions have been resolved. The table below documents confirmed decisions for the development team's reference.

| Decision | Confirmed Answer | Implementation Note |
| :---- | :---- | :---- |
| IB Admin Model | Multi-IB: multiple IB admin accounts supported | Role-based access control with per-IB user scope. Each IB sees only their own clients. |
| Landing Page Style | No blog in v1. Design reference: ICMarkets, Exness, XM | Professional forex broker aesthetic — dark/navy hero, animated ticker tape, trust badges, clean CTAs. No CMS required in v1. |
| KYC Rejection Criteria | Manual: IB admin writes a free-text comment/reason on rejection | Rejection form includes a required comment field. Comment is shown to the user in their KYC status page so they know what to fix. |
| Twelve Data Polling & Stale Handling | Poll every 2 seconds per batch. Stale threshold: 5 seconds | Fetch all 60 symbols in batches of 20 concurrently. On stale: show last price with amber 'Delayed' badge. Block new order placement after 10 seconds of consecutive failures. |
| NowPayments Accepted Coins | USDT (TRC20 \+ ERC20) and ETH | Two coins only in v1. Coin selector shown on deposit screen. Network fee warning displayed per network. Additional coins can be enabled via NowPayments dashboard without code changes. |

# **10\. Success Criteria**

The platform is considered ready for launch when all of the following are verifiable:

17. A new user can register, complete all 4 registration steps, verify their email, and access the dashboard.

18. KYC documents can be uploaded, reviewed by IB admin, and status change is reflected to the user within 5 seconds.

19. IB admin can credit a user's balance; the user sees the updated balance on their dashboard in real-time.

20. All 7 order types can be placed, monitored, and closed correctly, with accurate P\&L calculation.

21. Real-time prices for all 50+ instruments update on the Trading Panel with \< 1 second visible delay.

22. Margin Level, Equity, Free Margin, and Floating P\&L update in real-time as prices move.

23. When Margin Level drops below 80%, a Margin Call notification is triggered in-app.

24. When Margin Level drops below 50%, the liquidation engine closes positions and the account balance is settled correctly.

25. A crypto deposit via NowPayments.io reflects in the user wallet balance after 1 confirmation.

26. TradingView chart loads with correct instrument symbol and responds to order placement markers.

27. The platform passes a manual 'realism test': an experienced trader cannot distinguish it from a live CFD broker UI.

# **Appendix A — Full Instrument Leverage Table**

60 confirmed instruments across 5 asset classes. Leverage values are per-instrument maximums. The margin engine must load these at runtime from a database-backed configuration table, allowing IB admin to adjust individual instrument leverage without a code deployment.

## **A.1 Asset Class Summary**

| Asset Class | Avg Leverage | Max Leverage | \# Assets |
| :---- | :---- | :---- | :---- |
| Forex | 1:331 (avg) | 1:500 | 18 |
| Crypto | 1:12 (avg) | 1:20 | 12 |
| Indices | 1:95 (avg) | 1:100 | 10 |
| Commodities | 1:59 (avg) | 1:200 | 10 |
| Stocks | 1:19 (avg) | 1:20 | 10 |

## **A.2 Full Instrument List**

| Asset Class | Symbol | Segment | Max Leverage | Leverage (x) |
| :---- | :---- | :---- | :---- | :---- |
| Forex | EUR/USD | Major | 1:500 | 500 |
| Forex | GBP/USD | Major | 1:500 | 500 |
| Forex | USD/JPY | Major | 1:500 | 500 |
| Forex | USD/CHF | Major | 1:500 | 500 |
| Forex | AUD/USD | Major | 1:500 | 500 |
| Forex | USD/CAD | Major | 1:500 | 500 |
| Forex | NZD/USD | Major | 1:500 | 500 |
| Forex | EUR/GBP | Minor | 1:300 | 300 |
| Forex | EUR/JPY | Minor | 1:300 | 300 |
| Forex | GBP/JPY | Minor | 1:300 | 300 |
| Forex | AUD/JPY | Minor | 1:300 | 300 |
| Forex | EUR/AUD | Minor | 1:300 | 300 |
| Forex | GBP/CHF | Minor | 1:300 | 300 |
| Forex | CAD/JPY | Minor | 1:300 | 300 |
| Forex | USD/SGD | Exotic | 1:100 | 100 |
| Forex | USD/HKD | Exotic | 1:100 | 100 |
| Forex | USD/ZAR | Exotic | 1:100 | 100 |
| Forex | USD/TRY | Exotic | 1:50 | 50 |
| Crypto | BTC/USD | Large Cap | 1:20 | 20 |
| Crypto | ETH/USD | Large Cap | 1:20 | 20 |
| Crypto | SOL/USD | Large Cap | 1:10 | 10 |
| Crypto | XRP/USD | Large Cap | 1:10 | 10 |
| Crypto | ADA/USD | Large Cap | 1:10 | 10 |
| Crypto | DOGE/USD | Large Cap | 1:10 | 10 |
| Crypto | LTC/USD | Mid Cap | 1:10 | 10 |
| Crypto | BCH/USD | Mid Cap | 1:10 | 10 |
| Crypto | LINK/USD | Mid Cap | 1:10 | 10 |
| Crypto | AVAX/USD | Mid Cap | 1:10 | 10 |
| Crypto | DOT/USD | Mid Cap | 1:10 | 10 |
| Crypto | MATIC/USD | Mid Cap | 1:10 | 10 |
| Indices | US30 | Major Index | 1:100 | 100 |
| Indices | US500 | Major Index | 1:100 | 100 |
| Indices | USTEC | Major Index | 1:100 | 100 |
| Indices | UK100 | Major Index | 1:100 | 100 |
| Indices | GER40 | Major Index | 1:100 | 100 |
| Indices | FRA40 | Major Index | 1:100 | 100 |
| Indices | EU50 | Major Index | 1:100 | 100 |
| Indices | JPN225 | Major Index | 1:100 | 100 |
| Indices | AUS200 | Major Index | 1:100 | 100 |
| Indices | HK50 | Major Index | 1:50 | 50 |
| Commodities | XAU/USD | Precious Metal | 1:200 | 200 |
| Commodities | XAG/USD | Precious Metal | 1:100 | 100 |
| Commodities | XPT/USD | Precious Metal | 1:50 | 50 |
| Commodities | XPD/USD | Precious Metal | 1:50 | 50 |
| Commodities | WTI Crude | Energy | 1:50 | 50 |
| Commodities | Brent Crude | Energy | 1:50 | 50 |
| Commodities | Natural Gas | Energy | 1:25 | 25 |
| Commodities | Copper | Industrial Metal | 1:25 | 25 |
| Commodities | Corn | Agriculture | 1:20 | 20 |
| Commodities | Wheat | Agriculture | 1:20 | 20 |
| Stocks | AAPL | Large Cap Equity | 1:20 | 20 |
| Stocks | MSFT | Large Cap Equity | 1:20 | 20 |
| Stocks | NVDA | Large Cap Equity | 1:20 | 20 |
| Stocks | AMZN | Large Cap Equity | 1:20 | 20 |
| Stocks | GOOGL | Large Cap Equity | 1:20 | 20 |
| Stocks | META | Large Cap Equity | 1:20 | 20 |
| Stocks | TSLA | Large Cap Equity | 1:10 | 10 |
| Stocks | JPM | Large Cap Equity | 1:20 | 20 |
| Stocks | V | Large Cap Equity | 1:20 | 20 |
| Stocks | WMT | Large Cap Equity | 1:20 | 20 |

*\* Leverage values are stored in the instruments configuration table (DB). IB admin can adjust any instrument's leverage via the Admin Panel without code changes. Changes take effect on next order placement; existing open positions are not affected.*

*— End of Document —*