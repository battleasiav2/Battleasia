# Cursor → Git → Hostinger Auto Live (battleasia.gg)

এই গাইডে **দৈনিক কাজের flow** বর্ণনা করা হয়েছে:

```
Cursor এ edit → GitHub এ push → Hostinger এ auto build + live
```

**প্রথমবার সেটআপ** (একবার): Hostinger + GitHub Actions secrets  
**পরে প্রতিবার**: শুধু Cursor এ code change → `git push` → ২–৫ মিনিটে live

> প্রথম deploy (DNS, MongoDB, `.env`, SSL) এর জন্য: [`HOSTINGER-BATTLEASIA-GG.md`](./HOSTINGER-BATTLEASIA-GG.md)  
> GitHub repo: `https://github.com/battleasiav2/Battleasia`

---

## 1. পুরো flow (diagram)

```
┌─────────────┐     git push      ┌──────────────┐    SSH deploy    ┌─────────────────────┐
│   Cursor    │ ───────────────►  │   GitHub     │ ───────────────► │  Hostinger Server   │
│  (local PC) │   branch: main    │  Actions CI  │                  │  battleasia.gg live │
└─────────────┘                   └──────────────┘                  └─────────────────────┘
       │                                    │                                  │
       │  edit code                         │  trigger on push                 │  pull + build
       │  commit                            │  appleboy/ssh-action             │  rsync to public_html
       │  push                              │                                  │  pm2 restart API
       └────────────────────────────────────┴──────────────────────────────────┘
```

**Live URLs after deploy:**

| Service | URL |
|---------|-----|
| Player | `https://battleasia.gg` |
| Shop | `https://shop.battleasia.gg` |
| Admin | `https://admin.battleasia.gg` |
| API | `https://battleasia.gg/api/` |

---

## 2. একবারের setup (Hostinger server)

SSH দিয়ে Hostinger এ login করুন (hPanel → Advanced → SSH Access):

```bash
# 1) Repo clone
mkdir -p ~/repos
git clone https://github.com/battleasiav2/Battleasia.git ~/repos/Battleasia

# 2) API .env (একবার — GitHub এ push করবেন না!)
mkdir -p ~/battleasia-api
nano ~/battleasia-api/.env
```

`.env` example (বিস্তারিত: `HOSTINGER-BATTLEASIA-GG.md` section 6):

```env
NODE_ENV=production
PORT=5050
MONGODB_URI=mongodb://USER:PASSWORD@HOST:27017/battleasia?authSource=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg,https://shop.battleasia.gg,https://admin.battleasia.gg
JWT_SECRET=YOUR_64_CHAR_RANDOM_SECRET
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=YOUR_STRONG_PASSWORD
ADMIN_USERNAME=admin
COINGO_MOCK=false
LOG_AUTH_CODES=false
SYNC_ADMIN_PASSWORD=false
```

```bash
# 3) PM2 install (recommended)
npm install -g pm2

# 4) প্রথম manual deploy
cd ~/repos/Battleasia
bash hosting/scripts/deploy-battleasia-gg.sh
```

Deploy script যা করে:

1. `git pull origin/main`
2. `hosting/scripts/build-for-hosting.sh` — সব app build
3. `rsync` → `public_html` (main / shop / admin)
4. API sync → `~/battleasia-api/`
5. `npm install --omit=dev` + `pm2 restart battleasia-api`

**Demo data** (optional, একবার):

```bash
cd ~/repos/Battleasia/battleasia-api
# MONGODB_URI must match ~/battleasia-api/.env
export $(grep -v '^#' ~/battleasia-api/.env | xargs)
npm run seed && npm run seed:games && npm run seed:dashboard
npm run seed:feed && npm run seed:social && npm run seed:demo
```

---

## 3. GitHub Actions secrets (auto-deploy ON)

GitHub → **battleasiav2/Battleasia** → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|-------------|-------|
| `HOSTINGER_SSH_HOST` | Hostinger SSH hostname (e.g. `srv123.hostinger.com` or IP) |
| `HOSTINGER_SSH_USER` | SSH username (e.g. `u123456789`) |
| `HOSTINGER_SSH_KEY` | Private SSH key (full PEM, `-----BEGIN ...`) |
| `HOSTINGER_SSH_PORT` | `22` (optional — default 22) |

**SSH key তৈরি (Windows PowerShell):**

```powershell
ssh-keygen -t ed25519 -C "battleasia-deploy" -f "$env:USERPROFILE\.ssh\battleasia_deploy"
```

- **Public key** (`battleasia_deploy.pub`) → Hostinger hPanel → SSH Keys এ add করুন  
- **Private key** (`battleasia_deploy`) → GitHub secret `HOSTINGER_SSH_KEY`

Workflow file: `.github/workflows/deploy-hostinger.yml`  
Trigger: **`main` branch এ push** হলে auto deploy চালু হয়।

Test manually: GitHub → Actions → **Deploy to Hostinger** → **Run workflow**

---

## 4. দৈনিক কাজ — Cursor থেকে live

### Step A — Cursor এ edit

যেকোনো file change করুন (FE, Shop, Admin, API)।

Local test (optional):

```powershell
# API
cd battleasia-api; npm run dev

# Player FE
cd battleasia-fe-main/battleasia-fe-main; npm run dev
```

### Step B — Git commit + push

Project root (`battleasianew`):

