I'll help you understand the components of the `agent-service/src/` folder. Let me start by exploring the structure and then examining each component in detail.

Now let me examine each component in detail:

Now let me examine the individual agent implementations:

Now let me check the package.json to understand dependencies and scripts:

Perfect! Now I have a comprehensive understanding of the agent-service architecture. Let me create a detailed explanation and then help you test each component.

## 📋 **Agent Service Architecture - Complete Breakdown**

### **Project Structure Overview**

The `agent-service` is a Node.js/TypeScript backend service that provides AI-powered and rule-based agents for managing withdrawal limits on a blockchain vault. Here's how everything fits together:

---

## **1. Core Entry Point**

### **`src/server.ts`** - Main Application Server
````typescript path=agent-service/src/server.ts mode=EXCERPT
const app = express();
app.use("/agents", agentsRoutes);
app.use("/settlement", settlementsRoutes);
````

**Purpose**: 
- Express.js HTTP server that listens on port 3000
- Configures CORS for frontend communication
- Mounts two main route handlers: `/agents` and `/settlement`
- Provides `/health` endpoint for monitoring

---

## **2. Type System**

### **`src/agents/types.ts`** - Core Type Definitions
````typescript path=agent-service/src/agents/types.ts mode=EXCERPT
export type AgentId =
  | "settlement-batch-optimizer"
  | "withdrawal-risk-sentinel"
  | "emergency-brake"
  | "02portfolio-rebalancer-ai";
````

**Purpose**:
- **`AgentId`**: Union type of all available agent identifiers
- **`AgentContext`**: Input data for agent decisions (user balance, limits, risk triggers)
- **`AgentDecision`**: Agent's proposed limit and reasoning
- **`AgentResult`**: Final decision after clamping/safety checks
- **`Agent`**: Interface that all agents must implement

---

## **3. Agent Registry**

### **`src/agents/registry.ts`** - Agent Management
````typescript path=agent-service/src/agents/registry.ts mode=EXCERPT
const AGENTS: Record<AgentId, Agent> = {
  "settlement-batch-optimizer": settlementBatchOptimizer,
  "withdrawal-risk-sentinel": withdrawalRiskSentinel,
  "emergency-brake": emergencyBrake,
  "02portfolio-rebalancer-ai": portfolioRebalancerAI
};
````

**Purpose**:
- Central registry of all available agents
- Metadata tracking (which agents are AI-capable)
- Helper functions: `hasAgent()`, `getAgent()`, `listAgents()`, `isAiCapable()`
- Acts as a single source of truth for agent availability

---

## **4. Safety Utilities**

### **`src/agents/clamp.ts`** - Safety Enforcement
````typescript path=agent-service/src/agents/clamp.ts mode=EXCERPT
export function clampLimit(args: {
  balanceWei: bigint;
  proposedLimitWei: bigint;
  maxPct: number;
  maxAbsWei?: bigint | null;
}): { finalWei: bigint; notes: string }
````

**Purpose**:
- **`clampLimit()`**: Enforces safety constraints on agent proposals
  - Never exceeds user balance
  - Caps at percentage of balance (default 50%)
  - Optional absolute maximum
  - Prevents zero limits when balance exists
- **`sanitizeReason()`**: Truncates reason strings to 200 characters

---

## **5. Individual Agents**

### **A. Settlement Batch Optimizer**
**`src/agents/settlement-batch-optimizer/index.ts`**

````typescript path=agent-service/src/agents/settlement-batch-optimizer/index.ts mode=EXCERPT
// baseline: 40% of balance
const baseline = (b * 40n) / 100n;
const proposed = req > 0n ? (req < baseline ? req : baseline) : baseline;
````

**Purpose**: 
- Handles x402 payment-gated settlement workflows
- Proposes 40% of balance as baseline
- If specific amount requested, allows it only if below baseline
- **Use Case**: Multi-step settlement execution with safe caps

---

### **B. Withdrawal Risk Sentinel**
**`src/agents/withdrawal-risk-sentinel/index.ts`**

````typescript path=agent-service/src/agents/withdrawal-risk-sentinel/index.ts mode=EXCERPT
const half = (b * 50n) / 100n;
const proposed = current > 0n ? (current * 95n) / 100n : half;
````

**Purpose**:
- Monitors account state and adjusts limits dynamically
- Initial limit: 50% of balance
- Subsequent adjustments: Tightens by 5% to reduce drain risk
- **Use Case**: Continuous risk monitoring and gradual tightening

---

### **C. Emergency Brake**
**`src/agents/emergency-brake/index.ts`**

````typescript path=agent-service/src/agents/emergency-brake/index.ts mode=EXCERPT
const severe = ctx.riskTrigger && ctx.riskTrigger !== "NONE";
const pct = severe ? 10n : 25n;
````

**Purpose**:
- Crisis-mode limiter for abnormal conditions
- Normal mode: 25% of balance
- Severe risk trigger: 10% of balance
- **Use Case**: Emergency response to volatility spikes or anomalies

---

### **D. Portfolio Rebalancer AI** (AI-Capable)
**`src/agents/02portfolio-rebalancer-ai/index.ts`**

````typescript path=agent-service/src/agents/02portfolio-rebalancer-ai/index.ts mode=EXCERPT
const enabled = process.env.ENABLE_AI_AGENTS === "true";
const apiKey = process.env.OPENAI_API_KEY;
if (!enabled || !apiKey) return deterministicFallback(ctx);
````

