#!/bin/bash

# Quick Test Script - Runs essential tests only
# Skips contract tests and long-running tests

set -e

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        CRONOS SENTINEL - QUICK TEST SUITE                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Test 1: Agent Service Type Check
echo -e "${BLUE}━━━ 1. Agent Service Type Check ━━━${NC}"
cd agent-service
npm run lint
echo -e "${GREEN}✓ Type check passed${NC}\n"

# Test 2: Frontend Type Check
echo -e "${BLUE}━━━ 2. Frontend Type Check ━━━${NC}"
cd ../frontend
npm run type-check
echo -e "${GREEN}✓ Type check passed${NC}\n"

# Test 3: Frontend Build
echo -e "${BLUE}━━━ 3. Frontend Build ━━━${NC}"
npm run build
echo -e "${GREEN}✓ Build successful${NC}\n"

cd ..

echo -e "${BOLD}${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║            QUICK TESTS COMPLETED SUCCESSFULLY!            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

echo -e "${YELLOW}Note: Run './test-all.sh' for comprehensive testing including:${NC}"
echo -e "  • Contract integration tests (23 tests)"
echo -e "  • API endpoint tests (9 tests)"
echo -e "  • Full test coverage"

