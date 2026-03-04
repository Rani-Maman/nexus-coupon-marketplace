# Digital Coupon Marketplace

A full-stack backend system for a digital coupon marketplace supporting three selling channels: direct customers (frontend), external resellers (REST API), and admin management (CRUD).

## Architecture

```
┌──────────────┐     ┌──────────────────────────────────────────────┐
│   React UI   │────▶│              Express API Server              │
│  (Customer   │     │                                              │
│   + Admin)   │     │  ┌─────────┐  ┌─────────┐  ┌────────────┐  │
└──────────────┘     │  │ Routes  │─▶│ Service │─▶│ Repository │  │
                     │  └─────────┘  └─────────┘  └────────────┘  │
┌──────────────┐     │       │                          │          │
│   Reseller   │────▶│  Middleware                  Prisma ORM     │
│  (REST API)  │     │  (Auth, Validation,              │          │
└──────────────┘     │   Rate Limit, Logging)           ▼          │
                     │                          ┌──────────────┐   │
                     │                          │  PostgreSQL   │   │
                     │                          └──────────────┘   │
                     └──────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js 20 + TypeScript | Type safety, matches role stack |
| Framework | Express 4 | Widely understood, great middleware ecosystem |
| Database | PostgreSQL | ACID transactions for atomic purchases, DECIMAL for money |
| ORM | Prisma 5 | Type-safe queries, declarative migrations |
| Validation | Zod | TypeScript-first schemas, runtime validation |
| Security | Helmet + express-rate-limit | Security headers, abuse prevention |
| Frontend | React 18 + Vite | Fast DX, minimal config |
| Testing | Jest + Supertest | 26 tests covering all API channels |
| Docker | docker-compose | One-command startup for all services |

## Quick Start

### With Docker

```bash
git clone https://github.com/Rani-Maman/nexus-coupon-marketplace.git && cd nexus-coupon-marketplace
cp .env.example .env
docker-compose up --build
```

The database is automatically migrated and seeded on startup.

### Without Docker

```bash
# 1. Start PostgreSQL and create a database
# 2. Configure server/.env with your DATABASE_URL, RESELLER_API_TOKEN, ADMIN_API_TOKEN
# 3. Install, migrate, seed, and start the server:
cd server && npm install && npx prisma migrate deploy && npx prisma db seed && npm run dev
# 4. In another terminal, install and start the client:
cd client && npm install && npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **Health check:** http://localhost:3000/health

## Testing

```bash
cd server
npm test
```

Runs 26 automated tests covering:
- **Unit tests** — pricing formula with edge cases (0%, decimals, large margins)
- **Integration tests** — all API endpoints (reseller, customer, admin)
- **Security tests** — auth rejection, pricing fields not leaked in public responses
- **E2E purchase flow** — buy, verify coupon value returned, double-purchase rejection

## API Documentation

### Reseller API (Bearer auth required)

All endpoints require: `Authorization: Bearer <RESELLER_API_TOKEN>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List available (unsold) products |
| GET | `/api/v1/products/:id` | Get product by ID |
| POST | `/api/v1/products/:id/purchase` | Purchase a product |

**Purchase request:**
```json
{ "reseller_price": 120.00 }
```

**Purchase response (coupon value only revealed here):**
```json
{
  "product_id": "uuid",
  "final_price": 120.00,
  "value_type": "STRING",
  "value": "ABCD-1234"
}
```

### Admin API (Bearer auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/products` | Create product |
| GET | `/api/v1/admin/products` | List all products (incl. sold) |
| GET | `/api/v1/admin/products/:id` | Get full product details |
| PUT | `/api/v1/admin/products/:id` | Update product |
| DELETE | `/api/v1/admin/products/:id` | Delete product |

### Customer API (public, no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customer/products` | List available products |
| GET | `/api/v1/customer/products/:id` | Get product |
| POST | `/api/v1/customer/products/:id/purchase` | Purchase at listed price |

### Error Format

All errors follow a consistent format:
```json
{ "error_code": "ERROR_NAME", "message": "Human readable message" }
```

| Code | Status | Trigger |
|------|--------|---------|
| PRODUCT_NOT_FOUND | 404 | Product ID doesn't exist |
| PRODUCT_ALREADY_SOLD | 409 | Attempting to buy a sold coupon |
| RESELLER_PRICE_TOO_LOW | 400 | Reseller price < minimum_sell_price |
| UNAUTHORIZED | 401 | Missing or invalid Bearer token |
| VALIDATION_ERROR | 400 | Invalid input (bad UUID, missing fields) |
| RATE_LIMIT_EXCEEDED | 429 | Too many purchase requests |

## Design Decisions

### Why `SELECT ... FOR UPDATE` for purchases?
Two concurrent requests for the same coupon must not both succeed. The `atomicPurchase` method acquires a row-level exclusive lock inside a PostgreSQL transaction, guaranteeing that only one purchase can succeed per coupon — even under high concurrency. This is simpler and more correct than optimistic locking for a low-contention operation like coupon purchases.

### Why derive `minimum_sell_price` instead of storing it?
Storing computed values creates a risk of data inconsistency — if an admin updates `cost_price` but forgets `minimum_sell_price`, the data becomes stale. By always computing it as `cost_price * (1 + margin / 100)`, the price is guaranteed to be correct. The computation is cheap (single multiplication) so there's no performance trade-off.

### Why three separate DTO mappers?
Different API consumers need different views of the same data. The `toPublicProductDto` hides cost/margin from resellers and customers. The `toPurchaseResponseDto` reveals the coupon value only after payment. The `toAdminProductDto` shows everything. This pattern prevents accidental data leakage at the code level — you can't accidentally return a field that the mapper doesn't include.

### Why rate limiting on purchase endpoints?
Purchase endpoints modify state (mark products as sold). Without rate limiting, a malicious actor could spam purchase attempts. The rate limiter (50 requests per 15 minutes) prevents abuse while allowing legitimate use.

## Security Measures

- **Helmet.js** — sets security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **CORS restriction** — only configured origins can access the API
- **Rate limiting** — purchase endpoints are rate-limited to prevent abuse
- **Body size limit** — JSON payloads capped at 10KB to prevent DoS
- **UUID validation** — route params validated before reaching the database
- **Bearer token auth** — tokens loaded from environment variables, never hardcoded
- **DTO pattern** — sensitive fields (cost_price, margin, coupon value) never exposed in public responses

## Project Structure

```
server/src/
├── __tests__/           # Jest test suites (API + unit tests)
├── config/              # Environment configuration
├── errors/              # Custom AppError class
├── middleware/
│   ├── auth             # Bearer token verification
│   ├── error-handler    # Global error handler
│   ├── logger           # Request logging (method, path, status, duration)
│   └── validate         # Zod body + param validation
├── modules/product/
│   ├── controller       # Request handlers
│   ├── service          # Business logic
│   ├── repository       # Data access + atomic purchase
│   ├── dto              # Response mappers (public/purchase/admin)
│   └── schema           # Zod validation schemas
├── routes/              # Admin, reseller, customer route definitions
└── utils/               # Pricing calculation
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | — | PostgreSQL connection string |
| RESELLER_API_TOKEN | — | Bearer token for reseller API |
| ADMIN_API_TOKEN | — | Bearer token for admin API |
| ALLOWED_ORIGINS | http://localhost:5173 | Comma-separated CORS origins |
| PORT | 3000 | Server port |
