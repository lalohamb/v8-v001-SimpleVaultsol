#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deploying All Services..."
echo "Project root: $PROJECT_ROOT"

# Deploy agent-service
echo ""
echo "═══════════════════════════════════════"
echo "1️⃣  Deploying Agent Service"
echo "═══════════════════════════════════════"
cd "$PROJECT_ROOT/agent-service"
bash deploy.sh &
AGENT_PID=$!

# Wait for agent service to start
sleep 5

# Deploy frontend-cronos-sentinel
echo ""
echo "═══════════════════════════════════════"
echo "2️⃣  Deploying Frontend Cronos Sentinel"
echo "═══════════════════════════════════════"
cd "$PROJECT_ROOT/frontend-cronos-sentinel"
bash deploy.sh &
FRONTEND_PID=$!

# Deploy frontend-main
echo ""
echo "═══════════════════════════════════════"
echo "3️⃣  Deploying Frontend-Main"
echo "═══════════════════════════════════════"
cd "$PROJECT_ROOT/frontend-main"
bash deploy.sh &
FRONTEND_MAIN_PID=$!

echo ""
echo "✅ All services deployed!"
echo ""
echo "Services running:"
echo "  - Agent Service: http://localhost:3000 (PID: $AGENT_PID)"
echo "  - Frontend Cronos Sentinel: http://localhost:3001 (PID: $FRONTEND_PID)"
echo "  - Frontend-Main: http://localhost:3002 (PID: $FRONTEND_MAIN_PID)"
echo ""
echo "To stop all services:"
echo "  kill $AGENT_PID $FRONTEND_PID $FRONTEND_MAIN_PID"
