@echo off
title Buseng Kain Tayo! - Phone Server
cd /d "%~dp0"
echo.
echo  ================================================
echo     BUSENG KAIN TAYO!  -  Laruin sa Phone
echo  ================================================
echo.
echo  1. Ikonekta ang phone sa PAREHONG Wi-Fi ng computer.
echo  2. Buksan ang Chrome / Safari sa phone at i-type:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=* delims= " %%b in ("%%a") do echo        http://%%b:8000
)
echo.
echo  3. Kung may lumabas na Windows Firewall, pindutin ang "Allow".
echo  4. Huwag isara ang window na ito habang naglalaro.
echo     (Pindutin ang Ctrl+C para itigil.)
echo.
python -m http.server 8000 --bind 0.0.0.0
pause
