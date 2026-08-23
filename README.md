# Car Dealership Inventory

A full-stack vehicle inventory management system built with **Express + Prisma** on the backend and **React + Vite** on the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [AI Usage](#ai-usage)
- [Trade-offs](#trade-offs)
- [Future Improvements](#future-improvements)

---

## Overview

Car Dealership Inventory is a web application that lets a dealership manage its vehicle stock. Authenticated users can browse and purchase vehicles. Administrators can add, edit, delete, and restock vehicles.

**User roles:**
- `USER` — browse inventory, search/filter vehicles, purchase vehicles
- `ADMIN` — all USER capabilities plus create, update, delete, and restock vehicles

---

## Features

- **Authentication** — register, login, JWT-based sessions (24-hour expiry)
- **Vehicle inventory** — paginated list of all vehicles with make, model, category, price, and stock count
- **Search & filter** — filter by make, model, category, min price, and max price (case-insensitive, combinable)
- **Vehicle purchasing** — atomic stock decrement; prevents overselling under concurrent requests
- **Admin vehicle management** — create, update, and delete vehicles via an admin-only UI
- **Restocking** — admins can add stock to any vehicle
- **Authorization** — role-based access control enforced on both backend routes and frontend navigation
- **Responsive UI** — Tailwind CSS layout that works on mobile, tablet, and desktop

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| TypeScript | ^5.4 | Type safety |
| Express | ^4.19 | HTTP server and routing |
| Prisma | ^5.14 | ORM and database migrations |
| Zod | ^3.23 | Request validation and schema inference |
| jsonwebtoken | ^9.0 | JWT signing and verification |
| bcrypt | ^5.1 | Password hashing (12 salt rounds) |
| helmet | ^7.1 | Secure HTTP headers |
| cors | ^2.8 | Cross-origin request policy |
| dotenv | ^16.4 | Environment variable loading |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^18.3 | UI library |
| TypeScript | ^5.4 | Type safety |
| Vite | ^5.3 | Build tool and dev server |
| React Router DOM | ^6.24 | Client-side routing |
| Tailwind CSS | ^3.4 | Utility-first styling |

### Database
- **PostgreSQL 14+** — primary data store
- **Prisma** — schema management, migrations, and query client

### Testing
- **Jest** + **ts-jest** — test runner
- **Supertest** — HTTP integration testing against the live Express app

### Infrastructure
- **Docker Compose** — optional PostgreSQL container for local development

---

## Architecture

### Frontend

```
src/
├── pages/          # Route-level components (LoginPage, RegisterPage, DashboardPage, AdminPage)
├── components/     # Reusable UI components (Navbar, VehicleCard, SearchFilters, ConfirmDialog, Toast, …)
├── context/        # AuthContext — global auth state (user, token, isAdmin)
├── services/       # API clients (authApi, vehicleApi, apiClient)
├── types/          # Shared TypeScript interfaces
└── App.tsx         # Route definitions and ProtectedRoute / AdminRoute guards
```

The frontend is a single-page application. React Router handles client-side navigation. `AuthContext` stores the JWT and user object in `localStorage` and exposes them via a React context. `ProtectedRoute` redirects unauthenticated users to `/login`; `AdminRoute` additionally redirects non-admins to `/dashboard`.

All API calls go through `apiClient`, which attaches the `Authorization: Bearer <token>` header automatically and throws a typed `ApiRequestError` on non-2xx responses.

### Backend

```
src/
├── routes/         # Express routers (authRoutes, vehicleRoutes)
├── controllers/    # Thin HTTP layer — parse request, call service, send response
├── services/       # Business logic (authService, vehicleService)
├── repositories/   # Database access via Prisma (userRepository, vehicleRepository)
├── middleware/     # authenticateUser, requireAdmin, validateRequest, errorHandler
├── schemas/        # Zod schemas for request validation and type inference
├── utils/          # AppError, jwtUtils, passwordUtils
└── config/         # Singleton PrismaClient instance
```

The backend follows a layered architecture:

```
Request → Route → Middleware (auth, validation) → Controller → Service → Repository → PostgreSQL
```

- **Controllers** are thin: they call a service method and send the result as JSON.
- **Services** contain all business logic (e.g. duplicate email check, out-of-stock check).
- **Repositories** contain all Prisma queries. No SQL or Prisma calls appear outside repositories.
- **Middleware** handles cross-cutting concerns: JWT verification, admin role check, Zod validation, and centralized error handling.

### Frontend ↔ Backend communication

The frontend calls `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL`). The backend enforces CORS to only accept requests from `FRONTEND_URL` (default `http://localhost:5173`). Every request to `/api/vehicles/*` requires a valid JWT in the `Authorization` header.

---

## Database Design

### Models

#### `User`
| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT` (cuid) | Primary key |
| `name` | `TEXT` | Required |
| `email` | `TEXT` | Required, unique index |
| `passwordHash` | `TEXT` | bcrypt hash, never returned to clients |
| `role` | `Role` enum | `USER` (default) or `ADMIN` |
| `createdAt` | `TIMESTAMP` | Auto-set on insert |
| `updatedAt` | `TIMESTAMP` | Auto-updated on change |

#### `Vehicle`
| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT` (cuid) | Primary key |
| `make` | `TEXT` | Required |
| `model` | `TEXT` | Required |
| `category` | `TEXT` | Required |
| `price` | `DECIMAL(10,2)` | Avoids floating-point precision errors |
| `quantity` | `INTEGER` | Default 0 |
| `createdAt` | `TIMESTAMP` | Auto-set on insert |
| `updatedAt` | `TIMESTAMP` | Auto-updated on change |

### Constraints

- `User.email` — unique index (`User_email_key`), enforced at the database level
- `Vehicle.quantity >= 0` — PostgreSQL `CHECK` constraint (`vehicle_quantity_non_negative`) added directly in the migration SQL. This is enforced at the database level independently of application code, so even a direct database write or a future bug in the service layer cannot produce negative stock.

### Atomic stock operations

The purchase and restock operations use raw SQL (`$executeRaw`) rather than a Prisma `update`:

```sql
-- Purchase: only decrements if quantity > 0
UPDATE "Vehicle" SET quantity = quantity - 1, "updatedAt" = NOW()
WHERE id = $id AND quantity > 0

-- Restock: increments by the given amount
UPDATE "Vehicle" SET quantity = quantity + $amount, "updatedAt" = NOW()
WHERE id = $id
```

The purchase query returns the number of rows affected. If `0` rows are updated, the service throws a `409 Conflict` (out of stock). This prevents race conditions under concurrent purchase requests.

---

## API Documentation

Base URL: `http://localhost:3000/api`

All responses follow the envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "...", "errors": [...] }
```

### Health

#### `GET /health`
No authentication required.

**Response 200:**
```json
{ "success": true, "message": "Server is running" }
```

---

### Auth

#### `POST /api/auth/register`
Register a new user account. New accounts are always created with role `USER`.

**Auth required:** No

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "minimum8chars"
}
```

| Field | Validation |
|---|---|
| `name` | Required, max 100 chars |
| `email` | Valid email format |
| `password` | Min 8 characters |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Errors:**
- `400` — validation failed (field-level errors in `errors` array)
- `409` — email already registered

---

#### `POST /api/auth/login`
Authenticate and receive a JWT.

**Auth required:** No

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "yourpassword"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Errors:**
- `400` — validation failed
- `401` — invalid email or password (same message for both to prevent user enumeration)

---

### Vehicles

All vehicle endpoints require a valid JWT: `Authorization: Bearer <token>`

#### `GET /api/vehicles`
Return all vehicles ordered by `createdAt` descending.

**Auth required:** Yes (any role)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "vehicles": [ { "id": "...", "make": "Toyota", "model": "Camry", ... } ]
  }
}
```

---

#### `GET /api/vehicles/search`
Search/filter vehicles. All query parameters are optional and combinable.

**Auth required:** Yes (any role)

**Query parameters:**
| Parameter | Type | Description |
|---|---|---|
| `make` | string | Case-insensitive partial match |
| `model` | string | Case-insensitive partial match |
| `category` | string | Case-insensitive partial match |
| `minPrice` | number | Minimum price (inclusive) |
| `maxPrice` | number | Maximum price (inclusive) |

**Response 200:**
```json
{
  "success": true,
  "data": { "vehicles": [ ... ] }
}
```

**Errors:**
- `400` — invalid query parameter types

---

#### `POST /api/vehicles`
Create a new vehicle.

**Auth required:** Yes (any authenticated user — the route applies `authenticateUser` but not `requireAdmin` for create)

**Request body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "category": "Sedan",
  "price": 26000,
  "quantity": 8
}
```

