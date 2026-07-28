# BattleAsia — Hostinger Deployment Guide (battleasia.gg)

> **Auto-deploy workflow (Cursor → Git → Live):** see [`CURSOR-GIT-HOSTINGER-AUTO-DEPLOY.md`](./CURSOR-GIT-HOSTINGER-AUTO-DEPLOY.md)

Full production setup for **3 subdomains + API on main domain path**.

| Service | URL | Hostinger folder |
|---------|-----|------------------|
| Player site | `https://battleasia.gg` | Main domain `public_html/` |
| Coin shop | `https://shop.battleasia.gg` | Subdomain `shop` document root |
| Admin panel | `https://admin.battleasia.gg` | Subdomain `admin` document root |
| API | `https://battleasia.gg/api/` | Node.js app (outside `public_html`) |
| Uploads | `https://battleasia.gg/uploads/` | Proxied to API |
| Socket.IO | `https://battleasia.gg/socket.io/` | Proxied to API |

MongoDB: **Hostinger MongoDB** (from hPanel — no MongoDB Compass required).

---

## 1. What you need on Hostinger

| Requirement | Why |
|-------------|-----|
| **Business Web Hosting or VPS** | Node.js API + long-running process |
| **Hostinger MongoDB** (hPanel → Databases → MongoDB) | App database |
| **SSL** (free Let’s Encrypt) | HTTPS on all subdomains |
| **SSH access** (recommended) | Run seeds, PM2, npm install |

Shared hosting without Node.js **cannot** run this stack. Use at least a plan with **Node.js Web App** support, or a **VPS**.

---

## 2. DNS & subdomains (hPanel)

1. Point domain **battleasia.gg** nameservers to Hostinger.
2. **Domains → Subdomains** — create:
   - `shop` → `shop.battleasia.gg`
   - `admin` → `admin.battleasia.gg`
3. Enable **SSL** for:
   - `battleasia.gg`
   - `www.battleasia.gg` (optional redirect to apex)
   - `shop.battleasia.gg`
   - `admin.battleasia.gg`

Document roots (typical):

```
/home/YOUR_USER/domains/battleasia.gg/public_html/          ← Player FE
/home/YOUR_USER/domains/shop.battleasia.gg/public_html/   ← Shop
/home/YOUR_USER/domains/admin.battleasia.gg/public_html/  ← Admin
/home/YOUR_USER/battleasia-api/                           ← Node API (create manually)
```

---

## 3. Hostinger MongoDB setup

1. hPanel → **Databases → MongoDB** → Create database.
2. Create a user with read/write access.
3. Copy the connection string. It usually looks like:

```env
MONGODB_URI=mongodb://USER:PASSWORD@HOST:27017/battleasia?authSource=admin
```

Or (if Hostinger gives an internal hostname):

```env
MONGODB_URI=mongodb://USER:PASSWORD@mongodb.hostinger.internal:27017/battleasia
```

4. Paste into API `.env` as `MONGODB_URI` (see section 6).

You do **not** need MongoDB Compass — only the connection string in `.env`.

---

## 4. Git repository layout (recommended: 4 repos)

Split the monorepo for clean Hostinger uploads:

| Repo | Source folder | Deploy target |
|------|---------------|---------------|
| `battleasia-api` | `battleasia-api/` | `/home/YOUR_USER/battleasia-api/` |
| `battleasia-fe` | `battleasia-fe-main/battleasia-fe-main/` | `battleasia.gg/public_html/` |
| `battleasia-shop` | `battleasia-shop-main/battleasia-shop-main/` | `shop.battleasia.gg/public_html/` |
| `battleasia-admin` | `battleasia-admin-main/battleasia-admin-main/` | `admin.battleasia.gg/public_html/` |

**Option A — push built `dist/` only** (simplest on Hostinger):

- Each repo contains **production build output** + `.htaccess` (FE/Shop/Admin).
- API repo contains `dist/`, `package.json`, `package-lock.json`, `.env` (not in git), `uploads/`.

**Option B — push source + build on server** (needs Node on server):

- Clone repo on server → `npm ci` → build → copy to `public_html`.

For Hostinger, **Option A** is usually easier.

---

## 5. Build on your PC (before upload)

From project root on Windows (PowerShell):

```powershell
$env:MAIN_DOMAIN = 'https://battleasia.gg'
$env:SHOP_DOMAIN = 'https://shop.battleasia.gg'
$env:ADMIN_DOMAIN = 'https://admin.battleasia.gg'

powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-hosting.ps1
```

