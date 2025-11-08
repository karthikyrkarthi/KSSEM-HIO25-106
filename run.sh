#!/bin/bash
# Run both backend and frontend servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/AI-Stress-Detector/backend"
FRONTEND_DIR="$SCRIPT_DIR/AI-Stress-Detector/frontend"

# Kill any existing processes on ports 8000 and 5173
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Run backend in background
cd "$BACKEND_DIR" && python -m uvicorn app:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Run frontend in background - check for npm, then bun, then error
cd "$FRONTEND_DIR"
if command -v npm &> /dev/null; then
    npm run dev &
    FRONTEND_PID=$!
elif command -v bun &> /dev/null; then
    bun run dev &
    FRONTEND_PID=$!
else
    echo "ERROR: Neither npm nor bun found. Please install Node.js or Bun."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "Backend running on http://127.0.0.1:8000 (PID: $BACKEND_PID)"
echo "Frontend running (PID: $FRONTEND_PID)"
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
