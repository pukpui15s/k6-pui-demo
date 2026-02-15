# ต้องรันแบบ Run as Administrator (Right-click PowerShell -> Run as administrator)
$newPath = '"C:\Program Files\windows_exporter\windows_exporter.exe" --collectors.enabled=cpu,memory,logical_disk,os'
try {
    $key = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey('SYSTEM\CurrentControlSet\Services\windows_exporter', $true)
    if (-not $key) { Write-Error 'Service windows_exporter not found'; exit 1 }
    $key.SetValue('ImagePath', $newPath, [Microsoft.Win32.RegistryValueKind]::ExpandString)
    $key.Close()
    Write-Host 'Config OK. Restarting service...'
    Restart-Service -Name windows_exporter -Force -ErrorAction Stop
    Write-Host 'Done.'
} catch {
    Write-Error $_.Exception.Message
    Write-Host 'Tip: Run PowerShell as Administrator.'
    exit 1
}
