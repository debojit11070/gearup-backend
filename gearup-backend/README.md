# GearUp Backend 🏋️

> **"Rent Sports & Outdoor Gear Instantly"** — a REST API backend for a sports & outdoor equipment rental platform.

## Tech Stack

- **Node.js + Express** (TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **JWT** authentication with role-based access
- **Stripe** payment integration (Checkout Sessions)
- **Zod** input validation
- **bcryptjs** password hashing

## Features

- 3 roles: **Customer**, **Provider**, **Admin**
- Browse, search and filter sports gear
- Place rental orders with date ranges
- Pay online with **Stripe** (real Stripe Checkout session — no fake payments)
- Provider inventory management
- Order status workflow: `PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED` (or `CANCELLED`)
- Customer reviews (only after `RETURNED`)
- Admin dashboard endpoints (users, gear, rentals, categories, stats)
- Structured `{ success, message, data | errorDetails }` JSON responses
- Centralized error handling & input validation
- Stripe webhook support

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gearup?schema=public"
JWT_SECRET="some-long-random-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
> Get a Stripe test key at https://dashboard.stripe.com/test/apikeys

### 3. Set up the database
```bash
npx prisma migrate dev --name init
# or for a quick start:
npx prisma db push
```

### 4. Seed the database (creates admin + sample data)
```bash
npm run seed
```

### 5. Run the server
```bash
npm run dev     # development with auto-reload
# or
npm run build && npm start
```

Server runs on `http://localhost:5000`.

## 🔐 Default Admin Credentials

```
Email:    admin@gearup.com
Password: Admin@12345
```

> Change these via the `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars before running `npm run seed` in production.

## Sample Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gearup.com` | `Admin@12345` |
| Provider | `provider@gearup.com` | `Provider@123` |
| Customer | `customer@gearup.com` | `Customer@123` |

## API Endpoints

See [`docs/postman-collection.json`](./docs/postman-collection.json) for a full Postman collection you can import.

### Auth
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | public | Register (CUSTOMER or PROVIDER) |
| POST | `/api/auth/login` | public | Login, returns JWT |
| GET | `/api/auth/me` | any | Current user |

### Categories
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | public | List categories |
| POST | `/api/categories` | admin | Create |
| PUT | `/api/categories/:id` | admin | Update |
| DELETE | `/api/categories/:id` | admin | Delete |

### Gear (Public)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/gear` | public | List with filters `category, brand, minPrice, maxPrice, available, search, page, limit, sortBy, sortOrder` |
| GET | `/api/gear/:id` | public | Details + reviews |

### Provider
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/provider/gear` | provider | My inventory |
| POST | `/api/provider/gear` | provider | Add gear |
| PUT | `/api/provider/gear/:id` | provider | Update gear |
| DELETE | `/api/provider/gear/:id` | provider | Remove gear |
| GET | `/api/provider/orders` | provider | Incoming orders |
| PATCH | `/api/rentals/:id` | provider/customer | Update order status |

### Rentals
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/rentals` | customer | Create order |
| GET | `/api/rentals` | customer | My orders |
| GET | `/api/rentals/:id` | customer/provider/admin | Order detail |
| PATCH | `/api/rentals/:id` | customer/provider | Update status |

### Payments (Stripe)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create` | customer | Create Stripe checkout session for a rental |
| POST | `/api/payments/confirm` | public | Confirm via `session_id` (webhook / browser redirect) |
| POST | `/api/payments/webhook/stripe` | stripe | Webhook (raw body) |
| GET | `/api/payments` | customer | My payment history |
| GET | `/api/payments/:id` | customer/admin | Payment detail |

### Reviews
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | customer | Create review (only after `RETURNED` rental) |
| GET | `/api/reviews/gear/:gearItemId` | public | List reviews for a gear item |

### Admin
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | admin | Platform stats |
| GET | `/api/admin/users` | admin | List users |
| PATCH | `/api/admin/users/:id` | admin | Suspend / activate |
| GET | `/api/admin/gear` | admin | All listings |
| GET | `/api/admin/rentals` | admin | All rentals |

## Response Format

All responses are JSON in this shape:
```json
{ "success": true, "message": "Success", "data": {} }
```

Errors:
```json
{ "success": false, "message": "Validation failed", "errorDetails": [...] }
```

## Payment Flow (Stripe)

1. Customer creates rental order → `POST /api/rentals` → status `PLACED`
2. Customer calls `POST /api/payments/create` with the `rentalOrderId`
3. Server returns `{ checkoutUrl, sessionId }`
4. Customer opens `checkoutUrl`, pays with test card `4242 4242 4242 4242`
5. Stripe redirects to `success_url?session_id=...` → server marks payment `COMPLETED`, order `PAID`
6. Alternatively the Stripe webhook at `POST /api/payments/webhook/stripe` finalises the payment

## License
MIT
