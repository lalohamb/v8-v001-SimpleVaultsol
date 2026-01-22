#!/bin/bash

echo "Starting agent-service and frontend for testing..."

# Kill any existing processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start agent-service in background
cd agent-service
npm run dev &
AGENT_PID=$!
echo "Agent service starting on port 3001 (PID: $AGENT_PID)"

# Wait for agent-service to start
sleep 5

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend starting on port 3000 (PID: $FRONTEND_PID)"

echo ""
echo "Services started:"
echo "  Agent Service: http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait and handle Ctrl+C
trap "kill $AGENT_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
