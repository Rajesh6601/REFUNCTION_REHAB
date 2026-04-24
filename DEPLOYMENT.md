# ReFunction Rehab — Deployment Guide

Minimum-cost deployment options for the full-stack app (React + Express + PostgreSQL).

---

## Architecture Overview

```
Internet → Nginx (serves React SPA + proxies /api) → Express server → PostgreSQL
```

The app ships as three Docker containers orchestrated by `docker-compose.yml`:
- **client** — nginx:alpine serving the React build, proxies `/api/*` to server
- **server** — Node 20 running Express + Prisma ORM
- **db** — postgres:16-alpine

---

## Option A: AWS Lightsail (Recommended — Lowest Cost)

**Estimated cost: $5–$10/month**

AWS Lightsail is the simplest and cheapest way to run Docker on AWS. A single $5/month instance (1 GB RAM, 1 vCPU) can run all three containers.

### Step 1 — Create a Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com)
2. Click **Create instance**
3. Select **Linux/Unix** → **OS Only** → **Ubuntu 22.04 LTS**
4. Choose the **$5/month** plan (1 GB RAM, 1 vCPU, 40 GB SSD)
5. Name it `refunction-rehab` and click **Create**

### Step 2 — Assign a Static IP

1. In Lightsail → **Networking** → **Create static IP**
2. Attach it to your instance
3. Note the IP address (e.g., `3.110.45.12`)

### Step 3 — Open Ports

In Lightsail → Instance → **Networking** tab → **Firewall**:
- Port **80** (HTTP) — already open by default
- Port **443** (HTTPS) — add this rule

### Step 4 — SSH into the Instance

```bash
ssh -i ~/.ssh/LightsailKey.pem ubuntu@<STATIC_IP>
```

Or use the browser-based SSH terminal in the Lightsail console.

### Step 5 — Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Log out and back in for group change to take effect
exit
# SSH back in

# Verify
docker --version
docker compose version
```

### Step 6 — Clone & Configure

```bash
git clone <YOUR_REPO_URL> ~/refunction-rehab
cd ~/refunction-rehab

# Create environment file
cp .env.example .env
nano .env
```

Fill in production secrets in `.env`:

```env
DB_USER=refunction
DB_PASSWORD=<STRONG_RANDOM_PASSWORD>
DB_NAME=refunction_rehab
DB_PORT=5432
DATABASE_URL=postgresql://refunction:<STRONG_RANDOM_PASSWORD>@db:5432/refunction_rehab

JWT_SECRET=<RANDOM_64_CHAR_STRING>

RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clinic@refunctionrehab.com
SMTP_PASS=<APP_PASSWORD>
SMTP_FROM=noreply@refunctionrehab.com
```

Generate strong secrets:
```bash
# Generate random JWT secret
openssl rand -hex 32

# Generate random DB password
openssl rand -base64 24
```

### Step 7 — Build & Start

```bash
cd ~/refunction-rehab
docker compose up -d --build
```

Verify all three containers are running:
```bash
docker compose ps
```

Expected output:
```
NAME                  STATUS
refunction_client     Up (healthy)
refunction_server     Up (healthy)
refunction_db         Up (healthy)
```

Visit `http://<STATIC_IP>` — the site should be live.

### Step 8 — Set Up a Domain Name

1. Buy a domain (e.g., `refunctionrehab.com`) from any registrar
2. In your DNS settings, add an **A record**:
   - **Name**: `@` (or blank)
   - **Value**: your Lightsail static IP
   - **TTL**: 300
3. For `www`, add a **CNAME**:
   - **Name**: `www`
   - **Value**: `refunctionrehab.com`

### Step 9 — Enable HTTPS with Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot -y

# Stop the client container temporarily (it uses port 80)
docker compose stop client

# Get certificate
sudo certbot certonly --standalone -d refunctionrehab.com -d www.refunctionrehab.com

# Certificate files will be at:
#   /etc/letsencrypt/live/refunctionrehab.com/fullchain.pem
#   /etc/letsencrypt/live/refunctionrehab.com/privkey.pem
```

Update `docker-compose.yml` to mount the certs and expose port 443. Add to the `client` service:

```yaml
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: refunction_client
    restart: always
    depends_on:
      - server
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

Update `client/nginx.conf` for HTTPS:

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name refunctionrehab.com www.refunctionrehab.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name refunctionrehab.com www.refunctionrehab.com;

    ssl_certificate     /etc/letsencrypt/live/refunctionrehab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/refunctionrehab.com/privkey.pem;

    root  /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass         http://server:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

Rebuild and restart:
```bash
docker compose up -d --build
```

Set up auto-renewal:
```bash
# Add cron job to renew certs and reload nginx
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet && docker exec refunction_client nginx -s reload
```

---

## Option B: GoDaddy VPS

**Estimated cost: $5–$12/month**

GoDaddy offers Virtual Private Servers that work the same way as Lightsail.

### Step 1 — Purchase a VPS

