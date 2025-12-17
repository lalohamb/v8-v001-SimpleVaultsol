# Frontend Setup Guide

This guide will help you set up and run the Cronos AI Platform frontend.

## Quick Start

### 1. Prerequisites

Ensure you have:
- Node.js 18+ installed
- The agent-service running on port 3000
- A deployed SimpleVault contract on Cronos Testnet

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

The default configuration should work if agent-service is running on `localhost:3000`.

### 4. Start the Frontend

```bash
npm run dev
```

The frontend will be available at: **http://localhost:3001**

## Using the Frontend

### Dashboard (Home Page)

Visit `http://localhost:3001` to see:
- Service health status
- AI mode indicator (shows if OpenAI is enabled)
- List of available agents
- Quick navigation links

### Agent Console

Visit `http://localhost:3001/agents` to:

1. **Select an Agent** - Choose from available agents (withdrawal-risk-sentinel, emergency-brake, etc.)
2. **Enter Parameters**:
   - User Address (required) - The Ethereum address to evaluate
   - Requested Amount (optional) - Amount in CRO
   - Risk Trigger (optional) - NONE, VOLATILITY_SPIKE, or ANOMALY
3. **Execute Agent** - Click to run the agent
4. **View Results**:
   - Agent decision with confidence score
   - Proposed and final limits (after clamping)
   - On-chain transaction hash
   - Link to Cronos Testnet Explorer

### Settlement Console

Visit `http://localhost:3001/settlements` to:

1. **Step 1: Payment (x402)**
   - Enter a Job ID (e.g., "job-001")
   - Click "Pay for Settlement"
   - This simulates the x402 payment workflow

2. **Step 2: Run Settlement**
   - Enter User Address
   - Select Agent
   - Enter Requested Amount (optional)
   - Click "Run Settlement"
   - View settlement execution results

## Testing the Frontend

### Test Agent Execution

1. Make sure you have a user address with balance in the SimpleVault
2. Go to Agent Console
3. Select "withdrawal-risk-sentinel"
4. Enter your user address
5. Click "Execute Agent"
6. You should see:
   - Agent decision with confidence score
   - Transaction hash
   - Updated vault state

### Test Settlement Workflow

1. Go to Settlement Console
2. Enter Job ID: "test-job-001"
3. Click "Pay for Settlement"
4. Enter user address and select agent
5. Click "Run Settlement"
6. View the settlement pipeline execution

## Architecture

```
┌─────────────────┐
│  Next.js UI     │
│  (Port 3001)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Agent Service  │
│  (Port 3000)    │
└────────┬────────┘
         │ ethers.js
         ▼
┌─────────────────┐
│  SimpleVault    │
│  (Cronos EVM)   │
└─────────────────┘
```

## API Endpoints Used

The frontend calls these agent-service endpoints:

- `GET /health` - Health check
- `GET /agents/list` - List available agents
- `POST /agents/apply` - Execute an agent
- `POST /settlement/pay` - Pay for settlement
- `POST /settlement/run` - Run settlement

## Troubleshooting

### "Failed to load agents"

- Check that agent-service is running on port 3000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### "Failed to apply agent"

- Ensure `AGENT_PRIVATE_KEY` is set in agent-service
- Verify `SIMPLE_VAULT_ADDRESS` is configured
- Check that the agent address is authorized in the contract

### "Payment Required" error

- This is expected behavior for the x402 workflow
- Click "Pay for Settlement" first before running settlement

### Transaction fails

- Check that the agent address has CRO for gas
- Verify the vault contract is deployed and accessible
- Check Cronos Testnet RPC is responding

## Development

### File Structure

```
frontend/src/
├── components/          # React components
│   ├── AgentCard.tsx
│   ├── DecisionResult.tsx
│   ├── Layout.tsx
│   ├── SettlementResult.tsx
│   └── VaultStateCard.tsx
├── lib/
│   └── api.ts          # API client and utilities
├── pages/
│   ├── _app.tsx        # Next.js app wrapper
│   ├── index.tsx       # Dashboard
│   ├── agents.tsx      # Agent console
│   └── settlements.tsx # Settlement console
├── styles/
│   └── globals.css     # Global styles
└── types/
    └── api.ts          # TypeScript types
```

### Adding New Features

1. **New API endpoint**: Add to `src/lib/api.ts`
2. **New component**: Create in `src/components/`
3. **New page**: Create in `src/pages/`
4. **New types**: Add to `src/types/api.ts`

## Production Build

```bash
cd frontend
npm run build
npm start
```

The production build will be optimized and ready for deployment.

## Next Steps

- Connect a wallet (e.g., MetaMask) for user address input
- Add real-time event listening for vault events
- Implement agent execution history
- Add charts for confidence scores over time
- Create admin panel for agent configuration

