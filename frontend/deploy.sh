#!/bin/bash
set -e

echo "🚀 Deploying Frontend..."

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

# Start service
echo "✅ Starting frontend on port 3001..."
npm start