Then set shop main-app URL (add to build script or run manually):

```powershell
# Re-build shop with link back to main site
cd battleasia-shop-main/battleasia-shop-main
$env:VITE_SERVER_URL = ''
$env:VITE_MAIN_APP_URL = 'https://battleasia.gg'
$env:VITE_BASE_PATH = '/'
$env:VITE_CDN_URL = ''
npm run build
# Copy dist to hosting/domains/shop.battleasia.gg/
```

**Build-time environment summary:**

| App | Variables | Value |
|-----|-----------|-------|
| Player FE | `VITE_SERVER_URL` | `` (empty = same-origin `/api`) |
| Player FE | `VITE_BAC_SHOP_URL` | `https://shop.battleasia.gg/user/shop` |
| Shop | `VITE_SERVER_URL` | `` |
| Shop | `VITE_MAIN_APP_URL` | `https://battleasia.gg` |
| Shop | `VITE_BASE_PATH` | `/` |
| Admin | `REACT_APP_API_URL` | `https://battleasia.gg` |

After build, rename output folders for your domain:

```
hosting/domains/battleasia.net/     → upload to battleasia.gg public_html
hosting/domains/shop.battleasia.net/ → upload to shop.battleasia.gg
hosting/domains/admin.battleasia.net/ → upload to admin.battleasia.gg
hosting/api/                         → upload to battleasia-api folder
```

---

## 6. API `.env` (production)

Create `/home/YOUR_USER/battleasia-api/.env`:

```env
NODE_ENV=production
PORT=5050

# Hostinger MongoDB
MONGODB_URI=mongodb://USER:PASSWORD@HOST:27017/battleasia?authSource=admin

# Domains
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg,https://shop.battleasia.gg,https://admin.battleasia.gg

# Secrets — generate strong random values
JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
ADMIN_USERNAME=admin

# Production safety
COINGO_MOCK=false
LOG_AUTH_CODES=false
SYNC_ADMIN_PASSWORD=false
```

Generate JWT secret (Linux/Mac):

```bash
openssl rand -hex 32
```

---

## 7. Upload files (File Manager / FTP / Git)

### 7.1 Player site — `battleasia.gg`

Upload contents of `hosting/domains/battleasia.net/` (or your FE `dist/`) into:

```
public_html/
  index.html
  assets/
  logo/
  .htaccess
```

### 7.2 Shop — `shop.battleasia.gg`

Upload shop `dist/` into shop subdomain `public_html/`.

### 7.3 Admin — `admin.battleasia.gg`

Upload admin `build/` into admin subdomain `public_html/`.

### 7.4 API — Node folder

Upload `hosting/api/` to `/home/YOUR_USER/battleasia-api/`:

```
battleasia-api/
  dist/
  package.json
  package-lock.json
  .env
  uploads/          ← create empty folder (persistent)
```

SSH:

```bash
cd ~/battleasia-api
npm install --omit=dev
node dist/index.js
# Or with PM2:
npm install -g pm2
pm2 start dist/index.js --name battleasia-api
pm2 save
pm2 startup
```

Test:

```bash
curl http://127.0.0.1:5050/health
```

---

## 8. `.htaccess` — SPA + API proxy (main domain)

Create or edit `public_html/.htaccess` on **battleasia.gg**:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy API, uploads, and Socket.IO to Node (port 5050)
  RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
  RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
  RewriteRule ^socket\.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]

  # Player SPA
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Repeat the same 3 proxy lines** on:

- `shop.battleasia.gg/public_html/.htaccess` (before shop SPA rules)
- `admin.battleasia.gg/public_html/.htaccess` (before admin SPA rules)

Shop SPA rules:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

Admin SPA rules:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

> If `[P]` proxy flag is disabled on your plan, use Hostinger **Node.js** reverse proxy in hPanel or upgrade to VPS/LiteSpeed with proxy support.

---

## 9. Seed demo data (full site with sample content)

SSH into server with API `.env` configured:

```bash
cd ~/battleasia-api

# Full seed: roles, admin, player, payments, shop, feed, etc.
npx tsx node_modules/tsx/dist/cli.mjs ../path-to-src/seed.ts
```

If you uploaded **compiled dist only**, run seeds **on your PC** pointing to Hostinger MongoDB:

