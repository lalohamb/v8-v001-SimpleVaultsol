# Cronos Sentinel AI Vault - Agent Service

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Agent service listening on http://localhost:3000

### Testing
```bash
# Verify setup
npm run verify-e2e

# Run E2E tests (recommended)
npm run test:e2e:run

# Run all tests
npm run test:complete
```

## 📋 Environment Configuration

Create a `.env` file with:

```env
# Required
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
AGENT_PRIVATE_KEY=0x...

# Optional
OPENAI_API_KEY=sk-...              # For AI agents (has fallback)
PORT=3000
FRONTEND_URL=http://localhost:3001
```

## 🧪 Testing

### E2E Tests (19 tests)
Comprehensive end-to-end testing of all agents and features:

```bash
npm run test:e2e:run    # Auto-start server + run tests + generate report
```

**Coverage:**
- ✅ All 5 agents (deterministic + AI)
- ✅ x402 payment gate
- ✅ Blockchain integration
- ✅ Error handling
- ✅ Concurrent execution

### Contract Integration Tests (23 tests)
Real blockchain transaction testing:

```bash
npm run test:contract
```

### API Tests (9 tests)
API endpoint validation:

```bash
npm run test:api
```

### All Tests (51 total)
```bash
npm run test:complete   # Contract + E2E tests
```

## 📊 Test Coverage

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| E2E Tests | 19 | Full stack |
| Contract Tests | 23 | Blockchain |
| API Tests | 9 | Endpoints |
| **Total** | **51** | **~95%** |

## 📚 Documentation

- **[E2E Testing Guide](tests/E2E_TESTING_GUIDE.md)** - Complete testing guide
- **[E2E Quick Reference](E2E_QUICK_REF.md)** - Fast command lookup
- **[Test Architecture](E2E_TEST_ARCHITECTURE.html)** - Visual diagram
- **[Contract Tests](tests/README.md)** - Contract testing docs

## 🤖 Available Agents

1. **Withdrawal Risk Sentinel** (Deterministic)
2. **Emergency Brake** (Deterministic)
3. **Gas Fee Monitor** (Deterministic)
4. **Settlement Batch Optimizer** (Deterministic)
5. **Portfolio Rebalancer AI** (AI-Powered)

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run verify-e2e       # Verify test setup
npm run test:e2e:run     # Run E2E tests (auto-start)
npm run test:e2e         # Run E2E tests (manual)
npm run test:contract    # Run contract tests
npm run test:api         # Run API tests
npm run test:complete    # Run contract + E2E
npm run test             # Run all Jest tests

# Utilities
npm run lint             # Type checking
npm run clean            # Clean build files
```

## ⚠️ Warnings

If you see warnings:
- `OPENAI_API_KEY missing` - AI agent will use fallback logic (expected)
- `SIMPLE_VAULT_ADDRESS missing` - Set in .env file (required)

## 🎯 Success Criteria

All tests should pass with:
- ✅ 100% pass rate
- ✅ All transactions confirmed on-chain
- ✅ Clamp policy enforced (≤25,000 CRO)
- ✅ x402 payment gate working
- ✅ No race conditions

## 🔗 Related Documentation

- [Project Root Documentation](../E2E_TESTING_COMPLETE.md)
- [Agent Implementation Guide](src/01-Readme.md)
- [Individual Agents Guide](src/03-Individual_Agents.md)

---

**Status**: ✅ Production Ready with 95% Test Coverage
