# nixbazar.com — Single Domain Setup (No Subdomains)

Everything runs on **one domain**: https://nixbazar.com

| App | URL path |
|-----|----------|
| Player site | `/` |
| BAC Coin Shop | `/store/user/shop` |
| Admin panel | `/admin/` |
| API | `/api/` (Node.js + proxy) |

## Step 1 — Build

```powershell
powershell -ExecutionPolicy Bypass -File hosting/scripts/build-for-nixbazar.ps1
```

Output:
- `hosting/domains/nixbazar.com/` → upload to **public_html**
- `hosting/api/` → Node.js backend

## Step 2 — Upload to Webuzo/cPanel

1. Delete default `public_html/index.html` (Softaculous placeholder)
2. Zip `hosting/domains/nixbazar.com/` contents
3. Upload & extract to `public_html/`
4. Confirm `.htaccess` is present (show hidden files)

## Step 3 — API (Node.js)

1. Upload `hosting/api/` to e.g. `/home/user/battleasia-api/`
2. Copy `.env.nixbazar.example` → `.env` and fill MongoDB + secrets
3. SSH: `npm install --omit=dev && node dist/index.js`
4. Enable API proxy — uncomment proxy lines in `.htaccess` OR set Webuzo reverse proxy `/api` → `127.0.0.1:5050`

Test: `https://nixbazar.com/api/health`

## Step 4 — MongoDB Atlas

1. Create cluster at https://cloud.mongodb.com
2. Allow server IP `161.248.189.80`
3. Put connection string in API `.env` as `MONGODB_URI`

## URLs after deploy

- Home: https://nixbazar.com/
- Shop sign-in: https://nixbazar.com/store/auth/sign-in
- Admin: https://nixbazar.com/admin/
- API health: https://nixbazar.com/api/health

## No subdomains needed

Shop and admin are **folders** on the same domain — not `shop.nixbazar.com` or `admin.nixbazar.com`.

## Rebuild after code changes

```powershell
npm run build:nixbazar
```

Then re-upload `hosting/domains/nixbazar.com/` to public_html.
