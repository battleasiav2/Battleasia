# BattleAsia — Coolify দিয়ে সাইট Setup (নতুনদের জন্য বাংলা গাইড)

আপনার অবস্থা এখন:
- ✅ Hostinger VPS (৮ GB RAM)
- ✅ Coolify install (`http://YOUR-IP:8000`)
- ✅ Cloudflare DNS: `battleasia.gg`, `shop.battleasia.gg`, `admin.battleasia.gg`
- ✅ Terminal খোলা আছে (`root@srv...`)

এখন শুধু **সাইট চালু** করতে হবে। নিচের ধাপ এক এক করে follow করুন।

---

## শেষে কী পাবেন

| Browser-এ URL | কী দেখাবে |
|---------------|-----------|
| `https://battleasia.gg` | Player site |
| `https://shop.battleasia.gg` | Shop |
| `https://admin.battleasia.gg` | Admin panel |
| `https://battleasia.gg/api/health` | API OK |

**API আলাদা domain নয়** — শুধু `battleasia.gg/api/` folder।  
**MongoDB** আপনার VPS-এই চলবে (Atlas লাগবে না)।

---

# ধাপ ০ — Terminal-এ একবার check (optional)

Coolify → **Servers** → **localhost** → **Terminal**-এ আছেন। এখানে paste করুন:

```bash
free -h
df -h
docker -v
```

RAM ~৮ GB দেখতে পাবেন। তারপর বাম দিকে **Dashboard** বা **Projects**-এ যান।

---

# ধাপ ১ — Project তৈরি করুন

1. বাম মেনু → **Projects**
2. উপরে **+ Add** / **New** চাপুন
3. Name লিখুন: `BattleAsia`
4. **Continue** / **Create**

---

# ধাপ ২ — Environment (production) তৈরি

1. Project `BattleAsia` open করুন
2. Environment থাকলে **production** সিলেক্ট করুন  
   না থাকলে → **+ New Environment** → name: `production`

---

# ধাপ ৩ — GitHub থেকে Resource যোগ করুন

1. Environment-এর ভিতরে **+ New Resource** / **Add New Resource**
2. সিলেক্ট করুন: **Docker Compose**  
   (Public Repository / GitHub — যে অপশন আছে)
3. ফর্ম fill করুন:

| Field | Value |
|-------|-------|
| Repository URL | `https://github.com/battleasiav2/Battleasia` |
| Branch | `main` |
| Docker Compose Location | `/docker-compose.yaml` (Coolify default — leading `/` required) |

4. **Save** চাপুন

> ⚠️ Compose file: **`/docker-compose.yaml`** (শুরুতে `/` থাকতে হবে)  
> `docker-compose.prod.yml` দিবেন **না**।

Private repo হলে আগে: বাম মেনু → **Sources** → GitHub connect → Authorize।

---

# ধাপ ৪ — Environment Variables (সবচেয়ে গুরুত্বপূর্ণ)

Resource open → **Environment Variables** / **Environment** ট্যাব।

নিচের লাইনগুলো **এক এক করে** Add করুন (বা Bulk edit থাকলে সব একসাথে paste):

```env
JWT_SECRET=CHANGE_ME_TO_RANDOM_64_CHARS
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=ApnarStrongPassword123!
ADMIN_USERNAME=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg,https://shop.battleasia.gg,https://admin.battleasia.gg
VITE_SERVER_URL=
VITE_BAC_SHOP_URL=https://shop.battleasia.gg/user/shop
VITE_MAIN_APP_URL=https://battleasia.gg
VITE_BASE_PATH=/
REACT_APP_API_URL=https://battleasia.gg
REACT_APP_BASENAME=
PUBLIC_URL=
```

### JWT_SECRET কীভাবে বানাবেন?

Coolify Terminal-এ:

```bash
openssl rand -hex 32
```

যে লম্বা কোড আসবে সেটা copy করে `JWT_SECRET=`-এর পরে paste করুন।

### MongoDB?

**কিছু লিখতে হবে না।**  
Default: `mongodb://mongo:27017/battleasia` (VPS-এর local Mongo)।

**Save** করুন।

---

# ধাপ ৫ — Deploy (Build) চালান

1. Resource পেজে বড় বাটন **Deploy** চাপুন
2. **১০–২৫ মিনিট** অপেক্ষা করুন (প্রথমবার)
3. **Logs** দেখুন — error না থাকলে শেষে **Running** / green দেখাবে

Build চলাকালে browser বন্ধ করবেন না; Coolify background-এ চলতে পারে।

Fail হলে নিচের **সমস্যা** সেকশন দেখুন।

---

# ধাপ ৬ — Domain যোগ করুন (৩ site + API folder)

Deploy success হলে Resource-এ কয়েকটা service দেখাবে: `fe`, `shop`, `admin`, `api`, `mongo`।

প্রতিটার Domains এভাবে সেট করুন:

### ৬.১ Player (`fe`)

1. Service **fe** খুলুন
2. **Domains** → Add
3. লিখুন: `https://battleasia.gg`
4. Save

### ৬.২ Shop (`shop`)

