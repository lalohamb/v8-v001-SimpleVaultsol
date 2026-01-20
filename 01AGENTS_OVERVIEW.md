# AI Agents Overview - SENTINEL Cronos AI Vault Platform

## 🤖 Available AI Agents

The platform currently has **4 operational agents**, each serving a specific risk management and optimization role:

### 1. **Withdrawal Risk Sentinel** 
- **ID**: `withdrawal-risk-sentinel`
- **AI-Capable**: No (Deterministic)
- **Purpose**: Monitors account state and recommends safe withdrawal limits
- **Logic**:
  - Initial recommendation: 50% of balance
  - Subsequent recommendations: Tightens by 5% to reduce sudden-drain risk
  - Confidence: 0.7

### 2. **Emergency Brake**
- **ID**: `emergency-brake`
- **AI-Capable**: No (Deterministic)
- **Purpose**: Crisis-mode limiter that clamps limits under abnormal conditions
- **Logic**:
  - Normal mode: 25% of balance
  - Severe risk trigger: 10% of balance (VOLATILITY_SPIKE, ANOMALY)
  - Confidence: 0.85 (severe) / 0.6 (normal)

### 3. **Settlement Batch Optimizer**
- **ID**: `settlement-batch-optimizer`
- **AI-Capable**: No (Deterministic)
- **Purpose**: Computes safe cap for multi-step settlement execution after x402 payment
- **Logic**:
  - Baseline: 40% of balance
  - If requested amount provided: min(requestedAmount, baseline)
  - Confidence: 0.75

### 4. **Portfolio Rebalancer AI** ⭐
- **ID**: `02portfolio-rebalancer-ai`
- **AI-Capable**: Yes (OpenAI GPT-4o-mini)
- **Purpose**: AI-powered portfolio rebalancing with conservative budget recommendations
- **Logic**:
  - **AI Mode** (when `ENABLE_AI_AGENTS=true` and `OPENAI_API_KEY` set):
    - Uses LLM to analyze context and propose limits
    - Considers balance, current limit, job details, risk triggers
    - Returns structured JSON with reasoning
  - **Fallback Mode** (deterministic):
    - Conservative default: 20% of balance
    - If requested amount < baseline, allows it; otherwise uses baseline
    - Confidence: 0.6

---

## 🔄 How Agents Monitor & Respond to On-Chain Events

### Architecture Overview

```
┌─────────────────┐
│  Smart Contract │  SimpleVault.sol (Cronos Testnet)
│  (SimpleVault)  │  - Emits: Deposited, Withdrawn, AgentRecommendation
└────────┬────────┘
         │ Events
         ▼
┌─────────────────┐
│ Event Listener  │  vaultEvents.ts (WebSocket)
│  (Off-chain)    │  - Subscribes to contract events
└────────┬────────┘
         │ Triggers
         ▼
┌─────────────────┐
│  Agent Service  │  Express REST API
│   (Backend)     │  - Processes agent decisions
└────────┬────────┘
         │ Writes
         ▼
┌─────────────────┐
│  Smart Contract │  agentSetWithdrawLimit()
│   (On-chain)    │  - Updates recommended limits
└─────────────────┘
```

### Event Monitoring Flow

#### 1. **Event Listener** (`agent-service/src/listeners/vaultEvents.ts`)

**What it does:**
- Establishes WebSocket connection to Cronos Testnet RPC
- Subscribes to `SimpleVault` contract events:
  - `Deposited(address user, uint256 amount)`
  - `Withdrawn(address user, uint256 amount)`
  - `AgentRecommendation(address agent, address user, uint256 newLimit, string reason)`

**Current Implementation:**
```typescript
vault.on("Deposited", (user: string, amount: bigint, event: any) => {
  console.log(`[vaultEvents] Deposited: user=${user}, amount=${amount} CRO`);
  // TODO: Automatically trigger agent decision
});

vault.on("Withdrawn", (user: string, amount: bigint, event: any) => {
  console.log(`[vaultEvents] Withdrawn: user=${user}, amount=${amount} CRO`);
  // TODO: Re-evaluate withdrawal limits
});
```

**Future Enhancement:**
The listener can automatically trigger agent decisions when events occur, creating a fully autonomous system.

---

#### 2. **Agent Decision Process**

When an agent is invoked (via API or event trigger):

**Step 1: Read On-Chain State**
```typescript
const balanceWei = await vault.balances(user);
const currentLimitWei = await vault.recommendedWithdrawLimit(user);
```

**Step 2: Build Context**
```typescript
const ctx: AgentContext = {
  user: "0x...",
  nowTs: 1234567890,
  balanceWei: 1000000000000000000n,  // 1 CRO
  currentLimitWei: 500000000000000000n,  // 0.5 CRO
  jobId: "job-001",  // Optional: for x402 workflows
  requestedAmountWei: 100000000000000000n,  // Optional
  riskTrigger: "VOLATILITY_SPIKE"  // Optional: NONE, VOLATILITY_SPIKE, ANOMALY
};
```

