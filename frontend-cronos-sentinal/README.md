# SENTINEL Frontend - Wired to Agent Service & Contracts

This is the production-ready frontend for the SENTINEL Cronos AI Vault Platform, now fully integrated with the agent-service backend and smart contracts.

## 🎯 What's Been Integrated

### ✅ Completed Integrations

1. **API Integration Layer** (`lib/api.ts`)
   - All agent-service endpoints
   - x402 payment protocol support
   - Error handling and type safety

2. **Web3 Integration Layer** (`lib/web3.ts`)
   - SimpleVault contract interactions
   - SettlementPayment contract interactions
   - MetaMask wallet connection
   - Cronos Testnet configuration

3. **Data Service** (`lib/data-service.ts`)
   - Real-time vault balance fetching
   - Agent list from backend
   - System health monitoring
   - Hybrid mock/real data approach

4. **Updated Pages**
   - ✅ Overview Page - Real vault balance & system health
   - ✅ Agents Page - Real agent list from backend
   - ⏳ Vault Page - Needs wallet integration
   - ⏳ x402 Page - Needs settlement integration
   - ⏳ Monitoring Page - Uses mock data
   - ⏳ Architecture Page - Static content

## 🚀 Quick Start

### Prerequisites

1. **Agent Service Running**
   ```bash
   cd ../agent-service
   npm start
   # Should be running on http://localhost:3000
   ```

2. **Contracts Deployed**
   - SimpleVault: `0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a`
   - SettlementPayment: `0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0`

3. **MetaMask Installed**
   - Connected to Cronos Testnet
   - Has test TCRO

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
frontend-main/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with routing
├── components/
│   ├── pages/               # Page components
│   │   ├── overview.tsx     # ✅ Integrated with real data
│   │   ├── agents.tsx       # ✅ Integrated with real data
│   │   ├── vault.tsx        # ⏳ Needs integration
│   │   ├── x402.tsx         # ⏳ Needs integration
│   │   ├── monitoring.tsx   # Uses mock data
│   │   └── architecture.tsx # Static content
│   ├── ui/                  # Shadcn/ui components
│   ├── dashboard-layout.tsx # Main layout
│   ├── audit-log-drawer.tsx # Audit log sidebar
│   └── confirmation-modal.tsx # Confirmation dialogs
├── lib/
│   ├── api.ts               # ✅ Agent-service API client
│   ├── web3.ts              # ✅ Smart contract interactions
│   ├── data-service.ts      # ✅ Data fetching layer
│   ├── types.ts             # TypeScript types
│   ├── mock-data.ts         # Mock data (legacy)
│   └── utils.ts             # Utility functions
└── .env.local               # Environment configuration
```

## 🔧 Environment Variables

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

## 📊 Features

### Overview Page
- **Real-time Vault Balance** - Fetched from SimpleVault contract
- **System Health** - From agent-service `/health` endpoint
- **Agent States** - Mock data (can be enhanced)
- **Balance History** - Mock data (can be enhanced with events)
- **Risk Posture** - Mock data (can be enhanced)

### Agents Page
- **Real Agent List** - From agent-service `/agents/list`
- **Agent Details** - Type, mode, status, description
- **Guardrails** - Predefined rules for each agent
- **Agent Execution** - Ready for integration

### Vault Page (Needs Integration)
- Deposit functionality
- Withdrawal functionality
- Balance display
- Transaction history

### x402 Page (Needs Integration)
- Payment workflow
- Settlement execution
- Transaction tracking

## 🔌 API Endpoints Used

### Agent Service (`http://localhost:3000`)

```typescript
// List all agents
GET /agents/list
Response: { agents: AgentInfo[] }

// Execute an agent
POST /agents/apply
Body: { agentId, user, requestedAmountWei? }
Response: AgentApplyResponse

// Run settlement (x402 protected)
POST /settlement/run
Body: { jobId, user, agentId, requestedAmountWei? }
Response: SettlementRunResponse | HTTP 402

// Health check
GET /health
Response: { status: string }
```

### Smart Contracts (Cronos Testnet)

```typescript
// SimpleVault
balances(address): uint256
recommendedWithdrawLimit(address): uint256
deposit(): payable
withdraw(uint256): void

// SettlementPayment
payForSettlement(string jobId): payable
checkPayment(string jobId): (bool, address, uint256)
getSettlementFee(): uint256
```

## 🧪 Testing

1. **Start Agent Service**
   ```bash
   cd ../agent-service
   npm start
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Check Overview page for real vault balance
   - Check Agents page for real agent list

4. **Connect MetaMask**
   - Switch to Cronos Testnet
   - Deposit some TCRO to SimpleVault
   - Refresh Overview page to see balance

## 🚧 Next Steps

### High Priority
- [ ] Complete Vault page integration (deposit/withdraw)
- [ ] Complete x402 page integration (payment workflow)
- [ ] Add wallet connection UI component
- [ ] Add transaction confirmation modals

### Medium Priority
- [ ] Enhance Monitoring page with real event data
- [ ] Add real-time event listeners for contract events
- [ ] Implement balance history from blockchain events
- [ ] Add error boundaries and loading states

### Low Priority
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Optimize performance
- [ ] Add analytics

## 📚 Documentation

- **[X402-PROTOCOL.md](../X402-PROTOCOL.md)** - x402 payment protocol details
- **[AGENTS_OVERVIEW.md](../01AGENTS_OVERVIEW.md)** - Agent system overview
- **[SETTLEMENT_SYSTEM.md](../SETTLEMENT_SYSTEM.md)** - Settlement workflow

## 🐛 Troubleshooting

### "Failed to load agents"
- Make sure agent-service is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### "Connect wallet to view balance"
- Install MetaMask
- Switch to Cronos Testnet (Chain ID 338)
- Make sure you have test TCRO

### "Contract call failed"
- Verify contract addresses in `.env.local`
- Check Cronos Testnet RPC is accessible
- Ensure contracts are deployed

## 🎉 Success!

You now have a fully integrated frontend that:
- ✅ Fetches real data from agent-service
- ✅ Interacts with smart contracts on Cronos
- ✅ Displays live vault balances
- ✅ Shows real agent information
- ✅ Ready for x402 payment integration

**Next:** Complete the Vault and x402 pages to enable full functionality!

