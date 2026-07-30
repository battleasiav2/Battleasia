#Requires -Version 5.1
<#
.SYNOPSIS
  Build single-domain BattleAsia and pack for Hostinger FTP upload (with demo DB dump).

.OUTPUTS
  deploy/BattleAsia-hosting-upload.zip
  deploy/hosting-upload/
#>
$ErrorActionPreference = 'Stop'

$Root = Split-Path $PSScriptRoot -Parent
$PackRoot = Join-Path $Root 'deploy/hosting-upload'
$ZipPath = Join-Path $Root 'deploy/BattleAsia-hosting-upload.zip'
$MongoUri = if ($env:MONGODB_URI) { $env:MONGODB_URI } else { 'mongodb://127.0.0.1:27017/battleasia' }

Write-Host "==> BattleAsia Hostinger upload package" -ForegroundColor Cyan
Set-Location $Root

Write-Host "`n==> Production build..." -ForegroundColor Yellow
& (Join-Path $Root 'deploy/build.ps1')

Write-Host "`n==> Prepare package folder..." -ForegroundColor Yellow
if (Test-Path $PackRoot) {
  Remove-Item $PackRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $PackRoot -Force | Out-Null

$PublicHtml = Join-Path $PackRoot 'public_html'
Copy-Item -Path (Join-Path $Root 'deploy/output/public_html') -Destination $PublicHtml -Recurse -Force

$ApiDir = Join-Path $PackRoot 'api'
New-Item -ItemType Directory -Path $ApiDir -Force | Out-Null
Copy-Item -Path (Join-Path $Root 'api/dist') -Destination (Join-Path $ApiDir 'dist') -Recurse -Force
Copy-Item -Path (Join-Path $Root 'api/package.json') -Destination $ApiDir -Force
if (Test-Path (Join-Path $Root 'api/package-lock.json')) {
  Copy-Item -Path (Join-Path $Root 'api/package-lock.json') -Destination $ApiDir -Force
}
Copy-Item -Path (Join-Path $Root 'api/.env.example') -Destination (Join-Path $ApiDir '.env.example') -Force

$UploadsDir = Join-Path $Root 'api/uploads'
if (Test-Path $UploadsDir) {
  Copy-Item -Path $UploadsDir -Destination (Join-Path $ApiDir 'uploads') -Recurse -Force
  Write-Host "Included api/uploads (APK, avatars, etc.)"
}

Write-Host "`n==> Seed demo data (local MongoDB)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'api')
$env:MONGODB_URI = $MongoUri
npm run seed 2>&1 | Write-Host
npm run seed:games 2>&1 | Write-Host
npm run seed:dashboard 2>&1 | Write-Host
npm run seed:feed 2>&1 | Write-Host
npm run seed:social 2>&1 | Write-Host
npm run seed:demo 2>&1 | Write-Host
Pop-Location

Write-Host "`n==> MongoDB demo dump..." -ForegroundColor Yellow
$DumpDir = Join-Path $PackRoot 'database/demo-dump'
New-Item -ItemType Directory -Path $DumpDir -Force | Out-Null

$DumpUri = $MongoUri -replace '127\.0\.0\.1', 'host.docker.internal' -replace 'localhost', 'host.docker.internal'
$DumpOk = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
docker run --rm `
  -v "${DumpDir}:/dump" `
  mongo:7 `
  mongodump --uri="$DumpUri" --out="/dump" 2>&1 | Write-Host
$ErrorActionPreference = $prevEap
if ($LASTEXITCODE -eq 0 -and (Test-Path (Join-Path $DumpDir 'battleasia'))) {
  $DumpOk = $true
}

if (-not $DumpOk) {
  Write-Host "WARNING: Demo DB dump skipped. Run seed on server after upload (see README-UPLOAD-BN.md)." -ForegroundColor Yellow
}

$RestoreSh = @'
#!/usr/bin/env bash
# Restore demo database on Hostinger (run once via SSH after MongoDB is ready)
set -euo pipefail
URI="${MONGODB_URI:?Set MONGODB_URI first}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/database/demo-dump"
DB="$(echo "$URI" | sed -n 's|.*/\([^/?]*\).*|\1|p')"
if [[ -z "$DB" ]]; then DB="battleasia"; fi
mongorestore --uri="$URI" --drop --db="$DB" "$DIR/$DB"
echo "Demo database restored."
'@
Set-Content -Path (Join-Path $PackRoot 'database/restore-demo.sh') -Value $RestoreSh -Encoding UTF8

$ReadmeBn = @'
# BattleAsia — Hostinger Upload Package (Demo সহ)

এক ডোমেইন: **battleasia.gg**

| Path | App |
|------|-----|
| `/` | Player site |
| `/store/` | Shop |
| `/admin/` | Admin |
| `/api/` | API |

---

## ১. public_html আপলোড (FTP / File Manager)

`public_html/` ফোল্ডারের **ভিতরের সব ফাইল** আপলোড করুন:

```
~/domains/battleasia.gg/public_html/
```

---

## ২. API আপলোড

`api/` ফোল্ডারের内容 আপলোড করুন:

```
~/api/
```

`.env.example` কপি করে `.env` বানান এবং MongoDB + JWT সেট করুন:

```env
MONGODB_URI=mongodb://USER:PASS@HOST:27017/battleasia?authSource=admin
APP_URL=https://battleasia.gg
CORS_ORIGINS=https://battleasia.gg,https://www.battleasia.gg
JWT_SECRET=your-64-char-secret
ADMIN_EMAIL=admin@battleasia.gg
ADMIN_PASSWORD=YourStrongPassword
ADMIN_USERNAME=admin
NODE_ENV=production
PORT=5050
```

SSH-তে API চালু:

```bash
cd ~/api
npm install --omit=dev
pm2 start dist/index.js --name battleasia-api
pm2 save
```

---

## ৩. Demo database restore (একবার)

SSH-তে:

```bash
export MONGODB_URI="your-connection-string"
bash database/restore-demo.sh
```

অথবা hPanel MongoDB import দিয়ে `database/demo-dump/battleasia/` import করুন।

---

## ৪. .htaccess API proxy

`public_html/.htaccess`-এ API proxy uncomment করুন (LiteSpeed `[P]` support থাকলে):

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5050/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5050/socket.io/$1 [P,L]
```

---

## Demo login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@battleasia.gg (বা .env ADMIN_EMAIL) | .env ADMIN_PASSWORD |
| Player | player@battleasia.local | Player@123456 |
| Player (alt demo) | nixhyip@gmail.com | Nix@7777 |

---

## URLs

- Player: https://battleasia.gg/
- Shop: https://battleasia.gg/store/
- Admin: https://battleasia.gg/admin/
'@

Set-Content -Path (Join-Path $PackRoot 'README-UPLOAD-BN.md') -Value $ReadmeBn -Encoding UTF8
Copy-Item -Path (Join-Path $Root '.env.production.example') -Destination (Join-Path $PackRoot '.env.production.example') -Force

Write-Host "`n==> Create ZIP..." -ForegroundColor Yellow
if (Test-Path $ZipPath) {
  Remove-Item $ZipPath -Force
}
Compress-Archive -Path (Join-Path $PackRoot '*') -DestinationPath $ZipPath -CompressionLevel Optimal

$ZipSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 1)
Write-Host "`nDone!" -ForegroundColor Green
Write-Host "  Folder: deploy/hosting-upload/"
Write-Host "  ZIP:    deploy/BattleAsia-hosting-upload.zip ($ZipSize MB)"
Write-Host "  Upload public_html/ -> Hostinger public_html"
Write-Host "  Upload api/         -> ~/api/"
Write-Host "  Restore database/   -> demo data (once via SSH)"
