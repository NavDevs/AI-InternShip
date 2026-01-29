@echo off
echo ============================================
echo    AI Internship Tracker - Starting...
echo ============================================
echo.

echo [1/2] Starting Backend Server (port 5000)...
start "Backend Server" cmd /k "cd /d "%~dp0server" && npm start"

echo [2/2] Starting Frontend (port 5173)...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ============================================
echo    Both servers are starting!
echo ============================================
echo.
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo    Press any key to exit this window...
pause > nul
