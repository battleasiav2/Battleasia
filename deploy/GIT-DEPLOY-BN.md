# Git → Webuzo ডিপ্লয় (Battle Asia)

## সংক্ষেপ

| জায়গা | MongoDB | কোড আপডেট |
|--------|---------|-----------|
| **লোকাল (Cursor)** | Docker (`mongodb://127.0.0.1:27017/battleasia`) | এডিট → Git push |
| **ডোমেইন (Webuzo)** | আপনার `MONGODB_URI` (Atlas/Hostinger) | `git pull` + build script |

লোকালে Docker MongoDB; লাইভ সাইটে `.env` / `api/.env`-এ আলাদা `MONGODB_URI` — দুটো মেশাবে না।

---

## ১. PC থেকে Git push (Cursor / PowerShell)

টোকেন একবার `deploy/.github-token.local` ফাইলে রাখুন (Git-এ যাবে না)।

```powershell
cd c:\Users\sumon\Desktop\battleasianew
.\deploy\git-push.ps1
```

---

## ২. Cursor থেকে অটো Git push

প্রজেক্টে `.cursor/hooks/` সেটআপ আছে — Agent কাজ শেষ হলে পরিবর্তন থাকলে commit + push চেষ্টা করে।

Hooks চালু না থাকলে: Cursor Settings → Hooks দেখুন, অথবা Cursor রিস্টার্ট।

---

## ৩. Webuzo সার্ভার — প্রথমবার

```bash
cd /home/nixbazar
git clone https://github.com/battleasiav2/Battleasia.git
cd Battleasia
cp .env.production.example ../api/.env   # MongoDB URL এখানে দিন
# api/.env এ MONGODB_URI = আপনার লাইভ MongoDB
chmod +x deploy/webuzo-git-deploy.sh
```

---

## ৪. Webuzo — ম্যানুয়াল deploy

```bash
/home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
```

---

## ৫. Auto deploy cron (প্রতি ৫ মিনিট — GitHub push হলে auto live)

**Webuzo SSH-তে একবার চালান:**

```bash
cd /home/nixbazar
git clone https://github.com/battleasiav2/Battleasia.git   # না থাকলে
cd Battleasia
git pull origin main
chmod +x deploy/install-webuzo-cron.sh deploy/webuzo-cron-deploy.sh deploy/webuzo-git-deploy.sh
bash deploy/install-webuzo-cron.sh
```

**টেস্ট (এখনই deploy চালাতে):**

```bash
bash /home/nixbazar/Battleasia/deploy/webuzo-cron-deploy.sh
tail -30 /home/nixbazar/logs/battleasia-deploy.log
```

**কী হয়:**

| ধাপ | কাজ |
|-----|-----|
| প্রতি ৫ মিনিট | `git fetch` — GitHub-এ নতুন commit আছে কিনা |
| নতুন commit থাকলে | build + `public_html` sync + API restart |
| না থাকলে | `no new commits` লগ করে exit (হালকা) |
| একসাথে ২টা run | lock file দিয়ে ব্লক |

**Cron দেখতে / বন্ধ করতে:**

```bash
crontab -l
crontab -e    # লাইন মুছলে auto deploy বন্ধ
```

**পুরো flow:**

```
Cursor edit → git push → GitHub
                              ↓ (max 5 min)
                    webuzo-cron-deploy.sh
                              ↓
                    battleasia.gg live
```

---

## ৬. Demo user / seed (MongoDB)

Git deploy **কোড** আপডেট করে; demo user **MongoDB seed** দিয়ে আসে।

**অটো (প্রথম deploy):** `webuzo-git-deploy.sh` চালালে `.battleasia-demo-seeded` marker না থাকলে seed চলে।

**ম্যানুয়াল (যেকোনো সময়):**

```bash
bash /home/nixbazar/Battleasia/deploy/seed-all.sh
# অথবা
bash /home/nixbazar/Battleasia/deploy/webuzo-seed-demo.sh
```

**আবার seed চালাতে (marker মুছে দিন):**

```bash
rm -f /home/nixbazar/.battleasia-demo-seeded
RUN_SEED=1 bash /home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
```

| Role | Email | Password |
|------|-------|----------|
| Admin | `.env` `ADMIN_EMAIL` | `.env` `ADMIN_PASSWORD` |
| Player | player@battleasia.local | Player@123456 |
| Player | nixhyip@gmail.com | Nix@7777 |

---

## ৭. `.htaccess` API proxy

`public_html/.htaccess`-এ uncomment:

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
```

---

## নিরাপত্তা

- `deploy/.github-token.local` কখনো Git-এ commit করবেন না।
- টোকেন চ্যাটে শেয়ার করলে GitHub → Settings → Developer settings → revoke করে নতুন টোকেন নিন।
