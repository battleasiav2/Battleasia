# Build the APK players download: always against the live domain, never a dev machine.
# Usage: .\build-release-apk.ps1 [-ApiUrl https://battleasia.gg] [-SkipPublish]
param(
    [string]$ApiUrl = 'https://battleasia.gg',
    [switch]$SkipPublish
)

$ErrorActionPreference = 'Stop'
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $AppDir
Set-Location $AppDir

$Flutter = (Get-Command flutter -All -ErrorAction SilentlyContinue |
    Where-Object { $_.Source -like '*.bat' } |
    Select-Object -First 1).Source
if (-not $Flutter) {
    $Fallback = 'C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter\bin\flutter.bat'
    if (Test-Path $Fallback) { $Flutter = $Fallback }
}
if (-not $Flutter) {
    throw "flutter.bat not found on PATH. Install the Flutter SDK or add its bin folder to PATH."
}

Write-Host "==> Flutter: $Flutter"
Write-Host "==> API: $ApiUrl"

Copy-Item (Join-Path $AppDir '.env.production') (Join-Path $AppDir '.env') -Force

& $Flutter clean
& $Flutter pub get
# --dart-define wins over the bundled .env, so the URL is pinned twice over.
& $Flutter build apk --release "--dart-define=API_BASE_URL=$ApiUrl" "--dart-define=SITE_URL=$ApiUrl"
if ($LASTEXITCODE -ne 0) { throw "flutter build apk failed" }

$Apk = Join-Path $AppDir 'build\app\outputs\flutter-apk\app-release.apk'
if (-not (Test-Path $Apk)) { throw "Build reported success but $Apk is missing" }

$SizeMb = [math]::Round((Get-Item $Apk).Length / 1MB, 1)
Write-Host "==> Built $Apk ($SizeMb MB)"

if (-not $SkipPublish) {
    $Dest = Join-Path $RepoRoot 'api\uploads\app\BattleAsia.apk'
    New-Item -ItemType Directory -Path (Split-Path $Dest) -Force | Out-Null
    Copy-Item $Apk $Dest -Force
    Write-Host "==> Published to $Dest (served at /uploads/app/BattleAsia.apk)"
    Write-Host "    On the live server, upload it via Admin > System > App Download."
}
