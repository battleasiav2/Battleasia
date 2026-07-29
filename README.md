# BattleAsia — Full Stack (battleasia.gg)

Monorepo for production domains on Hostinger. **No duplicate folders** — each app lives in its domain-named folder.

## Repository layout

```
Battleasia/
├── battleasia.gg/        # Player site (React/Vite) → battleasia.gg public_html
├── shop.battleasia.gg/   # Coin shop → shop subdomain public_html
├── admin.battleasia.gg/  # Admin panel → admin subdomain public_html
├── api/                  # Node.js API → ~/api/ on server
├── battleasia-app/       # Flutter mobile app (build APK separately)
├── deploy/               # build.ps1, build.sh, deploy.sh, htaccess, guides
├── docker/               # Optional Docker (VPS)
└── .env.production.example
```

| Domain | Folder | Local dev |
|--------|--------|-----------|
| `https://battleasia.gg` | `battleasia.gg/` | http://localhost:8081 |
| `https://shop.battleasia.gg` | `shop.battleasia.gg/` | http://localhost:8082 |
| `https://admin.battleasia.gg` | `admin.battleasia.gg/` | http://localhost:3000 |
| API `/api/` | `api/` | http://localhost:5050 |

**GitHub:** [battleasiav2/Battleasia](https://github.com/battleasiav2/Battleasia)

## Local development

```powershell
npm run install:all
npm run dev
```

## Production build (Hostinger)

```powershell
npm run build
# or: powershell -ExecutionPolicy Bypass -File deploy/build.ps1
```

Build output (upload or rsync these):

- `battleasia.gg/dist/` → main `public_html`
- `shop.battleasia.gg/dist/` → shop `public_html`
- `admin.battleasia.gg/build/` → admin `public_html`
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
