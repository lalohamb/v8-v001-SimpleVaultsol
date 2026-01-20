# 🚀 E2E Testing Quick Reference

## One-Command Testing

```bash
# Verify setup + Run all E2E tests + Generate report
npm run test:e2e:run
```

## Quick Commands

| Command | What It Does |
|---------|--------------|
| `npm run verify-e2e` | Check if ready to test |
| `npm run test:e2e:run` | Run E2E tests (auto-start server) |
| `npm run test:e2e` | Run E2E tests (manual server) |
| `npm run test:complete` | Run contract + E2E tests |
| `npm run test:contract` | Run contract tests only |
| `npm run test:api` | Run API tests only |

## Test Coverage

✅ **19 E2E Tests** covering:
- 5 Agents (deterministic + AI)
- x402 Payment Gate
- Error Handling
- Concurrent Execution
- Blockchain Integration

## Expected Results

```
Total Tests:    19
✓ Passed:       19
✗ Failed:       0
Pass Rate:      100.0%
Duration:       ~120s
```

## Prerequisites

```env
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
AGENT_PRIVATE_KEY=0x...
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server won't start | `lsof -i :3000` then `kill -9 <PID>` |
| Tests timeout | Increase `testTimeout` in jest.config.js |
| TX failures | Run `setAgent.ts` script |
| No CRO | Get from https://cronos.org/faucet |

## Files Created

- `tests/e2e-agents.test.ts` - Main test suite
- `tests/run-e2e.ts` - Automated runner
- `tests/verify-e2e-setup.ts` - Setup checker
- `tests/E2E_TESTING_GUIDE.md` - Full guide
- `tests/E2E_TEST_SUMMARY.md` - Complete summary

## Success Criteria

- ✅ 100% pass rate (19/19)
- ✅ All TXs confirmed on-chain
- ✅ Clamp policy enforced (≤25K CRO)
- ✅ x402 gate working
- ✅ No race conditions

## Quick Start

```bash
cd agent-service
npm run verify-e2e    # Step 1: Verify
npm run test:e2e:run  # Step 2: Test
```

## Report Location

After tests run, check:
```
tests/E2E_TEST_REPORT.md
```

---

**Need Help?** See `tests/E2E_TESTING_GUIDE.md`
