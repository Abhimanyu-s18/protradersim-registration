

**PROTRADER SIM**

Database Schema Document

*Full DDL, Indexes, Constraints & Seed Data*

Version 1.0  —  Schema Baseline  
Date: March 14, 2026  
Database: PostgreSQL 16

**CONFIDENTIAL — Internal Use Only**

# **Table of Contents**

# **1\. Overview**

This document is the authoritative database specification for ProTraderSim. It defines every table, column, data type, constraint, index, and trigger in the PostgreSQL 16 schema. It also includes complete seed data for all reference tables.

| CRITICAL:  All monetary balance and ledger values use BIGINT storing integer cents (USD × 100). $1.00 stored as 100\. Guarantees deterministic integer arithmetic with zero floating-point drift. Price levels, rates, spread, and lot sizes retain NUMERIC precision. App layer: cents \= Math.round(usd \* 100); usd \= cents / 100\. Always use Decimal.js for boundary conversions. |
| :---- |

## **1.1 Design Principles**

* Financial precision: BIGINT (integer cents) for all balance, ledger, and amount fields — NUMERIC for price levels, rates, spread, and lot sizes

* UUID primary keys: All tables use gen\_random\_uuid() for distributed-safe IDs

* Append-only ledger: Transactions table is never mutated after creation — only status updates

* Audit trail: Every table carries created\_at and updated\_at, managed by trigger

* Soft deletes: No financial records are hard-deleted. is\_active or status flags used instead

* IB isolation: ib\_id FK on users enforces multi-IB data scoping at the DB layer

* Referential integrity: All foreign keys defined with appropriate ON DELETE behaviour

## **1.2 Schema at a Glance**

| Table | Row Estimate (1yr) | Purpose |
| :---- | :---- | :---- |
| **ib\_accounts** | \< 100 | IB admin accounts and super admin |
| **users** | \< 50,000 | Registered trader accounts |
| **accounts** | \< 50,000 | Financial account per user (1:1 with users) |
| **instruments** | 60 (static) | All 60 tradable instruments with config |
| **positions** | \~5,000,000 | All open and closed trade positions |
| **orders** | \~5,000,000 | All order records (pending, filled, cancelled) |
| **transactions** | \~10,000,000 | Full financial ledger — every balance change |
| **kyc\_submissions** | \< 50,000 | KYC document submissions per user |
| **deposits** | \< 200,000 | NowPayments.io deposit tracking |
| **withdrawals** | \< 100,000 | Withdrawal requests and payout status |
| **bonuses** | \< 200,000 | Bonus grants per user from IB admin |
| **notifications** | \~20,000,000 | In-app notification records |
| **refresh\_tokens** | \< 500,000 | Active refresh token store |
| **email\_verifications** | \< 50,000 | Email verification tokens |
| **password\_resets** | \< 50,000 | Password reset OTP tokens |
| **swap\_history** | \~5,000,000 | Daily swap charge audit records |

# **2\. Extensions & Enum Types**

## **2.1 Required Extensions**

| \-- Enable UUID generation CREATE EXTENSION IF NOT EXISTS "pgcrypto"; \-- Enable full-text search (for admin user search) CREATE EXTENSION IF NOT EXISTS "pg\_trgm"; |
| :---- |

## **2.2 Enum Types**

Using PostgreSQL native ENUM types for columns with a fixed, known set of values. This enforces valid values at the DB level and improves query performance.

| \-- User roles (4-level hierarchy) CREATE TYPE user\_role AS ENUM ('trader', 'agent', 'ib\_team\_leader', 'super\_admin'); \-- KYC submission status (includes two-step review states) CREATE TYPE kyc\_status AS ENUM (   'not\_started', 'pending', 'pending\_tl\_review', 'approved', 'rejected' ); \-- KYC agent recommendation (Step 1 of two-step review) CREATE TYPE kyc\_recommendation AS ENUM ('recommend\_approve', 'recommend\_reject'); \-- Trade direction CREATE TYPE trade\_direction AS ENUM ('long', 'short'); \-- Position status CREATE TYPE position\_status AS ENUM ('open', 'closed', 'liquidated'); \-- Reason a position was closed CREATE TYPE close\_reason AS ENUM ('tp', 'sl', 'manual', 'liquidation', 'margin\_call'); \-- Order types CREATE TYPE order\_type AS ENUM (   'market', 'limit', 'stop', 'stop\_limit', 'trailing\_stop', 'oco' ); \-- Order status CREATE TYPE order\_status AS ENUM (   'pending', 'filled', 'cancelled', 'rejected', 'expired' ); \-- Transaction types CREATE TYPE transaction\_type AS ENUM (   'deposit', 'withdrawal', 'withdrawal\_hold', 'withdrawal\_hold\_release',   'ib\_credit', 'ib\_debit',   'bonus\_grant', 'bonus\_revoke', 'trade\_pnl',   'swap', 'commission', 'liquidation\_settle' ); \-- Transaction status CREATE TYPE transaction\_status AS ENUM (   'pending', 'completed', 'failed', 'reversed' ); \-- Asset classes CREATE TYPE asset\_class AS ENUM (   'forex', 'crypto', 'indices', 'commodities', 'stocks' ); \-- Deposit / withdrawal payment status CREATE TYPE payment\_status AS ENUM (   'waiting', 'confirming', 'confirmed', 'finished',   'partially\_paid', 'failed', 'refunded', 'expired' ); |
| :---- |

# **3\. Shared Trigger: updated\_at**

A single trigger function is created once and applied to every table that requires automatic updated\_at management.

| CREATE OR REPLACE FUNCTION trigger\_set\_updated\_at() RETURNS TRIGGER AS $$ BEGIN   NEW.updated\_at \= NOW();   RETURN NEW; END; $$ LANGUAGE plpgsql; \-- Applied to each table as: \-- CREATE TRIGGER set\_updated\_at \-- BEFORE UPDATE ON \<table\_name\> \-- FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); |
| :---- |

# **4\. Table: ib\_accounts**

Stores IB (Introducing Broker) admin accounts and the single super admin. IBs manage a scoped pool of traders.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| company\_name | VARCHAR(200) | NOT NULL | IB company registered name |
| company\_id | VARCHAR(100) | NOT NULL | Company registration / licence number |
| name | VARCHAR(100) | NOT NULL | IB Team Leader full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password\_hash | VARCHAR(255) | NOT NULL | bcrypt hash, cost factor 12 |
| territory | VARCHAR(100) | NOT NULL | Assigned territory — set by Super Admin at IB creation |
| role | user\_role | NOT NULL, DEFAULT 'ib\_team\_leader' | Always ib\_team\_leader for IB accounts |
| pool\_code | VARCHAR(32) | UNIQUE, NOT NULL | Unique Pool Code — traders enter this at registration to join this IB |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active | suspended | terminated | resigned |
| is\_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Computed: active \= TRUE, all others \= FALSE |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE ib\_accounts (   id             UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   company\_name   VARCHAR(200) NOT NULL,   company\_id     VARCHAR(100) NOT NULL,   name           VARCHAR(100) NOT NULL,   email          VARCHAR(255) NOT NULL UNIQUE,   password\_hash  VARCHAR(255) NOT NULL,   territory      VARCHAR(100) NOT NULL,   role           user\_role    NOT NULL DEFAULT 'ib\_team\_leader',   pool\_code      VARCHAR(32)  NOT NULL UNIQUE DEFAULT UPPER(LEFT(gen\_random\_uuid()::TEXT, 8)),   status         VARCHAR(20)  NOT NULL DEFAULT 'active',   is\_active      BOOLEAN      NOT NULL DEFAULT TRUE,   created\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),   updated\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON ib\_accounts   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_ib\_accounts\_email     ON ib\_accounts (email); CREATE INDEX idx\_ib\_accounts\_pool\_code ON ib\_accounts (pool\_code); CREATE INDEX idx\_ib\_accounts\_status    ON ib\_accounts (status); |
| :---- |

