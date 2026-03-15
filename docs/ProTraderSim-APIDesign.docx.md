

**PROTRADER SIM**

API Design Document

*REST Endpoints · Request & Response Schemas · Error Codes · WebSocket Contracts*

Version 1.0  —  API Baseline  
Date: March 14, 2026  
Base URL: https://api.protradersim.com/api/v1

**CONFIDENTIAL — Internal Use Only**

# **Table of Contents**

# **1\. API Conventions**

## **1.1 Base URL & Versioning**

| Production:  https://api.protradersim.com/api/v1 Staging:     https://api-staging.protradersim.com/api/v1 WebSocket:   wss://api.protradersim.com  (Socket.io path: /socket.io) |
| :---- |

## **1.2 Authentication**

All protected endpoints require a valid JWT access token in the Authorization header.

| Authorization: Bearer \<access\_token\> |
| :---- |

* Access tokens expire in 60 seconds. Use POST /auth/refresh to get a new one silently.

* Refresh tokens are stored in httpOnly, Secure, SameSite=Strict cookies — never in localStorage.

* Admin endpoints require role: agent, ib\_team\_leader, or super\_admin. Agents have access to KYC review (Step 1 only) and balance/bonus credit. IB Team Leaders have full IB panel access. super\_admin has global access. All IB-scoped roles are automatically filtered by ib\_id middleware.

## **1.3 Request Format**

* All request bodies are JSON. Set Content-Type: application/json on all POST/PUT/PATCH requests.

* File uploads (KYC) use multipart/form-data.

* Query parameters are snake\_case. Request body fields are camelCase.

## **1.4 Response Envelope**

All responses follow a consistent envelope structure:

| // Success {   "success": true,   "data": { ... },          // Response payload   "meta": {                 // Optional — present on paginated responses     "page": 1,     "perPage": 20,     "total": 342,     "totalPages": 18   } } // Error {   "success": false,   "error": {     "code": "INSUFFICIENT\_MARGIN",     "message": "Not enough free margin to place this order.",     "details": { "required": 250.00, "available": 120.50 }  // optional   } } |
| :---- |

## **1.5 Pagination**

All list endpoints support cursor-based or offset pagination via query parameters:

| GET /positions?page=2\&perPage=20\&sortBy=opened\_at\&sortDir=desc |
| :---- |

| Parameter | Default | Description |
| :---- | :---- | :---- |
| page | 1 | Page number (1-indexed) |
| perPage | 20 | Items per page. Max 100\. |
| sortBy | created\_at | Column to sort by |
| sortDir | desc | asc or desc |

## **1.6 Standard HTTP Status Codes**

| Code | Meaning | When Used |
| :---- | :---- | :---- |
| 200 | **OK** | Successful GET, PUT, PATCH |
| 201 | **Created** | Successful POST that creates a resource |
| 204 | **No Content** | Successful DELETE |
| 400 | **Bad Request** | Validation error — missing or invalid fields |
| 401 | **Unauthorized** | Missing or invalid access token |
| 403 | **Forbidden** | Valid token but insufficient role/permission |
| 404 | **Not Found** | Resource does not exist |
| 409 | **Conflict** | Duplicate resource (e.g. email already registered) |
| 422 | **Unprocessable Entity** | Business logic error (e.g. insufficient margin, KYC not approved) |
| 429 | **Too Many Requests** | Rate limit exceeded |
| 500 | **Internal Server Error** | Unexpected server error — log and alert |

## **1.7 Standard Error Codes**

| Error Code | HTTP Status | Description |
| :---- | :---- | :---- |
| VALIDATION\_ERROR | 400 | One or more request fields failed validation |
| INVALID\_CREDENTIALS | 401 | Wrong email or password on login |
| TOKEN\_EXPIRED | 401 | Access token has expired — refresh required |
| TOKEN\_INVALID | 401 | Token signature invalid or malformed |
| UNAUTHORIZED | 403 | Action not permitted for this role |
| IB\_SCOPE\_VIOLATION | 403 | IB admin attempted to access another IB's user |
| NOT\_FOUND | 404 | Requested resource does not exist |
| EMAIL\_ALREADY\_EXISTS | 409 | Registration email is already taken |
| EMAIL\_NOT\_VERIFIED | 422 | Login attempted before email verification |
| KYC\_NOT\_APPROVED | 422 | Trading action requires approved KYC |
| ACCOUNT\_LOCKED | 422 | Account has been locked by IB admin |
| INSUFFICIENT\_MARGIN | 422 | Not enough free margin to place order |
| INVALID\_LOT\_SIZE | 422 | Lot size below min or above max for instrument |
| INSTRUMENT\_INACTIVE | 422 | Instrument is currently disabled |
| MARKET\_OFFLINE | 422 | Price feed stale — order placement blocked |
| ORDER\_NOT\_MODIFIABLE | 422 | Order is in a state that cannot be modified |
| INSUFFICIENT\_BALANCE | 422 | Withdrawal amount exceeds available real balance |
| RATE\_LIMIT\_EXCEEDED | 429 | Too many requests — slow down |

# **2\. Authentication Endpoints**

| 🔒 AUTH:  No auth required unless marked. Refresh token is always sent/received as an httpOnly cookie. |
| :---- |

## **2.1 Register — Multi-Step**

| POST | /auth/register | Submit one step of the 4-step registration wizard |
| :---: | :---- | :---- |

Registration is a 4-step wizard. Each step is a separate POST call. The server issues a registration\_token after step 1 which must be passed in subsequent steps.

