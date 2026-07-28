#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

Write-Host "==> BattleAsia hosting build" -ForegroundColor Cyan
Write-Host "Root: $Root"

$MainDomain = if ($env:MAIN_DOMAIN) { $env:MAIN_DOMAIN } else { 'https://battleasia.gg' }
$ShopDomain = if ($env:SHOP_DOMAIN) { $env:SHOP_DOMAIN } else { 'https://shop.battleasia.gg' }
$AdminDomain = if ($env:ADMIN_DOMAIN) { $env:ADMIN_DOMAIN } else { 'https://admin.battleasia.gg' }

function Get-HostNameFromUrl($Url) {
  try {
    return ([Uri]$Url).Host
  } catch {
    return ($Url -replace '^https?://', '' -replace '/.*$', '')
  }
}

$MainHost = Get-HostNameFromUrl $MainDomain

function Copy-Tree($Source, $Dest, $Exclude = @()) {
  if (-not (Test-Path $Source)) {
    throw "Missing source: $Source"
  }
  if (Test-Path $Dest) {
    Remove-Item $Dest -Recurse -Force
  }
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  Get-ChildItem $Source -Force | Where-Object {
    $name = $_.Name
    -not ($Exclude -contains $name)
  } | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $Dest $_.Name) -Recurse -Force
  }
}

Write-Host "`n==> Building API..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-api')
npm run build
Pop-Location

Write-Host "`n==> Building Player FE..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-fe-main/battleasia-fe-main')
$env:VITE_SERVER_URL = ''
$env:VITE_BAC_SHOP_URL = "$ShopDomain/user/shop"
$env:VITE_CDN_URL = ''
npm run build:prod
if ($LASTEXITCODE -ne 0) { npm run build }
Pop-Location

Write-Host "`n==> Building Shop..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-shop-main/battleasia-shop-main')
$env:VITE_SERVER_URL = ''
$env:VITE_MAIN_APP_URL = $MainDomain
$env:VITE_BASE_PATH = '/'
$env:VITE_CDN_URL = ''
npm run build
Pop-Location

Write-Host "`n==> Building Admin..." -ForegroundColor Yellow
Push-Location (Join-Path $Root 'battleasia-admin-main/battleasia-admin-main')
$env:REACT_APP_API_URL = $MainDomain
npm run build
Pop-Location

$HostingRoot = Join-Path $Root 'hosting'
$DomainsRoot = Join-Path $HostingRoot 'domains'

Write-Host "`n==> Copying to hosting/domains..." -ForegroundColor Yellow

$feDist = Join-Path $Root 'battleasia-fe-main/battleasia-fe-main/dist'
$shopDist = Join-Path $Root 'battleasia-shop-main/battleasia-shop-main/dist'
$adminBuild = Join-Path $Root 'battleasia-admin-main/battleasia-admin-main/build'
$apiRoot = Join-Path $Root 'battleasia-api'

$mainDest = Join-Path $DomainsRoot $MainHost
$shopDest = Join-Path $DomainsRoot ("shop." + $MainHost)
$adminDest = Join-Path $DomainsRoot ("admin." + $MainHost)
$apiDest = Join-Path $HostingRoot 'api'

foreach ($pair in @(
  @{ Src = $feDist; Dest = $mainDest; Keep = @('.htaccess', 'UPLOAD-HERE.txt') },
  @{ Src = $shopDist; Dest = $shopDest; Keep = @('.htaccess', 'UPLOAD-HERE.txt') },
  @{ Src = $adminBuild; Dest = $adminDest; Keep = @('.htaccess', 'UPLOAD-HERE.txt') }
)) {
  $keepFiles = @{}
  foreach ($name in $pair.Keep) {
    $path = Join-Path $pair.Dest $name
    if (Test-Path $path) { $keepFiles[$name] = Get-Content $path -Raw -ErrorAction SilentlyContinue }
  }
  Copy-Tree $pair.Src $pair.Dest
  foreach ($name in $keepFiles.Keys) {
    Set-Content -Path (Join-Path $pair.Dest $name) -Value $keepFiles[$name] -NoNewline
  }
}

Write-Host "`n==> Copying API to hosting/api..." -ForegroundColor Yellow
$apiKeep = @{}
foreach ($name in @('UPLOAD-HERE.txt', 'ecosystem.config.cjs')) {
  $path = Join-Path $apiDest $name
  if (Test-Path $path) { $apiKeep[$name] = Get-Content $path -Raw }
}
Copy-Tree (Join-Path $apiRoot 'dist') (Join-Path $apiDest 'dist')
Copy-Item (Join-Path $apiRoot 'package.json') (Join-Path $apiDest 'package.json') -Force
if (Test-Path (Join-Path $apiRoot 'package-lock.json')) {
  Copy-Item (Join-Path $apiRoot 'package-lock.json') (Join-Path $apiDest 'package-lock.json') -Force
}
foreach ($name in $apiKeep.Keys) {
  Set-Content -Path (Join-Path $apiDest $name) -Value $apiKeep[$name] -NoNewline
}

Copy-Item (Join-Path $Root '.env.production.example') (Join-Path $HostingRoot 'env/.env.production.example') -Force

$htaccessTpl = Join-Path $Root 'hosting/templates/battleasia.gg'
if (Test-Path $htaccessTpl) {
  Copy-Item (Join-Path $htaccessTpl '.htaccess') (Join-Path $mainDest '.htaccess') -Force
  Copy-Item (Join-Path $htaccessTpl 'shop.htaccess') (Join-Path $shopDest '.htaccess') -Force
  Copy-Item (Join-Path $htaccessTpl 'admin.htaccess') (Join-Path $adminDest '.htaccess') -Force
}

Write-Host "`nDone! Upload folders:" -ForegroundColor Green
Write-Host "  $mainDest"
Write-Host "  $shopDest"
Write-Host "  $adminDest"
Write-Host "  $apiDest"
Write-Host "`nSee hosting/SETUP-BN.md for upload steps."
