# BattleAsia Production Deploy Guide

## Prerequisites

- VPS (Ubuntu 22.04+, 4GB RAM, 2 CPU)
- Domain DNS: `battleasia.net`, `shop.`, `admin.` → VPS IP
- MongoDB Atlas cluster (recommended) or local mongo profile

## Step 1 — Configure environment

```bash
cp .env.production.example .env.production
# Edit .env.production — set MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, domains
```

## Step 2 — MongoDB Atlas

1. Create cluster at https://cloud.mongodb.com
2. Database Access → create user (`readWrite` on `battleasia`)
3. Network Access → add VPS IP
4. Copy connection string → `MONGODB_URI` in `.env.production`

## Step 3 — Build & start (HTTP first)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

For local Mongo instead of Atlas:

```bash
docker compose -f docker-compose.prod.yml --profile local-db --env-file .env.production up -d --build
```

## Step 4 — SSL (Let's Encrypt)

```bash
chmod +x deploy/init-ssl.sh deploy/backup-mongo.sh
./deploy/init-ssl.sh
docker compose -f docker-compose.prod.yml --profile ssl --env-file .env.production up -d certbot
```

## Step 5 — CDN (optional)

1. Build frontends locally or in CI
2. Upload `dist/assets/` to Cloudflare R2 / Bunny / S3
3. Set `CDN_URL` and `VITE_CDN_URL` in `.env.production`
4. Rebuild FE/Shop containers

## Step 6 — Backup (daily cron)

```bash
# Linux cron — daily 3 AM
0 3 * * * cd /opt/battleasia && MONGODB_URI='your-atlas-uri' ./deploy/backup-mongo.sh
```

Windows:

```powershell
.\deploy\backup-mongo.ps1 -Uri "mongodb+srv://..."
```

## Step 7 — Monitoring

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Full health (DB ping, uptime) |
| `GET /ready` | Load balancer readiness (503 if DB down) |

UptimeRobot / Better Stack: monitor `https://battleasia.net/api/../health` via nginx proxy or `https://your-api/health`.

## Step 8 — CI/CD

GitHub Actions runs on push/PR (`.github/workflows/ci.yml`):
- API TypeScript build
- FE / Shop / Admin production builds
- npm audit (API, non-blocking)

## Useful commands

```bash
npm run docker:prod          # start production stack
npm run docker:prod:down     # stop
docker compose -f docker-compose.prod.yml logs -f api
curl https://battleasia.net/health
```
