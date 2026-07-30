# BattleAsia — Full Stack (battleasia.gg)

Monorepo for **single-domain** production on Hostinger. Each app lives in its domain-named folder; deploy merges them into one `public_html`.

## Live URLs (one domain)

| URL | App |
|-----|-----|
| `https://battleasia.gg/` | Player site |
| `https://battleasia.gg/store/` | Coin shop |
| `https://battleasia.gg/admin/` | Admin panel |
| `https://battleasia.gg/api/` | API |

**GitHub:** [battleasiav2/Battleasia](https://github.com/battleasiav2/Battleasia)

## Repository layout

```
Battleasia/
├── battleasia.gg/        # Player site (React/Vite)
├── shop.battleasia.gg/   # Coin shop → /store/
├── admin.battleasia.gg/  # Admin panel → /admin/
├── api/                  # Node.js API → ~/api/ on server
├── battleasia-app/       # Flutter mobile app (build APK separately)
├── deploy/               # build, assemble, deploy scripts
├── docker/               # Optional Docker (VPS)
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

## Production build (Hostinger)

```powershell
npm run build
```

Output:

- `deploy/output/public_html/` → `~/domains/battleasia.gg/public_html/`
- `api/dist/` + `api/package.json` → `~/api/`

Full Hostinger setup: **`deploy/HOSTINGER-SETUP.md`**

## Server deploy (SSH)

```bash
git clone https://github.com/battleasiav2/Battleasia.git ~/Battleasia
nano ~/api/.env
bash ~/Battleasia/deploy/deploy.sh
```

## Security

Never commit `.env` or real credentials. Use `api/.env.example` and `.env.production.example`.
