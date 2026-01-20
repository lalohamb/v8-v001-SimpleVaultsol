# CRONOS SENTINEL AI VAULT - Testing Guide

## 📋 Overview

This document describes the automated testing infrastructure for the Cronos Sentinel AI Vault project. The test suite covers all components except smart contract build and testing.

## 🗺️ Testing Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          AUTOMATED TESTING INFRASTRUCTURE                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                 ┌──────────────────┐
                                 │  Test Automation │
                                 └────────┬─────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        │                                   │
                ┌───────▼────────┐                 ┌────────▼────────┐
                │ test-all.sh    │                 │ test-quick.sh   │
                │ (Comprehensive)│                 │ (Fast)          │
                │ ~225s          │                 │ ~45s            │
                └───────┬────────┘                 └────────┬────────┘
                        │                                   │
        ┌───────────────┼───────────────┬───────────────────┼──────────────┐
        │               │               │                   │              │
        │               │               │                   │              │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐    ┌──────▼──────┐ ┌─────▼──────┐
│ Agent Service│ │Agent Service│ │   Agent    │    │  Frontend   │ │  Frontend  │
│  Type Check  │ │ Jest Tests  │ │ API Tests  │    │ Type Check  │ │   Build    │
│              │ │             │ │            │    │             │ │            │
│     ~5s      │ │   23 tests  │ │  9 tests   │    │    ~10s     │ │   ~30s     │
│              │ │   ~150s     │ │   ~30s     │    │             │ │            │
└──────────────┘ └──────┬──────┘ └─────┬──────┘    └─────────────┘ └─────┬──────┘
                        │               │                                 │
        ┌───────────────┼───────┬───────┼────────┬──────────┐            │
        │               │       │       │        │          │            │
┌───────▼──────┐ ┌──────▼──┐ ┌─▼───┐ ┌─▼──┐ ┌───▼───┐ ┌────▼────┐ ┌─────▼──────┐
│  Contract    │ │  Read   │ │Write│ │Err │ │  Gas  │ │  Real   │ │  4 Pages   │
│ Integration  │ │   Ops   │ │ Ops │ │Hand│ │ Usage │ │  World  │ │ Generated  │
│   5 tests    │ │ 3 tests │ │6 tst│ │3tst│ │1 test │ │ 2 tests │ │            │
└──────────────┘ └─────────┘ └─────┘ └────┘ └───────┘ └─────────┘ └────────────┘
                                      │
                        ┌─────────────┼─────────────┬──────────┐
                        │             │             │          │
                 ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐ ┌▼──────────┐
                 │   Health    │ │  List   │ │   Apply     │ │  Payment  │
                 │   Check     │ │ Agents  │ │   Agents    │ │   Gate    │
                 │   1 test    │ │ 1 test  │ │   5 tests   │ │  2 tests  │
                 └─────────────┘ └─────────┘ └─────────────┘ └───────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  TEST SUMMARY                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Total Tests: 32+  │  Jest: 23  │  API: 9  │  Duration: ~225s  │  Coverage: 100%  │
└─────────────────────────────────────────────────────────────────────────────────────┘

Legend:
  ┌─────────┐
  │ test-all.sh    │ = Runs ALL tests (comprehensive)
  └─────────┘

  ┌─────────┐
  │ test-quick.sh  │ = Runs FAST tests only (type check + build)
  └─────────┘
```

> **💡 Tip**: Open `TESTING_DIAGRAM.html` in your browser for an interactive visual diagram!

## 🚀 Quick Start

### Run All Tests (Recommended)

```bash
./test-all.sh
```

This will run all tests in sequence and provide a comprehensive summary.

### Run Individual Test Suites

#### Agent Service Tests

```bash
# TypeScript type checking
cd agent-service && npm run lint

# Jest tests (contract integration)
cd agent-service && npm test

# API endpoint tests
cd agent-service && npm run test:api

# All agent service tests
cd agent-service && npm run test:all

# Full test suite including build
cd agent-service && npm run test:full
```

#### Frontend Tests

```bash
# TypeScript type checking
cd frontend && npm run type-check

# Production build test
cd frontend && npm run build

