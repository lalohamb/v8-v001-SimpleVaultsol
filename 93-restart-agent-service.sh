#!/bin/bash
set -e

echo "🔄 Restarting Agent Service..."

# Kill existing agent-service process
pkill -f "node.*agent-service" || echo "No existing agent-service process found"

# Wait a moment
sleep 2

# Start agent-service
cd "$(dirname "$0")/agent-service"
npm start &

echo "✅ Agent service restarted!"
echo "Check logs to verify event listener is running"
