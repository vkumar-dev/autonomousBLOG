@echo off
REM Ralph Blog Loop - Visible Startup Script
REM Opens a visible terminal window showing the blog loop running
REM Place this in Windows Startup folder or run manually

setlocal enabledelayedexpansion

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."

REM Check if already running
tasklist /FI "WINDOWTITLE eq Ralph Blog Loop*" 2>nul | find /I "cmd.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo Blog loop is already running!
    echo Window should be visible on your desktop.
    timeout /t 3 /nobreak
    exit /b 0
)

REM Start blog loop in a new visible terminal window
echo Starting Ralph Blog Loop in visible terminal...
echo.

REM Create a wrapper script that will run the bash script and stay open
set "WRAPPER=%TEMP%\ralph-blog-wrapper-%RANDOM%.bat"

(
    echo @echo off
    echo cls
    echo echo ============================================================
    echo echo   Ralph Blog Loop - Autonomous Blog Publisher
    echo echo ============================================================
    echo echo.
    echo echo Starting blog generation loop...
    echo echo Every 4 hours: New article generated, committed and pushed
    echo echo.
    echo echo To stop: Close this window or press Ctrl+C
    echo echo.
    echo echo ============================================================
    echo.
    echo cd /d "%PROJECT_DIR%"
    echo bash scripts/ralph-blog-loop.sh run
    echo.
    echo if errorlevel 1 (
    echo   echo.
    echo   echo Blog loop ended unexpectedly
    echo   echo Check logs: ralph-blog.log
    echo   pause
    echo ^)
) > "%WRAPPER%"

REM Start in new visible window with proper title
start "Ralph Blog Loop - Press Ctrl+C to Stop" /d "%PROJECT_DIR%" cmd /k "%WRAPPER%"

echo.
echo ✅ Blog loop started in new window!
echo    Look for "Ralph Blog Loop" window on your desktop
echo.
timeout /t 2 /nobreak
