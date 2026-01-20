# 🧪 Automated Testing - Quick Reference

## 🚀 Quick Start

### Run All Tests (Comprehensive)
```bash
./test-all.sh
```
**Duration**: ~3-4 minutes  
**Coverage**: All tests including contract integration and API tests

### Run Quick Tests (Fast)
```bash
./test-quick.sh
```
**Duration**: ~30-45 seconds  
**Coverage**: Type checking and build tests only

## 📋 Available Test Commands

### Root Level
| Command | Description | Duration |
|---------|-------------|----------|
| `./test-all.sh` | Run all automated tests | ~225s |
| `./test-quick.sh` | Run quick tests (type check + build) | ~45s |

### Agent Service
| Command | Description | Duration |
|---------|-------------|----------|
| `cd agent-service && npm run lint` | TypeScript type check | ~5s |
| `cd agent-service && npm test` | Jest tests (23 tests) | ~150s |
| `cd agent-service && npm run test:api` | API endpoint tests (9 tests) | ~30s |
| `cd agent-service && npm run test:all` | All agent service tests | ~185s |
| `cd agent-service && npm run test:full` | All tests + build | ~195s |

### Frontend
| Command | Description | Duration |
|---------|-------------|----------|
| `cd frontend && npm run type-check` | TypeScript type check | ~10s |
| `cd frontend && npm run build` | Production build | ~30s |
| `cd frontend && npm run test:all` | All frontend tests | ~40s |

## ✅ What Gets Tested

### Agent Service (32 tests)
- ✅ **23 Jest Tests** - Contract integration
  - Connection & configuration
  - Read/write operations
  - Error handling
  - Gas usage
  - Real-world scenarios

- ✅ **9 API Tests** - Endpoint testing
  - Health check
  - Agent listing
  - Agent application
  - Payment verification
  - Settlement execution
  - x402 payment gate

- ✅ **TypeScript** - Type safety

### Frontend (2 tests)
- ✅ **TypeScript** - Type checking
- ✅ **Build** - Production build

## 📊 Test Results Example

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

✓ Agent Service Jest Tests PASSED

╔═══════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                           ║
╚═══════════════════════════════════════════════════════════╝

Total Tests: 5
Passed: 5
Total Duration: 225s

╔═══════════════════════════════════════════════════════════╗
║          ALL TESTS COMPLETED SUCCESSFULLY! 🎉            ║
╚═══════════════════════════════════════════════════════════╝
```

## 📚 Documentation

- **TESTING.md** - Complete testing guide with detailed instructions
- **TEST_AUTOMATION_SUMMARY.md** - Overview of automated testing infrastructure
- **README_TESTING.md** - This quick reference guide

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installed
```bash
cd agent-service && npm install
cd frontend && npm install
```

### Tests Failing
1. Check environment variables in `.env` files
2. Ensure agent wallet has sufficient balance
3. Verify network connectivity to Cronos Testnet
4. Run `npm install` in both directories

## 🎯 CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Run Tests
  run: ./test-all.sh
```

## 📈 Test Coverage

- **Contract Integration**: 100% (23/23 tests)
- **API Endpoints**: 100% (9/9 tests)
- **TypeScript**: 100% (all files)
- **Build Process**: 100% (all components)

## 🤖 Tested Agents

1. Settlement Batch Optimizer (Deterministic)
2. Withdrawal Risk Sentinel (Deterministic)
3. Emergency Brake (Deterministic)
4. Gas Fee Monitor (Deterministic)
5. Portfolio Rebalancer AI (AI-Capable)

---

**Last Updated**: 2026-01-18  
**Version**: 3.0.1  
**Status**: ✅ All tests passing