### **Step 1 — Personal Details**

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| firstName | string | Yes | Legal first name |
| lastName | string | Yes | Legal last name |
| email | string | Yes | Must be unique. Validated as valid email format. |
| phone | string | No | Phone number with country code |
| dateOfBirth | string | Yes | ISO 8601 date: YYYY-MM-DD |
| country | string | Yes | ISO 3166-1 alpha-2 country code |
| ibCode | string | No | IB referral code from registration link. If omitted, assigned to default IB. |

| // Step 1 Response 201 {   "success": true,   "data": {     "registrationToken": "eyJhb...",  // short-lived token (30 min) to link steps     "step": 1,     "nextStep": 2   } } |
| :---- |

### **Step 2 — Address**

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| registrationToken | string | Yes | Token from Step 1 |
| address | string | Yes | Street address |
| city | string | Yes | City |
| postalCode | string | Yes | Postal / ZIP code |

### **Step 3 — Trading Experience**

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| registrationToken | string | Yes | Token from Step 1 |
| tradingExperience | string | Yes | none | beginner | intermediate | advanced |
| employmentStatus | string | No | employed | self\_employed | student | retired | other |
| annualIncome | string | No | Range string e.g. '50000-100000' |

### **Step 4 — Credentials & Consent (Final)**

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| registrationToken | string | Yes | Token from Step 1 |
| password | string | Yes | Min 8 chars, must contain uppercase, number, special char |
| confirmPassword | string | Yes | Must match password |
| acceptTerms | boolean | Yes | Must be true |
| acceptRiskDisclosure | boolean | Yes | Must be true |

| // Step 4 Response 201 {   "success": true,   "data": {     "userId": "uuid",     "email": "user@example.com",     "message": "Registration complete. Please verify your email."   } } |
| :---- |

## **2.2 Verify Email**

| POST | /auth/verify-email | Activate account via emailed verification token |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| token | string | Yes | Token from verification email link |

| // Response 200 { "success": true, "data": { "message": "Email verified successfully." } } |
| :---- |

## **2.3 Login**

| POST | /auth/login | Authenticate and receive access token |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| email | string | Yes | Registered email address |
| password | string | Yes | Account password |
| totp | string | No | 6-digit TOTP code — required if 2FA is enabled |

| // Response 200 {   "success": true,   "data": {     "accessToken": "eyJhbGci...",     "expiresIn": 900,     "user": {       "id": "uuid",       "email": "user@example.com",       "firstName": "John",       "lastName": "Doe",       "role": "trader",       "kycStatus": "approved",       "emailVerified": true     }   }   // Refresh token set as httpOnly cookie: refresh\_token } |
| :---- |

## **2.4 Refresh Access Token**

| POST | /auth/refresh | Exchange refresh cookie for a new access token |
| :---: | :---- | :---- |

No body required. Refresh token is read from the httpOnly cookie automatically by the browser.

| // Response 200 { "success": true, "data": { "accessToken": "eyJhb...", "expiresIn": 900 } } |
| :---- |

## **2.5 Logout**

| POST | /auth/logout | Revoke refresh token and clear cookie |
| :---: | :---- | :---- |

| // Response 200 { "success": true, "data": { "message": "Logged out successfully." } } |
| :---- |

## **2.6 Forgot Password**

| POST | /auth/forgot-password | Send password reset email |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| email | string | Yes | Registered email address |

| // Response 200 (always — prevents email enumeration) { "success": true, "data": { "message": "If that email exists, a reset link has been sent." } } |
| :---- |

## **2.7 Reset Password**

| POST | /auth/reset-password | Set new password using reset token from email |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| token | string | Yes | Reset token from email link |
| newPassword | string | Yes | New password — same rules as registration |
| confirmPassword | string | Yes | Must match newPassword |

# **3\. User Endpoints**

| 🔒 AUTH:  All endpoints in this section require: Authorization: Bearer \<access\_token\> |
| :---- |

## **3.1 Get Current User Profile**

| GET | /users/me | Return the authenticated user's profile |
| :---: | :---- | :---- |

| // Response 200 {   "success": true,   "data": {     "id": "uuid",     "email": "user@example.com",     "firstName": "John",     "lastName": "Doe",     "phone": "+44 7700 900000",     "country": "GB",     "kycStatus": "approved",     "emailVerified": true,     "createdAt": "2024-01-15T10:30:00Z"   } } |
| :---- |

## **3.2 Update Profile**

| PUT | /users/me | Update editable profile fields |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| firstName | string | No | Updated first name |
| lastName | string | No | Updated last name |
| phone | string | No | Updated phone number |
| city | string | No | Updated city |
| postalCode | string | No | Updated postal code |
| address | string | No | Updated address |

## **3.3 Change Password**

| PUT | /users/me/password | Change account password |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| currentPassword | string | Yes | Must match existing password |
| newPassword | string | Yes | New password — min 8 chars |
| confirmPassword | string | Yes | Must match newPassword |

## **3.4 Enable / Disable 2FA**

| POST | /users/me/2fa/setup | Generate TOTP secret and QR code URI |
| :---: | :---- | :---- |

| // Response 200 {  "data": { "secret": "BASE32SECRET", "qrCodeUri": "otpauth://..." } } |
| :---- |

| POST | /users/me/2fa/confirm | Confirm TOTP setup with first valid code |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| totp | string | Yes | 6-digit TOTP code from authenticator app |

