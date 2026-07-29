#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$MainDomain = if ($env:MAIN_DOMAIN) { $env:MAIN_DOMAIN } else { 'https://battleasia.gg' }
$ShopDomain = if ($env:SHOP_DOMAIN) { $env:SHOP_DOMAIN } else { 'https://shop.battleasia.gg' }
$AdminDomain = if ($env:ADMIN_DOMAIN) { $env:ADMIN_DOMAIN } else { 'https://admin.battleasia.gg' }

Write-Host "==> BattleAsia build ($MainDomain)" -ForegroundColor Cyan
Write-Host "Root: $Root"

Write-Host "`n==> API..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'api')
npm run build
Pop-Location

Write-Host "`n==> Player FE (battleasia.gg)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia.gg')
$env:VITE_SERVER_URL = ''
$env:VITE_BAC_SHOP_URL = "$ShopDomain/user/shop"
$env:VITE_CDN_URL = ''
npm run build:prod
if ($LASTEXITCODE -ne 0) { npm run build }
Pop-Location

Write-Host "`n==> Shop (shop.battleasia.gg)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'shop.battleasia.gg')
$env:VITE_SERVER_URL = ''
$env:VITE_MAIN_APP_URL = $MainDomain
$env:VITE_BASE_PATH = '/'
$env:VITE_CDN_URL = ''
npm run build
Pop-Location

Write-Host "`n==> Admin (admin.battleasia.gg)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'admin.battleasia.gg')
$env:REACT_APP_API_URL = $MainDomain
npm run build
Pop-Location

$Htaccess = Join-Path $Root 'deploy/htaccess'
Copy-Item (Join-Path $Htaccess 'battleasia.gg.htaccess') (Join-Path $Root 'battleasia.gg/dist/.htaccess') -Force
Copy-Item (Join-Path $Htaccess 'shop.battleasia.gg.htaccess') (Join-Path $Root 'shop.battleasia.gg/dist/.htaccess') -Force
Copy-Item (Join-Path $Htaccess 'admin.battleasia.gg.htaccess') (Join-Path $Root 'admin.battleasia.gg/build/.htaccess') -Force

Write-Host "`nDone. Deploy outputs:" -ForegroundColor Green
Write-Host "  battleasia.gg/dist/"
Write-Host "  shop.battleasia.gg/dist/"
Write-Host "  admin.battleasia.gg/build/"
Write-Host "  api/dist/"
