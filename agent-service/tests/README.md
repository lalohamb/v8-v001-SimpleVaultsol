# Contract Integration Tests

## Overview

This test suite performs **real blockchain interactions** with the SimpleVault contract deployed on Cronos Testnet. These are NOT mocked tests - they execute actual transactions and verify on-chain state.

## Prerequisites

### 1. Environment Configuration

Create or verify your `agent-service/.env` file has these values:

```env
# Cronos Testnet RPC
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org

# Deployed SimpleVault contract address
SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a

# Agent private key (must be funded with testnet CRO)
AGENT_PRIVATE_KEY=0x...your_private_key_here
```

### 2. Agent Setup

The agent address (derived from `AGENT_PRIVATE_KEY`) must be configured on the contract:

```bash
# From the contracts directory
cd ../contracts
npx hardhat run scripts/setAgent.ts --network cronosTestnet
```

### 3. Testnet CRO

Ensure your agent wallet has testnet CRO for gas fees:
- Get testnet CRO from: https://cronos.org/faucet
- Minimum recommended: 1 CRO

### 4. Install Dependencies

```bash
npm install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Only Contract Integration Tests
```bash
npm run test:contract
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run with Coverage
```bash
npm run test:coverage
```

## Test Structure

### 1. Contract Connection & Configuration
- ✅ Connects to Cronos Testnet (Chain ID 338)
- ✅ Validates vault address format
- ✅ Checks agent wallet has CRO balance
- ✅ Reads contract owner
- ✅ Verifies configured agent address

### 2. Read Operations
- ✅ Reads user balance from contract
- ✅ Reads recommended withdraw limit
- ✅ Queries multiple user balances

### 3. Write Operations - Agent Set Withdraw Limit
- ✅ Sets withdraw limit as authorized agent
- ✅ Emits AgentRecommendation event
- ✅ Handles multiple consecutive limit updates
- ✅ Sets limit to zero
- ✅ Handles very large limits (1M+ CRO)
- ✅ Handles long reason strings (200+ chars)

### 4. Error Handling & Edge Cases
- ✅ Rejects unauthorized agent attempts
- ✅ Handles setting limits for non-existent users
- ✅ Accepts empty reason strings

### 5. Gas Usage Analysis
- ✅ Measures gas consumption for different scenarios
- ✅ Compares gas usage with varying reason lengths

### 6. Integration with simpleVault.ts Module
- ✅ Tests `getSimpleVaultReadonly()` function
- ✅ Tests `getSimpleVaultWithSigner()` function
- ✅ Tests `getProvider()` function

### 7. Real-World Scenario Tests
- ✅ Simulates complete agent decision workflow
- ✅ Tests rapid consecutive updates
- ✅ Validates state consistency

## Expected Output

```
🔧 Test Configuration:
   Vault Address: 0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
   Agent Address: 0x...
   RPC Endpoint: https://evm-t3.cronos.org

 PASS  tests/contract-integration.test.ts
  SimpleVault Contract Integration Tests
    1. Contract Connection & Configuration
      ✓ should connect to Cronos Testnet (1234ms)
      ✓ should have valid vault address (5ms)
      ✓ should have agent wallet with balance (2345ms)
      ✓ should read contract owner (1567ms)
      ✓ should read configured agent address (1432ms)
    2. Read Operations
      ✓ should read user balance (1876ms)
      ✓ should read recommended withdraw limit (1654ms)
      ✓ should read balances for multiple users (4321ms)
    3. Write Operations - Agent Set Withdraw Limit
      ✓ should set withdraw limit as agent (5432ms)
      ✓ should emit AgentRecommendation event (4567ms)
      ...

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Time:        120.456s
```

## Troubleshooting

### Error: "SIMPLE_VAULT_ADDRESS not set in .env"
- Ensure `.env` file exists in `agent-service/` directory
- Verify `SIMPLE_VAULT_ADDRESS` is set to the deployed contract address

### Error: "AGENT_PRIVATE_KEY not set in .env"
- Add your funded testnet wallet private key to `.env`
- Format: `AGENT_PRIVATE_KEY=0x...`

### Error: "Not agent" (transaction reverts)
- The agent address is not configured on the contract
- Run: `npx hardhat run scripts/setAgent.ts --network cronosTestnet`

### Error: "insufficient funds for gas"
- Your agent wallet needs testnet CRO
- Get CRO from: https://cronos.org/faucet

### Timeout Errors
- Cronos Testnet may be slow during high traffic
- Tests have 60s timeout by default
- Check RPC endpoint is accessible

## Test Data

All tests use the agent's own address as the test user to avoid needing multiple funded wallets. This is safe because:
- Tests only modify `recommendedWithdrawLimit` (advisory only)
- No actual funds are withdrawn
- State can be reset by running tests again

## CI/CD Integration

To run these tests in CI/CD:

1. Store secrets as environment variables:
   - `CRONOS_TESTNET_RPC`
   - `SIMPLE_VAULT_ADDRESS`
   - `AGENT_PRIVATE_KEY`

2. Ensure the CI runner can access Cronos Testnet RPC

3. Run: `npm test`

## Safety Notes

⚠️ **IMPORTANT:**
- These tests execute REAL blockchain transactions
- Gas fees are paid in testnet CRO (no real value)
- NEVER use mainnet private keys
- NEVER commit `.env` files to version control

