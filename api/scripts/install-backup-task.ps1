$ErrorActionPreference = 'Stop'
$taskName = 'BattleAsia Mongo Backup'
$script = Join-Path $PSScriptRoot 'backup-daily.ps1'
if (-not (Test-Path $script)) {
  throw "Missing $script"
}
$tr = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""
schtasks /Create /TN $taskName /SC DAILY /ST 03:15 /RL LIMITED /F /TR $tr | Out-Host
Write-Host "Registered '$taskName' daily at 03:15."
Write-Host "Run now: schtasks /Run /TN `"$taskName`""
Write-Host "Remove:  powershell -File `"$(Join-Path $PSScriptRoot 'uninstall-backup-task.ps1')`""