# **4b. Table: ib\_agents**

IB Agent accounts (sub-role of the IB Team Leader). Agents have individual logins to the admin panel scoped to only their assigned traders. They perform the Step 1 KYC recommendation and can credit balance and bonus. Created by the IB Team Leader.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| ib\_id | UUID | NOT NULL, FK → ib\_accounts(id) | Parent IB Team Leader — immutable after creation |
| name | VARCHAR(100) | NOT NULL | Agent full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password\_hash | VARCHAR(255) | NOT NULL | bcrypt hash, cost factor 12 |
| role | user\_role | NOT NULL, DEFAULT 'agent' | Always agent |
| is\_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Team Leader can suspend/deactivate an Agent |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE ib\_agents (   id             UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   ib\_id          UUID         NOT NULL REFERENCES ib\_accounts(id) ON DELETE RESTRICT,   name           VARCHAR(100) NOT NULL,   email          VARCHAR(255) NOT NULL UNIQUE,   password\_hash  VARCHAR(255) NOT NULL,   role           user\_role    NOT NULL DEFAULT 'agent',   is\_active      BOOLEAN      NOT NULL DEFAULT TRUE,   created\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),   updated\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON ib\_agents   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_ib\_agents\_ib\_id ON ib\_agents (ib\_id); CREATE INDEX idx\_ib\_agents\_email ON ib\_agents (email); |
| :---- |

# **5\. Table: users**

All registered traders. Each user belongs to exactly one IB via ib\_id. This relationship is set at registration and is immutable.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| ib\_id | UUID | NOT NULL, FK → ib\_accounts(id) | Owning IB Team Leader — immutable after creation |
| assigned\_agent\_id | UUID | FK → ib\_agents(id) | Agent currently responsible for this trader — nullable, reassignable |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email and primary contact |
| password\_hash | VARCHAR(255) | NOT NULL | bcrypt hash, cost factor 12 |
| first\_name | VARCHAR(100) | NOT NULL | Legal first name |
| last\_name | VARCHAR(100) | NOT NULL | Legal last name |
| phone | VARCHAR(30) |  | Phone number with country code |
| date\_of\_birth | DATE |  | Required for KYC compliance |
| country | VARCHAR(100) | NOT NULL | Country of residence |
| address | TEXT |  | Full mailing address |
| city | VARCHAR(100) |  | City |
| postal\_code | VARCHAR(20) |  | Postal/ZIP code |
| trading\_experience | VARCHAR(30) |  | none | beginner | intermediate | advanced |
| role | user\_role | NOT NULL, DEFAULT 'trader' | Always 'trader' for end users |
| email\_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Must be TRUE before trading allowed |
| kyc\_status | kyc\_status | NOT NULL, DEFAULT 'not\_started' | Denormalised for fast reads — mirrors kyc\_submissions.status |
| is\_active | BOOLEAN | NOT NULL, DEFAULT TRUE | IB can deactivate without deletion |
| last\_login\_at | TIMESTAMPTZ |  | Updated on each successful login |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Registration timestamp |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE users (   id                 UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   ib\_id              UUID         NOT NULL REFERENCES ib\_accounts(id) ON DELETE RESTRICT,   email              VARCHAR(255) NOT NULL UNIQUE,   password\_hash      VARCHAR(255) NOT NULL,   first\_name         VARCHAR(100) NOT NULL,   last\_name          VARCHAR(100) NOT NULL,   phone              VARCHAR(30),   date\_of\_birth      DATE,   country            VARCHAR(100) NOT NULL,   address            TEXT,   city               VARCHAR(100),   postal\_code        VARCHAR(20),   trading\_experience VARCHAR(30),   role               user\_role    NOT NULL DEFAULT 'trader',   email\_verified     BOOLEAN      NOT NULL DEFAULT FALSE,   kyc\_status         kyc\_status   NOT NULL DEFAULT 'not\_started',   is\_active          BOOLEAN      NOT NULL DEFAULT TRUE,   last\_login\_at      TIMESTAMPTZ,   created\_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),   updated\_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_users\_ib\_id          ON users (ib\_id); CREATE INDEX idx\_users\_email          ON users (email); CREATE INDEX idx\_users\_kyc\_status     ON users (kyc\_status); CREATE INDEX idx\_users\_ib\_created     ON users (ib\_id, created\_at DESC); \-- Full-text search for admin user list CREATE INDEX idx\_users\_name\_trgm ON users   USING GIN ((first\_name || ' ' || last\_name) gin\_trgm\_ops); |
| :---- |

# **6\. Table: accounts**

One financial account per user. Stores live balance, bonus balance, and risk management thresholds. This is the most-written table in the system — updated on every trade close, deposit, swap, and fee.

| IMPORTANT:  Never subtract directly from balance without creating a corresponding transactions record first. The transactions table is the source of truth; accounts.balance is a running total derived from it. |
| :---- |

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| user\_id | UUID | UNIQUE, NOT NULL, FK → users(id) | One account per user |
| balance | BIGINT | NOT NULL, DEFAULT 0, CHECK \>= 0 | Real balance in integer cents (USD × 100). $1.00 \= 100 |
| bonus\_balance | BIGINT | NOT NULL, DEFAULT 0, CHECK \>= 0 | Tradable non-withdrawable bonus in integer cents |
| currency | VARCHAR(10) | NOT NULL, DEFAULT 'USD' | Always USD in v1 |
| margin\_call\_pct | INTEGER | NOT NULL, DEFAULT 80 | Margin call alert threshold (%) |
| stop\_out\_pct | INTEGER | NOT NULL, DEFAULT 50 | Liquidation trigger threshold (%) |
| is\_locked | BOOLEAN | NOT NULL, DEFAULT FALSE | IB can lock account (blocks trading) |
| version | INTEGER | NOT NULL, DEFAULT 1 | Optimistic lock counter — increment on every balance write |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE accounts (   id               UUID           PRIMARY KEY DEFAULT gen\_random\_uuid(),   user\_id          UUID           NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,   balance          BIGINT         NOT NULL DEFAULT 0                                   CHECK (balance \>= 0),   bonus\_balance          BIGINT         NOT NULL DEFAULT 0                                   CHECK (bonus\_balance \>= 0),   currency         VARCHAR(10)    NOT NULL DEFAULT 'USD',   margin\_call\_pct  INTEGER        NOT NULL DEFAULT 80                                   CHECK (margin\_call\_pct BETWEEN 1 AND 100),   stop\_out\_pct     INTEGER        NOT NULL DEFAULT 50                                   CHECK (stop\_out\_pct BETWEEN 1 AND 99),   is\_locked        BOOLEAN        NOT NULL DEFAULT FALSE,   version          INTEGER        NOT NULL DEFAULT 1,   created\_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),   updated\_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),   CONSTRAINT chk\_stop\_lt\_margin\_call     CHECK (stop\_out\_pct \< margin\_call\_pct) ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON accounts   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_accounts\_user\_id ON accounts (user\_id); |
| :---- |

# **7\. Table: instruments**

