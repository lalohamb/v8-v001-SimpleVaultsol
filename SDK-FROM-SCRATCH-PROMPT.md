# Cronos AI Agent SDK - Build From Scratch

## Objective
Build a production-ready, protocol-agnostic AI Agent SDK for Cronos EVM that developers can install via NPM and use to add intelligent automation to any smart contract protocol (DeFi, NFT, payments, gaming, etc.).

## What This SDK Enables

Developers can:
1. **Install the SDK** via `npm install @cronos/ai-agent-sdk`
2. **Register their contracts** with the SDK
3. **Use built-in agents** or create custom ones
4. **Add AI-powered automation** to their dApps
5. **Enforce safety policies** automatically
6. **Monitor on-chain events** and respond intelligently
7. **Optional: Use pre-built UI** via `npm install @cronos/ai-agent-ui` (React components)

## Target Developer Experience

```typescript
// Install: npm install @cronos/ai-agent-sdk

import { CronosAgentSDK, BaseAgent } from '@cronos/ai-agent-sdk';

// Initialize SDK
const sdk = new CronosAgentSDK({
  network: 'cronos-testnet',
  rpcUrl: 'https://evm-t3.cronos.org',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  aiProvider: 'openai',
  aiApiKey: process.env.OPENAI_API_KEY
});

// Register any smart contract
await sdk.registerContract('my-vault', {
  address: '0x123...',
  abi: vaultABI
});

// Use built-in agents
const result = await sdk.executeAgent('risk-monitor', {
  contractId: 'my-vault',
  user: '0xabc...',
  params: { threshold: 0.8 }
});

// Create custom agent
class MyCustomAgent extends BaseAgent {
  async decide(context) {
    // Your logic here
    return { action: {...}, reason: '...', confidence: 0.9 };
  }
}

// Register and use custom agent
sdk.registerAgent('my-agent', new MyCustomAgent());
await sdk.executeAgent('my-agent', {...});

// Listen to events and auto-respond
sdk.onContractEvent('my-vault', 'Deposited', async (event) => {
  await sdk.executeAgent('risk-monitor', {
    contractId: 'my-vault',
    user: event.args.user
  });
});
```

## Architecture

### Package Structure
```
cronos-agent-sdk/
├── packages/
│   ├── core/                          # @cronos/ai-agent-sdk (Backend SDK)
│   │   ├── src/
│   │   │   ├── index.ts              # Main exports
│   │   │   ├── CronosAgentSDK.ts     # SDK entry point
│   │   │   ├── agents/
│   │   │   │   ├── BaseAgent.ts      # Abstract agent class
│   │   │   │   ├── AgentRegistry.ts  # Agent management
│   │   │   │   ├── types.ts          # Core types
│   │   │   │   └── builtin/          # Built-in agents
│   │   │   │       ├── RiskMonitor.ts
│   │   │   │       ├── LiquidityOptimizer.ts
│   │   │   │       └── EmergencyBrake.ts
│   │   │   ├── contracts/
│   │   │   │   ├── ContractRegistry.ts
│   │   │   │   ├── ContractAdapter.ts
│   │   │   │   └── types.ts
│   │   │   ├── events/
│   │   │   │   ├── EventListener.ts
│   │   │   │   ├── EventHandler.ts
│   │   │   │   └── types.ts
│   │   │   ├── policies/
│   │   │   │   ├── PolicyEngine.ts
│   │   │   │   ├── SafetyPolicy.ts
│   │   │   │   └── types.ts
│   │   │   ├── ai/
│   │   │   │   ├── AIProvider.ts
│   │   │   │   ├── OpenAIProvider.ts
│   │   │   │   └── types.ts
│   │   │   ├── api/                  # Optional REST API wrapper
│   │   │   │   ├── ExpressAdapter.ts
│   │   │   │   └── routes.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       └── validation.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                            # @cronos/ai-agent-ui (Optional React UI)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── AgentConsole/     # Execute agents manually
│   │   │   │   ├── Dashboard/        # Overview & metrics
│   │   │   │   ├── EventMonitor/     # Real-time event feed
│   │   │   │   ├── PolicyManager/    # Configure policies
│   │   │   │   └── ContractRegistry/ # Manage contracts
│   │   │   ├── hooks/
│   │   │   │   ├── useAgentSDK.ts
│   │   │   │   └── useContractEvents.ts
│   │   │   ├── App.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── examples/                      # Example implementations
│       ├── vault-automation/          # Backend + UI example
│       ├── dex-liquidity/             # Backend only example
│       └── nft-marketplace/           # Backend only example
│
├── docs/                              # Documentation
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── custom-agents.md
│   ├── ui-integration.md              # How to use optional UI
│   └── examples/
│
└── README.md
```

