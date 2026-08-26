@echo off
title Animos
cd /d "%~dp0"

echo.
echo   Animos — motion template studio
echo   --------------------------------
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo   Node.js is not installed.
    echo   Opening https://nodejs.org — install the LTS version, then
    echo   double-click START.bat again.
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
    echo   First launch: installing packages. This takes 1-2 minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   npm install failed. Check your internet and try again.
        pause
        exit /b 1
    )
    echo.
)

echo   Opening http://localhost:8080
echo   Leave this window open. Press Ctrl+C to quit.
echo.
timeout /t 2 /nobreak >nul
start "" http://localhost:8080
node "node_modules\vite\bin\vite.js" dev --host 0.0.0.0 --port 8080
echo.
pause
