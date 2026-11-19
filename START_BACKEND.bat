@echo off
echo ========================================
echo Starting SpeakUp Backend Server
echo ========================================
echo.

REM Kill any existing Python processes to prevent conflicts
echo Checking for existing Python processes...
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Found existing Python processes. Stopping them...
    taskkill /F /IM python.exe >NUL 2>&1
    timeout /t 2 /nobreak >NUL
    echo All Python processes stopped.
) else (
    echo No existing Python processes found.
)
echo.

cd /d "%~dp0backend"
echo Current directory: %CD%
echo.
echo Checking Python...
python --version
echo.
echo Starting Flask server...
echo Press Ctrl+C to stop
echo.
python app.py
pause
