# End-to-End Agent Service Testing Guide

## 🎯 Overview

This comprehensive E2E test suite validates the entire agent service stack, including:
- Agent registration and discovery
- Deterministic agent execution
- AI-powered agent execution
- Clamp policy enforcement
- On-chain transaction submission
- x402 payment gate
- Settlement payment system
- Error handling and validation
- Concurrent request handling

## 📋 Prerequisites

### 1. Environment Setup

Ensure your `.env` file is configured:

```env
# Cronos Testnet RPC
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org

# Deployed Contracts
SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
SETTLEMENT_PAYMENT_ADDRESS=0x...

# Agent Configuration
AGENT_PRIVATE_KEY=0x...your_private_key
AGENT_ADDRESS=0x...derived_from_private_key

# API Configuration
PORT=3000
FRONTEND_URL=http://localhost:3001

# Optional: OpenAI for AI agents
OPENAI_API_KEY=sk-...
```

### 2. Dependencies

```bash
npm install
```

### 3. Agent Authorization

Ensure your agent is authorized on the contract:

```bash
cd ../contracts
npx hardhat run scripts/setAgent.ts --network cronosTestnet
```

### 4. Testnet CRO

Get testnet CRO from: https://cronos.org/faucet

## 🚀 Running Tests

### Quick E2E Test (Recommended)

Automatically starts server, runs all tests, generates report:

```bash
npm run test:e2e:run
```

### Manual E2E Test

Start server manually, then run tests:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

### Complete Test Suite

Run all tests (contract integration + E2E):

```bash
npm run test:complete
```

### Individual Test Suites

```bash
# Contract integration tests only
npm run test:contract

# API tests only
npm run test:api

# E2E tests only
npm run test:e2e
```

## 📊 Test Coverage

### 1. Health & Configuration (1 test)
- ✅ Health check endpoint

### 2. Agent Registry (3 tests)
- ✅ List all available agents
- ✅ Verify agent metadata
- ✅ Confirm all expected agents present

### 3. Withdrawal Risk Sentinel Agent (3 tests)
- ✅ Apply agent with valid parameters
- ✅ Enforce clamp policy on large withdrawals
- ✅ Handle small withdrawal amounts

### 4. Emergency Brake Agent (2 tests)
- ✅ Trigger on volatility spike
- ✅ Trigger on suspicious activity

### 5. Gas Fee Monitor Agent (1 test)
- ✅ Analyze gas fees

### 6. Settlement Batch Optimizer (1 test)
- ✅ Optimize settlement batch

### 7. AI Agent - Portfolio Rebalancer (1 test)
- ✅ Apply AI agent decision

### 8. Settlement Payment System (3 tests)
- ✅ Get payment info
- ✅ Verify unpaid job
- ✅ Enforce x402 payment gate

### 9. Error Handling (3 tests)
- ✅ Reject invalid agent ID
- ✅ Reject missing required parameters
- ✅ Reject invalid user address

### 10. Concurrent Agent Execution (1 test)
- ✅ Handle multiple concurrent requests

**Total: 19 comprehensive E2E tests**

## 📈 Expected Output

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        CRONOS SENTINEL AI VAULT - E2E TEST SUITE             ║
║                                                               ║
║        Comprehensive Agent Service Testing                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Starting agent service...
✓ Server ready at http://localhost:3000

Running Jest E2E Tests...

 PASS  tests/e2e-agents.test.ts
  E2E Agent Service Tests
    1. Health & Configuration
      ✓ should respond to health check (123ms)
    2. Agent Registry
      ✓ should list all available agents (234ms)
      ✓ should include required agent metadata (156ms)
      ✓ should have all expected agents (145ms)
    3. Withdrawal Risk Sentinel Agent
      ✓ should apply agent with valid parameters (5432ms)
      ✓ should enforce clamp policy on large withdrawals (6234ms)
      ✓ should handle small withdrawal amounts (4567ms)
    ...

╔═══════════════════════════════════════════════════════════════╗
║                        TEST SUMMARY                           ║
╚═══════════════════════════════════════════════════════════════╝

Overall Results:
  Total Tests:    19
  ✓ Passed:       19
  ✗ Failed:       0
  Pass Rate:      100.0%
  Duration:       120.45s

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ✓ ALL TESTS PASSED SUCCESSFULLY!                ║
║                                                               ║
║           Agent Service is Production Ready                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

## 🔍 Test Details

