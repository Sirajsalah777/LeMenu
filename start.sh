#!/bin/bash
cd backend && python -m uvicorn main:app --reload --port 8000 &
cd frontend && npm run dev &
cd admin && npm run dev -- --port 5174 &
wait