## Implementation Plan

### Phase 1: Core Foundation (Week 1)

#### Day 1-2: Type System & Base Classes

**File: `packages/core/src/agents/types.ts`**
```typescript
export interface AgentContext<TCustomData = any> {
  contractId: string;
  user: string;
  timestamp: number;
  customData: TCustomData;
}

export interface AgentDecision<TAction = any> {
  action: TAction;
  reason: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  version: string;
}
```

**File: `packages/core/src/agents/BaseAgent.ts`**
```typescript
export abstract class BaseAgent<TContext = any, TAction = any> {
  abstract config: AgentConfig;
  
  abstract decide(
    context: AgentContext<TContext>
  ): Promise<AgentDecision<TAction>>;
  
  validate(context: AgentContext<TContext>): boolean {
    return true; // Override for custom validation
  }
}
```

**File: `packages/core/src/contracts/types.ts`**
```typescript
export interface ContractConfig {
  id: string;
  address: string;
  abi: any[];
  network: string;
}

export interface ContractAdapter {
  call(method: string, params: any[]): Promise<any>;
  send(method: string, params: any[]): Promise<any>;
  on(event: string, handler: Function): void;
}
```

#### Day 3-4: Contract & Event System

**File: `packages/core/src/contracts/ContractRegistry.ts`**
```typescript
export class ContractRegistry {
  private contracts: Map<string, ContractAdapter>;
  
  register(config: ContractConfig): void;
  get(id: string): ContractAdapter;
  list(): ContractConfig[];
}
```

**File: `packages/core/src/events/EventListener.ts`**
```typescript
export class EventListener {
  private subscriptions: Map<string, EventHandler[]>;
  
  subscribe(
    contractId: string,
    eventName: string,
    handler: EventHandler
  ): void;
  
  start(): void;
  stop(): void;
}
```

#### Day 5: Agent Registry & Policy Engine

**File: `packages/core/src/agents/AgentRegistry.ts`**
```typescript
export class AgentRegistry {
  private agents: Map<string, BaseAgent>;
  
  register(agent: BaseAgent): void;
  get(id: string): BaseAgent;
  execute(id: string, context: AgentContext): Promise<AgentDecision>;
}
```

**File: `packages/core/src/policies/PolicyEngine.ts`**
```typescript
export class PolicyEngine {
  private policies: Policy[];
  
  addPolicy(policy: Policy): void;
  validate(decision: AgentDecision, context: AgentContext): boolean;
  enforce(decision: AgentDecision): AgentDecision;
}
```

### Phase 2: SDK Entry Point (Week 2)

#### Day 1-3: Main SDK Class

**File: `packages/core/src/CronosAgentSDK.ts`**
```typescript
export class CronosAgentSDK {
  private contractRegistry: ContractRegistry;
  private agentRegistry: AgentRegistry;
  private eventListener: EventListener;
  private policyEngine: PolicyEngine;
  private aiProvider?: AIProvider;
  
  constructor(config: SDKConfig);
  
  // Contract management
  async registerContract(id: string, config: ContractConfig): Promise<void>;
  getContract(id: string): ContractAdapter;
  
  // Agent management
  registerAgent(id: string, agent: BaseAgent): void;
  async executeAgent(id: string, context: AgentContext): Promise<AgentDecision>;
  
  // Event handling
  onContractEvent(
    contractId: string,
    eventName: string,
    handler: EventHandler
  ): void;
  
  // Policy management
  addPolicy(policy: Policy): void;
  
  // Lifecycle
  async start(): Promise<void>;
  async stop(): Promise<void>;
}
```

#### Day 4-5: AI Provider Integration

**File: `packages/core/src/ai/AIProvider.ts`**
```typescript
export interface AIProvider {
  generateDecision(
    prompt: string,
    context: AgentContext
  ): Promise<AgentDecision>;
  
  isAvailable(): boolean;
}
```

**File: `packages/core/src/ai/OpenAIProvider.ts`**
```typescript
export class OpenAIProvider implements AIProvider {
  constructor(apiKey: string, model?: string);
  
  async generateDecision(
    prompt: string,
    context: AgentContext
  ): Promise<AgentDecision>;
}
```

