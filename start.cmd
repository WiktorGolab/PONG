@echo off
chcp 65001 >nul 2>&1
setlocal

echo +-------------------------------+
echo.
echo            Serwer PONG
echo.
echo +-------------------------------+
echo.
echo Uruchamianie serwera...

:: Uruchomienie serwera
start "" /b node server.js

pause >nul
