@echo off
:: ถ้ายังไม่มีสิทธิ์ Admin จะเปิดตัวเองใหม่แบบ Run as Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo กำลังขอสิทธิ์ Administrator...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)
:: รันสคริปต์ที่ตั้งค่า registry และ restart service
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0config-windows-exporter.ps1"
pause