Static reference table for all 60 tradable instruments. Loaded at service startup and cached in memory. IB admin can adjust spread and leverage per instrument without code deployment.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| symbol | VARCHAR(20) | UNIQUE, NOT NULL | Internal symbol e.g. EURUSD, BTCUSD |
| display\_name | VARCHAR(80) | NOT NULL | Human-readable name e.g. Euro / US Dollar |
| asset\_class | asset\_class | NOT NULL | forex | crypto | indices | commodities | stocks |
| segment | VARCHAR(40) | NOT NULL | Major | Minor | Exotic | Large Cap | etc. |
| leverage | INTEGER | NOT NULL, CHECK \> 0 | Max leverage for this instrument e.g. 500 |
| contract\_size | NUMERIC(18,4) | NOT NULL | Lot size in base units. Forex: 100000, Crypto: 1, Indices: 1 |
| pip\_size | NUMERIC(18,8) | NOT NULL | Smallest price movement. EURUSD: 0.0001, USDJPY: 0.01 |
| spread | NUMERIC(10,6) | NOT NULL, DEFAULT 0 | Bid/ask spread in price units (IB configurable) |
| swap\_long | NUMERIC(10,6) | NOT NULL, DEFAULT 0 | Daily swap rate for long positions (can be negative) |
| swap\_short | NUMERIC(10,6) | NOT NULL, DEFAULT 0 | Daily swap rate for short positions (can be negative) |
| min\_lot | NUMERIC(10,4) | NOT NULL, DEFAULT 0.01 | Minimum order size in lots |
| max\_lot | NUMERIC(10,4) | NOT NULL, DEFAULT 100 | Maximum order size in lots |
| min\_price\_move | NUMERIC(18,8) | NOT NULL | Minimum allowed price increment |
| commission\_pct | NUMERIC(6,4) | NOT NULL, DEFAULT 0 | Commission rate (% of notional). 0 for spread-only instruments |
| tv\_symbol | VARCHAR(60) | NOT NULL | TradingView widget symbol e.g. FX:EURUSD |
| yf\_symbol | VARCHAR(30) | NOT NULL | yFinance ticker e.g. EURUSD=X, BTC-USD |
| is\_active | BOOLEAN | NOT NULL, DEFAULT TRUE | IB can disable instruments without deleting |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE instruments (   id              UUID           PRIMARY KEY DEFAULT gen\_random\_uuid(),   symbol          VARCHAR(20)    NOT NULL UNIQUE,   display\_name    VARCHAR(80)    NOT NULL,   asset\_class     asset\_class    NOT NULL,   segment         VARCHAR(40)    NOT NULL,   leverage        INTEGER        NOT NULL CHECK (leverage \> 0),   contract\_size   NUMERIC(18,4)  NOT NULL,   pip\_size        NUMERIC(18,8)  NOT NULL,   spread          NUMERIC(10,6)  NOT NULL DEFAULT 0,   swap\_long       NUMERIC(10,6)  NOT NULL DEFAULT 0,   swap\_short      NUMERIC(10,6)  NOT NULL DEFAULT 0,   min\_lot         NUMERIC(10,4)  NOT NULL DEFAULT 0.01                                  CHECK (min\_lot \> 0),   max\_lot         NUMERIC(10,4)  NOT NULL DEFAULT 100                                  CHECK (max\_lot \>= min\_lot),   min\_price\_move  NUMERIC(18,8)  NOT NULL,   commission\_pct  NUMERIC(6,4)   NOT NULL DEFAULT 0                                  CHECK (commission\_pct \>= 0),   tv\_symbol       VARCHAR(60)    NOT NULL,   yf\_symbol       VARCHAR(30)    NOT NULL,   is\_active       BOOLEAN        NOT NULL DEFAULT TRUE,   created\_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),   updated\_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON instruments   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_instruments\_symbol       ON instruments (symbol); CREATE INDEX idx\_instruments\_asset\_class  ON instruments (asset\_class); CREATE INDEX idx\_instruments\_active       ON instruments (is\_active) WHERE is\_active \= TRUE; |
| :---- |

# **8\. Table: positions**

All trade positions — open and closed. The Trade Engine reads and writes this table on every order fill, TP/SL trigger, and liquidation event.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| account\_id | UUID | NOT NULL, FK → accounts(id) | Owning account |
| instrument\_id | UUID | NOT NULL, FK → instruments(id) | Instrument traded |
| order\_id | UUID | FK → orders(id) | The order that opened this position |
| direction | trade\_direction | NOT NULL | long | short |
| lots | NUMERIC(10,4) | NOT NULL, CHECK \> 0 | Position size in lots |
| entry\_price | NUMERIC(18,8) | NOT NULL | Fill price at open |
| close\_price | NUMERIC(18,8) |  | Fill price at close (NULL while open) |
| tp\_price | NUMERIC(18,8) |  | Take Profit trigger price |
| sl\_price | NUMERIC(18,8) |  | Stop Loss trigger price |
| trailing\_pips | NUMERIC(10,2) |  | Trailing stop distance in pips (NULL if not trailing) |
| current\_sl | NUMERIC(18,8) |  | Live trailing SL price (updated each tick) |
| margin\_used | NUMERIC(18,8) | NOT NULL | Margin reserved at open — frozen until close |
| realized\_pnl | NUMERIC(18,8) |  | Final P\&L (NULL while open) |
| swap\_accrued | NUMERIC(18,8) | NOT NULL, DEFAULT 0 | Running total of swap charges debited |
| commission | NUMERIC(18,8) | NOT NULL, DEFAULT 0 | Commission charged at open |
| status | position\_status | NOT NULL, DEFAULT 'open' | open | closed | liquidated |
| close\_reason | close\_reason |  | tp | sl | manual | liquidation | margin\_call |
| opened\_at | TIMESTAMPTZ | NOT NULL | Exact fill timestamp |
| closed\_at | TIMESTAMPTZ |  | Close timestamp (NULL while open) |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record insert time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE positions (   id               UUID             PRIMARY KEY DEFAULT gen\_random\_uuid(),   account\_id       UUID             NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   instrument\_id    UUID             NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,   order\_id         UUID             REFERENCES orders(id) ON DELETE SET NULL,   direction        trade\_direction  NOT NULL,   lots             NUMERIC(10,4)    NOT NULL CHECK (lots \> 0),   entry\_price      NUMERIC(18,8)    NOT NULL,   close\_price      NUMERIC(18,8),   tp\_price         NUMERIC(18,8),   sl\_price         NUMERIC(18,8),   trailing\_pips    NUMERIC(10,2),   current\_sl       NUMERIC(18,8),   margin\_used      NUMERIC(18,8)    NOT NULL,   realized\_pnl     NUMERIC(18,8),   swap\_accrued     NUMERIC(18,8)    NOT NULL DEFAULT 0,   commission       NUMERIC(18,8)    NOT NULL DEFAULT 0,   status           position\_status  NOT NULL DEFAULT 'open',   close\_reason     close\_reason,   opened\_at        TIMESTAMPTZ      NOT NULL,   closed\_at        TIMESTAMPTZ,   created\_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),   updated\_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON positions   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_positions\_account\_id         ON positions (account\_id); CREATE INDEX idx\_positions\_open               ON positions (account\_id, status)   WHERE status \= 'open'; CREATE INDEX idx\_positions\_instrument\_open    ON positions (instrument\_id, status)   WHERE status \= 'open'; CREATE INDEX idx\_positions\_account\_history    ON positions (account\_id, closed\_at DESC)   WHERE status IN ('closed','liquidated'); CREATE INDEX idx\_positions\_opened\_at          ON positions (opened\_at DESC); |
| :---- |

# **9\. Table: orders**

