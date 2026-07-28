#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

Write-Host "==> Building full Webuzo package..." -ForegroundColor Cyan

# Save existing .env before build wipes api folder
$SavedEnv = $null
$EnvPath = Join-Path $Root 'hosting/api/.env'
if (Test-Path $EnvPath) { $SavedEnv = Get-Content $EnvPath -Raw }

& (Join-Path $Root 'hosting/scripts/build-for-nixbazar.ps1')

# Restore .env + add server scripts
if ($SavedEnv) {
  Set-Content -Path (Join-Path $Root 'hosting/api/.env') -Value $SavedEnv -NoNewline
}

Copy-Item (Join-Path $Root 'hosting/templates/api/install-api.sh') (Join-Path $Root 'hosting/api/install-api.sh') -Force
Copy-Item (Join-Path $Root 'hosting/templates/api/restart-api.sh') (Join-Path $Root 'hosting/api/restart-api.sh') -Force
Copy-Item (Join-Path $Root 'hosting/api/ecosystem.config.cjs') (Join-Path $Root 'hosting/api/ecosystem.config.cjs') -Force -ErrorAction SilentlyContinue

$UploadDir = Join-Path $Root 'hosting/upload'
New-Item -ItemType Directory -Path $UploadDir -Force | Out-Null

$PublicZip = Join-Path $UploadDir 'nixbazar-public_html.zip'
$ApiZip = Join-Path $UploadDir 'nixbazar-api.zip'

if (Test-Path $PublicZip) { Remove-Item $PublicZip -Force }
if (Test-Path $ApiZip) { Remove-Item $ApiZip -Force }

Write-Host "`n==> Creating zips..." -ForegroundColor Yellow
Compress-Archive -Path (Join-Path $Root 'hosting/domains/nixbazar.com/*') -DestinationPath $PublicZip -Force
Compress-Archive -Path (Join-Path $Root 'hosting/api/*') -DestinationPath $ApiZip -Force

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "WEBUZO READY PACKAGES:" -ForegroundColor Green
Get-ChildItem $UploadDir -File | ForEach-Object {
  $mb = [math]::Round($_.Length / 1MB, 1)
  Write-Host "  $($_.Name)  ($mb MB)"
}
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nUpload WEBUZO-README-BN.txt and follow 3 steps only."
