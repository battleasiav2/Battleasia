# BattleAsia — Web Hosting Guide (বাংলা)

Hostinger-এ **battleasia.gg** single-domain setup। ধাপে ধাপে follow করুন।

---

## Live URL (setup শেষে)

| URL | App |
|-----|-----|
| https://battleasia.gg/ | Player site |
| https://battleasia.gg/store/ | Shop |
| https://battleasia.gg/admin/ | Admin |
| https://battleasia.gg/api/ | API |

---

## ধাপ ১ — ZIP upload

**ফাইল:** `deploy/BattleAsia-hosting-upload.zip` (~193 MB)

Extract করুন → `hosting-upload/` folder পাবেন।

**Hostinger File Manager / FTP:**

| Local | Server path |
|-------|-------------|
| `public_html/` ভিতরের সব ফাইল | `domains/battleasia.gg/public_html/` |
| `api/` folder | `~/api/` |

Verify:
- `public_html/index.html` ✅
- `public_html/assets/js/` (অনেক .js file) ✅
- `public_html/admin/index.html` ✅
- `public_html/store/index.html` ✅

---

## ধাপ ২ — কালো/খালি screen fix (403 error)

Site কালো দেখালে **JS file block** হচ্ছে।

### Permission (File Manager)

| Folder/File | Permission |
|-------------|------------|
| `public_html/assets/` | 755 |
| `assets/js/`, `assets/css/` | 755 |
| সব `.js`, `.css`, `.html` | 644 |

### Hotlink Protection বন্ধ

hPanel → Security → Hotlink Protection → **Disable**

### Test

Browser-এ open:
`https://battleasia.gg/assets/js/` এর কোনো .js file  
→ JavaScript code দেখাতে হবে, 403 নয়।

---

## ধাপ ৩ — MongoDB + Demo data

hPanel → Databases → **MongoDB** → create DB + user

SSH:

```bash
export MONGODB_URI="mongodb://USER:PASS@HOST:27017/battleasia?authSource=admin"
bash database/restore-demo.sh
```

**Demo login:**

| Role | Email | Password |
|------|-------|----------|
| Player | player@battleasia.local | Player@123456 |
| Admin | .env-এ ADMIN_EMAIL | .env-এ ADMIN_PASSWORD |

---

## ধাপ ৪ — API start

`~/api/.env` বানান:

```env
MONGODB_URI=mongodb://...
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
JWT_SECRET=64-char-random-string
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=YourStrongPassword
ADMIN_USERNAME=admin
NODE_ENV=production
PORT=5050
```

SSH:

```bash
cd ~/api
npm install --omit=dev
npm install -g pm2
pm2 start dist/index.js --name battleasia-api
pm2 save
curl http://127.0.0.1:5050/health
```

---

## ধাপ ৫ — `.htaccess` API proxy

`public_html/.htaccess` edit — এই line **uncomment** করুন:

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]
```

Test: https://battleasia.gg/api/health → 404 নয়

---

## ধাপ ৬ — SSL

hPanel → Domains → battleasia.gg → **SSL Enable** (Let's Encrypt)

---

## Final checklist ✅

- [ ] Homepage hero দেখায় (কালো নয়)
- [ ] Sign in form কাজ করে
- [ ] `/store/` shop দেখায়
- [ ] `/admin/` admin login দেখায়
- [ ] `/api/health` JSON return করে
- [ ] Demo player login কাজ করে

---

## সমস্যা ও সমাধান

| সমস্যা | সমাধান |
|--------|--------|
| কালো screen | ধাপ ২ — JS 403 fix |
| API 404 | ধাপ ৪ + ৫ — API + htaccess |
| Login fail | Demo DB restore + CORS check |
| Download button নেই | Admin → App Download → enable |

---

## APK

ZIP-এ আছে: `api/uploads/app/BattleAsia.apk`  
Admin → System → App Download → enable

---

**Full English guide:** `deploy/WEB-HOSTING-GUIDE.md`  
**GitHub:** https://github.com/battleasiav2/Battleasia