```powershell
cd battleasia-api
# Set MONGODB_URI in .env to Hostinger MongoDB
npm run seed
npm run seed:games
npm run seed:dashboard
npm run seed:feed
npm run seed:social
npm run seed:demo
```

Or one combined flow from dev machine:

```powershell
cd battleasia-api
npm run seed
npm run seed:games
npm run seed:dashboard
npm run seed:feed
npm run seed:social
npm run seed:demo
```

### Default demo logins (change after launch)

| Role | Email | Password |
|------|-------|----------|
| Admin | value of `ADMIN_EMAIL` in `.env` | value of `ADMIN_PASSWORD` |
| Player | `player@battleasia.local` | `Player@123456` |

---

## 10. Post-deploy checklist

| Test | URL | Expected |
|------|-----|----------|
| API health | `https://battleasia.gg/api/health` | `{ "status": "ok" }` |
| Player home | `https://battleasia.gg` | Home loads, hero images |
| Shop link | From home → shop | Opens `shop.battleasia.gg` |
| Admin | `https://admin.battleasia.gg` | Login + OTP |
| Register | Sign up on player site | Email code (after mail config) |
| Live stats | Home dashboard widgets | Socket connected |
| Uploads | Admin/feed images | `/uploads/...` loads |

### Admin panel after deploy

1. **System → Mail Settings** — configure SMTP (no code changes).
2. **System → App Download** — upload APK (saved as `BattleAsia.apk`).
3. **Customer Support → Live Chat Settings** — optional widget tuning.

---

## 11. Architecture diagram

```
                    ┌─────────────────────────────────────┐
                    │         Hostinger MongoDB           │
                    └─────────────────┬───────────────────┘
                                      │
┌──────────────┐  /api/  ┌───────────▼───────────┐
│ battleasia.gg│ ──────► │  Node API :5050       │
│  (Player FE) │  proxy  │  ~/battleasia-api/    │
└──────────────┘         └───────────▲───────────┘
       ▲                             │
       │ /api/ /uploads/ /socket.io/ │
┌──────┴───────┐              ┌──────┴───────┐
│ shop.        │              │ admin.       │
│ battleasia.gg│              │ battleasia.gg│
│  (Shop FE)   │              │  (Admin)     │
└──────────────┘              └──────────────┘
```

---

## 12. Troubleshooting

| Problem | Fix |
|---------|-----|
| API 404 on `/api/health` | Enable `.htaccess` proxy lines; confirm Node running on 5050 |
| CORS error | Add all 4 HTTPS origins to `CORS_ORIGINS` |
| Admin calls `localhost:5050` | Rebuild admin with `REACT_APP_API_URL=https://battleasia.gg` |
| Shop links to localhost | Rebuild shop with `VITE_MAIN_APP_URL=https://battleasia.gg` |
| Socket not connecting | Ensure `/socket.io/` proxy on all 3 domains |
| MongoDB connection failed | Check Hostinger MongoDB IP whitelist / internal hostname |
| Blank page after deploy | Check `.htaccess` SPA fallback; verify `index.html` in root |
| OTP not in email | Configure **System → Mail Settings** in admin |

---

## 13. Git upload workflow (when you share repo links)

1. Create 4 empty GitHub/GitLab repos.
2. Push each build artifact repo (section 4).
3. On Hostinger, clone or upload zip from each repo to the correct folder.
4. Never commit `.env` — set secrets only on server.

When you share your Git link, map each repo to the Hostinger folder above and run the seed commands once.

---

## 14. Security before going live

- [ ] Strong `JWT_SECRET` and `ADMIN_PASSWORD`
- [ ] `LOG_AUTH_CODES=false`
- [ ] Change demo player password or remove demo accounts
- [ ] Configure admin mail SMTP
- [ ] SSL active on all subdomains
- [ ] `uploads/` folder writable by Node process

---

## Quick command reference

```powershell
# Build for battleasia.gg
$env:MAIN_DOMAIN='https://battleasia.gg'
$env:SHOP_DOMAIN='https://shop.battleasia.gg'
$env:ADMIN_DOMAIN='https://admin.battleasia.gg'
powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-hosting.ps1
```

```bash
# Server: start API
cd ~/battleasia-api && npm install --omit=dev && pm2 start dist/index.js --name battleasia-api

# Server: seed (from dev machine with remote MONGODB_URI)
npm run seed && npm run seed:games && npm run seed:dashboard && npm run seed:feed && npm run seed:social && npm run seed:demo
```
