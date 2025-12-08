@echo off
echo ========================================
echo Hospital FormFiller - Backend Server
echo ========================================
echo.

cd backend

echo Checking Python packages...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install flask flask-sqlalchemy firebase-admin flask-cors
)

echo.
echo Starting Flask backend on http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.

python -m src.server