### Phase 3: Built-in Agents (Week 3)

#### Create 6 Generic Built-in Agents

1. **RiskMonitor** - Monitors risk metrics and recommends actions
2. **LiquidityOptimizer** - Optimizes liquidity allocation
3. **EmergencyBrake** - Triggers emergency stops
4. **ThresholdGuard** - Enforces threshold limits
5. **AnomalyDetector** - Detects unusual patterns
6. **PolicyEnforcer** - Ensures compliance with rules

**Example: `packages/core/src/agents/builtin/RiskMonitor.ts`**
```typescript
export class RiskMonitor extends BaseAgent<RiskContext, RiskAction> {
  config = {
    id: 'risk-monitor',
    name: 'Risk Monitor',
    description: 'Monitors risk metrics and recommends protective actions',
    version: '1.0.0'
  };
  
  async decide(context: AgentContext<RiskContext>): Promise<AgentDecision<RiskAction>> {
    const { balance, threshold } = context.customData;
    
    if (balance < threshold) {
      return {
        action: { type: 'LIMIT', value: balance * 0.5 },
        reason: 'Balance below threshold, reducing limits',
        confidence: 0.85
      };
    }
    
    return {
      action: { type: 'ALLOW', value: balance },
      reason: 'Risk within acceptable range',
      confidence: 0.9
    };
  }
}
```

### Phase 4: Optional UI Package (Week 4)

#### UI Components for Agent Management

**File: `packages/ui/src/components/AgentConsole/AgentConsole.tsx`**
```typescript
import { CronosAgentSDK } from '@cronos/ai-agent-sdk';

export function AgentConsole({ sdk }: { sdk: CronosAgentSDK }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  return (
    <div className="agent-console">
      <AgentList agents={agents} onSelect={setSelectedAgent} />
      <AgentExecutor agent={selectedAgent} sdk={sdk} />
      <ResultsPanel />
    </div>
  );
}
```

**File: `packages/ui/src/components/Dashboard/Dashboard.tsx`**
```typescript
export function Dashboard({ sdk }: { sdk: CronosAgentSDK }) {
  return (
    <div className="dashboard">
      <MetricsOverview sdk={sdk} />
      <RecentDecisions sdk={sdk} />
      <ActivePolicies sdk={sdk} />
      <EventFeed sdk={sdk} />
    </div>
  );
}
```

**File: `packages/ui/src/hooks/useAgentSDK.ts`**
```typescript
export function useAgentSDK(config: SDKConfig) {
  const [sdk, setSdk] = useState<CronosAgentSDK | null>(null);
  
  useEffect(() => {
    const instance = new CronosAgentSDK(config);
    instance.start();
    setSdk(instance);
    
    return () => instance.stop();
  }, [config]);
  
  return sdk;
}
```

#### UI Usage Example
```typescript
// App.tsx
import { AgentConsole, Dashboard } from '@cronos/ai-agent-ui';
import { useAgentSDK } from '@cronos/ai-agent-ui/hooks';

function App() {
  const sdk = useAgentSDK({
    network: 'cronos-testnet',
    privateKey: process.env.AGENT_PRIVATE_KEY
  });
  
  if (!sdk) return <Loading />;
  
  return (
    <div>
      <Dashboard sdk={sdk} />
      <AgentConsole sdk={sdk} />
    </div>
  );
}
```

### Phase 5: Examples & Documentation (Week 5)

#### Example 1: Vault Automation (Backend + UI)
```typescript
// packages/examples/vault-automation/backend/index.ts
import { CronosAgentSDK } from '@cronos/ai-agent-sdk';
import express from 'express';

const sdk = new CronosAgentSDK({...});

await sdk.registerContract('vault', {
  address: '0x123...',
  abi: vaultABI
});

// Expose REST API for UI
const app = express();
app.post('/agents/execute', async (req, res) => {
  const result = await sdk.executeAgent(req.body.agentId, req.body.context);
  res.json(result);
});

app.listen(3000);
```

```typescript
// packages/examples/vault-automation/frontend/App.tsx
import { Dashboard, AgentConsole } from '@cronos/ai-agent-ui';
import { useAgentSDK } from '@cronos/ai-agent-ui/hooks';

function VaultApp() {
  const sdk = useAgentSDK({
    apiUrl: 'http://localhost:3000',  // Connect to backend
    network: 'cronos-testnet'
  });
  
  return (
    <div>
      <h1>Vault Agent Management</h1>
      <Dashboard sdk={sdk} />
      <AgentConsole sdk={sdk} />
    </div>
  );
}
```

