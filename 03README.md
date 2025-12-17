# Cronos AI Platform – Minimal Dev Environment

This repository is a minimal monorepo for:

- **contracts/** – Hardhat + TypeScript Cronos EVM contracts
- **agent-service/** – AI Agent backend (Node + TypeScript + Express + OpenAI)
- **frontend/** – Next.js UI for agent execution and settlement workflows

## Architecture

```
┌─────────────────┐
│  Next.js UI     │  ← User Interface (Port 3001)
│  (Frontend)     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Agent Service  │  ← AI Agent Runtime (Port 3000)
│  (Express API)  │
└────────┬────────┘
         │ ethers.js
         ▼
┌─────────────────┐
│  SimpleVault    │  ← Smart Contract (Cronos EVM)
│  (Solidity)     │
└─────────────────┘
```

## Getting Started

### 1. Contracts (Hardhat + TypeScript)

```bash
cd contracts
cp .env.example .env   # fill in PRIVATE_KEY
npm install
npx hardhat compile
npm run deploy:testnet
```

### 2. Agent Service (Node + Express + AI)

```bash
cd agent-service
cp .env.example .env   # fill in AGENT_PRIVATE_KEY, SIMPLE_VAULT_ADDRESS, OPENAI_API_KEY
npm install
npm run build
npm start
```

The agent service will run on `http://localhost:3000`

### 3. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local   # configure NEXT_PUBLIC_API_URL
npm install
npm run dev
```

The frontend will run on `http://localhost:3001`

## Features

### Frontend UI
- **Dashboard**: Service health, AI status, agent overview
- **Agent Console**: Execute agents with parameters, view decisions
- **Settlement Console**: x402 payment workflow, settlement execution

### Agent Service
- **4 AI Agents**: withdrawal-risk-sentinel, emergency-brake, settlement-batch-optimizer, portfolio-rebalancer-ai
- **REST API**: `/agents/*` and `/settlement/*` endpoints
- **AI Mode**: Toggle between AI-powered and deterministic fallback
- **Policy Enforcement**: Clamp limits, validate requests

### Smart Contracts
- **SimpleVault**: Deposit/withdraw CRO with agent advisory limits
- **Agent Hook**: `agentSetWithdrawLimit()` for AI recommendations
- **Events**: Deposited, Withdrawn, AgentRecommendation

## Documentation

- **[FRONTEND-SETUP.md](FRONTEND-SETUP.md)** - Complete frontend setup guide
- **[FRONTEND-COMPLETE.md](FRONTEND-COMPLETE.md)** - Frontend implementation details
- **[Cronos AI Platform - Deployment Guide.md](Cronos%20AI%20Platform%20-%20Deployment%20Guide.md)** - Full deployment guide
- **[SCOPE.md](SCOPE.md)** - System scope and architecture

## Quick Test

1. Deploy SimpleVault contract to Cronos Testnet
2. Start agent-service with contract address
3. Start frontend
4. Visit `http://localhost:3001`
5. Go to Agent Console
6. Execute an agent with a user address
7. View the decision and transaction result

## Tech Stack

- **Blockchain**: Cronos EVM (Testnet)
- **Smart Contracts**: Solidity 0.8.24, Hardhat
- **Backend**: Node.js, TypeScript, Express, ethers.js
- **AI**: OpenAI GPT-4 (optional)
- **Frontend**: Next.js 14, React 18, TypeScript, Axios
- **Styling**: CSS with CSS Variables