| DELETE | /users/me/2fa | Disable 2FA (requires current TOTP code) |
| :---: | :---- | :---- |

# **4\. KYC Endpoints**

| 🔒 AUTH:  Requires authenticated trader token. |
| :---- |

## **4.1 Get KYC Status**

| GET | /kyc/status | Return current KYC submission status |
| :---: | :---- | :---- |

| // Response 200 {   "data": {     "status": "rejected",     "rejectionNote": "ID document is blurry. Please re-upload a clearer photo.",     "reviewedAt": "2024-03-01T09:00:00Z",     "submittedAt": "2024-02-28T14:22:00Z"   } } |
| :---- |

## **4.2 Upload KYC Documents**

| POST | /kyc/upload | Upload identity documents — multipart/form-data |
| :---: | :---- | :---- |

| FILE LIMITS:  Max 10MB per file. Accepted types: image/jpeg, image/png, application/pdf. All four documents must be submitted in a single request. |
| :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| idFront | file | Yes | Government ID — front side |
| idBack | file | Yes | Government ID — back side |
| proofOfAddress | file | Yes | Utility bill or bank statement (\< 3 months old) |
| selfie | file | Yes | Selfie holding the ID document |

| // Response 201 { "data": { "submissionId": "uuid", "status": "pending", "message": "Documents submitted for review." } } |
| :---- |

## **4.3 Re-submit KYC Documents**

| POST | /kyc/resubmit | Re-upload after rejection — same schema as /kyc/upload |
| :---: | :---- | :---- |

Archives the previous submission and creates a new one. Status is reset to pending.

# **5\. Instruments Endpoints**

| 🔒 AUTH:  GET /instruments is public. GET /instruments/:symbol/price requires auth. |
| :---- |

## **5.1 List All Instruments**

| GET | /instruments | Return all active instruments with configuration |
| :---: | :---- | :---- |

Query parameters:

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| assetClass | string | No | Filter by: forex | crypto | indices | commodities | stocks |
| search | string | No | Search by symbol or display name |
| active | boolean | No | Default: true. Set false to include inactive instruments. |

| // Response 200 {   "data": \[     {       "id": "uuid",       "symbol": "EURUSD",       "displayName": "Euro / US Dollar",       "assetClass": "forex",       "segment": "Major",       "leverage": 500,       "contractSize": 100000,       "pipSize": 0.0001,       "spread": 0.00012,       "minLot": 0.01,       "maxLot": 100,       "tvSymbol": "FX:EURUSD",       "isActive": true     }     // ... all 60 instruments   \] } |
| :---- |

## **5.2 Get Latest Price Snapshot**

| GET | /instruments/:symbol/price | Return latest cached price for a symbol |
| :---: | :---- | :---- |

| // Response 200 {   "data": {     "symbol": "EURUSD",     "bid": 1.08432,     "ask": 1.08436,     "spread": 0.00004,     "timestamp": 1710000000000,     "stale": false   } } |
| :---- |

# **6\. Orders Endpoints**

| 🔒 AUTH:  All endpoints require authenticated trader token. KYC must be approved. Account must not be locked. |
| :---- |

## **6.1 Place Order**

| POST | /orders | Place a new order of any type |
| :---: | :---- | :---- |

| SERVER-SIDE ONLY:  The server calculates margin, fill price, and slippage. Never trust client-submitted financial values. |
| :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| symbol | string | Yes | Instrument symbol e.g. EURUSD |
| type | string | Yes | market | limit | stop | stop\_limit | trailing\_stop | oco |
| direction | string | Yes | long | short |
| lots | number | Yes | Order size in lots. Must be within instrument min/max. |
| price | number | Conditional | Required for limit, stop, stop\_limit. Trigger/limit price. |
| stopPrice | number | Conditional | Required for stop\_limit only. Activation price. |
| tpPrice | number | No | Take Profit price. Attached to position on fill. |
| slPrice | number | No | Stop Loss price. Attached to position on fill. |
| trailingPips | number | Conditional | Required for trailing\_stop. Distance in pips. |
| ocoLinkedId | string | Conditional | For OCO pair — the ID of the other OCO order. |

| // Example: Place a Buy Limit on EURUSD with TP and SL {   "symbol": "EURUSD",   "type": "limit",   "direction": "long",   "lots": 0.1,   "price": 1.0820,   "tpPrice": 1.0900,   "slPrice": 1.0780 } // Response 201 {   "data": {     "orderId": "uuid",     "type": "limit",     "status": "pending",     "symbol": "EURUSD",     "direction": "long",     "lots": 0.1,     "price": 1.0820,     "tpPrice": 1.0900,     "slPrice": 1.0780,     "marginRequired": 216.40,     "placedAt": "2024-03-10T12:00:00Z"   } } // Response for Market Order (filled immediately) {   "data": {     "orderId": "uuid",     "status": "filled",     "fillPrice": 1.08436,     "slippage": 0.0,     "positionId": "uuid",     "filledAt": "2024-03-10T12:00:00.142Z"   } } |
| :---- |

## **6.2 List Orders**

| GET | /orders | Return paginated order list |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| status | string | No | pending | filled | cancelled | rejected | expired. Default: all. |
| symbol | string | No | Filter by instrument symbol |
| type | string | No | Filter by order type |
| from | string | No | ISO 8601 start date for history |
| to | string | No | ISO 8601 end date for history |
| page | number | No | Page number |
| perPage | number | No | Items per page (max 100\) |

## **6.3 Modify Pending Order**

