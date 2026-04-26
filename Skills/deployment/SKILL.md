# Deploy ReFunction Rehab

Use this skill whenever code changes need to be pushed to the live server at http://187.127.147.87.

## Prerequisites (one-time setup on your machine)
- Docker Desktop installed and running
- Logged into Docker Hub: `docker login` (username: `rajesh6601`)
- `sshpass` installed: `brew install sshpass` (Mac) or `apt-get install sshpass` (Linux)
- `docker buildx` builder ready: `docker buildx create --use --name multibuilder`

---

## Deployment Steps

### Step 1 — Check if Prisma schema changed
If you edited `server/prisma/schema.prisma`, run:
```bash
docker exec refunction_server npx prisma migrate dev --name <describe_your_change>
```
Then copy the migration out of the container to the local filesystem (IMPORTANT — otherwise the next build won't include it):
```bash
docker cp refunction_server:/app/prisma/migrations/<migration_folder_name> ./server/prisma/migrations/
```
Verify it was copied:
```bash
ls ./server/prisma/migrations/
```

### Step 2 — Build server image for linux/amd64 and push
```bash
docker buildx build --platform linux/amd64 -t rajesh6601/refunction-server:latest --push ./server
```

### Step 3 — Build client image for linux/amd64 and push (only if frontend changed)
```bash
docker buildx build --platform linux/amd64 -t rajesh6601/refunction-client:latest --push ./client
```

### Step 4 — Pull latest images on VPS and restart
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no root@187.127.147.87 \
  "cd /opt/refunction && docker compose pull && docker compose up -d"
```

### Step 5 — Verify everything is running
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no root@187.127.147.87 \
  "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

### Step 6 — Check server logs for errors
```bash
sshpass -p 'R@jeshshukl@123' ssh -o StrictHostKeyChecking=no root@187.127.147.87 \
  "docker logs refunction_server --tail 20"
```

---

## Quick Reference

| What changed | Steps to run |
|---|---|
| Server code only (no schema change) | 2 → 4 → 5 → 6 |
| Prisma schema changed | 1 → 2 → 4 → 5 → 6 |
| Frontend only | 3 → 4 → 5 |
| Both frontend and backend | 2 → 3 → 4 → 5 → 6 |

---

## Infrastructure
- **VPS IP:** `187.127.147.87`
- **VPS user:** `root`
- **App directory on VPS:** `/opt/refunction`
- **Docker Hub:** `rajesh6601/refunction-server` and `rajesh6601/refunction-client`
- **Frontend:** http://187.127.147.87
- **API:** http://187.127.147.87:4000

## Common Issues

**"no matching manifest for linux/amd64"** — You built the image on Apple Silicon (ARM). Always use `--platform linux/amd64` with `docker buildx build`.

**"Failed to enroll patient" / Null constraint violation** — A Prisma schema change was made but the migration wasn't copied to the local filesystem before rebuilding. Run Step 1 to copy the migration, then rebuild.

**Migration not applied on VPS** — The server container runs `prisma migrate deploy` on startup automatically. If migrations are missing, it means the migration file wasn't in the image. Repeat Step 1 and 2.