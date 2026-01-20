# SENTINEL Platform - Integration Guide

This guide explains how the frontend-main is now integrated with the agent-service backend and smart contracts.

## 🎯 Integration Overview

The SENTINEL platform now has a fully functional integration between:
1. **Frontend** (Next.js) - User interface
2. **Backend** (agent-service) - AI agent orchestration
3. **Smart Contracts** (Cronos Testnet) - On-chain vault and payments

## 📦 What Was Added

### 1. API Integration Layer (`frontend-main/lib/api.ts`)

Complete TypeScript client for all agent-service endpoints:

```typescript
// List all available agents
await listAgents()

// Execute an agent decision
await applyAgent({
  agentId: "withdrawal-risk-sentinel",
  user: "0x...",
  requestedAmountWei: "1000000000000000000"
})

// Run settlement (x402 protected)
await runSettlement({
  jobId: "unique-job-id",
  user: "0x...",
  agentId: "settlement-batch-optimizer"
})

// Check system health
await checkHealth()
```

### 2. Web3 Integration Layer (`frontend-main/lib/web3.ts`)

Smart contract interactions with ethers.js:

```typescript
// Connect wallet
const account = await connectWallet()

// Switch to Cronos Testnet
await switchToCronosTestnet()

// Get vault balance
const balance = await getVaultBalance(userAddress)

// Get recommended withdraw limit
const limit = await getRecommendedLimit(userAddress)

// Get contract instances
const vaultContract = getVaultContract(signer)
const settlementContract = getSettlementPaymentContract(signer)
```

### 3. Data Service Layer (`frontend-main/lib/data-service.ts`)

Unified data fetching with hybrid mock/real approach:

```typescript
// Fetch real agent list from backend
const agents = await fetchAgents()

// Fetch real vault balance from contract
const balance = await fetchVaultBalance(userAddress)

// Fetch system health from backend
const health = await fetchSystemHealth()

// Execute agent
const result = await executeAgent(request)

// Execute settlement
const result = await executeSettlement(request)
```

### 4. Updated Pages

#### Overview Page (`components/pages/overview.tsx`)
- ✅ Real-time vault balance from SimpleVault contract
- ✅ System health from agent-service
- ✅ Auto-refresh every 30 seconds
- ⏳ Mock data for balance history (can be enhanced with events)

#### Agents Page (`components/pages/agents.tsx`)
- ✅ Real agent list from agent-service `/agents/list`
- ✅ Agent details (type, mode, status, description)
- ✅ Guardrails display
- ⏳ Agent execution (ready for integration)

### 5. Environment Configuration

Created `.env.example` and `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Smart Contract Addresses (Cronos Testnet)
NEXT_PUBLIC_SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
NEXT_PUBLIC_SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=338
NEXT_PUBLIC_CHAIN_NAME=Cronos Testnet
NEXT_PUBLIC_RPC_URL=https://evm-t3.cronos.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.cronos.org/testnet
```

## 🚀 How to Run the Integrated System

### Step 1: Start Agent Service

```bash
cd agent-service
npm install
npm start
```

The backend will run on `http://localhost:3000`

### Step 2: Start Frontend

```bash
cd frontend-main
npm install
cp .env.example .env.local
npm run dev
```

The frontend will run on `http://localhost:3001` (or next available port)

### Step 3: Connect MetaMask

1. Install MetaMask browser extension
2. Add Cronos Testnet:
   - Network Name: Cronos Testnet
   - RPC URL: https://evm-t3.cronos.org
   - Chain ID: 338
   - Currency Symbol: TCRO
   - Block Explorer: https://explorer.cronos.org/testnet

3. Get test TCRO from faucet (if needed)

### Step 4: Interact with the Platform

1. **Overview Page** - See your real vault balance
2. **Agents Page** - View all available agents
3. **Vault Page** - Deposit/withdraw (needs integration)
4. **x402 Page** - Settlement payments (needs integration)

## 🔄 Data Flow

### Agent Execution Flow

```
User (Frontend)
  ↓
  POST /agents/apply
  ↓
Agent Service
  ↓
  Executes Agent Logic
  ↓
  Calls SimpleVault.setRecommendedLimit()
  ↓
Cronos Testnet
  ↓
  Transaction Confirmed
  ↓
Response to Frontend
```