```powershell
cd C:\Users\sumon\Desktop\battleasianew

# Status check
& ".\_tools\MinGit\cmd\git.exe" status

# Stage + commit
& ".\_tools\MinGit\cmd\git.exe" add .
& ".\_tools\MinGit\cmd\git.exe" commit -m "fix: your change description"

# Push to GitHub (battleasiav2 remote)
& ".\_tools\MinGit\cmd\git.exe" push battleasia main
```

> **Note:** Windows system Git HTTPS block হলে `_tools\MinGit\cmd\git.exe` ব্যবহার করুন।  
> অথবা **GitHub Desktop** দিয়ে push করতে পারেন।

**Remote check:**

```powershell
& ".\_tools\MinGit\cmd\git.exe" remote -v
# battleasia → https://github.com/battleasiav2/Battleasia.git
```

### Step C — Auto deploy (GitHub Actions)

1. Push complete হলে GitHub → **Actions** tab খুলুন  
2. **Deploy to Hostinger (battleasia.gg)** workflow run দেখবেন  
3. সবুজ ✓ হলে live:
   - `https://battleasia.gg`
   - `https://shop.battleasia.gg`
   - `https://admin.battleasia.gg`

সাধারণত **২–৫ মিনিট** (build + rsync + API restart)।

### Step D — Verify

```bash
# Server SSH (optional)
curl -s https://battleasia.gg/api/health
pm2 logs battleasia-api --lines 30
```

Browser এ hard refresh: `Ctrl+Shift+R`

---

## 5. কী push করলে কী deploy হয়

| Change location | Live effect |
|-----------------|-------------|
| `battleasia-fe-main/...` | `battleasia.gg` rebuild |
| `battleasia-shop-main/...` | `shop.battleasia.gg` rebuild |
| `battleasia-admin-main/...` | `admin.battleasia.gg` rebuild |
| `battleasia-api/...` | API rebuild + `pm2 restart` |
| `hosting/templates/battleasia.gg/*.htaccess` | `.htaccess` update on all sites |
| `hosting/scripts/deploy-battleasia-gg.sh` | Deploy logic change (next push) |

**GitHub এ push করবেন না:**

- `~/battleasia-api/.env` (secrets)
- `.env` local files
- `uploads/` user files on server

---

## 6. Manual deploy (Actions ছাড়া)

SSH দিয়ে server এ:

```bash
cd ~/repos/Battleasia
git pull origin main
bash hosting/scripts/deploy-battleasia-gg.sh
```

অথবা GitHub Actions → **Run workflow** (workflow_dispatch)।

---

## 7. Local build only (FTP upload — auto-deploy না থাকলে)

Windows:

```powershell
$env:MAIN_DOMAIN = 'https://battleasia.gg'
$env:SHOP_DOMAIN = 'https://shop.battleasia.gg'
$env:ADMIN_DOMAIN = 'https://admin.battleasia.gg'
powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-hosting.ps1
```

Output:

```
hosting/domains/battleasia.gg/        → public_html
hosting/domains/shop.battleasia.gg/   → shop public_html
hosting/domains/admin.battleasia.gg/  → admin public_html
hosting/api/                          → ~/battleasia-api/
```

---

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| Actions fail: SSH connection | Check `HOSTINGER_SSH_*` secrets; public key Hostinger এ add আছে কিনা |
| Actions fail: `.env` missing | Server এ `~/battleasia-api/.env` create করুন |
| API health fail | `pm2 logs battleasia-api`; `MONGODB_URI` verify |
| Site old version | Browser cache clear; Actions log এ `rsync` success দেখুন |
| Git push fail (Windows) | `_tools\MinGit\cmd\git.exe` use করুন |
| Shop link wrong | `VITE_MAIN_APP_URL=https://battleasia.gg` — build script এ already set |
| Admin API 404 | `REACT_APP_API_URL=https://battleasia.gg` — rebuild deploy |

**Actions log path:** GitHub → Actions → failed run → **Deploy over SSH** step

**Server log path:**

```bash
pm2 logs battleasia-api
tail -f ~/battleasia-api/api.log
```

---

## 9. Quick checklist

### First time
- [ ] Hostinger: domain + subdomains + SSL
- [ ] Hostinger MongoDB + connection string
- [ ] `~/battleasia-api/.env` on server
- [ ] `git clone` + first `deploy-battleasia-gg.sh`
- [ ] GitHub secrets: `HOSTINGER_SSH_*`
- [ ] Optional: seed demo data

### Every update
- [ ] Edit in Cursor
- [ ] `git add` → `git commit` → `git push battleasia main`
- [ ] GitHub Actions green ✓
- [ ] Check live URLs

---

## 10. File reference

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-hostinger.yml` | Auto deploy on `main` push |
| `hosting/scripts/deploy-battleasia-gg.sh` | Server: pull, build, sync, restart |
| `hosting/scripts/build-for-hosting.sh` | Linux build (server) |
| `hosting/scripts/build-for-hosting.ps1` | Windows local build |
| `hosting/templates/battleasia.gg/*.htaccess` | Apache rewrite + API proxy |
| `hosting/HOSTINGER-BATTLEASIA-GG.md` | Full first-time Hostinger setup |

---

**Summary:** Cursor এ code change → `git push battleasia main` → GitHub Actions Hostinger এ SSH করে build + sync করে → `battleasia.gg` live update। Secrets একবার set করলে পরে manual FTP upload লাগে না।
