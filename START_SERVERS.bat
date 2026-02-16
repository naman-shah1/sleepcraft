@echo off
REM SleepCraft Development Server Startup Script

echo ========================================
echo  SleepCraft - Start Development Servers
echo ========================================
echo.

REM Get the current directory
cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "app.py" (
    echo ERROR: app.py not found in current directory
    echo Please run this script from the sleepcraft root directory
    pause
    exit /b 1
)

if not exist "nextjs-frontend" (
    echo ERROR: nextjs-frontend directory not found
    echo Please run this script from the sleepcraft root directory
    pause
    exit /b 1
)

echo Starting Flask backend on http://localhost:5000...
echo Starting Next.js frontend on http://localhost:3000...
echo.
echo Both servers will start in separate windows.
echo Close any window to stop the respective server.
echo.

REM Start Flask in one window
start "SleepCraft - Flask Backend (5000)" cmd /k ".\.venv\Scripts\python.exe app.py"

REM Give Flask a moment to start
timeout /t 2 /nobreak

REM Start Next.js in another window
start "SleepCraft - Next.js Frontend (3000)" cmd /k "cd nextjs-frontend && npm run dev"

echo.
echo Both servers should now be running:
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo.
echo Open your browser and visit: http://localhost:3000/auth/login
echo Click "Sign in with Google" to test the OAuth flow!
echo.
pause