| PUT | /orders/:orderId | Modify a pending order's price, TP, or SL |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| price | number | No | New trigger/limit price |
| tpPrice | number | No | Updated Take Profit price |
| slPrice | number | No | Updated Stop Loss price |

| ⚠ ERROR:  Returns ORDER\_NOT\_MODIFIABLE (422) if order is already filled, cancelled, or expired. |
| :---- |

## **6.4 Cancel Pending Order**

| DELETE | /orders/:orderId | Cancel a pending order |
| :---: | :---- | :---- |

| // Response 200 { "data": { "orderId": "uuid", "status": "cancelled", "cancelledAt": "2024-03-10T..." } } |
| :---- |

# **7\. Positions Endpoints**

| 🔒 AUTH:  All endpoints require authenticated trader token. |
| :---- |

## **7.1 List Open Positions**

| GET | /positions | Return all open positions with real-time metrics |
| :---: | :---- | :---- |

| // Response 200 {   "data": \[     {       "id": "uuid",       "symbol": "EURUSD",       "direction": "long",       "lots": 0.5,       "entryPrice": 1.08250,       "currentBid": 1.08390,       "currentAsk": 1.08394,       "floatingPnl": 70.00,       "marginUsed": 108.25,       "tpPrice": 1.09000,       "slPrice": 1.07800,       "swapAccrued": \-1.20,       "openedAt": "2024-03-09T08:15:00Z"     }   \] } |
| :---- |

## **7.2 Close Position**

| DELETE | /positions/:positionId | Close a position fully or partially |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| lots | number | No | Lots to close. Omit for full close. Must be ≤ open lots. |

| // Response 200 {   "data": {     "positionId": "uuid",     "closePrice": 1.08394,     "lotsClosedl": 0.5,     "realizedPnl": 72.00,     "closedAt": "2024-03-10T14:30:00Z"   } } |
| :---- |

## **7.3 Update Position TP / SL**

| PATCH | /positions/:positionId | Modify TP or SL on an open position |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| tpPrice | number | No | New Take Profit price. Null to remove. |
| slPrice | number | No | New Stop Loss price. Null to remove. |

# **8\. Account Endpoints**

| 🔒 AUTH:  Requires authenticated trader token. |
| :---- |

## **8.1 Get Account Metrics**

| GET | /account/metrics | Return live financial metrics for the authenticated account |
| :---: | :---- | :---- |

This endpoint returns a snapshot. Real-time updates are delivered via WebSocket (account:metrics event).

| // Response 200 {   "data": {     "balance": 5000.00,     "bonusBalance": 500.00,     "equity": 5142.50,     "marginUsed": 540.00,     "freeMargin": 4602.50,     "marginLevel": 952.31,     "floatingPnl": 142.50,     "currency": "USD",     "isLocked": false,     "marginCallPct": 80,     "stopOutPct": 50   } } |
| :---- |

# **9\. Wallet Endpoints**

| 🔒 AUTH:  Requires authenticated trader token. Deposits require active account. Withdrawals additionally require approved KYC. |
| :---- |

## **9.1 Get Wallet Summary**

| GET | /wallet | Return wallet balances and pending transaction count |
| :---: | :---- | :---- |

| // Response 200 {   "data": {     "balance": 5000.00,     "bonusBalance": 500.00,     "pendingDeposits": 1,     "pendingWithdrawals": 0,     "currency": "USD"   } } |
| :---- |

## **9.2 Initiate Deposit**

| POST | /wallet/deposit | Create a NowPayments.io payment — returns crypto address |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coin | string | Yes | usdttrc20 | usdterc20 | eth |
| amountUsd | number | Yes | Requested USD deposit amount |

| // Response 201 {   "data": {     "depositId": "uuid",     "coin": "usdttrc20",     "payAddress": "TRx9k...",     "payAmount": 100.00,     "payCurrency": "USDT",     "network": "TRC20",     "expiresAt": "2024-03-10T13:00:00Z",     "qrCodeData": "tron:TRx9k...?amount=100"   } } |
| :---- |

## **9.3 Submit Withdrawal Request**

| POST | /wallet/withdraw | Request a withdrawal to a crypto wallet |
| :---: | :---- | :---- |

| VALIDATION:  Amount must not exceed real balance (bonus\_balance excluded). KYC must be approved. Account must not be locked. |
| :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coin | string | Yes | usdttrc20 | usdterc20 | eth |
| walletAddress | string | Yes | Destination crypto wallet address |
| amountUsd | number | Yes | USD amount to withdraw |

| // Response 201 {   "data": {     "withdrawalId": "uuid",     "status": "pending",     "amountUsd": 200.00,     "message": "Withdrawal request submitted. Pending IB approval."   } } |
| :---- |

## **9.4 Get Transaction History**

| GET | /wallet/transactions | Return paginated ledger of all wallet events |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| type | string | No | Filter by transaction type (deposit | withdrawal | trade\_pnl | swap | ...) |
| from | string | No | ISO 8601 start date |
| to | string | No | ISO 8601 end date |
| page | number | No | Page number |
| perPage | number | No | Default 20, max 100 |

| // Response 200 {   "data": \[     {       "id": "uuid",       "type": "deposit",       "amount": 500.00,       "balanceAfter": 5500.00,       "status": "completed",       "memo": null,       "createdAt": "2024-03-10T12:00:00Z"     }   \],   "meta": { "page": 1, "perPage": 20, "total": 47, "totalPages": 3 } } |
| :---- |

# **10\. Portfolio Endpoints**

