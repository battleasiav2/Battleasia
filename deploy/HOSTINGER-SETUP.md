# BattleAsia — Hostinger Setup (single domain: battleasia.gg)

One git repo, **one domain**, path-based apps:

| Path | App |
|------|-----|
| `https://battleasia.gg/` | Player site |
| `https://battleasia.gg/store/` | Coin shop |
| `https://battleasia.gg/admin/` | Admin panel |
| `https://battleasia.gg/api/` | Node.js API (proxy to port 5050) |

Build output: `deploy/output/public_html/` → upload to `~/domains/battleasia.gg/public_html/`

## 1. hPanel — DNS

1. Point **battleasia.gg** nameservers to Hostinger.
2. Enable SSL for `battleasia.gg` and `www.battleasia.gg`.
3. **No shop/admin subdomains needed** for this layout.

## 2. MongoDB & API env

hPanel → Databases → MongoDB → create DB + user → copy connection string into `~/api/.env`:

```env
MONGODB_URI=mongodb://USER:PASS@HOST:27017/battleasia?authSource=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
JWT_SECRET=your-64-char-secret
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=strong-password
ADMIN_USERNAME=admin
NODE_ENV=production
PORT=5050
```

## 3. Clone & first deploy (SSH)

```bash
git clone https://github.com/battleasiav2/Battleasia.git ~/Battleasia
mkdir -p ~/api
cp ~/Battleasia/api/.env.example ~/api/.env
nano ~/api/.env
bash ~/Battleasia/deploy/deploy.sh
```

## 4. Manual build (Windows, before FTP upload)

```powershell
npm run install:all
npm run build
```

Upload:

- `deploy/output/public_html/*` → `~/domains/battleasia.gg/public_html/`
- `api/dist/` + `api/package.json` → `~/api/`

## 5. Seed demo data (once)

```bash
cd ~/Battleasia/api
export $(grep -v '^#' ~/api/.env | xargs)
npm run seed && npm run seed:games && npm run seed:dashboard
npm run seed:feed && npm run seed:social && npm run seed:demo
```

Demo player: `player@battleasia.local` / `Player@123456`

## 6. Auto-deploy (GitHub Actions)

Add secrets: `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY`

Push to `main` on [battleasiav2/Battleasia](https://github.com/battleasiav2/Battleasia) → runs `deploy/deploy.sh` on server.

## 7. `.htaccess`

Included in `deploy/output/public_html/.htaccess` by the build scripts.

Uncomment proxy rules if your plan supports LiteSpeed `[P]` to Node on port 5050.

## Local dev

```powershell
npm run install:all
npm run dev
```

Open **http://localhost:8080** (unified proxy):

| Path | Port |
|------|------|
| `/` | 8081 (player) |
| `/store/` | 8082 (shop) |
| `/admin/` | 3000 (admin) |
| `/api/` | 5050 (API) |

Optional hosts file (legacy multi-host dev still works via proxy):

```
127.0.0.1 battleasia.local shop.battleasia.local admin.battleasia.local
```