| Field | Validation |
|---|---|
| `make` | Required string |
| `model` | Required string |
| `category` | Required string |
| `price` | Positive number |
| `quantity` | Non-negative integer, default 0 |

**Response 201:**
```json
{
  "success": true,
  "data": { "vehicle": { "id": "...", ... } }
}
```

**Errors:**
- `400` — validation failed
- `401` — not authenticated

---

#### `PUT /api/vehicles/:id`
Update an existing vehicle. All fields are optional (partial update).

**Auth required:** Yes (any authenticated user)

**Request body** (all fields optional):
```json
{
  "make": "Toyota",
  "model": "Camry",
  "category": "Sedan",
  "price": 27000,
  "quantity": 10
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "vehicle": { "id": "...", ... } }
}
```

**Errors:**
- `400` — validation failed
- `401` — not authenticated
- `404` — vehicle not found

---

#### `DELETE /api/vehicles/:id`
Delete a vehicle.

**Auth required:** Yes — **ADMIN only**

**Response:** `204 No Content`

**Errors:**
- `401` — not authenticated
- `403` — not an admin
- `404` — vehicle not found

---

#### `POST /api/vehicles/:id/purchase`
Purchase one unit of a vehicle (decrements quantity by 1).

**Auth required:** Yes (any role)

**Request body:** None