| 🔒 AUTH:  Requires authenticated trader token. |
| :---- |

## **10.1 Get Closed Trade History**

| GET | /portfolio/history | Return paginated closed position history |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| symbol | string | No | Filter by symbol |
| direction | string | No | long | short |
| from | string | No | Date range start |
| to | string | No | Date range end |
| page | number | No | Page number |
| perPage | number | No | Default 20, max 100 |

| // Response 200 — each item {   "id": "uuid",   "symbol": "XAUUSD",   "direction": "long",   "lots": 0.1,   "entryPrice": 2010.50,   "closePrice": 2025.80,   "realizedPnl": 153.00,   "swapAccrued": \-2.40,   "commission": 0.00,   "netPnl": 150.60,   "closeReason": "tp",   "openedAt": "2024-03-09T...",   "closedAt": "2024-03-10T..." } |
| :---- |

## **10.2 Get Performance Summary**

| GET | /portfolio/summary | Return aggregate P\&L metrics |
| :---: | :---- | :---- |

| // Response 200 {   "data": {     "totalTrades": 142,     "winningTrades": 84,     "losingTrades": 58,     "winRate": 59.15,     "totalRealizedPnl": 3420.50,     "totalSwapPaid": \-88.20,     "totalCommissionPaid": 0.00,     "netPnl": 3332.30,     "largestWin": 540.00,     "largestLoss": \-210.00,     "averageWin": 120.50,     "averageLoss": \-72.30   } } |
| :---- |

# **11\. Notifications Endpoints**

| 🔒 AUTH:  Requires authenticated trader token. |
| :---- |

## **11.1 List Notifications**

| GET | /notifications | Return paginated notification list |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| unreadOnly | boolean | No | true to return only unread notifications |
| page | number | No | Page number |
| perPage | number | No | Default 20, max 50 |

## **11.2 Mark Notifications as Read**

| PUT | /notifications/read | Mark one or all notifications as read |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| ids | string\[\] | No | Array of notification UUIDs to mark read. Omit to mark ALL as read. |

# **12\. Admin Endpoints — User Management**

| 🔒 AUTH:  All /admin/\* endpoints require role: agent | ib\_team\_leader | super\_admin. All IB-scoped roles (agent, ib\_team\_leader) are automatically filtered by ib\_id middleware — cross-pool data access is impossible. |
| :---- |

## **12.1 List Users / Leads**

| GET | /admin/users | Return paginated list of all users under this IB |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| kycStatus | string | No | Filter: not\_started | pending | approved | rejected |
| isActive | boolean | No | Filter active/inactive accounts |
| search | string | No | Search by name or email (trigram index) |
| from | string | No | Registration date range start |
| to | string | No | Registration date range end |
| page | number | No | Page number |
| perPage | number | No | Default 20, max 100 |

| // Response 200 — each user item {   "id": "uuid",   "email": "trader@example.com",   "firstName": "Jane",   "lastName": "Smith",   "country": "SG",   "kycStatus": "pending",   "balance": 0,   "bonusBalance": 0,   "equity": 0,   "openPositions": 0,   "isActive": true,   "createdAt": "2024-03-10T..." } |
| :---- |

## **12.2 Get User Detail**

| GET | /admin/users/:userId | Full user profile, account metrics, and recent activity |
| :---: | :---- | :---- |

| // Response 200 {   "data": {     "user": { /\* full user profile \*/ },     "account": { "balance": 1500, "bonusBalance": 200, "equity": 1650, "marginUsed": 0 },     "kycSubmission": { "status": "approved", "reviewedAt": "..." },     "recentPositions": \[ /\* last 5 closed positions \*/ \],     "recentTransactions": \[ /\* last 10 transactions \*/ \],     "stats": { "totalTrades": 42, "totalVolume": 12.5, "netPnl": 320.00 }   } } |
| :---- |

## **12.3 Lock / Unlock Account**

| PATCH | /admin/users/:userId/lock | Toggle account lock — prevents trading |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| locked | boolean | Yes | true to lock, false to unlock |
| reason | string | No | Reason for lock (logged in memo) |

# **13\. Admin Endpoints — KYC**

Two-step KYC review workflow: Step 1 (Agent recommendation) → Step 2 (IB Team Leader final decision). Agents cannot approve or reject — they recommend. Only the IB Team Leader makes the binding decision.

## **13.1 Get KYC Review Queue**

| GET | /admin/kyc | Paginated KYC submissions. Agents see: pending. Team Leaders see: pending \+ pending\_tl\_review. |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| status | string | No | pending | pending\_tl\_review | approved | rejected. Filtered by role automatically. |
| page | number | No | Page number |
| perPage | number | No | Default 20 |

## **13.2 Get KYC Document Signed URLs**

| GET | /admin/kyc/:submissionId/documents | Return pre-signed R2 URLs for document viewing — 60 second expiry |
| :---: | :---- | :---- |

Signed URLs expire in 60 seconds. Every document access is logged (who, what, when) for compliance audit.

| // Response 200 {   "data": {     "idFrontUrl":         "https://r2.cloudflarestorage.com/...?X-Amz-Expires=60...",     "idBackUrl":          "https://r2.cloudflarestorage.com/...?X-Amz-Expires=60...",     "proofOfAddressUrl":  "https://r2.cloudflarestorage.com/...?X-Amz-Expires=60...",     "selfieUrl":          "https://r2.cloudflarestorage.com/...?X-Amz-Expires=60...",     "expiresAt":          "2024-03-10T12:00:60Z"   } } |
| :---- |

