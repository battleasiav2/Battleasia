#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path $PSScriptRoot -Parent
$Out = Join-Path $Root 'deploy/output/public_html'

Write-Host "==> Assemble single-domain public_html..." -ForegroundColor Yellow

if (Test-Path $Out) {
  Remove-Item $Out -Recurse -Force
}
New-Item -ItemType Directory -Path $Out -Force | Out-Null

Copy-Item -Path (Join-Path $Root 'battleasia.gg/dist/*') -Destination $Out -Recurse -Force

$StoreDir = Join-Path $Out 'store'
New-Item -ItemType Directory -Path $StoreDir -Force | Out-Null
Copy-Item -Path (Join-Path $Root 'shop.battleasia.gg/dist/*') -Destination $StoreDir -Recurse -Force

$AdminDir = Join-Path $Out 'admin'
New-Item -ItemType Directory -Path $AdminDir -Force | Out-Null
Copy-Item -Path (Join-Path $Root 'admin.battleasia.gg/build/*') -Destination $AdminDir -Recurse -Force

Copy-Item -Path (Join-Path $Root 'deploy/htaccess/single-domain.htaccess') -Destination (Join-Path $Out '.htaccess') -Force

Write-Host "Done: deploy/output/public_html/" -ForegroundColor Green
Write-Host "  /         player"
Write-Host "  /store/   shop"
Write-Host "  /admin/   admin"