1. Service **shop**
2. Domain: `https://shop.battleasia.gg`
3. Save

### ৬.৩ Admin (`admin`)

1. Service **admin**
2. Domain: `https://admin.battleasia.gg`
3. Save

### ৬.৪ API (`api`) — folder

1. Service **api**
2. Domain: `https://battleasia.gg/api`
3. Save

যদি Coolify আলাদা করে path নেয়:
- Domain: `battleasia.gg`
- Path: `/api`

### ৬.৫ Uploads (optional কিন্তু ভালো)

`api` service-এ আরও যোগ করুন:
- `https://battleasia.gg/uploads`
- `https://battleasia.gg/socket.io` (chat/live থাকলে)

Domain add করার পর Coolify আবার **Deploy** / SSL generate করতে পারে — অপেক্ষা করুন।

---

# ধাপ ৭ — Cloudflare SSL (গুরুত্বপূর্ণ)

Cloudflare Dashboard → আপনার domain:

1. **SSL/TLS** → mode: **Full (strict)**
2. **Network** → **WebSockets** = ON
3. DNS records-এ orange cloud থাকতে পারে

**SSL fail** হলে:
1. Cloudflare → DNS → cloud আইকন চাপুন → **DNS only** (grey)
2. ৫–১০ মিনিট অপেক্ষা
3. Coolify → Domains → SSL আবার generate
4. HTTPS কাজ করলে cloud আবার **Proxied** (orange) করুন

---

# ধাপ ৮ — Test করুন ✅

Browser-এ এক এক করে খুলুন:

| # | URL | ঠিক আছে মানে |
|---|-----|----------------|
| 1 | `https://battleasia.gg` | Player page দেখা যাচ্ছে |
| 2 | `https://shop.battleasia.gg` | Shop page |
| 3 | `https://admin.battleasia.gg` | Admin login |
| 4 | `https://battleasia.gg/api/health` | JSON / OK text |

Admin login:
- Email: যেটা `ADMIN_EMAIL`-এ দিয়েছেন
- Password: যেটা `ADMIN_PASSWORD`-এ দিয়েছেন

কোনো page 502/blank হলে → Coolify → সেই service → **Logs** দেখুন।

---

# ধাপ ৯ — (পরে) Demo data / APK

### Demo seed (optional)

Terminal-এ API container খুঁজে seed চালাতে পারেন — পরে করলেও চলবে। আগে সাইট live হোক।

### APK

```bash
docker ps | grep api
# তারপর:
mkdir -p /tmp && # APK আপনার PC থেকে scp করে আনুন
# docker cp BattleAsia.apk CONTAINER_ID:/app/uploads/app/
```

Download URL: `https://battleasia.gg/uploads/app/BattleAsia.apk`

---

# সহজ ম্যাপ (মনে রাখার জন্য)

```
আপনি এখন এখানে
        │
        ▼
Coolify Dashboard (:8000)
        │
        ├─ 1. Project: BattleAsia
        ├─ 2. Resource: Docker Compose
        ├─ 3. File: docker-compose.coolify.yml
        ├─ 4. Env: JWT + ADMIN password
        ├─ 5. Deploy (wait)
        ├─ 6. Domains (fe/shop/admin/api)
        └─ 7. Browser test
```

```
Internet
   │
   ├─ battleasia.gg        → fe (player)
   ├─ shop.battleasia.gg   → shop
   ├─ admin.battleasia.gg  → admin
   └─ battleasia.gg/api    → api → mongo (same VPS)
```

---

# সমস্যা হলে (সহজ fix)

### Deploy / Build fail

Terminal-এ swap add করুন:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

তারপর Coolify-তে আবার **Deploy**।

### `JWT_SECRET is required` / `ADMIN_PASSWORD is required`

Env variables save হয়নি — ধাপ ৪ আবার করুন → Redeploy।

### Site খোলে না / DNS error

Cloudflare A record IP = আপনার VPS IP কিনা check করুন।

### API 502

- `api` + `mongo` service Running কিনা
- Logs-এ Mongo connection error আছে কিনা
- Domain `https://battleasia.gg/api` ঠিক `api` service-এ আছে কিনা

### Coolify `http://IP:8000` Not secure

স্বাভাবিক। এটা শুধু আপনার control panel।  
পাবলিক সাইট হবে `https://battleasia.gg`।

---

# এখন ঠিক কী করবেন (১ মিনিট checklist)

1. ☐ Coolify → **Projects** → `BattleAsia` create  
2. ☐ **+ New Resource** → Docker Compose  
3. ☐ Repo: `battleasiav2/Battleasia` + file: `docker-compose.coolify.yml`  
4. ☐ Env: `JWT_SECRET`, `ADMIN_PASSWORD`, `CORS_ORIGINS`…  
5. ☐ **Deploy** → অপেক্ষা  
6. ☐ Domains: fe / shop / admin / api  
7. ☐ Browser-এ ৪টা URL test  

---

**Full file:** `deploy/COOLIFY-BN.md`  
**Compose:** `docker-compose.coolify.yml`

Stuck হলে কোন ধাপে আছেন (১–৮) + screenshot পাঠান।
