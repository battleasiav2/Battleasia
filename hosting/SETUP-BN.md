# BattleAsia — হোস্টিং সেটআপ গাইড (বাংলা)

GitHub: https://github.com/sumon626000/battleasiafibal

## প্রজেক্টে কী আছে

| অ্যাপ | পোর্ট (লোকাল) | ডোমেইন (প্রোডাকশন) |
|------|----------------|---------------------|
| Player FE | 8081 | battleasia.net |
| Shop | 8082 | shop.battleasia.net |
| Admin | 3001 | admin.battleasia.net |
| API | 5050 | /api/ (nginx proxy) |

## ধাপ ১ — বিল্ড করুন

প্রজেক্ট রুটে:

```powershell
powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-hosting.ps1
```

বিল্ড শেষে এই ফোল্ডারগুলোতে ফাইল চলে যাবে:
- `hosting/domains/battleasia.net/` — মেইন সাইট
- `hosting/domains/shop.battleasia.net/` — শপ
- `hosting/domains/admin.battleasia.net/` — অ্যাডমিন
- `hosting/api/` — API ব্যাকএন্ড

## ধাপ ২ — cPanel File Manager দিয়ে আপলোড

### মেইন সাইট (battleasia.net)
1. `hosting/domains/battleasia.net/` ফোল্ডারের **সব ফাইল** zip করুন
2. cPanel → File Manager → `public_html` এ zip আপলোড করুন
3. Extract করুন
4. `.htaccess` ফাইল আছে কিনা দেখুন (Hidden files চালু করুন)

### Shop সাবডোমেইন
1. cPanel → Subdomains → `shop` তৈরি করুন
2. `hosting/domains/shop.battleasia.net/` এর ফাইল shop document root এ আপলোড করুন

### Admin সাবডোমেইন
1. Subdomain `admin` তৈরি করুন
2. `hosting/domains/admin.battleasia.net/` এর ফাইল admin document root এ আপলোড করুন

## ধাপ ৩ — API সেটআপ

### অপশন A: VPS + Docker (সবচেয়ে ভালো)
```bash
git clone https://github.com/sumon626000/battleasiafibal.git
cd battleasiafibal
cp .env.production.example .env.production
# .env.production এ MongoDB URI, JWT_SECRET, পাসওয়ার্ড দিন
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
বিস্তারিত: `deploy/README.md`

### অপশন B: Shared hosting Node.js
1. `hosting/api/` ফোল্ডার সার্ভারে আপলোড করুন
2. `.env` ফাইলে MongoDB Atlas URI দিন
3. SSH/Terminal: `npm install --omit=dev`
4. Start: `node dist/index.js`

## ধাপ ৪ — MongoDB Atlas

1. https://cloud.mongodb.com এ ফ্রি ক্লাস্টার তৈরি করুন
2. Database User + Network Access (সার্ভার IP) সেট করুন
3. Connection string `.env.production` এ `MONGODB_URI` হিসেবে দিন

## ধাপ ৫ — Environment (.env.production)

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/battleasia
JWT_SECRET=64-char-random-string
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=StrongPassword123!
CORS_ORIGINS=https://battleasia.net,https://shop.battleasia.net,https://admin.battleasia.net
VITE_BAC_SHOP_URL=https://shop.battleasia.net/user/shop
```

`.env.production.example` ফাইলে সব ভেরিয়েবলের তালিকা আছে।

## ধাপ ৬ — DNS

| Record | Type | Value |
|--------|------|-------|
| @ | A | VPS IP |
| www | A | VPS IP |
| shop | A | VPS IP |
| admin | A | VPS IP |

## লোকাল ডেভ (টেস্ট)

```powershell
npm run install:all
npm run dev
```

- Player: http://localhost:8081
- Shop: http://localhost:8082
- Admin: http://localhost:3001
- API: http://localhost:5050

## সাহায্য

- Docker deploy: `deploy/README.md`
- Hosting folder: `hosting/README.md`
- SSL: `deploy/init-ssl.sh`
