# Cronos AI Platform - Deployment Guide

This guide provides step-by-step instructions to deploy and test the Cronos AI Platform. Follow these instructions line-by-line to validate everything works correctly.

## Prerequisites

- Ubuntu environment
- Repository folder created with all files in place
- Test wallet with Cronos testnet CRO tokens

## Deployment Phases

1. **Deploy SimpleVault to Cronos testnet** (contracts/.env + commands)
2. **Configure and run agent-service** (.env + commands)
3. **(Optional) Set the agent address and test the agent hook**

---

## 1️⃣ Contracts: Configure .env and Deploy SimpleVault

### 1.1 Navigate to contracts folder
```bash
cd /path/to/cronos-ai-platform/contracts
```

### 1.2 Create .env from example
```bash
cp .env.example .env
```

### 1.3 Edit contracts/.env

Open the file with your preferred editor:
```bash
nano .env
```

Set the following values:
```env
# NEVER USE A MAIN WALLET PRIVATE KEY FOR TESTING.
# Use a test wallet that you control, with some Cronos testnet CRO.
PRIVATE_KEY=0xyour_test_wallet_private_key_here

# You can keep the public Cronos testnet RPC or replace with your own
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
```

**Important Notes:**
- `PRIVATE_KEY` must start with `0x`
- Must correspond to a wallet that has Cronos testnet CRO (use faucet if needed)
- `CRONOS_TESTNET_RPC` can stay as provided

Save and exit the editor.

### 1.4 Install dependencies
```bash
npm install
```

### 1.5 Compile contracts
```bash
npx hardhat compile
```

You should see a successful compile with no errors.

### 1.6 Deploy SimpleVault to Cronos testnet
```bash
npm run deploy:testnet
```

Expected output:
```
Deploying contracts with: 0xYourDeployerAddress
SimpleVault deployed at: 0xABCD1234...EF
```

> 👉 **Important:** Copy the SimpleVault deployed address - you'll need it for the agent-service configuration.

---

## 2️⃣ Agent Service: Configure .env and Run API

### 2.1 Navigate to agent-service folder
```bash
cd /path/to/cronos-ai-platform/agent-service
```

### 2.2 Create .env from example
```bash
cp .env.example .env
```

### 2.3 Edit agent-service/.env
```bash
nano .env
```

Set the following values:
```env
# Your OpenAI key (must be valid)
OPENAI_API_KEY=sk-.......

# Same Cronos RPC you used above
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org

# Paste the EXACT address from the deployment step (no quotes)
SIMPLE_VAULT_ADDRESS=0xABCD1234...EF

# For now we'll run locally on port 3000
PORT=3000

# OPTIONAL: if you want the backend to actually send agentSetWithdrawLimit txs:
# Set this to the same test private key as in contracts/.env (or another funded test key)
AGENT_PRIVATE_KEY=0xyour_test_wallet_private_key_here
```

Save and exit.

### 2.4 Install dependencies
```bash
npm install
```

### 2.5 Run the agent service
```bash
npm run dev
```

Expected output:
```
Agent service listening on http://localhost:3000
[agent] WARNING: ... (if OPENAI_API_KEY missing it will warn)
[simpleVault] WARNING: ... (if SIMPLE_VAULT_ADDRESS missing, so make sure it's set)
```

If configured correctly, there should be no warnings about missing `SIMPLE_VAULT_ADDRESS`.

### 2.6 Test the /health endpoint

In a second terminal:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok"}
```

### 2.7 Test the /agent endpoint (LLM only)

Still in the second terminal:
```bash
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain what the SimpleVault contract does."}'
```

If `OPENAI_API_KEY` is valid, you should get JSON with an `output` field containing a text response.

---

## 3️⃣ Integration: Deposit and Query SimpleVault

Now we'll:
- Ensure the vault holds some balance for a user
- Read that balance via the `/vault/:user` API

### 3.1 Deposit into SimpleVault using your deployer wallet

Create a deposit script in `contracts/scripts/deposit.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using signer:", deployer.address);

  const vaultAddress = "0xABCD1234...EF"; // <-- SimpleVault address from deploy step

  const Vault = await ethers.getContractFactory("SimpleVault");
  const vault = Vault.attach(vaultAddress);

  const tx = await vault.deposit({
    value: ethers.parseEther("0.1") // deposit 0.1 CRO equivalent
  });
  console.log("Deposit tx hash:", tx.hash);
  await tx.wait();
  console.log("Deposit confirmed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Update the address in the script, then run:
```bash
npx hardhat run scripts/deposit.ts --network cronosTestnet
```

This will send a 0.1 CRO deposit from the `PRIVATE_KEY` wallet into the vault.

### 3.2 Query user balance via agent-service

Use the same address as your deployer/depositor:
```bash
curl http://localhost:3000/vault/0xYourDeployerAddress
```

Expected response:
```json
{
  "user": "0xYourDeployerAddress",
  "balanceWei": "100000000000000000",
  "balanceFormatted": "100000000000000000 wei",
  "recommendedLimitWei": "0"
}
```

**At this stage:**
- ✅ SimpleVault is deployed and funded
- ✅ agent-service can read on-chain balances via Cronos RPC
- ✅ AI endpoint `/agent` works as an LLM-based assistant

---

## 4️⃣ (Optional) Enable AI Agent Hook for Recommendations

This section enables the `agentSetWithdrawLimit` hook functionality.

### 4.1 Set agent address in the contract

We need to tell the contract which address is "the agent" (allowed to call `agentSetWithdrawLimit`).

**Options:**
- Use the same private key (`AGENT_PRIVATE_KEY`) as the owner/deployer
- Use a separate test wallet

For simplicity, we'll use the same key:

1. Ensure `AGENT_PRIVATE_KEY` in `agent-service/.env` matches `PRIVATE_KEY` in `contracts/.env`
2. The owner is the deployer, we'll set agent to the same address

Create `contracts/scripts/setAgent.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Owner/deployer:", deployer.address);

  const vaultAddress = "0xABCD1234...EF"; // SimpleVault address from deployment
  const agentAddress = deployer.address;   // using same as owner for now

  const Vault = await ethers.getContractFactory("SimpleVault");
  const vault = Vault.attach(vaultAddress);

  const tx = await vault.setAgent(agentAddress);
  console.log("setAgent tx hash:", tx.hash);
  await tx.wait();

  console.log("Agent set to:", agentAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run the script:
```bash
cd /path/to/cronos-ai-platform/contracts
npx hardhat run scripts/setAgent.ts --network cronosTestnet
```

Now the agent in the contract is the same address controlled by `AGENT_PRIVATE_KEY`.

### 4.2 Test the agent recommendation hook

With agent-service still running, test the recommendation endpoint:

```bash
curl -X POST http://localhost:3000/agent/recommend-limit \
  -H "Content-Type: application/json" \
  -d '{
    "user": "0xYourDeployerAddress",
    "newLimitWei": "50000000000000000",
    "reason": "Test limit: 0.05 CRO recommended by AI"
  }'
```

Expected response:
```json
{
  "status": "submitted",
  "txHash": "0x..."
}
```

Once the transaction is mined, verify the update:
```bash
curl http://localhost:3000/vault/0xYourDeployerAddress
```

Now `recommendedLimitWei` should show `50000000000000000`.

---

## ✅ Validation Complete

You've successfully validated the full loop:

- ✅ Smart contract deployed on Cronos testnet
- ✅ Vault funded by a user
- ✅ Agent service reading on-chain balances
- ✅ Agent service writing advisory limits on-chain via the agent hook
- ✅ Everything parameterized via .env for easy network/key swapping