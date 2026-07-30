# BattleAsia — Web Hosting Guide (battleasia.gg)

Single domain setup. Use this guide on **Hostinger** (hPanel + FTP + SSH).

---

## Live URLs (after setup)

| URL | App |
|-----|-----|
| https://battleasia.gg/ | Player site |
| https://battleasia.gg/store/ | Shop |
| https://battleasia.gg/admin/ | Admin panel |
| https://battleasia.gg/api/ | API |

---

## Part 1 — Upload ZIP

### 1.1 Download / extract

File: `deploy/BattleAsia-hosting-upload.zip` (~193 MB)

Extract on your PC. You will see:

```
hosting-upload/
├── START-HERE.txt
├── README-UPLOAD-BN.md
├── public_html/          ← website files
├── api/                  ← Node.js API
├── database/             ← demo MongoDB dump
└── .env.production.example
```

### 1.2 Upload via FTP / File Manager

**Hostinger hPanel → Files → File Manager**

| Local folder | Upload to |
|--------------|-----------|
| `public_html/*` (inside files) | `domains/battleasia.gg/public_html/` |
| `api/*` | `~/api/` (or `/home/YOUR_USER/api/`) |

**Important:** Upload **contents** of `public_html/`, not the folder itself.

After upload, check these exist:

- `public_html/index.html`
- `public_html/assets/js/` (many .js files)
- `public_html/admin/index.html`
- `public_html/store/index.html`
- `public_html/.htaccess`
- `api/dist/index.js`
- `api/package.json`

---

## Part 2 — Fix blank black screen (403 on JS/CSS)

If the site shows **black/blank page**, JS files are blocked.

### 2.1 File permissions (File Manager)

Select folder → Permissions:

| Path | Permission |
|------|------------|
| `public_html/` | 755 |
| `public_html/assets/` | 755 |
| `public_html/assets/js/` | 755 |
| `public_html/assets/css/` | 755 |
| `public_html/admin/` | 755 |
| `public_html/store/` | 755 |
| All `.js`, `.css`, `.html`, `.webp`, `.png` files | **644** |

Apply recursively to subfolders.

### 2.2 Hotlink protection OFF

hPanel → **Security** → **Hotlink Protection** → **Disable**

(or whitelist `battleasia.gg`)

### 2.3 ModSecurity (if JS still 403)

hPanel → **Advanced** → **ModSecurity** → disable for `battleasia.gg`  
(or contact Hostinger support: "JS/CSS in /assets/ returns 403")

### 2.4 Test in browser

Open directly:

- https://battleasia.gg/assets/js/index-CxFAvb6L.js  
  (filename may differ — check `index.html` for exact name)

Should show **JavaScript code**, not 403.

---

## Part 3 — MongoDB

### 3.1 Create database

hPanel → **Databases** → **MongoDB**

- Create database: `battleasia`
- Create user + password
- Copy connection string

Example:

```
mongodb://USER:PASSWORD@HOST:27017/battleasia?authSource=admin
```

### 3.2 Restore demo data (SSH)

hPanel → **Advanced** → **SSH Access** → enable

```bash
cd ~
# If you uploaded database folder to home:
export MONGODB_URI="mongodb://USER:PASSWORD@HOST:27017/battleasia?authSource=admin"
bash database/restore-demo.sh
```

Or from ZIP extract path on server.

**Demo logins after restore:**

| Role | Email | Password |
|------|-------|----------|
| Player | player@battleasia.local | Player@123456 |
| Player (alt) | nixhyip@gmail.com | Nix@7777 |
| Admin | see `.env` ADMIN_EMAIL | see `.env` ADMIN_PASSWORD |

---

## Part 4 — API (.env + start)

### 4.1 Create `~/api/.env`

```bash
cd ~/api
cp .env.example .env
nano .env
```

Paste (edit values):

```env
MONGODB_URI=mongodb://USER:PASSWORD@HOST:27017/battleasia?authSource=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
JWT_SECRET=replace-with-64-char-random-string-minimum
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_USERNAME=admin
NODE_ENV=production
PORT=5050
```

Generate JWT secret (SSH):

```bash
openssl rand -hex 32
```

### 4.2 Install & start API

```bash
cd ~/api
npm install --omit=dev
```

Install PM2 (once):

```bash
npm install -g pm2
```

Start API:

```bash
pm2 start dist/index.js --name battleasia-api
pm2 save
pm2 startup
```

Test:

```bash
curl http://127.0.0.1:5050/health
```

Should return OK / healthy JSON.

---

## Part 5 — `.htaccess` API proxy

Edit `public_html/.htaccess`

Find these lines and **uncomment** (remove `#`):

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]
```

**Note:** `[P]` proxy needs LiteSpeed proxy support on your Hostinger plan.  
If proxy does not work, ask Hostinger to enable reverse proxy to port 5050, or use VPS.

Test:

- https://battleasia.gg/api/health → should NOT be 404

---

## Part 6 — SSL & DNS

hPanel → **Domains** → battleasia.gg

- Nameservers → Hostinger
- **SSL** → Enable (Let's Encrypt)
- Enable for `www.battleasia.gg` too

---

## Part 7 — Final checklist

| Check | URL / Action | Expected |
|-------|--------------|----------|
| Homepage | https://battleasia.gg/ | Hero + JOIN button visible |
| Sign in | https://battleasia.gg/auth/sign-in | Login form |
| Shop | https://battleasia.gg/store/ | Shop page |
| Admin | https://battleasia.gg/admin/ | Admin login |
| API | https://battleasia.gg/api/health | JSON healthy |
| JS loads | View page source → click .js link | 200, not 403 |
| Login | player@battleasia.local / Player@123456 | Works |

---

## Part 8 — APK download

APK is in: `api/uploads/app/BattleAsia.apk`

Admin panel → **System → App Download** → enable toggle → save.

Homepage shows **Download Now** when enabled.

---

## Troubleshooting

### Black screen
→ Fix Part 2 (403 on `/assets/js/`)

### API 404
→ Part 4 (API running?) + Part 5 (htaccess proxy)

### Login fails
→ Check `CORS_ORIGINS` in `.env` includes `https://battleasia.gg`  
→ Run demo DB restore (Part 3)

### Admin blank
→ Check `public_html/admin/static/js/` permissions 644/755

### CORS error in browser
→ `APP_URL` and `CORS_ORIGINS` must match live domain exactly (https)

---

## Re-deploy (update site)

1. Build new ZIP: `npm run package:hostinger` (on dev PC)
2. Replace `public_html/` files via FTP
3. Replace `api/dist/` via FTP
4. SSH: `pm2 restart battleasia-api`

---

## Support contacts

- **Hostinger support:** hPanel live chat (for 403, proxy, MongoDB)
- **GitHub repo:** https://github.com/battleasiav2/Battleasia

---

*Last updated: July 2026 — single domain battleasia.gg*