**Response 200:**
```json
{
  "success": true,
  "data": { "vehicle": { "id": "...", "quantity": 7, ... } }
}
```

**Errors:**
- `401` — not authenticated
- `404` — vehicle not found
- `409` — vehicle is out of stock

---

#### `POST /api/vehicles/:id/restock`
Add stock to a vehicle.

**Auth required:** Yes — **ADMIN only**

**Request body:**
```json
{ "quantity": 10 }
```

| Field | Validation |
|---|---|
| `quantity` | Positive integer |

**Response 200:**
```json
{
  "success": true,
  "data": { "vehicle": { "id": "...", "quantity": 18, ... } }
}
```

**Errors:**
- `400` — validation failed
- `401` — not authenticated
- `403` — not an admin
- `404` — vehicle not found

---

## Authentication & Authorization

### Registration & Login

1. `POST /api/auth/register` creates a user with a bcrypt-hashed password (12 salt rounds). The `passwordHash` field is never returned to clients.
2. `POST /api/auth/login` verifies the password with `bcrypt.compare`. On success it returns a signed JWT containing `{ userId, role }` with a 24-hour expiry.

### JWT handling

- The backend signs tokens with `JWT_SECRET` using `jsonwebtoken`.
- The frontend stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every API request via `apiClient`.
- The `authenticateUser` middleware verifies the token on every protected route. An invalid or expired token returns `401`.

### Role-based access control

- `authenticateUser` — applied to all `/api/vehicles/*` routes. Rejects requests without a valid JWT.
- `requireAdmin` — applied to `DELETE /api/vehicles/:id` and `POST /api/vehicles/:id/restock`. Returns `403` if the authenticated user's role is not `ADMIN`.

### Frontend guards

- `ProtectedRoute` — redirects unauthenticated users to `/login`.
- `AdminRoute` — redirects non-admin users to `/dashboard`.

### Security boundary

