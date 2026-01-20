#!/bin/bash
set -e

echo "🚀 Deploying Frontend-Main..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please configure .env.local before deploying"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Start service on port 3002
echo "✅ Starting frontend-main on port 3002..."
npm start
