@echo off
REM Ralph Blog Loop - Windows Startup Script
REM This script runs the blog generation loop continuously
REM Place this in your Windows Startup folder

TITLE Ralph Blog Loop - Autonomous Blog Publisher

echo ================================================
echo   Ralph Blog Loop - Starting...
echo ================================================
echo.
echo Project: autonomousBLOG
echo Interval: Every 4 hours
echo.

REM Get the script directory (handles spaces in paths)
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%"

REM Change to project directory
cd /d "%PROJECT_DIR%"

REM Check if we're running in Git Bash or WSL
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Using Git Bash to run the loop...
    echo.
    
    REM Run the shell script using bash
    bash -c "cd '%PROJECT_DIR%' && bash scripts/ralph-blog-loop.sh run"
) else (
    echo [ERROR] Git Bash not found!
    echo.
    echo This script requires Git Bash to be installed.
    echo Download from: https://git-scm.com/downloads
    echo.
    echo Alternatively, you can run the loop manually using WSL.
    pause
    exit /b 1
)

REM If we reach here, the loop has stopped unexpectedly
echo.
echo ================================================
echo   The blog loop has stopped unexpectedly.
echo ================================================
echo.
echo Restarting in 10 seconds...
timeout /t 10 /nobreak >nul

REM Restart the script
goto :EOF
