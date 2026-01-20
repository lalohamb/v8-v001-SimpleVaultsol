#!/bin/bash
cd /app/agent-service && PORT=3001 node dist/server.js &
cd /app/frontend && next start -p 3000