1. Go to [GoDaddy VPS Hosting](https://www.godaddy.com/hosting/vps-hosting)
2. Select the cheapest Linux plan (1 vCPU, 1 GB RAM)
3. Choose **Ubuntu 22.04** as the OS

### Step 2 — SSH In & Install Docker

```bash
ssh root@<YOUR_VPS_IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
docker compose version
```

### Steps 3–9 — Same as AWS Lightsail

Follow Steps 6–9 from Option A above. The process is identical once Docker is installed.

### Domain with GoDaddy

If your domain is already on GoDaddy:
1. Go to **My Products** → **DNS** for your domain
2. Edit the **A record** to point to your VPS IP
3. Add a **CNAME** for `www` → `@`

---

## Option C: Free-Tier / Ultra-Low-Cost Stack

**Estimated cost: $0–$5/month** (for small patient volumes)

Split the stack across free-tier services:

| Component | Service | Cost |
|-----------|---------|------|
| **Frontend** | Vercel or Netlify (free tier) | $0 |
| **Backend** | Railway or Render (free/starter) | $0–$5 |
| **Database** | Neon or Supabase (free tier, 500 MB) | $0 |

### Frontend — Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# From the client/ directory
cd client

# Deploy
vercel

# Set environment variable in Vercel dashboard:
#   VITE_API_URL = https://your-backend.railway.app
```

Or connect your GitHub repo to Vercel for automatic deploys on push.

### Backend — Deploy to Railway ($5/month starter)

1. Go to [railway.app](https://railway.app) and connect your GitHub repo
2. Create a new project → select the `server/` directory
3. Add a **PostgreSQL** plugin (Railway provisions it automatically)
4. Set environment variables in Railway dashboard:
   ```
   DATABASE_URL=<auto-provided by Railway Postgres plugin>
   JWT_SECRET=<your secret>
   RAZORPAY_KEY_ID=<your key>
   RAZORPAY_KEY_SECRET=<your secret>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your email>
   SMTP_PASS=<your app password>
   ```
5. Railway auto-detects the Dockerfile and deploys

### Database — Neon Free Tier (Alternative)

If not using Railway's built-in Postgres:

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Copy the connection string
3. Set `DATABASE_URL` in your backend's environment to the Neon URL:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/refunction_rehab?sslmode=require
   ```

---

## Option D: AWS EC2 Free Tier (12 months free)

**Estimated cost: $0 for 12 months**, then ~$9/month

### Step 1 — Launch EC2 Instance

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Select **Ubuntu 22.04 LTS** (64-bit, x86)
4. Instance type: **t2.micro** (free tier eligible — 1 vCPU, 1 GB RAM)
5. Create or select a key pair for SSH
6. In **Security Group**, allow:
   - SSH (port 22) — your IP only
   - HTTP (port 80) — 0.0.0.0/0
   - HTTPS (port 443) — 0.0.0.0/0
7. Storage: 20 GB gp3 (free tier includes 30 GB)
8. Launch

### Step 2 — Allocate Elastic IP (Free While Attached)

1. EC2 → **Elastic IPs** → **Allocate**
2. **Associate** with your instance
3. Note the IP

### Steps 3–9 — Same as Lightsail

SSH in as `ubuntu@<ELASTIC_IP>` and follow Steps 5–9 from Option A.

> **Note**: t2.micro has only 1 GB RAM. If memory is tight, add a 1 GB swap file:
> ```bash
> sudo fallocate -l 1G /swapfile
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

---

## Post-Deployment Checklist

### Backups

Set up daily PostgreSQL backups:

```bash
# Create backup script
cat > ~/backup-db.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec refunction_db pg_dump -U refunction refunction_rehab | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
# Keep only last 14 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +14 -delete
SCRIPT

chmod +x ~/backup-db.sh

# Run daily at 2 AM
crontab -e
# Add:
0 2 * * * /home/ubuntu/backup-db.sh
```

### Monitoring

```bash
# Check container health
docker compose ps

# View logs
docker compose logs -f --tail=50

# Check disk usage
df -h

# Check memory
free -m
```

### Updating the App

```bash
cd ~/refunction-rehab
git pull origin main
docker compose up -d --build
```

### Restore from Backup (if needed)

```bash
gunzip -c ~/backups/db_YYYYMMDD_HHMMSS.sql.gz | docker exec -i refunction_db psql -U refunction refunction_rehab
```

---

## Cost Comparison Summary

| Option | Monthly Cost | Best For |
|--------|-------------|----------|
| **AWS Lightsail** | $5 | Simple, predictable billing, single-server setup |
| **GoDaddy VPS** | $5–$12 | Already have a GoDaddy domain/account |
| **Free-Tier Split** | $0–$5 | Very low traffic, early stage |
| **AWS EC2 Free Tier** | $0 (12 months) | Testing / first year |

**Recommendation**: Start with **AWS Lightsail $5/month**. It's the simplest path — one server, one command (`docker compose up`), predictable cost, and easy to scale up later by resizing the instance.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Container won't start | `docker compose logs server` — check for DB connection or migration errors |
| Port 80 already in use | `sudo lsof -i :80` — stop any conflicting service (e.g., Apache) |
| Out of memory | Add swap (see EC2 section) or upgrade to 2 GB plan |
| DB migration fails | `docker compose exec server npx prisma migrate deploy` manually |
| SSL cert expired | `sudo certbot renew && docker exec refunction_client nginx -s reload` |
| Can't connect to site | Check firewall rules allow ports 80/443, verify static IP is attached |
