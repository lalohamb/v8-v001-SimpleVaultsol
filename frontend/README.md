# Cronos AI Platform - Frontend

Next.js frontend for the Cronos AI Platform agent-service.

## Features

- **Dashboard**: Overview of agent service status and available agents
- **Agent Console**: Execute agents and view AI-powered decisions
- **Settlement Console**: Run x402 settlement workflows with payment gates

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:
- `NEXT_PUBLIC_API_URL` - URL of the agent-service API (default: `http://localhost:3000`)

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── AgentCard.tsx
│   │   ├── DecisionResult.tsx
│   │   ├── Layout.tsx
│   │   ├── SettlementResult.tsx
│   │   └── VaultStateCard.tsx
│   ├── lib/              # Utilities and API client
│   │   └── api.ts
│   ├── pages/            # Next.js pages
│   │   ├── _app.tsx
│   │   ├── index.tsx     # Dashboard
│   │   ├── agents.tsx    # Agent Console
│   │   └── settlements.tsx # Settlement Console
│   ├── styles/           # Global styles
│   │   └── globals.css
│   └── types/            # TypeScript types
│       └── api.ts
├── package.json
└── tsconfig.json
```

## Pages

### Dashboard (`/`)
- Service health status
- AI mode indicator
- List of available agents
- Quick links to console pages

### Agent Console (`/agents`)
- Select and execute agents
- Configure parameters (user address, amount, risk triggers)
- View agent decisions with confidence scores
- See on-chain transaction results

### Settlement Console (`/settlements`)
- x402 payment workflow
- Execute settlements with agent decisions
- View settlement pipeline execution
- Handle payment-required and refusal scenarios

## API Integration

The frontend communicates with the agent-service API:

- `GET /agents/list` - List available agents
- `POST /agents/apply` - Execute an agent
- `POST /settlement/pay` - Pay for settlement (x402)
- `POST /settlement/run` - Run settlement workflow
- `GET /health` - Check service health

## Development

### Type Safety

All API responses are typed using TypeScript interfaces in `src/types/api.ts`.

### Utilities

- `weiToEther()` - Convert wei to ether for display
- `etherToWei()` - Convert ether input to wei
- `formatTxHash()` - Shorten transaction hashes
- `getCronosTestnetExplorerUrl()` - Generate explorer links

### Styling

Global styles are in `src/styles/globals.css` with CSS variables for theming.

## Prerequisites

- Node.js 18+
- Running agent-service on port 3000
- Agent-service configured with:
  - `SIMPLE_VAULT_ADDRESS`
  - `AGENT_PRIVATE_KEY`
  - `CRONOS_TESTNET_RPC`

## Notes

- The frontend is read-only for blockchain state
- All write operations go through the agent-service
- Transaction links point to Cronos Testnet Explorer
- AI mode indicator shows if OpenAI is enabled in agent-service

