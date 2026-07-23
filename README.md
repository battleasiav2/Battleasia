# BattleAsia — Full Stack Platform

Monorepo for BattleAsia player frontend, coin shop, admin panel, and API.

**GitHub:** [sumon626000/battleasiafibal](https://github.com/sumon626000/battleasiafibal)

## Apps

| App | Path | Local URL |
|-----|------|-----------|
| API | `battleasia-api/` | http://localhost:5050 |
| Player FE | `battleasia-fe-main/battleasia-fe-main/` | http://localhost:8081 |
| Shop | `battleasia-shop-main/battleasia-shop-main/` | http://localhost:8082 |
| Admin | `battleasia-admin-main/battleasia-admin-main/` | http://localhost:3001 |

## Quick start (local dev)

```powershell
npm run install:all
npm run dev
```

## Hosting / File Manager upload

Production builds are organized **by domain** in `hosting/`:

```
hosting/
  domains/
    battleasia.net/          → main site public_html
    shop.battleasia.net/     → shop subdomain
    admin.battleasia.net/    → admin subdomain
  api/                       → Node.js API
  scripts/build-for-hosting.ps1
  SETUP-BN.md                → Bengali setup guide
```

Build and copy files:

```powershell
powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-hosting.ps1
```

Then upload each domain folder via cPanel File Manager. Full guide: **`hosting/SETUP-BN.md`**

## VPS / Docker (recommended production)

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

See `deploy/README.md` for MongoDB Atlas, SSL, backups, and CI.

## Production domains (default)

- `battleasia.net` — Player site
- `shop.battleasia.net` — BAC coin shop
- `admin.battleasia.net` — Admin panel
- `/api/` — Backend (nginx reverse proxy)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all app dependencies |
| `npm run dev` | Start all apps locally |
| `npm run docker:prod` | Production Docker stack |
| `hosting/scripts/build-for-hosting.ps1` | Build + copy to domain folders |

## Security

Never commit `.env`, `.env.production`, or real credentials. Use `.env.production.example` as template.
