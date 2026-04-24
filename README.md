# ReFunction Rehab — Full-Stack Website & Patient Management

Full-stack web application for **ReFunction Rehab** physiotherapy center led by **Dr. Neha Trivedi, PT, MPT**.

---

## Stack

| Layer     | Tech                                    |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS          |
| Backend   | Node.js + Express                       |
| Database  | PostgreSQL 16 (Docker Hub image)        |
| ORM       | Prisma                                  |
| Auth      | JWT + bcrypt                            |
| Container | Docker Compose                          |

---

## Quick Start (one command)

```bash
# 1. Clone the repo
git clone <repo-url>
cd refunction-rehab

# 2. Copy and fill in secrets
cp .env.example .env

# 3. Start everything (pulls postgres:16-alpine, builds server + client, runs migrations)
docker compose up --build
```

- **Website**: http://localhost
- **API**:     http://localhost:4000
- **Admin**:   http://localhost/admin/login

> PostgreSQL data persists in a Docker named volume (`postgres_data`) across restarts.

---

## First-Time Admin Setup

After `docker compose up`, create the doctor/admin account:

```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Neha Trivedi","email":"admin@refunctionrehab.com","password":"yourpassword"}'
```

Or visit **http://localhost/admin/setup** in the browser.

Then log in at **http://localhost/admin/login**.

---

## Cloud Deployment

Works on any VM (AWS EC2, GCP, DigitalOcean, etc.) with Docker installed:

```bash
git clone <repo-url> && cd refunction-rehab
cp .env.example .env   # fill in production secrets
docker compose up -d   # runs in background
```

### Using a Managed Database (Supabase / Railway / Neon / AWS RDS)

Remove the `db` service from `docker-compose.yml` and override `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

No code changes needed — Prisma handles both Docker and managed databases identically.

---

## Development (without Docker)

```bash
# Terminal 1 — start Postgres via Docker only
docker compose up db

# Terminal 2 — server
cd server
npm install
npx prisma migrate dev
npm run dev          # http://localhost:4000

# Terminal 3 — client
cd client
npm install
npm run dev          # http://localhost:5173
```

---

## Pages

| URL                   | Description                              |
|-----------------------|------------------------------------------|
| `/`                   | Homepage                                 |
| `/about`              | About Dr. Neha Trivedi                   |
| `/services`           | All services                             |
| `/services/:slug`     | Individual service detail                |
| `/enroll`             | Patient enrollment (saves to DB)         |
| `/payment`            | Payment collection (saves to DB)         |
| `/contact`            | Contact form (saves to DB)               |
| `/admin/login`        | Staff login                              |
| `/admin/setup`        | One-time admin account creation          |
| `/admin/dashboard`    | Doctor dashboard — live stats from DB    |
| `/admin/patients`     | Patient list, search, filter, CSV export |
| `/admin/payments`     | Payment records, revenue summary, export |

---

## Environment Variables

See `.env.example` for all variables. Critical ones:

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string         |
| `JWT_SECRET`   | Secret for signing JWT tokens        |
| `DB_USER`      | Postgres username (Docker Compose)   |
| `DB_PASSWORD`  | Postgres password (Docker Compose)   |
| `DB_NAME`      | Postgres database name               |