## **13.3 Agent — Step 1: Submit Recommendation**

| 🔒 AUTH:  Requires role: agent. Agents may ONLY recommend — they cannot make a final decision. |  |  |
| ----- | :---- | :---- |
| **POST** | /admin/kyc/:submissionId/recommend | Step 1: Agent submits recommendation to IB Team Leader |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| recommendation | string | Yes | recommend\_approve | recommend\_reject |
| note | string | Conditional | Mandatory when recommendation \= recommend\_reject |

| // Response 200 { "data": { "submissionId": "uuid", "status": "pending\_tl\_review", "recommendation": "recommend\_reject" } } |
| :---- |

On submission: kyc\_submissions.status moves to pending\_tl\_review. IB Team Leader receives a notification. Trader is NOT notified at this stage.

## **13.4 Team Leader — Step 2: Final Decision**

| 🔒 AUTH:  Requires role: ib\_team\_leader. Only Team Leaders can approve or reject — not agents. |  |  |
| ----- | :---- | :---- |
| **POST** | /admin/kyc/:submissionId/decide | Step 2: IB Team Leader makes the final binding KYC decision |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| decision | string | Yes | approve | reject |
| rejectionNote | string | Conditional | Mandatory when decision \= reject. Shown to the trader. |

| // Response 200 — approve { "data": { "submissionId": "uuid", "status": "approved", "userId": "uuid" } } // Response 200 — reject { "data": { "submissionId": "uuid", "status": "rejected", "rejectionNote": "..." } } |
| :---- |

On approve: users.kyc\_status \= approved, kyc:status WebSocket event pushed, approval email sent. On reject: rejection email sent with reason, resubmission counter incremented. After 3 rejections: account locked pending Super Admin unlock.

## **13.5 Trigger Re-verification**

| 🔒 AUTH:  Requires role: ib\_team\_leader | super\_admin. Agents cannot force re-verification. |  |  |
| ----- | :---- | :---- |
| **POST** | /admin/kyc/reverify/:userId | Force a user to re-submit KYC — resets status to not\_started |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| reason | string | No | Internal note for the re-verification trigger (not shown to user) |

# **14\. Admin Endpoints — Balance & Bonus**

## **14.1 Credit Real Balance**

| POST | /admin/balance/credit | Add real balance to a user's account |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| userId | string | Yes | Target user UUID |
| amount | number | Yes | USD amount to credit. Must be \> 0\. |
| memo | string | No | Reason or note (visible in transaction ledger) |

| // Response 201 {   "data": {     "transactionId": "uuid",     "userId": "uuid",     "amount": 500.00,     "newBalance": 500.00,     "type": "ib\_credit"   } } |
| :---- |

## **14.2 Debit Real Balance**

| POST | /admin/balance/debit | Deduct real balance from a user's account |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| userId | string | Yes | Target user UUID |
| amount | number | Yes | USD amount to debit. Must not exceed current balance. |
| memo | string | Yes | Mandatory reason for debit (logged to transactions) |

## **14.3 Grant Bonus**

| POST | /admin/bonus/grant | Add tradable non-withdrawable bonus to a user's account |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| userId | string | Yes | Target user UUID |
| amount | number | Yes | Bonus amount in USD. Must be \> 0\. |
| memo | string | No | Purpose of bonus (displayed in wallet) |

| // Response 201 {   "data": {     "bonusId": "uuid",     "userId": "uuid",     "amount": 200.00,     "newBonusBalance": 200.00   } } |
| :---- |

## **14.4 Revoke Bonus**

| DELETE | /admin/bonus/:bonusId | Revoke an active bonus from a user's account |
| :---: | :---- | :---- |

Removes the bonus from accounts.bonus\_balance. Creates a BONUS\_REVOKE transaction record. Cannot be undone.

# **15\. Admin Endpoints — Withdrawals**

## **15.1 List Pending Withdrawals**

| GET | /admin/withdrawals | Return paginated withdrawal requests |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| status | string | No | pending | approved | completed | rejected. Default: pending. |
| page | number | No | Page number |
| perPage | number | No | Default 20 |

## **15.2 Approve Withdrawal**

| POST | /admin/withdrawals/:withdrawalId/approve | Approve and dispatch payout via NowPayments.io |
| :---: | :---- | :---- |

Triggers NowPayments.io Mass Payout API call. On success, updates transaction status to completed and notifies user.

## **15.3 Reject Withdrawal**

| POST | /admin/withdrawals/:withdrawalId/reject | Reject and reverse the reserved balance |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| rejectionNote | string | Yes | Reason shown to the user |

# **16\. Admin Endpoints — Reports**

## **16.1 Dashboard Summary**

| GET | /admin/reports/dashboard | Return aggregate KPIs for admin dashboard |
| :---: | :---- | :---- |

| // Response 200 {   "data": {     "totalUsers": 1240,     "activeTraders": 386,     "pendingKyc": 14,     "todaySignups": 7,     "totalEquity": 284500.00,     "totalOpenPositions": 94,     "totalVolumeLots": 4820.5,     "pendingWithdrawals": 3,     "pendingDeposits": 2   } } |
| :---- |

## **16.2 Export User List (CSV)**

| GET | /admin/reports/users/export | Download full user list as CSV |
| :---: | :---- | :---- |

Returns Content-Type: text/csv with Content-Disposition: attachment; filename=users\_export.csv

## **16.3 Trading Volume Report**

