$log = "$env:TEMP\ba-wsl-fix.txt"
"start $(Get-Date -Format o)" | Set-Content $log
try {
  Restart-Service WSLService -Force -ErrorAction Stop
  "WSLService restarted" | Add-Content $log
} catch {
  "WSLService: $($_.Exception.Message)" | Add-Content $log
}
$shut = Start-Process -FilePath "wsl.exe" -ArgumentList "--shutdown" -Wait -PassThru -NoNewWindow
"wsl --shutdown exit $($shut.ExitCode)" | Add-Content $log
Start-Sleep -Seconds 2
try {
  Start-Service com.docker.service -ErrorAction Stop
  "docker service started" | Add-Content $log
} catch {
  "docker service: $($_.Exception.Message)" | Add-Content $log
}
$p = Start-Process -FilePath "wsl.exe" -ArgumentList "-l","-v" -Wait -PassThru -NoNewWindow -RedirectStandardOutput "$env:TEMP\wsl-list-ok.txt" -RedirectStandardError "$env:TEMP\wsl-list-err.txt"
"wsl -l exit $($p.ExitCode)" | Add-Content $log
Get-Content "$env:TEMP\wsl-list-ok.txt","$env:TEMP\wsl-list-err.txt" -ErrorAction SilentlyContinue | Add-Content $log
"done $(Get-Date -Format o)" | Add-Content $log
