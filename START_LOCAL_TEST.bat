@echo off
title CMP Platform v5.0 Cloud Local Test
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js LTS is not installed.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages...
  call npm install
)

echo Starting local cloud-ready app...
start "" "http://127.0.0.1:5173"
call npm run dev
pause
