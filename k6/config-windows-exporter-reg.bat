@echo off
reg add "HKLM\SYSTEM\CurrentControlSet\Services\windows_exporter" /v ImagePath /t REG_EXPAND_SZ /d "\"C:\Program Files\windows_exporter\windows_exporter.exe\" --collectors.enabled=cpu,memory,logical_disk,os" /f
if %errorlevel% neq 0 (echo Run as Administrator. & exit /b 1)
echo Config OK. Restarting service...
net stop windows_exporter
net start windows_exporter
echo Done.
