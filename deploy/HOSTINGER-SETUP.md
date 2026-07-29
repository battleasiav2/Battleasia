# BattleAsia — Hostinger Setup (battleasia.gg)

One git repo, **domain-named folders**, no duplicate `hosting/` layout.

## Folder → Hostinger mapping

| Git folder | Live URL | Hostinger path |
|------------|----------|----------------|
| `battleasia.gg/dist/` | https://battleasia.gg | `~/domains/battleasia.gg/public_html/` |
| `shop.battleasia.gg/dist/` | https://shop.battleasia.gg | `~/domains/shop.battleasia.gg/public_html/` |
| `admin.battleasia.gg/build/` | https://admin.battleasia.gg | `~/domains/admin.battleasia.gg/public_html/` |
| `api/` | https://battleasia.gg/api/ | `~/api/` |

## 1. hPanel — DNS & subdomains

1. Point **battleasia.gg** nameservers to Hostinger.
2. Create subdomains: `shop`, `admin`.
3. Enable SSL for all four hostnames.

## 2. MongoDB

hPanel → Databases → MongoDB → create DB + user → copy connection string into `~/api/.env`:

```env
MONGODB_URI=mongodb://USER:PASS@HOST:27017/battleasia?authSource=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg,https://shop.battleasia.gg,https://admin.battleasia.gg
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

- `battleasia.gg/dist/*` → main public_html
- `shop.battleasia.gg/dist/*` → shop public_html
- `admin.battleasia.gg/build/*` → admin public_html
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

Push to `main` → runs `deploy/deploy.sh` on server.

## 7. `.htaccess`

Built into each dist folder by `deploy/build.ps1`. Templates: `deploy/htaccess/`.

Uncomment proxy rules if your plan supports LiteSpeed `[P]` to Node on port 5050.

## Local dev

```powershell
npm run install:all
npm run dev
```

| App | Folder | Port |
|-----|--------|------|
| Player | `battleasia.gg/` | 8081 |
| Shop | `shop.battleasia.gg/` | 8082 |
| Admin | `admin.battleasia.gg/` | 3000 |
| API | `api/` | 5050 |