All order records regardless of type or status. Pending orders are evaluated by the Trade Engine on every tick. Filled orders link to the resulting position.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| account\_id | UUID | NOT NULL, FK → accounts(id) | Owning account |
| instrument\_id | UUID | NOT NULL, FK → instruments(id) | Instrument for this order |
| type | order\_type | NOT NULL | market | limit | stop | stop\_limit | trailing\_stop | oco |
| direction | trade\_direction | NOT NULL | long | short |
| lots | NUMERIC(10,4) | NOT NULL, CHECK \> 0 | Order size in lots |
| price | NUMERIC(18,8) |  | Limit or stop trigger price |
| stop\_price | NUMERIC(18,8) |  | Secondary price for stop\_limit orders |
| tp\_price | NUMERIC(18,8) |  | Take Profit price to attach on fill |
| sl\_price | NUMERIC(18,8) |  | Stop Loss price to attach on fill |
| trailing\_pips | NUMERIC(10,2) |  | Trail distance for trailing\_stop orders |
| oco\_group\_id | UUID |  | Links two OCO orders — shared UUID |
| fill\_price | NUMERIC(18,8) |  | Actual fill price (set on fill) |
| slippage\_pips | NUMERIC(10,4) |  | Recorded slippage from requested to fill price |
| status | order\_status | NOT NULL, DEFAULT 'pending' | pending | filled | cancelled | rejected | expired |
| position\_id | UUID | FK → positions(id) | Position created by this order (set on fill) |
| reject\_reason | TEXT |  | Reason if status \= rejected |
| placed\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Order submission time |
| filled\_at | TIMESTAMPTZ |  | Fill execution time |
| expires\_at | TIMESTAMPTZ |  | GTC expiry (NULL \= no expiry) |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record insert time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE orders (   id             UUID            PRIMARY KEY DEFAULT gen\_random\_uuid(),   account\_id     UUID            NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   instrument\_id  UUID            NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,   type           order\_type      NOT NULL,   direction      trade\_direction NOT NULL,   lots           NUMERIC(10,4)   NOT NULL CHECK (lots \> 0),   price          NUMERIC(18,8),   stop\_price     NUMERIC(18,8),   tp\_price       NUMERIC(18,8),   sl\_price       NUMERIC(18,8),   trailing\_pips  NUMERIC(10,2),   oco\_group\_id   UUID,   fill\_price     NUMERIC(18,8),   slippage\_pips  NUMERIC(10,4),   status         order\_status    NOT NULL DEFAULT 'pending',   position\_id    UUID            REFERENCES positions(id) ON DELETE SET NULL,   reject\_reason  TEXT,   placed\_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),   filled\_at      TIMESTAMPTZ,   expires\_at     TIMESTAMPTZ,   created\_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),   updated\_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_orders\_account\_id       ON orders (account\_id); CREATE INDEX idx\_orders\_pending          ON orders (instrument\_id, status)   WHERE status \= 'pending'; CREATE INDEX idx\_orders\_oco\_group        ON orders (oco\_group\_id)   WHERE oco\_group\_id IS NOT NULL; CREATE INDEX idx\_orders\_account\_history  ON orders (account\_id, placed\_at DESC); |
| :---- |

# **10\. Table: transactions**

The immutable financial ledger. Every balance change — trade P\&L, deposit, withdrawal, IB credit, swap, commission, bonus — is recorded here. The account balance is always the sum of all completed transactions for that account.

| APPEND-ONLY:  Rows in this table are never deleted or mutated after creation. Only the status column may be updated (e.g. pending → completed). Amount, account\_id, and type are write-once. |
| :---- |

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| account\_id | UUID | NOT NULL, FK → accounts(id) | Account affected |
| type | transaction\_type | NOT NULL | deposit | withdrawal | ib\_credit | bonus\_grant | trade\_pnl | swap | commission | ... |
| amount | BIGINT | NOT NULL | Integer cents. Positive \= credit, Negative \= debit |
| balance\_after | BIGINT | NOT NULL | Snapshot of real balance (cents) after this transaction |
| bonus\_after | BIGINT | NOT NULL, DEFAULT 0 | Snapshot of bonus balance (cents) after this transaction |
| reference\_id | UUID |  | Links to position\_id, order\_id, deposit\_id, etc. |
| memo | TEXT |  | Human-readable note (IB comments visible to admin) |
| status | transaction\_status | NOT NULL, DEFAULT 'completed' | pending | completed | failed | reversed |
| initiated\_by | UUID |  | User or IB admin ID who triggered this |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Immutable creation time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Only status updates allowed after creation |

| CREATE TABLE transactions (   id              UUID               PRIMARY KEY DEFAULT gen\_random\_uuid(),   account\_id      UUID               NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   type            transaction\_type   NOT NULL,   amount          BIGINT             NOT NULL,   balance\_after   BIGINT             NOT NULL,   bonus\_after     BIGINT             NOT NULL DEFAULT 0,   reference\_id    UUID,   memo            TEXT,   status          transaction\_status NOT NULL DEFAULT 'completed',   initiated\_by    UUID,   created\_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),   updated\_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON transactions   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_txn\_account\_id   ON transactions (account\_id, created\_at DESC); CREATE INDEX idx\_txn\_type         ON transactions (account\_id, type); CREATE INDEX idx\_txn\_reference    ON transactions (reference\_id)   WHERE reference\_id IS NOT NULL; CREATE INDEX idx\_txn\_status       ON transactions (status)   WHERE status \= 'pending'; CREATE INDEX idx\_txn\_created\_at   ON transactions (created\_at DESC); |
| :---- |

# **11\. Table: kyc\_submissions**

KYC document submission records. Each user may have multiple historical submissions (re-submissions after rejection, or IB-triggered re-verification). Only the latest submission is active. Old records are archived for compliance audit.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| user\_id | UUID | NOT NULL, FK → users(id) | Submitting user |
| id\_front\_key | TEXT |  | S3/R2 object key — NOT a URL |
| id\_back\_key | TEXT |  | S3/R2 object key — NOT a URL |
| proof\_of\_address\_key | TEXT |  | S3/R2 object key — NOT a URL |
| selfie\_key | TEXT |  | S3/R2 object key — NOT a URL |
| status | kyc\_status | NOT NULL, DEFAULT 'pending' | pending | pending\_tl\_review | approved | rejected |
| agent\_recommendation | kyc\_recommendation |  | Step 1: Agent's recommendation (recommend\_approve | recommend\_reject) |
| agent\_id | UUID | FK → ib\_agents(id) | Agent who made the Step 1 recommendation |
| agent\_note | TEXT |  | Agent's comment — mandatory if recommend\_reject |
| agent\_reviewed\_at | TIMESTAMPTZ |  | Timestamp of Agent Step 1 action |
| tl\_decision\_by | UUID | FK → ib\_accounts(id) | IB Team Leader who made the final Step 2 decision |
| tl\_decision\_at | TIMESTAMPTZ |  | Timestamp of Team Leader final decision |
| rejection\_note | TEXT |  | Final rejection reason shown to trader (TL note, may append agent note) |
| is\_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Only the latest submission is active \= TRUE |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE kyc\_submissions (   id                   UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),   user\_id              UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,   id\_front\_key         TEXT,   id\_back\_key          TEXT,   proof\_of\_address\_key TEXT,   selfie\_key           TEXT,   status               kyc\_status         NOT NULL DEFAULT 'pending',   agent\_recommendation kyc\_recommendation,   agent\_id             UUID               REFERENCES ib\_agents(id) ON DELETE SET NULL,   agent\_note           TEXT,   agent\_reviewed\_at    TIMESTAMPTZ,   tl\_decision\_by       UUID               REFERENCES ib\_accounts(id) ON DELETE SET NULL,   tl\_decision\_at       TIMESTAMPTZ,   rejection\_note       TEXT,   is\_active            BOOLEAN     NOT NULL DEFAULT TRUE,   created\_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),   updated\_at           TIMESTAMPTZ NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON kyc\_submissions   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_kyc\_user\_id       ON kyc\_submissions (user\_id); CREATE INDEX idx\_kyc\_active        ON kyc\_submissions (user\_id, is\_active)   WHERE is\_active \= TRUE; CREATE INDEX idx\_kyc\_pending       ON kyc\_submissions (status)   WHERE status \= 'pending'; CREATE INDEX idx\_kyc\_ib\_pending    ON kyc\_submissions (reviewed\_by, status)   WHERE status \= 'pending'; |
| :---- |

