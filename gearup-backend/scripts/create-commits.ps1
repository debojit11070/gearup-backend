$ErrorActionPreference = "Stop"
Set-Location "G:\programming hero assignments\B7A4"

# 1
git add "gearup-backend/package.json" "gearup-backend/package-lock.json" "gearup-backend/tsconfig.json" "gearup-backend/.gitignore" "gearup-backend/.env.example"
git commit -m "chore: initialize GearUp backend with TypeScript, Express, Prisma, JWT, Stripe, Zod" | Out-Null
Write-Host "1"

# 2
git add "gearup-backend/prisma/schema.prisma"
git commit -m "feat(db): add Prisma schema for Users, Categories, GearItems, RentalOrders, Payments, Reviews" | Out-Null
Write-Host "2"

# 3
git add "gearup-backend/prisma/seed.ts"
git commit -m "feat(db): add seed script for admin, sample provider/customer, categories and gear" | Out-Null
Write-Host "3"

# 4
git add "gearup-backend/src/config/"
git commit -m "feat(core): add config module, env loader, and Prisma client singleton" | Out-Null
Write-Host "4"

# 5
git add "gearup-backend/src/utils/ApiError.ts" "gearup-backend/src/utils/sendResponse.ts"
git commit -m "feat(core): add ApiError helpers and standardized sendResponse utility" | Out-Null
Write-Host "5"

# 6
git add "gearup-backend/src/utils/jwt.ts" "gearup-backend/src/middlewares/auth.ts" "gearup-backend/src/middlewares/validate.ts"
git commit -m "feat(core): add JWT utilities, auth middleware and Zod request validation" | Out-Null
Write-Host "6"

# 7
git add "gearup-backend/src/middlewares/error.ts"
git commit -m "feat(core): add global error handler with structured {success,message,errorDetails} responses" | Out-Null
Write-Host "7"

# 8
git add "gearup-backend/src/modules/auth/"
git commit -m "feat(auth): implement register, login and /me endpoints with bcrypt hashing" | Out-Null
Write-Host "8"

# 9
git add "gearup-backend/src/modules/categories/"
git commit -m "feat(categories): add CRUD endpoints with admin-only write access" | Out-Null
Write-Host "9"

# 10
git add "gearup-backend/src/modules/gear/"
git commit -m "feat(gear): implement public gear listing with filters and detail endpoint with reviews" | Out-Null
Write-Host "10"

# 11
git add "gearup-backend/src/modules/provider/"
git commit -m "feat(provider): add gear inventory CRUD endpoints scoped to logged-in provider" | Out-Null
Write-Host "11"

# 12
git add "gearup-backend/src/modules/rentals/rentals.validation.ts"
git commit -m "feat(rentals): add Zod schemas for rental order creation and status updates" | Out-Null
Write-Host "12"

# 13
git add "gearup-backend/src/modules/rentals/rentals.controller.ts" "gearup-backend/src/modules/rentals/rentals.routes.ts"
git commit -m "feat(rentals): implement rental order creation with stock/price calc and status workflow" | Out-Null
Write-Host "13"

# 14
git add "gearup-backend/src/modules/reviews/"
git commit -m "feat(reviews): add review creation restricted to returned rentals and public review listing" | Out-Null
Write-Host "14"

# 15
git add "gearup-backend/src/modules/payments/stripe.ts" "gearup-backend/src/modules/payments/payments.validation.ts"
git commit -m "feat(payments): add Stripe SDK init and Zod validation for payment requests" | Out-Null
Write-Host "15"

# 16
git add "gearup-backend/src/modules/payments/payments.controller.ts" "gearup-backend/src/modules/payments/payments.routes.ts"
git commit -m "feat(payments): implement Stripe Checkout session creation, confirm, webhook and history" | Out-Null
Write-Host "16"

# 17
git add "gearup-backend/src/modules/admin/"
git commit -m "feat(admin): add admin endpoints for users, gear, rentals, categories and platform stats" | Out-Null
Write-Host "17"

# 18
git add "gearup-backend/src/app.ts" "gearup-backend/src/server.ts"
git commit -m "feat(app): wire up Express app, register routers, health check, and graceful shutdown" | Out-Null
Write-Host "18"

# 19
git add "gearup-backend/docs/"
git commit -m "docs(api): add Postman collection covering every endpoint" | Out-Null
Write-Host "19"

# 20
git add "gearup-backend/README.md"
git commit -m "docs: add comprehensive README with setup, admin credentials, payment flow and endpoints" | Out-Null
Write-Host "20"

# Verify
Write-Host ""
Write-Host "Total commits in repo:"
git log --oneline | Measure-Object | Select-Object -ExpandProperty Count
Write-Host ""
git log --oneline -25
