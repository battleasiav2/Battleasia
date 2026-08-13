# Deploy scripts (single domain: battleasia.gg)

| File | Purpose |
|------|---------|
| **`PC-GIT-COOLIFY-AUTO-BN.md`** | **PC Auto Save → auto-ship-watch → Coolify (বাংলা)** |
| `ship.ps1` | একবারে commit + push |
| `auto-ship-watch.ps1` | প্রতি ৩ মিনিট অটো Git (window খোলা রাখুন) |
| **`COOLIFY-BN.md`** | **Coolify — নতুনদের জন্য বাংলা step-by-step (৩ domain + local Mongo)** |
| **`HOSTINGER-KVM2-BN.md`** | **Hostinger KVM 2 VPS — শূন্য থেকে full setup (বাংলা)** |
| **`WEBUZO-PASSENGER-BN.md`** | **Passenger (কম RAM) — Webuzo Node API setup** |
| **`WEBUZO-SINGLE-DOMAIN-BN.md`** | **Webuzo panel — এক ডোমেইন full setup (বাংলা)** |
| `GIT-DEPLOY-BN.md` | Git push + Webuzo cron auto deploy |
| `WEB-HOSTING-GUIDE-BN.md` | Hostinger ZIP upload (no git) |
| `build.ps1` / `build.sh` | Build all apps + assemble `deploy/output/public_html/` |
| `assemble-single-domain.ps1` / `.sh` | Merge player + `/store/` + `/admin/` into one folder |
| `deploy.sh` | SSH: git pull, build, rsync, pm2 restart |
| `webuzo-git-deploy.sh` | Webuzo first/manual deploy wrapper (PM2) |
| `webuzo-passenger-deploy.sh` | Webuzo deploy with Passenger (no PM2, lower RAM) |
| `passenger/webuzo-passenger.conf.example` | Apache Passenger vhost snippet |
| `webuzo-cron-deploy.sh` | Cron: pull only if new commits |
| `install-webuzo-cron.sh` | One-time cron install (every 5 min) |
| `git-push.ps1` | Windows push using `deploy/.github-token.local` |
| `htaccess/single-domain.htaccess` | Apache SPA routing for one domain |
| `HOSTINGER-SETUP.md` | Full Hostinger guide (English) |
| `backup-mongo.ps1` / `backup-mongo.sh` | MongoDB backup |

Quick build:

```powershell
npm run build
```

Output: `deploy/output/public_html/` → upload to Hostinger `public_html`
