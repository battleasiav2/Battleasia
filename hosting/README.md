# BattleAsia — Hosting Folder Guide

This folder is organized **by domain** so you can upload via **cPanel File Manager** or FTP.

## Folder map

| Local folder | Upload to (hosting) |
|---|---|
| `hosting/domains/battleasia.net/` | Main domain `public_html/` |
| `hosting/domains/shop.battleasia.net/` | Subdomain `shop` document root |
| `hosting/domains/admin.battleasia.net/` | Subdomain `admin` document root |
| `hosting/api/` | Node.js app folder on server |
| `hosting/server/` | VPS Docker deploy (see README) |

## 1. Build production files

From project root:

```powershell
powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-hosting.ps1
```

Linux/Mac:

```bash
chmod +x hosting/scripts/build-for-hosting.sh
./hosting/scripts/build-for-hosting.sh
```

This builds FE, Shop, Admin, API and copies output into `hosting/domains/*` and `hosting/api/`.

## 2. Configure environment

1. Copy `.env.production.example` → `.env.production` (VPS) or `hosting/api/.env` (Node app)
2. Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`
3. Set your real domains in `CORS_ORIGINS`, `VITE_BAC_SHOP_URL`, etc.

## 3. Upload via File Manager

1. Zip each domain folder locally
2. Upload zip to cPanel File Manager
3. Extract in the correct document root
4. Ensure `.htaccess` is present (show hidden files)

## 4. API on shared hosting

If your host supports **Node.js**:
1. Upload `hosting/api/` contents
2. Run `npm install --omit=dev`
3. Set env vars in host panel
4. Start: `node dist/index.js` or `pm2 start ecosystem.config.cjs`

## 5. Full production (recommended)

Use a VPS with Docker — see `hosting/server/README.md` and `deploy/README.md`.

## Bengali guide

See `hosting/SETUP-BN.md` for step-by-step instructions in Bengali.
