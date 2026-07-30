#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$MainDomain = if ($env:MAIN_DOMAIN) { $env:MAIN_DOMAIN.TrimEnd('/') } else { 'https://battleasia.gg' }
$ShopPath = if ($env:SHOP_PATH) { $env:SHOP_PATH } else { '/store' }
$AdminPath = if ($env:ADMIN_PATH) { $env:ADMIN_PATH.TrimEnd('/') } else { '/admin' }

Write-Host '==> BattleAsia build - single domain' -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host "Domain: $MainDomain"

Write-Host ''
Write-Host '==> API...' -ForegroundColor Yellow
Push-Location (Join-Path $Root 'api')
npm run build
Pop-Location

Write-Host ''
Write-Host '==> Player FE (battleasia.gg)...' -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia.gg')
$env:VITE_SERVER_URL = ''
$env:VITE_BAC_SHOP_URL = "$MainDomain$ShopPath/user/shop"
$env:VITE_CDN_URL = ''
$env:SKIP_CHECKER = 'true'
npx vite build
if ($LASTEXITCODE -ne 0) { throw 'Player FE build failed' }
Pop-Location

Write-Host ''
Write-Host '==> Shop (/store)...' -ForegroundColor Yellow
Push-Location (Join-Path $Root 'shop.battleasia.gg')
$env:VITE_SERVER_URL = ''
$env:VITE_MAIN_APP_URL = $MainDomain
$env:VITE_BASE_PATH = "$ShopPath/"
$env:VITE_CDN_URL = ''
npm run build
Pop-Location

Write-Host ''
Write-Host '==> Admin (/admin)...' -ForegroundColor Yellow
Push-Location (Join-Path $Root 'admin.battleasia.gg')
$env:REACT_APP_API_URL = $MainDomain
$env:REACT_APP_BASENAME = $AdminPath
$env:PUBLIC_URL = $AdminPath
$env:DISABLE_ESLINT_PLUGIN = 'true'
$env:CI = 'false'
npm run build
Pop-Location

& (Join-Path $Root 'deploy/assemble-single-domain.ps1')

Write-Host ''
Write-Host 'Done. Deploy output:' -ForegroundColor Green
Write-Host '  deploy/output/public_html/'
Write-Host '  api/dist/'
