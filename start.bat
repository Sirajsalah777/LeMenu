@echo off
setlocal
start cmd /c "cd backend && python -m uvicorn main:app --reload --port 8000"
start cmd /c "cd frontend && npm run dev"
start cmd /c "cd admin && npm run dev"
echo "All 3 services started!"
