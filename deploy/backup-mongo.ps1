# MongoDB backup script (local Docker mongo or mongodump URI)
# Usage:
#   ./deploy/backup-mongo.ps1
#   ./deploy/backup-mongo.ps1 -Uri "mongodb+srv://user:pass@cluster.mongodb.net/battleasia"

param(
    [string]$Uri = $env:MONGODB_URI,
    [string]$OutDir = "backups"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $OutDir "battleasia-$timestamp"

if (-not $Uri) {
    $Uri = "mongodb://127.0.0.1:27017/battleasia"
}

New-Item -ItemType Directory -Force -Path $target | Out-Null

Write-Host "Backing up to $target ..."

docker run --rm `
  -v "${PWD}/${OutDir}:/backup" `
  mongo:7 `
  mongodump --uri="$Uri" --out="/backup/battleasia-$timestamp"

Write-Host "Backup complete: $target"

# Keep last 7 backups
Get-ChildItem $OutDir -Directory -Filter "battleasia-*" |
  Sort-Object Name -Descending |
  Select-Object -Skip 7 |
  ForEach-Object { Remove-Item $_.FullName -Recurse -Force }

Write-Host "Old backups trimmed (keeping latest 7)."
