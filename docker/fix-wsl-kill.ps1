$log = "$env:TEMP\ba-wsl-kill.txt"
"start $(Get-Date -Format o)" | Set-Content $log
taskkill /F /IM wsl.exe 2>&1 | Out-String | Add-Content $log
taskkill /F /IM wslservice.exe 2>&1 | Out-String | Add-Content $log
taskkill /F /IM vmmemWSL.exe 2>&1 | Out-String | Add-Content $log
Start-Sleep -Seconds 3
try {
  Start-Service WSLService -ErrorAction Stop
  "WSLService started" | Add-Content $log
} catch {
  "WSLService: $($_.Exception.Message)" | Add-Content $log
}
Start-Sleep -Seconds 2
$p = Start-Process -FilePath "wsl.exe" -ArgumentList "-l","-v" -PassThru -NoNewWindow -RedirectStandardOutput "$env:TEMP\wsl-list-ok.txt" -RedirectStandardError "$env:TEMP\wsl-list-err.txt"
if (-not $p.WaitForExit(20000)) {
  "wsl -l hung" | Add-Content $log
  Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
} else {
  "wsl -l exit $($p.ExitCode)" | Add-Content $log
  Get-Content "$env:TEMP\wsl-list-ok.txt","$env:TEMP\wsl-list-err.txt" -ErrorAction SilentlyContinue | Add-Content $log
}
"done $(Get-Date -Format o)" | Add-Content $log
