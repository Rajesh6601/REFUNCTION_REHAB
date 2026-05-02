# Deploy ReFunction Rehab

Use this skill whenever code changes need to be pushed to the live server at http://187.127.147.87.

## Prerequisites (one-time setup on your machine)
- Docker Desktop installed and running
- Logged into Docker Hub: `docker login` (username: `rajesh6601`)
- `sshpass` installed: `brew install sshpass` (Mac) or `apt-get install sshpass` (Linux)
- `docker buildx` builder ready: `docker buildx create --use --name multibuilder`

---

## SSH Connection

All VPS commands use this SSH pattern (the extra flags are required to avoid keyboard-interactive auth issues):
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o KbdInteractiveAuthentication=no root@187.127.147.87 "<command>"
```

---

## Deployment Steps

### Step 1 — Check if Prisma schema changed
If you edited `server/prisma/schema.prisma`, generate the migration SQL and create the migration file manually (the Docker container is non-interactive so `prisma migrate dev` won't work inside it):

**1a.** Generate the migration SQL diff locally:
```bash
DATABASE_URL="postgresql://refunction:rehab_secret@localhost:5432/refunction_rehab" \
  npx prisma migrate diff \
  --from-schema-datasource ./server/prisma/schema.prisma \
  --to-schema-datamodel ./server/prisma/schema.prisma \
  --script
```

**1b.** Create a timestamped migration folder and save the SQL:
```bash
mkdir -p ./server/prisma/migrations/<YYYYMMDDHHMMSS>_<describe_change>/
```
Save the SQL output from step 1a into `migration.sql` inside that folder.

**1c.** Apply the migration to the local database:
```bash
DATABASE_URL="postgresql://refunction:rehab_secret@localhost:5432/refunction_rehab" \
  npx prisma migrate deploy
```

**1d.** Verify migrations:
```bash
ls ./server/prisma/migrations/
```

### Step 2 — Rebuild local containers (for testing)
```bash
docker compose up -d --build
```
Check server logs to confirm migration applied:
```bash
docker logs refunction_server --tail 15
```

### Step 3 — Build server image for linux/amd64 and push
```bash
docker buildx build --platform linux/amd64 -t rajesh6601/refunction-server:latest --push ./server
```

### Step 4 — Build client image for linux/amd64 and push (only if frontend changed)
```bash
docker buildx build --platform linux/amd64 -t rajesh6601/refunction-client:latest --push ./client
```

### Step 5 — Pull latest images on VPS and restart
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no \
  -o PreferredAuthentications=password -o KbdInteractiveAuthentication=no \
  root@187.127.147.87 \
  "cd /opt/refunction && docker compose pull && docker compose up -d"
```

### Step 6 — Verify everything is running
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no \
  -o PreferredAuthentications=password -o KbdInteractiveAuthentication=no \
  root@187.127.147.87 \
  "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

### Step 7 — Check server logs for errors
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no \
  -o PreferredAuthentications=password -o KbdInteractiveAuthentication=no \
  root@187.127.147.87 \
  "docker logs refunction_server --tail 20"
```

---

## Quick Reference

| What changed | Steps to run |
|---|---|
| Server code only (no schema change) | 3 → 5 → 6 → 7 |
| Prisma schema changed | 1 → 2 → 3 → 5 → 6 → 7 |
| Frontend only | 4 → 5 → 6 |
| Both frontend and backend | 3 → 4 → 5 → 6 → 7 |
| Both + Prisma schema change | 1 → 2 → 3 → 4 → 5 → 6 → 7 |

---

## Infrastructure
- **VPS IP:** `187.127.147.87`
- **VPS user:** `root`
- **VPS password:** `R@jeshshukl@123`
- **App directory on VPS:** `/opt/refunction`
- **Docker Hub:** `rajesh6601/refunction-server` and `rajesh6601/refunction-client`
- **Local DB URL:** `postgresql://refunction:rehab_secret@localhost:5432/refunction_rehab`
- **Frontend:** http://187.127.147.87
- **API:** http://187.127.147.87:4000

---

## Common Issues

**"Permission denied" on SSH** — The VPS requires explicit password auth flags. Always use `-o PreferredAuthentications=password -o KbdInteractiveAuthentication=no` with sshpass.

**"no matching manifest for linux/amd64"** — You built the image on Apple Silicon (ARM). Always use `--platform linux/amd64` with `docker buildx build`.

**"prisma migrate dev" fails as non-interactive** — The Docker container and CI environments are non-interactive. Use `prisma migrate diff` to generate the SQL, create the migration file manually, then apply with `prisma migrate deploy`. See Step 1.

**"Failed to enroll patient" / Null constraint violation** — A Prisma schema change was made but the migration file wasn't included in the build. Ensure the migration folder exists under `server/prisma/migrations/` before building the image.

**Migration not applied on VPS** — The server container runs `prisma migrate deploy` on startup automatically. If migrations are missing, it means the migration file wasn't in the image. Repeat Step 1 and 3.
