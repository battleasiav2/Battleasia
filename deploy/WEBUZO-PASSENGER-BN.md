# BattleAsia — Webuzo + Passenger (কম RAM) Setup (বাংলা)

PM2-র বদলে **Phusion Passenger** দিয়ে Node API চালালে RAM সাশ্রয় হয়:

| | PM2 (default) | Passenger (recommended) |
|--|---------------|-------------------------|
| Process manager | আলাদা PM2 daemon + Node | Apache/LiteSpeed-এর সাথে integrated |
| Idle RAM | Node সবসময় চালু (~150–400 MB) | `MaxPoolSize 1` + idle timeout → কম idle usage |
| Extra daemon | PM2 ~30–50 MB | নেই (web server manage করে) |
| Deploy restart | `pm2 restart` | `passenger-config restart-app` |

**MongoDB Atlas** + **6 GB RAM** + Passenger = ভালো production combo।

Related: `deploy/WEBUZO-SINGLE-DOMAIN-BN.md` (static site + paths)

---

## Architecture (Passenger)

```
Browser
   │
   ▼
Apache/LiteSpeed  (/home/nixbazar/battleasia.gg)
   ├── /              → static React files
   ├── /store/        → static
   ├── /admin/        → static
   ├── /api/*         → Passenger → Node (/home/nixbazar/api)
   ├── /uploads/*     → Passenger (same app)
   └── /socket.io/*   → Passenger WebSocket (see notes below)

MongoDB Atlas (cloud) — VPS RAM-এ DB নেই
```

---

## RAM tuning (Passenger)

Apache vhost বা `.htaccess`-এ (mod_passenger loaded থাকলে):

```apache
PassengerMaxPoolSize 1
PassengerPoolIdleTime 300
PassengerAppEnv production
```

| Setting | Meaning |
|---------|---------|
| `MaxPoolSize 1` | একসাথে max 1 Node worker — সবচেয়ে কম RAM |
| `PoolIdleTime 300` | ৫ মিনিট traffic না থাকলে worker idle/shrink |
| `AppEnv production` | production mode |

> Traffic বেশি হলে `MaxPoolSize 2` করুন — তবু PM2 cluster-এর চেয়ে lean।

**আনুমানik RAM (6 GB VPS, Atlas MongoDB):**

| Component | RAM |
|-----------|-----|
| Webuzo + Apache | ~300–500 MB |
| Passenger Node (1 worker) | ~120–350 MB |
| Static site | ~minimal |
| Deploy build (short spike) | ~2–3 GB |
| **Runtime total** | **~1–1.5 GB** typical |

---

## Prerequisites

- Webuzo VPS, domain root: **`/home/nixbazar/battleasia.gg`**
- Git repo: **`/home/nixbazar/Battleasia`**
- API: **`/home/nixbazar/api`** + `.env` (Atlas `MONGODB_URI`)
- **Passenger** installed (Webuzo → Software, অথবা SSH):

```bash
# verify
passenger --version
passenger-config --version
which node
node -v   # 18+ recommended
```

Passenger না থাকলে Webuzo support/docs দেখুন, অথবা:

```bash
gem install passenger
passenger-install-apache2-module   # Apache
# OR
passenger-install-nginx-module     # Nginx
```

---

## Step 1 — API `.env`

`/home/nixbazar/api/.env`:

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/battleasia?retryWrites=true&w=majority
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
JWT_SECRET=64-char-random-secret
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=StrongPassword123!
ADMIN_USERNAME=admin
NODE_ENV=production
PORT=5050
```

---

## Step 2 — PM2 বন্ধ করুন (Passenger use করলে)

```bash
pm2 stop battleasia-api 2>/dev/null || true
pm2 delete battleasia-api 2>/dev/null || true
pm2 save
```

PM2 + Passenger **দুটোই** চালু করবেন না — port/process conflict হবে।

---

## Step 3 — Apache / Webuzo vhost (Passenger)

Webuzo → **Domains → battleasia.gg → Apache Configuration** (custom config)

Example (`deploy/passenger/webuzo-passenger.conf.example` copy করে edit):

```apache
DocumentRoot /home/nixbazar/battleasia.gg

# Static SPA — existing .htaccess rules stay in domain root

# Node API via Passenger (entire app; routes use /api/ prefix internally)
PassengerEnabled on
PassengerAppRoot /home/nixbazar/api
PassengerAppType node
PassengerStartupFile dist/index.js
PassengerNodejs /usr/bin/node
PassengerAppEnv production
PassengerMaxPoolSize 1
PassengerPoolIdleTime 300

