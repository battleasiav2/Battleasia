# nixbazar.com — Upload Checklist

## Files ready in `hosting/upload/`

| Zip | Upload to |
|-----|-----------|
| `nixbazar-public_html.zip` | **`/home/nixbazar/public_html/`** → Extract |
| `nixbazar-api.zip` | **`/home/nixbazar/battleasia-api/`** → Extract |

## After upload — public_html

1. Delete old Softaculous default `index.html` if still there
2. Extract zip so you have:
   - `index.html`, `assets/`, `store/`, `admin/`, `.htaccess`
3. File permissions: folders `755`, files `644`

## After upload — API

1. Copy `.env.example` → `.env`
2. Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`
3. SSH terminal:
   ```bash
   cd /home/nixbazar/battleasia-api
   npm install --omit=dev
   node dist/index.js
   ```
4. Test: `curl http://127.0.0.1:5050/health`

## Enable /api/ on domain

In **`/home/nixbazar/public_html/.htaccess`** uncomment these lines:
```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]
```

Or use Webuzo Node.js + reverse proxy for `/api` → port `5050`.

## Live URLs

- https://nixbazar.com/
- https://nixbazar.com/store/auth/sign-in
- https://nixbazar.com/admin/
- https://nixbazar.com/api/health

## MongoDB Atlas

- Allow server IP: `161.248.189.80`
- Connection string → `MONGODB_URI` in API `.env`
