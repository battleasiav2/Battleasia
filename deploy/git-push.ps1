# Push main to battleasiav2/Battleasia using deploy/.github-token.local (gitignored).
# Usage: .\deploy\git-push.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$TokenFile = Join-Path $Root 'deploy\.github-token.local'
if (-not (Test-Path $TokenFile)) {
    Write-Error "Missing $TokenFile - add your GitHub PAT (one line, no quotes)."
}

$Token = (Get-Content $TokenFile -Raw).Trim()
if (-not $Token) {
    Write-Error "GitHub token file is empty."
}

$Remote = 'https://github.com/battleasiav2/Battleasia.git'
$PushUrl = "https://${Token}@github.com/battleasiav2/Battleasia.git"

Write-Host "Pushing main -> battleasiav2/Battleasia ..."
git push $PushUrl main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done."
