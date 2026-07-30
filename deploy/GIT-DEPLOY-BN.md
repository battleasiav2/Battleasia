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

## ৪. Webuzo — প্রতিবার আপডেট (Git থেকে)

```bash
/home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
```

অথবা cron (৫ মিনিট পর পর):

```bash
*/5 * * * * /home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh >> /home/nixbazar/deploy.log 2>&1
```

---

## ৫. `.htaccess` API proxy

`public_html/.htaccess`-এ uncomment:

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
```

---

## নিরাপত্তা

- `deploy/.github-token.local` কখনো Git-এ commit করবেন না।
- টোকেন চ্যাটে শেয়ার করলে GitHub → Settings → Developer settings → revoke করে নতুন টোকেন নিন।
