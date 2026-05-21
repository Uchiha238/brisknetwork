@echo off
title Om Courier System - Startup Console
echo ======================================================================
echo           OM COURIER SYSTEM AUTOMATED STARTUP SCRIPT
echo ======================================================================
echo.
echo [1/2] Verifying and installing dependencies across folders...
echo       This may take a moment on the first run. Please wait...
echo.
call npm run install:all
echo.
echo ======================================================================
echo [2/2] STARTING FRONTEND AND BACKEND SERVICES CONCURRENTLY
echo ======================================================================
echo.
call npm start
pause