| GET | /admin/reports/volume | Return volume breakdown by asset class and date range |
| :---: | :---- | :---- |

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| from | string | Yes | ISO 8601 start date |
| to | string | Yes | ISO 8601 end date |
| groupBy | string | No | day | week | month. Default: day |
| assetClass | string | No | Filter by asset class |

# **17\. Webhook — NowPayments.io IPN**

| SECURITY:  This endpoint must verify the HMAC-SHA512 signature before processing. Reject any request where x-nowpayments-sig header does not match. |
| :---- |

| POST | /webhooks/nowpayments | Receive Instant Payment Notification from NowPayments.io |
| :---: | :---- | :---- |

This endpoint is unauthenticated (public) but signature-protected. NowPayments calls it when a payment status changes.

### **Signature Verification**

| // Node.js verification const crypto \= require('crypto'); function verifyNowPaymentsSignature(rawBody, signature, secret) {   const sorted \= JSON.stringify(sortObjectKeys(JSON.parse(rawBody)));   const hash \= crypto.createHmac('sha512', secret).update(sorted).digest('hex');   return hash \=== signature; } |
| :---- |

### **Payload Fields**

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| payment\_id | string | \- | NowPayments payment ID — idempotency key |
| payment\_status | string | \- | waiting | confirming | confirmed | finished | failed |
| pay\_address | string | \- | Crypto address that received the payment |
| price\_amount | number | \- | Original USD amount requested |
| price\_currency | string | \- | usd |
| pay\_amount | number | \- | Crypto amount expected |
| actually\_paid | number | \- | Crypto amount actually received |
| pay\_currency | string | \- | Coin paid in (e.g. usdttrc20) |
| outcome\_amount | number | \- | USD value of payment after conversion |

### **Processing Logic**

1. Verify HMAC-SHA512 signature. Reject with 400 if invalid.

2. Look up deposit by payment\_id. Return 200 idempotently if already processed.

3. Update deposits.status from the payment\_status field.

4. On payment\_status \=== 'finished': credit account, update transaction, emit WebSocket event, send email.

5. On payment\_status \=== 'failed' or 'expired': mark deposit failed, notify user.

6. Always return HTTP 200 to NowPayments to prevent retry storms.

# **18\. WebSocket Contracts**

The WebSocket gateway uses Socket.io. All events are JSON. Connection requires a valid JWT passed in the auth handshake.

## **18.1 Connection**

| // Client connection (Socket.io) import { io } from "socket.io-client"; const socket \= io('wss://api.protradersim.com', {   auth: { token: accessToken },   transports: \['websocket'\],   reconnection: true,   reconnectionDelay: 1000,   reconnectionAttempts: 10 }); socket.on('connect', () \=\> console.log('Connected:', socket.id)); socket.on('connect\_error', (err) \=\> console.error('WS auth failed:', err.message)); |
| :---- |

## **18.2 Client → Server Events**

| Event | Payload | Description |
| :---- | :---- | :---- |
| subscribe:prices | { symbols: \["EURUSD","XAUUSD"\] } | Subscribe to price ticks for listed symbols |
| unsubscribe:prices | { symbols: \["EURUSD"\] } | Unsubscribe from price ticks |
| ping | {} | Keepalive ping (server responds with pong) |

## **18.3 Server → Client Events**

| Event | Room | Payload Fields | Description |
| :---- | :---- | :---- | :---- |
| price:tick | price:\<symbol\> | symbol, bid, ask, spread, timestamp, stale, blockOrders | Price update every \~2s |
| account:metrics | user:\<id\> | balance, bonusBalance, equity, marginUsed, freeMargin, marginLevel, floatingPnl | Account metrics on every tick with open positions |
| position:update | user:\<id\> | positionId, floatingPnl, currentBid, currentAsk, marginUsed | Per-position floating P\&L update |
| order:filled | user:\<id\> | orderId, type, symbol, fillPrice, lots, slippage, positionId, filledAt | Order execution confirmation |
| order:cancelled | user:\<id\> | orderId, reason, cancelledAt | Order cancelled (system or user) |
| position:closed | user:\<id\> | positionId, closePrice, realizedPnl, closeReason, closedAt | Position closed (TP/SL/manual/liquidation) |
| margin:call | user:\<id\> | marginLevel, threshold, equityNow, message | Margin level breached 80% |
| liquidation:triggered | user:\<id\> | positionId, symbol, closePrice, realizedPnl, balanceAfter | Auto-liquidation fired |
| kyc:status | user:\<id\> | status, rejectionNote, reviewedAt | KYC status changed by IB admin |
| wallet:credited | user:\<id\> | amount, type, newBalance, newBonusBalance | Balance credited (deposit / IB credit / bonus) |
| withdrawal:updated | user:\<id\> | withdrawalId, status, note | Withdrawal request status changed |
| notification:new | user:\<id\> | id, type, title, message, referenceId, createdAt | New in-app notification |
| pong | socket | { ts: timestamp } | Response to client ping |

## **18.4 Full Event Payload Schemas**

### **price:tick**

| {   "symbol":      "EURUSD",   "bid":         1.08432,   "ask":         1.08436,   "spread":      0.00004,   "timestamp":   1710000000000,   "stale":       false,   "blockOrders": false } |
| :---- |

### **account:metrics**

| {   "balance":      5000.00,   "bonusBalance":  500.00,   "equity":       5142.50,   "marginUsed":    540.00,   "freeMargin":   4602.50,   "marginLevel":   952.31,   "floatingPnl":   142.50,   "timestamp":    1710000000000 } |
| :---- |