# **12\. Table: deposits**

Tracks every NowPayments.io deposit request from initiation through to confirmation. The IPN webhook updates this table; the API then credits the account.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| account\_id | UUID | NOT NULL, FK → accounts(id) | Account to credit on confirmation |
| nowpayments\_id | VARCHAR(100) | UNIQUE, NOT NULL | NowPayments.io payment\_id — used for IPN idempotency |
| coin | VARCHAR(20) | NOT NULL | usdttrc20 | usdterc20 | eth |
| pay\_address | VARCHAR(200) | NOT NULL | Crypto address generated by NowPayments |
| requested\_amount | BIGINT | NOT NULL | USD cents requested (USD × 100\) |
| pay\_amount | BIGINT | NOT NULL | Crypto amount to pay in micro-units (from NowPayments) |
| actually\_paid | BIGINT |  | Actual crypto received in micro-units (from IPN) |
| usd\_credited | BIGINT |  | USD cents credited to account (from CoinGecko spot rate at IPN time) |
| status | payment\_status | NOT NULL, DEFAULT 'waiting' | NowPayments payment lifecycle status |
| fx\_rate\_usd | NUMERIC(18,8) |  | CoinGecko spot rate (crypto/USD) at exact IPN confirmation timestamp — immutable audit record |
| transaction\_id | UUID | FK → transactions(id) | Resulting ledger entry on completion |
| ipn\_received\_at | TIMESTAMPTZ |  | When the confirming IPN webhook arrived |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Deposit request creation time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE deposits (   id                UUID           PRIMARY KEY DEFAULT gen\_random\_uuid(),   account\_id        UUID           NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   nowpayments\_id    VARCHAR(100)   NOT NULL UNIQUE,   coin              VARCHAR(20)    NOT NULL,   pay\_address       VARCHAR(200)   NOT NULL,   requested\_amount          BIGINT             NOT NULL,   pay\_amount          BIGINT             NOT NULL,   actually\_paid     BIGINT,   usd\_credited      BIGINT,   status            payment\_status NOT NULL DEFAULT 'waiting',   fx\_rate\_usd       NUMERIC(18,8),   transaction\_id    UUID           REFERENCES transactions(id) ON DELETE SET NULL,   ipn\_received\_at   TIMESTAMPTZ,   created\_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),   updated\_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON deposits   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_deposits\_account\_id      ON deposits (account\_id); CREATE INDEX idx\_deposits\_nowpayments\_id  ON deposits (nowpayments\_id); CREATE INDEX idx\_deposits\_status          ON deposits (status)   WHERE status NOT IN ('finished','failed','expired'); |
| :---- |

# **13\. Table: withdrawals**

Withdrawal requests submitted by users. Funds are reserved immediately on submission. IB admin approves; payout is dispatched via NowPayments.io Mass Payout API.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| account\_id | UUID | NOT NULL, FK → accounts(id) | Account being debited |
| coin | VARCHAR(20) | NOT NULL | usdttrc20 | usdterc20 | eth |
| wallet\_address | VARCHAR(200) | NOT NULL | User's destination wallet address |
| amount\_usd | BIGINT | NOT NULL, CHECK \> 0 | USD cents requested (USD × 100\) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending | approved | processing | completed | rejected | failed |
| approved\_by | UUID | FK → ib\_accounts(id) | IB admin who approved |
| approved\_at | TIMESTAMPTZ |  | Approval timestamp |
| rejection\_note | TEXT |  | Reason if rejected |
| nowpayments\_payout\_id | VARCHAR(100) |  | NowPayments payout batch ID |
| hold\_transaction\_id | UUID | FK → transactions(id) | withdrawal\_hold ledger entry created instantly at submission |
| transaction\_id | UUID | FK → transactions(id) | Final withdrawal debit ledger entry (on approval) |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Request submission time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE withdrawals (   id                     UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),   account\_id             UUID          NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   coin                   VARCHAR(20)   NOT NULL,   wallet\_address         VARCHAR(200)  NOT NULL,   amount\_usd             BIGINT        NOT NULL CHECK (amount\_usd \> 0),   status                 VARCHAR(20)   NOT NULL DEFAULT 'pending',   approved\_by            UUID          REFERENCES ib\_accounts(id) ON DELETE SET NULL,   approved\_at            TIMESTAMPTZ,   rejection\_note         TEXT,   nowpayments\_payout\_id  VARCHAR(100),   hold\_transaction\_id    UUID          REFERENCES transactions(id) ON DELETE SET NULL,   transaction\_id         UUID          REFERENCES transactions(id) ON DELETE SET NULL,   created\_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),   updated\_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON withdrawals   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_withdrawals\_account\_id  ON withdrawals (account\_id); CREATE INDEX idx\_withdrawals\_pending     ON withdrawals (status)   WHERE status \= 'pending'; |
| :---- |

# **14\. Table: bonuses**

Individual bonus grant records. Each time an IB grants or revokes a bonus, a record is written here. The current active bonus amount is always accounts.bonus\_balance, not derived from this table at runtime.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Primary key |
| account\_id | UUID | NOT NULL, FK → accounts(id) | Account receiving the bonus |
| granted\_by | UUID | NOT NULL, FK → ib\_accounts(id) | IB admin who granted |
| amount | BIGINT | NOT NULL, CHECK \> 0 | Bonus amount in USD cents |
| memo | TEXT |  | IB admin note (purpose of bonus) |
| is\_active | BOOLEAN | NOT NULL, DEFAULT TRUE | FALSE when revoked by IB admin |
| revoked\_by | UUID | FK → ib\_accounts(id) | IB who revoked (if applicable) |
| revoked\_at | TIMESTAMPTZ |  | Revocation timestamp |
| transaction\_id | UUID | FK → transactions(id) | Ledger entry for this bonus grant |
| created\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Grant time |
| updated\_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update (trigger-managed) |

| CREATE TABLE bonuses (   id              UUID           PRIMARY KEY DEFAULT gen\_random\_uuid(),   account\_id      UUID           NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   granted\_by      UUID           NOT NULL REFERENCES ib\_accounts(id) ON DELETE RESTRICT,   amount          BIGINT         NOT NULL CHECK (amount \> 0),   memo            TEXT,   is\_active       BOOLEAN        NOT NULL DEFAULT TRUE,   revoked\_by      UUID           REFERENCES ib\_accounts(id) ON DELETE SET NULL,   revoked\_at      TIMESTAMPTZ,   transaction\_id  UUID           REFERENCES transactions(id) ON DELETE SET NULL,   created\_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),   updated\_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW() ); CREATE TRIGGER set\_updated\_at BEFORE UPDATE ON bonuses   FOR EACH ROW EXECUTE FUNCTION trigger\_set\_updated\_at(); \-- Indexes CREATE INDEX idx\_bonuses\_account\_id  ON bonuses (account\_id); CREATE INDEX idx\_bonuses\_active      ON bonuses (account\_id, is\_active)   WHERE is\_active \= TRUE; |
| :---- |

# **15\. Table: swap\_history**

Detailed audit log of every daily swap charge applied to open positions at UTC 00:00 rollover. Used for reconciliation and dispute resolution.

