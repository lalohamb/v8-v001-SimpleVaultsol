#!/bin/bash

PORT=3001

# Function to check if port is in use
is_port_in_use() {
    netstat -tuln 2>/dev/null | grep -q ":$1 " || ss -tuln 2>/dev/null | grep -q ":$1 "
    return $?
}

# Find available port
while is_port_in_use $PORT; do
    echo "Port $PORT is in use, trying port $((PORT + 1))..."
    PORT=$((PORT + 1))
    if [ $PORT -gt 3010 ]; then
        echo "Error: No available ports found between 3001-3010"
        exit 1
    fi
done

echo "✓ Found available port: $PORT"
echo "Starting Next.js dev server..."
cd "$(dirname "$0")" && npx next dev -p $PORT
