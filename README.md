# BattleAsia — Full Stack (battleasia.gg)

Monorepo for production on **Hostinger KVM + Coolify** (recommended) or Webuzo/Hostinger shared.

## Live URLs (Coolify — ৩ subdomain + API folder)

| URL | App |
|-----|-----|
| `https://battleasia.gg/` | Player site |
| `https://shop.battleasia.gg/` | Coin shop |
| `https://admin.battleasia.gg/` | Admin panel |
| `https://battleasia.gg/api/` | API (folder — no api subdomain) |

**GitHub:** [battleasiav2/Battleasia](https://github.com/battleasiav2/Battleasia)

## Coolify deploy (recommended)

1. Coolify → New Resource → **Docker Compose**
2. Repo: `battleasiav2/Battleasia` · Branch: `main`
3. Compose file: **`docker-compose.coolify.yml`**
4. Env: `JWT_SECRET`, `ADMIN_PASSWORD` (Mongo = local container by default)
5. Domains: `fe` → battleasia.gg · `shop` → shop. · `admin` → admin. · `api` → battleasia.gg/api

**বাংলা step-by-step:** **`deploy/COOLIFY-BN.md`**

## Repository layout

```
Battleasia/
├── battleasia.gg/              # Player site (React/Vite)
├── shop.battleasia.gg/         # Coin shop
├── admin.battleasia.gg/        # Admin panel
├── api/                        # Node.js API
├── battleasia-app/             # Flutter mobile (APK separate)
├── docker/                     # Dockerfiles
├── docker-compose.coolify.yml  # Coolify (no nginx — Coolify proxy)
├── docker-compose.prod.yml     # Manual VPS + nginx
├── deploy/                     # Guides + scripts
└── .env.production.example
```

## Local development

```powershell
npm run install:all
npm run dev
```

Open http://localhost:8080 — one proxy serves player, shop, admin, and API.

| Path | Local target |
|------|----------------|
| `/` | http://localhost:8081 |
| `/store/` | http://localhost:8082 |
| `/admin/` | http://localhost:3000 |
| `/api/` | http://localhost:5050 |

## Alternative: single-domain Hostinger / Webuzo

Path-based: `/store/` + `/admin/` on one domain.

```powershell
npm run build
```

- `deploy/output/public_html/` → site root
- Guides: `deploy/HOSTINGER-SETUP.md`, `deploy/WEBUZO-SINGLE-DOMAIN-BN.md`, `deploy/WEBUZO-PASSENGER-BN.md`

## Security

Never commit `.env` or real credentials. Use `api/.env.example` and `.env.production.example`.