**Purpose**:
- **AI Mode**: Uses OpenAI GPT-4o-mini to propose limits based on context
- **Fallback Mode**: Deterministic 20% baseline if AI disabled/unavailable
- Lazy-loads OpenAI SDK to prevent startup crashes
- **Use Case**: Intelligent portfolio rebalancing with AI reasoning

---

## **6. Blockchain Integration**

### **`src/contracts/simpleVault.ts`** - Smart Contract Interface
````typescript path=agent-service/src/contracts/simpleVault.ts mode=EXCERPT
export function getSimpleVaultReadonly() {
  const provider = getProvider();
  return new ethers.Contract(SIMPLE_VAULT_ADDRESS, SIMPLE_VAULT_ABI, provider);
}
````

**Purpose**:
- Ethers.js wrapper for SimpleVault contract on Cronos Testnet
- **Read-only**: `getSimpleVaultReadonly()` - Query balances and limits
- **Write**: `getSimpleVaultWithSigner()` - Execute `agentSetWithdrawLimit()`
- Minimal ABI for only required functions

---

### **`src/listeners/vaultEvents.ts`** - Event Monitoring
````typescript path=agent-service/src/listeners/vaultEvents.ts mode=EXCERPT
vault.on("Deposited", (user: string, amount: bigint, event: any) => {
  console.log(`[vaultEvents] Deposited: user=${user}, amount=${ethers.formatEther(amount)} CRO`);
  // TODO: feed this into AI logic
});
````

**Purpose**:
- WebSocket listener for vault events (Deposited, Withdrawn)
- Currently logs events (TODO: trigger agent decisions)
- **Use Case**: Real-time monitoring and reactive agent triggers

---

## **7. API Routes**

### **A. Agents Route** - `/agents/*`
**`src/routes/agents.ts`**

**Endpoints**:
1. **`GET /agents/list`** - List all available agents with metadata
2. **`POST /agents/apply`** - Apply an agent decision to a user

````typescript path=agent-service/src/routes/agents.ts mode=EXCERPT
router.post("/apply", async (req, res) => {
  const agent = getAgent(agentId);
  const decision = await agent.decide(ctx);
  const { finalWei, notes } = clampLimit({...});
  const tx = await vault.agentSetWithdrawLimit(user, finalWei, finalReason);
````

**Flow**:
1. Validate input (agentId, user address)
2. Read on-chain state (balance, current limit)
3. Agent proposes new limit
4. Clamp to safety constraints
5. Write to blockchain via `agentSetWithdrawLimit()`
6. Return transaction hash and decision details

---

### **B. Settlements Route** - `/settlement/*`
**`src/routes/settlements.ts`**

**Endpoints**:
1. **`POST /settlement/pay`** - Accept x402 payment for job
2. **`POST /settlement/run`** - Execute settlement with agent enforcement

````typescript path=agent-service/src/routes/settlements.ts mode=EXCERPT
// x402 gate (demo)
if (!paidJobs.has(jobId)) {
  return res.status(402).json({ error: "Payment Required", x402: {...} });
}
// ENFORCEMENT: refuse if request exceeds recommended limit
if (requestedAmountWei !== undefined && requestedAmountWei > finalWei) {
  return res.status(409).json({ status: "refused", reason: "REQUEST_EXCEEDS_AI_RECOMMENDED_LIMIT" });
}
````

**Flow**:
1. Check x402 payment status (402 error if unpaid)
2. Validate agent exists
3. Agent proposes limit
4. **Enforcement**: Reject if requested amount exceeds limit
5. Write advisory limit to blockchain
6. Execute settlement pipeline (demo)

---

## **🔄 How Components Interact**

```
┌─────────────┐
│  Frontend   │
│ (port 3001) │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         server.ts (port 3000)       │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ /agents/*    │  │/settlement/* │ │
│  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼─────────┘
          │                  │
          ▼                  ▼
    ┌─────────────────────────────┐
    │      registry.ts            │
    │  ┌──────────────────────┐   │
    │  │ getAgent(agentId)    │   │
    │  └──────────┬───────────┘   │
    └─────────────┼───────────────┘
                  ▼
    ┌─────────────────────────────┐
    │   Individual Agents         │
    │  • settlement-batch-opt     │
    │  • withdrawal-risk-sentinel │
    │  • emergency-brake          │
    │  • portfolio-rebalancer-ai  │
    └──────────┬──────────────────┘
               │ decide(ctx)
               ▼
    ┌─────────────────────────────┐
    │   AgentDecision             │
    │   { proposedLimitWei,       │
    │     reason, confidence }    │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │   clamp.ts                  │
    │   Safety enforcement        │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │   simpleVault.ts            │
    │   agentSetWithdrawLimit()   │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │   Cronos Blockchain         │
    │   SimpleVault Contract      │
    └─────────────────────────────┘
```

---

## **🧪 Testing Plan**

Now let's create a comprehensive test suite for each component. Would you like me to:

1. **Create unit tests** for each agent's decision logic
2. **Create integration tests** for the API routes
3. **Create tests** for the clamp utility functions
4. **Create tests** for contract interactions (mocked)
5. **Set up a test runner** (Jest or Vitest)

Which testing approach would you prefer, or should I create a comprehensive test suite covering all components?
