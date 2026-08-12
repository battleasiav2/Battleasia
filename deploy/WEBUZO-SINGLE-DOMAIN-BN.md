# BattleAsia — এক ডোমেইন Webuzo Panel Setup (বাংলা)

এই গাইড **Webuzo panel** দিয়ে **একটাই ডোমেইনে** পুরো BattleAsia stack চালানোর জন্য।

| URL | App |
|-----|-----|
| `https://YOUR-DOMAIN/` | Player site |
| `https://YOUR-DOMAIN/store/` | Shop |
| `https://YOUR-DOMAIN/admin/` | Admin |
| `https://YOUR-DOMAIN/api/` | Node API |
| `https://YOUR-DOMAIN/uploads/app/BattleAsia.apk` | APK download |

**GitHub:** [battleasiav2/Battleasia](https://github.com/battleasiav2/Battleasia)

---

## আর্কিটেকচার (single domain)

```
Browser
   │
   ▼
Apache/LiteSpeed (domain root + .htaccess)
   ├── /              → static React (player)
   ├── /store/        → static React (shop)
   ├── /admin/        → static React (admin)
   ├── /api/          → proxy → Node :5050
   ├── /uploads/      → proxy → Node :5050
   └── /socket.io/    → proxy → Node :5050

Node API (PM2 **or** Passenger — see WEBUZO-PASSENGER-BN.md)
   └── MongoDB (Atlas / Webuzo / external)
```

**Subdomain লাগে না** — সব path-based।

---

## প্রয়োজনীয় জিনিস

| Item | Notes |
|------|-------|
| VPS + Webuzo | SSH access |
| Domain | DNS → server IP |
| MongoDB | Atlas বা server MongoDB |
| Node.js 18+ | Webuzo → Software → Node.js |
| PM2 | `npm i -g pm2` |
| Git | repo clone করতে |

**Path convention (Webuzo — সরাসরি domain folder, `public_html` নেই):**

| Path | Meaning |
|------|---------|
| `/home/nixbazar/Battleasia` | Git repo |
| `/home/nixbazar/battleasia.gg` | **Live site** (index.html, store/, admin/) |
| `/home/nixbazar/api` | API + `.env` |
| `/home/nixbazar/logs/battleasia-deploy.log` | Auto deploy log |

> **Hostinger** আলাদা: সেখানে path হয় `~/domains/battleasia.gg/public_html/` — Webuzo-তে `public_html` subfolder **নেই**।

আপনার username `nixbazar` না হলে নিচের commands-এ path বদলান।

---

## ধাপ ১ — Webuzo Panel: Domain

1. **Webuzo → Domains → Add Domain**
   - Domain: `battleasia.gg` (অথবা আপনার domain)
   - Document root: **`/home/nixbazar/battleasia.gg`** (সরাসরি — `public_html` নয়)

2. **DNS** (domain registrar):
   - `A` record → server IP
   - `www` → same IP (optional)

3. **SSL**
   - Webuzo → SSL → Let's Encrypt → domain select → Install
   - Force HTTPS চালু করুন

---

## ধাপ ২ — Webuzo Panel: Node.js + MongoDB

### Node.js

Webuzo → **Software → Node.js** → Install (v18 বা v20)

SSH verify:

```bash
node -v
npm -v
npm install -g pm2
```

### MongoDB

**Option A — MongoDB Atlas (recommended):**

1. [cloud.mongodb.com](https://cloud.mongodb.com) → free cluster
2. Network Access → server IP allow
3. Connection string copy:
   `mongodb+srv://USER:PASS@cluster.mongodb.net/battleasia`

**Option B — Webuzo MongoDB** (যদি panel-এ থাকে):

Webuzo → Databases → MongoDB → create DB + user → URI copy

---

## ধাপ ৩ — Git clone (প্রথমবার)

SSH login:

```bash
cd /home/nixbazar
git clone https://github.com/battleasiav2/Battleasia.git
cd Battleasia
chmod +x deploy/*.sh
```

---

## ধাপ ৪ — API `.env` (একবার)

```bash
mkdir -p /home/nixbazar/api
cp /home/nixbazar/Battleasia/api/.env.example /home/nixbazar/api/.env
nano /home/nixbazar/api/.env
```

**Minimum production `.env`:**

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/battleasia
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
JWT_SECRET=your-64-char-random-secret-here
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_USERNAME=admin
NODE_ENV=production
PORT=5050
```

> `.env` কখনো Git-এ commit করবেন না।

---

## ধাপ ৫ — প্রথম deploy

```bash
bash /home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
```

এটা করবে:

1. `git pull`
2. সব app build (`deploy/build.sh`)
3. `/home/nixbazar/battleasia.gg`-এ sync
4. `~/api`-তে API sync + `npm install`
5. PM2 restart
6. প্রথমবার demo MongoDB seed (optional marker)

**Success check:**

```bash
curl -s http://127.0.0.1:5050/health
curl -sI https://battleasia.gg/
curl -sI https://battleasia.gg/store/
curl -sI https://battleasia.gg/admin/
```

---

## ধাপ ৬ — `.htaccess` API proxy

`/home/nixbazar/battleasia.gg/.htaccess`-এ **uncomment** করুন (LiteSpeed/Apache proxy support লাগে):

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]
```

Test: `https://battleasia.gg/api/health` → JSON, 404 নয়

### Proxy কাজ না করলে (Webuzo alternative)

Webuzo → **Domains → battleasia.gg → Reverse Proxy** (যদি menu থাকে):

| Path | Target |
|------|--------|
| `/api` | `http://127.0.0.1:5050` |
| `/uploads` | `http://127.0.0.1:5050/uploads` |
| `/socket.io` | `http://127.0.0.1:5050/socket.io` |

---

## ধাপ ৭ — PC থেকে Git push → Live auto update

### Windows (Cursor / PowerShell)

```powershell
cd c:\Users\sumon\Desktop\battleasianew
# Token: deploy\.github-token.local (gitignored, one line PAT)
.\deploy\git-push.ps1
```

### Webuzo auto deploy (cron — প্রতি ৫ মিনিট)

```bash
cd /home/nixbazar/Battleasia
git pull origin main
bash deploy/install-webuzo-cron.sh
```

**Test:**

```bash
bash /home/nixbazar/Battleasia/deploy/webuzo-cron-deploy.sh
tail -30 /home/nixbazar/logs/battleasia-deploy.log
```

**Flow:**

```
PC edit → git push → GitHub
                         ↓ (max 5 min)
              webuzo-cron-deploy.sh
                         ↓
                 battleasia.gg live
```

বিস্তারিত: `deploy/GIT-DEPLOY-BN.md`

---

## ধাপ ৮ — Demo users / seed

**Auto:** প্রথম deploy-এ seed চলে (marker: `~/.battleasia-demo-seeded`)

**Manual:**

```bash
bash /home/nixbazar/Battleasia/deploy/seed-all.sh
```

| Role | Email | Password |
|------|-------|----------|
| Player | player@battleasia.local | Player@123456 |
| Admin | `.env` `ADMIN_EMAIL` | `.env` `ADMIN_PASSWORD` |

---

## ধাপ ৯ — APK

1. PC-তে build: `battleasia-app` → release APK
2. Server path: `/home/nixbazar/api/uploads/app/BattleAsia.apk`
3. Admin → System → App Download → **enabled**

URL: `https://battleasia.gg/uploads/app/BattleAsia.apk`

> APK Git-এ ignore — deploy script দিয়ে আলাদা copy করুন।

---

## Webuzo Panel — দ্রুত চেকলিস্ট

- [ ] Domain add + SSL
- [ ] Node.js + PM2 installed
- [ ] MongoDB URI ready
- [ ] `~/api/.env` created
- [ ] `git clone` + first `webuzo-git-deploy.sh`
- [ ] `.htaccess` proxy uncommented
- [ ] `/api/health` OK
- [ ] Homepage / store / admin load (not black screen)
- [ ] Cron auto deploy installed (optional)
- [ ] APK uploaded + admin enabled

---

## সমস্যা ও সমাধান

| সমস্যা | সমাধান |
|--------|--------|
| কালো/খালি homepage | `assets/js/` permission 644, folder 755; Hotlink Protection off |
| `/api/health` 404 | `.htaccess` proxy uncomment; PM2 running |
| Login fail | CORS + `APP_URL` check; demo seed run |
| Git push live হয় না | Cron installed? `tail deploy.log` |
| PM2 crash | `pm2 logs battleasia-api`; `.env` MongoDB URI check |
| 403 on JS files | File permissions + Webuzo security rules |

**API logs:**

```bash
pm2 logs battleasia-api
pm2 restart battleasia-api
pm2 save
```

**Manual redeploy:**

```bash
bash /home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
```

---

## Related docs

| File | Purpose |
|------|---------|
| **`deploy/WEBUZO-PASSENGER-BN.md`** | **Passenger — কম RAM API setup** |
| `deploy/GIT-DEPLOY-BN.md` | Git push + cron auto deploy |
| `deploy/WEB-HOSTING-GUIDE-BN.md` | Hostinger ZIP upload (no git) |
| `deploy/HOSTINGER-SETUP.md` | Hostinger English setup |
| `README.md` | Repo overview |

---

## Security

- GitHub token → `deploy/.github-token.local` only (never commit)
- Exposed token → revoke immediately on GitHub
- Strong `JWT_SECRET`, `ADMIN_PASSWORD`
- MongoDB IP whitelist on Atlas
- SSL always on
