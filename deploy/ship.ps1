# One-shot: save staging → commit → push to GitHub (Coolify auto-deploys from main).
# Usage (Windows PowerShell on your PC):
#   cd c:\Users\sumon\Desktop\battleasianew
#   .\deploy\ship.ps1
#   .\deploy\ship.ps1 -Message "fix shop 502"
param(
    [string]$Message = ""
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Repo: $Root"

git status --short
$dirty = git status --porcelain
if (-not $dirty) {
    Write-Host "No local changes. Pushing main anyway (if ahead)..."
    & "$Root\deploy\git-push.ps1"
    exit $LASTEXITCODE
}

git add -A

# Never stage secrets
git reset HEAD -- deploy/.github-token.local 2>$null
git reset HEAD -- **/.env 2>$null
git reset HEAD -- api/.env 2>$null

if (-not $Message) {
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $Message = "Ship from PC $stamp"
}

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit (maybe only ignored files)."
}

& "$Root\deploy\git-push.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "OK: GitHub main updated."
Write-Host "Coolify should auto-deploy if Git Source = battleasia (GitHub App)."
Write-Host "Check: Coolify → Deployment Logs (expect Webhook + new commit)."
