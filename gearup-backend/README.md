# GearUp Backend

## Submission

| Item | Value |
|------|-------|
| Backend Repo | `https://github.com/your-username/gearup-backend` |
| Live API | `https://your-api.onrender.com` |
| API Docs | `docs/postman-collection.json` |
| Demo Video | `https://your-video-link` |
| Admin Email | `admin@gearup.com` |
| Admin Password | `Admin@12345` |

## Tech Stack

- Node.js + Express (TypeScript)
- PostgreSQL + Prisma
- JWT
- Stripe
- Zod

## Setup

```bash
npm install
cp .env.example .env
# edit .env with DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
npx prisma db push
npm run seed
npm run dev
```

Server: `http://localhost:5000`

## Deploy to Vercel

1. Push to GitHub.
2. Vercel → **New Project** → import repo.
3. Set **Root Directory** to `gearup-backend`.
4. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
5. After first deploy, run the seed once via Vercel CLI:
   ```
   vercel env pull .env.vercel
   npx prisma db push
   npm run seed
   ```
6. Live URL: `https://your-app.vercel.app`

> Use a hosted Postgres (Neon, Supabase, Render Postgres, Vercel Postgres).

## Admin Credentials

```
Email:    admin@gearup.com
Password: Admin@12345
```

## Sample Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gearup.com` | `Admin@12345` |
| Provider | `provider@gearup.com` | `Provider@123` |
| Customer | `customer@gearup.com` | `Customer@123` |

## API Endpoints

### Auth
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | public | Register |
| POST | `/api/auth/login` | public | Login |
| GET | `/api/auth/me` | any | Current user |

### Categories
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | public | List |
| POST | `/api/categories` | admin | Create |
| PUT | `/api/categories/:id` | admin | Update |
| DELETE | `/api/categories/:id` | admin | Delete |

### Gear (Public)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/gear` | public | List with filters |
| GET | `/api/gear/:id` | public | Details |

### Provider
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/provider/gear` | provider | My inventory |
| POST | `/api/provider/gear` | provider | Add gear |
| PUT | `/api/provider/gear/:id` | provider | Update gear |
| DELETE | `/api/provider/gear/:id` | provider | Remove gear |
| GET | `/api/rentals/provider/orders` | provider | Incoming orders |

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
| POST | `/api/payments/create` | customer | Create checkout session |
| GET | `/api/payments/confirm` | public | Confirm by `session_id` |
| POST | `/api/payments/webhook/stripe` | stripe | Webhook |
| GET | `/api/payments` | customer | My payment history |
| GET | `/api/payments/:id` | customer/admin | Payment detail |

### Reviews
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | customer | Create review |
| GET | `/api/reviews/gear/:gearItemId` | public | List reviews |

### Admin
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | admin | Stats |
| GET | `/api/admin/users` | admin | List users |
| PATCH | `/api/admin/users/:id` | admin | Update status |
| GET | `/api/admin/gear` | admin | All gear |
| GET | `/api/admin/rentals` | admin | All rentals |

## Response Format

Success:
```json
{ "success": true, "message": "Success", "data": {} }
```

Error:
```json
{ "success": false, "message": "Error", "errorDetails": [] }
```

## Payment Flow

1. `POST /api/rentals` → order `PLACED`
2. `POST /api/payments/create` → returns `checkoutUrl`
3. Open `checkoutUrl`, pay with test card `4242 4242 4242 4242`
4. Stripe redirects to success URL → payment `COMPLETED`, order `PAID`

## License

MIT
