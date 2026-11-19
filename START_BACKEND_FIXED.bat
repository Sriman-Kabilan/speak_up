@echo off
chcp 65001 >nul
echo ========================================
echo Starting SpeakUp Backend Server
echo ========================================
echo.
cd /d "%~dp0backend"
echo Current directory: %CD%
echo.
echo Checking Python...
python --version
echo.
echo Installing/checking dependencies...
pip install -q -r requirements.txt
echo.
echo Starting Flask server...
echo Press Ctrl+C to stop
echo.
set PYTHONIOENCODING=utf-8
python app.py
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Server crashed!
    echo ========================================
    echo.
)
pause