| CREATE TABLE swap\_history (   id              UUID           PRIMARY KEY DEFAULT gen\_random\_uuid(),   position\_id     UUID           NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,   account\_id      UUID           NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,   instrument\_id   UUID           NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,   swap\_amount          BIGINT             NOT NULL,   \-- negative \= debit, positive \= credit   rate\_applied    NUMERIC(10,6)  NOT NULL,   \-- swap rate used at time of charge   lots            NUMERIC(10,4)  NOT NULL,   is\_triple       BOOLEAN        NOT NULL DEFAULT FALSE,  \-- TRUE on Wednesday (3x swap)   applied\_at      TIMESTAMPTZ    NOT NULL,   transaction\_id  UUID           REFERENCES transactions(id) ON DELETE SET NULL,   created\_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW() ); \-- Indexes CREATE INDEX idx\_swap\_history\_position    ON swap\_history (position\_id); CREATE INDEX idx\_swap\_history\_account     ON swap\_history (account\_id, applied\_at DESC); CREATE INDEX idx\_swap\_history\_applied\_at  ON swap\_history (applied\_at DESC); |
| :---- |

# **16\. Table: notifications**

In-app notification records. Delivered in real-time via WebSocket and persisted here for the notification centre history view.

| CREATE TABLE notifications (   id           UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   user\_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,   type         VARCHAR(40)  NOT NULL,   \-- Types: margin\_call | liquidation | kyc\_update | wallet\_credit |   \--        withdrawal\_update | order\_filled | position\_closed | system\_alert   title        VARCHAR(200) NOT NULL,   message      TEXT         NOT NULL,   reference\_id UUID,                    \-- position\_id / order\_id / transaction\_id   is\_read      BOOLEAN      NOT NULL DEFAULT FALSE,   read\_at      TIMESTAMPTZ,   created\_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); \-- Indexes CREATE INDEX idx\_notifications\_user\_id   ON notifications (user\_id, created\_at DESC); CREATE INDEX idx\_notifications\_unread    ON notifications (user\_id, is\_read)   WHERE is\_read \= FALSE; \-- Auto-delete notifications older than 90 days (optional: use pg\_partman for large scale) \-- CREATE INDEX idx\_notifications\_cleanup ON notifications (created\_at) \-- WHERE created\_at \< NOW() \- INTERVAL '90 days'; |
| :---- |

# **17\. Auth Tables**

## **17.1 refresh\_tokens**

| CREATE TABLE refresh\_tokens (   id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   user\_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,   token\_hash  VARCHAR(255) NOT NULL UNIQUE,  \-- SHA-256 hash of the opaque token   user\_agent  TEXT,   ip\_address  INET,   is\_revoked  BOOLEAN      NOT NULL DEFAULT FALSE,   expires\_at  TIMESTAMPTZ  NOT NULL,   created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); CREATE INDEX idx\_refresh\_tokens\_user\_id    ON refresh\_tokens (user\_id); CREATE INDEX idx\_refresh\_tokens\_hash       ON refresh\_tokens (token\_hash); CREATE INDEX idx\_refresh\_tokens\_active     ON refresh\_tokens (user\_id, is\_revoked)   WHERE is\_revoked \= FALSE; |
| :---- |

## **17.2 email\_verifications**

| CREATE TABLE email\_verifications (   id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   user\_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,   token\_hash  VARCHAR(255) NOT NULL UNIQUE,   is\_used     BOOLEAN      NOT NULL DEFAULT FALSE,   expires\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW() \+ INTERVAL '24 hours',   created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); CREATE INDEX idx\_email\_verif\_user\_id   ON email\_verifications (user\_id); CREATE INDEX idx\_email\_verif\_token     ON email\_verifications (token\_hash); |
| :---- |

## **17.3 password\_resets**

| CREATE TABLE password\_resets (   id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),   user\_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,   token\_hash  VARCHAR(255) NOT NULL UNIQUE,   is\_used     BOOLEAN      NOT NULL DEFAULT FALSE,   expires\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW() \+ INTERVAL '15 minutes',   created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW() ); CREATE INDEX idx\_pwd\_reset\_user\_id  ON password\_resets (user\_id); CREATE INDEX idx\_pwd\_reset\_token    ON password\_resets (token\_hash); |
| :---- |

# **18\. Seed Data**

The following seed data must be applied after schema creation. The instruments table contains all 60 confirmed assets with leverage from the approved leverage table. Swap rates and spreads are indicative defaults — IB admin should adjust via admin panel before go-live.

## **18.1 Super Admin Seed**

| SECURITY:  Change the super admin password immediately after first deployment. The hash below is a placeholder only — generate a real bcrypt hash before applying. |
| :---- |

| INSERT INTO ib\_accounts (name, email, password\_hash, role, referral\_code) VALUES   ('ProTrader Admin', 'admin@protradersim.com',    '$2b$12$CHANGE\_THIS\_TO\_REAL\_BCRYPT\_HASH',    'super\_admin', 'SUPERADM'); |
| :---- |

## **18.2 Instruments Seed — Forex (18 instruments)**

| INSERT INTO instruments   (symbol, display\_name, asset\_class, segment, leverage,    contract\_size, pip\_size, spread, swap\_long, swap\_short,    min\_lot, max\_lot, min\_price\_move, commission\_pct, tv\_symbol, yf\_symbol) VALUES \-- FOREX MAJORS (leverage 1:500) ('EURUSD','Euro / US Dollar',         'forex','Major',500, 100000,0.0001, 0.00012,-0.000010,-0.000005, 0.01,100,0.00001,0,'FX:EURUSD',   'EURUSD=X'), ('GBPUSD','British Pound / US Dollar', 'forex','Major',500, 100000,0.0001, 0.00015,-0.000012,-0.000007, 0.01,100,0.00001,0,'FX:GBPUSD',   'GBPUSD=X'), ('USDJPY','US Dollar / Japanese Yen',  'forex','Major',500, 100000,0.01,   0.0140, \-0.000008,-0.000004, 0.01,100,0.001,  0,'FX:USDJPY',   'USDJPY=X'), ('USDCHF','US Dollar / Swiss Franc',   'forex','Major',500, 100000,0.0001, 0.00014,-0.000007,-0.000003, 0.01,100,0.00001,0,'FX:USDCHF',   'USDCHF=X'), ('AUDUSD','Australian Dollar / USD',   'forex','Major',500, 100000,0.0001, 0.00013,-0.000006,-0.000004, 0.01,100,0.00001,0,'FX:AUDUSD',   'AUDUSD=X'), ('USDCAD','US Dollar / Canadian Dollar','forex','Major',500, 100000,0.0001, 0.00014,-0.000009,-0.000005, 0.01,100,0.00001,0,'FX:USDCAD',   'USDCAD=X'), ('NZDUSD','New Zealand Dollar / USD',  'forex','Major',500, 100000,0.0001, 0.00015,-0.000005,-0.000004, 0.01,100,0.00001,0,'FX:NZDUSD',   'NZDUSD=X'), \-- FOREX MINORS (leverage 1:300) ('EURGBP','Euro / British Pound',      'forex','Minor',300, 100000,0.0001, 0.00014,-0.000008,-0.000006, 0.01,50, 0.00001,0,'FX:EURGBP',   'EURGBP=X'), ('EURJPY','Euro / Japanese Yen',       'forex','Minor',300, 100000,0.01,   0.0160, \-0.000011,-0.000006, 0.01,50, 0.001,  0,'FX:EURJPY',   'EURJPY=X'), ('GBPJPY','British Pound / JPY',       'forex','Minor',300, 100000,0.01,   0.0200, \-0.000014,-0.000008, 0.01,50, 0.001,  0,'FX:GBPJPY',   'GBPJPY=X'), ('AUDJPY','Australian Dollar / JPY',   'forex','Minor',300, 100000,0.01,   0.0180, \-0.000009,-0.000005, 0.01,50, 0.001,  0,'FX:AUDJPY',   'AUDJPY=X'), ('EURAUD','Euro / Australian Dollar',  'forex','Minor',300, 100000,0.0001, 0.00018,-0.000010,-0.000007, 0.01,50, 0.00001,0,'FX:EURAUD',   'EURAUD=X'), ('GBPCHF','British Pound / Swiss Franc','forex','Minor',300, 100000,0.0001,0.00022,-0.000013,-0.000008, 0.01,50, 0.00001,0,'FX:GBPCHF',   'GBPCHF=X'), ('CADJPY','Canadian Dollar / JPY',     'forex','Minor',300, 100000,0.01,   0.0200, \-0.000010,-0.000006, 0.01,50, 0.001,  0,'FX:CADJPY',   'CADJPY=X'), \-- FOREX EXOTICS ('USDSGD','US Dollar / Singapore Dollar','forex','Exotic',100,100000,0.0001,0.00050,-0.000020,-0.000010,0.01,20, 0.00001,0,'FX:USDSGD',   'USDSGD=X'), ('USDHKD','US Dollar / Hong Kong Dollar','forex','Exotic',100,100000,0.0001,0.00050,-0.000015,-0.000008,0.01,20, 0.00001,0,'FX:USDHKD',   'USDHKD=X'), ('USDZAR','US Dollar / South African Rand','forex','Exotic',100,100000,0.0001,0.00200,-0.000050,-0.000020,0.01,10,0.00001,0,'FX:USDZAR',  'USDZAR=X'), ('USDTRY','US Dollar / Turkish Lira',  'forex','Exotic',50,  100000,0.0001, 0.00500,-0.000100,-0.000030,0.01,5,  0.00001,0,'FX:USDTRY',   'USDTRY=X'), |
| :---- |

