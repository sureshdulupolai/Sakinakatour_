Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  SAKINAKA TOUR PLATFORM (OFFICIAL)" -ForegroundColor Green
Write-Host "  Starting FastAPI Backend & Vite React Frontend..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; python -m uvicorn main:app --reload --port 8000"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Frontend running at: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend running at:  http://localhost:8000/docs" -ForegroundColor Green