#### Example 2: Backend-Only DEX Integration
```typescript
// packages/examples/dex-liquidity/index.ts
import { CronosAgentSDK } from '@cronos/ai-agent-sdk';

const sdk = new CronosAgentSDK({...});

await sdk.registerContract('dex', {
  address: '0x456...',
  abi: dexABIultABI
});

// Monitor deposits and adjust limits
sdk.onContractEvent('vault', 'Deposited', async (event) => {
  const result = await sdk.executeAgent('risk-monitor', {
    contractId: 'vault',
    user: event.args.user,
    customData: {
      balance: event.args.newBalance,
      threshold: ethers.parseEther('10')
    }
  });
  
  console.log('Risk assessment:', result);
});
```

#### Example 2: DEX Liquidity Management
```typescript
// packages/examples/dex-liquidity/index.ts
const sdk = new CronosAgentSDK({...});

await sdk.registerContract('dex', {
  address: '0x456...',
  abi: dexABI
});

// Optimize liquidity on price changes
sdk.onContractEvent('dex', 'PriceUpdate', async (event) => {
  const result = await sdk.executeAgent('liquidity-optimizer', {
    contractId: 'dex',
    user: event.args.pool,
    customData: {
      currentPrice: event.args.price,
      liquidity: event.args.liquidity
    }
  });
});
```

#### Documentation Structure
1. **Getting Started** - Installation, basic setup, first agent
2. **API Reference** - Complete API documentation
3. **Custom Agents** - How to create custom agents
4. **Built-in Agents** - Documentation for each built-in agent
5. **Examples** - Real-world integration examples
6. **Best Practices** - Security, performance, patterns

### Phase 6: Testing & Publishing (Week 6)

#### Testing Strategy
```typescript
// packages/core/tests/
├── unit/
│   ├── agents/
│   ├── contracts/
│   └── policies/
├── integration/
│   ├── sdk.test.ts
│   └── agents.test.ts
└── e2e/
    └── vault-example.test.ts
```

#### NPM Publishing
```json
// packages/core/package.json
{
  "name": "@cronos/ai-agent-sdk",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build"
  }
}
```

## Key Design Principles

### 1. Protocol Agnostic
- No hardcoded contract types
- Generic interfaces for all operations
- Extensible through plugins

### 2. Type Safe
- Full TypeScript support
- Generic types for custom data
- Compile-time validation

### 3. Developer Friendly
- Simple API surface
- Clear error messages
- Comprehensive examples
- Good defaults

### 4. Production Ready
- Comprehensive testing
- Error handling
- Logging and monitoring
- Performance optimized

### 5. Secure by Default
- Policy enforcement mandatory
- Input validation
- Rate limiting
- Audit logging

## Success Criteria

### Technical
- [ ] Installable via NPM
- [ ] Works with any EVM contract
- [ ] TypeScript support with intellisense
- [ ] 90%+ test coverage
- [ ] < 100ms agent execution time
- [ ] Handles 1000+ events/minute

### Developer Experience
- [ ] < 5 minutes to first working agent
- [ ] Clear documentation with examples
- [ ] Helpful error messages
- [ ] Active community support

### Adoption
- [ ] 3+ example implementations
- [ ] Used in at least 2 different protocol types
- [ ] Positive developer feedback
- [ ] Growing ecosystem of custom agents

## Timeline

- **Week 1**: Core foundation (types, base classes, registries)
- **Week 2**: SDK entry point and AI integration
- **Week 3**: Built-in agents and policy system
- **Week 4**: Optional UI package (React components)
- **Week 5**: Examples and documentation
- **Week 6**: Testing, refinement, and publishing

**Total: 6 weeks to production-ready SDK with optional UI**

**Note:** UI is optional - developers can use the SDK without it and build their own interface, or use the pre-built React components.

## Next Steps

1. Initialize project structure
2. Set up TypeScript and build system
3. Implement core types and base classes
4. Build contract and agent registries
5. Create SDK main class
6. Develop built-in agents
7. Write comprehensive tests
8. Create examples and documentation
9. Publish to NPM
10. Gather feedback and iterate