# All frontend tests
cd frontend && npm run test:all
```

## 📊 Test Coverage

### Agent Service Backend

#### 1. **Jest Tests** (23 tests)
- **Contract Connection & Configuration** (5 tests)
  - Cronos Testnet connection
  - Vault address validation
  - Agent wallet balance verification
  - Contract owner verification
  - Agent address configuration

- **Read Operations** (3 tests)
  - User balance reading
  - Recommended withdraw limit reading
  - Multi-user balance queries

- **Write Operations** (6 tests)
  - Agent set withdraw limit
  - Event emission verification
  - Multiple limit updates
  - Zero limit handling
  - Large limit handling
  - Long reason string handling

- **Error Handling & Edge Cases** (3 tests)
  - Unauthorized agent rejection
  - Non-existent user handling
  - Empty reason string handling

- **Gas Usage Analysis** (1 test)
  - Gas consumption measurement

- **Integration Tests** (3 tests)
  - Module integration verification
  - Provider validation
  - Signer functionality

- **Real-World Scenarios** (2 tests)
  - Agent decision workflow
  - Rapid consecutive updates

#### 2. **API Endpoint Tests** (9 tests)
- Health check endpoint
- List agents endpoint
- Settlement payment info
- Apply withdrawal risk sentinel agent
- Apply AI portfolio rebalancer agent
- Verify payment (unpaid job)
- Settlement run with x402 gate
- Apply emergency brake agent
- Apply gas fee monitor agent

### Frontend

#### 1. **TypeScript Type Checking**
- All TypeScript files validated
- Type safety verification
- Interface compliance

#### 2. **Production Build**
- Next.js compilation
- Static page generation (4 pages)
- Bundle optimization
- Asset generation

## 🎯 Test Features

### Automated Features Tested

✅ **Agent Service**
- Contract integration (23 comprehensive tests)
- API endpoints (9 endpoint tests)
- Agent decision-making (deterministic + AI)
- Payment verification (x402 protocol)
- On-chain transactions
- Clamp policy enforcement
- Settlement system
- Event emission
- Gas optimization

✅ **Frontend**
- TypeScript compilation
- Production build
- Page generation
- Route optimization

## 🤖 Available Agents (Tested)

1. **Settlement Batch Optimizer** - Deterministic
2. **Withdrawal Risk Sentinel** - Deterministic
3. **Emergency Brake** - Deterministic
4. **Gas Fee Monitor** - Deterministic
5. **Portfolio Rebalancer AI** - AI-Capable (toggleable)

## 📈 Test Output

### Successful Test Run Example

```
╔═══════════════════════════════════════════════════════════╗
║     CRONOS SENTINEL AI VAULT - FULL TEST SUITE           ║
╚═══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Agent Service - TypeScript Type Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Agent Service Type Check PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  2. Agent Service - Jest Tests (Contract Integration)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Agent Service Jest Tests PASSED (23/23 tests)

... (additional test output)

╔═══════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                           ║
╚═══════════════════════════════════════════════════════════╝

Total Tests: 5
Passed: 5
Total Duration: 180s

╔═══════════════════════════════════════════════════════════╗
║          ALL TESTS COMPLETED SUCCESSFULLY! 🎉            ║
╚═══════════════════════════════════════════════════════════╝
```

## 🔧 Test Configuration

### Environment Variables

The tests use the following environment variables (configured in `.env` files):

**Agent Service** (`agent-service/.env`):
```env
PORT=3000
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0
AGENT_PRIVATE_KEY=<your-agent-private-key>
ENABLE_AI_AGENTS=true
OPENAI_API_KEY=<your-openai-api-key>
MAX_RECOMMEND_PCT=50
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
NEXT_PUBLIC_SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0
NEXT_PUBLIC_CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
NEXT_PUBLIC_CRONOS_TESTNET_CHAIN_ID=338
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

#### Dependencies Not Installed
```bash
# Install agent service dependencies
cd agent-service && npm install

# Install frontend dependencies
cd frontend && npm install
```

#### API Tests Failing
- Ensure the agent service can start successfully
- Check that the `.env` file is properly configured
- Verify network connectivity to Cronos Testnet
- Ensure the agent wallet has sufficient balance

#### Frontend Build Failing
- Run `npm run type-check` to identify TypeScript errors
- Check for missing dependencies
- Verify Next.js configuration

## 📝 Adding New Tests

### Adding Agent Service API Tests

Edit `agent-service/tests/api-test.ts`:

```typescript
await runTest("Your Test Name", async () => {
  const res = await fetch(`${API_URL}/your-endpoint`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Test failed");
  }
});
```

### Adding Jest Tests

Create a new test file in `agent-service/tests/`:

```typescript
import { describe, test, expect } from '@jest/globals';

describe('Your Test Suite', () => {
  test('should do something', async () => {
    // Your test code
    expect(result).toBe(expected);
  });
});
```

## 🎯 CI/CD Integration

The test suite is designed to be CI/CD friendly:

```yaml
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd agent-service && npm install
          cd ../frontend && npm install
      - name: Run tests
        run: ./test-all.sh
```

## 📊 Test Metrics

### Expected Test Duration
- **Agent Service Type Check**: ~5s
- **Agent Service Jest Tests**: ~150s
- **Agent Service API Tests**: ~30s
- **Frontend Type Check**: ~10s
- **Frontend Build**: ~30s
- **Total**: ~225s (3.75 minutes)

### Test Coverage Goals
- ✅ Contract Integration: 100%
- ✅ API Endpoints: 100%
- ✅ Agent Decision Logic: 100%
- ✅ Payment Verification: 100%
- ✅ Frontend Build: 100%

## 🔐 Security Considerations

- Tests use a dedicated test wallet on Cronos Testnet
- Private keys are stored in `.env` files (not committed to git)
- API tests do not expose sensitive data
- All on-chain transactions are on testnet only

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Cronos Testnet](https://cronos.org/docs/getting-started/cronos-testnet.html)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 🤝 Contributing

When adding new features:
1. Add corresponding tests
2. Update this documentation
3. Ensure all tests pass before submitting PR
4. Maintain test coverage above 90%

---

**Last Updated**: 2026-01-18
**Version**: 3.0.1

