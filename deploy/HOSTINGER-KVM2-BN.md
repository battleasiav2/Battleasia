# BattleAsia — Hostinger KVM 2 VPS Full Setup (বাংলা সহজ গাইড)

এই গাইড **শূন্য থেকে** Hostinger **KVM 2 VPS**-এ পুরো BattleAsia stack চালানোর জন্য — step by step, copy-paste friendly।

| URL | App |
|-----|-----|
| `https://battleasia.gg/` | Player site |
| `https://battleasia.gg/store/` | Shop |
| `https://battleasia.gg/admin/` | Admin |
| `https://battleasia.gg/api/` | Node API |
| `https://battleasia.gg/uploads/app/BattleAsia.apk` | APK download |

**GitHub:** [battleasiav2/Battleasia](https://github.com/battleasiav2/Battleasia)

---

## KVM 2 কেন ভালো?

| Item | KVM 2 (আনুমানik) |
|------|------------------|
| RAM | **8 GB** — build + API + Apache সহ চলে |
| CPU | 2 vCPU |
| Disk | ~100 GB NVMe |
| Access | Full root (VPS) |
| MongoDB | **Atlas** (cloud) — VPS RAM বাঁচে |

> Shared hosting-এর চেয়ে VPS-এ Node.js, PM2/Passenger, custom proxy — সব control আপনার হাতে।

---

## পুরো কাজের ধাপ (overview)

```
① Hostinger-এ KVM 2 VPS কিনুন
② Ubuntu 22.04 সিলেক্ট করুন
③ SSH দিয়ে server-এ login
④ Webuzo panel install (optional কিন্তু recommended)
⑤ Domain DNS → VPS IP
⑥ SSL (Let's Encrypt)
⑦ MongoDB Atlas setup
⑧ Git clone + .env + deploy script
⑨ Test + APK upload
⑩ Cron auto deploy (optional)
```

**Webuzo install করলে** পরের detail steps: `deploy/WEBUZO-SINGLE-DOMAIN-BN.md`  
**কম RAM চাইলে Passenger:** `deploy/WEBUZO-PASSENGER-BN.md`  
**Git auto deploy:** `deploy/GIT-DEPLOY-BN.md`

---

## Part A — Hostinger-এ VPS কেনা ও OS

### Step 1: VPS order

1. [hostinger.com](https://www.hostinger.com) → Login → **VPS**
2. Plan: **KVM 2** (বা তার উপরে)
3. Location: audience-এর কাছে (Asia/Singapore ভালো BD users-এর জন্য)
4. OS: **Ubuntu 22.04 LTS** (64-bit)
5. Order complete → hPanel-এ VPS দেখুন

### Step 2: VPS IP ও root password

hPanel → **VPS** → আপনার server:

| Field | কোথায় পাবেন |
|-------|--------------|
| **IP address** | VPS overview (যেমন `123.45.67.89`) |
| **root password** | Setup email / hPanel → Reset root password |

> Password safe রাখুন — chat/email-এ share করবেন না।

### Step 3: (Optional) SSH key add

Windows PowerShell:

```powershell
ssh-keygen -t ed25519 -C "battleasia-vps"
# Public key copy: type $env:USERPROFILE\.ssh\id_ed25519.pub
```

hPanel → VPS → **SSH keys** → public key paste → Save

---

## Part B — SSH দিয়ে server connect

### Windows (PowerShell)

```powershell
ssh root@YOUR_VPS_IP
# প্রথমবার: yes টাইপ → password দিন
```

### Linux / Mac

```bash
ssh root@YOUR_VPS_IP
```

Login হলে prompt দেখবেন: `root@hostname:~#`

### Step 4: Server update (প্রথম login-এ একবার)

```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw
```

### Step 5: Firewall (basic)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 2004/tcp    # Webuzo admin (install করলে)
ufw allow 2005/tcp    # Webuzo end-user panel
ufw --force enable
ufw status
```

---

## Part C — Webuzo Panel install (recommended)

Webuzo = cPanel-এর মতো panel — domain, SSL, Node, Apache এক জায়গায়।

### Step 6: Webuzo install script

```bash
cd /root
wget -N http://files.webuzo.com/install.sh
chmod 755 install.sh
./install.sh
```

Install ১০–২০ মিনিট লাগতে পারে। শেষে screen-এ **Webuzo URL** + **admin user/password** দেখাবে — note করে রাখুন।

### Step 7: Webuzo panel open

Browser-এ:

```
https://YOUR_VPS_IP:2004/
```

Login → panel setup complete করুন।

### Step 8: Webuzo-তে user + domain

1. **Webuzo → Users → Add User** (যেমন username: `nixbazar`)
2. **Domains → Add Domain**
   - Domain: `battleasia.gg`
   - Document root: **`/home/nixbazar/battleasia.gg`**
   - ⚠️ **`public_html` subfolder নয়** — Webuzo-তে সরাসরি domain folder

3. **Software → Node.js** → v18 বা v20 install
4. **SSL → Let's Encrypt** → domain select → Install → Force HTTPS

> Username `nixbazar` না হলে নিচের সব path-এ আপনার username বসান।

---

## Part D — Domain DNS

Domain registrar (Hostinger Domains / Namecheap / etc.):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_VPS_IP` | 300 |
| A | `www` | `YOUR_VPS_IP` | 300 |

DNS propagate ৫ মিনিট–২৪ ঘণ্টা লাগতে পারে। Check:

```bash
ping battleasia.gg
# অথবা
dig +short battleasia.gg
```

---

## Part E — MongoDB Atlas (recommended)

VPS-এ MongoDB চালানোর দরকার নেই — Atlas free tier যথেষ্ট শুরুতে।

### Step 9: Atlas cluster

1. [cloud.mongodb.com](https://cloud.mongodb.com) → Sign up
2. **Create cluster** → M0 Free → region Asia
3. **Database Access** → user create (username + strong password)
4. **Network Access** → **Add IP** → VPS IP (`YOUR_VPS_IP`) → Allow
5. **Connect** → Drivers → connection string copy:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/battleasia?retryWrites=true&w=majority
```

> URI-তে **`/battleasia`** database name থাকতে হবে। Password-এ `@` থাকলে URL-encode করুন।

---

## Part F — BattleAsia deploy (copy-paste)

SSH-এ Webuzo user হিসেবে login (অথবা `su - nixbazar`):

```bash
ssh nixbazar@YOUR_VPS_IP
```

### Step 10: PM2 install

```bash
node -v    # 18+ হতে হবে
npm -v
npm install -g pm2
```

### Step 11: Git clone

```bash
git clone https://github.com/battleasiav2/Battleasia.git ~/Battleasia
mkdir -p ~/api ~/logs
```

Private repo হলে GitHub PAT লাগবে — অথবা public repo clone করুন।

### Step 12: API `.env` তৈরি

```bash
cp ~/Battleasia/.env.production.example ~/api/.env
nano ~/api/.env
```

**অবশ্যই বদলান:**

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/battleasia?retryWrites=true&w=majority
JWT_SECRET=এখানে-৬৪-অক্ষরের-random-string
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=শক্তিশালী-পাসওয়ার্ড
ADMIN_USERNAME=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
NODE_ENV=production
PORT=5050
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

JWT secret generate:

```bash
openssl rand -hex 32
```

### Step 13: Webuzo paths export + first deploy

```bash
export REPO_DIR=/home/nixbazar/Battleasia
export LIVE_MAIN=/home/nixbazar/battleasia.gg
export LIVE_API=/home/nixbazar/api
export MAIN_DOMAIN=https://battleasia.gg

chmod +x ~/Battleasia/deploy/webuzo-git-deploy.sh
~/Battleasia/deploy/webuzo-git-deploy.sh
```

Script করবে:

- `git pull`
- `npm run build` (সব frontend + API)
- static files → `~/battleasia.gg`
- API → `~/api` + `pm2 restart`

প্রথম build **৫–১৫ মিনিট** লাগতে পারে — SSH disconnect করবেন না (অথবা `screen` ব্যবহার করুন)।

### Step 14: Apache proxy (.htaccess)

Build-এ `.htaccess` যায় `battleasia.gg` folder-এ। Verify:

```bash
ls -la ~/battleasia.gg/.htaccess
```

Webuzo Apache-তে **mod_proxy** + **mod_rewrite** enable থাকতে হবে। `/api/` → `localhost:5050` proxy rules `.htaccess`-এ আছে।

API health check:

```bash
curl -s http://127.0.0.1:5050/health
pm2 status
pm2 logs battleasia-api --lines 30
```

### Step 15: Demo data seed (optional, একবার)

```bash
bash ~/Battleasia/deploy/seed-all.sh
```

Demo login: `player@battleasia.local` / `Player@123456`

---

## Part G — Passenger (কম RAM — optional)

8 GB RAM-এ PM2-ও চলে। তবু RAM বাঁচাতে:

```bash
chmod +x ~/Battleasia/deploy/webuzo-passenger-deploy.sh
~/Battleasia/deploy/webuzo-passenger-deploy.sh
```

Full guide: **`deploy/WEBUZO-PASSENGER-BN.md`**

---

## Part H — APK upload

Local PC-তে build করা APK:

```
api/uploads/app/BattleAsia.apk
```

Server-এ copy (Windows PowerShell):

```powershell
scp "C:\Users\sumon\Desktop\battleasianew\api\uploads\app\BattleAsia.apk" nixbazar@YOUR_VPS_IP:~/api/uploads/app/
```

Server-এ folder তৈরি (যদি না থাকে):

```bash
mkdir -p ~/api/uploads/app
# scp পর test:
ls -lh ~/api/uploads/app/BattleAsia.apk
```

Browser test: `https://battleasia.gg/uploads/app/BattleAsia.apk`

---

## Part I — Auto deploy (Git push → server update)

প্রতি ৫ মিনিটে GitHub check:

```bash
chmod +x ~/Battleasia/deploy/install-webuzo-cron.sh
REPO_DIR=~/Battleasia LIVE_MAIN=~/battleasia.gg LIVE_API=~/api \
  ~/Battleasia/deploy/install-webuzo-cron.sh
```

Log দেখুন:

```bash
tail -f ~/logs/battleasia-deploy.log
```

Detail: **`deploy/GIT-DEPLOY-BN.md`**

---

## Test checklist ✅

Browser-এ এক এক করে check করুন:

| # | URL | Expected |
|---|-----|----------|
| 1 | `https://battleasia.gg/` | Player home load |
| 2 | `https://battleasia.gg/store/` | Shop load |
| 3 | `https://battleasia.gg/admin/` | Admin login page |
| 4 | `https://battleasia.gg/api/health` | `{"status":"ok"}` বা similar JSON |
| 5 | Register / Login | API কাজ করছে |
| 6 | APK link | Download শুরু |

SSH quick health:

```bash
pm2 status
curl -sI https://battleasia.gg/api/health
df -h
free -h
```

---

## সমস্যা হলে (troubleshooting)

### SSH connect হয় না

- hPanel → VPS **running** কিনা check
- IP সঠিক কিনা
- `ufw` firewall port 22 open কিনা
- Hostinger firewall (hPanel) → allow SSH

### Site load হয়, API 502/504

```bash
pm2 restart battleasia-api
pm2 logs battleasia-api --lines 50
curl http://127.0.0.1:5050/health
```

`.env`-এ `MONGODB_URI` wrong হলে API crash করে — log-এ `MongoNetworkError` দেখবেন।

### MongoDB Atlas connection fail

- Atlas → Network Access → VPS IP whitelisted?
- URI-তে password special char URL-encoded?
- Database name `/battleasia` আছে?

### Build fail — out of memory

KVM 2 (8 GB) সাধারণত enough। তবু fail হলে:

```bash
export NODE_OPTIONS=--max-old-space-size=4096
~/Battleasia/deploy/webuzo-git-deploy.sh
```

অথবা swap add:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### DNS / SSL issue

- DNS propagate wait (upto 24h)
- Webuzo SSL → re-issue Let's Encrypt
- `www` + non-www both SSL

### `git pull` permission denied

GitHub PAT setup:

```bash
git config --global credential.helper store
cd ~/Battleasia && git pull
# username: your-github-user
# password: GitHub Personal Access Token (not account password)
```

---

## Path summary (Webuzo on KVM 2)

| Path | Role |
|------|------|
| `/home/nixbazar/Battleasia` | Git repo |
| `/home/nixbazar/battleasia.gg` | Live website (document root) |
| `/home/nixbazar/api` | Node API + `.env` |
| `/home/nixbazar/logs/battleasia-deploy.log` | Cron deploy log |

---

## Webuzo ছাড়া nginx + PM2 (advanced)

Webuzo install না করতে চাইলে manually nginx + certbot + PM2 লাগে — path হবে `~/domains/battleasia.gg/public_html/` style।  
English reference: **`deploy/HOSTINGER-SETUP.md`**

নতুন user-দের জন্য **Webuzo + এই গাইড** সবচেয়ে সহজ।

---

## Security reminders 🔒

- `.env`, MongoDB password, JWT secret — **কখনো GitHub/chat-এ paste করবেন না**
- GitHub token leak হলে **revoke** করে নতুন বানান
- `ADMIN_PASSWORD` production-এ strong রাখুন
- Regular: `apt update && apt upgrade`

---

## Related files

| File | Purpose |
|------|---------|
| `deploy/HOSTINGER-KVM2-BN.md` | **এই গাইড** — KVM 2 শূন্য থেকে |
| `deploy/WEBUZO-SINGLE-DOMAIN-BN.md` | Webuzo domain + deploy detail |
| `deploy/WEBUZO-PASSENGER-BN.md` | Passenger (low RAM API) |
| `deploy/GIT-DEPLOY-BN.md` | Git + cron auto deploy |
| `deploy/webuzo-git-deploy.sh` | One-command deploy script |
| `.env.production.example` | Production env template |

---

**Done!** KVM 2 + Webuzo + Atlas + deploy script = production-ready BattleAsia on `battleasia.gg` 🎮