## **18.3 Instruments Seed — Crypto (12 instruments)**

| \-- CRYPTO LARGE CAP (leverage 1:10 to 1:20) ('BTCUSD','Bitcoin / US Dollar',       'crypto','Large Cap',20,1,0.01,  8.00,   \-0.000500,-0.000200, 0.001,10, 0.01,  0.1,'BINANCE:BTCUSDT','BTC-USD'), ('ETHUSD','Ethereum / US Dollar',      'crypto','Large Cap',20,1,0.01,  2.00,   \-0.000300,-0.000150, 0.01, 100,0.01,  0.1,'BINANCE:ETHUSDT', 'ETH-USD'), ('SOLUSD','Solana / US Dollar',        'crypto','Large Cap',10,1,0.001, 0.20,   \-0.000200,-0.000100, 0.1,  500,0.001, 0.1,'BINANCE:SOLUSDT', 'SOL-USD'), ('XRPUSD','XRP / US Dollar',           'crypto','Large Cap',10,1,0.0001,0.020,  \-0.000100,-0.000050, 1,    10000,0.0001,0.1,'BINANCE:XRPUSDT','XRP-USD'), ('ADAUSD','Cardano / US Dollar',       'crypto','Large Cap',10,1,0.0001,0.005,  \-0.000100,-0.000050, 1,    10000,0.0001,0.1,'BINANCE:ADAUSDT','ADA-USD'), ('DOGEUSD','Dogecoin / US Dollar',     'crypto','Large Cap',10,1,0.0001,0.002,  \-0.000080,-0.000040, 10,   100000,0.0001,0.1,'BINANCE:DOGEUSDT','DOGE-USD'), \-- CRYPTO MID CAP (leverage 1:10) ('LTCUSD','Litecoin / US Dollar',      'crypto','Mid Cap',  10,1,0.01,  0.30,   \-0.000150,-0.000070, 0.1,  1000,0.01,  0.1,'BINANCE:LTCUSDT', 'LTC-USD'), ('BCHUSD','Bitcoin Cash / US Dollar',  'crypto','Mid Cap',  10,1,0.01,  0.50,   \-0.000150,-0.000070, 0.01, 200, 0.01,  0.1,'BINANCE:BCHUSDT', 'BCH-USD'), ('LINKUSD','Chainlink / US Dollar',    'crypto','Mid Cap',  10,1,0.001, 0.020,  \-0.000100,-0.000050, 0.1,  5000,0.001, 0.1,'BINANCE:LINKUSDT','LINK-USD'), ('AVAXUSD','Avalanche / US Dollar',    'crypto','Mid Cap',  10,1,0.001, 0.050,  \-0.000120,-0.000060, 0.1,  2000,0.001, 0.1,'BINANCE:AVAXUSDT','AVAX-USD'), ('DOTUSD','Polkadot / US Dollar',      'crypto','Mid Cap',  10,1,0.001, 0.010,  \-0.000100,-0.000050, 1,    10000,0.001, 0.1,'BINANCE:DOTUSDT', 'DOT-USD'), ('MATICUSD','Polygon / US Dollar',     'crypto','Mid Cap',  10,1,0.0001,0.002,  \-0.000080,-0.000040, 10,   100000,0.0001,0.1,'BINANCE:MATICUSDT','MATIC-USD'), |
| :---- |

## **18.4 Instruments Seed — Indices (10), Commodities (10), Stocks (10)**

