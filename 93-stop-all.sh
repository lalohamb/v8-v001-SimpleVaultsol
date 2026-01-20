#!/bin/bash

echo "🛑 Stopping all services..."

# Kill processes on specific ports
echo "Stopping services on ports 3000, 3001, and 3002..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No service on port 3000"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No service on port 3001"
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No service on port 3002"

echo "✅ All services stopped"