The backend is the authoritative security boundary. Frontend route guards are a UX convenience only — all authorization is re-enforced on every API request by the backend middleware.

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or use Docker — see [Docker Setup](#docker-setup))
- Git

### 1. Clone the repository

```bash
git clone https://github.com/IndukuriKanthi/car-dealership-inventory.git
cd car-dealership-inventory
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — fill in DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL
npm install
```

### 3. PostgreSQL (local)

Create the database in psql:

```sql
CREATE DATABASE car_dealership;
```

Set `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/car_dealership"
```

### 4. Run Prisma migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Seed sample data (optional)

```bash
npm run db:seed
```

This creates two development accounts and 10 sample vehicles:

| Email | Password | Role |
|---|---|---|
| `admin@dealership.dev` | `Admin@1234` | ADMIN |
| `user@dealership.dev` | `User@1234` | USER |

> These credentials are for local development only. Do not use them in production.

### 6. Start the backend

```bash
npm run dev
# Server runs on http://localhost:3000
```

### 7. Frontend setup

```bash
cd ../frontend
cp .env.example .env
# Edit .env if the backend runs on a different port
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Docker Setup

Docker Compose provides a PostgreSQL container so you do not need a local PostgreSQL installation.

### Requirements

- Docker Desktop or Docker Engine with the Compose plugin

### Environment variables for Docker

In `backend/.env`, set:

```
POSTGRES_PASSWORD=<choose_a_strong_password>
DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/car_dealership"
```

The container reads `POSTGRES_PASSWORD` from the shell environment or from a `.env` file in the project root. The simplest approach is to export it before running Compose:

```bash
export POSTGRES_PASSWORD=<your_password>
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Stop PostgreSQL

```bash
docker compose down
# To also delete the data volume:
docker compose down -v
```

### Container defaults

| Variable | Default |
|---|---|
| `POSTGRES_DB` | `car_dealership` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | *(required — no default)* |
| `POSTGRES_PORT` | `5432` |

### After starting the container

Run migrations and (optionally) seed data exactly as in the local setup:

```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed   # optional
npm run dev
```

### Data persistence

The container uses a named Docker volume (`postgres_data`). Data survives `docker compose down`. Use `docker compose down -v` to remove the volume and start fresh.

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:<pw>@localhost:5432/car_dealership` |
| `JWT_SECRET` | Secret for signing JWTs — minimum 32 characters | *(generate a random string)* |
| `PORT` | HTTP port for the backend server | `3000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |

> Never commit `.env` files. Both are listed in `.gitignore`. Use the `.env.example` files as templates.

---

## Testing

### Run backend tests

```bash
cd backend
npm test
```

### Current test suite

- **52 tests** across 6 integration test files
- All tests run against a real PostgreSQL database (the same one configured in `backend/.env`)
- Tests run sequentially (`--runInBand`) to avoid transaction conflicts

| File | Coverage |
|---|---|
| `auth.test.ts` | Register, login, validation, duplicate email |
| `middleware.test.ts` | JWT authentication, admin authorization |
| `vehicles.test.ts` | Create, list, update vehicle endpoints |
| `delete.test.ts` | Delete vehicle, admin-only enforcement |
| `search.test.ts` | Search/filter by make, model, category, price range |
| `inventory.test.ts` | Purchase (atomic decrement, out-of-stock), restock |

### TDD approach

Each feature was developed test-first: tests were written and committed before the implementation, then the implementation was written to make the tests pass.

### Frontend build check

```bash
cd frontend
npm run build   # TypeScript compilation + Vite production build
```

---

## Git Workflow

This project was built phase by phase. Each phase was fully implemented and verified before a single commit was created and pushed:

1. Complete all work for the phase
2. Verify — run tests, build, lint
3. Create **one commit** for the entire phase
4. Push to `origin/main`

No intermediate commits were created during a phase. This keeps the commit history clean and each commit represents a fully working state.

---

## AI Usage

This project was built with AI assistance (Amazon Q Developer) throughout all phases. The AI was used to:

- Generate boilerplate and implementation code for each phase based on detailed prompts
- Suggest architecture patterns (layered backend, repository pattern, Zod validation)
- Write test cases alongside implementation code
- Review and refine code for correctness, security, and consistency
- Write documentation

All prompts used during development are preserved in [`PROMPTS.md`](./PROMPTS.md). The AI generated code was reviewed, and the project was verified at each phase by running the full test suite and build checks.

---

## My AI Usage

AI tools were used throughout development as development assistants. The primary AI tool used for this project was **Amazon Q**.

I used Amazon Q to:

- Suggest architecture and implementation approaches.
- Write and refine implementation code.
- Create and improve test cases.
- Debug and troubleshoot implementation issues.
- Review code for correctness, security, and consistency.
- Improve documentation and README content.
- Refine the application's UI/UX.

AI-generated suggestions and code were reviewed and tested during development rather than being accepted blindly. I used the suggestions as a development aid while making the final implementation decisions myself. The final implementation was verified through the project's test suite, TypeScript checks, builds, linting, and manual application testing.

Using AI helped speed up development, especially when exploring implementation approaches and troubleshooting errors. It also helped me consider alternative solutions and improve code quality. At the same time, reviewing and testing the generated suggestions helped me understand the implementation instead of relying on AI output without verification.

All development prompts are preserved in [`PROMPTS.md`](./PROMPTS.md).

---

## Trade-offs

### JWT stored in `localStorage`

The frontend stores the JWT in `localStorage` for simplicity. This is accessible to JavaScript running on the page, which means an XSS vulnerability could expose the token. The more secure alternative is an `HttpOnly` cookie, which JavaScript cannot read. For a portfolio/demo project this trade-off is acceptable; a production system should use `HttpOnly` cookies with CSRF protection.

### Local PostgreSQL vs Docker Compose

Both options are supported. Docker Compose is more convenient for getting started without installing PostgreSQL locally. Local PostgreSQL is preferable if you already have it running and want to avoid Docker overhead. The application code is identical for both — only `DATABASE_URL` differs.

### No pagination on vehicle listing

`GET /api/vehicles` returns all vehicles in a single response. For a small dealership inventory this is fine, but it would not scale to thousands of vehicles. Adding cursor-based or offset pagination would be a straightforward improvement.

### Role assignment

New users are always assigned the `USER` role on registration. There is no self-service way to become an admin. Admin accounts must be created via the seed script or a direct database update. This is intentional for security.

---

## Future Improvements

- **Pagination** — add limit/offset or cursor-based pagination to `GET /api/vehicles`
- **Image uploads** — allow admins to attach photos to vehicle listings
- **Refresh tokens** — replace the 24-hour JWT with short-lived access tokens and long-lived refresh tokens stored in `HttpOnly` cookies
- **Password reset** — email-based password reset flow
- **Audit log** — record who purchased or modified each vehicle and when
- **Vehicle detail page** — dedicated route for a single vehicle with full details
- **Frontend tests** — add React Testing Library unit/integration tests for components and pages
- **CI/CD pipeline** — GitHub Actions workflow to run tests and build on every push
- **Production Docker Compose** — multi-service Compose file including the backend and frontend containers