**Step 3: Agent Decides**
```typescript
const decision = await agent.decide(ctx);
// Returns:
// {
//   proposedLimitWei: 250000000000000000n,
//   reason: "emergency-brake: trigger=VOLATILITY_SPIKE → clamp to 10%",
//   confidence: 0.85
// }
```

**Step 4: Policy Enforcement (Clamping)**
```typescript
// Enforce global limits (e.g., max 80% of balance)
const finalLimitWei = clampLimit(decision.proposedLimitWei, ctx.balanceWei);
```

**Step 5: Write On-Chain**
```typescript
const tx = await vault.agentSetWithdrawLimit(user, finalLimitWei, reason);
await tx.wait();
// Emits: AgentRecommendation event
```

---

#### 3. **Smart Contract Integration**

**Agent Hook in SimpleVault.sol:**
```solidity
function agentSetWithdrawLimit(
    address user,
    uint256 newLimit,
    string calldata reason
) external onlyAgent {
    recommendedWithdrawLimit[user] = newLimit;
    emit AgentRecommendation(msg.sender, user, newLimit, reason);
}
```

**Key Features:**
- ✅ **Advisory, not enforced**: Users can still withdraw any amount up to their balance
- ✅ **Auditable**: All recommendations logged on-chain with reasoning
- ✅ **Governance-controlled**: Only authorized agent address can call this function
- ✅ **Transparent**: Frontend can read `recommendedWithdrawLimit` and warn users

---

## 🔐 Security & Governance

### Agent Authorization
- Agent address set by contract owner: `vault.setAgent(agentAddress)`
- Only authorized agent can call `agentSetWithdrawLimit()`
- Agent private key stored in `AGENT_PRIVATE_KEY` environment variable

### Policy Enforcement (Clamping)
All agent decisions pass through a clamping layer:
```typescript
// Example: Never allow more than 80% of balance
const maxAllowed = (balanceWei * 80n) / 100n;
const finalLimit = proposedLimit > maxAllowed ? maxAllowed : proposedLimit;
```

### AI Safety (Portfolio Rebalancer)
- **Fail-closed**: If AI unavailable, falls back to deterministic rules
- **Lazy loading**: OpenAI client only instantiated when needed
- **Structured output**: AI must return valid JSON with specific fields
- **Validation**: All AI responses validated before execution

---

## 📊 Agent Execution Modes

### 1. **Manual Execution** (Agent Console)
User triggers agent via frontend → API call → Agent decides → On-chain update

**API Endpoint:** `POST /agents/apply`
```json
{
  "agentId": "withdrawal-risk-sentinel",
  "user": "0x1234...",
  "riskTrigger": "VOLATILITY_SPIKE"
}
```

### 2. **x402 Payment Workflow** (Settlement Console)
Payment required → Agent optimizes settlement → Executes pipeline

**API Endpoints:**
- `POST /settlement/pay` - Simulate x402 payment
- `POST /settlement/run` - Execute settlement with agent optimization

### 3. **Event-Driven (Future)**
On-chain event → Listener detects → Agent auto-executes → Updates limits

**Planned Flow:**
```
Deposited event → Check if balance > threshold →
  Trigger withdrawal-risk-sentinel → Update recommended limit
```

---

## 🎯 Use Cases

### Risk Management
- **Withdrawal Risk Sentinel**: Prevents sudden large withdrawals
- **Emergency Brake**: Responds to market volatility or anomalies

### Optimization
- **Settlement Batch Optimizer**: Optimizes multi-step payment settlements
- **Portfolio Rebalancer AI**: AI-powered rebalancing recommendations

### Compliance & Auditability
- All decisions logged on-chain with reasoning
- Transparent decision-making process
- Confidence scores for each recommendation

---

## 🚀 Getting Started

### Enable AI Mode
```bash
export ENABLE_AI_AGENTS=true
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini  # Optional
```

### Test an Agent
```bash
curl -X POST http://localhost:3000/agents/apply \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "02portfolio-rebalancer-ai",
    "user": "0xYourAddress",
    "requestedAmountWei": "100000000000000000"
  }'
```

### Monitor Events
The agent service automatically starts the event listener on startup.
Check logs for:
```
[vaultEvents] Listening for Deposited and Withdrawn events...
[vaultEvents] Deposited: user=0x..., amount=1.0 CRO
```

---

## 📝 Summary

The Cronos AI Platform demonstrates **hybrid AI governance** where:
- ✅ Deterministic agents provide reliable baseline behavior
- ✅ AI-capable agents add intelligent optimization when enabled
- ✅ All decisions are auditable on-chain
- ✅ Event-driven architecture enables autonomous operation
- ✅ Policy enforcement ensures safety regardless of agent mode

This creates a **self-healing, self-optimizing DeFi system** that can monitor, reason about, and respond to on-chain activity automatically.


