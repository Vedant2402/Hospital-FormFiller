@echo off
echo ========================================
echo Hospital FormFiller - Frontend
echo ========================================
echo.

if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)

echo.
echo Starting Vite dev server on http://localhost:5173
echo.
echo Make sure backend is running on http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.

npm run dev
