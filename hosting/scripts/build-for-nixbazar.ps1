#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

$Domain = if ($env:DOMAIN) { $env:DOMAIN } else { 'https://nixbazar.com' }
$Domain = $Domain.TrimEnd('/')

Write-Host "==> Single-domain build for $Domain" -ForegroundColor Cyan

function Copy-Tree($Source, $Dest) {
  if (-not (Test-Path $Source)) { throw "Missing source: $Source" }
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  Get-ChildItem $Source -Force | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $Dest $_.Name) -Recurse -Force
  }
}

Write-Host "`n==> Building API..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-api')
npm run build
Pop-Location

Write-Host "`n==> Building Player FE (root)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-fe-main/battleasia-fe-main')
$env:VITE_SERVER_URL = ''
$env:VITE_BAC_SHOP_URL = "$Domain/store/user/shop"
$env:VITE_CDN_URL = ''
npm run build:prod
if ($LASTEXITCODE -ne 0) { npm run build }
Pop-Location

Write-Host "`n==> Building Shop (/store/)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-shop-main/battleasia-shop-main')
$env:VITE_SERVER_URL = ''
$env:VITE_BASE_PATH = '/store/'
$env:VITE_CDN_URL = ''
npm run build
Pop-Location

Write-Host "`n==> Building Admin (/admin/)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-admin-main/battleasia-admin-main')
$env:PUBLIC_URL = '/admin'
$env:REACT_APP_BASENAME = '/admin'
$env:REACT_APP_API_URL = $Domain
npm run build
Pop-Location

$OutRoot = Join-Path $Root 'hosting/domains/nixbazar.com'
$ApiOut = Join-Path $Root 'hosting/api'

if (Test-Path $OutRoot) { Remove-Item $OutRoot -Recurse -Force }
New-Item -ItemType Directory -Path $OutRoot -Force | Out-Null

Copy-Tree (Join-Path $Root 'battleasia-fe-main/battleasia-fe-main/dist') $OutRoot
Copy-Tree (Join-Path $Root 'battleasia-shop-main/battleasia-shop-main/dist') (Join-Path $OutRoot 'store')
Copy-Tree (Join-Path $Root 'battleasia-admin-main/battleasia-admin-main/build') (Join-Path $OutRoot 'admin')

Copy-Item (Join-Path $Root 'hosting/templates/nixbazar.com/.htaccess') (Join-Path $OutRoot '.htaccess') -Force
Copy-Item (Join-Path $Root 'hosting/templates/nixbazar.com/UPLOAD-HERE.txt') (Join-Path $OutRoot 'UPLOAD-HERE.txt') -Force

if (Test-Path $ApiOut) { Remove-Item $ApiOut -Recurse -Force }
New-Item -ItemType Directory -Path $ApiOut -Force | Out-Null
Copy-Tree (Join-Path $Root 'battleasia-api/dist') (Join-Path $ApiOut 'dist')
Copy-Item (Join-Path $Root 'battleasia-api/package.json') (Join-Path $ApiOut 'package.json') -Force
if (Test-Path (Join-Path $Root 'battleasia-api/package-lock.json')) {
  Copy-Item (Join-Path $Root 'battleasia-api/package-lock.json') (Join-Path $ApiOut 'package-lock.json') -Force
}
Copy-Item (Join-Path $Root 'hosting/api/ecosystem.config.cjs') (Join-Path $ApiOut 'ecosystem.config.cjs') -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $Root '.env.nixbazar.example') (Join-Path $ApiOut '.env.example') -Force

Write-Host "`nDone! Upload:" -ForegroundColor Green
Write-Host "  $OutRoot  ->  public_html/"
Write-Host "  $ApiOut   ->  Node.js app (port 5050, proxy /api/)"
Write-Host "`nURLs on one domain:"
Write-Host "  $Domain/              Player site"
Write-Host "  $Domain/store/        BAC coin shop"
Write-Host "  $Domain/admin/        Admin panel"
Write-Host "  $Domain/api/          API (needs reverse proxy)"
