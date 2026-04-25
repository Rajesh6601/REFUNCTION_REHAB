# ReFunction Rehab — Full-Stack Website & Patient Management

Full-stack web application for **ReFunction Rehab** physiotherapy center led by **Dr. Neha Trivedi, PT, MPT**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, React Router v6 |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 (Docker Hub `postgres:16-alpine`) |
| ORM | Prisma v5 |
| Auth | JWT + bcrypt |
| Containerization | Docker Compose |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (included with Docker Desktop)
- [Git](https://git-scm.com/)

No local Node.js or PostgreSQL installation is required — everything runs in Docker.

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd ReFunction_Rehab

# 2. Copy and fill in secrets
cp .env.example .env

# 3. Start everything (pulls postgres:16-alpine, builds server + client, runs migrations)
docker compose up --build
```

| Service | URL |
|---|---|
| Website (client) | http://localhost |
| API (server) | http://localhost:4000 |
| Admin panel | http://localhost/admin/login |
| PostgreSQL | localhost:5432 |

> PostgreSQL data persists in a Docker named volume (`postgres_data`) across restarts.

---

## First-Time Admin Setup

After `docker compose up`, create the doctor/admin account:

1. Open **http://localhost/admin/setup** in the browser
2. Enter admin name, email, and password
3. Login at **http://localhost/admin/login**
4. Access the dashboard at **http://localhost/admin/dashboard**

Or via CLI:
```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Neha Trivedi","email":"admin@refunctionrehab.com","password":"yourpassword"}'
```

---

## Common Commands

### Docker (Production-like)

```bash
# Start all services (foreground)
docker compose up --build

# Start in detached (background) mode
docker compose up -d --build

# Rebuild and restart a single service
docker compose up -d --build client    # client only
docker compose up -d --build server    # server only

# View logs
docker compose logs -f                 # all services
docker compose logs -f server          # server only
docker compose logs -f client          # client only
docker compose logs -f db              # database only

# Check running containers
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes (resets database completely)
docker compose down -v

# Restart a single service without rebuild
docker compose restart server
```

### Database

```bash
# Connect to PostgreSQL shell
docker exec -it refunction_db psql -U refunction -d refunction_rehab

# Run Prisma migrations
docker compose exec server npx prisma migrate deploy

# Create a new migration (development)
docker compose exec server npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI on http://localhost:5555)
docker compose exec server npx prisma studio

# Reset database (drop all data and re-run migrations)
docker compose exec server npx prisma migrate reset
```

### Local Development (without Docker)

If you prefer running the client and server outside Docker for hot-reloading:

```bash
# Terminal 1 — Start only the database via Docker
docker compose up db

# Terminal 2 — Start the server
cd server
npm install
export DATABASE_URL=postgresql://refunction:rehab_secret@localhost:5432/refunction_rehab
npx prisma migrate deploy
npx prisma generate
node src/index.js
# Server runs at http://localhost:4000

# Terminal 3 — Start the client (Vite dev server with hot reload)
cd client
npm install
npm run dev
# Client runs at http://localhost:5173 (Vite proxies /api to server)
```

---

## Environment Variables

Create a `.env` file at the project root (copy from `.env.example`):

```env
# Database (used by Docker Compose)
DB_USER=refunction
DB_PASSWORD=rehab_secret
DB_NAME=refunction_rehab
DB_PORT=5432

# Auto-set by Docker Compose for the server container
DATABASE_URL=postgresql://refunction:rehab_secret@db:5432/refunction_rehab

# Auth (required)
JWT_SECRET=change_this_to_a_long_random_secret

# Razorpay (optional — for online payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email (optional — for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@refunctionrehab.com

# Cloudinary (optional — for file uploads)
CLOUDINARY_URL=
```

---

## Pages

| URL | Description |
|---|---|
| `/` | Homepage |
| `/about` | About Dr. Neha Trivedi |
| `/services` | All services |
| `/services/:slug` | Individual service detail |
| `/enroll` | Patient enrollment — multi-step form (saves to DB) |
| `/payment` | Payment collection (saves to DB) |
| `/contact` | Contact form (saves to DB) |
| `/admin/setup` | One-time admin account creation |
| `/admin/login` | Staff login |
| `/admin/dashboard` | Doctor dashboard — live stats from DB |
| `/admin/patients` | Patient list, search, filter, CSV export |
| `/admin/payments` | Payment records, revenue summary, CSV export |

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/patients/enroll` | Register a new patient |
| GET | `/api/patients/search?q=` | Search patients by name, mobile, or ID |
| GET | `/api/patients/:id` | Get patient details with payment history |
| POST | `/api/payments` | Record a payment |
| GET | `/api/payments/:id` | Get payment by ID |
| GET | `/api/payments/patient/:patientId` | Get all payments for a patient |
| POST | `/api/contact` | Submit a contact inquiry |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/setup` | Create first admin account (one-time) |
| POST | `/api/auth/login` | Login and receive JWT token |

### Admin (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard stats (patients, revenue, etc.) |
| GET | `/api/admin/patients` | Paginated patient list with search & filters |
| GET | `/api/admin/patients/export` | Export patients as CSV |
| GET | `/api/admin/payments` | Paginated payment records |
| GET | `/api/admin/payments/export` | Export payments as CSV |

---

## Project Structure

```
ReFunction_Rehab/
├── docker-compose.yml          # Orchestrates db + server + client
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for .env
├── README.md
│
├── client/                     # React + Vite frontend
│   ├── Dockerfile              # Multi-stage build: Node -> Nginx
│   ├── nginx.conf              # SPA routing + /api proxy to server
│   ├── src/
│   │   ├── pages/              # Route pages (Home, Enroll, Payment, etc.)
│   │   │   └── admin/          # Admin pages (Dashboard, Patients, Payments)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # Navbar, Footer, FloatingWhatsApp
│   │   │   ├── admin/          # AdminLayout, sidebar
│   │   │   └── ui/             # PageWrapper, shared components
���   │   └── lib/                # API client (axios), utilities
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── Dockerfile              # Runs Prisma migrations on start
│   ├── src/
│   │   ├── index.js            # Express app entry point
│   │   ├── routes/             # API routes (patients, payments, auth, admin, contact)
│   │   ├── middleware/         # JWT auth middleware
│   │   └── lib/                # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (single source of truth)
│   │   └── migrations/         # Auto-generated by Prisma
│   └── package.json
│
└── Skills/
    └── SKILL.md                # Full app specification & design document
```

---

## Cloud Deployment

The same `docker-compose.yml` works on any cloud VM with Docker installed:

```bash
# On AWS EC2, GCP, DigitalOcean, etc.
git clone <repo-url>
cd ReFunction_Rehab
cp .env.example .env    # set production secrets
docker compose up -d    # runs in background
```

### Using a Managed Database (Supabase / Railway / Neon / AWS RDS)

Remove the `db` service from `docker-compose.yml` and override `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

No code changes needed — Prisma handles both Docker and managed databases identically.
