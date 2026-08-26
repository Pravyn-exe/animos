@echo off
title Build Animos EXE
cd /d "%~dp0"

echo.
echo   Building Animos.exe (Windows portable app)
echo   This takes a few minutes the first time.
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo   Install Node.js LTS from https://nodejs.org first.
    start https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" call npm install
call npm install --save-dev electron electron-builder
call npm run dist

echo.
echo   Done. Look in the "release" folder for Animos.exe
echo.
if exist "release" explorer release
pause