| \-- INDICES (leverage 1:50 to 1:100) ('US30',  'Dow Jones Industrial Average','indices','Major Index',100,1,1,    3.0, \-0.002000,-0.001000, 0.1,50, 1,    0,'FOREXCOM:DJI',  '^DJI'), ('US500', 'S\&P 500 Index',               'indices','Major Index',100,1,0.1,  0.5, \-0.001500,-0.000800, 0.1,50, 0.1,  0,'FOREXCOM:SP500','^GSPC'), ('USTEC', 'NASDAQ 100 Index',            'indices','Major Index',100,1,0.1,  1.0, \-0.002000,-0.001000, 0.1,50, 0.1,  0,'NASDAQ:NDX',    '^NDX'), ('UK100', 'FTSE 100 Index',              'indices','Major Index',100,1,0.1,  1.0, \-0.001500,-0.000800, 0.1,50, 0.1,  0,'FOREXCOM:UK100','^FTSE'), ('GER40', 'DAX 40 Index',               'indices','Major Index',100,1,0.1,  1.5, \-0.002000,-0.001000, 0.1,50, 0.1,  0,'FOREXCOM:DEU40','^GDAXI'), ('FRA40', 'CAC 40 Index',               'indices','Major Index',100,1,0.1,  1.2, \-0.001500,-0.000800, 0.1,50, 0.1,  0,'FOREXCOM:FRA40','^FCHI'), ('EU50',  'Euro Stoxx 50',              'indices','Major Index',100,1,0.1,  1.0, \-0.001500,-0.000800, 0.1,50, 0.1,  0,'FOREXCOM:EU50', '^STOXX50E'), ('JPN225','Nikkei 225',                 'indices','Major Index',100,1,1,    10.0,-0.003000,-0.001500, 0.1,50, 1,    0,'FOREXCOM:JPN225','^N225'), ('AUS200','ASX 200',                    'indices','Major Index',100,1,0.1,  1.0, \-0.002000,-0.001000, 0.1,50, 0.1,  0,'FOREXCOM:AUS200','^AXJO'), ('HK50',  'Hang Seng Index',            'indices','Major Index',50, 1,1,    8.0, \-0.003000,-0.002000, 0.1,50, 1,    0,'FOREXCOM:HK50', '^HSI'), \-- COMMODITIES ('XAUUSD','Gold / US Dollar',           'commodities','Precious Metal',200,100,0.01, 0.30,-0.000500,-0.000200,0.01,50,0.01, 0,'TVC:GOLD',     'GC=F'), ('XAGUSD','Silver / US Dollar',         'commodities','Precious Metal',100,5000,0.001,0.030,-0.000200,-0.000100,0.01,50,0.001,0,'TVC:SILVER',   'SI=F'), ('XPTUSD','Platinum / US Dollar',       'commodities','Precious Metal',50, 50,  0.01, 0.50,-0.000300,-0.000150,0.01,20,0.01, 0,'TVC:PLATINUM', 'PL=F'), ('XPDUSD','Palladium / US Dollar',      'commodities','Precious Metal',50, 100, 0.01, 1.00,-0.000400,-0.000200,0.01,20,0.01, 0,'TVC:PALLADIUM','PA=F'), ('WTIUSD','WTI Crude Oil',              'commodities','Energy',        50, 1000,0.01, 0.040,-0.000300,-0.000100,0.01,50,0.01, 0,'TVC:USOIL',    'CL=F'), ('BRTUSD','Brent Crude Oil',            'commodities','Energy',        50, 1000,0.01, 0.045,-0.000300,-0.000100,0.01,50,0.01, 0,'TVC:UKOIL',    'BZ=F'), ('NGASUSD','Natural Gas',               'commodities','Energy',        25, 10000,0.001,0.003,-0.000200,-0.000100,0.01,30,0.001,0,'TVC:NATURALGAS','NG=F'), ('COPUSD','Copper',                     'commodities','Industrial Metal',25,25000,0.0001,0.0030,-0.000150,-0.000080,0.01,30,0.0001,0,'TVC:COPPER','HG=F'), ('CORNUSD','Corn Futures',              'commodities','Agriculture',   20, 5000, 0.001,0.010,-0.000100,-0.000050,0.01,20,0.001,0,'CBOT:ZC1\!',    'ZC=F'), ('WHTUSD','Wheat Futures',              'commodities','Agriculture',   20, 5000, 0.001,0.015,-0.000100,-0.000050,0.01,20,0.001,0,'CBOT:ZW1\!',    'ZW=F'), \-- STOCKS (leverage 1:10 to 1:20) ('AAPL', 'Apple Inc.',                  'stocks','Large Cap Equity',20,1,0.01,0.05,-0.000250,-0.000100,0.1,1000,0.01,0.1,'NASDAQ:AAPL', 'AAPL'), ('MSFT', 'Microsoft Corporation',       'stocks','Large Cap Equity',20,1,0.01,0.06,-0.000250,-0.000100,0.1,1000,0.01,0.1,'NASDAQ:MSFT', 'MSFT'), ('NVDA', 'NVIDIA Corporation',          'stocks','Large Cap Equity',20,1,0.01,0.08,-0.000300,-0.000120,0.1,500, 0.01,0.1,'NASDAQ:NVDA', 'NVDA'), ('AMZN', 'Amazon.com Inc.',             'stocks','Large Cap Equity',20,1,0.01,0.07,-0.000280,-0.000110,0.1,1000,0.01,0.1,'NASDAQ:AMZN', 'AMZN'), ('GOOGL','Alphabet Inc.',               'stocks','Large Cap Equity',20,1,0.01,0.06,-0.000260,-0.000100,0.1,1000,0.01,0.1,'NASDAQ:GOOGL','GOOGL'), ('META', 'Meta Platforms Inc.',         'stocks','Large Cap Equity',20,1,0.01,0.07,-0.000280,-0.000110,0.1,1000,0.01,0.1,'NASDAQ:META', 'META'), ('TSLA', 'Tesla Inc.',                  'stocks','Large Cap Equity',10,1,0.01,0.10,-0.000400,-0.000150,0.1,500, 0.01,0.1,'NASDAQ:TSLA', 'TSLA'), ('JPM',  'JPMorgan Chase & Co.',        'stocks','Large Cap Equity',20,1,0.01,0.05,-0.000230,-0.000090,0.1,1000,0.01,0.1,'NYSE:JPM',   'JPM'), ('V',    'Visa Inc.',                   'stocks','Large Cap Equity',20,1,0.01,0.05,-0.000220,-0.000090,0.1,1000,0.01,0.1,'NYSE:V',     'V'), ('WMT',  'Walmart Inc.',                'stocks','Large Cap Equity',20,1,0.01,0.04,-0.000200,-0.000080,0.1,1000,0.01,0.1,'NYSE:WMT',   'WMT'); |
| :---- |

# **19\. Index Summary**

Total indexes across all tables. Partial indexes (WHERE clause) are used extensively to minimise index size on high-volume tables.

| Table | Index | Type | Purpose |
| :---- | :---- | :---- | :---- |
| **users** | idx\_users\_ib\_id | B-tree | IB admin client list queries |
| **users** | idx\_users\_email | B-tree | Login lookup |
| **users** | idx\_users\_kyc\_status | B-tree | KYC queue filtering |
| **users** | idx\_users\_ib\_created | B-tree | IB dashboard — recent signups |
| **users** | idx\_users\_name\_trgm | GIN | Admin full-text name search |
| **positions** | idx\_positions\_open | Partial | Trade Engine — open positions per account |
| **positions** | idx\_positions\_instrument\_open | Partial | Trade Engine — open positions per symbol |
| **positions** | idx\_positions\_account\_history | Partial | Portfolio page — closed trade history |
| **orders** | idx\_orders\_pending | Partial | Trade Engine — pending orders per symbol |
| **orders** | idx\_orders\_oco\_group | Partial | OCO partner lookup |
| **transactions** | idx\_txn\_account\_id | B-tree | Wallet ledger page |
| **transactions** | idx\_txn\_reference | Partial | Cross-reference deposits/positions |
| **transactions** | idx\_txn\_status | Partial | Pending transaction monitoring |
| **kyc\_submissions** | idx\_kyc\_active | Partial | Current active submission per user |
| **kyc\_submissions** | idx\_kyc\_pending | Partial | IB KYC review queue |
| **deposits** | idx\_deposits\_status | Partial | Pending deposit polling job |
| **notifications** | idx\_notifications\_unread | Partial | Unread badge count |
| **bonuses** | idx\_bonuses\_active | Partial | Active bonus lookup per account |

# **20\. Migration Execution Order**

Apply migrations in this exact order to satisfy all foreign key dependencies:

| 001\_extensions.sql          \-- pgcrypto, pg\_trgm 002\_enums.sql               \-- All CREATE TYPE statements 003\_trigger\_function.sql    \-- trigger\_set\_updated\_at() 004\_ib\_accounts.sql         \-- No FK dependencies 005\_users.sql               \-- FK: ib\_accounts 006\_accounts.sql            \-- FK: users 007\_instruments.sql         \-- No FK dependencies 008\_orders.sql              \-- FK: accounts, instruments (positions FK added later) 009\_positions.sql           \-- FK: accounts, instruments, orders 010\_transactions.sql        \-- FK: accounts 011\_kyc\_submissions.sql     \-- FK: users, ib\_accounts 012\_deposits.sql            \-- FK: accounts, transactions 013\_withdrawals.sql         \-- FK: accounts, ib\_accounts, transactions 014\_bonuses.sql             \-- FK: accounts, ib\_accounts, transactions 015\_swap\_history.sql        \-- FK: positions, accounts, instruments, transactions 016\_notifications.sql       \-- FK: users 017\_refresh\_tokens.sql      \-- FK: users 018\_email\_verifications.sql \-- FK: users 019\_password\_resets.sql     \-- FK: users 020\_ib\_agents.sql           \-- FK: ib\_accounts 021\_call\_reminders.sql      \-- FK: users, ib\_accounts 022\_ftd\_rtd\_monthly.sql     \-- Materialised view: FTD/RTD aggregates 023\_seed\_super\_admin.sql    \-- Seed: super admin ib\_account 024\_seed\_instruments.sql    \-- Seed: all 60 instruments |
| :---- |

*ℹ  Use Prisma Migrate or Drizzle Kit to manage these migrations. Never run raw SQL in production without a migration tool tracking applied versions.*

*— End of Database Schema Document —*