# Mount app under /api (Passenger strips prefix for some routes; API has /api/* aliases)
PassengerBaseURI /api
```

**Alternative (sub-URI mapping varies by Webuzo version):**  
যদি `PassengerBaseURI` কাজ না করে, **Standalone Passenger** + `.htaccess` proxy (Step 4B).

API already supports both `/health` and `/api/health` — Passenger/proxy safe।

---

## Step 4A — Deploy script (Passenger, no PM2)

```bash
bash /home/nixbazar/Battleasia/deploy/webuzo-passenger-deploy.sh
```

Cron auto-deploy (Passenger):

```bash
# install once — uses passenger deploy script instead of PM2
REPO_DIR=/home/nixbazar/Battleasia \
DEPLOY_SCRIPT=webuzo-passenger-deploy.sh \
bash /home/nixbazar/Battleasia/deploy/install-webuzo-cron.sh
```

Manual cron line (edit `install-webuzo-cron.sh` or crontab):

```bash
*/5 * * * * DEPLOY_SCRIPT=webuzo-passenger-deploy.sh /bin/bash /home/nixbazar/Battleasia/deploy/webuzo-cron-deploy.sh
```

---

## Step 4B — Passenger Standalone (যদি Apache module না থাকে)

কম RAM standalone:

```bash
cd /home/nixbazar/api
npm install --omit=dev

passenger stop 2>/dev/null || true

passenger start \
  --daemonize \
  --port 5050 \
  --environment production \
  --max-pool-size 1 \
  --pool-idle-time 300
```

Domain `.htaccess`-এ proxy (LiteSpeed `[P]`):

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/api/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]
```

Restart after deploy:

```bash
passenger stop && passenger start --daemonize --port 5050 --max-pool-size 1 --pool-idle-time 300
```

---

## Step 5 — Static site `.htaccess`

Domain root `/home/nixbazar/battleasia.gg/.htaccess` — SPA rules (player/store/admin)।

Passenger Apache module use করলে **API proxy lines comment** রাখতে পারেন (Passenger handle করবে)।

Standalone mode হলে proxy lines **uncomment** করুন।

Template: `deploy/htaccess/single-domain.htaccess`

---

## Step 6 — First deploy + seed

```bash
cd /home/nixbazar
git clone https://github.com/battleasiav2/Battleasia.git   # if needed
bash /home/nixbazar/Battleasia/deploy/webuzo-passenger-deploy.sh
bash /home/nixbazar/Battleasia/deploy/seed-all.sh            # optional demo data
```

---

## Step 7 — Verify

```bash
passenger-status
curl -s https://battleasia.gg/api/health
curl -sI https://battleasia.gg/
curl -sI https://battleasia.gg/store/
curl -sI https://battleasia.gg/admin/
```

Expected `/api/health`:

```json
{"status":"ok","checks":{"database":"ok",...}}
```

---

## Socket.io (real-time)

Passenger + Apache WebSocket support version-dependant।

| Symptom | Fix |
|---------|-----|
| Balance/notifications not live | Enable WebSocket in Apache/LiteSpeed |
| Still fails | Client falls back to polling (socket.io default) |
| Heavy socket load | Consider `MaxPoolSize 2` or dedicated PM2 only for sockets |

---

## Deploy flow (Passenger)

```
PC: git push → GitHub
         ↓ (cron max 5 min)
webuzo-cron-deploy.sh
         ↓
webuzo-passenger-deploy.sh
  • git pull + build
  • rsync → battleasia.gg + api
  • npm install (api)
  • passenger-config restart-app (NOT pm2)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 502 / blank API | `passenger-status`; check `/home/nixbazar/api/.env` |
| MongoDB fail | Atlas IP whitelist + `/battleasia` in URI |
| PM2 + Passenger conflict | `pm2 delete battleasia-api` |
| High RAM | `MaxPoolSize 1`, `PoolIdleTime 300`, Atlas not local |
| After git pull API old | `bash deploy/webuzo-passenger-deploy.sh` |
| Permission | `chown -R nixbazar:nixbazar /home/nixbazar/api /home/nixbazar/battleasia.gg` |

**Logs:**

```bash
passenger-status
tail -f /var/log/apache2/error.log    # path may vary on Webuzo
tail -f ~/logs/battleasia-deploy.log
```

---

## Security

- `.env` never in Git
- Rotate exposed MongoDB/GitHub passwords
- Atlas: server IP only (not `0.0.0.0/0` in production)
- SSL force HTTPS on Webuzo

---

## Quick reference

| Item | Path |
|------|------|
| Live site | `/home/nixbazar/battleasia.gg` |
| Git repo | `/home/nixbazar/Battleasia` |
| API + `.env` | `/home/nixbazar/api` |
| Passenger deploy | `deploy/webuzo-passenger-deploy.sh` |
| Apache example | `deploy/passenger/webuzo-passenger.conf.example` |
| Full Webuzo guide | `deploy/WEBUZO-SINGLE-DOMAIN-BN.md` |