### **margin:call**

| {   "marginLevel":  72.4,   "threshold":    80,   "equityNow":    362.00,   "marginUsed":   500.00,   "message":      "Warning: Your margin level has dropped below 80%. Add funds or close positions to avoid liquidation." } |
| :---- |

### **liquidation:triggered**

| {   "positionId":  "uuid",   "symbol":      "BTCUSD",   "direction":   "long",   "closePrice":  42100.00,   "lots":        0.01,   "realizedPnl": \-480.00,   "balanceAfter": 20.00,   "timestamp":   1710000000000 } |
| :---- |

# **19\. Rate Limiting**

Rate limits are enforced per IP address via Redis counters. Exceeding a limit returns HTTP 429 with a Retry-After header.

| Endpoint / Group | Limit | Window | Notes |
| :---- | :---- | :---- | :---- |
| POST /auth/login | 10 requests | 1 minute | Brute force protection |
| POST /auth/forgot-password | 5 requests | 60 seconds | OTP flood protection |
| POST /auth/register (step 1\) | 20 requests | 1 hour | Per IP registration attempts |
| POST /orders | 60 requests | 1 minute | Per authenticated user |
| DELETE /positions/:id | 30 requests | 1 minute | Per authenticated user |
| POST /kyc/upload | 10 requests | 1 hour | Per authenticated user |
| All other authenticated | 300 requests | 1 minute | General API rate limit |
| POST /webhooks/nowpayments | 100 requests | 1 minute | NowPayments IPN — no user context |

| // Rate limit response headers X-RateLimit-Limit: 60 X-RateLimit-Remaining: 42 X-RateLimit-Reset: 1710000060 Retry-After: 23   // seconds until reset (only on 429\) |
| :---- |

# **20\. Endpoint Quick Reference**

| Method | Endpoint | Auth | Description |
| :---- | :---- | :---- | :---- |
| POST | /auth/register | Public | Multi-step registration wizard |
| POST | /auth/verify-email | Public | Email verification |
| POST | /auth/login | Public | Login — returns JWT |
| POST | /auth/refresh | Cookie | Refresh access token |
| POST | /auth/logout | Token | Revoke refresh token |
| POST | /auth/forgot-password | Public | Send reset email |
| POST | /auth/reset-password | Public | Set new password |
| GET | /users/me | Token | Get own profile |
| PUT | /users/me | Token | Update profile |
| PUT | /users/me/password | Token | Change password |
| POST | /users/me/2fa/setup | Token | Setup TOTP 2FA |
| POST | /users/me/2fa/confirm | Token | Confirm 2FA setup |
| DELETE | /users/me/2fa | Token | Disable 2FA |
| GET | /kyc/status | Token | Get KYC status |
| POST | /kyc/upload | Token | Upload KYC documents |
| POST | /kyc/resubmit | Token | Re-upload after rejection |
| GET | /instruments | Public | List all instruments |
| GET | /instruments/:symbol/price | Token | Latest price snapshot |
| POST | /orders | Token | Place order (all types) |
| GET | /orders | Token | List orders |
| PUT | /orders/:orderId | Token | Modify pending order |
| DELETE | /orders/:orderId | Token | Cancel pending order |
| GET | /positions | Token | List open positions |
| DELETE | /positions/:positionId | Token | Close position |
| PATCH | /positions/:positionId | Token | Modify TP/SL |
| GET | /account/metrics | Token | Account financial metrics |
| GET | /wallet | Token | Wallet summary |
| POST | /wallet/deposit | Token | Initiate deposit |
| POST | /wallet/withdraw | Token | Submit withdrawal |
| GET | /wallet/transactions | Token | Transaction history |
| GET | /portfolio/history | Token | Closed trade history |
| GET | /portfolio/summary | Token | Performance summary |
| GET | /notifications | Token | List notifications |
| PUT | /notifications/read | Token | Mark as read |
| GET | /admin/users | Admin | List users / leads |
| GET | /admin/users/:userId | Admin | User detail view |
| PATCH | /admin/users/:userId/lock | Admin | Lock / unlock account |
| GET | /admin/kyc | Agent|TL | KYC review queue (role-filtered) |
| GET | /admin/kyc/:submissionId/documents | Agent|TL | Get signed document URLs (60s expiry, access logged) |
| POST | /admin/kyc/:submissionId/recommend | Agent | Step 1: Agent recommendation |
| POST | /admin/kyc/:submissionId/decide | TL | Step 2: Team Leader final decision |
| POST | /admin/kyc/reverify/:userId | TL|SA | Trigger re-verification |
| POST | /admin/balance/credit | Admin | Credit real balance |
| POST | /admin/balance/debit | Admin | Debit real balance |
| POST | /admin/bonus/grant | Admin | Grant tradable bonus |
| DELETE | /admin/bonus/:bonusId | Admin | Revoke bonus |
| GET | /admin/withdrawals | Admin | Pending withdrawal list |
| POST | /admin/withdrawals/:id/approve | Admin | Approve withdrawal |
| POST | /admin/withdrawals/:id/reject | Admin | Reject withdrawal |
| GET | /admin/reports/dashboard | Admin | Dashboard KPI summary |
| GET | /admin/reports/users/export | Admin | Export user list CSV |
| GET | /admin/reports/volume | Admin | Trading volume report |
| POST | /webhooks/nowpayments | HMAC | NowPayments IPN |

*— End of API Design Document —*