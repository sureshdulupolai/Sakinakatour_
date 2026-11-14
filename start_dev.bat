@echo off
echo ========================================================
echo   SAKINAKA TOUR PLATFORM (OFFICIAL)
echo   Starting FastAPI Backend & Vite React Frontend...
echo ========================================================

start "Sakinaka Tour Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"
timeout /t 2 >nul
start "Sakinaka Tour React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo.
pause

