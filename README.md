# Car Dealership Inventory

A full-stack vehicle inventory system — Express/Prisma backend + React/Vite frontend.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local **or** via Docker Compose)

---

## Database Setup

### Option A — Local PostgreSQL

1. Create the database:
   ```sql
   CREATE DATABASE car_dealership;
   ```
2. Set `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/car_dealership"
   ```

### Option B — Docker Compose

1. Copy the example env file and set a password:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env — set POSTGRES_PASSWORD and DATABASE_URL
   ```
2. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```
3. Stop PostgreSQL:
   ```bash
   docker compose down
   # To also remove the data volume:
   docker compose down -v
   ```

   The container uses these defaults (override via environment variables):

   | Variable          | Default         |
   |-------------------|-----------------|
   | `POSTGRES_DB`     | `car_dealership`|
   | `POSTGRES_USER`   | `postgres`      |
   | `POSTGRES_PASSWORD` | *(required)*  |
   | `POSTGRES_PORT`   | `5432`          |

   Matching `DATABASE_URL` for `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/car_dealership"
   ```

---

## Backend Setup

```bash
cd backend
cp .env.example .env   # then fill in real values
npm install
npx prisma migrate dev --name init   # run migrations
npm run db:seed                       # optional seed data
npm run dev
```

### backend/.env variables

| Variable       | Description                              |
|----------------|------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             |
| `JWT_SECRET`   | Secret for signing JWTs (min 32 chars)   |
| `PORT`         | HTTP port (default `3000`)               |
| `FRONTEND_URL` | CORS origin for the frontend             |

---

## Frontend Setup

```bash
cd frontend
cp .env.example .env   # adjust if backend runs on a different port
npm install
npm run dev
```

### frontend/.env variables

| Variable            | Description                  |
|---------------------|------------------------------|
| `VITE_API_BASE_URL` | Backend API base URL         |

---

## Prisma

Prisma reads `DATABASE_URL` from `backend/.env` automatically.

```bash
cd backend
npx prisma migrate dev      # apply pending migrations
npx prisma migrate deploy   # apply in production
npx prisma generate         # regenerate client after schema changes
npm run db:seed             # seed sample data
```
