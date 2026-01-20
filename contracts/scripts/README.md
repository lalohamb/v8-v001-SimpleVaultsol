# Scripts Documentation

Deployment and interaction scripts for SimpleVault and SettlementPayment contracts on Cronos.

## Overview

This directory contains TypeScript scripts for deploying and interacting with the smart contracts:

- **SimpleVault**: Core vault contract for deposits/withdrawals with AI agent integration
- **SettlementPayment**: x402 payment protocol for settlement workflows

## Prerequisites

```bash
npm install
npx hardhat compile
```

## Environment Setup

Create a `.env` file in the contracts directory:

```env
PRIVATE_KEY=your_private_key_here
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
SIMPLE_VAULT_ADDRESS=deployed_vault_address
SETTLEMENT_PAYMENT_ADDRESS=deployed_settlement_address
```

## Scripts

### 1. deploy.ts

Deploys SimpleVault contract and makes an initial test deposit.

**Usage:**
```bash
npm run deploy:testnet
# or
hardhat run scripts/deploy.ts --network cronosTestnet
```

**What it does:**
- Deploys SimpleVault contract
- Makes a 0.1 CRO test deposit
- Outputs contract address and transaction hash

**Example Output:**
```
Using signer: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
SimpleVault deployed to: 0x656a4D09f53ab82f6B291082cb3159F7c14424dE
Deposit tx hash: 0x87694f13e8a55191d633dda14d04f08709de57a0e620b84cc7bfc4938e82d429
Deposit confirmed
```

**Post-deployment:**
Add the deployed address to your `.env`:
```env
SIMPLE_VAULT_ADDRESS=0x656a4D09f53ab82f6B291082cb3159F7c14424dE
```

---

### 2. deploy-settlement-payment.ts

Deploys SettlementPayment contract for x402 payment protocol.

**Usage:**
```bash
hardhat run scripts/deploy-settlement-payment.ts --network cronosTestnet
```

**Configuration:**
Edit the script to customize:
```typescript
const RECIPIENT_ADDRESS = deployer.address; // Payment recipient
const SETTLEMENT_FEE = ethers.parseEther("1.0"); // Fee per settlement
```

**What it does:**
- Deploys SettlementPayment contract
- Sets recipient address and settlement fee
- Displays contract configuration

**Example Output:**
```
🚀 Deploying SettlementPayment contract...

Deploying with account: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
Account balance: 192.6883250605625 CRO

Configuration:
- Recipient: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
- Settlement Fee: 1.0 TCRO

✅ SettlementPayment deployed to: 0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0

📋 Contract Details:
- Owner: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
- Recipient: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
- Settlement Fee: 1.0 TCRO

🔧 Add this to your .env file:
SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0

✅ Deployment complete!
```

**Post-deployment:**
Add the deployed address to your `.env`:
```env
SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0
```

---

### 3. deposit.ts

Makes a deposit to an already deployed SimpleVault contract.

**Usage:**
```bash
hardhat run scripts/deposit.ts --network cronosTestnet
```

**Requirements:**
- `SIMPLE_VAULT_ADDRESS` must be set in `.env`

**What it does:**
- Connects to existing SimpleVault contract
- Deposits 0.1 CRO to the vault
- Confirms transaction

**Example Output:**
```
Using signer: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
Deposit tx hash: 0x629080e24a1bbff4b589573add6f841c4aeceea39163ac1eeac6522954ba28d9
Deposit confirmed
```

**Customization:**
Modify deposit amount in the script:
```typescript
value: ethers.parseEther("0.1") // Change amount here
```

---

### 4. setAgent.ts

Sets the AI agent address for the SimpleVault contract.

**Usage:**
```bash
hardhat run scripts/setAgent.ts --network cronosTestnet
```

**Requirements:**
- `SIMPLE_VAULT_ADDRESS` in `.env` (or uses hardcoded fallback)
- Must be called by vault owner

**What it does:**
- Sets the authorized AI agent address
- Verifies the agent was set correctly
- Only the agent can call `agentSetWithdrawLimit()`

**Example Output:**
```
Using signer: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
Setting agent tx hash: 0x...
Agent set successfully
Agent address is now: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
```

**Note:** By default, sets the agent to the signer's address for testing. Modify for production:
```typescript
const agentAddress = "0xYourAgentAddress"; // Change this
const tx = await vault.setAgent(agentAddress);
```

---

## Network Configuration

### Cronos Testnet
- **Chain ID:** 338
- **RPC:** https://evm-t3.cronos.org
- **Explorer:** https://testnet.cronoscan.com
- **Faucet:** https://cronos.org/faucet

### Cronos Mainnet
- **Chain ID:** 25
- **RPC:** https://evm.cronos.org
- **Explorer:** https://cronoscan.com

## Common Workflows

### Initial Setup
```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
npx hardhat compile

# 3. Deploy SimpleVault
npm run deploy:testnet

# 4. Deploy SettlementPayment
hardhat run scripts/deploy-settlement-payment.ts --network cronosTestnet

# 5. Set AI agent
hardhat run scripts/setAgent.ts --network cronosTestnet
```

### Testing Deposits
```bash
# Make additional deposits
hardhat run scripts/deposit.ts --network cronosTestnet
```

### Local Development
```bash
# Start local node
npx hardhat node

# Deploy to local network (in another terminal)
npm run deploy:local
```

## Contract Addresses (Testnet)

Latest deployments on Cronos Testnet:

```
SimpleVault: 0x656a4D09f53ab82f6B291082cb3159F7c14424dE
SettlementPayment: 0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0
Deployer/Owner: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
```

## Troubleshooting

### "SIMPLE_VAULT_ADDRESS not set"
Add the vault address to your `.env` file after deployment.

### "Not owner" error
Only the contract owner can call `setAgent()`. Ensure you're using the correct private key.

### "Insufficient balance"
Get testnet CRO from the [Cronos faucet](https://cronos.org/faucet).

### Gas estimation failed
Check that:
- Contract address is correct
- Network RPC is accessible
- Account has sufficient balance

## Security Notes

- Never commit `.env` files with private keys
- Use separate wallets for testnet and mainnet
- Verify contract addresses before interacting
- Test thoroughly on testnet before mainnet deployment

## Integration with Agent Service

These contracts integrate with the agent-service backend:

1. **SimpleVault** emits events monitored by `vaultEvents.ts` listener
2. **SettlementPayment** is called by settlement agents for x402 payments
3. Agent address set via `setAgent.ts` authorizes AI recommendations

See `agent-service/src/contracts/` for TypeScript integration code.

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Cronos Documentation](https://docs.cronos.org)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
