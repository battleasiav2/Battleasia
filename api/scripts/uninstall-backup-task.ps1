$ErrorActionPreference = 'Stop'
$taskName = 'BattleAsia Mongo Backup'
schtasks /Delete /TN $taskName /F | Out-Host
Write-Host "Removed scheduled task '$taskName'."
