# Cronos AI Platform - System Scope

## 1. What This System Is (Purpose, Precisely Defined)

### Canonical Purpose Statement (scope-locked)

This project is an **off-chain agent control plane for Cronos EVM** that observes vault activity, evaluates predefined risk and optimization conditions through a fixed catalog of agents, and executes or recommends policy-constrained programmable settlements via x402-style payment rails.

Intelligence may be deterministic or AI-assisted (toggleable), but final authority is enforced on-chain.

### What This System Is NOT:

- ❌ A trading bot
- ❌ A generalized AI agent marketplace
- ❌ A wallet
- ❌ A DeFi protocol replacement
- ❌ A cross-chain router

> This clarity is what prevents feature creep.

## 2. What You Have Today (Derived Only From Your Tree)

Based strictly on your agent-service structure, you currently have **Phase 01: Agent Runtime + API + Chain Adapter**.

### 2.1 High-level Architecture (Current State)

```
[ UI / Client ]
       |
       v
[ Express API ]
   |        |
   v        v
[ Agents ] [ Settlements Routes ]
   |
   v
[ Chain Adapter (ethers.js) ]
   |
   v
[ SimpleVault (Cronos EVM) ]
```

> There is no speculation here—every box corresponds to a folder you showed.

### 2.2 Component Responsibilities (Under the Hood)

#### `server.js`
- **Role:** Process bootstrap and lifecycle coordinator
- **Why it exists:**
  - Centralizes Express, routes, listeners
  - Provides a single execution context so agents, listeners, and routes share state safely

#### `/routes/agents.js`
- **Role:** Agent execution surface
- **What it does:**
  - Exposes endpoints to:
    - List available agents
    - Invoke a specific agent with parameters
  - Delegates logic to the agent registry
- **Why this is correct:** Agents are capabilities, not contracts. HTTP is the correct abstraction boundary.

#### `/routes/settlements.js`
- **Role:** Settlement orchestration surface
- **What it does:**
  - Accepts agent output
  - Prepares settlement instructions
  - Interacts with chain adapter
- **Why this is separate from agents:** Agents decide. Settlements execute. This separation is essential for auditability.

#### `/agents/registry.js`
- **Role:** Capability registry (static catalog)
- **What it does:**
  - Maps agent IDs → implementations
  - Enforces a common interface
- **Why this matters for scope control:** Only agents registered here exist. This is where you will later hard-register the 12 agents and freeze the list.

#### `/agents/types.js`
- **Role:** Contract between system components
- **What it defines:**
  - Agent input schema
  - Agent output schema (Decision Packet precursor)
- **Why this matters:** This file is the constitution of your agent layer. If it does not change, scope does not drift.

#### `/agents/*`
You currently have **four functional agents:**
- `withdrawal-risk-sentinel`
- `emergency-brake`
- `settlement-batch-optimizer`
- `clamp` (flat file agent)

These already define your system's personality:
- ✅ Risk detection
- ✅ Emergency control
- ✅ Optimization
- ✅ Parameter clamping

> Everything else you add must align with these categories.

#### `/listeners/vaultEvents.js`
- **Role:** Passive on-chain observation
- **What it does:**
  - Subscribes to SimpleVault events
  - Converts on-chain facts into off-chain signals
- **Why this is crucial:** This is what makes the system agentic without being autonomous. Agents respond to facts, not opinions.

#### `/contracts/simpleVault.js`
- **Role:** Chain adapter
- **What it does:**
  - Wraps the ABI
  - Provides typed calls and event interfaces
- **Why this exists off-chain:** Agents should never embed ABI logic directly. This keeps contract upgrades contained.

### 2.3 About OpenAI (Why It Is Present But Not Dominant)

You have `openai` installed, but:
- ✅ There is no architectural dependency on it
- ✅ The system runs without it

This implies **correct design**: AI is an enhancer, not a controller.

#### In Whitepaper Terms:
- AI is used to augment scoring, explanation, and parameter suggestion
- AI is **never** the sole authority for settlement execution

> This is a strength, not a weakness.

## 3. Locked Feature Set (Authoritative)

> These are the **only** features the system is allowed to claim.

### 3.1 Agent System
- ✅ Fixed registry of 12 agents
- ✅ Deterministic logic baseline
- ✅ Optional AI augmentation (toggle)
- ✅ Standardized agent input/output schema
- ✅ Severity + confidence scoring

### 3.2 x402 Agentic Payment Rails
- **Off-chain:** Agents produce settlement intents
- **On-chain rails:**
  - Verify authorization
  - Enforce constraints
  - Prevent replay
  - Emit audit events
- **Constraints:** No custody, no pooling, no routing

### 3.3 User Interface
- ✅ Observability dashboards
- ✅ Agent execution console
- ✅ Settlement simulation + execution views
- ✅ Configuration visibility (network, AI toggle)

> No additional UX features are implied or allowed.

## 4. The 12 Agents (Final, Non-Expandable Catalog)

> You will implement **exactly these**, no more, no fewer:

| # | Agent Name | Purpose |
|---|------------|----------|
| 1 | Withdrawal Risk Sentinel | Detect abnormal withdrawal behavior |
| 2 | Emergency Brake | Trigger pause/stop recommendations |
| 3 | Clamp Controller | Compute safe parameter limits |
| 4 | Settlement Batch Optimizer | Reduce gas/settlement overhead |
| 5 | Liquidity Health Monitor | Assess solvency ratios |
| 6 | Fee Budget Guardian | Enforce gas/fee ceilings |
| 7 | Replay Detection Agent | Prevent duplicated intents |
| 8 | Counterparty Risk Scorer | Heuristic risk tiering |
| 9 | Time-Lock Compliance Agent | Enforce settlement windows |
| 10 | Anomaly Correlator | Multi-signal risk elevation |
| 11 | Policy Consistency Checker | Ensure actions comply with configured rules |
| 12 | Incident Report Generator | Human-readable summaries (AI-assist allowed) |

> **All must return the same Decision Packet schema.**