# Background watcher: every few minutes, if there are changes → commit + push.
# Start ONCE (leave window open). No need to run ship.ps1 each time.
#
#   cd c:\Users\sumon\Desktop\battleasianew
#   .\deploy\auto-ship-watch.ps1
#
# Stop: Ctrl+C in that window.
param(
    [int]$IntervalSeconds = 180,
    [string]$MessagePrefix = "Auto-ship"
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Ship = Join-Path $Root 'deploy\ship.ps1'
if (-not (Test-Path $Ship)) { throw "Missing $Ship" }
if (-not (Test-Path (Join-Path $Root 'deploy\.github-token.local'))) {
    throw "Missing deploy\.github-token.local — add a GitHub PAT first."
}

Write-Host "Auto-ship watch ON"
Write-Host "  Repo: $Root"
Write-Host "  Every: $IntervalSeconds sec (only if files changed)"
Write-Host "  Stop: Ctrl+C"
Write-Host ""

while ($true) {
    $dirty = git status --porcelain
    if ($dirty) {
        $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
        Write-Host "[$stamp] Changes found → ship..."
        try {
            & $Ship -Message "$MessagePrefix $stamp"
        } catch {
            Write-Host "Ship failed: $_"
        }
    } else {
        $stamp = Get-Date -Format 'HH:mm:ss'
        Write-Host "[$stamp] No changes. Waiting..."
    }
    Start-Sleep -Seconds $IntervalSeconds
}