### Settlement Flow (x402)

```
User (Frontend)
  ↓
  POST /settlement/run
  ↓
Agent Service
  ↓
  Checks Payment Status
  ↓
  If Not Paid: Return HTTP 402
  ↓
User Pays via SettlementPayment Contract
  ↓
  POST /settlement/run (retry)
  ↓
Agent Service
  ↓
  Executes Settlement
  ↓
Response to Frontend
```

## 📊 Integration Status

### ✅ Completed
- [x] API client with all endpoints
- [x] Web3 integration with contracts
- [x] Data service layer
- [x] Overview page with real data
- [x] Agents page with real data
- [x] Environment configuration
- [x] TypeScript types
- [x] Error handling

### ⏳ Remaining Work
- [ ] Vault page integration (deposit/withdraw)
- [ ] x402 page integration (payment workflow)
- [ ] Wallet connection UI component
- [ ] Transaction confirmation modals
- [ ] Real-time event listeners
- [ ] Balance history from events
- [ ] Unit tests
- [ ] E2E tests

## 🧪 Testing the Integration

### Test 1: Agent List
1. Start agent-service
2. Open frontend
3. Navigate to Agents page
4. Should see 4 agents loaded from backend

### Test 2: Vault Balance
1. Connect MetaMask to Cronos Testnet
2. Deposit TCRO to SimpleVault contract
3. Navigate to Overview page
4. Should see your real balance

### Test 3: System Health
1. Start agent-service
2. Open frontend Overview page
3. Should see "healthy" status

### Test 4: Agent Execution (Manual)
```bash
# Using curl
curl -X POST http://localhost:3000/agents/apply \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "withdrawal-risk-sentinel",
    "user": "0xYourAddress",
    "requestedAmountWei": "1000000000000000000"
  }'
```

## 📚 Key Files

```
frontend-main/
├── lib/
│   ├── api.ts              # Agent-service API client
│   ├── web3.ts             # Smart contract interactions
│   ├── data-service.ts     # Data fetching layer
│   └── types.ts            # TypeScript types
├── components/pages/
│   ├── overview.tsx        # ✅ Integrated
│   ├── agents.tsx          # ✅ Integrated
│   ├── vault.tsx           # ⏳ Needs integration
│   └── x402.tsx            # ⏳ Needs integration
└── .env.local              # Environment config
```

## 🎉 Success Criteria

The integration is successful when:
- ✅ Frontend loads without errors
- ✅ Agent list displays from backend
- ✅ Vault balance shows from contract
- ✅ System health displays from backend
- ⏳ Deposits work through UI
- ⏳ Withdrawals work through UI
- ⏳ x402 payments work through UI

## 🐛 Troubleshooting

### "Failed to load agents"
- Check agent-service is running on port 3000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### "Connect wallet to view balance"
- Install MetaMask
- Switch to Cronos Testnet (Chain ID 338)
- Ensure you have test TCRO

### "Contract call failed"
- Verify contract addresses in `.env.local`
- Check Cronos Testnet RPC is accessible
- Ensure contracts are deployed

## 🚀 Next Steps

1. **Complete Vault Page**
   - Add deposit form
   - Add withdraw form
   - Add transaction history

2. **Complete x402 Page**
   - Add payment workflow
   - Add settlement execution
   - Add transaction tracking

3. **Add Wallet Component**
   - Connect/disconnect button
   - Network switcher
   - Account display

4. **Add Tests**
   - Unit tests for API client
   - Unit tests for Web3 integration
   - E2E tests for user flows

## 📖 Documentation

- **[README.md](frontend-main/README.md)** - Frontend documentation
- **[X402-PROTOCOL.md](X402-PROTOCOL.md)** - x402 payment protocol
- **[AGENTS_OVERVIEW.md](01AGENTS_OVERVIEW.md)** - Agent system overview
- **[SETTLEMENT_SYSTEM.md](SETTLEMENT_SYSTEM.md)** - Settlement workflow

---

**Status:** ✅ Core integration complete, ready for Vault and x402 page implementation!