### Withdrawal Risk Sentinel

Tests the core risk assessment agent:
- Validates transaction submission to blockchain
- Verifies clamp policy enforcement (max 25,000 CRO)
- Confirms event emission
- Checks decision reasoning

### Emergency Brake

Tests emergency risk controls:
- Volatility spike detection
- Suspicious activity detection
- Immediate limit reduction to 0
- Emergency event logging

### Gas Fee Monitor

Tests gas optimization:
- Current gas price analysis
- Historical gas data
- Optimization recommendations

### Settlement Batch Optimizer

Tests settlement optimization:
- Batch transaction analysis
- Cost optimization
- Timing recommendations

### AI Portfolio Rebalancer

Tests AI-powered decision making:
- OpenAI integration (if configured)
- Fallback to deterministic logic
- Portfolio analysis
- Rebalancing recommendations

### Settlement Payment System

Tests x402 payment gate:
- Payment info retrieval
- Payment verification
- 402 status enforcement
- Payment metadata

### Error Handling

Tests robustness:
- Invalid agent ID rejection
- Missing parameter validation
- Invalid address detection
- Proper error messages

### Concurrent Execution

Tests scalability:
- Multiple simultaneous requests
- Nonce management
- Transaction ordering
- No race conditions

## 📄 Test Report

After running tests, a detailed report is generated:

```
tests/E2E_TEST_REPORT.md
```

The report includes:
- Test summary with pass/fail counts
- Individual test results
- Coverage analysis
- Integration point validation
- Recommendations

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Or use different port
PORT=3001 npm run test:e2e:run
```

### Tests Timeout

```bash
# Increase timeout in jest.config.js
testTimeout: 120000  // 2 minutes
```

### Transaction Failures

```bash
# Verify agent is authorized
cd ../contracts
npx hardhat run scripts/setAgent.ts --network cronosTestnet

# Check agent has CRO balance
# Get from: https://cronos.org/faucet
```

### OpenAI Errors (AI Agent)

```bash
# AI agent falls back to deterministic logic if:
# - OPENAI_API_KEY not set
# - API call fails
# - Rate limit exceeded

# This is expected behavior and tests should still pass
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run E2E tests
        env:
          CRONOS_TESTNET_RPC: ${{ secrets.CRONOS_TESTNET_RPC }}
          SIMPLE_VAULT_ADDRESS: ${{ secrets.SIMPLE_VAULT_ADDRESS }}
          AGENT_PRIVATE_KEY: ${{ secrets.AGENT_PRIVATE_KEY }}
        run: npm run test:e2e:run
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: tests/E2E_TEST_REPORT.md
```

## 📊 Performance Benchmarks

Expected performance metrics:

| Test Category | Tests | Avg Duration | Notes |
|--------------|-------|--------------|-------|
| Health & Config | 1 | ~100ms | Fast |
| Agent Registry | 3 | ~200ms | Fast |
| Agent Execution | 7 | ~5-7s each | Blockchain TX |
| Settlement | 3 | ~1-5s | Mixed |
| Error Handling | 3 | ~100ms | Fast |
| Concurrent | 1 | ~15s | 3 parallel TXs |

**Total Expected Duration**: ~90-120 seconds

## 🎯 Success Criteria

All tests must pass with:
- ✅ 100% pass rate
- ✅ All transactions confirmed on-chain
- ✅ Proper event emission
- ✅ Correct clamp policy enforcement
- ✅ Valid error handling
- ✅ No race conditions in concurrent tests

## 📝 Notes

- Tests use **real blockchain transactions** on Cronos Testnet
- Each test waits for transaction confirmation
- Tests are idempotent and can be run multiple times
- Agent wallet needs sufficient CRO for gas fees
- OpenAI API key is optional (AI agent has fallback)

## 🔐 Security

⚠️ **IMPORTANT:**
- Tests run on Cronos **Testnet** only
- Never use mainnet private keys
- Never commit `.env` files
- Use separate test wallets
- Monitor gas usage

## 📚 Related Documentation

- [Contract Integration Tests](./README.md)
- [API Test Suite](./api-test.ts)
- [Agent Service Documentation](../src/01-Readme.md)
- [Individual Agents Guide](../src/03-Individual_Agents.md)

---

**Last Updated**: 2025-01-18  
**Test Framework**: Jest + TypeScript  
**Blockchain**: Cronos Testnet (Chain ID: 338)
