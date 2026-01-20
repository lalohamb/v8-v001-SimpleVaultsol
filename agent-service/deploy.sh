#!/bin/bash
set -e

echo "🚀 Deploying Agent Service..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from .env.sample..."
    cp .env.sample .env
    echo "⚠️  Please configure .env before deploying"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Start service
echo "✅ Starting agent service..."
npm start
